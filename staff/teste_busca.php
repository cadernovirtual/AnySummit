<?php
include("check_login.php");
include("conm/conn.php");

header('Content-Type: text/plain; charset=utf-8');

echo "=== TESTE BUSCA EVENTO 19 ===\n\n";

$eventoid = 19; // Evento correto
$search = "091.346.246-27";
$cpf_clean = preg_replace('/[^0-9]/', '', $search);

echo "Evento ID: $eventoid\n";
echo "Busca original: $search\n";
echo "CPF limpo: $cpf_clean\n\n";

// Busca participantes no evento 19
echo "PARTICIPANTES NO EVENTO 19:\n";
$sql = "SELECT participanteid, Nome, email, CPF, celular, tipoingresso 
        FROM participantes 
        WHERE eventoid = $eventoid 
        ORDER BY Nome 
        LIMIT 10";

$result = mysqli_query($con, $sql);
if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        echo "ID: {$row['participanteid']} - {$row['Nome']} - CPF: {$row['CPF']}\n";
    }
} else {
    echo "Erro: " . mysqli_error($con) . "\n";
}

echo "\n";

// Teste de busca específica
echo "TESTE DE BUSCA POR CPF:\n";
$search_sql = "SELECT participanteid, Nome, email, CPF, celular, tipoingresso 
               FROM participantes 
               WHERE eventoid = $eventoid 
               AND (
                   CPF LIKE '%$search%' OR 
                   CPF = '$search' OR
                   REPLACE(REPLACE(REPLACE(CPF, '.', ''), '-', ''), ' ', '') = '$cpf_clean'
               )";

$search_result = mysqli_query($con, $search_sql);
if ($search_result) {
    if (mysqli_num_rows($search_result) > 0) {
        while ($row = mysqli_fetch_assoc($search_result)) {
            echo "ENCONTRADO: {$row['Nome']} - CPF: {$row['CPF']}\n";
        }
    } else {
        echo "Nenhum resultado encontrado para CPF: $search\n";
    }
} else {
    echo "Erro na busca: " . mysqli_error($con) . "\n";
}

mysqli_close($con);
?>
