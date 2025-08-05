<?php
// Teste para verificar se a correção do evento-publicado.php está funcionando

// Simular sessão
session_start();
$_SESSION['usuarioid'] = 18; // ID do usuário que criou o evento 49

include("conm/conn.php");

// Testar a consulta que estava causando erro
$evento_id = 49;

echo "<h2>Teste da consulta corrigida:</h2>";

$sql = "SELECT e.*, c.nome as categoria_nome 
        FROM eventos e 
        LEFT JOIN categorias_evento c ON e.categoria_id = c.id 
        WHERE e.id = ? AND e.usuario_id = ?";
        
$stmt = mysqli_prepare($con, $sql);
mysqli_stmt_bind_param($stmt, "ii", $evento_id, $_SESSION['usuarioid']);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$evento = mysqli_fetch_assoc($result);

if ($evento) {
    echo "<p style='color: green;'>✅ Consulta executada com sucesso!</p>";
    echo "<pre>";
    print_r($evento);
    echo "</pre>";
} else {
    echo "<p style='color: red;'>❌ Erro: Evento não encontrado</p>";
}

// Testar consulta de ingressos
$sql_ing = "SELECT COUNT(*) as total FROM ingressos WHERE evento_id = ?";
$stmt_ing = mysqli_prepare($con, $sql_ing);
mysqli_stmt_bind_param($stmt_ing, "i", $evento_id);
mysqli_stmt_execute($stmt_ing);
$result_ing = mysqli_stmt_get_result($stmt_ing);
$row_ing = mysqli_fetch_assoc($result_ing);

echo "<h3>Quantidade de ingressos:</h3>";
echo "<p>Total: " . $row_ing['total'] . "</p>";

// Verificar se existe erro no MySQL
if (mysqli_error($con)) {
    echo "<p style='color: red;'>Erro MySQL: " . mysqli_error($con) . "</p>";
} else {
    echo "<p style='color: green;'>✅ Nenhum erro MySQL detectado</p>";
}

echo "<hr>";
echo "<h3>Link para testar:</h3>";
echo "<a href='evento-publicado.php?eventoid=49' target='_blank'>Testar evento-publicado.php?eventoid=49</a>";
?>