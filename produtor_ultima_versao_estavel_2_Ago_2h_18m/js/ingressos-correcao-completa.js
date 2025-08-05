/**
 * CORREÇÃO COMPLETA: COLETA E RESTAURAÇÃO DE INGRESSOS
 * Solução definitiva para coleta de dados e restauração de ingressos
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Sistema de coleta e restauração de ingressos carregado');
    
    // FUNÇÃO PARA RESTAURAR INGRESSOS (estava faltando!)
    window.restaurarIngressos = function(ingressos) {
        console.log('🎟️ Restaurando ingressos do banco:', ingressos);
        
        if (!ingressos || !Array.isArray(ingressos) || ingressos.length === 0) {
            console.log('⚠️ Nenhum ingresso para restaurar');
            return;
        }
        
        // Limpar ingressos existentes na interface
        const ticketList = document.getElementById('ticketList');
        if (ticketList) {
            ticketList.innerHTML = '';
        }
        
        // Restaurar cada ingresso
        ingressos.forEach((ingresso, index) => {
            console.log(`📋 Restaurando ingresso ${index + 1}:`, ingresso);
            
            // Mapear dados do banco para o formato da interface
            const ticketData = {
                type: mapearTipoParaIngles(ingresso.tipo),
                tipo: ingresso.tipo,
                title: ingresso.titulo,
                titulo: ingresso.titulo,
                description: ingresso.descricao || '',
                descricao: ingresso.descricao || '',
                quantity: parseInt(ingresso.quantidade_total) || 100,
                price: parseFloat(ingresso.preco) || 0,
                preco: parseFloat(ingresso.preco) || 0,
                taxaPlataforma: parseFloat(ingresso.taxa_plataforma) || 0,
                valorReceber: parseFloat(ingresso.valor_receber) || 0,
                startDate: ingresso.inicio_venda,
                inicio_venda: ingresso.inicio_venda,
                endDate: ingresso.fim_venda,
                fim_venda: ingresso.fim_venda,
                minQuantity: parseInt(ingresso.limite_min) || 1,
                maxQuantity: parseInt(ingresso.limite_max) || 5,
                limite_min: parseInt(ingresso.limite_min) || 1,
                limite_max: parseInt(ingresso.limite_max) || 5,
                loteId: ingresso.lote_id,
                loteName: ingresso.lote_nome || '',
                lote_nome: ingresso.lote_nome || '',
                id: ingresso.id
            };
            
            // Se é combo, decodificar conteúdo
            if (ingresso.tipo === 'combo' && ingresso.conteudo_combo) {
                try {
                    ticketData.comboData = JSON.parse(ingresso.conteudo_combo);
                    ticketData.comboItems = ticketData.comboData;
                } catch (e) {
                    console.error('Erro ao parsear combo data:', e);
                }
            }
            
            // Criar elemento na interface
            criarElementoIngresso(ticketData);
        });
        
        console.log('✅ Ingressos restaurados na interface');
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
    
    // Criar elemento de ingresso na interface
    function criarElementoIngresso(ticketData) {
        const ticketList = document.getElementById('ticketList');
        if (!ticketList) {
            console.error('❌ Container ticketList não encontrado');
            return;
        }
        
        const ticketItem = document.createElement('div');
        ticketItem.className = 'ticket-item';
        ticketItem.ticketData = ticketData; // DADOS COMPLETOS AQUI
        
        // HTML baseado no tipo
        let ticketHtml = '';
        
        if (ticketData.tipo === 'combo') {
            const totalIngressos = (ticketData.comboItems || []).length;
            ticketHtml = `
                <div class="ticket-header">
                    <div class="ticket-info">
                        <div class="ticket-name" style="color: #00C2FF;">${ticketData.titulo}</div>
                        <div class="ticket-details">
                            <span>Combo com ${totalIngressos} ingressos</span>
                            <span>Preço: R$ ${ticketData.preco.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="ticket-actions">
                        <button class="btn-secondary btn-sm" onclick="editarIngresso(this)">Editar</button>
                        <button class="btn-danger btn-sm" onclick="removeTicket(this.closest('.ticket-item').dataset.ticketId)">Excluir</button>
                    </div>
                </div>
            `;
        } else {
            const tipoLabel = ticketData.tipo === 'pago' ? 'Pago' : 'Gratuito';
            const precoText = ticketData.tipo === 'pago' ? `R$ ${ticketData.preco.toFixed(2)}` : 'Gratuito';
            
            ticketHtml = `
                <div class="ticket-header">
                    <div class="ticket-info">
                        <div class="ticket-name">${ticketData.titulo}</div>
                        <div class="ticket-details">
                            <span class="ticket-type">${tipoLabel}</span>
                            <span class="ticket-price">${precoText}</span>
                            <span class="ticket-quantity">Qtd: ${ticketData.quantity}</span>
                            ${ticketData.lote_nome ? `<span class="ticket-lote">Lote: ${ticketData.lote_nome}</span>` : ''}
                        </div>
                    </div>
                    <div class="ticket-actions">
                        <button class="btn-secondary btn-sm" onclick="editarIngresso(this)">Editar</button>
                        <button class="btn-danger btn-sm" onclick="removeTicket(this.closest('.ticket-item').dataset.ticketId)">Excluir</button>
                    </div>
                </div>
            `;
        }
        
        ticketItem.innerHTML = ticketHtml;
        ticketList.appendChild(ticketItem);
        
        console.log(`✅ Elemento criado para ingresso: ${ticketData.titulo}`);
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
