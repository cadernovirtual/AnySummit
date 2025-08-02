// Limpeza forçada de cookies antigos
console.log('🧹 Executando limpeza forçada de cookies antigos...');

// Função para limpar cookie em todos os paths possíveis
function forceClearCookie(name) {
    // Tentar limpar em vários paths
    const paths = ['/', '/produtor/', '/produtor', ''];
    const domains = ['', '.localhost', window.location.hostname];
    
    paths.forEach(path => {
        domains.forEach(domain => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
        });
    });
}

// Limpar especificamente os cookies problemáticos
forceClearCookie('ingressosTemporarios');
forceClearCookie('ingressosSalvos');
forceClearCookie('lotesPorData');
forceClearCookie('lotesPorQuantidade');

console.log('✅ Cookies antigos limpos');

// Verificar se foram limpos
setTimeout(() => {
    console.log('🔍 Verificando se cookies foram limpos:');
    console.log('Cookies restantes:', document.cookie);
}, 100);