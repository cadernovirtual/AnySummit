/**
 * CORREÇÃO ESPECÍFICA - PROBLEMAS 1 e 2
 * 
 * PROBLEMA 1: Dialog de edição - lote não carregado + readonly
 * PROBLEMA 2: Erro "Erro ao identificar o ingresso. ID não encontrado."
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Correção específica para edição de ingressos carregada');
    
    // =======================================================
    // PROBLEMA 1: CORRIGIR MODAL DE EDIÇÃO PAGO
    // =======================================================
    
    // Interceptar preenchimento do modal de edição pago
    if (typeof window.preencherModalEdicaoPago !== 'undefined') {
        const originalPreencherModal = window.preencherModalEdicaoPago;
        
        window.preencherModalEdicaoPago = function(ingresso) {
            console.log('🎭 [INTERCEPTADO] Preenchendo modal de edição pago:', ingresso);
            
            // Chamar função original primeiro
            const resultado = originalPreencherModal.call(this, ingresso);
            
            // Aplicar correções específicas
            setTimeout(() => {
                corrigirModalEdicaoPago(ingresso);
            }, 100);
            
            return resultado;
        };
    }
    
    // Também interceptar a busca de dados do banco
    if (typeof window.buscarDadosIngressoDoBanco !== 'undefined') {
        const originalBuscarDados = window.buscarDadosIngressoDoBanco;
        
        window.buscarDadosIngressoDoBanco = async function(ingressoId) {
            console.log(`🔍 [INTERCEPTADO] Buscando dados do ingresso ${ingressoId}`);
            
            try {
                // Limpar apenas o ID se for temporário
                const idLimpo = ingressoId.toString().replace('ticket_', '');
                const eventoId = new URLSearchParams(window.location.search).get('evento_id');
                
                console.log(`🔍 Buscando ingresso ${idLimpo} no banco...`);
                
                const response = await fetch('/produtor/ajax/wizard_evento.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `action=obter_dados_ingresso&evento_id=${eventoId}&ingresso_id=${idLimpo}`
                });
                
                const data = await response.json();
                
                if (data.sucesso && data.ingresso) {
                    console.log('✅ Dados obtidos do banco:', data.ingresso);
                    
                    // Preencher modal corretamente
                    preencherModalComDadosCorrigidos(data.ingresso);
                    
                } else {
                    console.error('❌ Erro ao buscar:', data.erro);
                    alert('Erro ao carregar dados: ' + (data.erro || 'Ingresso não encontrado'));
                }
                
            } catch (error) {
                console.error('❌ Erro na requisição:', error);
                alert('Erro de conexão ao buscar dados do ingresso.');
            }
        };
    }
    
    // =======================================================
    // FUNÇÃO PARA PREENCHER MODAL CORRIGIDO
    // =======================================================
    
    function preencherModalComDadosCorrigidos(ingresso) {
        console.log('🎭 Preenchendo modal com dados corrigidos:', ingresso);
        
        if (ingresso.tipo === 'pago') {
            // Preencher campos básicos
            const campos = {
                'editPaidTicketId': ingresso.id,
                'editPaidTicketTitle': ingresso.titulo,
                'editPaidTicketDescription': ingresso.descricao || '',
                'editPaidTicketQuantity': ingresso.quantidade_total,
                'editPaidTicketPrice': formatarPreco(ingresso.preco),
                'editPaidSaleStart': ingresso.inicio_venda || '',
                'editPaidSaleEnd': ingresso.fim_venda || '',
                'editPaidMinQuantity': ingresso.limite_min || 1,
                'editPaidMaxQuantity': ingresso.limite_max || 5
            };
            
            Object.keys(campos).forEach(id => {
                const elemento = document.getElementById(id);
                if (elemento) {
                    elemento.value = campos[id];
                    console.log(`✅ Campo preenchido ${id}: ${campos[id]}`);
                } else {
                    console.warn(`⚠️ Campo não encontrado: ${id}`);
                }
            });
            
            // Preencher campos de taxa
            const campoTaxa = document.getElementById('editPaidTicketTaxaValor');
            const campoReceber = document.getElementById('editPaidTicketValorReceber');
            const checkboxTaxa = document.getElementById('editPaidTicketTaxaServico');
            
            if (campoTaxa) campoTaxa.value = formatarPreco(ingresso.taxa_plataforma);
            if (campoReceber) campoReceber.value = formatarPreco(ingresso.valor_receber);
            if (checkboxTaxa) checkboxTaxa.checked = parseFloat(ingresso.taxa_plataforma || 0) > 0;
            
            // DEBUG ESPECÍFICO ANTES DE CONFIGURAR LOTE
            console.log('🔍 [DEBUG] Dados do ingresso completos:', ingresso);
            console.log('🔍 [DEBUG] lote_id encontrado:', ingresso.lote_id);
            console.log('🔍 [DEBUG] Tipo do ingresso:', ingresso.tipo);
            
            // CORRIGIR LABEL DE LOTE
            setTimeout(() => {
                console.log('⏰ [DEBUG] Timeout executado, chamando configurarSelectLoteReadonly...');
                configurarSelectLoteReadonly(ingresso, 'editPaidTicketLoteLabel', 'editPaidTicketLote');
            }, 500); // Aumentar timeout
            
            // Abrir modal
            if (window.openModal) {
                window.openModal('editPaidTicketModal');
            }
            
        } else if (ingresso.tipo === 'gratuito') {
            // Lógica similar para gratuito
            preencherModalGratuitoCorrigido(ingresso);
            
        } else if (ingresso.tipo === 'combo') {
            // Usar o sistema de combo que já criamos
            if (window.preencherModalComboComDadosBanco) {
                window.preencherModalComboComDadosBanco(ingresso);
            }
            
            // CONFIGURAR LABEL DE LOTE PARA COMBO
            setTimeout(() => {
                configurarSelectLoteReadonly(ingresso, 'editComboLoteLabel', 'editComboTicketLote');
            }, 500);
        }
    }
    
    function preencherModalGratuitoCorrigido(ingresso) {
        const campos = {
            'editFreeTicketId': ingresso.id,
            'editFreeTicketTitle': ingresso.titulo,
            'editFreeTicketDescription': ingresso.descricao || '',
            'editFreeTicketQuantity': ingresso.quantidade_total,
            'editFreeSaleStart': ingresso.inicio_venda || '',
            'editFreeSaleEnd': ingresso.fim_venda || '',
            'editFreeMinQuantity': ingresso.limite_min || 1,
            'editFreeMaxQuantity': ingresso.limite_max || 5
        };
        
        Object.keys(campos).forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = campos[id];
            }
        });
        
        // CORRIGIR LABEL DE LOTE PARA GRATUITO
        setTimeout(() => {
            configurarSelectLoteReadonly(ingresso, 'editFreeTicketLoteLabel', 'editFreeTicketLote');
        }, 500); // Aumentar timeout
        
        if (window.openModal) {
            window.openModal('editFreeTicketModal');
        }
    }
    
    // =======================================================
    // CONFIGURAR LABEL DE LOTE (EM VEZ DE SELECT) - CORRIGIDO
    // =======================================================
    
    async function configurarSelectLoteReadonly(ingresso, labelId = 'editPaidTicketLoteLabel', hiddenId = 'editPaidTicketLote') {
        console.log(`🔥 CONFIGURANDO LOTE ${ingresso.lote_id} - BUSCAR TEXTO DO SELECT`);
        
        const labelLote = document.getElementById(labelId);
        const hiddenLote = document.getElementById(hiddenId);
        
        if (!labelLote || !hiddenLote) {
            console.error(`❌ Elementos não encontrados: ${labelId}, ${hiddenId}`);
            return;
        }
        
        // DEFINIR HIDDEN IMEDIATAMENTE
        hiddenLote.value = ingresso.lote_id;
        console.log(`✅ Hidden field definido: ${hiddenLote.value}`);
        
        // IDENTIFICAR QUAL SELECT ORIGINAL USAR
        let selectOriginalId = '';
        if (labelId.includes('Paid')) {
            selectOriginalId = 'paidTicketLote';
        } else if (labelId.includes('Free')) {
            selectOriginalId = 'freeTicketLote';
        } else if (labelId.includes('Combo')) {
            selectOriginalId = 'comboTicketLote';
        }
        
        console.log(`🔍 Buscando no select original: ${selectOriginalId}`);
        
        // BUSCAR TEXTO DA OPÇÃO NO SELECT ORIGINAL
        const selectOriginal = document.getElementById(selectOriginalId);
        let textoEncontrado = false;
        
        if (selectOriginal) {
            // Buscar option com value igual ao lote_id
            const opcaoCorreta = selectOriginal.querySelector(`option[value="${ingresso.lote_id}"]`);
            console.log(`🔍 Opção encontrada:`, opcaoCorreta);
            
            if (opcaoCorreta) {
                const textoOption = opcaoCorreta.textContent.trim();
                const tipoLote = opcaoCorreta.dataset.tipo || opcaoCorreta.getAttribute('data-tipo');
                
                labelLote.textContent = textoOption;
                textoEncontrado = true;
                
                console.log(`✅ TEXTO DO SELECT: "${textoOption}"`);
                console.log(`✅ TIPO DO LOTE: "${tipoLote}"`);
                
                // APLICAR REGRAS DE DATAS SE FOR "Por data"
                if (tipoLote === 'data' || textoOption.includes('Por data')) {
                    aplicarRegrasDatasLotePorData(hiddenId, opcaoCorreta);
                }
            }
        }
        
        // SE NÃO ENCONTROU NO SELECT, FALLBACK
        if (!textoEncontrado) {
            labelLote.textContent = `Lote ID ${ingresso.lote_id}`;
            console.warn(`⚠️ Não encontrou texto no select ${selectOriginalId} para lote ${ingresso.lote_id}`);
        }
    }
    
    function aplicarRegrasDatasLotePorData(hiddenId, opcaoLote) {
        console.log('📅 Aplicando regras de datas - lote Por Data');
        
        // Identificar prefixo baseado no hiddenId
        let prefixo = '';
        if (hiddenId.includes('Paid')) {
            prefixo = 'editPaid';
        } else if (hiddenId.includes('Free')) {
            prefixo = 'editFree';
        } else if (hiddenId.includes('Combo')) {
            prefixo = 'editCombo';
        }
        
        // Campos de data
        const campoInicio = document.getElementById(`${prefixo}SaleStart`);
        const campoFim = document.getElementById(`${prefixo}SaleEnd`);
        
        console.log(`📅 Campos encontrados: ${prefixo}SaleStart, ${prefixo}SaleEnd`);
        
        // Buscar datas do dataset da opção ou do elemento
        const dataInicio = opcaoLote?.dataset?.dataInicio || opcaoLote?.getAttribute('data-inicio');
        const dataFim = opcaoLote?.dataset?.dataFim || opcaoLote?.getAttribute('data-fim');
        
        if (campoInicio && dataInicio) {
            campoInicio.value = dataInicio;
            campoInicio.readOnly = true;
            campoInicio.style.backgroundColor = '#f5f5f5';
            console.log(`✅ Data início definida: ${dataInicio}`);
        }
        
        if (campoFim && dataFim) {
            campoFim.value = dataFim;
            campoFim.readOnly = true;
            campoFim.style.backgroundColor = '#f5f5f5';
            console.log(`✅ Data fim definida: ${dataFim}`);
        }
        
        // Se não tem datas no dataset, tentar buscar dos dados do lote global
        if ((!dataInicio || !dataFim) && window.lotesDoBanco) {
            const loteGlobal = window.lotesDoBanco.find(l => l.id == hiddenLote.value);
            if (loteGlobal && loteGlobal.tipo === 'data') {
                if (campoInicio && loteGlobal.data_inicio) {
                    campoInicio.value = loteGlobal.data_inicio;
                    campoInicio.readOnly = true;
                    campoInicio.style.backgroundColor = '#f5f5f5';
                }
                if (campoFim && loteGlobal.data_fim) {
                    campoFim.value = loteGlobal.data_fim;
                    campoFim.readOnly = true;
                    campoFim.style.backgroundColor = '#f5f5f5';
                }
                console.log('✅ Datas aplicadas dos dados globais');
            }
        }
    }
    
    function adicionarMensagemLoteFixo(selectLote) {
        // Remover mensagens anteriores
        const mensagensAnteriores = selectLote.parentNode.querySelectorAll('.lote-fixo-msg');
        mensagensAnteriores.forEach(msg => msg.remove());
        
        // Criar mensagem
        const mensagem = document.createElement('div');
        mensagem.className = 'lote-fixo-msg';
        mensagem.style.cssText = `
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            margin-top: 5px;
        `;
        mensagem.innerHTML = '🔒 <strong>Lote fixo:</strong> O lote não pode ser alterado após a criação do ingresso.';
        
        // Inserir após o select
        selectLote.parentNode.insertBefore(mensagem, selectLote.nextSibling);
    }
    
    function aplicarRegrasDatasDoLoteEdicao(lote, hiddenId) {
        let prefixo;
        
        if (hiddenId === 'editFreeTicketLote') {
            prefixo = 'editFree';
        } else if (hiddenId === 'editComboTicketLote') {
            prefixo = 'editCombo';
        } else {
            prefixo = 'editPaid';
        }
        
        if (lote.tipo === 'data') {
            // Lote por data - aplicar datas e readonly
            const campoInicio = document.getElementById(`${prefixo}SaleStart`);
            const campoFim = document.getElementById(`${prefixo}SaleEnd`);
            
            if (campoInicio && lote.data_inicio) {
                campoInicio.value = lote.data_inicio;
                campoInicio.readOnly = true;
                campoInicio.style.backgroundColor = '#f0f0f0'; // Cor mais suave
            }
            
            if (campoFim && lote.data_fim) {
                campoFim.value = lote.data_fim;
                campoFim.readOnly = true;
                campoFim.style.backgroundColor = '#f0f0f0'; // Cor mais suave
            }
            
            // Adicionar mensagem sobre datas
            adicionarMensagemDatasFixas(campoInicio);
            
            console.log(`🔒 Datas aplicadas e travadas para lote por data`);
            
        } else {
            // Lote por percentual - liberar campos
            const campoInicio = document.getElementById(`${prefixo}SaleStart`);
            const campoFim = document.getElementById(`${prefixo}SaleEnd`);
            
            if (campoInicio) {
                campoInicio.readOnly = false;
                campoInicio.style.backgroundColor = '';
            }
            
            if (campoFim) {
                campoFim.readOnly = false;
                campoFim.style.backgroundColor = '';
            }
            
            console.log(`🔓 Campos de data liberados para lote por percentual`);
        }
    }
    
    function adicionarMensagemDatasFixas(campoReferencia) {
        if (!campoReferencia || document.querySelector('.datas-fixas-msg')) return;
        
        const mensagem = document.createElement('div');
        mensagem.className = 'datas-fixas-msg';
        mensagem.style.cssText = `
            background-color: #e3f2fd;
            border: 1px solid #2196f3;
            color: #1976d2;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            margin-top: 5px;
        `;
        mensagem.innerHTML = '📅 <strong>Datas fixas:</strong> As datas são herdadas do lote e não podem ser alteradas.';
        
        campoReferencia.parentNode.insertBefore(mensagem, campoReferencia.nextSibling);
    }
    
    // =======================================================
    // PROBLEMA 2: CORRIGIR FUNÇÃO updatePaidTicket
    // =======================================================
    
    // Aguardar outras funções carregarem
    setTimeout(() => {
        corrigirUpdatePaidTicket();
    }, 1500);
    
    function corrigirUpdatePaidTicket() {
        // Sobrescrever updatePaidTicket com versão corrigida
        window.updatePaidTicket = function() {
            console.log('💾 [CORRIGIDO] Salvando alterações do ingresso pago...');
            
            // BUSCAR ID DO INGRESSO COM FALLBACKS
            let ticketId = null;
            
            // Tentar múltiplos campos possíveis
            const camposId = ['editPaidTicketId', 'editTicketId', 'paidTicketId'];
            
            for (const campoId of camposId) {
                const elemento = document.getElementById(campoId);
                if (elemento && elemento.value) {
                    ticketId = elemento.value;
                    console.log(`✅ ID encontrado em ${campoId}: ${ticketId}`);
                    break;
                }
            }
            
            // Se não encontrou, verificar em data attributes do modal
            if (!ticketId) {
                const modal = document.getElementById('editPaidTicketModal');
                if (modal) {
                    ticketId = modal.dataset.ticketId || modal.dataset.ingressoId;
                    if (ticketId) {
                        console.log(`✅ ID encontrado em data attribute: ${ticketId}`);
                    }
                }
            }
            
            if (!ticketId) {
                console.error('❌ ID do ingresso não encontrado em nenhum local');
                alert('Erro interno: ID do ingresso não encontrado. Feche o modal e tente novamente.');
                return;
            }
            
            // COLETAR DADOS DO MODAL
            const dadosIngresso = {
                id: ticketId,
                titulo: document.getElementById('editPaidTicketTitle')?.value || '',
                descricao: document.getElementById('editPaidTicketDescription')?.value || '',
                quantidade_total: parseInt(document.getElementById('editPaidTicketQuantity')?.value) || 0,
                preco: document.getElementById('editPaidTicketPrice')?.value || '',
                lote_id: parseInt(document.getElementById('editPaidTicketLote')?.value) || null,
                inicio_venda: document.getElementById('editPaidSaleStart')?.value || '',
                fim_venda: document.getElementById('editPaidSaleEnd')?.value || '',
                limite_min: parseInt(document.getElementById('editPaidMinQuantity')?.value) || 1,
                limite_max: parseInt(document.getElementById('editPaidMaxQuantity')?.value) || 5
            };
            
            console.log('📊 Dados coletados:', dadosIngresso);
            
            // DEBUG ESPECÍFICO PARA LOTE_ID
            const loteField = document.getElementById('editPaidTicketLote');
            console.log('🔍 DEBUG lote_id:');
            console.log('  - Campo encontrado:', !!loteField);
            console.log('  - Valor do campo:', loteField?.value);
            console.log('  - Valor parseInt:', parseInt(loteField?.value || 0));
            console.log('  - dadosIngresso.lote_id:', dadosIngresso.lote_id);
            
            // VALIDAÇÕES
            if (!dadosIngresso.titulo) {
                alert('Digite o título do ingresso');
                return;
            }
            
            if (!dadosIngresso.quantidade_total || dadosIngresso.quantidade_total <= 0) {
                alert('Digite uma quantidade válida');
                return;
            }
            
            if (!dadosIngresso.preco) {
                alert('Digite o preço do ingresso');
                return;
            }
            
            if (!dadosIngresso.lote_id) {
                console.error('❌ LOTE_ID INVÁLIDO:', dadosIngresso.lote_id);
                alert('Erro: Lote não identificado. Feche o modal e tente novamente.');
                return;
            }
            
            // SALVAR NO BANCO
            salvarIngressoEditado(dadosIngresso);
        };
        
        console.log('✅ Função updatePaidTicket corrigida');
        
        // Também corrigir updateComboTicket
        corrigirUpdateComboTicket();
    }
    
    function corrigirUpdateComboTicket() {
        window.updateComboTicket = function() {
            console.log('💾 [CORRIGIDO] Salvando alterações do combo...');
            
            // BUSCAR ID DO COMBO
            let comboId = null;
            
            const camposId = ['editComboTicketId', 'editComboId'];
            
            for (const campoId of camposId) {
                const elemento = document.getElementById(campoId);
                if (elemento && elemento.value) {
                    comboId = elemento.value;
                    console.log(`✅ ID do combo encontrado em ${campoId}: ${comboId}`);
                    break;
                }
            }
            
            if (!comboId) {
                console.error('❌ ID do combo não encontrado');
                alert('Erro interno: ID do combo não encontrado. Feche o modal e tente novamente.');
                return;
            }
            
            // COLETAR DADOS DO MODAL
            const dadosCombo = {
                id: comboId,
                titulo: document.getElementById('editComboTitle')?.value || '',
                descricao: document.getElementById('editComboDescription')?.value || '',
                preco: document.getElementById('editComboPrice')?.value || '',
                lote_id: parseInt(document.getElementById('editComboTicketLote')?.value) || null,
                inicio_venda: document.getElementById('editComboSaleStart')?.value || '',
                fim_venda: document.getElementById('editComboSaleEnd')?.value || '',
                limite_min: parseInt(document.getElementById('editComboMinQuantity')?.value) || 1,
                limite_max: parseInt(document.getElementById('editComboMaxQuantity')?.value) || 5
            };
            
            console.log('📊 Dados do combo coletados:', dadosCombo);
            
            // VALIDAÇÕES
            if (!dadosCombo.titulo) {
                alert('Digite o título do combo');
                return;
            }
            
            if (!dadosCombo.preco) {
                alert('Digite o preço do combo');
                return;
            }
            
            if (!dadosCombo.lote_id) {
                alert('Selecione um lote para o combo');
                return;
            }
            
            // COLETAR ITENS DO COMBO
            const itensCombo = coletarItensDoCombo();
            if (!itensCombo || itensCombo.length === 0) {
                alert('Adicione pelo menos um item ao combo');
                return;
            }
            
            dadosCombo.conteudo_combo = JSON.stringify(itensCombo);
            
            // SALVAR NO BANCO
            salvarComboEditado(dadosCombo);
        };
        
        console.log('✅ Função updateComboTicket corrigida');
    }
    
    function coletarItensDoCombo() {
        // Usar a função global se existir
        if (typeof window.coletarItensDoCombo === 'function') {
            return window.coletarItensDoCombo();
        }
        
        // Fallback: coletar de window.comboItems
        if (window.comboItems && Array.isArray(window.comboItems)) {
            return window.comboItems.map(item => ({
                ingresso_id: item.ingresso_id || item.ticket_id || item.id,
                quantidade: item.quantidade || item.quantity
            })).filter(item => item.ingresso_id && item.quantidade);
        }
        
        return [];
    }
    
    async function salvarComboEditado(dados) {
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            // Converter preço
            const precoLimpo = dados.preco.toString()
                .replace(/[^\d,]/g, '')
                .replace(',', '.');
            const precoFloat = parseFloat(precoLimpo);
            
            if (isNaN(precoFloat) || precoFloat < 0) {
                alert('Preço inválido');
                return;
            }
            
            // Calcular taxa
            const taxaCalculada = precoFloat * 0.08; // 8% para combos
            const valorReceber = precoFloat - taxaCalculada;
            
            const dadosEnvio = {
                action: 'salvar_ingresso_individual',
                evento_id: eventoId,
                ingresso: JSON.stringify({ // ENVIAR COMO JSON no campo 'ingresso'
                    id: dados.id, // IMPORTANTE: incluir ID para UPDATE
                    titulo: dados.titulo,
                    descricao: dados.descricao,
                    tipo: 'combo',
                    quantidade_total: 100, // Padrão para combos
                    preco: precoFloat.toFixed(2),
                    taxa_plataforma: taxaCalculada.toFixed(2),
                    valor_receber: valorReceber.toFixed(2),
                    lote_id: dados.lote_id,
                    inicio_venda: dados.inicio_venda,
                    fim_venda: dados.fim_venda,
                    limite_min: dados.limite_min,
                    limite_max: dados.limite_max,
                    conteudo_combo: dados.conteudo_combo
                })
            };
            
            console.log('📤 Enviando dados do combo:', dadosEnvio);
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(dadosEnvio).toString()
            });
            
            // VERIFICAR SE RESPOSTA É VÁLIDA ANTES DE PARSEAR
            const contentType = response.headers.get('content-type');
            console.log('📥 Content-Type da resposta:', contentType);
            
            let resultado;
            const responseText = await response.text();
            console.log('📄 Resposta bruta:', responseText);
            
            try {
                resultado = JSON.parse(responseText);
                console.log('📥 Resposta JSON:', resultado);
            } catch (jsonError) {
                console.error('❌ Erro ao parsear JSON:', jsonError);
                console.error('📄 Resposta que causou erro:', responseText);
                alert('Erro do servidor: ' + responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
                return;
            }
            
            if (resultado.sucesso) {
                alert('Combo salvo com sucesso!');
                
                // Fechar modal
                if (window.closeModal) {
                    window.closeModal('editComboTicketModal');
                }
                
                // Recarregar lista se função existir
                if (window.recarregarIngressosEtapa6) {
                    window.recarregarIngressosEtapa6();
                }
                
            } else {
                alert('Erro ao salvar combo: ' + (resultado.erro || 'Erro desconhecido'));
            }
            
        } catch (error) {
            console.error('❌ Erro ao salvar combo:', error);
            alert('Erro de conexão. Tente novamente.');
        }
    }
    
    // =======================================================
    // FUNÇÃO PARA SALVAR INGRESSO EDITADO
    // =======================================================
    
    async function salvarIngressoEditado(dados) {
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            // Converter preço
            const precoLimpo = dados.preco.toString()
                .replace(/[^\d,]/g, '')
                .replace(',', '.');
            const precoFloat = parseFloat(precoLimpo);
            
            if (isNaN(precoFloat) || precoFloat < 0) {
                alert('Preço inválido');
                return;
            }
            
            // Calcular taxa
            const taxaCalculada = precoFloat * 0.05;
            const valorReceber = precoFloat - taxaCalculada;
            
            const dadosEnvio = {
                action: 'salvar_ingresso_individual',
                evento_id: eventoId,
                ingresso: JSON.stringify({ // ENVIAR COMO JSON no campo 'ingresso'
                    id: dados.id, // IMPORTANTE: incluir ID para UPDATE
                    titulo: dados.titulo,
                    descricao: dados.descricao,
                    tipo: 'pago',
                    quantidade_total: dados.quantidade_total,
                    preco: precoFloat.toFixed(2),
                    taxa_plataforma: taxaCalculada.toFixed(2),
                    valor_receber: valorReceber.toFixed(2),
                    lote_id: dados.lote_id,
                    inicio_venda: dados.inicio_venda,
                    fim_venda: dados.fim_venda,
                    limite_min: dados.limite_min,
                    limite_max: dados.limite_max
                })
            };
            
            console.log('📤 Enviando dados:', dadosEnvio);
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(dadosEnvio).toString()
            });
            
            // VERIFICAR SE RESPOSTA É VÁLIDA ANTES DE PARSEAR
            const contentType = response.headers.get('content-type');
            console.log('📥 Content-Type da resposta:', contentType);
            
            let resultado;
            const responseText = await response.text();
            console.log('📄 Resposta bruta:', responseText);
            
            try {
                resultado = JSON.parse(responseText);
                console.log('📥 Resposta JSON:', resultado);
            } catch (jsonError) {
                console.error('❌ Erro ao parsear JSON:', jsonError);
                console.error('📄 Resposta que causou erro:', responseText);
                alert('Erro do servidor: ' + responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
                return;
            }
            
            if (resultado.sucesso) {
                alert('Ingresso salvo com sucesso!');
                
                // Fechar modal
                if (window.closeModal) {
                    window.closeModal('editPaidTicketModal');
                }
                
                // Recarregar lista se função existir
                if (window.recarregarIngressosEtapa6) {
                    window.recarregarIngressosEtapa6();
                }
                
            } else {
                alert('Erro ao salvar: ' + (resultado.erro || 'Erro desconhecido'));
            }
            
        } catch (error) {
            console.error('❌ Erro ao salvar:', error);
            alert('Erro de conexão. Tente novamente.');
        }
    }
    
    // =======================================================
    // FUNÇÃO AUXILIAR
    // =======================================================
    
    function formatarPreco(preco) {
        if (!preco) return 'R$ 0,00';
        return `R$ ${parseFloat(preco).toFixed(2).replace('.', ',')}`;
    }
    
    console.log('✅ Correção específica configurada');
});
