// Script para substituir todas as referências de produtor_correto para produtor
const fs = require('fs');
const path = require('path');

const baseDir = 'D:\\Dropbox\\DESENVOLVIMENTO\\AnySummit\\public_html\\produtor';
let totalReplacements = 0;
let filesModified = [];

// Função para processar arquivos
function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // Substituir variações de produtor_correto
        content = content.replace(/\/produtor\//g, '/produtor/');
        content = content.replace(/produtor\//g, 'produtor/');
        content = content.replace(/produtor\\/g, 'produtor\\');
        
        // Se houve mudanças, salvar
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            
            // Contar substituições
            const matches = originalContent.match(/produtor/g);
            const count = matches ? matches.length : 0;
            totalReplacements += count;
            filesModified.push({
                file: filePath.replace(baseDir, ''),
                replacements: count
            });
            
            console.log(`✓ ${path.basename(filePath)} - ${count} substituições`);
        }
    } catch (err) {
        if (err.code !== 'EISDIR' && err.code !== 'EPERM') {
            console.log(`✗ Erro em ${filePath}: ${err.message}`);
        }
    }
}

// Função recursiva para percorrer diretórios
function walkDir(dir) {
    try {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                // Pular diretórios específicos
                if (!file.startsWith('.') && file !== 'node_modules' && file !== '_removidos') {
                    walkDir(filePath);
                }
            } else if (stat.isFile()) {
                // Processar apenas arquivos de texto
                const ext = path.extname(file).toLowerCase();
                const textExts = ['.php', '.js', '.html', '.css', '.md', '.txt', '.json', '.sql'];
                
                if (textExts.includes(ext)) {
                    processFile(filePath);
                }
            }
        }
    } catch (err) {
        console.log(`✗ Erro ao ler diretório ${dir}: ${err.message}`);
    }
}

console.log('🔍 Iniciando busca e substituição de produtor_correto para produtor...\n');

// Processar todos os arquivos
walkDir(baseDir);

console.log('\n📊 Resumo:');
console.log(`Total de substituições: ${totalReplacements}`);
console.log(`Arquivos modificados: ${filesModified.length}`);

if (filesModified.length > 0) {
    console.log('\n📁 Arquivos modificados:');
    filesModified.forEach(item => {
        console.log(`  ${item.file} (${item.replacements} substituições)`);
    });
}

console.log('\n✅ Processo concluído!');
