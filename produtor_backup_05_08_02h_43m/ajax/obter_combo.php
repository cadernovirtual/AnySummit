<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Verificação de login específica para AJAX
session_start();

function verificarLoginCookie() {
    if (isset($_COOKIE['usuario_logado']) && $_COOKIE['usuario_logado'] == '1') {
        $_SESSION['usuario_logado'] = true;
        $_SESSION['usuarioid'] = $_COOKIE['usuarioid'] ?? '';
        $_SESSION['usuario_nome'] = $_COOKIE['usuario_nome'] ?? '';
        $_SESSION['usuario_email'] = $_COOKIE['usuario_email'] ?? '';
        $_SESSION['contratanteid'] = $_COOKIE['contratanteid'] ?? '';
        return true;
    }
    return false;
}

if (!isset($_SESSION['usuario_logado']) || $_SESSION['usuario_logado'] !== true) {
    if (!verificarLoginCookie()) {
        echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
        exit();
    }
}

include("../conm/conn.php");
$conn = $con;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit();
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['combo_id'])) {
    echo json_encode(['success' => false, 'message' => 'ID do combo não fornecido']);
    exit();
}

$combo_id = intval($data['combo_id']);

try {
    // Buscar dados do combo
    $sql = "SELECT * FROM ingressos WHERE id = ? AND tipo = 'combo'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $combo_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Combo não encontrado']);
        exit();
    }

    $combo = $result->fetch_assoc();
    
    // Decodificar JSON do conteúdo do combo
    if ($combo['conteudo_combo']) {
        $combo['conteudo_combo'] = json_decode($combo['conteudo_combo'], true);
    }

    echo json_encode([
        'success' => true,
        'combo' => $combo
    ]);

} catch (Exception $e) {
    error_log("Erro ao obter combo: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor'
    ]);
}

$conn->close();
?>
