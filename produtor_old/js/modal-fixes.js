// Correções para os problemas de modal e recuperação de dados
// Este arquivo deve ser inserido no final de criaevento.js

// ==================== CORREÇÃO 1: MODAL CLOSE ====================
// Sobrescrever a função closeModal para garantir funcionamento
window.closeModal = function(modalId) {
    console.log('🔄 Fechando modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        // Limpar formulários ao fechar
        if (modalId === 'freeTicketModal') {
            clearFreeTicketForm();
        } else if (modalId === 'paidTicketModal') {
            clearPaidTicketForm();
        }
    }
};

// Função para limpar formulário de ingresso gratuito
function clearFreeTicketForm() {
    const fields = [
        'freeTicketTitle', 'freeTicketQuantity', 'freeTicketLote',
        'freeSaleStart', 'freeSaleEnd', 'freeMinQuantity', 
        'freeMaxQuantity', 'freeTicketDescription'
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (field.type === 'number') {
                field.value = fieldId.includes('Min') ? '1' : '5';
            } else {
                field.value = '';
            }
        }
    });
}

// Função para limpar formulário de ingresso pago
function clearPaidTicketForm() {
    const fields = [
        'paidTicketTitle', 'paidTicketQuantity', 'paidTicketPrice',
        'paidTicketLote', 'paidSaleStart', 'paidSaleEnd',
        'paidMinQuantity', 'paidMaxQuantity', 'paidTicketDescription'
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (field.type === 'number') {
                field.value = fieldId.includes('Min') ? '1' : '5';
            } else if (fieldId === 'paidTicketPrice') {
                field.value = 'R$ 0,00';
            } else {
                field.value = '';
            }
        }
    });
    
    // Resetar campos de taxa
    document.getElementById('paidTicketTaxaServico').checked = true;
}

// ==================== CORREÇÃO 2: RECUPERAÇÃO DE DADOS ====================
// Melhorar a função de restauração para incluir imagem e descrição
const originalRestoreWizardData = window.restoreWizardData;
window.restoreWizardData = function(data) {
    console.log('🔄 Restaurando dados do wizard:', data);
    
    // Chamar a função original primeiro
    if (originalRestoreWizardData) {
        originalRestoreWizardData.call(this, data);
    }
    
    // Adicionar restauração de imagem de capa
    if (data.eventImage) {
        const previewContainer = document.querySelector('.preview-event');
        if (previewContainer) {
            let imgElement = previewContainer.querySelector('img');
            if (!imgElement) {
                imgElement = document.createElement('img');
                previewContainer.appendChild(imgElement);
            }
            imgElement.src = data.eventImage;
            imgElement.style.width = '100%';
            imgElement.style.height = 'auto';
            imgElement.style.objectFit = 'cover';
        }
        
        // Atualizar preview principal
        const previewImage = document.getElementById('previewImage');
        if (previewImage) {
            previewImage.innerHTML = `<img src="${data.eventImage}" alt="Imagem do evento" style="width: 100%; height: 100%; object-fit: cover;">`;
        }
        
        // Atualizar input hidden se existir
        const imageInput = document.getElementById('eventImageHidden');
        if (imageInput) {
            imageInput.value = data.eventImage;
        }
    }
    
    // Garantir que a descrição seja restaurada
    if (data.eventDescription) {
        const descField = document.getElementById('eventDescription');
        if (descField) {
            descField.value = data.eventDescription;
            // Disparar evento input para atualizar contador de caracteres
            descField.dispatchEvent(new Event('input'));
        }
    }
    
    // Restaurar ingressos se existirem
    if (data.tickets && Array.isArray(data.tickets)) {
        console.log('🎫 Restaurando ingressos:', data.tickets.length);
        
        // Limpar lista atual
        const ticketList = document.getElementById('ticketList');
        if (ticketList) {
            ticketList.innerHTML = '';
        }
        
        // Resetar contador
        if (window.ticketCount !== undefined) {
            window.ticketCount = 0;
        }
        
        // Restaurar cada ingresso
        data.tickets.forEach((ticket, index) => {
            try {
                if (ticket.type === 'paid' && window.addPaidTicketToList) {
                    window.addPaidTicketToList(
                        ticket.title,
                        ticket.quantity,
                        ticket.price,
                        ticket.description || '',
                        ticket.saleStart,
                        ticket.saleEnd,
                        ticket.minLimit || 1,
                        ticket.maxLimit || 5,
                        ticket.cobrarTaxa !== false,
                        ticket.loteId,
                        ticket.loteName
                    );
                } else if (ticket.type === 'free' && window.addFreeTicketToList) {
                    window.addFreeTicketToList(
                        ticket.title,
                        ticket.quantity,
                        ticket.description || '',
                        ticket.saleStart,
                        ticket.saleEnd,
                        ticket.minLimit || 1,
                        ticket.maxLimit || 5,
                        ticket.loteId,
                        ticket.loteName
                    );
                }
            } catch (error) {
                console.error('Erro ao restaurar ingresso:', error, ticket);
            }
        });
    }
};

// ==================== CORREÇÃO 3: MELHORAR SALVAMENTO ====================
// TEMPORARIAMENTE DESABILITADO - Causando erro de JSON
/*
const originalSaveWizardData = window.saveWizardData;
window.saveWizardData = function() {
    console.log('💾 Salvando dados do wizard aprimorado');
    
    // Chamar função original
    if (originalSaveWizardData) {
        originalSaveWizardData.call(this);
    }
    
    // Obter dados salvos e adicionar campos faltantes
    const savedData = getCookie('eventoWizard');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            
            // Garantir que a imagem seja salva
            const previewImg = document.querySelector('.preview-event img');
            if (previewImg && previewImg.src && !previewImg.src.includes('placeholder')) {
                data.eventImage = previewImg.src;
            }
            
            // Garantir que a descrição seja salva
            const descField = document.getElementById('eventDescription');
            if (descField) {
                data.eventDescription = descField.value;
            }
            
            // Salvar ingressos atuais
            const ticketItems = document.querySelectorAll('.ticket-item');
            data.tickets = [];
            
            ticketItems.forEach(item => {
                // Extrair dados do elemento DOM
                const titleEl = item.querySelector('.ticket-title');
                const title = titleEl ? titleEl.textContent.replace(/📦|✏️|🗑️/g, '').trim() : '';
                
                // Verificar se tem dados salvos no elemento
                if (item.ticketData) {
                    data.tickets.push(item.ticketData);
                } else {
                    // Tentar extrair dados do HTML
                    const infoSpans = item.querySelectorAll('.ticket-info span');
                    const ticketData = {
                        type: titleEl && titleEl.textContent.includes('📦') ? 'combo' : 
                              (infoSpans[1] && infoSpans[1].textContent.includes('R$ 0,00') ? 'free' : 'paid'),
                        title: title
                    };
                    
                    // Extrair outros dados dos spans
                    infoSpans.forEach(span => {
                        const text = span.textContent;
                        if (text.includes('Quantidade:')) {
                            ticketData.quantity = parseInt(text.replace(/\D/g, '')) || 0;
                        } else if (text.includes('Preço:') && !text.includes('Taxa')) {
                            const priceMatch = text.match(/R\$\s*([\d.,]+)/);
                            ticketData.price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 0;
                        }
                    });
                    
                    if (ticketData.title) {
                        data.tickets.push(ticketData);
                    }
                }
            });
            
            // Salvar dados atualizados
            setCookie('eventoWizard', JSON.stringify(data), 7);
            console.log('✅ Dados salvos com sucesso:', data);
        } catch (error) {
            console.error('Erro ao salvar dados aprimorados:', error);
        }
    }
};
*/

// ==================== CORREÇÃO 4: GARANTIR EVENTOS DOS BOTÕES ====================
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar eventos aos botões de fechar/cancelar que podem não estar funcionando
    const modalButtons = [
        { selector: '#freeTicketModal .modal-close', action: () => closeModal('freeTicketModal') },
        { selector: '#freeTicketModal .btn-secondary', action: () => closeModal('freeTicketModal') },
        { selector: '#paidTicketModal .modal-close', action: () => closeModal('paidTicketModal') },
        { selector: '#paidTicketModal .btn-secondary', action: () => closeModal('paidTicketModal') }
    ];
    
    modalButtons.forEach(({ selector, action }) => {
        const button = document.querySelector(selector);
        if (button) {
            button.removeEventListener('click', action);
            button.addEventListener('click', action);
        }
    });
});

console.log('✅ Correções de modal e recuperação de dados carregadas');