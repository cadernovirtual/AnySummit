<?php
// Detecta a página atual para marcar como ativa
$current_page = basename($_SERVER['REQUEST_URI'], '.php');
$current_dir = basename(dirname($_SERVER['REQUEST_URI']));

// Define qual menu deve estar ativo
$meuseventos_active = '';
$organizadores_active = '';
$config_active = '';

if ($current_page === 'meuseventos' || strpos($_SERVER['REQUEST_URI'], '/meuseventos') !== false) {
    $meuseventos_active = 'active';
} elseif ($current_page === 'organizadores' || strpos($_SERVER['REQUEST_URI'], '/organizadores') !== false) {
    $organizadores_active = 'active';
} elseif ($current_page === 'config' || strpos($_SERVER['REQUEST_URI'], '/config') !== false) {
    $config_active = 'active';
}
?>

<nav class="sidebar">
    <div class="menu-item <?php echo $meuseventos_active; ?>" onclick="window.location.href='/produtor/meuseventos.php'">
        <span class="menu-icon">🎪</span>
        <span>Meus Eventos</span>
    </div>
    
    <div class="menu-item <?php echo $organizadores_active; ?>" onclick="window.location.href='/produtor/organizadores.php'">
        <span class="menu-icon">🏢</span>
        <span>Organizadores</span>
    </div>
    
    <div class="menu-item <?php echo $config_active; ?>" onclick="window.location.href='/produtor/config.php'">
        <span class="menu-icon">⚙️</span>
        <span>Configurações</span>
    </div>
    
    <div class="menu-item" onClick="logout()">
        <span class="menu-icon">🚪</span>
        <span>Sair</span>
    </div>
</nav>

<script>
// Função de logout (mantida para compatibilidade)
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        window.location = '/produtor/logout.php';
    }
}

// Adiciona efeito hover nos itens do menu
document.querySelectorAll('.menu-item').forEach(item => {
    // Pula o item de logout para não adicionar hover de link
    if (!item.getAttribute('onClick') || !item.getAttribute('onClick').includes('logout')) {
        item.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.backgroundColor = 'rgba(0, 194, 255, 0.1)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.backgroundColor = '';
            }
        });
    }
});
</script>
