<?php
/**
 * Verificador de Logs de Email - AnySummit
 */

// Configurar para mostrar erros
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ALL);

echo "<h1>🔍 Verificador de Logs de Email - AnySummit</h1>";

// 1. Verificar configurações de log do PHP
echo "<h2>📋 Configurações PHP de Log:</h2>";
echo "<div style='background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
echo "<strong>log_errors:</strong> " . (ini_get('log_errors') ? 'Habilitado' : 'Desabilitado') . "<br>";
echo "<strong>error_log:</strong> " . (ini_get('error_log') ?: 'Padrão do sistema') . "<br>";
echo "<strong>display_errors:</strong> " . (ini_get('display_errors') ? 'Habilitado' : 'Desabilitado') . "<br>";
echo "</div>";

// 2. Testar gravação de log
echo "<h2>🧪 Teste de Gravação de Log:</h2>";
$test_message = "TESTE LOG EMAIL - " . date('Y-m-d H:i:s') . " - IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
error_log($test_message);
echo "✅ Log de teste gravado: <code>$test_message</code><br><br>";

// 3. Verificar possíveis localizações de logs
echo "<h2>📂 Possíveis Localizações dos Logs:</h2>";

$possible_log_locations = [
    // Windows
    'C:\Windows\temp\php-errors.log',
    'C:\php\logs\php_errors.log',
    'C:\xampp\logs\php_error_log',
    
    // Logs específicos do projeto
    __DIR__ . '/error.log',
    __DIR__ . '/php_errors.log',
    __DIR__ . '/logs/error.log',
    __DIR__ . '/logs/php_errors.log',
    
    // Logs do servidor web
    $_SERVER['DOCUMENT_ROOT'] . '/error.log',
    $_SERVER['DOCUMENT_ROOT'] . '/logs/error.log',
    dirname($_SERVER['DOCUMENT_ROOT']) . '/logs/error.log',
    
    // Logs específicos de email
    __DIR__ . '/evento/logs/email.log',
    __DIR__ . '/logs/email.log',
    
    // Outros locais comuns
    sys_get_temp_dir() . '/php_errors.log',
];

foreach ($possible_log_locations as $log_path) {
    if (file_exists($log_path)) {
        $size = filesize($log_path);
        echo "✅ <strong>ENCONTRADO:</strong> <code>$log_path</code> ($size bytes)<br>";
        
        // Mostrar últimas linhas se for pequeno
        if ($size < 1024 * 1024) { // Menos de 1MB
            echo "<details><summary>📄 Últimas 10 linhas:</summary>";
            echo "<pre style='background: #f8f9fa; padding: 10px; border-radius: 5px; max-height: 300px; overflow-y: auto;'>";
            $lines = file($log_path);
            $last_lines = array_slice($lines, -10);
            echo htmlspecialchars(implode('', $last_lines));
            echo "</pre></details><br>";
        }
    } else {
        echo "❌ Não encontrado: <code>$log_path</code><br>";
    }
}

// 4. Verificar logs recentes do sistema de email
echo "<h2>📧 Logs Recentes de Email (últimas 2 horas):</h2>";

// Função para buscar logs de email
function buscarLogsEmail($log_path) {
    if (!file_exists($log_path)) {
        return [];
    }
    
    $lines = file($log_path);
    $email_logs = [];
    $duas_horas_atras = time() - (2 * 60 * 60);
    
    foreach ($lines as $line) {
        if (stripos($line, 'email') !== false || 
            stripos($line, 'smtp') !== false || 
            stripos($line, 'mail') !== false ||
            stripos($line, 'ingresso') !== false ||
            stripos($line, 'enviar') !== false) {
            
            // Tentar extrair timestamp
            if (preg_match('/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/', $line, $matches)) {
                $log_time = strtotime($matches[1]);
                if ($log_time > $duas_horas_atras) {
                    $email_logs[] = trim($line);
                }
            } else {
                // Se não conseguir extrair data, incluir mesmo assim
                $email_logs[] = trim($line);
            }
        }
    }
    
    return array_slice($email_logs, -20); // Últimas 20 entradas
}

$found_email_logs = false;
foreach ($possible_log_locations as $log_path) {
    if (file_exists($log_path)) {
        $email_logs = buscarLogsEmail($log_path);
        if (!empty($email_logs)) {
            $found_email_logs = true;
            echo "<h4>📁 Logs em: <code>$log_path</code></h4>";
            echo "<pre style='background: #f8f9fa; padding: 10px; border-radius: 5px; max-height: 400px; overflow-y: auto;'>";
            foreach ($email_logs as $log) {
                echo htmlspecialchars($log) . "\n";
            }
            echo "</pre>";
        }
    }
}

if (!$found_email_logs) {
    echo "<div style='background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px;'>";
    echo "⚠️ <strong>Nenhum log de email encontrado nas últimas 2 horas.</strong><br>";
    echo "Isso pode indicar que:<br>";
    echo "• Os emails não estão sendo enviados<br>";
    echo "• Os logs estão em outro local<br>";
    echo "• O sistema de log não está funcionando<br>";
    echo "</div>";
}

// 5. Teste direto de envio
echo "<h2>🧪 Teste Direto de Envio de Email:</h2>";
echo "<p>Vou tentar enviar um email de teste usando o mesmo sistema SMTP configurado:</p>";

// Incluir as funções de email
if (file_exists('evento/api/enviar-email-confirmacao.php')) {
    include_once('evento/api/enviar-email-confirmacao.php');
    
    $smtp_host = 'mail.anysummit.com.br';
    $smtp_port = 465;
    $smtp_user = 'ingressos@anysummit.com.br';
    $smtp_pass = 'Miran@Janyne@Gustavo';
    $from_email = 'ingressos@anysummit.com.br';
    $from_name = 'AnySummit - Teste';
    
    $email_teste = 'gustavo@cadernovirtual.com.br'; // Seu email
    $assunto_teste = 'TESTE LOG EMAIL - ' . date('Y-m-d H:i:s');
    $corpo_teste = 'Este é um teste para verificar se o sistema de email está funcionando e gravando logs corretamente.';
    
    echo "<div style='background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
    echo "📤 <strong>Enviando email de teste para:</strong> $email_teste<br>";
    echo "📧 <strong>Assunto:</strong> $assunto_teste<br>";
    echo "</div>";
    
    if (function_exists('enviarEmailSMTP')) {
        try {
            $resultado = enviarEmailSMTP(
                $email_teste,
                $assunto_teste,
                $corpo_teste,
                $smtp_host,
                $smtp_port,
                $smtp_user,
                $smtp_pass,
                $from_email,
                $from_name
            );
            
            if ($resultado === true) {
                echo "✅ <strong style='color: green;'>Email de teste enviado com sucesso!</strong><br>";
                echo "Verifique sua caixa de entrada e os logs acima.<br>";
            } else {
                echo "❌ <strong style='color: red;'>Falha no envio:</strong> $resultado<br>";
            }
        } catch (Exception $e) {
            echo "❌ <strong style='color: red;'>Erro:</strong> " . $e->getMessage() . "<br>";
        }
    } else {
        echo "❌ Função enviarEmailSMTP não encontrada<br>";
    }
} else {
    echo "❌ Arquivo de funções de email não encontrado<br>";
}

// 6. Instruções para acessar logs do servidor
echo "<h2>🖥️ Como Acessar Logs do Servidor:</h2>";
echo "<div style='background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
echo "<strong>Se estiver em servidor compartilhado (Locaweb, etc.):</strong><br>";
echo "• Acesse o painel de controle do hosting<br>";
echo "• Procure por 'Logs' ou 'Error Logs'<br>";
echo "• Verifique logs do PHP e/ou Apache<br><br>";

echo "<strong>Se estiver em servidor próprio:</strong><br>";
echo "• Windows: <code>C:\\Windows\\temp\\php-errors.log</code><br>";
echo "• Apache: <code>error.log</code> na pasta de logs do Apache<br>";
echo "• IIS: Event Viewer > Windows Logs > Application<br>";
echo "</div>";

echo "<hr>";
echo "<h2>🔧 Próximos Passos para Debug:</h2>";
echo "<ol>";
echo "<li><strong>Verifique os logs encontrados acima</strong> para erros de SMTP</li>";
echo "<li><strong>Teste o webhook N8N</strong> em <code>teste-webhook-diagnostico.php</code></li>";
echo "<li><strong>Verifique se o email chegou</strong> na caixa de teste</li>";
echo "<li><strong>Se nada funcionar:</strong> Problema pode ser na configuração SMTP do servidor</li>";
echo "</ol>";

echo "<small style='color: #666;'>Teste executado em: " . date('Y-m-d H:i:s') . "</small>";
?>
