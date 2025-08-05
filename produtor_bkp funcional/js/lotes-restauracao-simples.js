/**
 * SISTEMA DE LOTES SIMPLIFICADO - APENAS RESTAURAÇÃO
 * Foco na função restaurarLotes para corrigir o erro do wizard-database.js
 */

// Armazenamento temporário dos lotes
window.lotesData = {
    porData: [],
    porPercentual: []
};

// FUNÇÃO PRINCIPAL PARA RESTAURAR LOTES DO BANCO DE DADOS
window.restaurarLotes = function(lotesDoBanco) {
    console.log('🔄 RESTAURAR LOTES: Iniciando com dados:', lotesDoBanco);
    
    if (!lotesDoBanco || !Array.isArray(lotesDoBanco) || lotesDoBanco.length === 0) {
        console.log('⚠️ Nenhum lote para restaurar ou dados inválidos');
        return;
    }
    
    // Limpar dados atuais
    window.lotesData = {
        porData: [],
        porPercentual: []
    };
    
    console.log('🧹 Dados anteriores limpos, processando lotes...');
    
    // Processar cada lote do banco
    lotesDoBanco.forEach((lote, index) => {
        console.log(`📦 Processando lote ${index + 1}:`, lote);
        
        const loteData = {
            id: lote.id,
            nome: lote.nome || `Lote ${index + 1}`,
            divulgar: lote.divulgar_criterio == 1 || lote.divulgar_criterio === true
        };
        
        if (lote.tipo === 'data') {
            // Lote por data
            loteData.dataInicio = lote.data_inicio;
            loteData.dataFim = lote.data_fim;
            loteData.percentualAumento = parseFloat(lote.percentual_aumento_valor) || 0;
            
            window.lotesData.porData.push(loteData);
            console.log('📅 Lote por data adicionado:', loteData);
            
        } else if (lote.tipo === 'percentual') {
            // Lote por percentual
            loteData.percentual = parseInt(lote.percentual_venda) || 0;
            loteData.percentualAumento = parseFloat(lote.percentual_aumento_valor) || 0;
            
            window.lotesData.porPercentual.push(loteData);
            console.log('📊 Lote por percentual adicionado:', loteData);
        } else {
            console.warn('⚠️ Tipo de lote desconhecido:', lote.tipo);
        }
    });
    
    console.log('✅ Processamento concluído:');
    console.log('  - Lotes por data:', window.lotesData.porData.length);
    console.log('  - Lotes por percentual:', window.lotesData.porPercentual.length);
    
    // Tentar renderizar os lotes na interface (se funções existirem)
    setTimeout(() => {
        console.log('🎨 Tentando renderizar lotes na interface...');
        
        try {
            if (typeof window.renderizarLotesPorData === 'function') {
                window.renderizarLotesPorData();
                console.log('✅ Lotes por data renderizados');
            } else {
                console.log('ℹ️ Função renderizarLotesPorData não disponível');
            }
            
            if (typeof window.renderizarLotesPorPercentual === 'function') {
                window.renderizarLotesPorPercentual();
                console.log('✅ Lotes por percentual renderizados');
            } else {
                console.log('ℹ️ Função renderizarLotesPorPercentual não disponível');
            }
            
            if (typeof window.atualizarSummaryPercentual === 'function') {
                window.atualizarSummaryPercentual();
                console.log('✅ Summary atualizado');
            }
            
        } catch (error) {
            console.error('❌ Erro ao renderizar lotes:', error);
        }
        
        console.log('🎉 Lotes restaurados com sucesso!');
        console.log('📊 Estado final dos lotes:', window.lotesData);
        
    }, 100);
};

// Função auxiliar para verificar se a função foi definida corretamente
function verificarFuncaoRestaurarLotes() {
    if (typeof window.restaurarLotes === 'function') {
        console.log('✅ window.restaurarLotes está definida corretamente');
        return true;
    } else {
        console.error('❌ window.restaurarLotes NÃO está definida!');
        return false;
    }
}

// Outras funções básicas que podem ser necessárias
window.validarStep5 = function() {
    console.log('🔍 Validando step 5 (lotes)...');
    
    // Validação básica
    const totalLotes = (window.lotesData?.porData?.length || 0) + (window.lotesData?.porPercentual?.length || 0);
    
    if (totalLotes === 0) {
        console.log('⚠️ Nenhum lote configurado');
        return false;
    }
    
    console.log('✅ Validação de lotes OK:', totalLotes, 'lotes encontrados');
    return true;
};

// Função de teste para debug
window.testarRestaurarLotes = function() {
    console.log('🧪 Executando teste da função restaurarLotes...');
    
    const testeLotes = [
        {
            id: 1,
            nome: 'Lote Teste 1',
            tipo: 'data',
            data_inicio: '2024-02-01T10:00',
            data_fim: '2024-02-15T23:59',
            percentual_aumento_valor: 10,
            divulgar_criterio: 1
        },
        {
            id: 2,
            nome: 'Lote Teste 2', 
            tipo: 'percentual',
            percentual_venda: 50,
            percentual_aumento_valor: 20,
            divulgar_criterio: 0
        }
    ];
    
    console.log('🎯 Chamando restaurarLotes com dados de teste...');
    window.restaurarLotes(testeLotes);
};

// Verificar imediatamente se a função foi definida
setTimeout(() => {
    verificarFuncaoRestaurarLotes();
    console.log('📝 Para testar use: testarRestaurarLotes()');
}, 100);

console.log('✅ Sistema de lotes simplificado carregado');
