/**
 * Fix para garantir que os campos de endereço apareçam APENAS após seleção
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicando fix de campos de endereço...');
    
    const addressFields = document.getElementById('addressFields');
    const addressSearch = document.getElementById('addressSearch');
    const addressSuggestions = document.getElementById('addressSuggestions');
    
    if (!addressFields || !addressSearch) {
        console.error('Elementos de endereço não encontrados');
        return;
    }
    
    // Garantir que campos comecem ocultos
    addressFields.classList.add('hidden');
    addressFields.style.display = 'none';
    
    // Função para mostrar campos
    function showAddressFields() {
        console.log('Mostrando campos de endereço');
        addressFields.classList.remove('hidden');
        addressFields.style.display = '';
        
        // Forçar layout grid
        if (addressFields.classList.contains('location-grid')) {
            addressFields.style.display = 'grid';
        }
    }
    
    // Monitorar cliques nas sugestões
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Adicionar listener aos novos elementos de sugestão
                mutation.addedNodes.forEach(node => {
                    if (node.classList && node.classList.contains('suggestion-item')) {
                        node.addEventListener('click', () => {
                            console.log('Sugestão clicada, mostrando campos em breve...');
                            // Aguardar o preenchimento dos campos
                            setTimeout(showAddressFields, 500);
                        });
                    }
                });
            }
        });
    });
    
    // Observar mudanças nas sugestões
    if (addressSuggestions) {
        observer.observe(addressSuggestions, { childList: true });
    }
    
    // Monitorar mudanças diretas nos campos principais
    const fieldsToWatch = ['venueName', 'street', 'cep', 'city'];
    fieldsToWatch.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            // Usar MutationObserver para detectar mudanças de atributo
            const fieldObserver = new MutationObserver(() => {
                if (field.value && addressFields.classList.contains('hidden')) {
                    console.log(`Campo ${fieldId} preenchido via API, mostrando campos`);
                    showAddressFields();
                }
            });
            
            fieldObserver.observe(field, { 
                attributes: true, 
                attributeFilter: ['value'],
                characterData: true,
                subtree: true
            });
            
            // Também monitorar eventos de mudança
            field.addEventListener('change', () => {
                if (field.value && addressFields.classList.contains('hidden')) {
                    showAddressFields();
                }
            });
        }
    });
    
    // Se dados foram carregados do cookie, mostrar campos
    setTimeout(() => {
        const hasData = document.getElementById('venueName')?.value || 
                       document.getElementById('street')?.value;
        if (hasData) {
            console.log('Dados de endereço encontrados no carregamento');
            showAddressFields();
        }
    }, 1000);
});

console.log('Fix de campos de endereço carregado');