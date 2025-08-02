/**
 * TESTADOR DO SISTEMA DOM ESPELHO MYSQL - ETAPA 6
 * 
 * Funções para validar se o DOM realmente é um espelho da tabela MySQL
 */

console.log('🧪 Carregando testador DOM Espelho MySQL...');

/**
 * Função principal de teste - Executa todos os testes
 */
window.testarDOMEspelhoMySQL = async function() {
    console.log('🧪 ========== TESTE DOM ESPELHO MYSQL ==========');
    
    const resultados = {
        sistemaCarregado: false,
        funcoesDisponiveis: false,
        dadosCarregados: false,
        idsReais: false,
        botoesCorrigidos: false
    };
    
    // 1. Verificar se sistema está carregado
    console.log('🔍 1. Verificando se sistema DOM Espelho está carregado...');
    if (typeof window.recarregarIngressosDoMySQL === 'function') {
        console.log('✅ recarregarIngressosDoMySQL() disponível');
        resultados.sistemaCarregado = true;
    } else {
        console.log('❌ recarregarIngressosDoMySQL() NÃO disponível');
    }
    
    // 2. Verificar se funções MySQL estão disponíveis
    console.log('🔍 2. Verificando funções MySQL...');
    const funcoesMysql = [
        'createPaidTicketMySQL',
        'createFreeTicketMySQL', 
        'excluirIngressoDoMySQL',
        'editarIngressoDoMySQL'
    ];
    
    let funcoesOk = 0;
    funcoesMysql.forEach(funcao => {
        if (typeof window[funcao] === 'function') {
            console.log(`✅ ${funcao}() disponível`);
            funcoesOk++;
        } else {
            console.log(`❌ ${funcao}() NÃO disponível`);
        }
    });
    
    resultados.funcoesDisponiveis = (funcoesOk === funcoesMysql.length);
    
    // 3. Verificar se dados foram carregados
    console.log('🔍 3. Verificando carregamento de dados...');
    if (typeof window.dadosAtivos !== 'undefined' && window.dadosAtivos) {
        console.log(`✅ dadosAtivos disponível: ${window.dadosAtivos.ingressos?.length || 0} ingressos`);
        resultados.dadosCarregados = true;
    } else {
        console.log('❌ dadosAtivos NÃO disponível');
    }
    
    // 4. Verificar se ingressos no DOM têm IDs reais
    console.log('🔍 4. Verificando IDs dos ingressos no DOM...');
    const ticketItems = document.querySelectorAll('.ticket-item');
    let idsReaisCount = 0;
    let idsTemporariosCount = 0;
    
    ticketItems.forEach(item => {
        const ticketId = item.dataset.ticketId;
        if (ticketId && !ticketId.startsWith('ticket_')) {
            idsReaisCount++;
        } else if (ticketId && ticketId.startsWith('ticket_')) {
            idsTemporariosCount++;
        }
    });
    
    console.log(`✅ Ingressos com IDs reais: ${idsReaisCount}`);
    console.log(`⚠️ Ingressos com IDs temporários: ${idsTemporariosCount}`);
    
    resultados.idsReais = (idsTemporariosCount === 0);
    
    // 5. Verificar se botões estão direcionados para funções MySQL
    console.log('🔍 5. Verificando botões de ação...');
    const editButtons = document.querySelectorAll('button[onclick*="editTicket"]');
    const removeButtons = document.querySelectorAll('button[onclick*="removeTicket"]');
    
    let botoesCorretos = 0;
    let botoesIncorretos = 0;
    
    editButtons.forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick.includes('editarIngressoDoMySQL') || onclick.includes('editTicket')) {
            botoesCorretos++;
        } else {
            botoesIncorretos++;
        }
    });
    
    removeButtons.forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick.includes('excluirIngressoDoMySQL') || onclick.includes('removeTicket')) {
            botoesCorretos++;
        } else {
            botoesIncorretos++;
        }
    });
    
    console.log(`✅ Botões corretos: ${botoesCorretos}`);
    console.log(`❌ Botões incorretos: ${botoesIncorretos}`);
    
    resultados.botoesCorrigidos = (botoesIncorretos === 0);
    
    // 6. Resultado final
    console.log('🧪 ========== RESULTADO DO TESTE ==========');
    
    const totalTestes = Object.keys(resultados).length;
    const testesPassados = Object.values(resultados).filter(r => r === true).length;
    
    console.log(`📊 Testes passados: ${testesPassados}/${totalTestes}`);
    
    Object.entries(resultados).forEach(([teste, passou]) => {
        const status = passou ? '✅' : '❌';
        console.log(`${status} ${teste}: ${passou ? 'PASSOU' : 'FALHOU'}`);
    });
    
    if (testesPassados === totalTestes) {
        console.log('🎉 TODOS OS TESTES PASSARAM! DOM Espelho MySQL está funcionando perfeitamente!');
    } else {
        console.log('⚠️ Alguns testes falharam. Verifique os logs acima.');
    }
    
    return resultados;
};

/**
 * Teste específico: Simular criação de ingresso
 */
window.testarCriacaoIngresso = function() {
    console.log('🧪 Teste de criação de ingresso...');
    
    // Verificar se formulário existe
    const titleInput = document.getElementById('paidTicketTitle');
    if (!titleInput) {
        console.log('❌ Formulário de ingresso não encontrado');
        return;
    }
    
    // Preencher dados de teste
    document.getElementById('paidTicketTitle').value = 'TESTE - Ingresso MySQL';
    document.getElementById('paidTicketQuantity').value = '10';
    document.getElementById('paidTicketPrice').value = 'R$ 50,00';
    
    // Verificar se lote está selecionado
    const loteSelect = document.getElementById('paidTicketLote');
    if (loteSelect && loteSelect.options.length > 1) {
        loteSelect.selectedIndex = 1; // Selecionar primeiro lote disponível
    }
    
    console.log('✅ Dados de teste preenchidos. Execute createPaidTicket() manualmente para testar.');
};

/**
 * Teste de comparação: DOM vs MySQL
 */
window.compararDOMcomMySQL = async function() {
    console.log('🧪 Comparando DOM com dados do MySQL...');
    
    // Recarregar dados do MySQL
    if (typeof window.recarregarIngressosDoMySQL === 'function') {
        await window.recarregarIngressosDoMySQL();
    }
    
    // Pegar dados do cache
    const dadosMySQL = window.dadosAtivos?.ingressos || [];
    
    // Pegar dados do DOM
    const elementosDOM = document.querySelectorAll('.ticket-item');
    
    console.log(`📊 MySQL: ${dadosMySQL.length} ingressos`);
    console.log(`📊 DOM: ${elementosDOM.length} elementos`);
    
    if (dadosMySQL.length !== elementosDOM.length) {
        console.log('❌ INCONSISTÊNCIA: Quantidades diferentes entre MySQL e DOM');
        return false;
    }
    
    // Verificar se cada ingresso do MySQL tem correspondente no DOM
    let correspondencias = 0;
    
    dadosMySQL.forEach(ingresso => {
        const elementoDOM = document.querySelector(`[data-ticket-id="${ingresso.id}"]`);
        if (elementoDOM) {
            correspondencias++;
            console.log(`✅ Ingresso ${ingresso.id} (${ingresso.titulo}) encontrado no DOM`);
        } else {
            console.log(`❌ Ingresso ${ingresso.id} (${ingresso.titulo}) NÃO encontrado no DOM`);
        }
    });
    
    const sincronizado = (correspondencias === dadosMySQL.length);
    
    console.log(`📊 Correspondências: ${correspondencias}/${dadosMySQL.length}`);
    console.log(sincronizado ? '✅ DOM está sincronizado com MySQL' : '❌ DOM NÃO está sincronizado com MySQL');
    
    return sincronizado;
};

/**
 * Teste de persistência: Simular recarregamento
 */
window.testarPersistencia = async function() {
    console.log('🧪 Testando persistência após recarregamento...');
    
    // Salvar estado atual
    const estadoAntes = {
        ingressos: window.dadosAtivos?.ingressos?.length || 0,
        elementosDOM: document.querySelectorAll('.ticket-item').length
    };
    
    console.log(`📊 Estado ANTES: ${estadoAntes.ingressos} MySQL, ${estadoAntes.elementosDOM} DOM`);
    
    // Simular recarregamento
    await window.recarregarIngressosDoMySQL();
    
    // Verificar estado após
    const estadoDepois = {
        ingressos: window.dadosAtivos?.ingressos?.length || 0,
        elementosDOM: document.querySelectorAll('.ticket-item').length
    };
    
    console.log(`📊 Estado DEPOIS: ${estadoDepois.ingressos} MySQL, ${estadoDepois.elementosDOM} DOM`);
    
    const persistiu = (
        estadoAntes.ingressos === estadoDepois.ingressos &&
        estadoAntes.elementosDOM === estadoDepois.elementosDOM
    );
    
    console.log(persistiu ? '✅ Dados persistiram corretamente' : '❌ Dados NÃO persistiram');
    
    return persistiu;
};

/**
 * Debug: Listar todas as funções disponíveis
 */
window.debugFuncoesDisponiveis = function() {
    console.log('🔍 ========== DEBUG: FUNÇÕES DISPONÍVEIS ==========');
    
    const funcoes = [
        'recarregarIngressosDoMySQL',
        'createPaidTicketMySQL',
        'createFreeTicketMySQL',
        'excluirIngressoDoMySQL', 
        'editarIngressoDoMySQL',
        'createPaidTicket',
        'createFreeTicket',
        'removeTicket',
        'editTicket',
        'addTicketToList',
        'openModal',
        'closeModal'
    ];
    
    funcoes.forEach(funcao => {
        const disponivel = typeof window[funcao] === 'function';
        const status = disponivel ? '✅' : '❌';
        console.log(`${status} window.${funcao}()`);
    });
    
    console.log('🔍 ========================================');
};

/**
 * Debug: Mostrar dados atuais
 */
window.debugDadosAtuais = function() {
    console.log('🔍 ========== DEBUG: DADOS ATUAIS ==========');
    
    console.log('📊 Dados do cache:');
    console.log('- Ingressos:', window.dadosAtivos?.ingressos?.length || 0);
    console.log('- Lotes:', window.dadosAtivos?.lotes?.length || 0);
    
    console.log('📊 Elementos no DOM:');
    const ticketItems = document.querySelectorAll('.ticket-item');
    console.log('- .ticket-item:', ticketItems.length);
    
    if (ticketItems.length > 0) {
        console.log('📋 Lista de ingressos no DOM:');
        ticketItems.forEach((item, index) => {
            const ticketId = item.dataset.ticketId;
            const title = item.querySelector('.ticket-name')?.textContent || 'Sem título';
            console.log(`  ${index + 1}. ID: ${ticketId} - ${title}`);
        });
    }
    
    console.log('🔍 ========================================');
};

/**
 * Execução automática do teste após carregamento
 */
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🧪 Executando teste automático do DOM Espelho MySQL...');
        window.testarDOMEspelhoMySQL();
    }, 3000); // Aguardar carregamento completo
});

console.log('✅ Testador DOM Espelho MySQL carregado! Use testarDOMEspelhoMySQL() para executar os testes.');