<?php
echo "<h1>Teste de URLs - AnySummit</h1>";

// Verificar evento no banco
include("conm/conn.php");

$sql = "SELECT id, nome, slug, status FROM eventos WHERE slug = 'evento' LIMIT 1";
$result = mysqli_query($con, $sql);
$evento = mysqli_fetch_assoc($result);

echo "<h2>1. Dados do Evento:</h2>";
if ($evento) {
    echo "✅ Evento encontrado no banco:<br>";
    echo "- ID: " . $evento['id'] . "<br>";
    echo "- Nome: " . $evento['nome'] . "<br>";
    echo "- Slug: " . $evento['slug'] . "<br>";
    echo "- Status: " . $evento['status'] . "<br>";
} else {
    echo "❌ Evento com slug 'evento' não encontrado<br>";
}

echo "<h2>2. URLs Corretas para Testar:</h2>";

// URLs corretas
echo "<h3>✅ URLs que DEVEM funcionar:</h3>";
echo "1. <a href='/evento/evento' target='_blank'>Página do evento (URL amigável)</a><br>";
echo "2. <a href='/evento/index.php?slug=evento' target='_blank'>Página do evento (parâmetro direto)</a><br>";
echo "3. <a href='/produtor/meuseventos.php' target='_blank'>Meus eventos (acesso direto)</a><br>";
echo "4. <a href='/produtor/meuseventos' target='_blank'>Meus eventos (URL amigável)</a><br>";

echo "<h3>❌ URLs que NÃO funcionam (exemplos de erro):</h3>";
echo "1. /evento.php/evento (arquivo inexistente)<br>";
echo "2. /meuseventos (sem pasta produtor)<br>";

echo "<h2>3. Verificação de Arquivos:</h2>";
$arquivos_teste = [
    '/evento/index.php' => 'Página principal do evento',
    '/produtor/meuseventos.php' => 'Lista de eventos do produtor',
    '/produtor/index.php' => 'Página inicial do produtor'
];

foreach ($arquivos_teste as $arquivo => $descricao) {
    $caminho = $_SERVER['DOCUMENT_ROOT'] . $arquivo;
    if (file_exists($caminho)) {
        echo "✅ " . $arquivo . " - " . $descricao . "<br>";
    } else {
        echo "❌ " . $arquivo . " - Arquivo não encontrado<br>";
    }
}

echo "<h2>4. Configuração do .htaccess:</h2>";
$htaccess_path = $_SERVER['DOCUMENT_ROOT'] . '/.htaccess';
if (file_exists($htaccess_path)) {
    echo "✅ .htaccess existe<br>";
    $htaccess_content = file_get_contents($htaccess_path);
    
    if (strpos($htaccess_content, 'RewriteRule ^evento/([a-z0-9-]+)') !== false) {
        echo "✅ Regra para páginas de evento configurada<br>";
    } else {
        echo "❌ Regra para páginas de evento não encontrada<br>";
    }
    
    if (strpos($htaccess_content, 'RewriteEngine On') !== false) {
        echo "✅ Rewrite Engine ativo<br>";
    } else {
        echo "❌ Rewrite Engine inativo<br>";
    }
} else {
    echo "❌ .htaccess não encontrado<br>";
}

echo "<h2>5. Informações da Requisição Atual:</h2>";
echo "REQUEST_URI: " . $_SERVER['REQUEST_URI'] . "<br>";
echo "HTTP_HOST: " . $_SERVER['HTTP_HOST'] . "<br>";
echo "SCRIPT_NAME: " . $_SERVER['SCRIPT_NAME'] . "<br>";

echo "<h2>6. Próximos Passos:</h2>";
echo "<p>1. Teste a URL: <strong>https://anysummit.anysolutions.com.br/evento/evento</strong></p>";
echo "<p>2. Se não funcionar, teste: <strong>https://anysummit.anysolutions.com.br/evento/index.php?slug=evento</strong></p>";
echo "<p>3. Verifique se o .htaccess está funcionando</p>";
?>