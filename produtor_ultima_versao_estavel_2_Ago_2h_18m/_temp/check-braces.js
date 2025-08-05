const fs = require('fs');

const content = fs.readFileSync('D:\\Dropbox\\DESENVOLVIMENTO\\AnySummit\\public_html\\produtor\\js\\criaevento.js', 'utf8');

let openBraces = 0;
let closeBraces = 0;
let depth = 0;
let maxDepth = 0;
let currentLine = 1;
let problemLines = [];

for (let i = 0; i < content.length; i++) {
    if (content[i] === '\n') {
        currentLine++;
    }
    
    if (content[i] === '{') {
        openBraces++;
        depth++;
        if (depth > maxDepth) maxDepth = depth;
    } else if (content[i] === '}') {
        closeBraces++;
        depth--;
        if (depth < 0) {
            problemLines.push({line: currentLine, char: i, issue: 'Chave de fechamento extra'});
        }
    }
}

console.log(`Total de chaves abertas: ${openBraces}`);
console.log(`Total de chaves fechadas: ${closeBraces}`);
console.log(`Diferença: ${openBraces - closeBraces}`);
console.log(`Profundidade máxima: ${maxDepth}`);
console.log(`Profundidade final: ${depth}`);

if (problemLines.length > 0) {
    console.log('\nProblemas encontrados:');
    problemLines.forEach(p => {
        console.log(`  Linha ${p.line}: ${p.issue}`);
    });
}

// Verificar o final do arquivo
const lastLines = content.split('\n').slice(-10);
console.log('\nÚltimas 10 linhas do arquivo:');
lastLines.forEach((line, i) => {
    console.log(`${content.split('\n').length - 10 + i}: ${line}`);
});
