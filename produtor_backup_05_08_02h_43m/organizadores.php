<?php
include("check_login.php");
include_once('conm/conn.php');

// Verificação de login (igual meuseventos.php)
if (!isset($_SESSION['usuario_logado']) || $_SESSION['usuario_logado'] !== true) {
    header('Location: /produtor/index.php');
    exit;
}

$usuario_id = $_SESSION['usuarioid'];
$contratante_id = $_COOKIE['contratanteid'] ?? 0;

// Buscar dados do usuário para o header (COPIAR EXATO do meuseventos.php)
$usuario = null;
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

// Variáveis de mensagem
$success_message = '';
$error_message = '';

// Mensagens via GET (POST-Redirect-GET)
if (isset($_GET['success'])) {
    $success_message = "Organizador cadastrado com sucesso!";
} elseif (isset($_GET['updated'])) {
    $success_message = "Organizador atualizado com sucesso!";
} elseif (isset($_GET['deleted'])) {
    $success_message = "Organizador excluído com sucesso!";
} elseif (isset($_GET['error'])) {
    if ($_GET['error'] === 'eventos') {
        $error_message = "Não é possível excluir este organizador pois ele possui eventos associados.";
    } elseif ($_GET['error'] === 'delete') {
        $error_message = "Erro ao excluir organizador.";
    }
}

// Processamento POST SIMPLIFICADO
if ($_POST && isset($_POST['acao'])) {
    $acao = $_POST['acao'];
    
    if ($acao === 'excluir') {
        $id = (int)$_POST['id'];
        
        // Verificar se tem eventos
        $sql_check = "SELECT COUNT(*) as total FROM eventos WHERE contratante_id = ?";
        $stmt_check = mysqli_prepare($con, $sql_check);
        mysqli_stmt_bind_param($stmt_check, "i", $id);
        mysqli_stmt_execute($stmt_check);
        $result_check = mysqli_stmt_get_result($stmt_check);
        $row_check = mysqli_fetch_assoc($result_check);
        
        if ($row_check['total'] > 0) {
            header("Location: organizadores.php?error=eventos");
            exit;
        } else {
            $sql_delete = "DELETE FROM contratantes WHERE id = ? AND usuario_id = ?";
            $stmt_delete = mysqli_prepare($con, $sql_delete);
            mysqli_stmt_bind_param($stmt_delete, "ii", $id, $usuario_id);
            
            if (mysqli_stmt_execute($stmt_delete)) {
                header("Location: organizadores.php?deleted=1");
                exit;
            } else {
                header("Location: organizadores.php?error=delete");
                exit;
            }
        }
    }
}

// Buscar dados do organizador para edição se ID fornecido
$editando = false;
$dados_edicao = null;
if (isset($_GET['id']) && is_numeric($_GET['id'])) {
    $id_editar = (int)$_GET['id'];
    
    $sql_editar = "SELECT * FROM contratantes WHERE id = ? AND usuario_id = ?";
    $stmt_editar = mysqli_prepare($con, $sql_editar);
    mysqli_stmt_bind_param($stmt_editar, "ii", $id_editar, $usuario_id);
    mysqli_stmt_execute($stmt_editar);
    $result_editar = mysqli_stmt_get_result($stmt_editar);
    
    if ($dados_edicao = mysqli_fetch_assoc($result_editar)) {
        $editando = true;
    }
    mysqli_stmt_close($stmt_editar);
}

// Buscar organizadores (SIMPLES E SEGURO)
$organizadores = [];
$sql = "SELECT * FROM contratantes WHERE usuario_id = ? ORDER BY nome_fantasia ASC";
$stmt = mysqli_prepare($con, $sql);
mysqli_stmt_bind_param($stmt, "i", $usuario_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$organizadores = mysqli_fetch_all($result, MYSQLI_ASSOC);
mysqli_stmt_close($stmt);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organizadores - Anysummit</title>
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-1.css">
    <style>
        .organizadores-container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .organizadores-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 20px;
        }

        .organizadores-header h1 {
            color: #FFFFFF;
            font-size: 32px;
            font-weight: 700;
            margin: 0;
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .novo-organizador-btn {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(0, 194, 255, 0.3);
        }

        .novo-organizador-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 194, 255, 0.4);
        }

        .alert {
            padding: 16px 20px;
            border-radius: 12px;
            margin-bottom: 25px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .alert-success {
            background: rgba(0, 200, 81, 0.2);
            color: #00C851;
            border: 1px solid rgba(0, 200, 81, 0.3);
        }

        .alert-error {
            background: rgba(255, 82, 82, 0.2);
            color: #FF5252;
            border: 1px solid rgba(255, 82, 82, 0.3);
        }

        .organizadores-table-container {
            background: rgba(42, 42, 56, 0.8);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .organizadores-table {
            width: 100%;
            border-collapse: collapse;
        }

        .organizadores-table th {
            background: rgba(0, 194, 255, 0.1);
            color: #E0E0E8;
            padding: 16px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .organizadores-table td {
            padding: 16px 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #FFFFFF;
            vertical-align: middle;
        }

        .organizadores-table tr:hover {
            background: rgba(0, 194, 255, 0.05);
        }

        .organizadores-table tr:last-child td {
            border-bottom: none;
        }

        .table-logo {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
            background: linear-gradient(135deg, #1A1A2E, #16213E);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #888899;
            font-size: 20px;
            border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .organizador-title {
            font-size: 16px;
            font-weight: 600;
            color: #FFFFFF;
            margin-bottom: 4px;
        }

        .organizador-info {
            font-size: 12px;
            color: #B8B8C8;
        }

        .actions-dropdown {
            position: relative;
            display: inline-block;
        }

        .actions-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #FFFFFF;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .actions-btn:hover {
            background: rgba(0, 194, 255, 0.2);
            border-color: rgba(0, 194, 255, 0.3);
        }

        .dropdown-content {
            display: none;
            position: absolute;
            right: 0;
            top: 100%;
            background: rgba(42, 42, 56, 0.98);
            min-width: 180px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            z-index: 999999;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
            backdrop-filter: blur(20px);
            margin-top: 4px;
        }

        .dropdown-content.show {
            display: block;
        }

        .dropdown-item {
            color: #FFFFFF;
            padding: 12px 16px;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: background 0.3s ease;
            font-size: 14px;
        }

        .dropdown-item:hover {
            background: rgba(0, 194, 255, 0.1);
        }

        .dropdown-item.danger:hover {
            background: rgba(255, 82, 82, 0.1);
            color: #FF5252;
        }

        .empty-state {
            text-align: center;
            padding: 60px 20px;
            background: rgba(42, 42, 56, 0.8);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .empty-state-icon {
            font-size: 64px;
            margin-bottom: 20px;
        }

        .empty-state h3 {
            color: #FFFFFF;
            font-size: 24px;
            margin-bottom: 15px;
        }

        .empty-state p {
            color: #B8B8C8;
            font-size: 16px;
            margin-bottom: 30px;
        }

        /* Mobile responsivo */
        @media (max-width: 768px) {
            .organizadores-container {
                padding: 15px;
            }

            .organizadores-header {
                flex-direction: column;
                align-items: stretch;
                gap: 15px;
            }

            .organizadores-header h1 {
                font-size: 24px;
                text-align: center;
            }

            .organizadores-table-container {
                overflow-x: auto;
            }
        }
    </style>
</head>
<body>
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
                <div class="organizadores-header">
                    <h1>🏢 Organizadores</h1>
                    <button onclick="window.location.href='organizadores_form.php'" class="novo-organizador-btn">
                        ➕ Novo Organizador
                    </button>
                </div>
                
                <!-- Alertas -->
                <?php if ($success_message): ?>
                    <div class="alert alert-success">✅ <?php echo $success_message; ?></div>
                <?php endif; ?>
                
                <?php if ($error_message): ?>
                    <div class="alert alert-error">❌ <?php echo $error_message; ?></div>
                <?php endif; ?>

                <!-- Empty State -->
                <?php if (empty($organizadores)): ?>
                    <div class="empty-state" id="empty-state">
                        <div class="empty-state-icon">🏢</div>
                        <h3>Nenhum organizador cadastrado</h3>
                        <p>Comece cadastrando seu primeiro organizador!</p>
                        <button onclick="window.location.href='organizadores_form.php'" class="novo-organizador-btn">
                            🚀 Cadastrar Primeiro Organizador
                        </button>
                    </div>
                <?php else: ?>
                    <!-- Tabela de Organizadores -->
                    <div class="organizadores-table-container">
                        <table class="organizadores-table">
                            <thead>
                                <tr>
                                    <th>Organizador</th>
                                    <th>Tipo</th>
                                    <th>Documento</th>
                                    <th>Email</th>
                                    <th>Data Cadastro</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($organizadores as $organizador): ?>
                                <tr>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <div class="table-logo">
                                                <?php if (!empty($organizador['logomarca'])): ?>
                                                    <img src="<?php echo htmlspecialchars($organizador['logomarca']); ?>" alt="Logo" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
                                                <?php else: ?>
                                                    🏢
                                                <?php endif; ?>
                                            </div>
                                            <div>
                                                <div class="organizador-title">
                                                    <?php echo htmlspecialchars($organizador['nome_fantasia'] ?? ''); ?>
                                                </div>
                                                <div class="organizador-info">
                                                    <?php echo htmlspecialchars($organizador['razao_social'] ?? ''); ?>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <?php if (!empty($organizador['cnpj'])): ?>
                                            <span style="color: #00C2FF;">🏢 Pessoa Jurídica</span>
                                        <?php else: ?>
                                            <span style="color: #725EFF;">👤 Pessoa Física</span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <?php if (!empty($organizador['cnpj'])): ?>
                                            <span style="font-family: 'Courier New', monospace;">
                                                <?php echo htmlspecialchars($organizador['cnpj']); ?>
                                            </span>
                                        <?php elseif (!empty($organizador['cpf'])): ?>
                                            <span style="font-family: 'Courier New', monospace;">
                                                <?php echo htmlspecialchars($organizador['cpf']); ?>
                                            </span>
                                        <?php else: ?>
                                            <span style="color: #B8B8C8;">Não informado</span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <?php if (!empty($organizador['email_contato'])): ?>
                                            <?php echo htmlspecialchars($organizador['email_contato']); ?>
                                        <?php else: ?>
                                            <span style="color: #B8B8C8;">Não informado</span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <?php 
                                        try {
                                            if (!empty($organizador['criado_em'])) {
                                                $criado = new DateTime($organizador['criado_em']);
                                                echo $criado->format('d/m/Y');
                                            } else {
                                                echo '<span style="color: #B8B8C8;">Não informado</span>';
                                            }
                                        } catch (Exception $e) {
                                            echo '<span style="color: #B8B8C8;">Data inválida</span>';
                                        }
                                        ?>
                                    </td>
                                    <td>
                                        <div class="actions-dropdown">
                                            <button class="actions-btn" onclick="toggleDropdown(<?php echo $organizador['id']; ?>)">
                                                ⚙️ Ações ▼
                                            </button>
                                            <div id="dropdown-<?php echo $organizador['id']; ?>" class="dropdown-content">
                                                <a href="organizadores_form.php?id=<?php echo $organizador['id']; ?>" class="dropdown-item">
                                                    ✏️ Editar
                                                </a>
                                                <div class="dropdown-item danger" onclick="confirmarExclusao(<?php echo $organizador['id']; ?>, '<?php echo addslashes($organizador['nome_fantasia']); ?>')">
                                                    🗑️ Excluir
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </div>
        </main>
    </div>

    <script>
        // Função para alternar dropdown
        function toggleDropdown(id) {
            // Fechar todos os outros dropdowns
            document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                if (dropdown.id !== 'dropdown-' + id) {
                    dropdown.classList.remove('show');
                }
            });
            
            // Alternar o dropdown clicado
            const dropdown = document.getElementById('dropdown-' + id);
            dropdown.classList.toggle('show');
        }

        // Fechar dropdowns ao clicar fora
        document.addEventListener('click', function(event) {
            if (!event.target.matches('.actions-btn')) {
                document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            }
        });

        // Função para confirmar exclusão
        function confirmarExclusao(id, nome) {
            if (confirm('Tem certeza que deseja excluir o organizador "' + nome + '"?\n\nEsta ação não pode ser desfeita.')) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.innerHTML = '<input type="hidden" name="acao" value="excluir"><input type="hidden" name="id" value="' + id + '">';
                document.body.appendChild(form);
                form.submit();
            }
        }

        // Funções do sistema (header e menu)
        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                window.location = '/produtor/logout.php';
            }
        }

        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('show');
        }

        function toggleMobileMenu() {
            const overlay = document.getElementById('mobileOverlay');
            overlay.classList.toggle('show');
        }

        function closeMobileMenu() {
            const overlay = document.getElementById('mobileOverlay');
            overlay.classList.remove('show');
        }

        // Fechar dropdown do usuário ao clicar fora
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.user-menu')) {
                document.getElementById('userDropdown').classList.remove('show');
            }
        });
    </script>
</body>
</html>
