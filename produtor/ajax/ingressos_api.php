<?php
/**
 * API LIMPA PARA INGRESSOS
 * Arquivo dedicado apenas para operações de ingressos
 * Garantia de JSON limpo sem contaminação
 */

// CRÍTICO: Limpar qualquer output anterior
if (ob_get_level()) {
    ob_end_clean();
}

// Iniciar novo buffer
ob_start();

// CRÍTICO: Desativar TODOS os tipos de output de erro
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 0);
error_reporting(0);

// Headers antes de qualquer output
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../conm/conn.php';
session_start();

// Verificar autenticação
if (!isset($_SESSION['usuarioid'])) {
    http_response_code(401);
    ob_clean();
    echo json_encode(['erro' => 'Usuário não autenticado']);
    exit;
}

$usuario_id = $_SESSION['usuarioid'];
$action = $_POST['action'] ?? '';

// Limpar buffer antes de processar
ob_clean();

switch ($action) {
    case 'criar_ingresso':
        criarIngresso($con, $usuario_id);
        break;
        
    case 'editar_ingresso':
        editarIngresso($con, $usuario_id);
        break;
        
    case 'excluir_ingresso':
        excluirIngresso($con, $usuario_id);
        break;
        
    case 'buscar_ingresso':
        buscarIngresso($con, $usuario_id);
        break;
        
    case 'listar_ingressos':
        listarIngressos($con, $usuario_id);
        break;
        
    default:
        http_response_code(400);
        echo json_encode(['erro' => 'Ação não reconhecida']);
        break;
}

/**
 * Criar novo ingresso
 */
function criarIngresso($con, $usuario_id) {
    $evento_id = intval($_POST['evento_id']);
    
    // Verificar se evento pertence ao usuário
    $sql = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!mysqli_fetch_assoc($result)) {
        echo json_encode(['erro' => 'Evento não encontrado']);
        return;
    }
    
    // Extrair dados
    $tipo = $_POST['tipo'] ?? 'pago';
    $titulo = $_POST['titulo'] ?? $_POST['ticketName'] ?? '';
    $descricao = $_POST['descricao'] ?? $_POST['description'] ?? '';
    $quantidade = intval($_POST['quantidade_total'] ?? $_POST['quantity'] ?? 100);
    $preco = floatval($_POST['preco'] ?? $_POST['price'] ?? 0);
    $taxa_plataforma = floatval($_POST['taxa_plataforma'] ?? 0);
    $valor_receber = floatval($_POST['valor_receber'] ?? $preco);
    $inicio_venda = $_POST['inicio_venda'] ?? $_POST['saleStart'] ?? null;
    $fim_venda = $_POST['fim_venda'] ?? $_POST['saleEnd'] ?? null;
    $limite_min = intval($_POST['limite_min'] ?? $_POST['minQuantity'] ?? 1);
    $limite_max = intval($_POST['limite_max'] ?? $_POST['maxQuantity'] ?? 5);
    $lote_id = !empty($_POST['lote_id']) ? intval($_POST['lote_id']) : null;
    
    // Validações
    if (empty($titulo)) {
        echo json_encode(['erro' => 'Título é obrigatório']);
        return;
    }
    
    if ($quantidade < 1) {
        echo json_encode(['erro' => 'Quantidade deve ser maior que zero']);
        return;
    }
    
    // Tratar combo
    $conteudo_combo = $_POST['conteudo_combo'] ?? null;
    if (!empty($conteudo_combo) && $conteudo_combo !== '') {
        // Manter como está se for JSON válido
        if (!is_string($conteudo_combo) || (!str_starts_with($conteudo_combo, '[') && !str_starts_with($conteudo_combo, '{'))) {
            $conteudo_combo = null;
        }
    } else {
        $conteudo_combo = null;
    }
    
    // INSERT
    $sql = "INSERT INTO ingressos 
            (evento_id, tipo, titulo, descricao, quantidade_total, preco, 
             taxa_plataforma, valor_receber, inicio_venda, fim_venda, 
             limite_min, limite_max, lote_id, conteudo_combo, criado_em)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "isssidddssiiis",
        $evento_id, $tipo, $titulo, $descricao, $quantidade,
        $preco, $taxa_plataforma, $valor_receber,
        $inicio_venda, $fim_venda, $limite_min, $limite_max,
        $lote_id, $conteudo_combo
    );
    
    if (mysqli_stmt_execute($stmt)) {
        $ingresso_id = mysqli_insert_id($con);
        
        // Buscar dados completos do ingresso criado
        $sql_select = "SELECT * FROM ingressos WHERE id = ?";
        $stmt_select = mysqli_prepare($con, $sql_select);
        mysqli_stmt_bind_param($stmt_select, "i", $ingresso_id);
        mysqli_stmt_execute($stmt_select);
        $result_select = mysqli_stmt_get_result($stmt_select);
        $ingresso_completo = mysqli_fetch_assoc($result_select);
        
        echo json_encode([
            'sucesso' => true,
            'ingresso_id' => $ingresso_id,
            'ingresso' => $ingresso_completo,
            'mensagem' => 'Ingresso criado com sucesso'
        ]);
    } else {
        echo json_encode(['erro' => 'Erro ao criar ingresso: ' . mysqli_error($con)]);
    }
}

/**
 * Excluir ingresso
 */
function excluirIngresso($con, $usuario_id) {
    $evento_id = intval($_POST['evento_id']);
    $ingresso_id = intval($_POST['ingresso_id']);
    
    // Verificar se evento pertence ao usuário
    $sql = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!mysqli_fetch_assoc($result)) {
        echo json_encode(['erro' => 'Evento não encontrado']);
        return;
    }
    
    // Excluir ingresso
    $sql = "DELETE FROM ingressos WHERE id = ? AND evento_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $ingresso_id, $evento_id);
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(['sucesso' => true]);
    } else {
        echo json_encode(['erro' => 'Erro ao excluir ingresso']);
    }
}

/**
 * Buscar ingresso específico
 */
function buscarIngresso($con, $usuario_id) {
    $evento_id = intval($_POST['evento_id']);
    $ingresso_id = intval($_POST['ingresso_id']);
    
    // Verificar se evento pertence ao usuário
    $sql = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!mysqli_fetch_assoc($result)) {
        echo json_encode(['erro' => 'Evento não encontrado']);
        return;
    }
    
    // Buscar ingresso
    $sql = "SELECT * FROM ingressos WHERE id = ? AND evento_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $ingresso_id, $evento_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($ingresso = mysqli_fetch_assoc($result)) {
        echo json_encode([
            'sucesso' => true,
            'ingresso' => $ingresso
        ]);
    } else {
        echo json_encode(['erro' => 'Ingresso não encontrado']);
    }
}

/**
 * Listar todos os ingressos do evento
 */
function listarIngressos($con, $usuario_id) {
    $evento_id = intval($_POST['evento_id']);
    
    // Verificar se evento pertence ao usuário
    $sql = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!mysqli_fetch_assoc($result)) {
        echo json_encode(['erro' => 'Evento não encontrado']);
        return;
    }
    
    // Buscar ingressos
    $sql = "SELECT * FROM ingressos WHERE evento_id = ? ORDER BY criado_em ASC";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "i", $evento_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $ingressos = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $ingressos[] = $row;
    }
    
    echo json_encode([
        'sucesso' => true,
        'ingressos' => $ingressos
    ]);
}

mysqli_close($con);

// Garantir que apenas JSON seja enviado
ob_end_flush();
?>
