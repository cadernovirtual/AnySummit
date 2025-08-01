/**
 * Debug do Sistema de Salvamento V2
 */
(function() {
    console.log('🐛 Debug do salvamento V2 iniciado');
    
    // Comando para verificar dados salvos
    window.verificarDadosSalvos = function() {
        console.log('=== VERIFICAÇÃO DE DADOS SALVOS ===');
        
        // Verificar dados principais
        if (window.WizardSaveSystemV2) {
            const dados = window.WizardSaveSystemV2.obterDadosCompletos();
            console.log('📦 Dados principais:', dados);
            
            // Verificar campos específicos
            console.log('\n📋 CAMPOS IMPORTANTES:');
            console.log('Nome:', dados.evento?.nome);
            console.log('Classificação:', dados.evento?.classificacao);
            console.log('Categoria:', dados.evento?.categoria);
            console.log('Data início:', dados.evento?.data_inicio);
            console.log('Data fim:', dados.evento?.data_fim);
            console.log('CEP:', dados.evento?.cep);
            console.log('Rua:', dados.evento?.rua);
            console.log('Número:', dados.evento?.numero);
            console.log('Cidade:', dados.evento?.cidade);
            console.log('Estado:', dados.evento?.estado);
            
            // Verificar lotes
            console.log('\n📦 LOTES:');
            console.log('Lotes no WizardSaveSystemV2:', window.WizardSaveSystemV2.lotes);
            console.log('Lotes em window.lotesData:', window.lotesData);
        }
        
        // Verificar cookies separados
        console.log('\n🍪 COOKIES SEPARADOS:');
        console.log('Classification:', getCookie('wizard_classification'));
        console.log('Category:', getCookie('wizard_category'));
        console.log('Endereço:', getCookie('wizard_endereco'));
        console.log('Lotes:', getCookie('wizard_lotes'));
        
        // Verificar estado atual
        console.log('\n📍 ESTADO ATUAL:');
        console.log('Step atual:', window.currentStep);
        console.log('Classificação no DOM:', document.getElementById('classification')?.value);
        console.log('Categoria no DOM:', document.getElementById('category')?.value);
    };
    
    // Comando para forçar salvamento
    window.forcarSalvamento = function() {
        console.log('💾 Forçando salvamento de todos os dados...');
        
        if (window.WizardSaveSystemV2) {
            // Salvar todos os steps
            for (let i = 1; i <= 8; i++) {
                console.log(`Salvando step ${i}...`);
                window.WizardSaveSystemV2.salvarStepAtual(i);
            }
            
            console.log('✅ Todos os dados salvos!');
            verificarDadosSalvos();
        }
    };
    
    // Função auxiliar getCookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
        return null;
    }
    
    // Auto executar verificação ao carregar
    setTimeout(() => {
        console.log('💡 Comandos disponíveis:');
        console.log('- verificarDadosSalvos() - Mostra todos os dados salvos');
        console.log('- forcarSalvamento() - Força salvamento de todos os steps');
    }, 1000);
})();