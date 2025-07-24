<?php
/**
 * Teste da funcionalidade de sincronização lotes-ingressos
 */

require_once __DIR__ . '/../evento/conm/conn.php';
require_once __DIR__ . '/sincronizar_lotes_ingressos.php';

echo "<h2>Teste de Sincronização Lotes-Ingressos</h2>\n";

// Verificar estado atual dos ingressos do lote 1
$lote_id = 1;

echo "<h3>Estado ANTES da sincronização:</h3>\n";
$sql = "SELECT i.id, i.titulo, i.inicio_venda, i.fim_venda, l.nome as lote_nome, l.tipo
        FROM ingressos i 
        INNER JOIN lotes l ON i.lote_id = l.id 
        WHERE l.id = ?";

$stmt = mysqli_prepare($con, $sql);
mysqli_stmt_bind_param($stmt, "i", $lote_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

echo "<table border='1' style='border-collapse: collapse;'>\n";
echo "<tr><th>ID Ingresso</th><th>Título</th><th>Início Venda</th><th>Fim Venda</th><th>Lote</th><th>Tipo Lote</th></tr>\n";

while ($row = mysqli_fetch_assoc($result)) {
    echo "<tr>";
    echo "<td>{$row['id']}</td>";
    echo "<td>{$row['titulo']}</td>";
    echo "<td>{$row['inicio_venda']}</td>";
    echo "<td>{$row['fim_venda']}</td>";
    echo "<td>{$row['lote_nome']}</td>";
    echo "<td>{$row['tipo']}</td>";
    echo "</tr>\n";
}
echo "</table>\n";
mysqli_stmt_close($stmt);

// Executar sincronização com novas datas
echo "<h3>Executando sincronização...</h3>\n";

$nova_data_inicio = '2025-06-15 09:00:00';
$nova_data_fim = '2025-07-15 18:00:00';

// Obter tipo do lote
$sql_tipo = "SELECT tipo FROM lotes WHERE id = ?";
$stmt_tipo = mysqli_prepare($con, $sql_tipo);
mysqli_stmt_bind_param($stmt_tipo, "i", $lote_id);
mysqli_stmt_execute($stmt_tipo);
$result_tipo = mysqli_stmt_get_result($stmt_tipo);
$lote_data = mysqli_fetch_assoc($result_tipo);
$tipo_lote = $lote_data['tipo'];
mysqli_stmt_close($stmt_tipo);

// Atualizar lote
$sql_update = "UPDATE lotes SET data_inicio = ?, data_fim = ?, atualizado_em = NOW() WHERE id = ?";
$stmt_update = mysqli_prepare($con, $sql_update);
mysqli_stmt_bind_param($stmt_update, "ssi", $nova_data_inicio, $nova_data_fim, $lote_id);

if (mysqli_stmt_execute($stmt_update)) {
    echo "<p>✅ Lote {$lote_id} atualizado com sucesso!</p>\n";
    mysqli_stmt_close($stmt_update);
    
    // Sincronizar ingressos
    $resultado = sincronizarDatasIngressos($con, $lote_id, $nova_data_inicio, $nova_data_fim, $tipo_lote);
    
    if ($resultado['sucesso']) {
        echo "<p>✅ {$resultado['mensagem']}</p>\n";
    } else {
        echo "<p>❌ {$resultado['mensagem']}</p>\n";
    }
} else {
    echo "<p>❌ Erro ao atualizar lote: " . mysqli_error($con) . "</p>\n";
    mysqli_stmt_close($stmt_update);
}

// Verificar estado após sincronização
echo "<h3>Estado APÓS a sincronização:</h3>\n";
$stmt = mysqli_prepare($con, $sql);
mysqli_stmt_bind_param($stmt, "i", $lote_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

echo "<table border='1' style='border-collapse: collapse;'>\n";
echo "<tr><th>ID Ingresso</th><th>Título</th><th>Início Venda</th><th>Fim Venda</th><th>Lote</th><th>Tipo Lote</th></tr>\n";

while ($row = mysqli_fetch_assoc($result)) {
    echo "<tr>";
    echo "<td>{$row['id']}</td>";
    echo "<td>{$row['titulo']}</td>";
    echo "<td>{$row['inicio_venda']}</td>";
    echo "<td>{$row['fim_venda']}</td>";
    echo "<td>{$row['lote_nome']}</td>";
    echo "<td>{$row['tipo']}</td>";
    echo "</tr>\n";
}
echo "</table>\n";
mysqli_stmt_close($stmt);

mysqli_close($con);
?>
