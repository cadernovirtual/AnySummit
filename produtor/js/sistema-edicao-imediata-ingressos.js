/**
 * SISTEMA DE EDIÇÃO/EXCLUSÃO IMEDIATA DE INGRESSOS
 * Salva alterações diretamente no banco sem aguardar "Avançar"
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Sistema de edição/exclusão imediata de ingressos carregado');
    
    // Função para excluir ingresso imediatamente
    window.excluirIngressoImediato = function(button) {
        console.log('🗑️ Iniciando exclusão imediata de ingresso...');
        
        const ticketItem = button.closest('.ticket-item');
        if (!ticketItem) {
            console.error('❌ Item do ingresso não encontrado');
            return;
        }
        
        const ticketData = ticketItem.ticketData;
        const ingressoId = ticketData?.id || ticketItem.dataset.ticketId;
        const titulo = ticketData?.titulo || ticketData?.title || 'ingresso';
        
        if (!ingressoId) {
            // Se não tem ID, é um ingresso novo que ainda não foi salvo
            console.log('📝 Ingresso novo (sem ID) - removendo apenas da interface');
            ticketItem.remove();
            atualizarContadorIngressos();
            return;
        }
        
        if (!confirm(`Tem certeza que deseja excluir o ingresso "${titulo}"?`)) {
            return;
        }
        
        // Verificar se ingresso está em algum combo antes de excluir
        verificarReferenciaEmCombos(ingressoId)
            .then(temReferencia => {
                if (temReferencia) {
                    alert('Este ingresso não pode ser excluído pois está sendo usado em um combo.');
                    return;
                }
                
                // Proceder com a exclusão
                executarExclusaoIngresso(ingressoId, ticketItem);
            })
            .catch(error => {
                console.error('❌ Erro ao verificar referencias:', error);
                alert('Erro ao verificar se ingresso pode ser excluído.');
            });
    };
    
    // Função para verificar se ingresso está referenciado em combos
    function verificarReferenciaEmCombos(ingressoId) {
        console.log(`🔍 Verificando se ingresso ${ingressoId} está em combos...`);
        
        return new Promise((resolve, reject) => {
            const eventoId = window.getEventoId?.() || new URLSearchParams(window.location.search).get('evento_id');
            
            if (!eventoId) {
                resolve(false);
                return;
            }
            
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=verificar_referencia_combo&evento_id=${eventoId}&ingresso_id=${ingressoId}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.sucesso) {
                    resolve(data.tem_referencia || false);
                } else {
                    console.error('Erro ao verificar referência:', data.erro);
                    resolve(false); // Em caso de erro, permitir exclusão
                }
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
                reject(error);
            });
        });
    }
    
    // Função para executar a exclusão no banco
    function executarExclusaoIngresso(ingressoId, ticketItem) {
        console.log(`🗑️ Excluindo ingresso ${ingressoId} do banco...`);
        
        const eventoId = window.getEventoId?.() || new URLSearchParams(window.location.search).get('evento_id');
        
        fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=excluir_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                console.log('✅ Ingresso excluído do banco com sucesso');
                
                // Remover da interface
                ticketItem.remove();
                atualizarContadorIngressos();
                
                // Mostrar feedback
                mostrarFeedback('Ingresso excluído com sucesso!', 'sucesso');
            } else {
                console.error('❌ Erro ao excluir ingresso:', data.erro);
                alert(`Erro ao excluir ingresso: ${data.erro}`);
            }
        })
        .catch(error => {
            console.error('❌ Erro na requisição de exclusão:', error);
            alert('Erro ao excluir ingresso. Tente novamente.');
        });
    }
    
    // Função para editar ingresso imediatamente
    window.editarIngressoImediato = function(button) {
        console.log('✏️ Iniciando edição imediata de ingresso...');
        
        const ticketItem = button.closest('.ticket-item');
        if (!ticketItem || !ticketItem.ticketData) {
            console.error('❌ Dados do ingresso não encontrados');
            return;
        }
        
        const ticketData = ticketItem.ticketData;
        console.log('📊 Dados do ingresso para edição:', ticketData);
        
        // Determinar tipo do ingresso e abrir modal apropriado
        const tipo = ticketData.tipo || ticketData.type;
        
        if (tipo === 'pago' || tipo === 'paid') {
            abrirModalEdicaoImediataPago(ticketData, ticketItem);
        } else if (tipo === 'gratuito' || tipo === 'free') {
            abrirModalEdicaoImediataGratuito(ticketData, ticketItem);
        } else if (tipo === 'combo') {
            abrirModalEdicaoImediataCombo(ticketData, ticketItem);
        }
    };
    
    // Modal de edição imediata - pago
    function abrirModalEdicaoImediataPago(ticketData, ticketItem) {
        console.log('💰 Abrindo modal de edição imediata para ingresso pago');
        
        // Preencher campos do modal
        document.getElementById('editPaidTicketId').value = ticketData.id || '';
        document.getElementById('editPaidTicketTitle').value = ticketData.titulo || ticketData.title || '';
        document.getElementById('editPaidTicketDescription').value = ticketData.descricao || ticketData.description || '';
        document.getElementById('editPaidTicketQuantity').value = ticketData.quantity || ticketData.quantidade_total || 100;
        document.getElementById('editPaidTicketPrice').value = ticketData.preco || ticketData.price || 0;
        document.getElementById('editPaidSaleStart').value = ticketData.inicio_venda || ticketData.startDate || '';
        document.getElementById('editPaidSaleEnd').value = ticketData.fim_venda || ticketData.endDate || '';
        document.getElementById('editPaidMinLimit').value = ticketData.limite_min || ticketData.minQuantity || 1;
        document.getElementById('editPaidMaxLimit').value = ticketData.limite_max || ticketData.maxQuantity || 5;
        
        // Selecionar lote correto
        const loteSelect = document.getElementById('editPaidTicketLote');
        if (loteSelect && ticketData.loteId) {
            loteSelect.value = ticketData.loteId;
        }
        
        // Armazenar referência do elemento para salvar depois
        window.ticketItemParaEdicao = ticketItem;
        
        // Substituir função de save temporariamente
        window.updatePaidTicketImediato = function() {
            salvarEdicaoImediataPago();
        };
        
        // Abrir modal
        openModal('editPaidTicketModal');
    }
    
    // Função para salvar edição imediata - pago
    function salvarEdicaoImediataPago() {
        console.log('💾 Salvando edição imediata de ingresso pago...');
        
        const ticketData = {
            id: document.getElementById('editPaidTicketId').value,
            titulo: document.getElementById('editPaidTicketTitle').value,
            descricao: document.getElementById('editPaidTicketDescription').value,
            quantidade_total: parseInt(document.getElementById('editPaidTicketQuantity').value),
            preco: parseFloat(document.getElementById('editPaidTicketPrice').value),
            inicio_venda: document.getElementById('editPaidSaleStart').value,
            fim_venda: document.getElementById('editPaidSaleEnd').value,
            limite_min: parseInt(document.getElementById('editPaidMinLimit').value) || 1,
            limite_max: parseInt(document.getElementById('editPaidMaxLimit').value) || 5,
            lote_id: parseInt(document.getElementById('editPaidTicketLote').value) || null,
            tipo: 'pago',
            conteudo_combo: ''
        };
        
        // Validações
        if (!ticketData.titulo || !ticketData.quantidade_total || !ticketData.preco) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }
        
        // Calcular taxa e valor a receber (se houver lógica específica)
        ticketData.taxa_plataforma = ticketData.preco * 0.08; // 8% exemplo
        ticketData.valor_receber = ticketData.preco - ticketData.taxa_plataforma;
        
        // Salvar no banco imediatamente
        salvarIngressoNoBanco(ticketData, window.ticketItemParaEdicao);
    }
    
    // Função genérica para salvar ingresso no banco
    function salvarIngressoNoBanco(ingressoData, ticketItem) {
        console.log('💾 Salvando ingresso no banco:', ingressoData);
        
        const eventoId = window.getEventoId?.() || new URLSearchParams(window.location.search).get('evento_id');
        
        const formData = new URLSearchParams();
        formData.append('action', 'salvar_ingresso_individual');
        formData.append('evento_id', eventoId);
        formData.append('ingresso', JSON.stringify(ingressoData));
        
        fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                console.log('✅ Ingresso salvo no banco com sucesso');
                
                // Atualizar ticketData do elemento
                if (ticketItem) {
                    ticketItem.ticketData = {
                        ...ticketItem.ticketData,
                        ...ingressoData
                    };
                    
                    // Atualizar interface visual
                    atualizarElementoIngressoNaInterface(ticketItem, ingressoData);
                }
                
                // Fechar modal
                closeModal('editPaidTicketModal');
                
                // Mostrar feedback
                mostrarFeedback('Ingresso salvo com sucesso!', 'sucesso');
            } else {
                console.error('❌ Erro ao salvar ingresso:', data.erro);
                alert(`Erro ao salvar ingresso: ${data.erro}`);
            }
        })
        .catch(error => {
            console.error('❌ Erro na requisição:', error);
            alert('Erro ao salvar ingresso. Tente novamente.');
        });
    }
    
    // Função para atualizar elemento na interface após salvar
    function atualizarElementoIngressoNaInterface(ticketItem, ingressoData) {
        // Atualizar título
        const titleElement = ticketItem.querySelector('.ticket-title, .ticket-name');
        if (titleElement) {
            const badgeText = ingressoData.preco > 0 ? 'Pago' : 'Gratuito';
            const badgeClass = ingressoData.preco > 0 ? 'pago' : 'gratuito';
            titleElement.innerHTML = `
                ${ingressoData.titulo}
                <span class="ticket-type-badge ${badgeClass}">${badgeText}</span>
            `;
        }
        
        // Atualizar detalhes
        const detailsElement = ticketItem.querySelector('.ticket-details');
        if (detailsElement) {
            let detailsHTML = `
                <div class="ticket-info">
                    <span>Quantidade: <strong>${ingressoData.quantidade_total}</strong></span>
            `;
            
            if (ingressoData.preco > 0) {
                detailsHTML += `<span>Preço: <strong>R$ ${ingressoData.preco.toFixed(2).replace('.', ',')}</strong></span>`;
            }
            
            detailsHTML += `
                    <span>Vendas: ${formatarDataParaExibicao(ingressoData.inicio_venda)} - ${formatarDataParaExibicao(ingressoData.fim_venda)}</span>
                </div>
            `;
            
            if (ingressoData.descricao) {
                detailsHTML += `
                    <div class="ticket-description">
                        ${ingressoData.descricao}
                    </div>
                `;
            }
            
            detailsElement.innerHTML = detailsHTML;
        }
    }
    
    // Função para mostrar feedback visual
    function mostrarFeedback(mensagem, tipo) {
        const feedback = document.createElement('div');
        feedback.className = `feedback-message ${tipo}`;
        feedback.textContent = mensagem;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 9999;
            ${tipo === 'sucesso' ? 'background-color: #28a745;' : 'background-color: #dc3545;'}
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }
    
    // Função para atualizar contador de ingressos
    function atualizarContadorIngressos() {
        const ticketItems = document.querySelectorAll('.ticket-item');
        const contador = document.getElementById('totalIngressos');
        
        if (contador) {
            contador.textContent = ticketItems.length;
        }
        
        console.log(`📊 Contador atualizado: ${ticketItems.length} ingressos`);
    }
    
    // Função para formatar data
    function formatarDataParaExibicao(dataString) {
        if (!dataString) return '';
        try {
            const data = new Date(dataString);
            return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
        } catch (e) {
            return dataString;
        }
    }
    
    // Substituir funções globais existentes
    window.excluirIngresso = window.excluirIngressoImediato;
    window.editarIngresso = window.editarIngressoImediato;
    
    console.log('✅ Sistema de edição/exclusão imediata de ingressos carregado');
    console.log('  - excluirIngresso() substituída por excluirIngressoImediato()');
    console.log('  - editarIngresso() substituída por editarIngressoImediato()');
});
