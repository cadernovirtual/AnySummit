/**
 * DEBUG E CORREÇÃO: Validação de campos de ingresso
 * 
 * PROBLEMA: Campos preenchidos mas validação falha
 * SOLUÇÃO: Debug detalhado + conversão correta de valores
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Debug de validação de campos ativado');
    
    // =============================================
    // FUNÇÃO PARA CONVERTER VALORES MONETÁRIOS
    // =============================================
    
    function converterValorMonetario(valor) {
        if (!valor || valor === '') return 0;
        
        // Remover "R$", espaços e converter vírgula para ponto
        const valorLimpo = valor.toString()
            .replace(/R\$\s*/g, '')
            .replace(/\./g, '')  // Remove pontos de milhares
            .replace(',', '.')   // Converte vírgula decimal para ponto
            .trim();
        
        const resultado = parseFloat(valorLimpo) || 0;
        console.log(`💰 Conversão monetária: "${valor}" → ${resultado}`);
        return resultado;
    }
    
    // =============================================
    // INTERCEPTAR E DEBUGAR VALIDAÇÃO
    // =============================================
    
    function interceptarValidacao() {
        // Interceptar a função original do sistema
        if (window.createPaidTicket) {
            const originalCreatePaidTicket = window.createPaidTicket;
            window.createPaidTicket = function() {
                console.log('🔍 DEBUG: Interceptando createPaidTicket para debug detalhado');
                
                // Coletar todos os dados ANTES da validação
                const dadosDebug = coletarDadosParaDebug();
                console.log('📊 DADOS COLETADOS PARA DEBUG:', dadosDebug);
                
                // Verificar se todos os campos obrigatórios estão preenchidos
                const validacao = validarCamposDetalhadamente(dadosDebug);
                console.log('✅ RESULTADO DA VALIDAÇÃO:', validacao);
                
                if (!validacao.valido) {
                    console.error('❌ VALIDAÇÃO FALHOU:', validacao.erros);
                    alert('Campos com problema: ' + validacao.erros.join(', '));
                    return;
                }
                
                // Se chegou aqui, dados estão válidos - chamar função original
                return originalCreatePaidTicket.apply(this, arguments);
            };
        }
    }
    
    function coletarDadosParaDebug() {
        const titulo = document.getElementById('paidTicketTitle')?.value?.trim();
        const descricao = document.getElementById('paidTicketDescription')?.value?.trim() || '';
        const quantidadeRaw = document.getElementById('paidTicketQuantity')?.value;
        const precoRaw = document.getElementById('paidTicketPrice')?.value;
        const loteSelect = document.getElementById('paidTicketLote');
        const loteIdRaw = loteSelect?.value;
        const saleStartRaw = document.getElementById('paidSaleStart')?.value;
        const saleEndRaw = document.getElementById('paidSaleEnd')?.value;
        const minLimitRaw = document.getElementById('paidMinQuantity')?.value;
        const maxLimitRaw = document.getElementById('paidMaxQuantity')?.value;
        
        // Converter valores
        const quantidade = parseInt(quantidadeRaw) || 0;
        const preco = converterValorMonetario(precoRaw);
        const loteId = loteIdRaw && loteIdRaw !== '0' ? parseInt(loteIdRaw) : null;
        const limite_min = parseInt(minLimitRaw) || 1;
        const limite_max = parseInt(maxLimitRaw) || 5;
        
        return {
            // Valores brutos
            raw: {
                titulo,
                descricao,
                quantidadeRaw,
                precoRaw,
                loteIdRaw,
                saleStartRaw,
                saleEndRaw,
                minLimitRaw,
                maxLimitRaw
            },
            // Valores convertidos
            converted: {
                titulo,
                descricao,
                quantidade,
                preco,
                loteId,
                inicio_venda: saleStartRaw,
                fim_venda: saleEndRaw,
                limite_min,
                limite_max
            }
        };
    }
    
    function validarCamposDetalhadamente(dados) {
        const { converted } = dados;
        const erros = [];
        
        // Validar título
        if (!converted.titulo || converted.titulo.trim() === '') {
            erros.push('Título é obrigatório');
        }
        
        // Validar quantidade
        if (!converted.quantidade || converted.quantidade <= 0) {
            erros.push('Quantidade deve ser maior que zero');
        }
        
        // Validar preço
        if (!converted.preco || converted.preco <= 0) {
            erros.push('Preço deve ser maior que zero');
        }
        
        // Validar lote
        if (!converted.loteId) {
            erros.push('Lote é obrigatório');
        }
        
        // Validar datas (se campos não estão readonly)
        const saleStart = document.getElementById('paidSaleStart');
        const saleEnd = document.getElementById('paidSaleEnd');
        
        if (saleStart && !saleStart.readOnly && (!converted.inicio_venda || converted.inicio_venda === '')) {
            erros.push('Data de início das vendas é obrigatória');
        }
        
        if (saleEnd && !saleEnd.readOnly && (!converted.fim_venda || converted.fim_venda === '')) {
            erros.push('Data de fim das vendas é obrigatória');
        }
        
        return {
            valido: erros.length === 0,
            erros: erros,
            dados: converted
        };
    }
    
    // =============================================
    // INTERCEPTAR SISTEMA-INSERT-CORRIGIDO
    // =============================================
    
    function corrigirSistemaInsert() {
        // Sobrescrever a função problemática
        if (window.coletarDadosModalPagoFinal) {
            window.coletarDadosModalPagoFinal = function() {
                console.log('🔧 Usando versão corrigida de coletarDadosModalPagoFinal');
                
                const dados = coletarDadosParaDebug();
                const validacao = validarCamposDetalhadamente(dados);
                
                if (!validacao.valido) {
                    console.warn('⚠️ Dados inválidos após validação:', validacao.erros);
                    return null;
                }
                
                // Calcular taxa
                const preco = validacao.dados.preco;
                const taxa_plataforma = preco * 0.08;
                const valor_receber = preco - taxa_plataforma;
                
                const dadosFinais = {
                    tipo: 'pago',
                    titulo: validacao.dados.titulo,
                    descricao: validacao.dados.descricao,
                    quantidade_total: validacao.dados.quantidade,
                    preco: preco,
                    taxa_plataforma: taxa_plataforma,
                    valor_receber: valor_receber,
                    inicio_venda: validacao.dados.inicio_venda,
                    fim_venda: validacao.dados.fim_venda,
                    limite_min: validacao.dados.limite_min,
                    limite_max: validacao.dados.limite_max,
                    lote_id: validacao.dados.loteId,
                    conteudo_combo: ''
                };
                
                console.log('✅ Dados coletados com sucesso:', dadosFinais);
                return dadosFinais;
            };
        }
    }
    
    // =============================================
    // INICIALIZAÇÃO
    // =============================================
    
    setTimeout(() => {
        interceptarValidacao();
        
        // Aguardar carregamento do sistema-insert-corrigido
        setTimeout(() => {
            corrigirSistemaInsert();
            console.log('✅ Debug de validação configurado');
        }, 1500);
    }, 1000);
});
