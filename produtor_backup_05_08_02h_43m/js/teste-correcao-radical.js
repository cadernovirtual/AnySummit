/**
 * TESTE DA CORREÇÃO RADICAL
 * 
 * Este script verifica se a correção radical está funcionando
 */

console.log('🧪 Carregando teste da correção radical...');

/**
 * Função para testar se a correção radical está funcionando
 */
window.testarCorrecaoRadical = function() {
    console.log('🧪 ========== TESTE DA CORREÇÃO RADICAL ==========');
    
    // 1. Verificar se funções radicais estão disponíveis
    const funcoesRadicais = [
        'recarregarListaIngressos',
        'excluirIngressoRadical', 
        'editarIngressoRadical',
        'criarIngressoPagoRadical',
        'criarIngressoGratuitoRadical'
    ];
    
    console.log('🔍 Verificando funções radicais:');
    funcoesRadicais.forEach(funcao => {
        const disponivel = typeof window[funcao] === 'function';
        console.log(`${disponivel ? '✅' : '❌'} ${funcao}`);
    });
    
    // 2. Verificar se funções originais foram sobrescritas
    const funcoesOriginais = [
        'createPaidTicket',
        'createFreeTicket',
        'removeTicket',
        'editTicket'
    ];
    
    console.log('🔍 Verificando sobrescrita das funções originais:');
    funcoesOriginais.forEach(funcao => {
        const funcaoExiste = typeof window[funcao] === 'function';
        if (funcaoExiste) {
            const codigo = window[funcao].toString();
            const ehRadical = codigo.includes('RADICAL') || codigo.includes('radical');
            console.log(`${ehRadical ? '✅' : '❌'} ${funcao} - ${ehRadical ? 'RADICAL' : 'original'}`);
        } else {
            console.log(`❌ ${funcao} - não existe`);
        }
    });
    
    // 3. Verificar dados globais
    console.log('🔍 Verificando dados globais:');
    console.log(`- window.ingressosAtuais: ${Array.isArray(window.ingressosAtuais) ? window.ingressosAtuais.length + ' itens' : 'não disponível'}`);
    console.log(`- window.lotesAtuais: ${Array.isArray(window.lotesAtuais) ? window.lotesAtuais.length + ' itens' : 'não disponível'}`);
    
    // 4. Verificar URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = urlParams.get('evento_id');
    console.log(`- evento_id na URL: ${eventoId || 'não encontrado'}`);
    
    // 5. Resultado
    const tudo_ok = (
        typeof window.recarregarListaIngressos === 'function' &&
        typeof window.createPaidTicket === 'function' &&
        window.createPaidTicket.toString().includes('radical')
    );
    
    if (tudo_ok) {
        console.log('🎉 CORREÇÃO RADICAL CARREGADA E FUNCIONANDO!');
        console.log('💡 Agora teste criar/editar/excluir ingressos - deve funcionar corretamente');
    } else {
        console.log('❌ CORREÇÃO RADICAL NÃO ESTÁ FUNCIONANDO');
    }
    
    return tudo_ok;
};

/**
 * Simular ação de botão para testar se está funcionando
 */
window.simularBotaoIngresso = function() {
    console.log('🧪 Simulando clique em botão de ingresso...');
    
    const botoes = document.querySelectorAll('button[onclick*="removeTicket"], button[onclick*="editTicket"]');
    
    if (botoes.length > 0) {
        const primeiroBotao = botoes[0];
        const onclick = primeiroBotao.getAttribute('onclick');
        console.log(`🔍 Primeiro botão encontrado: ${onclick}`);
        
        if (onclick.includes('Radical')) {
            console.log('✅ Botão já usa função radical');
        } else {
            console.log('❌ Botão ainda usa função original');
        }
    } else {
        console.log('❌ Nenhum botão encontrado');
    }
};

/**
 * Forçar recarregamento da lista
 */
window.forcarRecarregamento = async function() {
    console.log('🔄 Forçando recarregamento da lista...');
    
    if (typeof window.recarregarListaIngressos === 'function') {
        const sucesso = await window.recarregarListaIngressos();
        console.log(sucesso ? '✅ Recarregamento bem-sucedido' : '❌ Erro no recarregamento');
        return sucesso;
    } else {
        console.log('❌ Função de recarregamento não disponível');
        return false;
    }
};

/**
 * Teste automatizado
 */
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🧪 Executando teste automático da correção radical...');
        const funcionando = window.testarCorrecaoRadical();
        
        if (funcionando) {
            // Tentar recarregar automaticamente
            setTimeout(() => {
                window.forcarRecarregamento();
            }, 2000);
        }
    }, 5000); // Aguardar mais tempo para garantir que tudo carregou
});

console.log('✅ Teste da correção radical carregado!');