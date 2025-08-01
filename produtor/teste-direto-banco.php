<?php
/**
 * Teste simplificado da API usando transação direta no banco
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
date_default_timezone_set('America/Sao_Paulo');

// Incluir conexão
require_once 'conm/conn.php';

echo "=== TESTE DIRETO DE CRIAÇÃO DE EVENTO ===\n\n";

// Verificar conexão
if (!$con) {
    die("Erro na conexão: " . mysqli_connect_error());
}

echo "✓ Conexão estabelecida\n";

// Dados de teste
$usuario_id = 1;
$contratante_id = 1;
$nome = "Evento Teste " . date('Y-m-d H:i:s');
$slug = "evento-teste-" . time();

try {
    // Iniciar transação
    mysqli_begin_transaction($con);
    echo "✓ Transação iniciada\n";
    
    // 1. Inserir evento
    $sql = "INSERT INTO eventos (
        contratante_id, usuario_id, categoria_id, nome, descricao, 
        classificacao, slug, data_inicio, data_fim, tipo_local,
        cidade, estado, pais, status, criado_em
    ) VALUES (
        $contratante_id, $usuario_id, 1, '$nome', 'Descrição teste',
        'livre', '$slug', '2025-08-30 19:00:00', '2025-08-30 23:00:00', 'presencial',
        'São Paulo', 'SP', 'Brasil', 'publicado', NOW()
    )";
    
    if (!mysqli_query($con, $sql)) {
        throw new Exception("Erro ao criar evento: " . mysqli_error($con));
    }
    
    $evento_id = mysqli_insert_id($con);
    echo "✓ Evento criado: ID = $evento_id\n";
    
    // 2. Verificar estrutura da tabela lotes
    $check = mysqli_query($con, "SHOW COLUMNS FROM lotes");
    $colunas = [];
    while ($col = mysqli_fetch_assoc($check)) {
        $colunas[] = $col['Field'];
    }
    echo "✓ Colunas em lotes: " . implode(', ', $colunas) . "\n";
    
    // Adicionar colunas se necessário
    if (!in_array('quantidade', $colunas)) {
        mysqli_query($con, "ALTER TABLE lotes ADD COLUMN quantidade INT(11) NULL AFTER percentual_venda");
        echo "✓ Coluna 'quantidade' adicionada\n";
    }
    if (!in_array('ordem', $colunas)) {
        mysqli_query($con, "ALTER TABLE lotes ADD COLUMN ordem INT(11) DEFAULT 0 AFTER quantidade");
        echo "✓ Coluna 'ordem' adicionada\n";
    }
    
    // 3. Inserir lote
    $sql = "INSERT INTO lotes (
        evento_id, nome, tipo, data_inicio, data_fim, ordem, criado_em
    ) VALUES (
        $evento_id, 'Lote Teste', 'data', NOW(), '2025-08-29 23:59:59', 1, NOW()
    )";
    
    if (!mysqli_query($con, $sql)) {
        throw new Exception("Erro ao criar lote: " . mysqli_error($con));
    }
    
    $lote_id = mysqli_insert_id($con);
    echo "✓ Lote criado: ID = $lote_id\n";
    
    // 4. Inserir ingresso
    $sql = "INSERT INTO ingressos (
        evento_id, lote_id, tipo, titulo, descricao, quantidade_total,
        preco, inicio_venda, fim_venda, ativo, criado_em
    ) VALUES (
        $evento_id, $lote_id, 'pago', 'Ingresso Teste', 'Descrição', 100,
        50.00, NOW(), '2025-08-30 18:00:00', 1, NOW()
    )";
    
    if (!mysqli_query($con, $sql)) {
        throw new Exception("Erro ao criar ingresso: " . mysqli_error($con));
    }
    
    $ingresso_id = mysqli_insert_id($con);
    echo "✓ Ingresso criado: ID = $ingresso_id\n";
    
    // 5. Inserir combo
    $conteudo_combo = json_encode([
        ['ingresso_id' => $ingresso_id, 'quantidade' => 2]
    ]);
    
    $sql = "INSERT INTO ingressos (
        evento_id, lote_id, tipo, titulo, descricao, quantidade_total,
        preco, conteudo_combo, inicio_venda, fim_venda, ativo, criado_em
    ) VALUES (
        $evento_id, $lote_id, 'combo', 'Combo Teste', 'Combo 2x1', 50,
        80.00, '$conteudo_combo', NOW(), '2025-08-30 18:00:00', 1, NOW()
    )";
    
    if (!mysqli_query($con, $sql)) {
        throw new Exception("Erro ao criar combo: " . mysqli_error($con));
    }
    
    $combo_id = mysqli_insert_id($con);
    echo "✓ Combo criado: ID = $combo_id\n";
    
    // Commit
    mysqli_commit($con);
    echo "\n✅ TESTE CONCLUÍDO COM SUCESSO!\n";
    echo "Evento ID: $evento_id\n";
    echo "URL: /evento/$slug\n";
    
} catch (Exception $e) {
    mysqli_rollback($con);
    echo "\n❌ ERRO: " . $e->getMessage() . "\n";
}

mysqli_close($con);
?>