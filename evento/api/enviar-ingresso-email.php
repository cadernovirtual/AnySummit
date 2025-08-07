<?php
/**
 * API para enviar ingresso por email para outra pessoa
 * Usado na página de validação de ingresso
 */

include("../conm/conn.php");
include("enviar-email-confirmacao.php");

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Dados JSON inválidos');
    }
    
    $ingresso_id = $input['ingresso_id'] ?? null;
    $nome_destinatario = trim($input['nome_destinatario'] ?? '');
    $email_destinatario = trim($input['email_destinatario'] ?? '');
    $mensagem_personalizada = trim($input['mensagem_personalizada'] ?? '');
    $remetente_nome = trim($input['remetente_nome'] ?? '');
    
    // Validações básicas
    if (!$ingresso_id || !$nome_destinatario || !$email_destinatario) {
        throw new Exception('Dados obrigatórios não fornecidos');
    }
    
    // Buscar dados do ingresso
    $sql = "SELECT 
        ii.*,
        e.nome as evento_nome, 
        e.data_inicio, 
        e.nome_local, 
        e.cidade, 
        e.estado,
        e.imagem_capa,
        p.codigo_pedido, 
        p.comprador_nome,
        c.nome as comprador_nome_completo
        FROM tb_ingressos_individuais ii
        LEFT JOIN eventos e ON ii.eventoid = e.id
        LEFT JOIN tb_pedidos p ON ii.pedidoid = p.pedidoid
        LEFT JOIN compradores c ON p.compradorid = c.id
        WHERE ii.id = ?";
    
    $stmt = $con->prepare($sql);
    $stmt->bind_param("i", $ingresso_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Ingresso não encontrado');
    }
    
    $ingresso = $result->fetch_assoc();
    
    // Gerar o email de envio do ingresso
    $html_email = gerarTemplateEnvioIngresso($ingresso, $nome_destinatario, $email_destinatario, $mensagem_personalizada, $remetente_nome);
    
    // Configurações SMTP
    $smtp_host = 'mail.anysummit.com.br';
    $smtp_port = 465;
    $smtp_user = 'ingressos@anysummit.com.br';
    $smtp_pass = 'Miran@Janyne@Gustavo';
    $from_email = 'ingressos@anysummit.com.br';
    $from_name = 'Any Summit - Ingressos';
    
    $assunto = "Você recebeu um ingresso para " . $ingresso['evento_nome'];
    
    // Enviar email
    $resultado = enviarEmailSMTP(
        $email_destinatario,
        $assunto,
        $html_email,
        $smtp_host,
        $smtp_port,
        $smtp_user,
        $smtp_pass,
        $from_email,
        $from_name
    );
    
    if ($resultado === true) {
        echo json_encode(['success' => true, 'message' => 'Ingresso enviado com sucesso!']);
    } else {
        throw new Exception('Erro no envio do email: ' . $resultado);
    }
    
} catch (Exception $e) {
    error_log('Erro no envio de ingresso: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

function gerarTemplateEnvioIngresso($ingresso, $nome_destinatario, $email_destinatario, $mensagem_personalizada, $remetente_nome) {
    // Formatar data do evento
    $data_evento = '';
    if ($ingresso['data_inicio']) {
        $data_evento = date('d/m/Y H:i', strtotime($ingresso['data_inicio']));
    }

    // URL da imagem de capa (se existir)
    $imagem_capa_url = '';
    if ($ingresso['imagem_capa']) {
        $imagem_capa_url = 'https://anysummit.com.br/uploads/eventos/' . $ingresso['imagem_capa'];
    }

    // URL para gerenciar o ingresso
    $url_gerenciar = "https://anysummit.com.br/validar-ingresso.aspx?h=" . $ingresso['hash_validacao'];
    
    // Nome do remetente (quem está enviando)
    $nome_remetente = $remetente_nome ?: ($ingresso['comprador_nome_completo'] ?: $ingresso['comprador_nome']);

    $html = '
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Você recebeu um ingresso!</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6; 
            color: #333; 
            max-width: 650px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            padding: 0;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        .header::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 20px;
            background: white;
            border-radius: 20px 20px 0 0;
        }
        .gift-icon {
            font-size: 48px;
            margin-bottom: 15px;
            display: block;
        }
        .evento-header {
            padding: 30px;
            border-bottom: 2px solid #e9ecef;
        }
        .evento-info {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .evento-imagem {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #e9ecef;
        }
        .ingresso-card {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            margin: 30px;
            padding: 25px;
            border-radius: 15px;
            border: 2px solid #007bff;
        }
        .codigo-ingresso {
            font-family: "Courier New", monospace;
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            text-align: center;
            background: white;
            padding: 15px;
            border-radius: 10px;
            letter-spacing: 2px;
            margin: 20px 0;
            border: 2px dashed #007bff;
        }
        .btn-gerenciar {
            display: inline-block;
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
        }
        .mensagem-personalizada {
            background: #e7f3ff;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #007bff;
            margin: 30px;
        }
        .instrucoes {
            background: #f8f9fa;
            padding: 25px 30px;
            margin: 0;
        }
        .footer {
            background: #343a40;
            color: #adb5bd;
            padding: 30px;
            text-align: center;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .evento-info {
                flex-direction: column;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Cabeçalho -->
        <div class="header">
            <span class="gift-icon">🎁</span>
            <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Você recebeu um ingresso!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Alguém especial pensou em você</p>
        </div>

        <!-- Informações do Evento -->
        <div class="evento-header">
            <div class="evento-info">
                ' . ($imagem_capa_url ? '<img src="' . $imagem_capa_url . '" alt="Capa do Evento" class="evento-imagem">' : '<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #007bff, #6c757d); display: flex; align-items: center; justify-content: center; font-size: 24px; color: white;">🎪</div>') . '
                <div style="flex: 1;">
                    <h2 style="margin: 0; color: #212529; font-size: 22px;">' . htmlspecialchars($ingresso['evento_nome']) . '</h2>
                    <p style="margin: 5px 0; color: #6c757d; font-size: 16px;">
                        <span style="margin-right: 15px;">📅 ' . $data_evento . '</span>
                    </p>
                    <p style="margin: 5px 0; color: #6c757d; font-size: 16px;">
                        📍 ' . htmlspecialchars($ingresso['nome_local']) . '
                        ' . ($ingresso['cidade'] ? ', ' . htmlspecialchars($ingresso['cidade']) : '') . '
                        ' . ($ingresso['estado'] ? ' - ' . htmlspecialchars($ingresso['estado']) : '') . '
                    </p>
                </div>
            </div>
        </div>

        <!-- Mensagem Personalizada -->
        ' . ($mensagem_personalizada ? '
        <div class="mensagem-personalizada">
            <h4 style="margin: 0 0 10px 0; color: #0056b3; display: flex; align-items: center;">
                <span style="font-size: 18px; margin-right: 8px;">💌</span>
                Mensagem de ' . htmlspecialchars($nome_remetente) . ':
            </h4>
            <p style="margin: 0; font-style: italic; color: #495057;">
                "' . htmlspecialchars($mensagem_personalizada) . '"
            </p>
        </div>
        ' : '') . '

        <!-- Card do Ingresso -->
        <div class="ingresso-card">
            <div style="text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: #212529; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 20px; margin-right: 10px;">🎫</span>
                    ' . htmlspecialchars($ingresso['titulo_ingresso']) . '
                </h3>
                
                <div class="codigo-ingresso">
                    ' . htmlspecialchars($ingresso['codigo_ingresso']) . '
                </div>
                
                <p style="margin: 10px 0 20px 0; color: #6c757d;">
                    <strong>' . htmlspecialchars($nome_remetente) . '</strong> enviou este ingresso para você!
                </p>
                
                <a href="' . $url_gerenciar . '" class="btn-gerenciar">
                    <span style="font-size: 18px; margin-right: 8px;">⚙️</span>
                    Resgatar Meu Ingresso
                </a>
                
                <p style="margin: 15px 0 0 0; color: #6c757d; font-size: 14px;">
                    Clique no botão acima para acessar e gerenciar seu ingresso
                </p>
            </div>
        </div>

        <!-- Instruções -->
        <div class="instrucoes">
            <h4 style="margin: 0 0 20px 0; color: #212529; display: flex; align-items: center;">
                <span style="font-size: 20px; margin-right: 10px;">📋</span>
                Como usar seu ingresso:
            </h4>
            
            <ol style="margin: 0; padding-left: 20px; color: #495057;">
                <li style="margin-bottom: 10px;"><strong>Clique em "Resgatar Meu Ingresso"</strong> para acessar a página de gerenciamento</li>
                <li style="margin-bottom: 10px;"><strong>Vincule o ingresso ao seu nome</strong> preenchendo seus dados</li>
                <li style="margin-bottom: 10px;"><strong>Apresente o ingresso no evento</strong> (impresso ou digital)</li>
                <li style="margin-bottom: 10px;"><strong>Chegue com antecedência</strong> para evitar filas no credenciamento</li>
            </ol>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-top: 20px;">
                <strong style="color: #856404;">⚠️ Importante:</strong>
                <span style="color: #856404;"> O ingresso só será válido após você vinculá-lo ao seu nome na página de gerenciamento.</span>
            </div>
        </div>

        <!-- Rodapé -->
        <div class="footer">
            <p style="margin: 0 0 10px 0; font-size: 16px; color: #adb5bd;">
                Precisa de ajuda?
            </p>
            <p style="margin: 0;">
                Entre em contato: <a href="mailto:suporte@anysummit.com">suporte@anysummit.com</a>
            </p>
            <hr style="border: none; border-top: 1px solid #495057; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;">
                &copy; ' . date('Y') . ' Any Summit. Todos os direitos reservados.
            </p>
        </div>
    </div>
</body>
</html>';

    return $html;
}
?>
