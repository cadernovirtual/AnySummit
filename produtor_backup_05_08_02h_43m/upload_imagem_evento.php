<?php
// upload_imagem_evento.php
include("check_login.php");
include("conm/conn.php");

header('Content-Type: application/json');

// Verificar se foi enviado arquivo
if (!isset($_FILES['imagem']) || $_FILES['imagem']['error'] != 0) {
    echo json_encode(['success' => false, 'message' => 'Nenhum arquivo enviado']);
    exit;
}

// Verificar tipo do arquivo
$allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($_FILES['imagem']['type'], $allowed_types)) {
    echo json_encode(['success' => false, 'message' => 'Tipo de arquivo não permitido']);
    exit;
}

// Verificar tamanho (5MB)
if ($_FILES['imagem']['size'] > 5 * 1024 * 1024) {
    echo json_encode(['success' => false, 'message' => 'Arquivo muito grande (máximo 5MB)']);
    exit;
}

// Obter dados do POST
$evento_id = isset($_POST['evento_id']) ? intval($_POST['evento_id']) : 0;
$tipo_imagem = isset($_POST['tipo']) ? $_POST['tipo'] : '';

// Validar tipo de imagem
$tipos_validos = ['logo', 'capa', 'fundo'];
if (!in_array($tipo_imagem, $tipos_validos)) {
    echo json_encode(['success' => false, 'message' => 'Tipo de imagem inválido']);
    exit;
}

// Criar diretório se não existir
$upload_dir = '../uploads/capas/';
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Gerar nome do arquivo
$timestamp = time();
$ext = pathinfo($_FILES['imagem']['name'], PATHINFO_EXTENSION);
$filename = "EVENTO_{$evento_id}_" . strtoupper($tipo_imagem) . "_{$timestamp}.{$ext}";
$filepath = $upload_dir . $filename;

// Se evento_id > 0, buscar e deletar imagem antiga
if ($evento_id > 0) {
    // Buscar imagem antiga no banco
    $campo_db = '';
    switch($tipo_imagem) {
        case 'logo':
            $campo_db = 'logo_evento';
            break;
        case 'capa':
            $campo_db = 'imagem_capa';
            break;
        case 'fundo':
            $campo_db = 'imagem_fundo';
            break;
    }
    
    if ($campo_db) {
        $sql = "SELECT $campo_db FROM eventos WHERE id = ?";
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, "i", $evento_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if ($row = mysqli_fetch_assoc($result)) {
            $old_image = $row[$campo_db];
            if ($old_image && file_exists($upload_dir . $old_image)) {
                unlink($upload_dir . $old_image);
            }
        }
        mysqli_stmt_close($stmt);
    }
}

// Mover arquivo
if (move_uploaded_file($_FILES['imagem']['tmp_name'], $filepath)) {
    // Se evento_id > 0, atualizar no banco
    if ($evento_id > 0 && $campo_db) {
        $sql = "UPDATE eventos SET $campo_db = ? WHERE id = ?";
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, "si", $filename, $evento_id);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
    }
    
    echo json_encode([
        'success' => true,
        'filename' => $filename,
        'url' => '/uploads/capas/' . $filename,
        'message' => 'Upload realizado com sucesso'
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao salvar arquivo']);
}
?>