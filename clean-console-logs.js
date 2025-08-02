/**
 * Script para remover console.log de debug/desenvolvimento
 * Categorias de remoção:
 * 1. Debug explícitos (🔍, 🔧, 📊, etc.)
 * 2. Logs de teste (🧪, 🎯, ✅, ❌)
 * 3. Logs temporários de desenvolvimento
 */

const fs = require('fs');
const path = require('path');

// Padrões para remoção (Categoria 1 - Debug/Desenvolvimento)
const debugPatterns = [
    // Logs com emojis de debug
    /console\.log\(['"`][🔍🔧🛠️📊🧪🎯✅❌💡🔥⚠️📌📦].*?\);?/g,
    
    // Logs que contêm palavras-chave de debug
    /console\.log\(['"`].*?(DEBUG|debug|TESTE|teste|Debug|Test).*?\);?/g,
    
    // Logs de verificação de tipos
    /console\.log\(['"`].*?typeof.*?\);?/g,
    
    // Logs com === ou strings de separação
    /console\.log\(['"`].*?===.*?\);?/g,
    
    // Logs de inicialização temporária
    /console\.log\(['"`].*?(iniciando|carregado|loading|init).*?\);?/g,
    
    // Logs com uso/função disponível
    /console\.log\(['"`].*?(Use|use|função disponível|disponível).*?\);?/g
];

// Arquivos a serem processados (Categoria 1)
const filesToProcess = [
    // Arquivos de teste
    'teste-api-minima.js',
    'teste-busca-endereco.js', 
    'teste-coleta-ingressos.js',
    'teste-direto-lote.js',
    'teste-etapa6-corrigida.js',
    'teste-lote-id.js',
    'teste-lotes-quantidade.js',
    'teste-restaurar-lotes.js',
    'teste-salvamento-lotes.js',
    'teste-simples-busca.js',
    'teste-simples-combos.js',
    'teste-simples-debug.js',
    'teste-simples-limite.js',
    'teste-sintaxe-lotes.js',
    
    // Arquivos de debug
    'debug-api-completo.js',
    'debug-campos-ingresso.js',
    'debug-carregamento-lotes.js',
    'debug-completo-modais.js',
    'debug-currentstep.js',
    'debug-edicao.js',
    'debug-envio-api.js',
    'debug-envio-final.js',
    'debug-etapa6.js',
    'debug-functions.js',
    'debug-load.js',
    'debug-lote-completo.js',
    'debug-lotes.js',
    'debug-restauracao-completo.js',
    'debug-step4.js',
    'debug-upload.js',
    'debug-validacao-campos.js',
    'debug-validacoes.js',
    'debug-wizard-data.js',
    'debug-wizard-envio.js',
    
    // Arquivos de diagnóstico
    'diagnostico-botao-buscar.js',
    'diagnostico-botoes-editar.js',
    'diagnostico-correcoes.js',
    'diagnostico-google-maps.js',
    'diagnostico.js',
    
    // Outros arquivos de desenvolvimento
    'wizard-debug.js',
    'test-fixes.js',
    'log-detalhado-validacao.js'
];

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let removedCount = 0;
        
        // Aplicar cada padrão
        debugPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                removedCount += matches.length;
                content = content.replace(pattern, '');
            }
        });
        
        // Limpar linhas vazias extras
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            console.log(`✅ ${path.basename(filePath)}: ${removedCount} console.log removidos`);
        } else {
            console.log(`⚪ ${path.basename(filePath)}: Nenhum console.log de debug encontrado`);
        }
        
    } catch (error) {
        console.log(`❌ Erro ao processar ${filePath}: ${error.message}`);
    }
}

console.log('🧹 Iniciando limpeza de console.log de debug/desenvolvimento...\n');

const baseDir = 'D:/Dropbox/DESENVOLVIMENTO/AnySummit/public_html/produtor/js/';

// Processar cada arquivo
filesToProcess.forEach(fileName => {
    const filePath = path.join(baseDir, fileName);
    processFile(filePath);
});

console.log('\n✅ Limpeza concluída!');
