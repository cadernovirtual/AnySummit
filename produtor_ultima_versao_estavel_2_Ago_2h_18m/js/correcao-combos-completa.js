/**
 * CORREÇÃO ESPECÍFICA PARA PROBLEMAS DOS COMBOS
 * 1. Duplicação de registros
 * 2. Valores monetários zerados  
 * 3. Erro de conexão
 * 4. Leitura do conteudo_combo na edição
 */

console.log('🔧 Carregando correções específicas para combos...');

// 1. CORREÇÃO DA COLETA DE VALORES MONETÁRIOS
window.coletarValoresMonetariosCombo = function(prefixo) {
    console.log('💰 Coletando valores monetários do combo...');
    
    // Possíveis campos de preço
    const camposPreco = [
        `${prefixo}Price`,
        'comboTicketPrice', 
        'editComboPrice',
        'comboPrice',
        'editComboTicketPrice'
    ];
    
    let precoRaw = '';
    let preco = 0;
    
    // Buscar preço nos campos
    for (const campoId of camposPreco) {
        const elemento = document.getElementById(campoId);
        console.log(`💰 Testando ${campoId}:`, elemento ? 'encontrado' : 'não encontrado');
        
        if (elemento && elemento.value && elemento.value.trim() !== '' && elemento.value !== 'R$ 0,00') {
            precoRaw = elemento.value;
            console.log(`💰 Preço encontrado em ${campoId}: "${precoRaw}"`);
            break;
        }
    }
    
    // Converter preço para float
    if (precoRaw) {
        // Remover "R$", espaços, e converter vírgula para ponto
        const precoLimpo = precoRaw.replace(/[R$\s]/g, '').replace(',', '.');
        preco = parseFloat(precoLimpo) || 0;
        console.log(`💰 Preço convertido: "${precoRaw}" → ${preco}`);
    }
    
    // Calcular taxa da plataforma (5%)
    const taxa_plataforma = preco * 0.05;
    const valor_receber = preco - taxa_plataforma;
    
    console.log(`💰 Valores calculados:
        - Preço: ${preco}
        - Taxa (5%): ${taxa_plataforma}
        - Valor a receber: ${valor_receber}`);
    
    return {
        preco: preco,
        taxa_plataforma: taxa_plataforma,
        valor_receber: valor_receber,
        precoRaw: precoRaw
    };
};

// 2. CORREÇÃO DA DUPLICAÇÃO - INTERCEPTAR CHAMADAS MÚLTIPLAS
let salvandoCombo = false;
let ultimoComboSalvo = null;

window.salvarComboCorrigido = function(dadosCombo) {
    console.log('💾 Iniciando salvamento corrigido do combo...');
    
    // Evitar duplicação
    if (salvandoCombo) {
        console.log('⚠️ Já está salvando um combo - ignorando chamada duplicada');
        return Promise.resolve({ sucesso: false, motivo: 'duplicacao' });
    }
    
    // Verificar se é o mesmo combo (evitar spam)
    const hashCombo = JSON.stringify(dadosCombo);
    if (ultimoComboSalvo === hashCombo) {
        console.log('⚠️ Mesmo combo já foi salvo - ignorando');
        return Promise.resolve({ sucesso: false, motivo: 'duplicacao' });
    }
    
    salvandoCombo = true;
    ultimoComboSalvo = hashCombo;
    
    console.log('📤 Enviando combo para salvamento:', dadosCombo);
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ evento_id não encontrado');
        salvandoCombo = false;
        return Promise.resolve({ sucesso: false, erro: 'Evento não encontrado' });
    }
    
    const formData = new URLSearchParams({
        action: 'salvar_ingresso',
        evento_id: eventoId,
        ingresso: JSON.stringify(dadosCombo)
    });
    
    return fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    })
    .then(response => {
        console.log('📡 Resposta recebida:', response.status);
        return response.text(); // Usar text() primeiro para debug
    })
    .then(text => {
        console.log('📄 Resposta como texto:', text);
        
        try {
            const data = JSON.parse(text);
            console.log('📦 Dados parseados:', data);
            
            if (data.sucesso) {
                console.log('✅ Combo salvo com sucesso!');
                
                // Recarregar lista de ingressos
                if (window.carregarIngressos) {
                    setTimeout(() => {
                        window.carregarIngressos();
                    }, 500);
                }
                
                return { sucesso: true, data: data };
            } else {
                console.error('❌ Erro no salvamento:', data.erro);
                return { sucesso: false, erro: data.erro };
            }
        } catch (e) {
            console.error('❌ Erro ao parsear JSON:', e);
            console.error('❌ Texto recebido:', text);
            
            // Se contém HTML, é provável que seja uma página de erro
            if (text.includes('<html>') || text.includes('<!DOCTYPE')) {
                return { sucesso: false, erro: 'Página de erro retornada pelo servidor' };
            }
            
            return { sucesso: false, erro: 'Resposta inválida do servidor' };
        }
    })
    .catch(error => {
        console.error('❌ Erro na requisição:', error);
        return { sucesso: false, erro: 'Erro de conexão' };
    })
    .finally(() => {
        salvandoCombo = false;
        // Limpar hash após 5 segundos para permitir retry
        setTimeout(() => {
            ultimoComboSalvo = null;
        }, 5000);
    });
};

// 3. CORREÇÃO DA COLETA DE DADOS COMPLETA
window.coletarDadosComboCorrigido = function() {
    console.log('📊 Coletando dados completos do combo...');
    
    // Detectar modal ativo
    const modalEdicao = document.getElementById('editComboTicketModal');
    const modalCriacao = document.getElementById('comboTicketModal');
    
    const isEdicao = modalEdicao && (modalEdicao.style.display === 'flex' || modalEdicao.classList.contains('show'));
    const prefixo = isEdicao ? 'editCombo' : 'comboTicket';
    
    console.log(`📝 Modo: ${isEdicao ? 'EDIÇÃO' : 'CRIAÇÃO'} (prefixo: ${prefixo})`);
    
    // Coletar campos básicos
    const titulo = document.getElementById(`${prefixo}Title`)?.value || 
                  document.getElementById('comboTicketTitle')?.value || 
                  document.getElementById('editComboTitle')?.value || '';
    
    const descricao = document.getElementById(`${prefixo}Description`)?.value || 
                     document.getElementById('comboTicketDescription')?.value || 
                     document.getElementById('editComboDescription')?.value || '';
    
    // Coletar valores monetários corrigidos
    const valores = coletarValoresMonetariosCombo(prefixo);
    
    // Coletar lote
    const loteId = parseInt(document.getElementById(`${prefixo}Lote`)?.value || 
                           document.getElementById('comboTicketLote')?.value || 
                           document.getElementById('editComboTicketLote')?.value || '0');
    
    // Coletar limites
    const limite_min = parseInt(document.getElementById(`${prefixo}MinQuantity`)?.value || '1');
    const limite_max = parseInt(document.getElementById(`${prefixo}MaxQuantity`)?.value || '5');
    
    // Coletar itens do combo
    const conteudo_combo = coletarItensComboCorrigido();
    
    // Validação
    const erros = [];
    if (!titulo.trim()) erros.push('Título obrigatório');
    if (valores.preco <= 0) erros.push('Preço deve ser maior que zero');
    if (!loteId) erros.push('Lote deve ser selecionado');
    if (!conteudo_combo.length) erros.push('Adicione pelo menos um item ao combo');
    
    if (erros.length > 0) {
        console.error('❌ Validação falhou:', erros);
        alert('Erros encontrados:\n• ' + erros.join('\n• '));
        return null;
    }
    
    const dados = {
        tipo: 'combo',
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        quantidade_total: 100,
        preco: valores.preco,
        taxa_plataforma: valores.taxa_plataforma,
        valor_receber: valores.valor_receber,
        limite_min: limite_min,
        limite_max: limite_max,
        lote_id: loteId,
        conteudo_combo: JSON.stringify(conteudo_combo)
    };
    
    // Se é edição, incluir o ID
    if (isEdicao) {
        const ingressoId = document.getElementById('editComboTicketId')?.value || 
                         document.getElementById('editComboId')?.value;
        if (ingressoId) {
            dados.id = parseInt(ingressoId);
        }
    }
    
    console.log('✅ Dados do combo coletados:', dados);
    return dados;
};

// 4. CORREÇÃO DA COLETA DE ITENS DO COMBO
window.coletarItensComboCorrigido = function() {
    console.log('📦 Coletando itens do combo...');
    
    const itens = [];
    
    // Buscar na lista de itens adicionados
    const listaItens = document.querySelector('#comboItemsList, #editComboItemsList, .combo-items-list');
    
    if (listaItens) {
        const itemElements = listaItens.querySelectorAll('.combo-item, .item-combo');
        
        itemElements.forEach((item, index) => {
            // Extrair dados do item
            const nomeElement = item.querySelector('.item-name, .combo-item-name, [data-nome]');
            const precoElement = item.querySelector('.item-price, .combo-item-price, [data-preco]');
            const quantidadeElement = item.querySelector('.item-quantity, .combo-item-quantity, [data-quantidade]');
            
            if (nomeElement && precoElement) {
                const nome = nomeElement.textContent?.trim() || nomeElement.dataset?.nome || '';
                const precoText = precoElement.textContent?.trim() || precoElement.dataset?.preco || '0';
                const quantidade = parseInt(quantidadeElement?.textContent?.trim() || quantidadeElement?.dataset?.quantidade || '1');
                
                // Converter preço
                const preco = parseFloat(precoText.replace(/[R$\s]/g, '').replace(',', '.')) || 0;
                
                if (nome && preco > 0) {
                    itens.push({
                        nome: nome,
                        preco: preco,
                        quantidade: quantidade
                    });
                    
                    console.log(`📦 Item ${index + 1}: ${nome} - R$ ${preco} (${quantidade}x)`);
                }
            }
        });
    }
    
    console.log(`📦 Total de itens coletados: ${itens.length}`);
    return itens;
};

// 5. CORREÇÃO PARA EDIÇÃO - CARREGAR CONTEUDO_COMBO
window.carregarItensComboParaEdicao = function(conteudo_combo_json) {
    console.log('📖 Carregando itens do combo para edição...');
    
    if (!conteudo_combo_json) {
        console.log('⚠️ Nenhum conteúdo de combo para carregar');
        return;
    }
    
    try {
        const itens = JSON.parse(conteudo_combo_json);
        console.log('📦 Itens do combo:', itens);
        
        // Limpar lista atual
        const lista = document.querySelector('#editComboItemsList, .combo-items-list');
        if (lista) {
            lista.innerHTML = '';
        }
        
        // Adicionar cada item à interface
        itens.forEach((item, index) => {
            if (window.adicionarItemComboNaLista) {
                window.adicionarItemComboNaLista(item.nome, item.preco, item.quantidade);
            } else {
                console.log(`📦 Item ${index + 1}: ${item.nome} - R$ ${item.preco}`);
            }
        });
        
        console.log('✅ Itens carregados na interface de edição');
        
    } catch (e) {
        console.error('❌ Erro ao parsear conteúdo do combo:', e);
        console.error('❌ JSON recebido:', conteudo_combo_json);
    }
};

// 6. OVERRIDE DAS FUNÇÕES PRINCIPAIS PARA USAR AS CORREÇÕES
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Aplicando correções para combos...');
    
    // Override da função de salvamento
    if (window.salvarComboImediatoNoBanco) {
        const originalSalvarCombo = window.salvarComboImediatoNoBanco;
        window.salvarComboImediatoNoBanco = function(dadosCombo) {
            console.log('🔄 Usando salvamento corrigido...');
            
            // Usar nossa função corrigida
            return salvarComboCorrigido(dadosCombo)
                .then(resultado => {
                    if (resultado.sucesso) {
                        console.log('✅ Combo salvo com correções aplicadas');
                    } else if (resultado.motivo !== 'duplicacao') {
                        console.error('❌ Erro no salvamento corrigido:', resultado.erro);
                        alert('Erro ao salvar combo: ' + resultado.erro);
                    }
                    return resultado;
                });
        };
    }
    
    // Override da função de coleta de dados
    if (window.coletarDadosModalComboCompleto) {
        window.coletarDadosModalComboCompleto = function() {
            console.log('🔄 Usando coleta de dados corrigida...');
            return coletarDadosComboCorrigido();
        };
    }
});

console.log('✅ Correções para combos carregadas!');