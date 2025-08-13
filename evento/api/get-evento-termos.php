<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

include("../conm/conn.php");

try {
    // Verificar se o slug foi fornecido
    $slug = isset($_GET['evento']) ? trim($_GET['evento']) : '';
    
    if (empty($slug)) {
        echo json_encode([
            'success' => false,
            'message' => 'Slug do evento não fornecido'
        ]);
        exit;
    }
    
    // Buscar os termos e políticas do evento
    $sql = "SELECT termos, politicas FROM eventos WHERE slug = ? AND status = 'publicado' LIMIT 1";
    $stmt = $con->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Erro ao preparar consulta: " . $con->error);
    }
    
    $stmt->bind_param("s", $slug);
    
    if (!$stmt->execute()) {
        throw new Exception("Erro ao executar consulta: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Evento não encontrado'
        ]);
        exit;
    }
    
    $evento = $result->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'termos' => $evento['termos'],
        'politicas' => $evento['politicas']
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao buscar termos do evento: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor'
    ]);
}
?>
