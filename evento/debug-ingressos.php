<?php
// Arquivo de debug para verificar ingressos
// D:\sites\anysummit\evento\debug-ingressos.php

include("conm/conn.php");

// Usar a mesma variável de conexão que você está usando
$slug = 'congresso-2025'; // Teste com um slug específico

echo "<h1>Debug - Ingressos</h1>";

// 1. Testar conexão
echo "<h2>1. Conexão</h2>";
if (isset($con)) {
    echo "✅ Variável \$con existe<br>";
} else {
    echo "❌ Variável \$con não existe<br>";
}

if (isset($conn)) {
    echo "✅ Variável \$conn existe<br>";
} else {
    echo "❌ Variável \$conn não existe<br>";
}

// Usar a variável correta
$connection = isset($con) ? $con : (isset($conn) ? $conn : null);

if (!$connection) {
    echo "❌ Nenhuma conexão disponível!";
    exit;
}

// 2. Buscar evento
echo "<h2>2. Buscar Evento</h2>";
$sql_evento = "SELECT id, nome, slug, status, visibilidade FROM eventos WHERE slug = '$slug'";
echo "SQL: $sql_evento<br>";

$result_evento = $connection->query($sql_evento);
if ($result_evento && $result_evento->num_rows > 0) {
    $evento = $result_evento->fetch_assoc();
    echo "✅ Evento encontrado: " . $evento['nome'] . "<br>";
    echo "ID: " . $evento['id'] . "<br>";
    echo "Status: " . $evento['status'] . "<br>";
    echo "Visibilidade: " . $evento['visibilidade'] . "<br>";
    
    $evento_id = $evento['id'];
} else {
    echo "❌ Evento não encontrado<br>";
    echo "Erro: " . $connection->error . "<br>";
    exit;
}

// 3. Listar TODOS os ingressos (sem filtro primeiro)
echo "<h2>3. Todos os Ingressos do Evento</h2>";
$sql_todos = "SELECT * FROM ingressos WHERE evento_id = $evento_id";
echo "SQL: $sql_todos<br>";

$result_todos = $connection->query($sql_todos);
if ($result_todos && $result_todos->num_rows > 0) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>ID</th><th>Título</th><th>Preço</th><th>Ativo</th><th>Disponibilidade</th><th>Início Venda</th><th>Fim Venda</th></tr>";
    
    while ($row = $result_todos->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $row['id'] . "</td>";
        echo "<td>" . $row['titulo'] . "</td>";
        echo "<td>R$ " . number_format($row['preco'], 2, ',', '.') . "</td>";
        echo "<td>" . ($row['ativo'] ? 'Sim' : 'Não') . "</td>";
        echo "<td>" . $row['disponibilidade'] . "</td>";
        echo "<td>" . ($row['inicio_venda'] ?: 'Não definido') . "</td>";
        echo "<td>" . ($row['fim_venda'] ?: 'Não definido') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "❌ Nenhum ingresso encontrado para este evento<br>";
    echo "Erro: " . $connection->error . "<br>";
}

// 4. Testar filtros individualmente
echo "<h2>4. Teste de Filtros</h2>";

// Filtro 1: Ativo
$sql_ativo = "SELECT COUNT(*) as total FROM ingressos WHERE evento_id = $evento_id AND ativo = 1";
$result_ativo = $connection->query($sql_ativo);
$total_ativo = $result_ativo->fetch_assoc()['total'];
echo "Ingressos ativos: $total_ativo<br>";

// Filtro 2: Disponibilidade
$sql_disp = "SELECT COUNT(*) as total FROM ingressos WHERE evento_id = $evento_id AND disponibilidade = 'publico'";
$result_disp = $connection->query($sql_disp);
$total_disp = $result_disp->fetch_assoc()['total'];
echo "Ingressos disponíveis: $total_disp<br>";

// Filtro 3: Data início
$sql_inicio = "SELECT COUNT(*) as total FROM ingressos WHERE evento_id = $evento_id AND (inicio_venda IS NULL OR inicio_venda <= NOW())";
$result_inicio = $connection->query($sql_inicio);
$total_inicio = $result_inicio->fetch_assoc()['total'];
echo "Ingressos com início de venda válido: $total_inicio<br>";

// Filtro 4: Data fim
$sql_fim = "SELECT COUNT(*) as total FROM ingressos WHERE evento_id = $evento_id AND (fim_venda IS NULL OR fim_venda >= NOW())";
$result_fim = $connection->query($sql_fim);
$total_fim = $result_fim->fetch_assoc()['total'];
echo "Ingressos com fim de venda válido: $total_fim<br>";

// 5. Consulta corrigida
echo "<h2>5. Consulta Corrigida</h2>";
$sql_corrigido = "
    SELECT *
    FROM ingressos 
    WHERE evento_id = $evento_id 
    AND ativo = 1 
    AND disponibilidade = 'publico'
    AND (inicio_venda IS NULL OR inicio_venda <= NOW())
    AND (fim_venda IS NULL OR fim_venda >= NOW())
    ORDER BY posicao_ordem ASC, preco ASC
";

echo "SQL: " . str_replace("\n", "<br>", $sql_corrigido) . "<br>";

$result_corrigido = $connection->query($sql_corrigido);
echo "Número de ingressos encontrados: " . ($result_corrigido ? $result_corrigido->num_rows : 0) . "<br>";

if ($result_corrigido && $result_corrigido->num_rows > 0) {
    echo "<h3>Ingressos que aparecem na página:</h3>";
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>ID</th><th>Título</th><th>Descrição</th><th>Preço</th><th>Quantidade Total</th><th>Vendidos</th><th>Reservados</th><th>Disponível</th></tr>";
    
    while ($row = $result_corrigido->fetch_assoc()) {
        $disponivel = $row['quantidade_total'] - $row['quantidade_vendida'] - $row['quantidade_reservada'];
        echo "<tr>";
        echo "<td>" . $row['id'] . "</td>";
        echo "<td>" . $row['titulo'] . "</td>";
        echo "<td>" . substr($row['descricao'], 0, 50) . "...</td>";
        echo "<td>R$ " . number_format($row['preco'], 2, ',', '.') . "</td>";
        echo "<td>" . $row['quantidade_total'] . "</td>";
        echo "<td>" . $row['quantidade_vendida'] . "</td>";
        echo "<td>" . $row['quantidade_reservada'] . "</td>";
        echo "<td>" . $disponivel . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "❌ Nenhum ingresso passa pelos filtros!<br>";
}

// 6. Verificar se há dados de exemplo
echo "<h2>6. Verificar Dados de Exemplo</h2>";
$sql_eventos = "SELECT id, nome, slug FROM eventos ORDER BY id";
$result_eventos = $connection->query($sql_eventos);

if ($result_eventos && $result_eventos->num_rows > 0) {
    echo "Eventos disponíveis:<br>";
    while ($row = $result_eventos->fetch_assoc()) {
        echo "- ID: {$row['id']}, Nome: {$row['nome']}, Slug: {$row['slug']}<br>";
    }
} else {
    echo "❌ Nenhum evento encontrado! Execute o arquivo exemplo-dados.sql<br>";
}

$connection->close();
?>

<style>
body { font-family: Arial, sans-serif; margin: 20px; }
h1, h2, h3 { color: #333; }
table { border-collapse: collapse; margin: 10px 0; }
th { background: #f5f5f5; }
</style>
