/**
 * FIX DEFINITIVO - Conexão correta entre lotes e WizardDataCollector
 * Resolve problemas de salvamento e recuperação de lotes
 */

(function() {
    'use strict';
    
    console.log('🔧 Fix definitivo de lotes iniciando...');
    
    // 1. GARANTIR QUE LOTES SÃO SALVOS NO WIZARDDATACOLLECTOR
    window.sincronizarLotesComCollector = function() {
        console.log('🔄 Sincronizando lotes com WizardDataCollector...');
        
        if (!window.WizardDataCollector) {
            console.error('❌ WizardDataCollector não existe!');
            return;
        }
        
        // Garantir estrutura
        if (!window.WizardDataCollector.dados) {
            window.WizardDataCollector.dados = {};
        }
        
        window.WizardDataCollector.dados.lotes = [];
        
        // Coletar de window.lotesData
        if (window.lotesData) {
            // Lotes por data
            if (window.lotesData.porData) {
                window.lotesData.porData.forEach(lote => {
                    window.WizardDataCollector.dados.lotes.push({
                        id: lote.id,
                        tipo: 'data',
                        nome: lote.nome,
                        data_inicio: lote.dataInicio,
                        data_fim: lote.dataFim,
                        divulgar: lote.divulgar || false
                    });
                });
            }
            
            // Lotes por percentual
            if (window.lotesData.porPercentual) {
                window.lotesData.porPercentual.forEach(lote => {
                    window.WizardDataCollector.dados.lotes.push({
                        id: lote.id,
                        tipo: 'percentual',
                        nome: lote.nome,
                        percentual: lote.percentual,
                        divulgar: lote.divulgar || false
                    });
                });
            }
        }
        
        // Salvar no localStorage
        localStorage.setItem('wizardDataCollector', JSON.stringify(window.WizardDataCollector));
        console.log('💾 Lotes sincronizados:', window.WizardDataCollector.dados.lotes);
    };
    
    // 2. INTERCEPTAR TODAS AS FUNÇÕES QUE MODIFICAM LOTES
    const funcoesLotes = [
        'adicionarLotePorData',
        'adicionarLotePorPercentual',
        'salvarEdicaoLoteData',
        'salvarEdicaoLotePercentual',
        'excluirLoteData',
        'excluirLotePercentual'
    ];
    
    funcoesLotes.forEach(funcName => {
        const checkAndOverride = setInterval(() => {
            if (window[funcName]) {
                clearInterval(checkAndOverride);
                
                const original = window[funcName];
                window[funcName] = function() {
                    console.log(`🎯 ${funcName} interceptado`);
                    
                    // Chamar original
                    const result = original.apply(this, arguments);
                    
                    // Sincronizar após operação
                    setTimeout(() => {
                        window.sincronizarLotesComCollector();
                    }, 100);
                    
                    return result;
                };
                console.log(`✅ Override aplicado em ${funcName}`);
            }
        }, 500);
    });
    
    // 3. RECUPERAR LOTES DO WIZARDDATACOLLECTOR
    window.recuperarLotesDoCollector = function() {
        console.log('📂 Recuperando lotes do WizardDataCollector...');
        
        const saved = localStorage.getItem('wizardDataCollector');
        if (!saved) {
            console.log('❌ Nenhum dado salvo no WizardDataCollector');
            return false;
        }
        
        try {
            const data = JSON.parse(saved);
            if (!data.dados || !data.dados.lotes || data.dados.lotes.length === 0) {
                console.log('❌ Nenhum lote encontrado no WizardDataCollector');
                return false;
            }
            
            // Garantir estrutura
            if (!window.lotesData) {
                window.lotesData = { porData: [], porPercentual: [] };
            }
            
            // Limpar arrays
            window.lotesData.porData = [];
            window.lotesData.porPercentual = [];
            
            // Processar lotes
            data.dados.lotes.forEach(lote => {
                if (lote.tipo === 'data') {
                    window.lotesData.porData.push({
                        id: lote.id,
                        nome: lote.nome,
                        dataInicio: lote.data_inicio,
                        dataFim: lote.data_fim,
                        divulgar: lote.divulgar || false
                    });
                } else if (lote.tipo === 'percentual') {
                    window.lotesData.porPercentual.push({
                        id: lote.id,
                        nome: lote.nome,
                        percentual: lote.percentual,
                        divulgar: lote.divulgar || false
                    });
                }
            });
            
            console.log('✅ Lotes recuperados:', window.lotesData);
            
            // Salvar no cookie também
            if (window.salvarLotesNoCookie) {
                window.salvarLotesNoCookie();
            }
            
            return true;
            
        } catch (e) {
            console.error('Erro ao recuperar lotes:', e);
            return false;
        }
    };
    
    // 4. RENDERIZAÇÃO FORÇADA COM RECUPERAÇÃO
    window.renderizarLotesCompleto = function() {
        console.log('🎨 Renderização completa de lotes...');
        
        // Primeiro tentar recuperar
        window.recuperarLotesDoCollector();
        
        // Depois renderizar
        setTimeout(() => {
            if (window.renderizarLotesPorData) {
                window.renderizarLotesPorData();
                console.log('✅ Lotes por data renderizados');
            }
            if (window.renderizarLotesPorPercentual) {
                window.renderizarLotesPorPercentual();
                console.log('✅ Lotes por percentual renderizados');
            }
            if (window.atualizarSelectsLotes) {
                window.atualizarSelectsLotes();
            }
        }, 100);
    };
    
    // 5. OBSERVER MELHORADO PARA STEP 5
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                
                // Quando ENTRA no step 5
                if (target.dataset && target.dataset.stepContent === '5' && 
                    target.classList.contains('active') && 
                    !target.classList.contains('was-active')) {
                    
                    console.log('📍 Entrando no step 5');
                    target.classList.add('was-active');
                    
                    setTimeout(() => {
                        window.renderizarLotesCompleto();
                    }, 300);
                }
                
                // Quando SAI do step 5
                if (target.dataset && target.dataset.stepContent === '5' && 
                    !target.classList.contains('active') && 
                    target.classList.contains('was-active')) {
                    
                    console.log('📤 Saindo do step 5');
                    target.classList.remove('was-active');
                    
                    window.sincronizarLotesComCollector();
                }
            }
        });
    });
    
    // 6. OVERRIDE DO salvarLotesNoCookie PARA TAMBÉM SALVAR NO COLLECTOR
    setTimeout(() => {
        if (window.salvarLotesNoCookie) {
            const originalSalvar = window.salvarLotesNoCookie;
            window.salvarLotesNoCookie = function() {
                console.log('💾 salvarLotesNoCookie interceptado');
                
                // Chamar original
                const result = originalSalvar.apply(this, arguments);
                
                // Também sincronizar com collector
                window.sincronizarLotesComCollector();
                
                return result;
            };
        }
    }, 1000);
    
    // 7. FIX PARA O BOTÃO VOLTAR
    setTimeout(() => {
        const originalPrevStep = window.prevStep;
        if (originalPrevStep) {
            window.prevStep = function() {
                console.log('⬅️ prevStep interceptado (fix definitivo)');
                
                const currentStep = window.getCurrentStep ? window.getCurrentStep() : 1;
                
                // Se está no step 5, sincronizar antes
                if (currentStep === 5) {
                    window.sincronizarLotesComCollector();
                }
                
                // Chamar original
                const result = originalPrevStep.apply(this, arguments);
                
                // Forçar update do display
                setTimeout(() => {
                    if (window.updateStepDisplay) {
                        window.updateStepDisplay();
                    }
                }, 50);
                
                return result;
            };
        }
    }, 2000);
    
    // 8. CONFIGURAR OBSERVERS QUANDO DOM CARREGAR
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('[data-step-content]').forEach(el => {
            observer.observe(el, { attributes: true, attributeFilter: ['class'] });
        });
        
        console.log('👁️ Observers configurados');
    });
    
    // 9. COMANDO DE DEBUG
    window.debugLotesCompleto = function() {
        console.log('=== DEBUG LOTES COMPLETO ===');
        console.log('window.lotesData:', window.lotesData);
        console.log('Cookie lotesData:', getCookie('lotesData'));
        
        const saved = localStorage.getItem('wizardDataCollector');
        if (saved) {
            const data = JSON.parse(saved);
            console.log('Lotes no WizardDataCollector:', data.dados.lotes);
        }
        
        console.log('Lotes no DOM (data):', document.querySelectorAll('#lotesPorDataList .lote-card').length);
        console.log('Lotes no DOM (percentual):', document.querySelectorAll('#lotesPercentualList .lote-card').length);
    };
    
    // Helper
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    console.log('✅ Fix definitivo de lotes carregado!');
    console.log('💡 Comandos disponíveis:');
    console.log('   renderizarLotesCompleto() - Recupera e renderiza');
    console.log('   sincronizarLotesComCollector() - Salva no collector');
    console.log('   recuperarLotesDoCollector() - Recupera do collector');
    console.log('   debugLotesCompleto() - Debug completo');
    
})();
