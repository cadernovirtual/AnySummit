<?php
/**
 * Script de Teste Simplificado - Usando mail() do PHP
 * Versão alternativa para testar os templates
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

$email_teste = 'gustavo@cadernovirtual.com.br';
$nome_teste = 'Gustavo Teste';

echo "<h1>📧 Teste de Templates - mail() PHP</h1>";
echo "<p><strong>Destinatário:</strong> $email_teste</p>";
echo "<p><strong>Método:</strong> Função mail() nativa do PHP</p>";
echo "<hr>";

// Configurar headers básicos
$headers_base = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: Any Summit <ingressos@anysummit.com.br>',
    'Reply-To: ingressos@anysummit.com.br'
];

// ========================================
// TEMPLATE 1: EMAIL DE BOAS-VINDAS
// ========================================
echo "<h2>📧 Template 1: Email de Boas-Vindas</h2>";

$token = bin2hex(random_bytes(16));
$senha_url = "https://anysummit.com.br/evento/criar-senha.php?token=" . $token;

$html_boas_vindas = '
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Bem-vindo à Any Summit</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e91e63; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #e91e63; margin-bottom: 10px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #e91e63, #f06292); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        .features { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .feature-item { display: flex; align-items: center; margin: 10px 0; }
        .feature-icon { font-size: 24px; margin-right: 15px; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎉 Any Summit</div>
            <div>Sua plataforma de eventos favorita</div>
        </div>
        
        <div class="content">
            <h2>Olá, ' . htmlspecialchars($nome_teste) . '! 👋</h2>
            
            <p>Que alegria ter você conosco! Sua compra foi processada e agora você faz parte da família Any Summit. 🚀</p>
            
            <p>Para acessar sua conta e gerenciar seus ingressos, você precisa criar sua senha:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="' . $senha_url . '" class="cta-button">🔐 Criar Minha Senha</a>
            </div>
            
            <div class="features">
                <h3>🌟 O que você pode fazer na sua conta:</h3>
                <div class="feature-item"><div class="feature-icon">🎫</div><div>Ver e baixar seus ingressos em PDF</div></div>
                <div class="feature-item"><div class="feature-icon">👥</div><div>Transferir ingressos para outras pessoas</div></div>
                <div class="feature-item"><div class="feature-icon">📱</div><div>Acessar QR Codes para check-in rápido</div></div>
                <div class="feature-item"><div class="feature-icon">💳</div><div>Histórico completo de suas compras</div></div>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <strong>⏰ Importante:</strong> Este link é válido por 24 horas.
            </div>
        </div>
        
        <div class="footer">
            <p>Precisa de ajuda? Entre em contato: <a href="mailto:suporte@anysummit.com">suporte@anysummit.com</a></p>
            <p>&copy; ' . date('Y') . ' Any Summit. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>';

$resultado1 = mail($email_teste, "Bem-vindo à Any Summit! 🎉", $html_boas_vindas, implode("\r\n", $headers_base));
echo $resultado1 ? "✅ <strong>Enviado com sucesso!</strong>" : "❌ <strong>Falha no envio</strong>";
echo "<br><br>";

// ========================================
// TEMPLATE 2: CÓDIGO DE VERIFICAÇÃO
// ========================================
echo "<h2>📧 Template 2: Código de Verificação</h2>";

$codigo = sprintf('%06d', rand(100000, 999999));

$html_codigo = '
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Código de Verificação</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e91e63; padding-bottom: 20px; }
        .codigo-box { background: linear-gradient(135deg, #e91e63, #f06292); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 30px 0; }
        .codigo { font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Código de Verificação</h1>
            <p>Any Summit - Plataforma de Eventos</p>
        </div>
        
        <div class="content">
            <p>Olá, <strong>' . htmlspecialchars($nome_teste) . '</strong>!</p>
            <p>Use o código abaixo para verificar sua conta:</p>
            
            <div class="codigo-box">
                <div class="codigo">' . $codigo . '</div>
                <p>Digite este código na tela de verificação</p>
            </div>
            
            <p><strong>⏰ Este código expira em 10 minutos.</strong></p>
            <p>Se você não solicitou este código, ignore este email.</p>
        </div>
        
        <div class="footer">
            <p>Any Summit - Sistema de Eventos</p>
            <p>&copy; ' . date('Y') . ' Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>';

$resultado2 = mail($email_teste, "Seu código de verificação: $codigo", $html_codigo, implode("\r\n", $headers_base));
echo $resultado2 ? "✅ <strong>Enviado com sucesso!</strong>" : "❌ <strong>Falha no envio</strong>";
echo "<br><br>";

// ========================================
// TEMPLATE 3: INGRESSO
// ========================================
echo "<h2>📧 Template 3: Envio de Ingresso</h2>";

$codigo_ingresso = 'A1B2C3D4';
$evento_nome = 'Congresso de Tecnologia 2025';

$html_ingresso = '
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Seu Ingresso</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
        .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .ticket { background: linear-gradient(135deg, #e91e63, #f06292); color: white; padding: 30px; border-radius: 15px; margin: 20px 0; text-align: center; }
        .ticket-code { font-size: 28px; font-weight: bold; letter-spacing: 4px; border: 2px dashed white; padding: 15px; margin: 15px 0; border-radius: 10px; }
        .evento-info { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .info-item { display: flex; margin: 10px 0; }
        .info-label { font-weight: bold; min-width: 120px; }
    </style>
</head>
<body>
    <div class="container">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1>🎫 Seu Ingresso Chegou!</h1>
            <p>Any Summit - Plataforma de Eventos</p>
        </div>
        
        <div class="content">
            <p>Olá, <strong>' . htmlspecialchars($nome_teste) . '</strong>!</p>
            <p>Seu ingresso está pronto! Veja os detalhes abaixo:</p>
            
            <div class="ticket">
                <h2>🎉 ' . $evento_nome . '</h2>
                <div class="ticket-code">' . $codigo_ingresso . '</div>
                <p>Apresente este código no evento</p>
            </div>
            
            <div class="evento-info">
                <h3>📋 Detalhes do Evento</h3>
                <div class="info-item"><div class="info-label">📅 Data/Hora:</div><div>15/09/2025 às 09:00</div></div>
                <div class="info-item"><div class="info-label">📍 Local:</div><div>Centro de Convenções AnySummit</div></div>
                <div class="info-item"><div class="info-label">🎫 Código:</div><div>' . $codigo_ingresso . '</div></div>
                <div class="info-item"><div class="info-label">👤 Participante:</div><div>' . htmlspecialchars($nome_teste) . '</div></div>
            </div>
            
            <div style="background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
                <strong>💡 Dica:</strong> Salve este email ou tire uma foto do código para facilitar o check-in.
            </div>
            
            <p><strong>Nos vemos no evento! 🚀</strong></p>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
            <p>Any Summit - Sistema de Eventos</p>
            <p>&copy; ' . date('Y') . ' Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>';

$resultado3 = mail($email_teste, "🎫 Seu ingresso para $evento_nome", $html_ingresso, implode("\r\n", $headers_base));
echo $resultado3 ? "✅ <strong>Enviado com sucesso!</strong>" : "❌ <strong>Falha no envio</strong>";
echo "<br><br>";

// ========================================
// RESUMO
// ========================================
echo "<hr>";
echo "<h2>📊 Resumo dos Testes</h2>";
echo "<ul>";
echo "<li><strong>Template 1 - Boas-vindas:</strong> " . ($resultado1 ? "✅ Sucesso" : "❌ Falha") . "</li>";
echo "<li><strong>Template 2 - Código:</strong> " . ($resultado2 ? "✅ Sucesso" : "❌ Falha") . "</li>";  
echo "<li><strong>Template 3 - Ingresso:</strong> " . ($resultado3 ? "✅ Sucesso" : "❌ Falha") . "</li>";
echo "</ul>";

if ($resultado1 || $resultado2 || $resultado3) {
    echo "<div style='background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;'>";
    echo "<strong>✅ Pelo menos um email foi enviado!</strong><br>";
    echo "Verifique a caixa de entrada (e spam) de gustavo@cadernovirtual.com.br";
    echo "</div>";
} else {
    echo "<div style='background: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0;'>";
    echo "<strong>❌ Nenhum email foi enviado.</strong><br>";
    echo "Pode ser necessário configurar o servidor SMTP ou verificar as configurações de email do servidor.";
    echo "</div>";
}

echo "<h3>🔧 Método Utilizado:</h3>";
echo "<p><strong>Função mail() nativa do PHP</strong> com headers para ingressos@anysummit.com.br</p>";

echo "<p><em>Teste executado em " . date('d/m/Y H:i:s') . "</em></p>";
?>