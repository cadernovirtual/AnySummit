<?php
include("check_login.php");
include("conm/conn.php");

header('Content-Type: application/json');

try {
    // Teste 1: Ver se a tabela eventos existe e quais eventos estão lá
    $test_eventos = "SELECT * FROM eventos LIMIT 5";
    $result_eventos = mysqli_query($con, $test_eventos);
    $eventos_data = [];
    
    if ($result_eventos) {
        while ($row = mysqli_fetch_assoc($result_eventos)) {
            $eventos_data[] = $row;
        }
    } else {
        $eventos_data = ['erro' => mysqli_error($con)];
    }
    
    // Teste 2: Ver se existe uma tabela com nome diferente
    $test_tables = "SHOW TABLES LIKE '%evento%'";
    $result_tables = mysqli_query($con, $test_tables);
    $tables_data = [];
    
    if ($result_tables) {
        while ($row = mysqli_fetch_array($result_tables)) {
            $tables_data[] = $row[0];
        }
    }
    
    // Teste 3: Query sem JOIN com eventos para ver se funciona
    $test_sem_evento = "
        SELECT
            pc.conexaoid,
            pc.eventoid,
            pc.participanteid1,
            pc.participanteid2,
            pc.data as data_conexao,
            p1.Nome as nome1,
            p1.email as email1,
            p1.celular as celular1,
            p1.thumb as thumb1,
            p2.Nome as nome2,
            p2.email as email2,
            p2.celular as celular2,
            p2.thumb as thumb2
        FROM participante_conexao pc
        INNER JOIN participantes p1 ON pc.participanteid1 = p1.participanteid
        INNER JOIN participantes p2 ON pc.participanteid2 = p2.participanteid
        WHERE (pc.participanteid1 = 1 OR pc.participanteid2 = 1)
    ";
    
    $result_sem_evento = mysqli_query($con, $test_sem_evento);
    $data_sem_evento = [];
    
    if ($result_sem_evento) {
        while ($row = mysqli_fetch_assoc($result_sem_evento)) {
            $data_sem_evento[] = $row;
        }
    } else {
        $data_sem_evento = ['erro' => mysqli_error($con)];
    }
    
    echo json_encode([
        'eventos_na_tabela' => count($eventos_data),
        'eventos_data' => $eventos_data,
        'tabelas_evento_encontradas' => $tables_data,
        'query_sem_evento_resultados' => count($data_sem_evento),
        'query_sem_evento_data' => $data_sem_evento
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    echo json_encode([
        'erro' => $e->getMessage()
    ]);
}

mysqli_close($con);
?>
