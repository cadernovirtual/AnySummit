/**
 * PADRONIZAÇÃO DEFINITIVA: Botões e Edição
 * Força formatação padrão e busca no banco SEMPRE
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Padronização definitiva de botões carregada');
    
    // ===========================================
    // 1. SUBSTITUIR TODAS AS FUNÇÕES DE EDIÇÃO
    // ===========================================
    
    // Função única para editar qualquer ingresso - SEMPRE busca no banco
    window.editTicket = function(ticketId) {
        console.log(`📝 [PADRONIZADO] Editando ingresso: ${ticketId}`);
        buscarDadosIngressoDoBanco(ticketId);
    };
    
    // Sobrescrever outras funções que podem interferir
    window.editItem = window.editTicket;
    window.editarIngresso = function(button) {
        const ticketId = extrairIdDoElemento(button);
        if (ticketId) {
            window.editTicket(ticketId);
        } else {
            console.error('❌ ID do ingresso não encontrado');
            alert('Erro: ID do ingresso não encontrado');
        }
    };
    window.editarIngressoImediato = window.editTicket;
    
    // Função única para remover ingresso
    window.removeTicket = function(ticketId) {
        console.log(`🗑️ [PADRONIZADO] Tentativa de remoção: ${ticketId}`);
        
        // CONFIRMAÇÃO ANTES DE EXCLUIR
        const confirmacao = confirm('Tem certeza que deseja excluir este ingresso?');
        console.log(`🗑️ Confirmação do usuário: ${confirmacao}`);
        
        if (confirmacao) {
            console.log(`🗑️ Procedendo com exclusão de: ${ticketId}`);
            excluirIngressoDoBanco(ticketId);
        } else {
            console.log(`🗑️ Exclusão cancelada pelo usuário`);
        }
    };
    
    // ===========================================
    // 2. BUSCAR DADOS DO BANCO SEMPRE
    // ===========================================
    
    async function buscarDadosIngressoDoBanco(ingressoId) {
        try {
            // Limpar apenas o ID se for temporário
            const idLimpo = ingressoId.toString().replace('ticket_', '');
            
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            console.log(`🔍 Buscando ingresso ${idLimpo} no banco...`);
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=obter_dados_ingresso&evento_id=${eventoId}&ingresso_id=${idLimpo}`
            });
            
            const data = await response.json();
            
            if (data.sucesso && data.ingresso) {
                console.log('✅ Dados obtidos do banco:', data.ingresso);
                abrirModalComDadosDoBanco(data.ingresso);
            } else {
                console.error('❌ Erro ao buscar:', data.erro);
                alert('Erro ao carregar dados: ' + (data.erro || 'Ingresso não encontrado'));
            }
            
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
            alert('Erro de conexão ao buscar dados do ingresso.');
        }
    }
    
    function abrirModalComDadosDoBanco(ingresso) {
        console.log(`🎭 Abrindo modal para tipo: ${ingresso.tipo}`);
        
        if (ingresso.tipo === 'pago') {
            preencherModalPago(ingresso);
            abrirModal('editPaidTicketModal');
        } else if (ingresso.tipo === 'gratuito') {
            preencherModalGratuito(ingresso);
            abrirModal('editFreeTicketModal');
        } else if (ingresso.tipo === 'combo') {
            preencherModalCombo(ingresso);
            abrirModal('editComboTicketModal');
        }
    }
    
    function preencherModalPago(ingresso) {
        const campos = {
            'editPaidTicketId': ingresso.id,
            'editPaidTicketTitle': ingresso.titulo,
            'editPaidTicketDescription': ingresso.descricao || '',
            'editPaidTicketQuantity': ingresso.quantidade_total,
            'editPaidTicketPrice': formatarMoeda(ingresso.preco),
            'editPaidTicketLote': ingresso.lote_id || '',
            'editPaidSaleStart': ingresso.inicio_venda || '',
            'editPaidSaleEnd': ingresso.fim_venda || '',
            'editPaidMinQuantity': ingresso.limite_min || 1,
            'editPaidMaxQuantity': ingresso.limite_max || 5
        };
        
        preencherCampos(campos);
        
        // Preencher campos calculados
        const campoTaxa = document.getElementById('editPaidTicketTaxaValor');
        const campoReceber = document.getElementById('editPaidTicketValorReceber');
        const checkboxTaxa = document.getElementById('editPaidTicketTaxaServico');
        
        if (campoTaxa) campoTaxa.value = formatarMoeda(ingresso.taxa_plataforma);
        if (campoReceber) campoReceber.value = formatarMoeda(ingresso.valor_receber);
        if (checkboxTaxa) checkboxTaxa.checked = parseFloat(ingresso.taxa_plataforma || 0) > 0;
    }
    
    function preencherModalGratuito(ingresso) {
        const campos = {
            'editFreeTicketId': ingresso.id,
            'editFreeTicketTitle': ingresso.titulo,
            'editFreeTicketDescription': ingresso.descricao || '',
            'editFreeTicketQuantity': ingresso.quantidade_total,
            'editFreeTicketLote': ingresso.lote_id || '',
            'editFreeSaleStart': ingresso.inicio_venda || '',
            'editFreeSaleEnd': ingresso.fim_venda || '',
            'editFreeMinQuantity': ingresso.limite_min || 1,
            'editFreeMaxQuantity': ingresso.limite_max || 5
        };
        
        preencherCampos(campos);
    }
    
    function preencherModalCombo(ingresso) {
        const campos = {
            'editComboTicketId': ingresso.id,
            'editComboTitle': ingresso.titulo,
            'editComboDescription': ingresso.descricao || '',
            'editComboPrice': formatarMoeda(ingresso.preco),
            'editComboTicketLote': ingresso.lote_id || '',
            'editComboSaleStart': ingresso.inicio_venda || '',
            'editComboSaleEnd': ingresso.fim_venda || '',
            'editComboMinQuantity': ingresso.limite_min || 1,
            'editComboMaxQuantity': ingresso.limite_max || 5
        };
        
        preencherCampos(campos);
    }
    
    // ===========================================
    // 3. PADRONIZAR TODOS OS BOTÕES EXISTENTES
    // ===========================================
    
    function padronizarBotoesExistentes() {
        const ticketItems = document.querySelectorAll('.ticket-item');
        
        ticketItems.forEach(item => {
            const actionsDiv = item.querySelector('.ticket-actions');
            if (actionsDiv) {
                // VERIFICAR SE JÁ FOI PADRONIZADO
                if (actionsDiv.dataset.padronizado === 'true') {
                    return; // Já foi padronizado, pular
                }
                
                const ticketId = extrairIdDoElemento(item);
                
                if (ticketId) {
                    // Substituir HTML dos botões com formatação padrão
                    actionsDiv.innerHTML = `
                        <button class="btn-icon" onclick="editTicket('${ticketId}')" title="Editar">
                            ✏️
                        </button>
                        <button class="btn-icon delete" onclick="removeTicket('${ticketId}')" title="Excluir">
                            🗑️
                        </button>
                    `;
                    
                    // MARCAR COMO PADRONIZADO
                    actionsDiv.dataset.padronizado = 'true';
                    
                    console.log(`🔄 Botão padronizado para ingresso: ${ticketId}`);
                }
            }
        });
    }
    
    // ===========================================
    // 4. INTERCEPTAR CRIAÇÃO DE NOVOS BOTÕES
    // ===========================================
    
    // Interceptar appendChild para corrigir botões em tempo real
    const originalAppendChild = Element.prototype.appendChild;
    Element.prototype.appendChild = function(newChild) {
        const result = originalAppendChild.call(this, newChild);
        
        // Se adicionou um ticket-item, padronizar seus botões
        if (newChild.classList && newChild.classList.contains('ticket-item')) {
            setTimeout(() => {
                padronizarBotoesExistentes();
            }, 100);
        }
        
        return result;
    };
    
    // ===========================================
    // 5. FUNÇÕES AUXILIARES
    // ===========================================
    
    function extrairIdDoElemento(element) {
        if (typeof element === 'string') return element;
        
        const item = element.closest('.ticket-item');
        if (!item) return null;
        
        return item.dataset.ticketId || 
               item.dataset.ingressoId || 
               item.getAttribute('data-ticket-id') ||
               item.getAttribute('data-ingresso-id');
    }
    
    function preencherCampos(campos) {
        Object.keys(campos).forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = campos[id];
            } else {
                console.warn(`⚠️ Campo não encontrado: ${id}`);
            }
        });
    }
    
    function formatarMoeda(valor) {
        const num = parseFloat(valor || 0);
        return `R$ ${num.toFixed(2).replace('.', ',')}`;
    }
    
    function abrirModal(modalId) {
        if (window.openModal) {
            window.openModal(modalId);
        } else {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('show');
            }
        }
    }
    
    async function excluirIngressoDoBanco(ingressoId) {
        try {
            const idLimpo = ingressoId.toString().replace('ticket_', '');
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=excluir_ingresso&evento_id=${eventoId}&ingresso_id=${idLimpo}`
            });
            
            const data = await response.json();
            
            if (data.sucesso) {
                // Remover elemento da interface
                const elemento = document.querySelector(`[data-ticket-id="${ingressoId}"]`);
                if (elemento) elemento.remove();
                
                console.log('✅ Ingresso excluído com sucesso');
            } else {
                alert('Erro ao excluir ingresso: ' + data.erro);
            }
            
        } catch (error) {
            console.error('❌ Erro ao excluir:', error);
            alert('Erro de conexão ao excluir ingresso');
        }
    }
    
    // ===========================================
    // 6. INICIALIZAÇÃO
    // ===========================================
    
    // Padronizar botões existentes após carregamento
    setTimeout(() => {
        padronizarBotoesExistentes();
    }, 1000);
    
    // REMOVIDO: setInterval que causava loop infinito
    // setInterval(() => {
    //     padronizarBotoesExistentes();
    // }, 5000);
    
    console.log('✅ Padronização definitiva configurada - SEM LOOP');
});
