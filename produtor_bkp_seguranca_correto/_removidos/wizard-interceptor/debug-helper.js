/**
 * Debug Helper para Wizard Data Collector
 * Adiciona funcionalidades de debug e monitoramento
 */

(function() {
    'use strict';
    
    console.log('🐛 Debug Helper iniciando...');
    
    // Função para monitorar mudanças no window.lotesData
    function monitorarLotes() {
        // Verificar a cada segundo se lotesData existe e mudou
        setInterval(() => {
            if (window.lotesData) {
                const lotesString = JSON.stringify(window.lotesData);
                if (window._lastLotesString !== lotesString) {
                    window._lastLotesString = lotesString;
                    console.log('📦 window.lotesData mudou:', window.lotesData);
                    
                    // Atualizar automaticamente o coletor
                    if (window.WizardDataCollector && window.WizardDataCollector.dados) {
                        const stepAtual = window.getCurrentStep ? window.getCurrentStep() : 
                                         (window.wizardState ? window.wizardState.currentStep : 5);
                        
                        if (stepAtual >= 5) {
                            // Coletar lotes automaticamente quando mudarem
                            coletarLotesManual();
                        }
                    }
                }
            }
        }, 1000);
    }
    
    // Função para monitorar mudanças nos ingressos
    function monitorarIngressos() {
        setInterval(() => {
            // Monitorar temporaryTickets
            if (window.temporaryTickets) {
                let ticketsString = '';
                if (window.temporaryTickets instanceof Map) {
                    ticketsString = JSON.stringify(Array.from(window.temporaryTickets.entries()));
                } else if (window.temporaryTickets.tickets) {
                    ticketsString = JSON.stringify(window.temporaryTickets.tickets);
                }
                
                if (window._lastTicketsString !== ticketsString && ticketsString) {
                    window._lastTicketsString = ticketsString;
                    console.log('🎫 Ingressos mudaram:', window.temporaryTickets);
                    
                    // Coletar automaticamente
                    if (window.coletarDadosStepAtual) {
                        window.coletarDadosStepAtual(6);
                    }
                }
            }
        }, 1000);
    }
    
    // Função para coletar lotes manualmente
    function coletarLotesManual() {
        if (!window.WizardDataCollector) return;
        
        const dados = window.WizardDataCollector.dados;
        dados.lotes = [];
        
        if (window.lotesData) {
            // Lotes por data
            if (window.lotesData.porData && Array.isArray(window.lotesData.porData)) {
                window.lotesData.porData.forEach((lote, index) => {
                    dados.lotes.push({
                        id: lote.id || `lote_data_${index + 1}`,
                        nome: lote.nome || '',
                        tipo: 'data',
                        data_inicio: lote.dataInicio || '',
                        data_fim: lote.dataFim || '',
                        divulgar: lote.divulgar || false
                    });
                });
            }
            
            // Lotes por percentual
            if (window.lotesData.porPercentual && Array.isArray(window.lotesData.porPercentual)) {
                window.lotesData.porPercentual.forEach((lote, index) => {
                    dados.lotes.push({
                        id: lote.id || `lote_perc_${index + 1}`,
                        nome: lote.nome || '',
                        tipo: 'percentual',
                        percentual: lote.percentual || '',
                        divulgar: lote.divulgar || false
                    });
                });
            }
            
            // Salvar no localStorage
            localStorage.setItem('wizardCollectedData', JSON.stringify(window.WizardDataCollector));
            console.log('✅ Lotes coletados manualmente:', dados.lotes);
        }
    }
    
    // Função para debug completo
    window.debugWizardCollector = function() {
        console.group('🔍 DEBUG WIZARD COLLECTOR');
        
        console.log('1. WizardDataCollector:', window.WizardDataCollector);
        console.log('2. lotesData:', window.lotesData);
        console.log('3. uploadedImages:', window.uploadedImages);
        console.log('4. ingressosData:', window.ingressosData);
        console.log('5. temporaryTickets:', window.temporaryTickets);
        
        // Verificar cookies
        console.group('🍪 Cookies');
        console.log('lotesData cookie:', getCookie('lotesData'));
        console.log('eventoWizard cookie:', getCookie('eventoWizard'));
        console.groupEnd();
        
        // Verificar localStorage
        console.group('💾 LocalStorage');
        console.log('wizardDataCollector:', localStorage.getItem('wizardCollectedData'));
        console.groupEnd();
        
        console.groupEnd();
    };
    
    // Função helper para buscar cookies
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    // Função para forçar coleta de todos os dados
    window.forcarColetaCompleta = function() {
        console.log('🔄 Forçando coleta completa de dados...');
        
        // Coletar todos os steps
        for (let i = 1; i <= 8; i++) {
            if (window.coletarDadosStepAtual) {
                window.coletarDadosStepAtual(i);
            }
        }
        
        // Forçar coleta de lotes
        coletarLotesManual();
        
        console.log('✅ Coleta completa finalizada:', window.WizardDataCollector);
    };
    
    // Expor função de coleta manual
    window.coletarLotesManual = coletarLotesManual;
    
    // Comando de emergência para verificar persistência
    window.verificarPersistencia = function() {
        console.log('🔍 === VERIFICANDO PERSISTÊNCIA ===');
        
        // 1. Verificar localStorage
        const dadosLocalStorage = localStorage.getItem('wizardCollectedData');
        console.log('📦 localStorage wizardDataCollector:', dadosLocalStorage ? 'EXISTE' : 'NÃO EXISTE');
        if (dadosLocalStorage) {
            console.log('Tamanho:', dadosLocalStorage.length, 'caracteres');
            console.log('Dados:', JSON.parse(dadosLocalStorage));
        }
        
        // 2. Verificar window.WizardDataCollector
        console.log('🪟 window.WizardDataCollector:', window.WizardDataCollector ? 'EXISTE' : 'NÃO EXISTE');
        if (window.WizardDataCollector) {
            console.log('Dados:', window.WizardDataCollector);
        }
        
        // 3. Verificar interceptação
        console.log('🎯 window.nextStep:', typeof window.nextStep);
        
        // 4. Testar coleta manual
        console.log('🧪 Testando coleta manual...');
        const stepAtual = window.getCurrentStep ? window.getCurrentStep() : 1;
        window.coletarDadosStepAtual(stepAtual);
        
        console.log('=== FIM DA VERIFICAÇÃO ===');
    };
    
    // Iniciar monitoramento
    monitorarLotes();
    monitorarIngressos();
    
    console.log('✅ Debug Helper configurado!');
    console.log('💡 Use debugWizardCollector() para debug completo');
    console.log('💡 Use forcarColetaCompleta() para forçar coleta de todos os dados');
    console.log('💡 Use verificarPersistencia() para verificar se está salvando');
    
})();
