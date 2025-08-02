<?php
// Script para verificar e criar tabela password_tokens se necessário
header('Content-Type: text/html; charset=UTF-8');

// Incluir arquivo de conexão
require_once 'conm/conn.php';

echo "<h1>Verificação da Tabela password_tokens</h1>";

// Verificar se a tabela existe
$sql = "SHOW TABLES LIKE 'password_tokens'";
$result = mysqli_query($con, $sql);

if (mysqli_num_rows($result) > 0) {
    echo "<p style='color: green;'>✅ Tabela password_tokens existe!</p>";
    
    // Mostrar estrutura da tabela
    echo "<h2>Estrutura da tabela:</h2>";
    $sql = "DESCRIBE password_tokens";
    $result = mysqli_query($con, $sql);
    
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    
    while ($row = mysqli_fetch_assoc($result)) {
        echo "<tr>";
        foreach ($row as $value) {
            echo "<td>" . htmlspecialchars($value) . "</td>";
        }
        echo "</tr>";
    }
    echo "</table>";
    
} else {
    echo "<p style='color: red;'>❌ Tabela password_tokens NÃO existe!</p>";
    echo "<p>Criando tabela...</p>";
    
    // Criar tabela
    $createTableSQL = "
    CREATE TABLE password_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        used TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_token (token),
        INDEX idx_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if (mysqli_query($con, $createTableSQL)) {
        echo "<p style='color: green;'>✅ Tabela criada com sucesso!</p>";
    } else {
        echo "<p style='color: red;'>❌ Erro ao criar tabela: " . mysqli_error($con) . "</p>";
    }
}

// Testar inserção
echo "<h2>Teste de Inserção</h2>";

$testEmail = "teste@example.com";
$testCode = "123456";
$expires = date('Y-m-d H:i:s', time() + 600);

// Limpar teste anterior
mysqli_query($con, "DELETE FROM password_tokens WHERE email = '$testEmail'");

$sql = "INSERT INTO password_tokens (email, token, expires_at, used) VALUES (?, ?, ?, 0)";
$stmt = mysqli_prepare($con, $sql);

if ($stmt) {
    mysqli_stmt_bind_param($stmt, "sss", $testEmail, $testCode, $expires);
    
    if (mysqli_stmt_execute($stmt)) {
        echo "<p style='color: green;'>✅ Inserção de teste bem-sucedida!</p>";
        
        // Verificar se foi inserido
        $checkSql = "SELECT * FROM password_tokens WHERE email = '$testEmail'";
        $result = mysqli_query($con, $checkSql);
        
        if ($row = mysqli_fetch_assoc($result)) {
            echo "<p>Dados inseridos:</p>";
            echo "<pre>" . print_r($row, true) . "</pre>";
            
            // Limpar teste
            mysqli_query($con, "DELETE FROM password_tokens WHERE email = '$testEmail'");
            echo "<p>Teste limpo.</p>";
        }
    } else {
        echo "<p style='color: red;'>❌ Erro na inserção: " . mysqli_stmt_error($stmt) . "</p>";
    }
    
    mysqli_stmt_close($stmt);
} else {
    echo "<p style='color: red;'>❌ Erro ao preparar statement: " . mysqli_error($con) . "</p>";
}

// Verificar configuração do PHP
echo "<h2>Configuração PHP</h2>";
echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";
echo "<p><strong>Error Reporting:</strong> " . error_reporting() . "</p>";
echo "<p><strong>Display Errors:</strong> " . ini_get('display_errors') . "</p>";
echo "<p><strong>Log Errors:</strong> " . ini_get('log_errors') . "</p>";
echo "<p><strong>Error Log:</strong> " . ini_get('error_log') . "</p>";

mysqli_close($con);
?>

<style>
    body {
        font-family: Arial, sans-serif;
        max-width: 800px;
        margin: 50px auto;
        padding: 20px;
        background: #f5f5f5;
    }
    h1, h2 {
        color: #333;
    }
    table {
        background: white;
        margin: 20px 0;
        border-collapse: collapse;
    }
    th {
        background: #007bff;
        color: white;
    }
    pre {
        background: #f8f9fa;
        padding: 10px;
        border-radius: 4px;
        overflow-x: auto;
    }
</style>