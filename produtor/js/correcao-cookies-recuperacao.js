/**
 * CORREÇÃO COMPLETA - Cookies e Dialog de Recuperação
 * 1. Remove dialog de teste
 * 2. Corrige salvamento de cookies sem encoding
 * 3. Ativa dialog de recuperação do wizard
 */

(function() {
    console.log('🔧 CORREÇÃO COMPLETA - Cookies e Recuperação');
    
    // ===== 1. REMOVER DIALOG DE TESTE =====
    // Sobrescrever setTimeout para interceptar o dialog de teste
    const setTimeoutOriginal = window.setTimeout;
    window.setTimeout = function(fn, delay) {
        // Bloquear dialog de teste
        if (fn && fn.toString().includes('TESTE: Este dialog')) {
            console.log('❌ Dialog de teste BLOQUEADO');
            return;
        }
        return setTimeoutOriginal.apply(this, arguments);
    };
    
    // ===== 2. CORRIGIR SALVAMENTO DE COOKIES =====
    
    // Função para salvar cookie SEM encoding
    window.setCookieLimpo = function(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        
        // NÃO usar encodeURIComponent!
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        
        document.cookie = name + "=" + value + expires + "; path=/";
        console.log(`✅ Cookie ${name} salvo SEM encoding`);
    };
    
    // Função para ler cookie com suporte a encoded e não-encoded
    window.getCookieLimpo = function(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            
            if (c.indexOf(nameEQ) === 0) {
                let value = c.substring(nameEQ.length, c.length);
                
                // Tentar decodificar se estiver encoded
                if (value.includes('%')) {
                    try {
                        value = decodeURIComponent(value);
                    } catch (e) {
                        console.warn('Cookie não está encoded');
                    }
                }
                
                // Tentar parsear JSON
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value;
                }
            }
        }
        return null;
    };
    
    // Sobrescrever saveWizardData para usar cookie limpo
    const saveOriginal = window.saveWizardData;
    window.saveWizardData = function() {
        console.log('💾 Salvando dados do wizard (CORREÇÃO ATIVA)...');
        
        const wizardData = {
            currentStep: window.currentStep || 1,
            eventName: document.getElementById('eventTitle')?.value || '',
            classification: document.getElementById('eventType')?.value || '',
            category: document.getElementById('eventCategory')?.value || '',
            startDateTime: document.getElementById('startDateTime')?.value || '',
            venueName: document.getElementById('location')?.value || '',
            addressSearch: document.getElementById('address')?.value || '',
            timestamp: new Date().toISOString()
        };
        
        // Salvar SEM encoding
        window.setCookieLimpo('eventoWizard', wizardData, 7);
        
        // Chamar original se existir
        if (saveOriginal && typeof saveOriginal === 'function') {
            try {
                saveOriginal.call(this);
            } catch (e) {
                console.warn('Erro no saveWizardData original:', e);
            }
        }
        
        return true;
    };
    
    // ===== 3. ATIVAR DIALOG DE RECUPERAÇÃO =====
    
    function verificarWizardAbandonado() {
        console.log('🔍 Verificando wizard abandonado...');
        
        // Tentar ler cookie
        const dados = window.getCookieLimpo('eventoWizard');
        
        if (!dados) {
            console.log('❌ Nenhum wizard salvo encontrado');
            return;
        }
        
        console.log('✅ Wizard encontrado:', dados);
        
        // Verificar se tem dados relevantes
        if (dados.currentStep > 1 || dados.eventName) {
            console.log('📋 Wizard tem progresso, mostrando dialog...');
            
            // Mostrar dialog de recuperação
            if (window.customDialog && window.customDialog.confirm) {
                window.customDialog.confirm(
                    `Foi encontrado um evento em andamento:\n\n` +
                    `Evento: ${dados.eventName || '(sem nome)'}\n` +
                    `Etapa: ${dados.currentStep} de 8\n\n` +
                    `Deseja continuar de onde parou?`,
                    'Recuperar Cadastro?'
                ).then(result => {
                    if (result === 'confirm') {
                        console.log('✅ Recuperando wizard...');
                        recuperarWizard(dados);
                    } else {
                        console.log('❌ Usuário escolheu não recuperar');
                        // Limpar cookie
                        document.cookie = 'eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    }
                });
            } else {
                // Fallback para confirm nativo
                if (confirm(`Deseja continuar o cadastro do evento "${dados.eventName || '(sem nome)'"?`)) {
                    recuperarWizard(dados);
                } else {
                    document.cookie = 'eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                }
            }
        }
    }
    
    function recuperarWizard(dados) {
        console.log('📂 Recuperando dados do wizard...');
        
        // Preencher campos
        if (dados.eventName) document.getElementById('eventTitle').value = dados.eventName;
        if (dados.classification) document.getElementById('eventType').value = dados.classification;
        if (dados.category) document.getElementById('eventCategory').value = dados.category;
        if (dados.startDateTime) document.getElementById('startDateTime').value = dados.startDateTime;
        if (dados.venueName) document.getElementById('location').value = dados.venueName;
        if (dados.addressSearch) document.getElementById('address').value = dados.addressSearch;
        
        // Ir para a etapa salva
        if (dados.currentStep > 1 && window.goToStep) {
            window.goToStep(dados.currentStep);
        }
        
        console.log('✅ Wizard recuperado!');
    }
    
    // ===== 4. FUNÇÃO DE DEBUG MELHORADA =====
    
    window.debugCookies = function() {
        console.log('========== DEBUG DE COOKIES ==========');
        
        // Mostrar todos os cookies
        console.log('🍪 COOKIES RAW:');
        console.log(document.cookie);
        console.log('');
        
        // Tentar ler cada cookie importante
        const cookies = ['eventoWizard', 'lotesData', 'ingressosData'];
        
        cookies.forEach(name => {
            console.log(`📦 Cookie ${name}:`);
            const cookie = getCookieLimpo(name);
            if (cookie) {
                console.log('✅ Lido com sucesso:', cookie);
            } else {
                console.log('❌ Não encontrado ou erro ao ler');
            }
            console.log('');
        });
        
        console.log('========== FIM DEBUG ==========');
    };
    
    // ===== EXECUTAR VERIFICAÇÃO =====
    
    // Aguardar página carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(verificarWizardAbandonado, 1000);
        });
    } else {
        setTimeout(verificarWizardAbandonado, 1000);
    }
    
    console.log('✅ CORREÇÃO COMPLETA INSTALADA!');
    console.log('💡 Use debugCookies() para verificar cookies');
    
})();