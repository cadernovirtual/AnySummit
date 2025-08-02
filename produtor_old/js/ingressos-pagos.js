/**
 * Gerenciamento de Ingressos Pagos
 * AnySummit - Sistema de Gestão de Eventos
 */

// Variável global para armazenar os lotes carregados
let lotesCarregados = [];
let taxaServicoPadrao = 8; // Valor padrão caso não consiga buscar do banco
let loteAtualPercentual = null; // Armazenar percentual do lote selecionado

// Função para buscar taxa de serviço do banco
function buscarTaxaServico() {
    fetch('/produtor/ajax/buscar_taxa_servico.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                taxaServicoPadrao = data.taxa_servico;
                const taxaElement = document.getElementById('taxaPercentual');
                if (taxaElement) {
                    taxaElement.textContent = taxaServicoPadrao;
                }
            }
        })
        .catch(error => {
            console.error('Erro ao buscar taxa de serviço:', error);
            // Manter valor padrão em caso de erro
        });
}

// Função para formatar moeda
function formatarMoeda(valor) {
    // Garantir que o valor seja um número
    valor = parseFloat(valor) || 0;
    
    // Formatar com 2 casas decimais
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Função para parsear valor monetário
function parsearValorMonetario(valor) {
    if (!valor) return 0;
    // Remove tudo exceto números, vírgula e ponto
    valor = valor.replace(/[^\d,.-]/g, '');
    // Substitui vírgula por ponto
    valor = valor.replace(',', '.');
    return parseFloat(valor) || 0;
}

// Função para calcular valores do ingresso
function calcularValoresIngresso() {
    const precoInput = document.getElementById('paidTicketPrice');
    const taxaCheckbox = document.getElementById('paidTicketTaxaServico');
    const taxaValorInput = document.getElementById('paidTicketTaxaValor');
    const valorCompradorInput = document.getElementById('paidTicketValorComprador');
    const valorReceberInput = document.getElementById('paidTicketValorReceber');
    
    if (!precoInput || !taxaCheckbox || !taxaValorInput || !valorCompradorInput || !valorReceberInput) {
        console.error('Elementos de cálculo não encontrados');
        return;
    }
    
    // Obter valor numérico do campo já formatado
    const precoVenda = parsearValorMonetario(precoInput.value);
    const cobrarTaxa = taxaCheckbox.checked;
    
    let taxaValor = 0;
    let valorComprador = 0;
    let valorReceber = 0;
    
    if (precoVenda > 0) {
        if (cobrarTaxa) {
            // Taxa cobrada do cliente
            taxaValor = precoVenda * (taxaServicoPadrao / 100);
            valorComprador = precoVenda + taxaValor;
            valorReceber = precoVenda;
        } else {
            // Taxa absorvida pelo produtor
            taxaValor = precoVenda * (taxaServicoPadrao / 100);
            valorReceber = precoVenda - taxaValor;
            valorComprador = precoVenda;
        }
    }
    
    // Atualizar campos com formatação
    taxaValorInput.value = formatarMoeda(taxaValor);
    valorCompradorInput.value = formatarMoeda(valorComprador);
    valorReceberInput.value = formatarMoeda(valorReceber);
}

// Função para carregar lotes no dropdown do modal de ingresso pago
function carregarLotesNoModal() {
    console.log('Carregando lotes no modal de ingresso pago...');
    
    const selectLote = document.getElementById('paidTicketLote');
    if (!selectLote) {
        console.error('Select de lotes não encontrado!');
        return;
    }
    
    // Limpar opções existentes
    selectLote.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Primeiro tentar carregar lotes temporários (para novos eventos)
    carregarLotesTemporarios();
    
    // Se não houver lotes temporários, tentar buscar do banco
    if (lotesCarregados.length === 0) {
        // Obter evento_id do input hidden ou da URL
        let eventoId = null;
        const eventoIdInput = document.getElementById('evento_id');
        if (eventoIdInput && eventoIdInput.value) {
            eventoId = eventoIdInput.value;
        } else {
            // Tentar obter da URL
            const urlParams = new URLSearchParams(window.location.search);
            eventoId = urlParams.get('id');
        }
        
        if (eventoId) {
            // Fazer requisição AJAX para buscar lotes
            fetch(`/produtor/ajax/buscar_lotes.php?evento_id=${eventoId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.lotes && data.lotes.length > 0) {
                        lotesCarregados = data.lotes;
                        populateSelectLotes(data.lotes);
                    } else {
                        console.log('Nenhum lote encontrado no banco para este evento');
                    }
                })
                .catch(error => {
                    console.error('Erro na requisição:', error);
                });
        }
    }
}

// Função para carregar lotes temporários do cookie (para novos eventos)
function carregarLotesTemporarios() {
    console.log('Carregando lotes temporários...');
    
    // Verificar se existe a variável global lotesData
    if (typeof lotesData !== 'undefined') {
        const todosLotes = [];
        
        // Adicionar lotes por data
        if (lotesData.porData && lotesData.porData.length > 0) {
            lotesData.porData.forEach((lote, index) => {
                todosLotes.push({
                    id: lote.id || `temp_data_${index}`,
                    nome: lote.nome,
                    tipo: 'POR DATA',
                    data_inicio: lote.dataInicio,
                    data_fim: lote.dataFim,
                    percentual_venda: null
                });
            });
        }
        
        // Adicionar lotes por percentual
        if (lotesData.porPercentual && lotesData.porPercentual.length > 0) {
            lotesData.porPercentual.forEach((lote, index) => {
                todosLotes.push({
                    id: lote.id || `temp_perc_${index}`,
                    nome: lote.nome,
                    tipo: 'POR PERCENTUAL',
                    data_inicio: null,
                    data_fim: null,
                    percentual_venda: lote.percentual
                });
            });
        }
        
        if (todosLotes.length > 0) {
            lotesCarregados = todosLotes;
            populateSelectLotes(todosLotes);
        } else {
            console.log('Nenhum lote temporário encontrado');
        }
    } else {
        console.log('Variável lotesData não está definida');
    }
}

// Função para popular o select com os lotes
function populateSelectLotes(lotes) {
    const selectLote = document.getElementById('paidTicketLote');
    if (!selectLote) return;
    
    lotes.forEach(lote => {
        const option = document.createElement('option');
        option.value = lote.id;
        
        // Criar descrição do lote
        let descricao = `${lote.nome} - `;
        
        if (lote.tipo === 'POR DATA') {
            const dataInicio = formatarDataHora(lote.data_inicio);
            const dataFim = formatarDataHora(lote.data_fim);
            descricao += `Por Data (${dataInicio} até ${dataFim})`;
        } else if (lote.tipo === 'POR PERCENTUAL') {
            descricao += `Por Vendas (${lote.percentual_venda}% dos ingressos vendidos)`;
        }
        
        option.textContent = descricao;
        option.setAttribute('data-tipo', lote.tipo);
        option.setAttribute('data-inicio', lote.data_inicio || '');
        option.setAttribute('data-fim', lote.data_fim || '');
        option.setAttribute('data-percentual', lote.percentual_venda || '');
        
        selectLote.appendChild(option);
    });
}

// Função para formatar data e hora
function formatarDataHora(dataString) {
    if (!dataString) return '';
    
    const data = new Date(dataString);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    
    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

// Função para atualizar as datas do ingresso baseado no lote selecionado
function updatePaidTicketDates() {
    console.log('Atualizando datas do ingresso pago...');
    
    const selectLote = document.getElementById('paidTicketLote');
    const startInput = document.getElementById('paidSaleStart');
    const endInput = document.getElementById('paidSaleEnd');
    const titleSection = document.getElementById('paidTicketPeriodTitle');
    const quantidadeContainer = document.getElementById('quantidadeLoteContainer');
    
    if (!selectLote || !startInput || !endInput) {
        console.error('Elementos necessários não encontrados!');
        return;
    }
    
    const selectedOption = selectLote.options[selectLote.selectedIndex];
    
    if (!selectedOption || selectedOption.value === '') {
        // Limpar campos se nenhum lote selecionado
        startInput.value = '';
        endInput.value = '';
        startInput.setAttribute('readonly', true);
        endInput.setAttribute('readonly', true);
        titleSection.textContent = 'Período das vendas';
        if (quantidadeContainer) {
            quantidadeContainer.style.display = 'none';
        }
        loteAtualPercentual = null;
        return;
    }
    
    const tipo = selectedOption.getAttribute('data-tipo');
    const dataInicio = selectedOption.getAttribute('data-inicio');
    const dataFim = selectedOption.getAttribute('data-fim');
    const percentual = selectedOption.getAttribute('data-percentual');
    
    if (tipo === 'POR DATA') {
        // Preencher com as datas do lote e deixar readonly
        if (dataInicio) {
            startInput.value = formatarParaDateTimeLocal(dataInicio);
        }
        if (dataFim) {
            endInput.value = formatarParaDateTimeLocal(dataFim);
        }
        startInput.setAttribute('readonly', true);
        endInput.setAttribute('readonly', true);
        titleSection.textContent = 'Período das vendas (Datas associadas ao Lote escolhido)';
        if (quantidadeContainer) {
            quantidadeContainer.style.display = 'none';
        }
        loteAtualPercentual = null;
    } else if (tipo === 'POR PERCENTUAL') {
        // Preencher com data atual e data do evento, remover readonly
        const agora = new Date();
        startInput.value = formatarParaDateTimeLocal(agora.toISOString());
        
        // Tentar obter data do evento
        const eventoDataInput = document.getElementById('startDateTime');
        if (eventoDataInput && eventoDataInput.value) {
            endInput.value = eventoDataInput.value;
        } else {
            // Se não houver data do evento, usar 30 dias a partir de hoje
            const futuro = new Date();
            futuro.setDate(futuro.getDate() + 30);
            endInput.value = formatarParaDateTimeLocal(futuro.toISOString());
        }
        
        startInput.removeAttribute('readonly');
        endInput.removeAttribute('readonly');
        titleSection.textContent = 'Período das vendas';
        
        // Mostrar campo de quantidade do lote
        if (quantidadeContainer) {
            quantidadeContainer.style.display = 'block';
        }
        loteAtualPercentual = parseFloat(percentual) || 0;
        
        // Calcular quantidade do lote
        calcularQuantidadeLote();
    }
}

// Função para formatar data para datetime-local
function formatarParaDateTimeLocal(dataString) {
    if (!dataString) return '';
    
    const data = new Date(dataString);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    
    return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
}

// Adicionar listener para quando o modal for aberto
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado - configurando listeners para ingressos pagos');
    
    // Buscar taxa de serviço
    buscarTaxaServico();
    
    // Garantir que os lotes sejam carregados do cookie ao carregar a página
    if (typeof carregarLotesDoCookie === 'function') {
        carregarLotesDoCookie();
    }
    
    // Adicionar listener ao botão de adicionar ingresso pago
    const addPaidBtn = document.getElementById('addPaidTicket');
    if (addPaidBtn) {
        addPaidBtn.addEventListener('click', function() {
            console.log('Botão de ingresso pago clicado - carregando lotes');
            setTimeout(() => {
                carregarLotesNoModal();
            }, 200);
        });
    }
    
    // Interceptar a abertura do modal como backup
    const originalOpenModal = window.openModal;
    window.openModal = function(modalId) {
        console.log('Abrindo modal:', modalId);
        
        // Chamar função original
        if (originalOpenModal) {
            originalOpenModal(modalId);
        } else {
            // Se não houver função original, abrir modal manualmente
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
            }
        }
        
        // Se for o modal de ingresso pago, carregar lotes e configurar cálculos
        if (modalId === 'paidTicketModal') {
            setTimeout(() => {
                carregarLotesNoModal();
                // Limpar e recalcular valores
                const precoInput = document.getElementById('paidTicketPrice');
                if (precoInput) {
                    precoInput.value = '';
                }
                calcularValoresIngresso();
            }, 200); // Pequeno delay para garantir que o modal esteja renderizado
        }
    };
});

// Função para aplicar máscara monetária
function aplicarMascaraMonetaria(input) {
    let valor = input.value;
    
    // Remove tudo exceto números
    valor = valor.replace(/\D/g, '');
    
    // Converte para número
    valor = (parseInt(valor) || 0) / 100;
    
    // Formata
    input.value = formatarMoeda(valor);
    
    // Calcula valores
    calcularValoresIngresso();
}

// Função para calcular quantidade do lote baseado no percentual
function calcularQuantidadeLote() {
    const quantidadeInput = document.getElementById('paidTicketQuantity');
    const quantidadeLoteInput = document.getElementById('paidTicketQuantidadeLote');
    
    if (!quantidadeInput || !quantidadeLoteInput || !loteAtualPercentual) {
        return;
    }
    
    const quantidade = parseInt(quantidadeInput.value) || 0;
    
    if (quantidade > 0 && loteAtualPercentual > 0) {
        // Calcular quantidade baseada no percentual
        const quantidadeLote = Math.ceil(quantidade * (loteAtualPercentual / 100));
        quantidadeLoteInput.value = `${quantidadeLote} ingressos`;
    } else {
        quantidadeLoteInput.value = '0 ingressos';
    }
}

// Tornar a função global
window.updatePaidTicketDates = updatePaidTicketDates;
window.carregarLotesNoModal = carregarLotesNoModal;
window.calcularValoresIngresso = calcularValoresIngresso;
window.aplicarMascaraMonetaria = aplicarMascaraMonetaria;
window.calcularQuantidadeLote = calcularQuantidadeLote;

// Funções para o modal de edição
window.updateEditPaidTicketDates = function() {
    // Mesma lógica do modal de criação, mas com IDs diferentes
    const selectLote = document.getElementById('editPaidTicketLote');
    const startInput = document.getElementById('editPaidSaleStart');
    const endInput = document.getElementById('editPaidSaleEnd');
    const titleSection = document.getElementById('editPaidTicketPeriodTitle');
    const quantidadeContainer = document.getElementById('editQuantidadeLoteContainer');
    
    if (!selectLote || !startInput || !endInput) return;
    
    const selectedOption = selectLote.options[selectLote.selectedIndex];
    
    if (!selectedOption || selectedOption.value === '') {
        startInput.value = '';
        endInput.value = '';
        startInput.setAttribute('readonly', true);
        endInput.setAttribute('readonly', true);
        titleSection.textContent = 'Período das vendas';
        if (quantidadeContainer) {
            quantidadeContainer.style.display = 'none';
        }
        loteAtualPercentual = null;
        return;
    }
    
    const tipo = selectedOption.getAttribute('data-tipo');
    const dataInicio = selectedOption.getAttribute('data-inicio');
    const dataFim = selectedOption.getAttribute('data-fim');
    const percentual = selectedOption.getAttribute('data-percentual');
    
    if (tipo === 'POR DATA') {
        if (dataInicio) startInput.value = formatarParaDateTimeLocal(dataInicio);
        if (dataFim) endInput.value = formatarParaDateTimeLocal(dataFim);
        startInput.setAttribute('readonly', true);
        endInput.setAttribute('readonly', true);
        titleSection.textContent = 'Período das vendas (Datas associadas ao Lote escolhido)';
        if (quantidadeContainer) quantidadeContainer.style.display = 'none';
        loteAtualPercentual = null;
    } else if (tipo === 'POR PERCENTUAL') {
        const agora = new Date();
        startInput.value = formatarParaDateTimeLocal(agora.toISOString());
        const eventoDataInput = document.getElementById('startDateTime');
        if (eventoDataInput && eventoDataInput.value) {
            endInput.value = eventoDataInput.value;
        } else {
            const futuro = new Date();
            futuro.setDate(futuro.getDate() + 30);
            endInput.value = formatarParaDateTimeLocal(futuro.toISOString());
        }
        startInput.removeAttribute('readonly');
        endInput.removeAttribute('readonly');
        titleSection.textContent = 'Período das vendas';
        if (quantidadeContainer) quantidadeContainer.style.display = 'block';
        loteAtualPercentual = parseFloat(percentual) || 0;
        calcularQuantidadeLoteEdit();
    }
};

window.calcularValoresIngressoEdit = function() {
    const precoInput = document.getElementById('editPaidTicketPrice');
    const taxaCheckbox = document.getElementById('editPaidTicketTaxaServico');
    const taxaValorInput = document.getElementById('editPaidTicketTaxaValor');
    const valorCompradorInput = document.getElementById('editPaidTicketValorComprador');
    const valorReceberInput = document.getElementById('editPaidTicketValorReceber');
    
    if (!precoInput || !taxaCheckbox || !taxaValorInput || !valorCompradorInput || !valorReceberInput) return;
    
    const precoVenda = parsearValorMonetario(precoInput.value);
    const cobrarTaxa = taxaCheckbox.checked;
    
    let taxaValor = 0;
    let valorComprador = 0;
    let valorReceber = 0;
    
    if (precoVenda > 0) {
        if (cobrarTaxa) {
            taxaValor = precoVenda * (taxaServicoPadrao / 100);
            valorComprador = precoVenda + taxaValor;
            valorReceber = precoVenda;
        } else {
            taxaValor = precoVenda * (taxaServicoPadrao / 100);
            valorReceber = precoVenda - taxaValor;
            valorComprador = precoVenda;
        }
    }
    
    taxaValorInput.value = formatarMoeda(taxaValor);
    valorCompradorInput.value = formatarMoeda(valorComprador);
    valorReceberInput.value = formatarMoeda(valorReceber);
};

window.aplicarMascaraMonetariaEdit = function(input) {
    let valor = input.value;
    valor = valor.replace(/\D/g, '');
    valor = (parseInt(valor) || 0) / 100;
    input.value = formatarMoeda(valor);
    calcularValoresIngressoEdit();
};

window.calcularQuantidadeLoteEdit = function() {
    const quantidadeInput = document.getElementById('editPaidTicketQuantity');
    const quantidadeLoteInput = document.getElementById('editPaidTicketQuantidadeLote');
    
    if (!quantidadeInput || !quantidadeLoteInput || !loteAtualPercentual) return;
    
    const quantidade = parseInt(quantidadeInput.value) || 0;
    
    if (quantidade > 0 && loteAtualPercentual > 0) {
        const quantidadeLote = Math.ceil(quantidade * (loteAtualPercentual / 100));
        quantidadeLoteInput.value = `${quantidadeLote} ingressos`;
    } else {
        quantidadeLoteInput.value = '0 ingressos';
    }
};

window.carregarLotesNoModalEdit = function() {
    const selectLote = document.getElementById('editPaidTicketLote');
    if (!selectLote) return;
    
    selectLote.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Usar os mesmos lotes já carregados
    if (lotesCarregados && lotesCarregados.length > 0) {
        populateSelectLotesEdit(lotesCarregados);
    } else {
        // Tentar carregar novamente
        carregarLotesTemporarios();
        if (lotesCarregados.length > 0) {
            populateSelectLotesEdit(lotesCarregados);
        }
    }
};

function populateSelectLotesEdit(lotes) {
    const selectLote = document.getElementById('editPaidTicketLote');
    if (!selectLote) return;
    
    lotes.forEach(lote => {
        const option = document.createElement('option');
        option.value = lote.id;
        
        let descricao = `${lote.nome} - `;
        
        if (lote.tipo === 'POR DATA') {
            const dataInicio = formatarDataHora(lote.data_inicio);
            const dataFim = formatarDataHora(lote.data_fim);
            descricao += `Por Data (${dataInicio} até ${dataFim})`;
        } else if (lote.tipo === 'POR PERCENTUAL') {
            descricao += `Por Vendas (${lote.percentual_venda}% dos ingressos vendidos)`;
        }
        
        option.textContent = descricao;
        option.setAttribute('data-tipo', lote.tipo);
        option.setAttribute('data-inicio', lote.data_inicio || '');
        option.setAttribute('data-fim', lote.data_fim || '');
        option.setAttribute('data-percentual', lote.percentual_venda || '');
        
        selectLote.appendChild(option);
    });
}

// Função alternativa para carregar lotes diretamente
window.carregarLotesIngressoPago = function() {
    console.log('=== Carregando lotes para ingresso pago ===');
    const selectLote = document.getElementById('paidTicketLote');
    
    if (!selectLote) {
        console.error('Select não encontrado!');
        return;
    }
    
    // Limpar e adicionar opção padrão
    selectLote.innerHTML = '<option value="">Selecione um lote</option>';
    
    // Verificar se há lotes na variável global
    if (typeof lotesData !== 'undefined' && lotesData) {
        console.log('LotesData encontrado:', lotesData);
        
        let lotesAdicionados = 0;
        
        // Processar lotes por data
        if (lotesData.porData && Array.isArray(lotesData.porData)) {
            lotesData.porData.forEach((lote, index) => {
                const option = document.createElement('option');
                option.value = lote.id || `data_${index}`;
                
                const dataInicio = formatarDataHora(lote.dataInicio);
                const dataFim = formatarDataHora(lote.dataFim);
                option.textContent = `${lote.nome} - Por Data (${dataInicio} até ${dataFim})`;
                
                option.setAttribute('data-tipo', 'POR DATA');
                option.setAttribute('data-inicio', lote.dataInicio || '');
                option.setAttribute('data-fim', lote.dataFim || '');
                
                selectLote.appendChild(option);
                lotesAdicionados++;
            });
        }
        
        // Processar lotes por percentual
        if (lotesData.porPercentual && Array.isArray(lotesData.porPercentual)) {
            lotesData.porPercentual.forEach((lote, index) => {
                const option = document.createElement('option');
                option.value = lote.id || `perc_${index}`;
                
                option.textContent = `${lote.nome} - Por Vendas (${lote.percentual}% dos ingressos vendidos)`;
                
                option.setAttribute('data-tipo', 'POR PERCENTUAL');
                option.setAttribute('data-percentual', lote.percentual || '');
                
                selectLote.appendChild(option);
                lotesAdicionados++;
            });
        }
        
        console.log(`Total de lotes adicionados: ${lotesAdicionados}`);
    } else {
        console.log('LotesData não encontrado ou vazio');
    }
};
