<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include("../conm/conn.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
    exit;
}

try {
    // Log dos dados recebidos para debug
    error_log('Dados recebidos: ' . json_encode($input));
    
    // Iniciar transação
    $con->autocommit(false);
    
    // Extrair dados
    $ingresso_id = intval($input['ingresso_id']);
    $nome = trim($input['participante_nome']);
    $email = trim($input['participante_email']);
    $documento = trim($input['participante_documento'] ?? '');
    $celular = trim($input['participante_celular'] ?? '');
    $dados_adicionais = $input['dados_adicionais'] ?? [];
    
    // Log dos dados processados
    error_log("Processando: ID=$ingresso_id, Nome=$nome, Email=$email, CPF=$documento");
    error_log("Dados adicionais: " . json_encode($dados_adicionais));
    
    // Validar dados obrigatórios
    if (!$ingresso_id || !$nome || !$email) {
        throw new Exception('Dados obrigatórios não informados');
    }
    
    // Validar se o ingresso existe e não está vinculado
    $sql_check_ingresso = "SELECT eventoid, participanteid, status FROM tb_ingressos_individuais WHERE id = ?";
    $stmt_check = $con->prepare($sql_check_ingresso);
    $stmt_check->bind_param("i", $ingresso_id);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    
    if ($result_check->num_rows === 0) {
        error_log("Ingresso não encontrado: ID = $ingresso_id");
        throw new Exception('Ingresso não encontrado ou inválido');
    }
    
    $ingresso_data = $result_check->fetch_assoc();
    $eventoid = $ingresso_data['eventoid'];
    $status_atual = $ingresso_data['status'];
    
    error_log("Ingresso encontrado: Status=$status_atual, EventoID=$eventoid, ParticipanteID=" . ($ingresso_data['participanteid'] ?? 'null'));
    
    // Verificar se o status permite vinculação (ativo ou transferido)
    if (!in_array($status_atual, ['ativo', 'transferido'])) {
        throw new Exception("Ingresso não pode ser vinculado. Status atual: $status_atual");
    }
    
    if ($ingresso_data['participanteid']) {
        throw new Exception('Este ingresso já está vinculado a um participante');
    }
    
    // CORREÇÃO: Buscar participante primeiro por CPF (se fornecido), depois por email
    $participanteid = null;
    $participante_encontrado_por = null;
    
    // Limpar CPF para comparação (remover pontos e hífens)
    $documento_limpo = '';
    if (!empty($documento)) {
        $documento_limpo = preg_replace('/[^0-9]/', '', $documento);
    }
    
    // PRIORIDADE 1: Buscar por CPF se fornecido
    if (!empty($documento_limpo) && strlen($documento_limpo) >= 11) {
        error_log("Buscando participante por CPF: $documento_limpo");
        $sql_buscar_cpf = "SELECT participanteid, Nome, email FROM participantes 
                           WHERE REPLACE(REPLACE(REPLACE(COALESCE(CPF, ''), '.', ''), '-', ''), ' ', '') = ? 
                           AND eventoid = ? LIMIT 1";
        $stmt_buscar_cpf = $con->prepare($sql_buscar_cpf);
        $stmt_buscar_cpf->bind_param("si", $documento_limpo, $eventoid);
        $stmt_buscar_cpf->execute();
        $result_buscar_cpf = $stmt_buscar_cpf->get_result();
        
        if ($result_buscar_cpf && $result_buscar_cpf->num_rows > 0) {
            $participante_data = $result_buscar_cpf->fetch_assoc();
            $participanteid = $participante_data['participanteid'];
            $participante_encontrado_por = 'CPF';
            error_log("Participante encontrado por CPF: ID = $participanteid, Nome = " . $participante_data['Nome']);
            
            // Verificar se o email é diferente e alertar
            if (strtolower($participante_data['email']) !== strtolower($email)) {
                error_log("ATENÇÃO: CPF encontrado mas email diferente. DB: " . $participante_data['email'] . " vs Novo: $email");
                // Podemos decidir se atualizamos o email ou não
            }
        }
    }
    
    // PRIORIDADE 2: Se não encontrou por CPF, buscar por email
    if (!$participanteid) {
        error_log("Buscando participante por email: $email");
        $sql_buscar_email = "SELECT participanteid, Nome, CPF FROM participantes WHERE email = ? AND eventoid = ? LIMIT 1";
        $stmt_buscar_email = $con->prepare($sql_buscar_email);
        $stmt_buscar_email->bind_param("si", $email, $eventoid);
        $stmt_buscar_email->execute();
        $result_buscar_email = $stmt_buscar_email->get_result();
        
        if ($result_buscar_email && $result_buscar_email->num_rows > 0) {
            $participante_data = $result_buscar_email->fetch_assoc();
            $participanteid = $participante_data['participanteid'];
            $participante_encontrado_por = 'email';
            error_log("Participante encontrado por email: ID = $participanteid, Nome = " . $participante_data['Nome']);
            
            // Verificar se há conflito de CPF
            if (!empty($documento_limpo) && !empty($participante_data['CPF'])) {
                $cpf_db_limpo = preg_replace('/[^0-9]/', '', $participante_data['CPF']);
                if ($cpf_db_limpo !== $documento_limpo) {
                    error_log("CONFLITO: Email encontrado mas CPF diferente. DB: $cpf_db_limpo vs Novo: $documento_limpo");
                    throw new Exception("Conflito de dados: Este email já está associado a outro CPF no sistema.");
                }
            }
        }
    }
    
    // Preparar JSON dos dados adicionais
    $dados_adicionais_json = !empty($dados_adicionais) ? json_encode($dados_adicionais, JSON_UNESCAPED_UNICODE) : null;
    
    if ($participanteid) {
        // Participante já existe - atualizar dados
        error_log("Atualizando participante existente: ID = $participanteid (encontrado por: $participante_encontrado_por)");
        
        $sql_atualizar = "UPDATE participantes SET Nome = ?, email = ?, celular = ?, CPF = ?, dados_adicionais = ? WHERE participanteid = ?";
        $stmt_atualizar = $con->prepare($sql_atualizar);
        $stmt_atualizar->bind_param("sssssi", $nome, $email, $celular, $documento, $dados_adicionais_json, $participanteid);
        
        if (!$stmt_atualizar->execute()) {
            throw new Exception('Erro ao atualizar participante: ' . $con->error);
        }
        error_log("Dados do participante atualizados com sucesso");
        
    } else {
        // VERIFICAÇÃO FINAL: Antes de criar, verificar se CPF não existe em outro evento
        if (!empty($documento_limpo) && strlen($documento_limpo) >= 11) {
            $sql_verificar_cpf_global = "SELECT participanteid, eventoid, Nome FROM participantes 
                                         WHERE REPLACE(REPLACE(REPLACE(COALESCE(CPF, ''), '.', ''), '-', ''), ' ', '') = ? 
                                         LIMIT 1";
            $stmt_verificar = $con->prepare($sql_verificar_cpf_global);
            $stmt_verificar->bind_param("s", $documento_limpo);
            $stmt_verificar->execute();
            $result_verificar = $stmt_verificar->get_result();
            
            if ($result_verificar && $result_verificar->num_rows > 0) {
                $participante_outro_evento = $result_verificar->fetch_assoc();
                error_log("CPF já existe em outro evento: " . json_encode($participante_outro_evento));
                // Informar mas permitir criação (pessoa pode participar de vários eventos)
            }
        }
        
        // Criar novo participante
        error_log("Criando novo participante");
        $sql_criar = "INSERT INTO participantes (Nome, email, celular, CPF, eventoid, dados_adicionais) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt_criar = $con->prepare($sql_criar);
        $stmt_criar->bind_param("ssssis", $nome, $email, $celular, $documento, $eventoid, $dados_adicionais_json);
        
        if ($stmt_criar->execute()) {
            $participanteid = $con->insert_id;
            error_log("Novo participante criado: ID = $participanteid");
        } else {
            $error_msg = $con->error;
            error_log("Erro ao criar participante: $error_msg");
            
            // Verificar se é erro de duplicata
            if (strpos($error_msg, 'Duplicate') !== false || strpos($error_msg, 'duplicate') !== false) {
                // Tentar buscar novamente (pode ter sido criado por processo concorrente)
                if (!empty($documento_limpo)) {
                    $stmt_buscar_cpf2 = $con->prepare($sql_buscar_cpf);
                    $stmt_buscar_cpf2->bind_param("si", $documento_limpo, $eventoid);
                    $stmt_buscar_cpf2->execute();
                    $result_buscar_cpf2 = $stmt_buscar_cpf2->get_result();
                    
                    if ($result_buscar_cpf2 && $result_buscar_cpf2->num_rows > 0) {
                        $participante_data2 = $result_buscar_cpf2->fetch_assoc();
                        $participanteid = $participante_data2['participanteid'];
                        error_log("Participante encontrado após erro de duplicata: ID = $participanteid");
                    }
                }
                
                if (!$participanteid) {
                    $stmt_buscar_email2 = $con->prepare($sql_buscar_email);
                    $stmt_buscar_email2->bind_param("si", $email, $eventoid);
                    $stmt_buscar_email2->execute();
                    $result_buscar_email2 = $stmt_buscar_email2->get_result();
                    
                    if ($result_buscar_email2 && $result_buscar_email2->num_rows > 0) {
                        $participante_data2 = $result_buscar_email2->fetch_assoc();
                        $participanteid = $participante_data2['participanteid'];
                        error_log("Participante encontrado por email após erro: ID = $participanteid");
                    }
                }
            }
            
            if (!$participanteid) {
                throw new Exception('Erro ao criar participante: ' . $error_msg);
            }
        }
    }
    
    if (!$participanteid) {
        throw new Exception('Não foi possível identificar o participante');
    }
    
    // Atualizar o ingresso individual com os dados do participante
    $sql_vincular = "UPDATE tb_ingressos_individuais SET 
                     participanteid = ?,
                     participante_nome = ?,
                     participante_email = ?,
                     participante_documento = ?,
                     status = 'ativo',
                     data_vinculacao = NOW()
                     WHERE id = ?";
    
    $stmt_vincular = $con->prepare($sql_vincular);
    $stmt_vincular->bind_param("isssi", $participanteid, $nome, $email, $documento, $ingresso_id);
    
    if (!$stmt_vincular->execute()) {
        error_log("Erro ao executar update do ingresso: " . $con->error);
        throw new Exception('Erro ao vincular participante ao ingresso: ' . $con->error);
    }
    
    error_log("Ingresso vinculado com sucesso: participanteid=$participanteid, ingresso_id=$ingresso_id, status alterado para 'ativo'");
    
    // Confirmar transação
    $con->commit();
    
    // Resposta de sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Participante vinculado com sucesso',
        'dados' => [
            'participanteid' => $participanteid,
            'nome' => $nome,
            'email' => $email,
            'cpf' => $documento,
            'encontrado_por' => $participante_encontrado_por,
            'ingresso_id' => $ingresso_id
        ]
    ]);
    
} catch (Exception $e) {
    // Reverter transação em caso de erro
    $con->rollback();
    
    error_log('Erro ao vincular participante: ' . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Restaurar autocommit
$con->autocommit(true);
?>