<?php
session_start();
include("conm/conn.php");

// Verificar se usuário está logado (usando mesmo sistema do participante)
if (!isset($_SESSION['participante_logado']) || $_SESSION['participante_logado'] !== true) {
    header("Location: index.php");
    exit();
}

$patrocinador_id = $_SESSION['participanteid']; // usa mesmo ID do participante
$sucesso = '';
$erro = '';

// Processar formulário
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['action']) && $_POST['action'] == 'atualizar_dados') {
        $empresa = trim($_POST['empresa']);
        $responsavel = trim($_POST['responsavel']);
        $email = trim($_POST['email']);
        $telefone = trim($_POST['telefone']);
        $website = trim($_POST['website']);
        $descricao = trim($_POST['descricao']);
        
        if (empty($empresa) || empty($responsavel) || empty($email)) {
            $erro = "Empresa, responsável e email são obrigatórios.";
        } else {
            $sql_update = "UPDATE patrocinadores SET 
                          empresa = ?, responsavel = ?, email = ?, telefone = ?, website = ?, descricao = ?
                          WHERE id = ?";
            $stmt_update = mysqli_prepare($con, $sql_update);
            mysqli_stmt_bind_param($stmt_update, "ssssssi", 
                                 $empresa, $responsavel, $email, $telefone, $website, $descricao, $patrocinador_id);
            
            if (mysqli_stmt_execute($stmt_update)) {
                $sucesso = "Dados atualizados com sucesso!";
            } else {
                $erro = "Erro ao atualizar dados: " . mysqli_error($con);
            }
        }
    }
}

// Buscar dados do patrocinador
$sql_patrocinador = "SELECT p.*, e.nome as evento_nome, e.slug as evento_slug 
                     FROM patrocinadores p 
                     LEFT JOIN eventos e ON p.evento_id = e.id 
                     WHERE p.id = ?";
$stmt_patrocinador = mysqli_prepare($con, $sql_patrocinador);
mysqli_stmt_bind_param($stmt_patrocinador, "i", $patrocinador_id);
mysqli_stmt_execute($stmt_patrocinador);
$result_patrocinador = mysqli_stmt_get_result($stmt_patrocinador);
$patrocinador = mysqli_fetch_assoc($result_patrocinador);

if (!$patrocinador) {
    header("Location: index.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perfil do Patrocinador - AnySummit</title>
    
    <link rel="stylesheet" type="text/css" href="/patrocinador/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/patrocinador/css/checkin-painel-1-0-1.css">
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
            background: linear-gradient(135deg, #f59e0b, #d97706);
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
            color: #f59e0b;
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
            border-color: #f59e0b !important;
            box-shadow: 0 0 0 0.2rem rgba(245, 158, 11, 0.25) !important;
            color: #FFFFFF !important;
            outline: none;
        }
        
        .form-control[readonly] {
            background: rgba(255, 255, 255, 0.02) !important;
            color: rgba(255, 255, 255, 0.6) !important;
        }
        
        .btn-custom {
            background: linear-gradient(135deg, #f59e0b, #d97706) !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 12px 24px !important;
            color: white !important;
            font-weight: 600 !important;
            cursor: pointer;
        }
        
        .btn-custom:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 30px rgba(245, 158, 11, 0.4) !important;
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
        
        .categoria-badge {
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .categoria-ouro {
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #92400e;
        }
        
        .categoria-prata {
            background: linear-gradient(135deg, #c0c0c0, #e5e5e5);
            color: #374151;
        }
        
        .categoria-bronze {
            background: linear-gradient(135deg, #cd7f32, #d2691e);
            color: white;
        }
        
        .categoria-apoiador {
            background: linear-gradient(135deg, #6b7280, #9ca3af);
            color: white;
        }
        
        .beneficio-item {
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .beneficio-item i {
            color: #f59e0b;
            font-size: 1.2rem;
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
            color: #f59e0b;
            display: block;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
            margin-top: 5px;
        }
        
        .logo-placeholder {
            width: 120px;
            height: 120px;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 3rem;
            color: rgba(255, 255, 255, 0.8);
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
                <div class="user-icon" onClick="toggleUserDropdown()">🤝</div>
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
                    <div class="logo-placeholder">
                        <i class="fas fa-building"></i>
                    </div>
                    <h3><?php echo htmlspecialchars($patrocinador['empresa']); ?></h3>
                    <p><?php echo htmlspecialchars($patrocinador['responsavel']); ?></p>
                    <span class="categoria-badge categoria-<?php echo strtolower($patrocinador['categoria']); ?>">
                        <?php echo ucfirst($patrocinador['categoria']); ?>
                    </span>
                    
                    <?php if ($patrocinador['evento_nome']): ?>
                        <p style="margin-top: 15px; opacity: 0.9;">
                            <i class="fas fa-calendar"></i> <?php echo htmlspecialchars($patrocinador['evento_nome']); ?>
                        </p>
                    <?php endif; ?>
                </div>
                
                <!-- Dados da Empresa -->
                <div class="profile-card">
                    <h4><i class="fas fa-building"></i> Dados da Empresa</h4>
                    <form method="POST">
                        <input type="hidden" name="action" value="atualizar_dados">
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="empresa">Nome da Empresa *</label>
                                    <input type="text" class="form-control" id="empresa" name="empresa" 
                                           value="<?php echo htmlspecialchars($patrocinador['empresa']); ?>" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="responsavel">Responsável *</label>
                                    <input type="text" class="form-control" id="responsavel" name="responsavel" 
                                           value="<?php echo htmlspecialchars($patrocinador['responsavel']); ?>" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="email">E-mail *</label>
                                    <input type="email" class="form-control" id="email" name="email" 
                                           value="<?php echo htmlspecialchars($patrocinador['email']); ?>" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="telefone">Telefone</label>
                                    <input type="tel" class="form-control" id="telefone" name="telefone" 
                                           value="<?php echo htmlspecialchars($patrocinador['telefone'] ?: ''); ?>"
                                           placeholder="(11) 99999-9999">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="website">Website</label>
                            <input type="url" class="form-control" id="website" name="website" 
                                   value="<?php echo htmlspecialchars($patrocinador['website'] ?: ''); ?>"
                                   placeholder="https://www.exemplo.com">
                        </div>
                        
                        <div class="form-group">
                            <label for="descricao">Descrição da Empresa</label>
                            <textarea class="form-control" id="descricao" name="descricao" 
                                      rows="4" placeholder="Fale sobre sua empresa..."><?php echo htmlspecialchars($patrocinador['descricao'] ?: ''); ?></textarea>
                        </div>
                        
                        <div class="text-end">
                            <button type="submit" class="btn btn-custom">
                                <i class="fas fa-save"></i> Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- Informações do Patrocínio -->
                <div class="profile-card">
                    <h4><i class="fas fa-handshake"></i> Informações do Patrocínio</h4>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Categoria do Patrocínio</label>
                                <input type="text" class="form-control" 
                                       value="<?php echo ucfirst($patrocinador['categoria']); ?>" readonly>
                            </div>
                            <div class="form-group">
                                <label>Valor do Contrato</label>
                                <input type="text" class="form-control" 
                                       value="R$ <?php echo number_format($patrocinador['valor'], 2, ',', '.'); ?>" readonly>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label>Status do Contrato</label>
                                <input type="text" class="form-control" 
                                       value="<?php echo ucfirst($patrocinador['status_contrato']); ?>" readonly>
                            </div>
                            <div class="form-group">
                                <label>Data do Contrato</label>
                                <input type="text" class="form-control" 
                                       value="<?php echo date('d/m/Y', strtotime($patrocinador['data_contrato'])); ?>" readonly>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Benefícios do Patrocínio -->
                <div class="profile-card">
                    <h4><i class="fas fa-gift"></i> Benefícios do Patrocínio</h4>
                    
                    <?php 
                    // Definir benefícios baseados na categoria
                    $beneficios = [];
                    switch($patrocinador['categoria']) {
                        case 'ouro':
                            $beneficios = [
                                'Logo em destaque no site e materiais',
                                'Estande premium no evento',
                                'Palestra de 30 minutos',
                                'Kit completo de materiais',
                                '10 ingressos VIP',
                                'Networking exclusivo'
                            ];
                            break;
                        case 'prata':
                            $beneficios = [
                                'Logo no site e materiais',
                                'Estande no evento',
                                'Lightning talk de 10 minutos',
                                '5 ingressos',
                                'Networking com participantes'
                            ];
                            break;
                        case 'bronze':
                            $beneficios = [
                                'Logo nos materiais',
                                'Mesa promocional',
                                '3 ingressos',
                                'Menção nas redes sociais'
                            ];
                            break;
                        default:
                            $beneficios = [
                                'Logo nos materiais de apoio',
                                '1 ingresso',
                                'Certificado de apoio'
                            ];
                    }
                    ?>
                    
                    <?php foreach($beneficios as $beneficio): ?>
                        <div class="beneficio-item">
                            <i class="fas fa-check-circle"></i>
                            <span><?php echo $beneficio; ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>
                
                <!-- Informações da Conta -->
                <div class="profile-card">
                    <h4><i class="fas fa-info-circle"></i> Informações da Conta</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Parceria iniciada em:</strong> 
                            <?php echo date('d/m/Y', strtotime($patrocinador['criado_em'])); ?></p>
                            <p><strong>Último acesso:</strong> 
                            <?php echo $patrocinador['ultimo_acesso'] ? date('d/m/Y H:i', strtotime($patrocinador['ultimo_acesso'])) : 'Nunca'; ?></p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Status:</strong> 
                            <span style="color: <?php echo $patrocinador['ativo'] ? '#f59e0b' : '#f56565'; ?>">
                                <?php echo $patrocinador['ativo'] ? 'Ativo' : 'Inativo'; ?>
                            </span></p>
                            <?php if ($patrocinador['website']): ?>
                                <p><strong>Website:</strong> 
                                <a href="<?php echo htmlspecialchars($patrocinador['website']); ?>" 
                                   target="_blank" style="color: #f59e0b;">
                                    <?php echo htmlspecialchars($patrocinador['website']); ?>
                                </a></p>
                            <?php endif; ?>
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