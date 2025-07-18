<?php
include("check_login.php");
include("conm/conn.php");

// Configura charset para suportar emojis
mysqli_set_charset($con, "utf8mb4");
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Credenciamento - Anysummit</title>
    <link rel="stylesheet" type="text/css" href="/staff/css/checkin-1-0-0.css">
     <link rel="stylesheet" type="text/css" href="/staff/css/checkin-painel-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/staff/css/credenciamento-1-0-0.css">
   
</head>
<body>
    <!-- CSS específico para credenciamento -->
    <style>
        /* Popup de mensagens */
        .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            display: none;
            align-items: center;
            justify-content: center;
        }
        
        .popup-message {
            background: rgba(26, 26, 46, 0.95);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            border: 2px solid;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: popupSlide 0.4s ease-out;
            position: relative;
        }
        
        .popup-message.success {
            border-color: #00C851;
            background: linear-gradient(135deg, rgba(0, 200, 81, 0.1), rgba(26, 26, 46, 0.95));
        }
        
        .popup-message.error {
            border-color: #FF6B6B;
            background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(26, 26, 46, 0.95));
        }
        
        .popup-message.info {
            border-color: #00C2FF;
            background: linear-gradient(135deg, rgba(0, 194, 255, 0.1), rgba(26, 26, 46, 0.95));
        }
        
        .popup-icon {
            font-size: 60px;
            margin-bottom: 20px;
            display: block;
        }
        
        .popup-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
            color: white;
        }
        
        .popup-text {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.5;
        }
        
        .popup-close {
            position: absolute;
            top: 15px;
            right: 20px;
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            font-size: 24px;
            cursor: pointer;
            transition: color 0.3s ease;
        }
        
        .popup-close:hover {
            color: white;
        }
        
        @keyframes popupSlide {
            from {
                opacity: 0;
                transform: scale(0.8) translateY(-50px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
    </style>

    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>

    <!-- Header -->
    <header class="header">
        <div class="logo-section">
          <img src="img/logohori.png" style="width:100%; max-width:200px;">
        </div>
        
        <div class="header-right">
            <div class="menu-toggle" onClick="toggleMobileMenu()">
                <div class="hamburger-line"></div>
                <div class="hamburger-line"></div>
                <div class="hamburger-line"></div>
            </div>
            <div class="user-menu">
                <div class="user-icon" onClick="toggleUserDropdown()">👤</div>
                <div class="user-dropdown" id="userDropdown">
                    <div class="dropdown-item" onClick="logout()">
                        🚪 Sair
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Mobile Overlay -->
    <div class="mobile-overlay" id="mobileOverlay" onClick="closeMobileMenu()"></div>

    <!-- Main Layout -->
    <div class="main-layout">
        <!-- Sidebar -->
        <?php include 'menu.php'?>

        <!-- Content Area -->
        <main class="content-area">
            <div class="credenciamento-container">
                <div class="credenciamento-header">
                    <h1>👥 Credenciamento</h1>
                    <p>Cadastre um novo participante para o evento</p>
                </div>

                <!-- Formulário de Credenciamento -->
                <div class="credenciamento-form-container">
                    <form id="credenciamentoForm" onSubmit="salvarParticipante(event)" enctype="multipart/form-data">
                        
                        <div class="form-section">
                            <h3>📝 Dados do Participante</h3>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="nome" class="form-label">Nome Completo *</label>
                                    <input type="text" id="nome" name="nome" class="form-input" 
                                           placeholder="Digite o nome completo" required maxlength="100">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="email" class="form-label">E-mail *</label>
                                    <input type="email" id="email" name="email" class="form-input" 
                                           placeholder="email@exemplo.com" required maxlength="100">
                                </div>
                                
                                <div class="form-group">
                                    <label for="celular" class="form-label">Celular</label>
                                    <input type="tel" id="celular" name="celular" class="form-input" 
                                           placeholder="(11) 99999-9999" maxlength="20">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="cpf" class="form-label">CPF *</label>
                                    <input type="text" id="cpf" name="cpf" class="form-input" 
                                           placeholder="000.000.000-00" required maxlength="14">
                                </div>
                            </div>
                        </div>

                        </div>

                        <!-- Campos ocultos -->
                        <input type="hidden" name="eventoid" value="<?php echo $_COOKIE['eventoid'] ?? ''; ?>">
                        <input type="hidden" name="tipoingresso" value="Participante">

                        <!-- Botões -->
                        <div class="form-actions">
                            <button type="button" onClick="resetarFormulario()" class="btn-secondary">
                                🔄 Limpar Formulário
                            </button>
                            <button type="submit" class="btn-primary" id="saveBtn">
                                💾 Credenciar Participante
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Feedback Messages -->
                <div id="feedback" class="feedback-message" style="display: none;"></div>
            </div>
        </main>
    </div>

    <!-- Popup de Mensagens -->
    <div class="popup-overlay" id="popupOverlay">
        <div class="popup-message" id="popupMessage">
            <button class="popup-close" onclick="closePopup()">×</button>
            <span class="popup-icon" id="popupIcon">✅</span>
            <div class="popup-title" id="popupTitle">Sucesso!</div>
            <div class="popup-text" id="popupText">Mensagem aqui</div>
        </div>
    </div>

    <script>
        // Máscaras para os campos
        document.getElementById('celular').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 11) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (value.length >= 7) {
                value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
            }
            e.target.value = value;
        });

        document.getElementById('cpf').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})/, '$1-$2');
            value = value.replace(/(-\d{2})\d+?$/, '$1');
            e.target.value = value;
        });

        // Funções do popup
        function showPopup(title, message, type, icon) {
            const overlay = document.getElementById('popupOverlay');
            const popup = document.getElementById('popupMessage');
            const titleEl = document.getElementById('popupTitle');
            const textEl = document.getElementById('popupText');
            const iconEl = document.getElementById('popupIcon');
            
            // Define conteúdo
            titleEl.textContent = title;
            textEl.textContent = message;
            iconEl.textContent = icon;
            
            // Remove classes anteriores e adiciona nova
            popup.className = `popup-message ${type}`;
            
            // Mostra popup
            overlay.style.display = 'flex';
            
            // Auto close baseado no tipo
            let timeout = 5000; // padrão
            if (type === 'success') timeout = 3000;
            if (type === 'info') timeout = 2500;
            
            setTimeout(() => {
                closePopup();
            }, timeout);
        }
        
        function closePopup() {
            document.getElementById('popupOverlay').style.display = 'none';
        }
        
        // Fecha popup ao clicar no overlay
        document.getElementById('popupOverlay').addEventListener('click', function(e) {
            if (e.target === this) {
                closePopup();
            }
        });

        // Salvar participante
        function salvarParticipante(event) {
            event.preventDefault();
            
            const saveBtn = document.getElementById('saveBtn');
            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('email').value.trim();
            const cpf = document.getElementById('cpf').value.trim();
            
            if (!nome || !email || !cpf) {
                showFeedback('❌ Preencha todos os campos obrigatórios.', 'error');
                return;
            }
            
            saveBtn.disabled = true;
            saveBtn.innerHTML = '💾 Salvando...';
            
            const formData = new FormData(document.getElementById('credenciamentoForm'));
            
            // Debug: mostra o que está sendo enviado
            console.log('Dados sendo enviados:');
            for (let [key, value] of formData.entries()) {
                console.log(key + ': ' + value);
            }
            
            // TESTE: primeiro vamos testar com arquivo simples
            fetch('salvar_credenciamento.php', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                console.log('Response status:', response.status);
                console.log('Response headers:', [...response.headers.entries()]);
                
                return response.text().then(text => {
                    console.log('Response text completa:', text);
                    console.log('Primeiros 200 caracteres:', text.substring(0, 200));
                    
                    // Tenta encontrar onde começa o JSON
                    let jsonStart = text.indexOf('{');
                    if (jsonStart > 0) {
                        console.log('Lixo antes do JSON:', text.substring(0, jsonStart));
                        text = text.substring(jsonStart);
                    }
                    
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        console.error('Erro ao fazer parse do JSON:', e);
                        console.error('Texto que causou erro:', text);
                        throw new Error('Resposta inválida do servidor. Verifique o console para detalhes.');
                    }
                });
            })
            .then(data => {
                if (data.success) {
                    showPopup(
                        'Participante Cadastrado!', 
                        `${data.nome} foi credenciado com sucesso!`, 
                        'success', 
                        '✅'
                    );
                    
                    // Aguarda 2 segundos e depois limpa o formulário automaticamente
                    setTimeout(() => {
                        resetarFormularioSilencioso();
                        showPopup(
                            'Pronto para o próximo!', 
                            'Formulário limpo, você pode cadastrar outro participante.', 
                            'info', 
                            '🔄'
                        );
                    }, 2000);
                } else {
                    showPopup(
                        'Erro no Cadastro', 
                        data.error, 
                        'error', 
                        '❌'
                    );
                }
            })
            .catch(error => {
                showPopup(
                    'Erro de Conexão', 
                    'Não foi possível conectar com o servidor. Tente novamente.', 
                    'error', 
                    '⚠️'
                );
            })
            .finally(() => {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '💾 Credenciar Participante';
            });
        }

        // Resetar formulário com confirmação
        function resetarFormulario() {
            if (confirm('Tem certeza que deseja limpar o formulário?')) {
                limparFormulario();
            }
        }

        // Resetar formulário sem confirmação (usado após sucesso)
        function resetarFormularioSilencioso() {
            limparFormulario();
        }

        // Função que efetivamente limpa o formulário
        function limparFormulario() {
            document.getElementById('credenciamentoForm').reset();
            
            // Foca no campo nome para facilitar o próximo cadastro
            setTimeout(() => {
                document.getElementById('nome').focus();
            }, 100);
        }

        // Mostrar feedback (mantido para compatibilidade)
        function showFeedback(message, type) {
            // Agora usa popup em vez de feedback inline
            let title, icon;
            switch(type) {
                case 'success':
                    title = 'Sucesso!';
                    icon = '✅';
                    break;
                case 'error':
                    title = 'Erro';
                    icon = '❌';
                    break;
                case 'info':
                    title = 'Informação';
                    icon = 'ℹ️';
                    break;
                default:
                    title = 'Aviso';
                    icon = '⚠️';
            }
            showPopup(title, message, type, icon);
        }

        // Scripts do menu mobile
        function toggleMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('mobileOverlay');
            const menuToggle = document.querySelector('.menu-toggle');
            
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            menuToggle.classList.toggle('active');
        }

        function closeMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('mobileOverlay');
            const menuToggle = document.querySelector('.menu-toggle');
            
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            menuToggle.classList.remove('active');
        }

        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('active');
        }

        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                window.location = 'logout.php';
            }
        }

        // Efeito das partículas
        document.addEventListener('mousemove', function(e) {
            const particles = document.querySelectorAll('.particle');
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            particles.forEach((particle, index) => {
                const speed = (index + 1) * 0.5;
                const x = mouseX * speed;
                const y = mouseY * speed;
                
                particle.style.transform = `translate(${x}px, ${y}px)`;
            });
        });

        // Limpar câmera ao sair da página
        window.addEventListener('beforeunload', stopCamera);
    </script>
</body>
</html>
