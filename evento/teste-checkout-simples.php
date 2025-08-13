<?php
// Versão simplificada do checkout para identificar erro
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Verificar se funciona até aqui
echo "Início do script...<br>";

session_start();
echo "Session OK<br>";

include("conm/conn.php");
echo "Conexão incluída<br>";

include("../includes/imagem-helpers.php");
echo "Helpers incluídos<br>";

// Verificar parâmetros
$slug = isset($_GET['evento']) ? $_GET['evento'] : '';
echo "Slug: $slug<br>";

if (empty($slug)) {
    die("Slug vazio!");
}

// Query do evento
$sql_evento = "
    SELECT 
        e.*,
        u.nome as nome_usuario,
        u.nome_exibicao,
        c.nome_fantasia,
        c.razao_social
    FROM eventos e
    LEFT JOIN usuarios u ON e.usuario_id = u.id
    LEFT JOIN contratantes c ON e.contratante_id = c.id
    WHERE e.slug = '$slug' AND e.status = 'publicado' AND e.visibilidade = 'publico'
    LIMIT 1
";

$result_evento = $con->query($sql_evento);
echo "Query executada<br>";

if ($result_evento->num_rows == 0) {
    die("Evento não encontrado!");
}

$evento = $result_evento->fetch_assoc();
echo "Evento encontrado: " . $evento['nome'] . "<br>";

// Funções de criptografia
function criptografarPedidoId($pedido_id) {
    $chave = 'AnySummit2025@#$%';
    return base64_encode(openssl_encrypt($pedido_id, 'AES-128-CTR', $chave, 0, '1234567890123456'));
}
echo "Função criada<br>";

// Resto da lógica
$nome_produtor_display = !empty($evento['nome_exibicao']) ? $evento['nome_exibicao'] : 
                        (!empty($evento['nome_fantasia']) ? $evento['nome_fantasia'] : $evento['nome_usuario']);

if (!isset($_SESSION['checkout_session'])) {
    $_SESSION['checkout_session'] = uniqid('checkout_', true);
    $_SESSION['checkout_start_time'] = time();
}

$checkout_session = $_SESSION['checkout_session'];
$time_remaining = 15 * 60 - (time() - $_SESSION['checkout_start_time']);

if ($time_remaining <= 0) {
    unset($_SESSION['checkout_session']);
    unset($_SESSION['checkout_start_time']);
    header('Location: /evento/' . $slug . '?expired=1');
    exit;
}

echo "Timer OK: $time_remaining segundos restantes<br>";

// Verificar comprador
$comprador_logado = isset($_COOKIE['compradorid']) && !empty($_COOKIE['compradorid']);
$comprador_dados = null;

if ($comprador_logado) {
    $comprador_id = $_COOKIE['compradorid'];
    $sql_comprador = "SELECT * FROM compradores WHERE id = '$comprador_id'";
    $result_comprador = $con->query($sql_comprador);
    if ($result_comprador && $result_comprador->num_rows > 0) {
        $comprador_dados = $result_comprador->fetch_assoc();
    } else {
        $comprador_logado = false;
        $comprador_dados = null;
        setcookie('compradorid', '', time() - 3600, '/');
        setcookie('compradornome', '', time() - 3600, '/');
    }
}

echo "Comprador logado: " . ($comprador_logado ? 'Sim' : 'Não') . "<br>";

// Funções helper
function getCompradorData($field, $default = '') {
    global $comprador_logado, $comprador_dados;
    return ($comprador_logado && isset($comprador_dados[$field])) ? $comprador_dados[$field] : $default;
}

function isCompradorFieldSelected($field, $value) {
    global $comprador_logado, $comprador_dados;
    return ($comprador_logado && isset($comprador_dados[$field]) && $comprador_dados[$field] == $value) ? 'selected' : '';
}

echo "Funções helper criadas<br>";

echo "<br>✅ TUDO OK ATÉ AQUI!<br>";
echo "<br><strong>Próximo passo:</strong> HTML será renderizado...<br><br>";
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste Checkout - <?php echo htmlspecialchars($evento['nome']); ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <div class="alert alert-success">
            <h4>✅ Checkout Funcionando!</h4>
            <p><strong>Evento:</strong> <?php echo htmlspecialchars($evento['nome']); ?></p>
            <p><strong>Slug:</strong> <?php echo htmlspecialchars($slug); ?></p>
            <p><strong>Produtor:</strong> <?php echo htmlspecialchars($nome_produtor_display); ?></p>
            <p><strong>Tempo restante:</strong> <?php echo $time_remaining; ?> segundos</p>
            <p><strong>Comprador logado:</strong> <?php echo $comprador_logado ? 'Sim' : 'Não'; ?></p>
        </div>
        
        <div class="alert alert-info">
            <h5>Teste de URL</h5>
            <p>Para testar o checkout completo, acesse:</p>
            <p><a href="checkout.php?evento=<?php echo urlencode($slug); ?>" class="btn btn-primary">Checkout Original</a></p>
            <p><strong>URL:</strong> <code>checkout.php?evento=<?php echo $slug; ?></code></p>
        </div>
    </div>
</body>
</html>
