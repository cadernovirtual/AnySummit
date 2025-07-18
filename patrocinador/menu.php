<?php
// Detecta a página atual para marcar como ativa
$current_page = basename($_SERVER['REQUEST_URI'], '.php');
$current_dir = basename(dirname($_SERVER['REQUEST_URI']));

// Define qual menu deve estar ativo
$checkin_active = '';
$realizados_active = '';
$config_active = '';
$msg_personalizada_active = '';

if ($current_dir === 'checkin' || $current_page === 'checkin' || strpos($_SERVER['REQUEST_URI'], '/checkin') !== false) {
    $checkin_active = 'active';
} elseif ($current_page === 'conexao' || strpos($_SERVER['REQUEST_URI'], 'conexao') !== false) {
    $realizados_active = 'active';
} elseif ($current_page === 'config' || strpos($_SERVER['REQUEST_URI'], 'config') !== false) {
    $config_active = 'active';
} elseif ($current_page === 'mensagem_personalizada' || $current_page === 'msg-personalizada' || strpos($_SERVER['REQUEST_URI'], 'mensagem_personalizada') !== false) {
    $msg_personalizada_active = 'active';
}

// Busca o tipo de ingresso do participante logado
$participante_id = $_SESSION['participanteid'] ?? $_COOKIE['participanteid'] ?? 0;
$tipo_ingresso = '';

if ($participante_id) {
    $sql_tipo = "SELECT tipoingresso FROM participantes WHERE participanteid = ?";
    $stmt_tipo = mysqli_prepare($con, $sql_tipo);
    
    if ($stmt_tipo) {
        mysqli_stmt_bind_param($stmt_tipo, "i", $participante_id);
        mysqli_stmt_execute($stmt_tipo);
        $result_tipo = mysqli_stmt_get_result($stmt_tipo);
        
        if ($row_tipo = mysqli_fetch_assoc($result_tipo)) {
            $tipo_ingresso = $row_tipo['tipoingresso'];
        }
        
        mysqli_stmt_close($stmt_tipo);
    }
}

// Verifica se é patrocinador
$is_patrocinador = (strtolower($tipo_ingresso) === 'patrocinador');
?>

<nav class="sidebar">
    <div class="menu-item <?php echo $checkin_active; ?>" onclick="window.location.href='/patrocinador/checkin'">
        <span class="menu-icon">📱</span>
        <span>Fazer Conexão</span>
    </div>
    <div class="menu-item <?php echo $realizados_active; ?>" onclick="window.location.href='/patrocinador/conexao'">
        <span class="menu-icon">👤</span>
        <span>Minhas Conexões</span>
    </div>
    
   
    <div class="menu-item <?php echo $msg_personalizada_active; ?>" onclick="window.location.href='/patrocinador/msg-personalizada'">
        <span class="menu-icon">💬</span>
        <span>Mensagem Personalizada</span>
    </div>
 
    
    <div class="menu-item <?php echo $config_active; ?>" onclick="window.location.href='/patrocinador/config'">
        <span class="menu-icon">⚙️</span>
        <span>Meus Dados</span>
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
        window.location = '/patrocinador/logout.php';
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
