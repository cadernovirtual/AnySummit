// =====================================================
// CORREÇÕES ULTRA ESPECÍFICAS - ANYSUMMIT
// =====================================================

console.log('💥💥💥 CORREÇÕES ULTRA ESPECÍFICAS ATIVADAS 💥💥💥');

// =====================================================
// 1. FORÇAR DATA +1 MINUTO NO MOMENTO DO CLIQUE
// =====================================================
document.addEventListener('click', function(e) {
    // Detectar clique em qualquer botão de criar lote
    const target = e.target;
    const isLoteButton = target.textContent && 
                        (target.textContent.includes('Criar lote') || 
                         target.textContent.includes('Salvar lote') ||
                         target.classList.contains('btn-primary'));
    
    if (isLoteButton) {
        console.log('🎯 Botão de lote clicado!');
        
        // Aplicar cálculo imediatamente
        setTimeout(() => {
            calcularDataForcado();
        }, 100);
    }
}, true);

// Função forçada de cálculo de data
function calcularDataForcado() {
    console.log('⏰ CALCULANDO DATA +1 MINUTO FORÇADO');
    
    // Coletar TODAS as datas de fim existentes
    const datasEncontradas = [];
    
    document.querySelectorAll('.lote-card').forEach((card, index) => {
        // Procurar por "Fim:" no texto
        const textoCompleto = card.innerText || card.textContent || '';
        const matchFim = textoCompleto.match(/Fim:\s*(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
        
        if (matchFim) {
            const [_, dia, mes, ano, hora, minuto] = matchFim;
            const dataFim = new Date(
                parseInt(ano), 
                parseInt(mes) - 1, 
                parseInt(dia), 
                parseInt(hora), 
                parseInt(minuto)
            );
            
            datasEncontradas.push({
                card: index,
                data: dataFim,
                texto: matchFim[0]
            });
            
            console.log(`📅 Lote ${index + 1} - Fim: ${dia}/${mes}/${ano} ${hora}:${minuto}`);
        }
    });
    
    let novaDataInicio;
    
    if (datasEncontradas.length > 0) {
        // Encontrar a data mais recente
        const maisRecente = datasEncontradas.reduce((max, item) => 
            item.data > max.data ? item : max
        );
        
        // Adicionar EXATAMENTE 60 segundos
        novaDataInicio = new Date(maisRecente.data.getTime() + 60000);
        
        console.log('📅 Data mais recente:', maisRecente.data);
        console.log('📅 Nova data (+1 min):', novaDataInicio);
    } else {
        // Sem lotes, usar agora
        novaDataInicio = new Date();
        console.log('📅 Sem lotes anteriores, usando data atual');
    }
    
    // Formatar para input
    const formatarParaInput = (date) => {
        const ano = date.getFullYear();
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const dia = String(date.getDate()).padStart(2, '0');
        const hora = String(date.getHours()).padStart(2, '0');
        const minuto = String(date.getMinutes()).padStart(2, '0');
        return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
    };
    
    const valorFormatado = formatarParaInput(novaDataInicio);
    
    // Atualizar TODOS os campos de data início
    ['loteDataInicio', 'lotePercentualInicio'].forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.value = valorFormatado;
            console.log(`✅ ${id} = ${valorFormatado}`);
            
            // Forçar evento change
            campo.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}

// Chamar ao abrir modais
const originalOpenModal = window.openModal;
window.openModal = function(modalId) {
    console.log('📂 Abrindo modal:', modalId);
    
    // Chamar função original
    if (originalOpenModal) {
        originalOpenModal.apply(this, arguments);
    }
    
    // Se for modal de lote, calcular data
    if (modalId === 'loteDataModal' || modalId === 'lotePercentualModal') {
        setTimeout(calcularDataForcado, 200);
    }
    
    // Se for modal de combo, carregar lotes
    if (modalId === 'comboTicketModal') {
        setTimeout(carregarLotesComboForcado, 200);
    }
};

// =====================================================
// 2. NUMERAÇÃO INDEPENDENTE DOS LOTES
// =====================================================
let contadorLoteData = 1;
let contadorLotePercentual = 1;

// Interceptar criação de lotes para usar numeração correta
const originalCreateLote = window.createLote || window.criarLote;
if (originalCreateLote) {
    window.createLote = window.criarLote = function(tipo) {
        console.log('🔢 Criando lote tipo:', tipo);
        
        // Contar lotes existentes do tipo
        const selectorTipo = tipo === 'data' ? '.lote-card.por-data' : '.lote-card.por-percentual';
        const lotesExistentes = document.querySelectorAll(selectorTipo).length;
        const numeroLote = lotesExistentes + 1;
        
        // Chamar função original
        const resultado = originalCreateLote.apply(this, arguments);
        
        // Corrigir nome após criação
        setTimeout(() => {
            const ultimoLote = Array.from(document.querySelectorAll(selectorTipo)).pop();
            if (ultimoLote) {
                const nomeElement = ultimoLote.querySelector('.lote-nome');
                if (nomeElement) {
                    nomeElement.textContent = `${numeroLote}º Lote`;
                    console.log(`✅ Lote renomeado para: ${numeroLote}º Lote`);
                }
            }
        }, 100);
        
        return resultado;
    };
}

// =====================================================
// 3. VALIDAÇÃO FORÇADA DO LOTE 100%
// =====================================================
// Interceptar nextStep diretamente
const originalNextStep = window.nextStep;
window.nextStep = function() {
    const currentStep = window.currentStep || window.AnySummit?.Wizard?.currentStep || 1;
    
    console.log('➡️ NextStep do step:', currentStep);
    
    if (currentStep === 5) {
        // Validar lotes
        const temLotes = document.querySelectorAll('.lote-card').length > 0;
        if (!temLotes) {
            alert('❌ É necessário criar pelo menos um lote!');
            return false;
        }
        
        // Validar 100% se tiver lotes percentuais
        const lotesPercentuais = document.querySelectorAll('.lote-card.por-percentual');
        if (lotesPercentuais.length > 0) {
            let tem100 = false;
            
            lotesPercentuais.forEach((lote, idx) => {
                const texto = lote.textContent || '';
                // Procurar por "100%" em qualquer lugar do texto
                if (texto.includes('100%') || texto.includes('100 %')) {
                    tem100 = true;
                    console.log(`✅ Lote ${idx + 1} tem 100%`);
                }
            });
            
            if (!tem100) {
                alert('❌ É obrigatório ter pelo menos um lote com 100% de vendas!\n\nConfigure um lote para ativar quando 100% dos ingressos forem vendidos.');
                return false;
            }
        }
    }
    
    // Chamar original se passou
    if (originalNextStep) {
        return originalNextStep.apply(this, arguments);
    }
};

// =====================================================
// 4. CARREGAR LOTES NO COMBO FORÇADO
// =====================================================
function carregarLotesComboForcado() {
    console.log('📦 CARREGANDO LOTES NO COMBO (FORÇADO)');
    
    const selectLote = document.getElementById('comboTicketLote');
    if (!selectLote) {
        console.error('❌ Select comboTicketLote não encontrado!');
        return;
    }
    
    // Limpar select
    selectLote.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Buscar todos os lotes
    const loteCards = document.querySelectorAll('.lote-card');
    console.log(`📋 ${loteCards.length} lotes encontrados`);
    
    if (loteCards.length === 0) {
        selectLote.innerHTML = '<option value="">Nenhum lote cadastrado</option>';
        return;
    }
    
    loteCards.forEach((card, index) => {
        const loteId = card.getAttribute('data-lote-id') || `lote_${index + 1}`;
        const nomeElement = card.querySelector('.lote-nome');
        const loteNome = nomeElement ? nomeElement.textContent : `Lote ${index + 1}`;
        
        const option = document.createElement('option');
        option.value = loteId;
        option.textContent = loteNome;
        option.setAttribute('data-lote-index', index);
        
        selectLote.appendChild(option);
        console.log(`✅ Adicionado: ${loteNome} (${loteId})`);
    });
    
    // Forçar evento change
    selectLote.dispatchEvent(new Event('change', { bubbles: true }));
}

// Interceptar abertura do modal de combo
document.addEventListener('click', function(e) {
    if (e.target.id === 'addComboTicket' || 
        (e.target.textContent && e.target.textContent.includes('Adicionar Combo'))) {
        console.log('🎯 Botão combo clicado!');
        setTimeout(carregarLotesComboForcado, 500);
    }
}, true);

// =====================================================
// 5. PREENCHER DATAS DO INGRESSO COM DATAS DO LOTE
// =====================================================
function configurarPreenchimentoDatas() {
    // Para ingresso pago
    const selectLotePago = document.getElementById('paidTicketLote');
    if (selectLotePago && !selectLotePago._datasConfiguradas) {
        selectLotePago._datasConfiguradas = true;
        
        selectLotePago.addEventListener('change', function() {
            preencherDatasDoLote('paid', this.value);
        });
    }
    
    // Para ingresso gratuito
    const selectLoteGratuito = document.getElementById('freeTicketLote');
    if (selectLoteGratuito && !selectLoteGratuito._datasConfiguradas) {
        selectLoteGratuito._datasConfiguradas = true;
        
        selectLoteGratuito.addEventListener('change', function() {
            preencherDatasDoLote('free', this.value);
        });
    }
}

function preencherDatasDoLote(tipoIngresso, loteId) {
    console.log(`📅 Preenchendo datas do lote ${loteId} para ingresso ${tipoIngresso}`);
    
    if (!loteId) return;
    
    // Encontrar o lote pelo ID
    const loteCard = document.querySelector(`[data-lote-id="${loteId}"]`);
    if (!loteCard) {
        console.error('❌ Lote não encontrado:', loteId);
        return;
    }
    
    // Extrair datas do lote
    const textoLote = loteCard.textContent || '';
    
    // Procurar por "Início: DD/MM/YYYY HH:MM"
    const matchInicio = textoLote.match(/Início:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/);
    const matchFim = textoLote.match(/Fim:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/);
    
    if (matchInicio && matchFim) {
        const dataInicio = matchInicio[1];
        const dataFim = matchFim[1];
        
        console.log(`📅 Datas encontradas - Início: ${dataInicio}, Fim: ${dataFim}`);
        
        // Converter para formato datetime-local
        const converterData = (dataStr) => {
            const match = dataStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
            if (match) {
                const [_, dia, mes, ano, hora, minuto] = match;
                return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
            }
            return '';
        };
        
        const inicioFormatado = converterData(dataInicio);
        const fimFormatado = converterData(dataFim);
        
        // Preencher campos corretos baseado no tipo
        if (tipoIngresso === 'paid') {
            const campoInicio = document.getElementById('paidSaleStart');
            const campoFim = document.getElementById('paidSaleEnd');
            
            if (campoInicio) {
                campoInicio.value = inicioFormatado;
                console.log('✅ Data início preenchida (pago):', inicioFormatado);
            }
            if (campoFim) {
                campoFim.value = fimFormatado;
                console.log('✅ Data fim preenchida (pago):', fimFormatado);
            }
        } else if (tipoIngresso === 'free') {
            const campoInicio = document.getElementById('freeSaleStart');
            const campoFim = document.getElementById('freeSaleEnd');
            
            if (campoInicio) {
                campoInicio.value = inicioFormatado;
                console.log('✅ Data início preenchida (gratuito):', inicioFormatado);
            }
            if (campoFim) {
                campoFim.value = fimFormatado;
                console.log('✅ Data fim preenchida (gratuito):', fimFormatado);
            }
        }
    }
}

// =====================================================
// INICIALIZAÇÃO E MONITORAMENTO
// =====================================================
let checkInterval = setInterval(() => {
    // Configurar preenchimento de datas
    configurarPreenchimentoDatas();
    
    // Verificar se modais existem
    const modalLoteData = document.getElementById('loteDataModal');
    const modalCombo = document.getElementById('comboTicketModal');
    
    if (modalLoteData && modalCombo) {
        console.log('✅ Todos os elementos necessários encontrados');
        clearInterval(checkInterval);
    }
}, 1000);

// Aplicar correções ao carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Carregado - Aplicando correções finais');
    
    setTimeout(() => {
        configurarPreenchimentoDatas();
        calcularDataForcado();
    }, 1000);
});

console.log('✅ CORREÇÕES ULTRA ESPECÍFICAS CARREGADAS!');