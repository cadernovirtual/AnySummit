<?php
// Habilitar exibição de erros para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "Iniciando checkout...<br>";

session_start();
echo "Session iniciada...<br>";

include("conm/conn.php");
echo "Conexão incluída...<br>";

// Verificar se existe um slug de evento na URL
$slug = isset($_GET['evento']) ? $_GET['evento'] : '';
echo "Slug: " . $slug . "<br>";

if (empty($slug)) {
    echo "Slug vazio, redirecionando...<br>";
    header('Location: /');
    exit;
}

echo "Vai buscar evento...<br>";

// Buscar dados do evento
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
echo "Query do evento executada...<br>";

if ($result_evento->num_rows == 0) {
    echo "Evento não encontrado...<br>";
    header('Location: /');
    exit;
}

$evento = $result_evento->fetch_assoc();
echo "Evento encontrado: " . $evento['nome'] . "<br>";

// Nome do produtor para exibição
$nome_produtor_display = !empty($evento['nome_exibicao']) ? $evento['nome_exibicao'] : 
                        (!empty($evento['nome_fantasia']) ? $evento['nome_fantasia'] : $evento['nome_usuario']);

echo "Produtor: " . $nome_produtor_display . "<br>";

// Gerar ID único para a sessão de compra
if (!isset($_SESSION['checkout_session'])) {
    $_SESSION['checkout_session'] = uniqid('checkout_', true);
    $_SESSION['checkout_start_time'] = time();
}

$checkout_session = $_SESSION['checkout_session'];
$time_remaining = 15 * 60 - (time() - $_SESSION['checkout_start_time']); // 15 minutos em segundos

echo "Session ID: " . $checkout_session . "<br>";
echo "Tempo restante: " . $time_remaining . "<br>";

// Se o tempo expirou, limpar sessão
if ($time_remaining <= 0) {
    echo "Tempo expirado...<br>";
    unset($_SESSION['checkout_session']);
    unset($_SESSION['checkout_start_time']);
    header('Location: /evento/' . $slug . '?expired=1');
    exit;
}

echo "Verificando comprador logado...<br>";

// Verificar se há comprador logado nos cookies
$comprador_logado = isset($_COOKIE['compradorid']) && !empty($_COOKIE['compradorid']);
$comprador_dados = null;

echo "Comprador logado: " . ($comprador_logado ? 'Sim' : 'Não') . "<br>";

if ($comprador_logado) {
    echo "Buscando dados do comprador...<br>";
    $comprador_id = $_COOKIE['compradorid'];
    $sql_comprador = "SELECT * FROM compradores WHERE id = '$comprador_id'";
    $result_comprador = $con->query($sql_comprador);
    if ($result_comprador && $result_comprador->num_rows > 0) {
        $comprador_dados = $result_comprador->fetch_assoc();
        echo "Comprador encontrado: " . $comprador_dados['nome'] . "<br>";
    } else {
        echo "Comprador não encontrado, limpando cookies...<br>";
        // Se não encontrou o comprador, considerar como não logado
        $comprador_logado = false;
        $comprador_dados = null;
        // Limpar cookies inválidos
        setcookie('compradorid', '', time() - 3600, '/');
        setcookie('compradornome', '', time() - 3600, '/');
    }
}

echo "Definindo funções helper...<br>";

// Função helper para acessar dados do comprador de forma segura
function getCompradorData($field, $default = '') {
    global $comprador_logado, $comprador_dados;
    return ($comprador_logado && isset($comprador_dados[$field])) ? $comprador_dados[$field] : $default;
}

// Função helper para verificar se campo está selecionado
function isCompradorFieldSelected($field, $value) {
    global $comprador_logado, $comprador_dados;
    return ($comprador_logado && isset($comprador_dados[$field]) && $comprador_dados[$field] == $value) ? 'selected' : '';
}

echo "Tudo funcionando até aqui! Checkout pode ser carregado.<br>";
echo "Erro deve estar no HTML/CSS ou JavaScript...<br>";
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Teste Checkout - <?php echo htmlspecialchars($evento['nome']); ?></title>
</head>
<body>
    <h1>Checkout Funcionando!</h1>
    <p>Evento: <?php echo htmlspecialchars($evento['nome']); ?></p>
    <p>Produtor: <?php echo htmlspecialchars($nome_produtor_display); ?></p>
    <p>Comprador logado: <?php echo $comprador_logado ? 'Sim' : 'Não'; ?></p>
    <?php if ($comprador_logado): ?>
    <p>Nome do comprador: <?php echo htmlspecialchars(getCompradorData('nome', 'N/A')); ?></p>
    <?php endif; ?>
</body>
</html>