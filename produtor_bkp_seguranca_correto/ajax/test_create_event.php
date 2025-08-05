<?php
/**
 * Debug para testar criação de evento
 */
session_start();
require_once '../conm/conn.php';

header('Content-Type: application/json; charset=utf-8');

// Verificar sessão
$usuario_id = $_SESSION['usuarioid'] ?? null;
$contratante_id = $_SESSION['contratanteid'] ?? null;

if (!$usuario_id) {
    echo json_encode(['erro' => 'Usuário não autenticado', 'session' => $_SESSION]);
    exit;
}

// Tentar criar evento de teste
$nome_temp = "Teste - " . date('d/m/Y H:i:s');
$slug_temp = "teste-" . $usuario_id . "-" . time();

$sql = "INSERT INTO eventos (
            usuario_id, 
            contratante_id, 
            nome, 
            slug, 
            status, 
            criado_em,
            data_inicio
        ) VALUES (?, ?, ?, ?, 'rascunho', NOW(), NOW())";

$stmt = mysqli_prepare($con, $sql);
mysqli_stmt_bind_param($stmt, "iiss", $usuario_id, $contratante_id, $nome_temp, $slug_temp);

if (mysqli_stmt_execute($stmt)) {
    $evento_id = mysqli_insert_id($con);
    echo json_encode([
        'sucesso' => true,
        'evento_id' => $evento_id,
        'nome' => $nome_temp,
        'mensagem' => 'Evento de teste criado com sucesso!'
    ]);
} else {
    echo json_encode([
        'erro' => 'Erro ao criar evento',
        'mysql_error' => mysqli_error($con),
        'sql' => $sql
    ]);
}

mysqli_close($con);
?>