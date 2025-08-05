/**
 * CARREGAMENTO DE LOTES NA ETAPA 5
 * Garante que os lotes sejam carregados automaticamente ao entrar na etapa 5
 */

(function() {
    'use strict';
    
    console.log('🔧 Interceptador de etapa 5 carregado');
    
    // Interceptar mudança para etapa 5
    const originalShowStep = window.showStep;
    if (originalShowStep) {
        window.showStep = function(stepNumber) {
            console.log(`🎯 Mudando para etapa ${stepNumber}`);
            
            // Chamar função original primeiro
            const result = originalShowStep.call(this, stepNumber);
            
            // Se é etapa 5, carregar lotes
            if (stepNumber === 5) {
                console.log('📦 Etapa 5 detectada - carregando lotes...');
                
                setTimeout(() => {
                    carregarLotesEtapa5();
                }, 500);
            }
            
            return result;
        };
        
        console.log('✅ Interceptador showStep instalado');
    }
    
    // Função para carregar lotes na etapa 5
    function carregarLotesEtapa5() {
        console.log('🔍 Carregando lotes para etapa 5...');
        
        // Obter evento_id
        const eventoId = new URLSearchParams(window.location.search).get('evento_id') || window.eventoId;
        
        if (!eventoId) {
            console.log('ℹ️ Nenhum evento ID - evento novo sem lotes');
            return;
        }
        
        console.log(`📡 Carregando lotes para evento ${eventoId}`);
        
        // Fazer requisição para carregar dados do evento (incluindo lotes)
        fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=retomar_evento&evento_id=${eventoId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso && data.lotes && data.lotes.length > 0) {
                console.log('✅ Lotes encontrados:', data.lotes.length);
                
                // Armazenar lotes globalmente
                window.lotesCarregados = data.lotes;
                
                // Tentar diferentes métodos para exibir lotes
                if (typeof window.renderizarLotes === 'function') {
                    window.renderizarLotes(data.lotes);
                    console.log('📋 Lotes renderizados via renderizarLotes');
                } else if (typeof window.exibirLotesInterface === 'function') {
                    window.exibirLotesInterface(data.lotes);
                    console.log('📋 Lotes exibidos via exibirLotesInterface');
                } else {
                    console.log('📋 Lotes armazenados em window.lotesCarregados');
                }
                
                // Disparar evento customizado para outros scripts
                document.dispatchEvent(new CustomEvent('lotesCarregados', {
                    detail: { lotes: data.lotes }
                }));
                
            } else {
                console.log('ℹ️ Nenhum lote encontrado para este evento');
            }
        })
        .catch(error => {
            console.error('❌ Erro ao carregar lotes:', error);
        });
    }
    
    // Listener para outros scripts que podem precisar dos lotes
    document.addEventListener('lotesCarregados', function(event) {
        console.log('📢 Evento lotesCarregados disparado:', event.detail.lotes);
    });
    
    console.log('✅ Sistema de carregamento de lotes da etapa 5 inicializado');
    
})();
