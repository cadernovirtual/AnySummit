// =====================================================
// FUNÇÕES AUXILIARES ESSENCIAIS
// =====================================================

console.log('🔧 Garantindo funções auxiliares...');

// Função para fechar modais
window.closeModal = window.closeModal || function(modalId) {
    console.log('🚪 Fechando modal:', modalId);
    
    const modal = document.getElementById(modalId);
    if (modal) {
        // Bootstrap 5
        if (window.bootstrap && bootstrap.Modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            } else {
                // Tentar criar instância e fechar
                const newModal = new bootstrap.Modal(modal);
                newModal.hide();
            }
        } 
        // Bootstrap 4 ou jQuery
        else if (window.$ && $.fn.modal) {
            $(modal).modal('hide');
        }
        // Fallback - esconder manualmente
        else {
            modal.style.display = 'none';
            modal.classList.remove('show');
            
            // Remover backdrop se existir
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            
            // Remover classe do body
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('padding-right');
        }
    }
};

// Função para abrir modais
window.openModal = window.openModal || function(modalId) {
    console.log('🚪 Abrindo modal:', modalId);
    
    const modal = document.getElementById(modalId);
    if (modal) {
        // Bootstrap 5
        if (window.bootstrap && bootstrap.Modal) {
            const bsModal = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
            bsModal.show();
        }
        // Bootstrap 4 ou jQuery
        else if (window.$ && $.fn.modal) {
            $(modal).modal('show');
        }
        // Fallback - mostrar manualmente
        else {
            modal.style.display = 'block';
            modal.classList.add('show');
            
            // Adicionar backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(backdrop);
            
            // Adicionar classe ao body
            document.body.classList.add('modal-open');
        }
    }
};

// Função para calcular próxima data de início
window.calcularProximaDataInicio = window.calcularProximaDataInicio || function() {
    console.log('📅 Calculando próxima data de início...');
    
    let ultimaData = null;
    
    // Verificar lotes por data
    if (window.lotesData && window.lotesData.porData) {
        window.lotesData.porData.forEach(lote => {
            if (lote.dataFim) {
                const dataFim = new Date(lote.dataFim);
                if (!ultimaData || dataFim > ultimaData) {
                    ultimaData = dataFim;
                }
            }
        });
    }
    
    // Verificar lotes por percentual
    if (window.lotesData && window.lotesData.porPercentual) {
        window.lotesData.porPercentual.forEach(lote => {
            if (lote.dataFim) {
                const dataFim = new Date(lote.dataFim);
                if (!ultimaData || dataFim > ultimaData) {
                    ultimaData = dataFim;
                }
            }
        });
    }
    
    if (ultimaData) {
        // Adicionar 1 minuto
        ultimaData.setMinutes(ultimaData.getMinutes() + 1);
        
        // Formatar para datetime-local
        const ano = ultimaData.getFullYear();
        const mes = String(ultimaData.getMonth() + 1).padStart(2, '0');
        const dia = String(ultimaData.getDate()).padStart(2, '0');
        const hora = String(ultimaData.getHours()).padStart(2, '0');
        const minuto = String(ultimaData.getMinutes()).padStart(2, '0');
        
        return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    }
    
    return '';
};

// Adicionar listeners para os modais de lotes
document.addEventListener('DOMContentLoaded', function() {
    
    // Quando abrir modal de lote por data
    const btnAddLoteData = document.querySelector('[data-bs-target="#loteDataModal"]');
    if (btnAddLoteData) {
        btnAddLoteData.addEventListener('click', function() {
            const proximaData = calcularProximaDataInicio();
            if (proximaData) {
                const campoInicio = document.getElementById('loteDataInicio');
                if (campoInicio) {
                    campoInicio.value = proximaData;
                }
            }
        });
    }
    
    // Quando abrir modal de lote percentual
    const btnAddLotePerc = document.querySelector('[data-bs-target="#lotePercentualModal"]');
    if (btnAddLotePerc) {
        btnAddLotePerc.addEventListener('click', function() {
            const proximaData = calcularProximaDataInicio();
            if (proximaData) {
                const campoInicio = document.getElementById('lotePercentualInicio');
                if (campoInicio) {
                    campoInicio.value = proximaData;
                }
            }
        });
    }
});

console.log('✅ Funções auxiliares garantidas');