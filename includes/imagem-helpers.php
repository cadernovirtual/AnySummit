<?php
/**
 * Funções auxiliares para normalização de caminhos de imagens
 * Sistema AnySummit - Padronização para /uploads/capas/
 */

/**
 * Normaliza o caminho da imagem para o padrão /uploads/capas/
 * @param string $imagePath Caminho atual da imagem
 * @return string Caminho normalizado
 */
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

/**
 * Verifica se a imagem existe no sistema de arquivos
 * @param string $imagePath Caminho da imagem
 * @return bool True se existe, false caso contrário
 */
function imagemExiste($imagePath) {
    if (empty($imagePath)) {
        return false;
    }
    
    $imagePath = normalizarCaminhoImagem($imagePath);
    $filePath = $_SERVER['DOCUMENT_ROOT'] . $imagePath;
    
    return file_exists($filePath);
}

/**
 * Retorna o caminho da imagem ou um placeholder se não existir
 * @param string $imagePath Caminho da imagem
 * @param string $placeholder Placeholder padrão (opcional)
 * @return string Caminho final da imagem
 */
function obterImagemOuPlaceholder($imagePath, $placeholder = '') {
    $normalizado = normalizarCaminhoImagem($imagePath);
    
    if (imagemExiste($normalizado)) {
        return $normalizado;
    }
    
    return $placeholder;
}

/**
 * Atualiza caminhos antigos no banco de dados
 * @param object $conn Conexão com o banco
 * @return int Número de registros atualizados
 */
function migrarCaminhosImagens($conn) {
    $sql = "UPDATE eventos 
            SET imagem_capa = REPLACE(imagem_capa, '/uploads/eventos/', '/uploads/capas/') 
            WHERE imagem_capa LIKE '/uploads/eventos/%'";
    
    $result = $conn->query($sql);
    return $conn->affected_rows;
}
?>
