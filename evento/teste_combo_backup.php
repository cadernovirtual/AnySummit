<?php
include("conm/conn.php");

// Função para processar conteúdo do combo e buscar nomes dos ingressos
function processarConteudoCombo($conteudo_combo, $con) {
    if (empty($conteudo_combo)) {
        return null;
    }
    
    // Decodificar JSON
    $combo_data = json_decode($conteudo_combo, true);
    
    if (!$combo_data || !is_array($combo_data)) {
        return null;
    }
    
    $itens_processados = [];
    
    foreach ($combo_data as $item) {
        if (isset($item['ingresso_id']) && isset($item['quantidade'])) {
            $ingresso_id = (int)$item['ingresso_id'];
            $quantidade = (int)$item['quantidade'];
            
            // Buscar nome do ingresso
            $sql_nome = "SELECT titulo FROM ingressos WHERE id = ?";
            $stmt_nome = mysqli_prepare($con, $sql_nome);
            
            if ($stmt_nome) {
                mysqli_stmt_bind_param($stmt_nome, "i", $ingresso_id);
                mysqli_stmt_execute($stmt_nome);
                $result_nome = mysqli_stmt_get_result($stmt_nome);
                
                if ($row_nome = mysqli_fetch_assoc($result_nome)) {
                    $itens_processados[] = [
                        'ingresso_id' => $ingresso_id,
                        'nome' => $row_nome['titulo'],
                        'quantidade' => $quantidade
                    ];
                }
                
                mysqli_stmt_close($stmt_nome);
            }
        }
    }
    
    return !empty($itens_processados) ? $itens_processados : null;
}

// Testar a função
$sql = "SELECT id, titulo, conteudo_combo FROM ingressos WHERE tipo = 'combo' AND conteudo_combo IS NOT NULL LIMIT 1";
$result = mysqli_query($con, $sql);

if ($row = mysqli_fetch_assoc($result)) {
    echo "<h3>Combo: " . $row['titulo'] . "</h3>";
    echo "<p>JSON Original: " . $row['conteudo_combo'] . "</p>";
    
    $itens = processarConteudoCombo($row['conteudo_combo'], $con);
    
    echo "<h4>Itens Processados:</h4>";
    if ($itens) {
        foreach ($itens as $item) {
            echo "<p>- {$item['quantidade']}x {$item['nome']} (ID: {$item['ingresso_id']})</p>";
        }
    } else {
        echo "<p>Nenhum item processado</p>";
    }
} else {
    echo "Nenhum combo encontrado";
}
?>
