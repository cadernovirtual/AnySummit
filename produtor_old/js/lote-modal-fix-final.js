/**
 * Solução definitiva para modais de lotes
 * Remove todos os conflitos anteriores
 */

// Limpar qualquer backdrop existente ao carregar
document.addEventListener('DOMContentLoaded', function() {
    // Remover backdrops órfãos
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.remove();
    });
    
    // Remover modal-overlay se existir
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.remove();
    });
});

// Sistema definitivo de modais
window.LoteModalManager = {
    currentModal: null,
    
    open: function(modalId) {
        console.log('LoteModalManager.open:', modalId);
        
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
            console.error('Modal não encontrado:', modalId);
            return;
        }
        
        // Fechar modal atual se houver
        if (this.currentModal) {
            this.close();
        }
        
        // Para modais com estrutura modal-overlay > modal
        const innerModal = modalElement.querySelector('.modal');
        const targetModal = innerModal || modalElement;
        
        // Configurar modal
        modalElement.style.display = 'flex';
        modalElement.style.position = 'fixed';
        modalElement.style.top = '0';
        modalElement.style.left = '0';
        modalElement.style.width = '100%';
        modalElement.style.height = '100%';
        modalElement.style.alignItems = 'center';
        modalElement.style.justifyContent = 'center';
        modalElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modalElement.style.zIndex = '9999';
        
        if (innerModal) {
            innerModal.style.position = 'relative';
            innerModal.style.maxWidth = '600px';
            innerModal.style.width = '90%';
            innerModal.style.maxHeight = '90vh';
            innerModal.style.overflow = 'auto';
        }
        
        // Adicionar classe show
        modalElement.classList.add('show');
        document.body.classList.add('modal-open');
        
        this.currentModal = modalElement;
        
        // Adicionar listeners de fechamento
        this.setupCloseHandlers(modalElement);
    },
    
    close: function() {
        console.log('LoteModalManager.close');
        
        if (!this.currentModal) return;
        
        const modal = this.currentModal;
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        
        this.currentModal = null;
    },
    
    setupCloseHandlers: function(modal) {
        // Clique no overlay (fora do modal interno)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.close();
            }
        });
        
        // Botões de fechar
        modal.querySelectorAll('.modal-close, .btn-cancel, [data-dismiss="modal"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.close();
            });
        });
    }
};

// Override definitivo das funções
window.adicionarLotePorData = function() {
    console.log('Abrindo modal de lote por data');
    
    // Preparar dados
    const agora = new Date();
    const eventoDataInicio = document.getElementById('startDateTime')?.value;
    const eventoDataFim = document.getElementById('endDateTime')?.value;
    
    if (eventoDataInicio) {
        const dataEventoInicio = new Date(eventoDataInicio);
        const dataEventoFim = eventoDataFim ? new Date(eventoDataFim) : dataEventoInicio;
        
        // Encontrar a maior data fim
        let maiorDataFim = agora;
        if (window.lotesData && window.lotesData.porData.length > 0) {
            window.lotesData.porData.forEach(lote => {
                const dataFimLote = new Date(lote.dataFim);
                if (dataFimLote > maiorDataFim) {
                    maiorDataFim = dataFimLote;
                }
            });
        }
        
        // Data início = 1 segundo após a maior data fim
        const novaDataInicio = new Date(maiorDataFim.getTime() + 1000);
        
        // Verificar limite
        const dataLimite = new Date(Math.min(dataEventoInicio, dataEventoFim));
        dataLimite.setSeconds(dataLimite.getSeconds() - 1);
        
        if (novaDataInicio >= dataLimite) {
            if (window.customDialog) {
                window.customDialog.alert('Não é possível adicionar mais lotes. A data limite foi atingida.', 'Aviso');
            } else {
                alert('Não é possível adicionar mais lotes. A data limite foi atingida.');
            }
            return;
        }
        
        // Preencher campos
        const loteDataInicio = document.getElementById('loteDataInicio');
        const loteDataFim = document.getElementById('loteDataFim');
        
        if (loteDataInicio && loteDataFim) {
            loteDataInicio.value = formatDateTimeLocal(novaDataInicio);
            
            const dataFimPadrao = new Date(novaDataInicio);
            dataFimPadrao.setDate(dataFimPadrao.getDate() + 7);
            
            if (dataFimPadrao > dataLimite) {
                loteDataFim.value = formatDateTimeLocal(dataLimite);
            } else {
                loteDataFim.value = formatDateTimeLocal(dataFimPadrao);
            }
        }
    }
    
    // Limpar nome
    const loteDataNome = document.getElementById('loteDataNome');
    if (loteDataNome) loteDataNome.value = '';
    
    // Abrir modal
    window.LoteModalManager.open('loteDataModal');
};

window.adicionarLotePorPercentual = function() {
    console.log('Abrindo modal de lote por percentual');
    
    // Limpar campos
    const campos = ['lotePercentualNome', 'lotePercentualValor'];
    campos.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.value = '';
    });
    
    // Abrir modal
    window.LoteModalManager.open('lotePercentualModal');
};

// Override do openModal e closeModal globais para lotes
window.openModal = function(modalId) {
    console.log('openModal chamado:', modalId);
    
    if (modalId === 'loteDataModal' || modalId === 'lotePercentualModal' || 
        modalId === 'editLoteDataModal' || modalId === 'editLotePercentualModal') {
        window.LoteModalManager.open(modalId);
    } else {
        // Para outros modais, usar sistema original se existir
        if (window.modalManager) {
            window.modalManager.open(modalId);
        } else {
            console.warn('Modal manager não encontrado para:', modalId);
        }
    }
};

window.closeModal = function(modalId) {
    window.LoteModalManager.close();
};

// Função auxiliar
function formatDateTimeLocal(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

console.log('Sistema definitivo de modais de lotes carregado');