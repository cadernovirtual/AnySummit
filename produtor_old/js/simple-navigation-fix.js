/**
 * Solução SIMPLES e DIRETA para navegação do wizard
 */
(function() {
    console.log('🔧 Solução simples de navegação iniciada');
    
    // Variável global para step atual
    window.currentStep = window.currentStep || 1;
    
    // Função nextStep SIMPLES
    window.nextStep = function() {
        console.log('➡️ nextStep chamado, step atual:', window.currentStep);
        
        // Validar step atual
        if (window.validateStep && typeof window.validateStep === 'function') {
            if (!window.validateStep(window.currentStep)) {
                console.log('❌ Validação falhou');
                return false;
            }
        }
        
        // Avançar para próximo
        if (window.currentStep < 8) {
            // Esconder step atual
            const stepAtual = document.querySelector(`.section-card[data-step-content="${window.currentStep}"]`);
            if (stepAtual) {
                stepAtual.classList.remove('active');
                stepAtual.style.display = 'none';
            }
            
            // Incrementar
            window.currentStep++;
            
            // Mostrar próximo step
            const proximoStep = document.querySelector(`.section-card[data-step-content="${window.currentStep}"]`);
            if (proximoStep) {
                proximoStep.classList.add('active');
                proximoStep.style.display = 'block';
            }
            
            // Atualizar indicadores
            atualizarIndicadores();
            
            // Salvar dados se existir o sistema
            if (window.WizardSaveSystemV2) {
                window.WizardSaveSystemV2.salvarStepAtual(window.currentStep - 1);
            }
            
            // Salvar dados específicos do step DEPOIS do salvamento principal
            setTimeout(() => {
                salvarDadosDoStep(window.currentStep - 1);
            }, 100);
            
            // Scroll para o topo
            window.scrollTo(0, 0);
            
            console.log('✅ Avançou para step:', window.currentStep);
        }
    };
    
    // Função prevStep SIMPLES
    window.prevStep = function() {
        console.log('⬅️ prevStep chamado, step atual:', window.currentStep);
        
        if (window.currentStep > 1) {
            // Salvar dados antes de voltar
            if (window.WizardSaveSystemV2) {
                window.WizardSaveSystemV2.salvarStepAtual(window.currentStep);
            }
            salvarDadosDoStep(window.currentStep);
            
            // Esconder step atual
            const stepAtual = document.querySelector(`.section-card[data-step-content="${window.currentStep}"]`);
            if (stepAtual) {
                stepAtual.classList.remove('active');
                stepAtual.style.display = 'none';
            }
            
            // Decrementar
            window.currentStep--;
            
            // Mostrar step anterior
            const stepAnterior = document.querySelector(`.section-card[data-step-content="${window.currentStep}"]`);
            if (stepAnterior) {
                stepAnterior.classList.add('active');
                stepAnterior.style.display = 'block';
            }
            
            // Atualizar indicadores
            atualizarIndicadores();
            
            // Scroll para o topo
            window.scrollTo(0, 0);
            
            console.log('✅ Voltou para step:', window.currentStep);
        }
    };
    
    // Função para atualizar indicadores
    function atualizarIndicadores() {
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNum < window.currentStep) {
                step.classList.add('completed');
            } else if (stepNum === window.currentStep) {
                step.classList.add('active');
            }
        });
        
        // Atualizar botão voltar
        const btnBack = document.querySelector('.btn-back');
        if (btnBack) {
            btnBack.disabled = window.currentStep === 1;
        }
    }
    
    // Função para salvar dados específicos de cada step
    function salvarDadosDoStep(stepNumber) {
        console.log(`💾 Salvando dados do step ${stepNumber}`);
        
        switch(stepNumber) {
            case 1:
                // Step 1 já é salvo pelo WizardSaveSystemV2
                break;
                
            case 2:
                // Salvar classificação e categoria
                const classification = document.getElementById('classification');
                const category = document.getElementById('category');
                
                if (classification) {
                    setCookie('wizard_classification', classification.value, 7);
                }
                if (category) {
                    setCookie('wizard_category', category.value, 7);
                }
                console.log('✅ Classificação e categoria salvos');
                break;
                
            case 4:
                // Salvar endereço completo
                const endereco = {
                    cep: document.getElementById('cep')?.value || '',
                    rua: document.getElementById('street')?.value || '',
                    numero: document.getElementById('number')?.value || '',
                    complemento: document.getElementById('complement')?.value || '',
                    bairro: document.getElementById('neighborhood')?.value || '',
                    cidade: document.getElementById('city')?.value || '',
                    estado: document.getElementById('state')?.value || '',
                    pais: document.getElementById('country')?.value || 'Brasil'
                };
                setCookie('wizard_endereco', JSON.stringify(endereco), 7);
                console.log('✅ Endereço salvo:', endereco);
                break;
                
            case 5:
                // Salvar lotes
                console.log('🔄 Iniciando salvamento de lotes...');
                
                const lotes = {
                    porData: [],
                    porPercentual: []
                };
                
                // Lotes por data
                const lotesPorDataElements = document.querySelectorAll('#lotesPorData .lote-card');
                console.log(`📅 Encontrados ${lotesPorDataElements.length} lotes por data`);
                
                lotesPorDataElements.forEach(card => {
                    const nome = card.querySelector('input[type="text"]')?.value || '';
                    const dataInicio = card.querySelector('[data-field="data-inicio"]')?.value || '';
                    const dataFim = card.querySelector('[data-field="data-fim"]')?.value || '';
                    
                    if (nome || dataInicio || dataFim) {
                        lotes.porData.push({
                            id: card.getAttribute('data-lote-id') || Date.now().toString(),
                            nome: nome,
                            data_inicio: dataInicio,
                            data_fim: dataFim
                        });
                    }
                });
                
                // Lotes por percentual
                const lotesPorPercentualElements = document.querySelectorAll('#lotesPorPercentual .lote-card');
                console.log(`📊 Encontrados ${lotesPorPercentualElements.length} lotes por percentual`);
                
                lotesPorPercentualElements.forEach(card => {
                    const nome = card.querySelector('input[type="text"]')?.value || '';
                    const percentual = card.querySelector('[data-field="percentual"]')?.value || '';
                    
                    if (nome || percentual) {
                        lotes.porPercentual.push({
                            id: card.getAttribute('data-lote-id') || Date.now().toString(),
                            nome: nome,
                            percentual: percentual
                        });
                    }
                });
                
                setCookie('wizard_lotes', JSON.stringify(lotes), 7);
                window.lotesData = lotes; // Manter também em memória
                
                // Também salvar no WizardSaveSystemV2
                if (window.WizardSaveSystemV2 && window.WizardSaveSystemV2.salvarStep5) {
                    window.WizardSaveSystemV2.salvarStep5();
                }
                
                console.log('✅ Lotes salvos:', lotes);
                console.log('Total lotes:', lotes.porData.length + lotes.porPercentual.length);
                break;
        }
    }
    
    // Função auxiliar para setar cookie
    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
    }
    
    // Verificar se validateStep existe, senão criar básica
    if (typeof window.validateStep !== 'function') {
        window.validateStep = function(stepNumber) {
            console.log('📋 Validação básica do step', stepNumber);
            
            if (stepNumber === 1) {
                // Validar nome
                const eventName = document.getElementById('eventName');
                if (!eventName || !eventName.value.trim()) {
                    alert('Por favor, preencha o nome do evento');
                    return false;
                }
                
                // Validar logo
                const logoImg = document.querySelector('#logoPreviewContainer img');
                if (!logoImg || !logoImg.src || logoImg.src.includes('blob:')) {
                    alert('Por favor, adicione a logo do evento');
                    return false;
                }
                
                // Validar capa
                const capaImg = document.querySelector('#capaPreviewContainer img');
                if (!capaImg || !capaImg.src || capaImg.src.includes('blob:')) {
                    alert('Por favor, adicione a imagem de capa');
                    return false;
                }
            }
            
            if (stepNumber === 5) {
                // Validar lotes
                const lotesPorData = document.querySelectorAll('#lotesPorData .lote-card');
                const lotesPorPercentual = document.querySelectorAll('#lotesPorPercentual .lote-card');
                
                if (lotesPorData.length === 0 && lotesPorPercentual.length === 0) {
                    alert('Por favor, cadastre pelo menos 1 lote');
                    return false;
                }
            }
            
            return true;
        };
    }
    
    // Garantir que o step inicial esteja visível
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🏁 Inicializando wizard...');
        
        // Esconder todos os steps
        document.querySelectorAll('.section-card[data-step-content]').forEach(card => {
            card.style.display = 'none';
            card.classList.remove('active');
        });
        
        // Mostrar apenas o step atual
        const stepInicial = document.querySelector(`.section-card[data-step-content="${window.currentStep}"]`);
        if (stepInicial) {
            stepInicial.style.display = 'block';
            stepInicial.classList.add('active');
        }
        
        // Atualizar indicadores
        atualizarIndicadores();
    });
    
    console.log('✅ Navegação simples instalada');
})();