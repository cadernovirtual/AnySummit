<?php
/**
 * Teste Simples do Email de Confirmação
 * Arquivo de teste direto para verificar erros
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug-email.log');

echo "<h1>🧪 Teste Simples - Email Confirmação</h1>";
echo "<p>Este teste roda diretamente a função sem interface.</p><hr>";

// Incluir arquivos
include("../conm/conn.php");
include("enviar-email-confirmacao.php");

$pedido_id = 43;

echo "<h3>📊 Testando Pedido ID: $pedido_id</h3>";

try {
    echo "<p>🔄 Executando enviarEmailConfirmacao($pedido_id, \$con)...</p>";
    
    $resultado = enviarEmailConfirmacao($pedido_id, $con);
    
    if ($resultado === true) {
        echo "<div style='background: green; color: white; padding: 20px; border-radius: 10px;'>";
        echo "<h2>✅ SUCESSO!</h2>";
        echo "<p>Email enviado com sucesso!</p>";
        echo "</div>";
    } else {
        echo "<div style='background: red; color: white; padding: 20px; border-radius: 10px;'>";
        echo "<h2>❌ ERRO!</h2>";
        echo "<p><strong>Detalhes:</strong> " . htmlspecialchars($resultado) . "</p>";
        echo "</div>";
    }
    
} catch (Exception $e) {
    echo "<div style='background: orange; color: white; padding: 20px; border-radius: 10px;'>";
    echo "<h2>💥 EXCEÇÃO!</h2>";
    echo "<p><strong>Mensagem:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p><strong>Arquivo:</strong> " . $e->getFile() . "</p>";
    echo "<p><strong>Linha:</strong> " . $e->getLine() . "</p>";
    echo "</div>";
}

echo "<hr>";
echo "<h3>📝 Logs de Debug:</h3>";

// Mostrar arquivo de log personalizado
$log_file = __DIR__ . '/debug-email.log';
if (file_exists($log_file)) {
    echo "<div style='background: #f8f9fa; padding: 15px; border: 1px solid #ddd; border-radius: 5px; font-family: monospace; white-space: pre-wrap;'>";
    echo htmlspecialchars(file_get_contents($log_file));
    echo "</div>";
} else {
    echo "<p style='color: orange;'>Arquivo de log não criado ainda.</p>";
}

echo "<hr>";
echo "<p><strong>Próximo passo:</strong> Se houver erro, analisar os logs acima para identificar o problema específico.</p>";
?>
