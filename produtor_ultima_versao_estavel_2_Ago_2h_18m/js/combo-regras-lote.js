/**
 * REGRAS DE LOTE PARA INGRESSO COMBO
 * Aplica as mesmas regras do ingresso pago: datas, readonly, mensagens
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎭 Regras de lote para combo carregadas');
    
    // Configurar select de lote do combo
    function configurarSelectLoteCombo() {
        const selectCombo = document.getElementById('comboTicketLote');
        if (selectCombo) {
            console.log('🎭 Configurando select de lote do combo');
            selectCombo.addEventListener('change', function() {
                atualizarDatasDoLoteCombo(this.value);
            });
        }
        
        // Select de edição de combo
        const selectEditCombo = document.getElementById('editComboTicketLote');
        if (selectEditCombo) {
            console.log('✏️ Configurando select de edição do combo');
            selectEditCombo.addEventListener('change', function() {
                atualizarDatasDoLoteCombo(this.value, 'edit');
            });
        }
    }
    
    async function atualizarDatasDoLoteCombo(loteId, modalTipo = 'create') {
        console.log(`🔄 Atualizando datas do combo para lote ${loteId} (${modalTipo})`);
        
        if (!loteId || loteId === '' || loteId === '0') {
            limparCamposCombo(modalTipo);
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
            console.log('📊 Tipo do lote (combo):', tipoData);
            
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
                console.log('📅 Datas do lote (combo):', datasData);
                
                if (datasData.data_inicio && datasData.data_fim) {
                    preencherCamposCombo(modalTipo, datasData.data_inicio, datasData.data_fim, true);
                    mostrarMensagemBloqueioCombo(modalTipo);
                }
            } else {
                // Lote por percentual - liberar campos
                preencherCamposCombo(modalTipo, '', '', false);
                ocultarMensagemBloqueioCombo(modalTipo);
            }
            
        } catch (error) {
            console.error('❌ Erro ao atualizar datas do combo:', error);
        }
    }
    
    function preencherCamposCombo(modalTipo, dataInicio, dataFim, readonly) {
        const prefixo = modalTipo === 'create' ? 'combo' : 'editCombo';
        
        const campoInicio = document.getElementById(`${prefixo}SaleStart`);
        const campoFim = document.getElementById(`${prefixo}SaleEnd`);
        
        if (campoInicio) {
            campoInicio.value = dataInicio;
            campoInicio.readOnly = readonly;
            console.log(`📅 Campo início combo ${prefixo}SaleStart: ${dataInicio}, readonly: ${readonly}`);
        }
        
        if (campoFim) {
            campoFim.value = dataFim;
            campoFim.readOnly = readonly;
            console.log(`📅 Campo fim combo ${prefixo}SaleEnd: ${dataFim}, readonly: ${readonly}`);
        }
    }
    
    function limparCamposCombo(modalTipo) {
        preencherCamposCombo(modalTipo, '', '', false);
        ocultarMensagemBloqueioCombo(modalTipo);
    }
    
    function mostrarMensagemBloqueioCombo(modalTipo) {
        const modalId = modalTipo === 'create' ? 'comboTicketModal' : 'editComboTicketModal';
        const modal = document.getElementById(modalId);
        
        if (modal) {
            // Remover mensagens anteriores
            const mensagensAnteriores = modal.querySelectorAll('.bloqueio-lote-data-msg-combo');
            mensagensAnteriores.forEach(msg => msg.remove());
            
            // Criar nova mensagem
            const mensagem = document.createElement('div');
            mensagem.className = 'bloqueio-lote-data-msg-combo';
            mensagem.style.cssText = `
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                margin: 10px 0;
            `;
            mensagem.innerHTML = '🔒 Campos bloqueados: Este lote é "por data". As datas dos ingressos combo serão sempre iguais às do lote.';
            
            // Inserir na mesma posição que no modal de ingresso pago
            // Buscar o container do período de vendas (onde ficam os campos de data)
            const periodoContainer = modal.querySelector('[id*="Period"], .form-grid');
            if (periodoContainer && periodoContainer.parentNode) {
                periodoContainer.parentNode.insertBefore(mensagem, periodoContainer);
            } else {
                // Fallback: inserir após o select do lote
                const selectId = modalTipo === 'create' ? 'comboTicketLote' : 'editComboTicketLote';
                const select = document.getElementById(selectId);
                if (select && select.parentNode) {
                    select.parentNode.insertAdjacentElement('afterend', mensagem);
                }
            }
        }
    }
    
    function ocultarMensagemBloqueioCombo(modalTipo) {
        const modalId = modalTipo === 'create' ? 'comboTicketModal' : 'editComboTicketModal';
        const modal = document.getElementById(modalId);
        
        if (modal) {
            const mensagens = modal.querySelectorAll('.bloqueio-lote-data-msg-combo');
            mensagens.forEach(msg => msg.remove());
        }
    }
    
    // Interceptar salvamento de combo para incluir lote_id
    if (window.createComboTicket) {
        const originalCreateComboTicket = window.createComboTicket;
        window.createComboTicket = function() {
            console.log('🎭 Interceptando createComboTicket para aplicar regras de lote');
            
            // Coletar lote_id antes da validação
            const loteSelect = document.getElementById('comboTicketLote');
            if (loteSelect && loteSelect.value) {
                const loteIdNum = parseInt(loteSelect.value);
                if (!isNaN(loteIdNum)) {
                    console.log(`✅ lote_id combo corrigido: ${loteIdNum}`);
                    loteSelect.value = loteIdNum.toString();
                }
            }
            
            return originalCreateComboTicket.apply(this, arguments);
        };
    }
    
    // Aguardar carregamento completo
    setTimeout(() => {
        configurarSelectLoteCombo();
        console.log('✅ Regras de lote para combo aplicadas');
    }, 1500);
});
