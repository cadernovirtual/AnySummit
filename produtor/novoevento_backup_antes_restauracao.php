<?php
include("check_login.php");
include("conm/conn.php");

// Buscar dados do usuário
$usuario_id = $_SESSION['usuarioid'] ?? $_COOKIE['usuarioid'] ?? 0;
$stmt = $con->prepare("SELECT * FROM usuarios WHERE id = ?");
$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$usuario = $stmt->get_result()->fetch_assoc();

// Buscar contratantes do usuário  
$sql_contratantes = "SELECT id, razao_social FROM contratantes WHERE usuario_id = ? ORDER BY razao_social";
$stmt_contratantes = $con->prepare($sql_contratantes);
$stmt_contratantes->bind_param("i", $usuario_id);
$stmt_contratantes->execute();
$result_contratantes = $stmt_contratantes->get_result();
$contratantes = [];
while ($row = mysqli_fetch_assoc($result_contratantes)) {
    $contratantes[] = $row;
}

// Buscar categorias ativas
$sql_categorias = "SELECT id, nome FROM categorias_evento WHERE ativo = 1 ORDER BY nome";
$result_categorias = mysqli_query($con, $sql_categorias);
$categorias = [];
while ($row = mysqli_fetch_assoc($result_categorias)) {
    $categorias[] = $row;
}

// Buscar parâmetros de termos e políticas
$sql_parametros = "SELECT politicas_eventos_default, termos_eventos_default FROM parametros LIMIT 1";
$result_parametros = mysqli_query($con, $sql_parametros);
$parametros = mysqli_fetch_assoc($result_parametros) ?: [
    'politicas_eventos_default' => 'Políticas de Privacidade não configuradas.',
    'termos_eventos_default' => 'Termos de Uso não configurados.'
];
?>