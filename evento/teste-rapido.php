<?php
// Teste rápido para verificar os ingressos
// D:\sites\anysummit\evento\teste-rapido.php

include("conm/conn.php");

echo "<h1>Teste Rápido - Ingressos</h1>";

// Verificar qual variável de conexão existe
if (isset($con)) {
    echo "✅ Usando \$con<br>";
    $connection = $con;
} elseif (isset($conn)) {
    echo "✅ Usando \$conn<br>";
    $connection = $conn;
} else {
    echo "❌ Nenhuma conexão encontrada!<br>";
    exit;
}

// 1. Listar todos os eventos
echo "<h2>1. Eventos Cadastrados</h2>";
$sql = "SELECT id, nome, slug, status, visibilidade FROM eventos";
$result = $connection->query($sql);

if ($result && $result->num_rows > 0) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>ID</th><th>Nome</th><th>Slug</th><th>Status</th><th>Visibilidade</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>{$row['id']}</td>";
        echo "<td>{$row['nome']}</td>";
        echo "<td>{$row['slug']}</td>";
        echo "<td>{$row['status']}</td>";
        echo "<td>{$row['visibilidade']}</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "❌ Nenhum evento encontrado!<br>";
}

// 2. Listar todos os ingressos
echo "<h2>2. Ingressos Cadastrados</h2>";
$sql = "SELECT i.*, e.nome as evento_nome FROM ingressos i LEFT JOIN eventos e ON i.evento_id = e.id";
$result = $connection->query($sql);

if ($result && $result->num_rows > 0) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>ID</th><th>Evento</th><th>Título</th><th>Preço</th><th>Ativo</th><th>Disponibilidade</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>{$row['id']}</td>";
        echo "<td>{$row['evento_nome']}</td>";
        echo "<td>{$row['titulo']}</td>";
        echo "<td>R$ " . number_format($row['preco'], 2, ',', '.') . "</td>";
        echo "<td>" . ($row['ativo'] ? 'Sim' : 'Não') . "</td>";
        echo "<td>{$row['disponibilidade']}</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "❌ Nenhum ingresso encontrado!<br>";
    echo "<p><strong>SOLUÇÃO:</strong> Execute o arquivo <code>exemplo-dados.sql</code> para inserir dados de teste.</p>";
}

// 3. Testar consulta específica
echo "<h2>3. Teste da Consulta Específica</h2>";
$evento_id = 1; // Teste com ID 1

$sql_teste = "
    SELECT *
    FROM ingressos 
    WHERE evento_id = $evento_id 
    AND ativo = 1 
    AND disponibilidade = 'publico'
    AND (inicio_venda IS NULL OR inicio_venda <= NOW())
    AND (fim_venda IS NULL OR fim_venda >= NOW())
    ORDER BY posicao_ordem ASC, preco ASC
";

echo "<p><strong>SQL usado:</strong></p>";
echo "<pre>" . htmlspecialchars($sql_teste) . "</pre>";

$result = $connection->query($sql_teste);

if ($result && $result->num_rows > 0) {
    echo "<p>✅ <strong>Encontrados " . $result->num_rows . " ingressos válidos!</strong></p>";
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>ID</th><th>Título</th><th>Preço</th><th>Total</th><th>Vendidos</th><th>Disponível</th></tr>";
    while ($row = $result->fetch_assoc()) {
        $disponivel = $row['quantidade_total'] - $row['quantidade_vendida'] - $row['quantidade_reservada'];
        echo "<tr>";
        echo "<td>{$row['id']}</td>";
        echo "<td>{$row['titulo']}</td>";
        echo "<td>R$ " . number_format($row['preco'], 2, ',', '.') . "</td>";
        echo "<td>{$row['quantidade_total']}</td>";
        echo "<td>{$row['quantidade_vendida']}</td>";
        echo "<td>$disponivel</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<p>❌ <strong>Nenhum ingresso encontrado com os filtros!</strong></p>";
    
    // Testar cada filtro individualmente
    echo "<h3>Diagnóstico detalhado:</h3>";
    
    $tests = [
        "Total de ingressos para evento $evento_id" => "SELECT COUNT(*) as total FROM ingressos WHERE evento_id = $evento_id",
        "Ingressos ativos" => "SELECT COUNT(*) as total FROM ingressos WHERE evento_id = $evento_id AND ativo = 1",
        "Ingressos disponíveis" => "SELECT COUNT(*) as total FROM ingressos WHERE evento_id = $evento_id AND disponibilidade = 'disponivel'",
        "Ingressos com venda iniciada" => "SELECT COUNT(*) as total FROM ingressos WHERE evento_id = $evento_id AND (inicio_venda IS NULL OR inicio_venda <= NOW())",
        "Ingressos com venda não finalizada" => "SELECT COUNT(*) as total FROM ingressos WHERE evento_id = $evento_id AND (fim_venda IS NULL OR fim_venda >= NOW())"
    ];
    
    foreach ($tests as $desc => $sql) {
        $result_test = $connection->query($sql);
        if ($result_test) {
            $row_test = $result_test->fetch_assoc();
            echo "<p>• $desc: <strong>{$row_test['total']}</strong></p>";
        }
    }
}

// 4. Instruções
echo "<h2>4. O que fazer?</h2>";
echo "<ol>";
echo "<li>Se não há eventos: Execute o arquivo <code>exemplo-dados.sql</code></li>";
echo "<li>Se há eventos mas não há ingressos: Verifique se os ingressos foram inseridos corretamente</li>";
echo "<li>Se há ingressos mas a consulta não retorna nada: Verifique os valores dos campos <code>ativo</code>, <code>disponibilidade</code>, <code>inicio_venda</code> e <code>fim_venda</code></li>";
echo "<li>Se tudo estiver certo aqui mas não aparecer na página: Verifique se o <code>slug</code> do evento está correto na URL</li>";
echo "</ol>";

$connection->close();
?>

<style>
body { font-family: Arial, sans-serif; margin: 20px; }
h1, h2, h3 { color: #333; }
table { border-collapse: collapse; margin: 10px 0; }
th { background: #f5f5f5; }
pre { background: #f8f8f8; padding: 10px; border: 1px solid #ddd; }
</style>
