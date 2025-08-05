// OVERRIDE FINAL - FORÇA O TEXTO CORRETO DO LOTE
(function() {
    'use strict';
    
    console.log('🔥 OVERRIDE FINAL - FORÇAR TEXTO DO LOTE');
    
    // FUNÇÃO OVERRIDE QUE FORÇA O TEXTO CORRETO
    window.forcarTextoLoteCorreto = function(labelId, hiddenId) {
        console.log(`🔥 FORÇANDO TEXTO PARA: ${labelId}, ${hiddenId}`);
        
        const label = document.getElementById(labelId);
        const hidden = document.getElementById(hiddenId);
        
        if (!label || !hidden || !hidden.value) {
            console.log('❌ Elementos não encontrados ou hidden vazio');
            return;
        }
        
        const loteId = hidden.value;
        console.log(`🔍 Buscando lote ID: ${loteId}`);
        
        // IDENTIFICAR QUAL SELECT ORIGINAL USAR
        let selectId = '';
        if (labelId.includes('Paid')) {
            selectId = 'paidTicketLote';
        } else if (labelId.includes('Free')) {
            selectId = 'freeTicketLote';
        } else if (labelId.includes('Combo')) {
            selectId = 'comboTicketLote';
        }
        
        console.log(`🔍 Usando select: ${selectId}`);
        
        // BUSCAR NO SELECT ORIGINAL
        const select = document.getElementById(selectId);
        if (select) {
            const option = select.querySelector(`option[value="${loteId}"]`);
            if (option) {
                const texto = option.textContent.trim();
                label.textContent = texto;
                console.log(`✅ TEXTO FORÇADO: "${texto}"`);
                return;
            }
        }
        
        // FALLBACK: BUSCAR EM TODOS OS SELECTS
        const todosSelects = document.querySelectorAll('select');
        for (const sel of todosSelects) {
            const opt = sel.querySelector(`option[value="${loteId}"]`);
            if (opt && opt.textContent.trim() !== loteId) {
                const texto = opt.textContent.trim();
                label.textContent = texto;
                console.log(`✅ TEXTO ENCONTRADO EM OUTRO SELECT: "${texto}"`);
                return;
            }
        }
        
        // ÚLTIMO RECURSO
        label.textContent = `Lote ID ${loteId}`;
        console.log(`⚠️ Usando fallback: Lote ID ${loteId}`);
    };
    
    // SOBRESCREVER A FUNÇÃO ORIGINAL
    const originalConfigurar = window.configurarSelectLoteReadonly;
    
    window.configurarSelectLoteReadonly = async function(ingresso, labelId, hiddenId) {
        console.log('🔥 OVERRIDE - configurarSelectLoteReadonly chamada');
        
        // Chamar função original se existir
        if (originalConfigurar) {
            await originalConfigurar(ingresso, labelId, hiddenId);
        }
        
        // FORÇAR CORREÇÃO APÓS 1 SEGUNDO
        setTimeout(() => {
            console.log('🔥 FORÇANDO CORREÇÃO APÓS TIMEOUT');
            window.forcarTextoLoteCorreto(labelId, hiddenId);
        }, 1000);
    };
    
    // INTERCEPTAR QUALQUER MUDANÇA NO LABEL PARA "-"
    function interceptarMudancas() {
        const labels = [
            'editPaidTicketLoteLabel',
            'editFreeTicketLoteLabel', 
            'editComboLoteLabel'
        ];
        
        labels.forEach(labelId => {
            const label = document.getElementById(labelId);
            if (label) {
                // Observer para detectar mudanças
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList' || mutation.type === 'characterData') {
                            if (label.textContent === '-') {
                                console.log(`🔥 DETECTOU "-" EM ${labelId} - CORRIGINDO!`);
                                
                                const hiddenId = labelId.replace('Label', '');
                                setTimeout(() => {
                                    window.forcarTextoLoteCorreto(labelId, hiddenId);
                                }, 100);
                            }
                        }
                    });
                });
                
                observer.observe(label, {
                    childList: true,
                    characterData: true,
                    subtree: true
                });
                
                console.log(`👀 Observer configurado para ${labelId}`);
            }
        });
    }
    
    // EXECUTAR QUANDO DOM ESTIVER PRONTO
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', interceptarMudancas);
    } else {
        interceptarMudancas();
    }
    
    console.log('✅ OVERRIDE FINAL CONFIGURADO');
})();
