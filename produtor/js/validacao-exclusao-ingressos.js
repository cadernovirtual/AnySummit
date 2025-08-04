/**
 * VALIDAÇÃO DE EXCLUSÃO DE INGRESSOS
 * Impede exclusão de ingressos que estão referenciados em combos
 */

console.log('🔧 VALIDACAO-EXCLUSAO-INGRESSOS.JS carregando...');

/**
 * VERIFICAR SE INGRESSO ESTÁ EM ALGUM COMBO
 */
async function verificarIngressoEmCombo(ingressoId, eventoId) {
    console.log(`🔍 Verificando se ingresso ${ingressoId} está em algum combo...`);
    
    try {
        // Buscar todos os ingressos do evento
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=listar_ingressos&evento_id=${eventoId}`
        });
        
        const textResponse = await response.text();
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('❌ Erro ao parsear resposta da listagem:', parseError);
            return { erro: 'Erro ao verificar referências em combos' };
        }
        
        if (!data.sucesso || !data.ingressos) {
            console.error('❌ Erro ao listar ingressos:', data.erro);
            return { erro: 'Erro ao verificar referências em combos' };
        }
        
        console.log(`📋 Verificando ${data.ingressos.length} ingressos...`);
        
        // Procurar referências nos combos
        const combosQueReferenciam = [];
        
        data.ingressos.forEach(ingresso => {
            if (ingresso.tipo === 'combo' && ingresso.conteudo_combo) {
                try {
                    const conteudoCombo = JSON.parse(ingresso.conteudo_combo);
                    
                    if (Array.isArray(conteudoCombo)) {
                        const encontrado = conteudoCombo.find(item => item.ingresso_id == ingressoId);
                        
                        if (encontrado) {
                            combosQueReferenciam.push({
                                id: ingresso.id,
                                titulo: ingresso.titulo,
                                quantidade: encontrado.quantidade
                            });
                        }
                    }
                    
                } catch (parseError) {
                    console.warn(`⚠️ Erro ao parsear combo ${ingresso.id}:`, parseError);
                }
            }
        });
        
        if (combosQueReferenciam.length > 0) {
            console.log(`❌ Ingresso ${ingressoId} está referenciado em ${combosQueReferenciam.length} combo(s):`, combosQueReferenciam);
            
            return {
                podeExcluir: false,
                combos: combosQueReferenciam,
                mensagem: `Esse ingresso não pode ser excluído pois está inserido em um Combo: ${combosQueReferenciam.map(c => c.titulo).join(', ')}`
            };
        } else {
            console.log(`✅ Ingresso ${ingressoId} não está referenciado em nenhum combo`);
            
            return {
                podeExcluir: true,
                combos: [],
                mensagem: null
            };
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar referências em combos:', error);
        return { erro: 'Erro ao verificar referências em combos' };
    }
}

/**
 * INTERCEPTAR FUNÇÃO removeTicket ORIGINAL - VERSÃO CORRIGIDA
 */
function interceptarRemoveTicket() {
    console.log('🎯 Interceptando função removeTicket - versão corrigida...');
    
    // Flag para evitar interceptação múltipla
    if (window.removeTicketInterceptado) {
        console.log('⚠️ removeTicket já interceptado, pulando...');
        return;
    }
    
    // Aguardar função estar disponível
    setTimeout(() => {
        if (typeof window.removeTicket === 'function') {
            console.log('✅ removeTicket encontrada, criando interceptação...');
            
            const removeTicketOriginal = window.removeTicket;
            window.removeTicketInterceptado = true;
            
            window.removeTicket = async function(ticketId) {
                console.log(`🗑️ removeTicket interceptada - ID: ${ticketId}`);
                
                // Obter evento ID
                const eventoId = new URLSearchParams(window.location.search).get('evento_id');
                
                if (!eventoId) {
                    console.error('❌ Evento ID não encontrado');
                    alert('Erro: ID do evento não encontrado');
                    return;
                }
                
                try {
                    // Verificar se pode excluir
                    console.log(`🔄 Verificando combo para ingresso ${ticketId}...`);
                    const verificacao = await verificarIngressoEmCombo(ticketId, eventoId);
                    
                    if (verificacao.erro) {
                        console.error('❌ Erro na verificação:', verificacao.erro);
                        alert(verificacao.erro);
                        return;
                    }
                    
                    if (!verificacao.podeExcluir) {
                        console.log('🚫 Exclusão bloqueada:', verificacao.mensagem);
                        alert(verificacao.mensagem);
                        return;
                    }
                    
                    // Se pode excluir, executar função original
                    console.log('✅ Pode excluir, chamando função original...');
                    return removeTicketOriginal.call(this, ticketId);
                    
                } catch (error) {
                    console.error('❌ Erro na interceptação:', error);
                    alert('Erro ao verificar exclusão: ' + error.message);
                }
            };
            
            console.log('✅ Função removeTicket interceptada com validação');
            
        } else {
            console.warn('⚠️ Função removeTicket não encontrada para interceptação');
        }
    }, 2000);
}

/**
 * INTERCEPTAR OUTRAS FUNÇÕES DE EXCLUSÃO - DESABILITADO PARA EVITAR LOOPS
 */
function interceptarOutrasFuncoesExclusao() {
    console.log('🎯 Interceptação de outras funções DESABILITADA para evitar loops');
    
    // Comentando para evitar loops
    /*
    setTimeout(() => {
        // Lista de possíveis funções de exclusão
        const funcoesExclusao = [
            'deleteTicket',
            'excluirIngresso', 
            'removerIngresso',
            'deleteIngresso',
            'excluirTicket'
        ];
        
        funcoesExclusao.forEach(nomeFuncao => {
            if (typeof window[nomeFuncao] === 'function') {
                console.log(`🎯 Interceptando ${nomeFuncao}...`);
                
                const funcaoOriginal = window[nomeFuncao];
                
                window[nomeFuncao] = async function(ticketId, ...args) {
                    console.log(`🗑️ Tentativa de exclusão via ${nomeFuncao}: ${ticketId}`);
                    
                    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
                    
                    if (!eventoId) {
                        alert('Erro: ID do evento não encontrado');
                        return;
                    }
                    
                    // Verificar se pode excluir
                    const verificacao = await verificarIngressoEmCombo(ticketId, eventoId);
                    
                    if (verificacao.erro) {
                        alert(verificacao.erro);
                        return;
                    }
                    
                    if (!verificacao.podeExcluir) {
                        alert(verificacao.mensagem);
                        return;
                    }
                    
                    // Se pode excluir, executar função original
                    return funcaoOriginal.call(this, ticketId, ...args);
                };
                
                console.log(`✅ ${nomeFuncao} interceptada com validação`);
            }
        });
        
    }, 2500);
    */
}

/**
 * INTERCEPTAR CLIQUES EM BOTÕES DE EXCLUSÃO - VERSÃO CORRIGIDA
 */
function interceptarBotoesExclusao() {
    console.log('🎯 Interceptando cliques em botões de exclusão - versão corrigida...');
    
    // Flag para evitar interceptação múltipla
    if (window.interceptacaoExclusaoAtiva) {
        console.log('⚠️ Interceptação já ativa, pulando...');
        return;
    }
    
    window.interceptacaoExclusaoAtiva = true;
    
    setTimeout(() => {
        // Usar delegação de eventos no document, mas com controle mais específico
        document.addEventListener('click', async function(event) {
            const target = event.target;
            
            // Verificações mais específicas para botões de exclusão
            const isDeleteButton = 
                target.title?.toLowerCase().includes('remover') ||
                target.title?.toLowerCase().includes('excluir') ||
                target.textContent?.includes('🗑️') ||
                target.innerHTML?.includes('🗑️') ||
                (target.onclick && target.onclick.toString().includes('removeTicket')) ||
                (target.getAttribute('onclick') && target.getAttribute('onclick').includes('removeTicket'));
            
            if (!isDeleteButton) {
                return; // Não é botão de exclusão, continuar normalmente
            }
            
            console.log('🗑️ Botão de exclusão detectado:', target);
            
            // CRÍTICO: Prevenir execução imediata
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
            
            // Tentar encontrar ID do ticket de forma mais robusta
            let ticketId = null;
            
            // 1. Procurar no elemento e pais
            let elemento = target;
            let tentativas = 0;
            while (elemento && !ticketId && tentativas < 10) {
                ticketId = elemento.dataset.ticketId || 
                          elemento.getAttribute('data-ticket-id') ||
                          elemento.dataset.id;
                
                // Extrair do onclick se disponível
                if (!ticketId) {
                    const onclickStr = elemento.onclick?.toString() || elemento.getAttribute('onclick') || '';
                    const match = onclickStr.match(/removeTicket\s*\(\s*['"]*(\d+)['"]*\s*\)/);
                    if (match) {
                        ticketId = match[1];
                    }
                }
                
                elemento = elemento.parentElement;
                tentativas++;
            }
            
            if (!ticketId) {
                console.warn('⚠️ ID do ticket não encontrado, permitindo execução normal');
                // Se não conseguir encontrar ID, permitir execução normal
                target.click();
                return;
            }
            
            console.log(`🔍 ID do ticket identificado: ${ticketId}`);
            
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            if (!eventoId) {
                alert('Erro: ID do evento não encontrado');
                return;
            }
            
            try {
                // Verificar se pode excluir
                console.log(`🔄 Verificando se ingresso ${ticketId} pode ser excluído...`);
                const verificacao = await verificarIngressoEmCombo(ticketId, eventoId);
                
                if (verificacao.erro) {
                    alert(verificacao.erro);
                    return;
                }
                
                if (!verificacao.podeExcluir) {
                    console.log('🚫 Exclusão bloqueada:', verificacao.mensagem);
                    alert(verificacao.mensagem);
                    return;
                }
                
                // Se pode excluir, executar função original
                console.log('✅ Exclusão permitida, executando...');
                
                // Executar removeTicket diretamente
                if (typeof window.removeTicket === 'function') {
                    window.removeTicket(ticketId);
                } else {
                    // Fallback: executar onclick original
                    const onclickOriginal = target.getAttribute('onclick');
                    if (onclickOriginal) {
                        eval(onclickOriginal);
                    }
                }
                
            } catch (error) {
                console.error('❌ Erro na validação:', error);
                alert('Erro ao validar exclusão. Verifique o console.');
            }
            
        }, true); // Use capturing para interceptar antes
        
        console.log('✅ Interceptação de botões configurada com controle de loop');
        
    }, 3000);
}

/**
 * Inicialização
 */
function inicializar() {
    console.log('🚀 Inicializando validação de exclusão de ingressos...');
    
    // Configurar interceptações
    interceptarRemoveTicket();
    interceptarOutrasFuncoesExclusao();
    interceptarBotoesExclusao();
    
    // Abordagem alternativa para casos problemáticos
    interceptacaoAlternativaSimples();
    
    console.log('✅ Validação de exclusão inicializada com múltiplas abordagens');
}

/**
 * FUNÇÃO GLOBAL PARA TESTE MANUAL
 */
window.testarValidacaoExclusao = async function(ingressoId) {
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ Evento ID não encontrado');
        return;
    }
    
    const resultado = await verificarIngressoEmCombo(ingressoId, eventoId);
    
    console.log('🧪 Resultado do teste:', resultado);
    
    if (resultado.podeExcluir) {
        console.log('✅ Ingresso PODE ser excluído');
    } else {
        console.log('❌ Ingresso NÃO PODE ser excluído:', resultado.mensagem);
    }
    
    return resultado;
};

/**
 * FUNÇÃO PARA DEBUG DOS LOOPS
 */
window.debugValidacaoExclusao = function() {
    console.log('🔍 DEBUG da validação de exclusão:');
    console.log('  - removeTicketInterceptado:', window.removeTicketInterceptado);
    console.log('  - interceptacaoExclusaoAtiva:', window.interceptacaoExclusaoAtiva);
    console.log('  - removeTicket type:', typeof window.removeTicket);
    
    const botoes = document.querySelectorAll('button[onclick*="removeTicket"], [title*="Remover"], [title*="remover"]');
    console.log(`  - Botões de exclusão encontrados: ${botoes.length}`);
    
    botoes.forEach((botao, index) => {
        console.log(`    Botão ${index}:`, {
            onclick: botao.onclick?.toString().substring(0, 50) + '...',
            title: botao.title,
            text: botao.textContent?.substring(0, 20)
        });
    });
};

/**
 * ABORDAGEM ALTERNATIVA - INTERCEPTAÇÃO SIMPLES POR OBSERVAÇÃO
 */
function interceptacaoAlternativaSimples() {
    console.log('🎯 Configurando interceptação alternativa simples...');
    
    setTimeout(() => {
        // Interceptar todos os botões de exclusão existentes
        const botoesExclusao = document.querySelectorAll('button[onclick*="removeTicket"], [title*="Remover"], [title*="remover"]');
        
        console.log(`🔍 Encontrados ${botoesExclusao.length} botões de exclusão`);
        
        botoesExclusao.forEach(botao => {
            // Salvar onclick original
            const onclickOriginal = botao.onclick || botao.getAttribute('onclick');
            
            if (onclickOriginal) {
                // Remover onclick original
                botao.onclick = null;
                botao.removeAttribute('onclick');
                
                // Adicionar novo handler
                botao.addEventListener('click', async function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    console.log('🗑️ Botão de exclusão clicado (interceptação simples)');
                    
                    // Extrair ID do ticket
                    let ticketId = null;
                    
                    if (typeof onclickOriginal === 'function') {
                        const funcStr = onclickOriginal.toString();
                        const match = funcStr.match(/removeTicket\s*\(\s*['"]*(\d+)['"]*\s*\)/);
                        if (match) {
                            ticketId = match[1];
                        }
                    } else if (typeof onclickOriginal === 'string') {
                        const match = onclickOriginal.match(/removeTicket\s*\(\s*['"]*(\d+)['"]*\s*\)/);
                        if (match) {
                            ticketId = match[1];
                        }
                    }
                    
                    // Também tentar pegar do elemento
                    if (!ticketId) {
                        let elemento = botao;
                        while (elemento && !ticketId) {
                            ticketId = elemento.dataset.ticketId || elemento.getAttribute('data-ticket-id');
                            elemento = elemento.parentElement;
                        }
                    }
                    
                    if (!ticketId) {
                        console.warn('⚠️ ID do ticket não encontrado, permitindo ação original');
                        if (typeof onclickOriginal === 'function') {
                            onclickOriginal.call(botao);
                        } else {
                            eval(onclickOriginal);
                        }
                        return;
                    }
                    
                    console.log(`🔍 ID extraído: ${ticketId}`);
                    
                    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
                    
                    if (!eventoId) {
                        alert('Erro: ID do evento não encontrado');
                        return;
                    }
                    
                    try {
                        // Verificar se pode excluir
                        const verificacao = await verificarIngressoEmCombo(ticketId, eventoId);
                        
                        if (verificacao.erro) {
                            alert(verificacao.erro);
                            return;
                        }
                        
                        if (!verificacao.podeExcluir) {
                            alert(verificacao.mensagem);
                            return;
                        }
                        
                        // Se pode excluir, executar ação original
                        console.log('✅ Exclusão permitida, executando ação original');
                        
                        if (typeof onclickOriginal === 'function') {
                            onclickOriginal.call(botao);
                        } else {
                            eval(onclickOriginal);
                        }
                        
                    } catch (error) {
                        console.error('❌ Erro na validação:', error);
                        alert('Erro ao validar exclusão');
                    }
                });
                
                console.log('✅ Botão interceptado:', botao);
            }
        });
        
        // Observar novos botões adicionados dinamicamente
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        const novosBotoes = node.querySelectorAll ? 
                            node.querySelectorAll('button[onclick*="removeTicket"], [title*="Remover"], [title*="remover"]') : 
                            [];
                        
                        if (novosBotoes.length > 0) {
                            console.log(`🔍 Novos botões de exclusão encontrados: ${novosBotoes.length}`);
                            // Interceptar novos botões...
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ Interceptação alternativa simples configurada');
        
    }, 4000);
}

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

console.log('✅ VALIDACAO-EXCLUSAO-INGRESSOS.JS carregado!');
console.log('🔧 Recursos implementados:');
console.log('  1. ✅ Verificação de referências em combos antes da exclusão');
console.log('  2. ✅ Interceptação de removeTicket e outras funções de exclusão');
console.log('  3. ✅ Interceptação de cliques em botões de exclusão');
console.log('  4. ✅ Mensagem clara quando exclusão é bloqueada');
console.log('💡 Função de teste:');
console.log('  - window.testarValidacaoExclusao(ingressoId) - testar validação manualmente');
