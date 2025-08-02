/**
 * Recuperação de Dados Específicos V2
 * Recupera classificação, categoria, endereço e lotes
 */
(function() {
    console.log('🔄 Sistema de recuperação específica iniciado');
    
    // Função para recuperar dados específicos
    window.recuperarDadosEspecificos = function() {
        console.log('📥 Recuperando dados específicos...');
        
        // Recuperar classificação e categoria
        const classification = getCookie('wizard_classification');
        const category = getCookie('wizard_category');
        
        if (classification) {
            const classField = document.getElementById('classification');
            if (classField) {
                classField.value = classification;
                console.log('✅ Classificação recuperada:', classification);
            }
        }
        
        if (category) {
            const catField = document.getElementById('category');
            if (catField) {
                catField.value = category;
                console.log('✅ Categoria recuperada:', category);
            }
        }
        
        // Recuperar endereço
        const enderecoJson = getCookie('wizard_endereco');
        if (enderecoJson) {
            try {
                const endereco = JSON.parse(enderecoJson);
                console.log('📍 Endereço encontrado:', endereco);
                
                // Preencher campos
                if (endereco.cep) document.getElementById('cep').value = endereco.cep;
                if (endereco.rua) document.getElementById('street').value = endereco.rua;
                if (endereco.numero) document.getElementById('number').value = endereco.numero;
                if (endereco.complemento) document.getElementById('complement').value = endereco.complemento;
                if (endereco.bairro) document.getElementById('neighborhood').value = endereco.bairro;
                if (endereco.cidade) document.getElementById('city').value = endereco.cidade;
                if (endereco.estado) document.getElementById('state').value = endereco.estado;
                if (endereco.pais) document.getElementById('country').value = endereco.pais;
                
                console.log('✅ Endereço recuperado');
            } catch (e) {
                console.error('Erro ao recuperar endereço:', e);
            }
        }
        
        // Recuperar lotes
        const lotesJson = getCookie('wizard_lotes');
        if (lotesJson) {
            try {
                const lotes = JSON.parse(lotesJson);
                console.log('📦 Lotes encontrados:', lotes);
                
                // Recuperar lotes por data
                if (lotes.porData && lotes.porData.length > 0) {
                    lotes.porData.forEach((lote, index) => {
                        // Adicionar lote se a função existir
                        if (window.adicionarLotePorData) {
                            window.adicionarLotePorData();
                            
                            setTimeout(() => {
                                const cards = document.querySelectorAll('#lotesPorData .lote-card');
                                const card = cards[cards.length - 1];
                                
                                if (card) {
                                    const nomeInput = card.querySelector('input[type="text"]');
                                    const dataInicio = card.querySelector('[data-field="data-inicio"]');
                                    const dataFim = card.querySelector('[data-field="data-fim"]');
                                    
                                    if (nomeInput) nomeInput.value = lote.nome;
                                    if (dataInicio) dataInicio.value = lote.data_inicio;
                                    if (dataFim) dataFim.value = lote.data_fim;
                                    if (lote.id) card.setAttribute('data-lote-id', lote.id);
                                }
                            }, 100 * (index + 1));
                        }
                    });
                }
                
                // Recuperar lotes por percentual
                if (lotes.porPercentual && lotes.porPercentual.length > 0) {
                    lotes.porPercentual.forEach((lote, index) => {
                        // Adicionar lote se a função existir
                        if (window.adicionarLotePorPercentual) {
                            window.adicionarLotePorPercentual();
                            
                            setTimeout(() => {
                                const cards = document.querySelectorAll('#lotesPorPercentual .lote-card');
                                const card = cards[cards.length - 1];
                                
                                if (card) {
                                    const nomeInput = card.querySelector('input[type="text"]');
                                    const percentualInput = card.querySelector('[data-field="percentual"]');
                                    
                                    if (nomeInput) nomeInput.value = lote.nome;
                                    if (percentualInput) percentualInput.value = lote.percentual;
                                    if (lote.id) card.setAttribute('data-lote-id', lote.id);
                                }
                            }, 100 * (index + 1));
                        }
                    });
                }
                
                // Salvar em window.lotesData
                window.lotesData = lotes;
                console.log('✅ Lotes recuperados');
            } catch (e) {
                console.error('Erro ao recuperar lotes:', e);
            }
        }
    };
    
    // Função auxiliar getCookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
        return null;
    }
    
    // Adicionar à função de recuperação principal
    const originalRecuperar = window.recuperarDadosSalvos;
    window.recuperarDadosSalvos = function() {
        if (originalRecuperar) {
            originalRecuperar();
        }
        
        // Adicionar pequeno delay para garantir que DOM está pronto
        setTimeout(() => {
            window.recuperarDadosEspecificos();
        }, 200);
    };
    
    console.log('✅ Sistema de recuperação específica instalado');
})();