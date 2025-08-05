// Script para mover arquivos de persistência
const fs = require('fs').promises;
const path = require('path');

async function moveFiles() {
    const srcDir = 'D:\\Dropbox\\DESENVOLVIMENTO\\AnySummit\\public_html\\produtor_correto\\js';
    const destDir = 'D:\\Dropbox\\DESENVOLVIMENTO\\AnySummit\\public_html\\produtor_correto\\_removidos';
    
    // Lista de arquivos para remover
    const filesToMove = [
        'save-fix.js',
        'custom-recovery.js',
        'json-recovery-fix.js',
        'wizard-management.js',
        'wizard-data-fix.js',
        'correcao-cookies-recuperacao.js',
        'cookie-monitor.js',
        'force-save.js',
        'override-save.js',
        'test-recovery.js',
        'correcao-definitiva-total.js',
        'correcao-total-v2.js',
        'coletar-todos-dados.js',
        'remover-persistencia.js',
        'debug-avançar.js'
    ];
    
    for (const file of filesToMove) {
        const src = path.join(srcDir, file);
        const dest = path.join(destDir, file);
        
        try {
            await fs.rename(src, dest);
            console.log(`✓ Movido: ${file}`);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                console.log(`✗ Erro ao mover ${file}: ${err.message}`);
            } else {
                console.log(`- ${file} não encontrado`);
            }
        }
    }
    
    // Criar pasta para wizard-interceptor
    const wizardInterceptorDest = path.join(destDir, 'wizard-interceptor');
    await fs.mkdir(wizardInterceptorDest, { recursive: true });
    
    // Mover arquivos do wizard-interceptor
    const wizardFiles = await fs.readdir(path.join(srcDir, 'wizard-interceptor'));
    for (const file of wizardFiles) {
        const src = path.join(srcDir, 'wizard-interceptor', file);
        const dest = path.join(wizardInterceptorDest, file);
        
        try {
            await fs.rename(src, dest);
            console.log(`✓ Movido wizard-interceptor/${file}`);
        } catch (err) {
            console.log(`✗ Erro ao mover wizard-interceptor/${file}: ${err.message}`);
        }
    }
    
    // Remover pasta vazia
    try {
        await fs.rmdir(path.join(srcDir, 'wizard-interceptor'));
        console.log('✓ Pasta wizard-interceptor removida');
    } catch (err) {
        console.log('✗ Erro ao remover pasta wizard-interceptor:', err.message);
    }
}

moveFiles().then(() => console.log('\n✅ Limpeza concluída!'));
