// Correção definitiva para publicação do evento com suporte a lotes e combos
(function() {
    console.log('🔧 Aplicando correção para publicação de eventos...');
    
    // Garantir que a função publishEvent existe e funciona corretamente
    window.publishEvent = async function() {
        console.log('📤 Iniciando publicação do evento...');
        
        try {
            // Verificar se estamos no step correto (8)
            const currentStep = window.currentStep || 8;
            
            // Validar o step atual
            if (typeof window.validateStep === 'function') {
                if (!window.validateStep(currentStep)) {
                    console.log('❌ Validação do step falhou');
                    return false;
                }
            }
            
            // Obter botão de publicar
            const publishBtn = document.querySelector('.btn-publish');
            if (publishBtn) {
                publishBtn.textContent = 'Publicando evento...';
                publishBtn.disabled = true;
            }
            
            // Chamar a função de envio
            let sucesso = false;
            if (typeof window.enviarEventoParaAPI === 'function') {
                sucesso = await window.enviarEventoParaAPI();
            } else {
                console.error('❌ Função enviarEventoParaAPI não encontrada');
                // Tentar criar e enviar manualmente
                sucesso = await enviarEventoManualmente();
            }
            
            // Restaurar botão se falhou
            if (!sucesso && publishBtn) {
                publishBtn.textContent = '✓ Publicar evento';
                publishBtn.disabled = false;
            }
            
            return sucesso;
            
        } catch (error) {
            console.error('❌ Erro ao publicar:', error);
            alert('Erro ao publicar evento: ' + error.message);
            
            // Restaurar botão
            const publishBtn = document.querySelector('.btn-publish');
            if (publishBtn) {
                publishBtn.textContent = '✓ Publicar evento';
                publishBtn.disabled = false;
            }
            
            return false;
        }
    };
    
    // Função para coletar dados incluindo lotes e combos
    window.coletarDadosCompletos = function() {
        console.log('📋 Coletando dados completos do formulário...');
        
        // 1. INFORMAÇÕES BÁSICAS
        const informacoesBasicas = {
            nome: document.getElementById('eventName')?.value || '',
            classificacao: document.getElementById('classification')?.value || '',
            categoria: document.getElementById('category')?.value || '',
            imagem_capa: document.querySelector('#capaPreviewContainer img')?.src || '',
            // Adicionar imagens faltantes
            logo_evento: document.querySelector('#logoPreviewContainer img')?.src || '',
            imagem_fundo: document.querySelector('#fundoPreviewMain img')?.src || '',
            cor_fundo: document.getElementById('corFundo')?.value || '#000000'
        };
        
        // 2. DATA E HORÁRIO
        const dataHorario = {
            data_inicio: document.getElementById('startDateTime')?.value || '',
            data_fim: document.getElementById('endDateTime')?.value || '',
            evento_multiplos_dias: document.getElementById('multiDaySwitch')?.classList.contains('active') || false
        };
        
        // 3. DESCRIÇÃO
        const descricao = {
            descricao_completa: document.getElementById('eventDescription')?.innerHTML || '',
            descricao_texto: document.getElementById('eventDescription')?.textContent || ''
        };
        
        // 4. LOCALIZAÇÃO
        const isPresencial = document.getElementById('locationTypeSwitch')?.classList.contains('active');
        const localizacao = {
            tipo_local: isPresencial ? 'presencial' : 'online',
            busca_endereco: document.getElementById('addressSearch')?.value || '',
            nome_local: document.getElementById('venueName')?.value || '',
            endereco: document.getElementById('street')?.value || '', // Corrigido
            numero: document.getElementById('number')?.value || '', // Corrigido
            complemento: document.getElementById('complement')?.value || '', // Corrigido
            bairro: document.getElementById('neighborhood')?.value || '',
            cidade: document.getElementById('city')?.value || '',
            estado: document.getElementById('state')?.value || '',
            cep: document.getElementById('cep')?.value || '', // Corrigido
            pais: document.getElementById('country')?.value || 'Brasil',
            latitude: window.selectedLocation?.lat || '',
            longitude: window.selectedLocation?.lng || '',
            link_transmissao: document.getElementById('streamingLink')?.value || '',
            instrucoes_acesso: document.getElementById('accessInstructions')?.value || ''
        };
        
        // 5. LOTES (NOVO!)
        const lotes = coletarDadosLotes();
        
        // 6. INGRESSOS (ATUALIZADO COM LOTES)
        const ingressos = coletarDadosIngressosComLotes();
        
        // 7. COMBOS (NOVO!)
        const combos = coletarDadosCombos();
        
        // 8. SOBRE O PRODUTOR
        const produtor = {
            tipo_produtor: document.getElementById('producer')?.value || 'current',
            nome_produtor: document.getElementById('producerName')?.value || '',
            nome_exibicao: document.getElementById('displayName')?.value || '',
            descricao_produtor: document.getElementById('producerDescription')?.innerHTML || ''
        };
        
        // 9. CONFIGURAÇÕES
        const visibilidade = obterValorRadioSelecionado();
        const configuracoes = {
            visibilidade: visibilidade,
            senha: visibilidade === 'password' ? document.getElementById('eventPassword')?.value || '' : '',
            aceita_termos: document.getElementById('termsCheckbox')?.checked || false,
            aceita_privacidade: document.getElementById('privacyCheckbox')?.checked || false
        };
        
        // 10. DADOS DE ACEITE
        const dadosAceite = {
            usuario_id: window.usuarioId || '',
            usuario_nome: window.usuarioNome || '',
            data_hora: new Date().toISOString(),
            ip: window.userIP || '',
            user_agent: navigator.userAgent,
            plataforma: navigator.platform,
            idioma: navigator.language,
            resolucao: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        
        return {
            ...informacoesBasicas,
            ...dataHorario,
            ...descricao,
            ...localizacao,
            lotes: lotes,
            ingressos: ingressos,
            combos: combos,
            ...produtor,
            ...configuracoes,
            dados_aceite: dadosAceite
        };
    };
    
    // Função para coletar dados dos lotes
    function coletarDadosLotes() {
        const lotes = [];
        
        console.log('🔍 Coletando lotes...');
        
        // Lotes por data
        const lotesPorData = document.querySelectorAll('#lotesPorDataList .lote-item');
        console.log(`📅 Lotes por data encontrados: ${lotesPorData.length}`);
        lotesPorData.forEach((lote, index) => {
            const id = lote.dataset.id;
            const nome = lote.querySelector('.lote-item-name')?.textContent || '';
            const detalhes = lote.querySelector('.lote-item-details')?.textContent || '';
            
            // Extrair datas do texto
            const dateMatch = detalhes.match(/(\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}) até (\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2})/);
            
            const lotePorData = {
                id: id,
                nome: nome,
                tipo: 'por data', // Ajustado para corresponder ao banco
                data_inicio: dateMatch ? convertDateFormatToISO(dateMatch[1]) : '',
                data_fim: dateMatch ? convertDateFormatToISO(dateMatch[2]) : '',
                percentual_venda: null,
                divulgar_criterio: lote.querySelector('input[type="checkbox"]')?.checked ? 1 : 0
            };
            
            console.log('Lote por data:', lotePorData);
            lotes.push(lotePorData);
        });
        
        // Lotes por percentual/quantidade
        const lotesPorPercentual = document.querySelectorAll('#lotesPorPercentualList .lote-item');
        console.log(`📊 Lotes por percentual encontrados: ${lotesPorPercentual.length}`);
        lotesPorPercentual.forEach((lote, index) => {
            const id = lote.dataset.id;
            const nome = lote.querySelector('.lote-item-name')?.textContent || '';
            const percentual = lote.querySelector('.lote-item-percentage')?.textContent?.replace('%', '') || '0';
            const quantidade = lote.querySelector('.lote-item-quantity')?.textContent?.match(/\d+/)?.[0] || '0';
            
            const lotePorPercentual = {
                id: id,
                nome: nome,
                tipo: 'por quantidade', // Ajustado para corresponder ao banco
                data_inicio: null,
                data_fim: null,
                percentual_venda: parseInt(percentual),
                divulgar_criterio: lote.querySelector('input[type="checkbox"]')?.checked ? 1 : 0
            };
            
            console.log('Lote por percentual:', lotePorPercentual);
            lotes.push(lotePorPercentual);
        });
        
        return lotes;
    }
    
    // Função para coletar ingressos com referência aos lotes
    function coletarDadosIngressosComLotes() {
        const ingressos = [];
        const ticketItems = document.querySelectorAll('.ticket-item');
        
        ticketItems.forEach((item, index) => {
            const ticketData = item.ticketData || {};
            const isCombo = item.querySelector('.ticket-type-badge.combo') !== null;
            
            // Pular combos, eles serão tratados separadamente
            if (isCombo) return;
            
            ingressos.push({
                id: item.dataset.ticketId || `temp_${index}`,
                titulo: ticketData.title || ticketData.name || '',
                descricao: ticketData.description || '',
                tipo: ticketData.type || 'paid',
                preco: parseFloat(ticketData.price) || 0,
                quantidade_total: parseInt(ticketData.quantity) || 0,
                quantidade_por_pessoa_min: parseInt(ticketData.minQuantity) || 1,
                quantidade_por_pessoa_max: parseInt(ticketData.maxQuantity) || 5,
                lote_id: item.dataset.loteId || ticketData.loteId || null,
                inicio_vendas: ticketData.saleStart || '',
                fim_vendas: ticketData.saleEnd || '',
                cobra_taxa: ticketData.serviceTax || false,
                valor_taxa: ticketData.taxAmount || 0
            });
        });
        
        return ingressos;
    }
    
    // Função para coletar dados dos combos
    function coletarDadosCombos() {
        const combos = [];
        const comboItems = document.querySelectorAll('.ticket-item .ticket-type-badge.combo');
        
        comboItems.forEach(badge => {
            const item = badge.closest('.ticket-item');
            if (!item) return;
            
            const comboData = item.ticketData || {};
            
            // Debug dos itens do combo
            console.log('Combo data:', comboData);
            console.log('Itens do combo:', comboData.items || comboData.comboData?.itens || comboData.conteudo_combo);
            
            // Obter os itens do combo de forma correta
            let itensCombo = [];
            if (comboData.comboData && comboData.comboData.itens) {
                // Estrutura nova onde está em comboData.comboData.itens
                itensCombo = comboData.comboData.itens.map(item => ({
                    ticket_id: item.ingresso_index || item.ticket_id,
                    quantidade: item.quantidade
                }));
            } else if (comboData.items) {
                // Estrutura antiga
                itensCombo = comboData.items;
            } else if (comboData.conteudo_combo) {
                // Outra estrutura possível
                itensCombo = comboData.conteudo_combo;
            }
            
            console.log('Itens processados:', itensCombo);
            
            combos.push({
                id: item.dataset.ticketId || '',
                titulo: comboData.title || comboData.name || '',
                descricao: comboData.description || '',
                preco: parseFloat(comboData.price) || 0,
                quantidade_total: parseInt(comboData.quantity) || 0,
                lote_id: item.dataset.loteId || comboData.loteId || null,
                inicio_vendas: comboData.saleStart || '',
                fim_vendas: comboData.saleEnd || '',
                itens: itensCombo
            });
        });
        
        return combos;
    }
    
    // Função auxiliar para converter data
    function convertDateFormatToISO(dateStr) {
        // Formato: "23/07/2025, 23:26" para ISO
        const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{2}):(\d{2})/);
        if (match) {
            const [_, dia, mes, ano, hora, minuto] = match;
            return `${ano}-${mes}-${dia} ${hora}:${minuto}:00`;
        }
        return dateStr;
    }
    
    // Função auxiliar para obter valor do radio
    function obterValorRadioSelecionado() {
        const radios = document.querySelectorAll('.radio.checked');
        if (radios.length > 0) {
            return radios[0].dataset.value || 'public';
        }
        return 'public';
    }
    
    // Função de fallback para enviar manualmente
    async function enviarEventoManualmente() {
        try {
            console.log('📤 Tentando envio manual...');
            
            const dados = window.coletarDadosCompletos();
            console.log('📋 Dados coletados:', dados);
            console.log('📦 Lotes:', dados.lotes);
            console.log('🎫 Ingressos:', dados.ingressos);
            console.log('🎁 Combos:', dados.combos);
            
            // Validação básica
            if (!dados.nome || !dados.data_inicio) {
                throw new Error('Dados obrigatórios faltando');
            }
            
            // Enviar para API
            const response = await fetch('/produtor/criaeventoapi.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(dados),
                credentials: 'same-origin' // IMPORTANTE: incluir cookies de sessão
            });
            
            console.log('📡 Status da resposta:', response.status);
            console.log('📡 Headers:', response.headers);
            
            const resultado = await response.json();
            console.log('📡 Resultado:', resultado);
            
            if (resultado.success) {
                // Limpar dados do wizard da sessão
                console.log('🧹 Limpando dados do wizard...');
                
                // Remover cookies do wizard
                document.cookie = 'eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'lotesData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'ingressosData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'ticketsData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'temporaryTickets=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                
                // Limpar localStorage se houver dados armazenados
                if (typeof(Storage) !== "undefined") {
                    localStorage.removeItem('eventoWizard');
                    localStorage.removeItem('lotesData');
                    localStorage.removeItem('ingressosData');
                    localStorage.removeItem('uploadedImages');
                    localStorage.removeItem('ticketsData');
                    localStorage.removeItem('temporaryTickets');
                    localStorage.removeItem('combos');
                    localStorage.removeItem('comboItems');
                }
                
                // Limpar variáveis globais
                if (window.uploadedImages) {
                    window.uploadedImages = {};
                }
                if (window.lotesManager) {
                    window.lotesManager.clear && window.lotesManager.clear();
                }
                if (window.temporaryTickets) {
                    window.temporaryTickets = [];
                }
                if (window.comboItems) {
                    window.comboItems = [];
                }
                if (window.ticketsData) {
                    window.ticketsData = [];
                }
                if (window.allTickets) {
                    window.allTickets = [];
                }
                
                // Limpar sessionStorage também
                if (typeof(sessionStorage) !== "undefined") {
                    sessionStorage.clear();
                }
                
                // Redirecionar para página de sucesso
                console.log('✅ Evento criado com sucesso! ID:', resultado.data.evento_id);
                window.location.href = `/produtor/evento-publicado.php?eventoid=${resultado.data.evento_id}`;
                return true;
            } else {
                throw new Error(resultado.message || 'Erro ao publicar');
            }
            
        } catch (error) {
            console.error('❌ Erro no envio manual:', error);
            throw error;
        }
    }
    
    // Substituir a função coletarDadosFormulario se existir
    if (!window.coletarDadosFormulario) {
        window.coletarDadosFormulario = window.coletarDadosCompletos;
    }
    
    console.log('✅ Sistema de publicação atualizado com suporte a lotes e combos!');
    
})();