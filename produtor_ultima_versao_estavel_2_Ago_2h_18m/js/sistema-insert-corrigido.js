/**
 * CORREÇÃO: Sistema de INSERT imediato sem interferir na validação
 * Permite que validação original funcione, mas salva após sucesso
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Sistema de INSERT imediato corrigido carregado');
    
    // Aguardar outros scripts carregarem
    setTimeout(() => {
        interceptarAposValidacao();
    }, 2000);
    
    function interceptarAposValidacao() {
        // Interceptar APÓS a validação, não antes
        
        // Para ingressos pagos
        const originalCreatePaidTicket = window.createPaidTicket;
        if (originalCreatePaidTicket) {
            window.createPaidTicket = function() {
                console.log('💰 Interceptando createPaidTicket ANTES da validação');
                
                // COLETAR DADOS ANTES de chamar a função original
                const dadosIngresso = coletarDadosModalPagoFinal();
                
                // Chamar função original (inclui validação)
                const result = originalCreatePaidTicket.apply(this, arguments);
                
                // Se chegou aqui, validação passou - salvar no banco
                if (dadosIngresso) {
                    setTimeout(() => {
                        salvarIngressoImediatoNoBanco(dadosIngresso, 'pago');
                    }, 100);
                }
                
                return result;
            };
        }
        
        // Para ingressos gratuitos
        const originalCreateFreeTicket = window.createFreeTicket;
        if (originalCreateFreeTicket) {
            window.createFreeTicket = function() {
                console.log('🆓 Interceptando createFreeTicket ANTES da validação');
                
                // COLETAR DADOS ANTES de chamar a função original
                const dadosIngresso = coletarDadosModalGratuitoFinal();
                
                // Chamar função original (inclui validação)
                const result = originalCreateFreeTicket.apply(this, arguments);
                
                // Se chegou aqui, validação passou - salvar no banco
                if (dadosIngresso) {
                    setTimeout(() => {
                        salvarIngressoImediatoNoBanco(dadosIngresso, 'gratuito');
                    }, 100);
                }
                
                return result;
            };
        }
        
        // Para ingressos combo
        const originalCreateComboTicket = window.createComboTicket;
        if (originalCreateComboTicket) {
            window.createComboTicket = function() {
                console.log('🎭 Interceptando createComboTicket ANTES da validação');
                
                // COLETAR DADOS ANTES de chamar a função original
                const dadosIngresso = coletarDadosModalComboFinal();
                
                // Chamar função original (inclui validação)
                const result = originalCreateComboTicket.apply(this, arguments);
                
                // Se chegou aqui, validação passou - salvar no banco
                if (dadosIngresso) {
                    setTimeout(() => {
                        salvarIngressoImediatoNoBanco(dadosIngresso, 'combo');
                    }, 100);
                }
                
                return result;
            };
        }
        
        console.log('✅ Interceptação APÓS validação configurada');
    }
    
    // Coletar dados APÓS validação ter passado
    function coletarDadosModalPagoFinal() {
        const titulo = document.getElementById('paidTicketTitle')?.value?.trim();
        const descricao = document.getElementById('paidTicketDescription')?.value?.trim() || '';
        const quantidade = parseInt(document.getElementById('paidTicketQuantity')?.value) || 100;
        
        // Converter preço corretamente
        const precoRaw = document.getElementById('paidTicketPrice')?.value || '';
        const preco = parseFloat(precoRaw.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.')) || 0;
        
        const loteSelect = document.getElementById('paidTicketLote');
        const loteId = loteSelect && loteSelect.value !== '0' ? parseInt(loteSelect.value) : null;
        const inicio_venda = document.getElementById('paidSaleStart')?.value || null;
        const fim_venda = document.getElementById('paidSaleEnd')?.value || null;
        const limite_min = parseInt(document.getElementById('paidMinQuantity')?.value) || 1;
        const limite_max = parseInt(document.getElementById('paidMaxQuantity')?.value) || 5;
        
        // LOG DIRETO DOS DADOS COLETADOS
        console.log('=== DADOS COLETADOS ===');
        console.log('titulo:', `"${titulo}" (${typeof titulo}) length:${titulo?.length}`);
        console.log('quantidade:', quantidade, `(${typeof quantidade})`);
        console.log('precoRaw:', `"${precoRaw}"`);
        console.log('preco:', preco, `(${typeof preco})`);
        console.log('loteId:', loteId, `(${typeof loteId})`);
        console.log('inicio_venda:', `"${inicio_venda}"`);
        console.log('fim_venda:', `"${fim_venda}"`);
        console.log('limite_min:', limite_min);
        console.log('limite_max:', limite_max);
        
        // Validação mínima (a original já passou)
        if (!titulo || quantidade <= 0 || preco <= 0) {
            console.warn('=== VALIDAÇÃO FALHOU ===');
            console.warn('titulo válido?', !!titulo, titulo);
            console.warn('quantidade > 0?', quantidade > 0, quantidade);
            console.warn('preco > 0?', preco > 0, preco);
            console.warn('⚠️ Dados inválidos após validação - não salvando');
            return null;
        }
        
        // Calcular taxa
        const taxa_plataforma = preco * 0.08;
        const valor_receber = preco - taxa_plataforma;
        
        const dados = {
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
        
        console.log('📊 Dados coletados pago final:', dados);
        return dados;
    }
    
    function coletarDadosModalGratuitoFinal() {
        const titulo = document.getElementById('freeTicketTitle')?.value?.trim();
        const descricao = document.getElementById('freeTicketDescription')?.value?.trim() || '';
        const quantidade = parseInt(document.getElementById('freeTicketQuantity')?.value) || 100;
        const loteSelect = document.getElementById('freeTicketLote');
        const loteId = loteSelect && loteSelect.value !== '0' ? parseInt(loteSelect.value) : null;
        const inicio_venda = document.getElementById('freeSaleStart')?.value || null;
        const fim_venda = document.getElementById('freeSaleEnd')?.value || null;
        const limite_min = parseInt(document.getElementById('freeMinLimit')?.value) || 1;
        const limite_max = parseInt(document.getElementById('freeMaxLimit')?.value) || 5;
        
        if (!titulo || quantidade <= 0) {
            console.warn('⚠️ Dados inválidos gratuito após validação - não salvando');
            return null;
        }
        
        const dados = {
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
        
        console.log('📊 Dados coletados gratuito final:', dados);
        return dados;
    }
    
    function coletarDadosModalComboFinal() {
        const titulo = document.getElementById('comboTicketTitle')?.value?.trim();
        const descricao = document.getElementById('comboTicketDescription')?.value?.trim() || '';
        const quantidade = parseInt(document.getElementById('comboTicketQuantity')?.value) || 100;
        const preco = parseFloat(document.getElementById('comboTicketPrice')?.value) || 0;
        const loteSelect = document.getElementById('comboTicketLote');
        const loteId = loteSelect && loteSelect.value !== '0' ? parseInt(loteSelect.value) : null;
        const inicio_venda = document.getElementById('comboSaleStart')?.value || null;
        const fim_venda = document.getElementById('comboSaleEnd')?.value || null;
        const limite_min = parseInt(document.getElementById('comboMinLimit')?.value) || 1;
        const limite_max = parseInt(document.getElementById('comboMaxLimit')?.value) || 5;
        
        if (!titulo) {
            console.warn('⚠️ Dados inválidos combo após validação - título vazio');
            return null;
        }
        
        // REMOVER VALIDAÇÃO DE PREÇO - PODE SER ZERO
        console.log('✅ Validação passou - título OK, prosseguindo...');
        
        // Coletar itens do combo
        const comboData = coletarItensComboFinal();
        
        const taxa_plataforma = preco * 0.08;
        const valor_receber = preco - taxa_plataforma;
        
        const dados = {
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
        
        console.log('📊 Dados coletados combo final:', dados);
        return dados;
    }
    
    function coletarItensComboFinal() {
        const comboItems = [];
        
        // Buscar diferentes possíveis seletores para itens do combo
        const possiveisSelectors = [
            '.combo-item',
            '.selected-ticket-item', 
            '[data-combo-ingresso-id]',
            '[data-ingresso-id]',
            '.combo-ticket-item',
            '.ticket-combo-item'
        ];
        
        for (const selector of possiveisSelectors) {
            const items = document.querySelectorAll(selector);
            if (items.length > 0) {
                console.log(`🔍 Encontrados ${items.length} itens combo com selector: ${selector}`);
                
                items.forEach(item => {
                    const ingressoId = item.dataset.ingressoId || 
                                     item.dataset.comboIngressoId || 
                                     item.dataset.ticketId ||
                                     item.getAttribute('data-ingresso-id');
                    
                    const quantidade = parseInt(item.dataset.quantidade) || 
                                     parseInt(item.querySelector('input[type="number"]')?.value) || 1;
                    
                    if (ingressoId && !isNaN(parseInt(ingressoId))) {
                        comboItems.push({
                            ingresso_id: parseInt(ingressoId),
                            quantidade: quantidade
                        });
                    }
                });
                
                if (comboItems.length > 0) {
                    break; // Encontrou itens, parar de procurar
                }
            }
        }
        
        console.log('🎭 Itens do combo coletados:', comboItems);
        return comboItems;
    }
    
    // Salvar no banco
    function salvarIngressoImediatoNoBanco(dadosIngresso, tipo) {
        console.log(`💾 Salvando ingresso ${tipo} no banco:`, dadosIngresso);
        
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
                
                // Atualizar elemento na interface com o ID
                atualizarElementoComId(data.ingresso_id, dadosIngresso);
                
                // Feedback visual discreto
                mostrarFeedbackDiscreto(`Ingresso ${tipo} salvo automaticamente!`, 'sucesso');
            } else {
                console.error(`❌ Erro ao salvar ingresso ${tipo}:`, data.erro);
                mostrarFeedbackDiscreto(`Erro ao salvar ingresso: ${data.erro}`, 'erro');
            }
        })
        .catch(error => {
            console.error('❌ Erro na requisição:', error);
            mostrarFeedbackDiscreto('Erro de conexão ao salvar ingresso.', 'erro');
        });
    }
    
    function atualizarElementoComId(ingressoId, dadosIngresso) {
        console.log(`🔄 Atualizando elemento com ID ${ingressoId}`);
        
        const ticketItems = document.querySelectorAll('.ticket-item');
        const ultimoItem = ticketItems[ticketItems.length - 1];
        
        if (ultimoItem) {
            // Atualizar todos os atributos de ID possíveis
            ultimoItem.dataset.ticketId = ingressoId;
            ultimoItem.dataset.ingressoId = ingressoId;
            ultimoItem.setAttribute('data-ticket-id', ingressoId);
            ultimoItem.setAttribute('data-ingresso-id', ingressoId);
            
            if (!ultimoItem.ticketData) {
                ultimoItem.ticketData = {};
            }
            
            // Atualizar ticketData com ID e todos os dados
            ultimoItem.ticketData.id = ingressoId;
            ultimoItem.ticketData.ingresso_id = ingressoId;
            ultimoItem.ticketData = { ...ultimoItem.ticketData, ...dadosIngresso };
            
            // Verificar se botões de edição existem e atualizar seus atributos
            const editButton = ultimoItem.querySelector('.edit-ticket-btn, [onclick*="editItem"]');
            if (editButton) {
                const onclickAtual = editButton.getAttribute('onclick');
                if (onclickAtual) {
                    // Substituir ID antigo pelo novo no onclick
                    const novoOnclick = onclickAtual.replace(/editItem\([^)]+\)/, `editItem('${ingressoId}')`);
                    editButton.setAttribute('onclick', novoOnclick);
                    console.log(`✅ Botão de edição atualizado: ${novoOnclick}`);
                }
            }
            
            console.log(`✅ Elemento atualizado com ID ${ingressoId}:`, ultimoItem.ticketData);
        } else {
            console.warn('❌ Último item não encontrado para atualizar');
        }
    }
    
    function mostrarFeedbackDiscreto(mensagem, tipo) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            z-index: 9999;
            max-width: 300px;
            ${tipo === 'sucesso' ? 'background: #28a745;' : 'background: #dc3545;'}
        `;
        feedback.textContent = mensagem;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }
    
    console.log('✅ Sistema de INSERT imediato corrigido inicializado');
});
