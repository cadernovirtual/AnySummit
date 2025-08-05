/**
 * GARANTIR BLOQUEIO DE DATAS FUNCIONAL
 * Força inicialização do sistema de bloqueio
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 Garantindo sistema de bloqueio de datas funcional');
    
    // Aguardar outros scripts carregarem
    setTimeout(() => {
        inicializarBloqueioCompleto();
    }, 2000);
    
    function inicializarBloqueioCompleto() {
        console.log('🔧 Inicializando bloqueio completo de datas...');
        
        // IDs dos selects de lote em todos os modais
        const selectsLote = [
            'paidTicketLote',
            'freeTicketLote', 
            'editPaidTicketLote',
            'editFreeTicketLote',
            'comboTicketLote'
        ];
        
        selectsLote.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                console.log(`🎯 Configurando bloqueio para select: ${selectId}`);
                
                // Remover listeners existentes para evitar duplicação
                select.removeEventListener('change', handleLoteChange);
                
                // Adicionar listener
                select.addEventListener('change', function(e) {
                    handleLoteChange(e, selectId);
                });
                
                // Verificar estado inicial se já tem valor
                if (select.value && select.value !== '0' && select.value !== '') {
                    setTimeout(() => {
                        handleLoteChange({ target: select }, selectId);
                    }, 500);
                }
            } else {
                console.warn(`⚠️ Select não encontrado: ${selectId}`);
            }
        });
    }
    
    // Handler para mudança de lote
    async function handleLoteChange(event, selectId) {
        const loteId = event.target.value;
        
        console.log(`🔄 Lote alterado em ${selectId}: ${loteId}`);
        
        if (!loteId || loteId === '0' || loteId === '') {
            liberarCamposDeDatas(selectId);
            return;
        }
        
        // Verificar tipo do lote
        const tipoLote = await obterTipoLote(loteId);
        
        if (tipoLote === 'data') {
            console.log(`🔒 Lote por DATA - bloqueando campos em ${selectId}`);
            await bloquearCamposDeDatas(selectId, loteId);
        } else {
            console.log(`🔓 Lote por PERCENTUAL - liberando campos em ${selectId}`);
            liberarCamposDeDatas(selectId);
        }
    }
    
    // Obter tipo do lote via API
    async function obterTipoLote(loteId) {
        try {
            const eventoId = window.getEventoId?.() || new URLSearchParams(window.location.search).get('evento_id');
            
            if (!eventoId) {
                console.warn('⚠️ Evento ID não encontrado para verificar tipo do lote');
                return 'percentual';
            }
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=obter_tipo_lote&lote_id=${loteId}&evento_id=${eventoId}`
            });
            
            const data = await response.json();
            
            if (data && data.tipo) {
                console.log(`📊 Tipo do lote ${loteId}: ${data.tipo}`);
                return data.tipo;
            } else {
                console.warn(`⚠️ Resposta inválida para tipo do lote:`, data);
                return 'percentual';
            }
            
        } catch (error) {
            console.error('❌ Erro ao obter tipo do lote:', error);
            return 'percentual';
        }
    }
    
    // Bloquear campos de datas
    async function bloquearCamposDeDatas(selectId, loteId) {
        const camposIds = obterIdsCamposPorModal(selectId);
        
        if (!camposIds) {
            console.warn(`⚠️ Campos não mapeados para modal: ${selectId}`);
            return;
        }
        
        const startField = document.getElementById(camposIds.startFieldId);
        const endField = document.getElementById(camposIds.endFieldId);
        
        if (!startField || !endField) {
            console.warn(`⚠️ Campos não encontrados: ${camposIds.startFieldId}, ${camposIds.endFieldId}`);
            return;
        }
        
        // Aplicar bloqueio visual
        [startField, endField].forEach(field => {
            field.readOnly = true;
            field.disabled = true;
            field.style.backgroundColor = '#f8f9fa';
            field.style.cursor = 'not-allowed';
            field.style.border = '2px solid #ffc107';
            field.style.color = '#495057';
        });
        
        // Buscar e aplicar datas do lote
        const datasLote = await obterDatasLote(loteId);
        
        if (datasLote) {
            startField.value = datasLote.data_inicio || '';
            endField.value = datasLote.data_fim || '';
            
            console.log(`📅 Datas aplicadas: ${datasLote.data_inicio} até ${datasLote.data_fim}`);
        }
        
        // Adicionar/atualizar mensagem
        adicionarMensagemBloqueio(endField, selectId);
        
        console.log(`🔒 Campos bloqueados: ${camposIds.startFieldId}, ${camposIds.endFieldId}`);
    }
    
    // Liberar campos de datas
    function liberarCamposDeDatas(selectId) {
        const camposIds = obterIdsCamposPorModal(selectId);
        
        if (!camposIds) return;
        
        const startField = document.getElementById(camposIds.startFieldId);
        const endField = document.getElementById(camposIds.endFieldId);
        
        if (startField && endField) {
            [startField, endField].forEach(field => {
                field.readOnly = false;
                field.disabled = false;
                field.style.backgroundColor = '';
                field.style.cursor = '';
                field.style.border = '';
                field.style.color = '';
            });
            
            // Remover mensagem de bloqueio
            removerMensagemBloqueio(selectId);
            
            console.log(`🔓 Campos liberados: ${camposIds.startFieldId}, ${camposIds.endFieldId}`);
        }
    }
    
    // Obter IDs dos campos por modal
    function obterIdsCamposPorModal(selectId) {
        const mapeamento = {
            'paidTicketLote': {
                startFieldId: 'paidSaleStart',
                endFieldId: 'paidSaleEnd'
            },
            'freeTicketLote': {
                startFieldId: 'freeSaleStart',
                endFieldId: 'freeSaleEnd'
            },
            'editPaidTicketLote': {
                startFieldId: 'editPaidSaleStart',
                endFieldId: 'editPaidSaleEnd'
            },
            'editFreeTicketLote': {
                startFieldId: 'editFreeSaleStart',
                endFieldId: 'editFreeSaleEnd'
            },
            'comboTicketLote': {
                startFieldId: 'comboSaleStart',
                endFieldId: 'comboSaleEnd'
            }
        };
        
        return mapeamento[selectId];
    }
    
    // Obter datas do lote via API
    async function obterDatasLote(loteId) {
        try {
            const eventoId = window.getEventoId?.() || new URLSearchParams(window.location.search).get('evento_id');
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=obter_datas_lote&lote_id=${loteId}&evento_id=${eventoId}`
            });
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('❌ Erro ao obter datas do lote:', error);
            return null;
        }
    }
    
    // Adicionar mensagem de bloqueio
    function adicionarMensagemBloqueio(fieldElement, selectId) {
        const mensagemId = `bloqueio-msg-${selectId}`;
        
        // Remover mensagem existente
        const existente = document.getElementById(mensagemId);
        if (existente) {
            existente.remove();
        }
        
        // Criar nova mensagem
        const mensagem = document.createElement('div');
        mensagem.id = mensagemId;
        mensagem.className = 'alert alert-warning mt-2';
        mensagem.style.cssText = `
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            margin-top: 8px;
        `;
        mensagem.innerHTML = `
            <i class="fas fa-lock"></i> 
            <strong>Campos bloqueados:</strong> Este lote usa datas específicas. 
            As datas de venda foram aplicadas automaticamente.
        `;
        
        // Inserir após o campo
        fieldElement.parentNode.insertBefore(mensagem, fieldElement.nextSibling);
    }
    
    // Remover mensagem de bloqueio
    function removerMensagemBloqueio(selectId) {
        const mensagemId = `bloqueio-msg-${selectId}`;
        const mensagem = document.getElementById(mensagemId);
        if (mensagem) {
            mensagem.remove();
        }
    }
    
    // Interceptar abertura de modais para garantir inicialização
    const modaisParaInterceptar = [
        'paidTicketModal',
        'freeTicketModal',
        'editPaidTicketModal',
        'editFreeTicketModal'
    ];
    
    modaisParaInterceptar.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (modal.style.display === 'block' || modal.style.display === 'flex') {
                            console.log(`👁️ Modal ${modalId} aberto - verificando bloqueio`);
                            setTimeout(() => {
                                inicializarBloqueioCompleto();
                            }, 200);
                        }
                    }
                });
            });
            
            observer.observe(modal, {
                attributes: true,
                attributeFilter: ['style']
            });
        }
    });
    
    console.log('✅ Sistema de bloqueio de datas garantido');
});
