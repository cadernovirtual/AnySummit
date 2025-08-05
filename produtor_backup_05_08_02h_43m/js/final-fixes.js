/**
 * Correções finais para lotes e endereço
 */

// Função para buscar endereço manualmente
window.searchAddressManual = function() {
    const addressSearch = document.getElementById('addressSearch');
    if (addressSearch && addressSearch.value.trim().length >= 3) {
        // Disparar evento de input para ativar a busca
        addressSearch.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        customDialog.alert('Digite pelo menos 3 caracteres para buscar.', 'Atenção');
    }
};

// Corrigir problema dos modais abrindo fora do centro
document.addEventListener('DOMContentLoaded', function() {
    // Override melhorado das funções de lote
    const fixModalPosition = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            // Garantir que o modal comece invisível
            modal.style.display = 'none';
            modal.classList.remove('show');
            
            // Aguardar um frame e então posicionar
            requestAnimationFrame(() => {
                modal.style.position = 'fixed';
                modal.style.top = '50%';
                modal.style.left = '50%';
                modal.style.transform = 'translate(-50%, -50%)';
                modal.style.zIndex = '1050';
                modal.style.display = 'block';
                
                // Adicionar classe show após posicionar
                requestAnimationFrame(() => {
                    modal.classList.add('show');
                });
            });
        }
    };
    
    // Override final das funções
    window.adicionarLotePorData = function() {
        console.log('Abrindo modal de lote por data (corrigido)');
        
        const modal = document.getElementById('loteDataModal');
        if (!modal) {
            customDialog.alert('Erro: Modal de lote por data não encontrado!', 'Erro');
            return;
        }
        
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
                customDialog.alert('Não é possível adicionar mais lotes. A data limite foi atingida.', 'Aviso');
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
        
        // Abrir modal corretamente
        fixModalPosition('loteDataModal');
        
        // Criar backdrop
        let backdrop = document.querySelector('.modal-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(backdrop);
        }
        
        document.body.classList.add('modal-open');
    };
    
    window.adicionarLotePorPercentual = function() {
        console.log('Abrindo modal de lote por percentual (corrigido)');
        
        const modal = document.getElementById('lotePercentualModal');
        if (!modal) {
            customDialog.alert('Erro: Modal de lote por percentual não encontrado!', 'Erro');
            return;
        }
        
        // Limpar campos
        const campos = ['lotePercentualNome', 'lotePercentualValor'];
        campos.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) campo.value = '';
        });
        
        // Abrir modal corretamente
        fixModalPosition('lotePercentualModal');
        
        // Criar backdrop
        let backdrop = document.querySelector('.modal-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(backdrop);
        }
        
        document.body.classList.add('modal-open');
    };
});

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

console.log('Correções finais carregadas');