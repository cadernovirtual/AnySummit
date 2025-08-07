<?php
// Script de diagnóstico de login admin
// Acesse via: http://anysummit.com.br/admin/diagnostico.php

$host = "anysummit.com.br";
$username = "anysummit_user";
$password = "Miran@Janyne@Gustavo";
$database = "anysummit_db";

$con = new mysqli($host, $username, $password, $database);

if ($con->connect_error) {
    die("Erro de conexão: " . $con->connect_error);
}

$email = 'admin@anysummit.com.br';
$senha_teste = '230572gu@';

echo "<h2>🔍 Diagnóstico de Login Admin</h2>";

// 1. Verificar se usuário existe
$stmt = $con->prepare("SELECT id, nome, email, senha_hash, perfil, ativo FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $usuario = $result->fetch_assoc();
    
    echo "<div style='background: #e6f3ff; padding: 15px; margin: 10px 0; border: 1px solid #b3d9ff;'>";
    echo "<h3>✅ Usuário Encontrado</h3>";
    echo "<p><strong>ID:</strong> " . $usuario['id'] . "</p>";
    echo "<p><strong>Nome:</strong> " . htmlspecialchars($usuario['nome']) . "</p>";
    echo "<p><strong>Email:</strong> " . htmlspecialchars($usuario['email']) . "</p>";
    echo "<p><strong>Perfil:</strong> " . htmlspecialchars($usuario['perfil']) . "</p>";
    echo "<p><strong>Ativo:</strong> " . ($usuario['ativo'] ? 'Sim' : 'Não') . "</p>";
    echo "<p><strong>Hash:</strong> " . htmlspecialchars($usuario['senha_hash']) . "</p>";
    echo "</div>";
    
    // 2. Testar password_verify
    echo "<div style='background: #fff3cd; padding: 15px; margin: 10px 0; border: 1px solid #ffeaa7;'>";
    echo "<h3>🔐 Teste de Verificação de Senha</h3>";
    echo "<p><strong>Senha testada:</strong> " . htmlspecialchars($senha_teste) . "</p>";
    
    if (password_verify($senha_teste, $usuario['senha_hash'])) {
        echo "<p style='color: green; font-size: 18px;'><strong>✅ SENHA CORRETA!</strong></p>";
        echo "<p>A senha está funcionando. O problema pode estar no código de login.</p>";
    } else {
        echo "<p style='color: red; font-size: 18px;'><strong>❌ SENHA INCORRETA!</strong></p>";
        echo "<p>O hash não confere com a senha. Vou corrigir agora:</p>";
        
        // Gerar hash correto
        $hash_correto = password_hash($senha_teste, PASSWORD_DEFAULT);
        
        echo "<p><strong>Novo hash gerado:</strong> " . htmlspecialchars($hash_correto) . "</p>";
        
        // Atualizar no banco
        $stmt_update = $con->prepare("UPDATE usuarios SET senha_hash = ? WHERE email = ?");
        $stmt_update->bind_param("ss", $hash_correto, $email);
        
        if ($stmt_update->execute()) {
            echo "<p style='color: green;'><strong>✅ Hash atualizado no banco!</strong></p>";
            echo "<p>Agora teste novamente a página:</p>";
            
            // Verificar se o novo hash funciona
            if (password_verify($senha_teste, $hash_correto)) {
                echo "<p style='color: green;'><strong>✅ NOVO HASH VERIFICADO! Login funcionará agora.</strong></p>";
            } else {
                echo "<p style='color: red;'><strong>❌ Problema com novo hash!</strong></p>";
            }
        } else {
            echo "<p style='color: red;'>❌ Erro ao atualizar hash: " . $con->error . "</p>";
        }
        
        $stmt_update->close();
    }
    echo "</div>";
    
    // 3. Testar consulta do login.php
    echo "<div style='background: #f8f9fa; padding: 15px; margin: 10px 0; border: 1px solid #dee2e6;'>";
    echo "<h3>🔍 Teste da Query do Login</h3>";
    
    $stmt_login = $con->prepare("SELECT id, nome, email, senha_hash, perfil FROM usuarios WHERE email = ? AND perfil = 'admin' AND ativo = 1");
    $stmt_login->bind_param("s", $email);
    $stmt_login->execute();
    $result_login = $stmt_login->get_result();
    
    if ($result_login->num_rows > 0) {
        echo "<p style='color: green;'><strong>✅ Query do login.php encontrou o usuário!</strong></p>";
        $usuario_login = $result_login->fetch_assoc();
        
        if (password_verify($senha_teste, $usuario_login['senha_hash'])) {
            echo "<p style='color: green;'><strong>✅ AUTENTICAÇÃO COMPLETA OK!</strong></p>";
            echo "<p><strong>O problema pode estar em:</strong></p>";
            echo "<ul>";
            echo "<li>Caracteres especiais na senha</li>";
            echo "<li>Encoding/charset do formulário</li>";
            echo "<li>Espaços extras nos campos</li>";
            echo "<li>JavaScript interferindo</li>";
            echo "</ul>";
        } else {
            echo "<p style='color: red;'><strong>❌ Senha ainda incorreta na query do login</strong></p>";
        }
    } else {
        echo "<p style='color: red;'><strong>❌ Query do login.php NÃO encontrou o usuário!</strong></p>";
        echo "<p>Verifique se o usuário tem perfil='admin' e ativo=1</p>";
    }
    
    $stmt_login->close();
    echo "</div>";
    
} else {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 15px; border: 1px solid #f5c6cb;'>";
    echo "<h3>❌ Usuário Não Encontrado!</h3>";
    echo "<p>O email " . htmlspecialchars($email) . " não existe na tabela usuarios.</p>";
    echo "</div>";
}

$stmt->close();
$con->close();

echo "<hr>";
echo "<p><a href='/admin/login.php' style='background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>🔙 Voltar ao Login</a></p>";
?>