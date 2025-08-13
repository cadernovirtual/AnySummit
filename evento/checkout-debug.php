<?php
// Checkout com debug step-by-step
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Função para debug
function debug_step($step, $description) {
    echo "<!-- DEBUG STEP $step: $description -->\n";
    flush();
}

debug_step(1, "Iniciando script");

try {
    debug_step(2, "Iniciando session");
    session_start();
    debug_step(2, "Session OK");
    
    debug_step(3, "Incluindo conexão");
    include("conm/conn.php");
    debug_step(3, "Conexão incluída");
    
    debug_step(4, "Testando conexão BD");
    if (!isset($con) || !$con) {
        throw new Exception("Conexão com banco falhou");
    }
    debug_step(4, "Conexão BD OK");
    
    debug_step(5, "Incluindo helpers");
    include("../includes/imagem-helpers.php");
    debug_step(5, "Helpers incluídos");
    
    debug_step(6, "Verificando parâmetros");
    $slug = isset($_GET['evento']) ? $_GET['evento'] : '';
    
    if (empty($slug)) {
        debug_step(6, "Slug vazio - usando padrão");
        $slug = 'goianarh'; // Para teste
    }
    debug_step(6, "Slug: $slug");
    
    debug_step(7, "Executando query do evento");
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
    if (!$stmt) {
        throw new Exception("Erro ao preparar query: " . $con->error);
    }
    
    $stmt->bind_param("s", $slug);
    $stmt->execute();
    $result_evento = $stmt->get_result();
    
    if ($result_evento->num_rows == 0) {
        throw new Exception("Evento não encontrado: $slug");
    }
    
    $evento = $result_evento->fetch_assoc();
    debug_step(7, "Evento encontrado: " . $evento['nome']);
    
    debug_step(8, "Definindo funções");
    
    function criptografarPedidoId($pedido_id) {
        $chave = 'AnySummit2025@#$%';
        return base64_encode(openssl_encrypt($pedido_id, 'AES-128-CTR', $chave, 0, '1234567890123456'));
    }
    
    debug_step(8, "Função de criptografia OK");
    
    debug_step(9, "Configurando variáveis");
    
    $nome_produtor_display = !empty($evento['nome_exibicao']) ? $evento['nome_exibicao'] : 
                            (!empty($evento['nome_fantasia']) ? $evento['nome_fantasia'] : $evento['nome_usuario']);
    
    if (!isset($_SESSION['checkout_session'])) {
        $_SESSION['checkout_session'] = uniqid('checkout_', true);
        $_SESSION['checkout_start_time'] = time();
    }
    
    $checkout_session = $_SESSION['checkout_session'];
    $time_remaining = 15 * 60 - (time() - $_SESSION['checkout_start_time']);
    
    if ($time_remaining <= 0) {
        $_SESSION['checkout_session'] = uniqid('checkout_', true);
        $_SESSION['checkout_start_time'] = time();
        $time_remaining = 15 * 60;
    }
    
    debug_step(9, "Variáveis configuradas");
    
    debug_step(10, "Verificando comprador");
    
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
    
    debug_step(10, "Comprador: " . ($comprador_logado ? "Logado" : "Não logado"));
    
    debug_step(11, "Definindo funções helper");
    
    function getCompradorData($field, $default = '') {
        global $comprador_logado, $comprador_dados;
        return ($comprador_logado && isset($comprador_dados[$field])) ? $comprador_dados[$field] : $default;
    }
    
    function isCompradorFieldSelected($field, $value) {
        global $comprador_logado, $comprador_dados;
        return ($comprador_logado && isset($comprador_dados[$field]) && $comprador_dados[$field] == $value) ? 'selected' : '';
    }
    
    debug_step(11, "Funções helper OK");
    
    debug_step(12, "Iniciando HTML");
    
} catch (Exception $e) {
    echo "<!-- ERRO FATAL: " . $e->getMessage() . " -->\n";
    echo "<!-- LINHA: " . $e->getLine() . " -->\n";
    echo "<!-- ARQUIVO: " . $e->getFile() . " -->\n";
    die("<div style='background: red; color: white; padding: 20px; font-family: monospace;'>
        <h2>ERRO DETECTADO</h2>
        <p><strong>Mensagem:</strong> " . htmlspecialchars($e->getMessage()) . "</p>
        <p><strong>Linha:</strong> " . $e->getLine() . "</p>
        <p><strong>Arquivo:</strong> " . htmlspecialchars($e->getFile()) . "</p>
    </div>");
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout Debug - <?php echo htmlspecialchars($evento['nome']); ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <?php debug_step(13, "HTML head carregado"); ?>
    
    <div class="container mt-5">
        <div class="alert alert-success">
            <h3><i class="fas fa-check-circle"></i> ✅ Checkout Debug - SUCESSO!</h3>
            <p>Todos os componentes foram carregados sem erros.</p>
            
            <hr>
            
            <div class="row">
                <div class="col-md-6">
                    <h5>📊 Dados do Evento</h5>
                    <ul class="list-unstyled">
                        <li><strong>Nome:</strong> <?php echo htmlspecialchars($evento['nome']); ?></li>
                        <li><strong>Slug:</strong> <?php echo htmlspecialchars($slug); ?></li>
                        <li><strong>Produtor:</strong> <?php echo htmlspecialchars($nome_produtor_display); ?></li>
                        <li><strong>Timer:</strong> <?php echo $time_remaining; ?>s</li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h5>🔧 Status do Sistema</h5>
                    <ul class="list-unstyled">
                        <li><i class="fas fa-check text-success"></i> Session: OK</li>
                        <li><i class="fas fa-check text-success"></i> Conexão BD: OK</li>
                        <li><i class="fas fa-check text-success"></i> Query Evento: OK</li>
                        <li><i class="fas fa-check text-success"></i> Comprador: <?php echo $comprador_logado ? 'Logado' : 'Não logado'; ?></li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="alert alert-info">
            <h5>🚨 Diagnóstico do Problema</h5>
            <p>Se este arquivo funciona mas o <code>checkout.php</code> original não, o problema está em:</p>
            <ol>
                <li><strong>JavaScript</strong> - Erro de sintaxe no JS que interrompe a página</li>
                <li><strong>CSS</strong> - Erro de sintaxe no CSS que quebra o layout</li>
                <li><strong>HTML mal formado</strong> - Tags não fechadas ou aninhamento incorreto</li>
                <li><strong>Memory limit</strong> - Arquivo muito grande excedendo limite de memória</li>
            </ol>
        </div>
        
        <div class="alert alert-warning">
            <h5>🔧 Correção Recomendada</h5>
            <p>Vou agora criar uma versão corrigida do checkout.php original, aplicando as melhores práticas:</p>
            <ul>
                <li>✅ Usar prepared statements (mais seguro)</li>
                <li>✅ Separar PHP, CSS e JavaScript</li>
                <li>✅ Adicionar validação de erros</li>
                <li>✅ Otimizar o código JavaScript</li>
            </ul>
            
            <p><a href="checkout_corrigido.php?evento=<?php echo $slug; ?>" class="btn btn-success">Acessar Versão Corrigida</a></p>
        </div>
    </div>
    
    <?php debug_step(14, "HTML body carregado"); ?>
    
    <script>
        console.log('✅ JavaScript carregado com sucesso');
        console.log('Debug completo - todos os steps executados');
    </script>
    
    <?php debug_step(15, "JavaScript carregado - FIM"); ?>
</body>
</html>
