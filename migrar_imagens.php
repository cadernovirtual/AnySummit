<?php
include("includes/imagem-helpers.php");
include("produtor/conm/conn.php");

$conn = $con;

echo "=== MIGRAÇÃO DE CAMINHOS DE IMAGENS ===\n";
echo "De: /uploads/eventos/ \n";
echo "Para: /uploads/capas/ \n\n";

// Verificar quantos registros precisam ser migrados
$sql_check = "SELECT COUNT(*) as total FROM eventos WHERE imagem_capa LIKE '/uploads/eventos/%'";
$result_check = $conn->query($sql_check);
$total_antes = $result_check->fetch_assoc()['total'];

echo "Registros a migrar: {$total_antes}\n";

if ($total_antes > 0) {
    // Executar migração
    $migrados = migrarCaminhosImagens($conn);
    echo "Registros migrados: {$migrados}\n";
    
    // Verificar resultado
    $result_after = $conn->query($sql_check);
    $total_depois = $result_after->fetch_assoc()['total'];
    echo "Registros restantes (antigos): {$total_depois}\n";
    
    if ($total_depois == 0) {
        echo "✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!\n";
    } else {
        echo "⚠️ Alguns registros não foram migrados.\n";
    }
} else {
    echo "✅ Nenhuma migração necessária. Todos os caminhos já estão corretos.\n";
}

echo "\n=== VERIFICAÇÃO FINAL ===\n";
$sql_all = "SELECT id, nome, imagem_capa FROM eventos WHERE imagem_capa IS NOT NULL AND imagem_capa != '' LIMIT 10";
$result_all = $conn->query($sql_all);

echo "Amostra dos caminhos atuais:\n";
while ($row = $result_all->fetch_assoc()) {
    echo "- Evento {$row['id']}: {$row['imagem_capa']}\n";
}

echo "\n=== MIGRAÇÃO FINALIZADA ===\n";
?>
