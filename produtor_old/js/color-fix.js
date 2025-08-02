// Fix para cor de fundo ser aplicada em tempo real
console.log('🎨 Aplicando fix de cor de fundo...');

document.addEventListener('DOMContentLoaded', function() {
    const corFundo = document.getElementById('corFundo');
    const corFundoHex = document.getElementById('corFundoHex');
    const colorPreview = document.getElementById('colorPreview');
    
    if (corFundo && corFundoHex && colorPreview) {
        console.log('✅ Elementos de cor encontrados');
        
        // Usar 'input' ao invés de 'change' para atualização em tempo real
        corFundo.addEventListener('input', function() {
            const color = this.value;
            console.log('🎨 Cor selecionada:', color);
            
            // Atualizar campo hexa
            corFundoHex.value = color;
            
            // Atualizar preview da cor
            colorPreview.style.backgroundColor = color;
            
            // Atualizar preview hero se existir
            const heroBackground = document.getElementById('heroBackground');
            const fundoImg = document.querySelector('#fundoPreviewMain img');
            
            if (heroBackground && (!fundoImg || !fundoImg.src || fundoImg.src.includes('placeholder'))) {
                heroBackground.style.backgroundColor = color;
                console.log('✅ Cor aplicada ao preview hero');
            }
            
            // Salvar dados
            if (typeof window.saveWizardData === 'function') {
                window.saveWizardData();
            }
            
            // Atualizar preview geral
            if (typeof window.updatePreview === 'function') {
                window.updatePreview();
            }
        });
        
        // Também aplicar ao digitar no campo hexa
        corFundoHex.addEventListener('input', function() {
            const value = this.value;
            if (/^#[0-9A-F]{6}$/i.test(value)) {
                corFundo.value = value;
                colorPreview.style.backgroundColor = value;
                
                // Disparar evento de input no corFundo
                corFundo.dispatchEvent(new Event('input'));
            }
        });
    }
});