/**
 * LOG DETALHADO + SUBSTITUIÇÃO FORÇADA
 * 
 * PROBLEMA: Função original ainda está sendo usada
 * SOLUÇÃO: Substituição mais agressiva + logs detalhados
 */

console.log('🔍 Carregando log detalhado de validação...');

// Função para converter valores monetários
function converterValorMonetario(valor) {
    if (!valor || valor === '') return 0;
    
    const valorLimpo = valor.toString()
        .replace(/R\$\s*/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
        .trim();
    
    const resultado = parseFloat(valorLimpo) || 0;
    console.log(`💰 Conversão: "${valor}" → ${resultado}`);
    return resultado;
}

// Função de coleta CORRIGIDA
function coletarDadosModalPagoFinalCorrigida() {
    console.log('🔧 === FUNÇÃO CORRIGIDA EXECUTANDO ===');
    
    // Verificar se todos os elementos existem
    const elementos = {
        titulo: document.getElementById('paidTicketTitle'),
        descricao: document.getElementById('paidTicketDescription'),
        quantidade: document.getElementById('paidTicketQuantity'),
        preco: document.getElementById('paidTicketPrice'),
        lote: document.getElementById('paidTicketLote'),
        inicio: document.getElementById('paidSaleStart'),
        fim: document.getElementById('paidSaleEnd'),
        min: document.getElementById('paidMinQuantity'),
        max: document.getElementById('paidMaxQuantity')
    };
    
    console.log('📋 Elementos encontrados:');
    Object.keys(elementos).forEach(key => {
        const el = elementos[key];
        console.log(`  ${key}: ${el ? '✅ EXISTS' : '❌ NOT FOUND'} - Value: ${el?.value || 'N/A'}`);
    });
    
    // Coletar valores
    const titulo = elementos.titulo?.value?.trim();
    const descricao = elementos.descricao?.value?.trim() || '';
    const quantidade = parseInt(elementos.quantidade?.value) || 0;
    const precoRaw = elementos.preco?.value;
    const preco = converterValorMonetario(precoRaw);
    const loteValue = elementos.lote?.value;
    const loteId = loteValue && loteValue !== '0' ? parseInt(loteValue) : null;
    const inicio_venda = elementos.inicio?.value || null;
    const fim_venda = elementos.fim?.value || null;
    const limite_min = parseInt(elementos.min?.value) || 1;
    const limite_max = parseInt(elementos.max?.value) || 5;
    
    console.log('📊 Valores coletados:');
    console.log(`  titulo: "${titulo}" (length: ${titulo?.length})`);
    console.log(`  quantidade: ${quantidade} (type: ${typeof quantidade})`);
    console.log(`  precoRaw: "${precoRaw}"`);
    console.log(`  preco: ${preco} (type: ${typeof preco})`);
    console.log(`  loteValue: "${loteValue}"`);
    console.log(`  loteId: ${loteId} (type: ${typeof loteId})`);
    console.log(`  inicio_venda: "${inicio_venda}"`);
    console.log(`  fim_venda: "${fim_venda}"`);
    console.log(`  limite_min: ${limite_min}`);
    console.log(`  limite_max: ${limite_max}`);
    
    // Status dos campos de data
    console.log('📅 Status dos campos de data:');
    console.log(`  paidSaleStart readOnly: ${elementos.inicio?.readOnly}`);
    console.log(`  paidSaleEnd readOnly: ${elementos.fim?.readOnly}`);
    
    // Validação detalhada
    const erros = [];
    
    if (!titulo || titulo.trim() === '') {
        erros.push('TÍTULO: está vazio ou contém apenas espaços');
    }
    
    if (!quantidade || quantidade <= 0 || isNaN(quantidade)) {
        erros.push(`QUANTIDADE: inválida (${quantidade}) - deve ser número > 0`);
    }
    
    if (!preco || preco <= 0 || isNaN(preco)) {
        erros.push(`PREÇO: inválido (${preco}) - original: "${precoRaw}"`);
    }
    
    if (!loteId || isNaN(loteId)) {
        erros.push(`LOTE: não selecionado ou inválido (${loteId}) - value: "${loteValue}"`);
    }
    
    // Validar datas apenas se campos não estão readonly
    if (elementos.inicio && !elementos.inicio.readOnly && (!inicio_venda || inicio_venda === '')) {
        erros.push('DATA INÍCIO: obrigatória (campo não está readonly)');
    }
    
    if (elementos.fim && !elementos.fim.readOnly && (!fim_venda || fim_venda === '')) {
        erros.push('DATA FIM: obrigatória (campo não está readonly)');
    }
    
    console.log('🔍 Resultado da validação:');
    if (erros.length > 0) {
        console.error('❌ ERROS ENCONTRADOS:');
        erros.forEach((erro, index) => {
            console.error(`  ${index + 1}. ${erro}`);
        });
        alert('❌ Campos com problema:\n\n' + erros.join('\n'));
        return null;
    }
    
    console.log('✅ Todos os campos válidos!');
    
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

// Substituição IMEDIATA e repetida
function forcarSubstituicao() {
    if (window.coletarDadosModalPagoFinal) {
        console.log('🔄 Substituindo função coletarDadosModalPagoFinal...');
        window.coletarDadosModalPagoFinal = coletarDadosModalPagoFinalCorrigida;
        console.log('✅ Função substituída com sucesso!');
    } else {
        console.log('⏳ Função ainda não existe, tentando novamente...');
    }
}

// Tentar substituir imediatamente
forcarSubstituicao();

// Tentar novamente após 500ms
setTimeout(forcarSubstituicao, 500);

// Tentar novamente após 1000ms
setTimeout(forcarSubstituicao, 1000);

// Tentar novamente após 1500ms
setTimeout(forcarSubstituicao, 1500);

// Tentar novamente após 2000ms
setTimeout(forcarSubstituicao, 2000);

// Tentar novamente após 3000ms (último recurso)
setTimeout(forcarSubstituicao, 3000);

console.log('🔍 Log detalhado configurado - tentativas de substituição agendadas');
