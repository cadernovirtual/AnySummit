/**
 * CORREÇÃO DEFINITIVA TOTAL - Remove encoding e corrige todos os problemas
 * 1. Força cookies sem encoding
 * 2. Bloqueia limpeza automática de dados
 * 3. Corrige verificação de termos
 * 4. Garante recuperação funcional
 */

(function() {
    console.log('🚨 CORREÇÃO DEFINITIVA TOTAL - Iniciando...');
    
    // ===== 1. FORÇAR COOKIES SEM ENCODING =====
    
    // Interceptar TODOS os document.cookie para garantir sem encoding
    const cookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    
    Object.defineProperty(document, 'cookie', {
        get: function() {
            return cookieDescriptor.get.call(this);
        },
        set: function(value) {
            // Se for limpeza (expires 1970), permitir
            if (value.includes('expires=Thu, 01 Jan 1970')) {
                console.log('🗑️ Permitindo limpeza de cookie');
                return cookieDescriptor.set.call(this, value);
            }
            
            // Para outros casos, garantir sem encoding
            const parts = value.split('=');
            if (parts.length >= 2) {
                const name = parts[0];
                let val = parts.slice(1).join('=');
                
                // Remover expires para reprocessar
                const expiresMatch = val.match(/;\s*expires=([^;]+)/i);
                const pathMatch = val.match(/;\s*path=([^;]+)/i);
                
                val = val.split(';')[0]; // Pegar apenas o valor
                
                // Se parecer JSON encoded, decodificar
                if (val.includes('%7B') || val.includes('%22')) {
                    try {
                        val = decodeURIComponent(val);
                        console.log(`✅ Cookie ${name} decodificado`);
                    } catch (e) {
                        console.warn('Não foi possível decodificar:', e);
                    }
                }
                
                // Reconstruir cookie
                let newCookie = `${name}=${val}`;
                if (expiresMatch) newCookie += `; expires=${expiresMatch[1]}`;
                if (pathMatch) newCookie += `; path=${pathMatch[1]}`;
                else newCookie += '; path=/';
                
                console.log(`💾 Salvando cookie ${name} SEM encoding`);
                return cookieDescriptor.set.call(this, newCookie);
            }
            
            return cookieDescriptor.set.call(this, value);
        }
    });
    
    // ===== 2. BLOQUEAR LIMPEZA AUTOMÁTICA =====
    
    // Lista de funções que limpam dados
    const funcoesLimpeza = [
        'limparDadosDoWizard',
        'clearAllWizardData',
        'limparTodosOsDadosDoWizard'
    ];
    
    funcoesLimpeza.forEach(funcName => {
        if (window[funcName]) {
            const original = window[funcName];
            window[funcName] = function() {
                console.warn(`❌ BLOQUEADA tentativa de ${funcName}`);
                // Não executar a limpeza
                return false;
            };
        }
    });
    
    // ===== 3. CORRIGIR VERIFICAÇÃO DE TERMOS =====
    
    const publishOriginal = window.publishEvent;
    window.publishEvent = async function() {
        console.log('🚀 Publicando evento (CORREÇÃO DEFINITIVA)...');
        
        // Verificar checkbox de termos
        const termsCheckbox = document.getElementById('acceptTerms');
        const privacyCheckbox = document.getElementById('acceptPrivacy');
        
        console.log('Termos aceitos?', termsCheckbox?.checked);
        console.log('Privacidade aceita?', privacyCheckbox?.checked);
        
        // Forçar verificação correta
        if (!termsCheckbox || !termsCheckbox.checked) {
            console.error('❌ Termos não aceitos!');
            if (window.customDialog) {
                await window.customDialog.alert('Você deve aceitar os termos de uso para continuar.', 'warning');
            } else {
                alert('Você deve aceitar os termos de uso para continuar.');
            }
            return false;
        }
        
        if (!privacyCheckbox || !privacyCheckbox.checked) {
            console.error('❌ Privacidade não aceita!');
            if (window.customDialog) {
                await window.customDialog.alert('Você deve aceitar a política de privacidade para continuar.', 'warning');
            } else {
                alert('Você deve aceitar a política de privacidade para continuar.');
            }
            return false;
        }
        
        console.log('✅ Termos e privacidade aceitos, prosseguindo...');
        
        // Chamar função original se existir
        if (publishOriginal && typeof publishOriginal === 'function') {
            return await publishOriginal.call(this);
        } else {
            // Implementação direta
            console.log('📤 Enviando evento...');
            
            try {
                // Coletar dados
                const dados = window.coletarDadosCompletos ? window.coletarDadosCompletos() : {};
                
                // Enviar
                const response = await fetch('/produtor/criaeventoapi.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(dados)
                });
                
                const resultado = await response.json();
                
                if (resultado.success) {
                    // Só limpar APÓS sucesso confirmado
                    console.log('✅ Evento publicado! Limpando dados...');
                    document.cookie = 'eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    document.cookie = 'lotesData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    document.cookie = 'ingressosData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    
                    setTimeout(() => {
                        window.location.href = '/produtor/meuseventos.php';
                    }, 1000);
                    
                    return true;
                } else {
                    throw new Error(resultado.message || 'Erro ao publicar');
                }
                
            } catch (error) {
                console.error('❌ Erro:', error);
                if (window.customDialog) {
                    await window.customDialog.alert('Erro ao publicar: ' + error.message, 'error');
                } else {
                    alert('Erro ao publicar: ' + error.message);
                }
                return false;
            }
        }
    };
    
    // ===== 4. FUNÇÃO DE SALVAMENTO SEM ENCODING =====
    
    window.salvarDadosSemEncoding = function() {
        console.log('💾 Salvando dados SEM encoding...');
        
        const dados = {
            currentStep: window.currentStep || 1,
            eventName: document.getElementById('eventTitle')?.value || '',
            eventType: document.getElementById('eventType')?.value || '',
            eventCategory: document.getElementById('eventCategory')?.value || '',
            startDateTime: document.getElementById('startDateTime')?.value || '',
            endDateTime: document.getElementById('endDateTime')?.value || '',
            location: document.getElementById('location')?.value || '',
            address: document.getElementById('address')?.value || '',
            description: document.getElementById('eventDescription')?.value || '',
            producerName: document.getElementById('producerName')?.value || '',
            timestamp: new Date().toISOString()
        };
        
        // Salvar diretamente como JSON string
        document.cookie = `eventoWizard=${JSON.stringify(dados)}; path=/; max-age=${7*24*60*60}`;
        
        console.log('✅ Dados salvos sem encoding!');
        return true;
    };
    
    // Sobrescrever saveWizardData
    if (window.saveWizardData) {
        window.saveWizardData = window.salvarDadosSemEncoding;
    }
    
    // ===== 5. VERIFICAR RECUPERAÇÃO AO CARREGAR =====
    
    function verificarRecuperacao() {
        console.log('🔍 Verificando dados para recuperação...');
        
        // Ler cookie
        const cookies = document.cookie.split(';');
        let wizardData = null;
        
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'eventoWizard' && value) {
                try {
                    // Tentar decodificar se necessário
                    let val = value;
                    if (val.includes('%')) {
                        val = decodeURIComponent(val);
                    }
                    wizardData = JSON.parse(val);
                    break;
                } catch (e) {
                    console.error('Erro ao ler cookie:', e);
                }
            }
        }
        
        if (wizardData && (wizardData.currentStep > 1 || wizardData.eventName)) {
            console.log('✅ Dados encontrados:', wizardData);
            
            // Mostrar dialog apenas uma vez
            if (!window.recuperacaoVerificada) {
                window.recuperacaoVerificada = true;
                
                setTimeout(() => {
                    if (window.customDialog && window.customDialog.confirm) {
                        window.customDialog.confirm(
                            `Encontramos um evento em andamento:\n\n` +
                            `${wizardData.eventName || 'Evento sem nome'}\n` +
                            `Etapa: ${wizardData.currentStep} de 8\n\n` +
                            `Deseja continuar?`,
                            'Recuperar Cadastro?'
                        ).then(result => {
                            if (result === 'confirm') {
                                recuperarDados(wizardData);
                            } else {
                                // Limpar apenas se recusar
                                document.cookie = 'eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                            }
                        });
                    }
                }, 1000);
            }
        }
    }
    
    function recuperarDados(dados) {
        console.log('📂 Recuperando dados...');
        
        // Preencher campos
        Object.keys(dados).forEach(key => {
            const element = document.getElementById(key);
            if (element && dados[key]) {
                element.value = dados[key];
            }
        });
        
        // Ir para etapa salva
        if (dados.currentStep > 1 && window.goToStep) {
            window.goToStep(dados.currentStep);
        }
    }
    
    // Executar verificação ao carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', verificarRecuperacao);
    } else {
        setTimeout(verificarRecuperacao, 500);
    }
    
    console.log('✅ CORREÇÃO DEFINITIVA TOTAL INSTALADA!');
    
})();