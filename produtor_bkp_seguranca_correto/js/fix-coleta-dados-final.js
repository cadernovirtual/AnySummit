/**
 * CORREÇÃO IMEDIATA: Substituir função problemática
 * 
 * PROBLEMA: sistema-insert-corrigido.js usa IDs errados e converte preço incorretamente
 * SOLUÇÃO: Substituir completamente a função coletarDadosModalPagoFinal
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Substituição de função problemática ativada');
    
    // Função para converter valores monetários corretamente
    function converterValorMonetario(valor) {
        if (!valor || valor === '') return 0;
        
        // Remover "R$", espaços e converter vírgula para ponto
        const valorLimpo = valor.toString()
            .replace(/R\$\s*/g, '')
            .replace(/\./g, '')  // Remove pontos de milhares
            .replace(',', '.')   // Converte vírgula decimal para ponto
            .trim();
        
        const resultado = parseFloat(valorLimpo) || 0;
        console.log(`💰 Conversão: "${valor}" → ${resultado}`);
        return resultado;
    }
    
    // Aguardar carregamento e substituir função
    setTimeout(() => {
        // Substituir função problemática
        window.coletarDadosModalPagoFinal = function() {
            console.log('🔧 Usando função CORRIGIDA de coletarDadosModalPagoFinal');
            
            // Coletar dados com IDs corretos
            const titulo = document.getElementById('paidTicketTitle')?.value?.trim();
            const descricao = document.getElementById('paidTicketDescription')?.value?.trim() || '';
            const quantidade = parseInt(document.getElementById('paidTicketQuantity')?.value) || 0;
            const precoRaw = document.getElementById('paidTicketPrice')?.value;
            const preco = converterValorMonetario(precoRaw);
            const loteSelect = document.getElementById('paidTicketLote');
            const loteId = loteSelect && loteSelect.value !== '0' ? parseInt(loteSelect.value) : null;
            const inicio_venda = document.getElementById('paidSaleStart')?.value || null;
            const fim_venda = document.getElementById('paidSaleEnd')?.value || null;
            
            // USAR IDs CORRETOS para min/max
            const limite_min = parseInt(document.getElementById('paidMinQuantity')?.value) || 1;
            const limite_max = parseInt(document.getElementById('paidMaxQuantity')?.value) || 5;
            
            console.log('📊 Dados coletados:');
            console.log('  - titulo:', titulo);
            console.log('  - quantidade:', quantidade);
            console.log('  - precoRaw:', precoRaw);
            console.log('  - preco convertido:', preco);
            console.log('  - loteId:', loteId);
            console.log('  - inicio_venda:', inicio_venda);
            console.log('  - fim_venda:', fim_venda);
            console.log('  - limite_min:', limite_min);
            console.log('  - limite_max:', limite_max);
            
            // Validação com logs detalhados
            const erros = [];
            
            if (!titulo || titulo.trim() === '') {
                erros.push('Título está vazio');
            }
            
            if (!quantidade || quantidade <= 0) {
                erros.push('Quantidade inválida: ' + quantidade);
            }
            
            if (!preco || preco <= 0) {
                erros.push('Preço inválido: ' + preco + ' (original: ' + precoRaw + ')');
            }
            
            if (!loteId) {
                erros.push('Lote não selecionado');
            }
            
            // Verificar se campos de data são obrigatórios (não readonly)
            const campoInicio = document.getElementById('paidSaleStart');
            const campoFim = document.getElementById('paidSaleEnd');
            
            if (campoInicio && !campoInicio.readOnly && (!inicio_venda || inicio_venda === '')) {
                erros.push('Data de início das vendas é obrigatória');
            }
            
            if (campoFim && !campoFim.readOnly && (!fim_venda || fim_venda === '')) {
                erros.push('Data de fim das vendas é obrigatória');
            }
            
            if (erros.length > 0) {
                console.warn('⚠️ Erros encontrados:', erros);
                alert('Campos com problema:\n' + erros.join('\n'));
                return null;
            }
            
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
            
            console.log('✅ Dados finais válidos:', dados);
            return dados;
        };
        
        console.log('✅ Função coletarDadosModalPagoFinal substituída com sucesso');
    }, 2000); // Aguardar mais tempo para garantir que outros scripts carregaram
});
