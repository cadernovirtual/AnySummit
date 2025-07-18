<?php
// Arquivo para debug - inclua no início dos arquivos que estão dando erro
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
ini_set('log_errors', 1);

// Função para mostrar erros de forma mais clara
function mostrarErro($message, $file = '', $line = '') {
    echo "<div style='background: #ff4444; color: white; padding: 15px; margin: 10px; border-radius: 5px;'>";
    echo "<strong>ERRO DEBUG:</strong><br>";
    echo "<strong>Mensagem:</strong> " . $message . "<br>";
    if ($file) echo "<strong>Arquivo:</strong> " . $file . "<br>";
    if ($line) echo "<strong>Linha:</strong> " . $line . "<br>";
    echo "</div>";
}

// Captura erros fatais
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && $error['type'] === E_ERROR) {
        mostrarErro($error['message'], $error['file'], $error['line']);
    }
});

echo "<div style='background: #44ff44; color: black; padding: 10px; margin: 10px; border-radius: 5px;'>";
echo "<strong>DEBUG ATIVADO:</strong> Erros serão exibidos na tela";
echo "</div>";
?>
