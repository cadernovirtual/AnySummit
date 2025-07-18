<?php
include("check_login.php");
include("conm/conn.php");

header('Content-Type: application/json');

try {
    // Força o participante ID = 1 para teste
    $participante_id = 1;
    
    echo json_encode([
        'debug' => 'Teste inicial',
        'participante_id' => $participante_id,
        'session' => $_SESSION,
        'cookies' => $_COOKIE
    ]);
    
    // Query simples para teste
    $test_sql = "SELECT * FROM participante_conexao WHERE participanteid1 = ? OR participanteid2 = ?";
    $test_stmt = mysqli_prepare($con, $test_sql);
    
    if ($test_stmt) {
        mysqli_stmt_bind_param($test_stmt, "ii", $participante_id, $participante_id);
        mysqli_stmt_execute($test_stmt);
        $test_result = mysqli_stmt_get_result($test_stmt);
        
        $test_data = [];
        while ($row = mysqli_fetch_assoc($test_result)) {
            $test_data[] = $row;
        }
        
        echo json_encode([
            'debug' => 'Query teste executada',
            'participante_id' => $participante_id,
            'total_encontrado' => count($test_data),
            'dados' => $test_data
        ]);
        
        mysqli_stmt_close($test_stmt);
    } else {
        echo json_encode([
            'erro' => 'Falha ao preparar query de teste',
            'mysql_error' => mysqli_error($con)
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'erro' => $e->getMessage(),
        'debug' => 'Erro capturado'
    ]);
}

mysqli_close($con);
?>
