/**
 * Sistema de Busca de Endereços - Implementação Nova
 * Criado do zero para funcionar corretamente
 */

(function() {
    'use strict';
    
    console.log('🔍 Carregando sistema de busca de endereços...');
    
    // Aguardar carregamento completo da página e Google Maps
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📍 DOM carregado, aguardando Google Maps...');
        
        // Aguardar Google Maps API carregar
        function aguardarGoogleMaps() {
            if (typeof google !== 'undefined' && google.maps && google.maps.places) {
                console.log('✅ Google Maps API carregada');
                inicializarBuscaEndereco();
            } else {
                console.log('⏳ Aguardando Google Maps API...');
                setTimeout(aguardarGoogleMaps, 500);
            }
        }
        
        setTimeout(aguardarGoogleMaps, 1000);
    });
    
    function inicializarBuscaEndereco() {
        console.log('🚀 Inicializando busca de endereços...');
        
        // Implementar a função principal de busca
        window.searchAddressManual = function() {
            console.log('🔍 Função searchAddressManual chamada');
            
            const addressInput = document.getElementById('addressSearch');
            if (!addressInput) {
                console.error('❌ Campo addressSearch não encontrado');
                alert('Erro: Campo de busca não encontrado');
                return;
            }
            
            const endereco = addressInput.value.trim();
            if (!endereco) {
                alert('Por favor, digite um endereço para buscar');
                return;
            }
            
            if (endereco.length < 3) {
                alert('Digite pelo menos 3 caracteres');
                return;
            }
            
            console.log('🔍 Buscando endereço:', endereco);
            
            // Mostrar loading
            mostrarLoading(true);
            
            // Criar geocoder se não existir
            if (!window.geocoder) {
                window.geocoder = new google.maps.Geocoder();
            }
            
            // Fazer a busca
            window.geocoder.geocode({
                address: endereco,
                componentRestrictions: { country: 'BR' }
            }, function(results, status) {
                mostrarLoading(false);
                
                console.log('📡 Resposta da API:', status, results);
                
                if (status === 'OK' && results && results.length > 0) {
                    const lugar = results[0];
                    console.log('✅ Endereço encontrado:', lugar);
                    preencherCampos(lugar);
                    mostrarCamposEndereco();
                } else {
                    console.error('❌ Erro na busca:', status);
                    tratarErroBusca(status);
                }
            });
        };
        
        // Função para mostrar/esconder loading
        function mostrarLoading(mostrar) {
            const loading = document.getElementById('addressLoading');
            if (loading) {
                if (mostrar) {
                    loading.style.display = 'flex';
                    loading.classList.add('active');
                } else {
                    loading.style.display = 'none';
                    loading.classList.remove('active');
                }
            }
        }
        
        // Função para preencher os campos
        function preencherCampos(lugar) {
            console.log('📝 Preenchendo campos com:', lugar);
            
            // Extrair dados dos componentes
            const componentes = lugar.address_components || [];
            const dados = {
                rua: '',
                numero: '',
                bairro: '',
                cidade: '',
                estado: '',
                cep: ''
            };
            
            componentes.forEach(componente => {
                const tipos = componente.types;
                
                if (tipos.includes('street_number')) {
                    dados.numero = componente.long_name;
                }
                if (tipos.includes('route')) {
                    dados.rua = componente.long_name;
                }
                if (tipos.includes('sublocality_level_1') || tipos.includes('neighborhood')) {
                    dados.bairro = componente.long_name;
                }
                if (tipos.includes('locality') || tipos.includes('administrative_area_level_2')) {
                    dados.cidade = componente.long_name;
                }
                if (tipos.includes('administrative_area_level_1')) {
                    dados.estado = componente.short_name;
                }
                if (tipos.includes('postal_code')) {
                    dados.cep = componente.long_name;
                }
            });
            
            // Preencher os campos do formulário
            preencherCampo('street', dados.rua);
            preencherCampo('number', dados.numero);
            preencherCampo('neighborhood', dados.bairro);
            preencherCampo('city', dados.cidade);
            preencherCampo('state', dados.estado);
            preencherCampo('cep', dados.cep);
            
            // Preencher nome do local se vazio
            const campoNome = document.getElementById('venueName');
            if (campoNome && !campoNome.value.trim()) {
                const nomeLocal = lugar.name || lugar.formatted_address.split(',')[0];
                preencherCampo('venueName', nomeLocal);
            }
            
            console.log('✅ Campos preenchidos:', dados);
            
            // Disparar eventos para validações
            ['street', 'number', 'neighborhood', 'city', 'state', 'cep', 'venueName'].forEach(id => {
                const campo = document.getElementById(id);
                if (campo) {
                    campo.dispatchEvent(new Event('change', { bubbles: true }));
                    campo.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        }
        
        // Função auxiliar para preencher campo individual
        function preencherCampo(id, valor) {
            const campo = document.getElementById(id);
            if (campo && valor) {
                campo.value = valor;
            }
        }
        
        // Função para mostrar os campos de endereço
        function mostrarCamposEndereco() {
            const camposEndereco = document.getElementById('addressFields');
            if (camposEndereco) {
                camposEndereco.style.display = 'block';
                camposEndereco.classList.remove('hidden');
                
                // Garantir que a grid também esteja visível
                const locationGrid = document.querySelector('.location-grid');
                if (locationGrid) {
                    locationGrid.style.display = 'grid';
                }
                
                console.log('✅ Campos de endereço exibidos');
            }
        }
        
        // Função para tratar erros da API
        function tratarErroBusca(status) {
            let mensagem = 'Endereço não encontrado. ';
            
            switch(status) {
                case 'ZERO_RESULTS':
                    mensagem += 'Tente ser mais específico.';
                    break;
                case 'OVER_QUERY_LIMIT':
                    mensagem += 'Muitas buscas. Aguarde um momento.';
                    break;
                case 'REQUEST_DENIED':
                    mensagem += 'Serviço negado. Verifique sua conexão.';
                    break;
                case 'INVALID_REQUEST':
                    mensagem += 'Solicitação inválida.';
                    break;
                default:
                    mensagem += 'Tente novamente em alguns segundos.';
            }
            
            alert(mensagem);
        }
        
        // Adicionar listener para Enter no campo de busca
        const camposBusca = document.getElementById('addressSearch');
        if (camposBusca) {
            camposBusca.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    searchAddressManual();
                }
            });
            
            console.log('✅ Listener Enter adicionado ao campo de busca');
        }
        
        console.log('✅ Sistema de busca de endereços inicializado');
    }
    
})();
