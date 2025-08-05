/**
 * CONTROLE ESPECÍFICO DE CAMPOS DE INGRESSO BASEADO NO TIPO DE LOTE
 * Versão específica para os modais existentes no sistema
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 Sistema específico de controle de campos de ingresso carregado');
    
    // IDs dos campos nos modais
    const CAMPOS_MODAIS = {
        paidTicket: {
            lote: 'paidTicketLote',
            startDate: 'paidSaleStart', 
            endDate: 'paidSaleEnd'
        },
        freeTicket: {
            lote: 'freeTicketLote',
            startDate: 'freeSaleStart',
            endDate: 'freeSaleEnd'
        },
        editPaidTicket: {
            lote: 'editPaidTicketLote',
            startDate: 'editPaidSaleStart',
            endDate: 'editPaidSaleEnd'
        },
        editFreeTicket: {
            lote: 'editFreeTicketLote', 
            startDate: 'editFreeSaleStart',
            endDate: 'editFreeSaleEnd'
        }
    };
    
    // Inicializar controles para todos os modais
    function inicializarControles() {
        Object.keys(CAMPOS_MODAIS).forEach(modalKey => {
            const campos = CAMPOS_MODAIS[modalKey];
            const loteSelect = document.getElementById(campos.lote);
            
            if (loteSelect) {
                console.log(`🎯 Configurando modal: ${modalKey}`);
                
                // Evento de mudança no select de lote
                loteSelect.addEventListener('change', function() {
                    controlarCamposData(modalKey, this.value);
                });
                
                // Configurar estado inicial se já há valor
                if (loteSelect.value) {
                    controlarCamposData(modalKey, loteSelect.value);
                }
            }
        });
    }
    
    // Controlar campos de data baseado no lote selecionado
    function controlarCamposData(modalKey, loteValue) {
        const campos = CAMPOS_MODAIS[modalKey];
        const startField = document.getElementById(campos.startDate);
        const endField = document.getElementById(campos.endDate);
        
        if (!startField || !endField) {
            console.warn(`⚠️ Campos não encontrados para modal: ${modalKey}`);
            return;
        }
        
        if (!loteValue) {
            // Sem lote selecionado - liberar campos
            liberarCampos(startField, endField);
            return;
        }
        
        // Buscar tipo do lote no banco usando o ID
        verificarTipoLotePorId(loteValue).then(tipoLote => {
            console.log(`🔍 Modal ${modalKey}: Lote ID "${loteValue}" é do tipo: ${tipoLote}`);
            
            if (tipoLote === 'data') {
                // Lote por data - bloquear campos e aplicar datas do lote
                bloquearCampos(startField, endField, loteValue);
                aplicarDatasDoLotePorId(startField, endField, loteValue);
            } else {
                // Lote por percentual ou outros - liberar campos
                liberarCampos(startField, endField);
            }
        });
    }
    
    // Verificar tipo do lote pelo ID (buscar no banco via AJAX)
    async function verificarTipoLotePorId(loteId) {
        if (!loteId || loteId === '') return 'desconhecido';
        
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            if (!eventoId) return 'desconhecido';
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=obter_tipo_lote&lote_id=${loteId}&evento_id=${eventoId}`
            });
            
            const data = await response.json();
            return data.tipo || 'desconhecido';
            
        } catch (error) {
            console.error('Erro ao verificar tipo do lote:', error);
            return 'desconhecido';
        }
    }
    
    // Aplicar datas do lote pelos ID
    async function aplicarDatasDoLotePorId(startField, endField, loteId) {
        if (!loteId) return;
        
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            if (!eventoId) return;
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=obter_datas_lote&lote_id=${loteId}&evento_id=${eventoId}`
            });
            
            const data = await response.json();
            
            if (data.data_inicio) {
                startField.value = data.data_inicio;
            }
            
            if (data.data_fim) {
                endField.value = data.data_fim;
            }
            
            console.log(`📅 Datas aplicadas do lote ID ${loteId}: ${data.data_inicio} até ${data.data_fim}`);
            
        } catch (error) {
            console.error('Erro ao buscar datas do lote:', error);
        }
    }
    
    // Bloquear campos de data
    function bloquearCampos(startField, endField, loteNome) {
        [startField, endField].forEach(field => {
            field.disabled = true;
            field.readOnly = true;
            field.style.backgroundColor = '#f8f9fa';
            field.style.cursor = 'not-allowed';
            field.style.border = '1px solid #ffc107';
        });
        
        // Adicionar/atualizar mensagem explicativa
        adicionarMensagemExplicativa(endField, loteNome);
        
        console.log(`🔒 Campos bloqueados para lote por data: ${loteNome}`);
    }
    
    // Liberar campos de data
    function liberarCampos(startField, endField) {
        [startField, endField].forEach(field => {
            field.disabled = false;
            field.readOnly = false;
            field.style.backgroundColor = '';
            field.style.cursor = '';
            field.style.border = '';
        });
        
        // Remover mensagem explicativa
        removerMensagemExplicativa(endField);
        
        console.log('🔓 Campos de data liberados');
    }
    
    // Aplicar datas do lote aos campos
    function aplicarDatasDoLote(startField, endField, loteNome) {
        if (!window.lotesData || !window.lotesData.porData) {
            return;
        }
        
        const lote = window.lotesData.porData.find(l => l.nome === loteNome);
        if (!lote) {
            console.warn(`⚠️ Lote "${loteNome}" não encontrado nos dados`);
            return;
        }
        
        if (lote.dataInicio) {
            startField.value = lote.dataInicio;
        }
        
        if (lote.dataFim) {
            endField.value = lote.dataFim;
        }
        
        console.log(`📅 Datas aplicadas do lote "${loteNome}": ${lote.dataInicio} até ${lote.dataFim}`);
    }
    
    // Adicionar mensagem explicativa
    function adicionarMensagemExplicativa(field, loteNome) {
        const mensagemId = field.id + '_mensagem_lote';
        
        // Remover mensagem anterior
        const mensagemAnterior = document.getElementById(mensagemId);
        if (mensagemAnterior) {
            mensagemAnterior.remove();
        }
        
        // Criar nova mensagem
        const mensagem = document.createElement('div');
        mensagem.id = mensagemId;
        mensagem.style.cssText = `
            font-size: 11px;
            color: #856404;
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            padding: 8px;
            margin-top: 5px;
            display: flex;
            align-items: center;
        `;
        mensagem.innerHTML = `
            <span style="margin-right: 8px;">🔒</span>
            <div>
                <strong>Datas bloqueadas:</strong> Este ingresso está associado ao lote "${loteNome}" (por data).<br>
                As datas serão sempre iguais às do lote. Para editá-las, associe a um lote por percentual.
            </div>
        `;
        
        field.parentNode.insertBefore(mensagem, field.nextSibling);
    }
    
    // Remover mensagem explicativa
    function removerMensagemExplicativa(field) {
        const mensagemId = field.id + '_mensagem_lote';
        const mensagem = document.getElementById(mensagemId);
        if (mensagem) {
            mensagem.remove();
        }
    }
    
    // Inicializar após DOM estar pronto
    setTimeout(() => {
        inicializarControles();
        
        // Também monitorar quando modais são abertos
        const observer = new MutationObserver((mutations) => {
            let modalAberto = false;
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList?.contains('modal-overlay')) {
                        modalAberto = true;
                    }
                });
            });
            
            if (modalAberto) {
                setTimeout(inicializarControles, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
    }, 1000);
    
    // Função global para ser chamada quando lotes são atualizados
    window.atualizarControleLotes = function() {
        console.log('🔄 Atualizando controles de lote nos modais...');
        setTimeout(inicializarControles, 100);
    };
    
    console.log('✅ Sistema específico de controle de campos de ingresso inicializado');
});
