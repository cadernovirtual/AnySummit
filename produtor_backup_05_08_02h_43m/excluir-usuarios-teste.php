<?php
// Script para excluir usuários de teste
header('Content-Type: text/html; charset=UTF-8');

// Incluir arquivo de conexão
require_once 'conm/conn.php';

echo "<h1>Exclusão de Usuários de Teste</h1>";

// Emails para excluir
$emails = ['gustavo@cadernovirtual.com.br', 'gustavocibim@gmail.com'];

foreach ($emails as $email) {
    echo "<h2>Processando: $email</h2>";
    
    // Buscar usuário
    $sql = "SELECT id, contratante_id, nome FROM usuarios WHERE email = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($user = mysqli_fetch_assoc($result)) {
        echo "<p>Usuário encontrado: ID {$user['id']}, Nome: {$user['nome']}, Contratante ID: {$user['contratante_id']}</p>";
        
        $userId = $user['id'];
        $contratanteId = $user['contratante_id'];
        
        // Iniciar transação
        mysqli_begin_transaction($con);
        
        try {
            // 1. Excluir logs
            $sql = "DELETE FROM tb_logcli WHERE contratanteid = ?";
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "i", $contratanteId);
            mysqli_stmt_execute($stmt);
            $logsDeleted = mysqli_affected_rows($con);
            echo "<p>✅ Logs excluídos: $logsDeleted</p>";
            
            // 2. Excluir tokens
            $sql = "DELETE FROM password_tokens WHERE email = ?";
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "s", $email);
            mysqli_stmt_execute($stmt);
            $tokensDeleted = mysqli_affected_rows($con);
            echo "<p>✅ Tokens excluídos: $tokensDeleted</p>";
            
            // 3. Excluir usuário
            $sql = "DELETE FROM usuarios WHERE id = ?";
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "i", $userId);
            mysqli_stmt_execute($stmt);
            echo "<p>✅ Usuário excluído</p>";
            
            // 4. Excluir contratante
            $sql = "DELETE FROM contratantes WHERE id = ?";
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "i", $contratanteId);
            mysqli_stmt_execute($stmt);
            echo "<p>✅ Contratante excluído</p>";
            
            // Confirmar transação
            mysqli_commit($con);
            echo "<p style='color: green;'><strong>✅ Exclusão completa realizada com sucesso!</strong></p>";
            
        } catch (Exception $e) {
            mysqli_rollback($con);
            echo "<p style='color: red;'>❌ Erro ao excluir: " . $e->getMessage() . "</p>";
        }
        
    } else {
        echo "<p style='color: orange;'>⚠️ Usuário não encontrado no banco de dados.</p>";
    }
    
    echo "<hr>";
}

mysqli_close($con);

echo "<h2>Processo concluído!</h2>";
echo "<p><a href='novo-cadastro.php'>Ir para página de cadastro</a></p>";
?>

<style>
    body {
        font-family: Arial, sans-serif;
        max-width: 800px;
        margin: 50px auto;
        padding: 20px;
        background: #f5f5f5;
    }
    h1 {
        color: #333;
        border-bottom: 2px solid #007bff;
        padding-bottom: 10px;
    }
    h2 {
        color: #555;
        margin-top: 30px;
    }
    p {
        line-height: 1.6;
    }
    hr {
        margin: 30px 0;
        border: none;
        border-top: 1px solid #ddd;
    }
    a {
        display: inline-block;
        margin-top: 20px;
        padding: 10px 20px;
        background: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 5px;
    }
    a:hover {
        background: #0056b3;
    }
</style>