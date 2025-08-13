<?php
/**
 * Monitor de Logs de Email em Tempo Real
 */

// Configurar para mostrar erros
ini_set('display_errors', 1);
error_reporting(E_ALL);

?>
<!DOCTYPE html>
<html>
<head>
    <title>Monitor de Logs - AnySummit</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .log-container { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; max-height: 500px; overflow-y: auto; }
        .error { color: red; }
        .success { color: green; }
        .info { color: blue; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>📊 Monitor de Logs de Email - AnySummit</h1>
    
    <div style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3>🔍 Como Verificar Logs de Email:</h3>
        <p><strong>1. Execute o verificador completo:</strong> <a href="verificar-logs-email.php" target="_blank">verificar-logs-email.php</a></p>
        <p><strong>2. Locais mais comuns dos logs:</strong></p>
        <ul>
            <li><strong>Windows (desenvolvimento):</strong> <code>C:\Windows\temp\php-errors.log</code></li>
            <li><strong>Servidor compartilhado:</strong> Painel de controle → Logs → Error Logs</li>
            <li><strong>Pasta do projeto:</strong> <code>/logs/error.log</code> ou <code>/error.log</code></li>
        </ul>
    </div>

    <h2>📧 Teste Imediato de Envio</h2>
    
    <?php
    if (isset($_POST['testar_email'])) {
        echo "<div class='log-container'>";
        echo "<h3>🧪 Resultado do Teste:</h3>";
        
        $email_destinatario = $_POST['email_destinatario'] ?? 'gustavo@cadernovirtual.com.br';
        
        // Incluir funções de email
        if (file_exists('evento/api/enviar-email-confirmacao.php')) {
            include_once('evento/api/enviar-email-confirmacao.php');
            
            $smtp_host = 'mail.anysummit.com.br';
            $smtp_port = 465;
            $smtp_user = 'ingressos@anysummit.com.br';
            $smtp_pass = 'Miran@Janyne@Gustavo';
            $from_email = 'ingressos@anysummit.com.br';
            $from_name = 'AnySummit - Teste Manual';
            
            $assunto = 'TESTE MANUAL LOG EMAIL - ' . date('Y-m-d H:i:s');
            $corpo = "
            <h2>Teste de Email AnySummit</h2>
            <p>Este é um teste manual para verificar:</p>
            <ul>
                <li>✅ Configuração SMTP</li>
                <li>✅ Geração de logs</li>
                <li>✅ Entrega de emails</li>
            </ul>
            <p><strong>Timestamp:</strong> " . date('Y-m-d H:i:s') . "</p>
            <p><strong>IP:</strong> " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "</p>
            ";
            
            echo "<strong>📤 Enviando para:</strong> $email_destinatario<br>";
            echo "<strong>📧 Assunto:</strong> $assunto<br><br>";
            
            if (function_exists('enviarEmailSMTP')) {
                try {
                    $resultado = enviarEmailSMTP(
                        $email_destinatario,
                        $assunto,
                        $corpo,
                        $smtp_host,
                        $smtp_port,
                        $smtp_user,
                        $smtp_pass,
                        $from_email,
                        $from_name
                    );
                    
                    if ($resultado === true) {
                        echo "<div class='success'>✅ <strong>EMAIL ENVIADO COM SUCESSO!</strong></div>";
                        echo "<p>Verifique:</p>";
                        echo "<ul>";
                        echo "<li>Caixa de entrada de $email_destinatario</li>";
                        echo "<li>Pasta de SPAM</li>";
                        echo "<li>Logs do servidor (veja instruções acima)</li>";
                        echo "</ul>";
                    } else {
                        echo "<div class='error'>❌ <strong>FALHA NO ENVIO:</strong> $resultado</div>";
                    }
                } catch (Exception $e) {
                    echo "<div class='error'>❌ <strong>ERRO:</strong> " . $e->getMessage() . "</div>";
                }
            } else {
                echo "<div class='error'>❌ Função enviarEmailSMTP não encontrada</div>";
            }
        } else {
            echo "<div class='error'>❌ Arquivo de funções não encontrado</div>";
        }
        
        echo "</div>";
    }
    ?>
    
    <form method="POST" style="background: #f8f9fa; padding: 20px; border-radius: 5px;">
        <h3>🧪 Testar Envio Manual</h3>
        <p>
            <label>Email de teste:</label><br>
            <input type="email" name="email_destinatario" value="gustavo@cadernovirtual.com.br" style="width: 300px; padding: 5px;">
        </p>
        <p>
            <button type="submit" name="testar_email" style="background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                📧 Enviar Email de Teste
            </button>
        </p>
    </form>

    <h2>🔧 Comandos para Verificar Logs no Servidor</h2>
    <div class="log-container">
        <h3>Windows (se for desenvolvimento local):</h3>
        <code>type C:\Windows\temp\php-errors.log | findstr /i "email smtp mail ingresso"</code>
        
        <h3>Linux (se for servidor):</h3>
        <code>tail -f /var/log/apache2/error.log | grep -i "email\|smtp\|mail"</code><br>
        <code>tail -f /var/log/php_errors.log | grep -i "email\|smtp\|mail"</code>
        
        <h3>Painel de Controle (Locaweb, cPanel, etc.):</h3>
        <p>Acesse: <strong>Logs → Error Logs → PHP Errors</strong></p>
        <p>Procure por: <strong>email, smtp, mail, ingresso, enviar</strong></p>
    </div>

    <h2>❓ Se os Emails Não Estão Chegando</h2>
    <div style="background: #fff3cd; padding: 15px; border-radius: 5px;">
        <h3>Possíveis Causas:</h3>
        <ol>
            <li><strong>Webhook N8N quebrado:</strong> Execute <a href="teste-webhook-diagnostico.php">teste-webhook-diagnostico.php</a></li>
            <li><strong>SMTP bloqueado:</strong> Servidor pode estar bloqueando conexões SMTP</li>
            <li><strong>Credenciais incorretas:</strong> Login/senha do SMTP podem ter mudado</li>
            <li><strong>Firewall:</strong> Porta 465 pode estar bloqueada</li>
            <li><strong>Spam:</strong> Emails podem estar indo para SPAM</li>
            <li><strong>DNS/SPF:</strong> Configuração de autenticação de email</li>
        </ol>
    </div>

    <h2>🚨 Debug Urgente</h2>
    <div style="background: #f8d7da; padding: 15px; border-radius: 5px;">
        <p><strong>Se NADA funcionar, teste isto:</strong></p>
        <ol>
            <li>Execute o teste acima e veja se gera algum erro</li>
            <li>Verifique se a função <code>mail()</code> está habilitada: <a href="?phpinfo=1">Ver phpinfo()</a></li>
            <li>Teste uma API de email externa (SendGrid, etc.)</li>
            <li>Entre em contato com o provedor de hospedagem</li>
        </ol>
    </div>

    <?php if (isset($_GET['phpinfo'])): ?>
    <h2>📋 Informações PHP</h2>
    <div class="log-container">
        <?php
        ob_start();
        phpinfo();
        $phpinfo = ob_get_clean();
        
        // Extrair apenas informações relevantes sobre email
        preg_match_all('/mail\..*?<\/tr>/is', $phpinfo, $matches);
        foreach ($matches[0] as $match) {
            echo $match;
        }
        ?>
    </div>
    <?php endif; ?>

    <script>
        // Auto-refresh a cada 30 segundos se houver logs sendo monitorados
        setTimeout(function() {
            if (document.querySelector('.log-container')) {
                console.log('Logs encontrados - considerando auto-refresh');
            }
        }, 30000);
    </script>

</body>
</html>
