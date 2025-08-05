// Script para limpar completamente as funções de persistência
const fs = require('fs');

const filePath = 'D:\\Dropbox\\DESENVOLVIMENTO\\AnySummit\\public_html\\produtor_correto\\js\\criaevento.js';
let content = fs.readFileSync(filePath, 'utf8');

// Encontrar o início da seção de persistência
const startMarker = '// Funções de persistência removidas - serão substituídas por salvamento direto no banco';
const startIndex = content.indexOf(startMarker);

if (startIndex !== -1) {
    // Encontrar onde termina a função checkAndRestoreWizardData
    // Procurar pelo próximo "function" no nível principal ou pelo fim do bloco de restauração
    let searchFrom = content.indexOf('function // checkAndRestoreWizardData() removido', startIndex);
    
    if (searchFrom === -1) {
        searchFrom = content.indexOf('function checkAndRestoreWizardData', startIndex);
    }
    
    if (searchFrom !== -1) {
        // Contar chaves para encontrar o fim da função
        let braceCount = 0;
        let i = searchFrom;
        
        // Pular até o primeiro {
        while (i < content.length && content[i] !== '{') i++;
        
        if (i < content.length) {
            braceCount = 1;
            i++;
            
            while (i < content.length && braceCount > 0) {
                if (content[i] === '{') braceCount++;
                else if (content[i] === '}') braceCount--;
                i++;
            }
            
            // Procurar a próxima função após o fechamento
            let nextFunctionIndex = content.indexOf('\n        function', i);
            if (nextFunctionIndex === -1) {
                nextFunctionIndex = content.indexOf('\nfunction', i);
            }
            
            if (nextFunctionIndex !== -1) {
                // Substituir toda a seção por um comentário
                const before = content.substring(0, startIndex);
                const after = content.substring(nextFunctionIndex);
                
                content = before + 
                    '// Funções de persistência removidas - serão substituídas por salvamento direto no banco\n' +
                    '        // saveWizardData() - removida\n' +
                    '        // checkAndRestoreWizardData() - removida\n' +
                    '        // clearAllWizardData() - removida\n' +
                    '        // Funções de cookie - removidas\n' +
                    after;
            }
        }
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Limpeza completa das funções de persistência!');
