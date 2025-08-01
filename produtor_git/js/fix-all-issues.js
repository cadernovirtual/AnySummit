// =====================================================
// CORREÇÕES COMPLETAS - ANYSUMMIT
// =====================================================

console.log('🔧 Aplicando correções completas...');

// =====================================================
// 1. CORRIGIR CAMPO DATA READONLY (FUNDO BRANCO)
// =====================================================
const fixReadonlyStyle = () => {
    const style = document.createElement('style');
    style.textContent = `
        /* Corrigir campos readonly - fundo escuro */
        input[readonly], 
        input[readonly]:focus,
        .form-control[readonly],
        .form-control[readonly]:focus {
            background-color: #2d2d3d !important;
            color: #e0e0e0 !important;
            opacity: 0.8 !important;
            cursor: not-allowed !important;
        }
        
        /* Específico para data de início dos lotes */
        #loteDataInicio[readonly],
        #lotePercentualInicio[readonly],
        .lote-data-inicio[readonly] {
            background-color: #2d2d3d !important;
            color: #e0e0e0 !important;
        }
    `;
    document.head.appendChild(style);
    console.log('✅ Estilo de campos readonly corrigido');
};

// =====================================================
// 2. CORRIGIR CÁLCULO DE DATA INICIAL (+1 MINUTO)
// =====================================================
window.calcularDataInicioLote = function() {
    console.log('📅 Calculando data de início do lote...');
    
    const lotes = document.querySelectorAll('.lote-card');
    let ultimaDataFim = null;
    
    // Encontrar a última data fim dos lotes existentes
    lotes.forEach(lote => {
        const dataFimStr = lote.querySelector('.lote-info span:nth-child(2)')?.textContent;
        if (dataFimStr && dataFimStr.includes('Fim:')) {
            const dataFim = dataFimStr.replace('Fim: ', '').trim();
            if (dataFim && dataFim !== 'N/A') {
                // Converter para objeto Date
                const [data, hora] = dataFim.split(' ');
                const [dia, mes, ano] = data.split('/');
                const dataObj = new Date(`${ano}-${mes}-${dia}T${hora}:00`);
                
                if (!ultimaDataFim || dataObj > ultimaDataFim) {
                    ultimaDataFim = dataObj;
                }
            }
        }
    });
    
    let novaDataInicio;
    
    if (ultimaDataFim) {
        // Adicionar 1 minuto à última data fim
        novaDataInicio = new Date(ultimaDataFim.getTime() + 60000); // +1 minuto
        console.log('📅 Última data fim encontrada:', ultimaDataFim);
        console.log('📅 Nova data início (+ 1min):', novaDataInicio);
    } else {
        // Se não houver lotes, usar data/hora atual
        novaDataInicio = new Date();
        console.log('📅 Nenhum lote encontrado, usando data atual');
    }
    
    // Formatar para datetime-local
    const ano = novaDataInicio.getFullYear();
    const mes = String(novaDataInicio.getMonth() + 1).padStart(2, '0');
    const dia = String(novaDataInicio.getDate()).padStart(2, '0');
    const hora = String(novaDataInicio.getHours()).padStart(2, '0');
    const minuto = String(novaDataInicio.getMinutes()).padStart(2, '0');
    
    const dataFormatada = `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    
    // Atualizar campos de data início
    const campoDataInicio = document.getElementById('loteDataInicio');
    const campoPercentualInicio = document.getElementById('lotePercentualInicio');
    
    if (campoDataInicio) {
        campoDataInicio.value = dataFormatada;
        console.log('✅ Data início atualizada:', dataFormatada);
    }
    
    if (campoPercentualInicio) {
        campoPercentualInicio.value = dataFormatada;
    }
    
    return dataFormatada;
};

// =====================================================
// 3. REMOVER QUADROS DE LOTES POR PERCENTUAL
// =====================================================
const removePercentualBoxes = () => {
    const style = document.createElement('style');
    style.textContent = `
        /* Ocultar quadros de total/restante para lotes por percentual */
        #percentualSummary {
            display: none !important;
        }
        
        .lote-summary-box {
            display: none !important;
        }
        
        /* Ajustar espaçamento */
        #lotePercentualModal .modal-body {
            padding-bottom: 20px !important;
        }
    `;
    document.head.appendChild(style);
    console.log('✅ Quadros de percentual removidos');
};

// =====================================================
// 4. VALIDAÇÃO DE LOTE 100%
// =====================================================
window.validarLotesPercentual = function() {
    const lotes = document.querySelectorAll('.lote-card.por-percentual');
    if (lotes.length === 0) return true; // Se não há lotes percentuais, OK
    
    let tem100 = false;
    
    lotes.forEach(lote => {
        const percentualText = lote.querySelector('.percentual-value')?.textContent;
        if (percentualText) {
            const percentual = parseInt(percentualText.replace('%', ''));
            if (percentual === 100) {
                tem100 = true;
            }
        }
    });
    
    if (!tem100) {
        alert('É necessário ter pelo menos um lote com 100% de vendas!');
        return false;
    }
    
    return true;
};

// Sobrescrever validação do Step 5
const originalValidateStep = window.validateStep;
window.validateStep = function(stepNumber) {
    if (stepNumber === 5) {
        // Validar se há pelo menos um lote
        const loteCards = document.querySelectorAll('.lote-card');
        const hasLotesDOM = loteCards && loteCards.length > 0;
        const hasLotesArray = (window.lotes && window.lotes.length > 0) || 
                            (window.lotesData && window.lotesData.length > 0);
        
        if (!hasLotesDOM && !hasLotesArray) {
            const validationMessage = document.getElementById(`validation-step-${stepNumber}`);
            if (validationMessage) {
                validationMessage.style.display = 'block';
                validationMessage.textContent = 'É necessário criar pelo menos um lote!';
            } else {
                alert('É necessário criar pelo menos um lote!');
            }
            return false;
        }
        
        // Validar se tem lote 100%
        if (!validarLotesPercentual()) {
            return false;
        }
        
        return true;
    }
    
    // Para outros steps, usar validação original
    return originalValidateStep ? originalValidateStep.call(this, stepNumber) : true;
};

// =====================================================
// 5. NUMERAÇÃO SEQUENCIAL INDEPENDENTE
// =====================================================
window.contadorLotesData = 1;
window.contadorLotesPercentual = 1;

// Sobrescrever função de gerar nome do lote
window.gerarNomeLote = function(tipo) {
    if (tipo === 'data') {
        return `${window.contadorLotesData}º Lote`;
    } else {
        return `${window.contadorLotesPercentual}º Lote`;
    }
};

// Interceptar criação de lotes
const interceptarCriacaoLote = () => {
    // Para lote por data
    const btnCriarLoteData = document.querySelector('#loteDataModal .btn-primary');
    if (btnCriarLoteData) {
        btnCriarLoteData.addEventListener('click', function() {
            setTimeout(() => {
                window.contadorLotesData++;
            }, 100);
        });
    }
    
    // Para lote por percentual
    const btnCriarLotePercentual = document.querySelector('#lotePercentualModal .btn-primary');
    if (btnCriarLotePercentual) {
        btnCriarLotePercentual.addEventListener('click', function() {
            setTimeout(() => {
                window.contadorLotesPercentual++;
            }, 100);
        });
    }
};

// =====================================================
// 6. IMPORTAR FUNÇÕES DOS INGRESSOS
// =====================================================

// Primeiro, vamos garantir que os modais abram corretamente
window.abrirModalIngressoPago = function() {
    console.log('🎫 Abrindo modal de ingresso pago...');
    const modal = document.getElementById('paidTicketModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
        
        // Carregar lotes
        setTimeout(() => {
            if (typeof carregarLotesIngressoPago === 'function') {
                carregarLotesIngressoPago();
            } else if (typeof carregarLotesNoModal === 'function') {
                carregarLotesNoModal();
            }
            
            // Limpar campos
            document.getElementById('paidTicketTitle').value = '';
            document.getElementById('paidTicketPrice').value = '';
            document.getElementById('paidTicketQuantity').value = '1';
            
            // Inicializar máscara de preço
            if (typeof initPriceInput === 'function') {
                initPriceInput();
            }
        }, 100);
    }
};

window.abrirModalIngressoGratuito = function() {
    console.log('🎫 Abrindo modal de ingresso gratuito...');
    const modal = document.getElementById('freeTicketModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
        
        // Carregar lotes
        setTimeout(() => {
            if (typeof carregarLotesNoModalFree === 'function') {
                carregarLotesNoModalFree();
            }
            
            // Limpar campos
            document.getElementById('freeTicketTitle').value = '';
            document.getElementById('freeTicketQuantity').value = '1';
        }, 100);
    }
};

window.abrirModalIngressoCombo = function() {
    console.log('🎫 Abrindo modal de ingresso combo...');
    const modal = document.getElementById('comboTicketModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
        
        // Inicializar combo
        setTimeout(() => {
            if (typeof initComboPriceInput === 'function') {
                initComboPriceInput();
            }
            if (typeof carregarLotesNoModalCombo === 'function') {
                carregarLotesNoModalCombo();
            }
            
            // Limpar campos
            window.comboItems = [];
            if (window.updateComboItemsList) {
                window.updateComboItemsList();
            }
        }, 100);
    }
};

// Reconectar botões aos eventos corretos
const reconectarBotoesIngressos = () => {
    console.log('🔗 Reconectando botões de ingressos...');
    
    // Botão ingresso pago
    const btnPago = document.getElementById('addPaidTicket');
    if (btnPago) {
        // Remover listeners antigos
        const newBtnPago = btnPago.cloneNode(true);
        btnPago.parentNode.replaceChild(newBtnPago, btnPago);
        
        // Adicionar novo listener
        newBtnPago.addEventListener('click', function(e) {
            e.preventDefault();
            abrirModalIngressoPago();
        });
        console.log('✅ Botão ingresso pago reconectado');
    }
    
    // Botão ingresso gratuito
    const btnGratuito = document.getElementById('addFreeTicket');
    if (btnGratuito) {
        // Remover listeners antigos
        const newBtnGratuito = btnGratuito.cloneNode(true);
        btnGratuito.parentNode.replaceChild(newBtnGratuito, btnGratuito);
        
        // Adicionar novo listener
        newBtnGratuito.addEventListener('click', function(e) {
            e.preventDefault();
            abrirModalIngressoGratuito();
        });
        console.log('✅ Botão ingresso gratuito reconectado');
    }
    
    // Botão combo
    const btnCombo = document.getElementById('addComboTicket');
    if (btnCombo) {
        // Remover listeners antigos
        const newBtnCombo = btnCombo.cloneNode(true);
        btnCombo.parentNode.replaceChild(newBtnCombo, btnCombo);
        
        // Adicionar novo listener
        newBtnCombo.addEventListener('click', function(e) {
            e.preventDefault();
            abrirModalIngressoCombo();
        });
        console.log('✅ Botão combo reconectado');
    }
};

// =====================================================
// INICIALIZAÇÃO
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando correções completas...');
    
    // Aplicar correções de estilo
    fixReadonlyStyle();
    removePercentualBoxes();
    
    // Interceptar criação de lotes
    interceptarCriacaoLote();
    
    // Reconectar botões após um delay
    setTimeout(() => {
        reconectarBotoesIngressos();
        
        // Atualizar datas ao abrir modais de lote
        const btnAddLoteData = document.querySelector('[onclick*="openModal(\'loteDataModal\')"]');
        if (btnAddLoteData) {
            btnAddLoteData.addEventListener('click', () => {
                setTimeout(calcularDataInicioLote, 100);
            });
        }
        
        const btnAddLotePercentual = document.querySelector('[onclick*="openModal(\'lotePercentualModal\')"]');
        if (btnAddLotePercentual) {
            btnAddLotePercentual.addEventListener('click', () => {
                setTimeout(calcularDataInicioLote, 100);
            });
        }
    }, 500);
    
    console.log('✅ Todas as correções aplicadas!');
});

// Expor funções globalmente
window.calcularDataInicioLote = calcularDataInicioLote;
window.validarLotesPercentual = validarLotesPercentual;