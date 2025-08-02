/**
 * MONITOR EM TEMPO REAL - Debug de persistência
 * Mostra exatamente o que está acontecendo
 */

(function() {
    'use strict';
    
    console.log('👁️ Monitor de Persistência ATIVO');
    
    // Criar div de monitoramento
    const monitor = document.createElement('div');
    monitor.id = 'persistence-monitor';
    monitor.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        max-height: 300px;
        background: #000;
        color: #0f0;
        padding: 15px;
        border: 2px solid #0f0;
        font-family: monospace;
        font-size: 12px;
        z-index: 999999;
        overflow-y: auto;
        border-radius: 5px;
    `;
    monitor.innerHTML = '<div style="color: #fff; font-weight: bold; margin-bottom: 10px;">🔍 MONITOR DE PERSISTÊNCIA</div>';
    document.body.appendChild(monitor);
    
    const log = (msg, type = 'info') => {
        const time = new Date().toLocaleTimeString();
        const color = type === 'error' ? '#f00' : type === 'success' ? '#0f0' : '#ff0';
        monitor.innerHTML += `<div style="color: ${color}">[${time}] ${msg}</div>`;
        monitor.scrollTop = monitor.scrollHeight;
        console.log(`[MONITOR] ${msg}`);
    };
    
    // Monitorar nextStep
    let nextStepCount = 0;
    const originalNextStep = window.nextStep;
    if (originalNextStep) {
        window.nextStep = function() {
            nextStepCount++;
            log(`🚀 nextStep chamado (${nextStepCount}x)`, 'info');
            
            // Verificar step atual
            const currentStep = window.getCurrentStep ? window.getCurrentStep() : 'desconhecido';
            log(`📍 Step atual: ${currentStep}`, 'info');
            
            // Chamar original
            const result = originalNextStep.apply(this, arguments);
            
            // Verificar se salvou
            setTimeout(() => {
                const saved = localStorage.getItem('wizardCollectedData');
                if (saved) {
                    const data = JSON.parse(saved);
                    log(`💾 Dados salvos! Step: ${data.step_atual}`, 'success');
                    log(`📊 Campos preenchidos: ${Object.keys(data.dados).filter(k => data.dados[k]).length}`, 'info');
                } else {
                    log('❌ Nada salvo no localStorage!', 'error');
                }
            }, 500);
            
            return result;
        };
    }
    
    // Monitorar saveWizardData
    let saveCount = 0;
    const originalSave = window.saveWizardData;
    if (originalSave) {
        window.saveWizardData = function() {
            saveCount++;
            log(`💾 saveWizardData chamado (${saveCount}x)`, 'info');
            return originalSave.apply(this, arguments);
        };
    }
    
    // Monitorar coletarDadosStepAtual
    const originalColetar = window.coletarDadosStepAtual;
    if (originalColetar) {
        window.coletarDadosStepAtual = function(step) {
            log(`📊 Coletando dados do step ${step}`, 'info');
            const result = originalColetar.apply(this, arguments);
            
            // Verificar dados coletados
            if (window.WizardDataCollector) {
                const dados = window.WizardDataCollector.dados;
                log(`✅ Dados coletados: ${JSON.stringify(dados).length} chars`, 'success');
                
                // Mostrar campos específicos do step 2
                if (step === 2) {
                    log(`📅 data_inicio: ${dados.data_inicio || 'VAZIO'}`, dados.data_inicio ? 'success' : 'error');
                    log(`📅 data_fim: ${dados.data_fim || 'VAZIO'}`, dados.data_fim ? 'success' : 'error');
                }
            }
            
            return result;
        };
    }
    
    // Monitorar cliques em botões
    document.addEventListener('click', (e) => {
        if (e.target.textContent && e.target.textContent.includes('Próximo')) {
            log('🖱️ Clique em botão Próximo detectado', 'info');
        }
    }, true);
    
    // Botão para fechar monitor
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.style.cssText = 'position: absolute; top: 5px; right: 5px; background: #f00; color: #fff; border: none; cursor: pointer;';
    closeBtn.onclick = () => monitor.remove();
    monitor.appendChild(closeBtn);
    
    // Verificar estado inicial
    log('🚀 Monitor iniciado', 'success');
    const saved = localStorage.getItem('wizardCollectedData');
    if (saved) {
        const data = JSON.parse(saved);
        log(`📦 Dados existentes: Step ${data.step_atual}`, 'info');
    } else {
        log('📦 Nenhum dado salvo encontrado', 'info');
    }
    
    // Comando para debug manual
    window.debugStep2 = function() {
        console.log('🔍 Debug Step 2:');
        console.log('startDateTime:', document.getElementById('startDateTime')?.value);
        console.log('endDateTime:', document.getElementById('endDateTime')?.value);
        
        // Forçar coleta
        if (window.coletarDadosStepAtual) {
            window.coletarDadosStepAtual(2);
        }
    };
    
    log('💡 Use debugStep2() para debug manual', 'info');
    
})();
