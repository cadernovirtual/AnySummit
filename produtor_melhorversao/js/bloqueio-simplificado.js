/**
 * CORREÇÃO: Bloqueio de datas simplificado e funcional
 * Remove mensagens duplicadas e garante atualização de datas
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 Sistema de bloqueio simplificado carregado');
    
    // Aguardar outros scripts carregarem
    setTimeout(() => {
        inicializarBloqueioSimplificado();
    }, 1500);
    
    function inicializarBloqueioSimplificado() {
        console.log('🔧 Inicializando bloqueio simplificado...');
        
        // IDs dos selects de lote
        const selectsLote = [
            'paidTicketLote',
            'freeTicketLote', 
            'editPaidTicketLote',
            'editFreeTicketLote'
        ];
        
        selectsLote.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                console.log(`🎯 Configurando: ${selectId}`);
                
                // Limpar listeners anteriores
                const newSelect = select.cloneNode(true);
                select.parentNode.replaceChild(newSelect, select);
                
                // Adicionar listener único
                newSelect.addEventListener('change', function(e) {
                    processarMudancaLote(selectId, e.target.value);
                });
                
                // Verificar estado inicial
                if (newSelect.value && newSelect.value !== '0') {
                    setTimeout(() => {
                        processarMudancaLote(selectId, newSelect.value);
                    }, 300);
                }
            }
        });
    }
    
    // Processar mudança de lote
    async function processarMudancaLote(selectId, loteId) {
        console.log(`🔄 Processando mudança de lote em ${selectId}: ${loteId}`);
        
        // Remover mensagens anteriores SEMPRE
        removerTodasMensagens(selectId);
        
        if (!loteId || loteId === '0' || loteId === '') {
            liberarCampos(selectId);
            return;
        }
        
        try {
            // Verificar tipo do lote
            const tipoLote = await obterTipoLoteSimples(loteId);
            
            if (tipoLote === 'data') {
                console.log(`🔒 Lote por DATA - bloqueando ${selectId}`);
                await bloquearCamposComDatas(selectId, loteId);
            } else {
                console.log(`🔓 Lote por PERCENTUAL - liberando ${selectId}`);
                liberarCampos(selectId);
            }
        } catch (error) {
            console.error('❌ Erro ao processar lote:', error);
            liberarCampos(selectId);
        }
    }
    
    // Obter tipo do lote
    async function obterTipoLoteSimples(loteId) {
        const eventoId = window.getEventoId?.() || new URLSearchParams(window.location.search).get('evento_id');
        
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=obter_tipo_lote&lote_id=${loteId}&evento_id=${eventoId}`
        });
        
        const data = await response.json();
        return data?.tipo || 'percentual';
    }
    
    // Bloquear campos com datas
    async function bloquearCamposComDatas(selectId, loteId) {
        const campos = obterCamposPorSelect(selectId);
        if (!campos) return;
        
        const startField = document.getElementById(campos.start);
        const endField = document.getElementById(campos.end);
        
        if (!startField || !endField) {
            console.warn(`⚠️ Campos não encontrados: ${campos.start}, ${campos.end}`);
            return;
        }
        
        // Aplicar bloqueio visual
        [startField, endField].forEach(field => {
            field.readOnly = true;
            field.style.backgroundColor = '#f8f9fa';
            field.style.cursor = 'not-allowed';
            field.style.border = '2px solid #ffc107';
        });
        
        // Buscar e aplicar datas do lote
        try {
            const datasLote = await obterDatasLoteSimples(loteId);
            
            if (datasLote && datasLote.data_inicio && datasLote.data_fim) {
                startField.value = datasLote.data_inicio;
                endField.value = datasLote.data_fim;
                
                console.log(`📅 Datas aplicadas: ${datasLote.data_inicio} até ${datasLote.data_fim}`);
            }
        } catch (error) {
            console.error('❌ Erro ao obter datas:', error);
        }
        
        // Adicionar APENAS UMA mensagem
        adicionarMensagemUnica(endField, selectId);
        
        console.log(`🔒 Campos bloqueados e datas aplicadas`);
    }
    
    // Liberar campos
    function liberarCampos(selectId) {
        const campos = obterCamposPorSelect(selectId);
        if (!campos) return;
        
        const startField = document.getElementById(campos.start);
        const endField = document.getElementById(campos.end);
        
        if (startField && endField) {
            [startField, endField].forEach(field => {
                field.readOnly = false;
                field.style.backgroundColor = '';
                field.style.cursor = '';
                field.style.border = '';
            });
            
            console.log(`🔓 Campos liberados: ${campos.start}, ${campos.end}`);
        }
    }
    
    // Obter campos por select
    function obterCamposPorSelect(selectId) {
        const mapa = {
            'paidTicketLote': { start: 'paidSaleStart', end: 'paidSaleEnd' },
            'freeTicketLote': { start: 'freeSaleStart', end: 'freeSaleEnd' },
            'editPaidTicketLote': { start: 'editPaidSaleStart', end: 'editPaidSaleEnd' },
            'editFreeTicketLote': { start: 'editFreeSaleStart', end: 'editFreeSaleEnd' }
        };
        
        return mapa[selectId];
    }
    
    // Obter datas do lote
    async function obterDatasLoteSimples(loteId) {
        const eventoId = window.getEventoId?.() || new URLSearchParams(window.location.search).get('evento_id');
        
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=obter_datas_lote&lote_id=${loteId}&evento_id=${eventoId}`
        });
        
        return await response.json();
    }
    
    // Adicionar APENAS UMA mensagem
    function adicionarMensagemUnica(fieldElement, selectId) {
        const mensagemId = `msg-bloqueio-${selectId}`;
        
        // Remover se já existe
        const existente = document.getElementById(mensagemId);
        if (existente) {
            existente.remove();
        }
        
        // Criar mensagem única
        const mensagem = document.createElement('div');
        mensagem.id = mensagemId;
        mensagem.className = 'alert alert-warning';
        mensagem.style.cssText = `
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 10px 15px;
            border-radius: 4px;
            font-size: 13px;
            margin-top: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        mensagem.innerHTML = `
            🔒 <strong>Campos bloqueados:</strong> Este lote é "por data". As datas dos ingressos serão sempre iguais às do lote.
        `;
        
        // Inserir após o campo
        fieldElement.parentNode.insertBefore(mensagem, fieldElement.nextSibling);
        
        console.log(`💬 Mensagem única adicionada para ${selectId}`);
    }
    
    // Remover todas as mensagens
    function removerTodasMensagens(selectId) {
        // Remover por ID específico
        const mensagemId = `msg-bloqueio-${selectId}`;
        const mensagem = document.getElementById(mensagemId);
        if (mensagem) {
            mensagem.remove();
        }
        
        // Remover outras possíveis mensagens duplicadas
        const todasMensagens = document.querySelectorAll(`[id*="bloqueio"], [id*="msg-"], .alert-warning`);
        todasMensagens.forEach(msg => {
            if (msg.textContent.includes('Campos bloqueados') && msg.textContent.includes('lote')) {
                msg.remove();
            }
        });
    }
    
    // Interceptar abertura de modais
    const modais = ['paidTicketModal', 'freeTicketModal', 'editPaidTicketModal', 'editFreeTicketModal'];
    
    modais.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (modal.style.display === 'block' || modal.style.display === 'flex') {
                            console.log(`👁️ Modal ${modalId} aberto - inicializando bloqueio`);
                            setTimeout(() => {
                                inicializarBloqueioSimplificado();
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
    
    console.log('✅ Sistema de bloqueio simplificado inicializado');
});
