/**
 * Correção definitiva para busca de endereços e salvamento de lotes
 */

(function() {
    'use strict';
    
    console.log('🔧 Correções definitivas carregadas');
    
    // 1. CORREÇÃO DO BOTÃO DE BUSCA DE ENDEREÇO - REMOVIDO
    // Botão foi removido do HTML, então não precisamos mais desta função
    
    // 2. CORREÇÃO DA VALIDAÇÃO DE LOTES
    // Sobrescrever a validação para verificar window.lotesData ao invés do DOM
    const originalValidateStep = window.validateStep;
    if (originalValidateStep) {
        window.validateStep = function(step) {
            if (step === 5) {
                console.log('🔍 Validando etapa 5 (lotes)');
                
                // Verificar se há lotes em window.lotesData
                const temLotes = window.lotesData && 
                    ((window.lotesData.porData && window.lotesData.porData.length > 0) ||
                     (window.lotesData.porPercentual && window.lotesData.porPercentual.length > 0));
                
                if (!temLotes) {
                    console.log('❌ Nenhum lote encontrado em window.lotesData');
                    return false;
                }
                
                console.log('✅ Lotes encontrados:', {
                    porData: window.lotesData.porData?.length || 0,
                    porPercentual: window.lotesData.porPercentual?.length || 0
                });
                
                return true;
            }
            
            // Para outras etapas, usar validação original
            return originalValidateStep.apply(this, arguments);
        };
    }
    
    // 3. GARANTIR QUE AS FUNÇÕES DE LOTES ESTEJAM DISPONÍVEIS
    document.addEventListener('DOMContentLoaded', function() {
        // Verificar se as funções de lotes existem
        if (!window.adicionarLotePorData || !window.adicionarLotePorPercentual) {
            console.error('❌ Funções de lotes não encontradas! Verificar se lotes.js foi carregado.');
        } else {
            console.log('✅ Funções de lotes disponíveis');
        }
        
        // Remover botão de busca se não houver suporte
        const searchButton = document.querySelector('button[onclick*="searchAddressManual"]');
        if (searchButton) {
            // Verificar se existe alguma função de busca
            if (!window.searchAddresses && !window.searchAddress) {
                console.log('🔍 Removendo botão de busca (sem função de busca disponível)');
                searchButton.style.display = 'none';
                
                // Texto de ajuda removido - não é mais necessário
            }
        }
    });
    
    // 4. DEBUG - Adicionar função global para verificar estado dos lotes
    window.verificarLotes = function() {
        console.log('=== ESTADO DOS LOTES ===');
        console.log('window.lotesData:', window.lotesData);
        
        if (window.lotesData) {
            console.log('Lotes por data:', window.lotesData.porData);
            console.log('Lotes por percentual:', window.lotesData.porPercentual);
        }
        
        // Verificar se a função de coleta está funcionando
        if (window.coletarDadosLotes) {
            const dadosColetados = window.coletarDadosLotes();
            console.log('Dados coletados pela função:', dadosColetados);
        }
        
        // Verificar validação
        if (window.validateStep) {
            const validacao = window.validateStep(5);
            console.log('Validação da etapa 5:', validacao);
        }
    };
    
})();
