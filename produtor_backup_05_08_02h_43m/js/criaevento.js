console.log('🎯 criaevento.js iniciando carregamento...');
// Variáveis globais
// Escopo global para funções
(function() {
    'use strict';
    
    let currentStep = 1;
    const totalSteps = 8;
    let map;
    let geocoder;
    let marker;
    let autocompleteService;
    let placesService;
    let ticketCount = 1;
    let ticketCodes = {};
    let uploadedImages = { logo: '', capa: '', fundo: '' }; // Adicionar esta linha

        // Fun��o auxiliar para retornar o SVG do �cone de lixeira
        function getTrashIcon() {
            return `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg>`;
        }

        // Função para carregar configuração de limite de vendas na etapa 5
        function carregarConfiguracaoLimiteVendas() {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            if (!eventoId) {
                console.log('⚠️ Não há evento_id na URL - provavelmente evento novo');
                return;
            }
            
            console.log('📊 Carregando configuração de limite de vendas do evento:', eventoId);
            
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `action=carregar_limite_vendas&evento_id=${eventoId}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso && data.dados) {
                    console.log('✅ Dados carregados do banco:', data.dados);
                    
                    const checkbox = document.getElementById('controlarLimiteVendas');
                    const inputLimite = document.getElementById('limiteVendas');
                    const campoLimite = document.getElementById('campoLimiteVendas');
                    const botaoConfirmar = document.getElementById('btnConfirmarLimite');
                    const botaoCriarLote = document.getElementById('btnCriarLoteQuantidade');
                    
                    // 1. Configurar checkbox com valor do banco
                    if (checkbox) {
                        checkbox.checked = Boolean(data.dados.controlar_limite_vendas);
                        console.log('📋 Checkbox configurado:', checkbox.checked);
                    }
                    
                    // 2. Se controle está ativo, mostrar campo e configurar valores
                    if (data.dados.controlar_limite_vendas) {
                        console.log('✅ Controle de limite está ATIVO - configurando interface...');
                        
                        // Mostrar campo de limite
                        if (campoLimite) {
                            campoLimite.style.display = 'block';
                            console.log('✅ Campo de limite exibido');
                        }
                        
                        // Carregar valor do limite no campo
                        if (inputLimite) {
                            const valorLimite = data.dados.limite_vendas || '';
                            inputLimite.value = valorLimite;
                            console.log(`📊 Valor do limite carregado: "${valorLimite}"`);
                        }
                        
                        // Configurar botões baseado no valor do limite
                        if (data.dados.limite_vendas > 0) {
                            // Se há limite confirmado, habilitar botão de criar lotes
                            if (botaoCriarLote) {
                                botaoCriarLote.disabled = false;
                                botaoCriarLote.style.opacity = '1';
                                botaoCriarLote.style.cursor = 'pointer';
                                console.log('✅ Botão de criar lotes habilitado (limite confirmado)');
                            }
                            
                            // Configurar botão confirmar para "alteração"
                            if (botaoConfirmar) {
                                botaoConfirmar.innerHTML = '✅ Confirmar Alteração';
                                botaoConfirmar.style.display = 'inline-block';
                                botaoConfirmar.onclick = function() { 
                                    // Tentar encontrar a função em vários locais
                                    const confirmarFunc = window.confirmarLimiteVendas || 
                                                         window.confirmarLimiteVendasCorrigido ||
                                                         (window.controle && window.controle.confirmarLimiteVendas);
                                    
                                    if (confirmarFunc) {
                                        console.log('✅ Executando confirmação de limite...');
                                        confirmarFunc();
                                    } else {
                                        console.error('❌ Função confirmarLimiteVendas não encontrada');
                                        // Fallback: tentar novamente após delay
                                        setTimeout(() => {
                                            if (window.confirmarLimiteVendas) {
                                                window.confirmarLimiteVendas();
                                            } else {
                                                console.log('🔄 Usando função de fallback...');
                                                confirmarLimiteVendasFallback();
                                            }
                                        }, 1000);
                                    }
                                };
                            }
                        } else {
                            // Se não há limite, manter botão de criar lotes desabilitado
                            if (botaoCriarLote) {
                                botaoCriarLote.disabled = true;
                                botaoCriarLote.style.opacity = '0.5';
                                botaoCriarLote.style.cursor = 'not-allowed';
                                console.log('⚠️ Botão de criar lotes desabilitado (sem limite confirmado)');
                            }
                            
                            // Configurar botão confirmar para "primeira confirmação"
                            if (botaoConfirmar) {
                                botaoConfirmar.innerHTML = '✅ Confirmar';
                                botaoConfirmar.style.display = 'inline-block';
                                botaoConfirmar.onclick = function() { 
                                    // Tentar encontrar a função em vários locais
                                    const confirmarFunc = window.confirmarLimiteVendas || 
                                                         window.confirmarLimiteVendasCorrigido ||
                                                         (window.controle && window.controle.confirmarLimiteVendas);
                                    
                                    if (confirmarFunc) {
                                        console.log('✅ Executando confirmação de limite...');
                                        confirmarFunc();
                                    } else {
                                        console.error('❌ Função confirmarLimiteVendas não encontrada');
                                        // Fallback: tentar novamente após delay
                                        setTimeout(() => {
                                            if (window.confirmarLimiteVendas) {
                                                window.confirmarLimiteVendas();
                                            } else {
                                                console.log('🔄 Usando função de fallback...');
                                                confirmarLimiteVendasFallback();
                                            }
                                        }, 1000);
                                    }
                                };
                            }
                        }
                        
                    } else {
                        console.log('📋 Controle de limite está INATIVO - escondendo campo...');
                        
                        // Esconder campo de limite
                        if (campoLimite) {
                            campoLimite.style.display = 'none';
                        }
                        
                        // Desabilitar botão de criar lotes
                        if (botaoCriarLote) {
                            botaoCriarLote.disabled = true;
                            botaoCriarLote.style.opacity = '0.5';
                            botaoCriarLote.style.cursor = 'not-allowed';
                        }
                    }
                    
                    console.log('🎉 Interface da etapa 5 configurada com sucesso!');
                    
                    // NOVO: Carregar lotes por quantidade existentes
                    if (data.dados.controlar_limite_vendas) {
                        carregarLotesQuantidadeExistentes(eventoId);
                    }
                    
                } else {
                    console.warn('⚠️ Erro ao carregar configuração:', data.erro || 'Dados não encontrados');
                    // Em caso de erro, manter interface no estado padrão (desabilitada)
                    inicializarInterfacePadrao();
                }
            })
            .catch(error => {
                console.error('❌ Erro na requisição de carregamento:', error);
                // Em caso de erro, manter interface no estado padrão
                inicializarInterfacePadrao();
            });
        }
        
        // Função auxiliar para inicializar interface no estado padrão
        function inicializarInterfacePadrao() {
            console.log('🔧 Inicializando interface no estado padrão...');
            
            const checkbox = document.getElementById('controlarLimiteVendas');
            const campoLimite = document.getElementById('campoLimiteVendas');
            const botaoCriarLote = document.getElementById('btnCriarLoteQuantidade');
            
            if (checkbox) checkbox.checked = false;
            if (campoLimite) campoLimite.style.display = 'none';
            if (botaoCriarLote) {
                botaoCriarLote.disabled = true;
                botaoCriarLote.style.opacity = '0.5';
                botaoCriarLote.style.cursor = 'not-allowed';
            }
        }
        
        // Função de fallback para confirmar limite de vendas
        function confirmarLimiteVendasFallback() {
            console.log('💾 Executando fallback de confirmação de limite...');
            
            const inputLimite = document.getElementById('limiteVendas');
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            if (!inputLimite || !eventoId) {
                alert('Erro: Elementos necessários não encontrados.');
                return;
            }
            
            const limite = parseInt(inputLimite.value);
            
            if (!limite || limite < 1) {
                alert('⚠️ Por favor, informe uma lotação máxima válida (maior que 0).');
                inputLimite.focus();
                return;
            }
            
            // Fazer requisição direta
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `action=salvar_limite_vendas&evento_id=${eventoId}&controlar_limite_vendas=1&limite_vendas=${limite}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    console.log('✅ Limite salvo via fallback');
                    alert(`Lotação máxima de ${limite} pessoas confirmada!`);
                    
                    // Habilitar botão de criar lotes
                    const botaoCriar = document.getElementById('btnCriarLoteQuantidade');
                    if (botaoCriar) {
                        botaoCriar.disabled = false;
                        botaoCriar.style.opacity = '1';
                        botaoCriar.style.cursor = 'pointer';
                    }
                } else {
                    console.error('❌ Erro ao salvar via fallback:', data.erro);
                    alert('Erro ao salvar: ' + data.erro);
                }
            })
            .catch(error => {
                console.error('❌ Erro na requisição fallback:', error);
                alert('Erro de conexão.');
            });
        }
        
        // Expor função de fallback globalmente
        window.confirmarLimiteVendasFallback = confirmarLimiteVendasFallback;
        
        // Função para carregar lotes por quantidade existentes
        function carregarLotesQuantidadeExistentes(eventoId) {
            console.log('📦 Carregando lotes por quantidade existentes...');
            
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `action=carregar_lotes_quantidade&evento_id=${eventoId}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso && data.lotes) {
                    console.log(`✅ Carregados ${data.lotes.length} lotes por quantidade:`, data.lotes);
                    
                    if (data.lotes.length > 0) {
                        exibirLotesQuantidadeNaInterface(data.lotes);
                    } else {
                        console.log('📭 Nenhum lote por quantidade encontrado');
                    }
                } else {
                    console.warn('⚠️ Erro ao carregar lotes:', data.erro || 'Nenhum lote encontrado');
                }
            })
            .catch(error => {
                console.error('❌ Erro na requisição de lotes:', error);
            });
        }
        
        // Função para exibir lotes na interface
        function exibirLotesQuantidadeNaInterface(lotes) {
            console.log('🎨 Exibindo lotes na interface...');
            
            const container = document.getElementById('lotesPorPercentualList');
            const emptyState = document.getElementById('lotePercentualEmpty');
            
            if (!container) {
                console.error('❌ Container de lotes não encontrado');
                return;
            }
            
            // Ocultar empty state
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            
            // Adicionar cada lote
            lotes.forEach((lote, index) => {
                const loteElement = criarElementoLoteQuantidade(lote);
                container.appendChild(loteElement);
                console.log(`✅ Lote "${lote.nome}" adicionado à interface`);
            });
            
            // Atualizar summary se existir
            atualizarSummaryPercentual(lotes);
            
            console.log(`🎉 ${lotes.length} lotes exibidos com sucesso!`);
        }
        
        // Função para criar elemento HTML de um lote
        function criarElementoLoteQuantidade(lote) {
            const div = document.createElement('div');
            div.className = 'lote-item';
            div.dataset.loteId = lote.id;
            div.dataset.loteNome = lote.nome;
            div.dataset.tipo = 'quantidade';
            
            // Criar conteúdo do lote
            div.innerHTML = `
                <div class="lote-item-info">
                    <div class="lote-item-name">${lote.nome}</div>
                    <div class="lote-item-details">
                        <strong>Percentual:</strong> ${lote.percentual_venda}%
                        ${lote.divulgar_criterio ? ' | <span style="color: #28a745;">✓ Critério divulgado</span>' : ''}
                    </div>
                </div>
                <div class="lote-item-actions">
                    <button type="button" class="btn-icon" onclick="editarLoteQuantidade(${lote.id})" title="Editar lote">
                        ✏️
                    </button>
                    <button type="button" class="btn-icon delete" onclick="excluirLoteQuantidadeEspecifico(${lote.id})" title="Excluir lote">
                        🗑️
                    </button>
                </div>
            `;
            
            return div;
        }
        
        // Função para atualizar summary de percentuais
        function atualizarSummaryPercentual(lotes) {
            const summary = document.getElementById('percentualSummary');
            const totalSpan = document.getElementById('totalPercentual');
            const restanteSpan = document.getElementById('restantePercentual');
            
            if (!summary || !totalSpan || !restanteSpan) return;
            
            // Calcular total de percentuais
            const totalPercentual = lotes.reduce((total, lote) => total + lote.percentual_venda, 0);
            const restante = Math.max(0, 100 - totalPercentual);
            
            // Atualizar interface
            totalSpan.textContent = totalPercentual + '%';
            restanteSpan.textContent = restante + '%';
            
            // Mostrar summary se há lotes
            if (lotes.length > 0) {
                summary.style.display = 'block';
            }
        }

        // Função para navegar entre steps
        function updateStepDisplay() {
            
            // Atualizar cards de conteúdo
            document.querySelectorAll('.section-card').forEach(card => {
                const stepNumber = parseInt(card.dataset.stepContent);
                if (stepNumber === currentStep) {
                    card.classList.add('active');
                    card.classList.remove('prev');
                    
                    // CORREÇÃO: Carregar dados quando entra na etapa 5
                    if (stepNumber === 5) {
                        setTimeout(() => {
                            console.log('📦 Entrando na etapa 5 - Carregando configurações de limite...');
                            carregarConfiguracaoLimiteVendas();
                        }, 500);
                    }
                    
                } else if (stepNumber < currentStep) {
                    card.classList.add('prev');
                    card.classList.remove('active');
                } else {
                    card.classList.remove('active', 'prev');
                }
            });

            // Atualizar progress bar
            document.querySelectorAll('.step').forEach(step => {
                const stepNumber = parseInt(step.dataset.step);
                if (stepNumber === currentStep) {
                    step.classList.add('active');
                    step.classList.remove('completed');
                } else if (stepNumber < currentStep) {
                    step.classList.add('completed');
                    step.classList.remove('active');
                } else {
                    step.classList.remove('active', 'completed');
                }
            });

            // Atualizar linha de progresso
            const progressLine = document.getElementById('progressLine');
            const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
            progressLine.style.width = progressPercentage + '%';

            // Scroll para o topo ao mudar de step
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function validateStep(stepNumber) {
            console.log('?? ValidateStep chamado para step:', stepNumber);
            const validationMessage = document.getElementById(`validation-step-${stepNumber}`);
            let isValid = true;
            let camposInvalidos = [];

            // Remover classes de erro anteriores
            document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));

            switch(stepNumber) {
                case 1:
                    // Validar nome do evento
                    const eventName = document.getElementById('eventName');
                    if (!eventName || eventName.value.trim() === '') {
                        if (eventName) eventName.classList.add('error-field');
                        camposInvalidos.push('Nome do evento');
                        isValid = false;
                    }
                    
                    // Validar logo
                    const logoContainer = document.getElementById('logoPreviewContainer');
                    const hasLogo = logoContainer && logoContainer.querySelector('img') !== null;
                    if (!hasLogo) {
                        const logoArea = document.querySelector('#logoUpload')?.closest('.upload-area');
                        if (logoArea) logoArea.classList.add('error-field');
                        camposInvalidos.push('Logo do evento');
                        isValid = false;
                    }
                    
                    // Validar capa
                    const capaContainer = document.getElementById('capaPreviewContainer');
                    const hasCapa = capaContainer && capaContainer.querySelector('img') !== null;
                    if (!hasCapa) {
                        const capaArea = document.querySelector('#capaUpload')?.closest('.upload-area');
                        if (capaArea) capaArea.classList.add('error-field');
                        camposInvalidos.push('Imagem de capa');
                        isValid = false;
                    }
                    break;
                    
                case 2:
                    // Data e hora de in�cio
                    const startDateTime = document.getElementById('startDateTime');
                    if (!startDateTime || startDateTime.value === '') {
                        if (startDateTime) startDateTime.classList.add('error-field');
                        camposInvalidos.push('Data e hora de in�cio');
                        isValid = false;
                    }
                    
                    // Classifica��o
                    const classification = document.getElementById('classification');
                    if (!classification || classification.value === '') {
                        if (classification) classification.classList.add('error-field');
                        camposInvalidos.push('Classifica��o');
                        isValid = false;
                    }
                    
                    // Categoria
                    const category = document.getElementById('category');
                    if (!category || category.value === '') {
                        if (category) category.classList.add('error-field');
                        camposInvalidos.push('Categoria');
                        isValid = false;
                    }
                    break;
                    
                case 3:
                    // Descri��o do evento
                    const eventDescription = document.getElementById('eventDescription');
                    const descriptionText = eventDescription ? 
                        (eventDescription.innerText || eventDescription.textContent || '').trim() : '';
                    
                    if (descriptionText === '' || descriptionText === 'Digite a descri��o do seu evento aqui...') {
                        if (eventDescription) eventDescription.classList.add('error-field');
                        camposInvalidos.push('Descri��o do evento');
                        isValid = false;
                    }
                    break;
                    
                case 4:
                    // Verificar se � presencial ou online
                    const isPresential = document.getElementById('locationTypeSwitch')?.classList.contains('active');
                    
                    if (isPresential) {
                        // Validar endere�o para evento presencial
                        const addressSearch = document.getElementById('addressSearch');
                        const venueName = document.getElementById('venueName');
                        
                        if (!addressSearch || addressSearch.value.trim() === '') {
                            if (addressSearch) addressSearch.classList.add('error-field');
                            camposInvalidos.push('Endere�o do evento');
                            isValid = false;
                        }
                        
                        if (!venueName || venueName.value.trim() === '') {
                            if (venueName) venueName.classList.add('error-field');
                            camposInvalidos.push('Nome do local');
                            isValid = false;
                        }
                    } else {
                        // Validar link para evento online
                        const eventLink = document.getElementById('eventLink');
                        if (!eventLink || eventLink.value.trim() === '') {
                            if (eventLink) eventLink.classList.add('error-field');
                            camposInvalidos.push('Link do evento online');
                            isValid = false;
                        }
                    }
                    break;
                    
                case 5:
                    // CORREÇÃO PROBLEMA 2: Usar validação via banco de dados
                    console.log('🔍 [CRIAEVENTO] Validação etapa 5 - redirecionando para validação moderna...');
                    
                    // Usar a função moderna de validação de lotes
                    if (typeof window.validarLotesComRegrasEspecificas === 'function') {
                        console.log('✅ Usando validação moderna de lotes');
                        
                        // A validação moderna é assíncrona, mas aqui precisa ser síncrona
                        // Marcar como válido temporariamente e deixar a validação definitiva
                        // ser feita pela função nextStep moderna
                        console.log('⚠️ Validação legacy - deixando passar para validação moderna');
                        // isValid permanece true aqui
                    } else {
                        console.log('❌ Validação moderna não disponível - usando fallback');
                        // Fallback: pelo menos verificar se há algum lote visível na interface
                        const lotesPorDataList = document.getElementById('lotesPorDataList');
                        const lotesPorQuantidadeList = document.getElementById('lotesPorQuantidadeList');
                        
                        const temLotesData = lotesPorDataList && lotesPorDataList.children.length > 0;
                        const temLotesQtd = lotesPorQuantidadeList && lotesPorQuantidadeList.children.length > 0;
                        
                        if (!temLotesData && !temLotesQtd) {
                            console.log('❌ Nenhum lote visível na interface');
                            camposInvalidos.push('Pelo menos 1 lote');
                            isValid = false;
                        } else {
                            console.log('✅ Lotes encontrados na interface');
                        }
                    }
                    break;
                    
                case 6:
                    // Verificar se h� pelo menos um ingresso cadastrado
                    const ticketList = document.getElementById('ticketList');
                    const hasTickets = ticketList && ticketList.children.length > 0;
                    
                    if (!hasTickets) {
                        camposInvalidos.push('Pelo menos 1 tipo de ingresso');
                        isValid = false;
                    }
                    break;
                    
                case 7:
                    // Produtor - geralmente sempre v�lido pois usa o produtor atual por padr�o
                    isValid = true;
                    break;
                    
                case 8:
                    // Termos de uso
                    const termsCheckbox = document.getElementById('termsCheckbox');
                    const termsAccepted = termsCheckbox && termsCheckbox.classList.contains('checked');
                    
                    if (!termsAccepted) {
                        camposInvalidos.push('Aceitar os termos de uso');
                        isValid = false;
                    }
                    break;
            }

            // Mostrar ou esconder mensagem de valida��o
            if (!isValid && validationMessage) {
                validationMessage.textContent = 'Todos os campos obrigat�rios precisam ser preenchidos!';
                validationMessage.style.display = 'block';
                validationMessage.classList.add('show');
                
                // Log dos campos inv�lidos
                console.log('? Campos inv�lidos:', camposInvalidos);
            } else if (validationMessage) {
                validationMessage.style.display = 'none';
                validationMessage.classList.remove('show');
            }

            console.log('? Resultado da valida��o do step', stepNumber, ':', isValid);
            return isValid;
        }

        // Fun��es antigas comentadas - agora definidas diretamente no window
        /*
        function nextStep() {
            if (validateStep(currentStep)) {
                if (currentStep < totalSteps) {
                    currentStep++;
                    updateStepDisplay();
                }
            }
        }

        function prevStep() {
            if (currentStep > 1) {
                currentStep--;
                updateStepDisplay();
            }
        }
        
        function goToStep(step) {
            if (step >= 1 && step <= totalSteps) {
                currentStep = step;
                updateStepDisplay();
            }
        }
        */

        async function publishEvent() {
            if (validateStep(currentStep)) {
                const publishBtn = document.querySelector('.btn-publish');
                publishBtn.textContent = 'Publicando evento...';
                publishBtn.disabled = true;
                
                // Chamar a fun��o de envio para API
                const sucesso = await enviarEventoParaAPI();
                
                if (!sucesso) {
                    publishBtn.textContent = '✓ Publicar evento';
                    publishBtn.disabled = false;
                }
            }
        }
        
        // Expor fun��o publishEvent globalmente
        window.publishEvent = publishEvent;

        // Modal functionality
        function openModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('show');
                if (modalId === 'paidTicketModal') {
                    setTimeout(() => {
                        initPriceInput();
                    }, 100);
                } else if (modalId === 'comboTicketModal') {
                    setTimeout(() => {
                        initComboPriceInput();
                        carregarLotesNoModalCombo();
                        // Limpar o select de tipos de ingresso ao abrir o modal
                        const selectTipos = document.getElementById('comboTicketTypeSelect');
                        if (selectTipos) {
                            selectTipos.innerHTML = '<option value="">Selecione um lote primeiro</option>';
                        }
                        // Garantir que o select de lote esteja resetado
                        const selectLote = document.getElementById('comboTicketLote');
                        if (selectLote) {
                            selectLote.value = '';
                        }
                    }, 100);
                }
            }
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('show');
                modal.style.display = 'none';
            }
        }

        // Inicializa��o do Google Maps
        function initMap() {
            console.log('🗺️ Inicializando Google Maps...');
            
            const mapElement = document.getElementById('map');
            if (!mapElement) {
                console.log('❌ Elemento do mapa n�o encontrado');
                return;
            }

            try {
                // Criar mapa com estilo dark
                map = new google.maps.Map(mapElement, {
                    center: { lat: -23.550520, lng: -46.633308 },
                    zoom: 13,
                    styles: [
                        {
                            "elementType": "geometry",
                            "stylers": [{"color": "#1a1a2e"}]
                        },
                        {
                            "elementType": "labels.text.stroke",
                            "stylers": [{"color": "#16213e"}]
                        },
                        {
                            "elementType": "labels.text.fill",
                            "stylers": [{"color": "#725eff"}]
                        },
                        {
                            "featureType": "water",
                            "elementType": "geometry",
                            "stylers": [{"color": "#00c2ff"}]
                        }
                    ]
                });

                geocoder = new google.maps.Geocoder();
                autocompleteService = new google.maps.places.AutocompleteService();
                placesService = new google.maps.places.PlacesService(map);

                console.log('✅ Google Maps inicializado com sucesso');
                mapElement.innerHTML = '<div class="map-loading">Mapa carregado - Pesquise um endere�o acima</div>';
                
                // AJUSTE: Tentar obter localização atual do usuário
                getCurrentUserLocation();
                
            } catch (error) {
                console.error('❌ Erro ao inicializar Google Maps:', error);
                mapElement.innerHTML = '<div class="map-loading">Erro ao carregar o mapa</div>';
            }
        }

        // AJUSTE: Função para obter localização atual do usuário
        function getCurrentUserLocation() {
            console.log('📍 Tentando obter localização atual do usuário...');
            
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        const userLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        
                        console.log('✅ Localização obtida:', userLocation);
                        
                        // Centralizar mapa na localização do usuário
                        if (map) {
                            map.setCenter(userLocation);
                            map.setZoom(15);
                            
                            // Criar marcador na localização atual
                            if (marker) {
                                marker.setMap(null);
                            }
                            
                            marker = new google.maps.Marker({
                                position: userLocation,
                                map: map,
                                title: 'Sua localização atual',
                                animation: google.maps.Animation.DROP
                            });
                            
                            console.log('🗺️ Mapa atualizado para localização atual');
                        }
                    },
                    function(error) {
                        console.log('⚠️ Não foi possível obter localização:', error.message);
                        // Manter localização padrão (São Paulo)
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000 // 5 minutos
                    }
                );
            } else {
                console.log('⚠️ Geolocalização não suportada pelo navegador');
            }
        }

        // Todas as outras fun�ões do arquivo original...
        // [Incluir todas as fun�ões JavaScript do arquivo original aqui]

        // Inicializa��o quando DOM estiver pronto
        document.addEventListener('DOMContentLoaded', function() {
            console.log('?? Inicializando Anysummit...');
            
            try {
                initImageUpload();
                initAdditionalUploads();
                initSwitches();
                initProducerSelection();
                initRichEditor();
                initCheckboxes();
                initRadioButtons();
                initTicketManagement();
                // initAddressSearch(); // Comentado - nova implementação será criada
                initPreviewListeners();
                initFormSubmission();
                initPriceInput();
                initMiniSwitches();
                initCodeTicketButton();
                updatePreview();
                updateStepDisplay();
                
                console.log('? Anysummit inicializado com sucesso');
                
                // Verificar dados salvos AP�S tudo estar carregado
                // DESABILITADO - Agora usando unified-recovery.js
                /*
                setTimeout(() => {
                    // checkAndRestoreWizardData() removido
                }, 100);
                */
                
                // Debug para combo
                const comboBtn = document.getElementById('addComboTicket');
                console.log('🔍 Bot�o combo encontrado:', comboBtn);
                if (comboBtn) {
                    console.log('✅ Event listener adicionado ao bot�o combo');
                } else {
                    console.error('❌ Bot�o combo NÃO encontrado!');
                }
                
            } catch (error) {
                console.error('❌ Erro na inicializa��o:', error);
            }
        });

        // [Incluir todas as demais fun�ões JavaScript do arquivo original aqui]
        // Copie todas as fun�ões do arquivo original, incluindo:
        // - initAddressSearch()
        // - searchAddresses()
        // - selectAddress()
        // - updatePreview()
        // - initImageUpload()
        // - initSwitches()
        // - createPaidTicket()
        // - createFreeTicket()
        // - createCodeTicket()
        // - Fun�ões da API
        // etc...

        // Fun��o initImageUpload - DESATIVADA (substitu�da por fundoUpload)
        function initImageUpload() {
            // Mantida por compatibilidade mas n�o faz nada
            return;
        }

        // Inicializar uploads adicionais
        function initAdditionalUploads() {
            // Logo do evento
            const logoUpload = document.getElementById('logoUpload');
            if (logoUpload) {
                logoUpload.addEventListener('change', function() {
                    handleImageUpload(this, 'logoPreviewContainer', 'logo');
                });
            }

            // Capa quadrada
            const capaUpload = document.getElementById('capaUpload');
            if (capaUpload) {
                capaUpload.addEventListener('change', function() {
                    handleImageUpload(this, 'capaPreviewContainer', 'capa');
                });
            }

            // Imagem de fundo
            const fundoUpload = document.getElementById('fundoUpload');
            if (fundoUpload) {
                fundoUpload.addEventListener('change', function() {
                    // Verificar se � o preview principal ou o container pequeno
                    const mainPreview = document.getElementById('fundoPreviewMain');
                    if (mainPreview) {
                        handleMainImageUpload(this, 'fundoPreviewMain', 'fundo');
                    } else {
                        handleImageUpload(this, 'fundoPreviewContainer', 'fundo');
                    }
                });
            }

            // Cor de fundo
            const corFundo = document.getElementById('corFundo');
            const corFundoHex = document.getElementById('corFundoHex');
            const colorPreview = document.getElementById('colorPreview');
            
            if (corFundo && corFundoHex && colorPreview) {
                // Inicializar cor
                colorPreview.style.backgroundColor = corFundo.value;
                
                // Sincronizar color picker com input text e preview
                corFundo.addEventListener('change', function() {
                    corFundoHex.value = this.value;
                    colorPreview.style.backgroundColor = this.value;
                    // saveWizardData() removido
                    updatePreview();
                });

                corFundoHex.addEventListener('input', function() {
                    if (/^#[0-9A-F]{6}$/i.test(this.value)) {
                        corFundo.value = this.value;
                        colorPreview.style.backgroundColor = this.value;
                        // saveWizardData() removido
                        updatePreview();
                    }
                });
                
                // Click no preview abre o color picker
                colorPreview.addEventListener('click', function() {
                    corFundo.click();
                });
            }
        }

        // Fun��o para processar upload de imagens adicionais
        async function handleImageUpload(input, containerId, type) {
            const file = input.files[0];
            if (!file) return;

            // Validar tipo
            if (!file.type.match('image.*')) {
                alert('Por favor, selecione apenas arquivos de imagem.');
                return;
            }

            // Validar tamanho (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('A imagem deve ter no m�ximo 5MB.');
                return;
            }

            // Mostrar preview local primeiro
            const reader = new FileReader();
            reader.onload = function(e) {
                const container = document.getElementById(containerId);
                if (container) {
                    let dimensions = '';
                    switch(type) {
                        case 'logo':
                            dimensions = '800x200px';
                            break;
                        case 'capa':
                            dimensions = '450x450px';
                            break;
                        case 'fundo':
                            dimensions = '1920x640px';
                            break;
                    }

                    container.innerHTML = `
                        <img src="${e.target.result}" alt="${type}">
                        <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                        <div class="upload-hint">${dimensions}</div>
                    `;

                    // Mostrar bot�o de limpar
                    const clearButton = document.getElementById('clear' + type.charAt(0).toUpperCase() + type.slice(1));
                    if (clearButton) {
                        clearButton.style.display = 'flex';
                    }
                }
            };
            reader.readAsDataURL(file);

            // Fazer upload real para o servidor
            const formData = new FormData();
            formData.append('imagem', file);
            formData.append('tipo', type);

            try {
                const response = await fetch('/produtor/ajax/upload_imagem_wizard.php', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        // Salvar caminho da imagem
                        if (!window.uploadedImages) {
                            window.uploadedImages = {};
                        }
                        window.uploadedImages[type] = data.image_url;
                        console.log(`? ${type} enviado:`, data.image_url);
                        
                        // Salvar no wizard
                        // saveWizardData() removido
                        updatePreview();
                    } else {
                        console.error('Erro no upload:', data.message);
                    }
                } else {
                    console.error('Erro na resposta:', response.status);
                }
            } catch (error) {
                console.error('Erro ao fazer upload:', error);
            }
        }

        // Fun��o para processar upload da imagem principal de fundo
        async function handleMainImageUpload(input, containerId, type) {
            const file = input.files[0];
            if (!file) return;

            // Validar tipo
            if (!file.type.match('image.*')) {
                alert('Por favor, selecione apenas arquivos de imagem.');
                return;
            }

            // Validar tamanho (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('A imagem deve ter no m�ximo 5MB.');
                return;
            }

            // Mostrar preview local primeiro
            const reader = new FileReader();
            reader.onload = function(e) {
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = `
                        <img src="${e.target.result}" alt="Imagem de fundo">
                    `;

                    // Mostrar bot�o de limpar
                    const clearFundo = document.getElementById('clearFundo');
                    if (clearFundo) {
                        clearFundo.style.display = 'flex';
                    }

                    // Atualizar tamb�m o imagePreview para compatibilidade
                    const imagePreview = document.getElementById('imagePreview');
                    if (imagePreview) {
                        imagePreview.src = e.target.result;
                        imagePreview.style.display = 'block';
                    }
                }
            };
            reader.readAsDataURL(file);

            // Fazer upload real para o servidor
            const formData = new FormData();
            formData.append('imagem', file);
            formData.append('tipo', type);

            try {
                const response = await fetch('/produtor/ajax/upload_imagem_wizard.php', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        // Salvar caminho da imagem
                        if (!window.uploadedImages) {
                            window.uploadedImages = {};
                        }
                        window.uploadedImages[type] = data.image_url;
                        console.log(`? ${type} enviado:`, data.image_url);
                        
                        // Salvar no wizard
                        // saveWizardData() removido
                        updatePreview();
                    } else {
                        console.error('Erro no upload:', data.message);
                    }
                } else {
                    console.error('Erro na resposta:', response.status);
                }
            } catch (error) {
                console.error('Erro ao fazer upload:', error);
            }
        }

        // Fun��o para limpar imagem e remover arquivo
        function clearImage(type, event) {
            // Prevenir propaga��o do clique
            if (event) {
                event.stopPropagation();
            }

            let containerId;
            let inputId;
            let clearButtonId;
            let defaultContent;

            switch(type) {
                case 'logo':
                    containerId = 'logoPreviewContainer';
                    inputId = 'logoUpload';
                    clearButtonId = 'clearLogo';
                    defaultContent = `
                        <div class="upload-icon">??</div>
                        <div class="upload-text">Adicionar logo</div>
                        <div class="upload-hint">800x200px � Fundo transparente</div>
                    `;
                    break;
                case 'capa':
                    containerId = 'capaPreviewContainer';
                    inputId = 'capaUpload';
                    clearButtonId = 'clearCapa';
                    defaultContent = `
                        <div class="upload-icon">???</div>
                        <div class="upload-text">Adicionar capa</div>
                        <div class="upload-hint">450x450px � Fundo transparente</div>
                    `;
                    break;
                case 'fundo':
                    containerId = 'fundoPreviewMain';
                    inputId = 'fundoUpload';
                    clearButtonId = 'clearFundo';
                    defaultContent = `
                        <div class="upload-icon">??</div>
                        <div class="upload-text">Clique para adicionar imagem de fundo</div>
                        <div class="upload-hint">PNG, JPG at� 5MB � Tamanho ideal: 1920x640px</div>
                    `;
                    break;
            }

            // Restaurar conte�do padr�o
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = defaultContent;
            }

            // Limpar input file
            const input = document.getElementById(inputId);
            if (input) {
                input.value = '';
            }

            // Esconder bot�o de limpar
            const clearButton = document.getElementById(clearButtonId);
            if (clearButton) {
                clearButton.style.display = 'none';
            }

            // Salvar altera��es
            // saveWizardData() removido
            updatePreview();
        }

        // Tornar a fun��o global
        window.clearImage = clearImage;

        function initSwitch(switchId, callback) {
            const switchEl = document.getElementById(switchId);
            if (!switchEl) return;
            
            switchEl.addEventListener('click', function() {
                this.classList.toggle('active');
                if (callback) callback(this.classList.contains('active'));
            });
        }

        function initSwitches() {
            initSwitch('multiDaySwitch');
            initSwitch('locationTypeSwitch', function(isActive) {
                const presential = document.getElementById('presentialLocation');
                const online = document.getElementById('onlineLocation');
                
                if (presential && online) {
                    if (isActive) {
                        presential.classList.add('show');
                        online.classList.remove('show');
                    } else {
                        presential.classList.remove('show');
                        online.classList.add('show');
                    }
                    updatePreview();
                }
            });
            initSwitch('ticketVisibility1');
            initSwitch('absorbFeeSwitch');
        }

        function initProducerSelection() {
            const producerSelect = document.getElementById('producer');
            const newProducerFields = document.getElementById('newProducerFields');
            
            if (!producerSelect || !newProducerFields) return;

            producerSelect.addEventListener('change', function() {
                if (this.value === 'new') {
                    newProducerFields.classList.add('show');
                } else {
                    newProducerFields.classList.remove('show');
                }
            });
        }

        function initRichEditor() {
            const richEditor = document.getElementById('eventDescription');
            const editorBtns = document.querySelectorAll('.editor-btn');
            const charCounter = document.getElementById('charCounter');

            if (!richEditor) return;

            editorBtns.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const command = this.dataset.command;
                    
                    if (command === 'createLink') {
                        const url = prompt('Digite a URL do link:');
                        if (url) {
                            document.execCommand('createLink', false, url);
                        }
                    } else {
                        document.execCommand(command, false, null);
                    }
                    
                    updateEditorButtons();
                    richEditor.focus();
                });
            });
            
            // Adicionar suporte para colar imagens
            richEditor.addEventListener('paste', async function(e) {
                const items = e.clipboardData.items;
                
                for (let item of items) {
                    if (item.type.indexOf('image') !== -1) {
                        e.preventDefault();
                        
                        const blob = item.getAsFile();
                        const formData = new FormData();
                        formData.append('image', blob);
                        formData.append('folder', 'eventos');
                        
                        try {
                            // Por enquanto, apenas converter para base64
                            const reader = new FileReader();
                            reader.onload = function(event) {
                                document.execCommand('insertImage', false, event.target.result);
                            };
                            reader.readAsDataURL(blob);
                            
                            // TODO: Implementar upload real para /uploads/eventos
                            /*
                            const response = await fetch('/produtor/ajax/upload_image.php', {
                                method: 'POST',
                                body: formData
                            });
                            
                            if (response.ok) {
                                const data = await response.json();
                                document.execCommand('insertImage', false, data.url);
                            }
                            */
                        } catch (error) {
                            console.error('Erro ao processar imagem:', error);
                        }
                    }
                }
            });

            function updateEditorButtons() {
                editorBtns.forEach(btn => {
                    const command = btn.dataset.command;
                    if (document.queryCommandState(command)) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }

            richEditor.addEventListener('keyup', function() {
                updateEditorButtons();
                updateCharCounter();
                updatePreview();
            });

            richEditor.addEventListener('mouseup', updateEditorButtons);

            function updateCharCounter() {
                if (!charCounter) return;
                const text = richEditor.textContent || richEditor.innerText || '';
                charCounter.textContent = `${text.length} caracteres`;
            }
        }

        function initCheckboxes() {
            const checkboxes = document.querySelectorAll('.checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('click', function() {
                    this.classList.toggle('checked');
                });
            });
        }

        function initRadioButtons() {
            const radioButtons = document.querySelectorAll('.radio');
            radioButtons.forEach(radio => {
                radio.addEventListener('click', function() {
                    const name = this.dataset.name;
                    if (name) {
                        document.querySelectorAll(`[data-name="${name}"]`).forEach(r => r.classList.remove('checked'));
                    } else {
                        const group = this.closest('.radio-group');
                        if (group) {
                            group.querySelectorAll('.radio').forEach(r => r.classList.remove('checked'));
                        }
                    }
                    this.classList.add('checked');
                });
            });
        }

        function initTicketManagement() {
            const addPaidBtn = document.getElementById('addPaidTicket');
            const addFreeBtn = document.getElementById('addFreeTicket');
            const addComboBtn = document.getElementById('addComboTicket');

            if (addPaidBtn) {
                addPaidBtn.addEventListener('click', function() {
                    openModal('paidTicketModal');
                    // Carregar lotes ap�s abrir o modal
                    setTimeout(function() {
                        if (typeof carregarLotesIngressoPago === 'function') {
                            carregarLotesIngressoPago();
                            console.log('Lotes carregados via carregarLotesIngressoPago');
                        } else if (typeof carregarLotesNoModal === 'function') {
                            carregarLotesNoModal();
                            console.log('Lotes carregados via carregarLotesNoModal');
                        } else {
                            console.error('Fun��o para carregar lotes n�o encontrada');
                        }
                        
                        // Calcular valores do ingresso
                        if (typeof calcularValoresIngresso === 'function') {
                            // Limpar campo de pre�o
                            const precoInput = document.getElementById('paidTicketPrice');
                            if (precoInput) {
                                precoInput.value = '';
                            }
                            calcularValoresIngresso();
                        }
                    }, 300);
                });
            }

            if (addFreeBtn) {
                addFreeBtn.addEventListener('click', function() {
                    console.log('Bot�o ingresso gratuito clicado');
                    openModal('freeTicketModal');
                    // Carregar lotes ap�s abrir o modal
                    setTimeout(function() {
                        console.log('Tentando carregar lotes para modal gratuito...');
                        if (typeof carregarLotesNoModalFree === 'function') {
                            carregarLotesNoModalFree();
                            console.log('Fun��o carregarLotesNoModalFree executada');
                        } else {
                            console.error('Fun��o carregarLotesNoModalFree n�o encontrada');
                            // Tentar alternativa
                            if (typeof window.carregarLotesNoModalFree === 'function') {
                                window.carregarLotesNoModalFree();
                                console.log('Fun��o window.carregarLotesNoModalFree executada');
                            }
                        }
                    }, 300);
                });
            }

            if (addComboBtn) {
                addComboBtn.addEventListener('click', function() {
                    openModal('comboTicketModal');
                });
            }
        }

        function createPaidTicket() {
            // Limpar erros anteriores
            document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
            
            const title = document.getElementById('paidTicketTitle')?.value;
            const quantity = document.getElementById('paidTicketQuantity')?.value;
            const price = document.getElementById('paidTicketPrice')?.value;
            const description = document.getElementById('paidTicketDescription')?.value || '';
            const saleStart = document.getElementById('paidSaleStart')?.value;
            const saleEnd = document.getElementById('paidSaleEnd')?.value;
            const minQuantity = document.getElementById('paidMinQuantity')?.value || 1;
            const maxQuantity = document.getElementById('paidMaxQuantity')?.value || 5;
            const loteId = document.getElementById('paidTicketLote')?.value;
            
            // Obter valores calculados
            const cobrarTaxa = document.getElementById('paidTicketTaxaServico')?.checked ? 1 : 0;
            const taxaValor = document.getElementById('paidTicketTaxaValor')?.value || 'R$ 0,00';
            const valorReceber = document.getElementById('paidTicketValorReceber')?.value || 'R$ 0,00';

            // Valida��o com destaque de campos
            let hasError = false;
            
            if (!title) {
                document.getElementById('paidTicketTitle').classList.add('error-field');
                hasError = true;
            }
            if (!quantity && quantity !== '0') { // Permitir quantidade 0 para checkbox desmarcado
                document.getElementById('paidTicketQuantity').classList.add('error-field');
                hasError = true;
            }
            if (!price || price === 'R$ 0,00') {
                document.getElementById('paidTicketPrice').classList.add('error-field');
                hasError = true;
            }
            if (!loteId) {
                document.getElementById('paidTicketLote').classList.add('error-field');
                hasError = true;
            }
            
            if (hasError) {
                alert('Por favor, preencha todos os campos obrigat�rios marcados em vermelho.');
                return;
            }

            // Verificar se estamos em modo de edi��o (existe API) ou cria��o
            if (window.location.pathname.includes('editar-evento.php')) {
                // Modo edi��o - usar API
                const cleanPrice = parseFloat(price.replace(/[R$\s\.]/g, '').replace(',', '.'));
                const cleanTaxa = parseFloat(taxaValor.replace(/[R$\s\.]/g, '').replace(',', '.'));
                const cleanValorReceber = parseFloat(valorReceber.replace(/[R$\s\.]/g, '').replace(',', '.'));
                
                const eventoId = new URLSearchParams(window.location.search).get('eventoid');
                const data = {
                    evento_id: parseInt(eventoId),
                    tipo: 'pago',
                    titulo: title,
                    descricao: description,
                    quantidade_total: parseInt(quantity),
                    preco: cleanPrice,
                    taxa_plataforma: cleanTaxa,
                    valor_receber: cleanValorReceber,
                    cobrar_taxa_servico: cobrarTaxa,
                    lote_id: loteId,
                    inicio_venda: saleStart || new Date().toISOString().slice(0, 16),
                    fim_venda: saleEnd || new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 16),
                    limite_min: parseInt(minQuantity),
                    limite_max: parseInt(maxQuantity),
                    disponibilidade: 'publico',
                    ativo: 1
                };

                fetch('/produtor/ajax/salvar_ingresso.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        if (typeof addTicketToEditList === 'function') {
                            addTicketToEditList(result.ingresso);
                        }
                        closeModal('paidTicketModal');
                        console.log('✅ Ingresso pago criado com sucesso via API');
                    } else {
                        console.error('❌ Erro ao criar ingresso:', result.message);
                    }
                })
                .catch(error => {
                    console.error('❌ Erro na requisi��o:', error);
                    alert('Erro ao criar ingresso. Tente novamente.');
                });
            } else {
                // Modo cria��o - usar sistema de ingressos tempor�rios
                const cleanPrice = parseFloat(price.replace(/[R$\s\.]/g, '').replace(',', '.'));
                const cleanTaxa = parseFloat(taxaValor.replace(/[R$\s\.]/g, '').replace(',', '.'));
                const cleanValorReceber = parseFloat(valorReceber.replace(/[R$\s\.]/g, '').replace(',', '.'));
                
                if (typeof addTicketToCreationList === 'function') {
                    addTicketToCreationList(
                        'paid', 
                        title, 
                        parseInt(quantity), 
                        cleanPrice, 
                        description, 
                        saleStart, 
                        saleEnd, 
                        parseInt(minQuantity), 
                        parseInt(maxQuantity),
                        cobrarTaxa,
                        cleanTaxa,
                        cleanValorReceber,
                        loteId
                    );
                } else {
                    // Fallback para fun��o antiga
                    addTicketToList('paid', title, quantity, price, loteId);
                }
                
                closeModal('paidTicketModal');
                
                // Limpar campos
                document.getElementById('paidTicketTitle').value = '';
                document.getElementById('paidTicketQuantity').value = '';
                document.getElementById('paidTicketPrice').value = '';
                document.getElementById('paidTicketDescription').value = '';
                document.getElementById('paidSaleStart').value = '';
                document.getElementById('paidSaleEnd').value = '';
                document.getElementById('paidMinQuantity').value = '1';
                document.getElementById('paidMaxQuantity').value = '5';
                document.getElementById('paidTicketLote').value = '';
                document.getElementById('paidTicketTaxaServico').checked = true;
                calcularValoresIngresso();
            }
        }

        function createFreeTicket() {
            const title = document.getElementById('freeTicketTitle')?.value;
            const quantity = document.getElementById('freeTicketQuantity')?.value;
            const description = document.getElementById('freeTicketDescription')?.value || '';
            const saleStart = document.getElementById('freeSaleStart')?.value;
            const saleEnd = document.getElementById('freeSaleEnd')?.value;
            const minQuantity = document.getElementById('freeMinQuantity')?.value || 1;
            const maxQuantity = document.getElementById('freeMaxQuantity')?.value || 5;
            const loteId = document.getElementById('freeTicketLote')?.value;

            if (!title || (!quantity && quantity !== '0')) { // Permitir quantidade 0 para checkbox desmarcado
                alert('Por favor, preencha todos os campos obrigat�rios.');
                return;
            }

            // Verificar se estamos em modo de edi��o (existe API)
            if (window.location.pathname.includes('editar-evento.php') && typeof fetch !== 'undefined') {
                // Modo edi��o - usar API
                const eventoId = new URLSearchParams(window.location.search).get('eventoid');
                const data = {
                    evento_id: parseInt(eventoId),
                    tipo: 'gratuito',
                    titulo: title,
                    descricao: description,
                    quantidade_total: parseInt(quantity),
                    preco: 0,
                    taxa_plataforma: 0,
                    valor_receber: 0,
                    inicio_venda: saleStart || new Date().toISOString().slice(0, 16),
                    fim_venda: saleEnd || new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 16),
                    limite_min: parseInt(minQuantity),
                    limite_max: parseInt(maxQuantity),
                    disponibilidade: 'publico',
                    ativo: 1
                };

                fetch('/produtor/ajax/salvar_ingresso.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        if (typeof addTicketToEditList === 'function') {
                            addTicketToEditList(result.ingresso);
                        }
                        closeModal('freeTicketModal');
                        console.log('✅ Ingresso gratuito criado com sucesso via API');
                    } else {
                        console.error('❌ Erro ao criar ingresso:', result.message);
                    }
                })
                .catch(error => {
                    console.error('❌ Erro na requisi��o:', error);
                    alert('Erro ao criar ingresso. Tente novamente.');
                });
            } else {
                // Modo cria��o - usar sistema de ingressos tempor�rios
                if (typeof addTicketToCreationList === 'function') {
                    addTicketToCreationList(
                        'gratuito', 
                        title, 
                        parseInt(quantity), 
                        0, 
                        description, 
                        saleStart, 
                        saleEnd, 
                        parseInt(minQuantity), 
                        parseInt(maxQuantity)
                    );
                } else {
                    // Fallback para fun��o antiga com par�metros adicionais
                    addTicketToList('free', title, quantity, 'Gratuito', loteId, description, saleStart, saleEnd, minQuantity, maxQuantity);
                }
                
                closeModal('freeTicketModal');
                
                // Limpar campos
                document.getElementById('freeTicketTitle').value = '';
                document.getElementById('freeTicketQuantity').value = '';
                document.getElementById('freeTicketDescription').value = '';
                document.getElementById('freeSaleStart').value = '';
                document.getElementById('freeSaleEnd').value = '';
                document.getElementById('freeMinQuantity').value = '1';
                document.getElementById('freeMaxQuantity').value = '5';
            }
        }

        function updatePreview() {
            const previewTitle = document.getElementById('previewTitle');
            const previewDescription = document.getElementById('previewDescription');
            const previewDate = document.getElementById('previewDate');
            const previewLocation = document.getElementById('previewLocation');
            const previewCategory = document.getElementById('previewCategory');
            const previewType = document.getElementById('previewType');

            if (!previewTitle) return;

            const eventName = document.getElementById('eventName')?.value || 'Nome do evento';
            const startDateTime = document.getElementById('startDateTime')?.value;
            const endDateTime = document.getElementById('endDateTime')?.value;
            const category = document.getElementById('category')?.value;
            const venueName = document.getElementById('venueName')?.value;
            const eventLink = document.getElementById('eventLink')?.value;
            const isPresential = document.getElementById('locationTypeSwitch')?.classList.contains('active');
            const description = document.getElementById('eventDescription')?.textContent || '';
            
            previewTitle.textContent = eventName;
            // Mostrar descri��o apenas se existir, caso contr�rio deixar vazio
            if (previewDescription) {
                previewDescription.textContent = description ? description.substring(0, 120) : '';
            }
            
            // Mostrar data de in�cio e fim
            if (startDateTime && previewDate) {
                const startDateObj = new Date(startDateTime);
                let dateText = startDateObj.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                // Adicionar data de fim se existir
                if (endDateTime) {
                    const endDateObj = new Date(endDateTime);
                    dateText += ' at� ' + endDateObj.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
                
                previewDate.textContent = dateText;
            } else if (previewDate) {
                previewDate.textContent = 'Data n�o definida';
            }
            
            if (previewLocation) {
                if (isPresential) {
                    previewLocation.textContent = venueName || '';
                } else {
                    previewLocation.textContent = eventLink || '';
                }
            }

            if (previewType) {
                previewType.textContent = isPresential ? 'Presencial' : 'Online';
            }
            
            if (previewCategory) {
                const categoryEl = document.querySelector(`#category option[value="${category}"]`);
                const categoryText = categoryEl ? categoryEl.textContent : 'Categoria n�o definida';
                previewCategory.textContent = categoryText;
            }
            
            // Atualizar preview Hero
            updateHeroPreview(eventName, startDateTime, venueName, eventLink, isPresential);
        }

        // Fun��o para atualizar o preview hero
        function updateHeroPreview(eventName, startDateTime, venueName, eventLink, isPresential) {
            // Atualizar imagem de fundo
            const heroBackground = document.getElementById('heroBackground');
            const heroSection = document.querySelector('.hero-section-mini');
            const fundoImg = document.querySelector('#fundoPreviewMain img');
            const corFundo = document.getElementById('corFundo')?.value || '#000000';
            
            if (heroBackground && heroSection) {
                if (fundoImg && fundoImg.src) {
                    // Tem imagem de fundo
                    heroBackground.style.backgroundImage = `url(${fundoImg.src})`;
                    heroBackground.style.backgroundColor = '';
                    heroBackground.style.opacity = '1'; // Opacidade total
                    heroSection.classList.remove('solid-bg');
                } else {
                    // Usar cor s�lida
                    heroBackground.style.backgroundImage = '';
                    heroBackground.style.backgroundColor = corFundo;
                    heroBackground.style.opacity = '1';
                    heroSection.classList.add('solid-bg');
                }
            }

            // Atualizar logo
            const heroLogo = document.getElementById('heroLogo');
            const logoImg = document.querySelector('#logoPreviewContainer img');
            
            if (heroLogo && logoImg && logoImg.src) {
                heroLogo.src = logoImg.src;
                heroLogo.style.display = 'block';
            } else if (heroLogo) {
                heroLogo.style.display = 'none';
            }

            // Atualizar imagem capa quadrada
            const heroCapa = document.getElementById('heroCapa');
            const capaImg = document.querySelector('#capaPreviewContainer img');
            
            if (heroCapa && capaImg && capaImg.src) {
                heroCapa.src = capaImg.src;
                heroCapa.style.display = 'block';
            } else if (heroCapa) {
                heroCapa.style.display = 'none';
            }
        }

        // Fun��es de Cookie
        function setCookie(name, value, days) {
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
        }

        function getCookie(name) {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) {
                    let value = c.substring(nameEQ.length, c.length);
                    // Tentar decodificar se necess�rio
                    try {
                        return decodeURIComponent(value);
                    } catch(e) {
                        return value;
                    }
                }
            }
            return null;
        }

        function deleteCookie(name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
        }
        
        function clearAllWizardData() {
            
            
            // Limpar cookies
            deleteCookie('eventoWizard');
            deleteCookie('lotesData');
            deleteCookie('ingressosData');
            deleteCookie('ingressosSalvos');
            
            // Limpar lotes usando a fun��o global
            if (window.limparTodosLotes) {
                window.limparTodosLotes();
            }
            
            // Limpar tamb�m ingressos tempor�rios
            if (window.temporaryTickets) {
                window.temporaryTickets.clear();
            }
            
            // Limpar a lista visual de ingressos
            const ticketList = document.getElementById('ticketList');
            if (ticketList) {
                ticketList.innerHTML = '';
            }
            
            // Limpar localStorage
            if (typeof(Storage) !== "undefined") {
                localStorage.removeItem('wizardData');
                localStorage.removeItem('lotesData');
                localStorage.removeItem('ingressosData');
                localStorage.removeItem('temporaryTickets');
            }
            
            console.log('? Wizard limpo completamente');
        }

        // Fun��o para coletar ingressos da lista visual
        function getTicketsFromList() {
            const tickets = [];
            const ticketElements = document.querySelectorAll('.ticket-item');
            
            ticketElements.forEach(element => {
                const ticketData = element.ticketData;
                if (ticketData) {
                    tickets.push(ticketData);
                }
                
                // Fallback para combos
                if (element.dataset.comboData) {
                    try {
                        const comboData = JSON.parse(element.dataset.comboData);
                        tickets.push({
                            type: 'combo',
                            comboData: comboData,
                            ticketId: element.dataset.ticketId
                        });
                    } catch(e) {
                        console.error('Erro ao parsear combo data:', e);
                    }
                }
            });
            
            return tickets;
        }

        // Funções de persistência removidas - serão substituídas por salvamento direto no banco
        // saveWizardData() - removida
        // checkAndRestoreWizardData() - removida
        // clearAllWizardData() - removida
        // Funções de cookie - removidas

        function restoreWizardData(data) {
            // Restaurar uploadedImages se existir
            if (data.uploadedImages) {
                window.uploadedImages = data.uploadedImages;
            }
            
            // Restaurar caminhos das imagens se existirem
            if (!window.uploadedImages) {
                window.uploadedImages = {};
            }
            
            // Restaurar imagens do logo
            if (data.logoPath) {
                window.uploadedImages.logo = data.logoPath;
                const logoContainer = document.getElementById('logoPreviewContainer');
                if (logoContainer && data.logoPath) {
                    logoContainer.innerHTML = `
                        <img src="${data.logoPath}" alt="logo">
                        <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                        <div class="upload-hint">800x200px</div>
                    `;
                    // Mostrar bot�o de limpar
                    const clearButton = document.getElementById('clearLogo');
                    if (clearButton) clearButton.style.display = 'flex';
                }
            }
            
            // Restaurar imagem de capa
            if (data.capaPath) {
                window.uploadedImages.capa = data.capaPath;
                const capaContainer = document.getElementById('capaPreviewContainer');
                if (capaContainer && data.capaPath) {
                    capaContainer.innerHTML = `
                        <img src="${data.capaPath}" alt="capa">
                        <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                        <div class="upload-hint">450x450px</div>
                    `;
                    // Mostrar bot�o de limpar
                    const clearButton = document.getElementById('clearCapa');
                    if (clearButton) clearButton.style.display = 'flex';
                }
            }
            
            // Restaurar imagem de fundo
            if (data.fundoPath) {
                window.uploadedImages.fundo = data.fundoPath;
                const fundoContainer = document.getElementById('fundoPreviewMain');
                if (fundoContainer && data.fundoPath) {
                    fundoContainer.innerHTML = `
                        <img src="${data.fundoPath}" alt="fundo">
                    `;
                    // Mostrar bot�o de limpar
                    const clearButton = document.getElementById('clearFundo');
                    if (clearButton) clearButton.style.display = 'flex';
                }
            }
            
            // Restaurar campos b�sicos
            if (data.eventName && document.getElementById('eventName')) {
                document.getElementById('eventName').value = data.eventName;
            }
            if (data.eventDescription && document.getElementById('eventDescription')) {
                document.getElementById('eventDescription').innerHTML = data.eventDescription;
            }
            if (data.classification && document.getElementById('classification')) {
                document.getElementById('classification').value = data.classification;
            }
            if (data.startDateTime && document.getElementById('startDateTime')) {
                document.getElementById('startDateTime').value = data.startDateTime;
            }
            if (data.endDateTime && document.getElementById('endDateTime')) {
                document.getElementById('endDateTime').value = data.endDateTime;
            }
            if (data.category && document.getElementById('category')) {
                document.getElementById('category').value = data.category;
            }
            if (data.venueName && document.getElementById('venueName')) {
                document.getElementById('venueName').value = data.venueName;
            }
            if (data.eventLink && document.getElementById('eventLink')) {
                document.getElementById('eventLink').value = data.eventLink;
            }
            
            // Restaurar cor de fundo
            if (data.corFundo) {
                const corFundo = document.getElementById('corFundo');
                const corFundoHex = document.getElementById('corFundoHex');
                const colorPreview = document.getElementById('colorPreview');
                if (corFundo) corFundo.value = data.corFundo;
                if (corFundoHex) corFundoHex.value = data.corFundo;
                if (colorPreview) colorPreview.style.backgroundColor = data.corFundo;
            }
            
            // Restaurar campos de endere�o
            if (data.addressSearch) {
                const addressSearchField = document.getElementById('addressSearch');
                if (addressSearchField) addressSearchField.value = data.addressSearch;
            }
            
            ['street', 'number', 'complement', 'neighborhood', 'city', 'state', 'cep'].forEach(fieldId => {
                if (data[fieldId] && document.getElementById(fieldId)) {
                    document.getElementById(fieldId).value = data[fieldId];
                }
            });
            
            // Restaurar switch de localiza��o
            if (data.isPresential !== undefined) {
                const locationSwitch = document.getElementById('locationTypeSwitch');
                const presential = document.getElementById('presentialLocation');
                const online = document.getElementById('onlineLocation');
                
                if (locationSwitch) {
                    if (data.isPresential) {
                        locationSwitch.classList.add('active');
                        if (presential) presential.classList.add('show');
                        if (online) online.classList.remove('show');
                    } else {
                        locationSwitch.classList.remove('active');
                        if (presential) presential.classList.remove('show');
                        if (online) online.classList.add('show');
                    }
                }
            }
            
            // Restaurar dados do produtor
            if (data.producer && document.getElementById('producer')) {
                document.getElementById('producer').value = data.producer;
                // Mostrar campos se for novo produtor
                if (data.producer === 'new') {
                    const newProducerFields = document.getElementById('newProducerFields');
                    if (newProducerFields) newProducerFields.classList.add('show');
                }
            }
            if (data.producerName && document.getElementById('producerName')) {
                document.getElementById('producerName').value = data.producerName;
            }
            if (data.displayName && document.getElementById('displayName')) {
                document.getElementById('displayName').value = data.displayName;
            }
            if (data.producerDescription && document.getElementById('producerDescription')) {
                document.getElementById('producerDescription').value = data.producerDescription;
            }
            
            // Restaurar termos e visibilidade
            if (data.termsAccepted) {
                const termsCheckbox = document.getElementById('termsCheckbox');
                if (termsCheckbox) termsCheckbox.classList.add('checked');
            }
            if (data.visibility) {
                const radioButtons = document.querySelectorAll('.radio[data-value]');
                radioButtons.forEach(radio => {
                    if (radio.dataset.value === data.visibility) {
                        radio.classList.add('checked');
                    } else {
                        radio.classList.remove('checked');
                    }
                });
            }
            
            // Restaurar lotes
            if (data.lotes) {
                // Salvar lotes no cookie para que o m�dulo de lotes possa carregar
                setCookie('lotesData', JSON.stringify(data.lotes), 7);
                // Chamar fun��o para carregar lotes
                if (typeof carregarLotesDoCookie === 'function') {
                    setTimeout(() => carregarLotesDoCookie(), 100);
                }
            }
            
            // Restaurar lotes completos se existirem
            if (data.lotesCompletos && window.restaurarLotesCompletos) {
                setTimeout(() => window.restaurarLotesCompletos(data.lotesCompletos), 200);
            }
            
            // Restaurar ingressos
            if (data.tickets && data.tickets.length > 0) {
                console.log('📋 Restaurando ingressos usando MESMA rotina das atualizações:', data.tickets.length);
                
                // Limpar lista atual
                const ticketList = document.getElementById('ticketList');
                if (ticketList) ticketList.innerHTML = '';
                
                // Restaurar cada ingresso usando a MESMA FUNÇÃO das atualizações
                data.tickets.forEach((ticket, index) => {
                    console.log(`🎫 Restaurando ingresso ${index + 1}:`, ticket);
                    
                    // Mapear dados para os parâmetros que addTicketToList() espera
                    const type = ticket.tipo || ticket.type || 'paid';
                    const title = ticket.titulo || ticket.title || '';
                    const quantity = parseInt(ticket.quantidade || ticket.quantity) || 0;
                    const price = type === 'paid' ? 
                        `R$ ${(parseFloat(ticket.preco || ticket.price) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 
                        'Gratuito';
                    const loteId = ticket.loteId || '';
                    const description = ticket.descricao || ticket.description || '';
                    const saleStart = ticket.inicio_venda || ticket.saleStart || '';
                    const saleEnd = ticket.fim_venda || ticket.saleEnd || '';
                    const minQuantity = parseInt(ticket.limite_min || ticket.minQuantity) || 1;
                    const maxQuantity = parseInt(ticket.limite_max || ticket.maxQuantity) || 5;
                    
                    // USAR A MESMA FUNÇÃO que as atualizações usam!
                    if (typeof addTicketToList === 'function') {
                        addTicketToList(type, title, quantity, price, loteId, description, saleStart, saleEnd, minQuantity, maxQuantity);
                        
                        // Após adicionar, corrigir o ID para usar o ID real se disponível
                        const elementos = document.querySelectorAll('.ticket-item');
                        const ultimoElemento = elementos[elementos.length - 1];
                        if (ultimoElemento && ticket.id) {
                            // Corrigir dataset para usar ID real
                            ultimoElemento.dataset.ticketId = ticket.id;
                            
                            // Corrigir botões para usar ID real
                            const editBtn = ultimoElemento.querySelector('button[onclick*="editTicket"]');
                            const removeBtn = ultimoElemento.querySelector('button[onclick*="removeTicket"]');
                            if (editBtn) {
                                editBtn.setAttribute('onclick', `editTicket(${ticket.id})`);
                            }
                            if (removeBtn) {
                                removeBtn.setAttribute('onclick', `removeTicket(${ticket.id})`);
                            }
                            
                            // Armazenar dados completos do banco no elemento
                            ultimoElemento.ticketData = {
                                ...ticket,
                                id: ticket.id,
                                type: type,
                                title: title,
                                quantity: quantity,
                                price: parseFloat(ticket.preco || ticket.price) || 0,
                                description: description,
                                saleStart: saleStart,
                                saleEnd: saleEnd,
                                minQuantity: minQuantity,
                                maxQuantity: maxQuantity,
                                loteId: loteId,
                                isFromDatabase: true
                            };
                        }
                    } else {
                        console.error('❌ Função addTicketToList não encontrada');
                    }
                });
                
                console.log('✅ Ingressos restaurados usando MESMA rotina das atualizações');
            }
            
            // Restaurar ingressos completos se existirem - DESABILITADO: Usava renderização diferente
            // if (data.ingressosCompletos && window.restaurarIngressosCompletos) {
            //     setTimeout(() => window.restaurarIngressosCompletos(data.ingressosCompletos), 300);
            // }
            
            // AJUSTE: Sempre ir para etapa 1 ao recuperar rascunho
            console.log('📝 Rascunho recuperado - sempre iniciando na etapa 1');
            setTimeout(() => goToStep(1), 200);
            
            // Atualizar preview
            setTimeout(() => updatePreview(), 300);
            
            // CORREÇÃO: Carregar lotes do banco com múltiplas tentativas
            const tentarCarregarLotes = (tentativa = 1, maxTentativas = 3) => {
                if (typeof window.carregarLotesDoBanco === 'function') {
                    console.log(`📊 Tentativa ${tentativa} de carregar lotes do banco...`);
                    window.carregarLotesDoBanco()
                        .then(() => {
                            console.log('✅ Lotes carregados com sucesso!');
                            // Forçar renderização se existir
                            if (typeof window.renderizarLotesNaInterface === 'function') {
                                window.renderizarLotesNaInterface();
                            }
                        })
                        .catch(error => {
                            console.warn(`⚠️ Tentativa ${tentativa} falhou:`, error);
                            if (tentativa < maxTentativas) {
                                setTimeout(() => tentarCarregarLotes(tentativa + 1, maxTentativas), 2000);
                            }
                        });
                } else if (tentativa < maxTentativas) {
                    console.log('⚠️ Função carregarLotesDoBanco não disponível, tentando novamente...');
                    setTimeout(() => tentarCarregarLotes(tentativa + 1, maxTentativas), 1000);
                }
            };
            
            // Iniciar tentativas após 1 segundo
            setTimeout(() => tentarCarregarLotes(), 1000);
            
        }

        // Adicionar salvamento autom�tico ao mudar de step - MOVIDO PARA O FINAL DO ARQUIVO
        
        // Tornar validateStep global para debug
        window.validateStep = validateStep;
        console.log('? validateStep exposta globalmente:', typeof window.validateStep);

        function initPreviewListeners() {
            const fields = ['eventName', 'startDateTime', 'endDateTime', 'category', 'venueName', 'eventLink'];
            
            fields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.addEventListener('input', updatePreview);
                    field.addEventListener('change', () => {
                        updatePreview();
                        // saveWizardData() removido // Salvar ao mudar qualquer campo
                    });
                }
            });
            
            // Adicionar listener para descri��o tamb�m
            const eventDescription = document.getElementById('eventDescription');
            if (eventDescription) {
                eventDescription.addEventListener('input', () => {
                    updatePreview();
                    // saveWizardData() removido
                });
                // Tamb�m salvar ao perder o foco
                eventDescription.addEventListener('blur', () => {
                    // saveWizardData() removido
                });
            }
        }

        // [Incluir todas as demais fun�ões necess�rias do arquivo original]

        window.initMap = initMap;

        // =====================================================
        // CONFIGURAÇÃO PARA API PHP - ANYSUMMIT
        // =====================================================

        const API_CONFIG = {
            baseUrl: 'https://anysummit.com.br/produtor/criaeventoapi.php',
            endpoints: {
                createEvent: '',
            },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        // [Incluir todas as fun�ões da API do arquivo original]

        function obterValorRadioSelecionado() {
            const radios = document.querySelectorAll('.radio.checked');
            if (radios.length > 0) {
                return radios[0].dataset.value || 'public';
            }
            return 'public';
        }

        function criarNotificacao(titulo, mensagem, tipo = 'info') {
            const notification = document.createElement('div');
            notification.className = `notificacao ${tipo}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem;
                border-radius: 8px;
                background-color: ${tipo === 'success' ? '#10B981' : (tipo === 'error' ? '#EF4444' : '#3B82F6')};
                color: white;
                font-weight: bold;
                z-index: 3000;
                max-width: 400px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            `;
            notification.innerHTML = `<strong>${titulo}</strong><br>${mensagem}`;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 5000);
            
            return notification;
        }

        // [Incluir todas as demais fun�ões necess�rias...]

        async function enviarEventoParaAPI() {
            try {
                console.log('🚀 Enviando evento para PHP...');
                
                // DEBUG - verificar ingressos antes de coletar
                debugarDadosIngressos();
                
                // 1. Coletar dados (incluindo imagem base64)
                const dados = coletarDadosFormulario();
                
                // 2. Validar
                const validacao = validarDadosObrigatorios(dados);
                if (!validacao.valido) {
                    alert('Erro de valida��o:\n' + validacao.erros.join('\n'));
                    return false;
                }
                
                // 3. Debug - ver dados que ser�o enviados
                console.log('📋 Dados completos:', dados);
                console.log('📋 Ingressos espec�ficos:', dados.ingressos);
                
                // 4. Enviar TUDO para o PHP com configura��o correta
                const response = await fetch(API_CONFIG.baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(dados),
                    mode: 'cors'
                });
                
                // 5. Verificar se a resposta � JSON v�lida
                let resultado;
                try {
                    resultado = await response.json();
                } catch (jsonError) {
                    const textResponse = await response.text();
                    console.error('❌ Resposta n�o � JSON v�lida:', textResponse);
                    throw new Error('Resposta inv�lida do servidor: ' + textResponse);
                }
                
                // 6. Processar resposta
                if (!response.ok || !resultado.success) {
                    throw new Error(resultado.message || `Erro HTTP: ${response.status}`);
                }
                
                console.log('✅ Sucesso:', resultado);
                mostrarSucesso(resultado.data);
                return true;
                
            } catch (error) {
                console.error('❌ Erro completo:', error);
                mostrarErro(error.message);
                return false;
            }
        }

        // =====================================================
        // VALIDAÇÃO DE DADOS
        // =====================================================

        function validarDadosObrigatorios(dados) {
            const erros = [];
            
            // Validar nome do evento
            if (!dados.evento.nome || dados.evento.nome.trim() === '') {
                erros.push('Nome do evento � obrigat�rio');
            }
            
            // Validar data de in�cio
            if (!dados.evento.data_inicio) {
                erros.push('Data e hora de in�cio s�o obrigat�rias');
            }
            
            // Validar localiza��o
            if (dados.evento.tipo_local === 'presencial') {
                if (!dados.evento.busca_endereco || dados.evento.busca_endereco.trim() === '') {
                    erros.push('Endere�o � obrigat�rio para eventos presenciais');
                }
            } else if (dados.evento.tipo_local === 'online') {
                if (!dados.evento.link_online || dados.evento.link_online.trim() === '') {
                    erros.push('Link do evento � obrigat�rio para eventos online');
                }
            }
            
            // Validar termos
            if (!dados.evento.termos_aceitos) {
                erros.push('É necess�rio aceitar os termos de uso');
            }
            
            return {
                valido: erros.length === 0,
                erros: erros
            };
        }

        // =====================================================
        // COLETA DE DADOS DO FORMULÁRIO
        // =====================================================

        function obterImagemBase64(elementId) {
            return new Promise((resolve) => {
                let imagePreview;
                let inputFile;
                
                // Determinar elementos baseado no ID
                switch(elementId) {
                    case 'logo':
                        imagePreview = document.querySelector('#logoPreviewContainer img');
                        inputFile = document.getElementById('logoUpload');
                        break;
                    case 'capa':
                        imagePreview = document.querySelector('#capaPreviewContainer img');
                        inputFile = document.getElementById('capaUpload');
                        break;
                    case 'fundo':
                        imagePreview = document.querySelector('#fundoPreviewContainer img');
                        inputFile = document.getElementById('fundoUpload');
                        break;
                    default:
                        // Para compatibilidade com c�digo antigo
                        imagePreview = document.getElementById('imagePreview');
                        inputFile = document.getElementById('imageUpload');
                }
                
                // Se j� tem preview, usar essa imagem
                if (imagePreview && imagePreview.src && !imagePreview.src.includes('placeholder')) {
                    resolve(imagePreview.src);
                    return;
                }
                
                // Sen�o, tentar do input file
                const imageFile = inputFile?.files[0];
                
                if (!imageFile) {
                    resolve(''); // Sem imagem
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    resolve(e.target.result); // base64
                };
                reader.onerror = function() {
                    resolve(''); // Em caso de erro
                };
                reader.readAsDataURL(imageFile);
            });
        }

        function coletarDadosFormulario() {
            console.log('📋 Coletando dados do formul�rio...');
            
            // 1. INFORMAÇÕES BÁSICAS (incluindo imagem)
            const informacoesBasicas = {
                nome: document.getElementById('eventName')?.value || '',
                classificacao: document.getElementById('classification')?.value || '',
                categoria: document.getElementById('category')?.value || ''
            };
            
            // 2. DATA E HORÁRIO
            const dataHorario = {
                data_inicio: document.getElementById('startDateTime')?.value || '',
                data_fim: document.getElementById('endDateTime')?.value || '',
                evento_multiplos_dias: document.getElementById('multiDaySwitch')?.classList.contains('active') || false
            };
            
            // 3. DESCRIÇÃO
            const descricao = {
                descricao_completa: document.getElementById('eventDescription')?.innerHTML || '',
                descricao_texto: document.getElementById('eventDescription')?.textContent || ''
            };
            
            // 4. LOCALIZAÇÃO
            const isPresencial = document.getElementById('locationTypeSwitch')?.classList.contains('active');
            const localizacao = {
                tipo_local: isPresencial ? 'presencial' : 'online',
                // Dados presenciais
                busca_endereco: (function() {
                    // Construir endere�o completo a partir dos campos
                    const rua = document.getElementById('street')?.value || '';
                    const numero = document.getElementById('number')?.value || '';
                    const bairro = document.getElementById('neighborhood')?.value || '';
                    const cidade = document.getElementById('city')?.value || '';
                    const estado = document.getElementById('state')?.value || '';
                    
                    // Se n�o tiver pelo menos rua e cidade, pegar do campo de busca se existir
                    if (!rua && !cidade) {
                        return document.getElementById('addressSearch')?.value || '';
                    }
                    
                    // Montar endere�o completo
                    let endereco = rua;
                    if (numero) endereco += `, ${numero}`;
                    if (bairro) endereco += ` - ${bairro}`;
                    if (cidade) endereco += `, ${cidade}`;
                    if (estado) endereco += ` - ${estado}`;
                    
                    return endereco.trim();
                })(),
                nome_local: document.getElementById('venueName')?.value || '',
                cep: document.getElementById('cep')?.value || '',
                rua: document.getElementById('street')?.value || '',
                numero: document.getElementById('number')?.value || '',
                complemento: document.getElementById('complement')?.value || '',
                bairro: document.getElementById('neighborhood')?.value || '',
                cidade: document.getElementById('city')?.value || '',
                estado: document.getElementById('state')?.value || '',
                latitude: document.getElementById('latitude')?.value || null,
                longitude: document.getElementById('longitude')?.value || null,
                // Dados online
                link_online: document.getElementById('eventLink')?.value || ''
            };
            
            // 5. SOBRE O PRODUTOR
            const isNovoProdutor = document.getElementById('producer')?.value === 'new';
            const produtor = {
                tipo_produtor: isNovoProdutor ? 'novo' : 'atual',
                nome_produtor: isNovoProdutor ? document.getElementById('producerName')?.value || '' : '',
                nome_exibicao: isNovoProdutor ? document.getElementById('displayName')?.value || '' : '',
                descricao_produtor: isNovoProdutor ? document.getElementById('producerDescription')?.value || '' : ''
            };
            
            // 6. CONFIGURAÇÕES FINAIS
            const configuracoes = {
                visibilidade: obterValorRadioSelecionado() || 'public',
                termos_aceitos: document.getElementById('termsCheckbox')?.classList.contains('checked') || false
            };
            
            // 7. INGRESSOS
            const ingressos = coletarDadosIngressos();
            
            // DADOS COMPLETOS
            const dadosCompletos = {
                evento: {
                    ...informacoesBasicas,
                    ...dataHorario,
                    ...descricao,
                    ...localizacao,
                    ...produtor,
                    ...configuracoes
                },
                ingressos: ingressos
            };
            
            console.log('✅ Dados coletados para PHP:', dadosCompletos);
            return dadosCompletos;
        }

        function coletarDadosIngressos() {
            const ingressos = [];
            const ticketItems = document.querySelectorAll('.ticket-item');
            
            console.log('🎟️ Coletando', ticketItems.length, 'ingressos...');
            
            ticketItems.forEach((item, index) => {
                // Coletar dados do header
                const ticketName = item.querySelector('.ticket-name')?.textContent?.trim() || `Ingresso ${index + 1}`;
                const buyerPriceText = item.querySelector('.ticket-buyer-price')?.textContent || '';
                const receivePriceText = item.querySelector('.ticket-receive-amount')?.textContent || '';
                
                // Coletar dados dos detalhes
                const detailValues = item.querySelectorAll('.ticket-detail-value');
                const quantidade = detailValues[0]?.textContent?.trim() || '1';
                const taxaText = detailValues[1]?.textContent?.trim() || '0';
                const statusText = detailValues[2]?.textContent?.trim() || 'Ativo';
                
                // Determinar tipo e valores
                let tipo = 'gratuito';
                let valorComprador = 0;
                let valorReceber = 0;
                let taxaPlataforma = 0;
                let conteudoCombo = null;
                
                // Verificar se � combo
                if (ticketName.includes('📦') || item.dataset.comboData) {
                    tipo = 'combo';
                    
                    // Extrair valor do combo
                    const comboMatch = buyerPriceText.match(/R\$\s*([\d,.]+)/);
                    if (comboMatch) {
                        valorComprador = parseFloat(comboMatch[1].replace(/\./g, '').replace(',', '.'));
                        taxaPlataforma = valorComprador * 0.1;
                        valorReceber = valorComprador - taxaPlataforma;
                    }
                    
                    // Extrair dados do combo
                    if (item.dataset.comboData) {
                        conteudoCombo = JSON.parse(item.dataset.comboData);
                    }
                    
                } else if (buyerPriceText.includes('R$')) {
                    tipo = 'pago';
                    
                    // Extrair valor do comprador
                    const buyerMatch = buyerPriceText.match(/R\$\s*([\d,.]+)/);
                    if (buyerMatch) {
                        valorComprador = parseFloat(buyerMatch[1].replace(/\./g, '').replace(',', '.'));
                        taxaPlataforma = valorComprador * 0.1; // 10% de taxa
                        valorReceber = valorComprador - taxaPlataforma;
                    }
                    
                    // Extrair valor a receber (se j� estiver calculado)
                    const receiveMatch = receivePriceText.match(/R\$\s*([\d,.]+)/);
                    if (receiveMatch) {
                        valorReceber = parseFloat(receiveMatch[1].replace(/\./g, '').replace(',', '.'));
                    }
                } else if (buyerPriceText.includes('c�digo') || ticketName.toLowerCase().includes('c�digo')) {
                    tipo = 'codigo';
                }
                
                // Verificar se est� ativo
                const switchElement = item.querySelector('.switch-mini');
                const ativo = switchElement ? switchElement.classList.contains('active') : true;
                
                // Datas padr�o (você pode melhorar isso coletando as datas reais dos modais)
                const agora = new Date();
                const inicioVenda = agora.toISOString().slice(0, 16);
                const fimVenda = new Date(agora.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 16);
                
                const ingresso = {
                    tipo: tipo,
                    titulo: ticketName.replace(' ??', ''), // Remover emoji do combo
                    descricao: '',
                    quantidade_total: parseInt(quantidade) || 1,
                    preco: valorComprador,
                    valor_receber: valorReceber,
                    taxa_plataforma: taxaPlataforma,
                    inicio_venda: inicioVenda,
                    fim_venda: fimVenda,
                    limite_min: 1,
                    limite_max: 10,
                    ativo: ativo,
                    posicao_ordem: index + 1
                };
                
                // Adicionar conteudo_combo apenas para combos
                if (conteudoCombo) {
                    ingresso.conteudo_combo = conteudoCombo;
                }
                
                console.log(`??� Ingresso ${index + 1}:`, ingresso);
                ingressos.push(ingresso);
            });
            
            console.log('✅ Total de ingressos coletados:', ingressos.length);
            return ingressos;
        }

        function debugarDadosIngressos() {
            const ticketItems = document.querySelectorAll('.ticket-item');
            
            console.log('🔍 DEBUG - Elementos encontrados:', ticketItems.length);
            
            ticketItems.forEach((item, index) => {
                console.log(`--- Ingresso ${index + 1} ---`);
                console.log('Nome:', item.querySelector('.ticket-name')?.textContent);
                console.log('Valor comprador:', item.querySelector('.ticket-buyer-price')?.textContent);
                console.log('Valor recebe:', item.querySelector('.ticket-receive-amount')?.textContent);
                
                const detailValues = item.querySelectorAll('.ticket-detail-value');
                console.log('Quantidade:', detailValues[0]?.textContent);
                console.log('Taxa:', detailValues[1]?.textContent);
                console.log('Status:', detailValues[2]?.textContent);
                
                const switchEl = item.querySelector('.switch-mini');
                console.log('Switch ativo:', switchEl?.classList.contains('active'));
            });
        }

        // =====================================================
        // FEEDBACK VISUAL
        // =====================================================

        function mostrarSucesso(dados) {
            const publishBtn = document.querySelector('.btn-publish');
            if (publishBtn) {
                publishBtn.textContent = '✅ Evento Criado!';
                publishBtn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
            }

            const eventoId = dados?.evento_id || dados?.id || 'N/A';
            const mensagem = dados?.message || 'Evento registrado.';

            criarNotificacao(
                '🎉 Evento criado com sucesso!',
                `ID do evento: ${eventoId}<br>${mensagem}`,
                'success'
            );

            setTimeout(() => {
                // Redirecionar para p�gina de evento publicado
                if (eventoId && eventoId !== 'N/A') {
                    window.location = `/produtor/evento-publicado.php?eventoid=${eventoId}&novo=1`;
                } else {
                    window.location = "/produtor/meuseventos.php";
                }
            }, 2000);
        }

        function mostrarErro(mensagem) {
            const publishBtn = document.querySelector('.btn-publish');
            if (publishBtn) {
                publishBtn.textContent = '✓ Publicar evento';
                publishBtn.disabled = false;
                publishBtn.style.background = '';
            }
            
            criarNotificacao(
                '❌ Erro ao criar evento',
                mensagem,
                'error'
            );
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // =====================================================
        // INICIALIZAÇÃO DO FORMULÁRIO
        // =====================================================

        function initFormSubmission() {
            // J� est� implementada no c�digo acima, n�o precisa duplicar
        }

        // =====================================================
        // FUNÇÕES DE BUSCA DE ENDEREÇO
        // =====================================================

        function initAddressSearch() {
            const addressSearch = document.getElementById('addressSearch');
            const addressSuggestions = document.getElementById('addressSuggestions');
            
            if (!addressSearch || !addressSuggestions) {
                console.log('❌ Elementos de busca n�o encontrados');
                return;
            }
            
            console.log('🔍 Inicializando busca de endere�os...');
            
            let searchTimeout;

            addressSearch.addEventListener('input', function() {
                const query = this.value.trim();
                
                clearTimeout(searchTimeout);
                
                if (query.length < 3) {
                    addressSuggestions.style.display = 'none';
                    return;
                }

                searchTimeout = setTimeout(() => {
                    searchAddresses(query);
                }, 500);
            });

            document.addEventListener('click', function(e) {
                if (!addressSearch.contains(e.target) && !addressSuggestions.contains(e.target)) {
                    addressSuggestions.style.display = 'none';
                }
            });

            console.log('✅ Busca de endere�os inicializada');
        }

        function searchAddresses(query) {
            console.log('🔍 Buscando endere�os para:', query);
            
            const addressSuggestions = document.getElementById('addressSuggestions');
            
            if (typeof google !== 'undefined' && google.maps && google.maps.places && autocompleteService) {
                console.log('🌐 Usando Google Places API...');
                
                const request = {
                    input: query,
                    componentRestrictions: { country: 'br' },
                    types: ['establishment', 'geocode']
                };

                autocompleteService.getPlacePredictions(request, function(predictions, status) {
                    console.log('📡 Resposta da API:', status, predictions?.length || 0, 'resultados');
                    
                    if (status === google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
                        displayAddressSuggestions(predictions);
                    } else {
                        console.log('⚠️ Sem resultados da API');
                        addressSuggestions.innerHTML = '<div class="no-results">Nenhum endereço encontrado</div>';
                        addressSuggestions.style.display = 'block';
                    }
                });
            } else {
                console.log('⚠️ Google Places API não disponível');
                addressSuggestions.innerHTML = '<div class="no-results">Serviço de busca indisponível</div>';
                addressSuggestions.style.display = 'block';
            }
        }

        function displayAddressSuggestions(results) {
            const addressSuggestions = document.getElementById('addressSuggestions');
            if (!addressSuggestions) return;
            
            console.log('📋 Exibindo', results.length, 'sugestões');
            
            addressSuggestions.innerHTML = '';
            
            if (results.length === 0) {
                addressSuggestions.style.display = 'none';
                return;
            }

            results.forEach(result => {
                const suggestion = document.createElement('div');
                suggestion.className = 'address-suggestion';
                
                suggestion.innerHTML = `
                    <div class="address-suggestion-main">${result.structured_formatting?.main_text || result.description}</div>
                    <div class="address-suggestion-secondary">${result.structured_formatting?.secondary_text || ''}</div>
                `;
                
                suggestion.addEventListener('click', () => selectAddress(result));
                addressSuggestions.appendChild(suggestion);
            });

            addressSuggestions.style.display = 'block';
        }

        function selectAddress(address) {
            console.log('??� Endere�o selecionado:', address.description);
            
            const addressSearch = document.getElementById('addressSearch');
            const addressSuggestions = document.getElementById('addressSuggestions');
            
            if (addressSearch) {
                addressSearch.value = address.description;
            }
            if (addressSuggestions) {
                addressSuggestions.style.display = 'none';
            }
            
            if (address.place_id.startsWith('mock_')) {
                console.log('🎭 Usando dados simulados');
                fillMockAddressData(address.place_id);
            } else if (typeof google !== 'undefined' && google.maps && placesService) {
                console.log('🌐 Buscando detalhes na API...');
                getPlaceDetails(address.place_id);
            } else {
                console.log('⚠️ API n�o dispon�vel, usando simula��o');
                fillMockAddressData('mock_default');
            }
        }

        function getPlaceDetails(placeId) {
            const request = {
                placeId: placeId,
                fields: ['address_components', 'geometry', 'name']
            };

            placesService.getDetails(request, function(place, status) {
                console.log('📡 Detalhes do local:', status, place);
                
                if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                    fillAddressFields(place);
                    updateMapLocation(place.geometry.location);
                } else {
                    console.log('❌ Erro ao obter detalhes, usando simula��o');
                    fillMockAddressData('api_error');
                }
            });
        }

        function fillAddressFields(place) {
            console.log('??� Preenchendo campos com dados da API');
            
            const components = place.address_components || [];
            const fields = {
                cep: '',
                street: '',
                number: '',
                neighborhood: '',
                city: '',
                state: ''
            };

            components.forEach(component => {
                const types = component.types;
                
                if (types.includes('postal_code')) {
                    fields.cep = component.long_name;
                } else if (types.includes('route')) {
                    fields.street = component.long_name;
                } else if (types.includes('street_number')) {
                    fields.number = component.long_name;
                } else if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
                    fields.neighborhood = component.long_name;
                } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                    fields.city = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                    fields.state = component.short_name;
                }
            });

            updateFormFields(fields);
        }

        function fillMockAddressData(mockType) {
            console.log('🎭 Preenchendo com dados simulados:', mockType);
            
            let fields = {
                cep: '01310-100',
                street: 'Avenida Paulista',
                number: '1000',
                neighborhood: 'Bela Vista',
                city: 'S�o Paulo',
                state: 'SP'
            };

            if (mockType.includes('rj')) {
                fields = {
                    cep: '22071-900',
                    street: 'Avenida Atlântica',
                    number: '500',
                    neighborhood: 'Copacabana',
                    city: 'Rio de Janeiro',
                    state: 'RJ'
                };
            } else if (mockType.includes('mg')) {
                fields = {
                    cep: '30112-000',
                    street: 'Avenida Afonso Pena',
                    number: '800',
                    neighborhood: 'Centro',
                    city: 'Belo Horizonte',
                    state: 'MG'
                };
            }

            updateFormFields(fields);
            
            if (map) {
                const mockLocation = { lat: -23.550520, lng: -46.633308 };
                updateMapLocation(mockLocation);
            }
        }

        function updateFormFields(fields) {
            console.log('✏️ Atualizando campos:', fields);
            
            // AJUSTE: Limpar campo "Nome do Local" ao selecionar novo endereço
            const venueNameField = document.getElementById('venueName');
            if (venueNameField) {
                venueNameField.value = '';
                console.log('🗑️ Campo "Nome do Local" limpo');
            }
            
            Object.keys(fields).forEach(key => {
                const field = document.getElementById(key);
                if (field && fields[key]) {
                    field.value = fields[key];
                    console.log(`  ✅ ${key}: ${fields[key]}`);
                }
            });

            updatePreview();
        }

        function updateMapLocation(location) {
            if (!map || !location) {
                console.log('⚠️ Mapa ou localiza��o n�o dispon�vel');
                return;
            }


            console.log('🗺️ Atualizando mapa:', location);

            map.setCenter(location);
            map.setZoom(16);

            if (marker) {
                marker.setMap(null);
            }

            marker = new google.maps.Marker({
                position: location,
                map: map,
                title: 'Local do evento',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#725EFF',
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: '#00C2FF'
                }
            });

            console.log('✅ Mapa atualizado com sucesso');
        }

        // =====================================================
        // FUNÇÕES DE INGRESSOS
        // =====================================================

        function formatCurrency(input) {
            let value = input.value.replace(/\D/g, '');
            
            if (value === '') {
                input.value = 'R$ 0,00';
                return;
            }
            
            value = parseInt(value) / 100;
            
            input.value = 'R$ ' + value.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        function calculateReceiveAmount(inputValue) {
            const cleanValue = inputValue.replace(/[R$\s\.]/g, '').replace(',', '.');
            const numericValue = parseFloat(cleanValue);
            
            if (isNaN(numericValue)) return 'R$ 0,00';
            
            const receiveValue = numericValue * 0.9;
            
            return 'R$ ' + receiveValue.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        function initPriceInput() {
            const priceInput = document.getElementById('paidTicketPrice');
            const receiveInput = document.getElementById('paidTicketReceive');
            
            if (!priceInput || !receiveInput) return;
            
            priceInput.value = 'R$ 0,00';
            receiveInput.value = 'R$ 0,00';
            
            priceInput.addEventListener('input', function() {
                formatCurrency(this);
                
                const receiveAmount = calculateReceiveAmount(this.value);
                receiveInput.value = receiveAmount;
                
                const smallText = receiveInput.nextElementSibling;
                if (smallText && smallText.tagName === 'SMALL') {
                    smallText.textContent = receiveAmount;
                    smallText.style.color = '#10B981';
                }
            });
            
            priceInput.addEventListener('blur', function() {
                if (this.value === 'R$ ' || this.value === '') {
                    this.value = 'R$ 0,00';
                    receiveInput.value = 'R$ 0,00';
                }
            });
            
            priceInput.addEventListener('focus', function() {
                if (this.value === 'R$ 0,00') {
                    this.value = 'R$ ';
                }
            });
        }

        function initMiniSwitches() {
            document.querySelectorAll('.switch-mini').forEach(switchEl => {
                switchEl.addEventListener('click', function() {
                    this.classList.toggle('active');
                    
                    const ticketItem = this.closest('.ticket-item');
                    const statusElement = ticketItem.querySelector('.ticket-detail-value[style*="color: #10B981"]');
                    if (statusElement) {
                        if (this.classList.contains('active')) {
                            statusElement.textContent = 'Ativo';
                            statusElement.style.color = '#10B981';
                        } else {
                            statusElement.textContent = 'Inativo';
                            statusElement.style.color = '#EF4444';
                        }
                    }
                });
            });
        }

        function addTicketToList(type, title, quantity, price, loteId = '', description = '', saleStart = '', saleEnd = '', minQuantity = 1, maxQuantity = 5) {
            ticketCount++;
            const ticketList = document.getElementById('ticketList');
            if (!ticketList) return;

            const ticketItem = document.createElement('div');
            ticketItem.className = 'ticket-item';
            ticketItem.dataset.ticketId = ticketCount;
            
            // IMPORTANTE: Adicionar o loteId ao dataset
            if (loteId) {
                ticketItem.dataset.loteId = loteId;
            }
            
            const buyerPrice = type === 'paid' ? price : 'Gratuito';
            const cleanPrice = type === 'paid' ? parseFloat(price.replace(/[R$\s\.]/g, '').replace(',', '.')) : 0;
            const tax = type === 'paid' ? cleanPrice * 0.08 : 0; // Corrigido para 8%
            const receiveAmount = type === 'paid' ? cleanPrice - tax : 0; // Corrigido o cálculo
            
            const taxFormatted = type === 'paid' ? `R$ ${tax.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'R$ 0,00';
            const receiveFormatted = type === 'paid' ? `R$ ${receiveAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'Gratuito';
            
            // Obter informações do lote se existir
            let loteInfo = null;
            if (loteId) {
                // Buscar nome do lote nos selects disponíveis
                const selects = ['paidTicketLote', 'freeTicketLote', 'comboTicketLote'];
                for (const selectId of selects) {
                    const select = document.getElementById(selectId);
                    if (select) {
                        const option = select.querySelector(`option[value="${loteId}"]`);
                        if (option && option.textContent !== 'Selecione um lote') {
                            loteInfo = { nome: option.textContent };
                            break;
                        }
                    }
                }
            }
            
            ticketItem.innerHTML = `
                <div class="ticket-header">
                    <div class="ticket-title">
                        <span class="ticket-name">${title}</span>
                        <span class="ticket-type-badge ${type === 'paid' ? 'pago' : 'gratuito'}">
                            (${type === 'paid' ? 'Pago' : 'Gratuito'})
                        </span>
                        ${loteInfo ? `<span class="ticket-lote-info" style="font-size: 11px; color: #666; margin-left: 10px;">${loteInfo.nome}</span>` : ''}
                    </div>
                    <div class="ticket-actions">
                        <button class="btn-icon" onClick="editTicket(${ticketCount})" title="Editar">✏️</button>
                        <button class="btn-icon" onClick="removeTicket(${ticketCount})" title="Remover">🗑️</button>
                    </div>
                </div>
                <div class="ticket-details">
                    <div class="ticket-info">
                        ${type === 'combo' ? '' : (quantity > 0 ? `<span>Quantidade Limite a Venda: <strong>${quantity}</strong></span>` : '')}
                        ${type === 'paid' ? `<span>Preço: <strong class="ticket-buyer-price">${buyerPrice}</strong></span>` : '<span class="ticket-buyer-price">Gratuito</span>'}
                        <span>Taxa: <strong>${taxFormatted}</strong></span>
                        <span>Você recebe: <strong>${receiveFormatted}</strong></span>
                    </div>
                    ${description ? `<div class="ticket-description" style="margin-top: 8px; font-size: 12px; color: #666;">${description}</div>` : ''}
                </div>
            `;
            
            ticketList.appendChild(ticketItem);
            
            // Armazenar dados do ingresso para edi��o
            ticketItem.ticketData = {
                type: type,
                title: title,
                quantity: quantity,
                price: type === 'paid' ? cleanPrice : 0,
                description: description,
                saleStart: saleStart,
                saleEnd: saleEnd,
                minQuantity: minQuantity,
                maxQuantity: maxQuantity,
                loteId: loteId
            };
            
            // Salvar na sess�o
            // saveWizardData() removido
        }

        function removeTicket(ticketId) {
            // Verificar se o ingresso est� em algum combo
            if (verificarIngressoEmCombo(ticketId)) {
                alert('N�o � poss�vel excluir este ingresso pois ele est� sendo usado em um combo. Remova-o do combo primeiro.');
                return;
            }
            
            if (confirm('Tem certeza que deseja excluir este ingresso?')) {
                const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
                if (ticketElement) {
                    ticketElement.remove();
                    
                    // Remover tamb�m de temporaryTickets se existir
                    if (window.temporaryTickets && window.temporaryTickets.tickets) {
                        window.temporaryTickets.tickets = window.temporaryTickets.tickets.filter(
                            ticket => ticket.id !== ticketId
                        );
                    }
                    
                    // Salvar ap�s remover
                    // saveWizardData() removido
                }
            }
        }
        
        // Fun��o para verificar se ingresso est� em combo
        function verificarIngressoEmCombo(ticketId) {
            // Verificar em temporaryTickets
            if (window.temporaryTickets && window.temporaryTickets.tickets) {
                const combos = window.temporaryTickets.tickets.filter(ticket => ticket.type === 'combo');
                
                for (let combo of combos) {
                    if (combo.items && Array.isArray(combo.items)) {
                        const hasTicket = combo.items.some(item => 
                            item.ticketId === ticketId || item.ingresso_id === ticketId
                        );
                        if (hasTicket) return true;
                    }
                }
            }
            
            // Verificar na lista visual de combos
            const comboItems = document.querySelectorAll('.combo-item');
            for (let item of comboItems) {
                const itemTicketId = item.dataset.ticketId || item.getAttribute('data-ticket-id');
                if (itemTicketId == ticketId) return true;
            }
            
            return false;
        }

        // =====================================================
        // FUNÇÕES DE CÓDIGO
        // =====================================================

        function generateRandomCode(length = 8) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }

        function createCodeTicket() {
            const title = document.getElementById('codeTicketTitle')?.value;
            const quantity = document.getElementById('codeTicketQuantity')?.value;
            const startDate = document.getElementById('codeSaleStart')?.value;
            const endDate = document.getElementById('codeSaleEnd')?.value;

            if (!title || !quantity || !startDate || !endDate) {
                alert('Por favor, preencha todos os campos obrigat�rios.');
                return;
            }

            if (quantity > 1000) {
                alert('M�ximo de 1000 c�digos permitidos.');
                return;
            }

            const codes = [];
            const existingCodes = new Set();
            
            for (let i = 0; i < quantity; i++) {
                let code;
                do {
                    code = generateRandomCode();
                } while (existingCodes.has(code));
                
                existingCodes.add(code);
                codes.push({
                    code: code,
                    sentTo: '',
                    usedAt: null,
                    used: false
                });
            }

            const ticketId = 'codes_' + Date.now();
            ticketCodes[ticketId] = {
                title: title,
                codes: codes,
                startDate: startDate,
                endDate: endDate
            };

            addCodeTicketToList(title, quantity, ticketId);
            closeModal('codeTicketModal');
            
            document.getElementById('codeTicketTitle').value = '';
            document.getElementById('codeTicketQuantity').value = '';
            document.getElementById('codeSaleStart').value = '';
            document.getElementById('codeSaleEnd').value = '';
        }

        function addCodeTicketToList(title, quantity, ticketId) {
            ticketCount++;
            const ticketList = document.getElementById('ticketList');
            if (!ticketList) return;

            const ticketItem = document.createElement('div');
            ticketItem.className = 'ticket-item';
            
            ticketItem.innerHTML = `
                <div class="ticket-header">
                    <div class="ticket-info">
                        <div class="ticket-name">${title}</div>
                        <div class="ticket-buyer-price">Valor do comprador: <strong>Acesso via c�digo</strong></div>
                        <div class="ticket-receive-amount">Tipo: <strong>C�digos de acesso</strong></div>
                    </div>
                    <div class="ticket-actions-inline">
                        <div class="switch-mini active" title="Ativar/Desativar">
                            <div class="switch-mini-handle"></div>
                        </div>
                        <button class="btn-icon btn-codes" title="Listar C�digos" onclick="openCodesModal('${ticketId}')">
                            ??
                        </button>                       
                        <button class="btn-icon btn-delete" title="Excluir" onclick="removeTicket(this)">
                            ???
                        </button>
                    </div>
                </div>
                <div class="ticket-details-list">
                    <div class="ticket-detail-item">
                        <div class="ticket-detail-label">C�digos Gerados</div>
                        <div class="ticket-detail-value">${quantity}</div>
                    </div>
                    <div class="ticket-detail-item">
                        <div class="ticket-detail-label">C�digos Usados</div>
                        <div class="ticket-detail-value">0</div>
                    </div>
                    <div class="ticket-detail-item">
                        <div class="ticket-detail-label">Status</div>
                        <div class="ticket-detail-value" style="color: #10B981;">Ativo</div>
                    </div>
                </div>
            `;
            
            ticketList.appendChild(ticketItem);
            initMiniSwitches();
        }

        function openCodesModal(ticketId) {
            const ticketData = ticketCodes[ticketId];
            if (!ticketData) return;

            document.getElementById('codesModalTitle').textContent = ticketData.title;
            populateCodesTable(ticketData.codes);
            openModal('codesListModal');
        }

        function populateCodesTable(codes) {
            const tbody = document.getElementById('codesTableBody');
            tbody.innerHTML = '';

            codes.forEach((codeData, index) => {
                const row = tbody.insertRow();
                
                row.innerHTML = `
                    <td>
                        <span class="code-value">${codeData.code}</span>
                        <button class="btn btn-outline btn-small" onclick="copyIndividualCode('${codeData.code}')" title="Copiar c�digo" style="margin-left: 8px; padding: 2px 6px; font-size: 0.7rem;">
                            ??
                        </button>
                    </td>
                    <td>
                        <input type="text" value="${codeData.sentTo}" 
                               onchange="updateCodeRecipient(${index}, this.value)"
                               placeholder="Nome da pessoa, empresa, etc..." 
                               style="background: transparent; border: 1px solid rgba(114, 94, 255, 0.3); border-radius: 4px; padding: 4px 8px; color: #E1E5F2; width: 100%;">
                    </td>
                    <td>
                        ${codeData.used ? 
                            `<span class="status-used">${new Date(codeData.usedAt).toLocaleString('pt-BR')}</span>` : 
                            `<span class="status-unused">N�o utilizado</span>`
                        }
                    </td>
                    <td>
                        <button class="btn btn-whatsapp btn-small" onclick="shareCodeWhatsApp('${codeData.code}', ${index})" title="Compartilhar via WhatsApp">
                            ??
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="deleteCode(${index})" title="Apagar">
                            ???
                        </button>
                    </td>
                `;
            });
        }

        function filterCodes() {
            const searchTerm = document.getElementById('searchCodes').value.toLowerCase();
            const rows = document.querySelectorAll('#codesTableBody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }

        function shareCodeWhatsApp(code, index) {
            const eventName = document.getElementById('eventName')?.value || 'Evento';
            const eventDate = document.getElementById('startDateTime')?.value;
            
            let dateText = '';
            if (eventDate) {
                const date = new Date(eventDate);
                dateText = `\n📅 Data: ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`;
            }
            
            const message = `🎟️ *Seu c�digo de acesso*\n\n` +
                           `*Evento:* ${eventName}${dateText}\n\n` +
                           `*C�digo:* \`${code}\`\n\n` +
                           `??� Apresente este c�digo no evento para ter acesso.\n\n` +
                           `_Generated by Anysummit_`;
            
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            
            window.open(whatsappUrl, '_blank');
            
            const recipientField = document.querySelector(`#codesTableBody tr:nth-child(${index + 1}) input`);
            if (!recipientField.value.trim()) {
                const now = new Date().toLocaleString('pt-BR');
                recipientField.value = `Enviado via WhatsApp - ${now}`;
                updateCodeRecipient(index, recipientField.value);
            }
        }

        function updateCodeRecipient(index, description) {
            console.log(`C�digo ${index} foi encaminhado para: ${description}`);
        }

        function copyIndividualCode(code) {
            navigator.clipboard.writeText(code).then(() => {
                const notification = document.createElement('div');
                notification.textContent = 'C�digo copiado!';
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #00C2FF, #725EFF);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 8px;
                    z-index: 3000;
                    font-size: 0.9rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                `;
                
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.remove();
                }, 2000);
            });
        }

        function deleteCode(index) {
            if (confirm('Tem certeza que deseja apagar este c�digo?')) {
                const row = document.querySelector(`#codesTableBody tr:nth-child(${index + 1})`);
                row.remove();
            }
        }

        function exportCodes() {
            const codes = Array.from(document.querySelectorAll('#codesTableBody tr')).map(row => {
                const cells = row.querySelectorAll('td');
                return {
                    codigo: cells[0].textContent.trim(),
                    email: cells[1].querySelector('input').value,
                    utilizado: cells[2].textContent.trim()
                };
            });
            
            const csvContent = "data:text/csv;charset=utf-8," 
                + "C�digo,Email,Status\n"
                + codes.map(c => `${c.codigo},${c.email},${c.utilizado}`).join("\n");
            
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", "codigos_ingresso.csv");
            link.click();
        }

        function copyAllCodes() {
            const codes = Array.from(document.querySelectorAll('.code-value')).map(el => el.textContent).join('\n');
            navigator.clipboard.writeText(codes).then(() => {
                alert('Todos os c�digos foram copiados para a �rea de transferência!');
            });
        }

        function initCodeTicketButton() {
            const addCodeBtn = document.getElementById('addCodeTicket');
            if (addCodeBtn) {
                addCodeBtn.addEventListener('click', function() {
                    openModal('codeTicketModal');
                });
            }
        }

        // =====================================================
        // TESTE DE CONEXÃO
        // =====================================================

        function testarConexaoAPI() {
            const dadosTeste = {
                evento: {
                    nome: 'Evento Teste',
                    data_inicio: '2025-06-01T10:00:00',
                    data_fim: '2025-06-01T18:00:00',
                    tipo_local: 'presencial',
                    busca_endereco: 'Rua Teste, 123',
                    visibilidade: 'public',
                    termos_aceitos: true,
                    classificacao: 'livre',
                    categoria: 'tecnologia'
                },
                ingressos: [
                    {
                        tipo: 'gratuito',
                        titulo: 'Ingresso Teste',
                        quantidade_total: 0,
                        valor_comprador: 0,
                        valor_receber: 0,
                        ativo: true,
                        posicao_ordem: 1
                    }
                ]
            };
            
            fetch(API_CONFIG.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(dadosTeste)
            })
            .then(response => response.json())
            .then(data => {
                console.log('🧪 Teste de conex�o:', data);
                alert('Conex�o OK: ' + JSON.stringify(data));
            })
            .catch(error => {
                console.error('🧪 Erro no teste:', error);
                alert('Erro na conex�o: ' + error.message);
            });
        }

        // =====================================================
        // FUNÇÕES DO COMBO DE TIPOS DE INGRESSO
        // =====================================================

        let comboItems = [];

        // FUN��O ANTIGA - SUBSTITU�DA POR populateComboTicketSelectByLote
        function populateComboTicketSelect() {
            // N�o fazer nada - usar populateComboTicketSelectByLote
            console.log('populateComboTicketSelect chamada - redirecionando para nova fun��o');
        }

        function addItemToCombo() {
            const select = document.getElementById('comboTicketTypeSelect');
            const quantityInput = document.getElementById('comboItemQuantity');
            
            if (!select.value || !quantityInput.value) {
                alert('Selecione um tipo de ingresso e defina a quantidade.');
                return;
            }
            
            const selectedOption = select.options[select.selectedIndex];
            const ticketData = JSON.parse(selectedOption.dataset.ticketData);
            const quantity = parseInt(quantityInput.value);
            
            // Verificar se j� n�o foi adicionado
            const existingItem = comboItems.find(item => item.index === ticketData.index);
            if (existingItem) {
                alert('Este tipo de ingresso j� foi adicionado ao combo.');
                return;
            }
            
            // Adicionar ao array
            const comboItem = {
                index: ticketData.index,
                name: ticketData.name,
                price: ticketData.price,
                quantity: quantity
            };
            
            comboItems.push(comboItem);
            
            // Atualizar interface
            updateComboItemsList();
            updateComboSummary();
            
            // Limpar campos
            select.value = '';
            quantityInput.value = '';
        }

        function updateComboItemsList() {
            const container = document.getElementById('comboItemsList');
            if (!container) return;
            
            if (comboItems.length === 0) {
                container.innerHTML = `
                    <div class="combo-empty-state">
                        <div style="font-size: 2rem; margin-bottom: 10px;">??</div>
                        <div style="color: #8B95A7;">Adicione tipos de ingresso ao combo</div>
                        <div style="color: #8B95A7; font-size: 0.85rem;">Selecione os tipos j� criados e defina quantidades</div>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = comboItems.map((item, index) => `
                <div class="combo-item">
                    <div class="combo-item-info">
                        <div class="combo-item-title">${item.name}</div>
                        <div class="combo-item-details">${item.price}</div>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <div class="combo-item-quantity">${item.quantity}x</div>
                   
						
						<button class="btn-icon btn-delete" onclick="removeComboItem(${index})" title="Remover">
    ???
</button>
                    </div>
                </div>
            `).join('');
        }

        function removeComboItem(index) {
            comboItems.splice(index, 1);
            updateComboItemsList();
            updateComboSummary();
        }

        function updateComboSummary() {
            const totalItems = comboItems.reduce((sum, item) => sum + item.quantity, 0);
            console.log(`?? Combo atualizado: ${comboItems.length} tipos, ${totalItems} itens totais`);
        }

        function createComboTicket() {
            // Limpar erros anteriores
            document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
            
            const title = document.getElementById('comboTicketTitle')?.value;
            const quantity = document.getElementById('comboTicketQuantity')?.value;
            const price = document.getElementById('comboTicketPrice')?.value;
            const loteId = document.getElementById('comboTicketLote')?.value;
            const startDate = document.getElementById('comboSaleStart')?.value;
            const endDate = document.getElementById('comboSaleEnd')?.value;
            const description = document.getElementById('comboTicketDescription')?.value;
            const taxaServico = document.getElementById('comboTicketTaxaServico')?.checked;

            // Valida��o com destaque de campos
            let hasError = false;
            
            if (!title) {
                document.getElementById('comboTicketTitle').classList.add('error-field');
                hasError = true;
            }
            if (!quantity && quantity !== '0') { // Permitir quantidade 0 para checkbox desmarcado
                document.getElementById('comboTicketQuantity').classList.add('error-field');
                hasError = true;
            }
            if (!price || price === 'R$ 0,00') {
                document.getElementById('comboTicketPrice').classList.add('error-field');
                hasError = true;
            }
            if (!loteId) {
                document.getElementById('comboTicketLote').classList.add('error-field');
                hasError = true;
            }
            if (!startDate) {
                document.getElementById('comboSaleStart').classList.add('error-field');
                hasError = true;
            }
            if (!endDate) {
                document.getElementById('comboSaleEnd').classList.add('error-field');
                hasError = true;
            }

            if (hasError) {
                alert('Por favor, preencha todos os campos obrigat�rios marcados em vermelho.');
                return;
            }

            if (comboItems.length === 0) {
                alert('Adicione pelo menos um tipo de ingresso ao combo.');
                // Destacar a �rea de composi��o do combo
                const comboList = document.getElementById('comboItemsList');
                if (comboList) {
                    comboList.style.border = '2px solid #ef4444';
                    setTimeout(() => {
                        comboList.style.border = '';
                    }, 3000);
                }
                return;
            }

            // Obter informa��es do lote selecionado
            const selectLote = document.getElementById('comboTicketLote');
            const selectedOption = selectLote.options[selectLote.selectedIndex];
            const loteNome = selectedOption.dataset.nomeSimples || selectedOption.textContent.split(' - ')[0];
            const tipoLote = selectedOption.dataset.tipoLote;

            // Criar o combo
            const comboData = {
                tipo: 'combo',
                loteId: loteId,
                loteNome: loteNome,
                tipoLote: tipoLote,
                taxaServico: taxaServico,
                itens: comboItems.map(item => ({
                    ingresso_index: item.index,
                    quantidade: item.quantity,
                    nome: item.name
                }))
            };

            const totalItems = comboItems.reduce((sum, item) => sum + item.quantity, 0);
            const comboDescription = description || `Inclui: ${comboItems.map(item => `${item.quantity}x ${item.name}`).join(', ')}`;

            addComboToList(title, quantity, price, comboData, totalItems, comboDescription, loteId, loteNome, startDate, endDate);
            closeModal('comboTicketModal');
            clearComboForm();
        }

        function addComboToList(title, quantity, price, comboData, totalItems, description, loteId, loteNome, startDate, endDate) {
            ticketCount++;
            const ticketList = document.getElementById('ticketList');
            if (!ticketList) return;

            const cleanPrice = parseFloat(price.replace(/[R$\s\.]/g, '').replace(',', '.'));
            const tax = cleanPrice * 0.1;
            const receiveAmount = cleanPrice * 0.9;
            
            const taxFormatted = `R$ ${tax.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
            const receiveFormatted = `R$ ${receiveAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
            
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                return date.toLocaleDateString('pt-BR') + ' ' + 
                       date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
            };
            
            const ticketItem = document.createElement('div');
            ticketItem.className = 'ticket-item';
            ticketItem.dataset.ticketId = ticketCount;
            ticketItem.dataset.comboData = JSON.stringify(comboData);
            
            ticketItem.innerHTML = `
                <div class="ticket-header">
                    <div class="ticket-title">
                        <span class="ticket-name">${title}</span>
                        <span class="ticket-type-badge combo">(Combo)</span>
                        <span class="ticket-lote-info" style="font-size: 11px; color: #666; margin-left: 10px;">
                            ${loteNome} - Por Data (${formatDate(startDate)} at� ${formatDate(endDate)})
                        </span>
                    </div>
                    <div class="ticket-actions">
                        <button class="btn-icon" onClick="editCombo(${ticketCount})" title="Editar Combo">??</button>
                        <button class="btn-icon" onClick="removeTicket(${ticketCount})" title="Remover">  ???</button>
                    </div>
                </div>
                <div class="ticket-details">
                    <div class="ticket-info">
                        <span>Quantidade: <strong>${quantity}</strong></span>
                        <span>Pre�o: <strong>${price}</strong></span>
                        <span>Taxa: <strong>${taxFormatted}</strong></span>
                        <span>Voc� recebe: <strong>${receiveFormatted}</strong></span>
                    </div>
                    <div class="combo-items" style="margin-top: 10px; padding: 8px 12px; background: #f0f4ff; border-radius: 6px;">
                        <strong style="color: #9C27B0;">Inclui:</strong>
                        <span style="color: #555; margin-left: 5px;">
                            ${comboData.itens.map(item => `${item.quantidade}x ${item.nome}`).join(', ')}
                        </span>
                    </div>
                </div>
            `;
            
            ticketList.appendChild(ticketItem);
            
            // Armazenar dados do combo para edi��o
            ticketItem.ticketData = {
                type: 'combo',
                title: title,
                quantity: quantity,
                price: cleanPrice,
                description: description,
                comboData: comboData
            };
            
            // Salvar ap�s adicionar combo
            // saveWizardData() removido
        }

        function clearComboForm() {
            // Limpar campos do formul�rio
            document.getElementById('comboTicketTitle').value = '';
            document.getElementById('comboTicketQuantity').value = '';
            document.getElementById('comboTicketPrice').value = 'R$ 0,00';
            document.getElementById('comboTicketReceive').value = 'R$ 0,00';
            document.getElementById('comboTicketLote').value = '';
            document.getElementById('comboSaleStart').value = '';
            document.getElementById('comboSaleEnd').value = '';
            document.getElementById('comboTicketDescription').value = '';
            document.getElementById('comboTicketTaxaServico').checked = true;
            
            // Limpar valores calculados
            document.getElementById('comboTicketTaxaValor').value = 'R$ 0,00';
            document.getElementById('comboTicketValorComprador').value = 'R$ 0,00';
            
            // Limpar itens do combo
            comboItems = [];
            updateComboItemsList();
            updateComboSummary();
            
            // Resetar select de tipos de ingresso
            const select = document.getElementById('comboTicketTypeSelect');
            if (select) {
                select.innerHTML = '<option value="">Selecione um lote primeiro</option>';
            }
        }

        // Inicializar formata��o de pre�o para combo
        function initComboPriceInput() {
            const priceInput = document.getElementById('comboTicketPrice');
            const receiveInput = document.getElementById('comboTicketReceive');
            
            if (!priceInput || !receiveInput) return;
            
            priceInput.value = 'R$ 0,00';
            receiveInput.value = 'R$ 0,00';
            
            priceInput.addEventListener('input', function() {
                formatCurrency(this);
                
                const receiveAmount = calculateReceiveAmount(this.value);
                receiveInput.value = receiveAmount;
            });
            
            priceInput.addEventListener('blur', function() {
                if (this.value === 'R$ ' || this.value === '') {
                    this.value = 'R$ 0,00';
                    receiveInput.value = 'R$ 0,00';
                }
            });
            
            priceInput.addEventListener('focus', function() {
                if (this.value === 'R$ 0,00') {
                    this.value = 'R$ ';
                }
            });
        }

// ==================== FUNÇÕES DE EDIÇÃO DE INGRESSOS ====================

// Função para editar ingresso existente - HÍBRIDA (preserva funcionamento + consulta banco para checkbox)
async function editTicket(ticketId) {
    console.log('🔧 Editando ingresso:', ticketId);
    
    // MÉTODO ORIGINAL: Buscar os dados do ingresso na lista atual (para preservar funcionalidade)
    const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
    if (!ticketElement) {
        alert('Ingresso não encontrado');
        return;
    }
    
    // Extrair dados do elemento (método original)
    const ticketData = extractTicketDataFromElement(ticketElement);
    
    // Abrir modal com dados do elemento (método original)
    if (ticketData.tipo === 'pago') {
        populateEditPaidTicketModal(ticketData);
        document.getElementById('editPaidTicketModal').style.display = 'flex';
        
        // ADICIONAR: Consulta ao banco APENAS para configurar checkbox corretamente
        await configurarCheckboxComDadosDoBanco(ticketId, 'limitEditPaidQuantityCheck', 'editPaidTicketQuantity');
        
    } else if (ticketData.tipo === 'gratuito') {
        populateEditFreeTicketModal(ticketData);
        document.getElementById('editFreeTicketModal').style.display = 'flex';
        
        // ADICIONAR: Consulta ao banco APENAS para configurar checkbox corretamente
        await configurarCheckboxComDadosDoBanco(ticketId, 'limitEditFreeQuantityCheck', 'editFreeTicketQuantity');
        
    } else if (ticketData.tipo === 'combo') {
        // Para combos, usar as funções existentes sem alteração
        if (typeof populateEditComboModal === 'function') {
            populateEditComboModal(ticketData);
            document.getElementById('editComboTicketModal').style.display = 'flex';
        }
    }
}

// NOVA FUNÇÃO: Configurar checkbox com dados do banco (sem afetar resto do modal)
async function configurarCheckboxComDadosDoBanco(ticketId, checkboxId, campoId) {
    try {
        console.log(`🎯 Configurando checkbox ${checkboxId} com dados do banco...`);
        
        const eventoId = new URLSearchParams(window.location.search).get('evento_id');
        if (!eventoId) {
            console.warn('⚠️ evento_id não encontrado na URL');
            return;
        }
        
        const formData = new FormData();
        formData.append('action', 'buscar_ingresso');
        formData.append('ingresso_id', ticketId);
        formData.append('evento_id', eventoId);
        
        const response = await fetch('ajax/wizard_evento.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.sucesso && data.ingresso) {
            const quantidade = parseInt(data.ingresso.quantidade_total) || 0;
            const checkbox = document.getElementById(checkboxId);
            const campo = document.getElementById(campoId);
            
            if (checkbox && campo) {
                console.log(`📊 Quantidade real do banco: ${quantidade}`);
                
                if (quantidade > 0) {
                    checkbox.checked = true;
                    campo.value = quantidade;
                    console.log(`✅ Checkbox ${checkboxId} marcado - quantidade: ${quantidade}`);
                } else {
                    checkbox.checked = false;
                    campo.value = '0';
                    console.log(`✅ Checkbox ${checkboxId} desmarcado - quantidade: ${quantidade}`);
                }
                
                // Disparar evento para atualizar interface
                checkbox.dispatchEvent(new Event('change'));
            }
        } else {
            console.warn('⚠️ Não foi possível obter dados do banco para checkbox:', data.erro);
        }
        
    } catch (error) {
        console.warn('⚠️ Erro ao configurar checkbox com dados do banco:', error);
        // Não quebrar o funcionamento - apenas logar o erro
    }
}

// Função para extrair dados do ingresso do elemento HTML
function extractTicketDataFromElement(element) {
    const titleElement = element.querySelector('.ticket-title');
    const title = titleElement ? titleElement.textContent.trim() : '';
    
    // Determinar tipo baseado na classe
    let tipo = 'gratuito';
    if (titleElement && titleElement.querySelector('.pago')) {
        tipo = 'pago';
    }
    
    // CORREÇÃO: Extrair lote_id do dataset do elemento
    const loteId = element.dataset.loteId || element.getAttribute('data-lote-id') || null;
    console.log(`🏷️ Extraindo lote_id do elemento: ${loteId}`);
    
    return {
        id: element.dataset.ticketId,
        titulo: title.replace(/\s+(Gratuito|Pago|Código)$/, ''),
        tipo: tipo,
        lote_id: loteId, // ADICIONADO: lote_id extraído do elemento
        // Estes dados virão do backend quando implementarmos a busca AJAX
        quantidade_total: 0,
        preco: 0,
        inicio_venda: new Date().toISOString().slice(0, 16),
        fim_venda: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        limite_min: 1,
        limite_max: 5,
        descricao: ''
    };
}

// Fun��o para popular modal de edi��o de ingresso pago
// Fun��o para popular modal de edi��o de ingresso pago
function populateEditPaidTicketModal(ticketData) {
    console.log('🔧 populateEditPaidTicketModal chamada - vers�o CORRIGIDA', ticketData);
    
    const editTicketId = document.getElementById('editTicketId');
    const editPaidTicketTitle = document.getElementById('editPaidTicketTitle');
    const editPaidTicketQuantity = document.getElementById('editPaidTicketQuantity');
    const editPaidTicketPrice = document.getElementById('editPaidTicketPrice');
    const editPaidTicketReceive = document.getElementById('editPaidTicketReceive');
    const editPaidSaleStart = document.getElementById('editPaidSaleStart');
    const editPaidSaleEnd = document.getElementById('editPaidSaleEnd');
    const editPaidMinQuantity = document.getElementById('editPaidMinQuantity');
    const editPaidMaxQuantity = document.getElementById('editPaidMaxQuantity');
    const editPaidTicketDescription = document.getElementById('editPaidTicketDescription');

    if (editTicketId) {
        editTicketId.value = ticketData.id;
        console.log('✅ editTicketId definido:', ticketData.id);
    } else {
        console.error('❌ editTicketId n�o encontrado');
    }
    
    if (editPaidTicketTitle) {
        editPaidTicketTitle.value = ticketData.titulo;
        console.log('✅ editPaidTicketTitle definido:', ticketData.titulo);
    } else {
        console.error('❌ editPaidTicketTitle n�o encontrado');
    }
    
    if (editPaidTicketQuantity) {
        editPaidTicketQuantity.value = ticketData.quantidade_total;
        console.log('✅ editPaidTicketQuantity definido:', ticketData.quantidade_total);
    } else {
        console.error('❌ editPaidTicketQuantity n�o encontrado');
    }
    
    if (editPaidTicketPrice) {
        editPaidTicketPrice.value = formatPrice(ticketData.preco);
        console.log('✅ editPaidTicketPrice definido:', ticketData.preco);
    } else {
        console.error('❌ editPaidTicketPrice n�o encontrado');
    }
    
    if (editPaidTicketReceive) {
        editPaidTicketReceive.value = formatPrice(ticketData.valor_receber || 0);
        console.log('✅ editPaidTicketReceive definido:', ticketData.valor_receber);
    } else {
        console.error('❌ editPaidTicketReceive n�o encontrado');
    }
    
    if (editPaidSaleStart) {
        editPaidSaleStart.value = ticketData.inicio_venda ? ticketData.inicio_venda.slice(0, 16) : '';
        console.log('✅ editPaidSaleStart definido:', ticketData.inicio_venda);
    } else {
        console.error('❌ editPaidSaleStart n�o encontrado');
    }
    
    if (editPaidSaleEnd) {
        editPaidSaleEnd.value = ticketData.fim_venda ? ticketData.fim_venda.slice(0, 16) : '';
        console.log('✅ editPaidSaleEnd definido:', ticketData.fim_venda);
    } else {
        console.error('❌ editPaidSaleEnd n�o encontrado');
    }
    
    if (editPaidMinQuantity) {
        editPaidMinQuantity.value = ticketData.limite_min || 1;
        console.log('✅ editPaidMinQuantity definido:', ticketData.limite_min);
    } else {
        console.error('❌ editPaidMinQuantity n�o encontrado');
    }
    
    if (editPaidMaxQuantity) {
        editPaidMaxQuantity.value = ticketData.limite_max || 5;
        console.log('✅ editPaidMaxQuantity definido:', ticketData.limite_max);
    } else {
        console.error('❌ editPaidMaxQuantity n�o encontrado');
    }
    
    if (editPaidTicketDescription) {
        editPaidTicketDescription.value = ticketData.descricao || '';
        console.log('✅ editPaidTicketDescription definido:', ticketData.descricao);
    } else {
        console.error('❌ editPaidTicketDescription n�o encontrado');
    }
    
    // CORREÇÃO: Preencher lote_id se disponível
    const editPaidTicketLote = document.getElementById('editPaidTicketLote');
    if (editPaidTicketLote && ticketData.lote_id) {
        editPaidTicketLote.value = ticketData.lote_id;
        console.log('✅ editPaidTicketLote definido:', ticketData.lote_id);
    }
}

// Fun��o para popular modal de edi��o de ingresso gratuito
function populateEditFreeTicketModal(ticketData) {
    console.log('🔧 populateEditFreeTicketModal chamada - vers�o CORRIGIDA', ticketData);
    
    const editFreeTicketId = document.getElementById('editFreeTicketId');
    const editFreeTicketTitle = document.getElementById('editFreeTicketTitle');
    const editFreeTicketQuantity = document.getElementById('editFreeTicketQuantity');
    const editFreeSaleStart = document.getElementById('editFreeSaleStart');
    const editFreeSaleEnd = document.getElementById('editFreeSaleEnd');
    const editFreeMinLimit = document.getElementById('editFreeMinLimit');
    const editFreeMaxLimit = document.getElementById('editFreeMaxLimit');
    const editFreeTicketDescription = document.getElementById('editFreeTicketDescription');

    if (editFreeTicketId) {
        editFreeTicketId.value = ticketData.id;
        console.log('✅ editFreeTicketId definido:', ticketData.id);
    } else {
        console.error('❌ editFreeTicketId n�o encontrado');
    }
    
    if (editFreeTicketTitle) {
        editFreeTicketTitle.value = ticketData.titulo;
        console.log('✅ editFreeTicketTitle definido:', ticketData.titulo);
    } else {
        console.error('❌ editFreeTicketTitle n�o encontrado');
    }
    
    if (editFreeTicketQuantity) {
        editFreeTicketQuantity.value = ticketData.quantidade_total;
        console.log('✅ editFreeTicketQuantity definido:', ticketData.quantidade_total);
    } else {
        console.error('❌ editFreeTicketQuantity n�o encontrado');
    }
    
    if (editFreeSaleStart) {
        editFreeSaleStart.value = ticketData.inicio_venda ? ticketData.inicio_venda.slice(0, 16) : '';
        console.log('✅ editFreeSaleStart definido:', ticketData.inicio_venda);
    } else {
        console.error('❌ editFreeSaleStart n�o encontrado');
    }
    
    if (editFreeSaleEnd) {
        editFreeSaleEnd.value = ticketData.fim_venda ? ticketData.fim_venda.slice(0, 16) : '';
        console.log('✅ editFreeSaleEnd definido:', ticketData.fim_venda);
    } else {
        console.error('❌ editFreeSaleEnd n�o encontrado');
    }
    
    if (editFreeMinLimit) {
        editFreeMinLimit.value = ticketData.limite_min || 1;
        console.log('✅ editFreeMinLimit definido:', ticketData.limite_min);
    } else {
        console.error('❌ editFreeMinLimit n�o encontrado');
    }
    
    if (editFreeMaxLimit) {
        editFreeMaxLimit.value = ticketData.limite_max || 5;
        console.log('✅ editFreeMaxLimit definido:', ticketData.limite_max);
    } else {
        console.error('❌ editFreeMaxLimit n�o encontrado');
    }
    
    if (editFreeTicketDescription) {
        editFreeTicketDescription.value = ticketData.descricao || '';
        console.log('✅ editFreeTicketDescription definido:', ticketData.descricao);
    } else {
        console.error('❌ editFreeTicketDescription n�o encontrado');
    }
    
    // CORREÇÃO: Preencher lote_id se disponível
    const editFreeTicketLote = document.getElementById('editFreeTicketLote');
    if (editFreeTicketLote && ticketData.lote_id) {
        editFreeTicketLote.value = ticketData.lote_id;
        console.log('✅ editFreeTicketLote definido:', ticketData.lote_id);
    }
}

// Fun��o para atualizar ingresso pago
function updatePaidTicket() {
    const ticketData = {
        id: document.getElementById('editTicketId').value,
        titulo: document.getElementById('editPaidTicketTitle').value,
        quantidade_total: parseInt(document.getElementById('editPaidTicketQuantity').value),
        preco: parseFloat(document.getElementById('editPaidTicketPrice').value.replace(/[R$\s.]/g, '').replace(',', '.')),
        inicio_venda: document.getElementById('editPaidSaleStart').value,
        fim_venda: document.getElementById('editPaidSaleEnd').value,
        limite_min: parseInt(document.getElementById('editPaidMinQuantity').value) || 1,
        limite_max: parseInt(document.getElementById('editPaidMaxQuantity').value) || 5,
        descricao: document.getElementById('editPaidTicketDescription').value,
        lote_id: document.getElementById('editPaidTicketLote')?.value || null // CORREÇÃO: Incluir lote_id
    };
    
    // Valida�ões
    if (!ticketData.titulo || !ticketData.quantidade_total || !ticketData.preco) {
        alert('Por favor, preencha todos os campos obrigat�rios');
        return;
    }
    
    // Atualizar na lista de ingressos
    updateTicketInList(ticketData);
    
    // Fechar modal
    closeModal('editPaidTicketModal');
    
    console.log('✅ Ingresso pago atualizado:', ticketData);
}

// Fun��o para atualizar ingresso gratuito
function updateFreeTicket() {
    const ticketData = {
        id: document.getElementById('editFreeTicketId').value,
        titulo: document.getElementById('editFreeTicketTitle').value,
        quantidade_total: parseInt(document.getElementById('editFreeTicketQuantity').value),
        preco: 0,
        inicio_venda: document.getElementById('editFreeSaleStart').value,
        fim_venda: document.getElementById('editFreeSaleEnd').value,
        limite_min: parseInt(document.getElementById('editFreeMinLimit').value) || 1,
        limite_max: parseInt(document.getElementById('editFreeMaxLimit').value) || 5,
        descricao: document.getElementById('editFreeTicketDescription').value,
        lote_id: document.getElementById('editFreeTicketLote')?.value || null // CORREÇÃO: Incluir lote_id
    };
    
    // Valida�ões
    if (!ticketData.titulo || !ticketData.quantidade_total) {
        alert('Por favor, preencha todos os campos obrigat�rios');
        return;
    }
    
    // Atualizar na lista de ingressos
    updateTicketInList(ticketData);
    
    // Fechar modal
    closeModal('editFreeTicketModal');
    
    console.log('✅ Ingresso gratuito atualizado:', ticketData);
}

// Fun��o para atualizar ingresso na lista
function updateTicketInList(ticketData) {
    const ticketElement = document.querySelector(`[data-ticket-id="${ticketData.id}"]`);
    if (!ticketElement) return;
    
    // Atualizar t�tulo
    const titleElement = ticketElement.querySelector('.ticket-title');
    if (titleElement) {
        const badgeText = ticketData.preco > 0 ? 'Pago' : 'Gratuito';
        const badgeClass = ticketData.preco > 0 ? 'pago' : 'gratuito';
        titleElement.innerHTML = `
            ${ticketData.titulo}
            <span class="ticket-type-badge ${badgeClass}">${badgeText}</span>
        `;
    }
    
    // Atualizar detalhes
    const detailsElement = ticketElement.querySelector('.ticket-details');
    if (detailsElement) {
        let detailsHTML = `
            <div class="ticket-info">
                ${ticketData.tipo === 'combo' ? '' : (ticketData.quantidade_total > 0 ? `<span>Quantidade Limite a Venda: <strong>${ticketData.quantidade_total}</strong></span>` : '')}
        `;
        
        if (ticketData.preco > 0) {
            detailsHTML += `<span>Pre�o: <strong>R$ ${ticketData.preco.toFixed(2).replace('.', ',')}</strong></span>`;
        }
        
        detailsHTML += `
                <span>Vendas: ${formatDateForDisplay(ticketData.inicio_venda)} - ${formatDateForDisplay(ticketData.fim_venda)}</span>
            </div>
        `;
        
        if (ticketData.descricao) {
            detailsHTML += `
                <div class="ticket-description">
                    ${ticketData.descricao}
                </div>
            `;
        }
        
        detailsElement.innerHTML = detailsHTML;
    }
}

// Fun��o para formatar data para exibi��o
function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
}

// Fun��o para formatar pre�o
function formatPrice(value) {
    if (typeof value === 'number') {
        return 'R$ ' + value.toFixed(2).replace('.', ',');
    }
    return value || 'R$ 0,00';
}

// Função para converter preço do formato brasileiro para número
function converterPrecoParaNumero(valorMonetario) {
    if (typeof valorMonetario === 'number') {
        return valorMonetario;
    }
    
    if (!valorMonetario || valorMonetario === '') {
        return 0;
    }
    
    // Remove R$ e espaços
    let valor = valorMonetario.toString().replace(/[R$\s]/g, '');
    
    // Se contém vírgula, assumir que é o separador decimal brasileiro
    if (valor.includes(',')) {
        // Se tem pontos também, eles são separadores de milhares
        valor = valor.replace(/\./g, '').replace(',', '.');
    }
    // Se só tem pontos, verificar se é decimal ou separador de milhares
    else if (valor.includes('.')) {
        const partes = valor.split('.');
        // Se a última parte tem exatamente 2 dígitos, provavelmente é decimal
        if (partes.length === 2 && partes[1].length === 2) {
            // Manter como está (formato americano)
        } else {
            // Remover pontos (separadores de milhares)
            valor = valor.replace(/\./g, '');
        }
    }
    
    const numero = parseFloat(valor) || 0;
    return numero;
}

// ==================== FUNÇÕES DE EDIÇÃO DE COMBOS ====================

// Fun��o para editar combo existente
function editCombo(comboId) {
    console.log('🔧 Editando combo:', comboId);
    
    // Buscar os dados do combo na lista atual
    const comboElement = document.querySelector(`[data-ticket-id="${comboId}"]`);
    if (!comboElement) {
        alert('Combo n�o encontrado');
        return;
    }
    
    // Extrair dados do elemento
    const comboData = extractComboDataFromElement(comboElement);
    
    // Popular modal de edi��o
    populateEditComboModal(comboData);
    
    // Abrir modal
    document.getElementById('editComboModal').style.display = 'flex';
    
    // Popular select de tipos de ingresso
    populateEditComboTicketSelect();
}

// Fun��o para extrair dados do combo do elemento HTML
function extractComboDataFromElement(element) {
    const titleElement = element.querySelector('.ticket-title');
    const title = titleElement ? titleElement.textContent.trim() : '';
    
    return {
        id: element.dataset.ticketId,
        titulo: title.replace(/\s+📦/, '').replace(/\s+(Combo)$/, ''),
        tipo: 'combo',
        // Estes dados vir�o do backend quando implementarmos a busca AJAX
        quantidade_total: 50,
        preco: 0,
        valor_receber: 0,
        inicio_venda: new Date().toISOString().slice(0, 16),
        fim_venda: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        descricao: '',
        conteudo_combo: []
    };
}

// Fun��o para popular modal de edi��o de combo
function populateEditComboModal(comboData) {
    document.getElementById('editComboId').value = comboData.id;
    document.getElementById('editComboTitle').value = comboData.titulo;
    document.getElementById('editComboQuantity').value = comboData.quantidade_total;
    document.getElementById('editComboPrice').value = formatPrice(comboData.preco);
    document.getElementById('editComboReceive').value = formatPrice(comboData.valor_receber);
    document.getElementById('editComboSaleStart').value = comboData.inicio_venda;
    document.getElementById('editComboSaleEnd').value = comboData.fim_venda;
    document.getElementById('editComboDescription').value = comboData.descricao || '';
    
    // Carregar itens do combo - CORRIGIDO PARA PARSEAR JSON
    try {
        if (comboData.conteudo_combo && typeof comboData.conteudo_combo === 'string') {
            editComboItems = JSON.parse(comboData.conteudo_combo);
            console.log('✅ Conteúdo do combo parseado:', editComboItems);
        } else if (Array.isArray(comboData.conteudo_combo)) {
            editComboItems = comboData.conteudo_combo;
            console.log('✅ Conteúdo do combo já é array:', editComboItems);
        } else {
            editComboItems = [];
            console.log('⚠️ Conteúdo do combo vazio ou inválido');
        }
    } catch (e) {
        console.error('❌ Erro ao parsear conteúdo do combo:', e);
        console.error('❌ Conteúdo recebido:', comboData.conteudo_combo);
        editComboItems = [];
    }
    renderEditComboItems();
}

// Fun��o para popular select de tipos de ingresso para edi��o de combo
function populateEditComboTicketSelect() {
    const select = document.getElementById('editComboTicketTypeSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Escolha um tipo de ingresso</option>';
    
    // Buscar tipos de ingresso j� existentes na p�gina
    const ticketItems = document.querySelectorAll('#ticketList .ticket-item');
    
    if (ticketItems.length === 0) {
        select.innerHTML = '<option value="">Primeiro crie alguns tipos de ingresso</option>';
        return;
    }
    
    ticketItems.forEach((item, index) => {
        const ticketTitle = item.querySelector('.ticket-title')?.textContent?.trim();
        
        if (ticketTitle && !ticketTitle.includes('??')) {
            const option = document.createElement('option');
            option.value = item.dataset.ticketId || index;
            option.textContent = ticketTitle.replace(/\s+(Gratuito|Pago|C�digo)$/, '');
            select.appendChild(option);
        }
    });
}

// Vari�vel para itens do combo em edi��o
let editComboItems = [];

// Fun��o para adicionar item ao combo em edi��o
function addItemToEditCombo() {
    const select = document.getElementById('editComboTicketTypeSelect');
    const quantityInput = document.getElementById('editComboItemQuantity');
    
    if (!select.value || !quantityInput.value) {
        alert('Selecione um tipo de ingresso e defina a quantidade.');
        return;
    }
    
    const ticketName = select.options[select.selectedIndex].textContent;
    const quantity = parseInt(quantityInput.value);
    
    // Verificar se j� existe
    const existingIndex = editComboItems.findIndex(item => item.ticket_id === select.value);
    
    if (existingIndex !== -1) {
        // Atualizar quantidade
        editComboItems[existingIndex].quantidade = quantity;
    } else {
        // Adicionar novo item
        editComboItems.push({
            ticket_id: select.value,
            ticket_name: ticketName,
            quantidade: quantity
        });
    }
    
    // Renderizar lista
    renderEditComboItems();
    
    // Limpar formul�rio
    select.value = '';
    quantityInput.value = '';
}

// Fun��o para renderizar itens do combo em edi��o
function renderEditComboItems() {
    const container = document.getElementById('editComboItemsList');
    if (!container) return;
    
    if (editComboItems.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Nenhum tipo de ingresso adicionado</p>';
        return;
    }
    
    container.innerHTML = editComboItems.map((item, index) => `
        <div class="combo-item">
            <div class="combo-item-info">
                <strong>${item.ticket_name}</strong>
                <span>Quantidade: ${item.quantidade}</span>
            </div>
            <button class="btn-icon btn-delete" onClick="removeEditComboItem(${index})" title="Remover">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
            </button>
        </div>
    `).join('');
}

// Fun��o para remover item do combo em edi��o
function removeEditComboItem(index) {
    editComboItems.splice(index, 1);
    renderEditComboItems();
}

// Fun��o para atualizar combo
function updateComboTicket() {
    const comboData = {
        id: document.getElementById('editComboId').value,
        titulo: document.getElementById('editComboTitle').value,
        quantidade_total: parseInt(document.getElementById('editComboQuantity').value),
        preco: converterPrecoParaNumero(document.getElementById('editComboPrice').value),
        inicio_venda: document.getElementById('editComboSaleStart').value,
        fim_venda: document.getElementById('editComboSaleEnd').value,
        descricao: document.getElementById('editComboDescription').value,
        conteudo_combo: editComboItems
    };
    
    // Valida�ões
    if (!comboData.titulo || !comboData.quantidade_total || !comboData.preco) {
        alert('Por favor, preencha todos os campos obrigat�rios');
        return;
    }
    
    if (editComboItems.length === 0) {
        alert('Adicione pelo menos um tipo de ingresso ao combo');
        return;
    }
    
    // Atualizar na lista de ingressos
    updateComboInList(comboData);
    
    // Fechar modal
    closeModal('editComboModal');
    
    console.log('✅ Combo atualizado:', comboData);
}

// Fun��o para atualizar combo na lista
function updateComboInList(comboData) {
    const comboElement = document.querySelector(`[data-ticket-id="${comboData.id}"]`);
    if (!comboElement) return;
    
    // Atualizar t�tulo
    const titleElement = comboElement.querySelector('.ticket-title');
    if (titleElement) {
        titleElement.innerHTML = `
            ${comboData.titulo} ??
            <span class="ticket-type-badge combo">Combo</span>
        `;
    }
    
    // Atualizar detalhes
    const detailsElement = comboElement.querySelector('.ticket-details');
    if (detailsElement) {
        let detailsHTML = `
            <div class="ticket-info">
                <span>Pre�o: <strong>R$ ${comboData.preco.toFixed(2).replace('.', ',')}</strong></span>
                <span>Vendas: ${formatDateForDisplay(comboData.inicio_venda)} - ${formatDateForDisplay(comboData.fim_venda)}</span>
            </div>
        `;
        
        if (comboData.descricao) {
            detailsHTML += `
                <div class="ticket-description">
                    ${comboData.descricao}
                </div>
            `;
        }
        
        // Mostrar itens do combo
        if (comboData.conteudo_combo && comboData.conteudo_combo.length > 0) {
            detailsHTML += `
                <div class="combo-items">
                    <strong>Inclui:</strong>
                    ${comboData.conteudo_combo.map(item => `${item.quantidade}x ${item.ticket_name}`).join(', ')}
                </div>
            `;
        }
        
        detailsElement.innerHTML = detailsHTML;
    }
}

// Fun��o para fechar modal espec�fico para edi��o
function closeEditModal() {
    const modals = ['editPaidTicketModal', 'editFreeTicketModal', 'editComboModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    });
}

console.log('? Fun��es de edi��o de ingressos carregadas');

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initTicketManagement();
        console.log('? Gest�o de ingressos inicializada via DOMContentLoaded');
    });
} else {
    // DOM j� est� pronto
    initTicketManagement();
    console.log('? Gest�o de ingressos inicializada diretamente');
}

// Expor fun��es e vari�veis para escopo global
window.wizardState = {
    currentStep: currentStep,
    totalSteps: totalSteps
};

// Fun��es que precisam acessar currentStep
window.getCurrentStep = function() { return currentStep; };
console.log('🟢 CRIAEVENTO.JS - CHEGANDO PERTO DO FINAL');

window.setCurrentStep = function(step) { 
    currentStep = step; 
    window.wizardState.currentStep = step; 
};

window.nextStep = function() {
    console.log('🚀 NEXTSTEP ORIGINAL EXECUTADO - currentStep:', currentStep);
    if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
            currentStep++;
            window.wizardState.currentStep = currentStep;
            updateStepDisplay();
            console.log('✅ Avançou para step:', currentStep);
        }
    }
};

console.log('🎯 window.nextStep DEFINIDO NO CRIAEVENTO.JS!');

window.prevStep = function() {
    if (currentStep > 1) {
        currentStep--;
        window.wizardState.currentStep = currentStep;
        updateStepDisplay();
    }
};

window.goToStep = function(step) {
    if (step >= 1 && step <= totalSteps) {
        currentStep = step;
        window.wizardState.currentStep = currentStep;
        updateStepDisplay();
    }
};

window.updateStepDisplay = updateStepDisplay;
window.validateStep = validateStep;
console.log('? Fun��es expostas no escopo global - validateStep:', typeof window.validateStep);
window.initMap = initMap;
window.createFreeTicket = createFreeTicket;
window.createPaidTicket = createPaidTicket;
window.initImageUpload = initImageUpload;
window.initAdditionalUploads = initAdditionalUploads;
window.handleImageUpload = handleImageUpload;
window.initSwitches = initSwitches;
window.initProducerSelection = initProducerSelection;
window.initRichEditor = initRichEditor;
window.initCheckboxes = initCheckboxes;
window.initRadioButtons = initRadioButtons;
window.initTicketManagement = initTicketManagement;
window.initAddressSearch = initAddressSearch;
window.initPreviewListeners = initPreviewListeners;
window.initFormSubmission = initFormSubmission;
window.initPriceInput = initPriceInput;
window.initMiniSwitches = initMiniSwitches;
window.initCodeTicketButton = initCodeTicketButton;
window.editTicket = editTicket;
window.removeTicket = removeTicket;
window.openModal = openModal;
window.closeModal = closeModal;
window.addItemToCombo = addItemToCombo;
window.removeComboItem = removeComboItem;
window.createComboTicket = createComboTicket;
window.updateComboItemsList = updateComboItemsList;
window.getTrashIcon = getTrashIcon;
window.editCombo = editCombo;
// window.saveWizardData = saveWizardData; // Removido - persistência
// window.checkAndRestoreWizardData = checkAndRestoreWizardData; // Removido - persistência
// window.deleteCookie = deleteCookie; // Removido - persistência
// window.clearAllWizardData = clearAllWizardData; // Removido - persistência
window.addTicketToList = addTicketToList;
window.updatePreview = updatePreview;

})(); // Fechar escopo IIFE

// Verificar se as fun��es foram exportadas
        // Inicialização quando a página carrega
        document.addEventListener('DOMContentLoaded', function() {
            console.log('📱 Página carregada - verificando se precisa inicializar etapa 5...');
            
            // Verificar se está na etapa 5 ao carregar a página
            setTimeout(() => {
                const etapa5Ativa = document.querySelector('[data-step-content="5"].active');
                if (etapa5Ativa) {
                    console.log('🎯 Página carregou diretamente na etapa 5 - inicializando...');
                    carregarConfiguracaoLimiteVendas();
                }
            }, 1000);
        });
        
        // Funções globais para gerenciar lotes individuais
        window.editarLoteQuantidade = function(loteId) {
            console.log('✏️ Editando lote quantidade:', loteId);
            
            // Buscar dados do lote para edição
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            if (!eventoId) {
                console.error('❌ evento_id não encontrado para edição');
                alert('Erro: ID do evento não encontrado');
                return;
            }
            
            console.log('📦 Carregando dados do lote para edição...');
            
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `action=buscar_lote&lote_id=${loteId}&evento_id=${eventoId}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso && data.lote) {
                    console.log('✅ Dados do lote carregados:', data.lote);
                    abrirModalEdicaoLote(data.lote);
                } else {
                    console.error('❌ Erro ao carregar lote:', data.erro);
                    alert('Erro ao carregar dados do lote: ' + (data.erro || 'Erro desconhecido'));
                }
            })
            .catch(error => {
                console.error('❌ Erro na requisição:', error);
                alert('Erro ao buscar dados do lote. Tente novamente.');
            });
        };
        
        // Função para abrir modal de edição de lote
        function abrirModalEdicaoLote(lote) {
            // Verificar se já existe modal de edição
            let modal = document.getElementById('editLotePercentualModal');
            
            if (!modal) {
                console.error('❌ Modal de edição não encontrado');
                alert('Erro: Modal de edição não encontrado');
                return;
            }
            
            console.log('📝 Carregando dados do lote no modal:', lote);
            console.log('🔍 Valor bruto de divulgar_criterio:', lote.divulgar_criterio, typeof lote.divulgar_criterio);
            
            // Preencher ID e percentual
            document.getElementById('editLotePercentualId').value = lote.id;
            document.getElementById('editLotePercentualValor').value = lote.percentual_venda;
            
            // CORREÇÃO: Carregar divulgar_criterio com valor correto do backend
            const divulgarCheckbox = document.getElementById('editLotePercentualDivulgar');
            if (divulgarCheckbox) {
                console.log(`🔍 Valor de divulgar_criterio recebido:`, lote.divulgar_criterio, typeof lote.divulgar_criterio);
                
                // Aplicar o valor diretamente (backend já converte para boolean)
                divulgarCheckbox.checked = lote.divulgar_criterio;
                
                console.log(`✅ Checkbox definido como: ${divulgarCheckbox.checked}`);
                
                // Verificação adicional para garantir
                setTimeout(() => {
                    if (divulgarCheckbox.checked !== lote.divulgar_criterio) {
                        console.warn('⚠️ Valor não aplicou corretamente, forçando...');
                        divulgarCheckbox.checked = lote.divulgar_criterio;
                    }
                    console.log(`🔍 Estado final confirmado: ${divulgarCheckbox.checked}`);
                }, 50);
                
            } else {
                console.error('❌ Checkbox editLotePercentualDivulgar não encontrado!');
            }
            
            // Mostrar modal
            modal.style.display = 'flex';
            console.log('📝 Modal de edição aberto para lote:', lote.nome || lote.id);
        }
        
        // Função para salvar edição (RENOMEADA para evitar conflito com lotes.js)
        window.salvarEdicaoLotePercentual = function() {
            const loteId = document.getElementById('editLotePercentualId').value;
            const percentual = document.getElementById('editLotePercentualValor').value;
            const divulgar = document.getElementById('editLotePercentualDivulgar').checked;
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            if (!loteId) {
                console.log('ℹ️ Sem ID - pode ser criação de novo lote, redirecionando...');
                // Se não há ID, pode ser criação (chamar função original se existir)
                if (window.criarLotePercentual && typeof window.criarLotePercentual === 'function') {
                    return window.criarLotePercentual();
                }
                return;
            }
            
            if (!percentual || percentual < 1 || percentual > 100) {
                alert('Por favor, informe um percentual válido (1 a 100%).');
                return;
            }
            
            console.log('💾 Salvando edição do lote via função específica:', loteId);
            
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `action=atualizar_lote&lote_id=${loteId}&evento_id=${eventoId}&percentual_venda=${percentual}&divulgar_criterio=${divulgar ? 1 : 0}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    console.log('✅ Lote atualizado com sucesso via função específica');
                    alert('Lote atualizado com sucesso!');
                    
                    // Fechar modal
                    closeModal('editLotePercentualModal');
                    
                    // CORREÇÃO: Atualizar DOM diretamente SEM limpar ou recarregar nada
                    const loteElement = document.querySelector(`[data-lote-id="${loteId}"]`);
                    if (loteElement) {
                        const detailsDiv = loteElement.querySelector('.lote-item-details');
                        if (detailsDiv) {
                            detailsDiv.innerHTML = `<strong>Percentual:</strong> ${percentual}%`;
                            console.log('✅ DOM atualizado diretamente para lote:', loteId);
                        }
                    }
                    
                    console.log('✅ Edição concluída - NENHUM recarregamento ou limpeza executada');
                    
                } else {
                    console.error('❌ Erro ao atualizar lote:', data.erro);
                    alert('Erro ao atualizar lote: ' + (data.erro || 'Erro desconhecido'));
                }
            })
            .catch(error => {
                console.error('❌ Erro na requisição:', error);
                alert('Erro ao salvar alterações. Tente novamente.');
            });
        };
        
        window.excluirLoteQuantidadeEspecifico = function(loteId) {
            console.log('🗑️ Excluindo lote específico:', loteId);
            
            const confirmacao = confirm('Confirma a exclusão deste lote? Esta ação não pode ser desfeita.');
            
            if (confirmacao) {
                const eventoId = new URLSearchParams(window.location.search).get('evento_id');
                
                // Fazer requisição para excluir lote específico
                fetch('/produtor/ajax/wizard_evento.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `action=excluir_lote_especifico&evento_id=${eventoId}&lote_id=${loteId}`
                })
                .then(response => response.json())
                .then(data => {
                    if (data.sucesso) {
                        console.log('✅ Lote excluído com sucesso');
                        
                        // Remover elemento da interface
                        const elemento = document.querySelector(`[data-lote-id="${loteId}"]`);
                        if (elemento) {
                            elemento.remove();
                        }
                        
                        // Recarregar configuração para atualizar interface
                        carregarConfiguracaoLimiteVendas();
                        
                    } else {
                        console.error('❌ Erro ao excluir lote:', data.erro);
                        alert('Erro ao excluir lote: ' + data.erro);
                    }
                })
                .catch(error => {
                    console.error('❌ Erro na requisição:', error);
                    alert('Erro de conexão ao excluir lote.');
                });
            }
        };

console.log('criaevento.js carregado. nextStep disponível:', typeof window.nextStep);

console.log('? criaevento.js carregado completamente! nextStep dispon�vel:', typeof window.nextStep);

console.log('?? Teste final - window.nextStep:', window.nextStep);

console.log('?? Teste final - window.nextStep:', window.nextStep);
