<?php
include("check_login.php");
include("conm/conn.php");

header('Content-Type: application/json');

try {
    $participante_id = 1;
    
    // Teste 1: Verificar se existem os participantes 2 e 4
    $test_participantes = "SELECT participanteid, Nome, email, celular, thumb FROM participantes WHERE participanteid IN (2, 4)";
    $result_p = mysqli_query($con, $test_participantes);
    $participantes_data = [];
    while ($row = mysqli_fetch_assoc($result_p)) {
        $participantes_data[] = $row;
    }
    
    // Teste 2: Verificar se existe o evento 1
    $test_evento = "SELECT id, nome FROM eventos WHERE id = 1";
    $result_e = mysqli_query($con, $test_evento);
    $evento_data = [];
    while ($row = mysqli_fetch_assoc($result_e)) {
        $evento_data[] = $row;
    }
    
    // Teste 3: Query completa com debug
    $full_sql = "
        SELECT
            pc.conexaoid,
            pc.eventoid,
            pc.participanteid1,
            pc.participanteid2,
            pc.data as data_conexao,
            e.nome as evento_nome,
            p1.Nome as nome1,
            p1.email as email1,
            p1.celular as celular1,
            p1.thumb as thumb1,
            p2.Nome as nome2,
            p2.email as email2,
            p2.celular as celular2,
            p2.thumb as thumb2
        FROM participante_conexao pc
        INNER JOIN eventos e ON pc.eventoid = e.id
        INNER JOIN participantes p1 ON pc.participanteid1 = p1.participanteid
        INNER JOIN participantes p2 ON pc.participanteid2 = p2.participanteid
        WHERE (pc.participanteid1 = 1 OR pc.participanteid2 = 1)
    ";
    
    $result_full = mysqli_query($con, $full_sql);
    $full_data = [];
    
    if ($result_full) {
        while ($row = mysqli_fetch_assoc($result_full)) {
            $full_data[] = $row;
        }
    } else {
        $full_data = ['erro' => mysqli_error($con)];
    }
    
    echo json_encode([
        'participantes_encontrados' => count($participantes_data),
        'participantes_data' => $participantes_data,
        'evento_encontrado' => count($evento_data),
        'evento_data' => $evento_data,
        'query_completa_resultados' => count($full_data),
        'query_completa_data' => $full_data,
        'sql_usado' => $full_sql
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    echo json_encode([
        'erro' => $e->getMessage()
    ]);
}

mysqli_close($con);
?>
