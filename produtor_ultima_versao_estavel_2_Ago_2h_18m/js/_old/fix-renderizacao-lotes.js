/**
 * Fix específico para renderização de lotes
 * Garante que lotes aparecem ao entrar na etapa
 */

(function() {
    'use strict';
    
    console.log('🎫 Fix de renderização de lotes iniciando...');
    
    // Função para forçar renderização de lotes
    window.forcarRenderizacaoLotes = function() {
        console.log('🔄 Forçando renderização de lotes...');
        
        // Primeiro, garantir que lotesData existe
        if (!window.lotesData) {
            window.lotesData = { porData: [], porPercentual: [] };
        }
        
        // Tentar recuperar do localStorage
        const saved = localStorage.getItem('wizardDataCollector');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.dados && data.dados.lotes && data.dados.lotes.length > 0) {
                    console.log('📦 Lotes encontrados no localStorage:', data.dados.lotes);
                    
                    // Limpar arrays
                    window.lotesData.porData = [];
                    window.lotesData.porPercentual = [];
                    
                    // Processar lotes
                    data.dados.lotes.forEach(lote => {
                        if (lote.tipo === 'data') {
                            window.lotesData.porData.push({
                                id: lote.id,
                                nome: lote.nome,
                                dataInicio: lote.data_inicio,
                                dataFim: lote.data_fim,
                                divulgar: lote.divulgar || false
                            });
                        } else if (lote.tipo === 'percentual') {
                            window.lotesData.porPercentual.push({
                                id: lote.id,
                                nome: lote.nome,
                                percentual: lote.percentual,
                                divulgar: lote.divulgar || false
                            });
                        }
                    });
                }
            } catch (e) {
                console.error('Erro ao recuperar lotes:', e);
            }
        }
        
        // Tentar do cookie também
        const loteCookie = getCookie('lotesData');
        if (loteCookie && window.lotesData.porData.length === 0 && window.lotesData.porPercentual.length === 0) {
            try {
                const loteData = JSON.parse(loteCookie);
                window.lotesData = loteData;
                console.log('📦 Lotes recuperados do cookie:', loteData);
            } catch (e) {
                console.error('Erro ao parsear cookie:', e);
            }
        }
        
        // Forçar renderização com timeout
        setTimeout(() => {
            console.log('🎨 Renderizando lotes...');
            
            // Renderizar lotes por data
            if (window.renderizarLotesPorData) {
                window.renderizarLotesPorData();
            }
            
            // Renderizar lotes por percentual
            if (window.renderizarLotesPorPercentual) {
                window.renderizarLotesPorPercentual();
            }
            
            // Atualizar selects
            if (window.atualizarSelectsLotes) {
                window.atualizarSelectsLotes();
            }
            
            console.log('✅ Renderização concluída');
        }, 100);
    };
    
    // Observer para detectar quando entra no step 5
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                
                // Verificar se é o step 5 ficando ativo
                if (target.dataset && target.dataset.step === '5' && target.classList.contains('active')) {
                    console.log('📍 Step 5 ficou ativo - renderizando lotes');
                    setTimeout(() => {
                        window.forcarRenderizacaoLotes();
                    }, 200);
                }
                
                // Verificar também o content
                if (target.dataset && target.dataset.stepContent === '5' && target.classList.contains('active')) {
                    console.log('📍 Step content 5 ficou ativo - renderizando lotes');
                    setTimeout(() => {
                        window.forcarRenderizacaoLotes();
                    }, 300);
                }
            }
        });
    });
    
    // Observar todos os elementos relevantes
    document.addEventListener('DOMContentLoaded', function() {
        // Observar steps
        document.querySelectorAll('[data-step]').forEach(el => {
            observer.observe(el, { attributes: true, attributeFilter: ['class'] });
        });
        
        // Observar step contents
        document.querySelectorAll('[data-step-content]').forEach(el => {
            observer.observe(el, { attributes: true, attributeFilter: ['class'] });
        });
        
        // Também observar clicks nos steps
        document.querySelectorAll('[data-step]').forEach(step => {
            step.addEventListener('click', function() {
                if (this.dataset.step === '5') {
                    console.log('🖱️ Click no step 5 - renderizando em 500ms');
                    setTimeout(() => {
                        window.forcarRenderizacaoLotes();
                    }, 500);
                }
            });
        });
    });
    
    // Helper
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    console.log('✅ Fix de renderização de lotes carregado!');
    console.log('💡 Use forcarRenderizacaoLotes() para renderizar manualmente');
    
})();
