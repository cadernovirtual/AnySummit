<?php
/**
 * Teste Específico Locaweb - Múltiplas Configurações
 * Acesse: /evento/teste-locaweb.php?email=seuemail@gmail.com
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

$email_teste = $_GET['email'] ?? '';
if (empty($email_teste) || !filter_var($email_teste, FILTER_VALIDATE_EMAIL)) {
    echo "❌ Uso: teste-locaweb.php?email=seuemail@gmail.com<br>";
    exit;
}

echo "<h2>🧪 Teste Locaweb - Múltiplas Configurações</h2>";
echo "<p>Email de teste: <strong>$email_teste</strong></p>";

// Configurações diferentes para testar
$configuracoes = [
    'SSL_465' => [
        'host' => 'email-ssl.com.br',
        'port' => 465,
        'ssl' => true,
        'descricao' => 'SSL Direto - Porta 465'
    ],
    'TLS_587' => [
        'host' => 'email-ssl.com.br', 
        'port' => 587,
        'ssl' => false,
        'descricao' => 'STARTTLS - Porta 587'
    ],
    'SMTP_SIMPLES' => [
        'host' => 'smtp.anysummit.com.br',
        'port' => 587,
        'ssl' => false,
        'descricao' => 'SMTP Simples'
    ]
];

$credenciais = [
    'user' => 'noreply@anysummit.com.br',
    'pass' => 'Swko15357523@#',
    'from_email' => 'noreply@anysummit.com.br',
    'from_name' => 'Any Summit Teste'
];

foreach ($configuracoes as $nome => $config) {
    echo "<hr><h3>📡 Testando: {$config['descricao']}</h3>";
    
    $sucesso = testarConfiguracao($config, $credenciais, $email_teste);
    
    if ($sucesso) {
        echo "<div style='color: green; font-weight: bold;'>✅ FUNCIONOU! Use esta configuração.</div>";
        break; // Para no primeiro que funcionar
    } else {
        echo "<div style='color: red;'>❌ Esta configuração falhou.</div>";
    }
}

function testarConfiguracao($config, $cred, $email_teste) {
    echo "<p>🔌 Conectando em {$config['host']}:{$config['port']}...</p>";
    
    try {
        // Conectar
        if ($config['ssl']) {
            $context = stream_context_create([
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                ]
            ]);
            $socket = stream_socket_client(
                "ssl://{$config['host']}:{$config['port']}", 
                $errno, $errstr, 10, STREAM_CLIENT_CONNECT, $context
            );
        } else {
            $socket = fsockopen($config['host'], $config['port'], $errno, $errstr, 10);
        }
        
        if (!$socket) {
            echo "<p style='color: red;'>❌ Erro de conexão: $errstr ($errno)</p>";
            return false;
        }
        
        echo "<p style='color: green;'>✅ Conectado!</p>";
        
        // Função para ler resposta
        $lerResposta = function($esperado = null) use ($socket) {
            $resposta = '';
            do {
                $linha = fgets($socket, 512);
                $resposta .= $linha;
                echo "<small>📨 " . trim($linha) . "</small><br>";
                
                if (preg_match('/^\d{3} /', $linha)) {
                    break;
                }
            } while (!feof($socket));
            
            if ($esperado && strpos($resposta, $esperado) === false) {
                echo "<p style='color: red;'>❌ Esperado '$esperado', recebido: $resposta</p>";
                return false;
            }
            return $resposta;
        };
        
        // Processo SMTP
        $lerResposta('220'); // Banner inicial
        
        fputs($socket, "EHLO anysummit.com.br\r\n");
        $ehlo_response = $lerResposta('250');
        
        // Se não é SSL direto, tentar STARTTLS
        if (!$config['ssl'] && strpos($ehlo_response, 'STARTTLS') !== false) {
            echo "<p>🔐 Iniciando STARTTLS...</p>";
            fputs($socket, "STARTTLS\r\n");
            $lerResposta('220');
            
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                echo "<p style='color: red;'>❌ Falha ao habilitar TLS</p>";
                fclose($socket);
                return false;
            }
            
            // Novo EHLO após TLS
            fputs($socket, "EHLO anysummit.com.br\r\n");
            $lerResposta('250');
        }
        
        // Autenticação
        echo "<p>🔐 Autenticando...</p>";
        fputs($socket, "AUTH LOGIN\r\n");
        $lerResposta('334');
        
        fputs($socket, base64_encode($cred['user']) . "\r\n");
        $lerResposta('334');
        
        fputs($socket, base64_encode($cred['pass']) . "\r\n");
        $auth_resp = $lerResposta('235');
        
        if (strpos($auth_resp, '235') === false) {
            echo "<p style='color: red;'>❌ Falha na autenticação</p>";
            fclose($socket);
            return false;
        }
        
        echo "<p style='color: green;'>✅ Autenticado com sucesso!</p>";
        
        // Enviar email de teste
        echo "<p>📧 Enviando email...</p>";
        
        fputs($socket, "MAIL FROM: <{$cred['from_email']}>\r\n");
        $lerResposta('250');
        
        fputs($socket, "RCPT TO: <$email_teste>\r\n");
        $lerResposta('250');
        
        fputs($socket, "DATA\r\n");
        $lerResposta('354');
        
        $conteudo = "Subject: =?UTF-8?B?" . base64_encode("✅ Teste Locaweb - " . $config['descricao']) . "?=\r\n";
        $conteudo .= "From: {$cred['from_name']} <{$cred['from_email']}>\r\n";
        $conteudo .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
        $conteudo .= "<h2>✅ Teste bem-sucedido!</h2>";
        $conteudo .= "<p><strong>Configuração:</strong> {$config['descricao']}</p>";
        $conteudo .= "<p><strong>Host:</strong> {$config['host']}:{$config['port']}</p>";
        $conteudo .= "<p><strong>Data:</strong> " . date('d/m/Y H:i:s') . "</p>";
        $conteudo .= "<p>Esta configuração está funcionando corretamente!</p>";
        
        fputs($socket, $conteudo . "\r\n.\r\n");
        $lerResposta('250');
        
        fputs($socket, "QUIT\r\n");
        fclose($socket);
        
        echo "<p style='color: green; font-weight: bold;'>🎉 Email enviado com sucesso!</p>";
        return true;
        
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ Erro: " . $e->getMessage() . "</p>";
        if (isset($socket) && is_resource($socket)) {
            fclose($socket);
        }
        return false;
    }
}

echo "<hr><p><a href='/evento/teste-email.php'>🔙 Voltar ao teste principal</a></p>";
?>