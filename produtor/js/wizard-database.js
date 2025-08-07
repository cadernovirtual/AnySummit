/**
 * Sistema de integração do wizard com salvamento no banco de dados
 * 
 * Este arquivo gerencia:
 * - Criação/retomada de evento em rascunho
 * - Salvamento automático de cada etapa
 * - Publicação final do evento
 */

(function() {
    'use strict';
    
    let eventoId = null;
    let salvandoDados = false;
    
    console.log('🔧 Sistema de salvamento do wizard iniciado');
    
    /**
     * Inicializar ou retomar evento ao carregar a página
     */
    window.addEventListener('DOMContentLoaded', function() {
        // Debug - testar sessão
        fetch('/produtor/ajax/test_session.php')
            .then(response => response.json())
            .then(data => {
                console.log('🔍 Debug Sessão:', data);
            })
            .catch(error => {
                console.error('Erro ao testar sessão:', error);
            });
        
        // Teste manual de criação de evento
        window.testarCriacaoEvento = function() {
            fetch('/produtor/ajax/test_create_event.php')
                .then(response => response.json())
                .then(data => {
                    console.log('🧪 Teste de criação:', data);
                })
                .catch(error => {
                    console.error('Erro no teste:', error);
                });
        };
        
        console.log('💡 Para testar criação de evento, execute: testarCriacaoEvento()');
        
        // Verificar se há um evento_id na URL (para edição)
        const urlParams = new URLSearchParams(window.location.search);
        const eventoIdUrl = urlParams.get('evento_id');
        
        if (eventoIdUrl) {
            // Se tem evento_id na URL, retoma evento existente
            retomarEvento(eventoIdUrl);
        } else {
            // NÃO criar evento automaticamente
            console.log('📝 Novo evento - será criado apenas quando o usuário preencher dados');
            
            // Definir modo como "novo"
            window.modoEdicao = false;
            eventoId = null;
        }
    });
    
    /**
     * Iniciar novo evento em rascunho
     */
    function iniciarNovoEvento() {
        fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'action=iniciar_evento'
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                eventoId = data.evento_id;
                console.log('✅ Evento iniciado:', eventoId);
                
                if (data.nome) {
                    // É um rascunho existente, perguntar se quer continuar
                    if (confirm(`Você tem um evento em rascunho: "${data.nome}". Deseja continuar editando?`)) {
                        retomarEvento(eventoId);
                    } else {
                        // Criar novo evento (implementar se necessário)
                        console.log('Usuário optou por criar novo evento');
                    }
                }
            } else {
                console.error('Erro ao iniciar evento:', data.erro);
                alert('Erro ao iniciar evento. Por favor, tente novamente.');
            }
        })
        .catch(error => {
            console.error('Erro na requisição:', error);
            console.error('Detalhes:', error.message);
            
            // Tentar fazer uma requisição de teste
            fetch('/produtor/ajax/test_session.php')
                .then(r => r.json())
                .then(d => console.log('Teste de sessão funcionou:', d))
                .catch(e => console.error('Teste de sessão falhou:', e));
            
            // Por enquanto, continuar sem salvar no banco
            console.warn('⚠️ Continuando sem salvamento no banco de dados');
            // alert('Erro de conexão. Por favor, verifique sua internet.');
        });
    }
    
    /**
     * Retomar evento existente
     */
    function retomarEvento(id) {
        eventoId = id;
        window.modoEdicao = true; // Marcar como modo edição
        
        console.log('📋 Retomando evento ID:', id);
        
        // Mostrar spinner de carregamento
        window.mostrarSpinnerCarregamento();
        
        fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `action=retomar_evento&evento_id=${id}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                console.log('✅ Evento retomado:', data.evento);
                preencherDadosEvento(data.evento, data.lotes, data.ingressos);
                
                // Aguardar 5 segundos para imagens carregarem
                setTimeout(() => {
                    window.esconderSpinnerCarregamento();
                    console.log('✅ Carregamento completo - evento pronto para edição');
                }, 5000);
            } else {
                window.esconderSpinnerCarregamento();
                console.error('Erro ao retomar evento:', data.erro);
                alert('Erro ao carregar dados do evento.');
            }
        })
        .catch(error => {
            window.esconderSpinnerCarregamento();
            console.error('Erro na requisição:', error);
        });
    }
    
    /**
     * Preencher formulário com dados do evento
     */
    function preencherDadosEvento(evento, lotes, ingressos) {
        console.log('📝 Preenchendo dados do evento:', evento);
        console.log('📦 [DEBUG] Lotes recebidos na função preencherDadosEvento:', lotes);
        console.log('📦 [DEBUG] Tipo dos lotes:', typeof lotes, Array.isArray(lotes));
        console.log('📦 [DEBUG] Quantidade de lotes:', lotes ? lotes.length : 'undefined');
        
        console.log('🎨 Cor de fundo:', evento.cor_fundo);
        console.log('🖼️ Imagens:', {
            logo: evento.logo_evento,
            capa: evento.imagem_capa,
            fundo: evento.imagem_fundo
        });
        
        // IMPORTANTE: Manter na etapa 1 ao retomar
        window.currentStep = 1;
        if (window.setCurrentStep) {
            window.setCurrentStep(1);
            console.log('🔧 CurrentStep mantido em 1 ao retomar evento');
        }
        
        // Forçar exibição da etapa 1
        if (window.showStep) {
            window.showStep(1);
        }
        
        // Forçar atualização visual também
        setTimeout(() => {
            if (window.updateStepDisplay) {
                window.updateStepDisplay();
            }
            
            // Garantir que está na etapa 1
            const stepItems = document.querySelectorAll('.step-item');
            stepItems.forEach((item, index) => {
                if (index === 0) { // Etapa 1
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // Mostrar apenas conteúdo da etapa 1
            const steps = document.querySelectorAll('.step-content');
            steps.forEach((step, index) => {
                if (index === 0) { // Etapa 1
                    step.classList.add('active');
                    step.style.display = 'block';
                } else {
                    step.classList.remove('active');
                    step.style.display = 'none';
                }
            });
            
            // Verificar se os elementos existem após atualização
            console.log('🔍 Verificando elementos após updateStepDisplay:');
            console.log('- eventName:', document.getElementById('eventName'));
            console.log('- corFundo:', document.getElementById('corFundo'));
            console.log('- bgColorDisplay:', document.getElementById('bgColorDisplay'));
            console.log('- logoPreviewContainer:', document.getElementById('logoPreviewContainer'));
        }, 100);
        
        // Etapa 1
        if (evento.nome) {
            const eventNameInput = document.getElementById('eventName');
            if (eventNameInput) {
                eventNameInput.value = evento.nome;
                console.log('✅ Nome definido:', evento.nome);
            } else {
                console.error('❌ Campo eventName não encontrado');
            }
        }
        
        if (evento.cor_fundo) {
            const corFundoInput = document.getElementById('corFundo');
            const bgColorDisplay = document.getElementById('colorPreview'); // Mudança aqui
            
            if (corFundoInput) {
                corFundoInput.value = evento.cor_fundo;
                console.log('✅ Input cor definido:', evento.cor_fundo);
            } else {
                console.error('❌ Campo corFundo não encontrado');
            }
            
            if (bgColorDisplay) {
                bgColorDisplay.style.backgroundColor = evento.cor_fundo;
                console.log('✅ Display cor definido:', evento.cor_fundo);
            } else {
                console.error('❌ Elemento colorPreview não encontrado');
            }
        }
        
        // Imagens - Adicionar delay para garantir que elementos existam
        setTimeout(() => {
            console.log('🖼️ Tentando preencher imagens após delay...');
            
            if (evento.logo_evento) {
                const logoContainer = document.getElementById('logoPreviewContainer');
                console.log('Logo container encontrado?', !!logoContainer);
                
                if (logoContainer) {
                    logoContainer.innerHTML = `
                        <img src="${evento.logo_evento}" alt="Logo">
                        <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                        <div class="upload-hint">800x200px</div>
                    `;
                    // Salvar no window.uploadedImages
                    if (!window.uploadedImages) window.uploadedImages = {};
                    window.uploadedImages.logo = evento.logo_evento;
                    
                    // Mostrar botão de limpar
                    const clearLogoBtn = document.getElementById('clearLogo');
                    if (clearLogoBtn) clearLogoBtn.style.display = 'flex';
                    
                    console.log('✅ Logo preenchido com sucesso');
                } else {
                    console.error('❌ Container do logo não encontrado');
                }
            }
            
            if (evento.imagem_capa) {
                const capaContainer = document.getElementById('capaPreviewContainer');
                console.log('Capa container encontrado?', !!capaContainer);
                
                if (capaContainer) {
                    capaContainer.innerHTML = `
                        <img src="${evento.imagem_capa}" alt="Capa">
                        <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                        <div class="upload-hint">450x450px</div>
                    `;
                    // Salvar no window.uploadedImages
                    if (!window.uploadedImages) window.uploadedImages = {};
                    window.uploadedImages.capa = evento.imagem_capa;
                    
                    // Mostrar botão de limpar
                    const clearCapaBtn = document.getElementById('clearCapa');
                    if (clearCapaBtn) clearCapaBtn.style.display = 'flex';
                    
                    console.log('✅ Capa preenchida com sucesso');
                } else {
                    console.error('❌ Container da capa não encontrado');
                }
            }
            
            if (evento.imagem_fundo) {
                const fundoContainer = document.getElementById('fundoPreviewMain');
                console.log('Fundo container encontrado?', !!fundoContainer);
                
                if (fundoContainer) {
                    fundoContainer.innerHTML = `<img src="${evento.imagem_fundo}" alt="Fundo">`;
                    
                    // Salvar no window.uploadedImages
                    if (!window.uploadedImages) window.uploadedImages = {};
                    window.uploadedImages.fundo = evento.imagem_fundo;
                    
                    // Mostrar botão de limpar
                    const clearFundoBtn = document.getElementById('clearFundo');
                    if (clearFundoBtn) clearFundoBtn.style.display = 'flex';
                    
                    console.log('✅ Fundo preenchido com sucesso');
                } else {
                    console.error('❌ Container do fundo não encontrado');
                }
            }
            
            console.log('📸 window.uploadedImages após preenchimento:', window.uploadedImages);
            
        }, 1000); // Aumentar delay para 1 segundo
        
        // Etapa 2
        if (evento.classificacao) document.getElementById('classification').value = evento.classificacao;
        if (evento.categoria_id) document.getElementById('category').value = evento.categoria_id;
        if (evento.data_inicio) {
            const dataInicio = new Date(evento.data_inicio);
            document.getElementById('startDateTime').value = dataInicio.toISOString().slice(0, 16);
        }
        if (evento.data_fim) {
            const dataFim = new Date(evento.data_fim);
            document.getElementById('endDateTime').value = dataFim.toISOString().slice(0, 16);
        }
        
        // Etapa 3
        if (evento.descricao) {
            const descricaoElement = document.getElementById('eventDescription');
            if (descricaoElement) {
                // É um div contenteditable
                descricaoElement.innerHTML = evento.descricao;
                console.log('✅ Descrição restaurada');
            }
        }
        
        // Etapa 4
        if (evento.tipo_local === 'online') {
            document.getElementById('locationTypeSwitch').classList.remove('active');
            if (evento.link_online) document.getElementById('eventLink').value = evento.link_online;
        } else {
            document.getElementById('locationTypeSwitch').classList.add('active');
            if (evento.nome_local) document.getElementById('venueName').value = evento.nome_local;
            if (evento.busca_endereco) document.getElementById('addressSearch').value = evento.busca_endereco;
            if (evento.cep) document.getElementById('cep').value = evento.cep;
            if (evento.rua) document.getElementById('street').value = evento.rua;
            if (evento.numero) document.getElementById('number').value = evento.numero;
            if (evento.complemento) document.getElementById('complement').value = evento.complemento;
            if (evento.bairro) document.getElementById('neighborhood').value = evento.bairro;
            if (evento.cidade) document.getElementById('city').value = evento.cidade;
            if (evento.estado) document.getElementById('state').value = evento.estado;
        }
        
        // Etapa 5 - Lotes
        console.log('📦 [DEBUG] Verificando lotes para restauração...');
        console.log('📦 [DEBUG] lotes:', lotes);
        console.log('📦 [DEBUG] lotes.length:', lotes ? lotes.length : 'undefined');
        console.log('📦 [DEBUG] Condição (lotes && lotes.length > 0):', lotes && lotes.length > 0);
        
        if (lotes && lotes.length > 0) {
            console.log('✅ [DEBUG] Entrando na restauração de lotes:', lotes);
            console.log('📦 [DEBUG] Verificando se window.restaurarLotes existe:', typeof window.restaurarLotes);
            
            if (window.restaurarLotes) {
                console.log('🔄 [DEBUG] Chamando window.restaurarLotes com:', lotes);
                window.restaurarLotes(lotes);
                console.log('✅ [DEBUG] window.restaurarLotes executado');
            } else {
                console.error('❌ Função restaurarLotes não encontrada!');
            }
        } else {
            console.log('⚠️ [DEBUG] Nenhum lote para restaurar ou condição falsa');
            console.log('📦 [DEBUG] lotes:', lotes);
        }
        
        // CORREÇÃO PROBLEMA 1: Carregar controle de limite de vendas ao retomar evento
        setTimeout(() => {
            if (window.carregarControleLimit) {
                console.log('🔄 Carregando controle de limite de vendas ao retomar evento...');
                window.carregarControleLimit();
            } else {
                console.error('❌ Função carregarControleLimit não encontrada!');
            }
        }, 1000);
        
        // Etapa 6 - Ingressos
        if (ingressos && ingressos.length > 0) {
            console.log('🎟️ Restaurando ingressos:', ingressos);
            if (window.restaurarIngressos) {
                window.restaurarIngressos(ingressos);
            } else {
                console.error('❌ Função restaurarIngressos não encontrada!');
            }
        }
        
        // Etapa 7 - Organizador (Contratante)
        if (evento.contratante_id) {
            const contratanteSelect = document.getElementById('contratante');
            if (contratanteSelect) {
                contratanteSelect.value = evento.contratante_id;
            }
        }
        
        // Etapa 8 - Termos
        if (evento.visibilidade) {
            const visibilityRadio = document.querySelector(`.radio[data-value="${evento.visibilidade}"]`);
            if (visibilityRadio) {
                document.querySelectorAll('.radio').forEach(r => r.classList.remove('checked'));
                visibilityRadio.classList.add('checked');
            }
        }
        if (evento.termos_aceitos) {
            document.getElementById('termsCheckbox').classList.add('checked');
        }
    }
    
    /**
     * Salvar dados da etapa atual
     */
    function salvarEtapaAtual(etapa) {
        // Se não tem evento ainda, criar agora
        if (!eventoId && etapa === 1) {
            console.log('🆕 Criando evento ao salvar primeira etapa...');
            
            // Primeiro criar o evento
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'action=iniciar_evento'
            })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    eventoId = data.evento_id;
                    console.log('✅ Evento criado:', eventoId);
                    
                    // Agora salvar a etapa
                    salvarEtapaComEventoId(etapa);
                } else {
                    console.error('Erro ao criar evento:', data.erro);
                    alert('Erro ao salvar. Por favor, tente novamente.');
                }
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
            });
            
            return; // Sair e aguardar criação do evento
        }
        
        // Se já tem evento, salvar direto
        if (eventoId) {
            salvarEtapaComEventoId(etapa);
        }
    }
    
    /**
     * Salvar etapa quando já tem evento ID
     */
    function salvarEtapaComEventoId(etapa) {
        if (salvandoDados) return;
        
        salvandoDados = true;
        console.log(`💾 Salvando etapa ${etapa}...`);
        
        const formData = new FormData();
        formData.append('action', 'salvar_etapa');
        formData.append('evento_id', eventoId);
        formData.append('etapa', etapa);
        
        // Coletar dados específicos de cada etapa
        switch(etapa) {
            case 1:
                formData.append('nome', document.getElementById('eventName').value);
                formData.append('cor_fundo', document.getElementById('corFundo').value);
                formData.append('logo_evento', window.uploadedImages?.logo || '');
                formData.append('imagem_capa', window.uploadedImages?.capa || '');
                formData.append('imagem_fundo', window.uploadedImages?.fundo || '');
                break;
                
            case 2:
                formData.append('classificacao', document.getElementById('classification').value);
                formData.append('categoria_id', document.getElementById('category').value);
                formData.append('data_inicio', document.getElementById('startDateTime').value);
                formData.append('data_fim', document.getElementById('endDateTime').value || document.getElementById('startDateTime').value);
                break;
                
            case 3:
                // Debug para descrição
                console.log('📝 Salvando descrição...');
                
                const descricaoElement = document.getElementById('eventDescription');
                let descricao = '';
                
                if (descricaoElement) {
                    // É um div contenteditable
                    descricao = descricaoElement.innerHTML || descricaoElement.innerText || '';
                    console.log('Descrição encontrada:', descricao);
                } else {
                    console.error('❌ Elemento eventDescription não encontrado!');
                }
                
                formData.append('descricao', descricao);
                break;
                
            case 4:
                const isPresencial = document.getElementById('locationTypeSwitch').classList.contains('active');
                formData.append('tipo_local', isPresencial ? 'presencial' : 'online');
                
                if (isPresencial) {
                    formData.append('nome_local', document.getElementById('venueName').value);
                    formData.append('busca_endereco', document.getElementById('addressSearch').value);
                    formData.append('cep', document.getElementById('cep').value);
                    formData.append('rua', document.getElementById('street').value);
                    formData.append('numero', document.getElementById('number').value);
                    formData.append('complemento', document.getElementById('complement').value);
                    formData.append('bairro', document.getElementById('neighborhood').value);
                    formData.append('cidade', document.getElementById('city').value);
                    formData.append('estado', document.getElementById('state').value);
                    
                    // Adicionar latitude/longitude se disponíveis
                    const latInput = document.getElementById('latitude');
                    const lngInput = document.getElementById('longitude');
                    
                    if (latInput && latInput.value) {
                        formData.append('latitude', latInput.value);
                    } else if (window.selectedLocation && window.selectedLocation.lat) {
                        formData.append('latitude', window.selectedLocation.lat);
                    }
                    
                    if (lngInput && lngInput.value) {
                        formData.append('longitude', lngInput.value);
                    } else if (window.selectedLocation && window.selectedLocation.lng) {
                        formData.append('longitude', window.selectedLocation.lng);
                    }
                } else {
                    formData.append('link_online', document.getElementById('eventLink').value);
                }
                break;
                
            case 5:
                // NOVO: Usar sistema MySQL para coletar dados de lotes
                console.log('📋 [MYSQL] Coletando dados de lotes...');
                let lotes = [];
                
                if (typeof window.coletarDadosLotesMySQL === 'function') {
                    try {
                        // Como não podemos usar await aqui, vamos usar Promise.resolve
                        Promise.resolve(window.coletarDadosLotesMySQL()).then(lotesResult => {
                            lotes = lotesResult || [];
                            console.log(`✅ ${lotes.length} lotes coletados via MySQL`);
                            formData.append('lotes', JSON.stringify(lotes));
                        }).catch(error => {
                            console.error('❌ Erro ao coletar lotes via MySQL:', error);
                            lotes = [];
                            formData.append('lotes', JSON.stringify(lotes));
                        });
                    } catch (error) {
                        console.error('❌ Erro ao coletar lotes via MySQL:', error);
                        lotes = [];
                        formData.append('lotes', JSON.stringify(lotes));
                    }
                } else {
                    console.warn('⚠️ coletarDadosLotesMySQL não encontrada - usando sistema antigo');
                    const lotesAntigo = coletarDadosLotes();
                    lotes = lotesAntigo || [];
                    formData.append('lotes', JSON.stringify(lotes));
                }
                break;
                
            case 6:
                const ingressos = coletarDadosIngressos();
                formData.append('ingressos', JSON.stringify(ingressos));
                break;
                
            case 7:
                const contratanteSelect = document.getElementById('contratante');
                formData.append('contratante_id', contratanteSelect?.value || '');
                break;
                
            case 8:
                const visibilityChecked = document.querySelector('.radio.checked[data-value]');
                formData.append('visibilidade', visibilityChecked?.dataset.value || 'publico');
                formData.append('termos_aceitos', document.getElementById('termsCheckbox').classList.contains('checked'));
                break;
        }
        
        // Converter FormData para URLSearchParams
        const params = new URLSearchParams();
        for (const [key, value] of formData) {
            params.append(key, value);
        }
        
        fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                console.log(`✅ Etapa ${etapa} salva com sucesso`);
            } else {
                console.error(`Erro ao salvar etapa ${etapa}:`, data.erro);
                alert(`Erro ao salvar: ${data.erro}`);
            }
        })
        .catch(error => {
            console.error('Erro na requisição:', error);
            alert('Erro ao salvar. Por favor, tente novamente.');
        })
        .finally(() => {
            salvandoDados = false;
        });
    }
    
    /**
     * Coletar dados dos lotes
     */
    function coletarDadosLotes() {
        console.log('📋 Coletando dados dos lotes...');
        const lotes = [];
        
        // Verificar se window.lotesData existe
        if (!window.lotesData) {
            console.warn('window.lotesData não encontrado');
            return lotes;
        }
        
        // Coletar lotes por data
        if (window.lotesData.porData && window.lotesData.porData.length > 0) {
            console.log(`📅 Coletando ${window.lotesData.porData.length} lotes por data`);
            window.lotesData.porData.forEach((lote, index) => {
                const loteData = {
                    nome: lote.nome || `Lote ${index + 1}`,
                    tipo: 'data',
                    data_inicio: lote.dataInicio || '',
                    data_fim: lote.dataFim || '',
                    divulgar: lote.divulgar ? 1 : 0
                };
                console.log(`Lote por data ${index + 1}:`, loteData);
                lotes.push(loteData);
            });
        }
        
        // Coletar lotes por percentual
        if (window.lotesData.porPercentual && window.lotesData.porPercentual.length > 0) {
            console.log(`📊 Coletando ${window.lotesData.porPercentual.length} lotes por percentual`);
            window.lotesData.porPercentual.forEach((lote, index) => {
                const loteData = {
                    nome: lote.nome || `Lote ${index + 1}`,
                    tipo: 'percentual',
                    percentual_vendido: lote.percentual || 0,
                    divulgar: lote.divulgar ? 1 : 0
                };
                console.log(`Lote por percentual ${index + 1}:`, loteData);
                lotes.push(loteData);
            });
        }
        
        console.log('📊 Total de lotes coletados:', lotes.length);
        console.log('📦 Dados dos lotes:', lotes);
        
        return lotes;
    }
    
    /**
     * Coletar dados dos ingressos
     */
    function coletarDadosIngressos() {
        const ingressos = [];
        const ticketItems = document.querySelectorAll('.ticket-item');
        
        console.log(`📋 Coletando dados de ${ticketItems.length} ingressos...`);
        
        ticketItems.forEach((item, index) => {
            const ticketData = item.ticketData || {};
            
            console.log(`🎫 Ingresso ${index + 1} - ticketData:`, ticketData);
            console.log(`🎫 Ingresso ${index + 1} - item.dataset:`, item.dataset);
            
            // Mapear tipo para português
            let tipo = 'pago'; // padrão
            const tipoOriginal = ticketData.type || item.dataset.ticketType || 'paid';
            
            switch(tipoOriginal.toLowerCase()) {
                case 'paid':
                case 'pago':
                    tipo = 'pago';
                    break;
                case 'free':
                case 'gratuito':
                    tipo = 'gratuito';
                    break;
                case 'combo':
                    tipo = 'combo';
                    break;
                default:
                    tipo = 'pago';
            }
            
            // Buscar campos de data nos elementos do DOM
            const startDateField = item.querySelector('input[name*="start"], input[name*="inicio"], input[id*="start"], input[id*="inicio"]');
            const endDateField = item.querySelector('input[name*="end"], input[name*="fim"], input[id*="end"], input[id*="fim"]');
            
            // Buscar campo de lote
            const loteField = item.querySelector('select[name*="lote"], select[id*="lote"], [data-lote-nome]');
            
            const inicio_venda = ticketData.startDate || ticketData.inicio_venda || 
                                startDateField?.value || null;
            const fim_venda = ticketData.endDate || ticketData.fim_venda || 
                             endDateField?.value || null;
            
            // CORREÇÃO CRÍTICA: Coletar lote_id ao invés de lote_nome!!!
            let lote_id = null;
            
            // Prioridade 1: ticketData.loteId
            if (ticketData.loteId && ticketData.loteId !== '' && ticketData.loteId !== '0') {
                lote_id = parseInt(ticketData.loteId);
                console.log(`✅ lote_id de ticketData.loteId: ${lote_id}`);
            }
            // Prioridade 2: ticketData.lote_id  
            else if (ticketData.lote_id && ticketData.lote_id !== '' && ticketData.lote_id !== '0') {
                lote_id = parseInt(ticketData.lote_id);
                console.log(`✅ lote_id de ticketData.lote_id: ${lote_id}`);
            }
            // Prioridade 3: Buscar nos modais
            else {
                const selects = [
                    document.getElementById('paidTicketLote'),
                    document.getElementById('freeTicketLote'),
                    document.getElementById('editPaidTicketLote'),
                    document.getElementById('editFreeTicketLote')
                ];
                
                for (const select of selects) {
                    if (select && select.value && select.value !== '' && select.value !== '0') {
                        lote_id = parseInt(select.value);
                        console.log(`✅ lote_id de modal ${select.id}: ${lote_id}`);
                        break;
                    }
                }
            }
            
            const ingresso = {
                tipo: tipo,
                titulo: ticketData.title || item.querySelector('.ticket-name')?.textContent || '',
                descricao: ticketData.description || '',
                quantidade: parseInt(ticketData.quantity) || 100,
                preco: parseFloat(ticketData.price) || 0,
                taxa_plataforma: parseFloat(ticketData.taxaPlataforma) || 0,
                valor_receber: parseFloat(ticketData.valorReceber) || parseFloat(ticketData.price) || 0,
                inicio_venda: inicio_venda,
                fim_venda: fim_venda,
                limite_min: parseInt(ticketData.minQuantity) || 1,
                limite_max: parseInt(ticketData.maxQuantity) || 5,
                lote_id: lote_id,  // APENAS lote_id - SEM lote_nome!
                conteudo_combo: ''  // Campo obrigatório - vazio por padrão
            };
            
            // Se é combo, incluir dados do combo
            if (tipo === 'combo' && ticketData.comboData) {
                ingresso.conteudo_combo = JSON.stringify(ticketData.comboData);
                console.log(`🎭 Combo detectado - conteudo_combo: ${ingresso.conteudo_combo}`);
            } else {
                // Para tipos pago e gratuito, garantir string vazia
                ingresso.conteudo_combo = '';
                console.log(`📝 Tipo ${tipo} - conteudo_combo definido como string vazia`);
            }
            
            // Log dos campos críticos
            console.log(`  - tipo original: "${tipoOriginal}" -> mapeado: "${ingresso.tipo}"`);
            console.log(`  - inicio_venda: "${ingresso.inicio_venda}"`);
            console.log(`  - fim_venda: "${ingresso.fim_venda}"`);
            console.log(`  - lote_id: "${ingresso.lote_id}"`);
            console.log(`  - startDateField: ${startDateField ? startDateField.id + '=' + startDateField.value : 'NÃO ENCONTRADO'}`);
            console.log(`  - endDateField: ${endDateField ? endDateField.id + '=' + endDateField.value : 'NÃO ENCONTRADO'}`);
            
            
            if (ingresso.tipo === 'combo' && ticketData.comboData) {
                ingresso.conteudo_combo = ticketData.comboData;
            }
            
            ingressos.push(ingresso);
        });
        
        console.log('📦 Ingressos coletados finais:', ingressos);
        return ingressos;
    }
    
    /**
     * Interceptar mudança de etapa para salvar automaticamente
     */
    if (window.nextStep) {
        const originalNextStep = window.nextStep;
        window.nextStep = function() {
            const currentStep = window.getCurrentStep ? window.getCurrentStep() : 1;
            
            // PULAR salvamento da etapa 6 (ingressos são salvos imediatamente)
            if (currentStep === 6) {
                console.log('⏭️ Etapa 6: Pulando salvamento automático - ingressos já foram salvos imediatamente');
                return originalNextStep.apply(this, arguments);
            }
            
            // Salvar etapa atual antes de avançar, mas com lógica específica para etapa 5
            if (currentStep === 5) {
                // Para etapa 5 (lotes), verificar se há lotes para salvar
                const temLotesParaSalvar = verificarSeTemLotesParaSalvar();
                if (temLotesParaSalvar) {
                    console.log('💾 Salvando etapa 5 - há lotes para preservar');
                    salvarEtapaAtual(currentStep);
                } else {
                    console.log('⚠️ Etapa 5: não há lotes novos para salvar - preservando existentes');
                }
            } else {
                console.log(`💾 Salvando etapa ${currentStep} antes de avançar`);
                salvarEtapaAtual(currentStep);
            }
            
            // Chamar função original
            return originalNextStep.apply(this, arguments);
        };
    }
    
    /**
     * Publicar evento
     */
    window.publicarEvento = function() {
        if (!eventoId) {
            alert('Erro: ID do evento não encontrado');
            return;
        }
        
        if (!confirm('Tem certeza que deseja publicar este evento? Após publicado, algumas informações não poderão ser alteradas.')) {
            return;
        }
        
        // Salvar última etapa antes de publicar
        salvarEtapaAtual(8);
        
        setTimeout(() => {
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `action=publicar_evento&evento_id=${eventoId}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    alert('Evento publicado com sucesso!');
                    window.location.href = '/produtor/meuseventos.php';
                } else {
                    alert(`Erro ao publicar: ${data.erro}`);
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao publicar evento');
            });
        }, 500);
    };
    
    /**
     * Pausar evento (salvar como pausado para continuar depois)
     */
    window.pausarEvento = function() {
        if (!eventoId) return;
        
        // Salvar etapa atual
        const currentStep = window.getCurrentStep ? window.getCurrentStep() : 1;
        salvarEtapaAtual(currentStep);
        
        setTimeout(() => {
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `action=pausar_evento&evento_id=${eventoId}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    alert('Evento salvo! Você pode continuar editando quando quiser.');
                    window.location.href = '/produtor/meuseventos.php';
                }
            })
            .catch(error => {
                console.error('Erro:', error);
            });
        }, 500);
    };
    
    // Expor ID do evento globalmente
    window.getEventoId = function() {
        return eventoId;
    };
    
    // Debug - verificar se as funções existem
    console.log('🔍 Verificando funções antes de exportar:');
    console.log('- salvarEtapaAtual:', typeof salvarEtapaAtual);
    console.log('- salvarEtapaComEventoId:', typeof salvarEtapaComEventoId);
    
    // Expor função de salvar etapa
    window.salvarEtapaAtual = salvarEtapaAtual;
    window.salvarEtapaComEventoId = salvarEtapaComEventoId;
    window.coletarDadosLotes = coletarDadosLotes;
    window.coletarDadosIngressos = coletarDadosIngressos;
    
    /**
     * Verificar se há lotes para salvar
     */
    function verificarSeTemLotesParaSalvar() {
        try {
            // Verificar se há dados de lotes no window.lotesData
            if (window.lotesData) {
                const totalLotes = (window.lotesData.porData?.length || 0) + (window.lotesData.porPercentual?.length || 0);
                console.log(`🔍 Verificando lotes: ${totalLotes} lotes encontrados em window.lotesData`);
                if (totalLotes > 0) {
                    return true;
                }
            }
            
            // Verificar se há dados no WizardDataCollector
            if (window.WizardDataCollector && window.WizardDataCollector.dados?.lotes) {
                const lotes = window.WizardDataCollector.dados.lotes;
                console.log(`🔍 Verificando lotes no WizardDataCollector: ${lotes.length} lotes`);
                if (lotes.length > 0) {
                    return true;
                }
            }
            
            // Verificar se há lotes visíveis na interface
            const lotesPorData = document.querySelectorAll('#lotesPorDataList .lote-item');
            const lotesPorPercentual = document.querySelectorAll('#lotesPorPercentualList .lote-item');
            const totalLotesInterface = lotesPorData.length + lotesPorPercentual.length;
            
            if (totalLotesInterface > 0) {
                console.log(`🔍 Verificando lotes na interface: ${totalLotesInterface} lotes visíveis`);
                return true;
            }
            
            console.log('🔍 Nenhum lote encontrado para salvar');
            return false;
            
        } catch (error) {
            console.error('❌ Erro ao verificar lotes:', error);
            return false;
        }
    }
    
    console.log('✅ Sistema de salvamento do wizard carregado');
    
})();
