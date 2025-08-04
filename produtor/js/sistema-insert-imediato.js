/**
 * SISTEMA DE INSERT IMEDIATO DE INGRESSOS
 * Salva ingressos assim que são criados (não aguarda "Avançar")
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Sistema de INSERT imediato de ingressos carregado');
    
    // Interceptar criação de ingressos pagos
    const originalCreatePaidTicket = window.createPaidTicket;
    if (originalCreatePaidTicket) {
        window.createPaidTicket = function() {
            console.log('💰 Interceptando createPaidTicket para INSERT imediato');
            
            // Coletar dados do modal ANTES de criar
            const dadosIngresso = coletarDadosModalPago();
            
            if (!dadosIngresso) {
                console.error('❌ Erro ao coletar dados do modal pago');
                return;
            }
            
            // Chamar função original para criar na interface
            const result = originalCreatePaidTicket.apply(this, arguments);
            
            // Salvar no banco IMEDIATAMENTE
            setTimeout(() => {
                salvarIngressoImediatamente(dadosIngresso, 'pago');
            }, 200);
            
            return result;
        };
    }
    
    // Interceptar criação de ingressos gratuitos
    const originalCreateFreeTicket = window.createFreeTicket;
    if (originalCreateFreeTicket) {
        window.createFreeTicket = function() {
            console.log('🆓 Interceptando createFreeTicket para INSERT imediato');
            
            // Coletar dados do modal ANTES de criar
            const dadosIngresso = coletarDadosModalGratuito();
            
            if (!dadosIngresso) {
                console.error('❌ Erro ao coletar dados do modal gratuito');
                return;
            }
            
            // Chamar função original para criar na interface
            const result = originalCreateFreeTicket.apply(this, arguments);
            
            // Salvar no banco IMEDIATAMENTE
            setTimeout(() => {
                salvarIngressoImediatamente(dadosIngresso, 'gratuito');
            }, 200);
            
            return result;
        };
    }
    
    // Interceptar criação de ingressos combo
    const originalCreateComboTicket = window.createComboTicket;
    if (originalCreateComboTicket) {
        window.createComboTicket = function() {
            console.log('🎭 Interceptando createComboTicket para INSERT imediato');
            
            // Coletar dados do modal ANTES de criar
            const dadosIngresso = coletarDadosModalCombo();
            
            if (!dadosIngresso) {
                console.error('❌ Erro ao coletar dados do modal combo');
                return;
            }
            
            // Chamar função original para criar na interface
            const result = originalCreateComboTicket.apply(this, arguments);
            
            // Salvar no banco IMEDIATAMENTE
            setTimeout(() => {
                salvarIngressoImediatamente(dadosIngresso, 'combo');
            }, 200);
            
            return result;
        };
    }
    
    // Função para coletar dados do modal pago
    function coletarDadosModalPago() {
        return {
            titulo: document.getElementById('paidTicketTitle')?.value || '',
            descricao: document.getElementById('paidTicketDescription')?.value || '',
            quantidade_total: parseInt(document.getElementById('paidTicketQuantity')?.value) || 0,
            preco: parseFloat(document.getElementById('paidTicketPrice')?.value) || 0,
            inicio_venda: document.getElementById('paidSaleStart')?.value || null,
            fim_venda: document.getElementById('paidSaleEnd')?.value || null,
            limite_min: parseInt(document.getElementById('paidMinLimit')?.value) || 1,
            limite_max: parseInt(document.getElementById('paidMaxLimit')?.value) || 5,
            lote_id: parseInt(document.getElementById('paidTicketLote')?.value) || null
        };
    }
    
    // Função para coletar dados do modal gratuito
    function coletarDadosModalGratuito() {
        return {
            titulo: document.getElementById('freeTicketTitle')?.value || '',
            descricao: document.getElementById('freeTicketDescription')?.value || '',
            quantidade_total: parseInt(document.getElementById('freeTicketQuantity')?.value) || 0,
            preco: 0,
            inicio_venda: document.getElementById('freeSaleStart')?.value || null,
            fim_venda: document.getElementById('freeSaleEnd')?.value || null,
            limite_min: parseInt(document.getElementById('freeMinLimit')?.value) || 1,
            limite_max: parseInt(document.getElementById('freeMaxLimit')?.value) || 5,
            lote_id: parseInt(document.getElementById('freeTicketLote')?.value) || null
        };
    }
    
    // Função para coletar dados do modal combo
    function coletarDadosModalCombo() {
        const comboItems = [];
        
        // Coletar itens do combo (assumindo que há uma lista de itens selecionados)
        const selectedItems = document.querySelectorAll('#comboItemsList .combo-item-selected');
        
        selectedItems.forEach(item => {
            const ingressoId = parseInt(item.dataset.ingressoId);
            const quantidade = parseInt(item.querySelector('.combo-quantity')?.value) || 1;
            
            if (ingressoId) {
                comboItems.push({
                    ingresso_id: ingressoId,
                    quantidade: quantidade
                });
            }
        });
        
        return {
            titulo: document.getElementById('comboTicketTitle')?.value || '',
            descricao: document.getElementById('comboTicketDescription')?.value || '',
            quantidade_total: parseInt(document.getElementById('comboTicketQuantity')?.value) || 0,
            preco: parseFloat(document.getElementById('comboTicketPrice')?.value) || 0,
            inicio_venda: document.getElementById('comboSaleStart')?.value || null,
            fim_venda: document.getElementById('comboSaleEnd')?.value || null,
            limite_min: parseInt(document.getElementById('comboMinLimit')?.value) || 1,
            limite_max: parseInt(document.getElementById('comboMaxLimit')?.value) || 5,
            lote_id: parseInt(document.getElementById('comboTicketLote')?.value) || null,
            combo_items: comboItems
        };
    }
    
    // Função para salvar ingresso imediatamente no banco
    function salvarIngressoImediatamente(dadosIngresso, tipo) {
        console.log(`💾 Salvando ingresso ${tipo} imediatamente:`, dadosIngresso);
        
        const eventoId = window.getEventoId?.() || new URLSearchParams(window.location.search).get('evento_id');
        
        if (!eventoId) {
            console.error('❌ Evento ID não encontrado');
            return;
        }
        
        // Preparar dados para envio
        const ingressoData = {
            tipo: tipo,
            titulo: dadosIngresso.titulo,
            descricao: dadosIngresso.descricao,
            quantidade_total: dadosIngresso.quantidade_total,
            preco: dadosIngresso.preco,
            taxa_plataforma: calcularTaxaPlataforma(dadosIngresso.preco),
            valor_receber: dadosIngresso.preco - calcularTaxaPlataforma(dadosIngresso.preco),
            inicio_venda: dadosIngresso.inicio_venda,
            fim_venda: dadosIngresso.fim_venda,
            limite_min: dadosIngresso.limite_min,
            limite_max: dadosIngresso.limite_max,
            lote_id: dadosIngresso.lote_id,
            conteudo_combo: tipo === 'combo' ? JSON.stringify(dadosIngresso.combo_items || []) : ''
        };
        
        // Enviar para o banco
        const formData = new URLSearchParams();
        formData.append('action', 'salvar_ingresso_individual');
        formData.append('evento_id', eventoId);
        formData.append('ingresso', JSON.stringify(ingressoData));
        
        fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                console.log(`✅ Ingresso ${tipo} salvo no banco - ID: ${data.ingresso_id}`);
                
                // Atualizar o elemento na interface com o ID real
                atualizarElementoComIdReal(data.ingresso_id, ingressoData);
                
                // Se é combo, pode precisar atualizar referências
                if (tipo === 'combo') {
                    window.ultimoComboIdCriado = data.ingresso_id;
                }
                
                // Mostrar feedback
                mostrarFeedback(`Ingresso ${tipo} criado com sucesso!`, 'sucesso');
            } else {
                console.error(`❌ Erro ao salvar ingresso ${tipo}:`, data.erro);
                mostrarFeedback(`Erro ao criar ingresso: ${data.erro}`, 'erro');
            }
        })
        .catch(error => {
            console.error('❌ Erro na requisição:', error);
            mostrarFeedback('Erro de conexão ao criar ingresso', 'erro');
        });
    }
    
    // Função para calcular taxa da plataforma
    function calcularTaxaPlataforma(preco) {
        return preco * 0.08; // 8% exemplo - ajustar conforme regra real
    }
    
    // Função para atualizar elemento com ID real do banco
    function atualizarElementoComIdReal(ingressoId, ingressoData) {
        const ticketItems = document.querySelectorAll('.ticket-item');
        const ultimoItem = ticketItems[ticketItems.length - 1];
        
        if (ultimoItem) {
            // Atualizar dataset e ticketData com ID real
            ultimoItem.dataset.ticketId = ingressoId;
            
            if (!ultimoItem.ticketData) {
                ultimoItem.ticketData = {};
            }
            
            ultimoItem.ticketData.id = ingressoId;
            ultimoItem.ticketData = { ...ultimoItem.ticketData, ...ingressoData };
            
            console.log(`🔄 Elemento atualizado com ID ${ingressoId}`);
        }
    }
    
    // Função para mostrar feedback
    function mostrarFeedback(mensagem, tipo) {
        const feedback = document.createElement('div');
        feedback.className = `feedback-message ${tipo}`;
        feedback.textContent = mensagem;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 9999;
            ${tipo === 'sucesso' ? 'background-color: #28a745;' : 'background-color: #dc3545;'}
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }
    
    // Função para popular combo com ingressos existentes
    window.popularComboComIngressos = function() {
        console.log('🎭 Populando modal combo com ingressos existentes...');
        
        const eventoId = window.getEventoId?.() || new URLSearchParams(window.location.search).get('evento_id');
        
        if (!eventoId) return;
        
        // Buscar ingressos do evento para popular o combo
        fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=listar_ingressos_para_combo&evento_id=${eventoId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso && data.ingressos) {
                renderizarIngressosParaCombo(data.ingressos);
            }
        })
        .catch(error => {
            console.error('❌ Erro ao buscar ingressos para combo:', error);
        });
    };
    
    // Função para renderizar ingressos disponíveis para combo
    function renderizarIngressosParaCombo(ingressos) {
        const container = document.getElementById('ingressosDisponiveis');
        if (!container) return;
        
        container.innerHTML = '';
        
        ingressos.forEach(ingresso => {
            if (ingresso.tipo !== 'combo') { // Não incluir outros combos
                const item = document.createElement('div');
                item.className = 'ingresso-disponivel';
                item.dataset.ingressoId = ingresso.id;
                item.innerHTML = `
                    <div class="ingresso-info">
                        <strong>${ingresso.titulo}</strong>
                        <span>R$ ${parseFloat(ingresso.preco).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="ingresso-controles">
                        <input type="number" class="combo-quantity" min="1" value="1">
                        <button type="button" onclick="adicionarAoCombo(${ingresso.id})">Adicionar</button>
                    </div>
                `;
                
                container.appendChild(item);
            }
        });
    }
    
    // Função global para adicionar ingresso ao combo
    window.adicionarAoCombo = function(ingressoId) {
        const ingressoElement = document.querySelector(`[data-ingresso-id="${ingressoId}"]`);
        const quantidade = parseInt(ingressoElement.querySelector('.combo-quantity').value) || 1;
        const titulo = ingressoElement.querySelector('strong').textContent;
        
        const comboList = document.getElementById('comboItemsList');
        if (!comboList) return;
        
        // Verificar se já existe
        const existente = comboList.querySelector(`[data-ingresso-id="${ingressoId}"]`);
        if (existente) {
            const quantityInput = existente.querySelector('.combo-quantity');
            quantityInput.value = parseInt(quantityInput.value) + quantidade;
            return;
        }
        
        // Adicionar novo item
        const item = document.createElement('div');
        item.className = 'combo-item-selected';
        item.dataset.ingressoId = ingressoId;
        item.innerHTML = `
            <div class="combo-item-info">
                <strong>${titulo}</strong>
                <input type="number" class="combo-quantity" min="1" value="${quantidade}">
            </div>
            <button type="button" onclick="removerDoCombo(${ingressoId})">Remover</button>
        `;
        
        comboList.appendChild(item);
    };
    
    // Função global para remover ingresso do combo
    window.removerDoCombo = function(ingressoId) {
        const item = document.querySelector(`#comboItemsList [data-ingresso-id="${ingressoId}"]`);
        if (item) {
            item.remove();
        }
    };
    
    console.log('✅ Sistema de INSERT imediato de ingressos carregado');
    console.log('  - createPaidTicket() interceptada');
    console.log('  - createFreeTicket() interceptada'); 
    console.log('  - createComboTicket() interceptada');
    console.log('  - INSERT imediato após criação na interface');
});
