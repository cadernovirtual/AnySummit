/**
 * Fix definitivo para persistência de dados do wizard
 * Corrige o problema do step undefined e garante coleta correta de dados
 */

(function() {
    'use strict';
    
    console.log('🔧 Fix de persistência iniciando...');
    
    // Aguardar carregamento do DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPersistenceFix);
    } else {
        initPersistenceFix();
    }
    
    function initPersistenceFix() {
        // Sobrescrever a função de coleta para incluir o step atual
        const originalCollectData = window.WizardDataCollector.collectData;
        
        window.WizardDataCollector.collectData = function(dados) {
            // Adicionar step atual aos dados
            const currentStep = window.getCurrentStep ? window.getCurrentStep() : 
                              (window.wizardState ? window.wizardState.currentStep : 1);
            
            dados.step_atual = currentStep;
            
            // Coletar dados específicos de cada step
            const stepData = coletarDadosDoStep(currentStep);
            
            // Mesclar dados
            const dadosCompletos = Object.assign({}, dados, stepData);
            
            console.log(`📦 Coletando dados do Step ${currentStep}:`, dadosCompletos);
            
            // Chamar função original
            return originalCollectData.call(this, dadosCompletos);
        };
        
        // Função para coletar dados específicos de cada step
        function coletarDadosDoStep(step) {
            const dados = {};
            
            switch(step) {
                case 1: // Informações Básicas
                    dados.nome = document.getElementById('eventName')?.value || '';
                    dados.classificacao = document.querySelector('input[name="classificacao"]:checked')?.value || '';
                    dados.categoria = document.getElementById('categoria')?.value || '';
                    dados.cor_fundo = document.getElementById('bgColorDisplay')?.style.backgroundColor || '';
                    
                    // URLs das imagens
                    const logoImg = document.querySelector('#logoPreviewContainer img');
                    const capaImg = document.querySelector('#capaPreviewContainer img');
                    const fundoImg = document.querySelector('#fundoPreviewMain img') || 
                                   document.querySelector('#fundoPreviewContainer img');
                    
                    dados.logo_url = logoImg?.src || '';
                    dados.capa_url = capaImg?.src || '';
                    dados.fundo_url = fundoImg?.src || '';
                    break;
                    
                case 2: // Data e Horário
                    dados.data_inicio = document.getElementById('dataInicio')?.value || '';
                    dados.hora_inicio = document.getElementById('horaInicio')?.value || '';
                    dados.data_fim = document.getElementById('dataFim')?.value || '';
                    dados.hora_fim = document.getElementById('horaFim')?.value || '';
                    break;
                    
                case 3: // Descrição
                    // Capturar HTML do TinyMCE
                    if (window.tinymce && window.tinymce.get('descricaoEvento')) {
                        dados.descricao = window.tinymce.get('descricaoEvento').getContent();
                    } else {
                        dados.descricao = document.getElementById('descricaoEvento')?.value || '';
                    }
                    break;
                    
                case 4: // Localização
                    dados.nome_local = document.getElementById('addressSearch')?.value || '';
                    dados.cep = document.getElementById('cep')?.value || '';
                    dados.rua = document.getElementById('rua')?.value || '';
                    dados.numero = document.getElementById('numero')?.value || '';
                    dados.complemento = document.getElementById('complemento')?.value || '';
                    dados.bairro = document.getElementById('bairro')?.value || '';
                    dados.cidade = document.getElementById('cidade')?.value || '';
                    dados.estado = document.getElementById('estado')?.value || '';
                    break;
                    
                case 5: // Lotes
                    dados.lotes = coletarDadosLotes();
                    break;
                    
                case 6: // Ingressos
                    dados.ingressos = coletarDadosIngressos();
                    break;
                    
                case 7: // Produtor
                    dados.tipo_produtor = document.querySelector('input[name="tipoProdutor"]:checked')?.value || '';
                    dados.nome_produtor = document.getElementById('nomeProdutor')?.value || '';
                    dados.email_produtor = document.getElementById('emailProdutor')?.value || '';
                    dados.doc_produtor = document.getElementById('docProdutor')?.value || '';
                    break;
                    
                case 8: // Termos
                    const termoUso = document.getElementById('termoUso');
                    const termoPolitica = document.getElementById('termoPolitica');
                    
                    dados.termo_uso_aceito = termoUso?.checked || false;
                    dados.termo_politica_aceito = termoPolitica?.checked || false;
                    dados.termos_aceitos = dados.termo_uso_aceito && dados.termo_politica_aceito;
                    
                    if (dados.termos_aceitos) {
                        dados.timestamp_aceite = new Date().toISOString();
                    }
                    break;
            }
            
            return dados;
        }
        
        // Função para coletar dados dos lotes
        function coletarDadosLotes() {
            const lotes = [];
            const loteCards = document.querySelectorAll('.lote-card');
            
            loteCards.forEach((card, index) => {
                const loteData = {
                    id: card.getAttribute('data-lote-id') || `lote_${index}`,
                    nome: card.querySelector('.lote-nome')?.textContent || `Lote ${index + 1}`,
                    tipo: card.classList.contains('por-data') ? 'data' : 'percentual',
                    dataInicio: card.querySelector('[data-inicio]')?.getAttribute('data-inicio') || '',
                    dataFim: card.querySelector('[data-fim]')?.getAttribute('data-fim') || '',
                    percentualVendido: card.querySelector('.percentual-value')?.textContent || '',
                    ativo: true
                };
                lotes.push(loteData);
            });
            
            return lotes;
        }
        
        // Função para coletar dados dos ingressos
        function coletarDadosIngressos() {
            const ingressos = [];
            const ticketItems = document.querySelectorAll('.ticket-item');
            
            ticketItems.forEach(item => {
                if (item.ticketData) {
                    ingressos.push(item.ticketData);
                }
            });
            
            // Se não encontrou no DOM, tentar no localStorage
            if (ingressos.length === 0) {
                const tempTickets = localStorage.getItem('temporaryTickets');
                if (tempTickets) {
                    try {
                        const parsed = JSON.parse(tempTickets);
                        ingressos.push(...parsed);
                    } catch (e) {
                        console.error('Erro ao parsear ingressos temporários:', e);
                    }
                }
            }
            
            return ingressos;
        }
        
        // Sobrescrever saveWizardData para garantir que use o novo sistema
        const originalSaveWizardData = window.saveWizardData;
        
        window.saveWizardData = function() {
            console.log('💾 saveWizardData melhorado executando...');
            
            const currentStep = window.getCurrentStep ? window.getCurrentStep() : 
                              (window.wizardState ? window.wizardState.currentStep : 1);
            
            // Coletar todos os dados
            const dadosCompletos = coletarDadosDoStep(currentStep);
            dadosCompletos.step_atual = currentStep;
            
            // Salvar no WizardDataCollector
            if (window.WizardDataCollector) {
                window.WizardDataCollector.collectData(dadosCompletos);
            }
            
            // Chamar função original se existir
            if (originalSaveWizardData && typeof originalSaveWizardData === 'function') {
                try {
                    originalSaveWizardData.call(this);
                } catch (e) {
                    console.error('Erro ao chamar saveWizardData original:', e);
                }
            }
            
            // Log para debug
            const savedData = localStorage.getItem('wizardCollectedData');
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    const camposPreenchidos = Object.keys(parsed).filter(key => {
                        const value = parsed[key];
                        return value !== '' && value !== null && value !== undefined && 
                               (typeof value !== 'object' || (Array.isArray(value) && value.length > 0));
                    }).length;
                    
                    console.log(`✅ Dados salvos! Step: ${currentStep}, Campos preenchidos: ${camposPreenchidos}`);
                } catch (e) {
                    console.error('Erro ao verificar dados salvos:', e);
                }
            }
        };
        
        console.log('✅ Fix de persistência instalado com sucesso!');
        
        // Adicionar função global para debug
        window.debugPersistencia = function() {
            const savedData = localStorage.getItem('wizardCollectedData');
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    console.log('📊 Dados salvos:', parsed);
                    console.log('📊 Total de campos:', Object.keys(parsed).length);
                    
                    // Mostrar campos vazios
                    const camposVazios = Object.keys(parsed).filter(key => {
                        const value = parsed[key];
                        return value === '' || value === null || value === undefined || 
                               (Array.isArray(value) && value.length === 0);
                    });
                    
                    if (camposVazios.length > 0) {
                        console.log('❌ Campos vazios:', camposVazios);
                    }
                } catch (e) {
                    console.error('Erro ao debugar:', e);
                }
            } else {
                console.log('❌ Nenhum dado salvo encontrado');
            }
        };
    }
    
})();
