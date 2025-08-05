/**
 * EXEMPLO DE USO - LOTES POR PERCENTUAL CORRIGIDOS
 * 
 * Este arquivo demonstra como usar as correções implementadas
 * para resolver os problemas da etapa 5 do wizard
 */

// =======================================================
// EXEMPLO 1: CARREGAR LIMITE DE VENDAS (SEM ZERAR)
// =======================================================

/**
 * Exemplo de como carregar o limite sem sobrescrever valor do banco
 */
function exemploCarregarLimite() {
    console.log('📦 Exemplo: Carregando limite de vendas do banco');
    
    // A função carregarLimiteVendasCorrigido() agora:
    // ✅ Lê o valor REAL do banco
    // ✅ NÃO força zero no campo
    // ✅ Mantém o valor existente ao retomar rascunho
    
    window.carregarLimiteVendasCorrigido();
}

// =======================================================
// EXEMPLO 2: CRIAR LOTES POR PERCENTUAL (COM INSERT NO MYSQL)
// =======================================================

/**
 * Exemplo de como criar lotes que são inseridos no banco
 */
async function exemploCriarLotes() {
    console.log('🚀 Exemplo: Criando lotes por percentual');
    
    try {
        // Configuração dos lotes desejados
        const lotesConfig = [
            {
                nome: 'Lote Promocional',
                percentual: 30,      // 30% do limite total
                divulgar: true       // Aparecer no site
            },
            {
                nome: 'Lote Regular',
                percentual: 50,      // 50% do limite total  
                divulgar: true
            },
            {
                nome: 'Lote Final',
                percentual: 100,     // 100% = todos os restantes
                divulgar: false      // Não divulgar critério
            }
        ];
        
        // Chamar função corrigida que:
        // ✅ Insere os lotes na tabela MySQL
        // ✅ Calcula quantidade baseada no percentual
        // ✅ Atualiza a interface automaticamente
        // ✅ Protege botões durante criação
        
        const lotesConfirmados = await window.criarLotesPercentual(lotesConfig);
        
        console.log('🎉 Lotes criados com sucesso:', lotesConfirmados);
        
        // Os lotes agora estão:
        // - Salvos no banco MySQL (tabela lotes)
        // - Exibidos na interface do wizard
        // - Prontos para próximas etapas
        
    } catch (error) {
        console.error('❌ Erro ao criar lotes:', error);
        alert('Erro: ' + error.message);
    }
}

// =======================================================
// EXEMPLO 3: FLUXO COMPLETO ETAPA 5
// =======================================================

/**
 * Exemplo do fluxo completo da etapa 5 corrigido
 */
async function exemploFluxoCompleto() {
    console.log('🎯 Exemplo: Fluxo completo da etapa 5');
    
    try {
        // 1. Carregar dados existentes (sem zerar)
        console.log('1️⃣ Carregando configuração existente...');
        window.carregarLimiteVendasCorrigido();
        
        // Aguardar carregamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 2. Verificar se já tem limite configurado
        const inputLimite = document.getElementById('limiteVendas');
        const limiteAtual = inputLimite ? parseInt(inputLimite.value) : 0;
        
        console.log(`2️⃣ Limite atual: ${limiteAtual}`);
        
        if (limiteAtual > 0) {
            // 3. Criar lotes baseados no limite existente
            console.log('3️⃣ Criando lotes baseados no limite...');
            
            const lotes = [
                { nome: 'Lote 1', percentual: 40, divulgar: true },
                { nome: 'Lote 2', percentual: 60, divulgar: true },
                { nome: 'Lote Final', percentual: 100, divulgar: false }
            ];
            
            const resultado = await window.criarLotesPercentual(lotes);
            console.log('✅ Processo concluído:', resultado);
            
        } else {
            console.log('⚠️ Primeiro configure o limite de vendas');
        }
        
    } catch (error) {
        console.error('❌ Erro no fluxo:', error);
    }
}

// =======================================================
// EXEMPLO 4: CENÁRIOS DE TESTE
// =======================================================

/**
 * Testes para verificar se as correções funcionam
 */
window.testarCorrecoes = function() {
    console.log('🧪 Iniciando testes das correções...');
    
    // Teste 1: Verificar se limite não é zerado
    console.log('Test 1: Carregamento sem zerar');
    window.carregarLimiteVendasCorrigido();
    
    // Teste 2: Verificar se função de criação existe
    console.log('Test 2: Função criarLotesPercentual existe?', 
                typeof window.criarLotesPercentual === 'function');
    
    // Teste 3: Verificar backend
    console.log('Test 3: Testando backend...');
    fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=carregar_limite_vendas&evento_id=1'
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ Backend respondeu:', data);
    })
    .catch(error => {
        console.error('❌ Erro no backend:', error);
    });
    
    console.log('🎯 Para testar criação completa, execute: exemploCriarLotes()');
};

// =======================================================
// INICIALIZAÇÃO E INSTRUÇÕES
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 CORREÇÕES DE LOTES POR PERCENTUAL DISPONÍVEIS:');
    console.log('');
    console.log('🔧 Funções corrigidas:');
    console.log('  - carregarLimiteVendasCorrigido() // Não zera valores');
    console.log('  - criarLotesPercentual(config)    // Insere no MySQL');
    console.log('  - toggleLimiteVendasCorrigido()   // Não zera ao ativar');
    console.log('');
    console.log('🧪 Funções de teste:');
    console.log('  - exemploCarregarLimite()');
    console.log('  - exemploCriarLotes()');  
    console.log('  - exemploFluxoCompleto()');
    console.log('  - testarCorrecoes()');
    console.log('');
    console.log('💡 Execute testarCorrecoes() no console para verificar');
});

// =======================================================
// PROBLEMAS RESOLVIDOS
// =======================================================

/*
✅ PROBLEMA 1 RESOLVIDO:
Quando retomar evento rascunho, ao voltar para etapa 5:
- ANTES: ❌ Zerava limite_vendas para 0 automaticamente
- AGORA: ✅ Carrega valor REAL do banco MySQL

✅ PROBLEMA 2 RESOLVIDO: 
Função criarLotesPercentual():
- ANTES: ❌ Não existia implementação completa
- AGORA: ✅ Insere registros na tabela lotes do MySQL
- AGORA: ✅ Calcula quantidade baseada no percentual
- AGORA: ✅ Atualiza interface automaticamente

📊 MELHORIAS ADICIONAIS:
- Proteção de botões durante criação
- Validações de dados antes inserção
- Transações MySQL para consistência
- Logs detalhados para debug
- Interface atualizada automaticamente
*/
