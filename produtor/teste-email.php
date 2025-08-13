<?php
/**
 * Teste simples de envio de email
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

$email_teste = "gustavo@cadernovirtual.com.br"; // Substitua pelo seu email para teste

// Teste 1: Email mais simples possível
echo "Teste 1 - Email simples...\n";
$resultado1 = mail($email_teste, "Teste AnySummit", "Este é um teste simples.");
echo "Resultado: " . ($resultado1 ? "SUCESSO" : "FALHA") . "\n\n";

// Teste 2: Email com headers básicos
echo "Teste 2 - Email com headers...\n";
$headers = "From: teste@anysummit.com.br\r\nContent-Type: text/plain; charset=UTF-8\r\n";
$resultado2 = mail($email_teste, "Teste AnySummit 2", "Este é um teste com headers.", $headers);
echo "Resultado: " . ($resultado2 ? "SUCESSO" : "FALHA") . "\n\n";

// Teste 3: Email HTML
echo "Teste 3 - Email HTML...\n";
$headers_html = "From: teste@anysummit.com.br\r\nContent-Type: text/html; charset=UTF-8\r\n";
$corpo_html = "<html><body><h1>Teste HTML</h1><p>Este é um teste em HTML.</p></body></html>";
$resultado3 = mail($email_teste, "Teste AnySummit HTML", $corpo_html, $headers_html);
echo "Resultado: " . ($resultado3 ? "SUCESSO" : "FALHA") . "\n\n";

// Informações do servidor
echo "Informações do servidor:\n";
echo "PHP Version: " . phpversion() . "\n";
echo "Mail settings:\n";
echo "sendmail_path: " . ini_get('sendmail_path') . "\n";
echo "SMTP: " . ini_get('SMTP') . "\n";
echo "smtp_port: " . ini_get('smtp_port') . "\n";

// Verificar últimos erros
$last_error = error_get_last();
if ($last_error) {
    echo "\nÚltimo erro PHP:\n";
    print_r($last_error);
}
?>