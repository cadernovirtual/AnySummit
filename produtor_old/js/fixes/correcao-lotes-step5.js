// =====================================================
// CORREÇÃO A: LIMPAR DADOS PERSISTIDOS CORROMPIDOS
// =====================================================

console.log('🧹 Aplicando correção para dados persistidos...');

// Função para limpar lotes com IDs inválidos
window.limparLotesInvalidos = function() {
    console.log('🔍 Verificando lotes inválidos...');
    
    if (!window.lotesData) {
        console.log('❌ lotesData não encontrado');
        return;
    }
    
    let limpou = false;
    
    // Verificar lotes por data
    if (window.lotesData.porData) {
        const lotesValidos = window.lotesData.porData.filter(lote => {
            // Verificar se o ID é válido (não pode ter caracteres especiais)
            const idValido = lote.id && /^[a-zA-Z0-9_-]+$/.test(lote.id);
            
            if (!idValido) {
                console.log('❌ Removendo lote por data com ID inválido:', lote.id);
                limpou = true;
                return false;
            }
            
            // Verificar se tem as propriedades necessárias
            if (!lote.nome || !lote.dataInicio || !lote.dataFim) {
                console.log('❌ Removendo lote por data incompleto:', lote);
                limpou = true;
                return false;
            }
            
            return true;
        });
        
        window.lotesData.porData = lotesValidos;
    }
    
    // Verificar lotes por percentual
    if (window.lotesData.porPercentual) {
        const lotesValidos = window.lotesData.porPercentual.filter(lote => {
            // Verificar se o ID é válido
            const idValido = lote.id && /^[a-zA-Z0-9_-]+$/.test(lote.id);
            
            if (!idValido) {
                console.log('❌ Removendo lote percentual com ID inválido:', lote.id);
                limpou = true;
                return false;
            }
            
            // Verificar se tem as propriedades necessárias
            if (!lote.nome || typeof lote.percentual !== 'number') {
                console.log('❌ Removendo lote percentual incompleto:', lote);
                limpou = true;
                return false;
            }
            
            return true;
        });
        
        window.lotesData.porPercentual = lotesValidos;
    }
    
    if (limpou) {
        console.log('✅ Lotes inválidos removidos');
        // Salvar dados limpos
        salvarLotesNoCookie();
        // Atualizar visualização
        if (window.atualizarVisualizacaoLotes) {
            window.atualizarVisualizacaoLotes();
        }
    } else {
        console.log('✅ Nenhum lote inválido encontrado');
    }
};

// Corrigir função de exclusão para evitar eval
window.excluirLoteSeguro = function(loteId, tipo) {
    console.log('🗑️ Excluindo lote com segurança:', loteId, tipo);
    
    if (!confirm('Tem certeza que deseja excluir este lote?')) {
        return;
    }
    
    try {
        if (tipo === 'data') {
            window.lotesData.porData = window.lotesData.porData.filter(l => l.id !== loteId);
        } else {
            window.lotesData.porPercentual = window.lotesData.porPercentual.filter(l => l.id !== loteId);
        }
        
        // Renomear lotes
        if (window.renomearLotesAutomaticamente) {
            window.renomearLotesAutomaticamente();
        }
        
        // Atualizar visualização
        if (window.atualizarVisualizacaoLotes) {
            window.atualizarVisualizacaoLotes();
        }
        
        // Salvar
        salvarLotesNoCookie();
        
        console.log('✅ Lote excluído com sucesso');
    } catch (error) {
        console.error('❌ Erro ao excluir lote:', error);
        alert('Erro ao excluir lote. Por favor, recarregue a página.');
    }
};

// Função auxiliar para salvar
function salvarLotesNoCookie() {
    const dados = JSON.stringify(window.lotesData);
    document.cookie = `lotesData=${encodeURIComponent(dados)};path=/;max-age=${7*24*60*60}`;
    
    if (window.AnySummit && window.AnySummit.Storage) {
        window.AnySummit.Storage.saveWizardData();
    }
}

// =====================================================
// CORREÇÃO B: VALIDAÇÃO DO STEP 5
// =====================================================

window.validarStep5Corrigido = function() {
    console.log('🔍 Validando Step 5...');
    
    // Verificar se lotesData existe
    if (!window.lotesData) {
        alert('Erro: Dados de lotes não encontrados');
        return false;
    }
    
    const lotesData = window.lotesData.porData || [];
    const lotesPercentual = window.lotesData.porPercentual || [];
    
    // Regra ii: Deve existir pelo menos 1 lote
    if (lotesData.length === 0 && lotesPercentual.length === 0) {
        alert('É necessário criar pelo menos um lote antes de prosseguir!');
        return false;
    }
    
    // Regra i: Se existir lote percentual, deve ter um com 100%
    if (lotesPercentual.length > 0) {
        const tem100 = lotesPercentual.some(lote => lote.percentual === 100);
        
        if (!tem100) {
            alert('É necessário ter pelo menos um lote com 100% de vendas!');
            return false;
        }
    }
    
    console.log('✅ Validação OK:', {
        lotesData: lotesData.length,
        lotesPercentual: lotesPercentual.length,
        tem100: lotesPercentual.some(l => l.percentual === 100)
    });
    
    return true;
};

// Sobrescrever validateStep
const validateStepOriginal = window.validateStep;
window.validateStep = function(step) {
    console.log('📋 Validando step:', step);
    
    if (step === 5) {
        return window.validarStep5Corrigido();
    }
    
    // Para outros steps, usar validação original se existir
    if (validateStepOriginal) {
        return validateStepOriginal(step);
    }
    
    return true;
};

// Interceptar criação de elementos de lote para usar função segura
const criarElementoLoteOriginal = window.criarElementoLote;
if (criarElementoLoteOriginal) {
    window.criarElementoLote = function(lote, tipo, index) {
        const elemento = criarElementoLoteOriginal.apply(this, arguments);
        
        // Substituir onclick perigoso por função segura
        const btnExcluir = elemento.querySelector('.btn-icon.delete');
        if (btnExcluir) {
            btnExcluir.onclick = function() {
                window.excluirLoteSeguro(lote.id, tipo);
            };
        }
        
        return elemento;
    };
}

// Executar limpeza ao carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Correções de lotes carregadas');
    
    // Aguardar um pouco para garantir que os dados foram carregados
    setTimeout(() => {
        limparLotesInvalidos();
    }, 1500);
});

// Adicionar botão de debug (temporário)
function adicionarBotaoDebug() {
    const container = document.querySelector('.step-content[data-step="5"]');
    if (container && !document.getElementById('debugLotesBtn')) {
        const btn = document.createElement('button');
        btn.id = 'debugLotesBtn';
        btn.textContent = '🔍 Debug Lotes';
        btn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; background: #ff6b6b; color: white; padding: 10px 20px; border-radius: 5px; border: none; cursor: pointer;';
        btn.onclick = function() {
            console.log('=== DEBUG LOTES ===');
            console.log('lotesData:', window.lotesData);
            console.log('Cookies:', document.cookie);
            alert('Verifique o console para detalhes dos lotes');
        };
        document.body.appendChild(btn);
    }
}

// Adicionar botão de debug quando estiver no step 5
const observerStep = new MutationObserver(() => {
    const step5Active = document.querySelector('.step-content[data-step="5"].active');
    if (step5Active) {
        adicionarBotaoDebug();
    }
});

observerStep.observe(document.body, { 
    childList: true, 
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
});

console.log('✅ Correções pontuais aplicadas');