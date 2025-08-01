/**
 * Sistema de Recuperação de Lotes V2
 * Recupera e reconstrói lotes salvos
 */
(function() {
    console.log('📦 Sistema de recuperação de lotes V2 iniciado');
    
    // Função para recuperar lotes
    window.recuperarLotes = function() {
        console.log('🔄 Recuperando lotes...');
        
        let lotesData = null;
        
        // Tentar recuperar do WizardSaveSystemV2
        if (window.WizardSaveSystemV2 && window.WizardSaveSystemV2.lotes) {
            lotesData = window.WizardSaveSystemV2.lotes;
        }
        
        // Tentar recuperar do cookie
        if (!lotesData) {
            const cookieLotes = getCookie('lotesData');
            if (cookieLotes) {
                try {
                    lotesData = JSON.parse(cookieLotes);
                } catch (e) {
                    console.error('Erro ao parsear lotes:', e);
                }
            }
        }
        
        // Tentar recuperar do window.lotesData
        if (!lotesData && window.lotesData) {
            lotesData = window.lotesData;
        }
        
        if (!lotesData || (!lotesData.porData?.length && !lotesData.porPercentual?.length)) {
            console.log('❌ Nenhum lote para recuperar');
            return;
        }
        
        console.log('✅ Lotes encontrados:', lotesData);
        
        // Limpar container de lotes existentes
        const containerPorData = document.getElementById('lotesPorData');
        const containerPorPercentual = document.getElementById('lotesPorPercentual');
        
        if (containerPorData) {
            containerPorData.innerHTML = '';
        }
        if (containerPorPercentual) {
            containerPorPercentual.innerHTML = '';
        }
        
        // Recuperar lotes por data
        if (lotesData.porData && lotesData.porData.length > 0) {
            lotesData.porData.forEach((lote, index) => {
                console.log(`📅 Recuperando lote por data ${index + 1}:`, lote);
                
                // Se existir função de adicionar lote, usar ela
                if (window.adicionarLotePorData) {
                    window.adicionarLotePorData();
                    
                    // Aguardar DOM atualizar e preencher campos
                    setTimeout(() => {
                        const cards = document.querySelectorAll('#lotesPorData .lote-card');
                        const ultimoCard = cards[cards.length - 1];
                        
                        if (ultimoCard) {
                            // Preencher nome
                            const nomeInput = ultimoCard.querySelector('input[type="text"]');
                            if (nomeInput && lote.nome) {
                                nomeInput.value = lote.nome;
                            }
                            
                            // Preencher datas
                            const dataInicio = ultimoCard.querySelector('[data-field="data-inicio"]');
                            const dataFim = ultimoCard.querySelector('[data-field="data-fim"]');
                            
                            if (dataInicio && lote.data_inicio) {
                                dataInicio.value = lote.data_inicio;
                            }
                            if (dataFim && lote.data_fim) {
                                dataFim.value = lote.data_fim;
                            }
                            
                            // Definir ID do lote
                            if (lote.id) {
                                ultimoCard.setAttribute('data-lote-id', lote.id);
                            }
                        }
                    }, 100 * (index + 1));
                }
            });
        }
        
        // Recuperar lotes por percentual
        if (lotesData.porPercentual && lotesData.porPercentual.length > 0) {
            lotesData.porPercentual.forEach((lote, index) => {
                console.log(`📊 Recuperando lote por percentual ${index + 1}:`, lote);
                
                // Se existir função de adicionar lote, usar ela
                if (window.adicionarLotePorPercentual) {
                    window.adicionarLotePorPercentual();
                    
                    // Aguardar DOM atualizar e preencher campos
                    setTimeout(() => {
                        const cards = document.querySelectorAll('#lotesPorPercentual .lote-card');
                        const ultimoCard = cards[cards.length - 1];
                        
                        if (ultimoCard) {
                            // Preencher nome
                            const nomeInput = ultimoCard.querySelector('input[type="text"]');
                            if (nomeInput && lote.nome) {
                                nomeInput.value = lote.nome;
                            }
                            
                            // Preencher percentual
                            const percentualInput = ultimoCard.querySelector('[data-field="percentual"]');
                            if (percentualInput && lote.percentual) {
                                percentualInput.value = lote.percentual;
                            }
                            
                            // Definir ID do lote
                            if (lote.id) {
                                ultimoCard.setAttribute('data-lote-id', lote.id);
                            }
                        }
                    }, 100 * (index + 1));
                }
            });
        }
        
        // Atualizar window.lotesData
        window.lotesData = lotesData;
        
        console.log('✅ Lotes recuperados com sucesso');
    };
    
    // Função auxiliar getCookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
        return null;
    }
    
    // Adicionar à recuperação completa
    if (window.recuperarDadosSalvos) {
        const originalRecuperar = window.recuperarDadosSalvos;
        window.recuperarDadosSalvos = function() {
            originalRecuperar();
            setTimeout(() => {
                window.recuperarLotes();
            }, 500);
        };
    }
})();