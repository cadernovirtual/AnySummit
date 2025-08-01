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

// Receber dados JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
    exit();
}

$evento_id = intval($data['evento_id']);
$imagem_base64 = $data['imagem_base64'];
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

// Verificar se o evento pertence ao usuário logado
$sql_check = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("ii", $evento_id, $usuario_id);
$stmt_check->execute();
$result_check = $stmt_check->get_result();

if ($result_check->num_rows == 0) {
    echo json_encode(['success' => false, 'message' => 'Evento não encontrado ou acesso negado']);
    exit();
}

// Verificar se foi enviado um arquivo
if (!isset($_FILES['imagem']) || $_FILES['imagem']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'Nenhum arquivo enviado ou erro no upload']);
    exit();
}

$file = $_FILES['imagem'];

// Validar tipo de arquivo
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($file['type'], $allowedTypes)) {
    echo json_encode(['success' => false, 'message' => 'Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP']);
    exit();
}

// Validar tamanho do arquivo (5MB)
if ($file['size'] > 5 * 1024 * 1024) {
    echo json_encode(['success' => false, 'message' => 'Arquivo muito grande. Máximo 5MB']);
    exit();
}

try {
    // Definir diretório de upload na raiz do projeto
    $uploadDir = '../../uploads/capas/';
    
    // Criar diretório se não existir
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Gerar nome único para o arquivo
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = 'evento_' . $evento_id . '_' . time() . '.' . $extension;
    $filePath = $uploadDir . $fileName;
    
    // Mover arquivo para o diretório de destino
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        // Salvar URL relativa no banco de dados
        $imageUrl = '/uploads/capas/' . $fileName;
        
        $sql_update = "UPDATE eventos SET imagem_capa = ?, atualizado_em = NOW() WHERE id = ? AND usuario_id = ?";
        $stmt_update = $conn->prepare($sql_update);
        $stmt_update->bind_param("sii", $imageUrl, $evento_id, $usuario_id);
        
        if ($stmt_update->execute()) {
            echo json_encode([
                'success' => true, 
                'message' => 'Imagem enviada com sucesso',
                'image_url' => $imageUrl
            ]);
        } else {
            // Remover arquivo se falhou ao atualizar banco
            unlink($filePath);
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar banco de dados']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao salvar arquivo']);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>
