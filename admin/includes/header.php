<?php
require_once dirname(__DIR__) . '/conm/conn.php';
$usuario_id = verificarAutenticacaoAdmin();
$stmt = $con->prepare("SELECT nome, email FROM usuarios WHERE id = ? AND perfil = 'admin'");
$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$result = $stmt->get_result();
$usuario = $result->fetch_assoc();
$stmt->close();
if (!$usuario) logoutAdmin();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($page_title) ? $page_title . ' - ' : ''; ?>AnySummit Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <?php if (isset($custom_head)): ?>
        <?php echo $custom_head; ?>
    <?php endif; ?>
    <style>
        :root {
            --primary-color: #667eea;
            --secondary-color: #764ba2;
            --sidebar-bg: #2c3e50;
            --sidebar-hover: #34495e;
            --text-light: #ecf0f1;
            --border-color: #dee2e6;
        }
        body {
            background-color: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .admin-header {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            color: white;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1030;            height: 70px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .admin-sidebar {
            position: fixed;
            top: 70px;
            left: 0;
            width: 260px;
            height: calc(100vh - 70px);
            background: var(--sidebar-bg);
            z-index: 1020;
            overflow-y: auto;
        }
        .sidebar-menu {
            list-style: none;
            padding: 20px 0;
            margin: 0;
        }
        .sidebar-menu a {
            display: flex;
            align-items: center;
            padding: 15px 25px;
            color: var(--text-light);
            text-decoration: none;
            transition: all 0.3s ease;
            border-left: 3px solid transparent;
        }
        .sidebar-menu a:hover, .sidebar-menu a.active {
            background: var(--sidebar-hover);
            border-left-color: var(--primary-color);
            color: white;
        }
        .sidebar-menu i {
            width: 20px;
            text-align: center;
            margin-right: 12px;
        }        .admin-content {
            margin-left: 260px;
            margin-top: 70px;
            padding: 30px;
            min-height: calc(100vh - 70px);
        }
        .page-header {
            background: white;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            border-left: 4px solid var(--primary-color);
        }
        .page-header h1 {
            margin: 0;
            color: #2c3e50;
            font-size: 1.8rem;
            font-weight: 600;
        }
        .admin-card {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .admin-card-header {
            padding: 20px 25px;
            border-bottom: 1px solid var(--border-color);
            background: #f8f9fa;
            border-radius: 10px 10px 0 0;
        }
        .admin-card-body {
            padding: 25px;
        }
    </style>
</head><body>
    <header class="admin-header">
        <div class="container-fluid h-100">
            <div class="d-flex justify-content-between align-items-center h-100">
                <a href="/admin/" class="navbar-brand">
                    <img src="/img/anysummitlogo.png" alt="AnySummit" style="height: 40px; margin-right: 10px;">
                    <span style="color: white; font-weight: 600;">Admin</span>
                </a>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-user"></i>
                    </div>
                    <div style="display: flex; flex-direction: column;">
                        <p style="margin: 0; font-weight: 500; font-size: 0.9rem;"><?php echo htmlspecialchars($usuario['nome']); ?></p>
                        <p style="margin: 0; font-size: 0.75rem; opacity: 0.8;">Administrador</p>
                    </div>
                    <a href="/admin/logout.php" class="btn" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 8px; padding: 8px 15px;">
                        <i class="fas fa-sign-out-alt me-1"></i>
                        Sair
                    </a>
                </div>
            </div>
        </div>
    </header>
    
    <nav class="admin-sidebar">
        <ul class="sidebar-menu">
            <li>
                <a href="/admin/parametros.php" <?php echo (basename($_SERVER['PHP_SELF']) == 'parametros.php') ? 'class="active"' : ''; ?>>
                    <i class="fas fa-cogs"></i>
                    Parâmetros Gerais
                </a>
            </li>
            <li>
                <a href="/admin/evolution.php" <?php echo (basename($_SERVER['PHP_SELF']) == 'evolution.php') ? 'class="active"' : ''; ?>>
                    <i class="fab fa-whatsapp"></i>
                    Instância WhatsApp
                </a>
            </li>
            <li>
                <a href="/admin/mensagens.php" <?php echo (basename($_SERVER['PHP_SELF']) == 'mensagens.php') ? 'class="active"' : ''; ?>>
                    <i class="fas fa-comments"></i>
                    Histórico WhatsApp
                </a>
            </li>
        </ul>
    </nav>
    
    <main class="admin-content">