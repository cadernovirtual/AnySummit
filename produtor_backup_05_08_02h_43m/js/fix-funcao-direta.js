// === SUBSTITUIÇÃO DIRETA DA FUNÇÃO PROBLEMÁTICA ===
console.log('🔧 Correção direta da função problemática iniciada');

// Aguardar carregamento do sistema-insert-corrigido.js
setTimeout(() => {
    console.log('🔍 Procurando função coletarDadosModalPagoFinal...');
    
    // Função corrigida com IDs corretos e logs
    function coletarDadosModalPagoFinalCorrigida() {
        console.log('🔧 === EXECUTANDO FUNÇÃO CORRIGIDA ===');
        
        // Coletar dados com IDs CORRETOS
        const titulo = document.getElementById('paidTicketTitle')?.value?.trim();
        const descricao = document.getElementById('paidTicketDescription')?.value?.trim() || '';
        const quantidade = parseInt(document.getElementById('paidTicketQuantity')?.value) || 0;
        const precoRaw = document.getElementById('paidTicketPrice')?.value || '';
        
        // Converter preço corretamente
        const preco = parseFloat(precoRaw.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.')) || 0;
        
        const loteSelect = document.getElementById('paidTicketLote');
        const loteId = loteSelect && loteSelect.value !== '0' ? parseInt(loteSelect.value) : null;
        const inicio_venda = document.getElementById('paidSaleStart')?.value || null;
        const fim_venda = document.getElementById('paidSaleEnd')?.value || null;
        
        // USAR IDs CORRETOS para min/max
        const limite_min = parseInt(document.getElementById('paidMinQuantity')?.value) || 1;
        const limite_max = parseInt(document.getElementById('paidMaxQuantity')?.value) || 5;
        
        console.log('📊 Dados coletados (VERSÃO CORRIGIDA):');
        console.log('  titulo:', `"${titulo}" (length: ${titulo?.length})`);
        console.log('  quantidade:', quantidade);
        console.log('  precoRaw:', `"${precoRaw}"`);
        console.log('  preco convertido:', preco);
        console.log('  loteId:', loteId);
        console.log('  inicio_venda:', `"${inicio_venda}"`);
        console.log('  fim_venda:', `"${fim_venda}"`);
        console.log('  limite_min:', limite_min, '(de paidMinQuantity)');
        console.log('  limite_max:', limite_max, '(de paidMaxQuantity)');
        
        // Validação com logs detalhados
        const erros = [];
        
        if (!titulo || titulo.trim() === '') {
            erros.push('Título está vazio');
        }
        
        if (quantidade < 0) { // Permitir quantidade 0 para checkbox desmarcado
            erros.push(`Quantidade inválida: ${quantidade}`);
        }
        
        if (!preco || preco <= 0) {
            erros.push(`Preço inválido: ${preco} (original: "${precoRaw}")`);
        }
        
        if (!loteId) {
            erros.push(`Lote não selecionado: ${loteId}`);
        }
        
        if (erros.length > 0) {
            console.error('❌ VALIDAÇÃO FALHOU:');
            erros.forEach((erro, i) => console.error(`  ${i+1}. ${erro}`));
            return null;
        }
        
        console.log('✅ Validação passou! Preparando dados finais...');
        
        // Calcular taxa
        const taxa_plataforma = preco * 0.08;
        const valor_receber = preco - taxa_plataforma;
        
        const dados = {
            tipo: 'pago',
            titulo: titulo,
            descricao: descricao,
            quantidade_total: quantidade,
            preco: preco,
            taxa_plataforma: taxa_plataforma,
            valor_receber: valor_receber,
            inicio_venda: inicio_venda,
            fim_venda: fim_venda,
            limite_min: limite_min,
            limite_max: limite_max,
            lote_id: loteId,
            conteudo_combo: ''
        };
        
        console.log('✅ Dados finais preparados:', dados);
        return dados;
    }
    
    // Substituir a função globalmente - FORÇAR MÚLTIPLAS VEZES
    window.coletarDadosModalPagoFinal = coletarDadosModalPagoFinalCorrigida;
    console.log('✅ Função coletarDadosModalPagoFinal substituída globalmente (tentativa 1)');
    
}, 500);

// Tentar substituir novamente após mais tempo
setTimeout(() => {
    if (window.coletarDadosModalPagoFinal) {
        // Verificar se ainda não é nossa função
        const funcaoAtual = window.coletarDadosModalPagoFinal.toString();
        if (!funcaoAtual.includes('EXECUTANDO FUNÇÃO CORRIGIDA')) {
            console.log('🔄 Função foi sobrescrita, substituindo novamente...');
            
            function coletarDadosModalPagoFinalCorrigida() {
                console.log('🔧 === EXECUTANDO FUNÇÃO CORRIGIDA (VERSÃO 2) ===');
                
                const titulo = document.getElementById('paidTicketTitle')?.value?.trim();
                const descricao = document.getElementById('paidTicketDescription')?.value?.trim() || '';
                const quantidade = parseInt(document.getElementById('paidTicketQuantity')?.value) || 0;
                const precoRaw = document.getElementById('paidTicketPrice')?.value || '';
                const preco = parseFloat(precoRaw.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.')) || 0;
                const loteSelect = document.getElementById('paidTicketLote');
                const loteId = loteSelect && loteSelect.value !== '0' ? parseInt(loteSelect.value) : null;
                const inicio_venda = document.getElementById('paidSaleStart')?.value || null;
                const fim_venda = document.getElementById('paidSaleEnd')?.value || null;
                const limite_min = parseInt(document.getElementById('paidMinQuantity')?.value) || 1;
                const limite_max = parseInt(document.getElementById('paidMaxQuantity')?.value) || 5;
                
                console.log('📊 Dados:', { titulo, quantidade, preco, loteId });
                
                if (!titulo || quantidade < 0 || preco <= 0 || !loteId) { // Permitir quantidade 0
                    console.error('❌ Validação falhou');
                    return null;
                }
                
                const taxa_plataforma = preco * 0.08;
                const valor_receber = preco - taxa_plataforma;
                
                const dados = {
                    tipo: 'pago',
                    titulo: titulo,
                    descricao: descricao,
                    quantidade_total: quantidade,
                    preco: preco,
                    taxa_plataforma: taxa_plataforma,
                    valor_receber: valor_receber,
                    inicio_venda: inicio_venda,
                    fim_venda: fim_venda,
                    limite_min: limite_min,
                    limite_max: limite_max,
                    lote_id: loteId,
                    conteudo_combo: ''
                };
                
                console.log('✅ Dados preparados:', dados);
                return dados;
            }
            
            window.coletarDadosModalPagoFinal = coletarDadosModalPagoFinalCorrigida;
            console.log('✅ Função substituída novamente (tentativa 2)');
        } else {
            console.log('✅ Nossa função já está ativa');
        }
    }
}, 2500);
