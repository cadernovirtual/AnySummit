/**
 * CORREÇÃO ETAPA 5 - LOTES POR QUANTIDADE
 * 
 * PROBLEMAS CORRIGIDOS:
 * 1. limite_vendas zerado ao retomar rascunho  
 * 2. criarLotesPercentual não inserindo no MySQL
 * 3. toggleLimiteVendas salvando automaticamente (deve salvar só no Confirmar)
 */

// =======================================================
// CORREÇÃO 1: CARREGAR LIMITE SEM ZERAR
// =======================================================

window.carregarLimiteCorrigido = function() {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
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
            const botao = document.getElementById('btnCriarLoteQuantidade');
            
            // Configurar checkbox
            if (checkbox) {
                checkbox.checked = Boolean(data.dados.controlar_limite_vendas);
            }
            
            // Se ativo, mostrar campo e MANTER valor do banco
            if (data.dados.controlar_limite_vendas) {
                if (campoLimite) {
                    campoLimite.style.display = 'block';
                }
                
                // CORREÇÃO CRÍTICA: Usar valor real do banco, não zero
                if (inputLimite && data.dados.limite_vendas > 0) {
                    inputLimite.value = data.dados.limite_vendas;
                    console.log(`✅ Limite carregado: ${data.dados.limite_vendas}`);
                    
                    // Habilitar botão
                    if (botao) {
                        botao.disabled = false;
                        botao.style.opacity = '1';
                        botao.style.cursor = 'pointer';
                    }
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
// CORREÇÃO 3: TOGGLE QUE NÃO SALVA AUTOMATICAMENTE
// =======================================================

window.toggleLimiteVendasCorrigido = function() {
    console.log('🔄 Toggle checkbox (SEM salvar automaticamente)');
    
    const checkbox = document.getElementById('controlarLimiteVendas');
    const campoLimite = document.getElementById('campoLimiteVendas');
    
    if (!checkbox || !campoLimite) {
        console.error('❌ Elementos não encontrados');
        return;
    }
    
    if (checkbox.checked) {
        // Ativando - apenas mostrar campo (NÃO salvar ainda)
        campoLimite.style.display = 'block';
        
        // Focar no campo
        const inputLimite = document.getElementById('limiteVendas');
        if (inputLimite) {
            inputLimite.focus();
        }
        
        console.log('✅ Campo exibido. Digite o limite e clique em Confirmar.');
        
    } else {
        // Desativando - esconder campo e salvar desativação
        campoLimite.style.display = 'none';
        salvarDesativacaoLimite();
    }
};

// =======================================================
// CORREÇÃO: FUNÇÃO CONFIRMAR LIMITE (que estava faltando)
// =======================================================

window.confirmarLimiteVendas = function() {
    console.log('💾 Confirmando limite de vendas...');
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    const inputLimite = document.getElementById('limiteVendas');
    
    if (!eventoId) {
        alert('ID do evento não encontrado');
        return;
    }
    
    if (!inputLimite || !inputLimite.value) {
        alert('Digite o limite de vendas primeiro');
        inputLimite?.focus();
        return;
    }
    
    const limite = parseInt(inputLimite.value);
    if (limite <= 0) {
        alert('Limite deve ser maior que zero');
        inputLimite.focus();
        return;
    }
    
    // AQUI SIM, salvar no banco quando clica em Confirmar
    const dados = {
        action: 'salvar_limite_vendas',
        evento_id: eventoId,
        controlar_limite_vendas: 1,
        limite_vendas: limite
    };
    
    fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(dados).toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            console.log(`✅ Limite confirmado: ${limite}`);
            alert(`Limite de ${limite} pessoas confirmado!`);
            
            // Habilitar botão de criar lotes
            const botao = document.getElementById('btnCriarLoteQuantidade');
            if (botao) {
                botao.disabled = false;
                botao.style.opacity = '1';
                botao.style.cursor = 'pointer';
            }
            
        } else {
            console.error('❌ Erro ao salvar:', data.erro);
            alert('Erro ao salvar: ' + data.erro);
        }
    })
    .catch(error => {
        console.error('❌ Erro na requisição:', error);
        alert('Erro na requisição: ' + error.message);
    });
};

// Função auxiliar para desativar APENAS o controle (SEM zerar limite_vendas)
function salvarDesativacaoLimite() {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) return;
    
    // CORREÇÃO CRÍTICA: NÃO enviar limite_vendas = 0, apenas desativar controle
    const dados = {
        action: 'salvar_limite_vendas',
        evento_id: eventoId,
        controlar_limite_vendas: 0
        // REMOVIDO: limite_vendas: 0 - Isso mantém o valor atual no banco
    };
    
    fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(dados).toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.sucesso) {
            console.log('✅ Controle de limite desativado (valor preservado no banco)');
        }
    })
    .catch(error => {
        console.error('❌ Erro ao desativar:', error);
    });
}

// =======================================================
// CORREÇÃO 2: IMPLEMENTAR criarLotesPercentual
// =======================================================

window.criarLotesPercentual = function(lotesConfig) {
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
            
            console.log(`🚀 Criando lotes com limite total: ${limiteTotal}`);
            
            // Preparar dados para o backend
            const lotesDados = lotesConfig.map((lote, index) => {
                const quantidade = Math.floor((limiteTotal * lote.percentual) / 100);
                return {
                    nome: lote.nome || `Lote ${index + 1}`,
                    percentual_venda: lote.percentual,
                    quantidade: quantidade,
                    divulgar_criterio: lote.divulgar ? 1 : 0
                };
            });
            
            console.log('📦 Enviando lotes para INSERT no MySQL:', lotesDados);
            
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
            
            console.log('✅ Lotes inseridos no MySQL com sucesso:', data.lotes_criados);
            
            // MANTÉM BOTÕES EDITAREM: Não remover nem esconder botões existentes
            // A interface será atualizada naturalmente se houver função para isso
            
            resolve(data.lotes_criados);
            
        } catch (error) {
            console.error('❌ Erro ao criar lotes:', error);
            reject(error);
        }
    });
};

// =======================================================
// APLICAR CORREÇÕES AUTOMATICAMENTE
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Aplicando correções da Etapa 5...');
    
    // Aguardar outros scripts carregarem
    setTimeout(() => {
        
        // CORREÇÃO CRÍTICA: Substituir toggleLimiteVendas para não salvar automaticamente
        if (window.toggleLimiteVendas) {
            console.log('⚡ Substituindo toggleLimiteVendas pela versão que NÃO salva automaticamente');
            window.toggleLimiteVendasOriginal = window.toggleLimiteVendas;
            window.toggleLimiteVendas = window.toggleLimiteVendasCorrigido;
        }
        
        // Substituir função de carregamento se existir
        if (window.carregarControleLimit) {
            console.log('⚡ Substituindo carregarControleLimit pela versão corrigida');
            window.carregarControleLimitOriginal = window.carregarControleLimit;
            window.carregarControleLimit = window.carregarLimiteCorrigido;
        }
        
        // Carregar automaticamente se estiver em um evento
        const eventoId = new URLSearchParams(window.location.search).get('evento_id');
        if (eventoId) {
            console.log('📦 Carregando dados do evento automaticamente');
            window.carregarLimiteCorrigido();
        }
        
    }, 1000);
});

// =======================================================
// FUNÇÃO DE EXEMPLO/TESTE
// =======================================================

window.exemploLotesPercentual = function() {
    console.log('🧪 Exemplo de criação de lotes por percentual');
    
    const lotes = [
        {
            nome: 'Lote Promocional',
            percentual: 30,
            divulgar: true
        },
        {
            nome: 'Lote Regular',
            percentual: 70,
            divulgar: true  
        },
        {
            nome: 'Lote Final',
            percentual: 100,
            divulgar: false
        }
    ];
    
    window.criarLotesPercentual(lotes)
        .then(lotesConfirmados => {
            console.log('🎉 Lotes inseridos no MySQL:', lotesConfirmados);
            alert(`${lotesConfirmados.length} lotes criados com sucesso no banco de dados!`);
        })
        .catch(error => {
            console.error('❌ Erro:', error);
            alert('Erro ao criar lotes: ' + error.message);
        });
};

console.log('✅ Correções da Etapa 5 carregadas!');
console.log('🔹 toggleLimiteVendas agora SÓ mostra/esconde campo');  
console.log('🔹 confirmarLimiteVendas salva no banco');
console.log('🔹 Para testar: exemploLotesPercentual()');

