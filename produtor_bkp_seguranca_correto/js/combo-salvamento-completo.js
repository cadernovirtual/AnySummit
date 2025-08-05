/**
 * SALVAMENTO CORRETO DE INGRESSO COMBO
 * Aplica as mesmas regras do ingresso pago + monta JSON do conteudo_combo
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('💾 Sistema de salvamento de combo carregado');
    
    // Interceptar createComboTicket para salvar imediatamente
    if (window.createComboTicket) {
        const originalCreateComboTicket = window.createComboTicket;
        window.createComboTicket = function() {
            console.log('🎭 Interceptando createComboTicket ANTES da validação');
            
            // COLETAR DADOS ANTES de chamar a função original
            const dadosCombo = coletarDadosModalComboCompleto();
            
            // Chamar função original (inclui validação)
            const result = originalCreateComboTicket.apply(this, arguments);
            
            // Se chegou aqui, validação passou - salvar no banco
            if (dadosCombo) {
                setTimeout(() => {
                    salvarComboImediatoNoBanco(dadosCombo);
                }, 100);
            }
            
            return result;
        };
    }
    
    function coletarDadosModalComboCompleto() {
        console.log('🎭 === COLETANDO DADOS DO COMBO ===');
        
        // Coletar dados básicos
        const titulo = document.getElementById('comboTicketTitle')?.value?.trim();
        const descricao = document.getElementById('comboTicketDescription')?.value?.trim() || '';
        const precoRaw = document.getElementById('comboTicketPrice')?.value || '';
        const preco = parseFloat(precoRaw.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.')) || 0;
        const loteSelect = document.getElementById('comboTicketLote');
        const loteId = loteSelect && loteSelect.value !== '0' ? parseInt(loteSelect.value) : null;
        const inicio_venda = document.getElementById('comboSaleStart')?.value || null;
        const fim_venda = document.getElementById('comboSaleEnd')?.value || null;
        const limite_min = parseInt(document.getElementById('comboMinQuantity')?.value) || 1;
        const limite_max = parseInt(document.getElementById('comboMaxQuantity')?.value) || 5;
        
        // Coletar itens do combo (PARTE CRÍTICA)
        const conteudo_combo = coletarItensDoCombo();
        
        console.log('📊 Dados coletados do combo:');
        console.log('  titulo:', `"${titulo}" (length: ${titulo?.length})`);
        console.log('  preco:', preco, `(original: "${precoRaw}")`);
        console.log('  loteId:', loteId);
        console.log('  conteudo_combo:', conteudo_combo);
        
        // Validação
        const erros = [];
        
        if (!titulo || titulo.trim() === '') {
            erros.push('Título está vazio');
        }
        
        if (!preco || preco <= 0) {
            erros.push(`Preço inválido: ${preco} (original: "${precoRaw}")`);
        }
        
        if (!loteId) {
            erros.push(`Lote não selecionado: ${loteId}`);
        }
        
        if (!conteudo_combo || conteudo_combo.length === 0) {
            erros.push('Nenhum item adicionado ao combo');
        }
        
        if (erros.length > 0) {
            console.error('❌ VALIDAÇÃO DO COMBO FALHOU:');
            erros.forEach((erro, i) => console.error(`  ${i+1}. ${erro}`));
            return null;
        }
        
        // Calcular taxa
        const taxa_plataforma = preco * 0.08;
        const valor_receber = preco - taxa_plataforma;
        
        const dados = {
            tipo: 'combo',
            titulo: titulo,
            descricao: descricao,
            quantidade_total: 100, // Padrão para combos
            preco: preco,
            taxa_plataforma: taxa_plataforma,
            valor_receber: valor_receber,
            inicio_venda: inicio_venda,
            fim_venda: fim_venda,
            limite_min: limite_min,
            limite_max: limite_max,
            lote_id: loteId,
            conteudo_combo: JSON.stringify(conteudo_combo) // CONVERTER PARA JSON
        };
        
        console.log('✅ Dados finais do combo preparados:', dados);
        return dados;
    }
    
    function coletarItensDoCombo() {
        const itens = [];
        
        // Verificar se existe variável global comboItems
        if (typeof window.comboItems !== 'undefined' && window.comboItems.length > 0) {
            console.log('📦 Coletando itens do combo via comboItems global:', window.comboItems);
            
            window.comboItems.forEach(item => {
                const ingressoId = parseInt(item.ticket_id) || parseInt(item.ingresso_id) || parseInt(item.id);
                const quantidade = parseInt(item.quantity) || parseInt(item.quantidade);
                
                if (ingressoId && quantidade) {
                    itens.push({
                        ingresso_id: ingressoId,
                        quantidade: quantidade
                    });
                    console.log(`📦 Item adicionado: ingresso_id=${ingressoId}, quantidade=${quantidade}`);
                } else {
                    console.warn('⚠️ Item ignorado (ID ou quantidade inválidos):', item);
                }
            });
        } else {
            // Buscar itens na interface
            const comboItemsList = document.getElementById('comboItemsList');
            if (comboItemsList) {
                const itemElements = comboItemsList.querySelectorAll('.combo-item');
                
                itemElements.forEach(element => {
                    const ticketId = element.dataset.ticketId || element.dataset.ingressoId;
                    const quantity = element.dataset.quantity || element.textContent.match(/(\d+)x/)?.[1];
                    
                    const ingressoId = parseInt(ticketId);
                    const quantidade = parseInt(quantity);
                    
                    if (ingressoId && quantidade) {
                        itens.push({
                            ingresso_id: ingressoId,
                            quantidade: quantidade
                        });
                        console.log(`📦 Item DOM adicionado: ingresso_id=${ingressoId}, quantidade=${quantidade}`);
                    } else {
                        console.warn('⚠️ Item DOM ignorado:', { ticketId, quantity, element });
                    }
                });
            }
        }
        
        console.log('📦 Itens finais coletados para o combo:', itens);
        return itens;
    }
    
    async function salvarComboImediatoNoBanco(dadosCombo) {
        console.log('💾 Salvando combo no banco:', dadosCombo);
        
        const eventoId = new URLSearchParams(window.location.search).get('evento_id');
        const formData = `action=salvar_ingresso_individual&evento_id=${eventoId}&ingresso=${encodeURIComponent(JSON.stringify(dadosCombo))}`;
        
        try {
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (data.sucesso) {
                console.log(`✅ Combo salvo com ID: ${data.ingresso_id}`);
                
                // Atualizar elemento na interface com o ID
                atualizarElementoComboComId(data.ingresso_id, dadosCombo);
                
                // Feedback visual
                mostrarFeedbackCombo(`Combo salvo automaticamente!`, 'sucesso');
            } else {
                console.error(`❌ Erro ao salvar combo:`, data.erro);
                mostrarFeedbackCombo(`Erro ao salvar combo: ${data.erro}`, 'erro');
            }
        } catch (error) {
            console.error('❌ Erro na requisição do combo:', error);
            mostrarFeedbackCombo('Erro de conexão ao salvar combo.', 'erro');
        }
    }
    
    function atualizarElementoComboComId(comboId, dadosCombo) {
        const ticketItems = document.querySelectorAll('.ticket-item');
        const ultimoItem = ticketItems[ticketItems.length - 1];
        
        if (ultimoItem) {
            ultimoItem.dataset.ticketId = comboId;
            ultimoItem.dataset.ingressoId = comboId;
            ultimoItem.setAttribute('data-ticket-id', comboId);
            
            if (!ultimoItem.ticketData) {
                ultimoItem.ticketData = {};
            }
            
            ultimoItem.ticketData.id = comboId;
            ultimoItem.ticketData.ingresso_id = comboId;
            ultimoItem.ticketData = { ...ultimoItem.ticketData, ...dadosCombo };
            
            console.log(`✅ Elemento combo atualizado com ID ${comboId}`);
        }
    }
    
    function mostrarFeedbackCombo(mensagem, tipo) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            ${tipo === 'sucesso' ? 'background-color: #28a745;' : 'background-color: #dc3545;'}
        `;
        feedback.textContent = mensagem;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }
    
    console.log('✅ Sistema de salvamento de combo configurado');
});
