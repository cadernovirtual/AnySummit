/**
 * SISTEMA DE INSERT IMEDIATO DE INGRESSOS
 * Salva ingressos no banco assim que são criados (não espera "Avançar")
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
                console.error('❌ Dados inválidos para criar ingresso pago');
                return;
            }
            
            // Chamar função original para criar elemento na interface
            const result = originalCreatePaidTicket.apply(this, arguments);
            
            // Salvar no banco imediatamente
            setTimeout(() => {
                salvarIngressoImediatoNoBanco(dadosIngresso, 'pago');
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
                console.error('❌ Dados inválidos para criar ingresso gratuito');
                return;
            }
            
            // Chamar função original para criar elemento na interface
            const result = originalCreateFreeTicket.apply(this, arguments);
            
            // Salvar no banco imediatamente
            setTimeout(() => {
                salvarIngressoImediatoNoBanco(dadosIngresso, 'gratuito');
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
                console.error('❌ Dados inválidos para criar ingresso combo');
                return;
            }
            
            // Chamar função original para criar elemento na interface
            const result = originalCreateComboTicket.apply(this, arguments);
            
            // Salvar no banco imediatamente
            setTimeout(() => {
                salvarIngressoImediatoNoBanco(dadosIngresso, 'combo');
            }, 200);
            
            return result;
        };
    }
    
    // Função para coletar dados do modal pago
    function coletarDadosModalPago() {
        const titulo = document.getElementById('paidTicketTitle')?.value;
        const descricao = document.getElementById('paidTicketDescription')?.value || '';
        const quantidade = parseInt(document.getElementById('paidTicketQuantity')?.value) || 100;
        const preco = parseFloat(document.getElementById('paidTicketPrice')?.value) || 0;
        const loteSelect = document.getElementById('paidTicketLote');
        const loteId = loteSelect ? parseInt(loteSelect.value) : null;
        const inicio_venda = document.getElementById('paidSaleStart')?.value || null;
        const fim_venda = document.getElementById('paidSaleEnd')?.value || null;
        const limite_min = parseInt(document.getElementById('paidMinLimit')?.value) || 1;
        const limite_max = parseInt(document.getElementById('paidMaxLimit')?.value) || 5;
        
        if (!titulo || !quantidade || !preco) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return null;
        }
        
        // Calcular taxa e valor a receber
        const taxa_plataforma = preco * 0.08; // 8% exemplo
        const valor_receber = preco - taxa_plataforma;
        
        return {
            tipo: 'pago',
            titulo: titulo,
            descricao: descricao,
            quantidade_total: quantidade,
            preco: preco,
            taxa_plataforma: taxa_plataforma,
            valor_receber: valor_receber,
            inicio_venda: inicio_venda,
            fim_venda: fim_venda,
            limite_min: limite_min,
            limite_max: limite_max,
            lote_id: loteId,
            conteudo_combo: ''
        };
    }
    
    // Função para coletar dados do modal gratuito
    function coletarDadosModalGratuito() {
        const titulo = document.getElementById('freeTicketTitle')?.value;
        const descricao = document.getElementById('freeTicketDescription')?.value || '';
        const quantidade = parseInt(document.getElementById('freeTicketQuantity')?.value) || 100;
        const loteSelect = document.getElementById('freeTicketLote');
        const loteId = loteSelect ? parseInt(loteSelect.value) : null;
        const inicio_venda = document.getElementById('freeSaleStart')?.value || null;
        const fim_venda = document.getElementById('freeSaleEnd')?.value || null;
        const limite_min = parseInt(document.getElementById('freeMinLimit')?.value) || 1;
        const limite_max = parseInt(document.getElementById('freeMaxLimit')?.value) || 5;
        
        if (!titulo || !quantidade) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return null;
        }
        
        return {
            tipo: 'gratuito',
            titulo: titulo,
            descricao: descricao,
            quantidade_total: quantidade,
            preco: 0,
            taxa_plataforma: 0,
            valor_receber: 0,
            inicio_venda: inicio_venda,
            fim_venda: fim_venda,
            limite_min: limite_min,
            limite_max: limite_max,
            lote_id: loteId,
            conteudo_combo: ''
        };
    }
    
    // Função para coletar dados do modal combo
    function coletarDadosModalCombo() {
        const titulo = document.getElementById('comboTicketTitle')?.value;
        const descricao = document.getElementById('comboTicketDescription')?.value || '';
        const quantidade = parseInt(document.getElementById('comboTicketQuantity')?.value) || 100;
        const preco = parseFloat(document.getElementById('comboTicketPrice')?.value) || 0;
        const loteSelect = document.getElementById('comboTicketLote');
        const loteId = loteSelect ? parseInt(loteSelect.value) : null;
        const inicio_venda = document.getElementById('comboSaleStart')?.value || null;
        const fim_venda = document.getElementById('comboSaleEnd')?.value || null;
        const limite_min = parseInt(document.getElementById('comboMinLimit')?.value) || 1;
        const limite_max = parseInt(document.getElementById('comboMaxLimit')?.value) || 5;
        
        if (!titulo || !quantidade || !preco) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return null;
        }
        
        // Coletar dados do combo (ingressos selecionados)
        const comboData = coletarItensCombo();
        
        // Calcular taxa e valor a receber
        const taxa_plataforma = preco * 0.08; // 8% exemplo
        const valor_receber = preco - taxa_plataforma;
        
        return {
            tipo: 'combo',
            titulo: titulo,
            descricao: descricao,
            quantidade_total: quantidade,
            preco: preco,
            taxa_plataforma: taxa_plataforma,
            valor_receber: valor_receber,
            inicio_venda: inicio_venda,
            fim_venda: fim_venda,
            limite_min: limite_min,
            limite_max: limite_max,
            lote_id: loteId,
            conteudo_combo: JSON.stringify(comboData)
        };
    }
    
    // Função para coletar itens do combo
    function coletarItensCombo() {
        const comboItems = [];
        
        // Buscar elementos que representam os ingressos selecionados no combo
        // Isso pode variar dependendo de como o combo é implementado na interface
        const selectedItems = document.querySelectorAll('.combo-item, .selected-ticket-item, [data-combo-ingresso-id]');
        
        selectedItems.forEach(item => {
            const ingressoId = item.dataset.ingressoId || item.dataset.comboIngressoId || item.dataset.ticketId;
            const quantidade = parseInt(item.dataset.quantidade) || parseInt(item.querySelector('input[type="number"]')?.value) || 1;
            
            if (ingressoId) {
                comboItems.push({
                    ingresso_id: parseInt(ingressoId),
                    quantidade: quantidade
                });
            }
        });
        
        console.log('🎭 Itens do combo coletados:', comboItems);
        return comboItems;
    }
    
    // Função para salvar ingresso imediatamente no banco
    function salvarIngressoImediatoNoBanco(dadosIngresso, tipo) {
        console.log(`💾 Salvando ingresso ${tipo} imediatamente no banco:`, dadosIngresso);
        
        const eventoId = window.getEventoId?.() || new URLSearchParams(window.location.search).get('evento_id');
        
        if (!eventoId) {
            console.error('❌ Evento ID não encontrado');
            return;
        }
        
        const formData = new URLSearchParams();
        formData.append('action', 'salvar_ingresso_individual');
        formData.append('evento_id', eventoId);
        formData.append('ingresso', JSON.stringify(dadosIngresso));
        
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
                console.log(`✅ Ingresso ${tipo} salvo com ID: ${data.ingresso_id}`);
                
                // Atualizar elemento na interface com o ID do banco
                atualizarElementoComIdDoBanco(data.ingresso_id, dadosIngresso);
                
                // Mostrar feedback visual
                mostrarFeedbackSucesso(`Ingresso ${tipo} criado com sucesso!`);
            } else {
                console.error(`❌ Erro ao salvar ingresso ${tipo}:`, data.erro);
                mostrarFeedbackErro(`Erro ao criar ingresso: ${data.erro}`);
            }
        })
        .catch(error => {
            console.error('❌ Erro na requisição:', error);
            mostrarFeedbackErro('Erro ao salvar ingresso. Tente novamente.');
        });
    }
    
    // Função para atualizar elemento na interface com ID do banco
    function atualizarElementoComIdDoBanco(ingressoId, dadosIngresso) {
        const ticketItems = document.querySelectorAll('.ticket-item');
        const ultimoItem = ticketItems[ticketItems.length - 1];
        
        if (ultimoItem) {
            // Definir ID no elemento
            ultimoItem.dataset.ticketId = ingressoId;
            ultimoItem.dataset.ingressoId = ingressoId;
            
            // Atualizar ticketData
            if (!ultimoItem.ticketData) {
                ultimoItem.ticketData = {};
            }
            
            ultimoItem.ticketData.id = ingressoId;
            ultimoItem.ticketData = { ...ultimoItem.ticketData, ...dadosIngresso };
            
            console.log(`✅ Elemento atualizado com ID ${ingressoId}:`, ultimoItem.ticketData);
        }
    }
    
    // Função para mostrar feedback de sucesso
    function mostrarFeedbackSucesso(mensagem) {
        const feedback = document.createElement('div');
        feedback.className = 'feedback-success';
        feedback.textContent = mensagem;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            background-color: #28a745;
            color: white;
            font-weight: bold;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }
    
    // Função para mostrar feedback de erro
    function mostrarFeedbackErro(mensagem) {
        const feedback = document.createElement('div');
        feedback.className = 'feedback-error';
        feedback.textContent = mensagem;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            background-color: #dc3545;
            color: white;
            font-weight: bold;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 4000);
    }
    
    console.log('✅ Sistema de INSERT imediato de ingressos carregado');
    console.log('  - createPaidTicket() interceptada');
    console.log('  - createFreeTicket() interceptada');
    console.log('  - createComboTicket() interceptada');
});
