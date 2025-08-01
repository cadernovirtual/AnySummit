/**
 * Correção do mapeamento de IDs para coleta de dados
 * Garante que os IDs corretos sejam usados ao coletar dados do formulário
 */
(function() {
    console.log('🔧 Correção de mapeamento de IDs ativada');
    
    // Mapa de IDs corretos
    window.ID_MAP = {
        // Step 1
        nome: 'eventName',
        classificacao: 'classification',
        categoria: 'category',
        corFundo: 'corFundo',
        
        // Step 2
        dataInicio: 'startDateTime',
        dataFim: 'endDateTime',
        multiplosDias: 'multiDaySwitch',
        tipoLocal: 'locationTypeSwitch',
        nomeLocal: 'venueName',
        cep: 'cep',
        rua: 'street',
        numero: 'number',
        complemento: 'complement',
        bairro: 'neighborhood',
        cidade: 'city',
        estado: 'state',
        linkOnline: 'eventLink',
        enderecoCompleto: 'addressSearch',
        
        // Step 3
        descricao: 'eventDescription',
        
        // Step 4
        tipoProdutor: 'producer',
        nomeProdutor: 'producerName',
        nomeExibicao: 'displayName',
        descricaoProdutor: 'producerDescription',
        
        // Step 7
        estacionamento: 'parkingSwitch',
        acessibilidade: 'accessibilitySwitch',
        
        // Step 8
        termos: 'termsCheckbox'
    };
    
    // Função auxiliar para obter valor de elemento
    window.getElementValue = function(id) {
        const elemento = document.getElementById(id);
        if (!elemento) return '';
        
        // Para elementos com innerHTML (como descrição)
        if (elemento.tagName === 'DIV' && id === 'eventDescription') {
            return elemento.innerHTML || '';
        }
        
        // Para switches
        if (elemento.classList && (elemento.classList.contains('switch') || elemento.classList.contains('switch-container'))) {
            return elemento.classList.contains('active');
        }
        
        // Para checkboxes customizados
        if (id === 'termsCheckbox') {
            return elemento.classList.contains('checked') || window.termsState?.accepted || false;
        }
        
        // Para inputs normais
        return elemento.value || '';
    };
    
    // Função para coletar dados usando IDs corretos
    window.coletarDadosCorrigidos = function() {
        console.log('📋 Coletando dados com IDs corretos...');
        
        const dados = {
            evento: {
                // Step 1
                nome: getElementValue(ID_MAP.nome),
                classificacao: getElementValue(ID_MAP.classificacao),
                categoria: getElementValue(ID_MAP.categoria),
                cor_fundo: getElementValue(ID_MAP.corFundo),
                
                // Step 2
                data_inicio: getElementValue(ID_MAP.dataInicio),
                data_fim: getElementValue(ID_MAP.dataFim),
                evento_multiplos_dias: getElementValue(ID_MAP.multiplosDias),
                tipo_local: getElementValue(ID_MAP.tipoLocal) ? 'presencial' : 'online',
                
                // Endereço (se presencial)
                nome_local: getElementValue(ID_MAP.nomeLocal),
                cep: getElementValue(ID_MAP.cep),
                rua: getElementValue(ID_MAP.rua),
                numero: getElementValue(ID_MAP.numero),
                complemento: getElementValue(ID_MAP.complemento),
                bairro: getElementValue(ID_MAP.bairro),
                cidade: getElementValue(ID_MAP.cidade),
                estado: getElementValue(ID_MAP.estado),
                busca_endereco: getElementValue(ID_MAP.enderecoCompleto),
                
                // Link (se online)
                link_online: getElementValue(ID_MAP.linkOnline),
                
                // Step 3
                descricao_completa: getElementValue(ID_MAP.descricao),
                descricao_texto: document.getElementById(ID_MAP.descricao)?.textContent || '',
                
                // Step 4
                tipo_produtor: getElementValue(ID_MAP.tipoProdutor) === 'new' ? 'novo' : 'atual',
                nome_produtor: getElementValue(ID_MAP.nomeProdutor),
                nome_exibicao: getElementValue(ID_MAP.nomeExibicao),
                descricao_produtor: getElementValue(ID_MAP.descricaoProdutor),
                
                // Step 7
                tem_estacionamento: getElementValue(ID_MAP.estacionamento) ? 'sim' : 'nao',
                tem_acessibilidade: getElementValue(ID_MAP.acessibilidade) ? 'sim' : 'nao',
                
                // Step 8
                visibilidade: document.querySelector('.radio.checked[data-value]')?.dataset.value || 'public',
                termos_aceitos: getElementValue(ID_MAP.termos)
            },
            ingressos: []
        };
        
        // Coletar ingressos
        if (window.coletarDadosIngressos) {
            dados.ingressos = window.coletarDadosIngressos();
        } else if (window.WizardSaveSystemV2) {
            dados.ingressos = window.WizardSaveSystemV2.coletarIngressosAtualizados();
        }
        
        console.log('✅ Dados coletados corretamente:', dados);
        return dados;
    };
    
    // Sobrescrever função de coleta se existir
    if (window.coletarDadosFormulario) {
        const original = window.coletarDadosFormulario;
        window.coletarDadosFormulario = function() {
            console.log('🔄 Usando coleta corrigida de dados');
            return window.coletarDadosCorrigidos();
        };
    }
    
    console.log('✅ Correção de mapeamento instalada');
    console.log('💡 Use coletarDadosCorrigidos() para testar');
})();