/**
 * CORREÇÃO DEFINITIVA - CONTROLE DE LIMITE DE VENDAS
 * 
 * PROBLEMAS RESOLVIDOS:
 * 1. ❌ limite_vendas sendo zerado ao retomar rascunho
 * 2. ❌ função criarLotesPercentual não inserindo no banco MySQL
 * 
 * CORREÇÕES IMPLEMENTADAS:
 * 1. ✅ Carregamento correto do limite_vendas do banco
 * 2. ✅ Implementação completa da criarLotesPercentual com INSERT no MySQL
 * 
 * IMPORTANTE: Usa estrutura EXISTENTE da tabela lotes (sem alterações)
 */

// =======================================================
// CORREÇÃO 1: CARREGAR LIMITE VENDAS SEM ZERAR
// =======================================================

/**
 * Função corrigida para carregar limite de vendas sem sobrescrever valores
 */
window.carregarLimiteVendasCorrigido = function() {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ ID do evento não encontrado na URL');
        return;
    }
    
    console.log('📦 Carregando configuração de limite de vendas do evento:', eventoId);
    
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
            console.log('✅ Dados carregados do banco:', data.dados);
            
            const checkbox = document.getElementById('controlarLimiteVendas');
            const inputLimite = document.getElementById('limiteVendas');
            const campoLimite = document.getElementById('campoLimiteVendas');
            const botao = document.getElementById('btnCriarLoteQuantidade');
            
            // Configurar checkbox com valor do banco
            if (checkbox) {
                checkbox.checked = Boolean(data.dados.controlar_limite_vendas);
                console.log('📋 Checkbox configurado:', checkbox.checked);
            }
            
            // Se checkbox está marcado, mostrar campo e carregar valor
            if (data.dados.controlar_limite_vendas) {
                if (campoLimite) {
                    campoLimite.style.display = 'block';
                    console.log('✅ Campo de limite exibido');
                }
                
                // CORREÇÃO CRÍTICA: Carregar valor REAL do banco (NUNCA ZERO se já existia)
                if (inputLimite && data.dados.limite_vendas > 0) {
                    const valorAtualCampo = inputLimite.value;
                    
                    // Se o campo já tem um valor válido, não sobrescrever
                    if (valorAtualCampo && valorAtualCampo !== '0' && valorAtualCampo !== '') {
                        console.log(`⚠️ PRESERVANDO valor existente no campo: ${valorAtualCampo} (banco tem: ${data.dados.limite_vendas})`);
                    } else {
                        inputLimite.value = data.dados.limite_vendas;
                        console.log(`✅ Limite carregado do banco: ${data.dados.limite_vendas}`);
                    }
                    
                    // Habilitar botão se há limite válido
                    if (botao) {
                        botao.disabled = false;
                        botao.style.opacity = '1';
                        botao.style.cursor = 'pointer';
                        console.log('✅ Botão habilitado');
                    }
                } else if (data.dados.limite_vendas === 0) {
                    console.log('⚠️ Banco retornou limite_vendas = 0 - não alterando campo para preservar valor existente');
                }
            } else {
                // Se checkbox não está marcado, esconder campo
                if (campoLimite) {
                    campoLimite.style.display = 'none';
                }
                
                if (botao) {
                    botao.disabled = true;
                    botao.style.opacity = '0.5';
                    botao.style.cursor = 'not-allowed';
                }
            }
            
        } else {
            console.error('❌ Erro ao carregar limite de vendas:', data.erro);
        }
    })
    .catch(error => {
        console.error('❌ Erro na requisição:', error);
    });
};

// =======================================================
// CORREÇÃO 2: IMPLEMENTAR criarLotesPercentual COMPLETA
// =======================================================

/**
 * Função principal para criar lotes por percentual de vendas
 * INCLUI: Inserção no banco MySQL + atualização da interface
 */
window.criarLotesPercentual = function(lotesConfig) {
    return new Promise(async (resolve, reject) => {
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            if (!eventoId) {
                throw new Error('ID do evento não encontrado');
            }
            
            console.log('🚀 Iniciando criação de lotes por percentual:', lotesConfig);
            
            // Marcar que está criando lotes
            window.criandoLotesPercentual = true;
            
            // Proteger botões durante criação
            if (window.protegerBotoesEditar) {
                window.protegerBotoesEditar();
            }
            
            // Obter limite total de vendas
            const inputLimite = document.getElementById('limiteVendas');
            const limiteTotal = inputLimite ? parseInt(inputLimite.value) || 0 : 0;
            
            if (limiteTotal <= 0) {
                throw new Error('Limite total de vendas deve ser maior que zero');
            }
            
            console.log(`📊 Criando lotes com limite total: ${limiteTotal}`);
            
            // Preparar dados dos lotes para o backend
            const lotesDados = lotesConfig.map((lote, index) => {
                const quantidade = Math.floor((limiteTotal * lote.percentual) / 100);
                return {
                    nome: lote.nome || `Lote ${index + 1}`,
                    tipo: 'quantidade',
                    percentual_venda: lote.percentual,
                    quantidade: quantidade,
                    divulgar_criterio: lote.divulgar ? 1 : 0,
                    data_inicio: null, // Será definido no backend
                    data_fim: null     // Será definido no backend
                };
            });
            
            console.log('📦 Dados preparados para envio:', lotesDados);
            
            // Enviar para o backend
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
                throw new Error(data.erro || 'Erro ao criar lotes no banco');
            }
            
            console.log('✅ Lotes criados no banco com sucesso:', data.lotes_criados);
            
            // Atualizar interface com os lotes criados
            await atualizarInterfaceLotes(data.lotes_criados);
            
            // Marcar como concluído
            window.criandoLotesPercentual = false;
            
            // Desproteger botões
            if (window.desprotegerBotoesEditar) {
                window.desprotegerBotoesEditar();
            }
            
            console.log('🎉 Processo de criação de lotes concluído com sucesso');
            resolve(data.lotes_criados);
            
        } catch (error) {
            console.error('❌ Erro ao criar lotes por percentual:', error);
            
            // Limpar flags em caso de erro
            window.criandoLotesPercentual = false;
            
            if (window.desprotegerBotoesEditar) {
                window.desprotegerBotoesEditar();
            }
            
            reject(error);
        }
    });
};

// =======================================================
// FUNÇÃO AUXILIAR: ATUALIZAR INTERFACE
// =======================================================

/**
 * Atualiza a interface com os lotes criados no banco
 */
async function atualizarInterfaceLotes(lotesCriados) {
    console.log('🔄 Atualizando interface com lotes criados');
    
    const containerLotes = document.getElementById('lotes-container') || 
                          document.querySelector('.lotes-list') ||
                          document.querySelector('#step5 .content');
    
    if (!containerLotes) {
        console.warn('⚠️ Container de lotes não encontrado');
        return;
    }
    
    // Limpar lotes existentes na interface
    const lotesExistentes = containerLotes.querySelectorAll('.lote-item');
    lotesExistentes.forEach(lote => lote.remove());
    
    // Adicionar cada lote criado na interface
    lotesCriados.forEach((lote, index) => {
        const loteElement = criarElementoLote(lote, index);
        containerLotes.appendChild(loteElement);
    });
    
    console.log(`✅ Interface atualizada com ${lotesCriados.length} lotes`);
}

/**
 * Cria elemento HTML para um lote
 */
function criarElementoLote(lote, index) {
    const div = document.createElement('div');
    div.className = 'lote-item';
    div.dataset.loteId = lote.id;
    div.dataset.tipo = 'quantidade';
    
    div.innerHTML = `
        <div class="lote-header">
            <h4>${lote.nome}</h4>
            <div class="lote-actions">
                <button type="button" class="btn-editar" onclick="editarLote(${lote.id})">
                    ✏️ Editar
                </button>
                <button type="button" class="btn-excluir" onclick="excluirLote(${lote.id})">
                    🗑️ Excluir
                </button>
            </div>
        </div>
        <div class="lote-info">
            <p><strong>Quantidade:</strong> ${lote.quantidade} ingressos</p>
            <p><strong>Percentual:</strong> ${lote.percentual_venda}%</p>
            <p><strong>Divulgar:</strong> ${lote.divulgar_criterio ? 'Sim' : 'Não'}</p>
        </div>
    `;
    
    return div;
}

// =======================================================
// FUNÇÃO MELHORADA: TOGGLE LIMITE VENDAS
// =======================================================

/**
 * Versão corrigida do toggleLimiteVendas que não zera valores
 */
window.toggleLimiteVendasCorrigido = function() {
    console.log('🔄 Alternando controle de limite de vendas (versão corrigida)');
    
    const checkbox = document.getElementById('controlarLimiteVendas');
    const campoLimite = document.getElementById('campoLimiteVendas');
    
    if (!checkbox || !campoLimite) {
        console.error('❌ Elementos não encontrados');
        return;
    }
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    if (!eventoId) {
        console.error('❌ ID do evento não encontrado');
        return;
    }
    
    if (checkbox.checked) {
        // Ativando controle - mostrar campo
        campoLimite.style.display = 'block';
        
        // Focar no campo de limite
        const inputLimite = document.getElementById('limiteVendas');
        if (inputLimite) {
            inputLimite.focus();
        }
        
        // Salvar estado apenas do checkbox (SEM alterar limite_vendas)
        salvarEstadoCheckboxSemLimite(true);
        
    } else {
        // Desativando controle - esconder campo e zerar
        campoLimite.style.display = 'none';
        
        // Ao desativar, pode zerar o limite
        salvarEstadoComLimite(false, 0);
    }
};

/**
 * Salva apenas o estado do checkbox, mantendo limite_vendas do banco
 */
function salvarEstadoCheckboxSemLimite(ativado) {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    const dados = {
        action: 'salvar_limite_vendas',
        evento_id: eventoId,
        controlar_limite_vendas: ativado ? 1 : 0
        // NÃO enviar limite_vendas para manter valor do banco
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
            console.log('✅ Estado do checkbox salvo (limite mantido do banco)');
        } else {
            console.error('❌ Erro ao salvar:', data.erro);
        }
    })
    .catch(error => {
        console.error('❌ Erro na requisição:', error);
    });
}

/**
 * Salva estado completo (checkbox + limite)
 */
function salvarEstadoComLimite(ativado, limite) {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    const dados = {
        action: 'salvar_limite_vendas',
        evento_id: eventoId,
        controlar_limite_vendas: ativado ? 1 : 0,
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
            console.log(`✅ Estado completo salvo: checkbox=${ativado}, limite=${limite}`);
        } else {
            console.error('❌ Erro ao salvar:', data.erro);
        }
    })
    .catch(error => {
        console.error('❌ Erro na requisição:', error);
    });
}

// =======================================================
// PROTEÇÃO ADICIONAL: INTERCEPTAR TENTATIVAS DE ZERAR
// =======================================================

/**
 * Adiciona proteção contra tentativas de zerar o campo limite_vendas
 */
function protegerCampoLimiteVendas() {
    const inputLimite = document.getElementById('limiteVendas');
    
    if (!inputLimite) return;
    
    let valorProtegido = inputLimite.value;
    
    // Observar mudanças no campo
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                const novoValor = inputLimite.value;
                
                // Se tentaram zerar e tinha um valor válido antes, restaurar
                if ((novoValor === '0' || novoValor === '') && valorProtegido && valorProtegido !== '0') {
                    console.log(`🛡️ PROTEÇÃO ATIVADA: Restaurando valor ${valorProtegido} (tentaram colocar: ${novoValor})`);
                    inputLimite.value = valorProtegido;
                } else if (novoValor && novoValor !== '0') {
                    // Atualizar valor protegido se foi alterado para um valor válido
                    valorProtegido = novoValor;
                }
            }
        });
    });
    
    observer.observe(inputLimite, {
        attributes: true,
        attributeFilter: ['value']
    });
    
    // Também interceptar mudanças via JavaScript
    const originalValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    Object.defineProperty(inputLimite, 'value', {
        get() {
            return this.getAttribute('value') || '';
        },
        set(newValue) {
            // Se tentaram zerar e tinha valor protegido, não permitir
            if ((newValue === '0' || newValue === '') && valorProtegido && valorProtegido !== '0') {
                console.log(`🛡️ INTERCEPTAÇÃO: Bloqueando tentativa de zerar campo (valor protegido: ${valorProtegido})`);
                return; // Não aplicar o valor zero
            }
            
            // Se é um valor válido, permitir e atualizar proteção
            if (newValue && newValue !== '0') {
                valorProtegido = newValue;
            }
            
            originalValueSetter.call(this, newValue);
        }
    });
    
    console.log('🛡️ Proteção do campo limite_vendas ativada');
}

// =======================================================
// INICIALIZAÇÃO CORRIGIDA
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Correções de limite de vendas carregadas');
    
    // ATIVAR PROTEÇÃO CONTRA ZEROS
    setTimeout(() => {
        protegerCampoLimiteVendas();
    }, 500);
    
    // Substituir função original do toggleLimiteVendas
    if (window.toggleLimiteVendas) {
        console.log('⚡ Substituindo toggleLimiteVendas pela versão corrigida');
        window.toggleLimiteVendasOriginal = window.toggleLimiteVendas;
        window.toggleLimiteVendas = window.toggleLimiteVendasCorrigido;
    }
    
    // Substituir carregamento de limite
    if (window.carregarLimiteVendas) {
        console.log('⚡ Substituindo carregarLimiteVendas pela versão corrigida');
        window.carregarLimiteVendasOriginal = window.carregarLimiteVendas;
        window.carregarLimiteVendas = window.carregarLimiteVendasCorrigido;
    }
    
    // Carregar dados ao inicializar a página
    setTimeout(() => {
        if (window.location.search.includes('evento_id=')) {
            console.log('📦 Carregando dados de limite ao inicializar');
            
            // CORREÇÃO CRÍTICA: Verificar se já existe um valor no campo antes de carregar
            const inputLimite = document.getElementById('limiteVendas');
            const valorAtual = inputLimite ? inputLimite.value : '';
            
            if (valorAtual && valorAtual !== '0' && valorAtual !== '') {
                console.log('⚠️ CAMPO JÁ TEM VALOR, NÃO SOBRESCREVER:', valorAtual);
                return; // Não carregar se já tem valor válido
            }
            
            window.carregarLimiteVendasCorrigido();
        }
    }, 1000);
});

console.log('✅ Correções definitivas de limite de vendas e lotes por percentual carregadas!');
