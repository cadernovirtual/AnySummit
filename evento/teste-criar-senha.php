<?php
/**
 * Teste da Criação de Senha
 * Acesse: /evento/teste-criar-senha.php?email=contato@webtoyou.com.br
 */

include("conm/conn.php");

$email_teste = $_GET['email'] ?? '';

if (empty($email_teste) || !filter_var($email_teste, FILTER_VALIDATE_EMAIL)) {
    echo "❌ Uso: teste-criar-senha.php?email=seuemail@gmail.com<br>";
    exit;
}

echo "<h2>🔐 Teste de Criação de Senha</h2>";
echo "<p>Email: <strong>$email_teste</strong></p>";

// Verificar se existe comprador com este email
$email_escaped = mysqli_real_escape_string($con, $email_teste);
$check_comprador = "SELECT id, nome, email, senha, senha_criada_em FROM compradores WHERE email = '$email_escaped'";
$result_comprador = $con->query($check_comprador);

if ($result_comprador && $result_comprador->num_rows > 0) {
    $comprador = $result_comprador->fetch_assoc();
    
    echo "<div style='background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 15px 0;'>";
    echo "<h3>👤 Comprador Encontrado:</h3>";
    echo "<p><strong>ID:</strong> {$comprador['id']}</p>";
    echo "<p><strong>Nome:</strong> {$comprador['nome']}</p>";
    echo "<p><strong>Email:</strong> {$comprador['email']}</p>";
    echo "<p><strong>Tem senha:</strong> " . (!empty($comprador['senha']) ? '✅ Sim' : '❌ Não') . "</p>";
    if (!empty($comprador['senha_criada_em'])) {
        echo "<p><strong>Senha criada em:</strong> {$comprador['senha_criada_em']}</p>";
    }
    echo "</div>";
    
    // Verificar tokens para este email
    $check_tokens = "SELECT token, expires_at, used, created_at FROM password_tokens WHERE email = '$email_escaped' ORDER BY created_at DESC";
    $result_tokens = $con->query($check_tokens);
    
    if ($result_tokens && $result_tokens->num_rows > 0) {
        echo "<h3>🔑 Tokens de Senha:</h3>";
        echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
        echo "<tr><th>Token (parcial)</th><th>Expira em</th><th>Usado?</th><th>Criado em</th><th>Status</th></tr>";
        
        while ($token = $result_tokens->fetch_assoc()) {
            $token_parcial = substr($token['token'], 0, 10) . '...';
            $usado = $token['used'] ? '✅ Usado' : '❌ Não usado';
            $expirado = strtotime($token['expires_at']) < time() ? '⏰ Expirado' : '✅ Válido';
            $link_teste = '';
            
            if (!$token['used'] && strtotime($token['expires_at']) > time()) {
                $link_teste = "<a href='/evento/criar-senha.php?token={$token['token']}' target='_blank'>🔗 Testar</a>";
            }
            
            echo "<tr>";
            echo "<td>$token_parcial</td>";
            echo "<td>{$token['expires_at']}</td>";
            echo "<td>$usado</td>";
            echo "<td>{$token['created_at']}</td>";
            echo "<td>$expirado $link_teste</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>❌ Nenhum token encontrado para este email.</p>";
    }
    
    // Gerar novo token para teste
    echo "<hr><h3>🧪 Gerar Novo Token de Teste:</h3>";
    
    if (isset($_GET['gerar_token'])) {
        $novo_token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        $insert_token = "INSERT INTO password_tokens (email, token, expires_at) 
                         VALUES ('$email_escaped', '$novo_token', '$expires')";
        
        if ($con->query($insert_token)) {
            echo "<div style='background: #d4f6d4; padding: 15px; border-radius: 8px;'>";
            echo "<p>✅ Novo token criado com sucesso!</p>";
            echo "<p><strong>Link de teste:</strong></p>";
            echo "<p><a href='/evento/criar-senha.php?token=$novo_token' target='_blank' style='background: #e91e63; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;'>🔐 Testar Criação de Senha</a></p>";
            echo "</div>";
        } else {
            echo "<p style='color: red;'>❌ Erro ao criar token: " . $con->error . "</p>";
        }
    } else {
        echo "<p><a href='?email=$email_teste&gerar_token=1' style='background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;'>🔑 Gerar Token de Teste</a></p>";
    }
    
} else {
    echo "<div style='background: #fdd; padding: 15px; border-radius: 8px;'>";
    echo "<p>❌ Nenhum comprador encontrado com o email: $email_teste</p>";
    echo "<p>💡 Faça um cadastro no checkout primeiro.</p>";
    echo "</div>";
}

echo "<hr>";
echo "<h3>📋 Como Testar:</h3>";
echo "<ol>";
echo "<li>Verifique se o comprador existe</li>";
echo "<li>Se não tiver token, clique em 'Gerar Token de Teste'</li>";
echo "<li>Use o link gerado para testar a criação de senha</li>";
echo "<li>Volte aqui para verificar se a senha foi salva</li>";
echo "</ol>";

echo "<p><a href='/evento/debug-email-cadastro.php'>🔙 Voltar ao Debug Principal</a></p>";
?>