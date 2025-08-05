/**
 * CORREÇÃO DEFINITIVA - LOTES POR PERCENTUAL
 * Implementa função completa com INSERT no MySQL
 */

window.criarLotesPercentual = function(lotes) {
    return new Promise(async (resolve, reject) => {
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            if (!eventoId) {
                throw new Error('ID do evento não encontrado');
            }
            
            // Obter limite total
            const inputLimite = document.getElementById('limiteVendas');
            const limiteTotal = inputLimite ? parseInt(inputLimite.value) || 0 : 0;
            
            if (limiteTotal <= 0) {
                throw new Error('Configure primeiro o limite total de vendas');
            }
            
            console.log(`🚀 Criando ${lotes.length} lotes para evento ${eventoId} com limite ${limiteTotal}`);
            
            // NÃO marcar flag que remove botões - botões devem continuar
            // window.criandoLotesPercentual = true; // REMOVIDO
            
            // Preparar dados para INSERT no MySQL
            const lotesDados = lotes.map((lote, index) => {
                const quantidade = Math.floor((limiteTotal * lote.percentual) / 100);
                return {
                    nome: lote.nome || `Lote ${index + 1}`,
                    percentual_venda: lote.percentual,
                    quantidade: quantidade,
                    divulgar_criterio: lote.divulgar ? 1 : 0
                };
            });
            
            console.log('📦 Enviando para INSERT no MySQL:', lotesDados);
            
            // Fazer INSERT no banco via backend
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    action: 'criar_lotes_percentual',
                    evento_id: eventoId,
                    lotes: JSON.stringify(lotesDados),
                    limite_total: limiteTotal
                }).toString()
            });
            
            const data = await response.json();
            
            if (!data.sucesso) {
                throw new Error(data.erro || 'Erro ao inserir lotes no banco');
            }
            
            console.log('✅ Lotes inseridos no MySQL com sucesso:', data.lotes_criados);
            
            // NÃO resetar flag nem gerenciar botões
            // window.criandoLotesPercentual = false; // REMOVIDO
            
            // Retornar lotes criados
            resolve(data.lotes_criados);
            
        } catch (error) {
            console.error('❌ Erro ao criar lotes:', error);
            // window.criandoLotesPercentual = false; // REMOVIDO
            reject(error);
        }
    });
};

// =======================================================
// WRAPPER PARA COMPATIBILIDADE
// =======================================================

/**
 * Wrapper para compatibilidade com código existente
 */
window.criarLotePercentual = function(dadosLote) {
    // Se receber um único lote, converter para array
    const lotes = Array.isArray(dadosLote) ? dadosLote : [dadosLote];
    return window.criarLotesPercentual(lotes);
};

// =======================================================
// EXEMPLO DE USO
// =======================================================

window.exemploLotesPercentual = function() {
    console.log('🧪 Testando criação de lotes por percentual');
    
    const lotes = [
        { nome: 'Lote Promocional', percentual: 25, divulgar: true },
        { nome: 'Lote Regular', percentual: 50, divulgar: false },
        { nome: 'Lote Final', percentual: 100, divulgar: true }
    ];
    
    window.criarLotesPercentual(lotes)
        .then(lotesConfirmados => {
            console.log('🎉 Lotes criados com sucesso:', lotesConfirmados);
            alert(`${lotesConfirmados.length} lotes inseridos no MySQL!`);
        })
        .catch(error => {
            console.error('❌ Erro ao criar lotes:', error);
            alert('Erro: ' + error.message);
        });
};

console.log('✅ Função criarLotesPercentual() corrigida e funcionando!');
console.log('🔹 Agora faz INSERT no MySQL corretamente');
console.log('🔹 NÃO remove botões editar');
console.log('🔹 Para testar: exemploLotesPercentual()');
