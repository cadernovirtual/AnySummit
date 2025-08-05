<?php
echo "<h1>Debug - Editar Evento</h1>";
echo "<p><strong>GET parameters:</strong></p>";
echo "<pre>" . print_r($_GET, true) . "</pre>";

echo "<p><strong>URL atual:</strong> " . $_SERVER['REQUEST_URI'] . "</p>";

if (isset($_GET['evento_id'])) {
    $evento_id = intval($_GET['evento_id']);
    echo "<p><strong>Evento ID capturado:</strong> $evento_id</p>";
    
    // Testar conexão com banco
    include("conm/conn.php");
    include("check_login.php");
    
    $usuario_id = $_SESSION['usuarioid'];
    echo "<p><strong>Usuário ID:</strong> $usuario_id</p>";
    
    // Testar consulta no banco
    $sql = "SELECT * FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($row = mysqli_fetch_assoc($result)) {
        echo "<p><strong>✅ Evento encontrado:</strong></p>";
        echo "<pre>" . print_r($row, true) . "</pre>";
    } else {
        echo "<p><strong>❌ Evento não encontrado ou sem permissão</strong></p>";
        
        // Verificar se evento existe (sem filtro de usuário)
        $sql_check = "SELECT * FROM eventos WHERE id = ?";
        $stmt_check = mysqli_prepare($con, $sql_check);
        mysqli_stmt_bind_param($stmt_check, "i", $evento_id);
        mysqli_stmt_execute($stmt_check);
        $result_check = mysqli_stmt_get_result($stmt_check);
        
        if ($row_check = mysqli_fetch_assoc($result_check)) {
            echo "<p><strong>Evento existe mas pertence ao usuário:</strong> " . $row_check['usuario_id'] . "</p>";
        } else {
            echo "<p><strong>Evento não existe no banco</strong></p>";
        }
    }
} else {
    echo "<p><strong>❌ Parâmetro evento_id não encontrado na URL</strong></p>";
}

echo "<hr>";
echo "<p><a href='meuseventos.php'>← Voltar para meus eventos</a></p>";
?>
