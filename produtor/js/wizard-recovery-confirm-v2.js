/**
 * Sistema de Confirmação de Recuperação do Wizard
 * Pergunta ao usuário se deseja continuar evento anterior ou recomeçar
 */
(function() {
    console.log('🔄 Sistema de confirmação de recuperação iniciado');
    
    // Verificar se há dados salvos ao carregar
    document.addEventListener('DOMContentLoaded', function() {
        verificarDadosSalvos();
    });
    
    function verificarDadosSalvos() {
        // Verificar cookies
        const wizardDataV2 = getCookie('eventoWizardV2');
        const wizardData = getCookie('eventoWizard');
        const lotesData = getCookie('lotesData');
        
        // Se não há dados salvos, não fazer nada
        if (!wizardDataV2 && !wizardData && !lotesData) {
            console.log('✅ Nenhum dado salvo encontrado');
            return;
        }
        
        // Verificar se há dados válidos
        let dadosValidos = false;
        let nomeEvento = '';
        
        try {
            if (wizardDataV2) {
                const dados = JSON.parse(wizardDataV2);
                nomeEvento = dados.evento?.nome || '';
                // Verificar se tem dados significativos
                if (nomeEvento || dados.evento?.categoria || dados.evento?.classificacao) {
                    dadosValidos = true;
                }
            } else if (wizardData) {
                const dados = JSON.parse(wizardData);
                nomeEvento = dados.eventName || dados.nome || '';
                // Verificar se tem dados significativos
                if (nomeEvento || dados.category || dados.classification || dados.currentStep > 1) {
                    dadosValidos = true;
                }
            }
        } catch (e) {
            console.error('Erro ao parsear dados salvos:', e);
            return;
        }
        
        // Se não há dados válidos ou nome vazio, não mostrar dialog
        if (!dadosValidos || !nomeEvento.trim()) {
            console.log('✅ Nenhum dado válido para recuperar');
            return;
        }
        
        // Criar modal de confirmação apenas se houver dados válidos
        criarModalConfirmacao(nomeEvento);
    }
    
    function criarModalConfirmacao(nomeEvento) {
        // Criar overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        // Criar modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 8px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        `;
        
        modal.innerHTML = `
            <h2 style="margin: 0 0 20px 0; color: #333;">Evento em Andamento Detectado</h2>
            <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6;">
                Foi detectado um evento em configuração:<br>
                <strong style="color: #333;">"${nomeEvento}"</strong><br><br>
                Deseja continuar de onde parou ou começar um novo evento?
            </p>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="btnNovo" style="
                    padding: 10px 20px;
                    border: 1px solid #ddd;
                    background: white;
                    color: #666;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                ">Começar Novo</button>
                <button id="btnContinuar" style="
                    padding: 10px 20px;
                    border: none;
                    background: #4CAF50;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                ">Continuar Evento</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Adicionar eventos
        document.getElementById('btnNovo').addEventListener('click', function() {
            limparTodosDados();
            overlay.remove();
        });
        
        document.getElementById('btnContinuar').addEventListener('click', function() {
            overlay.remove();
            setTimeout(() => {
                recuperarDadosSalvos();
            }, 100);
        });
    }
    
    function limparTodosDados() {
        console.log('🗑️ Limpando todos os dados salvos...');
        
        // Lista de todos os cookies relacionados ao wizard
        const cookiesParaLimpar = [
            'eventoWizard',
            'eventoWizardV2',
            'lotesData',
            'ingressosData',
            'wizardImages',
            'uploadedImages',
            'termsAccepted',
            'eventData'
        ];
        
        // Deletar cada cookie
        cookiesParaLimpar.forEach(cookieName => {
            deleteCookie(cookieName);
        });
        
        // Limpar localStorage se usado
        if (window.localStorage) {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('wizard') || key.includes('evento') || key.includes('lotes') || key.includes('ingressos'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
        
        // Limpar objetos globais
        if (window.WizardSaveSystemV2) {
            window.WizardSaveSystemV2.dadosEvento = { evento: {}, ingressos: [] };
            window.WizardSaveSystemV2.lotes = { porData: [], porPercentual: [] };
        }
        
        window.lotesData = null;
        window.ingressosTemporarios = null;
        window.uploadedImages = {};
        
        console.log('✅ Todos os dados foram limpos');
        
        // Recarregar a página para garantir limpeza total
        window.location.reload();
    }
    
    function recuperarDadosSalvos() {
        console.log('📥 Recuperando dados salvos...');
        
        // Recuperar usando o sistema V2
        if (window.WizardSaveSystemV2) {
            window.WizardSaveSystemV2.recuperarDeCookies();
        }
        
        // Chamar recuperação completa
        if (window.recuperarTodosCampos) {
            window.recuperarTodosCampos();
        }
        
        // Recuperar imagens
        if (window.recuperarImagens) {
            setTimeout(() => {
                window.recuperarImagens();
            }, 100);
        }
        
        console.log('✅ Dados recuperados');
    }
    
    // Funções auxiliares
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
        return null;
    }
    
    function deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/produtor;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/produtor/;`;
    }
    
    // Exportar função de limpeza para uso manual
    window.limparTodosDadosWizard = limparTodosDados;
    
    console.log('💡 Use limparTodosDadosWizard() para limpar todos os dados manualmente');
})();