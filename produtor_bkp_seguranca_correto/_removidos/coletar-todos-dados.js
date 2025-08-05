/**
 * Script para forçar a coleta de todos os dados do wizard
 * Execute este script no console para coletar todos os dados de uma vez
 */

(function() {
    'use strict';
    
    console.log('🔧 Iniciando coleta forçada de dados...');
    
    // Garantir que o WizardDataCollector existe
    if (!window.WizardDataCollector) {
        console.error('❌ WizardDataCollector não encontrado!');
        return;
    }
    
    // Função para coletar todos os dados
    window.coletarTodosDados = function() {
        console.log('📊 Coletando dados de TODOS os steps...');
        
        // Step 1 - Informações básicas
        const eventName = document.getElementById('eventName');
        if (eventName) window.WizardDataCollector.dados.nome = eventName.value || '';
        
        // Imagens - Verificar primeiro window.uploadedImages
        if (window.uploadedImages) {
            if (window.uploadedImages.logo) {
                window.WizardDataCollector.dados.logo_url = window.uploadedImages.logo;
            }
            if (window.uploadedImages.capa) {
                window.WizardDataCollector.dados.capa_url = window.uploadedImages.capa;
            }
            if (window.uploadedImages.fundo) {
                window.WizardDataCollector.dados.fundo_url = window.uploadedImages.fundo;
            }
        }
        
        // Se não encontrou em window.uploadedImages, tentar pegar do DOM (apenas URLs que não sejam blob ou base64)
        const logoImg = document.querySelector('#logoPreviewContainer img');
        if (!window.WizardDataCollector.dados.logo_url && logoImg && logoImg.src) {
            if (logoImg.src.startsWith('/uploads/') || logoImg.src.includes('/uploads/')) {
                // Extrair apenas o caminho relativo
                const match = logoImg.src.match(/(\/?uploads\/eventos\/[^"']+)/);
                if (match) {
                    window.WizardDataCollector.dados.logo_url = match[1];
                }
            }
        }
        
        const capaImg = document.querySelector('#capaPreviewContainer img');
        if (!window.WizardDataCollector.dados.capa_url && capaImg && capaImg.src) {
            if (capaImg.src.startsWith('/uploads/') || capaImg.src.includes('/uploads/')) {
                const match = capaImg.src.match(/(\/?uploads\/eventos\/[^"']+)/);
                if (match) {
                    window.WizardDataCollector.dados.capa_url = match[1];
                }
            }
        }
        
        const fundoImg = document.querySelector('#fundoPreviewMain img') || document.querySelector('#fundoPreviewContainer img');
        if (!window.WizardDataCollector.dados.fundo_url && fundoImg && fundoImg.src) {
            if (fundoImg.src.startsWith('/uploads/') || fundoImg.src.includes('/uploads/')) {
                const match = fundoImg.src.match(/(\/?uploads\/eventos\/[^"']+)/);
                if (match) {
                    window.WizardDataCollector.dados.fundo_url = match[1];
                }
            }
        }
        
        // Cor de fundo
        const bgColorInput = document.getElementById('bgColorInput') || document.getElementById('corFundo');
        if (bgColorInput) window.WizardDataCollector.dados.cor_fundo = bgColorInput.value || '';
        
        const bgColorDisplay = document.getElementById('bgColorDisplay');
        if (bgColorDisplay && bgColorDisplay.style.backgroundColor) {
            window.WizardDataCollector.dados.cor_fundo = bgColorDisplay.style.backgroundColor;
        }
        
        // Step 2 - Classificação e Categoria
        const classification = document.getElementById('classification');
        if (classification) window.WizardDataCollector.dados.classificacao = classification.value || '';
        
        const category = document.getElementById('category');
        if (category) window.WizardDataCollector.dados.categoria = category.value || '';
        
        // Datas
        const dataInicio = document.getElementById('dataInicio') || document.getElementById('startDateTime');
        if (dataInicio) window.WizardDataCollector.dados.data_inicio = dataInicio.value || '';
        
        const dataFim = document.getElementById('dataFim') || document.getElementById('endDateTime');
        if (dataFim) window.WizardDataCollector.dados.data_fim = dataFim.value || '';
        
        // Step 3 - Descrição
        const descricao = document.getElementById('descricaoEvento') || document.getElementById('eventDescription');
        if (descricao) {
            // Verificar se é TinyMCE
            if (window.tinymce && window.tinymce.get(descricao.id)) {
                window.WizardDataCollector.dados.descricao = window.tinymce.get(descricao.id).getContent();
            } else {
                window.WizardDataCollector.dados.descricao = descricao.value || descricao.innerHTML || '';
            }
        }
        
        // Step 4 - Localização
        const addressSearch = document.getElementById('addressSearch');
        if (addressSearch) window.WizardDataCollector.dados.nome_local = addressSearch.value || '';
        
        const cep = document.getElementById('cep');
        if (cep) window.WizardDataCollector.dados.cep = cep.value || '';
        
        const rua = document.getElementById('rua') || document.getElementById('street');
        if (rua) window.WizardDataCollector.dados.rua = rua.value || '';
        
        const numero = document.getElementById('numero') || document.getElementById('number');
        if (numero) window.WizardDataCollector.dados.numero = numero.value || '';
        
        const complemento = document.getElementById('complemento') || document.getElementById('complement');
        if (complemento) window.WizardDataCollector.dados.complemento = complemento.value || '';
        
        const bairro = document.getElementById('bairro') || document.getElementById('neighborhood');
        if (bairro) window.WizardDataCollector.dados.bairro = bairro.value || '';
        
        const cidade = document.getElementById('cidade') || document.getElementById('city');
        if (cidade) window.WizardDataCollector.dados.cidade = cidade.value || '';
        
        const estado = document.getElementById('estado') || document.getElementById('state');
        if (estado) window.WizardDataCollector.dados.estado = estado.value || '';
        
        // Step 5 - Lotes (já estão sendo salvos)
        
        // Step 6 - Ingressos
        const ticketItems = document.querySelectorAll('.ticket-item');
        if (ticketItems.length > 0) {
            window.WizardDataCollector.dados.ingressos = [];
            ticketItems.forEach(item => {
                if (item.ticketData) {
                    window.WizardDataCollector.dados.ingressos.push(item.ticketData);
                }
            });
        }
        
        // Salvar tudo
        const dadosParaSalvar = JSON.stringify(window.WizardDataCollector);
        localStorage.setItem('wizardCollectedData', dadosParaSalvar);
        
        console.log('✅ Todos os dados foram coletados e salvos!');
        console.log('📊 Dados coletados:', window.WizardDataCollector.dados);
        
        return window.WizardDataCollector.dados;
    };
    
    // Executar coleta automaticamente
    window.coletarTodosDados();
    
    // Adicionar função ao escopo global para uso futuro
    console.log('💡 Use coletarTodosDados() para coletar todos os dados novamente');
    
})();
