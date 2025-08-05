<?php
/**
 * Funções auxiliares para normalização de caminhos de imagens
 * Sistema AnySummit - Padronização para /uploads/eventos/
 */

/**
 * Normaliza o caminho da imagem para o padrão /uploads/eventos/
 * @param string $imagePath Caminho atual da imagem
 * @return string Caminho normalizado
 */
function normalizarCaminhoImagem($imagePath) {
    if (empty($imagePath)) {
        return '';
    }
    
    // Se já é um caminho correto, retorna como está
    if ($imagePath === '/uploads/eventos/' . basename($imagePath)) {
        return $imagePath;
    }
    
    // Casos de caminhos antigos ou incorretos
    if (strpos($imagePath, '/produtor/uploads/capas/') !== false) {
        // Remove /produtor/uploads/capas/ e adiciona /uploads/eventos/
        $nomeArquivo = basename($imagePath);
        return '/uploads/eventos/' . $nomeArquivo;
    }
    
    if (strpos($imagePath, '/uploads/capas/') !== false) {
        // Remove /uploads/capas/ e adiciona /uploads/eventos/
        $nomeArquivo = basename($imagePath);
        return '/uploads/eventos/' . $nomeArquivo;
    }
    
    if (strpos($imagePath, 'uploads/eventos/') !== false) {
        // Adiciona / inicial se não tiver
        if (substr($imagePath, 0, 1) !== '/') {
            return '/' . $imagePath;
        }
        return $imagePath;
    }
    
    // Se é apenas o nome do arquivo, adiciona o caminho completo
    if (strpos($imagePath, '/') === false) {
        return '/uploads/eventos/' . $imagePath;
    }
    
    // Fallback: extrair nome do arquivo e criar caminho correto
    $nomeArquivo = basename($imagePath);
    return '/uploads/eventos/' . $nomeArquivo;
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
            SET imagem_capa = REPLACE(imagem_capa, '/uploads/capas/', '/uploads/eventos/') 
            WHERE imagem_capa LIKE '/uploads/capas/%'";
    
    $result = $conn->query($sql);
    return $conn->affected_rows;
}
?>
