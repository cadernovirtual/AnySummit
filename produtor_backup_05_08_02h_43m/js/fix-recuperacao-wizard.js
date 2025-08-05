// Fix para controle correto de recuperação do wizard
(function() {
    console.log('🔄 Fix de recuperação do wizard iniciado...');
    
    // Função para verificar se há dados válidos para recuperar
    window.temDadosValidosParaRecuperar = function() {
        console.log('🔍 Verificando se há dados válidos para recuperar...');
        
        try {
            // Buscar cookie do wizard
            const wizardCookie = document.cookie.split(';').find(c => c.trim().startsWith('eventoWizard='));
            if (!wizardCookie) {
                console.log('❌ Nenhum cookie eventoWizard encontrado');
                return false;
            }
            
            const wizardData = JSON.parse(decodeURIComponent(wizardCookie.split('=')[1]));
            
            // Verificar se tem dados significativos (não apenas o nome que acabou de digitar)
            const temDadosSignificativos = 
                (wizardData.currentStep && wizardData.currentStep > 1) ||
                (wizardData.eventDescription && wizardData.eventDescription.length > 10) ||
                (wizardData.uploadedImages && Object.keys(wizardData.uploadedImages).length > 0) ||
                (wizardData.ingressosSalvos && wizardData.ingressosSalvos.length > 0) ||
                (wizardData.startDateTime && wizardData.startDateTime !== '') ||
                (wizardData.addressSearch && wizardData.addressSearch !== '');
            
            if (!temDadosSignificativos) {
                console.log('❌ Dados do wizard não são significativos');
                return false;
            }
            
            // Verificar se não é muito antigo (mais de 24 horas)
            if (wizardData.timestamp) {
                const agora = new Date().getTime();
                const idade = agora - wizardData.timestamp;
                const horasIdade = idade / (1000 * 60 * 60);
                
                if (horasIdade > 24) {
                    console.log('❌ Dados do wizard muito antigos:', horasIdade.toFixed(1), 'horas');
                    return false;
                }
            }
            
            console.log('✅ Dados válidos encontrados:', wizardData);
            return wizardData;
            
        } catch (e) {
            console.error('Erro ao verificar dados do wizard:', e);
            return false;
        }
    };
    
    // Override da função de recuperação
    const originalCheckAndRestore = window.checkAndRestoreWizardData;
    
    window.checkAndRestoreWizardData = function() {
        console.log('🔄 Verificando recuperação do wizard...');
        
        const dadosValidos = temDadosValidosParaRecuperar();
        
        if (!dadosValidos) {
            console.log('❌ Não há dados válidos para recuperar');
            // Limpar qualquer cookie inválido
            document.cookie = 'eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            return;
        }
        
        // Só perguntar se o nome atual é diferente do salvo
        const nomeAtual = document.getElementById('eventName')?.value || '';
        const nomeSalvo = dadosValidos.eventName || '';
        
        // Se acabou de digitar o mesmo nome, não perguntar
        if (nomeAtual && nomeAtual === nomeSalvo) {
            console.log('❌ Nome atual igual ao salvo, não perguntar');
            return;
        }
        
        // Se o campo está vazio ou tem um nome diferente, perguntar
        if (!nomeAtual || nomeAtual !== nomeSalvo) {
            // Chamar função original
            if (originalCheckAndRestore) {
                originalCheckAndRestore.call(this);
            }
        }
    };
    
    // Corrigir problema de bloqueio de upload após recusar recuperação
    window.corrigirBloqueioUpload = function() {
        console.log('🔧 Corrigindo bloqueio de upload...');
        
        // Reabilitar todos os inputs de upload
        const uploadsIds = ['logoUpload', 'capaUpload', 'fundoUpload'];
        
        uploadsIds.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.disabled = false;
                input.style.pointerEvents = 'auto';
                
                // Remover qualquer event listener antigo
                const newInput = input.cloneNode(true);
                input.parentNode.replaceChild(newInput, input);
                
                // Reconfigurar event listener
                newInput.addEventListener('change', function() {
                    handleImageUpload(this, id.replace('Upload', 'Preview'), id.replace('Upload', '').toLowerCase());
                });
                
                console.log(`✅ ${id} desbloqueado`);
            }
            
            // Desbloquear também o container de preview
            const preview = document.getElementById(id.replace('Upload', 'Preview'));
            if (preview) {
                preview.style.pointerEvents = 'auto';
                preview.style.opacity = '1';
                
                // Reconfigurar click no preview
                preview.onclick = function() {
                    document.getElementById(id).click();
                };
            }
        });
    };
    
    // Interceptar quando usuário recusa recuperação
    const originalConfirm = window.confirm;
    window.confirm = function(message) {
        const result = originalConfirm.call(this, message);
        
        // Se recusou recuperação (clicou em "Não, começar novo")
        if (!result && message && message.includes('retomar')) {
            console.log('👤 Usuário recusou recuperação, corrigindo uploads...');
            
            // Limpar dados antigos
            document.cookie = 'eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'ingressosSalvos=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            
            // Corrigir bloqueio de upload
            setTimeout(() => {
                corrigirBloqueioUpload();
            }, 100);
        }
        
        return result;
    };
    
    // Função de debug
    window.debugRecuperacao = function() {
        console.log('🔍 Debug de recuperação:');
        
        const dados = temDadosValidosParaRecuperar();
        if (dados) {
            console.log('Dados encontrados:', dados);
            console.log('Step atual:', dados.currentStep);
            console.log('Tem imagens?', dados.uploadedImages ? Object.keys(dados.uploadedImages).length : 0);
            console.log('Tem ingressos?', dados.ingressosSalvos ? dados.ingressosSalvos.length : 0);
        } else {
            console.log('Nenhum dado válido para recuperar');
        }
        
        // Verificar estado dos uploads
        console.log('\nEstado dos uploads:');
        ['logoUpload', 'capaUpload', 'fundoUpload'].forEach(id => {
            const input = document.getElementById(id);
            console.log(`${id}:`, input ? `disabled=${input.disabled}` : 'não encontrado');
        });
    };
    
    console.log('✅ Fix de recuperação do wizard carregado!');
    console.log('Use debugRecuperacao() para verificar');
})();