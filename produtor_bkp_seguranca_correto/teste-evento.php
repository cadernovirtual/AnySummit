<?php
include("check_login.php");
include("conm/conn.php");

// Teste básico
echo "Login OK<br>";

// Verifica se foi fornecido um ID de evento
if (!isset($_GET['eventoid']) || empty($_GET['eventoid'])) {
    echo "Erro: ID do evento não fornecido";
    exit();
}

$evento_id = intval($_GET['eventoid']);
echo "Evento ID: " . $evento_id . "<br>";

// Busca os dados do evento
$sql_evento = "SELECT e.*, c.nome as categoria_nome 
               FROM eventos e 
               LEFT JOIN categorias_evento c ON e.categoria_id = c.id 
               WHERE e.id = ? AND e.usuario_id = ?";

$stmt_evento = $conn->prepare($sql_evento);
$stmt_evento->bind_param("ii", $evento_id, $_SESSION['user_id']);
$stmt_evento->execute();
$resultado_evento = $stmt_evento->get_result();

if ($resultado_evento->num_rows == 0) {
    echo "Erro: Evento não encontrado";
    exit();
}

$evento = $resultado_evento->fetch_assoc();
echo "Evento encontrado: " . $evento['nome'] . "<br>";

echo "Teste OK - tudo funcionando!";
?>
