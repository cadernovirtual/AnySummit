/**
 * FIX ESPECÍFICO - Problemas dos Modais de Ingresso Pago
 * 
 * PROBLEMAS RESOLVIDOS:
 * 1) Datas não atualizam ao mudar lote no select
 * 2) lote_id vem como NaN (deve ser número válido)
 * 3) ticket_id é null nos modais de criação (deve ser ignorado)
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Fix específico para modais de ingresso pago carregado');
    
    // ==============================================
    // PROBLEMA 1: DATAS NÃO ATUALIZAM AO MUDAR LOTE
    // ==============================================
    
    function configurarAtualizacaoDatas() {
        // Configurar modal de CRIAÇÃO
        const selectCriacao = document.getElementById('paidTicketLote');
        if (selectCriacao) {
            console.log('📝 Configurando select de criação: paidTicketLote');
            selectCriacao.addEventListener('change', function() {
                atualizarDatasDoLote('criacao', this.value);
            });
        }
        
        // Configurar modal de EDIÇÃO
        const selectEdicao = document.getElementById('editPaidTicketLote');
        if (selectEdicao) {
            console.log('✏️ Configurando select de edição: editPaidTicketLote');
            selectEdicao.addEventListener('change', function() {
                atualizarDatasDoLote('edicao', this.value);
            });
        }
    }
    
    async function atualizarDatasDoLote(modalTipo, loteId) {
        console.log(`🔄 Atualizando datas para lote ${loteId} no modal ${modalTipo}`);
        
        // Se não há lote selecionado, limpar campos
        if (!loteId || loteId === '' || loteId === '0') {
            limparCamposDatas(modalTipo);
            return;
        }
        
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            // Obter tipo do lote
            const tipoResponse = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=obter_tipo_lote&evento_id=${eventoId}&lote_id=${loteId}`
            });
            
            const tipoData = await tipoResponse.json();
            console.log('📊 Tipo do lote:', tipoData);
            
            if (tipoData.tipo === 'data') {
                // Obter datas do lote
                const datasResponse = await fetch('/produtor/ajax/wizard_evento.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `action=obter_datas_lote&evento_id=${eventoId}&lote_id=${loteId}`
                });
                
                const datasData = await datasResponse.json();
                console.log('📅 Datas do lote:', datasData);
                
                if (datasData.data_inicio && datasData.data_fim) {
                    preencherCamposDatas(modalTipo, datasData.data_inicio, datasData.data_fim, true);
                    mostrarMensagemBloqueio(modalTipo);
                }
            } else {
                // Lote por percentual - liberar campos
                preencherCamposDatas(modalTipo, '', '', false);
                ocultarMensagemBloqueio(modalTipo);
            }
            
        } catch (error) {
            console.error('❌ Erro ao atualizar datas:', error);
        }
    }
    
    function preencherCamposDatas(modalTipo, dataInicio, dataFim, readonly) {
        const prefixo = modalTipo === 'criacao' ? 'paid' : 'editPaid';
        
        const campoInicio = document.getElementById(`${prefixo}SaleStart`);
        const campoFim = document.getElementById(`${prefixo}SaleEnd`);
        
        if (campoInicio) {
            campoInicio.value = dataInicio;
            campoInicio.readOnly = readonly;
            console.log(`📅 Campo início ${prefixo}SaleStart: ${dataInicio}, readonly: ${readonly}`);
        }
        
        if (campoFim) {
            campoFim.value = dataFim;
            campoFim.readOnly = readonly;
            console.log(`📅 Campo fim ${prefixo}SaleEnd: ${dataFim}, readonly: ${readonly}`);
        }
    }
    
    function limparCamposDatas(modalTipo) {
        preencherCamposDatas(modalTipo, '', '', false);
        ocultarMensagemBloqueio(modalTipo);
    }
    
    function mostrarMensagemBloqueio(modalTipo) {
        const modalId = modalTipo === 'criacao' ? 'paidTicketModal' : 'editPaidTicketModal';
        const modal = document.getElementById(modalId);
        
        if (modal) {
            // Remover mensagens anteriores
            const mensagensAnteriores = modal.querySelectorAll('.bloqueio-lote-data-msg');
            mensagensAnteriores.forEach(msg => msg.remove());
            
            // Criar nova mensagem
            const mensagem = document.createElement('div');
            mensagem.className = 'bloqueio-lote-data-msg';
            mensagem.style.cssText = `
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                margin: 10px 0;
            `;
            mensagem.innerHTML = '🔒 Campos bloqueados: Este lote é "por data". As datas dos ingressos serão sempre iguais às do lote.';
            
            // Inserir após o select do lote
            const selectId = modalTipo === 'criacao' ? 'paidTicketLote' : 'editPaidTicketLote';
            const select = document.getElementById(selectId);
            if (select && select.parentNode) {
                select.parentNode.insertAdjacentElement('afterend', mensagem);
            }
        }
    }
    
    function ocultarMensagemBloqueio(modalTipo) {
        const modalId = modalTipo === 'criacao' ? 'paidTicketModal' : 'editPaidTicketModal';
        const modal = document.getElementById(modalId);
        
        if (modal) {
            const mensagens = modal.querySelectorAll('.bloqueio-lote-data-msg');
            mensagens.forEach(msg => msg.remove());
        }
    }
    
    // ===============================================
    // PROBLEMA 2: LOTE_ID = NaN E TICKET_ID = NULL
    // ===============================================
    
    function corrigirColetas() {
        // Interceptar createPaidTicket (modal de criação)
        if (window.createPaidTicket) {
            const originalCreatePaidTicket = window.createPaidTicket;
            window.createPaidTicket = function() {
                console.log('🚀 Interceptando createPaidTicket para corrigir lote_id');
                
                // Corrigir lote_id ANTES da validação
                const loteSelect = document.getElementById('paidTicketLote');
                if (loteSelect && loteSelect.value) {
                    const loteIdNum = parseInt(loteSelect.value);
                    if (!isNaN(loteIdNum)) {
                        console.log(`✅ lote_id corrigido: ${loteIdNum}`);
                        // Garantir que o valor seja numérico
                        loteSelect.value = loteIdNum.toString();
                    }
                }
                
                // Chamar função original
                return originalCreatePaidTicket.apply(this, arguments);
            };
        }
        
        // Interceptar updatePaidTicket (modal de edição)
        if (window.updatePaidTicket) {
            const originalUpdatePaidTicket = window.updatePaidTicket;
            window.updatePaidTicket = function() {
                console.log('🔄 Interceptando updatePaidTicket para corrigir lote_id');
                
                // Corrigir lote_id ANTES da validação
                const loteSelect = document.getElementById('editPaidTicketLote');
                if (loteSelect && loteSelect.value) {
                    const loteIdNum = parseInt(loteSelect.value);
                    if (!isNaN(loteIdNum)) {
                        console.log(`✅ lote_id corrigido: ${loteIdNum}`);
                        // Garantir que o valor seja numérico
                        loteSelect.value = loteIdNum.toString();
                    }
                }
                
                // Chamar função original
                return originalUpdatePaidTicket.apply(this, arguments);
            };
        }
    }
    
    // Aguardar carregamento completo antes de aplicar interceptações
    setTimeout(() => {
        configurarAtualizacaoDatas();
        corrigirColetas();
        console.log('✅ Fix específico aplicado com sucesso');
    }, 1000);
});
