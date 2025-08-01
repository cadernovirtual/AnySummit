<?php
// API simplificada sem PDO para teste
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');

// Incluir conexão antiga (mysqli)
include("../conm/conn.php");

// Verificar se tem conexão
if (!isset($con)) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro: Conexão não estabelecida'
    ]);
    exit;
}

// Receber dados
$jsonData = file_get_contents('php://input');
$dados = json_decode($jsonData, true);

if (!$dados) {
    echo json_encode([
        'success' => false,
        'message' => 'Dados inválidos'
    ]);
    exit;
}

// Pegar dados básicos
$nome = mysqli_real_escape_string($con, $dados['evento']['nome'] ?? '');
$usuario_id = $_COOKIE['usuarioid'] ?? 0;
$contratante_id = $_COOKIE['contratanteid'] ?? 0;

// Criar evento básico
$sql = "INSERT INTO eventos (
    nome, 
    usuario_id, 
    contratante_id, 
    status, 
    criado_em
) VALUES (
    '$nome',
    $usuario_id,
    $contratante_id,
    'rascunho',
    NOW()
)";

$result = mysqli_query($con, $sql);

if ($result) {
    $evento_id = mysqli_insert_id($con);
    echo json_encode([
        'success' => true,
        'message' => 'Evento criado com sucesso!',
        'data' => [
            'evento_id' => $evento_id
        ]
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao criar evento: ' . mysqli_error($con)
    ]);
}

mysqli_close($con);
?>
