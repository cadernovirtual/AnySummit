<?php
include("check_login.php");
include("conm/conn.php");

// Configura charset para suportar emojis
mysqli_set_charset($con, "utf8mb4");

// Pega o ID do participante logado
$participante_id = $_SESSION['participanteid'] ?? $_COOKIE['participanteid'] ?? 1;

 

// Busca a mensagem personalizada existente
$msg_personalizada = "";
$msg_id = null;

$sql_busca = "SELECT msgpersoid, msg FROM participante_msgpersonalizado WHERE participanteid = ?";
$stmt_busca = mysqli_prepare($con, $sql_busca);

if ($stmt_busca) {
    mysqli_stmt_bind_param($stmt_busca, "i", $participante_id);
    mysqli_stmt_execute($stmt_busca);
    $result = mysqli_stmt_get_result($stmt_busca);
    
    if ($row = mysqli_fetch_assoc($result)) {
        $msg_personalizada = $row['msg'];
        $msg_id = $row['msgpersoid'];
    }
    
    mysqli_stmt_close($stmt_busca);
}

// Mensagem padrão se não houver uma personalizada
if (empty($msg_personalizada)) {
    $msg_personalizada = "Olá {{Nome}}! 👋\n\nFoi um prazer te conhecer no evento {{Evento}}! 🎉\n\nVamos manter contato! Adoraria trocar ideias e experiências.\n\nUm abraço! 😊";
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mensagem Personalizada - Anysummit</title>
    <link rel="stylesheet" type="text/css" href="/participante/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/participante/css/checkin-painel-1-0-1-msg.css">
</head>
<body>
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
            <div class="message-container">
                <div class="message-header">
                    <h1>📱 Mensagem Personalizada</h1>
                    <p>Personalize a mensagem que será enviada via WhatsApp quando você fizer uma nova conexão</p>
                </div>

                <div class="message-form-container">
                    <form id="messageForm" onSubmit="salvarMensagem(event)">
                        <div class="form-group">
                            <label for="mensagem" class="form-label">
                                💬 Sua Mensagem de Conexão
                            </label>
                            <textarea 
                                id="mensagem" 
                                name="mensagem" 
                                class="message-textarea" 
                                placeholder="Digite sua mensagem personalizada aqui..."
                                maxlength="1000"
                                required><?php echo htmlspecialchars($msg_personalizada); ?></textarea>
                            
                            <div class="char-counter">
                                <span id="charCount"><?php echo strlen($msg_personalizada); ?></span>/1000 caracteres
                            </div>
                        </div>

                        <div class="variables-info">
                            <h3>🔤 Variáveis Disponíveis</h3>
                            <p>Use essas variáveis em sua mensagem e elas serão automaticamente substituídas:</p>
                            <div class="variables-list">
                                <div class="variable-item">
                                    <code>{{Nome}}</code>
                                    <span>→ Nome do participante que você está conectando</span>
                                </div>
                                <div class="variable-item">
                                    <code>{{Evento}}</code>
                                    <span>→ Nome do evento onde a conexão foi feita</span>
                                </div>
                            </div>
                        </div>

                        <div class="preview-section">
                            <h3>👀 Prévia da Mensagem</h3>
                            <div class="whatsapp-preview">
                                <div class="whatsapp-message">
                                    <div id="messagePreview">
                                        <?php echo nl2br(htmlspecialchars($msg_personalizada)); ?>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" onClick="resetarMensagem()" class="btn-secondary">
                                🔄 Restaurar Padrão
                            </button>
                            <button type="submit" class="btn-primary" id="saveBtn">
                                💾 Salvar Mensagem
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Feedback Messages -->
                <div id="feedback" class="feedback-message" style="display: none;"></div>
            </div>
        </main>
    </div>

    <script>
        let msgId = <?php echo json_encode($msg_id); ?>;

        // Atualiza contador de caracteres e preview
        document.getElementById('mensagem').addEventListener('input', function() {
            const textarea = this;
            const charCount = document.getElementById('charCount');
            const preview = document.getElementById('messagePreview');
            
            // Atualiza contador
            charCount.textContent = textarea.value.length;
            
            // Atualiza preview
            let previewText = textarea.value;
            previewText = previewText.replace(/{{Nome}}/g, '<strong>João Silva</strong>');
            previewText = previewText.replace(/{{Evento}}/g, '<strong>Tech Summit 2025</strong>');
            preview.innerHTML = previewText.replace(/\n/g, '<br>');
        });

        // Salvar mensagem
        function salvarMensagem(event) {
            event.preventDefault();
            
            const saveBtn = document.getElementById('saveBtn');
            const feedback = document.getElementById('feedback');
            const mensagem = document.getElementById('mensagem').value;
            
            if (!mensagem.trim()) {
                showFeedback('Por favor, digite uma mensagem.', 'error');
                return;
            }
            
            saveBtn.disabled = true;
            saveBtn.innerHTML = '💾 Salvando...';
            
            const formData = new FormData();
            formData.append('mensagem', mensagem);
            formData.append('msgId', msgId || '');
            
            fetch('salvar_mensagem.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    msgId = data.msgId;
                    showFeedback('✅ Mensagem salva com sucesso!', 'success');
                } else {
                    showFeedback('❌ Erro ao salvar: ' + data.error, 'error');
                }
            })
            .catch(error => {
                showFeedback('❌ Erro de conexão: ' + error.message, 'error');
            })
            .finally(() => {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '💾 Salvar Mensagem';
            });
        }

        // Resetar para mensagem padrão
        function resetarMensagem() {
            const defaultMessage = `Olá {{Nome}}! 👋\n\nFoi um prazer te conhecer no evento {{Evento}}! 🎉\n\nVamos manter contato! Adoraria trocar ideias e experiências.\n\nUm abraço! 😊`;
            
            document.getElementById('mensagem').value = defaultMessage;
            document.getElementById('mensagem').dispatchEvent(new Event('input'));
        }

        // Mostrar feedback
        function showFeedback(message, type) {
            const feedback = document.getElementById('feedback');
            feedback.textContent = message;
            feedback.className = `feedback-message ${type}`;
            feedback.style.display = 'block';
            
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 4000);
        }

        // Inicializa preview
        document.getElementById('mensagem').dispatchEvent(new Event('input'));

        // Scripts do menu mobile (copiados das outras páginas)
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
    </script>
</body>
</html>
