/**
 * Fix melhorado para modais de lotes
 * Corrige problemas de posicionamento e fechamento
 */

// Função auxiliar para formatar data
function formatDateTimeLocal(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Gerenciador de modais melhorado
class ModalManager {
    constructor() {
        this.activeModal = null;
        this.backdrop = null;
    }
    
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal ${modalId} não encontrado`);
            return;
        }
        
        // Fechar modal ativo se houver
        if (this.activeModal) {
            this.close();
        }
        
        // Criar backdrop se não existir
        if (!this.backdrop) {
            this.backdrop = document.createElement('div');
            this.backdrop.className = 'modal-backdrop fade';
            document.body.appendChild(this.backdrop);
        }
        
        // Mostrar backdrop
        this.backdrop.style.display = 'block';
        setTimeout(() => this.backdrop.classList.add('show'), 10);
        
        // Configurar e mostrar modal
        modal.style.display = 'block';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.zIndex = '1050';
        
        setTimeout(() => modal.classList.add('show'), 10);
        
        document.body.classList.add('modal-open');
        this.activeModal = modal;
        
        // Adicionar listeners para fechar
        this.addCloseListeners(modal);
    }
    
    close() {
        if (!this.activeModal) return;
        
        // Remover classes
        this.activeModal.classList.remove('show');
        document.body.classList.remove('modal-open');
        
        // Esconder depois da animação
        setTimeout(() => {
            if (this.activeModal) {
                this.activeModal.style.display = 'none';
                this.activeModal = null;
            }
            
            if (this.backdrop) {
                this.backdrop.classList.remove('show');
                setTimeout(() => {
                    if (this.backdrop && this.backdrop.parentNode) {
                        this.backdrop.parentNode.removeChild(this.backdrop);
                        this.backdrop = null;
                    }
                }, 300);
            }
        }, 300);
    }
    
    addCloseListeners(modal) {
        // Botões de fechar
        modal.querySelectorAll('.close-modal, .btn-cancel, [data-dismiss="modal"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.close();
            });
        });
        
        // Clique no backdrop
        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => this.close());
        }
    }
}

// Criar instância global
window.modalManager = new ModalManager();

// Override das funções globais
window.openModal = function(modalId) {
    window.modalManager.open(modalId);
};

window.closeModal = function(modalId) {
    window.modalManager.close();
};

// Override específico para lotes
window.adicionarLotePorData = function() {
    console.log('[FIX] Abrindo modal de lote por data');
    
    const modal = document.getElementById('loteDataModal');
    if (!modal) {
        customDialog.alert('Erro: Modal de lote por data não encontrado!', 'Erro');
        return;
    }
    
    // Calcular defaults
    const agora = new Date();
    const eventoDataInicio = document.getElementById('startDateTime')?.value;
    const eventoDataFim = document.getElementById('endDateTime')?.value;
    
    const loteDataInicio = document.getElementById('loteDataInicio');
    const loteDataFim = document.getElementById('loteDataFim');
    
    if (eventoDataInicio && loteDataInicio && loteDataFim) {
        const dataEventoInicio = new Date(eventoDataInicio);
        const dataEventoFim = eventoDataFim ? new Date(eventoDataFim) : new Date(dataEventoInicio);
        
        // Encontrar a maior data fim dos lotes existentes
        let maiorDataFim = agora;
        if (window.lotesData && window.lotesData.porData.length > 0) {
            window.lotesData.porData.forEach(lote => {
                const dataFimLote = new Date(lote.dataFim);
                if (dataFimLote > maiorDataFim) {
                    maiorDataFim = dataFimLote;
                }
            });
        }
        
        // Data início = exatamente a maior data fim encontrada
        const novaDataInicio = new Date(maiorDataFim);
        
        // Data fim = 1 dia antes do evento
        const dataLimite = new Date(Math.min(dataEventoInicio, dataEventoFim));
        dataLimite.setSeconds(dataLimite.getSeconds() - 1);
        
        // Verificar se ainda há espaço para novo lote
        if (novaDataInicio >= dataLimite) {
            customDialog.alert('Não é possível adicionar mais lotes. A data limite foi atingida (data do evento).', 'Aviso');
            return;
        }
        
        loteDataInicio.value = formatDateTimeLocal(novaDataInicio);
        
        // Data fim padrão
        const dataFimPadrao = new Date(novaDataInicio);
        dataFimPadrao.setDate(dataFimPadrao.getDate() + 7);
        
        if (dataFimPadrao > dataLimite) {
            loteDataFim.value = formatDateTimeLocal(dataLimite);
        } else {
            loteDataFim.value = formatDateTimeLocal(dataFimPadrao);
        }
        
        // Definir limites
        loteDataInicio.min = formatDateTimeLocal(novaDataInicio);
        loteDataInicio.max = formatDateTimeLocal(dataLimite);
        loteDataFim.min = formatDateTimeLocal(novaDataInicio);
        loteDataFim.max = formatDateTimeLocal(dataLimite);
    }
    
    // Limpar campos
    const loteDataNome = document.getElementById('loteDataNome');
    const loteDataDivulgar = document.getElementById('loteDataDivulgar');
    
    if (loteDataNome) loteDataNome.value = '';
    if (loteDataDivulgar) loteDataDivulgar.checked = true;
    
    // Abrir modal
    window.modalManager.open('loteDataModal');
};

window.adicionarLotePorPercentual = function() {
    console.log('[FIX] Abrindo modal de lote por percentual');
    
    const modal = document.getElementById('lotePercentualModal');
    if (!modal) {
        customDialog.alert('Erro: Modal de lote por percentual não encontrado!', 'Erro');
        return;
    }
    
    // Limpar campos
    const lotePercentualNome = document.getElementById('lotePercentualNome');
    const lotePercentualValor = document.getElementById('lotePercentualValor');
    const lotePercentualDivulgar = document.getElementById('lotePercentualDivulgar');
    
    if (lotePercentualNome) lotePercentualNome.value = '';
    if (lotePercentualValor) lotePercentualValor.value = '';
    if (lotePercentualDivulgar) lotePercentualDivulgar.checked = false;
    
    // Abrir modal
    window.modalManager.open('lotePercentualModal');
};

console.log('[FIX] Sistema de modais melhorado carregado');