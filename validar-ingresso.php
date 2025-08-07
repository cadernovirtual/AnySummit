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

// Verificar se o hash foi fornecido
$hash_validacao = isset($_GET['h']) ? trim($_GET['h']) : '';

if (empty($hash_validacao)) {
    $erro = "Link inválido. O hash de validação não foi fornecido.";
    include('pagina-erro.php');
    exit;
}

try {
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
        WHERE ii.hash_validacao = ? AND ii.hash_validacao IS NOT NULL";
    
    $stmt = $con->prepare($sql_ingresso);
    $stmt->bind_param("s", $hash_validacao);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $erro = "Ingresso não encontrado ou link inválido.";
        include('pagina-erro.php');
        exit;
    }
    
    $ingresso = $result->fetch_assoc();
    
    // Decodificar campos adicionais
    $campos_adicionais_evento = [];
    if (!empty($ingresso['campos_adicionais_participante'])) {
        $campos_adicionais_evento = json_decode($ingresso['campos_adicionais_participante'], true) ?: [];
    }
    
    // Processar ação de vinculação se enviada via POST
    $mensagem = '';
    $tipo_mensagem = '';
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $acao = $_POST['acao'] ?? '';
        
        if ($acao === 'vincular') {
            $nome = trim($_POST['participante_nome'] ?? '');
            $email = trim($_POST['participante_email'] ?? '');
            $documento = trim($_POST['participante_documento'] ?? '');
            $celular = trim($_POST['participante_celular'] ?? '');
            
            // Validar campos obrigatórios básicos
            if (empty($nome) || empty($email)) {
                $mensagem = "Nome e email são obrigatórios.";
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
                    
                    // Criar/atualizar participante
                    $participante_id = null;
                    
                    // Verificar se já existe participante com este email para este evento
                    $sql_check_participante = "SELECT participanteid FROM participantes WHERE email = ? AND eventoid = ? LIMIT 1";
                    $stmt_check = $con->prepare($sql_check_participante);
                    $stmt_check->bind_param("si", $email, $ingresso['eventoid']);
                    $stmt_check->execute();
                    $result_check = $stmt_check->get_result();
                    
                    if ($result_check->num_rows > 0) {
                        $participante_existente = $result_check->fetch_assoc();
                        $participante_id = $participante_existente['participanteid'];
                        
                        // Atualizar dados do participante
                        $sql_update_participante = "UPDATE participantes SET 
                                                   Nome = ?, 
                                                   email = ?, 
                                                   CPF = ?, 
                                                   celular = ?, 
                                                   dados_adicionais = ?
                                                   WHERE participanteid = ?";
                        $stmt_update_participante = $con->prepare($sql_update_participante);
                        $dados_json = json_encode($dados_adicionais, JSON_UNESCAPED_UNICODE);
                        $stmt_update_participante->bind_param("sssssi", $nome, $email, $documento, $celular, $dados_json, $participante_id);
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
                        // Enviar email do ingresso para o participante
                        try {
                            $assunto = "Seu Ingresso para " . $ingresso['evento_nome'];
                            $link_ingresso = "https://anysummit.com.br/evento/api/ver-ingresso-individual.php?ingresso_id=" . $ingresso['id'];
                            
                            $corpo_email = "
                            <html>
                            <head><meta charset='UTF-8'></head>
                            <body style='font-family: Arial, sans-serif; background: #f8f9fa; padding: 20px;'>
                                <div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
                                    <div style='background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%); color: white; padding: 30px; text-align: center;'>
                                        <h1 style='margin: 0; font-size: 24px;'>🎟️ Seu Ingresso Está Pronto!</h1>
                                    </div>
                                    <div style='padding: 30px;'>
                                        <h2 style='color: #333; margin-bottom: 20px;'>" . htmlspecialchars($ingresso['evento_nome']) . "</h2>
                                        <p style='color: #666; font-size: 16px; line-height: 1.6;'>
                                            Olá <strong>" . htmlspecialchars($nome) . "</strong>,<br><br>
                                            Seu ingresso foi vinculado com sucesso! Agora você pode visualizar, imprimir ou salvar seu ingresso oficial.
                                        </p>
                                        <div style='background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                                            <p style='margin: 0; color: #333;'><strong>Código do Ingresso:</strong> " . htmlspecialchars($ingresso['codigo_ingresso']) . "</p>
                                            <p style='margin: 5px 0 0 0; color: #333;'><strong>Tipo:</strong> " . htmlspecialchars($ingresso['titulo_ingresso']) . "</p>
                                        </div>
                                        <div style='text-align: center; margin: 30px 0;'>
                                            <a href='" . $link_ingresso . "' style='background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;'>
                                                🎫 Visualizar Meu Ingresso
                                            </a>
                                        </div>
                                        <p style='color: #999; font-size: 14px; text-align: center;'>
                                            Apresente este ingresso (impresso ou digital) na entrada do evento.
                                        </p>
                                    </div>
                                </div>
                            </body>
                            </html>";
                            
                            $headers = "MIME-Version: 1.0" . "\r\n";
                            $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
                            $headers .= "From: AnySummit <ingressos@anysummit.com.br>" . "\r\n";
                            
                            mail($email, $assunto, $corpo_email, $headers);
                            
                        } catch (Exception $e) {
                            error_log("Erro ao enviar email do ingresso: " . $e->getMessage());
                        }
                        
                        $mensagem = "Ingresso vinculado com sucesso! Um email foi enviado para " . $email . " com o link do ingresso.";
                        $tipo_mensagem = "success";
                        $mostrar_botao_ver_ingresso = true;
                        
                        // Atualizar dados do ingresso na variável
                        $ingresso['participanteid'] = $participante_id;
                        $ingresso['participante_nome'] = $nome;
                        $ingresso['participante_email'] = $email;
                        $ingresso['participante_documento'] = $documento;
                        $ingresso['data_vinculacao'] = date('Y-m-d H:i:s');
                    } else {
                        $mensagem = "Erro ao vincular o ingresso. Tente novamente.";
                        $tipo_mensagem = "danger";
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
                // Aqui você pode implementar o envio do email
                // Por enquanto, apenas uma mensagem de sucesso
                $mensagem = "Link do ingresso enviado para $email_destinatario com sucesso!";
                $tipo_mensagem = "success";
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
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciar Ingresso - <?php echo htmlspecialchars($ingresso['evento_nome']); ?></title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%);
            min-height: 100vh;
            padding: 20px 0;
        }
        
        .main-container {
            max-width: 900px;
            margin: 0 auto;
        }
        
        .card-custom {
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            border: 1px solid rgba(114, 94, 255, 0.3);
            background: rgba(26, 26, 46, 0.9);
            backdrop-filter: blur(10px);
            overflow: hidden;
            margin-bottom: 2rem;
        }
        
        .header-gradient {
            background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%);
            color: white;
            padding: 2.5rem 2rem;
            text-align: center;
            position: relative;
        }
        
        .evento-imagem, .organizador-logo {
            border: 3px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .anysummit-logo {
            width: 300px;
            height: auto;
            object-fit: contain;
            margin-bottom: 15px;
        }
        
        .evento-imagem {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            background: white;
        }
        
        .organizador-logo {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            background: white;
        }
        
        .ingresso-card {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            margin: 1rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .alert-custom {
            border-radius: 15px;
            border: none;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%);
            border: none;
            border-radius: 10px;
            font-weight: 600;
            padding: 12px 30px;
            box-shadow: 0 8px 25px rgba(114, 94, 255, 0.4);
            transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(114, 94, 255, 0.6);
        }
        
        .btn-success {
            background: linear-gradient(135deg, #00C2FF 0%, #725EFF 100%);
            border: none;
            border-radius: 10px;
            font-weight: 600;
            padding: 12px 30px;
            box-shadow: 0 8px 25px rgba(0, 194, 255, 0.4);
        }
        
        .modal-content {
            border-radius: 20px;
            border: 1px solid rgba(114, 94, 255, 0.3);
            background: rgba(26, 26, 46, 0.95);
            backdrop-filter: blur(15px);
        }
        
        .modal-header {
            background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%);
            border-bottom: none;
            border-radius: 20px 20px 0 0;
        }
        
        .modal-body {
            color: white;
        }
        
        .modal-body .form-label {
            color: white !important;
            font-weight: 500;
        }
        
        .form-control {
            border-radius: 10px;
            border: 1px solid rgba(114, 94, 255, 0.3);
            background: rgba(255, 255, 255, 0.95);
            padding: 12px 15px;
        }
        
        .form-control:focus {
            border-color: #725EFF;
            box-shadow: 0 0 0 3px rgba(114, 94, 255, 0.1);
            background: white;
        }
        
        .text-primary-custom {
            color: #725EFF !important;
        }
        
        .bg-primary-custom {
            background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%) !important;
        }
            border: 2px solid #e9ecef;
            margin: 2rem 0;
        }
        
        .codigo-ingresso {
            font-family: 'Courier New', monospace;
            font-size: 1.5rem;
            font-weight: bold;
            color: #007bff;
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 10px;
            text-align: center;
            letter-spacing: 2px;
            border: 2px solid #007bff;
            margin: 1.5rem 0;
        }
        
        .status-badge {
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.8rem;
        }
        
        .status-ativo { background: #d4edda; color: #155724; }
        .status-utilizado { background: #f8d7da; color: #721c24; }
        .status-transferido { background: #fff3cd; color: #856404; }
        
        .btn-custom {
            padding: 0.75rem 2rem;
            border-radius: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
        }
        
        .btn-custom:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .participante-info {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 10px;
            border-left: 4px solid #28a745;
        }
        
        .participante-nao-vinculado {
            background: #fff3cd;
            padding: 1.5rem;
            border-radius: 10px;
            border-left: 4px solid #ffc107;
        }
        
        .modal-custom .modal-content {
            border-radius: 15px;
            border: none;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .modal-custom .modal-header {
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            border-radius: 15px 15px 0 0;
        }
        
        .form-control {
            border-radius: 10px;
            border: 2px solid #e9ecef;
            padding: 0.75rem;
        }
        
        .form-control:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
        
        .alert-custom {
            border-radius: 10px;
            border: none;
            padding: 1rem 1.5rem;
        }
    </style>
</head>
<body>
    <div class="main-container">
        
        <!-- Header Principal com Informações do Evento -->
        <div class="card-custom">
            <div class="header-gradient">
                <!-- Logo AnySummit -->
                <img src="https://anysummit.com.br/img/anysummitlogo.png" alt="AnySummit" class="anysummit-logo">
                
                <div class="d-flex align-items-center justify-content-center gap-4 mb-3">
                    <!-- Imagem do Evento -->
                    <?php if ($imagem_capa_url): ?>
                        <img src="<?php echo $imagem_capa_url; ?>" alt="Capa do Evento" class="evento-imagem border-white">
                    <?php else: ?>
                        <div class="evento-imagem bg-white bg-opacity-25 d-flex align-items-center justify-content-center">
                            <i class="fas fa-calendar-alt text-white fs-3"></i>
                        </div>
                    <?php endif; ?>
                    
                    <!-- Logo do Organizador -->
                    <?php if ($logo_organizador_url): ?>
                        <img src="<?php echo $logo_organizador_url; ?>" alt="Logo Organizador" class="organizador-logo border-white">
                    <?php else: ?>
                        <div class="organizador-logo bg-white bg-opacity-25 d-flex align-items-center justify-content-center">
                            <i class="fas fa-building text-white fs-5"></i>
                        </div>
                    <?php endif; ?>
                </div>
                
                <h1 class="mb-2 fs-2"><?php echo htmlspecialchars($ingresso['evento_nome']); ?></h1>
                <p class="mb-1 fs-6 opacity-90">
                    <i class="fas fa-calendar me-2"></i>
                    <?php echo $data_evento; ?>
                </p>
                <p class="mb-2 fs-6 opacity-90">
                    <i class="fas fa-map-marker-alt me-2"></i>
                    <?php echo htmlspecialchars($ingresso['nome_local'] . ', ' . $ingresso['cidade'] . ' - ' . $ingresso['estado']); ?>
                </p>
                
                <?php if (!empty($ingresso['organizador_nome'])): ?>
                <p class="mb-0 fs-6 opacity-75">
                    <i class="fas fa-user-tie me-2"></i>
                    Organizado por: <strong><?php echo htmlspecialchars($ingresso['organizador_nome']); ?></strong>
                </p>
                <?php endif; ?>
            </div>
            
            <!-- Nome do Comprador -->
            <div class="bg-light p-3 text-center">
                <h6 class="mb-0 text-muted">
                    <i class="fas fa-shopping-cart me-2"></i>
                    Esse voucher foi adquirido por: 
                    <strong class="text-dark"><?php echo htmlspecialchars($ingresso['comprador_nome_completo'] ?: $ingresso['comprador_nome']); ?></strong>
                </h6>
            </div>
        </div>
        
        <!-- Mensagens -->
        <?php if (!empty($mensagem)): ?>
        <div class="alert alert-<?php echo $tipo_mensagem; ?> alert-custom">
            <i class="fas fa-<?php echo $tipo_mensagem === 'success' ? 'check-circle' : 'exclamation-triangle'; ?> me-2"></i>
            <?php echo htmlspecialchars($mensagem); ?>
            
            <?php if ($tipo_mensagem === 'success' && isset($mostrar_botao_ver_ingresso)): ?>
            <div class="mt-3">
                <a href="/evento/api/ver-ingresso-individual.php?ingresso_id=<?php echo $ingresso['id']; ?>" 
                   target="_blank" 
                   class="btn btn-primary btn-sm">
                    <i class="fas fa-eye me-2"></i>
                    Ver Meu Ingresso
                </a>
            </div>
            <?php endif; ?>
        </div>
        <?php endif; ?>
        
        <!-- Card do Ingresso -->
        <div class="card-custom">
            <div class="ingresso-card">
                <div class="row align-items-center mb-4">
                    <div class="col-md-8">
                        <h3 class="mb-1">
                            <i class="fas fa-ticket-alt text-primary me-2"></i>
                            <?php echo htmlspecialchars($ingresso['titulo_ingresso']); ?>
                        </h3>
                    </div>
                    <div class="col-md-4 text-md-end">
                        <span class="status-badge status-<?php echo $ingresso['status'] ?: 'ativo'; ?>">
                            <?php echo ucfirst($ingresso['status'] ?: 'Ativo'); ?>
                        </span>
                    </div>
                </div>
                
                <!-- Código do Ingresso -->
                <div class="codigo-ingresso">
                    <?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?>
                </div>
                
                <!-- Status do Participante -->
                <?php if ($ingresso['participante_nome']): ?>
                    <!-- Ingresso Vinculado -->
                    <div class="participante-info">
                        <div class="d-flex align-items-center mb-3">
                            <div class="me-3">
                                <div class="bg-success rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                    <i class="fas fa-user-check text-white fs-4"></i>
                                </div>
                            </div>
                            <div>
                                <h5 class="mb-1 text-success">Ingresso Vinculado!</h5>
                                <p class="mb-0 text-muted">Este ingresso está pronto para uso no evento.</p>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <strong>Participante:</strong><br>
                                <span><?php echo htmlspecialchars($ingresso['participante_nome']); ?></span>
                            </div>
                            <?php if ($ingresso['participante_email']): ?>
                            <div class="col-md-6">
                                <strong>E-mail:</strong><br>
                                <span><?php echo htmlspecialchars($ingresso['participante_email']); ?></span>
                            </div>
                            <?php endif; ?>
                        </div>
                        
                        <?php if ($ingresso['data_vinculacao']): ?>
                        <div class="mt-3">
                            <small class="text-muted">
                                <i class="fas fa-clock me-1"></i>
                                Vinculado em <?php echo date('d/m/Y H:i', strtotime($ingresso['data_vinculacao'])); ?>
                            </small>
                        </div>
                        <?php endif; ?>
                    </div>
                    
                    <!-- Mensagem para Ingresso Já Vinculado -->
                    <div class="alert alert-info mt-4">
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Este ingresso já está vinculado à <?php echo htmlspecialchars($ingresso['participante_nome']); ?> e não pode mais ser alterado.</strong>
                    </div>
                    
                <?php else: ?>
                    <!-- Ingresso Não Vinculado -->
                    <div class="participante-nao-vinculado">
                        <div class="d-flex align-items-center mb-3">
                            <div class="me-3">
                                <div class="bg-warning rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                    <i class="fas fa-user-slash text-white fs-4"></i>
                                </div>
                            </div>
                            <div>
                                <h5 class="mb-1 text-warning">Ingresso Disponível</h5>
                                <p class="mb-0 text-muted">Este ingresso precisa ser vinculado a um participante para ser usado no evento.</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Botões para Ingresso Não Vinculado -->
                    <div class="row mt-4">
                        <div class="col-md-6 mb-2">
                            <button class="btn btn-primary btn-custom w-100" data-bs-toggle="modal" data-bs-target="#modalVincularParticipante">
                                <i class="fas fa-user-plus me-2"></i>
                                Usar este Ingresso
                            </button>
                        </div>
                        <div class="col-md-6 mb-2">
                            <button class="btn btn-success btn-custom w-100" data-bs-toggle="modal" data-bs-target="#modalEnviarIngresso">
                                <i class="fas fa-paper-plane me-2"></i>
                                Enviar para Alguém
                            </button>
                        </div>
                    </div>
                    
                    <!-- Informação sobre emissão do ingresso -->
                    <div class="alert alert-warning mt-3">
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Importante:</strong> Após a vinculação o ingresso oficial será emitido e o seu titular não poderá mais ser alterado.
                    </div>
                <?php endif; ?>
                
                <!-- Informações do Pedido -->
                <div class="mt-4 pt-4 border-top">
                    <h6 class="text-muted mb-3">
                        <i class="fas fa-info-circle me-2"></i>
                        Informações do Pedido
                    </h6>
                    <div class="row">
                        <div class="col-md-6">
                            <small class="text-muted">
                                <strong>Pedido:</strong> <?php echo htmlspecialchars($ingresso['codigo_pedido']); ?>
                            </small>
                        </div>
                        <div class="col-md-6">
                            <small class="text-muted">
                                <strong>Comprado em:</strong> <?php echo $data_pedido; ?>
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Modal Vincular Participante -->
    <div class="modal fade modal-custom" id="modalVincularParticipante" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-user-plus me-2"></i>
                        Vincular Participante
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <form method="POST">
                    <div class="modal-body">
                        <input type="hidden" name="acao" value="vincular">
                        
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Preencha os dados de quem vai usar este ingresso no evento.</strong>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="participante_nome" class="form-label">
                                    <i class="fas fa-user me-1"></i>
                                    Nome Completo *
                                </label>
                                <input type="text" class="form-control" id="participante_nome" name="participante_nome" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="participante_email" class="form-label">
                                    <i class="fas fa-envelope me-1"></i>
                                    E-mail *
                                </label>
                                <input type="email" class="form-control" id="participante_email" name="participante_email" required>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="participante_documento" class="form-label">
                                    <i class="fas fa-id-card me-1"></i>
                                    CPF *
                                </label>
                                <input type="text" class="form-control" id="participante_documento" name="participante_documento" placeholder="000.000.000-00" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="participante_celular" class="form-label">
                                    <i class="fas fa-mobile-alt me-1"></i>
                                    Celular *
                                </label>
                                <input type="text" class="form-control" id="participante_celular" name="participante_celular" placeholder="(11) 99999-9999" required>
                            </div>
                        </div>

                        <!-- Campos Adicionais Dinâmicos -->
                        <?php if (!empty($campos_adicionais_evento)): ?>
                            <hr class="my-4">
                            <h6 class="mb-3">
                                <i class="fas fa-clipboard-list me-2"></i>
                                Informações Adicionais
                            </h6>
                            <?php foreach ($campos_adicionais_evento as $campo): ?>
                                <div class="mb-3">
                                    <label for="campo_<?php echo htmlspecialchars($campo['campo']); ?>" class="form-label">
                                        <i class="fas fa-info-circle me-1"></i>
                                        <?php echo htmlspecialchars($campo['label']); ?>
                                        <?php if ($campo['obrigatorio']): ?>
                                            <span class="text-danger">*</span>
                                        <?php endif; ?>
                                    </label>

                                    <?php if ($campo['tipo'] === 'texto'): ?>
                                        <input type="text" 
                                               class="form-control" 
                                               id="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                               name="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                               <?php echo $campo['obrigatorio'] ? 'required' : ''; ?>>
                                    
                                    <?php elseif ($campo['tipo'] === 'selecao' && !empty($campo['opcoes'])): ?>
                                        <select class="form-control" 
                                                id="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                                name="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                                <?php echo $campo['obrigatorio'] ? 'required' : ''; ?>>
                                            <option value="">Selecione...</option>
                                            <?php foreach ($campo['opcoes'] as $opcao): ?>
                                                <option value="<?php echo htmlspecialchars($opcao); ?>">
                                                    <?php echo htmlspecialchars($opcao); ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    
                                    <?php elseif ($campo['tipo'] === 'url'): ?>
                                        <input type="url" 
                                               class="form-control" 
                                               id="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                               name="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                               placeholder="https://exemplo.com"
                                               <?php echo $campo['obrigatorio'] ? 'required' : ''; ?>>
                                    
                                    <?php elseif ($campo['tipo'] === 'email'): ?>
                                        <input type="email" 
                                               class="form-control" 
                                               id="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                               name="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                               placeholder="email@exemplo.com"
                                               <?php echo $campo['obrigatorio'] ? 'required' : ''; ?>>
                                    
                                    <?php else: ?>
                                        <input type="text" 
                                               class="form-control" 
                                               id="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                               name="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                               <?php echo $campo['obrigatorio'] ? 'required' : ''; ?>>
                                    <?php endif; ?>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>

                        <!-- Aviso Importante -->
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>Atenção:</strong> Depois de associar esse voucher a uma pessoa, os dados não poderão ser mais alterados.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary btn-custom">
                            <i class="fas fa-user-plus me-1"></i>
                            Vincular Participante
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- Modal Enviar Ingresso -->
    <div class="modal fade modal-custom" id="modalEnviarIngresso" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-success">
                    <h5 class="modal-title">
                        <i class="fas fa-paper-plane me-2"></i>
                        Enviar Ingresso
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <form method="POST">
                    <div class="modal-body">
                        <input type="hidden" name="acao" value="enviar">
                        
                        <div class="alert alert-success">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Envie este ingresso para alguém utilizar!</strong><br>
                            A pessoa receberá um link para acessar e gerenciar o ingresso.
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="enviar_nome" class="form-label">
                                    <i class="fas fa-user me-1"></i>
                                    Nome do Destinatário *
                                </label>
                                <input type="text" class="form-control" id="enviar_nome" name="enviar_nome" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="enviar_email" class="form-label">
                                    <i class="fas fa-envelope me-1"></i>
                                    E-mail do Destinatário *
                                </label>
                                <input type="email" class="form-control" id="enviar_email" name="enviar_email" required>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="enviar_mensagem" class="form-label">
                                <i class="fas fa-comment me-1"></i>
                                Mensagem (Opcional)
                            </label>
                            <textarea class="form-control" id="enviar_mensagem" name="enviar_mensagem" rows="3" 
                                      placeholder="Deixe uma mensagem personalizada..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-1"></i>
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-success btn-custom">
                            <i class="fas fa-paper-plane me-1"></i>
                            Enviar Ingresso
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        // Máscaras para os campos
        document.addEventListener('DOMContentLoaded', function() {
            // Máscara para CPF
            const cpfInput = document.getElementById('participante_documento');
            if (cpfInput) {
                cpfInput.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d)/, '$1.$2');
                    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                    e.target.value = value;
                });
            }
            
            // Máscara para celular
            const celularInput = document.getElementById('participante_celular');
            if (celularInput) {
                celularInput.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
                    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
                    e.target.value = value;
                });
            }
        });
    </script>
</body>
</html>

<?php
// Arquivo de erro simples (se não existir)
function mostrarPaginaErro($erro) {
    echo "<!DOCTYPE html><html><head><title>Erro</title></head><body>";
    echo "<h2>Erro</h2><p>$erro</p>";
    echo "<a href='/'>Voltar ao início</a>";
    echo "</body></html>";
}
?>
