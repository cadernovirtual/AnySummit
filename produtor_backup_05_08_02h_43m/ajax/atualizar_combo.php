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

error_log("Debug atualizar combo - Dados recebidos: " . print_r($data, true));

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
    exit();
}

$combo_id = intval($data['combo_id']);
$titulo = trim($data['titulo']);
$quantidade = intval($data['quantidade']);
$preco = floatval($data['preco']);
$inicio_venda = $data['inicio_venda'];
$fim_venda = $data['fim_venda'];
$descricao = trim($data['descricao'] ?? '');
$conteudo_combo = json_encode($data['conteudo_combo']);

// Calcular taxa e valor a receber
$taxa_plataforma = $preco * 0.1;
$valor_receber = $preco - $taxa_plataforma;

try {
    // Atualizar combo no banco
    $sql_update = "UPDATE ingressos SET 
                   titulo = ?, 
                   descricao = ?, 
                   quantidade_total = ?, 
                   preco = ?, 
                   taxa_plataforma = ?,
                   valor_receber = ?,
                   inicio_venda = ?, 
                   fim_venda = ?, 
                   conteudo_combo = ?,
                   atualizado_em = NOW() 
                   WHERE id = ? AND tipo = 'combo'";
    
    $stmt_update = $conn->prepare($sql_update);
    
    // Converter datas para formato MySQL
    $inicio_venda_mysql = date('Y-m-d H:i:s', strtotime($inicio_venda));
    $fim_venda_mysql = date('Y-m-d H:i:s', strtotime($fim_venda));
    
    $stmt_update->bind_param("ssiddsssi", 
        $titulo, $descricao, $quantidade, $preco, $taxa_plataforma, $valor_receber,
        $inicio_venda_mysql, $fim_venda_mysql, $conteudo_combo, $combo_id
    );
    
    if ($stmt_update->execute()) {
        if ($stmt_update->affected_rows > 0) {
            echo json_encode([
                'success' => true, 
                'message' => 'Combo atualizado com sucesso'
            ]);
        } else {
            echo json_encode([
                'success' => false, 
                'message' => 'Nenhuma alteração foi feita'
            ]);
        }
    } else {
        error_log("Debug - Erro SQL: " . $stmt_update->error);
        echo json_encode([
            'success' => false, 
            'message' => 'Erro ao atualizar combo: ' . $stmt_update->error
        ]);
    }
    
} catch (Exception $e) {
    error_log("Erro ao atualizar combo: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Erro interno: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
