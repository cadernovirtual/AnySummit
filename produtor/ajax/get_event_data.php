<?php
include("../check_login.php");
include("../conm/conn.php");

header('Content-Type: application/json');

if (!isset($_GET['evento_id']) || !is_numeric($_GET['evento_id'])) {
    echo json_encode(['success' => false, 'message' => 'ID do evento inválido']);
    exit();
}

$evento_id = intval($_GET['evento_id']);
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

try {
    // Buscar dados completos do evento
    $sql = "SELECT 
                e.*,
                ce.nome as categoria_nome,
                CONCAT('/uploads/eventos/', e.logo) as logo_url,
                CONCAT('/uploads/eventos/', e.capa) as capa_url,
                CONCAT('/uploads/eventos/', e.imagem_fundo) as fundo_url
            FROM eventos e
            LEFT JOIN categorias_evento ce ON e.categoria_id = ce.id
            WHERE e.id = ? AND e.usuario_id = ?";
    
    $stmt = $con->prepare($sql);
    $stmt->bind_param("ii", $evento_id, $usuario_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($evento = $result->fetch_assoc()) {
        // Ajustar URLs das imagens
        $evento['logo_url'] = $evento['logo'] ? '/uploads/eventos/' . $evento['logo'] : null;
        $evento['capa_url'] = $evento['capa'] ? '/uploads/eventos/' . $evento['capa'] : null;
        $evento['fundo_url'] = $evento['imagem_fundo'] ? '/uploads/eventos/' . $evento['imagem_fundo'] : null;
        
        echo json_encode([
            'success' => true,
            'evento' => $evento
        ]);
    } else {
        echo json_encode([
            'success' => false, 
            'message' => 'Evento não encontrado ou você não tem permissão para editá-lo'
        ]);
    }

} catch (Exception $e) {
    error_log("Erro ao buscar dados do evento: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Erro interno do servidor'
    ]);
}
?>
