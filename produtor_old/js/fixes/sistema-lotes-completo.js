// =====================================================
// TESTE DE CARREGAMENTO
// =====================================================

console.log('🚨🚨🚨 ARQUIVO sistema-lotes-completo.js CARREGADO! 🚨🚨🚨');
console.log('Timestamp:', new Date().toISOString());

// Verificar se as funções estão sendo definidas
console.log('Definindo funções globais...');

// DEFINIR DIRETAMENTE NO WINDOW
window.criarLoteData = function() {
    console.log('✅ criarLoteData CHAMADA!');
    alert('Função criarLoteData foi chamada!');
};

window.criarLotePercentual = function() {
    console.log('✅ criarLotePercentual CHAMADA!');
    alert('Função criarLotePercentual foi chamada!');
};

window.carregarLotesParaIngressos = function() {
    console.log('✅ carregarLotesParaIngressos CHAMADA!');
    alert('Função carregarLotesParaIngressos foi chamada!');
};

// Verificar se foram definidas
console.log('window.criarLoteData existe?', typeof window.criarLoteData);
console.log('window.criarLotePercentual existe?', typeof window.criarLotePercentual);
console.log('window.carregarLotesParaIngressos existe?', typeof window.carregarLotesParaIngressos);

// Testar imediatamente
console.log('🔥 TESTE COMPLETO - ARQUIVO CARREGADO E FUNÇÕES DEFINIDAS');
