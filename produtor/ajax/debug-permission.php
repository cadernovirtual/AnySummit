<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/html; charset=utf-8');

echo "<h2>🔍 Debug Específico - Pedido vs Permissões</h2>";

// Parâmetros recebidos
$pedido_id = $_GET['id'] ?? 0;
echo "<p><strong>Pedido ID recebido:</strong> {$pedido_id}</p>";

// Inclui os arquivos necessários
include("../check_login.php");
include("../conm/conn.php");

// Pegar dados do usuário logado
$contratante_id = $_COOKIE['contratanteid'] ?? 0;
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

echo "<p><strong>Contratante ID (cookie):</strong> {$contratante_id}</p>";
echo "<p><strong>Usuario ID (cookie):</strong> {$usuario_id}</p>";

// Primeiro: verificar se o pedido existe
echo "<h3>📋 1. Verificando se pedido existe</h3>";
$sql_existe = "SELECT p.*, e.id as evento_id, e.nome as evento_nome, e.contratante_id, e.usuario_id 
               FROM tb_pedidos p 
               LEFT JOIN eventos e ON p.eventoid = e.id 
               WHERE p.pedidoid = ?";

$stmt = mysqli_prepare($con, $sql_existe);
if ($stmt) {
    mysqli_stmt_bind_param($stmt, "i", $pedido_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $pedido_info = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);
    
    if ($pedido_info) {
        echo "✅ <strong>Pedido encontrado!</strong><br>";
        echo "- Código: {$pedido_info['codigo_pedido']}<br>";
        echo "- Evento ID: {$pedido_info['evento_id']}<br>";
        echo "- Evento Nome: {$pedido_info['evento_nome']}<br>";
        echo "- Evento Contratante ID: {$pedido_info['contratante_id']}<br>";
        echo "- Evento Usuario ID: {$pedido_info['usuario_id']}<br>";
        
        echo "<h3>🔐 2. Verificando Permissões</h3>";
        echo "<p><strong>Comparação:</strong></p>";
        echo "- Contratante logado: {$contratante_id} | Evento contratante: {$pedido_info['contratante_id']} ";
        if ($contratante_id == $pedido_info['contratante_id']) {
            echo "✅ <span style='color: green'>MATCH</span><br>";
        } else {
            echo "❌ <span style='color: red'>NÃO MATCH</span><br>";
        }
        
        echo "- Usuario logado: {$usuario_id} | Evento usuario: {$pedido_info['usuario_id']} ";
        if ($usuario_id == $pedido_info['usuario_id']) {
            echo "✅ <span style='color: green'>MATCH</span><br>";
        } else {
            echo "❌ <span style='color: red'>NÃO MATCH</span><br>";
        }
        
        // Teste da query original
        echo "<h3>🎯 3. Testando Query Original com Permissões</h3>";
        $sql_original = "SELECT p.*, 
                        c.nome as comprador_nome,
                        e.nome as evento_nome
                FROM tb_pedidos p
                LEFT JOIN compradores c ON p.compradorid = c.id
                LEFT JOIN eventos e ON p.eventoid = e.id
                WHERE p.pedidoid = ? AND e.contratante_id = ? AND e.usuario_id = ?";
                
        $stmt2 = mysqli_prepare($con, $sql_original);
        if ($stmt2) {
            mysqli_stmt_bind_param($stmt2, "iii", $pedido_id, $contratante_id, $usuario_id);
            mysqli_stmt_execute($stmt2);
            $result2 = mysqli_stmt_get_result($stmt2);
            $pedido_permissao = mysqli_fetch_assoc($result2);
            mysqli_stmt_close($stmt2);
            
            if ($pedido_permissao) {
                echo "✅ <strong style='color: green'>SUCESSO!</strong> Query com permissões retornou dados<br>";
                echo "- Comprador: {$pedido_permissao['comprador_nome']}<br>";
            } else {
                echo "❌ <strong style='color: red'>FALHOU!</strong> Query com permissões não retornou nada<br>";
                echo "<p>A verificação de permissão está bloqueando o acesso.</p>";
            }
        } else {
            echo "❌ Erro ao preparar query original: " . mysqli_error($con) . "<br>";
        }
        
    } else {
        echo "❌ <strong>Pedido NÃO encontrado na base de dados!</strong><br>";
    }
} else {
    echo "❌ Erro ao preparar query: " . mysqli_error($con) . "<br>";
}

echo "<hr>";
echo "<p><em>Debug concluído. Use essas informações para identificar o problema específico.</em></p>";
?>
