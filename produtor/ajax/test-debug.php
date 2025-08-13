<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h3>Debug Info:</h3>";
echo "GET ID: " . ($_GET['id'] ?? 'não enviado') . "<br>";

include("../check_login.php");
include("../conm/conn.php");

$pedido_id = $_GET['id'] ?? 0;

echo "Pedido ID: " . $pedido_id . "<br>";
echo "Contratante ID: " . ($_COOKIE['contratanteid'] ?? 'não encontrado') . "<br>";
echo "Usuario ID: " . ($_COOKIE['usuarioid'] ?? 'não encontrado') . "<br>";

if (!$pedido_id) {
    echo '<div style="color: #FF5252; text-align: center;">Pedido não encontrado</div>';
    exit;
}

// Verificar se o pedido pertence ao usuário
$contratante_id = $_COOKIE['contratanteid'] ?? 0;
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

echo "Buscando pedido...<br>";

$sql = "SELECT p.*, 
               c.nome as comprador_nome,
               e.nome as evento_nome
        FROM tb_pedidos p
        LEFT JOIN compradores c ON p.compradorid = c.id
        LEFT JOIN eventos e ON p.eventoid = e.id
        WHERE p.pedidoid = ? AND e.contratante_id = ? AND e.usuario_id = ?";

$stmt = mysqli_prepare($con, $sql);
if ($stmt) {
    mysqli_stmt_bind_param($stmt, "iii", $pedido_id, $contratante_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $pedido = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);
    
    if ($pedido) {
        echo "<h3>Pedido encontrado!</h3>";
        echo "Comprador: " . $pedido['comprador_nome'] . "<br>";
        echo "Evento: " . $pedido['evento_nome'] . "<br>";
        echo "Código: " . $pedido['codigo_pedido'] . "<br>";
    } else {
        echo "<h3>Pedido NÃO encontrado com as permissões</h3>";
        
        // Testar sem permissão
        $sql_test = "SELECT p.*, c.nome as comprador_nome FROM tb_pedidos p LEFT JOIN compradores c ON p.compradorid = c.id WHERE p.pedidoid = ?";
        $stmt_test = mysqli_prepare($con, $sql_test);
        mysqli_stmt_bind_param($stmt_test, "i", $pedido_id);
        mysqli_stmt_execute($stmt_test);
        $result_test = mysqli_stmt_get_result($stmt_test);
        $pedido_test = mysqli_fetch_assoc($result_test);
        mysqli_stmt_close($stmt_test);
        
        if ($pedido_test) {
            echo "Pedido existe sem verificação de permissão: " . $pedido_test['comprador_nome'] . "<br>";
        } else {
            echo "Pedido não existe na base de dados<br>";
        }
    }
} else {
    echo "Erro na consulta: " . mysqli_error($con) . "<br>";
}
?>
