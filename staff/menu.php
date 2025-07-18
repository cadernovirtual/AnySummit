<?php
// Detecta a página atual para marcar como ativa
$current_page = basename($_SERVER['REQUEST_URI'], '.php');
$current_dir = basename(dirname($_SERVER['REQUEST_URI']));

// Define qual menu deve estar ativo
$checkin_active = '';
$realizados_active = '';
$credenciamento_active = '';

if ($current_dir === 'checkin' || $current_page === 'checkin' || strpos($_SERVER['REQUEST_URI'], '/checkin') !== false) {
    $checkin_active = 'active';
} elseif ($current_page === 'realizados' || strpos($_SERVER['REQUEST_URI'], 'realizados') !== false) {
    $realizados_active = 'active';
} elseif ($current_page === 'credenciamento' || strpos($_SERVER['REQUEST_URI'], 'credenciamento') !== false) {
    $credenciamento_active = 'active';
}
?>

<nav class="sidebar">
    <div class="menu-item <?php echo $checkin_active; ?>" onclick="window.location.href='/staff/checkin'">
        <span class="menu-icon">📱</span>
        <span>Fazer Checkins</span>
    </div>
    <div class="menu-item <?php echo $realizados_active; ?>" onclick="window.location.href='/staff/realizados'">
        <span class="menu-icon">👤</span>
        <span>Checkins Realizados</span>
    </div>
    <div class="menu-item <?php echo $credenciamento_active; ?>" onclick="window.location.href='/staff/credenciamento'">
        <span class="menu-icon">👥</span>
        <span>Credenciamento</span>
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
        window.location = '/staff/logout.php';
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
