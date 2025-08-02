/**
 * CORREÇÃO COMPLETA: COLETA E RESTAURAÇÃO DE INGRESSOS
 * Solução definitiva para coleta de dados e restauração de ingressos
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Sistema de coleta e restauração de ingressos carregado');
    
    // FUNÇÃO PARA RESTAURAR INGRESSOS (usando a mesma rotina das atualizações!)
    window.restaurarIngressos = function(ingressos) {
        console.log('🎟️ Restaurando ingressos do banco (usando rotina de atualizações):', ingressos);
        
        if (!ingressos || !Array.isArray(ingressos) || ingressos.length === 0) {
            console.log('⚠️ Nenhum ingresso para restaurar');
            return;
        }
        
        // Limpar ingressos existentes na interface
        const ticketList = document.getElementById('ticketList');
        if (ticketList) {
            ticketList.innerHTML = '';
        }
        
        // Restaurar cada ingresso usando a MESMA FUNÇÃO que as operações usam
        ingressos.forEach((ingresso, index) => {
            console.log(`📋 Restaurando ingresso ${index + 1}:`, ingresso);
            
            // Converter dados do banco para os parâmetros que addTicketToList() espera
            const type = mapearTipoParaIngles(ingresso.tipo);
            const title = ingresso.titulo;
            const quantity = parseInt(ingresso.quantidade_total) || 100;
            const price = type === 'paid' ? `R$ ${parseFloat(ingresso.preco).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'Gratuito';
            const loteId = ingresso.lote_id || '';
            const description = ingresso.descricao || '';
            const saleStart = ingresso.inicio_venda || '';
            const saleEnd = ingresso.fim_venda || '';
            const minQuantity = parseInt(ingresso.limite_min) || 1;
            const maxQuantity = parseInt(ingresso.limite_max) || 5;
            
            // USAR A MESMA FUNÇÃO que as operações usam!
            if (typeof addTicketToList === 'function') {
                addTicketToList(type, title, quantity, price, loteId, description, saleStart, saleEnd, minQuantity, maxQuantity);
                
                // Após adicionar, corrigir o ID para usar o ID real do banco
                const elementos = document.querySelectorAll('.ticket-item');
                const ultimoElemento = elementos[elementos.length - 1];
                if (ultimoElemento) {
                    // Corrigir dataset para usar ID real
                    ultimoElemento.dataset.ticketId = ingresso.id;
                    
                    // Corrigir botões para usar ID real
                    const editBtn = ultimoElemento.querySelector('button[onclick*="editTicket"]');
                    const removeBtn = ultimoElemento.querySelector('button[onclick*="removeTicket"]');
                    if (editBtn) {
                        editBtn.setAttribute('onclick', `editTicket(${ingresso.id})`);
                    }
                    if (removeBtn) {
                        removeBtn.setAttribute('onclick', `removeTicket(${ingresso.id})`);
                    }
                    
                    // Armazenar dados completos do banco no elemento
                    ultimoElemento.ticketData = {
                        id: ingresso.id,
                        type: type,
                        title: title,
                        quantity: quantity,
                        price: parseFloat(ingresso.preco) || 0,
                        description: description,
                        saleStart: saleStart,
                        saleEnd: saleEnd,
                        minQuantity: minQuantity,
                        maxQuantity: maxQuantity,
                        loteId: loteId,
                        loteNome: ingresso.lote_nome || '',
                        taxaPlataforma: parseFloat(ingresso.taxa_plataforma) || 0,
                        valorReceber: parseFloat(ingresso.valor_receber) || 0,
                        isFromDatabase: true
                    };
                    
                    // Adicionar informação do lote se não foi mostrada automaticamente
                    if (ingresso.lote_nome && !ultimoElemento.querySelector('.ticket-lote-info')) {
                        const ticketTitle = ultimoElemento.querySelector('.ticket-title');
                        if (ticketTitle) {
                            const loteSpan = document.createElement('span');
                            loteSpan.className = 'ticket-lote-info';
                            loteSpan.style.cssText = 'font-size: 11px; color: #666; margin-left: 10px;';
                            loteSpan.textContent = ingresso.lote_nome;
                            ticketTitle.appendChild(loteSpan);
                        }
                    }
                }
            } else {
                console.error('❌ Função addTicketToList não encontrada');
            }
        });
        
        console.log('✅ Ingressos restaurados usando rotina de atualizações');
    };
    
    // Mapear tipo português para inglês (para compatibilidade)
    function mapearTipoParaIngles(tipo) {
        const mapa = {
            'pago': 'paid',
            'gratuito': 'free',
            'combo': 'combo'
        };
        return mapa[tipo] || 'paid';
    }
    
    // FUNÇÃO MELHORADA PARA COLETAR DADOS DOS INGRESSOS
    window.coletarDadosIngressosCorrigida = function() {
        console.log('📋 Coletando dados dos ingressos (versão corrigida)...');
        
        const ingressos = [];
        const ticketItems = document.querySelectorAll('.ticket-item');
        
        console.log(`🎫 Encontrados ${ticketItems.length} elementos .ticket-item`);
        
        if (ticketItems.length === 0) {
            console.log('⚠️ Nenhum elemento .ticket-item encontrado');
            return ingressos;
        }
        
        ticketItems.forEach((item, index) => {
            console.log(`\n=== PROCESSANDO INGRESSO ${index + 1} ===`);
            
            const ticketData = item.ticketData;
            
            if (!ticketData) {
                console.log('❌ ticketData não encontrado no elemento');
                return;
            }
            
            console.log('📊 ticketData encontrado:', ticketData);
            
            // Mapear para formato de envio
            const ingresso = {
                tipo: ticketData.tipo || mapearTipoParaPortugues(ticketData.type),
                titulo: ticketData.titulo || ticketData.title || '',
                descricao: ticketData.descricao || ticketData.description || '',
                quantidade: parseInt(ticketData.quantity) || 100,
                preco: parseFloat(ticketData.preco || ticketData.price) || 0,
                taxa_plataforma: parseFloat(ticketData.taxaPlataforma) || 0,
                valor_receber: parseFloat(ticketData.valorReceber) || parseFloat(ticketData.preco || ticketData.price) || 0,
                inicio_venda: ticketData.inicio_venda || ticketData.startDate || null,
                fim_venda: ticketData.fim_venda || ticketData.endDate || null,
                limite_min: parseInt(ticketData.limite_min || ticketData.minQuantity) || 1,
                limite_max: parseInt(ticketData.limite_max || ticketData.maxQuantity) || 5,
                lote_id: ticketData.loteId || ticketData.lote_id || null  // LOTE_ID AQUI!
            };
            
            if (ticketData.tipo === 'combo' && ticketData.comboData) {
                ingresso.conteudo_combo = ticketData.comboData;
            }
            
            console.log('✅ Ingresso mapeado:', ingresso);
            ingressos.push(ingresso);
        });
        
        console.log(`📦 Total de ingressos coletados: ${ingressos.length}`);
        return ingressos;
    };
    
    // Mapear tipo inglês para português
    function mapearTipoParaPortugues(tipo) {
        const mapa = {
            'paid': 'pago',
            'free': 'gratuito',
            'combo': 'combo'
        };
        return mapa[tipo] || 'pago';
    }
    
    // Interceptar a função original de coleta para usar a corrigida
    const originalColetarDadosIngressos = window.coletarDadosIngressos;
    window.coletarDadosIngressos = function() {
        console.log('🔄 Interceptando coleta de dados - usando versão corrigida');
        return window.coletarDadosIngressosCorrigida();
    };
    
    console.log('✅ Sistema corrigido de ingressos carregado:');
    console.log('  - window.restaurarIngressos() - Restaura ingressos do banco');
    console.log('  - window.coletarDadosIngressosCorrigida() - Coleta dados corretamente');
});
