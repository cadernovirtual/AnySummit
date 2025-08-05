<?php
session_start();
require_once('../conm/conn.php');

header('Content-Type: application/json');

// Verificar se o usuário está logado
if (!isset($_SESSION['contratanteid'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

try {
    // Buscar taxa de serviço padrão
    $sql = "SELECT taxa_servico_padrao FROM parametros LIMIT 1";
    $result = mysqli_query($con, $sql);
    
    if ($result && mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        $taxa = floatval($row['taxa_servico_padrao']);
        
        echo json_encode([
            'success' => true,
            'taxa_servico' => $taxa
        ]);
    } else {
        // Se não encontrar, retornar valor padrão
        echo json_encode([
            'success' => true,
            'taxa_servico' => 8.00
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar taxa de serviço',
        'taxa_servico' => 8.00
    ]);
}

mysqli_close($con);
?>
