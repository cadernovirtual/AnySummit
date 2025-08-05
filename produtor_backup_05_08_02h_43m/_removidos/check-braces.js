// Script para verificar e corrigir chaves no lotes.js
const fs = require('fs');

const filePath = 'D:\\Dropbox\\DESENVOLVIMENTO\\AnySummit\\public_html\\produtor_correto\\js\\lotes.js';
let content = fs.readFileSync(filePath, 'utf8');

// Contar chaves
let openBraces = 0;
let closeBraces = 0;
let lines = content.split('\n');

lines.forEach((line, index) => {
    for (let char of line) {
        if (char === '{') openBraces++;
        if (char === '}') closeBraces++;
    }
    
    // Verificar linha 560
    if (index === 559) { // linha 560 (índice 559)
        console.log(`Linha 560: "${line}"`);
        console.log(`Até aqui - Aberturas: ${openBraces}, Fechamentos: ${closeBraces}`);
    }
});

console.log(`Total - Aberturas: ${openBraces}, Fechamentos: ${closeBraces}`);

if (closeBraces > openBraces) {
    console.log(`❌ Há ${closeBraces - openBraces} chave(s) de fechamento extra(s)`);
    
    // Remover última chave extra se estiver sozinha numa linha
    const lastBraceIndex = content.lastIndexOf('\n}');
    if (lastBraceIndex > -1) {
        // Verificar se é uma linha com apenas }
        const lineStart = content.lastIndexOf('\n', lastBraceIndex - 1);
        const lineEnd = content.indexOf('\n', lastBraceIndex + 1);
        const line = content.substring(lineStart + 1, lineEnd > -1 ? lineEnd : undefined).trim();
        
        if (line === '}') {
            console.log('Removendo última chave extra...');
            content = content.substring(0, lineStart) + content.substring(lineEnd > -1 ? lineEnd : content.length);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('✅ Chave extra removida!');
        }
    }
} else if (openBraces > closeBraces) {
    console.log(`❌ Faltam ${openBraces - closeBraces} chave(s) de fechamento`);
} else {
    console.log('✅ Chaves balanceadas!');
}
