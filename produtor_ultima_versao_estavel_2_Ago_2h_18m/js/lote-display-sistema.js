// SISTEMA DE DISPLAY DE LOTE - CONSULTA DIRETA AO BANCO
(function() {
    'use strict';
    
    console.log('📋 Sistema de Display de Lote carregado');
    
    // FUNÇÃO PARA BUSCAR E EXIBIR DADOS DO LOTE - SIMPLES E DIRETA
    window.exibirDadosLoteDisplay = async function(loteId, displayId) {
        console.log(`📋 BUSCANDO LOTE ${loteId} PARA ${displayId}`);
        
        const displayElement = document.getElementById(displayId);
        if (!displayElement) {
            console.error(`❌ Elemento ${displayId} não encontrado`);
            return;
        }
        
        if (!loteId) {
            displayElement.textContent = 'Lote não definido';
            return;
        }
        
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            console.log(`📋 FAZENDO CONSULTA SQL: lote_id=${loteId}, evento_id=${eventoId}`);
            
            // CONSULTA DIRETA AO ARQUIVO PHP
            const response = await fetch('/produtor/ajax/buscar_lote_simples.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `lote_id=${loteId}&evento_id=${eventoId}`
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📋 RESPOSTA DO SERVIDOR:', data);
            
            if (data.sucesso && data.lote) {
                const lote = data.lote;
                console.log('📋 DADOS DO LOTE:', lote);
                
                // MONTAR TEXTO EXATAMENTE COMO PEDIDO
                let textoCompleto = `${lote.nome} - ${lote.tipo === 'data' ? 'Por Data' : 'Por Vendas'}`;
                
                // ADICIONAR DADOS ESPECÍFICOS
                if (lote.tipo === 'data') {
                    if (lote.data_inicio && lote.data_fim) {
                        const inicio = new Date(lote.data_inicio).toLocaleDateString('pt-BR');
                        const fim = new Date(lote.data_fim).toLocaleDateString('pt-BR');
                        textoCompleto += ` - (${inicio} até ${fim})`;
                    }
                } else {
                    if (lote.percentual_venda) {
                        textoCompleto += ` - (${lote.percentual_venda}% dos ingressos vendidos)`;
                    }
                }
                
                displayElement.textContent = textoCompleto;
                console.log(`✅ TEXTO DEFINIDO: "${textoCompleto}"`);
                
            } else {
                const textoErro = `Lote ID ${loteId} (não encontrado)`;
                displayElement.textContent = textoErro;
                console.error('❌ LOTE NÃO ENCONTRADO:', data);
            }
            
        } catch (error) {
            const textoErro = `Lote ID ${loteId} (erro de conexão)`;
            displayElement.textContent = textoErro;
            console.error('❌ ERRO NA CONSULTA:', error);
        }
    };
    
    // INTERCEPTAR EDIÇÃO DE INGRESSOS - EXECUTAR IMEDIATAMENTE
    const originalEditarIngressoDoBanco = window.editarIngressoDoBanco;
    
    window.editarIngressoDoBanco = function(ingressoId) {
        console.log(`📋 INTERCEPTANDO EDIÇÃO DE INGRESSO: ${ingressoId}`);
        
        // Chamar função original PRIMEIRO
        if (originalEditarIngressoDoBanco) {
            originalEditarIngressoDoBanco(ingressoId);
        }
        
        // BUSCAR DADOS DO INGRESSO
        const ingresso = window.ingressosDoBanco?.find(i => i.id == ingressoId);
        if (!ingresso) {
            console.error(`❌ INGRESSO ${ingressoId} NÃO ENCONTRADO`);
            console.error('📋 ingressosDoBanco:', window.ingressosDoBanco);
            return;
        }
        
        console.log(`📋 INGRESSO ENCONTRADO:`, ingresso);
        console.log(`📋 LOTE_ID: ${ingresso.lote_id}`);
        console.log(`📋 TIPO: ${ingresso.tipo}`);
        
        // DEFINIR QUAL DISPLAY USAR BASEADO NO TIPO
        let displayId = '';
        if (ingresso.tipo === 'pago') {
            displayId = 'editPaidTicketLoteDisplay';
        } else if (ingresso.tipo === 'gratuito') {
            displayId = 'editFreeTicketLoteDisplay';
        } else if (ingresso.tipo === 'combo') {
            displayId = 'editComboLoteDisplay';
        }
        
        console.log(`📋 USANDO DISPLAY: ${displayId}`);
        
        // MÚLTIPLAS TENTATIVAS COM TIMEOUTS DIFERENTES
        setTimeout(() => {
            console.log(`📋 TIMEOUT 100ms - TENTATIVA 1`);
            window.exibirDadosLoteDisplay(ingresso.lote_id, displayId);
        }, 100);
        
        setTimeout(() => {
            console.log(`📋 TIMEOUT 300ms - TENTATIVA 2`);
            window.exibirDadosLoteDisplay(ingresso.lote_id, displayId);
        }, 300);
        
        setTimeout(() => {
            console.log(`📋 TIMEOUT 500ms - TENTATIVA 3`);
            window.exibirDadosLoteDisplay(ingresso.lote_id, displayId);
        }, 500);
        
        setTimeout(() => {
            console.log(`📋 TIMEOUT 1000ms - TENTATIVA FINAL`);
            window.exibirDadosLoteDisplay(ingresso.lote_id, displayId);
        }, 1000);
    };
    
    console.log('✅ Sistema de Display de Lote ATIVO e FUNCIONAL');
    
    // FUNÇÃO DE FORÇA BRUTA - ATUALIZAR TODOS OS DISPLAYS VISÍVEIS
    window.forcarAtualizarTodosDisplaysLote = function() {
        console.log('🔥 FORÇA BRUTA - ATUALIZANDO TODOS OS DISPLAYS');
        
        const displays = [
            { id: 'editPaidTicketLoteDisplay', hiddenId: 'editPaidTicketLote' },
            { id: 'editFreeTicketLoteDisplay', hiddenId: 'editFreeTicketLote' },
            { id: 'editComboLoteDisplay', hiddenId: 'editComboTicketLote' }
        ];
        
        displays.forEach(display => {
            const elemento = document.getElementById(display.id);
            const hidden = document.getElementById(display.hiddenId);
            
            if (elemento && hidden && hidden.value) {
                console.log(`🔥 FORÇANDO ${display.id} com lote ${hidden.value}`);
                window.exibirDadosLoteDisplay(hidden.value, display.id);
            } else {
                console.log(`🔥 IGNORANDO ${display.id} - elemento: ${!!elemento}, hidden: ${!!hidden}, valor: ${hidden?.value}`);
            }
        });
    };
    
    // FUNÇÃO DE TESTE MANUAL
    window.testarLoteDisplay = function(loteId, displayId) {
        console.log(`🧪 TESTE MANUAL: loteId=${loteId}, displayId=${displayId}`);
        window.exibirDadosLoteDisplay(loteId, displayId);
    };
    
    // INTERCEPTAR ABERTURA DE MODAIS
    const originalOpenModal = window.openModal;
    if (originalOpenModal) {
        window.openModal = function(modalId) {
            console.log(`📋 INTERCEPTANDO ABERTURA DO MODAL: ${modalId}`);
            
            // Chamar função original
            const result = originalOpenModal(modalId);
            
            // Se é modal de edição, forçar atualização após 500ms
            if (modalId && modalId.includes('edit') && modalId.includes('Modal')) {
                setTimeout(() => {
                    console.log(`📋 FORÇANDO ATUALIZAÇÃO APÓS ABERTURA DO MODAL ${modalId}`);
                    window.forcarAtualizarTodosDisplaysLote();
                }, 500);
            }
            
            return result;
        };
    }
    
    // OBSERVAR MUDANÇAS NOS MODAIS
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const element = mutation.target;
                if (element.id && element.id.includes('Modal') && element.id.includes('edit')) {
                    if (element.style.display === 'flex' || element.style.display === 'block') {
                        console.log(`📋 MODAL ${element.id} ABERTO - FORÇANDO ATUALIZAÇÃO`);
                        setTimeout(() => {
                            window.forcarAtualizarTodosDisplaysLote();
                        }, 200);
                    }
                }
            }
        });
    });
    
    // Observar mudanças nos modais
    setTimeout(() => {
        const modals = document.querySelectorAll('[id*="Modal"]');
        modals.forEach(modal => {
            observer.observe(modal, { attributes: true, attributeFilter: ['style'] });
        });
        console.log(`📋 Observando ${modals.length} modais para mudanças`);
    }, 1000);
    
    // TESTE AUTOMÁTICO AO CARREGAR
    setTimeout(() => {
        console.log('🧪 EXECUTANDO TESTE AUTOMÁTICO...');
        
        // Testar se elementos existem
        const elementos = [
            'editPaidTicketLoteDisplay',
            'editFreeTicketLoteDisplay', 
            'editComboLoteDisplay'
        ];
        
        elementos.forEach(id => {
            const el = document.getElementById(id);
            console.log(`🧪 Elemento ${id}: ${el ? 'EXISTE' : 'NÃO EXISTE'}`);
        });
        
        // Se há ingressos, testar com o primeiro
        if (window.ingressosDoBanco && window.ingressosDoBanco.length > 0) {
            const primeiroIngresso = window.ingressosDoBanco[0];
            console.log(`🧪 TESTANDO COM PRIMEIRO INGRESSO:`, primeiroIngresso);
            
            if (primeiroIngresso.tipo === 'pago') {
                window.testarLoteDisplay(primeiroIngresso.lote_id, 'editPaidTicketLoteDisplay');
            }
        }
    }, 2000);
})();
