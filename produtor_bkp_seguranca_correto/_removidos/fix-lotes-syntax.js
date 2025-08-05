// Script para corrigir o erro de sintaxe no lotes.js
const fs = require('fs');

const filePath = 'D:\\Dropbox\\DESENVOLVIMENTO\\AnySummit\\public_html\\produtor_correto\\js\\lotes.js';
let content = fs.readFileSync(filePath, 'utf8');

// Procurar o trecho problemático e corrigir
const problematico = `        }
    }
        console.warn('Elemento lotePercentualEmpty não encontrado, mas continuando renderização');
        // Não retornar, continuar mesmo sem o empty state
    }
    
    if (lotesData.porPercentual.length === 0) {`;

const corrigido = `        }
    }
    
    // Código movido para dentro da função
    if (!emptyState) {
        console.warn('Elemento lotePercentualEmpty não encontrado, mas continuando renderização');
        // Não retornar, continuar mesmo sem o empty state
    }
    
    if (lotesData.porPercentual.length === 0) {`;

content = content.replace(problematico, corrigido);

// Também remover o return solto
content = content.replace(/^\s*return;\s*$/gm, '// return removido');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Erro de sintaxe corrigido no lotes.js!');
