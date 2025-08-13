<?php
include("check_login.php");
include("conm/conn.php");

// Verificar se evento_id foi passado
$evento_id = isset($_GET['evento_id']) ? intval($_GET['evento_id']) : 0;

if (!$evento_id) {
    header("Location: meuseventos.php");
    exit;
}

// Buscar dados do evento
$sql_evento = "SELECT e.*, u.nome as produtor_nome 
               FROM eventos e 
               INNER JOIN usuarios u ON e.usuario_id = u.id 
               WHERE e.id = ? AND e.usuario_id = ?";
$stmt_evento = mysqli_prepare($con, $sql_evento);
mysqli_stmt_bind_param($stmt_evento, "ii", $evento_id, $_COOKIE['usuarioid']);
mysqli_stmt_execute($stmt_evento);
$result_evento = mysqli_stmt_get_result($stmt_evento);
$evento = mysqli_fetch_assoc($result_evento);

if (!$evento) {
    header("Location: meuseventos.php");
    exit;
}

// Buscar lotes existentes do evento
$sql_lotes = "SELECT l.*, 
                     (SELECT COUNT(*) FROM ingressos i WHERE i.lote_id = l.id) as total_ingressos
              FROM lotes l 
              WHERE l.evento_id = ? 
              ORDER BY l.data_inicio ASC";
$stmt_lotes = mysqli_prepare($con, $sql_lotes);
mysqli_stmt_bind_param($stmt_lotes, "i", $evento_id);
mysqli_stmt_execute($stmt_lotes);
$result_lotes = mysqli_stmt_get_result($stmt_lotes);
$lotes = mysqli_fetch_all($result_lotes, MYSQLI_ASSOC);

// Buscar dados do usuário para o header
$usuario_id = $_COOKIE['usuarioid'] ?? 0;
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
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestão de Lotes - <?php echo htmlspecialchars($evento['nome']); ?> - Anysummit</title>
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-1.css">
    <style>
        .lotes-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .page-header {
            background: rgba(42, 42, 56, 0.8);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 30px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            font-size: 14px;
            color: #B8B8C8;
        }

        .breadcrumb a {
            color: #00C2FF;
            text-decoration: none;
        }

        .breadcrumb a:hover {
            text-decoration: underline;
        }

        .page-title {
            color: #FFFFFF;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .page-subtitle {
            color: #B8B8C8;
            font-size: 16px;
        }

        .actions-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 20px;
        }

        .novo-lote-btn {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .novo-lote-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 194, 255, 0.4);
        }

        .lotes-table-container {
            background: rgba(42, 42, 56, 0.8);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .lotes-table {
            width: 100%;
            border-collapse: collapse;
        }

        .lotes-table th {
            background: rgba(0, 194, 255, 0.1);
            color: #E0E0E8;
            padding: 16px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .lotes-table td {
            padding: 16px 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #FFFFFF;
            vertical-align: middle;
        }

        .lotes-table tr:hover {
            background: rgba(0, 194, 255, 0.05);
        }

        .lotes-table tr:last-child td {
            border-bottom: none;
        }

        .switch-container {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }

        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #404058;
            transition: .4s;
            border-radius: 24px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }

        input:checked + .slider {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
        }

        input:checked + .slider:before {
            transform: translateX(26px);
        }

        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-ativo {
            background: rgba(0, 200, 81, 0.2);
            color: #00C851;
        }

        .status-futuro {
            background: rgba(255, 193, 7, 0.2);
            color: #FFC107;
        }

        .status-expirado {
            background: rgba(255, 82, 82, 0.2);
            color: #FF5252;
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
            z-index: 999;
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
            color: #B8B8C8;
        }

        .empty-state-icon {
            font-size: 64px;
            margin-bottom: 20px;
            opacity: 0.5;
        }

        .empty-state h3 {
            font-size: 24px;
            margin-bottom: 12px;
            color: #E0E0E8;
        }

        .empty-state p {
            font-size: 16px;
            margin-bottom: 24px;
            line-height: 1.5;
        }

        @media (max-width: 768px) {
            .lotes-container {
                padding: 15px;
            }

            .actions-bar {
                flex-direction: column;
                align-items: stretch;
            }

            .lotes-table-container {
                overflow-x: auto;
            }

            .lotes-table {
                min-width: 800px;
            }
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
            <div class="lotes-container">
                <div class="page-header">
                    <nav class="breadcrumb">
                        <a href="meuseventos.php">📋 Meus Eventos</a>
                        <span>›</span>
                        <span>🏷️ Lotes</span>
                    </nav>
                    <h1 class="page-title">Gestão de Lotes</h1>
                    <p class="page-subtitle">
                        Evento: <strong><?php echo htmlspecialchars($evento['nome']); ?></strong>
                    </p>
                </div>

                <div class="actions-bar">
                    <div class="info-section">
                        <span style="color: #B8B8C8;">
                            Total de lotes: <strong style="color: #00C2FF;"><?php echo count($lotes); ?></strong>
                        </span>
                    </div>
                    <button onclick="criarNovoLote()" class="novo-lote-btn">
                        ➕ Novo Lote
                    </button>
                </div>

                <?php if (empty($lotes)): ?>
                    <div class="lotes-table-container">
                        <div class="empty-state">
                            <div class="empty-state-icon">🏷️</div>
                            <h3>Nenhum lote criado</h3>
                            <p>Organize as vendas do seu evento criando lotes com diferentes preços e períodos de disponibilidade.</p>
                            <button onclick="criarNovoLote()" class="novo-lote-btn">
                                🚀 Criar Primeiro Lote
                            </button>
                        </div>
                    </div>

                <?php else: ?>
                    <div class="lotes-table-container">
                        <table class="lotes-table">
                            <thead>
                                <tr>
                                    <th>Nome do Lote</th>
                                    <th>Período</th>
                                    <th>Status</th>
                                    <th>Ingressos</th>
                                    <th>Divulgar Critério</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($lotes as $lote): ?>
                                <?php
                                    $agora = new DateTime();
                                    $data_inicio = new DateTime($lote['data_inicio']);
                                    $data_fim = new DateTime($lote['data_fim']);
                                    
                                    if ($agora < $data_inicio) {
                                        $status = 'futuro';
                                        $status_texto = 'Futuro';
                                    } elseif ($agora > $data_fim) {
                                        $status = 'expirado';
                                        $status_texto = 'Expirado';
                                    } else {
                                        $status = 'ativo';
                                        $status_texto = 'Ativo';
                                    }
                                ?>
                                <tr>
                                    <td>
                                        <div style="font-weight: 600;">
                                            <?php echo htmlspecialchars($lote['nome']); ?>
                                        </div>
                                    </td>

                                    <td>
                                        <div style="font-size: 13px;">
                                            <strong>Início:</strong> <?php echo $data_inicio->format('d/m/Y H:i'); ?><br>
                                            <strong>Fim:</strong> <?php echo $data_fim->format('d/m/Y H:i'); ?>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="status-badge status-<?php echo $status; ?>">
                                            <?php echo $status_texto; ?>
                                        </span>
                                    </td>
                                    <td>
                                        <span style="color: #00C2FF; font-weight: 600;">
                                            <?php echo $lote['total_ingressos']; ?> ingresso(s)
                                        </span>
                                    </td>
                                    <td>
                                        <div class="switch-container">
                                            <label class="switch">
                                                <input type="checkbox" 
                                                       <?php echo $lote['divulgar_criterio'] ? 'checked' : ''; ?>
                                                       onchange="toggleDivulgarCriterio(<?php echo $lote['id']; ?>, this.checked)">
                                                <span class="slider"></span>
                                            </label>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="actions-dropdown">
                                            <button class="actions-btn" onclick="toggleDropdown(this)">
                                                ⋮ Opções
                                            </button>
                                            <div class="dropdown-content">
                                                <div class="dropdown-item" onclick="editarLote(<?php echo $lote['id']; ?>)">
                                                    ✏️ Editar
                                                </div>
                                                <?php if ($lote['total_ingressos'] == 0): ?>
                                                <div class="dropdown-item danger" onclick="excluirLote(<?php echo $lote['id']; ?>)">
                                                    🗑️ Excluir
                                                </div>
                                                <?php else: ?>
                                                <div class="dropdown-item" style="color: #888899; cursor: not-allowed;" 
                                                     title="Não é possível excluir lotes com ingressos associados">
                                                    🚫 Não excluível
                                                </div>
                                                <?php endif; ?>
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
        // Toggle dropdown
        function toggleDropdown(button) {
            const dropdown = button.nextElementSibling;
            
            // Fechar todos os outros dropdowns
            document.querySelectorAll('.dropdown-content').forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('show');
                }
            });
            
            dropdown.classList.toggle('show');
        }

        // Fechar dropdown ao clicar fora
        window.addEventListener('click', function(event) {
            if (!event.target.matches('.actions-btn')) {
                document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            }
        });

        // Criar novo lote
        function criarNovoLote() {
            window.location.href = 'ajax/lotes.php?action=form&evento_id=<?php echo $evento_id; ?>';
        }

        // Editar lote
        function editarLote(loteId) {
            window.location.href = 'ajax/lotes.php?action=form&evento_id=<?php echo $evento_id; ?>&lote_id=' + loteId;
        }

        // Excluir lote
        function excluirLote(loteId) {
            if (confirm('Tem certeza que deseja excluir este lote?')) {
                fetch('ajax/lotes.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'delete',
                        lote_id: loteId
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Erro ao excluir lote: ' + data.message);
                    }
                })
                .catch(error => {
                    alert('Erro ao excluir lote');
                });
            }
        }

        // Toggle divulgar critério
        function toggleDivulgarCriterio(loteId, checked) {
            fetch('ajax/lotes.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'toggle_divulgar',
                    lote_id: loteId,
                    divulgar_criterio: checked ? 1 : 0
                })
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    alert('Erro ao atualizar configuração: ' + data.message);
                    // Reverter o switch em caso de erro
                    event.target.checked = !checked;
                }
            })
            .catch(error => {
                alert('Erro ao atualizar configuração');
                // Reverter o switch em caso de erro
                event.target.checked = !checked;
            });
        }

        // Funções do header e menu
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

        // Mouse interaction with particles
        document.addEventListener('mousemove', function(e) {
            const particles = document.querySelectorAll('.particle');
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            particles.forEach((particle, index) => {
                const speed = (index + 1) * 0.5;
                const x = mouseX * speed;
                const y = mouseY * speed;
                
                particle.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
            });
        });
    </script>
</body>
</html>
