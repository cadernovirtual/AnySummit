<?php
// Teste do upload de logomarca
echo "<h2>Teste do Sistema de Upload de Organizadores</h2>";

$upload_dir = '../uploads/organizadores/';
echo "<p>Diretório de upload: " . realpath($upload_dir) . "</p>";
echo "<p>Diretório existe: " . (is_dir($upload_dir) ? 'SIM' : 'NÃO') . "</p>";
echo "<p>Diretório gravável: " . (is_writable($upload_dir) ? 'SIM' : 'NÃO') . "</p>";

if (!is_dir($upload_dir)) {
    if (mkdir($upload_dir, 0755, true)) {
        echo "<p>✅ Diretório criado com sucesso!</p>";
    } else {
        echo "<p>❌ Erro ao criar diretório</p>";
    }
}

// Listar arquivos no diretório
echo "<h3>Arquivos no diretório:</h3>";
$files = scandir($upload_dir);
foreach ($files as $file) {
    if ($file != '.' && $file != '..') {
        echo "<p>📄 " . $file . "</p>";
    }
}

echo "<br><a href='organizadores_form.php'>← Voltar ao formulário</a>";
?>
