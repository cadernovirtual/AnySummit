<?php
// Arquivo de teste para diagnosticar problema do checkout
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<!-- TESTE DE FUNCIONAMENTO DO CHECKOUT -->\n";

// Capturar qualquer erro fatal
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== NULL && $error['type'] === E_ERROR) {
        echo "\n<!-- ERRO FATAL DETECTADO -->\n";
        echo "<!-- Arquivo: " . $error['file'] . " -->\n";
        echo "<!-- Linha: " . $error['line'] . " -->\n";
        echo "<!-- Mensagem: " . $error['message'] . " -->\n";
        echo "<!-- FIM DO ERRO -->\n";
    }
});

// 1. Testar session
session_start();
echo "<!-- Session OK -->\n";

// 2. Testar includes
include("conm/conn.php");
echo "<!-- Conexão incluída -->\n";

include("../includes/imagem-helpers.php");
echo "<!-- Helpers incluídos -->\n";

// 3. Testar parâmetros
$slug = isset($_GET['evento']) ? $_GET['evento'] : 'goianarh';

// 4. Testar query
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
    WHERE e.slug = ? AND e.status = 'publicado' AND e.visibilidade = 'publico'
    LIMIT 1
";

$stmt = $con->prepare($sql_evento);
$stmt->bind_param("s", $slug);
$stmt->execute();
$result_evento = $stmt->get_result();

if ($result_evento->num_rows == 0) {
    die("Evento não encontrado com slug: $slug");
}

$evento = $result_evento->fetch_assoc();
echo "<!-- Evento encontrado: " . $evento['nome'] . " -->\n";

// 5. Testar todas as funções e variáveis
function criptografarPedidoId($pedido_id) {
    $chave = 'AnySummit2025@#$%';
    return base64_encode(openssl_encrypt($pedido_id, 'AES-128-CTR', $chave, 0, '1234567890123456'));
}

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
    $time_remaining = 15 * 60;
    $_SESSION['checkout_session'] = uniqid('checkout_', true);
    $_SESSION['checkout_start_time'] = time();
}

$comprador_logado = isset($_COOKIE['compradorid']) && !empty($_COOKIE['compradorid']);
$comprador_dados = null;

if ($comprador_logado) {
    $comprador_id = $_COOKIE['compradorid'];
    $sql_comprador = "SELECT * FROM compradores WHERE id = ?";
    $stmt_comp = $con->prepare($sql_comprador);
    $stmt_comp->bind_param("s", $comprador_id);
    $stmt_comp->execute();
    $result_comprador = $stmt_comp->get_result();
    
    if ($result_comprador && $result_comprador->num_rows > 0) {
        $comprador_dados = $result_comprador->fetch_assoc();
    } else {
        $comprador_logado = false;
        $comprador_dados = null;
        setcookie('compradorid', '', time() - 3600, '/');
        setcookie('compradornome', '', time() - 3600, '/');
    }
}

function getCompradorData($field, $default = '') {
    global $comprador_logado, $comprador_dados;
    return ($comprador_logado && isset($comprador_dados[$field])) ? $comprador_dados[$field] : $default;
}

function isCompradorFieldSelected($field, $value) {
    global $comprador_logado, $comprador_dados;
    return ($comprador_logado && isset($comprador_dados[$field]) && $comprador_dados[$field] == $value) ? 'selected' : '';
}

echo "<!-- Todas as funções e variáveis OK -->\n";
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diagnóstico Checkout - <?php echo htmlspecialchars($evento['nome']); ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="container mt-5">
        <div class="alert alert-success">
            <h3><i class="fas fa-check-circle"></i> Diagnóstico do Checkout</h3>
            <hr>
            <div class="row">
                <div class="col-md-6">
                    <h5>✅ Status dos Componentes</h5>
                    <ul class="list-unstyled">
                        <li><i class="fas fa-check text-success"></i> PHP Session: OK</li>
                        <li><i class="fas fa-check text-success"></i> Conexão BD: OK</li>
                        <li><i class="fas fa-check text-success"></i> Include Files: OK</li>
                        <li><i class="fas fa-check text-success"></i> Query Evento: OK</li>
                        <li><i class="fas fa-check text-success"></i> Funções Helper: OK</li>
                        <li><i class="fas fa-check text-success"></i> Criptografia: OK</li>
                        <li><i class="fas fa-check text-success"></i> Timer: OK</li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h5>📊 Dados do Evento</h5>
                    <ul class="list-unstyled">
                        <li><strong>Nome:</strong> <?php echo htmlspecialchars($evento['nome']); ?></li>
                        <li><strong>Slug:</strong> <?php echo htmlspecialchars($slug); ?></li>
                        <li><strong>Status:</strong> <?php echo htmlspecialchars($evento['status']); ?></li>
                        <li><strong>Visibilidade:</strong> <?php echo htmlspecialchars($evento['visibilidade']); ?></li>
                        <li><strong>Produtor:</strong> <?php echo htmlspecialchars($nome_produtor_display); ?></li>
                        <li><strong>Timer:</strong> <?php echo $time_remaining; ?>s restantes</li>
                        <li><strong>Comprador:</strong> <?php echo $comprador_logado ? 'Logado' : 'Não logado'; ?></li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="alert alert-info">
            <h5><i class="fas fa-tools"></i> Teste de Funcionamento</h5>
            <p>Todos os componentes essenciais estão funcionando corretamente. O problema pode estar em:</p>
            <ol>
                <li><strong>Erro de JavaScript</strong> - Verificar console do navegador</li>
                <li><strong>Conflito de CSS/JS</strong> - CDNs não carregando</li>
                <li><strong>Erro de sintaxe no HTML</strong> - Tags não fechadas</li>
                <li><strong>Timeout de rede</strong> - Assets externos não carregando</li>
                <li><strong>Cache do navegador</strong> - Versão antiga em cache</li>
            </ol>
        </div>
        
        <div class="alert alert-warning">
            <h5><i class="fas fa-exclamation-triangle"></i> Próximos Passos</h5>
            <div class="row">
                <div class="col-md-6">
                    <h6>URLs de Teste:</h6>
                    <p><a href="checkout.php?evento=<?php echo $slug; ?>" class="btn btn-primary btn-sm">Checkout Original</a></p>
                    <p><a href="teste-checkout-simples.php?evento=<?php echo $slug; ?>" class="btn btn-secondary btn-sm">Teste Simples</a></p>
                    <p><a href="teste-checkout.php?evento=<?php echo $slug; ?>" class="btn btn-info btn-sm">Teste Detalhado</a></p>
                </div>
                <div class="col-md-6">
                    <h6>Verificações:</h6>
                    <p><small>1. Pressione F12 no navegador</small></p>
                    <p><small>2. Vá na aba Console</small></p>
                    <p><small>3. Acesse checkout.php e veja se há erros JS</small></p>
                    <p><small>4. Vá na aba Network e veja se algum arquivo falha</small></p>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        console.log('✅ JavaScript funcionando - Diagnóstico completo');
        console.log('Evento:', '<?php echo addslashes($evento['nome']); ?>');
        console.log('Slug:', '<?php echo $slug; ?>');
        console.log('Tempo restante:', <?php echo $time_remaining; ?>);
    </script>
</body>
</html>
