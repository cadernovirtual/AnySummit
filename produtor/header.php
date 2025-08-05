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

        .logo-section {
            display: flex;
            align-items: center;
        }

        .logo {
            display: inline-block;
            text-decoration: none;
        }

        .logo img {
            width: 100%;
            max-width: 200px;
            height: auto;
            filter: brightness(0) invert(1); /* Torna a logo branca para contrastar com o fundo */
        }

        .user-info {
            display: flex;
            align-items: center;
            color: white;
            position: relative;
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
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .user-avatar:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.05);
        }

        /* Dropdown Menu */
        .user-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            min-width: 150px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            z-index: 1000;
            margin-top: 10px;
        }

        .user-dropdown.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .dropdown-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            color: #333;
            text-decoration: none;
            transition: background-color 0.2s ease;
            border-bottom: 1px solid #f0f0f0;
        }

        .dropdown-item:last-child {
            border-bottom: none;
        }

        .dropdown-item:hover {
            background-color: #f8f9fa;
        }

        .dropdown-item:first-child {
            border-radius: 8px 8px 0 0;
        }

        .dropdown-item:last-child {
            border-radius: 0 0 8px 8px;
        }

        .dropdown-icon {
            margin-right: 10px;
            font-size: 16px;
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
            <div class="logo-section">
                <img src="img/anysummitlogo.png" style="width:100%; max-width:200px;">
            </div>
            <div class="user-info">
                <span>Olá, <?php echo isset($_SESSION['usuario_nome']) ? htmlspecialchars($_SESSION['usuario_nome']) : 'Produtor'; ?>!</span>
                <div class="user-avatar" onclick="toggleDropdown()">
                    <?php echo isset($_SESSION['usuario_nome']) ? strtoupper(substr($_SESSION['usuario_nome'], 0, 1)) : '👤'; ?>
                </div>
                
                <!-- Dropdown Menu -->
                <div class="user-dropdown" id="userDropdown">
                    <a href="/produtor/perfil.php" class="dropdown-item">
                        <span class="dropdown-icon">👤</span>
                        Perfil
                    </a>
                    <a href="#" class="dropdown-item" onclick="logout(); return false;">
                        <span class="dropdown-icon">🚪</span>
                        Sair
                    </a>
                </div>
            </div>
        </div>
    </header>

    <div class="main-layout">
        <?php include_once('menu.php'); ?>
        
        <main class="content-area">
            <div class="page-content">

    <script>
        // Função para alternar o dropdown
        function toggleDropdown() {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('show');
        }

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', function(event) {
            const userInfo = document.querySelector('.user-info');
            const dropdown = document.getElementById('userDropdown');
            
            if (!userInfo.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });

        // Função de logout
        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                window.location = '/produtor/logout.php';
            }
        }
    </script>
