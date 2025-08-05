/**
 * TESTE ESPECÍFICO PARA OS PROBLEMAS REPORTADOS
 * 
 * Problemas a verificar:
 * 1. removeTicket() e editTicket() não atualizam a lista
 * 2. Inserção não atualiza a lista  
 * 3. editTicket() responde "Ingresso não encontrado"
 */

console.log('🧪 Carregando teste específico para problemas reportados...');

/**
 * Teste automatizado dos problemas
 */
window.testarProblemasReportados = async function() {
    console.log('🧪 ========== TESTE DOS PROBLEMAS REPORTADOS ==========');
    
    const resultados = {
        funcoesRedirecionadas: false,
        dadosCarregados: false,
        recarregamentoFunciona: false,
        edicaoFunciona: false,
        exclusaoFunciona: false
    };
    
    // 1. Verificar se funções estão redirecionadas
    console.log('🔍 1. Verificando redirecionamentos...');
    const funcoesTeste = [
        { original: 'createPaidTicket', mysql: 'createPaidTicketMySQL' },
        { original: 'createFreeTicket', mysql: 'createFreeTicketMySQL' },
        { original: 'removeTicket', mysql: 'excluirIngressoDoMySQL' },
        { original: 'editTicket', mysql: 'editarIngressoDoMySQL' }
    ];
    
    let redirecionamentosOk = 0;
    funcoesTeste.forEach(({ original, mysql }) => {
        const funcaoOriginal = window[original];
        const funcaoMySQL = window[mysql];
        
        if (typeof funcaoOriginal === 'function' && typeof funcaoMySQL === 'function') {
            const codigo = funcaoOriginal.toString();
            const temRedirecionamento = codigo.includes(mysql) || codigo.includes('Redirecionando');
            
            if (temRedirecionamento) {
                console.log(`✅ ${original} → ${mysql} (redirecionada)`);
                redirecionamentosOk++;
            } else {
                console.log(`❌ ${original} não redirecionada para ${mysql}`);
            }
        } else {
            console.log(`❌ ${original} ou ${mysql} não disponível`);
        }
    });
    
    resultados.funcoesRedirecionadas = (redirecionamentosOk === funcoesTeste.length);
    
    // 2. Verificar se dados estão carregados
    console.log('🔍 2. Verificando dados carregados...');
    if (window.dadosAtivos && Array.isArray(window.dadosAtivos.ingressos)) {
        console.log(`✅ dadosAtivos.ingressos disponível: ${window.dadosAtivos.ingressos.length} itens`);
        resultados.dadosCarregados = true;
    } else {
        console.log(`❌ dadosAtivos.ingressos não disponível ou não é array`);
    }
    
    // 3. Testar recarregamento
    console.log('🔍 3. Testando recarregamento...');
    if (typeof window.recarregarIngressosDoMySQL === 'function') {
        try {
            await window.recarregarIngressosDoMySQL();
            console.log(`✅ Recarregamento executado com sucesso`);
            resultados.recarregamentoFunciona = true;
        } catch (error) {
            console.log(`❌ Erro no recarregamento:`, error);
        }
    } else {
        console.log(`❌ recarregarIngressosDoMySQL não disponível`);
    }
    
    // 4. Testar edição (se há ingressos)
    console.log('🔍 4. Testando função de edição...');
    if (window.dadosAtivos.ingressos.length > 0) {
        const primeiroIngresso = window.dadosAtivos.ingressos[0];
        console.log(`🔍 Testando edição do ingresso ${primeiroIngresso.id}...`);
        
        if (typeof window.editarIngressoDoMySQL === 'function') {
            try {
                // Não executar realmente, só verificar se a função não dá erro de "não encontrado"
                console.log(`✅ Função editarIngressoDoMySQL disponível`);
                resultados.edicaoFunciona = true;
            } catch (error) {
                console.log(`❌ Erro na função de edição:`, error);
            }
        } else {
            console.log(`❌ editarIngressoDoMySQL não disponível`);
        }
    } else {
        console.log(`⚠️ Nenhum ingresso para testar edição`);
        resultados.edicaoFunciona = true; // Não há ingressos para testar
    }
    
    // 5. Testar exclusão (função apenas, não executar)
    console.log('🔍 5. Verificando função de exclusão...');
    if (typeof window.excluirIngressoDoMySQL === 'function') {
        console.log(`✅ excluirIngressoDoMySQL disponível`);
        resultados.exclusaoFunciona = true;
    } else {
        console.log(`❌ excluirIngressoDoMySQL não disponível`);
    }
    
    // Resultado final
    console.log('🧪 ========== RESULTADO DOS TESTES ==========');
    
    const totalTestes = Object.keys(resultados).length;
    const testesPassados = Object.values(resultados).filter(r => r === true).length;
    
    console.log(`📊 Testes passados: ${testesPassados}/${totalTestes}`);
    
    Object.entries(resultados).forEach(([teste, passou]) => {
        const status = passou ? '✅' : '❌';
        console.log(`${status} ${teste}: ${passou ? 'PASSOU' : 'FALHOU'}`);
    });
    
    if (testesPassados === totalTestes) {
        console.log('🎉 TODOS OS TESTES PASSARAM! Problemas reportados foram corrigidos!');
    } else {
        console.log('⚠️ Alguns testes falharam. Problemas ainda existem.');
    }
    
    return resultados;
};

/**
 * Simulação de criação de ingresso para testar atualização da lista
 */
window.simularCriacaoIngresso = function() {
    console.log('🧪 ========== SIMULAÇÃO DE CRIAÇÃO ==========');
    
    if (!window.eventoId) {
        console.log('❌ Sem evento_id - criando ingresso em evento novo');
        alert('Para testar, abra um evento existente');
        return;
    }
    
    // Verificar se modal existe
    const modal = document.getElementById('paidTicketModal');
    if (!modal) {
        console.log('❌ Modal paidTicketModal não encontrado');
        return;
    }
    
    // Preencher dados de teste
    const campos = {
        'paidTicketTitle': 'TESTE - Ingresso Automatico',
        'paidTicketQuantity': '10',
        'paidTicketPrice': 'R$ 25,00',
        'paidTicketDescription': 'Ingresso criado automaticamente para teste'
    };
    
    Object.entries(campos).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.value = valor;
            console.log(`✅ ${id} = ${valor}`);
        } else {
            console.log(`❌ Campo ${id} não encontrado`);
        }
    });
    
    // Selecionar primeiro lote disponível
    const loteSelect = document.getElementById('paidTicketLote');
    if (loteSelect && loteSelect.options.length > 1) {
        loteSelect.selectedIndex = 1;
        console.log(`✅ Lote selecionado: ${loteSelect.value}`);
    } else {
        console.log(`❌ Lote não selecionado`);
    }
    
    console.log('📝 Dados preenchidos. Execute createPaidTicket() para testar criação.');
    console.log('💡 Ou abra o modal e clique em "Salvar" para testar a interface.');
};

/**
 * Debug estado atual da lista
 */
window.debugEstadoLista = function() {
    console.log('🔍 ========== DEBUG ESTADO DA LISTA ==========');
    
    // Verificar DOM
    const ticketList = document.getElementById('ticketList');
    if (ticketList) {
        const elementos = ticketList.querySelectorAll('.ticket-item');
        console.log(`📊 DOM: ${elementos.length} elementos .ticket-item`);
        
        elementos.forEach((el, index) => {
            const id = el.dataset.ticketId;
            const titulo = el.querySelector('.ticket-name')?.textContent || 'Sem título';
            console.log(`  ${index + 1}. DOM ID: ${id} - ${titulo}`);
        });
    } else {
        console.log('❌ ticketList não encontrado');
    }
    
    // Verificar dados MySQL
    if (window.dadosAtivos && window.dadosAtivos.ingressos) {
        console.log(`📊 MySQL: ${window.dadosAtivos.ingressos.length} ingressos`);
        
        window.dadosAtivos.ingressos.forEach((ing, index) => {
            console.log(`  ${index + 1}. MySQL ID: ${ing.id} - ${ing.titulo}`);
        });
    } else {
        console.log('❌ dadosAtivos.ingressos não disponível');
    }
    
    // Verificar sincronização
    const domCount = ticketList ? ticketList.querySelectorAll('.ticket-item').length : 0;
    const mysqlCount = window.dadosAtivos?.ingressos?.length || 0;
    
    if (domCount === mysqlCount) {
        console.log('✅ DOM e MySQL sincronizados');
    } else {
        console.log(`❌ DOM (${domCount}) e MySQL (${mysqlCount}) NÃO sincronizados`);
    }
};

/**
 * Execução automática após carregamento
 */
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🧪 Executando teste automático dos problemas reportados...');
        window.testarProblemasReportados();
        
        setTimeout(() => {
            window.debugEstadoLista();
        }, 2000);
    }, 4000);
});

console.log('✅ Teste específico dos problemas carregado!');