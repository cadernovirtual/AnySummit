/**
 * DOM ESPELHO DO MYSQL - ETAPA 6
 * 
 * Garante que o DOM da lista de ingressos seja SEMPRE um espelho exato da tabela MySQL.
 * 
 * PRINCÍPIOS:
 * 1. TODA operação (inserir, editar, excluir) SEMPRE salva no MySQL primeiro
 * 2. Após operação no MySQL, SEMPRE recarrega dados do banco
 * 3. DOM é SEMPRE recriado baseado nos dados REAIS do MySQL
 * 4. NUNCA usar IDs temporários - sempre IDs reais do banco
 * 5. Fonte única da verdade: MySQL
 */

console.log('🔄 Carregando DOM ESPELHO MYSQL - Etapa 6...');

// Variáveis globais - DEFINIR IMEDIATAMENTE
window.eventoId = null;
window.dadosAtivos = {
    ingressos: [],
    lotes: []
};

/**
 * INICIALIZAÇÃO - Detectar evento e carregar dados
 */
document.addEventListener('DOMContentLoaded', function() {
    // Detectar evento_id da URL
    const urlParams = new URLSearchParams(window.location.search);
    window.eventoId = urlParams.get('evento_id');
    
    if (window.eventoId) {
        console.log(`🔄 Evento detectado: ${window.eventoId} - Carregando dados do MySQL...`);
        setTimeout(() => {
            recarregarIngressosDoMySQL();
        }, 1000); // Aguardar carregamento completo da página
    }
});

/**
 * FUNÇÃO UNIFICADA: Recarregar dados do MySQL e atualizar DOM
 * Esta é a ÚNICA função que deve atualizar a lista de ingressos
 */
window.recarregarIngressosDoMySQL = async function() {
    console.log('🔄 Recarregando ingressos do MySQL...');
    
    if (!window.eventoId) {
        console.log('📝 Evento novo - sem dados para carregar');
        return;
    }
    
    try {
        // 1. Buscar dados atuais do MySQL
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=recuperar_evento&evento_id=${window.eventoId}`
        });
        
        const data = await response.json();
        
        if (!data.sucesso) {
            console.error('❌ Erro ao carregar dados:', data.erro);
            return;
        }
        
        // 2. Atualizar cache local
        window.dadosAtivos.ingressos = data.ingressos || [];
        window.dadosAtivos.lotes = data.lotes || [];
        
        console.log(`✅ Carregados: ${window.dadosAtivos.ingressos.length} ingressos, ${window.dadosAtivos.lotes.length} lotes`);
        
        // 3. Recriar DOM baseado nos dados reais do MySQL
        renderizarIngressosDoMySQL();
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
    }
};

/**
 * RENDERIZAÇÃO: Sempre baseada em dados reais do MySQL
 */
function renderizarIngressosDoMySQL() {
    console.log('🎨 Renderizando DOM baseado no MySQL...');
    
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) {
        console.error('❌ ticketList não encontrado');
        return;
    }
    
    // Limpar DOM completamente
    ticketList.innerHTML = '';
    
    if (window.dadosAtivos.ingressos.length === 0) {
        ticketList.innerHTML = `
            <div class="empty-state" style="background: transparent !important; background-color: transparent !important;">
                <p>Nenhum tipo de ingresso cadastrado ainda.</p>
                <p>Use os botões abaixo para criar ingressos pagos, gratuitos ou combos.</p>
            </div>
        `;
        return;
    }
    
    // Renderizar cada ingresso usando addTicketToList() com dados REAIS
    window.dadosAtivos.ingressos.forEach(ingresso => {
        criarElementoComDadosReais(ingresso);
    });
    
    console.log(`✅ ${window.dadosAtivos.ingressos.length} ingressos renderizados no DOM com IDs reais`);
}

/**
 * CRIAÇÃO DE ELEMENTO: Usar addTicketToList() mas com IDs reais do banco
 */
function criarElementoComDadosReais(ingresso) {
    // Converter dados do MySQL para formato do addTicketToList()
    const type = ingresso.tipo === 'pago' ? 'paid' : (ingresso.tipo === 'gratuito' ? 'free' : 'combo');
    const title = ingresso.titulo;
    const quantity = parseInt(ingresso.quantidade_total) || 100;
    const price = type === 'paid' ? 
        `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 
        'Gratuito';
    const loteId = ingresso.lote_id || '';
    const description = ingresso.descricao || '';
    const saleStart = ingresso.inicio_venda || '';
    const saleEnd = ingresso.fim_venda || '';
    const minQuantity = parseInt(ingresso.limite_min) || 1;
    const maxQuantity = parseInt(ingresso.limite_max) || 5;
    
    // Usar addTicketToList() para gerar HTML idêntico
    if (typeof addTicketToList === 'function') {
        addTicketToList(type, title, quantity, price, loteId, description, saleStart, saleEnd, minQuantity, maxQuantity);
        
        // CRÍTICO: Corrigir o último elemento criado para usar ID REAL do banco
        const ticketList = document.getElementById('ticketList');
        const ultimoElemento = ticketList.lastElementChild;
        
        if (ultimoElemento && ultimoElemento.classList.contains('ticket-item')) {
            // Substituir dataset temporário por dados REAIS
            ultimoElemento.dataset.ticketId = ingresso.id;
            ultimoElemento.dataset.ingressoId = ingresso.id;
            ultimoElemento.dataset.tipo = ingresso.tipo;
            ultimoElemento.dataset.loteId = ingresso.lote_id || '';
            
            // CRÍTICO: Corrigir botões para usar ID REAL do banco
            const editBtn = ultimoElemento.querySelector('button[onclick*="editTicket"]');
            const removeBtn = ultimoElemento.querySelector('button[onclick*="removeTicket"]');
            
            if (editBtn) {
                editBtn.setAttribute('onclick', `editarIngressoDoMySQL(${ingresso.id})`);
            }
            if (removeBtn) {
                removeBtn.setAttribute('onclick', `excluirIngressoDoMySQL(${ingresso.id})`);
            }
            
            // Armazenar dados completos REAIS
            ultimoElemento.ticketData = {
                ...ingresso,
                id: ingresso.id,
                type: type,
                title: title,
                quantity: quantity,
                price: parseFloat(ingresso.preco) || 0,
                description: description,
                saleStart: saleStart,
                saleEnd: saleEnd,
                minQuantity: minQuantity,
                maxQuantity: maxQuantity,
                loteId: loteId,
                isFromDatabase: true // Marcar como dados do banco
            };
        }
    } else {
        console.error('❌ addTicketToList não disponível');
    }
}

/**
 * NOVA FUNÇÃO: Criar ingresso pago (SALVA NO MYSQL + RECARREGA)
 */
window.createPaidTicketMySQL = async function() {
    console.log('💰 Criando/editando ingresso pago (MySQL)...');
    
    // Verificar se está editando
    const modal = document.getElementById('paidTicketModal');
    const editingId = modal?.dataset?.editingId;
    const isEditing = editingId && editingId !== '';
    
    console.log(isEditing ? `✏️ Editando ingresso ${editingId}` : '➕ Criando novo ingresso');
    
    // Validação de campos (mesma do original)
    const title = document.getElementById('paidTicketTitle')?.value?.trim();
    const quantity = document.getElementById('paidTicketQuantity')?.value;
    const price = document.getElementById('paidTicketPrice')?.value;
    const description = document.getElementById('paidTicketDescription')?.value || '';
    const saleStart = document.getElementById('paidSaleStart')?.value;
    const saleEnd = document.getElementById('paidSaleEnd')?.value;
    const minQuantity = document.getElementById('paidMinQuantity')?.value || 1;
    const maxQuantity = document.getElementById('paidMaxQuantity')?.value || 5;
    const loteId = document.getElementById('paidTicketLote')?.value;
    const taxaServico = document.getElementById('paidTicketTaxaServico')?.checked;
    
    // Limpar erros anteriores
    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
    
    // Validar campos obrigatórios
    let hasError = false;
    
    if (!title) {
        document.getElementById('paidTicketTitle').classList.add('error-field');
        hasError = true;
    }
    if (!quantity || parseInt(quantity) <= 0) {
        document.getElementById('paidTicketQuantity').classList.add('error-field');
        hasError = true;
    }
    if (!price || price === 'R$ 0,00') {
        document.getElementById('paidTicketPrice').classList.add('error-field');
        hasError = true;
    }
    if (!loteId) {
        document.getElementById('paidTicketLote').classList.add('error-field');
        hasError = true;
    }
    
    if (hasError) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Processar preço e calcular valores
    const cleanPrice = parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.'));
    let valorComprador = cleanPrice;
    let taxaPlataforma = 0;
    let valorReceber = cleanPrice;
    
    if (taxaServico) {
        taxaPlataforma = cleanPrice * 0.08;
        valorComprador = cleanPrice + taxaPlataforma;
        valorReceber = cleanPrice;
    }
    
    // Preparar dados para o MySQL
    const ingressoData = {
        tipo: 'pago',
        titulo: title,
        descricao: description,
        quantidade_total: parseInt(quantity),
        preco: cleanPrice,
        taxa_plataforma: taxaPlataforma,
        valor_receber: valorReceber,
        inicio_venda: saleStart || null,
        fim_venda: saleEnd || null,
        limite_min: parseInt(minQuantity),
        limite_max: parseInt(maxQuantity),
        lote_id: parseInt(loteId)
    };
    
    // IMPORTANTE: Se está editando, incluir o ID
    if (isEditing) {
        ingressoData.id = parseInt(editingId);
    }
    
    try {
        // 1. SALVAR NO MYSQL PRIMEIRO
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=salvar_ingresso_individual&evento_id=${window.eventoId}&ingresso=${encodeURIComponent(JSON.stringify(ingressoData))}`
        });
        
        const data = await response.json();
        
        if (data.sucesso) {
            const acao = isEditing ? 'atualizado' : 'criado';
            console.log(`✅ Ingresso pago ${acao} no MySQL com ID: ${data.ingresso_id || editingId}`);
            
            // 2. RECARREGAR DADOS DO MYSQL
            await recarregarIngressosDoMySQL();
            
            // 3. Fechar modal e limpar formulário
            closeModal('paidTicketModal');
            limparFormularioPago();
            
            // 4. Salvar dados do wizard
            if (typeof window.saveWizardData === 'function') {
                window.saveWizardData();
            }
            
        } else {
            alert('Erro ao salvar ingresso: ' + (data.erro || 'Erro desconhecido'));
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar ingresso:', error);
        alert('Erro de conexão');
    }
};

/**
 * NOVA FUNÇÃO: Criar ingresso gratuito (SALVA NO MYSQL + RECARREGA)
 */
window.createFreeTicketMySQL = async function() {
    console.log('🆓 Criando/editando ingresso gratuito (MySQL)...');
    
    // Verificar se está editando
    const modal = document.getElementById('freeTicketModal');
    const editingId = modal?.dataset?.editingId;
    const isEditing = editingId && editingId !== '';
    
    console.log(isEditing ? `✏️ Editando ingresso ${editingId}` : '➕ Criando novo ingresso');
    
    // Validação de campos
    const title = document.getElementById('freeTicketTitle')?.value?.trim();
    const quantity = document.getElementById('freeTicketQuantity')?.value;
    const description = document.getElementById('freeTicketDescription')?.value || '';
    const saleStart = document.getElementById('freeSaleStart')?.value;
    const saleEnd = document.getElementById('freeSaleEnd')?.value;
    const minQuantity = document.getElementById('freeMinQuantity')?.value || 1;
    const maxQuantity = document.getElementById('freeMaxQuantity')?.value || 5;
    const loteId = document.getElementById('freeTicketLote')?.value;
    
    // Limpar erros anteriores
    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
    
    // Validar campos obrigatórios
    let hasError = false;
    
    if (!title) {
        document.getElementById('freeTicketTitle').classList.add('error-field');
        hasError = true;
    }
    if (!quantity || parseInt(quantity) <= 0) {
        document.getElementById('freeTicketQuantity').classList.add('error-field');
        hasError = true;
    }
    if (!loteId) {
        document.getElementById('freeTicketLote').classList.add('error-field');
        hasError = true;
    }
    
    if (hasError) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Preparar dados para o MySQL
    const ingressoData = {
        tipo: 'gratuito',
        titulo: title,
        descricao: description,
        quantidade_total: parseInt(quantity),
        preco: 0,
        taxa_plataforma: 0,
        valor_receber: 0,
        inicio_venda: saleStart || null,
        fim_venda: saleEnd || null,
        limite_min: parseInt(minQuantity),
        limite_max: parseInt(maxQuantity),
        lote_id: parseInt(loteId)
    };
    
    // IMPORTANTE: Se está editando, incluir o ID
    if (isEditing) {
        ingressoData.id = parseInt(editingId);
    }
    
    try {
        // 1. SALVAR NO MYSQL PRIMEIRO
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=salvar_ingresso_individual&evento_id=${window.eventoId}&ingresso=${encodeURIComponent(JSON.stringify(ingressoData))}`
        });
        
        const data = await response.json();
        
        if (data.sucesso) {
            const acao = isEditing ? 'atualizado' : 'criado';
            console.log(`✅ Ingresso gratuito ${acao} no MySQL com ID: ${data.ingresso_id || editingId}`);
            
            // 2. RECARREGAR DADOS DO MYSQL
            await recarregarIngressosDoMySQL();
            
            // 3. Fechar modal e limpar formulário
            closeModal('freeTicketModal');
            limparFormularioGratuito();
            
            // 4. Salvar dados do wizard
            if (typeof window.saveWizardData === 'function') {
                window.saveWizardData();
            }
            
        } else {
            alert('Erro ao salvar ingresso: ' + (data.erro || 'Erro desconhecido'));
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar ingresso:', error);
        alert('Erro de conexão');
    }
};

/**
 * NOVA FUNÇÃO: Excluir ingresso (EXCLUI DO MYSQL + RECARREGA)
 */
window.excluirIngressoDoMySQL = async function(ingressoId) {
    console.log(`🗑️ Excluindo ingresso ${ingressoId} do MySQL...`);
    
    if (!confirm('Tem certeza que deseja excluir este ingresso?')) {
        return;
    }
    
    try {
        // 1. EXCLUIR DO MYSQL PRIMEIRO
        const response = await fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=excluir_ingresso&evento_id=${window.eventoId}&ingresso_id=${ingressoId}`
        });
        
        const data = await response.json();
        
        if (data.sucesso) {
            console.log(`✅ Ingresso ${ingressoId} excluído do MySQL`);
            
            // 2. RECARREGAR DADOS DO MYSQL
            await recarregarIngressosDoMySQL();
            
            // 3. Salvar dados do wizard
            if (typeof window.saveWizardData === 'function') {
                window.saveWizardData();
            }
            
        } else {
            alert('Erro ao excluir ingresso: ' + (data.erro || 'Erro desconhecido'));
        }
        
    } catch (error) {
        console.error('❌ Erro ao excluir ingresso:', error);
        alert('Erro de conexão');
    }
};

/**
 * NOVA FUNÇÃO: Editar ingresso (BUSCA DADOS DO MYSQL + SALVA + RECARREGA)
 */
window.editarIngressoDoMySQL = async function(ingressoId) {
    console.log(`✏️ Editando ingresso ${ingressoId} (dados do MySQL)...`);
    
    // Buscar dados atuais do MySQL
    const ingresso = window.dadosAtivos.ingressos.find(i => i.id == ingressoId);
    if (!ingresso) {
        alert('Ingresso não encontrado');
        return;
    }
    
    // Abrir modal apropriado baseado no tipo
    if (ingresso.tipo === 'pago') {
        // Popular e abrir modal de edição pago
        popularModalPago(ingresso);
        openModal('paidTicketModal');
    } else if (ingresso.tipo === 'gratuito') {
        // Popular e abrir modal de edição gratuito
        popularModalGratuito(ingresso);
        openModal('freeTicketModal');
    } else {
        alert('Edição de combos será implementada em breve');
    }
};

/**
 * FUNÇÕES AUXILIARES: Popular modais com dados do banco
 */
function popularModalPago(ingresso) {
    document.getElementById('paidTicketTitle').value = ingresso.titulo;
    document.getElementById('paidTicketQuantity').value = ingresso.quantidade_total;
    document.getElementById('paidTicketPrice').value = `R$ ${(parseFloat(ingresso.preco) || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('paidTicketDescription').value = ingresso.descricao || '';
    document.getElementById('paidSaleStart').value = ingresso.inicio_venda || '';
    document.getElementById('paidSaleEnd').value = ingresso.fim_venda || '';
    document.getElementById('paidMinQuantity').value = ingresso.limite_min || 1;
    document.getElementById('paidMaxQuantity').value = ingresso.limite_max || 5;
    document.getElementById('paidTicketLote').value = ingresso.lote_id || '';
    
    // Marcar que está editando
    document.getElementById('paidTicketModal').dataset.editingId = ingresso.id;
}

function popularModalGratuito(ingresso) {
    document.getElementById('freeTicketTitle').value = ingresso.titulo;
    document.getElementById('freeTicketQuantity').value = ingresso.quantidade_total;
    document.getElementById('freeTicketDescription').value = ingresso.descricao || '';
    document.getElementById('freeSaleStart').value = ingresso.inicio_venda || '';
    document.getElementById('freeSaleEnd').value = ingresso.fim_venda || '';
    document.getElementById('freeMinQuantity').value = ingresso.limite_min || 1;
    document.getElementById('freeMaxQuantity').value = ingresso.limite_max || 5;
    document.getElementById('freeTicketLote').value = ingresso.lote_id || '';
    
    // Marcar que está editando
    document.getElementById('freeTicketModal').dataset.editingId = ingresso.id;
}

/**
 * FUNÇÕES AUXILIARES: Limpar formulários
 */
function limparFormularioPago() {
    document.getElementById('paidTicketTitle').value = '';
    document.getElementById('paidTicketQuantity').value = '';
    document.getElementById('paidTicketPrice').value = '';
    document.getElementById('paidTicketDescription').value = '';
    document.getElementById('paidSaleStart').value = '';
    document.getElementById('paidSaleEnd').value = '';
    document.getElementById('paidMinQuantity').value = '1';
    document.getElementById('paidMaxQuantity').value = '5';
    document.getElementById('paidTicketLote').value = '';
    delete document.getElementById('paidTicketModal').dataset.editingId;
}

function limparFormularioGratuito() {
    document.getElementById('freeTicketTitle').value = '';
    document.getElementById('freeTicketQuantity').value = '';
    document.getElementById('freeTicketDescription').value = '';
    document.getElementById('freeSaleStart').value = '';
    document.getElementById('freeSaleEnd').value = '';
    document.getElementById('freeMinQuantity').value = '1';
    document.getElementById('freeMaxQuantity').value = '5';
    document.getElementById('freeTicketLote').value = '';
    delete document.getElementById('freeTicketModal').dataset.editingId;
}

/**
 * SOBRESCREVER FUNÇÕES ORIGINAIS para usar as novas versões MySQL - IMEDIATAMENTE
 */
console.log('🔄 Sobrescrevendo funções originais com versões MySQL...');

// Sobrescrever imediatamente (não esperar o load)
window.createPaidTicket = function() {
    console.log('💰 Redirecionando createPaidTicket para versão MySQL...');
    if (typeof window.createPaidTicketMySQL === 'function') {
        return window.createPaidTicketMySQL();
    } else {
        console.error('❌ createPaidTicketMySQL não carregada ainda');
        alert('Sistema carregando, tente novamente em alguns segundos.');
    }
};

window.createFreeTicket = function() {
    console.log('🆓 Redirecionando createFreeTicket para versão MySQL...');
    if (typeof window.createFreeTicketMySQL === 'function') {
        return window.createFreeTicketMySQL();
    } else {
        console.error('❌ createFreeTicketMySQL não carregada ainda');
        alert('Sistema carregando, tente novamente em alguns segundos.');
    }
};

window.removeTicket = function(ticketId) {
    console.log(`🗑️ Redirecionando removeTicket(${ticketId}) para versão MySQL...`);
    if (typeof window.excluirIngressoDoMySQL === 'function') {
        return window.excluirIngressoDoMySQL(ticketId);
    } else {
        console.error('❌ excluirIngressoDoMySQL não carregada ainda');
        alert('Sistema carregando, tente novamente em alguns segundos.');
    }
};

window.editTicket = function(ticketId) {
    console.log(`✏️ Redirecionando editTicket(${ticketId}) para versão MySQL...`);
    if (typeof window.editarIngressoDoMySQL === 'function') {
        return window.editarIngressoDoMySQL(ticketId);
    } else {
        console.error('❌ editarIngressoDoMySQL não carregada ainda');
        alert('Sistema carregando, tente novamente em alguns segundos.');
    }
};

console.log('✅ Funções redirecionadas imediatamente');

/**
 * Aplicação após carregamento para garantir que as funções MySQL estão disponíveis
 */
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('🔄 Verificando e reforçando redirecionamentos após carregamento...');
        
        // Reforçar sobrescrita se as funções MySQL estão disponíveis
        if (typeof window.createPaidTicketMySQL === 'function') {
            window.createPaidTicket = window.createPaidTicketMySQL;
        }
        if (typeof window.createFreeTicketMySQL === 'function') {
            window.createFreeTicket = window.createFreeTicketMySQL;
        }
        if (typeof window.excluirIngressoDoMySQL === 'function') {
            window.removeTicket = window.excluirIngressoDoMySQL;
        }
        if (typeof window.editarIngressoDoMySQL === 'function') {
            window.editTicket = window.editarIngressoDoMySQL;
        }
        
        console.log('✅ Redirecionamentos reforçados - DOM agora é espelho do MySQL');
    }, 2000);
});

console.log('✅ DOM Espelho MySQL - Etapa 6 carregado com sucesso!');