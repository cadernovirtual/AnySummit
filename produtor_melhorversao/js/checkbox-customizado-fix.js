/**
 * CORREÇÃO PARA CHECKBOX CUSTOMIZADO
 * O sistema usa divs com classe "checkbox" ao invés de input checkbox
 */

(function() {
    console.log('🔧 Correção para checkbox customizado iniciada...');
    
    window.addEventListener('DOMContentLoaded', function() {
        console.log('📋 Procurando checkbox customizado...');
        
        // O checkbox é uma div com id="termsCheckbox"
        const termsDiv = document.getElementById('termsCheckbox');
        console.log('Div do checkbox encontrada:', termsDiv);
        
        if (!termsDiv) {
            console.error('❌ Checkbox de termos não encontrado!');
            return;
        }
        
        // Criar um input hidden para armazenar o estado
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = 'termsCheckboxValue';
        hiddenInput.value = termsDiv.classList.contains('checked') ? 'true' : 'false';
        termsDiv.parentNode.appendChild(hiddenInput);
        
        // Função para verificar se está marcado
        window.isTermsChecked = function() {
            return termsDiv.classList.contains('checked') || hiddenInput.value === 'true';
        };
        
        // Adicionar listener para clicks na div
        termsDiv.addEventListener('click', function() {
            // Toggle da classe checked
            if (this.classList.contains('checked')) {
                this.classList.remove('checked');
                hiddenInput.value = 'false';
                console.log('❌ Checkbox desmarcado');
            } else {
                this.classList.add('checked');
                hiddenInput.value = 'true';
                console.log('✅ Checkbox marcado');
            }
        });
        
        // Adicionar listener no label também
        const label = document.querySelector('label[for="termsCheckbox"]');
        if (label) {
            label.addEventListener('click', function(e) {
                if (e.target.tagName !== 'A') { // Não interferir com links
                    termsDiv.click();
                }
            });
        }
        
        // ===== CORRIGIR PUBLICAÇÃO =====
        
        const publishOriginal = window.publishEvent;
        window.publishEvent = async function() {
            console.log('🚀 Publicando evento (com checkbox customizado)...');
            
            const termsAccepted = window.isTermsChecked();
            console.log('✅ Termos aceitos?', termsAccepted);
            
            if (!termsAccepted) {
                console.error('❌ Termos não aceitos!');
                if (window.customDialog) {
                    await window.customDialog.alert(
                        'Você deve aceitar os termos de uso e política de privacidade!',
                        '⚠️ Atenção'
                    );
                } else {
                    alert('Você deve aceitar os termos de uso e política de privacidade!');
                }
                
                // Dar foco visual ao checkbox
                termsDiv.style.border = '2px solid red';
                setTimeout(() => {
                    termsDiv.style.border = '';
                }, 3000);
                
                return false;
            }
            
            console.log('✅ Termos aceitos! Prosseguindo...');
            
            // Tentar chamar original
            if (publishOriginal && typeof publishOriginal === 'function') {
                try {
                    return await publishOriginal.call(this);
                } catch (error) {
                    console.error('Erro na publicação original:', error);
                }
            }
            
            // Implementação de fallback
            try {
                console.log('📤 Coletando dados...');
                const dados = window.coletarDadosCompletos ? window.coletarDadosCompletos() : {};
                
                console.log('📤 Enviando para API...');
                const response = await fetch('/produtor/criaeventoapi.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(dados)
                });
                
                const textoResposta = await response.text();
                console.log('📥 Resposta bruta:', textoResposta);
                
                let resultado;
                try {
                    resultado = JSON.parse(textoResposta);
                } catch (e) {
                    if (textoResposta.includes('success')) {
                        resultado = { success: true };
                    } else {
                        throw new Error('Resposta inválida: ' + textoResposta);
                    }
                }
                
                if (resultado.success) {
                    console.log('✅ Sucesso!');
                    
                    // Limpar cookies
                    document.cookie = 'eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    document.cookie = 'lotesData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    
                    if (window.customDialog) {
                        await window.customDialog.alert('Evento publicado com sucesso!', 'success');
                    } else {
                        alert('Evento publicado com sucesso!');
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
        };
        
        // ===== FUNÇÕES DE DEBUG =====
        
        window.debugTerms = function() {
            console.log('=== DEBUG CHECKBOX CUSTOMIZADO ===');
            console.log('Div checkbox:', termsDiv);
            console.log('Classes:', termsDiv.className);
            console.log('Tem classe "checked"?', termsDiv.classList.contains('checked'));
            console.log('Hidden input value:', hiddenInput.value);
            console.log('isTermsChecked():', window.isTermsChecked());
            console.log('=================================');
        };
        
        window.forceCheckTerms = function() {
            termsDiv.classList.add('checked');
            hiddenInput.value = 'true';
            console.log('✅ Termos marcados forçadamente');
        };
        
        window.debugCookies = function() {
            console.log('=== DEBUG COOKIES ===');
            const cookies = document.cookie.split(';');
            
            cookies.forEach(cookie => {
                const [name, value] = cookie.trim().split('=');
                if (value) {
                    console.log(`\n${name}:`);
                    
                    let decoded = value;
                    if (value.includes('%')) {
                        try {
                            decoded = decodeURIComponent(value);
                        } catch (e) {}
                    }
                    
                    try {
                        const parsed = JSON.parse(decoded);
                        console.log(parsed);
                    } catch (e) {
                        console.log(decoded.substring(0, 200) + '...');
                    }
                }
            });
            console.log('\n=====================');
        };
        
        console.log('✅ Sistema configurado para checkbox customizado!');
        console.log('📌 Comandos disponíveis:');
        console.log('- debugTerms()');
        console.log('- debugCookies()');
        console.log('- forceCheckTerms()');
        console.log('- isTermsChecked()');
    });
    
})();