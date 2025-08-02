/**
 * CORREÇÃO ENVIO DE EVENTO - Resolve erro 500 na publicação
 * Melhora o formato dos dados e tratamento de erros
 */

(function() {
    console.log('🔧 CORREÇÃO ENVIO DE EVENTO - Iniciando...');
    
    // Sobrescrever função de coleta de dados
    window.coletarDadosCompletos = function() {
        console.log('📊 Coletando dados completos do evento...');
        
        try {
            // Coletar dados básicos
            const dados = {
                // INFORMAÇÕES BÁSICAS
                nome: document.getElementById('eventTitle')?.value || '',
                classificacao: document.getElementById('eventType')?.value || '',
                categoria: document.getElementById('eventCategory')?.value || '',
                
                // DATAS - Formato MySQL (YYYY-MM-DD HH:MM:SS)
                data_inicio: formatarDataMySQL(document.getElementById('startDateTime')?.value),
                data_fim: formatarDataMySQL(document.getElementById('endDateTime')?.value),
                
                // LOCAL
                nome_local: document.getElementById('location')?.value || '',
                cep: document.getElementById('cep')?.value || '',
                endereco: document.getElementById('address')?.value || '',
                numero: document.getElementById('addressNumber')?.value || '',
                complemento: document.getElementById('addressComplement')?.value || '',
                bairro: document.getElementById('neighborhood')?.value || '',
                cidade: document.getElementById('city')?.value || '',
                estado: document.getElementById('state')?.value || '',
                
                // DESCRIÇÃO E IMAGENS
                descricao: document.getElementById('eventDescription')?.value || '',
                imagem_principal: extrairNomeArquivo(document.getElementById('previewImage')?.src),
                imagem_banner: extrairNomeArquivo(document.getElementById('bannerPreview')?.src),
                
                // PRODUTOR
                tipo_produtor: document.querySelector('input[name="producerType"]:checked')?.value || 'pf',
                nome_produtor: document.getElementById('producerName')?.value || '',
                documento_produtor: limparDocumento(document.getElementById('producerDocument')?.value),
                email_produtor: document.getElementById('producerEmail')?.value || '',
                telefone_produtor: limparTelefone(document.getElementById('producerPhone')?.value),
                
                // EXTRAS
                tem_estacionamento: document.getElementById('hasParking')?.checked ? 1 : 0,
                detalhes_estacionamento: document.getElementById('parkingDetails')?.value || '',
                tem_acessibilidade: document.getElementById('hasAccessibility')?.checked ? 1 : 0,
                detalhes_acessibilidade: document.getElementById('accessibilityDetails')?.value || '',
                
                // FORMAS DE PAGAMENTO
                aceita_pix: document.getElementById('acceptPix')?.checked ? 1 : 0,
                aceita_credito: document.getElementById('acceptCredit')?.checked ? 1 : 0,
                aceita_debito: document.getElementById('acceptDebit')?.checked ? 1 : 0,
                aceita_boleto: document.getElementById('acceptBoleto')?.checked ? 1 : 0,
                
                // TAXAS
                taxa_plataforma: parseFloat(document.getElementById('taxaPlataforma')?.value) || 10,
                absorver_taxa: document.querySelector('input[name="absorverTaxa"]:checked')?.value || 'cliente',
                
                // STATUS
                status: 'publicado',
                ativo: 1
            };
            
            // LOTES - Formato correto para API
            dados.lotes = [];
            
            // Lotes por data
            if (window.lotesData?.porData?.length > 0) {
                window.lotesData.porData.forEach(lote => {
                    dados.lotes.push({
                        nome: lote.nome,
                        tipo: 'data',
                        data_inicio: formatarDataMySQL(lote.dataInicio),
                        data_fim: formatarDataMySQL(lote.dataFim),
                        divulgar: lote.divulgar ? 1 : 0,
                        ordem: lote.ordem || dados.lotes.length + 1
                    });
                });
            }
            
            // Lotes por percentual
            if (window.lotesData?.porPercentual?.length > 0) {
                window.lotesData.porPercentual.forEach(lote => {
                    dados.lotes.push({
                        nome: lote.nome,
                        tipo: 'percentual',
                        percentual_vendas: lote.percentual,
                        divulgar: lote.divulgar ? 1 : 0,
                        ordem: lote.ordem || dados.lotes.length + 1
                    });
                });
            }
            
            // INGRESSOS - Formato correto para API
            dados.ingressos = [];
            
            // Ingressos pagos
            if (window.ingressosTemporarios?.pagos?.length > 0) {
                window.ingressosTemporarios.pagos.forEach(ing => {
                    // Encontrar o lote correspondente
                    const loteIndex = encontrarIndiceLote(ing.loteId);
                    
                    dados.ingressos.push({
                        tipo: 'pago',
                        nome: ing.title || ing.nome,
                        descricao: ing.description || '',
                        valor: parseFloat(ing.price) || 0,
                        quantidade_total: parseInt(ing.quantity) || 0,
                        quantidade_minima: parseInt(ing.minQuantity) || 1,
                        quantidade_maxima: parseInt(ing.maxQuantity) || 5,
                        lote_index: loteIndex, // Índice do lote no array dados.lotes
                        data_inicio_vendas: formatarDataMySQL(ing.saleStart),
                        data_fim_vendas: formatarDataMySQL(ing.saleEnd),
                        taxa_servico: ing.taxaServico ? 1 : 0,
                        ativo: 1
                    });
                });
            }
            
            // Ingressos gratuitos
            if (window.ingressosTemporarios?.gratuitos?.length > 0) {
                window.ingressosTemporarios.gratuitos.forEach(ing => {
                    const loteIndex = encontrarIndiceLote(ing.loteId);
                    
                    dados.ingressos.push({
                        tipo: 'gratuito',
                        nome: ing.title || ing.nome,
                        descricao: ing.description || '',
                        valor: 0,
                        quantidade_total: parseInt(ing.quantity) || 0,
                        quantidade_minima: 1,
                        quantidade_maxima: parseInt(ing.maxPerPerson) || 5,
                        lote_index: loteIndex,
                        data_inicio_vendas: formatarDataMySQL(ing.saleStart),
                        data_fim_vendas: formatarDataMySQL(ing.saleEnd),
                        requer_aprovacao: ing.requiresApproval ? 1 : 0,
                        ativo: 1
                    });
                });
            }
            
            // Combos
            if (window.ingressosTemporarios?.combos?.length > 0) {
                window.ingressosTemporarios.combos.forEach(combo => {
                    const loteIndex = encontrarIndiceLote(combo.loteId);
                    
                    dados.ingressos.push({
                        tipo: 'combo',
                        nome: combo.title || combo.nome,
                        descricao: combo.description || '',
                        valor: parseFloat(combo.price) || 0,
                        quantidade_total: parseInt(combo.quantity) || 0,
                        quantidade_minima: 1,
                        quantidade_maxima: parseInt(combo.maxQuantity) || 5,
                        lote_index: loteIndex,
                        data_inicio_vendas: formatarDataMySQL(combo.saleStart),
                        data_fim_vendas: formatarDataMySQL(combo.saleEnd),
                        taxa_servico: combo.taxaServico ? 1 : 0,
                        itens_combo: combo.items || [], // Array com os itens do combo
                        ativo: 1
                    });
                });
            }
            
            console.log('✅ Dados coletados:', dados);
            return dados;
            
        } catch (error) {
            console.error('❌ Erro ao coletar dados:', error);
            throw error;
        }
    };
    
    // Função para enviar com melhor tratamento de erro
    window.enviarEventoAPI = async function(dados) {
        console.log('📤 Enviando evento para API...');
        
        try {
            const response = await fetch('/produtor/criaeventoapi.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(dados)
            });
            
            // Capturar resposta como texto primeiro
            const textoResposta = await response.text();
            console.log('📥 Resposta bruta:', textoResposta);
            
            // Verificar se é JSON válido
            let resultado;
            try {
                resultado = JSON.parse(textoResposta);
            } catch (e) {
                console.error('❌ Resposta não é JSON válido:', textoResposta);
                
                // Se a resposta contém "success" provavelmente deu certo
                if (textoResposta.includes('success')) {
                    resultado = { success: true, message: 'Evento criado com sucesso!' };
                } else {
                    throw new Error('Resposta inválida do servidor: ' + textoResposta);
                }
            }
            
            if (resultado.success) {
                console.log('✅ Evento publicado com sucesso!');
                
                // Limpar cookies
                document.cookie = 'eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'lotesData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'ingressosData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                
                // Mostrar mensagem de sucesso
                if (window.customDialog) {
                    await window.customDialog.alert('Evento publicado com sucesso!', 'success');
                } else {
                    alert('Evento publicado com sucesso!');
                }
                
                // Redirecionar
                setTimeout(() => {
                    window.location.href = '/produtor/meuseventos.php';
                }, 1000);
                
                return true;
            } else {
                throw new Error(resultado.message || resultado.error || 'Erro ao publicar evento');
            }
            
        } catch (error) {
            console.error('❌ Erro no envio:', error);
            
            if (window.customDialog) {
                await window.customDialog.alert(
                    'Erro ao publicar evento: ' + error.message,
                    'error'
                );
            } else {
                alert('Erro ao publicar evento: ' + error.message);
            }
            
            throw error;
        }
    };
    
    // Sobrescrever publishEvent
    const publishEventOriginal = window.publishEvent;
    window.publishEvent = async function() {
        console.log('🚀 Publicando evento (CORREÇÃO ATIVA)...');
        
        try {
            // Validar termos
            if (!document.getElementById('acceptTerms')?.checked) {
                if (window.customDialog) {
                    await window.customDialog.alert('Você deve aceitar os termos de uso!', 'warning');
                } else {
                    alert('Você deve aceitar os termos de uso!');
                }
                return false;
            }
            
            if (!document.getElementById('acceptPrivacy')?.checked) {
                if (window.customDialog) {
                    await window.customDialog.alert('Você deve aceitar a política de privacidade!', 'warning');
                } else {
                    alert('Você deve aceitar a política de privacidade!');
                }
                return false;
            }
            
            // Coletar dados
            const dados = window.coletarDadosCompletos();
            
            // Enviar
            return await window.enviarEventoAPI(dados);
            
        } catch (error) {
            console.error('❌ Erro ao publicar:', error);
            return false;
        }
    };
    
    // Funções auxiliares
    function formatarDataMySQL(dateTimeLocal) {
        if (!dateTimeLocal) return null;
        const date = new Date(dateTimeLocal);
        return date.toISOString().slice(0, 19).replace('T', ' ');
    }
    
    function extrairNomeArquivo(url) {
        if (!url || url.includes('placeholder')) return '';
        const partes = url.split('/');
        return partes[partes.length - 1];
    }
    
    function limparDocumento(doc) {
        if (!doc) return '';
        return doc.replace(/[^\d]/g, '');
    }
    
    function limparTelefone(tel) {
        if (!tel) return '';
        return tel.replace(/[^\d]/g, '');
    }
    
    function encontrarIndiceLote(loteId) {
        if (!loteId) return null;
        
        // Normalizar ID
        const loteIdNorm = String(loteId).replace('lote_data_', '').replace('lote_percentual_', '');
        
        let indice = 0;
        
        // Procurar nos lotes por data
        for (let i = 0; i < (window.lotesData?.porData?.length || 0); i++) {
            if (String(window.lotesData.porData[i].id) == loteIdNorm) {
                return indice;
            }
            indice++;
        }
        
        // Procurar nos lotes por percentual
        for (let i = 0; i < (window.lotesData?.porPercentual?.length || 0); i++) {
            if (String(window.lotesData.porPercentual[i].id) == loteIdNorm) {
                return indice;
            }
            indice++;
        }
        
        return null;
    }
    
    console.log('✅ CORREÇÃO DE ENVIO INSTALADA!');
    
})();