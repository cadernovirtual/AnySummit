// Arquivo de teste para verificar se tudo está funcionando
<?php
include("../conm/conn.php");

echo "<h2>Teste das Funcionalidades de Ingressos</h2>";

// Testar se a tabela existe
$result = $con->query("SHOW TABLES LIKE 'tb_ingressos_individuais'");
if ($result->num_rows > 0) {
    echo "<p style='color: green;'>✅ Tabela tb_ingressos_individuais existe</p>";
    
    // Contar registros
    $count = $con->query("SELECT COUNT(*) as total FROM tb_ingressos_individuais");
    $total = $count->fetch_assoc()['total'];
    echo "<p>Total de ingressos individuais cadastrados: <strong>$total</strong></p>";
    
    if ($total > 0) {
        // Mostrar alguns exemplos
        echo "<h3>Últimos 5 ingressos:</h3>";
        $result = $con->query("SELECT codigo_ingresso, titulo_ingresso, participante_nome, criado_em 
                               FROM tb_ingressos_individuais 
                               ORDER BY id DESC LIMIT 5");
        
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>Código</th><th>Tipo</th><th>Participante</th><th>Criado</th></tr>";
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($row['codigo_ingresso']) . "</td>";
            echo "<td>" . htmlspecialchars($row['titulo_ingresso']) . "</td>";
            echo "<td>" . htmlspecialchars($row['participante_nome'] ?: 'Não vinculado') . "</td>";
            echo "<td>" . date('d/m/Y H:i', strtotime($row['criado_em'])) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
} else {
    echo "<p style='color: red;'>❌ Tabela tb_ingressos_individuais não existe</p>";
    echo "<p>Execute o SQL de criação da tabela primeiro!</p>";
}

// Testar se os arquivos da API existem
$arquivos_api = [
    '../api/vincular-participante.php',
    '../api/gerar-ingressos-pdf.php'
];

echo "<h3>Status dos Arquivos da API:</h3>";
foreach ($arquivos_api as $arquivo) {
    if (file_exists($arquivo)) {
        echo "<p style='color: green;'>✅ " . basename($arquivo) . " existe</p>";
    } else {
        echo "<p style='color: red;'>❌ " . basename($arquivo) . " não encontrado</p>";
    }
}

// Testar a página de sucesso
if (file_exists('../pagamento-sucesso.php')) {
    echo "<p style='color: green;'>✅ pagamento-sucesso.php existe</p>";
} else {
    echo "<p style='color: red;'>❌ pagamento-sucesso.php não encontrado</p>";
}

echo "<h3>Como Testar:</h3>";
echo "<ol>";
echo "<li>Faça um pedido pelo sistema</li>";
echo "<li>Acesse a página de sucesso</li>";
echo "<li>Veja se os ingressos individuais aparecem</li>";
echo "<li>Teste a vinculação de participantes</li>";
echo "<li>Teste o download do PDF</li>";
echo "</ol>";
?>
