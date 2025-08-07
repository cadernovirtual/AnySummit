<?php
/**
 * Template HTML do Email de Confirmação - DESIGN EVENTO-PUBLICADO.PHP
 * Aplicando o mesmo visual da página de sucesso dos produtores
 */

function gerarTemplateEmailConfirmacao($pedido, $evento, $ingressos) {
    // Formatar data do evento
    $data_evento = '';
    if ($evento['data_inicio']) {
        $data_evento = date('d/m/Y H:i', strtotime($evento['data_inicio']));
    }

    // Formatar data do pedido
    $data_pedido = date('d/m/Y H:i', strtotime($pedido['data_pedido']));

    // URL da imagem de capa (se existir) - CORREÇÃO DO CAMINHO DUPLICADO
    $imagem_capa_url = '';
    if ($evento['imagem_capa']) {
        $imagem_evento = $evento['imagem_capa'];
        // Remover /uploads/eventos/ do início se estiver duplicado
        $imagem_evento = str_replace('/uploads/eventos/', '', $imagem_evento);
        $imagem_capa_url = 'https://anysummit.com.br/uploads/eventos/' . $imagem_evento;
    }

    // URL da logomarca do organizador (se existir) - CORREÇÃO DO CAMINHO DUPLICADO  
    $logo_organizador_url = '';
    if ($evento['organizador_logo']) {
        $logo_organizador = $evento['organizador_logo'];
        // Remover caminhos duplicados
        $logo_organizador = str_replace('/uploads/contratantes/', '', $logo_organizador);
        $logo_organizador = str_replace('/uploads/organizadores/', '', $logo_organizador);
        $logo_organizador_url = 'https://anysummit.com.br/uploads/organizadores/' . $logo_organizador;
    }

    // Gerar lista de vouchers HTML - DESIGN EVENTO-PUBLICADO
    $ingressos_html = '';
    foreach ($ingressos as $ingresso) {
        $botao_url = "https://anysummit.com.br/validar-ingresso.php?h=" . $ingresso['hash_validacao'];
        
        $ingressos_html .= '
        <div style="background: rgba(26, 26, 46, 0.9); border: 1px solid rgba(114, 94, 255, 0.3); border-radius: 16px; margin: 20px 0; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.2);">
            <!-- Cabeçalho do Voucher -->
            <div style="background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%); color: white; padding: 24px; text-align: center;">
                <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: white;">
                    🎫 ' . htmlspecialchars($ingresso['titulo_ingresso']) . '
                </h3>
                <div style="background: rgba(255,255,255,0.95); color: #0F0F23; padding: 12px 24px; border-radius: 12px; margin: 16px auto 0; display: inline-block; font-family: \'Courier New\', monospace; font-weight: bold; font-size: 16px; letter-spacing: 2px;">
                    ' . htmlspecialchars($ingresso['codigo_ingresso']) . '
                </div>
            </div>
            
            <!-- Corpo do Voucher -->
            <div style="padding: 32px; text-align: center;">
                <div style="margin-bottom: 24px;">
                    <a href="' . $botao_url . '" style="display: inline-block; background: linear-gradient(135deg, #8A7CFF 0%, #4DCCFF 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(114, 94, 255, 0.3);">
                        Identificar Titular desse Voucher
                    </a>
                </div>
                
                <div style="color: #8B95A7; font-size: 14px; line-height: 1.6;">
                    Clique no botão acima para vincular este voucher a uma pessoa. Você mesmo poderá identificá-lo ou enviá-lo para alguém.
                </div>
            </div>
        </div>';
    }

    // Informações de suporte
    $email_suporte = $evento['organizador_email'] ?: 'suporte@anysummit.com.br';
    $telefone_suporte = $evento['organizador_telefone'] ?: '';
    $nome_organizador = $evento['organizador_nome'] ?: 'AnySummit';

    $html = '
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pagamento Confirmado - ' . htmlspecialchars($evento['nome']) . '</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { 
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.6; 
            color: #E1E5F2; 
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%);
            min-height: 100vh;
        }
        .email-container {
            max-width: 700px;
            margin: 0 auto;
            background: rgba(26, 26, 46, 0.9);
            border: 1px solid rgba(114, 94, 255, 0.3);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header {
            background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%);
            color: white;
            padding: 48px 30px;
            text-align: center;
            position: relative;
        }
        .logo {
            width: 300px;
            height: auto;
            margin-bottom: 20px;
            object-fit: contain;
        }
        .success-icon {
            font-size: 48px;
            margin-bottom: 16px;
            display: block;
        }
        .header-title {
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 16px 0;
        }
        .header-subtitle {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
            opacity: 0.9;
        }
        .evento-header {
            padding: 32px;
            border-bottom: 1px solid rgba(114, 94, 255, 0.2);
        }
        .evento-info {
            display: flex;
            align-items: flex-start;
            gap: 30px;
        }
        .evento-imagem {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid rgba(114, 94, 255, 0.3);
            margin-right: 20px;
        }
        .organizador-info {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 15px;
        }
        .organizador-logo {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
        }
        .event-details {
            background: rgba(15, 15, 35, 0.6);
            border: 1px solid rgba(114, 94, 255, 0.2);
            border-radius: 16px;
            padding: 24px;
            margin: 24px 32px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid rgba(114, 94, 255, 0.1);
            gap: 20px;
        }
        .detail-row:last-child {
            border-bottom: none;
            font-weight: bold;
            color: #00C2FF;
        }
        .detail-label {
            color: #8B95A7;
            font-weight: 500;
        }
        .detail-value {
            color: #E1E5F2;
            font-weight: 600;
        }
        .vouchers-section {
            padding: 32px;
        }
        .vouchers-title {
            font-size: 22px;
            font-weight: 700;
            color: #E1E5F2;
            text-align: center;
            margin-bottom: 16px;
        }
        .alert-important {
            background: rgba(255, 193, 7, 0.1);
            border: 1px solid rgba(255, 193, 7, 0.3);
            padding: 24px;
            border-radius: 16px;
            margin: 24px 0;
            color: #E1E5F2;
            line-height: 1.8;
        }
        .alert-title {
            color: #00C2FF;
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 12px;
        }
        .footer {
            background: rgba(15, 15, 35, 0.8);
            border-top: 1px solid rgba(114, 94, 255, 0.2);
            color: #8B95A7;
            padding: 32px;
            text-align: center;
        }
        .footer a {
            color: #00C2FF;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .evento-info {
                flex-direction: column;
                text-align: center;
            }
            .detail-row {
                flex-direction: column;
                text-align: center;
                gap: 8px;
            }
            .header {
                padding: 32px 20px;
            }
            .vouchers-section, .evento-header {
                padding: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Cabeçalho com Design evento-publicado.php -->
        <div class="header">
            <img src="https://anysummit.com.br/img/anysummitlogo.png" alt="AnySummit" class="logo">
            <h1 class="header-title">🎉 Pagamento Confirmado!</h1>
            <p class="header-subtitle">Aqui estão os Vouchers que você comprou!</p>
        </div>

        <!-- Informações do Evento -->
        <div class="evento-header">
            <div class="evento-info">
                ' . ($imagem_capa_url ? '<img src="' . $imagem_capa_url . '" alt="Capa do Evento" class="evento-imagem">' : '<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #725EFF, #00C2FF); display: flex; align-items: center; justify-content: center; font-size: 24px; color: white;">🎪</div>') . '
                <div style="flex: 1;">
                    <h2 style="margin: 0; color: #E1E5F2; font-size: 22px;">' . htmlspecialchars($evento['nome']) . '</h2>
                    <p style="margin: 8px 0; color: #8B95A7; font-size: 16px;">
                        📅 ' . $data_evento . '
                    </p>
                    <p style="margin: 8px 0; color: #8B95A7; font-size: 16px;">
                        📍 ' . htmlspecialchars($evento['nome_local']) . '
                        ' . ($evento['cidade'] ? ', ' . htmlspecialchars($evento['cidade']) : '') . '
                        ' . ($evento['estado'] ? ' - ' . htmlspecialchars($evento['estado']) : '') . '
                    </p>
                    ' . ($evento['organizador_nome'] ? '
                    <div class="organizador-info">
                        ' . ($logo_organizador_url ? '<img src="' . $logo_organizador_url . '" alt="Logo Organizador" class="organizador-logo">' : '<div style="width: 40px; height: 40px; border-radius: 50%; background: #6c757d; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">🏢</div>') . '
                        <span style="color: #8B95A7; font-size: 14px;">por <strong style="color: #E1E5F2;">' . htmlspecialchars($evento['organizador_nome']) . '</strong></span>
                    </div>
                    ' : '') . '
                </div>
            </div>
        </div>

        <!-- Detalhes do Pedido -->
        <div class="event-details">
            <h3 style="margin: 0 0 20px 0; color: #E1E5F2; font-size: 18px; font-weight: 600;">
                📋 Detalhes do Pedido
            </h3>
            
            <div class="detail-row">
                <span class="detail-label">Número do Pedido</span>
                <span class="detail-value">' . htmlspecialchars($pedido['codigo_pedido']) . '</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Data do Pedido</span>
                <span class="detail-value">' . $data_pedido . '</span>
            </div>
            
            ' . ($pedido['asaas_payment_id'] ? '
            <div class="detail-row">
                <span class="detail-label">ID de Confirmação</span>
                <span class="detail-value">' . htmlspecialchars($pedido['asaas_payment_id']) . '</span>
            </div>
            ' : '') . '
            
            <div class="detail-row">
                <span class="detail-label">Comprador</span>
                <span class="detail-value">' . htmlspecialchars($pedido['comprador_nome']) . '</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Total Pago</span>
                <span class="detail-value">R$ ' . number_format($pedido['valor_total'], 2, ',', '.') . '</span>
            </div>
        </div>

        <!-- Seção de Vouchers -->
        <div class="vouchers-section">
            <h3 class="vouchers-title">🎫 Seus Vouchers (' . count($ingressos) . ')</h3>
            
            <!-- AVISO IMPORTANTE -->
            <div class="alert-important">
                <div class="alert-title">⚠️ IMPORTANTE - LEIA COM ATENÇÃO:</div>
                <p style="margin: 0 0 12px 0;">
                    Este e-mail ainda <strong>NÃO garante o acesso ao evento</strong>. Para cada voucher você precisa <strong>Identificar os dados do seu titular</strong>, ou seja, da pessoa que efetivamente terá acesso ao evento (uma delas pode ser você mesmo).
                </p>
                <p style="margin: 0 0 12px 0;">
                    <strong>Guarde este email e não o encaminhe diretamente</strong>, pois qualquer pessoa de posse dele poderá clicar nos botões abaixo e usar seus vouchers.
                </p>
                <p style="margin: 0 0 12px 0;">
                    É importante que você identifique os usuários <strong>ANTES do início do evento</strong>. Essa operação não será possível depois que o evento iniciar.
                </p>
                <p style="margin: 0 0 12px 0;">
                    Assim que o titular de cada Voucher for identificado o sistema emitirá o <strong>ingresso formal com o QR CODE</strong> que permitirá seu acesso ao evento.
                </p>
                <p style="margin: 0; color: #ff6b6b; font-weight: 600;">
                    <strong>Não haverá reembolso por vouchers não utilizados e/ou sem identificação de usuário.</strong>
                </p>
            </div>
            
            <!-- Lista de Vouchers -->
            ' . $ingressos_html . '
        </div>

        <!-- Rodapé -->
        <div class="footer">
            <p style="margin: 0 0 15px 0; font-size: 16px; color: #8B95A7;">
                Precisa de ajuda?
            </p>
            <p style="margin: 0 0 10px 0;">
                Entre em contato: <a href="mailto:' . $email_suporte . '">' . $email_suporte . '</a>
                ' . ($telefone_suporte ? ' | Telefone: ' . htmlspecialchars($telefone_suporte) : '') . '
            </p>
            <hr style="border: none; border-top: 1px solid rgba(114, 94, 255, 0.2); margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;">
                &copy; ' . date('Y') . ' AnySummit. Todos os direitos reservados.
            </p>
        </div>
    </div>
</body>
</html>';

    return $html;
}
?>
