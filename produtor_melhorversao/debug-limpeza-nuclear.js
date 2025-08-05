// Debug e limpeza FORÇADA
console.log('🔥 INICIANDO DEBUG DE LIMPEZA FORÇADA...');

// 1. Mostrar TODOS os cookies
console.log('\n🍪 TODOS OS COOKIES ATUAIS:');
document.cookie.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name) {
        console.log(`${name} = ${value ? value.substring(0, 50) + '...' : 'vazio'}`);
    }
});

// 2. Função de limpeza NUCLEAR
window.limpezaNuclear = function() {
    console.log('\n☢️ EXECUTANDO LIMPEZA NUCLEAR...');
    
    // Limpar TODOS os cookies, sem exceção
    const cookies = document.cookie.split(';');
    
    cookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        if (name) {
            // Tentar TODAS as combinações possíveis
            const paths = ['/', '/produtor/', '/produtor', '', '/produtor/novoevento', '/produtor/novoevento.php'];
            const domains = ['', '.anysummit.com.br', 'anysummit.com.br', '.com.br', 'localhost'];
            
            console.log(`\n🗑️ Tentando limpar cookie: ${name}`);
            
            paths.forEach(path => {
                domains.forEach(domain => {
                    // Método 1
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
                    // Método 2
                    document.cookie = `${name}=; max-age=0; path=${path}; domain=${domain};`;
                    // Método 3
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
                    // Método 4
                    document.cookie = `${name}=; max-age=0; path=${path};`;
                });
            });
            
            // Método 5 - sem path/domain
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
            document.cookie = `${name}=; max-age=0;`;
        }
    });
    
    // Limpar localStorage
    console.log('\n💾 Limpando localStorage...');
    localStorage.clear();
    
    // Limpar sessionStorage
    console.log('\n📦 Limpando sessionStorage...');
    sessionStorage.clear();
    
    // Limpar variáveis globais
    console.log('\n🌐 Limpando variáveis globais...');
    const variaveis = [
        'temporaryTickets', 'comboItems', 'lotesData', 'wizardData',
        'uploadedImages', 'eventData', 'ticketData', 'loteData'
    ];
    
    variaveis.forEach(v => {
        if (window[v] !== undefined) {
            delete window[v];
            console.log(`✅ window.${v} deletado`);
        }
    });
    
    // Verificar o que sobrou
    setTimeout(() => {
        console.log('\n🔍 VERIFICANDO O QUE SOBROU...');
        const cookiesRestantes = document.cookie.split(';').filter(c => c.trim());
        if (cookiesRestantes.length > 0) {
            console.log('❌ AINDA HÁ COOKIES:');
            cookiesRestantes.forEach(c => console.log('  -', c.trim()));
        } else {
            console.log('✅ Todos os cookies foram limpos!');
        }
    }, 100);
};

// 3. Verificar se o script de limpeza está sendo carregado
console.log('\n📋 VERIFICANDO SCRIPTS CARREGADOS:');
const scripts = document.querySelectorAll('script[src*="limpeza"]');
scripts.forEach(script => {
    console.log('Script encontrado:', script.src);
});

// 4. Interceptar QUALQUER chamada para criaeventoapi.php
const originalFetch = window.fetch;
let fetchInterceptado = false;

window.fetch = function(...args) {
    const url = args[0];
    console.log('🌐 Fetch interceptado:', url);
    
    if (url && url.includes('criaeventoapi')) {
        fetchInterceptado = true;
        console.log('🎯 CHAMADA PARA API DE CRIAR EVENTO DETECTADA!');
        
        return originalFetch.apply(this, args).then(response => {
            console.log('📡 Resposta recebida, status:', response.status);
            
            const clonedResponse = response.clone();
            
            clonedResponse.text().then(text => {
                console.log('📄 Resposta bruta:', text.substring(0, 200) + '...');
                
                try {
                    const data = JSON.parse(text);
                    console.log('📊 Resposta parseada:', data);
                    
                    if (data && data.success) {
                        console.log('🎉 SUCESSO DETECTADO! EXECUTANDO LIMPEZA...');
                        
                        // Executar limpeza imediatamente
                        window.limpezaNuclear();
                        
                        // Executar novamente após delay
                        setTimeout(() => {
                            console.log('🔄 Segunda rodada de limpeza...');
                            window.limpezaNuclear();
                        }, 500);
                        
                        // Terceira rodada
                        setTimeout(() => {
                            console.log('🔄 Terceira rodada de limpeza...');
                            window.limpezaNuclear();
                        }, 1000);
                    }
                } catch (e) {
                    console.error('Erro ao parsear resposta:', e);
                }
            });
            
            return response;
        });
    }
    
    return originalFetch.apply(this, args);
};

console.log('✅ Interceptador de fetch configurado');

// 5. Função para verificar especificamente ingressos e lotes
window.verificarIngressosLotes = function() {
    console.log('\n🎫 VERIFICANDO INGRESSOS E LOTES:');
    
    // Verificar cookies
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && (name.includes('ingresso') || name.includes('lote') || name.includes('ticket'))) {
            console.log(`\n🍪 ${name}:`);
            try {
                const parsed = JSON.parse(decodeURIComponent(value));
                console.log(parsed);
            } catch (e) {
                console.log(value);
            }
        }
    });
    
    // Verificar variáveis globais
    if (window.temporaryTickets) {
        console.log('\n🌐 window.temporaryTickets:', window.temporaryTickets);
    }
    if (window.lotesData) {
        console.log('\n🌐 window.lotesData:', window.lotesData);
    }
    
    // Verificar DOM
    const ticketsList = document.getElementById('ticketsList');
    if (ticketsList && ticketsList.children.length > 0) {
        console.log('\n📄 Ingressos no DOM:', ticketsList.children.length);
    }
};

// 6. Executar verificação inicial
verificarIngressosLotes();

console.log('\n🔥 DEBUG CONFIGURADO!');
console.log('Use limpezaNuclear() para forçar limpeza');
console.log('Use verificarIngressosLotes() para ver o que está salvo');
console.log('Fetch interceptado?', fetchInterceptado);