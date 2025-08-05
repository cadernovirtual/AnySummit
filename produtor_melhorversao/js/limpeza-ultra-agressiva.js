// Limpeza ULTRA AGRESSIVA com garantia de execução
(function() {
    console.log('💀 LIMPEZA ULTRA AGRESSIVA INICIADA...');
    
    // Função de limpeza definitiva
    window.LIMPAR_TUDO_AGORA = function() {
        console.log('\n🔥🔥🔥 LIMPEZA TOTAL EM EXECUÇÃO 🔥🔥🔥');
        
        // 1. Pegar TODOS os nomes de cookies antes de limpar
        const todosOsCookies = [];
        document.cookie.split(';').forEach(cookie => {
            const name = cookie.split('=')[0].trim();
            if (name) todosOsCookies.push(name);
        });
        
        console.log(`\n📋 ${todosOsCookies.length} cookies encontrados para limpar`);
        
        // 2. Limpar cada cookie com FORÇA BRUTA
        todosOsCookies.forEach(cookieName => {
            console.log(`🗑️ Eliminando: ${cookieName}`);
            
            // Tentar TODAS as combinações possíveis
            const paths = [
                '/', 
                '/produtor/', 
                '/produtor', 
                '/produtor/novoevento',
                '/produtor/novoevento.php',
                '',
                window.location.pathname,
                window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))
            ];
            
            const domains = [
                '', 
                '.anysummit.com.br', 
                'anysummit.com.br',
                window.location.hostname,
                '.' + window.location.hostname,
                'localhost',
                '.localhost'
            ];
            
            // Aplicar TODAS as combinações
            paths.forEach(path => {
                domains.forEach(domain => {
                    // Múltiplos métodos de limpeza
                    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain};`;
                    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; secure;`;
                    document.cookie = `${cookieName}=; max-age=-1; path=${path}; domain=${domain};`;
                    document.cookie = `${cookieName}=; max-age=0; path=${path}; domain=${domain};`;
                });
                
                // Sem domain também
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path};`;
                document.cookie = `${cookieName}=; max-age=0; path=${path};`;
            });
            
            // Última tentativa sem path nem domain
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
            document.cookie = `${cookieName}=; max-age=0;`;
        });
        
        // 3. Limpar TODOS os storages
        console.log('\n💾 Limpando storages...');
        try { localStorage.clear(); console.log('✅ localStorage limpo'); } catch(e) {}
        try { sessionStorage.clear(); console.log('✅ sessionStorage limpo'); } catch(e) {}
        
        // 4. Destruir TODAS as variáveis globais suspeitas
        console.log('\n🌐 Destruindo variáveis globais...');
        const variaveisParaDestruir = [];
        
        // Buscar todas as propriedades do window
        for (let prop in window) {
            if (prop.match(/wizard|evento|ticket|ingresso|combo|lote|upload|temporary/i)) {
                variaveisParaDestruir.push(prop);
            }
        }
        
        // Adicionar conhecidas
        ['temporaryTickets', 'comboItems', 'lotesData', 'wizardData', 'uploadedImages'].forEach(v => {
            if (!variaveisParaDestruir.includes(v)) variaveisParaDestruir.push(v);
        });
        
        // Destruir todas
        variaveisParaDestruir.forEach(varName => {
            try {
                delete window[varName];
                window[varName] = undefined;
                console.log(`✅ Destruída: window.${varName}`);
            } catch(e) {}
        });
        
        // 5. Limpar DOM
        console.log('\n📄 Limpando DOM...');
        const seletores = [
            '#ticketsList', '#lotesList', '#combosList',
            '.ticket-item', '.lote-item', '.combo-item',
            '[id*="ticket"]', '[id*="lote"]', '[id*="combo"]'
        ];
        
        seletores.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (el.id && (el.id.includes('List') || el.classList.contains('item'))) {
                    el.innerHTML = '';
                    console.log(`✅ Limpo: ${sel}`);
                }
            });
        });
        
        // 6. Resetar arrays conhecidos
        try { window.temporaryTickets = []; } catch(e) {}
        try { window.comboItems = []; } catch(e) {}
        try { if (window.lotesManager) window.lotesManager.clear(); } catch(e) {}
        
        // 7. Verificação final
        setTimeout(() => {
            console.log('\n🔍 VERIFICAÇÃO FINAL:');
            const cookiesRestantes = document.cookie.split(';').filter(c => c.trim());
            console.log(`Cookies restantes: ${cookiesRestantes.length}`);
            
            if (cookiesRestantes.length > 0) {
                console.log('⚠️ Ainda existem cookies:');
                cookiesRestantes.forEach(c => {
                    const name = c.split('=')[0].trim();
                    if (name.match(/ingresso|lote|ticket|combo|wizard|evento/i)) {
                        console.log(`❌ PROBLEMÁTICO: ${name}`);
                    }
                });
            }
        }, 500);
    };
    
    // INTERCEPTAR SUCESSO DA API
    let interceptorConfigurado = false;
    
    function configurarInterceptor() {
        if (interceptorConfigurado) return;
        
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            
            if (url && url.includes('criaeventoapi')) {
                console.log('🎯 API DE CRIAR EVENTO CHAMADA!');
                
                return originalFetch.apply(this, args)
                    .then(response => {
                        const cloned = response.clone();
                        
                        cloned.text().then(text => {
                            try {
                                const data = JSON.parse(text);
                                if (data && data.success) {
                                    console.log('✅ SUCESSO CONFIRMADO! LIMPEZA EM 3... 2... 1...');
                                    
                                    // Múltiplas execuções para garantir
                                    LIMPAR_TUDO_AGORA();
                                    setTimeout(LIMPAR_TUDO_AGORA, 250);
                                    setTimeout(LIMPAR_TUDO_AGORA, 500);
                                    setTimeout(LIMPAR_TUDO_AGORA, 1000);
                                    setTimeout(LIMPAR_TUDO_AGORA, 2000);
                                }
                            } catch(e) {}
                        });
                        
                        return response;
                    })
                    .catch(err => {
                        console.error('Erro no fetch:', err);
                        throw err;
                    });
            }
            
            return originalFetch.apply(this, args);
        };
        
        interceptorConfigurado = true;
        console.log('✅ Interceptor configurado com sucesso!');
    }
    
    // Configurar imediatamente
    configurarInterceptor();
    
    // Reconfigurar a cada segundo para garantir
    setInterval(configurarInterceptor, 1000);
    
    // Expor função globalmente
    window.LIMPAR_TUDO_AGORA = LIMPAR_TUDO_AGORA;
    
    console.log('💀 LIMPEZA ULTRA AGRESSIVA PRONTA!');
    console.log('Use LIMPAR_TUDO_AGORA() para limpar manualmente');
})();