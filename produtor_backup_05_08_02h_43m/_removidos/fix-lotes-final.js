// Script para corrigir linha específica no lotes.js
const fs = require('fs');

const filePath = 'D:\\Dropbox\\DESENVOLVIMENTO\\AnySummit\\public_html\\produtor_correto\\js\\lotes.js';
let content = fs.readFileSync(filePath, 'utf8');

// Corrigir linha 560 que está mal formatada
content = content.replace(
    'console.error(\'Lote não encontrado:\', id);// return removido',
    'console.error(\'Lote não encontrado:\', id);\n        // return removido'
);

// Verificar se há return statements fora de funções
const lines = content.split('\n');
let inFunction = false;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detectar início de função
    if (line.includes('function ') || line.includes('=>')) {
        inFunction = true;
    }
    
    // Contar chaves
    for (let char of line) {
        if (char === '{') {
            braceCount++;
            inFunction = true;
        }
        if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
                inFunction = false;
            }
        }
    }
    
    // Verificar returns soltos
    if (!inFunction && line.trim() === 'return;') {
        console.log(`Removendo return solto na linha ${i + 1}`);
        lines[i] = '        // return removido';
    }
}

content = lines.join('\n');

// Remover chave extra no final se existir
if (content.trim().endsWith('}\n}')) {
    content = content.trim().slice(0, -1);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Arquivo lotes.js corrigido!');
