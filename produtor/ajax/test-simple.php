<?php
header('Content-Type: text/html; charset=utf-8');
echo "<h2>🔍 Teste de Conectividade AJAX</h2>";

echo "<p><strong>1. GET Parameters:</strong></p>";
echo "ID: " . ($_GET['id'] ?? 'não enviado') . "<br>";

echo "<p><strong>2. Session/Cookie Test:</strong></p>";
session_start();
echo "Session logado: " . ($_SESSION['usuario_logado'] ?? 'não definido') . "<br>";
echo "Cookie logado: " . ($_COOKIE['usuario_logado'] ?? 'não definido') . "<br>";
echo "Usuario ID (cookie): " . ($_COOKIE['usuarioid'] ?? 'não definido') . "<br>";
echo "Contratante ID (cookie): " . ($_COOKIE['contratanteid'] ?? 'não definido') . "<br>";

echo "<p><strong>3. Include Test:</strong></p>";
try {
    include("../check_login.php");
    echo "✅ check_login.php incluído com sucesso<br>";
} catch (Exception $e) {
    echo "❌ Erro ao incluir check_login.php: " . $e->getMessage() . "<br>";
    exit;
}

try {
    include("../conm/conn.php");
    echo "✅ conn.php incluído com sucesso<br>";
} catch (Exception $e) {
    echo "❌ Erro ao incluir conn.php: " . $e->getMessage() . "<br>";
    exit;
}

echo "<p><strong>4. Database Test:</strong></p>";
if (isset($con) && $con) {
    echo "✅ Conexão com database estabelecida<br>";
    
    // Teste simples de query
    $test_query = "SELECT COUNT(*) as total FROM tb_pedidos LIMIT 1";
    $result = mysqli_query($con, $test_query);
    if ($result) {
        echo "✅ Query de teste executada com sucesso<br>";
    } else {
        echo "❌ Erro na query de teste: " . mysqli_error($con) . "<br>";
    }
} else {
    echo "❌ Sem conexão com database<br>";
}

echo "<p><strong>5. Resultado:</strong></p>";
echo "📄 Arquivo AJAX funcionando corretamente até aqui<br>";

echo "<hr>";
echo "<p><em>Este é um arquivo de teste. Se você consegue ver esta mensagem, o problema não está na comunicação básica AJAX.</em></p>";
?>
