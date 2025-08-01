/**
 * CORREÇÃO COMPLETA - IDs corretos e debug funcional
 */

(function() {
    console.log('🔧 Correção de checkboxes e debug - Iniciando...');
    
    // ===== 1. CORRIGIR IDS DOS CHECKBOXES =====
    
    window.addEventListener('DOMContentLoaded', function() {
        console.log('📋 Procurando checkboxes...');
        
        // Procurar por diferentes possíveis IDs
        const possiveisIdsTermos = ['termsCheckbox', 'acceptTerms', 'termos', 'terms'];
        const possiveisIdsPrivacy = ['privacyCheckbox', 'acceptPrivacy', 'privacy', 'privacidade'];
        
        let termsCheckbox = null;
        let privacyCheckbox = null;
        
        // Procurar checkbox de termos
        for (let id of possiveisIdsTermos) {
            termsCheckbox = document.getElementById(id);
            if (termsCheckbox) {
                console.log('✅ Checkbox de termos encontrado:', id);
                break;
            }
        }
        
        // Procurar checkbox de privacidade
        for (let id of possiveisIdsPrivacy) {
            privacyCheckbox = document.getElementById(id);
            if (privacyCheckbox) {
                console.log('✅ Checkbox de privacidade encontrado:', id);
                break;
            }
        }
        
        // Se não encontrou privacidade, pode ser o mesmo dos termos
        if (!privacyCheckbox && termsCheckbox) {
            console.log('⚠️ Usando mesmo checkbox para termos e privacidade');
            privacyCheckbox = termsCheckbox;
        }
        
        // Debug
        console.log('Checkbox termos:', termsCheckbox);
        console.log('Checkbox privacidade:', privacyCheckbox);
        
        // ===== 2. CORRIGIR PUBLICAÇÃO =====
        
        const publishOriginal = window.publishEvent;
        window.publishEvent = async function() {
            console.log('🚀 Tentando publicar evento...');
            
            // Verificar checkboxes com IDs corretos
            const termos = termsCheckbox?.checked;
            const privacidade = privacyCheckbox?.checked;
            
            console.log('✅ Estado dos checkboxes:');
            console.log('- Termos:', termos);
            console.log('- Privacidade:', privacidade);
            
            if (!termos) {
                console.error('❌ Termos não aceitos!');
                if (window.customDialog) {
                    await window.customDialog.alert('Você deve aceitar os termos de uso!', 'warning');
                } else {
                    alert('Você deve aceitar os termos de uso!');
                }
                return false;
            }
            
            // Se tiver checkbox separado de privacidade
            if (privacyCheckbox !== termsCheckbox && !privacidade) {
                console.error('❌ Privacidade não aceita!');
                if (window.customDialog) {
                    await window.customDialog.alert('Você deve aceitar a política de privacidade!', 'warning');
                } else {
                    alert('Você deve aceitar a política de privacidade!');
                }
                return false;
            }
            
            console.log('✅ Termos aceitos, prosseguindo com publicação...');
            
            // Chamar função original ou implementar envio
            if (publishOriginal && typeof publishOriginal === 'function') {
                return await publishOriginal.call(this);
            } else {
                // Implementação direta
                try {
                    const dados = window.coletarDadosCompletos ? window.coletarDadosCompletos() : {};
                    console.log('📤 Dados a enviar:', dados);
                    
                    const response = await fetch('/produtor/criaeventoapi.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(dados)
                    });
                    
                    const textoResposta = await response.text();
                    console.log('📥 Resposta:', textoResposta);
                    
                    let resultado;
                    try {
                        resultado = JSON.parse(textoResposta);
                    } catch (e) {
                        console.error('Resposta não é JSON:', textoResposta);
                        throw new Error('Resposta inválida do servidor');
                    }
                    
                    if (resultado.success) {
                        console.log('✅ Evento publicado com sucesso!');
                        
                        // Limpar cookies
                        document.cookie = 'eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                        document.cookie = 'lotesData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                        document.cookie = 'ingressosData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                        
                        if (window.customDialog) {
                            await window.customDialog.alert('Evento publicado com sucesso!', 'success');
                        }
                        
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
                        await window.customDialog.alert('Erro: ' + error.message, 'error');
                    } else {
                        alert('Erro: ' + error.message);
                    }
                    return false;
                }
            }
        };
        
        // ===== 3. FUNÇÕES DE DEBUG =====
        
        window.debugTerms = function() {
            console.log('=== DEBUG TERMOS ===');
            console.log('Checkbox termos:', termsCheckbox);
            console.log('ID:', termsCheckbox?.id);
            console.log('Checked:', termsCheckbox?.checked);
            console.log('---');
            console.log('Checkbox privacidade:', privacyCheckbox);
            console.log('ID:', privacyCheckbox?.id);
            console.log('Checked:', privacyCheckbox?.checked);
            console.log('===================');
        };
        
        window.debugCookies = function() {
            console.log('=== DEBUG COOKIES ===');
            console.log('Todos os cookies:', document.cookie);
            console.log('---');
            
            const cookies = document.cookie.split(';');
            cookies.forEach(cookie => {
                const [name, value] = cookie.trim().split('=');
                console.log(`${name}:`);
                
                if (value) {
                    // Tentar decodificar
                    let decoded = value;
                    if (value.includes('%')) {
                        try {
                            decoded = decodeURIComponent(value);
                        } catch (e) {}
                    }
                    
                    // Tentar parsear JSON
                    try {
                        const parsed = JSON.parse(decoded);
                        console.log('  Valor parseado:', parsed);
                    } catch (e) {
                        console.log('  Valor raw:', decoded.substring(0, 100) + '...');
                    }
                }
            });
            
            console.log('=====================');
        };
        
        window.forceCheckTerms = function() {
            if (termsCheckbox) {
                termsCheckbox.checked = true;
                console.log('✅ Termos marcados forçadamente');
            }
            if (privacyCheckbox && privacyCheckbox !== termsCheckbox) {
                privacyCheckbox.checked = true;
                console.log('✅ Privacidade marcada forçadamente');
            }
        };
        
        console.log('✅ Sistema de debug instalado!');
        console.log('Comandos disponíveis:');
        console.log('- debugTerms()');
        console.log('- debugCookies()');
        console.log('- forceCheckTerms()');
    });
    
})();