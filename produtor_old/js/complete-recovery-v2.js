/**
 * Sistema Completo de Recuperação de Dados do Wizard V2
 * Recupera todos os campos incluindo preview
 */
(function() {
    console.log('📥 Sistema completo de recuperação V2 iniciado');
    
    // Aguardar sistema de confirmação decidir
    let recuperacaoAutorizada = false;
    
    // Interceptar a função de recuperação
    const originalRecuperar = window.recuperarDadosSalvos;
    window.recuperarDadosSalvos = function() {
        recuperacaoAutorizada = true;
        if (originalRecuperar) {
            originalRecuperar();
        }
        recuperarTodosCampos();
    };
    
    function recuperarTodosCampos() {
        console.log('🔄 Recuperando TODOS os campos...');
        
        // Obter dados salvos
        let dados = null;
        
        if (window.WizardSaveSystemV2 && window.WizardSaveSystemV2.dadosEvento.evento) {
            dados = window.WizardSaveSystemV2.dadosEvento.evento;
        } else {
            // Tentar recuperar dos cookies
            const cookieV2 = getCookie('eventoWizardV2');
            const cookieV1 = getCookie('eventoWizard');
            
            try {
                if (cookieV2) {
                    const parsed = JSON.parse(cookieV2);
                    dados = parsed.evento || {};
                } else if (cookieV1) {
                    dados = JSON.parse(cookieV1);
                }
            } catch (e) {
                console.error('Erro ao parsear dados:', e);
                return;
            }
        }
        
        if (!dados) {
            console.log('❌ Nenhum dado para recuperar');
            return;
        }
        
        // Step 1 - Informações básicas
        recuperarCampo('eventName', dados.nome || dados.eventName);
        recuperarCampo('classification', dados.classificacao || dados.classification);
        recuperarCampo('category', dados.categoria || dados.category);
        
        // Cor de fundo - especial
        const corFundo = dados.cor_fundo || dados.corFundo || '#000000';
        recuperarCorFundo(corFundo);
        
        // Step 2 - Data e horário
        recuperarCampo('startDateTime', dados.data_inicio || dados.startDateTime);
        recuperarCampo('endDateTime', dados.data_fim || dados.endDateTime);
        
        // Step 2 - Local
        recuperarCampo('venueName', dados.nome_local || dados.venueName);
        recuperarCampo('cep', dados.cep);
        recuperarCampo('street', dados.rua || dados.street);
        recuperarCampo('number', dados.numero || dados.number);
        recuperarCampo('complement', dados.complemento || dados.complement);
        recuperarCampo('neighborhood', dados.bairro || dados.neighborhood);
        recuperarCampo('city', dados.cidade || dados.city);
        recuperarCampo('state', dados.estado || dados.state);
        recuperarCampo('addressSearch', dados.busca_endereco || dados.addressSearch);
        recuperarCampo('eventLink', dados.link_online || dados.eventLink);
        
        // Step 3 - Descrição
        recuperarDescricao(dados.descricao_completa || dados.eventDescription);
        
        // Step 4 - Produtor
        recuperarCampo('producerName', dados.nome_produtor || dados.producerName);
        recuperarCampo('displayName', dados.nome_exibicao || dados.displayName);
        recuperarCampo('producerDescription', dados.descricao_produtor || dados.producerDescription);
        
        // Atualizar preview
        atualizarPreview(dados);
        
        console.log('✅ Todos os campos recuperados');
    }
    
    function recuperarCampo(id, valor) {
        if (!valor) return;
        
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.value = valor;
            console.log(`✅ Campo ${id} recuperado:`, valor);
            
            // Disparar evento de mudança
            elemento.dispatchEvent(new Event('input', { bubbles: true }));
            elemento.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    
    function recuperarCorFundo(cor) {
        // Campo hexadecimal
        const corInput = document.getElementById('corFundo');
        if (corInput) {
            corInput.value = cor;
            console.log('✅ Cor de fundo alternativa (hex) recuperada:', cor);
            
            // Disparar evento para atualizar preview
            corInput.dispatchEvent(new Event('input', { bubbles: true }));
            corInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Color picker - procurar o color picker próximo ao campo hexadecimal
        const colorSection = corInput?.closest('.form-group') || corInput?.parentElement;
        if (colorSection) {
            const colorPicker = colorSection.querySelector('input[type="color"]');
            if (colorPicker) {
                colorPicker.value = cor;
                console.log('✅ Color picker atualizado:', cor);
            }
        }
        
        // Se não encontrou pelo contexto, tentar seletor geral
        if (!colorSection) {
            const allColorPickers = document.querySelectorAll('input[type="color"]');
            allColorPickers.forEach(picker => {
                // Verificar se está próximo ao campo corFundo
                const nearbyHexInput = picker.parentElement?.querySelector('#corFundo') ||
                                     picker.closest('.form-group')?.querySelector('#corFundo');
                if (nearbyHexInput) {
                    picker.value = cor;
                    console.log('✅ Color picker alternativo encontrado e atualizado');
                }
            });
        }
        
        // NÃO aplicar no preview principal - isso é para imagem de fundo
        // O preview deve mostrar a imagem de fundo, não a cor alternativa
    }
    
    function recuperarDescricao(descricao) {
        if (!descricao) return;
        
        const descricaoEl = document.getElementById('eventDescription');
        if (descricaoEl) {
            descricaoEl.innerHTML = descricao;
            console.log('✅ Descrição recuperada');
            
            // Disparar evento
            descricaoEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
    
    function atualizarPreview(dados) {
        console.log('🎨 Atualizando preview...');
        
        // Nome do evento no preview
        const previewTitle = document.getElementById('previewTitle');
        if (previewTitle && dados.nome) {
            previewTitle.textContent = dados.nome;
        }
        
        // Descrição no preview
        const previewDescription = document.getElementById('previewDescription');
        if (previewDescription && dados.descricao_texto) {
            previewDescription.textContent = dados.descricao_texto;
        }
        
        // Data no preview
        const previewDate = document.getElementById('previewDate');
        if (previewDate && dados.data_inicio) {
            const dataFormatada = formatarData(dados.data_inicio);
            previewDate.textContent = dataFormatada;
        }
        
        // Local no preview
        const previewLocation = document.getElementById('previewLocation');
        if (previewLocation) {
            if (dados.tipo_local === 'presencial' && dados.nome_local) {
                previewLocation.textContent = dados.nome_local;
            } else if (dados.tipo_local === 'online') {
                previewLocation.textContent = 'Evento Online';
            }
        }
        
        // Classificação no preview
        const previewClassification = document.querySelector('.preview-classification');
        if (previewClassification && dados.classificacao) {
            previewClassification.textContent = dados.classificacao;
        }
        
        // Cor de fundo no preview principal
        const mainPreview = document.querySelector('.preview-main');
        if (mainPreview && dados.cor_fundo) {
            mainPreview.style.backgroundColor = dados.cor_fundo;
        }
        
        // Chamar updatePreview se existir
        if (window.updatePreview && typeof window.updatePreview === 'function') {
            window.updatePreview();
        }
    }
    
    function formatarData(dataString) {
        if (!dataString) return 'Data não definida';
        
        try {
            const data = new Date(dataString);
            const options = {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return data.toLocaleDateString('pt-BR', options);
        } catch (e) {
            return dataString;
        }
    }
    
    // Função auxiliar getCookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
        return null;
    }
    
    // Adicionar ao WizardSaveSystemV2 se existir
    if (window.WizardSaveSystemV2) {
        const originalRecuperarCookies = window.WizardSaveSystemV2.recuperarDeCookies;
        window.WizardSaveSystemV2.recuperarDeCookies = function() {
            originalRecuperarCookies.call(this);
            if (recuperacaoAutorizada) {
                recuperarTodosCampos();
            }
        };
    }
    
    // Expor função globalmente
    window.recuperarTodosCampos = recuperarTodosCampos;
    
    console.log('✅ Sistema de recuperação completo instalado');
})();