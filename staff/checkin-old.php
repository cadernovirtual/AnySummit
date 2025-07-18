<?php
include("check_login.php");
include("conm/conn.php");
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Staff - Anysummit</title>
        <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qr-scanner/1.4.2/qr-scanner.umd.min.js"></script>
      <link rel="stylesheet" type="text/css" href="/staff/css/checkin-1-0-0.css">
      <link rel="stylesheet" type="text/css" href="/staff/css/checkin-painel-1-0-0.css">
  
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
        <?php include 'menu.php'?>

        <!-- Content Area -->
        <main class="content-area">
            <div class="container">
        <div class="header" style="display: block;    position: relative;    z-index: 8;    text-align: center;    margin-bottom: 25px;    border-radius: 20px;">
            <h1>Check-in</h1>
            <p>Escaneie o QR Code do participante</p>
        </div>

        <div class="scanner-section">
            <div class="qr-frame" id="reader">
                <video id="qr-video"></video>
                <div class="qr-icon" id="qr-icon">📱</div>
            </div>
               
            <button class="scan-button" href="javascript:void(0);" id="start-button" >
                <span id="button-text">Ler QR Code</span>
            </button>
        </div>

        <div class="loading" id="loading">
            <p>Carregando informações do participante...</p>
        </div>

        <div class="error-message" id="error-message"></div>
        <div class="success-message" id="success-message"></div>

        <div class="participant-info" id="participant-info">
            <img src="" alt="Foto do participante" class="participant-photo" id="participant-photo">
            <div class="participant-details">
                <h3 id="participant-name"></h3>
                <div class="participant-field">
                    <span class="field-label">Telefone:</span>
                    <span class="field-value" id="participant-phone"></span>
                </div>
                <div class="participant-field">
                    <span class="field-label">Email:</span>
                    <span class="field-value" id="participant-email"></span>
                </div>
                <div class="participant-field">
                    <span class="field-label">Tipo:</span>
                    <span class="field-value" id="participant-type"></span>
                </div>
                <button class="confirm-button" id="confirm-button">
                    ✓ Confirmar Presença
                </button>
            </div>
        </div>
    </div>
        </main>
    </div>

    <script>
        // Toggle mobile menu
        function toggleMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('mobileOverlay');
            const menuToggle = document.querySelector('.menu-toggle');
            
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            menuToggle.classList.toggle('active');
        }

        // Close mobile menu
        function closeMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('mobileOverlay');
            const menuToggle = document.querySelector('.menu-toggle');
            
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            menuToggle.classList.remove('active');
        }

        // Toggle user dropdown
        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('active');
        }

        // Close dropdown and mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const userMenu = document.querySelector('.user-menu');
            const dropdown = document.getElementById('userDropdown');
            const sidebar = document.querySelector('.sidebar');
            const menuToggle = document.querySelector('.menu-toggle');
            
            // Close user dropdown
            if (!userMenu.contains(event.target)) {
                dropdown.classList.remove('active');
            }
            
            // Close mobile menu if clicking outside sidebar and menu toggle
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

        // Set active menu item
        function setActiveMenu(element, section) {
            // Remove active class from all menu items
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked item
            element.classList.add('active');
            
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
            
            // Update content area (placeholder for now)
            updateContentArea(section);
        }

       
        // Settings function
        function openSettings() {
            document.getElementById('userDropdown').classList.remove('active');
            alert('Abrindo configurações...');
        }

        // Logout function
        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                window.location = 'logout.php';
                // Aqui você adicionaria a lógica real de logout
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

        // Add smooth interactions
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.boxShadow = '0 4px 20px rgba(0, 194, 255, 0.2)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.boxShadow = 'none';
            });
        });
    </script>
    
     <script>
document.addEventListener('DOMContentLoaded', function () {
    const startButton = document.getElementById('start-button');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const participantInfo = document.getElementById('participant-info');
    const confirmButton = document.getElementById('confirm-button');
    
    let html5QrCode;
    let isScanning = false;
    let currentParticipant = null;

    // Função para mostrar/esconder elementos
    function showElement(element) {
        element.classList.add('show');
    }

    function hideElement(element) {
        element.classList.remove('show');
    }

    function hideMessages() {
        hideElement(errorMessage);
        hideElement(successMessage);
    }

    function showError(message) {
        errorMessage.textContent = message;
        showElement(errorMessage);
        setTimeout(() => hideMessages(), 5000);
    }

    function showSuccess(message) {
        successMessage.textContent = message;
        showElement(successMessage);
    }

    function showLoading() {
        showElement(loading);
    }

    function hideLoading() {
        hideElement(loading);
    }

    // Função para chamar o webhook
    async function callWebhook(qrData) {
        try {
            const response = await fetch('https://n8n.webtoyou.com.br/webhook/anysummit-presenca', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    qrData: qrData,
					staffid: <?=$_COOKIE['staffid']?>,
					eventoid: <?=$_COOKIE['eventoid']?>,
                    evento: "verificardados"
                })
            });
            
            if (!response.ok) {
                throw new Error(`Erro na resposta do servidor: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao chamar webhook:', error);
            throw error;
        }
    }

    // Função para exibir dados do participante
    function displayParticipant(data) {
        currentParticipant = data;
        // Guardar o QR code original para usar na confirmação
        currentParticipant.qrData = data.qrData || currentParticipant.qrData;
        
        document.getElementById('participant-name').textContent = data.nome || 'Nome não informado';
        document.getElementById('participant-phone').textContent = data.telefone || 'Telefone não informado';
        document.getElementById('participant-email').textContent = data.email || 'Email não informado';
        document.getElementById('participant-type').textContent = data.tipo || 'Tipo não informado';
        
        // Definir foto do participante ou usar placeholder
        const photo = document.getElementById('participant-photo');
        if (data.foto) {
            photo.src = data.foto;
        } else {
            photo.src = `https://anysummit.com.br/staff/img/user.jpg`;
        }
        
        showElement(participantInfo);
    }

    // Função para confirmar presença
    async function confirmPresence() {
        if (!currentParticipant) return;
        
        try {
            confirmButton.disabled = true;
            confirmButton.textContent = 'Confirmando...';
            
            // Chamar webhook para confirmar presença
            const response = await fetch('https://n8n.webtoyou.com.br/webhook/anysummit-presenca', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    qrData: currentParticipant.qrData || '',
                    evento: "Confirmarpresenca",
					staffid: <?=$_COOKIE['staffid']?>,
					eventoid: <?=$_COOKIE['eventoid']?>,
                    participante: currentParticipant
                })
            });

            
            if (!response.ok) {
                throw new Error(`Erro na resposta do servidor: ${response.status}`);
            }
            
            showSuccess('Presença confirmada com sucesso!');
            
            // Limpar dados após 3 segundos
            setTimeout(() => {
                resetApp();
            }, 3000);
            
        } catch (error) {
            console.error('Erro ao confirmar presença:', error);
            showError('Erro ao confirmar presença. Tente novamente.');
            confirmButton.disabled = false;
            confirmButton.textContent = '✓ Confirmar Presença';
        }
    }

    // Função para resetar a aplicação
    function resetApp() {
        currentParticipant = null;
        hideElement(participantInfo);
        hideMessages();
        confirmButton.disabled = false;
        confirmButton.textContent = '✓ Confirmar Presença';
    }

    // Event listener para o botão de scan
    startButton.addEventListener('click', function () {
        if (isScanning) {
            html5QrCode.stop().then(() => {
                console.log("Leitura parada.");
                startButton.innerHTML = '<span id="button-text">Ler QR Code</span>';
                isScanning = false;
            }).catch((err) => {
                console.error("Erro ao parar o leitor: ", err);
            });
        } else {
            if (!html5QrCode) {
                html5QrCode = new Html5Qrcode("reader");
            }

            const qrCodeSuccessCallback = async (decodedText, decodedResult) => {
                console.log('QR Code lido:', decodedText);
                
                // Parar o scanner
                html5QrCode.stop().then(() => {
                    console.log("Leitura parada.");
                    startButton.innerHTML = '<span id="button-text">Ler QR Code</span>';
                    isScanning = false;
                }).catch((err) => {
                    console.error("Erro ao parar o leitor: ", err);
                });

                try {
                    hideMessages();
                    hideElement(participantInfo);
                    showLoading();
                    
                    // Chamar o webhook com o conteúdo do QR Code
                    const response = await callWebhook(decodedText);
                    
                    // Guardar o QR code original para usar na confirmação
                    response.qrData = decodedText;
                    
                    hideLoading();
                    displayParticipant(response);
                    
                } catch (error) {
                    hideLoading();
                    console.error('Erro ao processar QR Code:', error);
                    showError('Erro ao carregar dados do participante. Tente novamente.');
                }
            };

            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            html5QrCode.start(
                { facingMode: "environment" },
                config,
                qrCodeSuccessCallback
            ).then(() => {
                console.log("Leitura iniciada.");
                startButton.innerHTML = '<span id="button-text">Fechar Leitor de QR Code</span>';
                isScanning = true;
            }).catch(err => {
                console.error("Erro ao iniciar o leitor: ", err);
                showError('Erro ao acessar a câmera. Verifique as permissões.');
            });
        }
    });

    // Event listener para o botão de confirmar
    confirmButton.addEventListener('click', confirmPresence);
});
    </script>
    
    
</body>
</html>