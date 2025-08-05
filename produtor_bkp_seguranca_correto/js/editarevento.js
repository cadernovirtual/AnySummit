// Variáveis globais
let currentStep = 1;
let totalSteps = 7;

// Funções de navegação
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
            updateProgress();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateProgress();
    }
}

// Mostrar step específico
function showStep(step) {
    // Ocultar todos os steps
    const allSteps = document.querySelectorAll('.section-card');
    allSteps.forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    
    // Mostrar step atual
    const currentStepEl = document.querySelector(`[data-step-content="${step}"]`);
    if (currentStepEl) {
        currentStepEl.classList.add('active');
    }
    
    // Atualizar indicadores
    updateStepIndicators();
}

// Atualizar indicadores de step
function updateStepIndicators() {
    const stepIndicators = document.querySelectorAll('.step');
    
    stepIndicators.forEach((indicator, index) => {
        const stepNumber = index + 1;
        indicator.classList.remove('active', 'completed');
        
        if (stepNumber < currentStep) {
            indicator.classList.add('completed');
        } else if (stepNumber === currentStep) {
            indicator.classList.add('active');
        }
    });
}

// Atualizar barra de progresso
function updateProgress() {
    const progressLine = document.getElementById('progressLine');
    if (progressLine) {
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressLine.style.width = progress + '%';
    }
}

// Validar step atual
function validateCurrentStep() {
    const validationMessage = document.getElementById(`validation-step-${currentStep}`);
    
    switch (currentStep) {
        case 1:
            return validateStep1(validationMessage);
        case 2:
            return validateStep2(validationMessage);
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
            return true; // Por enquanto aceita todos
        default:
            return true;
    }
}

// Validação do step 1
function validateStep1(validationMessage) {
    const eventName = document.getElementById('eventName').value.trim();
    const classification = document.getElementById('classification').value;
    const category = document.getElementById('category').value;
    
    if (!eventName || !classification || !category) {
        showValidationMessage(validationMessage, 'Por favor, preencha todos os campos obrigatórios.');
        return false;
    }
    
    hideValidationMessage(validationMessage);
    return true;
}

// Validação do step 2
function validateStep2(validationMessage) {
    const startDateTime = document.getElementById('startDateTime').value;
    
    if (!startDateTime) {
        showValidationMessage(validationMessage, 'Por favor, defina a data e hora de início do evento.');
        return false;
    }
    
    hideValidationMessage(validationMessage);
    return true;
}

// Mostrar/ocultar mensagens de validação
function showValidationMessage(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function hideValidationMessage(element) {
    if (element) {
        element.style.display = 'none';
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Função para criar ingresso pago
function createPaidTicket() {
    // Implementação básica
    alert('Função createPaidTicket em desenvolvimento');
    closeModal('paidTicketModal');
}

// Função para criar ingresso gratuito
function createFreeTicket() {
    // Implementação básica
    alert('Função createFreeTicket em desenvolvimento');
    closeModal('freeTicketModal');
}

// Função para atualizar evento
function updateEvent() {
    alert('Função updateEvent em desenvolvimento');
}

// Google Maps
function initMap() {
    console.log('Google Maps inicializado');
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    updateProgress();
    
    // Event listeners para os botões de ingresso
    const addPaidTicket = document.getElementById('addPaidTicket');
    const addFreeTicket = document.getElementById('addFreeTicket');
    
    if (addPaidTicket) {
        addPaidTicket.addEventListener('click', () => openModal('paidTicketModal'));
    }
    
    if (addFreeTicket) {
        addFreeTicket.addEventListener('click', () => openModal('freeTicketModal'));
    }
});

// Fechar modal clicando fora
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.style.display = 'none';
    }
});
