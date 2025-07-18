<?php
include("check_login.php");
include("conm/conn.php");

// Configura charset para suportar emojis
mysqli_set_charset($con, "utf8mb4");

// Pega o ID do participante logado
$participante_id = $_SESSION['participanteid'] ?? $_COOKIE['participanteid'] ?? 1;

// Busca os dados atuais do participante
$sql_dados = "SELECT Nome, email, CPF, celular, thumb FROM participantes WHERE participanteid = ?";
$stmt_dados = mysqli_prepare($con, $sql_dados);

$dados_participante = [
    'Nome' => '',
    'email' => '',
    'CPF' => '',
    'celular' => '',
    'thumb' => ''
];

if ($stmt_dados) {
    mysqli_stmt_bind_param($stmt_dados, "i", $participante_id);
    mysqli_stmt_execute($stmt_dados);
    $result_dados = mysqli_stmt_get_result($stmt_dados);
    
    if ($row_dados = mysqli_fetch_assoc($result_dados)) {
        $dados_participante = $row_dados;
    }
    
    mysqli_stmt_close($stmt_dados);
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meus Dados - Anysummit</title>
    <link rel="stylesheet" type="text/css" href="/participante/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/participante/css/checkin-painel-1-0-1.css">
    <link rel="stylesheet" type="text/css" href="/participante/css/checkin-painel-1-0-1-config2.css">
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
            <div class="config-container">
                <div class="config-header">
                    <h1>⚙️ Meus Dados</h1>
                    <p>Atualize suas informações pessoais e foto de perfil</p>
                </div>

                <div class="config-form-container">
                    <form id="configForm" onSubmit="salvarDados(event)" enctype="multipart/form-data">
                        
                        <!-- Foto de Perfil -->
                        <div class="photo-section">
                            <h3>📷 Foto de Perfil</h3>
                            <div class="photo-upload-container">
                                <div class="current-photo">
                                    <img id="photoPreview" 
                                         src="<?php echo !empty($dados_participante['thumb']) ? '../uploads/foto/' . $dados_participante['thumb'] : 'https://anysummit.com.br/participante/img/user.jpg'; ?>" 
                                         alt="Foto atual" 
                                         onerror="this.src='https://anysummit.com.br/participante/img/user.jpg'">
                                </div>
                                <div class="photo-upload-controls">
                                    <input type="file" id="photoInput" name="photo" accept="image/*" onChange="previewPhoto(this)">
                                    <label for="photoInput" class="upload-btn">
                                        📸 Alterar Foto
                                    </label>
                                    <p class="photo-info">Formatos aceitos: JPG, PNG, GIF (máx. 2MB)</p>
                                </div>
                            </div>
                        </div>

                        <!-- Dados Pessoais -->
                        <div class="form-section">
                            <h3>👤 Dados Pessoais</h3>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="nome" class="form-label">Nome Completo</label>
                                    <input type="text" id="nome" name="nome" class="form-input" 
                                           value="<?php echo htmlspecialchars($dados_participante['Nome']); ?>" 
                                           required maxlength="100">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="email" class="form-label">E-mail</label>
                                    <input type="email" id="email" name="email" class="form-input" 
                                           value="<?php echo htmlspecialchars($dados_participante['email']); ?>" 
                                           required maxlength="100">
                                </div>
                                
                                <div class="form-group">
                                    <label for="celular" class="form-label">Celular</label>
                                    <input type="tel" id="celular" name="celular" class="form-input" 
                                           value="<?php echo htmlspecialchars($dados_participante['celular']); ?>" 
                                           placeholder="(11) 99999-9999" maxlength="20">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="cpf" class="form-label">CPF</label>
                                    <input type="text" id="cpf" name="cpf" class="form-input" 
                                           value="<?php echo htmlspecialchars($dados_participante['CPF']); ?>" 
                                           placeholder="000.000.000-00" maxlength="14" readonly>
                                    <small class="field-note">CPF não pode ser alterado</small>
                                </div>
                            </div>
                        </div>

                        <!-- Alterar Senha -->
                        <div class="form-section">
                            <h3>🔒 Alterar Senha</h3>
                            <p class="section-description">Deixe em branco se não quiser alterar a senha</p>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="senha_atual" class="form-label">Senha Atual</label>
                                    <input type="password" id="senha_atual" name="senha_atual" class="form-input" 
                                           placeholder="Digite sua senha atual">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="nova_senha" class="form-label">Nova Senha</label>
                                    <input type="password" id="nova_senha" name="nova_senha" class="form-input" 
                                           placeholder="Digite a nova senha" minlength="6">
                                </div>
                                
                                <div class="form-group">
                                    <label for="confirmar_senha" class="form-label">Confirmar Nova Senha</label>
                                    <input type="password" id="confirmar_senha" name="confirmar_senha" class="form-input" 
                                           placeholder="Confirme a nova senha" minlength="6">
                                </div>
                            </div>
                        </div>

                        <!-- Botões -->
                        <div class="form-actions">
                            <button type="button" onClick="resetarFormulario()" class="btn-secondary">
                                🔄 Cancelar Alterações
                            </button>
                            <button type="submit" class="btn-primary" id="saveBtn">
                                💾 Salvar Dados
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
        // Preview da foto
        function previewPhoto(input) {
            if (input.files && input.files[0]) {
                const file = input.files[0];
                
                // Verifica tamanho (2MB)
                if (file.size > 2 * 1024 * 1024) {
                    showFeedback('❌ Arquivo muito grande. Máximo 2MB.', 'error');
                    input.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('photoPreview').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        }

        // Máscara para celular
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

        // Validação de senhas
        document.getElementById('confirmar_senha').addEventListener('blur', function() {
            const novaSenha = document.getElementById('nova_senha').value;
            const confirmarSenha = this.value;
            
            if (novaSenha && confirmarSenha && novaSenha !== confirmarSenha) {
                showFeedback('❌ As senhas não coincidem.', 'error');
                this.focus();
            }
        });

        // Salvar dados
        function salvarDados(event) {
            event.preventDefault();
            
            const saveBtn = document.getElementById('saveBtn');
            const feedback = document.getElementById('feedback');
            
            // Validações
            const novaSenha = document.getElementById('nova_senha').value;
            const confirmarSenha = document.getElementById('confirmar_senha').value;
            const senhaAtual = document.getElementById('senha_atual').value;
            
            if (novaSenha && novaSenha !== confirmarSenha) {
                showFeedback('❌ As senhas não coincidem.', 'error');
                return;
            }
            
            if (novaSenha && !senhaAtual) {
                showFeedback('❌ Digite a senha atual para alterar a senha.', 'error');
                return;
            }
            
            saveBtn.disabled = true;
            saveBtn.innerHTML = '💾 Salvando...';
            
            const formData = new FormData(document.getElementById('configForm'));
            
            fetch('salvar_config.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showFeedback('✅ Dados salvos com sucesso!', 'success');
                    
                    // Limpa campos de senha
                    document.getElementById('senha_atual').value = '';
                    document.getElementById('nova_senha').value = '';
                    document.getElementById('confirmar_senha').value = '';
                } else {
                    showFeedback('❌ Erro ao salvar: ' + data.error, 'error');
                }
            })
            .catch(error => {
                showFeedback('❌ Erro de conexão: ' + error.message, 'error');
            })
            .finally(() => {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '💾 Salvar Dados';
            });
        }

        // Resetar formulário
        function resetarFormulario() {
            if (confirm('Tem certeza que deseja cancelar todas as alterações?')) {
                location.reload();
            }
        }

        // Mostrar feedback
        function showFeedback(message, type) {
            const feedback = document.getElementById('feedback');
            feedback.textContent = message;
            feedback.className = `feedback-message ${type}`;
            feedback.style.display = 'block';
            
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 5000);
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
    </script>
</body>
</html>
