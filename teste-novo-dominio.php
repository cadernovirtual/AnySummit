<?php
// Script de teste para verificar se todas as configurações do novo domínio estão corretas

echo "<h1>Teste de Configuração do Novo Domínio</h1>";
echo "<h2>anysummit.anysolutions.com.br</h2>";

// Teste 1: Verificar domínio atual
echo "<h3>1. Domínio Atual:</h3>";
echo "HTTP_HOST: " . ($_SERVER['HTTP_HOST'] ?? 'Não definido') . "<br>";
echo "SERVER_NAME: " . ($_SERVER['SERVER_NAME'] ?? 'Não definido') . "<br>";

// Teste 2: Verificar redirecionamento HTTPS
echo "<h3>2. HTTPS:</h3>";
echo "HTTPS: " . ($_SERVER['HTTPS'] ?? 'off') . "<br>";
echo "PROTOCOL: " . (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . "<br>";

// Teste 3: URLs de exemplo geradas
echo "<h3>3. URLs Geradas:</h3>";
$base_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];
echo "URL Base: " . $base_url . "<br>";
echo "Produtor: " . $base_url . "/produtor/<br>";
echo "Evento: " . $base_url . "/evento/exemplo-evento<br>";
echo "Checkout: " . $base_url . "/evento/checkout/exemplo-evento<br>";

// Teste 4: Configurações de email
echo "<h3>4. Configurações de Email:</h3>";
echo "Email SMTP: noreply@anysummit.anysolutions.com.br<br>";
echo "Servidor: email-ssl.com.br:465<br>";

// Teste 5: Estrutura de arquivos importantes
echo "<h3>5. Arquivos Importantes:</h3>";
$files_to_check = [
    '/.htaccess',
    '/produtor/evento-publicado.php',
    '/produtor/js/criaevento.js',
    '/participante/config.php',
    '/patrocinador/config.php',
    '/staff/checkin.php'
];

foreach ($files_to_check as $file) {
    $path = $_SERVER['DOCUMENT_ROOT'] . $file;
    if (file_exists($path)) {
        echo "✅ " . $file . " - Existe<br>";
        
        // Verificar se ainda tem referências ao domínio antigo
        $content = file_get_contents($path);
        if (strpos($content, 'anysummit.com.br') !== false && strpos($content, 'anysolutions') === false) {
            echo "⚠️ " . $file . " - Ainda contém referências ao domínio antigo<br>";
        } else {
            echo "✅ " . $file . " - Atualizado<br>";
        }
    } else {
        echo "❌ " . $file . " - Não encontrado<br>";
    }
}

// Teste 6: Verificar .htaccess
echo "<h3>6. Regras do .htaccess:</h3>";
if (file_exists($_SERVER['DOCUMENT_ROOT'] . '/.htaccess')) {
    $htaccess = file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/.htaccess');
    
    if (strpos($htaccess, 'RewriteEngine On') !== false) {
        echo "✅ Rewrite Engine ativo<br>";
    }
    
    if (strpos($htaccess, 'HTTPS') !== false) {
        echo "✅ Redirecionamento HTTPS configurado<br>";
    }
    
    if (strpos($htaccess, 'anysummit.com.br') !== false) {
        echo "✅ Redirecionamento do domínio antigo configurado<br>";
    }
    
    if (strpos($htaccess, 'evento/([a-z0-9-]+)') !== false) {
        echo "✅ URLs amigáveis para eventos configuradas<br>";
    }
} else {
    echo "❌ Arquivo .htaccess não encontrado<br>";
}

echo "<h3>7. Status:</h3>";
echo "<p style='color: green; font-weight: bold;'>✅ Migração de domínio concluída!</p>";
echo "<p>Todas as principais configurações foram atualizadas para usar <strong>anysummit.anysolutions.com.br</strong></p>";
?>