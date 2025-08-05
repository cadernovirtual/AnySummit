/**
 * DIAGNÓSTICO - VERIFICAR SE CORREÇÕES ESTÃO ATIVAS
 */

console.log('🔍 DIAGNÓSTICO - Verificando se correções estão ativas...');

// Aguardar DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        console.log('🔍 === DIAGNÓSTICO COMPLETO ===');
        
        // 1. VERIFICAR ELEMENTOS DO CONTROLE DE LIMITE
        console.log('🔍 1. CONTROLE DE LIMITE DE VENDAS:');
        const checkbox = document.getElementById('controlarLimiteVendas');
        const campoLimite = document.getElementById('campoLimiteVendas');
        const inputLimite = document.getElementById('limiteVendas');
        const btnConfirmar = document.getElementById('btnConfirmarLimite');
        const btnCriarLote = document.getElementById('btnCriarLoteQuantidade');
        
        console.log('  - Checkbox:', checkbox ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO');
        console.log('  - Campo limite:', campoLimite ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO');
        console.log('  - Input limite:', inputLimite ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO');
        console.log('  - Botão confirmar:', btnConfirmar ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO');
        console.log('  - Botão criar lote:', btnCriarLote ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO');
        
        if (btnCriarLote) {
            console.log('  - Estado do botão criar lote:', btnCriarLote.disabled ? 'DESABILITADO' : 'HABILITADO');
        }
        
        // 2. VERIFICAR FUNÇÕES GLOBAIS
        console.log('🔍 2. FUNÇÕES GLOBAIS:');
        console.log('  - toggleLimiteVendas:', typeof window.toggleLimiteVendas);
        console.log('  - confirmarLimiteVendas:', typeof window.confirmarLimiteVendas);
        console.log('  - temLotesQuantidade:', typeof window.temLotesQuantidade);
        console.log('  - coletarValoresMonetariosCombo:', typeof window.coletarValoresMonetariosCombo);
        console.log('  - salvarComboCorrigido:', typeof window.salvarComboCorrigido);
        console.log('  - coletarDadosComboCorrigido:', typeof window.coletarDadosComboCorrigido);
        
        // 3. VERIFICAR FUNÇÕES DE COMBO ORIGINAIS
        console.log('🔍 3. FUNÇÕES DE COMBO ORIGINAIS:');
        console.log('  - createComboTicket:', typeof window.createComboTicket);
        console.log('  - updateComboTicket:', typeof window.updateComboTicket);
        console.log('  - editCombo:', typeof window.editCombo);
        console.log('  - salvarComboImediatoNoBanco:', typeof window.salvarComboImediatoNoBanco);
        console.log('  - coletarDadosModalComboCompleto:', typeof window.coletarDadosModalComboCompleto);
        
        // 4. TESTAR CHECKBOX
        if (checkbox) {
            console.log('🔍 4. TESTANDO CHECKBOX:');
            console.log('  - Estado atual:', checkbox.checked ? 'MARCADO' : 'DESMARCADO');
            
            if (campoLimite) {
                console.log('  - Display do campo:', campoLimite.style.display);
            }
            
            // DESABILITADO: Simulação de clique estava disparando a função desnecessariamente
            /*
            console.log('  - Simulando clique no checkbox...');
            try {
                checkbox.click();
                setTimeout(() => {
                    console.log('  - Após clique - Estado:', checkbox.checked ? 'MARCADO' : 'DESMARCADO');
                    if (campoLimite) {
                        console.log('  - Após clique - Display:', campoLimite.style.display);
                    }
                    
                    // Reverter
                    checkbox.click();
                }, 500);
            } catch (e) {
                console.error('  - Erro ao testar checkbox:', e);
            }
            */
            console.log('  - Teste de clique DESABILITADO para evitar dialogs desnecessários');
        }
        
        // 5. VERIFICAR PARÂMETROS DA URL
        console.log('🔍 5. PARÂMETROS DA URL:');
        const urlParams = new URLSearchParams(window.location.search);
        const eventoId = urlParams.get('evento_id');
        console.log('  - evento_id:', eventoId || 'NÃO ENCONTRADO');
        
        // 6. VERIFICAR CONSOLE ERRORS
        console.log('🔍 6. VERIFICAR ERRORS ANTERIORES:');
        console.log('  - Verifique se há erros em vermelho no console acima');
        
        // 7. TESTAR FETCH
        if (eventoId) {
            console.log('🔍 7. TESTANDO COMUNICAÇÃO COM API:');
            fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=carregar_limite_vendas&evento_id=${eventoId}`
            })
            .then(response => {
                console.log('  - Status da resposta:', response.status);
                return response.text();
            })
            .then(text => {
                console.log('  - Resposta da API:', text.substring(0, 200) + '...');
                try {
                    const data = JSON.parse(text);
                    console.log('  - JSON parseado:', data);
                } catch (e) {
                    console.log('  - Erro ao parsear JSON:', e.message);
                }
            })
            .catch(error => {
                console.error('  - Erro na requisição:', error);
            });
        }
        
        console.log('🔍 === FIM DO DIAGNÓSTICO ===');
        console.log('🔍 Verificar resultados acima para identificar problemas');
        
    }, 2000);
});

console.log('✅ Diagnóstico carregado - aguarde 2 segundos para execução');