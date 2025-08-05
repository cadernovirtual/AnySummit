<?php
// Teste de sessão PHP
session_start();

header('Content-Type: text/html; charset=UTF-8');

// Gerar ou recuperar ID único
if (!isset($_SESSION['test_id'])) {
    $_SESSION['test_id'] = uniqid();
    $_SESSION['test_time'] = time();
}

$session_id = session_id();
$test_id = $_SESSION['test_id'];
$test_time = $_SESSION['test_time'];
$elapsed = time() - $test_time;

// Testar cookies
$cookie_test = isset($_COOKIE['PHPSESSID']) ? $_COOKIE['PHPSESSID'] : 'não encontrado';

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Teste de Sessão PHP</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .success {
            color: #28a745;
        }
        .error {
            color: #dc3545;
        }
        pre {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
        }
        button:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <h1>Teste de Sessão PHP - AnySummit</h1>
    
    <div class="box">
        <h2>Informações da Sessão</h2>
        <p><strong>Session ID:</strong> <?php echo $session_id; ?></p>
        <p><strong>Test ID:</strong> <?php echo $test_id; ?></p>
        <p><strong>Tempo decorrido:</strong> <?php echo $elapsed; ?> segundos</p>
        <p><strong>Cookie PHPSESSID:</strong> <?php echo $cookie_test; ?></p>
        <p><strong>Session Save Path:</strong> <?php echo ini_get('session.save_path') ?: 'padrão do sistema'; ?></p>
        <p><strong>Session Name:</strong> <?php echo session_name(); ?></p>
    </div>
    
    <div class="box">
        <h2>Dados na Sessão</h2>
        <pre><?php print_r($_SESSION); ?></pre>
    </div>
    
    <div class="box">
        <h2>Configurações PHP</h2>
        <p><strong>session.cookie_lifetime:</strong> <?php echo ini_get('session.cookie_lifetime'); ?></p>
        <p><strong>session.gc_maxlifetime:</strong> <?php echo ini_get('session.gc_maxlifetime'); ?></p>
        <p><strong>session.cookie_domain:</strong> <?php echo ini_get('session.cookie_domain') ?: 'não definido'; ?></p>
        <p><strong>session.cookie_path:</strong> <?php echo ini_get('session.cookie_path'); ?></p>
    </div>
    
    <div class="box">
        <h2>Teste de Persistência</h2>
        <p>Se você recarregar esta página, o Test ID deve permanecer o mesmo.</p>
        <button onclick="location.reload()">Recarregar Página</button>
        <button onclick="testAjax()">Testar AJAX</button>
        <div id="ajaxResult"></div>
    </div>
    
    <script>
        function testAjax() {
            fetch('teste-sessao-ajax.php', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({test: 'ajax'})
            })
            .then(r => r.json())
            .then(data => {
                document.getElementById('ajaxResult').innerHTML = 
                    '<p style="margin-top:10px;"><strong>Resposta AJAX:</strong><br>' + 
                    '<pre>' + JSON.stringify(data, null, 2) + '</pre></p>';
            })
            .catch(err => {
                document.getElementById('ajaxResult').innerHTML = 
                    '<p class="error">Erro: ' + err + '</p>';
            });
        }
    </script>
</body>
</html>