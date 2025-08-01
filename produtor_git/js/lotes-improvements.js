// =====================================================
// MELHORIAS NO SISTEMA DE LOTES - ANYSUMMIT
// =====================================================

console.log('🔧 Aplicando melhorias no sistema de lotes...');

// 1. CORRIGIR CAMPO READONLY COM FUNDO BRANCO
const fixReadonlyStyle = () => {
    const style = document.createElement('style');
    style.textContent = `
        /* Corrigir campos readonly nos lotes */
        .lote-modal input[readonly] {
            background-color: #f8f9fa !important;
            color: #495057 !important;
            cursor: not-allowed !important;
        }
        
        /* Remover quadros desnecessários dos lotes por percentual */
        .lote-card.por-percentual .lote-info > span:nth-child(3),
        .lote-card.por-percentual .lote-info > span:nth-child(4) {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
};

// 2. AJUSTAR DATA DE INÍCIO COM +1 MINUTO
const ajustarDataInicioLote = () => {
    const originalCalcularDataInicio = window.calcularDataInicioAutomatica;
    
    window.calcularDataInicioAutomatica = function() {
        console.log('📅 Calculando data de início ajustada...');
        
        const lotes = obterTodosLotesPorData();
        if (lotes.length === 0) {
            // Primeiro lote - usar data do evento
            const eventStartDate = document.getElementById('startDateTime')?.value;
            if (eventStartDate) {
                document.getElementById('loteDataInicio').value = eventStartDate;
            }
            return;
        }
        
        // Pegar a última data de fim e adicionar 1 minuto
        const ultimoLote = lotes[lotes.length - 1];
        let ultimaDataFim;
        
        if (ultimoLote.dataFim) {
            ultimaDataFim = new Date(ultimoLote.dataFim);
        } else {
            // Se não tiver data fim no objeto, tentar pegar do DOM
            const loteCards = document.querySelectorAll('.lote-card.por-data');
            if (loteCards.length > 0) {
                const lastCard = loteCards[loteCards.length - 1];
                const dataFimText = lastCard.querySelector('.lote-info span:nth-child(2)')?.textContent;
                if (dataFimText) {
                    const dataFimStr = dataFimText.replace('Fim: ', '');
                    ultimaDataFim = new Date(dataFimStr);
                }
            }
        }
        
        if (ultimaDataFim && !isNaN(ultimaDataFim)) {
            // Adicionar 1 minuto
            ultimaDataFim.setMinutes(ultimaDataFim.getMinutes() + 1);
            
            // Formatar para datetime-local
            const year = ultimaDataFim.getFullYear();
            const month = String(ultimaDataFim.getMonth() + 1).padStart(2, '0');
            const day = String(ultimaDataFim.getDate()).padStart(2, '0');
            const hours = String(ultimaDataFim.getHours()).padStart(2, '0');
            const minutes = String(ultimaDataFim.getMinutes()).padStart(2, '0');
            
            const novaDataInicio = `${year}-${month}-${day}T${hours}:${minutes}`;
            document.getElementById('loteDataInicio').value = novaDataInicio;
            
            console.log('✅ Nova data de início:', novaDataInicio);
        }
    };
};

// 3. REMOVER QUADROS DESNECESSÁRIOS (já feito via CSS acima)

// 4. VALIDAR LOTE 100% NO AVANÇAR
const adicionarValidacaoLote100 = () => {
    // Sobrescrever ou adicionar à validação existente
    const originalValidateStep = window.validateStep;
    
    window.validateStep = function(stepNumber) {
        // Chamar validação original primeiro
        let isValid = true;
        if (originalValidateStep) {
            isValid = originalValidateStep.call(this, stepNumber);
        }
        
        // Adicionar validação específica para step 5 (lotes)
        if (stepNumber === 5 && isValid) {
            console.log('🔍 Validando lotes por percentual...');
            
            // Verificar se há lotes por percentual
            const lotesPorPercentual = document.querySelectorAll('.lote-card.por-percentual');
            if (lotesPorPercentual.length > 0) {
                // Verificar se algum tem 100%
                let tem100 = false;
                
                lotesPorPercentual.forEach(card => {
                    const percentualText = card.querySelector('.percentual-value')?.textContent;
                    if (percentualText) {
                        const percentual = parseInt(percentualText.replace('%', ''));
                        if (percentual === 100) {
                            tem100 = true;
                        }
                    }
                });
                
                if (!tem100) {
                    // Mostrar mensagem de erro
                    const validationMessage = document.getElementById('validation-step-5');
                    if (validationMessage) {
                        validationMessage.style.display = 'block';
                        validationMessage.textContent = 'É necessário ter pelo menos um lote com 100% de vendas!';
                    } else {
                        alert('É necessário ter pelo menos um lote com 100% de vendas!');
                    }
                    return false;
                }
            }
        }
        
        return isValid;
    };
};

// 5. NUMERAÇÃO SEQUENCIAL INDEPENDENTE
const corrigirNumeracaoLotes = () => {
    // Sobrescrever a função de criar lote
    const originalCriarLotePorData = window.criarLotePorData;
    const originalCriarLotePorPercentual = window.criarLotePorPercentual;
    
    // Contadores independentes
    let contadorLotesData = 1;
    let contadorLotesPercentual = 1;
    
    // Contar lotes existentes ao iniciar
    document.addEventListener('DOMContentLoaded', () => {
        const lotesData = document.querySelectorAll('.lote-card.por-data');
        const lotesPercentual = document.querySelectorAll('.lote-card.por-percentual');
        
        if (lotesData.length > 0) {
            contadorLotesData = lotesData.length + 1;
        }
        if (lotesPercentual.length > 0) {
            contadorLotesPercentual = lotesPercentual.length + 1;
        }
    });
    
    // Modificar criação de lotes por data
    window.criarLotePorData = function() {
        console.log('📅 Criando lote por data número:', contadorLotesData);
        
        // Validar campos primeiro
        const nomeLote = document.getElementById('loteNome')?.value || `Lote ${contadorLotesData}`;
        const dataInicio = document.getElementById('loteDataInicio')?.value;
        const dataFim = document.getElementById('loteDataFim')?.value;
        
        if (!dataInicio || !dataFim) {
            alert('Por favor, preencha as datas de início e fim do lote.');
            return;
        }
        
        // Se não foi preenchido nome, usar numeração sequencial
        const nomeAtualizado = nomeLote || `Lote ${contadorLotesData}`;
        if (document.getElementById('loteNome')) {
            document.getElementById('loteNome').value = nomeAtualizado;
        }
        
        // Chamar função original se existir
        if (originalCriarLotePorData) {
            originalCriarLotePorData.call(this);
        }
        
        // Incrementar contador apenas se o lote foi criado com sucesso
        setTimeout(() => {
            const novosLotes = document.querySelectorAll('.lote-card.por-data');
            if (novosLotes.length >= contadorLotesData) {
                contadorLotesData++;
            }
        }, 100);
    };
    
    // Modificar criação de lotes por percentual
    window.criarLotePorPercentual = function() {
        console.log('📊 Criando lote por percentual número:', contadorLotesPercentual);
        
        // Validar campos primeiro
        const nomeLote = document.getElementById('loteNomePercentual')?.value || `Lote ${contadorLotesPercentual}`;
        const percentual = document.getElementById('lotePercentual')?.value;
        
        if (!percentual) {
            alert('Por favor, preencha o percentual de vendas.');
            return;
        }
        
        // Se não foi preenchido nome, usar numeração sequencial
        const nomeAtualizado = nomeLote || `Lote ${contadorLotesPercentual}`;
        if (document.getElementById('loteNomePercentual')) {
            document.getElementById('loteNomePercentual').value = nomeAtualizado;
        }
        
        // Chamar função original se existir
        if (originalCriarLotePorPercentual) {
            originalCriarLotePorPercentual.call(this);
        }
        
        // Incrementar contador apenas se o lote foi criado com sucesso
        setTimeout(() => {
            const novosLotes = document.querySelectorAll('.lote-card.por-percentual');
            if (novosLotes.length >= contadorLotesPercentual) {
                contadorLotesPercentual++;
            }
        }, 100);
    };
};

// APLICAR TODAS AS CORREÇÕES
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Aplicando melhorias nos lotes...');
    
    fixReadonlyStyle();
    ajustarDataInicioLote();
    adicionarValidacaoLote100();
    corrigirNumeracaoLotes();
    
    console.log('✅ Melhorias aplicadas com sucesso!');
});

// Aplicar também se o DOM já estiver carregado
if (document.readyState !== 'loading') {
    fixReadonlyStyle();
    ajustarDataInicioLote();
    adicionarValidacaoLote100();
    corrigirNumeracaoLotes();
}