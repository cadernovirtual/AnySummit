// Fix definitivo para limpeza TOTAL após publicação
(function() {
    console.log('🧹 Fix de limpeza total iniciado...');
    
    // Função para limpar ABSOLUTAMENTE TUDO
    window.limparTudoMesmo = function() {
        console.log('🗑️ LIMPEZA TOTAL INICIADA...');
        
        // 1. Listar TODOS os cookies existentes
        console.log('\n🍪 Limpando TODOS os cookies relacionados:');
        const todosOsCookies = document.cookie.split(';');
        
        todosOsCookies.forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name) {
                // Limpar qualquer cookie relacionado ao wizard/evento
                if (name.toLowerCase().includes('evento') || 
                    name.toLowerCase().includes('wizard') || 
                    name.toLowerCase().includes('ingresso') ||
                    name.toLowerCase().includes('lote') ||
                    name.toLowerCase().includes('combo') ||
                    name.toLowerCase().includes('ticket') ||
                    name.toLowerCase().includes('upload') ||
                    name === 'ingressosSalvos' ||
                    name === 'temporaryTickets' ||
                    name === 'comboItems') {
                    
                    // Limpar com TODOS os caminhos possíveis
                    const paths = ['/', '/produtor/', '/produtor', ''];
                    const domains = ['', '.anysummit.com.br', 'anysummit.com.br'];
                    
                    paths.forEach(path => {
                        domains.forEach(domain => {
                            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}`;
                            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
                        });
                    });
                    
                    console.log(`✅ Cookie ${name} removido`);
                }
            }
        });
        
        // 2. Limpar TODO o localStorage
        console.log('\n💾 Limpando localStorage:');
        if (typeof(Storage) !== "undefined") {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                keysToRemove.push(key);
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log(`✅ localStorage.${key} removido`);
            });
        }
        
        // 3. Limpar sessionStorage também
        console.log('\n📦 Limpando sessionStorage:');
        if (typeof(Storage) !== "undefined") {
            const keysToRemove = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                keysToRemove.push(key);
            }
            
            keysToRemove.forEach(key => {
                sessionStorage.removeItem(key);
                console.log(`✅ sessionStorage.${key} removido`);
            });
        }
        
        // 4. Limpar TODAS as variáveis globais relacionadas
        console.log('\n🌐 Limpando variáveis globais:');
        const variaveisParaLimpar = [
            'uploadedImages', 'temporaryTickets', 'comboItems', 
            'lotesData', 'wizardData', 'currentStep', 'eventData',
            'ticketData', 'loteData', 'producerData'
        ];
        
        // Buscar mais variáveis globais que possam existir
        for (let prop in window) {
            if (prop.toLowerCase().includes('wizard') || 
                prop.toLowerCase().includes('evento') || 
                prop.toLowerCase().includes('ticket') ||
                prop.toLowerCase().includes('ingresso') ||
                prop.toLowerCase().includes('combo') ||
                prop.toLowerCase().includes('lote')) {
                variaveisParaLimpar.push(prop);
            }
        }
        
        // Limpar todas
        variaveisParaLimpar.forEach(varName => {
            if (window.hasOwnProperty(varName)) {
                try {
                    delete window[varName];
                    console.log(`✅ window.${varName} removido`);
                } catch (e) {
                    window[varName] = undefined;
                    console.log(`✅ window.${varName} = undefined`);
                }
            }
        });
        
        // 5. Resetar arrays conhecidos
        try { window.temporaryTickets = []; } catch(e) {}
        try { window.comboItems = []; } catch(e) {}
        
        // 6. Limpar managers
        if (window.lotesManager && typeof window.lotesManager.clear === 'function') {
            window.lotesManager.clear();
            console.log('✅ lotesManager limpo');
        }
        
        // 7. Limpar DOM
        console.log('\n📄 Limpando DOM:');
        const elementosParaLimpar = [
            '#ticketsList', '#lotesList', '#combosList',
            '#ticketsContainer', '#lotesContainer'
        ];
        
        elementosParaLimpar.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
                el.innerHTML = '';
                console.log(`✅ ${selector} limpo`);
            }
        });
        
        // 8. Resetar TODOS os formulários
        const forms = document.querySelectorAll('form');
        forms.forEach((form, i) => {
            form.reset();
            console.log(`✅ Formulário ${i} resetado`);
        });
        
        // 9. Limpar previews de imagem
        ['logoPreview', 'capaPreview', 'fundoPreview'].forEach(id => {
            const preview = document.getElementById(id);
            if (preview) {
                preview.innerHTML = `
                    <div class="upload-icon">📤</div>
                    <div class="upload-text">Clique para enviar</div>
                `;
                
                // Limpar input file associado
                const input = document.getElementById(id.replace('Preview', 'Upload'));
                if (input) input.value = '';
            }
        });
        
        console.log('\n✅ LIMPEZA TOTAL CONCLUÍDA!');
    };
    
    // Interceptar sucesso da publicação
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        
        if (url && url.includes('criaeventoapi.php')) {
            return originalFetch.apply(this, args).then(response => {
                const clonedResponse = response.clone();
                
                clonedResponse.json().then(data => {
                    if (data && data.success) {
                        console.log('🎉 Evento publicado! Executando limpeza TOTAL...');
                        
                        // Esperar um pouco para garantir que tudo foi processado
                        setTimeout(() => {
                            window.limparTudoMesmo();
                            
                            // Verificar se ainda há algo
                            setTimeout(() => {
                                const cookiesRestantes = document.cookie.split(';').filter(c => {
                                    const name = c.trim().split('=')[0];
                                    return name && (
                                        name.includes('evento') || 
                                        name.includes('wizard') || 
                                        name.includes('ingresso')
                                    );
                                });
                                
                                if (cookiesRestantes.length > 0) {
                                    console.warn('⚠️ Ainda há cookies restantes:', cookiesRestantes);
                                    // Tentar limpar novamente
                                    window.limparTudoMesmo();
                                }
                            }, 500);
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
    
    console.log('✅ Fix de limpeza total carregado!');
})();