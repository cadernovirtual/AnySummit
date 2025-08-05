<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AnySummit - Painel do Produtor</title>
    
    <!-- CSS Base -->
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f8f9fa;
            color: #333;
            line-height: 1.6;
        }

        .main-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 15px 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .header-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
        }

        .logo {
            color: white;
            font-size: 24px;
            font-weight: 700;
            text-decoration: none;
        }

        .user-info {
            display: flex;
            align-items: center;
            color: white;
        }

        .user-info span {
            margin-right: 15px;
        }

        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
        }

        .main-layout {
            display: flex;
            min-height: calc(100vh - 80px);
        }

        .sidebar {
            width: 250px;
            background: white;
            padding: 20px 0;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        }

        .menu-item {
            display: flex;
            align-items: center;
            padding: 15px 25px;
            color: #555;
            text-decoration: none;
            transition: all 0.3s ease;
            cursor: pointer;
            border-left: 4px solid transparent;
        }

        .menu-item:hover {
            background: rgba(0, 194, 255, 0.1);
            color: #00c2ff;
            border-left-color: #00c2ff;
        }

        .menu-item.active {
            background: rgba(0, 194, 255, 0.15);
            color: #00c2ff;
            border-left-color: #00c2ff;
            font-weight: 600;
        }

        .menu-icon {
            font-size: 20px;
            margin-right: 15px;
            width: 25px;
            text-align: center;
        }

        .content-area {
            flex: 1;
            padding: 0;
            background: #f8f9fa;
        }

        .page-content {
            max-width: 100%;
            margin: 0;
            padding: 0;
        }

        /* Responsivo */
        @media (max-width: 768px) {
            .main-layout {
                flex-direction: column;
            }
            
            .sidebar {
                width: 100%;
                order: 2;
            }
            
            .content-area {
                order: 1;
            }
            
            .header-container {
                padding: 0 15px;
            }
            
            .user-info span {
                display: none;
            }
        }
    </style>
</head>
<body>
    <header class="main-header">
        <div class="header-container">
            <a href="/produtor/meuseventos.php" class="logo">
                🎪 AnySummit
            </a>
            <div class="user-info">
                <span>Olá, <?php echo isset($_SESSION['usuario_nome']) ? htmlspecialchars($_SESSION['usuario_nome']) : 'Produtor'; ?>!</span>
                <div class="user-avatar">
                    <?php echo isset($_SESSION['usuario_nome']) ? strtoupper(substr($_SESSION['usuario_nome'], 0, 1)) : '👤'; ?>
                </div>
            </div>
        </div>
    </header>

    <div class="main-layout">
        <?php include_once('menu.php'); ?>
        
        <main class="content-area">
            <div class="page-content">
