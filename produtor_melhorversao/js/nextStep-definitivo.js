/**
 * FUNÇÃO NEXTSTEP DEFINITIVA - SOBRESCREVE TODAS AS OUTRAS
 * 
 * Esta função é carregada por último e sobrescreve todas as implementações anteriores
 * para garantir que a validação correta seja executada.
 */

console.log('🔧 NEXTSTEP-DEFINITIVO.JS CARREGANDO...');

// Aguardar que todas as outras funções carreguem
setTimeout(() => {
    console.log('🚀 Sobrescrevendo função nextStep com versão definitiva...');
    
    /**
     * Função nextStep SIMPLES - apenas valida e avança
     */
    window.nextStep = async function() {
        console.log('🚀 [SIMPLES] nextStep executado');
        
        try {
            // Determinar step atual apenas do DOM (mais confiável)
            const stepAtivo = document.querySelector('.step.active');
            const currentStep = stepAtivo ? parseInt(stepAtivo.dataset.step) : 5;
            
            console.log('📍 Step atual:', currentStep);
            
            // Se estiver na etapa 5, validar lotes
            if (currentStep === 5) {
                console.log('🔍 Validando etapa 5 - verificando se há lotes...');
                
                try {
                    // Carregamento SIMPLES dos lotes
                    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
                    const response = await fetch('/produtor/ajax/wizard_evento.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: `action=recuperar_evento_simples&evento_id=${eventoId}`
                    });
                    
                    const data = await response.json();
                    const lotes = data.evento?.lotes || [];
                    
                    console.log('📦 Lotes encontrados:', lotes.length);
                    
                    // Validação SIMPLES: apenas >= 1 lote
                    if (lotes.length === 0) {
                        console.log('❌ Validação falhou - sem lotes');
                        alert('É necessário criar pelo menos 1 lote para prosseguir');
                        return;
                    }
                    
                    console.log('✅ Validação passou');
                    
                } catch (error) {
                    console.error('❌ Erro na validação:', error);
                    alert('Erro ao validar lotes');
                    return;
                }
            }
            
            // AVANÇAR - atualizar DOM e TODAS as variáveis
            const proximoStep = currentStep + 1;
            console.log('➡️ Avançando para step:', proximoStep);
            
            // Atualizar TODAS as variáveis globais para manter sincronia
            window.currentStep = proximoStep;
            if (window.wizardState) {
                window.wizardState.currentStep = proximoStep;
            }
            
            // Atualizar step ativo no DOM
            document.querySelectorAll('.step').forEach(step => {
                const stepNum = parseInt(step.dataset.step);
                step.classList.remove('active', 'completed');
                if (stepNum === proximoStep) {
                    step.classList.add('active');
                } else if (stepNum < proximoStep) {
                    step.classList.add('completed');
                }
            });
            
            // Atualizar cards ativos
            document.querySelectorAll('.section-card').forEach(card => {
                const stepContent = parseInt(card.dataset.stepContent);
                card.classList.remove('active', 'prev');
                if (stepContent === proximoStep) {
                    card.classList.add('active');
                } else if (stepContent < proximoStep) {
                    card.classList.add('prev');
                }
            });
            
            console.log('✅ Avanço concluído - Step atualizado para:', proximoStep);
            console.log('📝 Variáveis atualizadas: window.currentStep =', window.currentStep);
            
        } catch (error) {
            console.error('❌ Erro no nextStep:', error);
        }
    };
    
    /**
     * Função prevStep SIMPLES - apenas volta uma etapa
     */
    window.prevStep = function() {
        console.log('⬅️ [SIMPLES] prevStep executado');
        
        try {
            // Determinar step atual do DOM
            const stepAtivo = document.querySelector('.step.active');
            const currentStep = stepAtivo ? parseInt(stepAtivo.dataset.step) : 6;
            
            console.log('📍 Step atual:', currentStep);
            
            if (currentStep > 1) {
                const stepAnterior = currentStep - 1;
                console.log('⬅️ Voltando para step:', stepAnterior);
                
                // Atualizar TODAS as variáveis globais
                window.currentStep = stepAnterior;
                if (window.wizardState) {
                    window.wizardState.currentStep = stepAnterior;
                }
                
                // Atualizar step ativo no DOM
                document.querySelectorAll('.step').forEach(step => {
                    const stepNum = parseInt(step.dataset.step);
                    step.classList.remove('active', 'completed');
                    if (stepNum === stepAnterior) {
                        step.classList.add('active');
                    } else if (stepNum < stepAnterior) {
                        step.classList.add('completed');
                    }
                });
                
                // Atualizar cards ativos
                document.querySelectorAll('.section-card').forEach(card => {
                    const stepContent = parseInt(card.dataset.stepContent);
                    card.classList.remove('active', 'prev');
                    if (stepContent === stepAnterior) {
                        card.classList.add('active');
                    } else if (stepContent < stepAnterior) {
                        card.classList.add('prev');
                    }
                });
                
                console.log('✅ Retrocesso concluído - Step atualizado para:', stepAnterior);
                console.log('📝 Variáveis atualizadas: window.currentStep =', window.currentStep);
                
            } else {
                console.log('⚠️ Já está no primeiro step');
            }
            
        } catch (error) {
            console.error('❌ Erro no prevStep:', error);
        }
    };
    
    console.log('✅ Função nextStep definitiva instalada');
    
}, 2000); // Aguardar 2 segundos para todos os outros scripts carregarem

console.log('✅ NEXTSTEP-DEFINITIVO.JS CARREGADO!');
