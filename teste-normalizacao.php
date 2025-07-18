<?php
// Teste da função normalizarCaminhoImagem

function normalizarCaminhoImagem($imagePath) {
    if (empty($imagePath)) {
        return '';
    }
    
    // Se já é um caminho correto, retorna como está
    if ($imagePath === '/uploads/capas/' . basename($imagePath)) {
        return $imagePath;
    }
    
    // Casos de caminhos antigos ou incorretos
    if (strpos($imagePath, '/produtor/uploads/eventos/') !== false) {
        // Remove /produtor/uploads/eventos/ e adiciona /uploads/capas/
        $nomeArquivo = basename($imagePath);
        return '/uploads/capas/' . $nomeArquivo;
    }
    
    if (strpos($imagePath, '/uploads/eventos/') !== false) {
        // Remove /uploads/eventos/ e adiciona /uploads/capas/
        $nomeArquivo = basename($imagePath);
        return '/uploads/capas/' . $nomeArquivo;
    }
    
    if (strpos($imagePath, 'uploads/capas/') !== false) {
        // Adiciona / inicial se não tiver
        if (substr($imagePath, 0, 1) !== '/') {
            return '/' . $imagePath;
        }
        return $imagePath;
    }
    
    // Se é apenas o nome do arquivo, adiciona o caminho completo
    if (strpos($imagePath, '/') === false) {
        return '/uploads/capas/' . $imagePath;
    }
    
    // Fallback: extrair nome do arquivo e criar caminho correto
    $nomeArquivo = basename($imagePath);
    return '/uploads/capas/' . $nomeArquivo;
}

// Casos de teste baseados no banco de dados
$testes = [
    "uploads/capas/evento_683863e88d054_1748526056.jpg",
    "/produtor/uploads/eventos/evento_20_1750193379.jpg", 
    "uploads/capas/evento_68536083be721_1750294659.jpg",
    "/uploads/eventos/evento_22_1750990779.jpg",
    "uploads/capas/evento_6876e18636d5b_1752621446.png"
];

echo "Testes da função normalizarCaminhoImagem:\n\n";

foreach ($testes as $teste) {
    $resultado = normalizarCaminhoImagem($teste);
    echo "INPUT:  " . $teste . "\n";
    echo "OUTPUT: " . $resultado . "\n\n";
}
?>
