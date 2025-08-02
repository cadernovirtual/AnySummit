/**
 * DEBUG - Intercepta e mostra dados enviados para API
 */

(function() {
    console.log('🔍 DEBUG DE ENVIO ATIVADO');
    
    // Interceptar fetch
    const fetchOriginal = window.fetch;
    window.fetch = async function(url, options) {
        if (url.includes('criaeventoapi.php')) {
            console.log('📤 INTERCEPTADO - Enviando para:', url);
            console.log('📋 Opções:', options);
            
            if (options.body) {
                try {
                    const dados = JSON.parse(options.body);
                    console.log('📊 DADOS ENVIADOS:', dados);
                    
                    // Verificar campos obrigatórios
                    console.log('✅ nome:', dados.nome);
                    console.log('✅ descricao_completa:', dados.descricao_completa || dados.descricao);
                    console.log('✅ classificacao:', dados.classificacao);
                    console.log('✅ categoria:', dados.categoria);
                    console.log('✅ data_inicio:', dados.data_inicio);
                    console.log('✅ tipo_local:', dados.tipo_local);
                    console.log('✅ visibilidade:', dados.visibilidade);
                    
                } catch (e) {
                    console.error('❌ Erro ao parsear body:', e);
                }
            }
        }
        
        // Chamar fetch original
        return fetchOriginal.apply(this, arguments);
    };
    
    // Corrigir função de coleta para formato esperado pela API
    const coletarOriginal = window.coletarDadosCompletos;
    window.coletarDadosCompletos = function() {
        console.log('📊 Coletando dados (DEBUG)...');
        
        const dados = {
            // CAMPOS OBRIGATÓRIOS DA API
            nome: document.getElementById('eventTitle')?.value || '',
            descricao_completa: document.getElementById('eventDescription')?.value || '', // API espera descricao_completa
            classificacao: document.getElementById('eventType')?.value || '',
            categoria: document.getElementById('eventCategory')?.value || '',
            
            // Datas
            data_inicio: formatarDataMySQL(document.getElementById('startDateTime')?.value),
            data_fim: formatarDataMySQL(document.getElementById('endDateTime')?.value),
            evento_multiplos_dias: 0, // Simplificar
            
            // Local - API espera formato específico
            tipo_local: 'presencial',
            busca_endereco: document.getElementById('address')?.value || '',
            nome_local: document.getElementById('location')?.value || '',
            endereco: document.getElementById('address')?.value || '', // API espera 'endereco'
            numero: document.getElementById('addressNumber')?.value || '',
            complemento: document.getElementById('addressComplement')?.value || '',
            bairro: document.getElementById('neighborhood')?.value || '',
            cidade: document.getElementById('city')?.value || '',
            estado: document.getElementById('state')?.value || '',
            cep: document.getElementById('cep')?.value || '',
            pais: 'Brasil',
            latitude: null,
            longitude: null,
            link_transmissao: '',
            
            // Produtor - API espera formato específico
            tipo_produtor: 'atual', // Usar produtor atual
            produtor_id: null, // Deixar API pegar da sessão
            nome_produtor: document.getElementById('producerName')?.value || '',
            nome_exibicao: document.getElementById('producerName')?.value || '',
            descricao_produtor: '',
            
            // Visibilidade
            visibilidade: 'public', // public, private, password
            senha_acesso: null,
            
            // Extras
            tem_estacionamento: document.getElementById('hasParking')?.checked ? 'sim' : 'não',
            estacionamento: document.getElementById('parkingDetails')?.value || '',
            tem_acessibilidade: document.getElementById('hasAccessibility')?.checked ? 'sim' : 'não',
            detalhes_acessibilidade: document.getElementById('accessibilityDetails')?.value || '',
            
            // Pagamento
            formas_pagamento: {
                pix: document.getElementById('acceptPix')?.checked || false,
                cartao_credito: document.getElementById('acceptCredit')?.checked || false,
                cartao_debito: document.getElementById('acceptDebit')?.checked || false,
                boleto: document.getElementById('acceptBoleto')?.checked || false
            },
            
            // Taxas
            taxa_plataforma: parseFloat(document.getElementById('taxaPlataforma')?.value) || 10,
            absorver_taxa_produtor: document.querySelector('input[name="absorverTaxa"]:checked')?.value === 'produtor',
            
            // Imagens
            imagem_principal: extrairNomeArquivo(document.getElementById('previewImage')?.src),
            imagem_banner: extrairNomeArquivo(document.getElementById('bannerPreview')?.src),
            
            // LOTES
            lotes: [],
            
            // INGRESSOS
            ingressos: []
        };
        
        // Adicionar lotes
        if (window.lotesData) {
            // Lotes por data
            if (window.lotesData.porData) {
                window.lotesData.porData.forEach((lote, index) => {
                    dados.lotes.push({
                        nome: lote.nome,
                        tipo: 'data',
                        data_inicio: formatarDataMySQL(lote.dataInicio),
                        data_fim: formatarDataMySQL(lote.dataFim),
                        publico: lote.divulgar ? 'sim' : 'não',
                        ordem: index + 1
                    });
                });
            }
            
            // Lotes por percentual
            if (window.lotesData.porPercentual) {
                const offset = dados.lotes.length;
                window.lotesData.porPercentual.forEach((lote, index) => {
                    dados.lotes.push({
                        nome: lote.nome,
                        tipo: 'percentual',
                        percentual: lote.percentual,
                        publico: lote.divulgar ? 'sim' : 'não',
                        ordem: offset + index + 1
                    });
                });
            }
        }
        
        // Adicionar ingressos
        if (window.ingressosTemporarios) {
            let ingressoIndex = 0;
            
            // Pagos
            if (window.ingressosTemporarios.pagos) {
                window.ingressosTemporarios.pagos.forEach(ing => {
                    dados.ingressos.push({
                        tipo: 'individual',
                        nome: ing.title || ing.nome,
                        descricao: ing.description || '',
                        valor: parseFloat(ing.price) || 0,
                        quantidade: parseInt(ing.quantity) || 0,
                        quantidade_por_pedido: parseInt(ing.maxQuantity) || 5,
                        meia_entrada: 'não', // Simplificar
                        lote_id: encontrarLoteId(ing.loteId, dados.lotes),
                        data_inicio_vendas: formatarDataMySQL(ing.saleStart),
                        data_fim_vendas: formatarDataMySQL(ing.saleEnd),
                        taxa_conveniencia: ing.taxaServico ? 'sim' : 'não',
                        ordem: ++ingressoIndex
                    });
                });
            }
            
            // Gratuitos
            if (window.ingressosTemporarios.gratuitos) {
                window.ingressosTemporarios.gratuitos.forEach(ing => {
                    dados.ingressos.push({
                        tipo: 'gratuito',
                        nome: ing.title || ing.nome,
                        descricao: ing.description || '',
                        valor: 0,
                        quantidade: parseInt(ing.quantity) || 0,
                        quantidade_por_pedido: parseInt(ing.maxPerPerson) || 5,
                        meia_entrada: 'não',
                        lote_id: encontrarLoteId(ing.loteId, dados.lotes),
                        data_inicio_vendas: formatarDataMySQL(ing.saleStart),
                        data_fim_vendas: formatarDataMySQL(ing.saleEnd),
                        taxa_conveniencia: 'não',
                        ordem: ++ingressoIndex
                    });
                });
            }
        }
        
        console.log('✅ DADOS FORMATADOS PARA API:', dados);
        return dados;
    };
    
    function formatarDataMySQL(dateTimeLocal) {
        if (!dateTimeLocal) return null;
        const date = new Date(dateTimeLocal);
        if (isNaN(date.getTime())) return null;
        
        const ano = date.getFullYear();
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const dia = String(date.getDate()).padStart(2, '0');
        const hora = String(date.getHours()).padStart(2, '0');
        const minuto = String(date.getMinutes()).padStart(2, '0');
        
        return `${ano}-${mes}-${dia} ${hora}:${minuto}:00`;
    }
    
    function extrairNomeArquivo(url) {
        if (!url || url.includes('placeholder') || url.includes('data:image')) return '';
        const partes = url.split('/');
        return partes[partes.length - 1];
    }
    
    function encontrarLoteId(loteIdOriginal, lotesArray) {
        if (!loteIdOriginal || !lotesArray || lotesArray.length === 0) return 1;
        
        // Por enquanto, retornar índice do primeiro lote + 1 (IDs começam em 1)
        return 1;
    }
    
    console.log('✅ DEBUG DE ENVIO CONFIGURADO!');
})();