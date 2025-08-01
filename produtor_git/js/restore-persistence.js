// =====================================================
// RESTAURAÇÃO DO SISTEMA DE PERSISTÊNCIA - ANYSUMMIT
// =====================================================
// Este arquivo restaura a função saveWizardData completa
// que coleta TODOS os campos do wizard corretamente

console.log('🔧 Restaurando sistema de persistência...');

// Sobrescrever a função defeituosa no AnySummit.Storage
if (window.AnySummit && window.AnySummit.Storage) {
    
    // Backup da função original (caso precise)
    window.AnySummit.Storage._originalSaveWizardData = window.AnySummit.Storage.saveWizardData;
    
    // FUNÇÃO COMPLETA RESTAURADA DO ARQUIVO ORIGINAL
    window.AnySummit.Storage.saveWizardData = function() {
        console.log('💾 [RESTAURADO] Salvando dados COMPLETOS do wizard...');
        
        // Coletar dados de endereço completo
        const addressSearch = document.getElementById('addressSearch')?.value || '';
        
        // Coletar dados de lotes
        const lotesData = window.lotesManager ? window.lotesManager.getLotes() : {
            porData: [],
            porPercentual: []
        };
        
        // Se não tiver dados de lotes mas tiver no cookie
        const savedLotes = this.getCookie('lotesData');
        if (savedLotes && (!lotesData.porData.length && !lotesData.porPercentual.length)) {
            try {
                const parsedLotes = JSON.parse(savedLotes);
                lotesData.porData = parsedLotes.porData || [];
                lotesData.porPercentual = parsedLotes.porPercentual || [];
            } catch (e) {
                console.error('Erro ao parsear lotes:', e);
            }
        }
        
        // Coletar dados completos dos lotes do DOM
        const loteCards = document.querySelectorAll('.lote-card');
        const lotes = [];
        
        loteCards.forEach((card, index) => {
            const loteData = {
                id: card.getAttribute('data-lote-id') || `lote_${index}`,
                nome: card.querySelector('.lote-nome')?.textContent || `Lote ${index + 1}`,
                tipo: card.classList.contains('por-data') ? 'data' : 'percentual',
                dataInicio: card.querySelector('.lote-info span:nth-child(1)')?.textContent?.replace('Início: ', '') || '',
                dataFim: card.querySelector('.lote-info span:nth-child(2)')?.textContent?.replace('Fim: ', '') || '',
                percentualVendido: card.querySelector('.percentual-value')?.textContent || '',
                ativo: true
            };
            lotes.push(loteData);
        });
        
        // Coletar informações de imagens
        const logoImg = document.querySelector('#logoPreviewContainer img');
        const capaImg = document.querySelector('#capaPreviewContainer img');
        const fundoImg = document.querySelector('#fundoPreviewMain img') || document.querySelector('#fundoPreviewContainer img');
        
        // Coletar dados de ingressos com TODOS os campos
        const ticketItems = document.querySelectorAll('.ticket-item');
        const tickets = [];
        
        ticketItems.forEach((item, index) => {
            // Primeiro tentar pegar dados do ticketData se existir
            const savedTicketData = item.ticketData || {};
            
            const ticketData = {
                id: item.dataset.ticketId || savedTicketData.id || `ticket_${index}`,
                tipo: savedTicketData.tipo || savedTicketData.type || item.dataset.ticketType || 'pago',
                titulo: savedTicketData.titulo || savedTicketData.title || item.querySelector('.ticket-name')?.textContent?.trim() || '',
                preco: savedTicketData.preco || savedTicketData.price || parseFloat(item.querySelector('.ticket-buyer-price')?.textContent?.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
                quantidade: parseInt(savedTicketData.quantidade) || parseInt(savedTicketData.quantity) || parseInt(item.querySelector('.ticket-detail-value')?.textContent) || 1,
                loteId: savedTicketData.loteId || item.dataset.loteId || '',
                descricao: savedTicketData.descricao || savedTicketData.description || item.dataset.description || '',
                minQuantity: parseInt(savedTicketData.minQuantity) || parseInt(item.dataset.minQuantity) || 1,
                maxQuantity: parseInt(savedTicketData.maxQuantity) || parseInt(item.dataset.maxQuantity) || 5,
                saleStart: savedTicketData.saleStart || item.dataset.saleStart || '',
                saleEnd: savedTicketData.saleEnd || item.dataset.saleEnd || '',
                taxaServico: savedTicketData.taxaServico !== undefined ? savedTicketData.taxaServico : (item.dataset.taxaServico === '1'),
                valorReceber: savedTicketData.valorReceber || parseFloat(item.querySelector('.ticket-receive-amount')?.textContent?.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
                taxaPlataforma: savedTicketData.taxaPlataforma || 0,
                comboData: savedTicketData.items || savedTicketData.comboData || (item.dataset.comboData ? JSON.parse(item.dataset.comboData) : null)
            };
            
            // Debug individual do ticket
            console.log(`📦 Ticket ${index + 1}:`, ticketData);
            tickets.push(ticketData);
        });
        
        // ESTRUTURA COMPLETA DE DADOS
        const wizardData = {
            currentStep: window.currentStep || window.AnySummit.Wizard?.currentStep || 1,
            
            // STEP 1 - Informações básicas
            eventName: document.getElementById('eventName')?.value || '',
            classification: document.getElementById('classification')?.value || '',
            category: document.getElementById('category')?.value || '',
            
            // STEP 2 - Imagens e cores
            logoPath: logoImg?.src || '',
            capaPath: capaImg?.src || '',
            fundoPath: fundoImg?.src || '',
            logoUrl: window.uploadedImages?.logo || logoImg?.src || '',
            capaUrl: window.uploadedImages?.capa || capaImg?.src || '',
            fundoUrl: window.uploadedImages?.fundo || fundoImg?.src || '',
            hasLogoEvento: !!(logoImg && logoImg.src && !logoImg.src.includes('blob:')),
            hasCapaQuadrada: !!(capaImg && capaImg.src && !capaImg.src.includes('blob:')),
            hasImagemFundo: !!(fundoImg && fundoImg.src && !fundoImg.src.includes('blob:')),
            corFundo: document.getElementById('corFundo')?.value || '#000000',
            uploadedImages: window.uploadedImages || {},
            
            // STEP 3 - Data e hora
            startDateTime: document.getElementById('startDateTime')?.value || '',
            endDateTime: document.getElementById('endDateTime')?.value || '',
            
            // STEP 4 - Local completo
            isPresential: document.getElementById('locationTypeSwitch')?.classList.contains('active'),
            venueName: document.getElementById('venueName')?.value || '',
            eventLink: document.getElementById('eventLink')?.value || '',
            // Campos de endereço completos
            addressSearch: addressSearch,
            street: document.getElementById('street')?.value || '',
            number: document.getElementById('number')?.value || '',
            complement: document.getElementById('complement')?.value || '',
            neighborhood: document.getElementById('neighborhood')?.value || '',
            city: document.getElementById('city')?.value || '',
            state: document.getElementById('state')?.value || '',
            cep: document.getElementById('cep')?.value || '',
            
            // STEP 5 - Lotes completos
            lotes: lotes,
            lotesData: lotesData,
            lotesCompletos: lotes, // Para compatibilidade
            
            // STEP 6 - Ingressos completos
            tickets: tickets,
            ingressos: tickets, // Para compatibilidade
            ingressosCompletos: tickets,
            
            // STEP 7 - Descrição
            eventDescription: document.getElementById('eventDescription')?.innerHTML || '',
            
            // STEP 8 - Configurações finais
            producer: document.getElementById('producer')?.value || 'current',
            producerName: document.getElementById('producerName')?.value || '',
            displayName: document.getElementById('displayName')?.value || '',
            producerDescription: document.getElementById('producerDescription')?.value || '',
            termsAccepted: document.getElementById('termsCheckbox')?.classList.contains('checked') || false,
            acceptTerms: document.getElementById('acceptTerms')?.checked || false,
            visibility: document.querySelector('.radio.checked[data-value]')?.dataset.value || 'public',
            
            // Metadata
            timestamp: new Date().getTime(),
            version: '2.0' // Versão completa dos dados
        };
        
        // DEBUG - mostrar dados completos que serão salvos
        console.log('📋 Dados COMPLETOS do wizard:', wizardData);
        console.log('📦 Total de ingressos:', tickets.length);
        console.log('📍 Total de lotes:', lotes.length);
        
        // Salvar no cookie principal
        this.setCookie('eventoWizard', JSON.stringify(wizardData), 7);
        
        // Salvar lotes separadamente também
        if (lotesData.porData.length > 0 || lotesData.porPercentual.length > 0) {
            this.setCookie('lotesData', JSON.stringify(lotesData), 7);
        }
        
        // Salvar ingressos separadamente
        if (tickets.length > 0) {
            this.setCookie('ingressosData', JSON.stringify(tickets), 7);
        }
        
        console.log('✅ Dados salvos com sucesso!');
        return wizardData;
    };
    
    console.log('✅ Sistema de persistência restaurado com sucesso!');
    
} else {
    console.error('❌ AnySummit.Storage não encontrado! Aguardando...');
    
    // Se não encontrou, tentar novamente após DOM carregar
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            if (window.AnySummit && window.AnySummit.Storage) {
                // Reexecutar o código acima
                console.log('🔄 Tentando restaurar persistência novamente...');
                // [Copiar todo o código acima aqui]
            }
        }, 1000);
    });
}

// Adicionar salvamento automático em mudanças de campos importantes
document.addEventListener('DOMContentLoaded', function() {
    // Lista de campos que devem acionar salvamento automático
    const camposImportantes = [
        'eventName', 'classification', 'category',
        'startDateTime', 'endDateTime',
        'venueName', 'eventLink',
        'addressSearch', 'street', 'number', 'city', 'state',
        'eventDescription', 'corFundo'
    ];
    
    camposImportantes.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            // Salvar ao mudar (change)
            field.addEventListener('change', function() {
                console.log(`📝 Campo ${fieldId} modificado, salvando...`);
                if (window.AnySummit && window.AnySummit.Storage) {
                    window.AnySummit.Storage.saveWizardData();
                }
            });
            
            // Para campos de texto, salvar também ao sair do campo (blur)
            if (field.type === 'text' || field.type === 'textarea') {
                field.addEventListener('blur', function() {
                    if (window.AnySummit && window.AnySummit.Storage) {
                        window.AnySummit.Storage.saveWizardData();
                    }
                });
            }
        }
    });
    
    console.log('✅ Salvamento automático configurado');
});

// Função de teste para verificar se está salvando
window.testeSalvamento = function() {
    if (window.AnySummit && window.AnySummit.Storage) {
        const dados = window.AnySummit.Storage.saveWizardData();
        console.log('🧪 Teste de salvamento:', dados);
        
        // Verificar cookie
        const cookie = window.AnySummit.Storage.getCookie('eventoWizard');
        console.log('🍪 Cookie salvo:', cookie ? JSON.parse(cookie) : 'VAZIO');
        
        return dados;
    } else {
        console.error('❌ Sistema de storage não disponível');
        return null;
    }
};

console.log('💡 Use window.testeSalvamento() para verificar o salvamento');