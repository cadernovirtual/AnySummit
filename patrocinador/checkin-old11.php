<?php
include("check_login.php");
include("conm/conn.php");
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Participante - Anysummit</title>
        <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qr-scanner/1.4.2/qr-scanner.umd.min.js"></script>
      <link rel="stylesheet" type="text/css" href="/patrocinador/css/checkin-1-0-0.css">
      <link rel="stylesheet" type="text/css" href="/patrocinador/css/checkin-painel-1-0-0.css">
  
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
            <h1>📱 Leitor Conexão</h1>
            <p>Conecte-se com os participantes</p>
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
        <div class="whatsapp-redirect" id="whatsapp-redirect"></div>


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
    const whatsappRedirect = document.getElementById('whatsapp-redirect');
    
    let html5QrCode;
    let isScanning = false;

    // ID do usuário fictício (pode ser gerado dinamicamente ou vir de um login)
    const userId = 'USR001';

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
        hideElement(whatsappRedirect);
    }

    function showError(message) {
        errorMessage.textContent = message;
        showElement(errorMessage);
        setTimeout(() => hideMessages(), 5000);
    }

    function showSuccess(message) {
        successMessage.textContent = message;
        showElement(successMessage);
        setTimeout(() => hideMessages(), 4000);
    }

    function showWhatsappRedirect(message) {
        whatsappRedirect.textContent = message;
        showElement(whatsappRedirect);
        setTimeout(() => hideMessages(), 5000);
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
            const response = await fetch('https://n8n.webtoyou.com.br/webhook/any-leitor-participante', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    qrData: qrData,
                    evento: "conexao",
                    userId: <?=$_COOKIE['participanteid']?>
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

    // Função para resetar a aplicação
    function resetApp() {
        hideMessages();
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
                    showLoading();
                    
                    // Chamar o webhook com o conteúdo do QR Code
                    const response = await callWebhook(decodedText);
                    
                    hideLoading();
                    

                    // Verificar o tipo de resposta
                    if (response.link) {
                        // Se retornou um link, redirecionar em nova aba
                        showWhatsappRedirect('Redirecionando...');
                        setTimeout(() => {
                            window.open(response.link, '_top');
                            resetApp();
                        }, 1500);
                    } else if (response.status === 'ok' || response === 'ok') {
                        // Se retornou OK, mostrar mensagem de sucesso
                        showSuccess('Leitura realizada com sucesso!');
                        setTimeout(() => {
                            resetApp();
                        }, 3000);
                    } else {
                        // Caso não seja nem link nem ok
                        showError('Resposta inesperada do servidor.');
                    }
                    
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


});
    </script>
    
    
</body>
</html>