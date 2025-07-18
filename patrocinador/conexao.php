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
      <link rel="stylesheet" type="text/css" href="/patrocinador/css/checkin-painel-1-0-1.css">
  
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
            <div class="checkins-container">
                <div class="checkins-header">
                    <h1>Minhas Conexões</h1>
                    
                    <div class="controls-row">
                        <div class="search-container">
                            <input type="text" id="searchInput" placeholder="Buscar por nome ou evento..." 
                                   onkeyup="searchConexoes()" class="search-input">
                            <span class="search-icon">🔍</span>
                        </div>
                        
                        <button onClick="exportarExcel()" class="export-btn">
                            📊 Exportar Excel
                        </button>
                    </div>
                </div>

                <div class="table-container">
                    <table class="checkins-table" id="conexoesTable">
                        <thead>
                            <tr>
                                <th>Foto</th>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Telefone</th>
                                <th>Evento</th>
                                <th>Data Conexão</th>
                            </tr>
                        </thead>
                        <tbody id="conexoesTableBody">
                            <!-- Conteúdo será carregado via AJAX -->
                        </tbody>
                    </table>
                </div>

                <div class="pagination-container">
                    <div class="pagination-info" id="paginationInfo">
                        <!-- Info da paginação -->
                    </div>
                    <div class="pagination" id="paginationButtons">
                        <!-- Botões de paginação -->
                    </div>
                </div>

                <div class="loading" id="loading" style="display: none;">
                    <div class="loading-spinner"></div>
                    <span>Carregando...</span>
                </div>
            </div>
        </main>
    </div>

    <script>
        let currentPage = 1;
        let totalPages = 1;
        let searchTerm = '';
        
        // Carrega os dados quando a página carrega
        document.addEventListener('DOMContentLoaded', function() {
            loadConexoes();
        });

        // Função para carregar conexões
        function loadConexoes(page = 1, search = '') {
            const loading = document.getElementById('loading');
            const tableBody = document.getElementById('conexoesTableBody');
            
            loading.style.display = 'flex';
            
            // Faz a requisição AJAX
            fetch(`conexao_data.php?page=${page}&search=${encodeURIComponent(search)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        tableBody.innerHTML = '';
                        
                        data.conexoes.forEach(conexao => {
                            const row = createTableRow(conexao);
                            tableBody.appendChild(row);
                        });
                        
                        updatePagination(data.pagination);
                    } else {
                        tableBody.innerHTML = '<tr><td colspan="6" class="no-data">Nenhuma conexão encontrada</td></tr>';
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                    tableBody.innerHTML = '<tr><td colspan="6" class="error">Erro ao carregar dados</td></tr>';
                })
                .finally(() => {
                    loading.style.display = 'none';
                });
        }

        // Função para criar linha da tabela
        function createTableRow(conexao) {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>
                    <img src="${conexao.thumb}" alt="Foto" class="participant-thumb" 
                         onerror="this.src='https://anysummit.com.br/patrocinador/img/user.jpg'">
                </td>
                <td class="participant-name">${conexao.nome}</td>
                <td>${conexao.email}</td>
                <td>${conexao.telefone || '-'}</td>
                <td class="event-name">${conexao.evento_nome}</td>
                <td class="connection-date">${formatDateTime(conexao.data_conexao)}</td>
            `;
            
            return row;
        }

        // Função para formatar data/hora
        function formatDateTime(dateString) {
            const date = new Date(dateString);
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // Função para atualizar paginação
        function updatePagination(pagination) {
            currentPage = pagination.current_page;
            totalPages = pagination.total_pages;
            
            const paginationInfo = document.getElementById('paginationInfo');
            const paginationButtons = document.getElementById('paginationButtons');
            
            // Info da paginação
            paginationInfo.innerHTML = `
                Página ${pagination.current_page} de ${pagination.total_pages} 
                (${pagination.total_records} registros)
            `;
            
            // Botões de paginação
            let buttonsHTML = '';
            
            // Botão anterior
            if (pagination.current_page > 1) {
                buttonsHTML += `<button onclick="changePage(${pagination.current_page - 1})" class="page-btn">‹ Anterior</button>`;
            }
            
            // Botões de página
            const startPage = Math.max(1, pagination.current_page - 2);
            const endPage = Math.min(pagination.total_pages, pagination.current_page + 2);
            
            for (let i = startPage; i <= endPage; i++) {
                const activeClass = i === pagination.current_page ? 'active' : '';
                buttonsHTML += `<button onclick="changePage(${i})" class="page-btn ${activeClass}">${i}</button>`;
            }
            
            // Botão próximo
            if (pagination.current_page < pagination.total_pages) {
                buttonsHTML += `<button onclick="changePage(${pagination.current_page + 1})" class="page-btn">Próximo ›</button>`;
            }
            
            paginationButtons.innerHTML = buttonsHTML;
        }

        // Função para mudar página
        function changePage(page) {
            if (page >= 1 && page <= totalPages) {
                loadConexoes(page, searchTerm);
            }
        }

        // Função de busca
        function searchConexoes() {
            const searchInput = document.getElementById('searchInput');
            searchTerm = searchInput.value.trim();
            currentPage = 1; // Reset para primeira página
            loadConexoes(1, searchTerm);
        }

        // Função para exportar Excel
        function exportarExcel() {
            const search = document.getElementById('searchInput').value.trim();
            const url = `conexao_export.php?search=${encodeURIComponent(search)}`;
            
            // Cria um link temporário para download
            const link = document.createElement('a');
            link.href = url;
            link.download = `conexoes_${new Date().toISOString().split('T')[0]}.xlsx`;
            link.click();
        }
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
    
   
    
    
</body>
</html>