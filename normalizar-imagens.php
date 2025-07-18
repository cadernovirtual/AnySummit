<?php
// Script para normalizar caminhos de imagens no banco
include("produtor/conm/conn.php");

function normalizarCaminhoImagem($imagePath) {
    if (empty($imagePath)) {
        return '';
    }
    
    // Se já é um caminho correto, retorna como está
    if (strpos($imagePath, '/uploads/capas/') === 0) {
        return $imagePath;
    }
    
    // Extrair apenas o nome do arquivo
    $nomeArquivo = basename($imagePath);
    
    // Retornar caminho normalizado
    return '/uploads/capas/' . $nomeArquivo;
}

// Buscar todos os eventos com imagem
$sql = "SELECT id, imagem_capa FROM eventos WHERE imagem_capa IS NOT NULL AND imagem_capa != ''";
$result = mysqli_query($con, $sql);

$updated = 0;
while ($row = mysqli_fetch_assoc($result)) {
    $caminhoAtual = $row['imagem_capa'];
    $caminhoNormalizado = normalizarCaminhoImagem($caminhoAtual);
    
    if ($caminhoAtual !== $caminhoNormalizado) {
        $sql_update = "UPDATE eventos SET imagem_capa = ? WHERE id = ?";
        $stmt = mysqli_prepare($con, $sql_update);
        mysqli_stmt_bind_param($stmt, "si", $caminhoNormalizado, $row['id']);
        
        if (mysqli_stmt_execute($stmt)) {
            echo "ID {$row['id']}: {$caminhoAtual} → {$caminhoNormalizado}\n";
            $updated++;
        }
        mysqli_stmt_close($stmt);
    }
}

echo "\nTotal de registros atualizados: {$updated}\n";
mysqli_close($con);
?>
