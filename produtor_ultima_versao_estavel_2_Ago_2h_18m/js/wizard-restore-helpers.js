/**
 * Funções auxiliares para restaurar lotes e ingressos do backend
 * Complementa o sistema wizard-database.js
 */

(function() {
    'use strict';
    
    /**
     * Restaurar lotes vindos do backend
     */
    window.restaurarLotesDoBackend = function(lotes) {
        console.log('📦 Restaurando lotes do backend:', lotes);
        
        // Limpar lotes existentes
        if (window.limparTodosLotes) {
            window.limparTodosLotes();
        }
        
        // Adicionar cada lote
        lotes.forEach(lote => {
            if (lote.tipo === 'data') {
                // Lote por data
                if (window.adicionarLotePorData) {
                    // Converter datas do formato MySQL para o formato do input
                    const dataInicio = new Date(lote.data_inicio);
                    const dataFim = new Date(lote.data_fim);
                    
                    // Criar elemento temporário para simular o formulário
                    const tempContainer = document.createElement('div');
                    tempContainer.innerHTML = `
                        <input type="text" id="temp-nome" value="${lote.nome}">
                        <input type="datetime-local" id="temp-inicio" value="${dataInicio.toISOString().slice(0, 16)}">
                        <input type="datetime-local" id="temp-fim" value="${dataFim.toISOString().slice(0, 16)}">
                        <input type="checkbox" id="temp-divulgar" ${lote.divulgar_criterio ? 'checked' : ''}>
                    `;
                    
                    // Adicionar temporariamente ao DOM
                    document.body.appendChild(tempContainer);
                    
                    // Simular criação do lote
                    const nomeInput = tempContainer.querySelector('#temp-nome');
                    const inicioInput = tempContainer.querySelector('#temp-inicio');
                    const fimInput = tempContainer.querySelector('#temp-fim');
                    const divulgarInput = tempContainer.querySelector('#temp-divulgar');
                    
                    // Criar o lote usando a função existente
                    window.criarLotePorData(
                        lote.nome,
                        inicioInput.value,
                        fimInput.value,
                        divulgarInput.checked
                    );
                    
                    // Remover container temporário
                    document.body.removeChild(tempContainer);
                }
            } else if (lote.tipo === 'percentual') {
                // Lote por percentual
                if (window.adicionarLotePorPercentual) {
                    window.criarLotePorPercentual(
                        lote.nome,
                        lote.percentual_venda || 0,
                        lote.divulgar_criterio || false
                    );
                }
            }
        });
        
        console.log('✅ Lotes restaurados com sucesso');
    };
    
    /**
     * Restaurar ingressos vindos do backend
     */
    window.restaurarIngressosDoBackend = function(ingressos) {
        console.log('🎫 Restaurando ingressos do backend:', ingressos);
        
        // Limpar lista de ingressos
        const ticketList = document.getElementById('ticketList');
        if (ticketList) {
            ticketList.innerHTML = '';
        }
        
        // Limpar temporários
        if (window.temporaryTickets) {
            window.temporaryTickets.clear();
        }
        
        // Adicionar cada ingresso
        ingressos.forEach(ingresso => {
            const ticketData = {
                id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: ingresso.tipo,
                title: ingresso.titulo,
                description: ingresso.descricao || '',
                quantity: ingresso.quantidade_total,
                price: parseFloat(ingresso.preco),
                minQuantity: ingresso.limite_min || 1,
                maxQuantity: ingresso.limite_max || 5,
                loteId: ingresso.lote_id,
                taxaServico: ingresso.taxa_plataforma > 0,
                taxaPlataforma: parseFloat(ingresso.taxa_plataforma),
                valorReceber: parseFloat(ingresso.valor_receber)
            };
            
            // Para combos, adicionar conteúdo
            if (ingresso.tipo === 'combo' && ingresso.conteudo_combo) {
                try {
                    ticketData.comboData = typeof ingresso.conteudo_combo === 'string' 
                        ? JSON.parse(ingresso.conteudo_combo) 
                        : ingresso.conteudo_combo;
                    ticketData.items = ticketData.comboData; // Compatibilidade
                } catch (e) {
                    console.error('Erro ao parsear conteúdo do combo:', e);
                }
            }
            
            // Adicionar à lista usando a função existente
            if (window.addTicketToList) {
                window.addTicketToList(ticketData);
            }
        });
        
        console.log('✅ Ingressos restaurados com sucesso');
    };
    
    /**
     * Função auxiliar para criar lote por data
     */
    window.criarLotePorData = function(nome, dataInicio, dataFim, divulgar) {
        const container = document.getElementById('lotesPorDataContainer');
        if (!container) return;
        
        const loteId = Date.now();
        const loteHtml = `
            <div class="lote-card por-data" data-lote-id="${loteId}" data-inicio="${dataInicio}" data-fim="${dataFim}">
                <div class="lote-header">
                    <h3 class="lote-nome">${nome}</h3>
                    <button class="btn-remove" onclick="removerLote(${loteId})">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 4V2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2h5a1 1 0 0 1 0 2h-1v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6H2a1 1 0 1 1 0-2h5zM5 6v11h10V6H5zm3 2a1 1 0 0 1 1 1v6a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1zm4 0a1 1 0 0 1 1 1v6a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1z"/>
                        </svg>
                    </button>
                </div>
                <div class="lote-info">
                    <span data-inicio="${dataInicio}">Início: ${formatarDataHora(dataInicio)}</span>
                    <span data-fim="${dataFim}">Fim: ${formatarDataHora(dataFim)}</span>
                </div>
                ${divulgar ? `
                <div class="lote-criterio">
                    <label>
                        <span class="switch-criterio active"></span>
                        Divulgar critério de mudança de lote
                    </label>
                </div>
                ` : ''}
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', loteHtml);
    };
    
    /**
     * Função auxiliar para criar lote por percentual
     */
    window.criarLotePorPercentual = function(nome, percentual, divulgar) {
        const container = document.getElementById('lotesPorPercentualContainer');
        if (!container) return;
        
        const loteId = Date.now();
        const loteHtml = `
            <div class="lote-card por-percentual" data-lote-id="${loteId}">
                <div class="lote-header">
                    <h3 class="lote-nome">${nome}</h3>
                    <button class="btn-remove" onclick="removerLote(${loteId})">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 4V2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2h5a1 1 0 0 1 0 2h-1v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6H2a1 1 0 1 1 0-2h5zM5 6v11h10V6H5zm3 2a1 1 0 0 1 1 1v6a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1zm4 0a1 1 0 0 1 1 1v6a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1z"/>
                        </svg>
                    </button>
                </div>
                <div class="lote-percentual">
                    <label>Mudar após vender</label>
                    <div class="percentual-control">
                        <input type="number" class="percentual-input" value="${percentual}" min="0" max="100">
                        <span class="percentual-value">${percentual}%</span>
                        <span>dos ingressos</span>
                    </div>
                </div>
                ${divulgar ? `
                <div class="lote-criterio">
                    <label>
                        <span class="switch-criterio active"></span>
                        Divulgar critério de mudança de lote
                    </label>
                </div>
                ` : ''}
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', loteHtml);
    };
    
    /**
     * Formatar data e hora para exibição
     */
    function formatarDataHora(dataString) {
        const data = new Date(dataString);
        const dia = data.getDate().toString().padStart(2, '0');
        const mes = (data.getMonth() + 1).toString().padStart(2, '0');
        const ano = data.getFullYear();
        const hora = data.getHours().toString().padStart(2, '0');
        const minuto = data.getMinutes().toString().padStart(2, '0');
        
        return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
    }
    
    console.log('✅ Funções de restauração carregadas');
    
})();
