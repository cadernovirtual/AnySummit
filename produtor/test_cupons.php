<?php
// Teste rápido de cupons
include("check_login.php");
include("conm/conn.php");

$evento_id = 57;
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

echo "Evento ID: $evento_id<br>";
echo "Usuario ID: $usuario_id<br>";

// Testar conexão
if (mysqli_ping($con)) {
    echo "Conexão OK<br>";
} else {
    echo "Erro na conexão: " . mysqli_error($con) . "<br>";
}

// Verificar se evento existe
$sql_evento = "SELECT e.nome FROM eventos e WHERE e.id = ? AND e.usuario_id = ?";
$stmt_evento = mysqli_prepare($con, $sql_evento);
if ($stmt_evento) {
    mysqli_stmt_bind_param($stmt_evento, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt_evento);
    $result = mysqli_stmt_get_result($stmt_evento);
    if ($evento = mysqli_fetch_assoc($result)) {
        echo "Evento encontrado: " . $evento['nome'] . "<br>";
    } else {
        echo "Evento não encontrado ou sem permissão<br>";
    }
} else {
    echo "Erro ao preparar query: " . mysqli_error($con) . "<br>";
}

// Testar estrutura da tabela cupons
echo "<h3>Estrutura da tabela cupons:</h3>";
$sql_desc = "DESCRIBE cupons";
$result_desc = mysqli_query($con, $sql_desc);
if ($result_desc) {
    while ($row = mysqli_fetch_assoc($result_desc)) {
        echo $row['Field'] . " - " . $row['Type'] . " - " . $row['Null'] . " - " . $row['Default'] . "<br>";
    }
} else {
    echo "Erro ao descrever tabela: " . mysqli_error($con);
}
?>