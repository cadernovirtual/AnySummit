<?php
// Teste de sessão simples
session_start();

echo "<h2>🧪 Teste de Sessão Admin</h2>";

if ($_POST && isset($_POST['testar'])) {
    // Simular login bem-sucedido
    $_SESSION['admin_usuarioid'] = 1;
    $_SESSION['admin_nome'] = 'AnySummit';
    $_SESSION['admin_email'] = 'admin@anysummit.com.br';
    
    echo "<div style='background: #d4edda; padding: 15px; margin: 10px 0; border: 1px solid #c3e6cb;'>";
    echo "<h3>✅ Sessão Criada!</h3>";
    echo "<p>Sessão definida com sucesso. <a href='/admin/index.php'>Testar acesso ao dashboard</a></p>";
    echo "</div>";
} else if (isset($_SESSION['admin_usuarioid'])) {
    echo "<div style='background: #d1ecf1; padding: 15px; margin: 10px 0; border: 1px solid #bee5eb;'>";
    echo "<h3>ℹ️ Sessão Ativa</h3>";
    echo "<p><strong>ID:</strong> " . $_SESSION['admin_usuarioid'] . "</p>";
    echo "<p><strong>Nome:</strong> " . $_SESSION['admin_nome'] . "</p>";
    echo "<p><strong>Email:</strong> " . $_SESSION['admin_email'] . "</p>";
    echo "<p><a href='/admin/index.php'>Acessar Dashboard</a> | <a href='?limpar=1'>Limpar Sessão</a></p>";
    echo "</div>";
} else {
    echo "<div style='background: #f8d7da; padding: 15px; margin: 10px 0; border: 1px solid #f5c6cb;'>";
    echo "<h3>❌ Nenhuma Sessão Ativa</h3>";
    echo "</div>";
}

if (isset($_GET['limpar'])) {
    session_unset();
    session_destroy();
    echo "<script>location.reload();</script>";
}

echo "<hr>";
echo "<form method='POST'>";
echo "<button type='submit' name='testar' style='background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px;'>Simular Login</button>";
echo "</form>";

echo "<hr>";
echo "<p><strong>Session ID:</strong> " . session_id() . "</p>";
echo "<p><strong>Session Status:</strong> " . session_status() . "</p>";
echo "<p><strong>Todas as variáveis de sessão:</strong></p>";
echo "<pre>" . print_r($_SESSION, true) . "</pre>";
?>