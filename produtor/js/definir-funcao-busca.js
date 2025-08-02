/**
 * DEFINIÇÃO IMEDIATA DA FUNÇÃO searchAddressManual
 * Garante que a função esteja disponível mesmo antes do Google Maps carregar
 */

console.log('🔧 Definindo searchAddressManual imediatamente...');

// Definir função temporária que será substituída quando Google Maps carregar
window.searchAddressManual = function() {
    console.log('⏳ Função temporária - aguardando Google Maps...');
    
    if (typeof google === 'undefined' || !google.maps) {
        alert('Aguarde o Google Maps carregar e tente novamente.');
        return;
    }
    
    // Se Google Maps já carregou, executar busca básica
    const addressInput = document.getElementById('addressSearch');
    if (!addressInput) {
        alert('Campo de busca não encontrado');
        return;
    }
    
    const endereco = addressInput.value.trim();
    if (!endereco) {
        alert('Digite um endereço para buscar');
        return;
    }
    
    console.log('🔍 Executando busca básica para:', endereco);
    
    // Criar geocoder se não existir
    if (!window.geocoder) {
        window.geocoder = new google.maps.Geocoder();
    }
    
    // Mostrar loading
    const loading = document.getElementById('addressLoading');
    if (loading) {
        loading.style.display = 'flex';
        loading.classList.add('active');
    }
    
    // Buscar
    window.geocoder.geocode({
        address: endereco,
        componentRestrictions: { country: 'BR' }
    }, function(results, status) {
        // Esconder loading
        if (loading) {
            loading.style.display = 'none';
            loading.classList.remove('active');
        }
        
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
            console.log('✅ Endereço encontrado (busca básica)');
            preencherCamposBasico(results[0]);
            alert('Endereço encontrado e campos preenchidos!');
        } else {
            console.error('❌ Erro na busca:', status);
            alert('Endereço não encontrado. Tente ser mais específico.');
        }
    });
};

// Função básica para preencher campos
function preencherCamposBasico(place) {
    const components = place.address_components || [];
    
    components.forEach(component => {
        const types = component.types;
        
        if (types.includes('street_number')) {
            const field = document.getElementById('number');
            if (field) field.value = component.long_name;
        }
        if (types.includes('route')) {
            const field = document.getElementById('street');
            if (field) field.value = component.long_name;
        }
        if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
            const field = document.getElementById('neighborhood');
            if (field) field.value = component.long_name;
        }
        if (types.includes('locality') || types.includes('administrative_area_level_2')) {
            const field = document.getElementById('city');
            if (field) field.value = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
            const field = document.getElementById('state');
            if (field) field.value = component.short_name;
        }
        if (types.includes('postal_code')) {
            const field = document.getElementById('cep');
            if (field) field.value = component.long_name;
        }
    });
    
    // Nome do local
    const venueField = document.getElementById('venueName');
    if (venueField && !venueField.value.trim()) {
        venueField.value = place.name || place.formatted_address.split(',')[0];
    }
    
    // Mostrar campos
    const addressFields = document.getElementById('addressFields');
    if (addressFields) {
        addressFields.style.display = 'block';
        addressFields.classList.remove('hidden');
    }
}

console.log('✅ Função searchAddressManual definida (versão básica)');
console.log('Tipo da função:', typeof window.searchAddressManual);

// Teste se a função está acessível
if (typeof window.searchAddressManual === 'function') {
    console.log('✅ Função está acessível globalmente');
} else {
    console.error('❌ Função NÃO está acessível');
}
