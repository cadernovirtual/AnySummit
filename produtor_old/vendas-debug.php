<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include("check_login.php");
include("conm/conn.php");

// Verificar se foi informado um evento_id
$evento_id = $_GET['eventoid'] ?? 0;

if (!$evento_id) {
    header("Location: meuseventos.php");
    exit;
}

// Pegar dados do usuário logado
$contratante_id = $_COOKIE['contratanteid'] ?? 0;
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

// Verificar se o evento pertence ao usuário
$sql_evento = "SELECT e.*, 
                     COALESCE(cat.nome, 'Sem categoria') as categoria_nome
              FROM eventos e 
              LEFT JOIN categorias_evento cat ON e.categoria_id = cat.id AND cat.ativo = 1
              WHERE e.id = ? AND e.contratante_id = ? AND e.usuario_id = ?";

$stmt = mysqli_prepare($con, $sql_evento);
if (!$stmt) {
    die("Erro na preparação da query evento: " . mysqli_error($con));
}

mysqli_stmt_bind_param($stmt, "iii", $evento_id, $contratante_id, $usuario_id);
if (!mysqli_stmt_execute($stmt)) {
    die("Erro na execução da query evento: " . mysqli_stmt_error($stmt));
}

$result = mysqli_stmt_get_result($stmt);
$evento = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

if (!$evento) {
    die("Evento não encontrado. EventoID: $evento_id, ContratanteID: $contratante_id, UsuarioID: $usuario_id");
}

// Buscar estatísticas gerais
$sql_stats = "SELECT 
                COUNT(DISTINCT p.id) as total_pedidos,
                COUNT(DISTINCT c.id) as total_compradores,
                COUNT(DISTINCT ii.id) as total_ingressos,
                COALESCE(SUM(p.valor_total), 0) as faturamento_total,
                COUNT(DISTINCT CASE WHEN p.status = 'pago' THEN p.id END) as pedidos_pagos,
                COUNT(DISTINCT CASE WHEN p.status = 'pendente' THEN p.id END) as pedidos_pendentes,
                COUNT(DISTINCT CASE WHEN p.status = 'cancelado' THEN p.id END) as pedidos_cancelados,
                COUNT(DISTINCT CASE WHEN ii.utilizado = 1 THEN ii.id END) as ingressos_utilizados
              FROM tb_pedidos p
              LEFT JOIN compradores c ON p.compradorid = c.id
              LEFT JOIN tb_ingressos_individuais ii ON p.id = ii.pedidoid
              WHERE p.eventoid = ?";

$stmt = mysqli_prepare($con, $sql_stats);
if (!$stmt) {
    die("Erro na preparação da query stats: " . mysqli_error($con));
}

mysqli_stmt_bind_param($stmt, "i", $evento_id);
if (!mysqli_stmt_execute($stmt)) {
    die("Erro na execução da query stats: " . mysqli_stmt_error($stmt));
}

$result = mysqli_stmt_get_result($stmt);
$stats = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

// Buscar pedidos com paginação
$page = $_GET['page'] ?? 1;
$limit = 15;
$offset = ($page - 1) * $limit;

$sql_pedidos = "SELECT p.*,
                       c.nome as comprador_nome,
                       c.email as comprador_email,
                       c.celular as comprador_celular,
                       c.tipo_documento,
                       (SELECT COUNT(*) FROM tb_ingressos_individuais WHERE pedidoid = p.id) as qtd_ingressos
                FROM tb_pedidos p
                LEFT JOIN compradores c ON p.compradorid = c.id
                WHERE p.eventoid = ?
                ORDER BY p.criado_em DESC
                LIMIT ? OFFSET ?";

$stmt = mysqli_prepare($con, $sql_pedidos);
if (!$stmt) {
    die("Erro na preparação da query pedidos: " . mysqli_error($con));
}

mysqli_stmt_bind_param($stmt, "iii", $evento_id, $limit, $offset);
if (!mysqli_stmt_execute($stmt)) {
    die("Erro na execução da query pedidos: " . mysqli_stmt_error($stmt));
}

$result = mysqli_stmt_get_result($stmt);
$pedidos = mysqli_fetch_all($result, MYSQLI_ASSOC);
mysqli_stmt_close($stmt);

// Contar total de pedidos para paginação
$sql_count = "SELECT COUNT(*) as total FROM tb_pedidos WHERE eventoid = ?";
$stmt = mysqli_prepare($con, $sql_count);
if (!$stmt) {
    die("Erro na preparação da query count: " . mysqli_error($con));
}

mysqli_stmt_bind_param($stmt, "i", $evento_id);
if (!mysqli_stmt_execute($stmt)) {
    die("Erro na execução da query count: " . mysqli_stmt_error($stmt));
}

$result = mysqli_stmt_get_result($stmt);
$total_count = mysqli_fetch_assoc($result)['total'];
mysqli_stmt_close($stmt);

$total_pages = ceil($total_count / $limit);

echo "Script executado com sucesso!<br>";
echo "Evento: " . $evento['nome'] . "<br>";
echo "Total de pedidos: " . $stats['total_pedidos'] . "<br>";
echo "Faturamento: R$ " . number_format($stats['faturamento_total'], 2, ',', '.') . "<br>";
echo "<br><a href='meuseventos.php'>Voltar</a>";
?>
