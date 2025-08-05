// Script para remover chamadas de saveWizardData do criaevento.js
const fs = require('fs');

const filePath = 'D:\\Dropbox\\DESENVOLVIMENTO\\AnySummit\\public_html\\produtor_correto\\js\\criaevento.js';
let content = fs.readFileSync(filePath, 'utf8');

// Remover chamadas de saveWizardData()
content = content.replace(/saveWizardData\(\);?/g, '// saveWizardData() removido');

// Remover chamadas de checkAndRestoreWizardData()
content = content.replace(/checkAndRestoreWizardData\(\);?/g, '// checkAndRestoreWizardData() removido');

// Comentar as funções completas
content = content.replace(
    /\/\/ Funções de persistência removidas[\s\S]*?function checkAndRestoreWizardData/,
    `/* FUNÇÕES DE PERSISTÊNCIA REMOVIDAS - SERÃO SUBSTITUÍDAS POR SALVAMENTO DIRETO NO BANCO
        
        function checkAndRestoreWizardData`
);

// Encontrar o fim da função checkAndRestoreWizardData e comentar
let braceCount = 0;
let inFunction = false;
let functionStart = content.indexOf('function checkAndRestoreWizardData');
let i = functionStart;

if (functionStart !== -1) {
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
        
        // Adicionar comentário de fechamento após o último }
        content = content.slice(0, i) + '\n        FIM DAS FUNÇÕES DE PERSISTÊNCIA REMOVIDAS */\n' + content.slice(i);
    }
}

// Remover console.logs relacionados a cookies e salvamento
content = content.replace(/console\.log\([^)]*[Cc]ookie[^)]*\);?/g, '');
content = content.replace(/console\.log\([^)]*salvando[^)]*\);?/g, '');
content = content.replace(/console\.log\([^)]*wizard[^)]*\);?/g, '');
content = content.replace(/console\.log\([^)]*recuper[^)]*\);?/g, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Funções de persistência removidas com sucesso!');
