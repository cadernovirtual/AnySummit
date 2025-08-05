/**
 * CORREÇÃO ESPECÍFICA PARA EDIÇÃO DE COMBOS
 * Corrige problemas na função updateComboTicket e salvamento durante edição
 */

console.log('🔧 Carregando correções para edição de combos...');

// Interceptar e corrigir a função updateComboTicket
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que as funções originais estejam carregadas
    setTimeout(function() {
        
        // 1. CORREÇÃO DA FUNÇÃO updateComboTicket
        if (window.updateComboTicket) {
            const originalUpdateComboTicket = window.updateComboTicket;
            
            window.updateComboTicket = function() {
                console.log('🔄 Executando updateComboTicket corrigido...');
                
                try {
                    // Coletar dados com tratamento de erros
                    const id = document.getElementById('editComboId')?.value;
                    const titulo = document.getElementById('editComboTitle')?.value || '';
                    const quantidade = parseInt(document.getElementById('editComboQuantity')?.value || '100');
                    
                    // Coletar preço com tratamento especial
                    const precoRaw = document.getElementById('editComboPrice')?.value || '0';
                    let preco = 0;
                    
                    if (precoRaw) {
                        // Remover formatação e converter
                        const precoLimpo = precoRaw.replace(/[R$\s.]/g, '').replace(',', '.');
                        preco = parseFloat(precoLimpo) || 0;
                    }
                    
                    console.log(`💰 Preço coletado: "${precoRaw}" → ${preco}`);
                    
                    const inicio_venda = document.getElementById('editComboSaleStart')?.value || null;
                    const fim_venda = document.getElementById('editComboSaleEnd')?.value || null;
                    const descricao = document.getElementById('editComboDescription')?.value || '';
                    
                    // Calcular valores monetários
                    const taxa_plataforma = preco * 0.05;
                    const valor_receber = preco - taxa_plataforma;
                    
                    console.log(`💰 Valores calculados:
                        - Preço: ${preco}
                        - Taxa: ${taxa_plataforma}  
                        - Valor a receber: ${valor_receber}`);
                    
                    // Validações
                    if (!titulo.trim()) {
                        alert('Por favor, preencha o título do combo');
                        return;
                    }
                    
                    if (preco <= 0) {
                        alert('Por favor, informe um preço válido para o combo');
                        return;
                    }
                    
                    if (!window.editComboItems || window.editComboItems.length === 0) {
                        alert('Adicione pelo menos um tipo de ingresso ao combo');
                        return;
                    }
                    
                    // Montar dados para salvamento
                    const comboData = {
                        id: parseInt(id),
                        tipo: 'combo',
                        titulo: titulo.trim(),
                        descricao: descricao.trim(),
                        quantidade_total: quantidade,
                        preco: preco,
                        taxa_plataforma: taxa_plataforma,
                        valor_receber: valor_receber,
                        inicio_venda: inicio_venda,
                        fim_venda: fim_venda,
                        limite_min: 1,
                        limite_max: 5,
                        lote_id: null, // Será preenchido se necessário
                        conteudo_combo: JSON.stringify(window.editComboItems)
                    };
                    
                    console.log('📦 Dados preparados para atualização:', comboData);
                    
                    // Salvar no banco via API
                    salvarComboEditadoNoBanco(comboData);
                    
                } catch (error) {
                    console.error('❌ Erro na função updateComboTicket:', error);
                    alert('Erro interno ao atualizar combo. Verifique o console.');
                }
            };
            
            console.log('✅ Função updateComboTicket interceptada e corrigida');
        }
        
        // 2. CORREÇÃO DA FUNÇÃO DE CARREGAR COMBO PARA EDIÇÃO
        if (window.editCombo) {
            const originalEditCombo = window.editCombo;
            
            window.editCombo = function(comboId) {
                console.log(`🔄 Carregando combo ${comboId} para edição...`);
                
                // Chamar função original primeiro
                const result = originalEditCombo.call(this, comboId);
                
                // Aplicar correções adicionais
                setTimeout(function() {
                    try {
                        // Verificar se os itens foram carregados corretamente
                        if (window.editComboItems && window.editComboItems.length > 0) {
                            console.log('✅ Itens do combo carregados:', window.editComboItems);
                            
                            // Forçar re-renderização dos itens
                            if (window.renderEditComboItems) {
                                window.renderEditComboItems();
                            }
                        } else {
                            console.log('⚠️ Nenhum item carregado - tentando recarregar...');
                            
                            // Tentar recarregar os dados do combo
                            recarregarDadosComboParaEdicao(comboId);
                        }
                    } catch (e) {
                        console.error('❌ Erro ao aplicar correções na edição:', e);
                    }
                }, 500);
                
                return result;
            };
            
            console.log('✅ Função editCombo interceptada e corrigida');
        }
        
    }, 1000);
});

// Função para salvar combo editado no banco
function salvarComboEditadoNoBanco(comboData) {
    console.log('💾 Salvando combo editado no banco...');
    
    const eventoId = new URLSearchParams(window.location.search).get('evento_id');
    
    if (!eventoId) {
        console.error('❌ evento_id não encontrado');
        alert('Erro: ID do evento não encontrado');
        return;
    }
    
    // Mostrar loading
    const modal = document.getElementById('editComboTicketModal');
    if (modal) {
        const overlay = document.createElement('div');
        overlay.id = 'editComboLoading';
        overlay.style.cssText = `
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(255,255,255,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            font-size: 1.1rem;
            color: #333;
        `;
        overlay.innerHTML = '⏳ Salvando combo...';
        modal.style.position = 'relative';
        modal.appendChild(overlay);
    }
    
    const formData = new URLSearchParams({
        action: 'salvar_ingresso',
        evento_id: eventoId,
        ingresso: JSON.stringify(comboData)
    });
    
    fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    })
    .then(response => {
        console.log('📡 Resposta recebida:', response.status);
        return response.text();
    })
    .then(text => {
        console.log('📄 Resposta do servidor:', text);
        
        // Remover loading
        const loading = document.getElementById('editComboLoading');
        if (loading) {
            loading.remove();
        }
        
        try {
            const data = JSON.parse(text);
            
            if (data.sucesso) {
                console.log('✅ Combo atualizado com sucesso!');
                
                // Fechar modal
                const modal = document.getElementById('editComboTicketModal');
                if (modal) {
                    modal.style.display = 'none';
                }
                
                // Recarregar lista de ingressos
                if (window.carregarIngressos) {
                    setTimeout(() => {
                        window.carregarIngressos();
                    }, 500);
                }
                
                // Mostrar sucesso
                alert('Combo atualizado com sucesso!');
                
            } else {
                console.error('❌ Erro ao salvar:', data.erro);
                alert('Erro ao salvar combo: ' + data.erro);
            }
        } catch (e) {
            console.error('❌ Erro ao parsear resposta:', e);
            console.error('❌ Texto recebido:', text);
            
            if (text.includes('sucesso')) {
                console.log('✅ Provável sucesso (JSON malformado)');
                alert('Combo salvo! Recarregando página...');
                location.reload();
            } else {
                alert('Erro de comunicação com o servidor');
            }
        }
    })
    .catch(error => {
        console.error('❌ Erro na requisição:', error);
        
        // Remover loading
        const loading = document.getElementById('editComboLoading');
        if (loading) {
            loading.remove();
        }
        
        alert('Erro de conexão ao salvar combo');
    });
}

// Função para recarregar dados do combo para edição
function recarregarDadosComboParaEdicao(comboId) {
    console.log(`🔄 Recarregando dados do combo ${comboId}...`);
    
    // Aqui você pode implementar lógica adicional para recarregar
    // os dados do combo se necessário
    
    console.log('ℹ️ Recarregamento de dados não implementado ainda');
}

console.log('✅ Correções para edição de combos carregadas!');