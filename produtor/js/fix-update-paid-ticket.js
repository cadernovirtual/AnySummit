/**
 * FIX: Erro "Erro ao identificar o ingresso"
 * 
 * PROBLEMA RESOLVIDO:
 * - Função updatePaidTicket estava buscando campo "editTicketId" que não existe
 * - Campo correto é "editPaidTicketId" 
 * - Múltiplas implementações conflitantes
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Fix para erro "Erro ao identificar o ingresso" carregado');
    
    // =======================================================
    // SOBRESCREVER updatePaidTicket COM IMPLEMENTAÇÃO CORRETA
    // =======================================================
    
    window.updatePaidTicket = function() {
        console.log('💾 [FIX] Salvando alterações do ingresso pago...');
        
        // BUSCAR O ID CORRETO DO INGRESSO
        const ticketId = document.getElementById('editPaidTicketId')?.value;
        if (!ticketId) {
            console.error('❌ Campo editPaidTicketId não encontrado ou vazio');
            alert('Erro ao identificar o ingresso. ID não encontrado.');
            return;
        }
        
        console.log(`✅ ID do ingresso identificado: ${ticketId}`);
        
        // COLETAR DADOS DO MODAL
        const dadosIngresso = {
            id: ticketId,
            titulo: document.getElementById('editPaidTicketTitle')?.value || '',
            descricao: document.getElementById('editPaidTicketDescription')?.value || '',
            quantidade_total: parseInt(document.getElementById('editPaidTicketQuantity')?.value) || 0,
            preco: document.getElementById('editPaidTicketPrice')?.value || '',
            lote_id: parseInt(document.getElementById('editPaidTicketLote')?.value) || null,
            inicio_venda: document.getElementById('editPaidSaleStart')?.value || '',
            fim_venda: document.getElementById('editPaidSaleEnd')?.value || '',
            limite_min: parseInt(document.getElementById('editPaidMinQuantity')?.value) || 1,
            limite_max: parseInt(document.getElementById('editPaidMaxQuantity')?.value) || 5
        };
        
        console.log('📊 Dados coletados:', dadosIngresso);
        
        // VALIDAÇÕES BÁSICAS
        if (!dadosIngresso.titulo || !dadosIngresso.quantidade_total || !dadosIngresso.preco) {
            alert('Preencha todos os campos obrigatórios: Título, Quantidade e Preço');
            return;
        }
        
        if (!dadosIngresso.lote_id) {
            alert('Selecione um lote para o ingresso');
            return;
        }
        
        // CONVERTER PREÇO PARA FORMATO CORRETO
        const precoLimpo = dadosIngresso.preco.toString()
            .replace(/[^\d,]/g, '')
            .replace(',', '.');
        
        const precoFloat = parseFloat(precoLimpo);
        if (isNaN(precoFloat) || precoFloat <= 0) {
            alert('Preço inválido. Digite um valor maior que zero.');
            return;
        }
        
        // CHAMAR API PARA SALVAR
        salvarIngressoEditado(dadosIngresso, precoFloat);
    };
    
    // =======================================================
    // FUNÇÃO PARA SALVAR NO BANCO VIA API
    // =======================================================
    
    async function salvarIngressoEditado(dados, preco) {
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            // CALCULAR TAXA E VALOR A RECEBER
            const taxaCalculada = preco * 0.05; // 5% de taxa
            const valorReceber = preco - taxaCalculada;
            
            // PREPARAR DADOS PARA ENVIO
            const dadosEnvio = {
                action: 'salvar_ingresso_individual',
                evento_id: eventoId,
                id: dados.id, // Incluir ID para UPDATE
                titulo: dados.titulo,
                descricao: dados.descricao,
                tipo: 'pago',
                quantidade_total: dados.quantidade_total,
                preco: preco.toFixed(2),
                taxa_plataforma: taxaCalculada.toFixed(2),
                valor_receber: valorReceber.toFixed(2),
                lote_id: dados.lote_id,
                inicio_venda: dados.inicio_venda,
                fim_venda: dados.fim_venda,
                limite_min: dados.limite_min,
                limite_max: dados.limite_max
            };
            
            console.log('📤 Enviando dados para API:', dadosEnvio);
            
            // FAZER REQUISIÇÃO
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(dadosEnvio).toString()
            });
            
            const resultado = await response.json();
            console.log('📥 Resposta da API:', resultado);
            
            if (resultado.sucesso) {
                alert('Ingresso salvo com sucesso!');
                
                // FECHAR MODAL
                if (window.closeModal) {
                    window.closeModal('editPaidTicketModal');
                }
                
                // ATUALIZAR INTERFACE (se necessário)
                atualizarInterfaceIngresso(dados.id, dados);
                
            } else {
                console.error('❌ Erro na API:', resultado.erro);
                alert('Erro ao salvar: ' + (resultado.erro || 'Erro desconhecido'));
            }
            
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
            alert('Erro de conexão. Tente novamente.');
        }
    }
    
    // =======================================================
    // FUNÇÃO PARA ATUALIZAR INTERFACE
    // =======================================================
    
    function atualizarInterfaceIngresso(ingressoId, dados) {
        // Tentar encontrar o elemento na interface
        const elementoIngresso = document.querySelector(`[data-ticket-id="${ingressoId}"]`) ||
                                document.querySelector(`[data-ticket-id="ticket_${ingressoId}"]`) ||
                                document.getElementById(`ticket_${ingressoId}`);
        
        if (elementoIngresso) {
            console.log('🔄 Atualizando elemento na interface');
            
            // Atualizar texto visível se existir
            const tituloElement = elementoIngresso.querySelector('.ticket-title, .item-title, h4');
            if (tituloElement) {
                tituloElement.textContent = dados.titulo;
            }
            
            const precoElement = elementoIngresso.querySelector('.ticket-price, .item-price, .price');
            if (precoElement) {
                precoElement.textContent = `R$ ${dados.preco}`;
            }
            
            const quantidadeElement = elementoIngresso.querySelector('.ticket-quantity, .item-quantity, .quantity');
            if (quantidadeElement) {
                quantidadeElement.textContent = `${dados.quantidade_total} unidades`;
            }
            
        } else {
            console.warn('⚠️ Elemento do ingresso não encontrado na interface');
        }
    }
    
    console.log('✅ Fix para updatePaidTicket aplicado');
});
