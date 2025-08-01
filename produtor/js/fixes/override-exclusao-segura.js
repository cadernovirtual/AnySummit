// =====================================================
// OVERRIDE DA FUNÇÃO DE EXCLUSÃO DE LOTES
// =====================================================

console.log('🔧 Aplicando override seguro para exclusão de lotes...');

// Aguardar o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    
    // Função para corrigir botões de exclusão existentes
    function corrigirBotoesExclusao() {
        console.log('🔍 Procurando botões de exclusão...');
        
        const botoesExcluir = document.querySelectorAll('.lote-card .btn-icon.delete');
        let corrigidos = 0;
        
        botoesExcluir.forEach(btn => {
            const loteCard = btn.closest('.lote-card');
            if (loteCard) {
                const loteId = loteCard.getAttribute('data-lote-id');
                const tipo = loteCard.classList.contains('por-data') ? 'data' : 'percentual';
                
                // Remover onclick inline perigoso
                btn.removeAttribute('onclick');
                
                // Adicionar evento seguro
                btn.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🗑️ Clique em excluir:', loteId, tipo);
                    window.excluirLoteSeguro(loteId, tipo);
                };
                
                corrigidos++;
            }
        });
        
        if (corrigidos > 0) {
            console.log(`✅ ${corrigidos} botões de exclusão corrigidos`);
        }
    }
    
    // Observar mudanças no DOM para corrigir novos botões
    const observer = new MutationObserver((mutations) => {
        let temNovosBotoes = false;
        
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && (
                    node.classList?.contains('lote-card') ||
                    node.querySelector?.('.lote-card')
                )) {
                    temNovosBotoes = true;
                }
            });
        });
        
        if (temNovosBotoes) {
            setTimeout(corrigirBotoesExclusao, 100);
        }
    });
    
    // Observar o container de lotes
    const lotesList = document.getElementById('lotesList');
    if (lotesList) {
        observer.observe(lotesList, {
            childList: true,
            subtree: true
        });
    }
    
    // Corrigir botões existentes
    setTimeout(corrigirBotoesExclusao, 500);
    
    // Garantir que a função global existe
    if (!window.excluirLoteSeguro) {
        window.excluirLoteSeguro = function(loteId, tipo) {
            console.log('🗑️ Excluindo lote (fallback):', loteId, tipo);
            
            if (!confirm('Tem certeza que deseja excluir este lote?')) {
                return;
            }
            
            try {
                if (!window.lotesData) {
                    throw new Error('lotesData não encontrado');
                }
                
                if (tipo === 'data') {
                    window.lotesData.porData = window.lotesData.porData.filter(l => l.id !== loteId);
                } else {
                    window.lotesData.porPercentual = window.lotesData.porPercentual.filter(l => l.id !== loteId);
                }
                
                // Renomear
                if (window.renomearLotesAutomaticamente) {
                    window.renomearLotesAutomaticamente();
                }
                
                // Atualizar
                if (window.atualizarVisualizacaoLotes) {
                    window.atualizarVisualizacaoLotes();
                }
                
                // Salvar
                const dados = JSON.stringify(window.lotesData);
                document.cookie = `lotesData=${encodeURIComponent(dados)};path=/;max-age=${7*24*60*60}`;
                
                console.log('✅ Lote excluído com sucesso');
            } catch (error) {
                console.error('❌ Erro ao excluir:', error);
                alert('Erro ao excluir lote. Recarregue a página.');
            }
        };
    }
});

// Função para limpar todos os dados persistidos (usar com cuidado!)
window.limparTodosDadosPersistidos = function() {
    if (confirm('ATENÇÃO: Isso apagará TODOS os dados salvos. Tem certeza?')) {
        // Limpar cookies
        ['eventoWizard', 'lotesData', 'ingressosData'].forEach(nome => {
            document.cookie = `${nome}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`;
        });
        
        // Limpar localStorage
        localStorage.clear();
        
        // Limpar sessionStorage
        sessionStorage.clear();
        
        // Recarregar página
        alert('Dados limpos. A página será recarregada.');
        window.location.reload();
    }
};

console.log('✅ Override de exclusão aplicado');
console.log('💡 Use limparTodosDadosPersistidos() no console para limpar todos os dados');