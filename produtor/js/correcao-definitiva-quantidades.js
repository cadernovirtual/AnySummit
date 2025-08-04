/**
 * CORREÇÃO DEFINITIVA - QUANTIDADE ZERO PARA COMBOS E CHECKBOX PARA OUTROS
 * 
 * Garante que:
 * 1. Combos sempre salvem com quantidade_total = 0
 * 2. Ingressos pagos/gratuitos salvem 0 se checkbox desmarcado
 * 3. Remove fallbacks hardcoded de 100
 */

(function() {
    'use strict';
    
    console.log('🎯 Aplicando correção definitiva de quantidades...');
    
    /**
     * Interceptar todas as funções que coletam dados de formulários
     */
    
    // Para combos - sempre força quantidade 0
    function interceptarComboData() {
        const funcoesCombos = [
            'coletarDadosCombo',
            'criarCombo', 
            'salvarCombo',
            'createComboTicket',
            'saveComboTicket'
        ];
        
        funcoesCombos.forEach(nomeFuncao => {
            const funcaoOriginal = window[nomeFuncao];
            if (typeof funcaoOriginal === 'function') {
                window[nomeFuncao] = function(...args) {
                    const resultado = funcaoOriginal.apply(this, args);
                    
                    // Se retornou dados, forçar quantidade 0
                    if (resultado && typeof resultado === 'object') {
                        if (resultado.quantidade_total !== undefined) {
                            resultado.quantidade_total = 0;
                            console.log(`🔄 ${nomeFuncao}: quantidade forçada para 0 (combo)`);
                        }
                        if (resultado.quantidade !== undefined) {
                            resultado.quantidade = 0;
                            console.log(`🔄 ${nomeFuncao}: quantidade forçada para 0 (combo)`);
                        }
                    }
                    
                    return resultado;
                };
            }
        });
    }
    
    // Para ingressos pagos/gratuitos - verifica checkbox
    function interceptarIngressoData() {
        const funcoesIngressos = [
            'coletarDadosIngresso',
            'createPaidTicket',
            'createFreeTicket',
            'criarIngresso'
        ];
        
        funcoesIngressos.forEach(nomeFuncao => {
            const funcaoOriginal = window[nomeFuncao];
            if (typeof funcaoOriginal === 'function') {
                window[nomeFuncao] = function(...args) {
                    // Verificar checkboxes antes de executar
                    verificarEZerarCamposSeNecessario();
                    
                    const resultado = funcaoOriginal.apply(this, args);
                    
                    // Se retornou dados, verificar novamente
                    if (resultado && typeof resultado === 'object') {
                        const tipo = resultado.tipo || resultado.type || '';
                        
                        if (tipo === 'combo') {
                            resultado.quantidade_total = 0;
                            resultado.quantidade = 0;
                            console.log(`🔄 ${nomeFuncao}: combo forçado para quantidade 0`);
                        }
                    }
                    
                    return resultado;
                };
            }
        });
    }
    
    /**
     * Função para verificar checkboxes e zerar campos se necessário
     */
    function verificarEZerarCamposSeNecessario() {
        // Modal de criação pago
        const paidCheckbox = document.getElementById('limitPaidQuantityCheck');
        const paidQuantity = document.getElementById('paidTicketQuantity');
        if (paidCheckbox && !paidCheckbox.checked && paidQuantity) {
            paidQuantity.value = '0';
        }
        
        // Modal de criação gratuito
        const freeCheckbox = document.getElementById('limitFreeQuantityCheck');
        const freeQuantity = document.getElementById('freeTicketQuantity');
        if (freeCheckbox && !freeCheckbox.checked && freeQuantity) {
            freeQuantity.value = '0';
        }
        
        // Modal de edição pago
        const editPaidCheckbox = document.getElementById('limitEditPaidQuantityCheck');
        const editPaidQuantity = document.getElementById('editPaidTicketQuantity');
        if (editPaidCheckbox && !editPaidCheckbox.checked && editPaidQuantity) {
            editPaidQuantity.value = '0';
        }
        
        // Modal de edição gratuito
        const editFreeCheckbox = document.getElementById('limitEditFreeQuantityCheck');
        const editFreeQuantity = document.getElementById('editFreeTicketQuantity');
        if (editFreeCheckbox && !editFreeCheckbox.checked && editFreeQuantity) {
            editFreeQuantity.value = '0';
        }
        
        // Combos sempre 0
        const comboQuantity = document.getElementById('comboTicketQuantity');
        if (comboQuantity) {
            comboQuantity.value = '0';
        }
        
        const editComboQuantity = document.getElementById('editComboQuantity');
        if (editComboQuantity) {
            editComboQuantity.value = '0';
        }
    }
    
    /**
     * Interceptar coleta de dados de FormData
     */
    function interceptarFormData() {
        // Interceptar envios de formulário
        const originalFormData = window.FormData;
        
        // Não vamos sobrescrever FormData globalmente pois pode quebrar outras coisas
        // Em vez disso, vamos interceptar antes dos envios
        
        // Interceptar fetch para modificar dados antes do envio
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            if (options && options.body instanceof FormData) {
                // Se é um envio de ingresso/combo
                if (url.includes('wizard_evento') || url.includes('ingressos_api') || url.includes('salvar_ingresso')) {
                    const tipo = options.body.get('tipo');
                    
                    if (tipo === 'combo') {
                        // Combos sempre quantidade 0
                        options.body.set('quantidade_total', '0');
                        options.body.set('quantidade', '0');
                        console.log('🔄 FormData: combo forçado para quantidade 0');
                    } else {
                        // Para outros tipos, verificar se quantidade é null/undefined e forçar 0
                        const quantidadeAtual = options.body.get('quantidade_total') || options.body.get('quantidade');
                        if (!quantidadeAtual || quantidadeAtual === '') {
                            options.body.set('quantidade_total', '0');
                            console.log('🔄 FormData: quantidade vazia forçada para 0');
                        }
                    }
                }
            }
            
            return originalFetch.apply(this, arguments);
        };
    }
    
    /**
     * Aplicar todas as interceptações
     */
    function aplicarInterceptacoes() {
        interceptarComboData();
        interceptarIngressoData();
        interceptarFormData();
        
        // Executar verificação a cada 2 segundos para garantir
        setInterval(verificarEZerarCamposSeNecessario, 2000);
    }
    
    // Aplicar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', aplicarInterceptacoes);
    } else {
        aplicarInterceptacoes();
    }
    
    console.log('✅ Correção definitiva de quantidades aplicada!');
})();

/**
 * FUNÇÃO GLOBAL PARA DEBUG
 */
window.debugQuantidades = function() {
    console.log('🔍 DEBUG - Estado atual dos campos de quantidade:');
    
    const campos = [
        { id: 'paidTicketQuantity', nome: 'Pago Criação' },
        { id: 'freeTicketQuantity', nome: 'Gratuito Criação' },
        { id: 'editPaidTicketQuantity', nome: 'Pago Edição' },
        { id: 'editFreeTicketQuantity', nome: 'Gratuito Edição' },
        { id: 'comboTicketQuantity', nome: 'Combo Criação' },
        { id: 'editComboQuantity', nome: 'Combo Edição' }
    ];
    
    campos.forEach(({ id, nome }) => {
        const campo = document.getElementById(id);
        if (campo) {
            console.log(`${nome}: ${campo.value}`);
        }
    });
};

console.log('✅ Sistema de correção de quantidades carregado!');
