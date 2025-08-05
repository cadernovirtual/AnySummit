<?php
session_start();
include("conm/conn.php");

// Função para verificar login via cookie
function verificarLoginCookie() {
    if (isset($_COOKIE['participante_logado']) && $_COOKIE['participante_logado'] == '1') {
        $_SESSION['participante_logado'] = true;
        $_SESSION['participanteid'] = isset($_COOKIE['participanteid']) ? $_COOKIE['participanteid'] : '';
        $_SESSION['participante_nome'] = isset($_COOKIE['participante_nome']) ? $_COOKIE['participante_nome'] : '';
        $_SESSION['participante_email'] = isset($_COOKIE['participante_email']) ? $_COOKIE['participante_email'] : '';
        return true;
    }
    return false;
}

// Verificar se usuário está logado
if (!isset($_SESSION['participante_logado']) || $_SESSION['participante_logado'] !== true) {
    if (!verificarLoginCookie()) {
        header("Location: index.php");
        exit();
    }
}

$participante_id = $_SESSION['participanteid'];
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
            // Verificar se email já existe para outro usuário
            $sql_check = "SELECT id FROM participantes WHERE email = ? AND id != ?";
            $stmt_check = mysqli_prepare($con, $sql_check);
            mysqli_stmt_bind_param($stmt_check, "si", $email, $participante_id);
            mysqli_stmt_execute($stmt_check);
            $result_check = mysqli_stmt_get_result($stmt_check);
            
            if (mysqli_num_rows($result_check) > 0) {
                $erro = "Este email já está sendo usado por outro participante.";
            } else {
                $sql_update = "UPDATE participantes SET nome = ?, email = ?, telefone = ? WHERE id = ?";
                $stmt_update = mysqli_prepare($con, $sql_update);
                mysqli_stmt_bind_param($stmt_update, "sssi", $nome, $email, $telefone, $participante_id);
                
                if (mysqli_stmt_execute($stmt_update)) {
                    $sucesso = "Dados atualizados com sucesso!";
                    $_SESSION['participante_nome'] = $nome;
                    $_SESSION['participante_email'] = $email;
                } else {
                    $erro = "Erro ao atualizar dados: " . mysqli_error($con);
                }
            }
        }
    }
}

// Buscar dados do participante
$sql_participante = "SELECT * FROM participantes WHERE id = ?";
$stmt_participante = mysqli_prepare($con, $sql_participante);
mysqli_stmt_bind_param($stmt_participante, "i", $participante_id);
mysqli_stmt_execute($stmt_participante);
$result_participante = mysqli_stmt_get_result($stmt_participante);
$participante = mysqli_fetch_assoc($result_participante);

if (!$participante) {
    header("Location: index.php");
    exit();
}

// Buscar eventos do participante
$sql_eventos = "SELECT 
                    e.nome as evento_nome,
                    e.slug,
                    e.data_inicio,
                    e.data_fim,
                    i.status,
                    i.criado_em as inscricao_data
                FROM inscricoes i 
                JOIN eventos e ON i.evento_id = e.id 
                WHERE i.participante_id = ? 
                ORDER BY i.criado_em DESC";
$stmt_eventos = mysqli_prepare($con, $sql_eventos);
mysqli_stmt_bind_param($stmt_eventos, "i", $participante_id);
mysqli_stmt_execute($stmt_eventos);
$result_eventos = mysqli_stmt_get_result($stmt_eventos);
$eventos_inscritos = [];
while ($row = mysqli_fetch_assoc($result_eventos)) {
    $eventos_inscritos[] = $row;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perfil do Participante - AnySummit</title>
    
    <link rel="stylesheet" type="text/css" href="/participante/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/participante/css/checkin-painel-1-0-1.css">
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
            background: rgba(34, 197, 94, 0.95);
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
            color: #22c55e;
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
            border-color: #22c55e !important;
            box-shadow: 0 0 0 0.2rem rgba(34, 197, 94, 0.25) !important;
            color: #FFFFFF !important;
            outline: none;
        }
        
        .btn-custom {
            background: linear-gradient(135deg, #22c55e, #16a34a) !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 12px 24px !important;
            color: white !important;
            font-weight: 600 !important;
            cursor: pointer;
        }
        
        .btn-custom:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 30px rgba(34, 197, 94, 0.4) !important;
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
            color: #22c55e;
            display: block;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
            margin-top: 5px;
        }
        
        .evento-item {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            transition: all 0.3s ease;
        }
        
        .evento-item:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(34, 197, 94, 0.3);
        }
        
        .evento-nome {
            font-size: 1.1rem;
            font-weight: 600;
            color: #22c55e;
            margin-bottom: 8px;
        }
        
        .evento-data {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;
            margin-bottom: 8px;
        }
        
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .status-confirmado {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
            border: 1px solid rgba(34, 197, 94, 0.3);
        }
        
        .status-pendente {
            background: rgba(251, 191, 36, 0.2);
            color: #fbbf24;
            border: 1px solid rgba(251, 191, 36, 0.3);
        }
        
        .evento-link {
            color: #22c55e;
            text-decoration: none;
            font-size: 0.9rem;
        }
        
        .evento-link:hover {
            text-decoration: underline;
        }
    </style>
</head><body>
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
                        <i class="fas fa-user"></i>
                    </div>
                    <h3><?php echo htmlspecialchars($participante['nome']); ?></h3>
                    <p><?php echo htmlspecialchars($participante['email']); ?></p>
                    <span style="background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 20px; font-size: 0.85rem;">Participante</span>
                    
                    <div class="stats-row">
                        <div class="stat-item">
                            <div class="stat-number"><?php echo count($eventos_inscritos); ?></div>
                            <div class="stat-label">Eventos Inscritos</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">
                                <?php echo $participante['email_verificado'] ? '<i class="fas fa-check-circle" style="color: #48bb78;"></i>' : '<i class="fas fa-times-circle" style="color: #f56565;"></i>'; ?>
                            </div>
                            <div class="stat-label">Email Verificado</div>
                        </div>
                    </div>
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
                                           value="<?php echo htmlspecialchars($participante['nome']); ?>" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="email">E-mail *</label>
                                    <input type="email" class="form-control" id="email" name="email" 
                                           value="<?php echo htmlspecialchars($participante['email']); ?>" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="telefone">Telefone</label>
                            <input type="tel" class="form-control" id="telefone" name="telefone" 
                                   value="<?php echo htmlspecialchars($participante['telefone'] ?: ''); ?>"
                                   placeholder="(11) 99999-9999">
                        </div>
                        
                        <div class="text-end">
                            <button type="submit" class="btn btn-custom">
                                <i class="fas fa-save"></i> Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- Meus Eventos -->
                <div class="profile-card">
                    <h4><i class="fas fa-calendar"></i> Meus Eventos</h4>
                    
                    <?php if (empty($eventos_inscritos)): ?>
                        <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">
                            <i class="fas fa-calendar-times" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                            <p>Você ainda não está inscrito em nenhum evento.</p>
                        </div>
                    <?php else: ?>
                        <?php foreach ($eventos_inscritos as $evento): ?>
                            <div class="evento-item">
                                <div class="evento-nome"><?php echo htmlspecialchars($evento['evento_nome']); ?></div>
                                <div class="evento-data">
                                    <i class="fas fa-clock"></i> 
                                    <?php echo date('d/m/Y', strtotime($evento['data_inicio'])); ?>
                                    <?php if ($evento['data_fim'] && $evento['data_fim'] != $evento['data_inicio']): ?>
                                        - <?php echo date('d/m/Y', strtotime($evento['data_fim'])); ?>
                                    <?php endif; ?>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                    <span class="status-badge status-<?php echo $evento['status']; ?>">
                                        <?php echo ucfirst($evento['status']); ?>
                                    </span>
                                    <a href="/evento/?evento=<?php echo htmlspecialchars($evento['slug']); ?>" 
                                       class="evento-link" target="_blank">
                                        Ver Evento <i class="fas fa-external-link-alt"></i>
                                    </a>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
                
                <!-- Informações da Conta -->
                <div class="profile-card">
                    <h4><i class="fas fa-info-circle"></i> Informações da Conta</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Conta criada em:</strong> 
                            <?php echo date('d/m/Y', strtotime($participante['criado_em'])); ?></p>
                            <p><strong>Último acesso:</strong> 
                            <?php echo $participante['ultimo_acesso'] ? date('d/m/Y H:i', strtotime($participante['ultimo_acesso'])) : 'Nunca'; ?></p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Status da conta:</strong> 
                            <span style="color: <?php echo $participante['ativo'] ? '#22c55e' : '#f56565'; ?>">
                                <?php echo $participante['ativo'] ? 'Ativa' : 'Inativa'; ?>
                            </span></p>
                            <p><strong>Total de inscrições:</strong> <?php echo count($eventos_inscritos); ?></p>
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