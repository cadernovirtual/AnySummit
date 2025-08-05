/**
 * Helper para criar dados de teste no wizard
 * Facilita o teste do sistema de recuperação
 */

(function() {
    'use strict';
    
    console.log('🧪 Test Helper carregado');
    
    // Função para criar dados de teste
    window.criarDadosTeste = function(step = 3) {
        const dadosTeste = {
            currentStep: step,
            eventName: "Evento de Teste " + new Date().toLocaleTimeString(),
            classification: "16",
            category: "negocios",
            startDateTime: "2025-03-15T09:00",
            endDateTime: "2025-03-15T18:00",
            venueName: "Local de Teste",
            addressSearch: "Rua Teste, 123",
            street: "Rua Teste",
            number: "123",
            neighborhood: "Centro",
            city: "Goiânia",
            state: "GO",
            cep: "74000-000",
            eventDescription: "<p>Descrição do evento de teste</p>",
            corFundo: "#ff0000",
            timestamp: new Date().getTime()
        };
        
        // Salvar no cookie
        const cookieValue = encodeURIComponent(JSON.stringify(dadosTeste));
        document.cookie = `eventoWizard=${cookieValue}; path=/; max-age=604800`;
        
        console.log('✅ Dados de teste criados!');
        console.log('📋 Dados:', dadosTeste);
        console.log('🍪 Cookie salvo com sucesso');
        console.log('💡 Recarregue a página para ver o dialog de recuperação');
        
        return dadosTeste;
    };
    
    // Função para verificar cookie
    window.verificarCookie = function() {
        const cookies = document.cookie.split(';');
        let wizardData = null;
        
        for (const cookie of cookies) {
            const trimmed = cookie.trim();
            if (trimmed.startsWith('eventoWizard=')) {
                wizardData = trimmed.substring(13);
                break;
            }
        }
        
        if (wizardData) {
            try {
                const decoded = decodeURIComponent(wizardData);
                const parsed = JSON.parse(decoded);
                console.log('✅ Cookie encontrado:', parsed);
                return parsed;
            } catch (e) {
                console.error('❌ Erro ao decodificar cookie:', e);
            }
        } else {
            console.log('❌ Nenhum cookie eventoWizard encontrado');
        }
        
        return null;
    };
    
    // Função para forçar dialog
    window.forcarDialog = function() {
        // Primeiro criar dados de teste se não existirem
        const cookie = verificarCookie();
        if (!cookie) {
            criarDadosTeste();
        }
        
        // Resetar flags
        window._recoveryDialogShown = false;
        window._recoveryInProgress = false;
        
        // Chamar função de recuperação
        if (window.checkAndRestoreWizardDataUnified) {
            window.checkAndRestoreWizardDataUnified();
        } else if (window.checkAndRestoreWizardData) {
            window.checkAndRestoreWizardData();
        } else {
            console.error('❌ Nenhuma função de recuperação encontrada!');
        }
    };
    
    // Função para testar dialog customizado
    window.testarDialog = function() {
        if (window.customDialog && window.customDialog.confirm) {
            window.customDialog.confirm({
                title: '✅ Teste de Dialog',
                message: 'Este é um teste do dialog customizado.<br>Os botões devem funcionar corretamente.',
                confirmText: 'Confirmar',
                cancelText: 'Cancelar',
                onConfirm: () => {
                    console.log('✅ Botão Confirmar clicado!');
                    alert('Confirmado!');
                },
                onCancel: () => {
                    console.log('❌ Botão Cancelar clicado!');
                    alert('Cancelado!');
                }
            });
        } else {
            console.error('❌ customDialog não está disponível!');
        }
    };
    
    console.log('💡 Comandos disponíveis:');
    console.log('   criarDadosTeste() - Cria dados de teste no cookie (step 3)');
    console.log('   criarDadosTeste(1) - Cria dados de teste no step 1');
    console.log('   criarDadosTeste(5) - Cria dados de teste no step 5');
    console.log('   verificarCookie() - Verifica se há dados salvos');
    console.log('   forcarDialog() - Força exibição do dialog de recuperação');
    console.log('   testarRecuperacao() - Testa o sistema de recuperação');
    console.log('   testarDialog() - Testa o dialog customizado');
    console.log('   limparTudo() - Limpa todos os dados salvos');
    
})();
