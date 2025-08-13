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
        
        // DETECTAR SE É CRIAÇÃO OU EDIÇÃO - CORRIGIDO
        const modalEdicao = document.getElementById('editComboTicketModal');
        const modalCriacao = document.getElementById('comboTicketModal');
        
        const isEdicao = modalEdicao && (modalEdicao.style.display === 'flex' || modalEdicao.classList.contains('show'));
        const isCriacao = modalCriacao && (modalCriacao.style.display === 'flex' || modalCriacao.classList.contains('show'));
        
        console.log('🔍 Modal edição visível:', isEdicao);
        console.log('🔍 Modal criação visível:', isCriacao);
        
        // Usar sempre o modal de criação como padrão, a menos que edição esteja explicitamente visível
        const prefixo = isEdicao ? 'editCombo' : 'comboTicket';
        
        console.log('📝 Modo detectado:', isEdicao ? 'EDIÇÃO' : 'CRIAÇÃO', '(prefixo:', prefixo + ')');
        
        // BUSCAR TÍTULO COM DEBUG
        let titulo = '';
        const camposTitulo = [prefixo + 'Title', 'comboTicketTitle', 'editComboTitle'];
        
        for (const campoId of camposTitulo) {
            const elemento = document.getElementById(campoId);
            console.log('🔍 Testando campo título ' + campoId + ':', elemento ? 'encontrado' : 'não encontrado', elemento?.value);
            if (elemento && elemento.value && elemento.value.trim()) {
                titulo = elemento.value.trim();
                console.log('📝 Título encontrado em ' + campoId + ': "' + titulo + '"');
                break;
            }
        }
        
        // BUSCAR DESCRIÇÃO
        let descricao = '';
        const camposDescricao = [prefixo + 'Description', 'comboTicketDescription', 'editComboDescription'];
        
        for (const campoId of camposDescricao) {
            const elemento = document.getElementById(campoId);
            if (elemento && elemento.value) {
                descricao = elemento.value.trim();
                console.log('📝 Descrição encontrada em ' + campoId + ': "' + descricao + '"');
                break;
            }
        }
        
        // BUSCAR PREÇO COM DEBUG DETALHADO
        let precoRaw = '';
        let elementoPrecoEncontrado = null;
        const camposPreco = [prefixo + 'Price', 'comboTicketPrice', 'editComboPrice'];
        
        for (const campoId of camposPreco) {
            const elemento = document.getElementById(campoId);
            console.log('🔍 Testando campo preço ' + campoId + ':', elemento ? 'encontrado' : 'não encontrado');
            if (elemento) {
                console.log('🔍   - Valor atual: "' + elemento.value + '"');
                console.log('🔍   - Estilo display: "' + elemento.style.display + '"');
                console.log('🔍   - Parent modal visível:', elemento.closest('.modal')?.style.display);
                
                if (elemento.value && elemento.value.trim() !== '' && elemento.value !== 'R$ 0,00') {
                    precoRaw = elemento.value;
                    elementoPrecoEncontrado = campoId;
                    console.log('💰 Preço VÁLIDO encontrado em ' + campoId + ': "' + precoRaw + '"');
                    break;
                } else if (elemento.value) {
                    console.log('⚠️ Preço encontrado mas inválido em ' + campoId + ': "' + elemento.value + '"');
                }
            }
        }
        
        // SE NÃO ENCONTROU PREÇO VÁLIDO, TENTAR FORÇAR LEITURA
        if (!precoRaw || precoRaw === 'R$ 0,00') {
            console.log('🔍 Tentando forçar leitura de todos os campos de preço...');
            const todosInputs = document.querySelectorAll('input[type="text"]');
            for (const input of todosInputs) {
                if (input.id && input.id.toLowerCase().includes('price')) {
                    console.log('🔍 Campo preço encontrado: ' + input.id + ' = "' + input.value + '"');
                    if (input.value && input.value !== 'R$ 0,00') {
                        precoRaw = input.value;
                        elementoPrecoEncontrado = input.id;
                        console.log('💰 Usando preço de ' + input.id + ': "' + precoRaw + '"');
                        break;
                    }
                }
            }
        }
        
        const preco = parseFloat(precoRaw.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.')) || 0;
        
        console.log('💰 RESULTADO FINAL DO PREÇO:');
        console.log('  - Campo usado: ' + elementoPrecoEncontrado);
        console.log('  - Valor bruto: "' + precoRaw + '"');
        console.log('  - Valor processado: ' + preco);
        
        // BUSCAR LOTE COM DEBUG
        let loteId = null;
        const camposLote = [prefixo + 'Lote', 'comboTicketLote', 'editComboTicketLote'];
        
        for (const campoId of camposLote) {
            const elemento = document.getElementById(campoId);
            console.log('🔍 Testando campo lote ' + campoId + ':', elemento ? 'encontrado' : 'não encontrado', elemento?.value);
            if (elemento && elemento.value && elemento.value !== '0') {
                loteId = parseInt(elemento.value);
                console.log('📦 Lote encontrado em ' + campoId + ': ' + loteId);
                break;
            }
        }
        
        // Outros campos
        const inicio_venda = document.getElementById(prefixo + 'SaleStart')?.value || 
                           document.getElementById('comboSaleStart')?.value || 
                           document.getElementById('editComboSaleStart')?.value || null;
        const fim_venda = document.getElementById(prefixo + 'SaleEnd')?.value || 
                         document.getElementById('comboSaleEnd')?.value || 
                         document.getElementById('editComboSaleEnd')?.value || null;
        const limite_min = parseInt(document.getElementById(prefixo + 'MinQuantity')?.value ||
                                  document.getElementById('comboMinQuantity')?.value ||
                                  document.getElementById('editComboMinQuantity')?.value) || 1;
        const limite_max = parseInt(document.getElementById(prefixo + 'MaxQuantity')?.value ||
                                  document.getElementById('comboMaxQuantity')?.value ||
                                  document.getElementById('editComboMaxQuantity')?.value) || 5;
        
        // Coletar itens do combo (PARTE CRÍTICA)
        const conteudo_combo = coletarItensDoCombo();
        
        console.log('📊 Dados coletados do combo:');
        console.log('  titulo: "' + titulo + '" (length: ' + (titulo?.length || 0) + ')');
        console.log('  preco: ' + preco + ' (original: "' + precoRaw + '")');
        console.log('  loteId: ' + loteId);
        console.log('  conteudo_combo: ', conteudo_combo);
        
        // Validação
        const erros = [];
        
        if (!titulo || titulo.trim() === '') {
            erros.push('Título está vazio');
        }
        
        if (!preco || preco <= 0) {
            // Verificar se é realmente um erro ou campo vazio
            if (!precoRaw || precoRaw.trim() === '' || precoRaw === 'R$ 0,00') {
                erros.push('Preço inválido: ' + preco + ' (original: "' + precoRaw + '") - Campo vazio ou não preenchido');
            } else {
                erros.push('Preço inválido: ' + preco + ' (original: "' + precoRaw + '") - Erro de formatação');
            }
        }
        
        if (!loteId) {
            erros.push('Lote não selecionado: ' + loteId);
        }
        
        if (!conteudo_combo || conteudo_combo.length === 0) {
            erros.push('Nenhum item adicionado ao combo');
        }
        
        if (erros.length > 0) {
            console.error('❌ VALIDAÇÃO DO COMBO FALHOU:');
            erros.forEach((erro, i) => console.error('  ' + (i+1) + '. ' + erro));
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
            
            window.comboItems.forEach((item, index) => {
                console.log('📋 Processando item ' + index + ':', item);
                console.log('📋 Propriedades disponíveis:', Object.keys(item));
                
                // BUSCAR ID EM MÚLTIPLAS PROPRIEDADES - INCLUINDO ticketId
                const ingressoId = parseInt(item.ticket_id) || 
                                 parseInt(item.ingresso_id) || 
                                 parseInt(item.id) || 
                                 parseInt(item.ticketId) ||  // ADICIONAR ticketId
                                 parseInt(item.index) ||
                                 null;
                
                // BUSCAR QUANTIDADE EM MÚLTIPLAS PROPRIEDADES
                const quantidade = parseInt(item.quantity) || 
                                 parseInt(item.quantidade) || 
                                 parseInt(item.qtd) ||
                                 null;
                
                console.log('🔍 ID extraído: ' + ingressoId + ' (de ' + (item.ticketId || item.ticket_id || item.id) + ')');
                console.log('🔍 Quantidade extraída: ' + quantidade + ' (de ' + (item.quantity || item.quantidade) + ')');
                
                if (ingressoId && quantidade && quantidade > 0) {
                    itens.push({
                        ingresso_id: ingressoId,
                        quantidade: quantidade
                    });
                    console.log('✅ Item adicionado: ingresso_id=' + ingressoId + ', quantidade=' + quantidade);
                } else {
                    console.warn('⚠️ Item ignorado (ID ou quantidade inválidos):', {
                        item: item,
                        ingressoId_extraído: ingressoId,
                        quantidade_extraída: quantidade,
                        propriedades_item: Object.keys(item)
                    });
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
                        console.log('📦 Item DOM adicionado: ingresso_id=' + ingressoId + ', quantidade=' + quantidade);
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
        const formData = 'action=salvar_ingresso_individual&evento_id=' + eventoId + '&ingresso=' + encodeURIComponent(JSON.stringify(dadosCombo));
        
        try {
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: 'same-origin',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.sucesso) {
                console.log('✅ Combo salvo com ID: ' + data.ingresso_id);
                
                // Atualizar elemento na interface com o ID
                atualizarElementoComboComId(data.ingresso_id, dadosCombo);
                
                // Feedback visual
                mostrarFeedbackCombo('Combo salvo automaticamente!', 'sucesso');
            } else {
                console.error('❌ Erro ao salvar combo:', data.erro);
                mostrarFeedbackCombo('Erro ao salvar combo: ' + data.erro, 'erro');
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
            ultimoItem.ticketData = Object.assign(ultimoItem.ticketData, dadosCombo);
            
            console.log('✅ Elemento combo atualizado com ID ' + comboId);
        }
    }
    
    function mostrarFeedbackCombo(mensagem, tipo) {
        const feedback = document.createElement('div');
        feedback.style.cssText = 
            'position: fixed;' +
            'top: 20px;' +
            'right: 20px;' +
            'padding: 12px 20px;' +
            'border-radius: 4px;' +
            'color: white;' +
            'font-weight: 500;' +
            'z-index: 10000;' +
            (tipo === 'sucesso' ? 'background-color: #28a745;' : 'background-color: #dc3545;');
        
        feedback.textContent = mensagem;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }
    
    console.log('✅ Sistema de salvamento de combo configurado');
});
