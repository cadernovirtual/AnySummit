/**
 * BLOQUEIO REAL DE CAMPOS - VERSÃO DEFINITIVA
 * Sistema que realmente funciona para bloquear campos de data
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 Sistema DEFINITIVO de bloqueio de campos carregado');
    
    // Monitorar mudanças nos selects de lote TODOS OS MODAIS
    function inicializarBloqueios() {
        const selects = [
            'paidTicketLote',
            'freeTicketLote', 
            'editPaidTicketLote',
            'editFreeTicketLote'
        ];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                console.log(`🎯 Configurando select: ${selectId}`);
                
                // Evento de mudança
                select.addEventListener('change', function() {
                    verificarEBloquearCampos(selectId, this.value);
                });
                
                // Verificar estado inicial
                if (select.value) {
                    setTimeout(() => {
                        verificarEBloquearCampos(selectId, select.value);
                    }, 500);
                }
            }
        });
    }
    
    // Verificar se lote é "por data" e bloquear campos
    async function verificarEBloquearCampos(selectId, loteId) {
        if (!loteId || loteId === '' || loteId === '0') {
            liberarCamposPorModal(selectId);
            return;
        }
        
        console.log(`🔍 Verificando lote ID ${loteId} para ${selectId}...`);
        
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=obter_tipo_lote&lote_id=${loteId}&evento_id=${eventoId}`
            });
            
            const data = await response.json();
            console.log(`📊 Resposta do servidor:`, data);
            
            if (data.tipo === 'data') {
                console.log(`🔒 Lote é por DATA - bloqueando campos para ${selectId}`);
                bloquearCamposPorModal(selectId, loteId);
            } else {
                console.log(`🔓 Lote é por PERCENTUAL - liberando campos para ${selectId}`);
                liberarCamposPorModal(selectId);
            }
            
        } catch (error) {
            console.error('❌ Erro ao verificar tipo do lote:', error);
            liberarCamposPorModal(selectId);
        }
    }
    
    // Bloquear campos baseado no modal
    async function bloquearCamposPorModal(selectId, loteId) {
        let startFieldId, endFieldId;
        
        switch(selectId) {
            case 'paidTicketLote':
                startFieldId = 'paidSaleStart';
                endFieldId = 'paidSaleEnd';
                break;
            case 'freeTicketLote':
                startFieldId = 'freeSaleStart';
                endFieldId = 'freeSaleEnd';
                break;
            case 'editPaidTicketLote':
                startFieldId = 'editPaidSaleStart';
                endFieldId = 'editPaidSaleEnd';
                break;
            case 'editFreeTicketLote':
                startFieldId = 'editFreeSaleStart';
                endFieldId = 'editFreeSaleEnd';
                break;
        }
        
        const startField = document.getElementById(startFieldId);
        const endField = document.getElementById(endFieldId);
        
        if (!startField || !endField) {
            console.warn(`⚠️ Campos não encontrados: ${startFieldId}, ${endFieldId}`);
            return;
        }
        
        // BLOQUEAR CAMPOS
        [startField, endField].forEach(field => {
            field.readOnly = true;
            field.disabled = true;
            field.style.backgroundColor = '#f8f9fa';
            field.style.cursor = 'not-allowed';
            field.style.border = '2px solid #ffc107';
        });
        
        // BUSCAR E APLICAR DATAS DO LOTE
        await aplicarDatasDoLote(loteId, startField, endField);
        
        // ADICIONAR MENSAGEM
        adicionarMensagemBloqueio(endField, loteId);
        
        console.log(`🔒 Campos bloqueados: ${startFieldId}, ${endFieldId}`);
    }
    
    // Liberar campos baseado no modal
    function liberarCamposPorModal(selectId) {
        let startFieldId, endFieldId;
        
        switch(selectId) {
            case 'paidTicketLote':
                startFieldId = 'paidSaleStart';
                endFieldId = 'paidSaleEnd';
                break;
            case 'freeTicketLote':
                startFieldId = 'freeSaleStart';
                endFieldId = 'freeSaleEnd';
                break;
            case 'editPaidTicketLote':
                startFieldId = 'editPaidSaleStart';
                endFieldId = 'editPaidSaleEnd';
                break;
            case 'editFreeTicketLote':
                startFieldId = 'editFreeSaleStart';
                endFieldId = 'editFreeSaleEnd';
                break;
        }
        
        const startField = document.getElementById(startFieldId);
        const endField = document.getElementById(endFieldId);
        
        if (startField && endField) {
            // LIBERAR CAMPOS
            [startField, endField].forEach(field => {
                field.readOnly = false;
                field.disabled = false;
                field.style.backgroundColor = '';
                field.style.cursor = '';
                field.style.border = '';
            });
            
            // REMOVER MENSAGEM
            removerMensagemBloqueio(endField);
            
            console.log(`🔓 Campos liberados: ${startFieldId}, ${endFieldId}`);
        }
    }
    
    // Aplicar datas do lote aos campos
    async function aplicarDatasDoLote(loteId, startField, endField) {
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=obter_datas_lote&lote_id=${loteId}&evento_id=${eventoId}`
            });
            
            const data = await response.json();
            console.log(`📅 Datas do lote ID ${loteId}:`, data);
            
            if (data.data_inicio) {
                startField.value = data.data_inicio;
            }
            
            if (data.data_fim) {
                endField.value = data.data_fim;
            }
            
            console.log(`✅ Datas aplicadas: ${data.data_inicio} até ${data.data_fim}`);
            
        } catch (error) {
            console.error('❌ Erro ao buscar datas do lote:', error);
        }
    }
    
    // Adicionar mensagem de bloqueio
    function adicionarMensagemBloqueio(field, loteId) {
        const mensagemId = field.id + '_bloqueio_msg';
        
        // Remover mensagem anterior
        const msgAnterior = document.getElementById(mensagemId);
        if (msgAnterior) {
            msgAnterior.remove();
        }
        
        // Criar nova mensagem
        const mensagem = document.createElement('div');
        mensagem.id = mensagemId;
        mensagem.style.cssText = `
            font-size: 11px;
            color: #856404;
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 4px;
            padding: 8px;
            margin-top: 5px;
        `;
        mensagem.innerHTML = `
            🔒 <strong>Campos bloqueados:</strong> Este lote é "por data". 
            As datas dos ingressos serão sempre iguais às do lote.
        `;
        
        field.parentNode.insertBefore(mensagem, field.nextSibling);
    }
    
    // Remover mensagem de bloqueio
    function removerMensagemBloqueio(field) {
        const mensagemId = field.id + '_bloqueio_msg';
        const mensagem = document.getElementById(mensagemId);
        if (mensagem) {
            mensagem.remove();
        }
    }
    
    // Inicializar após DOM pronto
    setTimeout(() => {
        inicializarBloqueios();
        
        // Re-inicializar quando modais abrem
        const observer = new MutationObserver(() => {
            setTimeout(inicializarBloqueios, 100);
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
    }, 1000);
    
    // Função global para testar
    window.testarBloqueioDefinitivo = function() {
        console.log('🧪 Testando sistema de bloqueio...');
        inicializarBloqueios();
    };
    
    console.log('✅ Sistema DEFINITIVO de bloqueio inicializado');
});
