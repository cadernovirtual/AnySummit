<?php
// Script para executar criação da tabela lotes e configuração de FKs
// AnySummit - Configuração de Lotes

require_once 'evento/conm/conn.php';

echo "=== SCRIPT DE CRIAÇÃO DA TABELA LOTES ===\n\n";

try {
    // 1. Criar tabela lotes
    echo "1. Criando tabela lotes...\n";
    $sql_create_lotes = "
        CREATE TABLE lotes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            evento_id INT NOT NULL,
            nome VARCHAR(100) NOT NULL,
            data_inicio DATETIME NOT NULL,
            data_fim DATETIME NOT NULL,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_evento_id (evento_id),
            INDEX idx_datas (data_inicio, data_fim)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ";
    
    if (mysqli_query($con, $sql_create_lotes)) {
        echo "✅ Tabela lotes criada com sucesso!\n";
    } else {
        echo "❌ Erro ao criar tabela lotes: " . mysqli_error($con) . "\n";
        exit;
    }

    // 2. Adicionar FK da tabela lotes para eventos
    echo "\n2. Adicionando FK lotes -> eventos...\n";
    $sql_fk_lotes = "
        ALTER TABLE lotes 
        ADD CONSTRAINT fk_lotes_evento 
        FOREIGN KEY (evento_id) REFERENCES eventos(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
    ";
    
    if (mysqli_query($con, $sql_fk_lotes)) {
        echo "✅ FK lotes -> eventos criada com sucesso!\n";
    } else {
        echo "❌ Erro ao criar FK lotes -> eventos: " . mysqli_error($con) . "\n";
    }

    // 3. Adicionar coluna lote_id na tabela ingressos
    echo "\n3. Adicionando coluna lote_id na tabela ingressos...\n";
    $sql_add_column = "
        ALTER TABLE ingressos 
        ADD COLUMN lote_id INT NULL AFTER evento_id,
        ADD INDEX idx_lote_id (lote_id)
    ";
    
    if (mysqli_query($con, $sql_add_column)) {
        echo "✅ Coluna lote_id adicionada com sucesso!\n";
    } else {
        echo "❌ Erro ao adicionar coluna lote_id: " . mysqli_error($con) . "\n";
    }

    // 4. Criar lotes únicos para eventos existentes
    echo "\n4. Criando lotes únicos para eventos existentes...\n";
    $sql_insert_lotes = "
        INSERT INTO lotes (evento_id, nome, data_inicio, data_fim)
        SELECT 
            e.id as evento_id,
            'LOTE ÚNICO' as nome,
            COALESCE(MIN(i.inicio_venda), e.data_inicio) as data_inicio,
            COALESCE(MAX(i.fim_venda), e.data_fim) as data_fim
        FROM eventos e
        LEFT JOIN ingressos i ON e.id = i.evento_id AND i.ativo = 1
        GROUP BY e.id, e.data_inicio, e.data_fim
    ";
    
    if (mysqli_query($con, $sql_insert_lotes)) {
        $affected_rows = mysqli_affected_rows($con);
        echo "✅ $affected_rows lotes únicos criados com sucesso!\n";
    } else {
        echo "❌ Erro ao criar lotes únicos: " . mysqli_error($con) . "\n";
    }

    // 5. Atualizar lote_id nos ingressos existentes
    echo "\n5. Atualizando lote_id nos ingressos existentes...\n";
    $sql_update_ingressos = "
        UPDATE ingressos i
        INNER JOIN lotes l ON i.evento_id = l.evento_id AND l.nome = 'LOTE ÚNICO'
        SET i.lote_id = l.id
    ";
    
    if (mysqli_query($con, $sql_update_ingressos)) {
        $affected_rows = mysqli_affected_rows($con);
        echo "✅ $affected_rows ingressos atualizados com lote_id!\n";
    } else {
        echo "❌ Erro ao atualizar ingressos: " . mysqli_error($con) . "\n";
    }

    // 6. Adicionar FK da tabela ingressos para lotes
    echo "\n6. Adicionando FK ingressos -> lotes...\n";
    $sql_fk_ingressos = "
        ALTER TABLE ingressos 
        ADD CONSTRAINT fk_ingressos_lote 
        FOREIGN KEY (lote_id) REFERENCES lotes(id) 
        ON DELETE SET NULL ON UPDATE CASCADE
    ";
    
    if (mysqli_query($con, $sql_fk_ingressos)) {
        echo "✅ FK ingressos -> lotes criada com sucesso!\n";
    } else {
        echo "❌ Erro ao criar FK ingressos -> lotes: " . mysqli_error($con) . "\n";
    }

    // 7. Verificar resultado
    echo "\n7. Verificando resultado final...\n";
    $sql_verify = "
        SELECT 
            e.nome as evento,
            l.nome as lote,
            l.data_inicio,
            l.data_fim,
            COUNT(i.id) as total_ingressos
        FROM eventos e
        LEFT JOIN lotes l ON e.id = l.evento_id
        LEFT JOIN ingressos i ON l.id = i.lote_id
        GROUP BY e.id, l.id
        ORDER BY e.nome, l.nome
    ";
    
    $result = mysqli_query($con, $sql_verify);
    if ($result) {
        echo "\n📊 RESULTADO FINAL:\n";
        echo str_pad("EVENTO", 25) . str_pad("LOTE", 15) . str_pad("INÍCIO", 20) . str_pad("FIM", 20) . "INGRESSOS\n";
        echo str_repeat("-", 85) . "\n";
        
        while ($row = mysqli_fetch_assoc($result)) {
            echo str_pad($row['evento'], 25) . 
                 str_pad($row['lote'] ?? 'N/A', 15) . 
                 str_pad($row['data_inicio'] ?? 'N/A', 20) . 
                 str_pad($row['data_fim'] ?? 'N/A', 20) . 
                 $row['total_ingressos'] . "\n";
        }
    }

    echo "\n✅ SCRIPT EXECUTADO COM SUCESSO!\n";
    echo "🎯 Tabela lotes criada e configurada com integridade referencial!\n";

} catch (Exception $e) {
    echo "❌ ERRO FATAL: " . $e->getMessage() . "\n";
}

mysqli_close($con);
?>
