/**
 * EDIÇÃO DE INGRESSOS: Buscar dados do banco
 * Corrige edição para buscar dados reais da tabela ingressos
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Sistema de edição com dados do banco carregado');
    
    // Substituir função editItem para buscar dados do banco
    const originalEditItem = window.editItem;
    window.editItem = function(ticketId) {
        console.log(`📝 Editando ingresso: ${ticketId} - Buscando dados do banco`);
        buscarDadosIngressoDoBanco(ticketId);
    };
    
    // Função para buscar dados do ingresso no banco
    async function buscarDadosIngressoDoBanco(ingressoId) {
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            console.log(`🔍 Buscando dados do ingresso ${ingressoId} no banco...`);
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=obter_dados_ingresso&evento_id=${eventoId}&ingresso_id=${ingressoId}`
            });
            
            const data = await response.json();
            
            if (data.sucesso && data.ingresso) {
                console.log('✅ Dados do ingresso obtidos do banco:', data.ingresso);
                abrirModalEdicaoComDadosDoBanco(data.ingresso);
            } else {
                console.error('❌ Erro ao buscar dados do ingresso:', data.erro);
                alert('Erro ao carregar dados do ingresso: ' + (data.erro || 'Ingresso não encontrado'));
            }
            
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
            alert('Erro de conexão ao buscar dados do ingresso.');
        }
    }
    
    // Função para abrir modal com dados do banco
    function abrirModalEdicaoComDadosDoBanco(ingresso) {
        console.log(`🎭 Abrindo modal para ingresso tipo: ${ingresso.tipo}`);
        
        if (ingresso.tipo === 'pago') {
            preencherModalEdicaoPago(ingresso);
            if (window.openModal) window.openModal('editPaidTicketModal');
        } else if (ingresso.tipo === 'gratuito') {
            preencherModalEdicaoGratuito(ingresso);
            if (window.openModal) window.openModal('editFreeTicketModal');
        } else if (ingresso.tipo === 'combo') {
            preencherModalEdicaoCombo(ingresso);
            if (window.openModal) window.openModal('editComboTicketModal');
        } else {
            console.error('❌ Tipo de ingresso não reconhecido:', ingresso.tipo);
            alert('Tipo de ingresso não reconhecido: ' + ingresso.tipo);
        }
    }
    
    // Preencher modal de edição de ingresso pago
    function preencherModalEdicaoPago(ingresso) {
        console.log('💰 Preenchendo modal de edição de ingresso pago');
        
        const campos = {
            editPaidTicketId: ingresso.id,
            editPaidTicketTitle: ingresso.titulo,
            editPaidTicketDescription: ingresso.descricao || '',
            editPaidTicketQuantity: ingresso.quantidade_total,
            editPaidTicketPrice: `R$ ${parseFloat(ingresso.preco || 0).toFixed(2).replace('.', ',')}`,
            editPaidTicketLote: ingresso.lote_id || '',
            editPaidSaleStart: ingresso.inicio_venda || '',
            editPaidSaleEnd: ingresso.fim_venda || '',
            editPaidMinQuantity: ingresso.limite_min || 1,
            editPaidMaxQuantity: ingresso.limite_max || 5
        };
        
        Object.keys(campos).forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = campos[id];
                console.log(`✅ Preenchido ${id}: ${campos[id]}`);
            } else {
                console.warn(`⚠️ Campo não encontrado: ${id}`);
            }
        });
        
        // Calcular e preencher valores de taxa
        const preco = parseFloat(ingresso.preco || 0);
        const taxaPlataforma = parseFloat(ingresso.taxa_plataforma || 0);
        const valorReceber = parseFloat(ingresso.valor_receber || 0);
        
        const campoTaxa = document.getElementById('editPaidTicketTaxaValor');
        const campoReceber = document.getElementById('editPaidTicketValorReceber');
        
        if (campoTaxa) campoTaxa.value = `R$ ${taxaPlataforma.toFixed(2).replace('.', ',')}`;
        if (campoReceber) campoReceber.value = `R$ ${valorReceber.toFixed(2).replace('.', ',')}`;
        
        // Verificar se taxa está habilitada
        const checkboxTaxa = document.getElementById('editPaidTicketTaxaServico');
        if (checkboxTaxa) {
            checkboxTaxa.checked = taxaPlataforma > 0;
        }
    }
    
    // Preencher modal de edição de ingresso gratuito
    function preencherModalEdicaoGratuito(ingresso) {
        console.log('🆓 Preenchendo modal de edição de ingresso gratuito');
        
        const campos = {
            editFreeTicketId: ingresso.id,
            editFreeTicketTitle: ingresso.titulo,
            editFreeTicketDescription: ingresso.descricao || '',
            editFreeTicketQuantity: ingresso.quantidade_total,
            editFreeTicketLote: ingresso.lote_id || '',
            editFreeSaleStart: ingresso.inicio_venda || '',
            editFreeSaleEnd: ingresso.fim_venda || '',
            editFreeMinQuantity: ingresso.limite_min || 1,
            editFreeMaxQuantity: ingresso.limite_max || 5
        };
        
        Object.keys(campos).forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = campos[id];
                console.log(`✅ Preenchido ${id}: ${campos[id]}`);
            } else {
                console.warn(`⚠️ Campo não encontrado: ${id}`);
            }
        });
    }
    
    // Preencher modal de edição de combo
    function preencherModalEdicaoCombo(ingresso) {
        console.log('🎭 Preenchendo modal de edição de combo');
        
        const campos = {
            editComboTicketId: ingresso.id,
            editComboTitle: ingresso.titulo,
            editComboDescription: ingresso.descricao || '',
            editComboPrice: `R$ ${parseFloat(ingresso.preco || 0).toFixed(2).replace('.', ',')}`,
            editComboTicketLote: ingresso.lote_id || '',
            editComboSaleStart: ingresso.inicio_venda || '',
            editComboSaleEnd: ingresso.fim_venda || '',
            editComboMinQuantity: ingresso.limite_min || 1,
            editComboMaxQuantity: ingresso.limite_max || 5
        };
        
        Object.keys(campos).forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = campos[id];
                console.log(`✅ Preenchido ${id}: ${campos[id]}`);
            } else {
                console.warn(`⚠️ Campo não encontrado: ${id}`);
            }
        });
        
        // Processar conteúdo do combo se existir
        if (ingresso.conteudo_combo) {
            try {
                const conteudoCombo = typeof ingresso.conteudo_combo === 'string' 
                    ? JSON.parse(ingresso.conteudo_combo) 
                    : ingresso.conteudo_combo;
                
                console.log('📦 Conteúdo do combo:', conteudoCombo);
                
                // Aqui você pode processar os itens do combo se necessário
                // Por exemplo, popular uma lista de itens do combo
                
            } catch (error) {
                console.error('❌ Erro ao processar conteúdo do combo:', error);
            }
        }
    }
    
    console.log('✅ Sistema de edição com dados do banco configurado');
});
