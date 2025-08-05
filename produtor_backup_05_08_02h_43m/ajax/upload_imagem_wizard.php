<?php
// API para upload de imagens do wizard
// AnySummit - Sistema de Gestão de Eventos

// Desabilitar saída de erros diretos para não quebrar JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Buffer de saída para garantir resposta JSON limpa
ob_start();

// Função para enviar resposta JSON e sair
function sendResponse($data) {
    // Limpar qualquer saída anterior
    ob_clean();
    
    // Definir header JSON
    header('Content-Type: application/json; charset=utf-8');
    
    // Enviar resposta
    echo json_encode($data);
    exit;
}

// Incluir configuração/conexão se necessário
@include_once("../../conm/conn.php");

// Configurações de upload
$baseDir = dirname(dirname(dirname(__FILE__))); // Subir 2 níveis
$uploadDir = $baseDir . '/uploads/eventos/';
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
$maxSize = 5 * 1024 * 1024; // 5MB

// Debug - verificar se chegou requisição
file_put_contents('../debug_upload.txt', 
    date('Y-m-d H:i:s') . " - Upload requisitado\n" .
    "POST: " . print_r($_POST, true) . "\n" .
    "FILES: " . print_r($_FILES, true) . "\n\n",
    FILE_APPEND
);

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['success' => false, 'message' => 'Método não permitido']);
}

// Verificar se foi enviado arquivo
if (!isset($_FILES['imagem'])) {
    sendResponse(['success' => false, 'message' => 'Nenhum arquivo enviado']);
}

if ($_FILES['imagem']['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
        UPLOAD_ERR_INI_SIZE => 'Arquivo muito grande (limite PHP)',
        UPLOAD_ERR_FORM_SIZE => 'Arquivo muito grande (limite formulário)',
        UPLOAD_ERR_PARTIAL => 'Upload parcial',
        UPLOAD_ERR_NO_FILE => 'Nenhum arquivo',
        UPLOAD_ERR_NO_TMP_DIR => 'Pasta temporária ausente',
        UPLOAD_ERR_CANT_WRITE => 'Falha ao escrever',
        UPLOAD_ERR_EXTENSION => 'Upload bloqueado por extensão'
    ];
    
    $errorCode = $_FILES['imagem']['error'];
    $errorMsg = $errorMessages[$errorCode] ?? 'Erro desconhecido: ' . $errorCode;
    
    sendResponse(['success' => false, 'message' => $errorMsg]);
}

$file = $_FILES['imagem'];
$tipo = $_POST['tipo'] ?? 'geral'; // logo, capa, fundo

// Validar tipo de arquivo
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    sendResponse([
        'success' => false, 
        'message' => 'Tipo de arquivo não permitido: ' . $mimeType
    ]);
}

// Validar tamanho
if ($file['size'] > $maxSize) {
    sendResponse([
        'success' => false, 
        'message' => 'Arquivo muito grande (máximo 5MB). Tamanho: ' . round($file['size'] / 1024 / 1024, 2) . 'MB'
    ]);
}

// Criar diretório se não existir
if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0777, true)) {
        sendResponse([
            'success' => false, 
            'message' => 'Erro ao criar diretório de upload'
        ]);
    }
}

// Verificar se diretório é gravável
if (!is_writable($uploadDir)) {
    sendResponse([
        'success' => false, 
        'message' => 'Diretório de upload sem permissão de escrita'
    ]);
}

// Gerar nome único para o arquivo
$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$newFileName = $tipo . '_' . uniqid() . '_' . time() . '.' . $extension;
$uploadPath = $uploadDir . $newFileName;

// Debug - tentar mover arquivo
file_put_contents('../debug_upload.txt', 
    "Tentando mover de: " . $file['tmp_name'] . "\n" .
    "Para: " . $uploadPath . "\n\n",
    FILE_APPEND
);

// Mover arquivo
if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
    // Retornar URL relativa
    $imageUrl = '/uploads/eventos/' . $newFileName;
    
    // Debug - sucesso
    file_put_contents('../debug_upload.txt', 
        "Upload realizado com sucesso: " . $imageUrl . "\n\n",
        FILE_APPEND
    );
    
    sendResponse([
        'success' => true,
        'image_url' => $imageUrl,
        'tipo' => $tipo,
        'filename' => $newFileName,
        'message' => 'Upload realizado com sucesso'
    ]);
} else {
    // Verificar erro específico
    $error = error_get_last();
    $errorMsg = $error ? $error['message'] : 'Erro desconhecido ao mover arquivo';
    
    sendResponse([
        'success' => false, 
        'message' => 'Erro ao mover arquivo: ' . $errorMsg
    ]);
}

// Fallback - não deveria chegar aqui
sendResponse(['success' => false, 'message' => 'Erro inesperado']);
?>