/**
 * Diagnóstico específico do botão Buscar Endereço
 * Para verificar se está sendo renderizado corretamente
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Diagnóstico do botão Buscar Endereço...');
    
    setTimeout(function() {
        // Verificar se estamos na etapa 4
        const step4 = document.querySelector('[data-step-content="4"]');
        console.log('📍 Etapa 4 encontrada:', !!step4);
        console.log('📍 Etapa 4 está ativa:', step4?.classList.contains('active'));
        
        // Verificar seção presencial
        const presentialSection = document.getElementById('presentialLocation');
        console.log('🏢 Seção presencial encontrada:', !!presentialSection);
        console.log('🏢 Seção presencial tem classe show:', presentialSection?.classList.contains('show'));
        console.log('🏢 Seção presencial display:', presentialSection?.style.display || 'padrão');
        
        // Verificar form-group da busca
        const formGroupBusca = presentialSection?.querySelector('.form-group.full-width');
        console.log('📝 Form group busca encontrado:', !!formGroupBusca);
        
        // Verificar campo de input
        const addressSearch = document.getElementById('addressSearch');
        console.log('🔍 Campo addressSearch encontrado:', !!addressSearch);
        console.log('🔍 Campo addressSearch visível:', addressSearch?.offsetParent !== null);
        
        // Verificar div do botão
        const buttonContainer = presentialSection?.querySelector('div[style*="display: flex"]');
        console.log('📦 Container do botão encontrado:', !!buttonContainer);
        console.log('📦 Container do botão display:', buttonContainer?.style.display);
        
        // Verificar o botão específico
        const btnBuscar = document.querySelector('button[onclick="searchAddressManual()"]');
        console.log('🔘 Botão buscar encontrado:', !!btnBuscar);
        console.log('🔘 Botão buscar texto:', btnBuscar?.textContent?.trim());
        console.log('🔘 Botão buscar visível:', btnBuscar?.offsetParent !== null);
        console.log('🔘 Botão buscar classes:', btnBuscar?.className);
        console.log('🔘 Botão buscar computed display:', btnBuscar ? window.getComputedStyle(btnBuscar).display : 'N/A');
        console.log('🔘 Botão buscar computed visibility:', btnBuscar ? window.getComputedStyle(btnBuscar).visibility : 'N/A');
        
        // Verificar todos os botões na página
        const todosBotoes = document.querySelectorAll('button');
        console.log('🔘 Total de botões na página:', todosBotoes.length);
        
        const botoesNaEtapa4 = step4?.querySelectorAll('button') || [];
        console.log('🔘 Botões na etapa 4:', botoesNaEtapa4.length);
        
        botoesNaEtapa4.forEach((btn, index) => {
            console.log(`   Botão ${index + 1}:`, btn.textContent?.trim(), 'Visível:', btn.offsetParent !== null);
        });
        
        // Verificar se há CSS escondendo
        if (btnBuscar) {
            const styles = window.getComputedStyle(btnBuscar);
            console.log('🎨 Estilos do botão:');
            console.log('   - display:', styles.display);
            console.log('   - visibility:', styles.visibility);
            console.log('   - opacity:', styles.opacity);
            console.log('   - position:', styles.position);
            console.log('   - z-index:', styles.zIndex);
            console.log('   - width:', styles.width);
            console.log('   - height:', styles.height);
        }
        
        // Verificar se há erro de JavaScript
        console.log('🔧 Verificar função searchAddressManual:', typeof window.searchAddressManual);
        
        // Tentar forçar visibilidade se o botão existir mas estiver escondido
        if (btnBuscar && btnBuscar.offsetParent === null) {
            console.log('⚠️ BOTÃO EXISTE MAS ESTÁ INVISÍVEL! Tentando forçar visibilidade...');
            btnBuscar.style.display = 'inline-block';
            btnBuscar.style.visibility = 'visible';
            btnBuscar.style.opacity = '1';
            console.log('✅ Tentativa de forçar visibilidade aplicada');
        }
        
        // Função para ir diretamente para etapa 4
        window.irParaEtapa4 = function() {
            if (typeof window.showStep === 'function') {
                window.showStep(4);
                console.log('📍 Navegado para etapa 4');
            } else {
                console.log('❌ Função showStep não encontrada');
            }
        };
        
        console.log('✅ Diagnóstico completo. Use irParaEtapa4() se necessário.');
        
    }, 1000);
});
