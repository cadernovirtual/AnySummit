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
            imagem_capa: document.getElementById('imagePreview')?.src || ''
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
            endereco: document.getElementById('address')?.value || '',
            numero: document.getElementById('addressNumber')?.value || '',
            complemento: document.getElementById('addressComplement')?.value || '',
            bairro: document.getElementById('neighborhood')?.value || '',
            cidade: document.getElementById('city')?.value || '',
            estado: document.getElementById('state')?.value || '',
            cep: document.getElementById('postalCode')?.value || '',
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
        
        return {
            ...informacoesBasicas,
            ...dataHorario,
            ...descricao,
            ...localizacao,
            lotes: lotes,
            ingressos: ingressos,
            combos: combos,
            ...produtor,
            ...configuracoes
        };
    };
    
    // Função para coletar dados dos lotes
    function coletarDadosLotes() {
        const lotes = [];
        
        // Lotes por data
        const lotesPorData = document.querySelectorAll('#lotesPorDataList .lote-item');
        lotesPorData.forEach((lote, index) => {
            const id = lote.dataset.id;
            const nome = lote.querySelector('.lote-item-name')?.textContent || '';
            const detalhes = lote.querySelector('.lote-item-details')?.textContent || '';
            
            // Extrair datas do texto
            const dateMatch = detalhes.match(/(\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}) até (\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2})/);
            
            lotes.push({
                id: id,
                nome: nome,
                tipo: 'data',
                ordem: index + 1,
                data_inicio: dateMatch ? convertDateFormatToISO(dateMatch[1]) : '',
                data_fim: dateMatch ? convertDateFormatToISO(dateMatch[2]) : '',
                percentual: null,
                quantidade: null
            });
        });
        
        // Lotes por percentual/quantidade
        const lotesPorPercentual = document.querySelectorAll('#lotesPorPercentualList .lote-item');
        lotesPorPercentual.forEach((lote, index) => {
            const id = lote.dataset.id;
            const nome = lote.querySelector('.lote-item-name')?.textContent || '';
            const percentual = lote.querySelector('.lote-item-percentage')?.textContent?.replace('%', '') || '0';
            const quantidade = lote.querySelector('.lote-item-quantity')?.textContent?.match(/\d+/)?.[0] || '0';
            
            lotes.push({
                id: id,
                nome: nome,
                tipo: 'percentual',
                ordem: lotesPorData.length + index + 1,
                data_inicio: null,
                data_fim: null,
                percentual: parseInt(percentual),
                quantidade: parseInt(quantidade)
            });
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
            
            combos.push({
                id: item.dataset.ticketId || '',
                titulo: comboData.title || comboData.name || '',
                descricao: comboData.description || '',
                preco: parseFloat(comboData.price) || 0,
                quantidade_total: parseInt(comboData.quantity) || 0,
                lote_id: item.dataset.loteId || comboData.loteId || null,
                inicio_vendas: comboData.saleStart || '',
                fim_vendas: comboData.saleEnd || '',
                itens: comboData.items || comboData.conteudo_combo || []
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
                body: JSON.stringify(dados)
            });
            
            const resultado = await response.json();
            
            if (resultado.success) {
                // Mostrar sucesso
                if (typeof window.mostrarSucesso === 'function') {
                    window.mostrarSucesso(resultado.data);
                } else {
                    alert('Evento publicado com sucesso!');
                    window.location.href = '/produtor/meuseventos.php';
                }
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