/**
 * CORREÇÃO SIMPLIFICADA - ETAPA 5 WIZARD
 * 
 * FOCO: Resolver apenas os 2 problemas específicos
 * SEM ALTERAÇÕES NO BANCO DE DADOS
 */

// =======================================================
// PROBLEMA 1: LIMITE_VENDAS ZERADO AO RETOMAR RASCUNHO
// =======================================================

/**
 * Correção: Carregar limite sem forçar zero
 * MANTÉM: Valor real do banco MySQL
 */
window.carregarLimiteSemZerar = function() {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ ID do evento não encontrado');
        return;
    }
    
    fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `action=carregar_limite_vendas&evento_id=${eventoId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso && data.dados) {
            const checkbox = document.getElementById('controlarLimiteVendas');
            const inputLimite = document.getElementById('limiteVendas');
            const campoLimite = document.getElementById('campoLimiteVendas');
            
            // Configurar checkbox
            if (checkbox) {
                checkbox.checked = Boolean(data.dados.controlar_limite_vendas);
            }
            
            // Se ativo, mostrar campo e carregar valor REAL
            if (data.dados.controlar_limite_vendas) {
                if (campoLimite) {
                    campoLimite.style.display = 'block';
                }
                
                // CORREÇÃO CRÍTICA: Usar valor real do banco
                if (inputLimite && data.dados.limite_vendas > 0) {
                    inputLimite.value = data.dados.limite_vendas;
                    console.log(`✅ Limite carregado: ${data.dados.limite_vendas}`);
                }
            } else {
                if (campoLimite) {
                    campoLimite.style.display = 'none';
                }
            }
        }
    })
    .catch(error => {
        console.error('❌ Erro ao carregar limite:', error);
    });
};

// =======================================================
// PROBLEMA 2: CRIAR LOTES NO BANCO MYSQL
// =======================================================

/**
 * Correção: Implementar criarLotesPercentual completa
 * INSERE: Registros na tabela lotes existente
 */
window.criarLotesPercentualCompleta = function(lotesConfig) {
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
            
            // Preparar dados usando campos EXISTENTES da tabela
            const lotesDados = lotesConfig.map((lote, index) => {
                const quantidade = Math.floor((limiteTotal * lote.percentual) / 100);
                return {
                    nome: lote.nome || `Lote ${index + 1}`,
                    percentual_venda: lote.percentual,
                    quantidade: quantidade,
                    divulgar_criterio: lote.divulgar ? 1 : 0
                };
            });
            
            console.log('📦 Enviando lotes para o banco:', lotesDados);
            
            // Enviar para backend
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
                throw new Error(data.erro || 'Erro ao criar lotes');
            }
            
            console.log('✅ Lotes criados no MySQL:', data.lotes_criados);
            
            // Atualizar interface se necessário
            if (typeof atualizarListaLotes === 'function') {
                atualizarListaLotes();
            }
            
            resolve(data.lotes_criados);
            
        } catch (error) {
            console.error('❌ Erro ao criar lotes:', error);
            reject(error);
        }
    });
};

// =======================================================
// SUBSTITUR FUNÇÕES ORIGINAIS (SE EXISTIREM)
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para não conflitar com carregamentos existentes
    setTimeout(() => {
        
        // Problema 1: Substituir carregamento que zera valores
        if (window.carregarLimiteVendas) {
            console.log('⚡ Substituindo carregarLimiteVendas pela versão que não zera');
            window.carregarLimiteVendasOriginal = window.carregarLimiteVendas;
            window.carregarLimiteVendas = window.carregarLimiteSemZerar;
        }
        
        // Problema 2: Implementar função que faltava
        if (!window.criarLotesPercentual) {
            console.log('⚡ Implementando criarLotesPercentual ausente');
            window.criarLotesPercentual = window.criarLotesPercentualCompleta;
        } else {
            console.log('⚡ Substituindo criarLotesPercentual pela versão completa');
            window.criarLotesPercentualOriginal = window.criarLotesPercentual;
            window.criarLotesPercentual = window.criarLotesPercentualCompleta;
        }
        
        // Auto-carregar se estiver na etapa 5
        if (window.location.search.includes('evento_id=')) {
            console.log('📦 Auto-carregando configuração da etapa 5');
            window.carregarLimiteSemZerar();
        }
        
    }, 1500); // Aguardar outros scripts carregarem
});

// =======================================================
// FUNÇÃO DE TESTE RÁPIDO
// =======================================================

window.testarCorrecaoEtapa5 = function() {
    console.log('🧪 Testando correções da Etapa 5...');
    
    console.log('1. Função carregarLimiteSemZerar:', typeof window.carregarLimiteSemZerar);
    console.log('2. Função criarLotesPercentual:', typeof window.criarLotesPercentual);
    
    // Teste prático
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    if (eventoId) {
        console.log('3. Testando carregamento...');
        window.carregarLimiteSemZerar();
        
        console.log('4. Para testar criação de lotes, execute:');
        console.log('   criarLotesPercentual([{nome:"Teste", percentual:50, divulgar:true}])');
    } else {
        console.log('3. ❌ Não está em uma página de evento (sem evento_id na URL)');
    }
};

console.log('✅ Correções da Etapa 5 carregadas! Execute testarCorrecaoEtapa5() para testar');
