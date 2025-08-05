/**
 * LIMPEZA DE CONFLITOS - BUSCA DE ENDEREÇOS
 * Remove todas as funções conflitantes antes de carregar o sistema novo
 */

console.log('🧹 Limpando conflitos de busca de endereços...');

// Remover funções conflitantes existentes
if (window.searchAddresses) {
    delete window.searchAddresses;
    console.log('🗑️ Função searchAddresses removida');
}

if (window.searchAddressManual) {
    delete window.searchAddressManual;
    console.log('🗑️ Função searchAddressManual anterior removida');
}

if (window.initAddressSearch) {
    delete window.initAddressSearch;
    console.log('🗑️ Função initAddressSearch anterior removida');
}

// Limpar event listeners duplicados
const addressInput = document.getElementById('addressSearch');
if (addressInput) {
    // Clonar o elemento para remover todos os listeners
    const newAddressInput = addressInput.cloneNode(true);
    addressInput.parentNode.replaceChild(newAddressInput, addressInput);
    console.log('🗑️ Event listeners do campo de busca limpos');
}

console.log('✅ Limpeza concluída. Sistema novo pode ser carregado.');
