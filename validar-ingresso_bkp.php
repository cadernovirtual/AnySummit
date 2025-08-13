<?php
/**
 * Página de Validação e Gerenciamento de Ingresso Individual
 * Acessada via: https://anysummit.com.br/validar-ingresso.aspx?h=HASH_VALIDACAO
 * 
 * Esta página permite:
 * 1. Validar o hash do ingresso
 * 2. Exibir informações do ingresso e evento
 * 3. Permitir vinculação do participante
 * 4. Permitir envio do ingresso para outra pessoa
 */

session_start();
include("evento/conm/conn.php");

// Verificar se o hash foi fornecido e validar formato
$hash_validacao = isset($_GET['h']) ? trim($_GET['h']) : '';

if (empty($hash_validacao)) {
    $erro = "Link inválido. O hash de validação não foi fornecido.";
    include('pagina-erro.php');
    exit;
}

// Validar formato básico do hash (deve ter pelo menos 32 caracteres)
if (strlen($hash_validacao) < 32) {
    error_log("Hash muito curto recebido: " . $hash_validacao);
    $erro = "Link inválido. Formato do hash de validação incorreto.";
    include('pagina-erro.php');
    exit;
}

// Log de acesso para auditoria
error_log("Acesso à validação de ingresso - Hash: " . substr($hash_validacao, 0, 10) . "... (length: " . strlen($hash_validacao) . ") - IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));

try {
    error_log("Iniciando busca do ingresso no banco de dados");
    
    // Buscar o ingresso pelo hash de validação
    $sql_ingresso = "SELECT 
        ii.*,
        e.nome as evento_nome, 
        e.data_inicio, 
        e.nome_local, 
        e.cidade, 
        e.estado,
        e.imagem_capa,
        e.descricao,
        e.campos_adicionais_participante,
        p.codigo_pedido, 
        p.comprador_nome,
        p.data_pedido,
        c.nome as comprador_nome_completo,
        c.email as comprador_email,
        cont.nome_fantasia as organizador_nome,
        cont.logomarca as organizador_logo
        FROM tb_ingressos_individuais ii
        LEFT JOIN eventos e ON ii.eventoid = e.id
        LEFT JOIN tb_pedidos p ON ii.pedidoid = p.pedidoid
        LEFT JOIN compradores c ON p.compradorid = c.id
        LEFT JOIN contratantes cont ON e.contratante_id = cont.id
        WHERE ii.hash_validacao = ? 
        AND ii.hash_validacao IS NOT NULL 
        AND ii.hash_validacao != ''
        LIMIT 1";
    
    $stmt = $con->prepare($sql_ingresso);
    if (!$stmt) {
        error_log("Erro ao preparar query: " . $con->error);
        throw new Exception("Erro ao preparar consulta: " . $con->error);
    }
    
    $stmt->bind_param("s", $hash_validacao);
    if (!$stmt->execute()) {
        error_log("Erro ao executar query: " . $stmt->error);
        throw new Exception("Erro ao executar consulta: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    error_log("Query executada com sucesso. Linhas encontradas: " . $result->num_rows);
    
    if ($result->num_rows === 0) {
        // Log de tentativa de acesso com hash inválido
        error_log("Tentativa de acesso com hash inválido - Hash: " . substr($hash_validacao, 0, 10) . "... - IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
        
        $erro = "Ingresso não encontrado ou link inválido.";
        include('pagina-erro.php');
        exit;
    }
    
    $ingresso = $result->fetch_assoc();
    
    // Log de acesso bem-sucedido
    error_log("Ingresso validado com sucesso - ID: " . $ingresso['id'] . " - Evento: " . $ingresso['evento_nome'] . " - IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    
    // Decodificar campos adicionais
    $campos_adicionais_evento = [];
    if (!empty($ingresso['campos_adicionais_participante'])) {
        $campos_adicionais_evento = json_decode($ingresso['campos_adicionais_participante'], true) ?: [];
    }
    
    // Processar ação de vinculação se enviada via POST
    $mensagem = '';
    $tipo_mensagem = '';
    $mostrar_botao_ver_ingresso = false;
    
    // Verificar mensagens da sessão (após sucesso)
    if (isset($_SESSION['mensagem_sucesso'])) {
        $mensagem = $_SESSION['mensagem_sucesso'];
        $tipo_mensagem = 'success';
        $mostrar_botao_ver_ingresso = $_SESSION['mostrar_botao_ingresso'] ?? false;
        
        // Limpar mensagens da sessão
        unset($_SESSION['mensagem_sucesso'], $_SESSION['mostrar_botao_ingresso']);
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $acao = $_POST['acao'] ?? '';
        
        if ($acao === 'vincular') {
            $nome = trim($_POST['participante_nome'] ?? '');
            $email = trim($_POST['participante_email'] ?? '');
            $documento = trim($_POST['participante_documento'] ?? '');
            $celular = trim($_POST['participante_celular'] ?? '');
            
            // Validar campos obrigatórios básicos
            if (empty($nome) || empty($email) || empty($documento)) {
                $mensagem = "Nome, email e CPF são obrigatórios.";
                $tipo_mensagem = "danger";
            } else {
                // Limpar e validar CPF
                $documento_limpo = preg_replace('/[^0-9]/', '', $documento);
                if (strlen($documento_limpo) !== 11) {
                    $mensagem = "CPF deve conter 11 dígitos válidos.";
                    $tipo_mensagem = "danger";
                } else {
                    // Validar campos adicionais obrigatórios
                    $campos_faltando = [];
                    foreach ($campos_adicionais_evento as $campo) {
                        if ($campo['obrigatorio']) {
                            $valor_campo = trim($_POST['campo_' . $campo['campo']] ?? '');
                            if (empty($valor_campo)) {
                                $campos_faltando[] = $campo['label'];
                            }
                        }
                    }
                    
                    if (!empty($campos_faltando)) {
                        $mensagem = "Os seguintes campos são obrigatórios: " . implode(', ', $campos_faltando);
                        $tipo_mensagem = "danger";
                    } else {
                        // Coletar dados adicionais
                        $dados_adicionais = [];
                        foreach ($campos_adicionais_evento as $campo) {
                            $valor_campo = trim($_POST['campo_' . $campo['campo']] ?? '');
                            if (!empty($valor_campo)) {
                                $dados_adicionais[$campo['campo']] = $valor_campo;
                            }
                        }
                        
                        // Criar/atualizar participante - BUSCAR PRIMEIRO POR CPF
                        $participante_id = null;
                        
                        // 1. PRIORIDADE: Verificar se já existe participante com este CPF para este evento
                        $sql_check_cpf = "SELECT participanteid, Nome, email FROM participantes WHERE REPLACE(REPLACE(REPLACE(CPF, '.', ''), '-', ''), ' ', '') = ? AND eventoid = ? LIMIT 1";
                        $stmt_check_cpf = $con->prepare($sql_check_cpf);
                        $stmt_check_cpf->bind_param("si", $documento_limpo, $ingresso['eventoid']);
                        $stmt_check_cpf->execute();
                        $result_check_cpf = $stmt_check_cpf->get_result();
                        
                        if ($result_check_cpf->num_rows > 0) {
                            // Participante já existe com este CPF - verificar se não vai duplicar ingresso
                            $participante_existente = $result_check_cpf->fetch_assoc();
                            $participante_id = $participante_existente['participanteid'];
                            
                            // Verificar se este participante já tem ingresso do mesmo tipo neste evento
                            $sql_check_duplicacao = "SELECT ii.id, ii.codigo_ingresso, ii.data_vinculacao, ii.participante_nome, c.nome as comprador_nome, p.data_pedido, ii.criado_em
                                                     FROM tb_ingressos_individuais ii 
                                                     LEFT JOIN tb_pedidos p ON ii.pedidoid = p.pedidoid
                                                     LEFT JOIN compradores c ON p.compradorid = c.id
                                                     WHERE ii.participanteid = ? AND ii.ingresso_id = ? AND ii.eventoid = ? AND ii.id != ?";
                            $stmt_check_dup = $con->prepare($sql_check_duplicacao);
                            $stmt_check_dup->bind_param("iiii", $participante_id, $ingresso['ingresso_id'], $ingresso['eventoid'], $ingresso['id']);
                            $stmt_check_dup->execute();
                            $result_check_dup = $stmt_check_dup->get_result();
                            
                            if ($result_check_dup && $result_check_dup->num_rows > 0) {
                                $ingresso_existente = $result_check_dup->fetch_assoc();
                                
                                // Mostrar informações detalhadas do ingresso já vinculado
                                $data_compra = $ingresso_existente['data_pedido'] ? date('d/m/Y H:i', strtotime($ingresso_existente['data_pedido'])) : 'Não informado';
                                $data_criacao = $ingresso_existente['criado_em'] ? date('d/m/Y H:i', strtotime($ingresso_existente['criado_em'])) : 'Não informado';
                                $nome_comprador = $ingresso_existente['comprador_nome'] ?: 'Não informado';
                                $nome_participante = $ingresso_existente['participante_nome'] ?: $participante_existente['Nome'];
                                
                                $mensagem = "ATENÇÃO: Não é possível associar este ingresso ao participante '$nome_participante' pois ele já possui um ingresso do mesmo tipo.\\n\\n" .
                                          "DETALHES DO INGRESSO EXISTENTE:\\n" .
                                          "• Comprador: $nome_comprador\\n" .
                                          "• Data da compra: $data_compra\\n" .
                                          "• Data de criação: $data_criacao\\n" .
                                          "• Código do ingresso: {$ingresso_existente['codigo_ingresso']}\\n\\n" .
                                          "Para prosseguir, verifique se este é realmente um novo ingresso ou se houve algum erro no processo.";
                                $tipo_mensagem = "danger";
                            } else {
                                // Participante existe, mas não tem ingresso duplicado - pode atualizar
                                $sql_update_participante = "UPDATE participantes SET 
                                                           Nome = ?, 
                                                           email = ?, 
                                                           celular = ?, 
                                                           dados_adicionais = ?
                                                           WHERE participanteid = ?";
                                $stmt_update_participante = $con->prepare($sql_update_participante);
                                $dados_json = json_encode($dados_adicionais, JSON_UNESCAPED_UNICODE);
                                $stmt_update_participante->bind_param("ssssi", $nome, $email, $celular, $dados_json, $participante_id);
                                $stmt_update_participante->execute();
                            }
                        } else {
                            // Não encontrou por CPF - verificar por email (fallback)
                            $sql_check_email = "SELECT participanteid FROM participantes WHERE email = ? AND eventoid = ? LIMIT 1";
                            $stmt_check_email = $con->prepare($sql_check_email);
                            $stmt_check_email->bind_param("si", $email, $ingresso['eventoid']);
                            $stmt_check_email->execute();
                            $result_check_email = $stmt_check_email->get_result();
                            
                            if ($result_check_email->num_rows > 0) {
                                // Participante existe com esse email - atualizar CPF
                                $participante_existente = $result_check_email->fetch_assoc();
                                $participante_id = $participante_existente['participanteid'];
                                
                                $sql_update_participante = "UPDATE participantes SET 
                                                           Nome = ?, 
                                                           CPF = ?, 
                                                           celular = ?, 
                                                           dados_adicionais = ?
                                                           WHERE participanteid = ?";
                                $stmt_update_participante = $con->prepare($sql_update_participante);
                                $dados_json = json_encode($dados_adicionais, JSON_UNESCAPED_UNICODE);
                                $stmt_update_participante->bind_param("ssssi", $nome, $documento, $celular, $dados_json, $participante_id);
                                $stmt_update_participante->execute();
                            } else {
                                // Criar novo participante
                                $sql_insert_participante = "INSERT INTO participantes (Nome, email, CPF, celular, eventoid, dados_adicionais) 
                                                           VALUES (?, ?, ?, ?, ?, ?)";
                                $stmt_insert = $con->prepare($sql_insert_participante);
                                $dados_json = json_encode($dados_adicionais, JSON_UNESCAPED_UNICODE);
                                $stmt_insert->bind_param("ssssis", $nome, $email, $documento, $celular, $ingresso['eventoid'], $dados_json);
                                $stmt_insert->execute();
                                $participante_id = $con->insert_id;
                            }
                        }
                        
                        // Se chegou até aqui e tem participante_id, pode vincular o ingresso
                        if ($participante_id && $tipo_mensagem !== 'danger') {
                            // Atualizar o ingresso com os dados do participante
                            $sql_update = "UPDATE tb_ingressos_individuais SET 
                                           participanteid = ?,
                                           participante_nome = ?, 
                                           participante_email = ?, 
                                           participante_documento = ?,
                                           data_vinculacao = NOW(),
                                           atualizado_em = NOW()
                                           WHERE id = ?";
                            
                            $stmt_update = $con->prepare($sql_update);
                            $stmt_update->bind_param("isssi", $participante_id, $nome, $email, $documento, $ingresso['id']);
                            
                            if ($stmt_update->execute()) {
                                // Atualizar dados do ingresso na variável para o email
                                $ingresso['participanteid'] = $participante_id;
                                $ingresso['participante_nome'] = $nome;
                                $ingresso['participante_email'] = $email;
                                $ingresso['participante_documento'] = $documento;
                                $ingresso['data_vinculacao'] = date('Y-m-d H:i:s');
                                
                                // Enviar email do ingresso com JPG anexado
                                if (file_exists('evento/api/email-com-anexo.php')) {
                                    include_once('evento/api/email-com-anexo.php');
                                }
                                try {
                                    $assunto = "Seu Ingresso para " . $ingresso['evento_nome'];
                                    
                                    // Tentar enviar com JPG anexado
                                    $sucesso_email = false;
                                    if (class_exists('EmailComAnexo')) {
                                        $sucesso_email = EmailComAnexo::enviarIngressoComJPG(
                                            $email,
                                            $nome,
                                            $assunto,
                                            $ingresso
                                        );
                                    }
                                    
                                    if (!$sucesso_email) {
                                        // Fallback: email tradicional se JPG falhar
                                        error_log("Fallback para email tradicional após vinculação - Email: " . $email);
                                        
                                        $secret_key = "AnySummit2025@#$%ingresso";
                                        $timestamp = strtotime($ingresso['criado_em']);
                                        $hash_ingresso = hash('sha256', $secret_key . $ingresso['id'] . $timestamp);
                                        $link_ingresso = "https://" . $_SERVER['HTTP_HOST'] . "/evento/api/ver-ingresso-individual.php?h=" . $hash_ingresso;
                                        
                                        $corpo_email = "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Seu Ingresso Está Pronto</title>
</head>
<body style='font-family: Arial, sans-serif; background: #f8f9fa; margin: 0; padding: 15px;'>
    <div style='max-width: 550px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;'>
        <div style='background: #007bff; color: white; padding: 20px; text-align: center;'>
            <h1 style='margin: 0; font-size: 20px;'>🎟️ Seu Ingresso Está Pronto!</h1>
        </div>
        <div style='padding: 20px;'>
            <h2 style='color: #333; margin: 0 0 15px 0; font-size: 18px;'>" . htmlspecialchars($ingresso['evento_nome']) . "</h2>
            <p style='color: #666; margin: 0 0 15px 0;'>
                Olá <strong>" . htmlspecialchars($nome) . "</strong>!<br>
                Seu ingresso foi vinculado com sucesso.
            </p>
            <div style='background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;'>
                <p style='margin: 0; color: #333;'><strong>Código:</strong> " . htmlspecialchars($ingresso['codigo_ingresso']) . "</p>
                <p style='margin: 5px 0 0 0; color: #333;'><strong>Tipo:</strong> " . htmlspecialchars($ingresso['titulo_ingresso']) . "</p>
            </div>
            <div style='text-align: center; margin: 20px 0;'>
                <a href='" . $link_ingresso . "' style='background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>🎫 Visualizar Meu Ingresso</a>
            </div>
            <p style='color: #999; font-size: 12px; text-align: center; margin: 10px 0 0 0;'>
                Apresente este ingresso na entrada do evento.
            </p>
        </div>
    </div>
</body>
</html>";
                                        
                                        $headers = "MIME-Version: 1.0" . "\r\n";
                                        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
                                        $headers .= "From: AnySummit <ingressos@anysummit.com.br>" . "\r\n";
                                        
                                        mail($email, $assunto, $corpo_email, $headers);
                                    }
                                    
                                } catch (Exception $e) {
                                    error_log("Erro ao enviar email do ingresso: " . $e->getMessage());
                                }
                                
                                // Salvar mensagem de sucesso na sessão
                                $_SESSION['mensagem_sucesso'] = "Ingresso vinculado com sucesso! Um email foi enviado para " . $email . " com o link do ingresso.";
                                $_SESSION['mostrar_botao_ingresso'] = true;
                                $_SESSION['hash_ingresso_visualizar'] = hash('sha256', "AnySummit2025@#$%ingresso" . $ingresso['id'] . strtotime($ingresso['criado_em']));
                                
                                // Redirect para evitar reenvio do form
                                header("Location: " . $_SERVER['REQUEST_URI']);
                                exit;
                            } else {
                                $mensagem = "Erro ao vincular o ingresso. Tente novamente.";
                                $tipo_mensagem = "danger";
                            }
                        }
                    }
                }
            }
        } elseif ($acao === 'enviar') {
            $nome_destinatario = trim($_POST['enviar_nome'] ?? '');
            $email_destinatario = trim($_POST['enviar_email'] ?? '');
            $mensagem_personalizada = trim($_POST['enviar_mensagem'] ?? '');
            
            if (empty($nome_destinatario) || empty($email_destinatario)) {
                $mensagem = "Nome e email do destinatário são obrigatórios.";
                $tipo_mensagem = "danger";
            } else {
                // CORREÇÃO: Implementar o envio correto através da API
                try {
                    // Preparar dados para a API de envio
                    $dados_api = [
                        'ingresso' => [
                            'id' => $ingresso['id'],
                            'codigo' => $ingresso['codigo_ingresso'],
                            'titulo' => $ingresso['titulo_ingresso'],
                            'preco' => floatval($ingresso['preco_unitario']),
                            'status' => $ingresso['status'],
                            'qr_code_data' => $ingresso['qr_code_data'],
                            'hash_validacao' => $ingresso['hash_validacao']
                        ],
                        'destinatario' => [
                            'nome' => $nome_destinatario,
                            'email' => $email_destinatario,
                            'whatsapp' => '',
                            'mensagem' => $mensagem_personalizada
                        ],
                        'evento' => [
                            'id' => $ingresso['eventoid']
                        ],
                        'pedido' => [
                            'id' => $ingresso['pedidoid'],
                            'codigo' => $ingresso['codigo_pedido']
                        ],
                        'remetente' => [
                            'nome' => $ingresso['comprador_nome_completo'] ?: $ingresso['comprador_nome'],
                            'email' => $ingresso['comprador_email']
                        ]
                    ];
                    
                    // Chamar a API de envio de ingresso
                    $api_url = "https://" . $_SERVER['HTTP_HOST'] . "/evento/api/enviar-ingresso.php";
                    
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, $api_url);
                    curl_setopt($ch, CURLOPT_POST, 1);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dados_api));
                    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
                    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                    
                    $response = curl_exec($ch);
                    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    curl_close($ch);
                    
                    if ($response && $http_code == 200) {
                        $result = json_decode($response, true);
                        if ($result && $result['success']) {
                            $_SESSION['mensagem_sucesso'] = "Link do ingresso enviado para $email_destinatario com sucesso! A pessoa receberá um email com instruções para acessar e vincular o ingresso.";
                            
                            // Redirect para evitar reenvio do form
                            header("Location: " . $_SERVER['REQUEST_URI']);
                            exit;
                        } else {
                            $error_msg = $result['message'] ?? 'Erro desconhecido na API';
                            $mensagem = "Erro ao enviar ingresso: " . $error_msg;
                            $tipo_mensagem = "danger";
                        }
                    } else {
                        $mensagem = "Erro de comunicação com o servidor. Tente novamente.";
                        $tipo_mensagem = "danger";
                    }
                    
                } catch (Exception $e) {
                    error_log("Erro ao enviar ingresso: " . $e->getMessage());
                    $mensagem = "Erro interno ao enviar ingresso. Tente novamente.";
                    $tipo_mensagem = "danger";
                }
            }
        }
    }
    
} catch (Exception $e) {
    error_log("Erro ao carregar ingresso: " . $e->getMessage());
    $erro = "Erro interno do servidor. Tente novamente mais tarde.";
    include('pagina-erro.php');
    exit;
}

// Formatações para exibição
$data_evento = '';
if ($ingresso['data_inicio']) {
    $data_evento = date('d/m/Y H:i', strtotime($ingresso['data_inicio']));
}

$data_pedido = date('d/m/Y H:i', strtotime($ingresso['data_pedido']));

// URLs das imagens
$imagem_capa_url = '';
if ($ingresso['imagem_capa']) {
    // Verificar se já tem o caminho completo
    if (strpos($ingresso['imagem_capa'], '/uploads/') === 0) {
        $imagem_capa_url = $ingresso['imagem_capa'];
    } else {
        $imagem_capa_url = '/uploads/eventos/' . $ingresso['imagem_capa'];
    }
}

$logo_organizador_url = '';
if ($ingresso['organizador_logo']) {
    $logo_organizador_url = $ingresso['organizador_logo'];
}
?>