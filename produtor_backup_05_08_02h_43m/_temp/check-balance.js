// Pequeno script para verificar balanceamento de chaves
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'criaevento.js');
const content = fs.readFileSync(filePath, 'utf8');

let balance = 0;
let line = 1;
let problematicLines = [];

for (let i = 0; i < content.length; i++) {
    if (content[i] === '\n') line++;
    
    if (content[i] === '{') {
        balance++;
    } else if (content[i] === '}') {
        balance--;
        if (balance < 0) {
            problematicLines.push(`Linha ${line}: Chave de fechamento extra (balance: ${balance})`);
        }
    }
}

console.log(`Balanceamento final: ${balance}`);
console.log(`Deve ser 0 para estar correto`);

if (problematicLines.length > 0) {
    console.log('\nProblemas encontrados:');
    problematicLines.forEach(p => console.log(p));
}

// Verificar a estrutura IIFE
const iifeStart = content.indexOf('(function() {');
const iifeEnd = content.lastIndexOf('})();');

console.log(`\nIIFE começa na posição: ${iifeStart}`);
console.log(`IIFE termina na posição: ${iifeEnd}`);

if (iifeStart > -1 && iifeEnd > -1) {
    // Contar chaves dentro do IIFE
    const iifeContent = content.substring(iifeStart, iifeEnd + 4);
    let iifeBalance = 0;
    
    for (let char of iifeContent) {
        if (char === '{') iifeBalance++;
        if (char === '}') iifeBalance--;
    }
    
    console.log(`Balanceamento dentro do IIFE: ${iifeBalance}`);
}
