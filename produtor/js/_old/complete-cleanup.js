/**
 * Sistema completo de limpeza de dados do wizard
 * Garante que TODOS os dados sejam removidos
 */

(function() {
    'use strict';
    
    console.log('🧹 Sistema de limpeza completa carregando...');
    
    // Função principal de limpeza total
    window.limparTodosOsDadosDoWizard = function() {
        console.log('🗑️ Iniciando limpeza completa de todos os dados do wizard...');
        
        // 1. LIMPAR TODOS OS COOKIES
        const cookiesToClear = [
            'eventoWizard',
            'lotesData',
            'ingressosData',
            'ingressosSalvos',
            'wizardDataCollector',
            'temporaryTickets',
            'comboItems'
        ];
        
        cookiesToClear.forEach(cookieName => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
        });
        console.log('✅ Cookies limpos');
        
        // 2. LIMPAR TODO O LOCALSTORAGE
        const localStorageKeys = [
            'wizardData',
            'lotesData',
            'ingressosData',
            'temporaryTickets',
            'wizardDataCollector',
            'uploadedImages',
            'comboItems',
            'eventoWizard'
        ];
        
        localStorageKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('✅ LocalStorage limpo');
        
        // 3. LIMPAR VARIÁVEIS GLOBAIS
        // Lotes
        if (window.lotesData) {
            window.lotesData = {
                porData: [],
                porPercentual: []
            };
        }
        
        // Ingressos temporários
        if (window.temporaryTickets) {
            if (window.temporaryTickets instanceof Map) {
                window.temporaryTickets.clear();
            } else if (window.temporaryTickets.tickets) {
                window.temporaryTickets.tickets = [];
            } else {
                window.temporaryTickets = new Map();
            }
        }
        
        // Imagens uploadadas
        if (window.uploadedImages) {
            window.uploadedImages = {};
        }
        
        // Items de combo
        if (window.comboItems) {
            window.comboItems = [];
        }
        
        // Wizard Data Collector
        if (window.WizardDataCollector) {
            window.WizardDataCollector = {
                step_atual: 1,
                dados: {
                    nome: '',
                    classificacao: '',
                    categoria: '',
                    cor_fundo: '',
                    logo_url: '',
                    capa_url: '',
                    fundo_url: '',
                    data_inicio: '',
                    data_fim: '',
                    nome_local: '',
                    cep: '',
                    rua: '',
                    numero: '',
                    complemento: '',
                    bairro: '',
                    cidade: '',
                    estado: '',
                    descricao: '',
                    tipo_produtor: '',
                    nome_produtor: '',
                    email_produtor: '',
                    nome_exibicao: '',
                    descricao_produtor: '',
                    lotes: [],
                    ingressos: [],
                    termos_aceitos: false
                }
            };
            
            // Salvar estado limpo no localStorage
            localStorage.setItem('wizardDataCollector', JSON.stringify(window.WizardDataCollector));
        }
        
        console.log('✅ Variáveis globais limpas');
        
        // 4. LIMPAR ELEMENTOS DO DOM
        // Limpar formulários
        const forms = document.querySelectorAll('form');
        forms.forEach(form => form.reset());
        
        // Limpar campos específicos
        const fieldsToClean = [
            'eventName', 'classification', 'category', 'startDateTime', 'endDateTime',
            'venueName', 'eventLink', 'addressSearch', 'street', 'number', 'complement',
            'neighborhood', 'city', 'state', 'cep', 'eventDescription',
            'producerName', 'displayName', 'producerDescription', 'producerEmail',
            'corFundo', 'corFundoHex'
        ];
        
        fieldsToClean.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (field.tagName === 'SELECT') {
                    field.selectedIndex = 0;
                } else if (field.type === 'checkbox' || field.type === 'radio') {
                    field.checked = false;
                } else {
                    field.value = '';
                }
            }
        });
        
        // Limpar editor de descrição
        const eventDescription = document.getElementById('eventDescription');
        if (eventDescription) {
            eventDescription.innerHTML = '';
        }
        
        // Limpar listas visuais
        const elementsToEmpty = [
            'ticketList',
            'lotesDataList',
            'lotesPercentualList',
            'comboItemsList'
        ];
        
        elementsToEmpty.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = '';
            }
        });
        
        // Limpar previews de imagens
        const imageContainers = [
            { id: 'logoPreviewContainer', default: '<div class="upload-icon">🎨</div><div class="upload-text">Adicionar logo</div>' },
            { id: 'capaPreviewContainer', default: '<div class="upload-icon">📷</div><div class="upload-text">Adicionar capa</div>' },
            { id: 'fundoPreviewMain', default: '<div class="upload-icon">🖼️</div><div class="upload-text">Adicionar fundo</div>' }
        ];
        
        imageContainers.forEach(container => {
            const element = document.getElementById(container.id);
            if (element) {
                element.innerHTML = container.default;
            }
        });
        
        // Ocultar botões de limpar imagem
        const clearButtons = ['clearLogo', 'clearCapa', 'clearFundo'];
        clearButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.style.display = 'none';
            }
        });
        
        // Resetar cor de fundo
        const colorPreview = document.getElementById('colorPreview');
        if (colorPreview) {
            colorPreview.style.backgroundColor = '#000000';
        }
        
        console.log('✅ Elementos do DOM limpos');
        
        // 5. CHAMAR FUNÇÕES DE LIMPEZA ESPECÍFICAS
        // Limpar lotes
        if (window.limparTodosLotes) {
            window.limparTodosLotes();
        }
        
        // Chamar limpeza original
        if (window.clearAllWizardData && window.clearAllWizardData !== window.limparTodosOsDadosDoWizard) {
            window.clearAllWizardData();
        }
        
        // 6. RESETAR STEP
        if (window.setCurrentStep) {
            window.setCurrentStep(1);
        }
        if (window.updateStepDisplay) {
            window.updateStepDisplay();
        }
        
        // 7. RESETAR FLAGS
        window._recoveryDialogShown = false;
        window._recoveryInProgress = false;
        
        console.log('🎉 Limpeza completa finalizada! Todos os dados foram removidos.');
        
        return true;
    };
    
    // Expor também com nome mais curto
    window.limparTudo = window.limparTodosOsDadosDoWizard;
    
    console.log('✅ Sistema de limpeza completa carregado!');
    console.log('💡 Use limparTodosOsDadosDoWizard() ou limparTudo() para limpar todos os dados');
    
})();
