/**
 * SPINNER DE CARREGAMENTO PARA EVENTOS
 */

// Mostrar spinner de carregamento
window.mostrarSpinnerCarregamento = function() {
    // Remover spinner anterior se existir
    const spinnerAnterior = document.getElementById('spinnerCarregamento');
    if (spinnerAnterior) {
        spinnerAnterior.remove();
    }
    
    // Criar overlay com spinner
    const spinnerHTML = `
        <div id="spinnerCarregamento" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 15, 35, 0.95);
            backdrop-filter: blur(10px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: #E1E5F2;
            font-family: 'Inter', sans-serif;
        ">
            <div style="
                width: 60px;
                height: 60px;
                border: 4px solid rgba(114, 94, 255, 0.2);
                border-top: 4px solid #00C2FF;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
            "></div>
            <div style="
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 8px;
                text-align: center;
            ">Carregando evento...</div>
            <div style="
                font-size: 14px;
                color: #8B95A7;
                text-align: center;
                max-width: 300px;
                line-height: 1.4;
            ">Aguarde enquanto carregamos todas as imagens e dados do seu evento</div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', spinnerHTML);
    console.log('⏳ Spinner de carregamento exibido');
};

// Esconder spinner de carregamento
window.esconderSpinnerCarregamento = function() {
    const spinner = document.getElementById('spinnerCarregamento');
    if (spinner) {
        spinner.style.opacity = '0';
        spinner.style.transform = 'scale(0.9)';
        spinner.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            spinner.remove();
            console.log('✅ Spinner de carregamento removido');
        }, 300);
    }
};

console.log('✅ Funções de spinner carregadas');
