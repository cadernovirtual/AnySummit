/**
 * TESTE SIMPLES - CONTROLE DE LIMITE DE VENDAS
 * Versão simplificada para debug
 */

console.log('🧪 TESTE SIMPLES - Controle de limite carregando...');

// Função básica para teste
function toggleLimiteVendas() {
    console.log('🧪 toggleLimiteVendas chamada!');
    
    const checkbox = document.getElementById('controlarLimiteVendas');
    const campo = document.getElementById('campoLimiteVendas');
    
    if (!checkbox || !campo) {
        console.error('❌ Elementos não encontrados!');
        return;
    }
    
    if (checkbox.checked) {
        console.log('✅ Mostrando campo');
        campo.style.display = 'block';
    } else {
        console.log('❌ Ocultando campo');
        campo.style.display = 'none';
    }
}

// Função de confirmação
function confirmarLimiteVendas() {
    console.log('🧪 confirmarLimiteVendas chamada!');
    
    const input = document.getElementById('limiteVendas');
    const botao = document.getElementById('btnCriarLoteQuantidade');
    
    if (!input || !botao) {
        console.error('❌ Elementos não encontrados!');
        return;
    }
    
    const valor = parseInt(input.value);
    
    if (!valor || valor < 1) {
        alert('Por favor, informe um valor válido!');
        return;
    }
    
    console.log(`✅ Habilitando botão com limite: ${valor}`);
    botao.disabled = false;
    botao.style.opacity = '1';
    
    // Ocultar campo após confirmar
    const campo = document.getElementById('campoLimiteVendas');
    if (campo) {
        campo.style.display = 'none';
    }
    
    alert(`Limite de ${valor} pessoas confirmado!`);
}

// Garantir que as funções estejam no window
window.toggleLimiteVendas = toggleLimiteVendas;
window.confirmarLimiteVendas = confirmarLimiteVendas;

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧪 DOM carregado - inicializando teste...');
    
    // Garantir que botão comece desabilitado
    setTimeout(function() {
        const botao = document.getElementById('btnCriarLoteQuantidade');
        if (botao) {
            botao.disabled = true;
            botao.style.opacity = '0.5';
            console.log('✅ Botão inicializado como desabilitado');
        }
    }, 100);
});

console.log('✅ Teste simples carregado!');