/**
 * DIAGNÓSTICO - BOTÕES DE EDITAR INVISÍVEIS
 * Encontrar e corrigir código que oculta botões de editar
 */

console.log('🔍 Iniciando diagnóstico de botões de editar...');

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        console.log('🔍 === DIAGNÓSTICO DE BOTÕES DE EDITAR ===');
        
        // 1. ENCONTRAR TODOS OS BOTÕES DE EDITAR
        const seletoresBotoesEditar = [
            'button[onclick*="editar"]',
            'button[onclick*="edit"]',
            '.btn-edit',
            '.btn-editar',
            '[data-action="edit"]',
            '[data-action="editar"]',
            'button[title*="Editar"]',
            'button[title*="editar"]',
            '.edit-button',
            '.editar-button'
        ];
        
        let botoesEncontrados = [];
        
        for (const seletor of seletoresBotoesEditar) {
            const botoes = document.querySelectorAll(seletor);
            botoes.forEach(botao => {
                botoesEncontrados.push({
                    elemento: botao,
                    seletor: seletor,
                    texto: botao.textContent?.trim() || '',
                    onclick: botao.getAttribute('onclick') || '',
                    visivel: botao.offsetParent !== null,
                    display: getComputedStyle(botao).display,
                    visibility: getComputedStyle(botao).visibility,
                    opacity: getComputedStyle(botao).opacity
                });
            });
        }
        
        console.log(`🔍 Botões de editar encontrados: ${botoesEncontrados.length}`);
        
        botoesEncontrados.forEach((info, index) => {
            console.log(`🔘 Botão ${index + 1}:`, {
                seletor: info.seletor,
                texto: info.texto,
                onclick: info.onclick,
                visivel: info.visivel,
                estilos: {
                    display: info.display,
                    visibility: info.visibility,
                    opacity: info.opacity
                }
            });
            
            // Verificar se está oculto
            if (!info.visivel || info.display === 'none' || info.visibility === 'hidden' || info.opacity === '0') {
                console.log(`⚠️ BOTÃO OCULTO DETECTADO: ${info.texto || info.onclick}`);
                
                // Tentar forçar visibilidade
                info.elemento.style.display = 'inline-block';
                info.elemento.style.visibility = 'visible';
                info.elemento.style.opacity = '1';
                
                console.log('✅ Tentativa de forçar visibilidade aplicada');
            }
        });
        
        // 2. PROCURAR CÓDIGO QUE OCULTA BOTÕES
        console.log('🔍 Procurando código que oculta botões...');
        
        // Interceptar mudanças de estilo
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const elemento = mutation.target;
                    
                    // Verificar se é botão de editar
                    const isBotaoEditar = seletoresBotoesEditar.some(seletor => {
                        try {
                            return elemento.matches(seletor);
                        } catch (e) {
                            return false;
                        }
                    });
                    
                    if (isBotaoEditar) {
                        const style = elemento.style;
                        
                        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                            console.log('🚨 BOTÃO DE EDITAR SENDO OCULTADO!');
                            console.log('  - Elemento:', elemento);
                            console.log('  - Texto:', elemento.textContent?.trim());
                            console.log('  - Onclick:', elemento.getAttribute('onclick'));
                            console.log('  - Estilo aplicado:', style.cssText);
                            
                            // Capturar stack trace
                            console.trace('Stack trace da ocultação:');
                            
                            // CORRIGIR IMEDIATAMENTE
                            console.log('🔧 CORRIGINDO VISIBILIDADE DO BOTÃO...');
                            elemento.style.display = 'inline-block';
                            elemento.style.visibility = 'visible';
                            elemento.style.opacity = '1';
                            
                            console.log('✅ Botão restaurado!');
                        }
                    }
                }
            });
        });
        
        // Observar toda a página
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['style'],
            subtree: true
        });
        
        // 3. PROCURAR FUNÇÕES ESPECÍFICAS QUE OCULTAM BOTÕES
        console.log('🔍 Procurando funções que ocultam botões...');
        
        // Listar todas as funções window que podem estar relacionadas
        const funcoesSuspeitas = [];
        for (const prop in window) {
            if (typeof window[prop] === 'function') {
                const nomeFuncao = prop.toLowerCase();
                if (nomeFuncao.includes('hide') || nomeFuncao.includes('ocultar') || 
                    nomeFuncao.includes('invisible') || nomeFuncao.includes('disable')) {
                    funcoesSuspeitas.push(prop);
                }
            }
        }
        
        console.log('🔍 Funções suspeitas encontradas:', funcoesSuspeitas);
        
        // 4. MONITORAR EXECUÇÃO DE JAVASCRIPT
        const originalSetAttribute = Element.prototype.setAttribute;
        Element.prototype.setAttribute = function(name, value) {
            if (name === 'style' && (value.includes('display: none') || value.includes('visibility: hidden'))) {
                // Verificar se é botão de editar
                const isBotaoEditar = seletoresBotoesEditar.some(seletor => {
                    try {
                        return this.matches(seletor);
                    } catch (e) {
                        return false;
                    }
                });
                
                if (isBotaoEditar) {
                    console.log('🚨 setAttribute tentando ocultar botão de editar!');
                    console.log('  - Elemento:', this);
                    console.log('  - Valor:', value);
                    console.trace('Stack trace:');
                    
                    // Impedir ocultação
                    console.log('🛡️ IMPEDINDO OCULTAÇÃO!');
                    return; // Não aplicar o estilo
                }
            }
            
            return originalSetAttribute.call(this, name, value);
        };
        
        console.log('✅ Proteção contra ocultação de botões ativada!');
        
    }, 2000);
});

// Função para restaurar todos os botões de editar
window.restaurarBotoesEditar = function() {
    console.log('🔧 Restaurando todos os botões de editar...');
    
    const seletores = [
        'button[onclick*="editar"]',
        'button[onclick*="edit"]',
        '.btn-edit',
        '.btn-editar',
        '[data-action="edit"]',
        '[data-action="editar"]',
        'button[title*="Editar"]',
        'button[title*="editar"]'
    ];
    
    let restaurados = 0;
    
    for (const seletor of seletores) {
        const botoes = document.querySelectorAll(seletor);
        botoes.forEach(botao => {
            const estava_oculto = botao.offsetParent === null;
            
            botao.style.display = 'inline-block';
            botao.style.visibility = 'visible';
            botao.style.opacity = '1';
            
            if (estava_oculto) {
                restaurados++;
                console.log(`✅ Botão restaurado: ${botao.textContent?.trim() || botao.getAttribute('onclick')}`);
            }
        });
    }
    
    console.log(`✅ ${restaurados} botões restaurados!`);
    return restaurados;
};

console.log('✅ Diagnóstico de botões de editar carregado!');
console.log('💡 Use window.restaurarBotoesEditar() para restaurar botões ocultos');