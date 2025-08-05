// Script para corrigir as funções coletarStep
const fs = require('fs');
const path = require('path');

const filePath = 'D:\\Dropbox\\DESENVOLVIMENTO\\AnySummit\\public_html\\produtor\\js\\wizard-interceptor\\wizard-data-collector.js';
let content = fs.readFileSync(filePath, 'utf8');

// Corrigir todas as funções coletarStep que estão sem número e parênteses
for (let i = 1; i <= 8; i++) {
    const regex = new RegExp(`function coletarStep(\\s+)console\\.log\\('📊 Coletando dados do Step ${i}`, 'g');
    content = content.replace(regex, `function coletarStep${i}() {\n        console.log('📊 Coletando dados do Step ${i}`);
}

// Salvar o arquivo corrigido
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Arquivo corrigido com sucesso!');
