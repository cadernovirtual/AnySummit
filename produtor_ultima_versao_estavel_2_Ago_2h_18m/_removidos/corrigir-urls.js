// Script para corrigir todas as URLs no wizard-database.js
const fs = require('fs');

const filePath = 'D:\\Dropbox\\DESENVOLVIMENTO\\AnySummit\\public_html\\produtor_correto\\js\\wizard-database.js';
let content = fs.readFileSync(filePath, 'utf8');

// Substituir todas as ocorrências de ajax/wizard_evento.php
content = content.replace(/ajax\/wizard_evento\.php/g, '/produtor_correto/ajax/wizard_evento.php');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ URLs corrigidas com sucesso!');
