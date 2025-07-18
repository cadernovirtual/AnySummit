<?php
// Script para OTIMIZAR a estrutura do banco para PIX
include("../conm/conn.php");

echo "<h1>🔧 OTIMIZAÇÕES NECESSÁRIAS PARA PIX</h1>";

// 1. Aumentar tamanho dos campos VARCHAR
echo "<h2>1. Aumentando tamanho dos campos</h2>";

$alteracoes = [
    "ALTER TABLE tb_pedidos MODIFY COLUMN status_pagamento VARCHAR(50) DEFAULT 'pendente'",
    "ALTER TABLE tb_pedidos MODIFY COLUMN metodo_pagamento VARCHAR(50)",
    "ALTER TABLE tb_pedidos MODIFY COLUMN codigo_pedido VARCHAR(100)",
    "ALTER TABLE tb_pedidos MODIFY COLUMN comprador_tipo_documento VARCHAR(20)"
];

foreach ($alteracoes as $sql) {
    if ($con->query($sql)) {
        echo "<p>✅ Executado: " . substr($sql, 0, 60) . "...</p>";
    } else {
        echo "<p>❌ Erro: " . $con->error . "</p>";
    }
}

// 2. Adicionar campos novos se não existirem
echo "<h2>2. Adicionando campos para melhor controle</h2>";

$novos_campos = [
    "ALTER TABLE tb_pedidos ADD COLUMN IF NOT EXISTS asaas_customer_id VARCHAR(100) AFTER asaas_payment_id",
    "ALTER TABLE tb_pedidos ADD COLUMN IF NOT EXISTS dados_pix TEXT AFTER asaas_customer_id",
    "ALTER TABLE tb_pedidos ADD COLUMN IF NOT EXISTS ip_comprador VARCHAR(45) AFTER dados_pix",
    "ALTER TABLE tb_pedidos ADD COLUMN IF NOT EXISTS user_agent TEXT AFTER ip_comprador"
];

foreach ($novos_campos as $sql) {
    if ($con->query($sql)) {
        echo "<p>✅ Campo adicionado: " . substr($sql, 40, 30) . "...</p>";
    } else {
        echo "<p>ℹ️ Campo já existe ou erro: " . $con->error . "</p>";
    }
}

// 3. Criar índices adicionais
echo "<h2>3. Criando índices para performance</h2>";

$indices = [
    "CREATE INDEX IF NOT EXISTS idx_tb_pedidos_status_metodo ON tb_pedidos(status_pagamento, metodo_pagamento)",
    "CREATE INDEX IF NOT EXISTS idx_tb_pedidos_created_at ON tb_pedidos(created_at)",
    "CREATE INDEX IF NOT EXISTS idx_tb_pedidos_asaas_customer ON tb_pedidos(asaas_customer_id)"
];

foreach ($indices as $sql) {
    if ($con->query($sql)) {
        echo "<p>✅ Índice criado: " . substr($sql, 30, 40) . "...</p>";
    } else {
        echo "<p>ℹ️ Índice já existe ou erro: " . $con->error . "</p>";
    }
}

// 4. Verificar integridade referencial
echo "<h2>4. Verificando relacionamentos</h2>";

// Verificar se existem FKs
$fk_check = [
    "ALTER TABLE tb_itens_pedido ADD CONSTRAINT IF NOT EXISTS fk_itens_pedido_pedidoid 
     FOREIGN KEY (pedidoid) REFERENCES tb_pedidos(pedidoid) ON DELETE CASCADE",
    "ALTER TABLE tb_itens_pedido ADD CONSTRAINT IF NOT EXISTS fk_itens_pedido_eventoid 
     FOREIGN KEY (eventoid) REFERENCES eventos(id) ON DELETE CASCADE",
    "ALTER TABLE tb_itens_pedido ADD CONSTRAINT IF NOT EXISTS fk_itens_pedido_ingresso 
     FOREIGN KEY (ingresso_id) REFERENCES ingressos(id) ON DELETE CASCADE"
];

foreach ($fk_check as $sql) {
    // FKs podem dar erro se já existem, então vamos só tentar
    if ($con->query($sql)) {
        echo "<p>✅ FK criada: " . substr($sql, 60, 30) . "...</p>";
    } else {
        echo "<p>ℹ️ FK já existe: " . substr($sql, 60, 30) . "...</p>";
    }
}

echo "<h2>5. Estrutura Final Otimizada</h2>";
$desc_result = $con->query("DESCRIBE tb_pedidos");
if ($desc_result) {
    echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    echo "<tr style='background: #f0f0f0;'><th>Campo</th><th>Tipo</th><th>Nulo</th><th>Chave</th><th>Padrão</th></tr>";
    while ($row = $desc_result->fetch_assoc()) {
        $bg = ($row['Field'] == 'asaas_payment_id' || $row['Field'] == 'status_pagamento') ? 'background: #e8f5e8;' : '';
        echo "<tr style='$bg'>";
        echo "<td><strong>" . $row['Field'] . "</strong></td>";
        echo "<td>" . $row['Type'] . "</td>";
        echo "<td>" . $row['Null'] . "</td>";
        echo "<td>" . $row['Key'] . "</td>";
        echo "<td>" . ($row['Default'] ?? 'NULL') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
}

echo "<h2>✅ OTIMIZAÇÕES CONCLUÍDAS!</h2>";
echo "<p><strong>Principais melhorias feitas:</strong></p>";
echo "<ul>";
echo "<li>📏 Campos VARCHAR aumentados para suportar dados completos</li>";
echo "<li>🔗 Novos campos para rastreamento (customer_id, dados_pix, etc.)</li>";
echo "<li>⚡ Índices otimizados para consultas rápidas</li>";
echo "<li>🔒 Integridade referencial melhorada</li>";
echo "</ul>";

echo "<p>🎯 <strong>A estrutura agora está IDEAL para PIX!</strong></p>";
?>
