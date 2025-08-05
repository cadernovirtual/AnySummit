/**
 * Script de debug melhorado para verificar salvamento de dados
 */

window.debugDadosWizard = function() {
    console.log('========== DEBUG DADOS WIZARD ==========');
    
    // 1. Verificar cookies raw
    console.log('🍪 COOKIES RAW:');
    console.log(document.cookie);
    console.log('');
    
    // 2. Tentar ler cada cookie
    const cookies = ['eventoWizard', 'lotesData', 'ingressosData'];
    
    cookies.forEach(cookieName => {
        console.log(`📦 Cookie ${cookieName}:`);
        
        try {
            // Método 1: Busca direta
            const nameEQ = cookieName + "=";
            const ca = document.cookie.split(';');
            let cookieValue = null;
            
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) {
                    cookieValue = c.substring(nameEQ.length, c.length);
                    break;
                }
            }
            
            if (cookieValue) {
                console.log('Valor raw:', cookieValue.substring(0, 100) + '...');
                
                // Tentar decodificar
                try {
                    const decoded = decodeURIComponent(cookieValue);
                    console.log('Decodificado:', decoded.substring(0, 100) + '...');
                    
                    // Tentar parsear
                    try {
                        const parsed = JSON.parse(decoded);
                        console.log('✅ JSON parseado com sucesso!');
                        console.log('Dados:', parsed);
                    } catch (e) {
                        console.log('❌ Erro ao parsear (decodificado):', e.message);
                        
                        // Tentar parsear direto
                        try {
                            const parsed = JSON.parse(cookieValue);
                            console.log('✅ JSON parseado direto com sucesso!');
                            console.log('Dados:', parsed);
                        } catch (e2) {
                            console.log('❌ Erro ao parsear (direto):', e2.message);
                        }
                    }
                } catch (e) {
                    console.log('❌ Erro ao decodificar:', e.message);
                }
            } else {
                console.log('❌ Cookie não encontrado');
            }
        } catch (error) {
            console.error('❌ Erro geral:', error);
        }
        
        console.log('');
    });
    
    // 3. Verificar dados na memória
    console.log('💾 DADOS NA MEMÓRIA:');
    console.log('window.lotesData:', window.lotesData);
    console.log('window.ingressosTemporarios:', window.ingressosTemporarios);
    console.log('window.temporaryTickets:', window.temporaryTickets);
    console.log('');
    
    // 4. Tentar obter dados completos
    console.log('📊 DADOS COMPLETOS DO WIZARD:');
    if (window.obterDadosCompletosWizard) {
        const dados = window.obterDadosCompletosWizard();
        console.log(dados);
    } else {
        console.log('❌ Função obterDadosCompletosWizard não encontrada');
    }
    
    console.log('========== FIM DEBUG ==========');
};

// Adicionar ao console
console.log('🔧 Debug disponível: digite debugDadosWizard() no console');