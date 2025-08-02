// CORREÇÃO CONSOLIDADA E DEFINITIVA - Remove conflitos entre múltiplos arquivos
// 
// CONCEITOS IMPORTANTES:
// 1. VALIDAÇÃO DE AVANÇO: Verifica o que está NA TELA (DOM) pois os dados
//    são salvos apenas APÓS clicar em "Avançar"
// 2. PROTEÇÃO DE EXCLUSÃO: Verifica dados PERSISTIDOS (cookies) pois precisa
//    saber se há ingressos já salvos associados ao lote
//
(function() {
    console.log('🔧 Aplicando correção CONSOLIDADA do sistema...');
    console.log('📌 Validações: Avanço=DOM atual | Exclusão=Dados persistidos');
    
    // Aguardar carregamento completo
    setTimeout(function() {
        
        // =============== PROBLEMA 1: VALIDAÇÃO ETAPA 5 ===============
        // Override da validateStep que estava retornando sempre true
        const originalValidateStep = window.validateStep;
        window.validateStep = function(stepNumber) {
            console.log('🔍 Validando step:', stepNumber);
            
            // Validação específica para step 5 (Lotes)
            if (stepNumber === 5) {
                // IMPORTANTE: Verificar lotes NA TELA, não os persistidos!
                // Os lotes são salvos DEPOIS de clicar em avançar
                
                // Verificar lotes por data - usando a classe CORRETA!
                const containerPorData = document.getElementById('lotesPorDataList');
                const containerPorPercentual = document.getElementById('lotesPorPercentualList');
                
                let lotesPorData = 0;
                let lotesPorPercentual = 0;
                
                // Contar lotes por data - classe é lote-item, NÃO lote-card!
                if (containerPorData) {
                    const lotes = containerPorData.querySelectorAll('.lote-item');
                    lotesPorData = lotes.length;
                }
                
                // Contar lotes por percentual
                if (containerPorPercentual) {
                    const lotes = containerPorPercentual.querySelectorAll('.lote-item');
                    lotesPorPercentual = lotes.length;
                }
                
                // Total de lotes na tela
                const totalLotes = lotesPorData + lotesPorPercentual;
                
                console.log(`Step 5 - Lotes na tela:`, {
                    porData: lotesPorData,
                    porPercentual: lotesPorPercentual,
                    total: totalLotes
                });
                
                if (totalLotes === 0) {
                    // Mostrar aviso
                    if (window.customDialog && window.customDialog.warning) {
                        window.customDialog.warning(
                            'Atenção', 
                            'É necessário cadastrar pelo menos um lote antes de continuar.'
                        );
                    } else {
                        alert('É necessário cadastrar pelo menos um lote antes de continuar.');
                    }
                    
                    return false;
                }
                
                return true;
            }
            
            // Validação específica para step 6 (Ingressos)
            if (stepNumber === 6) {
                // Verificar se há ingressos no DOM
                const ticketItems = document.querySelectorAll('.ticket-item');
                const totalIngressos = ticketItems.length;
                
                console.log(`Step 6 - Ingressos na tela: ${totalIngressos}`);
                
                if (totalIngressos === 0) {
                    // Mostrar aviso
                    if (window.customDialog && window.customDialog.warning) {
                        window.customDialog.warning(
                            'Atenção', 
                            'É necessário criar pelo menos um tipo de ingresso antes de continuar.'
                        );
                    } else {
                        alert('É necessário criar pelo menos um tipo de ingresso antes de continuar.');
                    }
                    
                    return false;
                }
                
                // IMPORTANTE: Limpar cookie de ingressos salvos se não há ingressos no DOM
                // Isso resolve o problema de "lixo" no cookie
                const ingressosSalvos = getCookie('ingressosSalvos');
                if (ingressosSalvos) {
                    try {
                        const ingressos = JSON.parse(ingressosSalvos);
                        const ingressosValidos = [];
                        
                        // Manter apenas ingressos que existem no DOM
                        ticketItems.forEach(item => {
                            const ticketId = item.dataset.ticketId;
                            const loteId = item.dataset.loteId;
                            const ticketData = item.ticketData;
                            
                            if (ticketData) {
                                ingressosValidos.push({
                                    id: ticketId,
                                    titulo: ticketData.title || ticketData.titulo,
                                    loteId: loteId || ticketData.loteId,
                                    tipo: ticketData.type || ticketData.tipo,
                                    preco: ticketData.price || ticketData.preco,
                                    quantidade: ticketData.quantity || ticketData.quantidade
                                });
                            }
                        });
                        
                        // Atualizar cookie apenas com ingressos válidos
                        setCookie('ingressosSalvos', JSON.stringify(ingressosValidos), 7);
                        console.log('✅ Cookie de ingressos limpo e atualizado:', ingressosValidos.length);
                        
                    } catch (e) {
                        console.error('Erro ao limpar cookie de ingressos:', e);
                    }
                }
                
                return true;
            }
            
            // Para outros steps, usar validação original se existir
            if (originalValidateStep) {
                return originalValidateStep.apply(this, arguments);
            }
            
            return true;
        };
        
        // =============== PROBLEMA 2: PROTEÇÃO DE LOTES ===============
        // Função melhorada para verificar ingressos
        window.loteTemIngressos = function(loteId) {
            console.log('🔍 Verificando ingressos do lote:', loteId);
            
            // Normalizar IDs para string para comparação
            const loteIdStr = String(loteId);
            let ingressosEncontrados = [];
            
            // 1. SEMPRE verificar ingressos no DOM (podem não estar salvos ainda!)
            const ticketItems = document.querySelectorAll('.ticket-item');
            ticketItems.forEach(item => {
                const itemLoteId = item.dataset.loteId;
                if (itemLoteId && String(itemLoteId) === loteIdStr) {
                    const nome = item.querySelector('.ticket-name, .ticket-title')?.textContent?.trim() || 'Sem nome';
                    ingressosEncontrados.push({
                        nome: nome,
                        origem: 'DOM (não salvo)'
                    });
                }
                
                // Verificar também ticketData
                if (item.ticketData && item.ticketData.loteId && String(item.ticketData.loteId) === loteIdStr) {
                    ingressosEncontrados.push({
                        nome: item.ticketData.title || item.ticketData.titulo || 'Sem título',
                        origem: 'ticketData DOM'
                    });
                }
            });
            
            // 2. Verificar dados PERSISTIDOS no cookie
            const savedData = getCookie('eventoWizard');
            if (savedData) {
                try {
                    const wizardData = JSON.parse(savedData);
                    
                    // Verificar array de ingressos salvos
                    if (wizardData.ingressos && Array.isArray(wizardData.ingressos)) {
                        wizardData.ingressos.forEach(ingresso => {
                            if (ingresso.loteId && String(ingresso.loteId) === loteIdStr) {
                                ingressosEncontrados.push({
                                    nome: ingresso.titulo || ingresso.title || 'Sem título',
                                    origem: 'Cookie (ingressos)'
                                });
                            }
                        });
                    }
                    
                    // Verificar também array tickets (compatibilidade)
                    if (wizardData.tickets && Array.isArray(wizardData.tickets)) {
                        wizardData.tickets.forEach(ticket => {
                            if (ticket.loteId && String(ticket.loteId) === loteIdStr) {
                                ingressosEncontrados.push({
                                    nome: ticket.titulo || ticket.title || 'Sem título',
                                    origem: 'Cookie (tickets)'
                                });
                            }
                        });
                    }
                } catch (e) {
                    console.error('Erro ao verificar dados salvos:', e);
                }
            }
            
            // 3. Verificar cookie separado de ingressos (correcoes-definitivas.js salva aqui)
            const ingressosSalvos = getCookie('ingressosSalvos');
            if (ingressosSalvos) {
                try {
                    const ingressos = JSON.parse(ingressosSalvos);
                    if (Array.isArray(ingressos)) {
                        ingressos.forEach(ingresso => {
                            // Ignorar ingressos sem título ou com título genérico
                            const titulo = ingresso.titulo || ingresso.title || ingresso.nome || '';
                            if (titulo && titulo !== 'Sem título' && titulo !== '') {
                                if (ingresso.loteId && String(ingresso.loteId) === loteIdStr) {
                                    ingressosEncontrados.push({
                                        nome: titulo,
                                        origem: 'Cookie (ingressosSalvos)'
                                    });
                                }
                            }
                        });
                    }
                } catch (e) {
                    console.error('Erro ao verificar ingressosSalvos:', e);
                }
            }
            
            const temIngressos = ingressosEncontrados.length > 0;
            console.log(`Lote ${loteIdStr} tem ${ingressosEncontrados.length} ingressos (DOM + Salvos):`, ingressosEncontrados);
            
            return temIngressos;
        };
        
        // Override das funções de exclusão
        const originalExcluirLoteData = window.excluirLoteData;
        if (originalExcluirLoteData) {
            window.excluirLoteData = function(id) {
                console.log('🚫 Tentando excluir lote por data:', id);
                
                if (window.loteTemIngressos(id)) {
                    if (window.customDialog && window.customDialog.warning) {
                        window.customDialog.warning(
                            'Não é possível excluir',
                            'Este lote possui ingressos associados. Remova os ingressos antes de excluir o lote.'
                        );
                    } else {
                        alert('Este lote possui ingressos associados. Remova os ingressos antes de excluir o lote.');
                    }
                    return false;
                }
                
                return originalExcluirLoteData.apply(this, arguments);
            };
        }
        
        const originalExcluirLotePercentual = window.excluirLotePercentual;
        if (originalExcluirLotePercentual) {
            window.excluirLotePercentual = function(id) {
                console.log('🚫 Tentando excluir lote percentual:', id);
                
                if (window.loteTemIngressos(id)) {
                    if (window.customDialog && window.customDialog.warning) {
                        window.customDialog.warning(
                            'Não é possível excluir',
                            'Este lote possui ingressos associados. Remova os ingressos antes de excluir o lote.'
                        );
                    } else {
                        alert('Este lote possui ingressos associados. Remova os ingressos antes de excluir o lote.');
                    }
                    return false;
                }
                
                return originalExcluirLotePercentual.apply(this, arguments);
            };
        }
        
        // =============== PROBLEMA 3: DATAS NA EDIÇÃO ===============
        // Função para aplicar datas do lote
        window.applyLoteDatesOnEdit = function(loteId, modalType) {
            console.log('📅 Aplicando datas do lote na edição:', loteId, modalType);
            
            if (!loteId) {
                // Se não tem lote, liberar campos
                liberarCamposData(modalType);
                return;
            }
            
            // Buscar dados do lote - agora com a classe correta!
            const loteItem = document.querySelector(`.lote-item[data-id="${loteId}"]`);
            if (!loteItem) {
                console.log('Lote não encontrado no DOM:', loteId);
                liberarCamposData(modalType);
                return;
            }
            
            // Verificar se é lote por data (está dentro de lotesPorDataList)
            const isPorData = loteItem.closest('#lotesPorDataList') !== null;
            
            if (!isPorData) {
                console.log('Lote não é por data, liberando campos');
                liberarCamposData(modalType);
                return;
            }
            
            // Extrair datas do texto do lote
            const detailsEl = loteItem.querySelector('.lote-item-details');
            if (!detailsEl) {
                liberarCamposData(modalType);
                return;
            }
            
            const detailsText = detailsEl.textContent;
            // Formato: "23/07/2025, 23:26 até 30/07/2025, 23:26"
            const dateMatch = detailsText.match(/(\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}) até (\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2})/);
            
            if (!dateMatch) {
                console.log('Não foi possível extrair datas do texto:', detailsText);
                liberarCamposData(modalType);
                return;
            }
            
            const dataInicio = convertDateToInput(dateMatch[1]);
            const dataFim = convertDateToInput(dateMatch[2]);
            
            console.log('Datas extraídas:', { inicio: dataInicio, fim: dataFim });
            
            // Aplicar datas nos campos corretos
            aplicarDatasNosInputs(modalType, dataInicio, dataFim);
        };
        
        // Função auxiliar para liberar campos
        function liberarCamposData(modalType) {
            const fields = getCamposData(modalType);
            if (fields.start) {
                fields.start.readOnly = false;
                fields.start.style.removeProperty('background-color');
            }
            if (fields.end) {
                fields.end.readOnly = false;
                fields.end.style.removeProperty('background-color');
            }
        }
        
        // Função auxiliar para aplicar datas
        function aplicarDatasNosInputs(modalType, dataInicio, dataFim) {
            const fields = getCamposData(modalType);
            
            if (fields.start && dataInicio) {
                fields.start.value = dataInicio;
                fields.start.readOnly = true;
                // Não alterar background para manter estilo do tema
            }
            
            if (fields.end && dataFim) {
                fields.end.value = dataFim;
                fields.end.readOnly = true;
                // Não alterar background para manter estilo do tema
            }
        }
        
        // Função auxiliar melhorada
        function convertDateToInput(dateText) {
            // Formato: "23/07/2025, 23:26"
            const match = dateText.match(/(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{2}):(\d{2})/);
            if (match) {
                const [_, dia, mes, ano, hora, minuto] = match;
                return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
            }
            return '';
        }
        
        // Override para aplicar datas ao abrir modal de edição
        const originalPopulateEditPaid = window.populateEditPaidTicketModal;
        if (originalPopulateEditPaid) {
            window.populateEditPaidTicketModal = function(ticketData) {
                const result = originalPopulateEditPaid.apply(this, arguments);
                
                // Popular selects primeiro
                setTimeout(() => {
                    window.popularSelectLotesComTipo('editPaidTicketLote');
                    
                    // Setar o lote selecionado
                    if (ticketData && ticketData.loteId) {
                        const select = document.getElementById('editPaidTicketLote');
                        if (select) {
                            select.value = ticketData.loteId;
                            // Aplicar datas se for lote por data
                            window.applyLoteDatesOnEdit(ticketData.loteId, 'paid');
                        }
                    }
                }, 200);
                
                return result;
            };
        }
        
        const originalPopulateEditFree = window.populateEditFreeTicketModal;
        if (originalPopulateEditFree) {
            window.populateEditFreeTicketModal = function(ticketData) {
                const result = originalPopulateEditFree.apply(this, arguments);
                
                // Popular selects primeiro
                setTimeout(() => {
                    window.popularSelectLotesComTipo('editFreeTicketLote');
                    
                    // Setar o lote selecionado
                    if (ticketData && ticketData.loteId) {
                        const select = document.getElementById('editFreeTicketLote');
                        if (select) {
                            select.value = ticketData.loteId;
                            // Aplicar datas se for lote por data
                            window.applyLoteDatesOnEdit(ticketData.loteId, 'free');
                        }
                    }
                }, 200);
                
                return result;
            };
        }
        
        // Override para combo também
        const originalPopulateEditCombo = window.populateEditComboModal;
        if (originalPopulateEditCombo) {
            window.populateEditComboModal = function(comboData) {
                const result = originalPopulateEditCombo ? originalPopulateEditCombo.apply(this, arguments) : null;
                
                // Popular selects primeiro
                setTimeout(() => {
                    window.popularSelectLotesComTipo('editComboLote');
                    
                    // Setar o lote selecionado
                    if (comboData && comboData.loteId) {
                        const select = document.getElementById('editComboLote');
                        if (select) {
                            select.value = comboData.loteId;
                            // Aplicar datas se for lote por data
                            window.applyLoteDatesOnEdit(comboData.loteId, 'combo');
                        }
                    }
                }, 200);
                
                return result;
            };
        }
        
        // Override editCombo para aplicar regras
        const originalEditCombo = window.editCombo;
        if (originalEditCombo) {
            window.editCombo = function(comboId) {
                const result = originalEditCombo.apply(this, arguments);
                
                // Buscar dados do combo
                setTimeout(() => {
                    const comboElement = document.querySelector(`[data-ticket-id="${comboId}"]`);
                    if (comboElement && comboElement.ticketData) {
                        const comboData = comboElement.ticketData;
                        
                        // Popular selects
                        window.popularSelectLotesComTipo('editComboLote');
                        
                        // Setar lote e aplicar datas
                        if (comboData.loteId) {
                            setTimeout(() => {
                                const select = document.getElementById('editComboLote');
                                if (select) {
                                    select.value = comboData.loteId;
                                    window.applyLoteDatesOnEdit(comboData.loteId, 'combo');
                                }
                            }, 100);
                        }
                    }
                }, 300);
                
                return result;
            };
        }
        
        // Adicionar listeners para mudança de lote nos dropdowns
        setTimeout(() => {
            // Listener para ingresso pago
            const editPaidLoteSelect = document.getElementById('editPaidTicketLote');
            if (editPaidLoteSelect) {
                editPaidLoteSelect.addEventListener('change', function() {
                    window.applyLoteDatesOnEdit(this.value, 'paid');
                });
            }
            
            // Listener para ingresso gratuito
            const editFreeLoteSelect = document.getElementById('editFreeTicketLote');
            if (editFreeLoteSelect) {
                editFreeLoteSelect.addEventListener('change', function() {
                    window.applyLoteDatesOnEdit(this.value, 'free');
                });
            }
            
            // Listener para combo
            const editComboLoteSelect = document.getElementById('editComboLote');
            if (editComboLoteSelect) {
                editComboLoteSelect.addEventListener('change', function() {
                    window.applyLoteDatesOnEdit(this.value, 'combo');
                });
            }
            
            // Listener para combo (CRIAÇÃO)
            const comboLoteSelect = document.getElementById('comboTicketLote'); // ID correto!
            if (comboLoteSelect) {
                // Guardar valor inicial
                let valorAnterior = comboLoteSelect.value;
                
                comboLoteSelect.addEventListener('focus', function() {
                    valorAnterior = this.value;
                });
                
                comboLoteSelect.addEventListener('change', function() {
                    // Verificar se há itens no combo
                    const comboItems = document.querySelectorAll('#comboItems .combo-item');
                    if (comboItems.length > 0 && valorAnterior !== '') {
                        // Reverter para valor anterior
                        this.value = valorAnterior;
                        
                        if (window.customDialog && window.customDialog.warning) {
                            window.customDialog.warning(
                                'Não é possível alterar o lote',
                                'Para alterar o lote, remova primeiro todos os ingressos que compõem o combo.'
                            );
                        } else {
                            alert('Para alterar o lote, remova primeiro todos os ingressos que compõem o combo.');
                        }
                        return;
                    }
                    
                    // Se permitido, aplicar datas
                    valorAnterior = this.value;
                    window.applyLoteDatesOnEdit(this.value, 'combo-create');
                });
            }
            
            // Listener para combo edição
            const editComboLoteSelect = document.getElementById('editComboLote');
            if (editComboLoteSelect) {
                // Guardar valor inicial
                let valorAnteriorEdit = editComboLoteSelect.value;
                
                editComboLoteSelect.addEventListener('focus', function() {
                    valorAnteriorEdit = this.value;
                });
                
                editComboLoteSelect.addEventListener('change', function() {
                    // Verificar se há itens no combo
                    const editComboItems = document.querySelectorAll('#editComboItemsList .combo-item');
                    if (editComboItems.length > 0 && valorAnteriorEdit !== '') {
                        // Reverter para valor anterior
                        this.value = valorAnteriorEdit;
                        
                        if (window.customDialog && window.customDialog.warning) {
                            window.customDialog.warning(
                                'Não é possível alterar o lote',
                                'Para alterar o lote, remova primeiro todos os ingressos que compõem o combo.'
                            );
                        } else {
                            alert('Para alterar o lote, remova primeiro todos os ingressos que compõem o combo.');
                        }
                        return;
                    }
                    
                    // Se permitido, aplicar datas
                    valorAnteriorEdit = this.value;
                    window.applyLoteDatesOnEdit(this.value, 'combo');
                });
            }
        }, 3000); // Aguardar modais estarem disponíveis
        
        // =============== PROBLEMA 4: CÁLCULOS DE VALORES ===============
        // Configuração da taxa de serviço (10% sobre o valor do ingresso)
        const TAXA_SERVICO_PERCENT = 0.10;
        
        // Função para calcular valores de ingresso pago
        window.calcularValoresIngresso = function(preco, cobrarTaxa) {
            const precoNum = typeof preco === 'string' ? 
                parseFloat(preco.replace(/[R$\s.]/g, '').replace(',', '.')) : 
                parseFloat(preco);
            
            if (isNaN(precoNum) || precoNum <= 0) {
                return {
                    preco: 0,
                    taxaServico: 0,
                    valorComprador: 0,
                    valorReceber: 0
                };
            }
            
            const taxaServico = cobrarTaxa ? precoNum * TAXA_SERVICO_PERCENT : 0;
            const valorComprador = precoNum + taxaServico;
            const valorReceber = precoNum;
            
            return {
                preco: precoNum,
                taxaServico: taxaServico,
                valorComprador: valorComprador,
                valorReceber: valorReceber
            };
        };
        
        // Adicionar listeners para campos de preço (CRIAÇÃO)
        setTimeout(() => {
            // Ingresso pago - criação
            const paidPriceInput = document.getElementById('paidTicketPrice');
            const paidTaxCheckbox = document.getElementById('paidTicketTaxaServico');
            
            if (paidPriceInput) {
                const updatePaidValues = () => {
                    const valores = window.calcularValoresIngresso(
                        paidPriceInput.value,
                        paidTaxCheckbox ? paidTaxCheckbox.checked : true
                    );
                    
                    // Atualizar displays
                    const taxaEl = document.getElementById('paidTicketTaxaValor');
                    const receberEl = document.getElementById('paidTicketValorReceber');
                    
                    if (taxaEl) taxaEl.textContent = `R$ ${valores.taxaServico.toFixed(2).replace('.', ',')}`;
                    if (receberEl) receberEl.textContent = `R$ ${valores.valorReceber.toFixed(2).replace('.', ',')}`;
                };
                
                paidPriceInput.addEventListener('input', updatePaidValues);
                paidPriceInput.addEventListener('blur', updatePaidValues);
                if (paidTaxCheckbox) paidTaxCheckbox.addEventListener('change', updatePaidValues);
            }
            
            // Ingresso pago - edição
            const editPaidPriceInput = document.getElementById('editPaidTicketPrice');
            const editPaidTaxCheckbox = document.getElementById('editPaidTicketServiceTax');
            
            if (editPaidPriceInput) {
                const updateEditPaidValues = () => {
                    const valores = window.calcularValoresIngresso(
                        editPaidPriceInput.value,
                        editPaidTaxCheckbox ? editPaidTaxCheckbox.checked : true
                    );
                    
                    // Atualizar displays
                    const taxaEl = document.getElementById('editPaidTicketTaxAmount');
                    const receberEl = document.getElementById('editPaidTicketReceiveAmount');
                    
                    if (taxaEl) taxaEl.textContent = `R$ ${valores.taxaServico.toFixed(2).replace('.', ',')}`;
                    if (receberEl) receberEl.textContent = `R$ ${valores.valorReceber.toFixed(2).replace('.', ',')}`;
                };
                
                editPaidPriceInput.addEventListener('input', updateEditPaidValues);
                editPaidPriceInput.addEventListener('blur', updateEditPaidValues);
                if (editPaidTaxCheckbox) editPaidTaxCheckbox.addEventListener('change', updateEditPaidValues);
            }
            
            // Combo - criação
            const comboPriceInput = document.getElementById('comboPrice');
            if (comboPriceInput) {
                const updateComboValues = () => {
                    const valores = window.calcularValoresIngresso(comboPriceInput.value, true);
                    
                    const taxaEl = document.getElementById('comboTax');
                    const receberEl = document.getElementById('comboReceive');
                    
                    if (taxaEl) taxaEl.textContent = `R$ ${valores.taxaServico.toFixed(2).replace('.', ',')}`;
                    if (receberEl) receberEl.textContent = `R$ ${valores.valorReceber.toFixed(2).replace('.', ',')}`;
                };
                
                comboPriceInput.addEventListener('input', updateComboValues);
                comboPriceInput.addEventListener('blur', updateComboValues);
            }
            
            // Função global para calcular valores do combo (criação)
            window.calcularValoresCombo = function() {
                const priceInput = document.getElementById('comboPrice');
                const taxaCheckbox = document.getElementById('comboTicketTaxaServico');
                
                if (!priceInput) return;
                
                const valores = window.calcularValoresIngresso(
                    priceInput.value,
                    taxaCheckbox ? taxaCheckbox.checked : true
                );
                
                // Atualizar campos
                const taxaEl = document.getElementById('comboTicketTaxaValor');
                const compradorEl = document.getElementById('comboTicketValorComprador');
                const receberEl = document.getElementById('comboTicketValorReceber');
                
                if (taxaEl) taxaEl.value = `R$ ${valores.taxaServico.toFixed(2).replace('.', ',')}`;
                if (compradorEl) compradorEl.value = `R$ ${valores.valorComprador.toFixed(2).replace('.', ',')}`;
                if (receberEl) receberEl.value = `R$ ${valores.valorReceber.toFixed(2).replace('.', ',')}`;
            };
            
            // Adicionar listener para o preço do combo (criação)
            const comboPriceCreate = document.getElementById('comboPrice');
            if (comboPriceCreate) {
                comboPriceCreate.addEventListener('input', window.calcularValoresCombo);
                comboPriceCreate.addEventListener('blur', window.calcularValoresCombo);
            }
            
            // Adicionar listener para checkbox de taxa (criação)
            const comboTaxCheckbox = document.getElementById('comboTicketTaxaServico');
            if (comboTaxCheckbox) {
                comboTaxCheckbox.addEventListener('change', window.calcularValoresCombo);
            }
            
            // Função global para calcular valores do combo (edição)
            window.calcularValoresEditCombo = function() {
                const priceInput = document.getElementById('editComboPrice');
                const taxaCheckbox = document.getElementById('editComboTaxaServico');
                
                if (!priceInput) return;
                
                const valores = window.calcularValoresIngresso(
                    priceInput.value,
                    taxaCheckbox ? taxaCheckbox.checked : true
                );
                
                // Atualizar campos
                const taxaEl = document.getElementById('editComboTax');
                const compradorEl = document.getElementById('editComboValorComprador');
                const receberEl = document.getElementById('editComboReceive');
                
                if (taxaEl) taxaEl.value = `R$ ${valores.taxaServico.toFixed(2).replace('.', ',')}`;
                if (compradorEl) compradorEl.value = `R$ ${valores.valorComprador.toFixed(2).replace('.', ',')}`;
                if (receberEl) receberEl.value = `R$ ${valores.valorReceber.toFixed(2).replace('.', ',')}`;
            };
            
            // Combo - edição
            const editComboPriceInput = document.getElementById('editComboPrice');
            if (editComboPriceInput) {
                const updateEditComboValues = () => {
                    const valores = window.calcularValoresIngresso(editComboPriceInput.value, true);
                    
                    const taxaEl = document.getElementById('editComboTax');
                    const receberEl = document.getElementById('editComboReceive');
                    
                    if (taxaEl) taxaEl.textContent = `R$ ${valores.taxaServico.toFixed(2).replace('.', ',')}`;
                    if (receberEl) receberEl.textContent = `R$ ${valores.valorReceber.toFixed(2).replace('.', ',')}`;
                };
                
                editComboPriceInput.addEventListener('input', updateEditComboValues);
                editComboPriceInput.addEventListener('blur', updateEditComboValues);
            }
        }, 3000);
        
        // =============== CORREÇÃO PARA REMOVER INGRESSO ===============
        // Override da função removeTicket para limpar cookies
        const originalRemoveTicket = window.removeTicket;
        if (originalRemoveTicket) {
            window.removeTicket = function(ticketId) {
                console.log('🗑️ Removendo ingresso:', ticketId);
                
                // Obter loteId antes de remover
                const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
                let loteIdRemovido = null;
                if (ticketElement) {
                    loteIdRemovido = ticketElement.dataset.loteId;
                }
                
                // Chamar função original
                const result = originalRemoveTicket.apply(this, arguments);
                
                // Limpar cookie ingressosSalvos
                setTimeout(() => {
                    console.log('🧹 Limpando cookie após remover ingresso...');
                    
                    // Atualizar cookie ingressosSalvos baseado no DOM atual
                    const ticketItems = document.querySelectorAll('.ticket-item');
                    const ingressosAtuais = [];
                    
                    ticketItems.forEach(item => {
                        const ticketData = item.ticketData;
                        if (ticketData) {
                            ingressosAtuais.push({
                                id: item.dataset.ticketId,
                                titulo: ticketData.title || ticketData.titulo || 'Sem título',
                                loteId: item.dataset.loteId || ticketData.loteId,
                                tipo: ticketData.type || ticketData.tipo,
                                preco: ticketData.price || ticketData.preco,
                                quantidade: ticketData.quantity || ticketData.quantidade
                            });
                        }
                    });
                    
                    // Salvar apenas ingressos que ainda existem
                    setCookie('ingressosSalvos', JSON.stringify(ingressosAtuais), 7);
                    console.log(`✅ Cookie atualizado: ${ingressosAtuais.length} ingressos restantes`);
                    
                    // Se não há mais ingressos com esse lote, limpar completamente
                    if (loteIdRemovido) {
                        const ingressosDoLote = ingressosAtuais.filter(ing => 
                            String(ing.loteId) === String(loteIdRemovido)
                        );
                        if (ingressosDoLote.length === 0) {
                            console.log(`✅ Lote ${loteIdRemovido} não tem mais ingressos`);
                        }
                    }
                }, 500);
                
                return result;
            };
        }
        
        // Override para removeTemporaryTicket também
        const originalRemoveTemp = window.removeTemporaryTicket;
        if (originalRemoveTemp) {
            window.removeTemporaryTicket = function(ticketId) {
                console.log('🗑️ Removendo ingresso temporário:', ticketId);
                const result = originalRemoveTemp.apply(this, arguments);
                
                // Mesma lógica de limpeza
                setTimeout(() => {
                    const ticketItems = document.querySelectorAll('.ticket-item');
                    const ingressosAtuais = [];
                    
                    ticketItems.forEach(item => {
                        const ticketData = item.ticketData;
                        if (ticketData) {
                            ingressosAtuais.push({
                                id: item.dataset.ticketId,
                                titulo: ticketData.title || ticketData.titulo || 'Sem título',
                                loteId: item.dataset.loteId || ticketData.loteId,
                                tipo: ticketData.type || ticketData.tipo,
                                preco: ticketData.price || ticketData.preco,
                                quantidade: ticketData.quantity || ticketData.quantidade
                            });
                        }
                    });
                    
                    setCookie('ingressosSalvos', JSON.stringify(ingressosAtuais), 7);
                    console.log(`✅ Cookie atualizado após remover temporário`);
                }, 500);
                
                return result;
            };
        }
        
        // =============== MELHORIA DOS DROPDOWNS DE LOTES ===============
        // Função para popular selects de lotes com tipo
        window.popularSelectLotesComTipo = function(selectId) {
            console.log('📋 Populando select:', selectId);
            const select = document.getElementById(selectId);
            if (!select) {
                console.log('❌ Select não encontrado:', selectId);
                return;
            }
            
            // Limpar e adicionar opção padrão
            select.innerHTML = '<option value="">Selecione um lote</option>';
            
            // Buscar lotes por data
            const lotesPorData = document.querySelectorAll('#lotesPorDataList .lote-item');
            lotesPorData.forEach(lote => {
                const option = document.createElement('option');
                option.value = lote.dataset.id;
                option.textContent = `${lote.querySelector('.lote-item-name').textContent} - Por data`;
                option.setAttribute('data-tipo', 'data');
                select.appendChild(option);
            });
            
            // Buscar lotes por percentual
            const lotesPorPercentual = document.querySelectorAll('#lotesPorPercentualList .lote-item');
            lotesPorPercentual.forEach(lote => {
                const option = document.createElement('option');
                option.value = lote.dataset.id;
                option.textContent = `${lote.querySelector('.lote-item-name').textContent} - Por quantidade`;
                option.setAttribute('data-tipo', 'percentual');
                select.appendChild(option);
            });
            
            console.log(`✅ Select populado com ${lotesPorData.length + lotesPorPercentual.length} lotes`);
        };
        
        // Override das funções de abrir modais para popular selects
        const originalOpenModal = window.openModal;
        if (originalOpenModal) {
            window.openModal = function(modalId) {
                console.log('🔓 Abrindo modal:', modalId);
                const result = originalOpenModal.apply(this, arguments);
                
                // Popular selects quando abrir modais
                setTimeout(() => {
                    switch(modalId) {
                        case 'paidTicketModal':
                            window.popularSelectLotesComTipo('paidTicketLote');
                            // Limpar campos de data
                            const paidStart = document.getElementById('paidSaleStart');
                            const paidEnd = document.getElementById('paidSaleEnd');
                            if (paidStart) { paidStart.readOnly = false; paidStart.style.backgroundColor = ''; }
                            if (paidEnd) { paidEnd.readOnly = false; paidEnd.style.backgroundColor = ''; }
                            break;
                        case 'freeTicketModal':
                            window.popularSelectLotesComTipo('freeTicketLote');
                            break;
                        case 'comboModal':
                        case 'comboTicketModal': // Adicionar ambas as possibilidades!
                            console.log('📦 Populando select de combo...');
                            window.popularSelectLotesComTipo('comboTicketLote'); // ID correto!
                            // Limpar campos de data (removendo style inline, não backgroundColor)
                            const comboStart = document.getElementById('comboSaleStart');
                            const comboEnd = document.getElementById('comboSaleEnd');
                            if (comboStart) { comboStart.readOnly = false; comboStart.style.removeProperty('background-color'); }
                            if (comboEnd) { comboEnd.readOnly = false; comboEnd.style.removeProperty('background-color'); }
                            break;
                        case 'editPaidTicketModal':
                            window.popularSelectLotesComTipo('editPaidTicketLote');
                            break;
                        case 'editFreeTicketModal':
                            window.popularSelectLotesComTipo('editFreeTicketLote');
                            break;
                        case 'editComboModal':
                            window.popularSelectLotesComTipo('editComboLote');
                            break;
                    }
                }, 100);
                
                return result;
            };
        }
        
        // Atualizar função applyLoteDatesOnEdit para verificar tipo
        window.applyLoteDatesOnEdit = function(loteId, modalType) {
            console.log('📅 Aplicando regras de data do lote:', loteId, modalType);
            
            if (!loteId) {
                liberarCamposData(modalType);
                return;
            }
            
            // Verificar se é lote por data através do select
            let isPorData = false;
            let selectId = '';
            
            // Determinar qual select verificar
            switch(modalType) {
                case 'paid':
                    selectId = 'editPaidTicketLote';
                    break;
                case 'free':
                    selectId = 'editFreeTicketLote';
                    break;
                case 'combo':
                    selectId = 'editComboLote';
                    break;
                case 'combo-create':
                    selectId = 'comboTicketLote'; // ID correto!
                    break;
                case 'paid-create':
                    selectId = 'paidTicketLote';
                    break;
                case 'free-create':
                    selectId = 'freeTicketLote';
                    break;
            }
            
            // Verificar tipo no select
            const select = document.getElementById(selectId);
            if (select) {
                const selectedOption = select.querySelector(`option[value="${loteId}"]`);
                if (selectedOption) {
                    isPorData = selectedOption.getAttribute('data-tipo') === 'data';
                }
            }
            
            // Se não é por data, liberar campos
            if (!isPorData) {
                console.log('Lote não é por data, liberando campos');
                liberarCamposData(modalType);
                return;
            }
            
            // Buscar lote e aplicar datas
            const loteItem = document.querySelector(`.lote-item[data-id="${loteId}"]`);
            if (!loteItem) {
                console.log('Lote não encontrado no DOM');
                liberarCamposData(modalType);
                return;
            }
            
            // Extrair datas do texto do lote
            const detailsEl = loteItem.querySelector('.lote-item-details');
            if (!detailsEl) {
                liberarCamposData(modalType);
                return;
            }
            
            const detailsText = detailsEl.textContent;
            const dateMatch = detailsText.match(/(\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}) até (\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2})/);
            
            if (!dateMatch) {
                console.log('Não foi possível extrair datas');
                liberarCamposData(modalType);
                return;
            }
            
            const dataInicio = convertDateToInput(dateMatch[1]);
            const dataFim = convertDateToInput(dateMatch[2]);
            
            console.log('Aplicando datas do lote por data:', { inicio: dataInicio, fim: dataFim });
            aplicarDatasNosInputs(modalType, dataInicio, dataFim);
        };
        
        // Adicionar listeners para criação também
        setTimeout(() => {
            // Listeners para mudança de lote (edição)
            const editPaidLoteSelect = document.getElementById('editPaidTicketLote');
            if (editPaidLoteSelect) {
                editPaidLoteSelect.addEventListener('change', function() {
                    window.applyLoteDatesOnEdit(this.value, 'paid');
                });
            }
            
            const editFreeLoteSelect = document.getElementById('editFreeTicketLote');
            if (editFreeLoteSelect) {
                editFreeLoteSelect.addEventListener('change', function() {
                    window.applyLoteDatesOnEdit(this.value, 'free');
                });
            }
            
            const editComboLoteSelect = document.getElementById('editComboLote');
            if (editComboLoteSelect) {
                editComboLoteSelect.addEventListener('change', function() {
                    window.applyLoteDatesOnEdit(this.value, 'combo');
                });
            }
            
            // Listeners para criação
            const paidLoteSelect = document.getElementById('paidTicketLote');
            if (paidLoteSelect) {
                paidLoteSelect.addEventListener('change', function() {
                    window.applyLoteDatesOnEdit(this.value, 'paid-create');
                });
            }
            
            const freeLoteSelect = document.getElementById('freeTicketLote');
            if (freeLoteSelect) {
                freeLoteSelect.addEventListener('change', function() {
                    window.applyLoteDatesOnEdit(this.value, 'free-create');
                });
            }
            
            const comboLoteSelect = document.getElementById('comboLote');
            if (comboLoteSelect) {
                comboLoteSelect.addEventListener('change', function() {
                    window.applyLoteDatesOnEdit(this.value, 'combo-create');
                });
            }
        }, 3000);
        
        // Atualizar getCamposData para suportar create de paid e free
        function getCamposData(modalType) {
            let startFieldId, endFieldId;
            
            switch(modalType) {
                case 'paid':
                    startFieldId = 'editPaidSaleStart';
                    endFieldId = 'editPaidSaleEnd';
                    break;
                case 'free':
                    startFieldId = 'editFreeSaleStart';
                    endFieldId = 'editFreeSaleEnd';
                    break;
                case 'combo':
                    startFieldId = 'editComboSaleStart';
                    endFieldId = 'editComboSaleEnd';
                    break;
                case 'combo-create':
                    startFieldId = 'comboSaleStart';
                    endFieldId = 'comboSaleEnd';
                    break;
                case 'paid-create':
                    startFieldId = 'paidSaleStart';
                    endFieldId = 'paidSaleEnd';
                    break;
                case 'free-create':
                    startFieldId = 'freeSaleStart';
                    endFieldId = 'freeSaleEnd';
                    break;
            }
            
            return {
                start: startFieldId ? document.getElementById(startFieldId) : null,
                end: endFieldId ? document.getElementById(endFieldId) : null
            };
        }
        
        console.log('✅ Correção CONSOLIDADA aplicada com sucesso!');
        
        // Função global para limpar lixo dos cookies
        window.limparLixoCookies = function() {
            console.log('🧹 Limpando lixo dos cookies...');
            
            // Limpar ingressos órfãos
            const ticketItems = document.querySelectorAll('.ticket-item');
            const loteIds = new Set();
            
            // Coletar IDs de lotes válidos
            document.querySelectorAll('.lote-item').forEach(lote => {
                loteIds.add(String(lote.dataset.id));
            });
            
            // Limpar cookie ingressosSalvos
            const ingressosSalvos = getCookie('ingressosSalvos');
            if (ingressosSalvos) {
                try {
                    const ingressos = JSON.parse(ingressosSalvos);
                    const ingressosValidos = ingressos.filter(ing => {
                        return ing.loteId && loteIds.has(String(ing.loteId));
                    });
                    
                    if (ingressosValidos.length !== ingressos.length) {
                        setCookie('ingressosSalvos', JSON.stringify(ingressosValidos), 7);
                        console.log(`✅ Removidos ${ingressos.length - ingressosValidos.length} ingressos órfãos`);
                    }
                } catch (e) {
                    console.error('Erro ao limpar ingressosSalvos:', e);
                }
            }
            
            console.log('✅ Limpeza concluída!');
        };
        
        // Função mais agressiva para forçar limpeza
        window.forcarLimpezaLote = function(loteId) {
            console.log('🔥 Forçando limpeza do lote:', loteId);
            const loteIdStr = String(loteId);
            
            // 1. Limpar cookie ingressosSalvos
            const ingressosSalvos = getCookie('ingressosSalvos');
            if (ingressosSalvos) {
                try {
                    const ingressos = JSON.parse(ingressosSalvos);
                    const ingressosFiltrados = ingressos.filter(ing => {
                        return String(ing.loteId) !== loteIdStr;
                    });
                    setCookie('ingressosSalvos', JSON.stringify(ingressosFiltrados), 7);
                    console.log(`✅ Removidos ingressos do lote ${loteIdStr} de ingressosSalvos`);
                } catch (e) {
                    console.error('Erro:', e);
                }
            }
            
            // 2. Limpar do cookie principal
            const wizardData = getCookie('eventoWizard');
            if (wizardData) {
                try {
                    const data = JSON.parse(wizardData);
                    
                    if (data.ingressos) {
                        data.ingressos = data.ingressos.filter(ing => String(ing.loteId) !== loteIdStr);
                    }
                    if (data.tickets) {
                        data.tickets = data.tickets.filter(t => String(t.loteId) !== loteIdStr);
                    }
                    if (data.ingressosSalvos) {
                        data.ingressosSalvos = data.ingressosSalvos.filter(ing => String(ing.loteId) !== loteIdStr);
                    }
                    
                    setCookie('eventoWizard', JSON.stringify(data), 7);
                    console.log('✅ Lote limpo do cookie principal');
                } catch (e) {
                    console.error('Erro:', e);
                }
            }
            
            console.log('✅ Limpeza forçada concluída! Tente excluir o lote agora.');
        };
        
        // Auto-limpar ao carregar se não houver ingressos no DOM
        setTimeout(() => {
            const ticketItems = document.querySelectorAll('.ticket-item');
            if (ticketItems.length === 0) {
                window.limparLixoCookies();
            }
        }, 3000);
        
    }, 2000); // Aguardar 2 segundos para garantir que tudo esteja carregado
})();
