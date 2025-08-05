// Correções do Wizard - AnySummit
// Arquivo para corrigir persistência de dados e exposição de funções

(function() {
    'use strict';
    
    // Primeiro, garantir que as funções do criaevento.js estejam disponíveis
    console.log('🔧 Iniciando wizard-fix.js...');
    
    // Aguardar carregamento do DOM e dos outros scripts
    function initWizardFix() {
        console.log('✅ Wizard Fix iniciado');
        
        // Verificar se as funções básicas existem - aguardar um pouco mais se necessário
        let tentativas = 0;
        const maxTentativas = 10;
        
        function verificarFuncoes() {
            tentativas++;
            console.log(`🔍 Tentativa ${tentativas} de verificar funções...`);
            
            if (typeof window.nextStep === 'function') {
                console.log('✅ Função nextStep encontrada!');
                
                // Garantir outras funções essenciais
                const essentialFunctions = ['prevStep', 'validateStep', 'updateStepDisplay', 'saveWizardData'];
                essentialFunctions.forEach(funcName => {
                    if (typeof window[funcName] === 'function') {
                        console.log(`✅ Função ${funcName} encontrada`);
                    } else {
                        console.warn(`⚠️ Função ${funcName} não encontrada`);
                    }
                });
                
                // Configurar listeners adicionais se necessário
                setupAdditionalListeners();
                
            } else if (tentativas < maxTentativas) {
                console.log('⏳ Aguardando carregamento das funções...');
                setTimeout(verificarFuncoes, 100);
            } else {
                console.error('❌ Função nextStep não encontrada após várias tentativas!');
                // Criar função de emergência apenas se realmente necessário
                criarFuncaoEmergencia();
            }
        }
        
        // Iniciar verificação
        verificarFuncoes();
    }
    
    function criarFuncaoEmergencia() {
        console.warn('⚠️ Criando função de emergência para nextStep');
        // Não sobrescrever se já existe
        if (typeof window.nextStep === 'function') {
            console.log('✅ nextStep já existe, não criando emergência');
            return;
        }
        
        window.nextStep = function() {
            console.log('nextStep chamada (emergência)');
            // Usar wizardState se disponível
            const stepAtual = (window.wizardState && window.wizardState.currentStep) || 1;
            if (typeof window.validateStep === 'function' && window.validateStep(stepAtual)) {
                const novoStep = stepAtual + 1;
                if (window.wizardState) {
                    window.wizardState.currentStep = novoStep;
                }
                if (window.setCurrentStep) {
                    window.setCurrentStep(novoStep);
                }
                if (typeof window.updateStepDisplay === 'function') {
                    window.updateStepDisplay();
                }
            }
        };
    }
    
    function setupAdditionalListeners() {
        console.log('🔧 Configurando listeners adicionais...');
        // Aqui podemos adicionar qualquer configuração adicional necessária
    }
    
    // Executar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWizardFix);
    } else {
        // DOM já carregado
        setTimeout(initWizardFix, 100);
    }
    
    // Função corrigida para atualizar o preview hero
    window.updateHeroPreview = function(eventName, startDateTime, venueName, eventLink, isPresential) {
        console.log('🎨 Atualizando preview hero...');
        
        // Atualizar imagem de fundo
        const heroBackground = document.getElementById('heroBackground');
        const heroSection = document.querySelector('.hero-section-mini');
        const fundoImg = document.querySelector('#fundoPreviewMain img');
        const corFundo = document.getElementById('corFundo')?.value || '#000000';
        
        if (heroBackground && heroSection) {
            if (fundoImg && fundoImg.src && !fundoImg.src.includes('blob:')) {
                // Tem imagem de fundo
                heroBackground.style.backgroundImage = `url(${fundoImg.src})`;
                heroBackground.style.backgroundColor = '';
                heroBackground.style.opacity = '1';
                heroSection.classList.remove('solid-bg');
                console.log('✅ Imagem de fundo aplicada:', fundoImg.src);
            } else {
                // Usar cor sólida
                heroBackground.style.backgroundImage = '';
                heroBackground.style.backgroundColor = corFundo;
                heroBackground.style.opacity = '1';
                heroSection.classList.add('solid-bg');
                console.log('✅ Cor de fundo aplicada:', corFundo);
            }
        }

        // Atualizar logo
        const heroLogo = document.getElementById('heroLogo');
        const logoImg = document.querySelector('#logoPreviewContainer img');
        
        if (heroLogo && logoImg && logoImg.src && !logoImg.src.includes('blob:')) {
            heroLogo.src = logoImg.src;
            heroLogo.style.display = 'block';
            console.log('✅ Logo aplicado:', logoImg.src);
        } else if (heroLogo) {
            heroLogo.style.display = 'none';
        }

        // Atualizar imagem capa quadrada
        const heroCapa = document.getElementById('heroCapa');
        const capaImg = document.querySelector('#capaPreviewContainer img');
        
        if (heroCapa && capaImg && capaImg.src && !capaImg.src.includes('blob:')) {
            heroCapa.src = capaImg.src;
            heroCapa.style.display = 'block';
            console.log('✅ Capa aplicada:', capaImg.src);
        } else if (heroCapa) {
            heroCapa.style.display = 'none';
        }
    };
    
    // Corrigir upload de imagens
    window.handleImageUpload = async function(input, containerId, type) {
        const file = input.files[0];
        if (!file) return;

        // Validar tipo
        if (!file.type.match('image.*')) {
            alert('Por favor, selecione apenas arquivos de imagem.');
            return;
        }

        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB.');
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

                // Mostrar botão de limpar
                const clearButton = document.getElementById('clear' + type.charAt(0).toUpperCase() + type.slice(1));
                if (clearButton) {
                    clearButton.style.display = 'flex';
                }
                
                // Atualizar preview - IMPORTANTE!
                if (typeof window.updatePreview === 'function') {
                    window.updatePreview();
                }
                
                // Também chamar updateHeroPreview diretamente
                if (typeof window.updateHeroPreview === 'function') {
                    window.updateHeroPreview();
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

            // Primeiro verificar se a resposta é OK
            if (!response.ok) {
                console.error('❌ Erro HTTP:', response.status, response.statusText);
                alert(`Erro no servidor: ${response.status}`);
                return;
            }

            // Tentar obter o texto da resposta primeiro
            const responseText = await response.text();
            console.log('📄 Resposta do servidor:', responseText);

            // Verificar se é JSON válido
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (jsonError) {
                console.error('❌ Resposta não é JSON válido:', responseText);
                alert('Erro no servidor: resposta inválida');
                return;
            }

            if (data.success) {
                // Salvar caminho da imagem
                if (!window.uploadedImages) {
                    window.uploadedImages = {};
                }
                window.uploadedImages[type] = data.image_url;
                console.log(`✅ ${type} enviado:`, data.image_url);
                
                // Atualizar a imagem no container com a URL do servidor
                const container = document.getElementById(containerId);
                const img = container?.querySelector('img');
                if (img) {
                    img.src = data.image_url;
                }
                
                // Salvar no wizard
                if (typeof window.saveWizardData === 'function') {
                    window.saveWizardData();
                }
                
                // Atualizar preview novamente com a URL final
                if (typeof window.updatePreview === 'function') {
                    window.updatePreview();
                }
                
                // Também chamar updateHeroPreview diretamente
                if (typeof window.updateHeroPreview === 'function') {
                    window.updateHeroPreview();
                }
            } else {
                console.error('❌ Erro no upload:', data.message);
                alert(`Erro ao enviar imagem: ${data.message}`);
            }
        } catch (error) {
            console.error('❌ Erro ao fazer upload:', error);
            alert('Erro ao enviar imagem. Verifique o console.');
        }
    };
    
    // Listener para mudança de cor
    function setupColorListener() {
        const corFundo = document.getElementById('corFundo');
        const corFundoHex = document.getElementById('corFundoHex');
        
        if (corFundo) {
            corFundo.addEventListener('change', function() {
                console.log('🎨 Cor alterada:', this.value);
                if (typeof window.updatePreview === 'function') {
                    window.updatePreview();
                }
                if (typeof window.updateHeroPreview === 'function') {
                    window.updateHeroPreview();
                }
            });
        }
        
        if (corFundoHex) {
            corFundoHex.addEventListener('input', function() {
                if (/^#[0-9A-F]{6}$/i.test(this.value)) {
                    console.log('🎨 Cor hex alterada:', this.value);
                    if (typeof window.updatePreview === 'function') {
                        window.updatePreview();
                    }
                    if (typeof window.updateHeroPreview === 'function') {
                        window.updateHeroPreview();
                    }
                }
            });
        }
    }
    
    // Reconfigurar listeners de upload após carregamento
    function setupImageUploads() {
        console.log('🖼️ Configurando uploads de imagem...');
        
        // Logo do evento
        const logoUpload = document.getElementById('logoUpload');
        if (logoUpload) {
            // Remover listeners antigos
            const newLogoUpload = logoUpload.cloneNode(true);
            logoUpload.parentNode.replaceChild(newLogoUpload, logoUpload);
            
            newLogoUpload.addEventListener('change', function() {
                window.handleImageUpload(this, 'logoPreviewContainer', 'logo');
            });
            console.log('✅ Upload de logo configurado');
        }

        // Capa quadrada
        const capaUpload = document.getElementById('capaUpload');
        if (capaUpload) {
            // Remover listeners antigos
            const newCapaUpload = capaUpload.cloneNode(true);
            capaUpload.parentNode.replaceChild(newCapaUpload, capaUpload);
            
            newCapaUpload.addEventListener('change', function() {
                window.handleImageUpload(this, 'capaPreviewContainer', 'capa');
            });
            console.log('✅ Upload de capa configurado');
        }

        // Imagem de fundo
        const fundoUpload = document.getElementById('fundoUpload');
        if (fundoUpload) {
            // Remover listeners antigos
            const newFundoUpload = fundoUpload.cloneNode(true);
            fundoUpload.parentNode.replaceChild(newFundoUpload, fundoUpload);
            
            newFundoUpload.addEventListener('change', function() {
                window.handleImageUpload(this, 'fundoPreviewMain', 'fundo');
            });
            console.log('✅ Upload de fundo configurado');
        }
        
        // Configurar listener de cor
        setupColorListener();
    }
    
    // Executar setup de imagens após um pequeno delay
    setTimeout(setupImageUploads, 500);
    
    // Substituir função coletarDadosFormulario
    window.coletarDadosFormulario = async function() {
        console.log('📋 Coletando dados do formulário...');
        
        // 1. INFORMAÇÕES BÁSICAS
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
            // Dados presenciais completos
            busca_endereco: document.getElementById('addressSearch')?.value || '',
            nome_local: document.getElementById('venueName')?.value || '',
            cep: document.getElementById('cep')?.value || '',
            rua: document.getElementById('street')?.value || '',
            numero: document.getElementById('number')?.value || '',
            complemento: document.getElementById('complement')?.value || '',
            bairro: document.getElementById('neighborhood')?.value || '',
            cidade: document.getElementById('city')?.value || '',
            estado: document.getElementById('state')?.value || '',
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
            visibilidade: document.querySelector('.radio.checked[data-value]')?.dataset.value || 'public',
            termos_aceitos: document.getElementById('termsCheckbox')?.classList.contains('checked') || false
        };
        
        // 7. IMAGENS - Coletar URLs das imagens
        const imagens = {
            logo_evento: '',
            imagem_capa: '',
            imagem_fundo: '',
            cor_fundo: document.getElementById('corFundo')?.value || '#000000'
        };
        
        // Verificar se temos imagens uploadadas
        if (window.uploadedImages) {
            imagens.logo_evento = window.uploadedImages.logo || '';
            imagens.imagem_capa = window.uploadedImages.capa || '';
            imagens.imagem_fundo = window.uploadedImages.fundo || '';
        }
        
        // Também verificar nos elementos da página
        const logoImg = document.querySelector('#logoPreviewContainer img');
        const capaImg = document.querySelector('#capaPreviewContainer img');
        const fundoImg = document.querySelector('#fundoPreviewMain img');
        
        if (logoImg && logoImg.src && !logoImg.src.includes('blob:')) {
            imagens.logo_evento = logoImg.src;
        }
        if (capaImg && capaImg.src && !capaImg.src.includes('blob:')) {
            imagens.imagem_capa = capaImg.src;
        }
        if (fundoImg && fundoImg.src && !fundoImg.src.includes('blob:')) {
            imagens.imagem_fundo = fundoImg.src;
        }
        
        // 8. LOTES - Coletar dados dos lotes
        const lotes = coletarDadosLotes();
        
        // 9. INGRESSOS
        const ingressos = coletarDadosIngressosCompleto();
        
        // DADOS COMPLETOS
        const dadosCompletos = {
            evento: {
                ...informacoesBasicas,
                ...dataHorario,
                ...descricao,
                ...localizacao,
                ...produtor,
                ...configuracoes,
                ...imagens
            },
            lotes: lotes,
            ingressos: ingressos
        };
        
        console.log('✅ Dados coletados para PHP:', dadosCompletos);
        return dadosCompletos;
    };
    
    // Função para coletar dados dos lotes
    window.coletarDadosLotes = function() {
        const lotes = [];
        
        // Coletar lotes do sistema de lotes
        if (window.lotesData) {
            // Lotes por data
            if (window.lotesData.porData && window.lotesData.porData.length > 0) {
                window.lotesData.porData.forEach(lote => {
                    lotes.push({
                        tipo: 'data',
                        nome: lote.nome,
                        data_inicio: lote.dataInicio,
                        data_fim: lote.dataFim,
                        divulgar_criterio: lote.divulgar ? 1 : 0
                    });
                });
            }
            
            // Lotes por percentual
            if (window.lotesData.porPercentual && window.lotesData.porPercentual.length > 0) {
                window.lotesData.porPercentual.forEach(lote => {
                    lotes.push({
                        tipo: 'percentual',
                        nome: lote.nome,
                        percentual_venda: lote.percentual,
                        divulgar_criterio: lote.divulgar ? 1 : 0
                    });
                });
            }
        }
        
        console.log('📦 Lotes coletados:', lotes);
        return lotes;
    };
    
    // Função melhorada para coletar dados dos ingressos
    window.coletarDadosIngressosCompleto = function() {
        const ingressos = [];
        const ticketItems = document.querySelectorAll('.ticket-item');
        
        console.log('🎟️ Coletando', ticketItems.length, 'ingressos...');
        
        ticketItems.forEach((item, index) => {
            // Verificar se tem dados salvos no elemento
            const ticketData = item.ticketData;
            if (ticketData) {
                // Usar dados salvos no elemento
                const ingresso = {
                    tipo: ticketData.type === 'paid' ? 'pago' : ticketData.type,
                    titulo: ticketData.title,
                    descricao: ticketData.description || '',
                    quantidade_total: parseInt(ticketData.quantity),
                    preco: parseFloat(ticketData.price) || 0,
                    valor_receber: ticketData.valorReceber || (ticketData.price * 0.92),
                    taxa_plataforma: ticketData.taxaPlataforma || (ticketData.price * 0.08),
                    inicio_venda: ticketData.saleStart || new Date().toISOString().slice(0, 16),
                    fim_venda: ticketData.saleEnd || new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 16),
                    limite_min: parseInt(ticketData.minQuantity) || 1,
                    limite_max: parseInt(ticketData.maxQuantity) || 5,
                    lote_id: ticketData.loteId || item.dataset.loteId || null,
                    ativo: 1,
                    posicao_ordem: index + 1
                };
                
                // Adicionar dados de combo se existirem
                if (ticketData.comboData) {
                    ingresso.conteudo_combo = ticketData.comboData.itens;
                }
                
                ingressos.push(ingresso);
            } else {
                // Fallback: extrair dados do HTML
                const ticketName = item.querySelector('.ticket-name')?.textContent?.trim() || `Ingresso ${index + 1}`;
                const buyerPriceText = item.querySelector('.ticket-buyer-price')?.textContent || '';
                const loteId = item.dataset.loteId || null;
                
                let tipo = 'gratuito';
                let preco = 0;
                
                if (buyerPriceText.includes('R$')) {
                    tipo = 'pago';
                    const match = buyerPriceText.match(/R\$\s*([\d,.]+)/);
                    if (match) {
                        preco = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
                    }
                } else if (item.dataset.comboData) {
                    tipo = 'combo';
                }
                
                const ingresso = {
                    tipo: tipo,
                    titulo: ticketName,
                    descricao: '',
                    quantidade_total: 100, // Default
                    preco: preco,
                    valor_receber: preco * 0.92,
                    taxa_plataforma: preco * 0.08,
                    inicio_venda: new Date().toISOString().slice(0, 16),
                    fim_venda: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 16),
                    limite_min: 1,
                    limite_max: 5,
                    lote_id: loteId,
                    ativo: 1,
                    posicao_ordem: index + 1
                };
                
                // Adicionar dados de combo se existirem
                if (item.dataset.comboData) {
                    try {
                        const comboData = JSON.parse(item.dataset.comboData);
                        ingresso.conteudo_combo = comboData.itens;
                    } catch(e) {
                        console.error('Erro ao parsear combo data:', e);
                    }
                }
                
                ingressos.push(ingresso);
            }
        });
        
        console.log('✅ Total de ingressos coletados:', ingressos.length);
        return ingressos;
    };
    
    console.log('✅ Correções do wizard carregadas');
    
})();

console.log('🔧 wizard-fix.js carregado');
