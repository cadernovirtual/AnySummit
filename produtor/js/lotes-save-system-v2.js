/**
 * Sistema de Salvamento de Lotes V2
 * Garante que os lotes sejam salvos corretamente
 */
(function() {
    console.log('💾 Sistema de salvamento de lotes V2 iniciado');
    
    // Função global para salvar lotes
    window.salvarLotesManualmente = function() {
        console.log('🔄 Salvando lotes manualmente...');
        
        const lotes = {
            porData: [],
            porPercentual: []
        };
        
        // Coletar lotes por data
        const lotesPorData = document.querySelectorAll('#lotesPorData .lote-card');
        console.log(`📅 Processando ${lotesPorData.length} lotes por data`);
        
        lotesPorData.forEach((card, index) => {
            const nome = card.querySelector('input[type="text"]')?.value || '';
            const dataInicio = card.querySelector('[data-field="data-inicio"]')?.value || '';
            const dataFim = card.querySelector('[data-field="data-fim"]')?.value || '';
            
            console.log(`Lote ${index + 1}: ${nome} (${dataInicio} - ${dataFim})`);
            
            if (nome || dataInicio || dataFim) {
                lotes.porData.push({
                    id: card.getAttribute('data-lote-id') || `lote_data_${Date.now()}_${index}`,
                    nome: nome,
                    data_inicio: dataInicio,
                    data_fim: dataFim,
                    tipo: 'data'
                });
            }
        });
        
        // Coletar lotes por percentual
        const lotesPorPercentual = document.querySelectorAll('#lotesPorPercentual .lote-card');
        console.log(`📊 Processando ${lotesPorPercentual.length} lotes por percentual`);
        
        lotesPorPercentual.forEach((card, index) => {
            const nome = card.querySelector('input[type="text"]')?.value || '';
            const percentual = card.querySelector('[data-field="percentual"]')?.value || '';
            
            console.log(`Lote ${index + 1}: ${nome} (${percentual}%)`);
            
            if (nome || percentual) {
                lotes.porPercentual.push({
                    id: card.getAttribute('data-lote-id') || `lote_perc_${Date.now()}_${index}`,
                    nome: nome,
                    percentual: percentual,
                    tipo: 'percentual'
                });
            }
        });
        
        // Salvar em múltiplos lugares
        console.log('💾 Salvando lotes em múltiplos lugares...');
        
        // 1. Cookie
        setCookie('wizard_lotes', JSON.stringify(lotes), 7);
        console.log('✅ Salvo em cookie');
        
        // 2. Window
        window.lotesData = lotes;
        console.log('✅ Salvo em window.lotesData');
        
        // 3. WizardSaveSystemV2
        if (window.WizardSaveSystemV2) {
            window.WizardSaveSystemV2.lotes = lotes;
            
            // Forçar salvamento completo
            if (window.WizardSaveSystemV2.salvarStep5) {
                window.WizardSaveSystemV2.salvarStep5();
                console.log('✅ Executado salvarStep5');
            }
            
            // Salvar em cookies
            if (window.WizardSaveSystemV2.salvarEmCookies) {
                window.WizardSaveSystemV2.salvarEmCookies();
                console.log('✅ Salvamento completo em cookies');
            }
        }
        
        console.log('📦 Total de lotes salvos:', {
            porData: lotes.porData.length,
            porPercentual: lotes.porPercentual.length,
            total: lotes.porData.length + lotes.porPercentual.length
        });
        
        return lotes;
    };
    
    // Função auxiliar setCookie
    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
    }
    
    // Interceptar adição/remoção de lotes
    document.addEventListener('click', function(e) {
        // Se clicou em adicionar ou remover lote
        if (e.target.closest('.btn-add-lote') || 
            e.target.closest('.btn-remove-lote') ||
            e.target.closest('[onclick*="adicionarLote"]') ||
            e.target.closest('[onclick*="removerLote"]')) {
            
            console.log('🔄 Mudança em lotes detectada');
            
            // Salvar após pequeno delay para DOM atualizar
            setTimeout(() => {
                salvarLotesManualmente();
            }, 500);
        }
    });
    
    // Salvar quando sair da etapa 5
    const originalNextStep = window.nextStep;
    window.nextStep = function() {
        const stepAtual = window.currentStep || 1;
        
        // Se está saindo da etapa 5
        if (stepAtual === 5) {
            console.log('📤 Saindo da etapa 5, salvando lotes...');
            salvarLotesManualmente();
        }
        
        // Chamar função original
        if (originalNextStep) {
            return originalNextStep.apply(this, arguments);
        }
    };
    
    console.log('✅ Sistema de salvamento de lotes instalado');
    console.log('💡 Use salvarLotesManualmente() para salvar lotes a qualquer momento');
})();