// Gerenciamento de Termos e Políticas
(function() {
    'use strict';
    
    // Tornar global para acesso em outros scripts
    window.termsAccepted = false;
    
    // Função para mostrar termos
    window.showTerms = function(event) {
        if (event) event.preventDefault();
        
        // Buscar termos do banco via AJAX
        fetch('ajax/get_parametros.php?tipo=termos')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.content) {
                    document.getElementById('termsContent').innerHTML = data.content;
                } else {
                    document.getElementById('termsContent').innerHTML = '<p>Erro ao carregar os termos de uso.</p>';
                }
                openModal('termsModal');
            })
            .catch(error => {
                console.error('Erro ao buscar termos:', error);
                document.getElementById('termsContent').innerHTML = '<p>Erro ao carregar os termos de uso.</p>';
                openModal('termsModal');
            });
    };
    
    // Função para mostrar política de privacidade
    window.showPrivacy = function(event) {
        if (event) event.preventDefault();
        
        // Buscar política do banco via AJAX
        fetch('ajax/get_parametros.php?tipo=politicas')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.content) {
                    document.getElementById('privacyContent').innerHTML = data.content;
                } else {
                    document.getElementById('privacyContent').innerHTML = '<p>Erro ao carregar a política de privacidade.</p>';
                }
                openModal('privacyModal');
            })
            .catch(error => {
                console.error('Erro ao buscar política:', error);
                document.getElementById('privacyContent').innerHTML = '<p>Erro ao carregar a política de privacidade.</p>';
                openModal('privacyModal');
            });
    };
    
    // Atualizar estado do checkbox de termos
    function updateTermsCheckbox() {
        console.log('Iniciando updateTermsCheckbox');
        const checkbox = document.getElementById('termsCheckbox');
        const publishBtn = document.querySelector('.btn-publish');
        const validationMsg = document.getElementById('validation-step-7');
        
        console.log('Elementos encontrados:', {
            checkbox: checkbox,
            publishBtn: publishBtn,
            validationMsg: validationMsg
        });
        
        if (!checkbox) {
            console.error('Checkbox de termos não encontrado!');
            // Tentar novamente após um delay
            setTimeout(updateTermsCheckbox, 500);
            return;
        }
        
        if (!publishBtn) {
            console.error('Botão de publicar não encontrado!');
            return;
        }
        
        // Remover listeners anteriores para evitar duplicação
        const newCheckbox = checkbox.cloneNode(true);
        checkbox.parentNode.replaceChild(newCheckbox, checkbox);
        
        // Adicionar evento de clique ao checkbox
        newCheckbox.addEventListener('click', function(e) {
            console.log('Checkbox clicado');
            e.stopPropagation();
            this.classList.toggle('checked');
            window.termsAccepted = this.classList.contains('checked');
            
            // Atualizar estado do botão de publicar
            if (window.termsAccepted) {
                publishBtn.disabled = false;
                publishBtn.style.opacity = '1';
                publishBtn.style.cursor = 'pointer';
                if (validationMsg) {
                    validationMsg.style.display = 'none';
                }
            } else {
                publishBtn.disabled = true;
                publishBtn.style.opacity = '0.5';
                publishBtn.style.cursor = 'not-allowed';
                if (validationMsg) {
                    validationMsg.style.display = 'block';
                }
            }
        });
        
        // Estado inicial: desabilitado
        publishBtn.disabled = true;
        publishBtn.style.opacity = '0.5';
        publishBtn.style.cursor = 'not-allowed';
        
        console.log('updateTermsCheckbox concluído');
    }
    
    // Melhorar a função de publicar evento - aguardar carregamento
    setTimeout(() => {
        const originalPublishEvent = window.publishEvent;
        if (originalPublishEvent) {
            window.publishEvent = async function() {
                if (!termsAccepted) {
                    const validationMsg = document.getElementById('validation-step-7');
                    if (validationMsg) {
                        validationMsg.style.display = 'block';
                        validationMsg.style.color = '#ff4444';
                        validationMsg.textContent = '❌ Você precisa aceitar os termos de uso e políticas de privacidade para publicar o evento.';
                    }
                    return;
                }
                
                // Chamar função original
                return await originalPublishEvent();
            };
            console.log('Override de publishEvent configurado com sucesso');
        } else {
            console.error('Função publishEvent não encontrada para override');
        }
    }, 1000); // Aguardar 1 segundo para garantir que tudo foi carregado
    
    // Adicionar estilos CSS para os modais de termos
    const style = document.createElement('style');
    style.textContent = `
        #termsModal .modal-body,
        #privacyModal .modal-body {
            background-color: #f8f9fa;
            border-radius: 8px;
        }
        
        #termsContent,
        #privacyContent {
            font-size: 14px;
            color: #333;
        }
        
        #termsContent h2,
        #termsContent h3,
        #privacyContent h2,
        #privacyContent h3 {
            color: #00C2FF;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        
        #termsContent ul,
        #privacyContent ul {
            margin-left: 20px;
            margin-bottom: 15px;
        }
        
        #termsContent li,
        #privacyContent li {
            margin-bottom: 8px;
        }
        
        #termsContent p,
        #privacyContent p {
            margin-bottom: 15px;
        }
        
        .checkbox-group label a {
            text-decoration: underline;
        }
        
        .checkbox-group label a:hover {
            text-decoration: none;
        }
        
        .btn-publish:disabled {
            background-color: #ccc !important;
            border-color: #ccc !important;
        }
    `;
    document.head.appendChild(style);
    
    // Inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateTermsCheckbox);
    } else {
        updateTermsCheckbox();
    }
    
})();