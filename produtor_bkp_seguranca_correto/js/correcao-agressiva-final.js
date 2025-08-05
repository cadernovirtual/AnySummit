/**
 * CORREÇÃO AGRESSIVA FINAL: Substitui coletarDadosIngressos NO MOMENTO da chamada
 * Esta correção intercepta qualquer chamada e garante que APENAS lote_id seja enviado
 */

(function() {
    'use strict';
    
    console.log('🚨 CORREÇÃO AGRESSIVA FINAL carregada');
    
    // Aguardar DOM e outros scripts carregarem
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', aplicarCorrecaoAgressiva);
    } else {
        aplicarCorrecaoAgressiva();
    }
    
    function aplicarCorrecaoAgressiva() {
        console.log('⚡ Aplicando correção agressiva...');
        
        // SOBRESCREVER IMEDIATAMENTE a função no window
        window.coletarDadosIngressos = function() {
            console.log('🔥 [CORREÇÃO AGRESSIVA] coletarDadosIngressos chamada');
            
            const ingressos = [];
            const ticketItems = document.querySelectorAll('.ticket-item');
            
            console.log(`🎫 Encontrados ${ticketItems.length} elementos .ticket-item`);
            
            ticketItems.forEach((item, index) => {
                console.log(`\n=== INGRESSO ${index + 1} ===`);
                
                const ticketData = item.ticketData;
                
                if (!ticketData) {
                    console.error('❌ ticketData não encontrado');
                    return;
                }
                
                console.log('📊 ticketData completo:', ticketData);
                
                // BUSCAR lote_id COM PRIORIDADE ABSOLUTA
                let lote_id = null;
                
                // 1. Verificar ticketData.loteId (principal)
                if (ticketData.loteId && ticketData.loteId !== '' && ticketData.loteId !== '0') {
                    lote_id = parseInt(ticketData.loteId);
                    console.log(`✅ lote_id de ticketData.loteId: ${lote_id}`);
                }
                // 2. Verificar ticketData.lote_id (alternativo)
                else if (ticketData.lote_id && ticketData.lote_id !== '' && ticketData.lote_id !== '0') {
                    lote_id = parseInt(ticketData.lote_id);
                    console.log(`✅ lote_id de ticketData.lote_id: ${lote_id}`);
                }
                // 3. Buscar nos modais ativos (último recurso)
                else {
                    console.log('🔍 lote_id não encontrado no ticketData, buscando modais...');
                    
                    const selects = [
                        document.getElementById('paidTicketLote'),
                        document.getElementById('freeTicketLote'),
                        document.getElementById('editPaidTicketLote'),
                        document.getElementById('editFreeTicketLote')
                    ];
                    
                    for (const select of selects) {
                        if (select && select.value && select.value !== '' && select.value !== '0') {
                            lote_id = parseInt(select.value);
                            console.log(`✅ lote_id de modal ${select.id}: ${lote_id}`);
                            break;
                        }
                    }
                }
                
                console.log(`🎯 LOTE_ID FINAL: ${lote_id}`);
                
                // MAPEAR TIPO
                let tipo = 'pago';
                const tipoOriginal = ticketData.tipo || ticketData.type || 'paid';
                
                switch(tipoOriginal.toLowerCase()) {
                    case 'paid':
                    case 'pago':
                        tipo = 'pago';
                        break;
                    case 'free':
                    case 'gratuito':
                        tipo = 'gratuito';
                        break;
                    case 'combo':
                        tipo = 'combo';
                        break;
                    default:
                        tipo = 'pago';
                }
                
                // COLETAR DATAS
                const inicio_venda = ticketData.inicio_venda || ticketData.startDate || null;
                const fim_venda = ticketData.fim_venda || ticketData.endDate || null;
                
                // MONTAR OBJETO FINAL - APENAS COM lote_id
                const ingresso = {
                    tipo: tipo,
                    titulo: ticketData.titulo || ticketData.title || '',
                    descricao: ticketData.descricao || ticketData.description || '',
                    quantidade: parseInt(ticketData.quantity) || 100,
                    preco: parseFloat(ticketData.preco || ticketData.price) || 0,
                    taxa_plataforma: parseFloat(ticketData.taxaPlataforma) || 0,
                    valor_receber: parseFloat(ticketData.valorReceber) || parseFloat(ticketData.preco || ticketData.price) || 0,
                    inicio_venda: inicio_venda,
                    fim_venda: fim_venda,
                    limite_min: parseInt(ticketData.limite_min || ticketData.minQuantity) || 1,
                    limite_max: parseInt(ticketData.limite_max || ticketData.maxQuantity) || 5,
                    lote_id: lote_id  // APENAS lote_id - SEM lote_nome!
                };
                
                // GARANTIR QUE NÃO EXISTE lote_nome
                if (ingresso.hasOwnProperty('lote_nome')) {
                    delete ingresso.lote_nome;
                }
                
                // Combo especial
                if (tipo === 'combo' && ticketData.comboData) {
                    ingresso.conteudo_combo = ticketData.comboData;
                }
                
                console.log('✅ INGRESSO FINAL:', ingresso);
                console.log(`  - HAS lote_nome?: ${ingresso.hasOwnProperty('lote_nome')}`);
                console.log(`  - lote_id: ${ingresso.lote_id}`);
                
                ingressos.push(ingresso);
            });
            
            console.log(`\n📦 RESULTADO FINAL (${ingressos.length} ingressos):`);
            console.log(ingressos);
            
            // VERIFICAÇÃO FINAL - garantir que nenhum ingresso tem lote_nome
            const temLoteNome = ingressos.some(ing => ing.hasOwnProperty('lote_nome'));
            if (temLoteNome) {
                console.error('🚨 ERRO: Ainda existe lote_nome nos dados!');
                // Remover FORÇADAMENTE
                ingressos.forEach(ing => {
                    if (ing.hasOwnProperty('lote_nome')) {
                        delete ing.lote_nome;
                    }
                });
                console.log('🔧 lote_nome removido forçadamente');
            } else {
                console.log('✅ CONFIRMADO: Nenhum lote_nome nos dados');
            }
            
            console.log('\n📤 JSON FINAL PARA ENVIO:');
            console.log(JSON.stringify(ingressos));
            
            return ingressos;
        };
        
        // INTERCEPTAR TAMBÉM o salvamento para garantir
        if (window.salvarEtapaComEventoId) {
            const originalSalvarEtapaComEventoId = window.salvarEtapaComEventoId;
            window.salvarEtapaComEventoId = function(etapa) {
                if (etapa === 6) {
                    console.log('🔥 Interceptando salvamento da etapa 6');
                    
                    // Forçar uso da nossa função
                    const ingressos = window.coletarDadosIngressos();
                    console.log('📦 Dados que serão enviados:', ingressos);
                    
                    // Verificar se tem lote_nome
                    const comLoteNome = ingressos.filter(ing => ing.hasOwnProperty('lote_nome'));
                    if (comLoteNome.length > 0) {
                        console.error('🚨 AINDA TEM LOTE_NOME!', comLoteNome);
                    } else {
                        console.log('✅ CONFIRMADO: Sem lote_nome');
                    }
                }
                
                return originalSalvarEtapaComEventoId.apply(this, arguments);
            };
        }
        
        console.log('⚡ Correção agressiva aplicada - coletarDadosIngressos SUBSTITUÍDA');
    }
    
    // Função de teste
    window.testarCorrecaoAgressiva = function() {
        console.log('🧪 Testando correção agressiva...');
        
        if (window.coletarDadosIngressos) {
            const dados = window.coletarDadosIngressos();
            console.log('📊 Dados coletados:', dados);
            
            const comLoteNome = dados.filter(ing => ing.hasOwnProperty('lote_nome'));
            if (comLoteNome.length > 0) {
                console.error('❌ FALHOU: Ainda tem lote_nome', comLoteNome);
            } else {
                console.log('✅ SUCESSO: Sem lote_nome');
            }
        }
    };
    
    console.log('🚨 CORREÇÃO AGRESSIVA FINAL inicializada');
    console.log('💡 Use testarCorrecaoAgressiva() para verificar');
    
})();
