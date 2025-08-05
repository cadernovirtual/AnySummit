// Adicionar no início do edit-combo-fixes.js após os logs existentes

// Função auxiliar para garantir que o ID do lote está correto
function normalizeLoteId(loteId) {
    if (!loteId) return '';
    
    // Se já tem o formato correto, retornar
    if (loteId.startsWith('lote_')) return loteId;
    
    // Se é apenas um número, adicionar prefixo
    if (!isNaN(loteId)) return `lote_${loteId}`;
    
    // Retornar como está
    return loteId;
}

// Função para verificar se o lote existe
function loteExists(loteId) {
    const normalizedId = normalizeLoteId(loteId);
    const loteCard = document.querySelector(`[data-lote-id="${normalizedId}"]`);
    return !!loteCard;
}
