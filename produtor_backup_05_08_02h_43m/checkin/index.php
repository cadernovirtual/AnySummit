<?php
include("../check_login.php");
include("../conm/conn.php");
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fazer Checkin - Anysummit</title>
    <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qr-scanner/1.4.2/qr-scanner.umd.min.js"></script>
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-0.css">
</head>
<body>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>

    <!-- Header -->
    <header class="header">
        <div class="logo-section">
          <img src="../img/logohori.png" style="width:100%; max-width:200px;">
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
        <?php include '../menu.php'?>

        <!-- Content Area -->
        <main class="content-area">
            <div class="checkin-container">
                <div class="checkin-header">
                    <h1>Fazer Check-in</h1>
                    <p>Escaneie o QR Code do participante para realizar o check-in</p>
                </div>

                <div class="checkin-content">
                    <div class="qr-scanner-container">
                        <div id="qr-reader" style="width: 100%; max-width: 500px;"></div>
                        <div class="scanner-status" id="scannerStatus">
                            Aguardando QR Code...
                        </div>
                    </div>

                    <div class="manual-checkin">
                        <h3>Check-in Manual</h3>
                        <form id="manualCheckinForm">
                            <input type="text" id="participanteId" placeholder="ID do Participante" class="manual-input">
                            <button type="submit" class="checkin-btn">Fazer Check-in</button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        // Scripts do menu (mesmos da página realizados.php)
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

        // Logout function
        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                window.location = '../logout.php';
            }
        }

        // QR Scanner (placeholder - você pode implementar depois)
        let html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader", 
            { fps: 10, qrbox: {width: 250, height: 250} },
            false
        );

        function onScanSuccess(decodedText, decodedResult) {
            console.log(`QR Code detectado: ${decodedText}`);
            document.getElementById('scannerStatus').innerHTML = `QR Code detectado: ${decodedText}`;
            
            // Aqui você faria o check-in automático
            processCheckin(decodedText);
        }

        function onScanFailure(error) {
            // Handle scan failure, usually better to ignore and keep scanning
        }

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);

        // Função para processar check-in
        function processCheckin(participanteId) {
            // Implementar lógica de check-in aqui
            console.log('Processando check-in para:', participanteId);
        }

        // Form manual
        document.getElementById('manualCheckinForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const participanteId = document.getElementById('participanteId').value;
            if (participanteId) {
                processCheckin(participanteId);
            }
        });

        // Particles effect
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
