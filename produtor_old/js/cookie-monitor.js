// Verificador de cookies em tempo real
console.log('🔍 Iniciando verificador de cookies...');

// Função para verificar cookies
window.verificarCookies = function() {
    console.log('\n📋 === VERIFICAÇÃO DE COOKIES ===');
    
    const cookies = document.cookie.split(';');
    let encontrouWizard = false;
    
    cookies.forEach((cookie, index) => {
        const trimmed = cookie.trim();
        if (trimmed) {
            if (trimmed.startsWith('eventoWizard=')) {
                encontrouWizard = true;
                console.log(`✅ ${index + 1}. ${trimmed.substring(0, 50)}...`);
                
                // Tentar decodificar
                try {
                    const value = trimmed.substring(13);
                    const decoded = decodeURIComponent(value);
                    const data = JSON.parse(decoded);
                    console.log('   📊 Dados:', {
                        step: data.currentStep,
                        evento: data.eventName || '(vazio)',
                        timestamp: new Date(data.timestamp).toLocaleTimeString()
                    });
                } catch (e) {
                    console.log('   ❌ Erro ao decodificar');
                }
            } else {
                console.log(`   ${index + 1}. ${trimmed.substring(0, 50)}...`);
            }
        }
    });
    
    if (!encontrouWizard) {
        console.log('❌ Cookie eventoWizard NÃO ENCONTRADO!');
    }
    
    console.log('=== FIM DA VERIFICAÇÃO ===\n');
};

// Verificar a cada 5 segundos
setInterval(verificarCookies, 5000);

// Verificar agora
verificarCookies();

console.log('💡 Use verificarCookies() para verificar manualmente');