// Fix definitivo para limpeza completa dos dados após publicação
(function() {
    console.log('🧹 Fix de limpeza de dados iniciado...');
    
    // Função para limpar TODOS os dados do wizard
    window.limparTodosDadosWizard = function() {
        console.log('🗑️ Iniciando limpeza completa de dados...');
        
        // 1. Limpar cookies
        const cookiesParaLimpar = [
            'eventoWizard',
            'lotesData',
            'ingressosData',
            'ingressosSalvos',  // Adicionar este
            'uploadedImages',
            'temporaryTickets',
            'comboItems'
        ];
        
        cookiesParaLimpar.forEach(cookieName => {
            // Limpar com diferentes caminhos possíveis
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/produtor;`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/produtor/;`;
            console.log(`🍪 Cookie ${cookieName} removido`);
        });
        
        // 2. Limpar localStorage
        if (typeof(Storage) !== "undefined") {
            const keysParaRemover = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (
                    key.includes('evento') || 
                    key.includes('wizard') || 
                    key.includes('ticket') || 
                    key.includes('ingresso') ||
                    key.includes('combo') ||
                    key.includes('lote') ||
                    key.includes('upload')
                )) {
                    keysParaRemover.push(key);
                }
            }
            
            keysParaRemover.forEach(key => {
                localStorage.removeItem(key);
                console.log(`💾 localStorage ${key} removido`);
            });
        }
        
        // 3. Limpar variáveis globais
        const variaveisGlobais = [
            'uploadedImages',
            'temporaryTickets',
            'comboItems',
            'lotesData',
            'wizardData'
        ];
        
        variaveisGlobais.forEach(varName => {
            if (window[varName]) {
                window[varName] = null;
                delete window[varName];
                console.log(`🌐 Variável global ${varName} removida`);
            }
        });
        
        // 4. Resetar arrays específicos
        if (window.temporaryTickets) window.temporaryTickets = [];
        if (window.comboItems) window.comboItems = [];
        
        // 5. Limpar gestores específicos
        if (window.lotesManager && typeof window.lotesManager.clear === 'function') {
            window.lotesManager.clear();
            console.log('📊 lotesManager limpo');
        }
        
        // 6. Limpar DOM - remover todos os tickets da lista
        const ticketsList = document.getElementById('ticketsList');
        if (ticketsList) {
            ticketsList.innerHTML = '';
            console.log('📋 Lista de tickets limpa');
        }
        
        // 7. Resetar formulários
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.reset();
        });
        
        // 8. Limpar campos específicos do wizard
        const camposParaLimpar = [
            'eventName', 'eventLink', 'eventDescription',
            'eventStartDate', 'eventStartTime', 'eventEndDate', 'eventEndTime',
            'addressSearch', 'street', 'number', 'complement', 'neighborhood',
            'city', 'state', 'cep', 'producer', 'producerName', 'displayName',
            'producerDescription'
        ];
        
        camposParaLimpar.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                campo.value = '';
            }
        });
        
        // 9. Limpar previews de imagens
        ['logoPreview', 'capaPreview', 'fundoPreview'].forEach(id => {
            const preview = document.getElementById(id);
            if (preview) {
                preview.innerHTML = `
                    <div class="upload-icon">📤</div>
                    <div class="upload-text">Clique para enviar</div>
                `;
            }
        });
        
        // 10. Resetar cor de fundo
        const corFundo = document.getElementById('corFundo');
        if (corFundo) corFundo.value = '#000000';
        const corFundoHex = document.getElementById('corFundoHex');
        if (corFundoHex) corFundoHex.value = '#000000';
        const colorPreview = document.getElementById('colorPreview');
        if (colorPreview) colorPreview.style.backgroundColor = '#000000';
        
        console.log('✅ Limpeza completa finalizada!');
    };
    
    // Interceptar a resposta de sucesso da API
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        
        // Se for a API de criar evento
        if (url && url.includes('criaeventoapi.php')) {
            return originalFetch.apply(this, args).then(response => {
                // Clonar a resposta para poder ler
                const clonedResponse = response.clone();
                
                // Verificar se foi sucesso
                clonedResponse.json().then(data => {
                    if (data && data.success) {
                        console.log('🎉 Evento criado com sucesso! Limpando dados...');
                        
                        // Aguardar um momento antes de limpar
                        setTimeout(() => {
                            window.limparTodosDadosWizard();
                        }, 100);
                    }
                }).catch(err => {
                    console.error('Erro ao verificar resposta:', err);
                });
                
                return response;
            });
        }
        
        return originalFetch.apply(this, args);
    };
    
    // Função para verificar dados residuais
    window.verificarDadosResiduais = function() {
        console.log('🔍 Verificando dados residuais...');
        
        // Verificar cookies
        console.log('\n🍪 COOKIES:');
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && (
                name.includes('evento') || 
                name.includes('wizard') || 
                name.includes('ticket') ||
                name.includes('ingresso') ||
                name.includes('combo')
            )) {
                console.log(`- ${name}: ${value ? value.substring(0, 50) + '...' : 'vazio'}`);
            }
        });
        
        // Verificar localStorage
        console.log('\n💾 LOCALSTORAGE:');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.includes('evento') || 
                key.includes('wizard') || 
                key.includes('ticket')
            )) {
                const value = localStorage.getItem(key);
                console.log(`- ${key}: ${value ? value.substring(0, 50) + '...' : 'vazio'}`);
            }
        }
        
        // Verificar variáveis globais
        console.log('\n🌐 VARIÁVEIS GLOBAIS:');
        ['uploadedImages', 'temporaryTickets', 'comboItems', 'lotesData'].forEach(varName => {
            if (window[varName]) {
                console.log(`- ${varName}:`, window[varName]);
            }
        });
        
        // Verificar DOM
        console.log('\n📋 DOM:');
        const ticketsList = document.getElementById('ticketsList');
        if (ticketsList) {
            console.log(`- Tickets na lista: ${ticketsList.children.length}`);
        }
    };
    
    console.log('✅ Fix de limpeza carregado!');
    console.log('Use verificarDadosResiduais() para checar dados restantes');
    console.log('Use limparTodosDadosWizard() para limpar manualmente');
})();