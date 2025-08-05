// Adicionar ao wizard-fix.js ou criar novo arquivo
// Função para garantir salvamento completo de lotes e ingressos

// Override da função saveWizardData para incluir dados completos
(function() {
    console.log('🔧 Aplicando correções de persistência de lotes e ingressos...');
    
    // Aguardar a função original ser carregada
    const waitForOriginal = setInterval(() => {
        if (typeof window.saveWizardData === 'function') {
            clearInterval(waitForOriginal);
            
            const originalSaveWizardData = window.saveWizardData;
            
            window.saveWizardData = function() {
                console.log('📝 Salvando dados completos do wizard (com lotes e ingressos)...');
                
                // Chamar função original primeiro
                originalSaveWizardData();
                
                // Agora adicionar dados extras de lotes e ingressos
                const savedData = getCookie('eventoWizard');
                if (savedData) {
                    try {
                        const wizardData = JSON.parse(savedData);
                        
                        // Coletar dados completos dos lotes
                        const loteCards = document.querySelectorAll('.lote-card');
                        const lotesCompletos = [];
                        
                        loteCards.forEach((card, index) => {
                            const loteData = {
                                id: card.getAttribute('data-lote-id') || `lote_${index}`,
                                nome: card.querySelector('.lote-nome')?.textContent || `Lote ${index + 1}`,
                                tipo: card.classList.contains('por-data') ? 'data' : 'percentual',
                                dataInicio: card.querySelector('.lote-data-inicio')?.textContent || '',
                                dataFim: card.querySelector('.lote-data-fim')?.textContent || '',
                                percentualVendido: card.querySelector('.percentual-value')?.textContent || '',
                                quantidade: card.querySelector('.lote-quantidade')?.textContent || '',
                                ativo: true
                            };
                            lotesCompletos.push(loteData);
                        });
                        
                        // Coletar dados completos dos ingressos com ticketData
                        const ticketItems = document.querySelectorAll('.ticket-item');
                        const ingressosCompletos = [];
                        
                        ticketItems.forEach((item, index) => {
                            // Priorizar ticketData se existir
                            const savedData = item.ticketData || {};
                            
                            const ingressoData = {
                                id: savedData.id || item.dataset.ticketId || `ticket_${index}`,
                                tipo: savedData.type || item.dataset.ticketType || 'pago',
                                titulo: savedData.title || item.querySelector('.ticket-name')?.textContent?.trim() || '',
                                preco: savedData.price || 0,
                                quantidade: savedData.quantity || 1,
                                loteId: savedData.loteId || item.dataset.loteId || '',
                                descricao: savedData.description || '',
                                minQuantity: savedData.minQuantity || 1,
                                maxQuantity: savedData.maxQuantity || 5,
                                saleStart: savedData.saleStart || '',
                                saleEnd: savedData.saleEnd || '',
                                taxaServico: savedData.taxaServico || false,
                                valorReceber: savedData.valorReceber || 0,
                                taxaPlataforma: savedData.taxaPlataforma || 0,
                                comboData: savedData.items || null
                            };
                            
                            // Adicionar nome do lote para referência
                            if (ingressoData.loteId) {
                                const loteCard = document.querySelector(`[data-lote-id="${ingressoData.loteId}"]`);
                                if (loteCard) {
                                    ingressoData.loteNome = loteCard.querySelector('.lote-nome')?.textContent || '';
                                }
                            }
                            
                            ingressosCompletos.push(ingressoData);
                        });
                        
                        // Atualizar wizardData com dados completos
                        wizardData.lotesCompletos = lotesCompletos;
                        wizardData.ingressosCompletos = ingressosCompletos;
                        
                        // Salvar novamente com dados completos
                        setCookie('eventoWizard', JSON.stringify(wizardData), 7);
                        
                        console.log('✅ Dados completos salvos:', {
                            lotes: lotesCompletos.length,
                            ingressos: ingressosCompletos.length
                        });
                        
                    } catch (error) {
                        console.error('❌ Erro ao salvar dados completos:', error);
                    }
                }
            };
            
            console.log('✅ Override de saveWizardData aplicado com sucesso');
        }
    }, 100);
})();

// Função para restaurar lotes completos
window.restaurarLotesCompletos = function(lotes) {
    console.log('📋 Restaurando lotes completos:', lotes);
    
    if (!lotes || lotes.length === 0) return;
    
    // Limpar lotes existentes
    const lotesContainer = document.querySelector('.lotes-container');
    if (lotesContainer) {
        lotesContainer.innerHTML = '';
    }
    
    // Recriar cada lote
    lotes.forEach(lote => {
        if (window.adicionarLotePorData && lote.tipo === 'data') {
            window.adicionarLotePorData(lote);
        } else if (window.adicionarLotePorPercentual && lote.tipo === 'percentual') {
            window.adicionarLotePorPercentual(lote);
        }
    });
};

// Função para restaurar ingressos completos
window.restaurarIngressosCompletos = function(ingressos) {
    console.log('🎟️ Restaurando ingressos completos:', ingressos);
    
    if (!ingressos || ingressos.length === 0) return;
    
    // Limpar lista de ingressos
    const ticketList = document.getElementById('ticketList');
    if (ticketList) {
        ticketList.innerHTML = '';
    }
    
    // Recriar cada ingresso
    ingressos.forEach(ingresso => {
        const ticketId = ingresso.id || 'ticket_' + Date.now() + '_' + Math.random();
        const ticketItem = document.createElement('div');
        ticketItem.className = 'ticket-item';
        ticketItem.dataset.ticketId = ticketId;
        ticketItem.dataset.ticketType = ingresso.tipo;
        ticketItem.dataset.loteId = ingresso.loteId;
        
        // Salvar ticketData completo
        ticketItem.ticketData = ingresso;
        
        // Criar HTML baseado no tipo
        if (ingresso.tipo === 'combo') {
            const totalIngressos = ingresso.comboData ? ingresso.comboData.length : 0;
            ticketItem.innerHTML = `
                <div class="ticket-header">
                    <div class="ticket-info">
                        <div class="ticket-name" style="color: #00C2FF;">${ingresso.titulo}</div>
                        <div class="ticket-details">
                            <span class="ticket-detail-item">
                                <span class="ticket-detail-label">Combo com ${totalIngressos} ingressos</span>
                            </span>
                            <span class="ticket-detail-item">
                                <span class="ticket-detail-label">Quantidade:</span>
                                <span class="ticket-detail-value">${ingresso.quantidade}</span>
                            </span>
                        </div>
                    </div>
                    <div class="ticket-pricing">
                        <div class="ticket-price-item">
                            <span class="ticket-price-label">Valor do combo:</span>
                            <span class="ticket-buyer-price">R$ ${ingresso.preco.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                    <div class="ticket-actions">
                        <button class="btn-icon" onclick="editTicket('${ticketId}')" title="Editar">✏️</button>
                        <button class="btn-icon delete" onclick="removeTicket('${ticketId}')" title="Excluir">🗑️</button>
                    </div>
                </div>
            `;
        } else if (ingresso.tipo === 'gratuito' || ingresso.tipo === 'free') {
            ticketItem.innerHTML = `
                <div class="ticket-header">
                    <div class="ticket-info">
                        <div class="ticket-name">${ingresso.titulo}</div>
                        <div class="ticket-details">
                            <span class="ticket-detail-item">
                                <span class="ticket-detail-label">Quantidade:</span>
                                <span class="ticket-detail-value">${ingresso.quantidade}</span>
                            </span>
                            <span class="ticket-detail-item">
                                <span class="ticket-detail-label">Lote:</span>
                                <span class="ticket-detail-value">${ingresso.loteNome || 'Lote não definido'}</span>
                            </span>
                        </div>
                    </div>
                    <div class="ticket-pricing">
                        <div class="ticket-price-item">
                            <span class="ticket-price-label">Valor:</span>
                            <span class="ticket-buyer-price">Gratuito</span>
                        </div>
                    </div>
                    <div class="ticket-actions">
                        <button class="btn-icon" onclick="editTicket('${ticketId}')" title="Editar">✏️</button>
                        <button class="btn-icon delete" onclick="removeTicket('${ticketId}')" title="Excluir">🗑️</button>
                    </div>
                </div>
            `;
        } else {
            // Ingresso pago
            const valorComprador = ingresso.taxaServico ? ingresso.preco + ingresso.taxaPlataforma : ingresso.preco;
            ticketItem.innerHTML = `
                <div class="ticket-header">
                    <div class="ticket-info">
                        <div class="ticket-name">${ingresso.titulo}</div>
                        <div class="ticket-details">
                            <span class="ticket-detail-item">
                                <span class="ticket-detail-label">Quantidade:</span>
                                <span class="ticket-detail-value">${ingresso.quantidade}</span>
                            </span>
                            <span class="ticket-detail-item">
                                <span class="ticket-detail-label">Lote:</span>
                                <span class="ticket-detail-value">${ingresso.loteNome || 'Lote não definido'}</span>
                            </span>
                        </div>
                    </div>
                    <div class="ticket-pricing">
                        <div class="ticket-price-item">
                            <span class="ticket-price-label">Valor para o comprador:</span>
                            <span class="ticket-buyer-price">R$ ${valorComprador.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div class="ticket-price-item">
                            <span class="ticket-price-label">Você recebe:</span>
                            <span class="ticket-receive-amount">R$ ${ingresso.valorReceber.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                    <div class="ticket-actions">
                        <button class="btn-icon" onclick="editTicket('${ticketId}')" title="Editar">✏️</button>
                        <button class="btn-icon delete" onclick="removeTicket('${ticketId}')" title="Excluir">🗑️</button>
                    </div>
                </div>
            `;
        }
        
        ticketList.appendChild(ticketItem);
    });
    
    console.log('✅ Ingressos restaurados com sucesso');
};

console.log('✅ Correções de persistência de lotes e ingressos aplicadas');
