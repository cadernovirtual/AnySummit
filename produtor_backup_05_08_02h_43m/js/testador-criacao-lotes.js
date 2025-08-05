/**
 * TESTADOR DE CRIAÇÃO DE LOTES
 */

console.log('🧪 TESTADOR-CRIACAO-LOTES.JS CARREGANDO...');

window.testarCriacaoLoteManual = async function() {
    console.log('🧪 Testando criação manual de lote...');
    
    const dadosLoteTeste = {
        dataInicio: '2025-08-15T10:00',
        dataFim: '2025-08-20T23:59',
        divulgar: true,
        percentualAumento: 0
    };
    
    console.log('📋 Dados do lote teste:', dadosLoteTeste);
    
    // Testar diferentes funções de criação
    const funcoesTeste = [
        'criarLoteData',
        'criarLoteDataMySQL'
    ];
    
    for (const nomeFuncao of funcoesTeste) {
        console.log(`🔧 Testando ${nomeFuncao}...`);
        
        if (typeof window[nomeFuncao] === 'function') {
            try {
                console.log(`✅ Função ${nomeFuncao} encontrada, executando...`);
                const resultado = await window[nomeFuncao](dadosLoteTeste);
                console.log(`✅ ${nomeFuncao} executou com sucesso:`, resultado);
                return resultado; // Se uma função funcionar, sair
            } catch (error) {
                console.error(`❌ Erro ao executar ${nomeFuncao}:`, error);
            }
        } else {
            console.warn(`⚠️ Função ${nomeFuncao} não encontrada`);
        }
    }
    
    console.error('❌ Nenhuma função de criação funcionou');
};

// Adicionar botão de teste na interface
setTimeout(() => {
    const etapaAtual = window.currentStep || 1;
    if (etapaAtual === 5) {
        const container = document.querySelector('.lotes-container') || document.body;
        
        if (!document.getElementById('btnTesteCriacao')) {
            const btnTeste = document.createElement('button');
            btnTeste.id = 'btnTesteCriacao';
            btnTeste.innerHTML = '🧪 Testar Criação Manual';
            btnTeste.className = 'btn btn-outline btn-small';
            btnTeste.style.margin = '10px';
            btnTeste.onclick = window.testarCriacaoLoteManual;
            container.appendChild(btnTeste);
        }
    }
}, 2000);

console.log('✅ TESTADOR-CRIACAO-LOTES.JS CARREGADO!');
console.log('🔧 Para testar manualmente: testarCriacaoLoteManual()');
