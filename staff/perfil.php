<?php
session_start();
include("conm/conn.php");

// Função para verificar login via cookie
function verificarLoginCookie() {
    if (isset($_COOKIE['staff_logado']) && $_COOKIE['staff_logado'] == '1') {
        $_SESSION['staff_logado'] = true;
        $_SESSION['staffid'] = isset($_COOKIE['staffid']) ? $_COOKIE['staffid'] : '';
        $_SESSION['staff_nome'] = isset($_COOKIE['staff_nome']) ? $_COOKIE['staff_nome'] : '';
        $_SESSION['staff_email'] = isset($_COOKIE['staff_email']) ? $_COOKIE['staff_email'] : '';
        return true;
    }
    return false;
}

// Verificar se usuário está logado
if (!isset($_SESSION['staff_logado']) || $_SESSION['staff_logado'] !== true) {
    if (!verificarLoginCookie()) {
        header("Location: index.php");
        exit();
    }
}

$staff_id = $_SESSION['staffid'];
$sucesso = '';
$erro = '';

// Processar formulário
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['action']) && $_POST['action'] == 'atualizar_dados') {
        $nome = trim($_POST['nome']);
        $email = trim($_POST['email']);
        $telefone = trim($_POST['telefone']);
        
        if (empty($nome) || empty($email)) {
            $erro = "Nome e email são obrigatórios.";
        } else {
            // Verificar se email já existe para outro staff
            $sql_check = "SELECT id FROM staff WHERE email = ? AND id != ?";
            $stmt_check = mysqli_prepare($con, $sql_check);
            mysqli_stmt_bind_param($stmt_check, "si", $email, $staff_id);
            mysqli_stmt_execute($stmt_check);
            $result_check = mysqli_stmt_get_result($stmt_check);
            
            if (mysqli_num_rows($result_check) > 0) {
                $erro = "Este email já está sendo usado por outro membro da equipe.";
            } else {
                $sql_update = "UPDATE staff SET nome = ?, email = ?, telefone = ? WHERE id = ?";
                $stmt_update = mysqli_prepare($con, $sql_update);
                mysqli_stmt_bind_param($stmt_update, "sssi", $nome, $email, $telefone, $staff_id);
                
                if (mysqli_stmt_execute($stmt_update)) {
                    $sucesso = "Dados atualizados com sucesso!";
                    $_SESSION['staff_nome'] = $nome;
                    $_SESSION['staff_email'] = $email;
                } else {
                    $erro = "Erro ao atualizar dados: " . mysqli_error($con);
                }
            }
        }
    }
}

// Buscar dados do staff
$sql_staff = "SELECT s.*, e.nome as evento_nome, e.slug as evento_slug 
              FROM staff s 
              LEFT JOIN eventos e ON s.evento_id = e.id 
              WHERE s.id = ?";
$stmt_staff = mysqli_prepare($con, $sql_staff);
mysqli_stmt_bind_param($stmt_staff, "i", $staff_id);
mysqli_stmt_execute($stmt_staff);
$result_staff = mysqli_stmt_get_result($stmt_staff);
$staff = mysqli_fetch_assoc($result_staff);

if (!$staff) {
    header("Location: index.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perfil da Equipe - AnySummit</title>
    
    <link rel="stylesheet" type="text/css" href="/staff/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/staff/css/checkin-painel-1-0-1.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <style>
        .content-area {
            padding: 20px;
            min-height: calc(100vh - 120px);
            overflow-x: hidden;
        }
        
        .perfil-container {
            max-width: 900px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
        }
        
        .profile-header {
            background: rgba(16, 185, 129, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            padding: 30px;
            border-radius: 16px;
            margin-bottom: 30px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .profile-card {
            background: rgba(42, 42, 56, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            color: white;
        }
        
        .profile-card h4 {
            color: #10b981;
            margin-bottom: 20px;
            font-size: 1.3rem;
            font-weight: 600;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
        }
        
        .form-control {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 2px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 12px !important;
            padding: 12px 16px !important;
            color: #FFFFFF !important;
            width: 100%;
        }
        
        .form-control:focus {
            background: rgba(255, 255, 255, 0.08) !important;
            border-color: #10b981 !important;
            box-shadow: 0 0 0 0.2rem rgba(16, 185, 129, 0.25) !important;
            color: #FFFFFF !important;
            outline: none;
        }
        
        .btn-custom {
            background: linear-gradient(135deg, #10b981, #059669) !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 12px 24px !important;
            color: white !important;
            font-weight: 600 !important;
            cursor: pointer;
        }
        
        .btn-custom:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4) !important;
        }
        
        .alert {
            border-radius: 12px !important;
            border: none !important;
            margin-bottom: 20px;
            padding: 12px 16px;
        }
        
        .alert-success {
            background: rgba(72, 187, 120, 0.2) !important;
            color: #68d391 !important;
            border: 1px solid rgba(72, 187, 120, 0.3) !important;
        }
        
        .alert-danger {
            background: rgba(245, 101, 101, 0.2) !important;
            color: #fc8181 !important;
            border: 1px solid rgba(245, 101, 101, 0.3) !important;
        }
        
        .permissao-item {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .permissao-ativa {
            color: #10b981;
        }
        
        .permissao-inativa {
            color: rgba(255, 255, 255, 0.4);
        }
        
        .acao-rapida {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 10px;
            text-align: center;
        }
        
        .acao-rapida a {
            color: #10b981;
            text-decoration: none;
            font-weight: 500;
        }
        
        .acao-rapida a:hover {
            text-decoration: underline;
        }
        
        .stats-row {
            display: flex;
            justify-content: space-around;
            margin-top: 20px;
            gap: 20px;
            flex-wrap: wrap;
        }
        
        .stat-item {
            text-align: center;
            flex: 1;
            min-width: 120px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .stat-number {
            font-size: 1.8rem;
            font-weight: bold;
            color: #10b981;
            display: block;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
            margin-top: 5px;
        }
    </style>
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
                <div class="user-icon" onClick="toggleUserDropdown()">🛡️</div>
                <div class="user-dropdown" id="userDropdown">
                    <div class="dropdown-item" onClick="window.location.href='perfil.php'">
                        👤 Perfil
                    </div>
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
        <?php include 'menu.php'; ?>
        
        <!-- Content Area -->
        <main class="content-area">
            <div class="perfil-container">
                <!-- Alertas -->
                <?php if (!empty($sucesso)): ?>
                    <div class="alert alert-success">
                        <i class="fas fa-check-circle"></i> <?php echo htmlspecialchars($sucesso); ?>
                    </div>
                <?php endif; ?>
                
                <?php if (!empty($erro)): ?>
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle"></i> <?php echo htmlspecialchars($erro); ?>
                    </div>
                <?php endif; ?>
                
                <!-- Header do Perfil -->
                <div class="profile-header">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 2rem;">
                        <i class="fas fa-user-shield"></i>
                    </div>
                    <h3><?php echo htmlspecialchars($staff['nome']); ?></h3>
                    <p><?php echo htmlspecialchars($staff['email']); ?></p>
                    <span style="background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 20px; font-size: 0.85rem;">
                        <?php echo ucfirst($staff['funcao']); ?>
                    </span>
                    
                    <?php if ($staff['evento_nome']): ?>
                        <p style="margin-top: 10px; opacity: 0.8;">
                            <i class="fas fa-calendar"></i> <?php echo htmlspecialchars($staff['evento_nome']); ?>
                        </p>
                    <?php endif; ?>
                </div>
                
                <!-- Dados Pessoais -->
                <div class="profile-card">
                    <h4><i class="fas fa-user-edit"></i> Dados Pessoais</h4>
                    <form method="POST">
                        <input type="hidden" name="action" value="atualizar_dados">
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="nome">Nome Completo *</label>
                                    <input type="text" class="form-control" id="nome" name="nome" 
                                           value="<?php echo htmlspecialchars($staff['nome']); ?>" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="email">E-mail *</label>
                                    <input type="email" class="form-control" id="email" name="email" 
                                           value="<?php echo htmlspecialchars($staff['email']); ?>" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="telefone">Telefone</label>
                            <input type="tel" class="form-control" id="telefone" name="telefone" 
                                   value="<?php echo htmlspecialchars($staff['telefone'] ?: ''); ?>"
                                   placeholder="(11) 99999-9999">
                        </div>
                        
                        <div class="text-end">
                            <button type="submit" class="btn btn-custom">
                                <i class="fas fa-save"></i> Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- Permissões e Funções -->
                <div class="profile-card">
                    <h4><i class="fas fa-shield-alt"></i> Permissões e Funções</h4>
                    
                    <div class="permissao-item">
                        <span>Check-in de Participantes</span>
                        <span class="<?php echo $staff['pode_checkin'] ? 'permissao-ativa' : 'permissao-inativa'; ?>">
                            <i class="fas fa-<?php echo $staff['pode_checkin'] ? 'check-circle' : 'times-circle'; ?>"></i>
                            <?php echo $staff['pode_checkin'] ? 'Permitido' : 'Negado'; ?>
                        </span>
                    </div>
                    
                    <div class="permissao-item">
                        <span>Credenciamento</span>
                        <span class="<?php echo $staff['pode_credenciar'] ? 'permissao-ativa' : 'permissao-inativa'; ?>">
                            <i class="fas fa-<?php echo $staff['pode_credenciar'] ? 'check-circle' : 'times-circle'; ?>"></i>
                            <?php echo $staff['pode_credenciar'] ? 'Permitido' : 'Negado'; ?>
                        </span>
                    </div>
                    
                    <div class="permissao-item">
                        <span>Relatórios</span>
                        <span class="<?php echo $staff['pode_relatorios'] ? 'permissao-ativa' : 'permissao-inativa'; ?>">
                            <i class="fas fa-<?php echo $staff['pode_relatorios'] ? 'check-circle' : 'times-circle'; ?>"></i>
                            <?php echo $staff['pode_relatorios'] ? 'Permitido' : 'Negado'; ?>
                        </span>
                    </div>
                </div>
                
                <!-- Ações Rápidas -->
                <div class="profile-card">
                    <h4><i class="fas fa-lightning-bolt"></i> Ações Rápidas</h4>
                    
                    <?php if ($staff['pode_checkin']): ?>
                        <div class="acao-rapida">
                            <a href="checkin.php">
                                <i class="fas fa-qrcode"></i> Realizar Check-in
                            </a>
                        </div>
                    <?php endif; ?>
                    
                    <?php if ($staff['pode_credenciar']): ?>
                        <div class="acao-rapida">
                            <a href="credenciamento.php">
                                <i class="fas fa-id-card"></i> Credenciamento
                            </a>
                        </div>
                    <?php endif; ?>
                    
                    <?php if ($staff['pode_relatorios']): ?>
                        <div class="acao-rapida">
                            <a href="relatorios.php">
                                <i class="fas fa-chart-bar"></i> Ver Relatórios
                            </a>
                        </div>
                    <?php endif; ?>
                    
                    <?php if ($staff['evento_slug']): ?>
                        <div class="acao-rapida">
                            <a href="/evento/?evento=<?php echo htmlspecialchars($staff['evento_slug']); ?>" target="_blank">
                                <i class="fas fa-external-link-alt"></i> Ver Página do Evento
                            </a>
                        </div>
                    <?php endif; ?>
                </div>
                
                <!-- Informações da Conta -->
                <div class="profile-card">
                    <h4><i class="fas fa-info-circle"></i> Informações da Conta</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Conta criada em:</strong> 
                            <?php echo date('d/m/Y', strtotime($staff['criado_em'])); ?></p>
                            <p><strong>Último acesso:</strong> 
                            <?php echo $staff['ultimo_acesso'] ? date('d/m/Y H:i', strtotime($staff['ultimo_acesso'])) : 'Nunca'; ?></p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Status da conta:</strong> 
                            <span style="color: <?php echo $staff['ativo'] ? '#10b981' : '#f56565'; ?>">
                                <?php echo $staff['ativo'] ? 'Ativa' : 'Inativa'; ?>
                            </span></p>
                            <p><strong>Função:</strong> <?php echo ucfirst($staff['funcao']); ?></p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        // Auto-dismiss para alertas
        setTimeout(function() {
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach(function(alert) {
                alert.style.opacity = '0';
                setTimeout(function() {
                    alert.remove();
                }, 300);
            });
        }, 5000);
        
        // ===== SCRIPTS DO HEADER =====
        
        // Toggle user dropdown
        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('active');
        }

        // Toggle mobile menu
        function toggleMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('mobileOverlay');
            
            sidebar.classList.toggle('mobile-active');
            overlay.classList.toggle('active');
        }

        // Close mobile menu
        function closeMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('mobileOverlay');
            
            sidebar.classList.remove('mobile-active');
            overlay.classList.remove('active');
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            const userMenu = document.querySelector('.user-menu');
            const dropdown = document.getElementById('userDropdown');
            const sidebar = document.querySelector('.sidebar');
            const menuToggle = document.querySelector('.menu-toggle');
            
            if (!userMenu.contains(event.target)) {
                dropdown.classList.remove('active');
            }
            
            if (window.innerWidth <= 768 && 
                !sidebar.contains(event.target) && 
                !menuToggle.contains(event.target)) {
                closeMobileMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });

        // Logout function
        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                window.location = 'logout.php';
            }
        }

        // Mouse interaction with particles
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