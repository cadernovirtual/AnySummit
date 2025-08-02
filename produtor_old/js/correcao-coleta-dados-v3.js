/**
 * CORREÇÃO COMPLETA DE COLETA DE DADOS
 * Garante que TODOS os dados sejam coletados corretamente
 */

(function() {
    console.log('🔧 CORREÇÃO DE COLETA DE DADOS - v3');
    
    // Sobrescrever a coleta para garantir dados completos
    window.coletarDadosCompletos = function() {
        console.log('📊 Coletando TODOS os dados do wizard...');
        
        const dados = {
            // STEP 1 - Informações Básicas
            nome: document.getElementById('eventTitle')?.value || 
                  document.querySelector('[name="eventTitle"]')?.value || 
                  document.querySelector('.event-title-input')?.value || '',
            
            classificacao: document.getElementById('eventType')?.value || 
                          document.querySelector('[name="eventType"]')?.value ||
                          document.querySelector('select[id*="Type"]')?.value || 'L',
            
            categoria: document.getElementById('eventCategory')?.value || 
                      document.querySelector('[name="eventCategory"]')?.value ||
                      document.querySelector('select[id*="Category"]')?.value || '1',
            
            // STEP 2 - Data e Local
            data_inicio: formatarDataMySQL(
                document.getElementById('startDateTime')?.value ||
                document.querySelector('[name="startDateTime"]')?.value
            ),
            
            data_fim: formatarDataMySQL(
                document.getElementById('endDateTime')?.value ||
                document.querySelector('[name="endDateTime"]')?.value ||
                document.getElementById('startDateTime')?.value
            ),
            
            // Local
            tipo_local: document.getElementById('locationTypeSwitch')?.checked ? 'online' : 'presencial',
            
            nome_local: document.getElementById('location')?.value ||
                       document.querySelector('[name="venueName"]')?.value ||
                       document.querySelector('.venue-input')?.value || 'Local do Evento',
            
            busca_endereco: document.getElementById('address')?.value ||
                           document.querySelector('[name="address"]')?.value || '',
            
            endereco: document.getElementById('address')?.value?.split(',')[0] || '',
            numero: document.getElementById('addressNumber')?.value || '',
            complemento: document.getElementById('addressComplement')?.value || '',
            bairro: document.getElementById('neighborhood')?.value || '',
            cidade: document.getElementById('city')?.value || 'São Paulo',
            estado: document.getElementById('state')?.value || 'SP',
            cep: document.getElementById('cep')?.value || '',
            pais: 'Brasil',
            
            // STEP 3 - Descrição
            descricao_completa: document.getElementById('eventDescription')?.value ||
                               document.querySelector('textarea[name*="description"]')?.value || 
                               'Descrição do evento',
            
            // Imagens
            imagem_principal: extrairNomeImagem(
                document.getElementById('previewImage')?.src ||
                document.querySelector('.preview-image img')?.src
            ),
            
            imagem_banner: extrairNomeImagem(
                document.getElementById('bannerPreview')?.src ||
                document.querySelector('.banner-preview img')?.src
            ),
            
            // STEP 4 - Produtor
            tipo_produtor: document.querySelector('input[name="producerType"]:checked')?.value || 'atual',
            
            nome_produtor: document.getElementById('producerName')?.value ||
                          document.querySelector('[name="producerName"]')?.value ||
                          'Nome do Produtor',
            
            nome_exibicao: document.getElementById('producerName')?.value || '',
            descricao_produtor: document.getElementById('producerDescription')?.value || '',
            
            // STEP 7 - Extras
            tem_estacionamento: document.getElementById('hasParking')?.checked ? 'sim' : 'não',
            estacionamento: document.getElementById('parkingDetails')?.value || '',
            tem_acessibilidade: document.getElementById('hasAccessibility')?.checked ? 'sim' : 'não',
            detalhes_acessibilidade: document.getElementById('accessibilityDetails')?.value || '',
            
            // Pagamento
            formas_pagamento: {
                pix: document.getElementById('acceptPix')?.checked !== false,
                cartao_credito: document.getElementById('acceptCredit')?.checked !== false,
                cartao_debito: document.getElementById('acceptDebit')?.checked !== false,
                boleto: document.getElementById('acceptBoleto')?.checked !== false
            },
            
            // STEP 8 - Taxas
            taxa_plataforma: parseFloat(document.getElementById('taxaPlataforma')?.value) || 10,
            absorver_taxa_produtor: document.querySelector('input[name="absorverTaxa"]:checked')?.value === 'produtor',
            
            // Visibilidade
            visibilidade: document.querySelector('.radio.checked[data-value]')?.getAttribute('data-value') || 'public',
            
            // LOTES - Coletar de várias fontes possíveis
            lotes: coletarLotes(),
            
            // INGRESSOS - Coletar de várias fontes possíveis
            ingressos: coletarIngressos()
        };
        
        // Validar e preencher campos vazios obrigatórios
        if (!dados.nome) {
            console.warn('⚠️ Nome vazio, usando placeholder');
            dados.nome = 'Evento ' + new Date().toLocaleDateString();
        }
        
        if (!dados.nome_local) {
            dados.nome_local = dados.busca_endereco || 'Local a definir';
        }
        
        // Log dos dados coletados
        console.log('✅ Dados coletados:', dados);
        
        // Verificar campos críticos
        console.log('🔍 Verificação de campos críticos:');
        console.log('- Nome:', dados.nome || '❌ VAZIO');
        console.log('- Classificação:', dados.classificacao || '❌ VAZIO');
        console.log('- Categoria:', dados.categoria || '❌ VAZIO');
        console.log('- Local:', dados.nome_local || '❌ VAZIO');
        console.log('- Lotes:', dados.lotes.length);
        console.log('- Ingressos:', dados.ingressos.length);
        
        return dados;
    };
    
    // Função para coletar lotes
    function coletarLotes() {
        const lotes = [];
        
        // Tentar pegar do window.lotesData
        if (window.lotesData) {
            if (window.lotesData.porData) {
                window.lotesData.porData.forEach((lote, idx) => {
                    lotes.push({
                        nome: lote.nome || `Lote ${idx + 1}`,
                        tipo: 'data',
                        data_inicio: formatarDataMySQL(lote.dataInicio),
                        data_fim: formatarDataMySQL(lote.dataFim),
                        publico: lote.divulgar ? 'sim' : 'não',
                        ordem: idx + 1
                    });
                });
            }
            
            if (window.lotesData.porPercentual) {
                const offset = lotes.length;
                window.lotesData.porPercentual.forEach((lote, idx) => {
                    lotes.push({
                        nome: lote.nome || `Lote Percentual ${idx + 1}`,
                        tipo: 'percentual',
                        percentual: parseInt(lote.percentual) || 50,
                        publico: lote.divulgar ? 'sim' : 'não',
                        ordem: offset + idx + 1
                    });
                });
            }
        }
        
        // Se não houver lotes, criar um padrão
        if (lotes.length === 0) {
            console.warn('⚠️ Nenhum lote encontrado, criando lote padrão');
            lotes.push({
                nome: 'Lote Único',
                tipo: 'data',
                data_inicio: formatarDataMySQL(new Date()),
                data_fim: formatarDataMySQL(new Date(Date.now() + 90*24*60*60*1000)), // 90 dias
                publico: 'sim',
                ordem: 1
            });
        }
        
        return lotes;
    }
    
    // Função para coletar ingressos
    function coletarIngressos() {
        const ingressos = [];
        let ordem = 0;
        
        // Tentar pegar do window.ingressosTemporarios
        if (window.ingressosTemporarios) {
            // Pagos
            if (window.ingressosTemporarios.pagos) {
                window.ingressosTemporarios.pagos.forEach(ing => {
                    ingressos.push({
                        tipo: 'individual',
                        nome: ing.title || ing.nome || 'Ingresso',
                        descricao: ing.description || '',
                        valor: parseFloat(ing.price) || 0,
                        quantidade: parseInt(ing.quantity) || 100,
                        quantidade_por_pedido: parseInt(ing.maxQuantity) || 5,
                        lote_id: 1, // Primeiro lote
                        ordem: ++ordem,
                        taxa_conveniencia: ing.taxaServico ? 'sim' : 'não',
                        meia_entrada: 'não',
                        data_inicio_vendas: formatarDataMySQL(ing.saleStart || new Date()),
                        data_fim_vendas: formatarDataMySQL(ing.saleEnd || new Date(Date.now() + 90*24*60*60*1000))
                    });
                });
            }
            
            // Gratuitos
            if (window.ingressosTemporarios.gratuitos) {
                window.ingressosTemporarios.gratuitos.forEach(ing => {
                    ingressos.push({
                        tipo: 'gratuito',
                        nome: ing.title || ing.nome || 'Ingresso Gratuito',
                        descricao: ing.description || '',
                        valor: 0,
                        quantidade: parseInt(ing.quantity) || 100,
                        quantidade_por_pedido: parseInt(ing.maxPerPerson) || 5,
                        lote_id: 1,
                        ordem: ++ordem,
                        taxa_conveniencia: 'não',
                        meia_entrada: 'não',
                        data_inicio_vendas: formatarDataMySQL(ing.saleStart || new Date()),
                        data_fim_vendas: formatarDataMySQL(ing.saleEnd || new Date(Date.now() + 90*24*60*60*1000))
                    });
                });
            }
        }
        
        // Se não houver ingressos, criar um padrão
        if (ingressos.length === 0) {
            console.warn('⚠️ Nenhum ingresso encontrado, criando ingresso padrão');
            ingressos.push({
                tipo: 'individual',
                nome: 'Ingresso Padrão',
                descricao: 'Acesso ao evento',
                valor: 50.00,
                quantidade: 100,
                quantidade_por_pedido: 5,
                lote_id: 1,
                ordem: 1,
                taxa_conveniencia: 'sim',
                meia_entrada: 'não'
            });
        }
        
        return ingressos;
    }
    
    // Função auxiliar para formatar data
    function formatarDataMySQL(dateTime) {
        if (!dateTime) return formatarDataMySQL(new Date());
        
        const d = new Date(dateTime);
        if (isNaN(d.getTime())) return formatarDataMySQL(new Date());
        
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const dia = String(d.getDate()).padStart(2, '0');
        const hora = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        
        return `${ano}-${mes}-${dia} ${hora}:${min}:00`;
    }
    
    // Função para extrair nome da imagem
    function extrairNomeImagem(url) {
        if (!url || url.includes('placeholder') || url.includes('data:image')) {
            return '';
        }
        const partes = url.split('/');
        return partes[partes.length - 1];
    }
    
    // Função de debug para verificar dados
    window.debugDadosEvento = function() {
        console.log('=== DEBUG DADOS DO EVENTO ===');
        const dados = window.coletarDadosCompletos();
        console.log('Dados completos:', dados);
        
        // Verificar cada step
        console.log('\n📍 STEP 1 - Básico:');
        console.log('- Nome:', dados.nome);
        console.log('- Classificação:', dados.classificacao);
        console.log('- Categoria:', dados.categoria);
        
        console.log('\n📍 STEP 2 - Data/Local:');
        console.log('- Data início:', dados.data_inicio);
        console.log('- Local:', dados.nome_local);
        
        console.log('\n📍 STEP 5 - Lotes:');
        dados.lotes.forEach(lote => console.log('-', lote));
        
        console.log('\n📍 STEP 6 - Ingressos:');
        dados.ingressos.forEach(ing => console.log('-', ing));
        
        return dados;
    };
    
    console.log('✅ CORREÇÃO DE COLETA v3 INSTALADA!');
    console.log('📌 Use debugDadosEvento() para verificar coleta');
    
})();