// Fix para o Color Picker
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 Iniciando correção do Color Picker...');
    
    // Função para sincronizar color picker
    function setupColorPicker() {
        const corFundo = document.getElementById('corFundo');
        const corFundoHex = document.getElementById('corFundoHex');
        const colorPreview = document.getElementById('colorPreview');
        
        if (!corFundo || !corFundoHex || !colorPreview) {
            console.log('⚠️ Elementos do color picker não encontrados');
            return;
        }
        
        console.log('✅ Elementos do color picker encontrados');
        
        // Função para atualizar todos os elementos com a cor
        function updateColor(color) {
            console.log('🎨 Atualizando cor para:', color);
            corFundo.value = color;
            corFundoHex.value = color;
            colorPreview.style.backgroundColor = color;
            
            // Salvar nos dados do wizard
            if (typeof saveWizardData === 'function') {
                saveWizardData();
            }
        }
        
        // Event listener para o color picker
        corFundo.addEventListener('input', function() {
            updateColor(this.value);
        });
        
        corFundo.addEventListener('change', function() {
            updateColor(this.value);
        });
        
        // Event listener para o input de texto
        corFundoHex.addEventListener('input', function() {
            const value = this.value;
            // Validar formato hexadecimal
            if (/^#[0-9A-F]{6}$/i.test(value)) {
                updateColor(value);
            }
        });
        
        // Event listener para blur (quando sai do campo)
        corFundoHex.addEventListener('blur', function() {
            let value = this.value.trim();
            
            // Adicionar # se não tiver
            if (value && !value.startsWith('#')) {
                value = '#' + value;
            }
            
            // Validar e formatar
            if (/^#[0-9A-F]{6}$/i.test(value)) {
                updateColor(value);
            } else {
                // Reverter para a cor do color picker se inválido
                this.value = corFundo.value;
            }
        });
        
        // Click no preview abre o color picker
        colorPreview.addEventListener('click', function() {
            corFundo.click();
        });
        
        // Definir cor inicial
        const initialColor = corFundo.value || '#000000';
        updateColor(initialColor);
    }
    
    // Configurar color picker
    setupColorPicker();
    
    // Re-configurar após possível restauração de dados
    setTimeout(setupColorPicker, 500);
});

// Override da função de restauração para garantir que a cor seja aplicada
const originalCheckAndRestore = window.checkAndRestoreWizardData;
if (originalCheckAndRestore) {
    window.checkAndRestoreWizardData = function() {
        // Chamar função original
        originalCheckAndRestore.apply(this, arguments);
        
        // Re-aplicar cor após restauração
        setTimeout(function() {
            const savedData = getCookie('eventoWizard');
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    if (data.corFundo) {
                        const corFundo = document.getElementById('corFundo');
                        const corFundoHex = document.getElementById('corFundoHex');
                        const colorPreview = document.getElementById('colorPreview');
                        
                        if (corFundo) corFundo.value = data.corFundo;
                        if (corFundoHex) corFundoHex.value = data.corFundo;
                        if (colorPreview) colorPreview.style.backgroundColor = data.corFundo;
                        
                        console.log('🎨 Cor restaurada:', data.corFundo);
                    }
                } catch (e) {
                    console.error('Erro ao restaurar cor:', e);
                }
            }
        }, 100);
    };
}