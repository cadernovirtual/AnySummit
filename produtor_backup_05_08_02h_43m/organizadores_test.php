<?php
// Página simples para testar se organizadores funciona
ini_set('display_errors', 1);
error_reporting(E_ALL);

include("check_login.php");
include("conm/conn.php");

// Buscar dados do usuário para o header
$usuario = null;
$usuario_id = $_SESSION['usuarioid'];
if ($usuario_id) {
    $sql_usuario = "SELECT id, nome, email, foto_perfil FROM usuarios WHERE id = ?";
    $stmt_usuario = mysqli_prepare($con, $sql_usuario);
    if ($stmt_usuario) {
        mysqli_stmt_bind_param($stmt_usuario, "i", $usuario_id);
        mysqli_stmt_execute($stmt_usuario);
        $result_usuario = mysqli_stmt_get_result($stmt_usuario);
        $usuario = mysqli_fetch_assoc($result_usuario);
        mysqli_stmt_close($stmt_usuario);
    }
}

// Verificar se as colunas existem
$sql_check = "SHOW COLUMNS FROM contratantes LIKE 'usuario_id'";
$result_check = mysqli_query($con, $sql_check);
$column_exists = mysqli_num_rows($result_check) > 0;

if (!$column_exists) {
    echo "<div style='padding: 20px; background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 4px; margin: 20px;'>";
    echo "<h3>Configuração Necessária</h3>";
    echo "<p>As alterações do banco de dados ainda não foram aplicadas.</p>";
    echo "<p><a href='executar_alteracoes_web.php' style='color: #721c24; font-weight: bold;'>Clique aqui para executar as alterações do banco</a></p>";
    echo "</div>";
    exit;
}

$acao = isset($_GET['acao']) ? $_GET['acao'] : 'listar';
$organizador_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

// Buscar organizadores básicos
$organizadores = [];
$sql = "SELECT * FROM contratantes WHERE usuario_id = ? ORDER BY nome_fantasia";
$stmt = mysqli_prepare($con, $sql);
mysqli_stmt_bind_param($stmt, "i", $usuario_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
while ($row = mysqli_fetch_assoc($result)) {
    $organizadores[] = $row;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organizadores - AnySummit</title>
    
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-1.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <style>
        .content-area {
            padding: 20px;
            color: white;
        }
        .organizadores-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .btn-primary {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            text-decoration: none;
            display: inline-block;
        }
        .organizador-card {
            background: rgba(42, 42, 56, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 25px;
            margin-bottom: 20px;
            color: white;
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
                <div class="user-icon" onClick="toggleUserDropdown()">
                    <?php if ($usuario && !empty($usuario['foto_perfil'])): ?>
                        <img src="/uploads/capas/<?php echo htmlspecialchars($usuario['foto_perfil']); ?>" 
                             alt="Foto do usuário" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                    <?php else: ?>
                        👤
                    <?php endif; ?>
                </div>
                <div class="user-dropdown" id="userDropdown">
                    <div class="dropdown-item" onClick="window.location.href='perfil.php'">
                        👤 Perfil
                    </div>
                    <div class="dropdown-item" onClick="window.location.href='meuseventos.php'">
                        📅 Meus Eventos
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
            <div class="organizadores-container">
                <h1 style="color: #00C2FF; margin-bottom: 30px;">Organizadores</h1>
                
                <p>✅ Banco conectado: <?php echo mysqli_get_host_info($con); ?></p>
                <p>✅ Usuário ID: <?php echo $usuario_id; ?></p>
                <p>✅ Colunas necessárias: <?php echo $column_exists ? 'Existem' : 'Não existem'; ?></p>
                
                <?php if (empty($organizadores)): ?>
                    <div class="organizador-card">
                        <h3>Nenhum organizador encontrado</h3>
                        <p>Ainda não há organizadores cadastrados para este usuário.</p>
                        <a href="executar_alteracoes_web.php" class="btn-primary">
                            Executar Alterações do Banco Primeiro
                        </a>
                    </div>
                <?php else: ?>
                    <p>✅ Organizadores encontrados: <?php echo count($organizadores); ?></p>
                    <?php foreach ($organizadores as $org): ?>
                        <div class="organizador-card">
                            <h3><?php echo htmlspecialchars($org['nome_fantasia']); ?></h3>
                            <p><?php echo htmlspecialchars($org['razao_social']); ?></p>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </main>
    </div>

    <script>
        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('active');
        }

        function toggleMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('mobileOverlay');
            
            sidebar.classList.toggle('mobile-active');
            overlay.classList.toggle('active');
        }

        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                window.location = 'logout.php';
            }
        }
    </script>
</body>
</html>