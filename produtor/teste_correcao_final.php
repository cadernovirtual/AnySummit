<?php
echo "=== TESTE CORREÇÃO BIND_PARAM ===<br>";

include("check_login.php");
include_once('conm/conn.php');

$usuario_id = $_SESSION['usuarioid'];

// Dados de teste
$nome_fantasia = "Teste Correção";
$logomarca = "";
$razao_social = "";
$cnpj = "";
$cpf = "123.456.789-00";
$email_contato = "teste@teste.com";
$telefone = "";
$endereco_completo = "";
$tipo_recebimento = "pix";
$chave_pix = "";
$banco = "";
$agencia = "";
$conta = "";
$titular_conta = "";
$ativo = 1;

echo "Testando query corrigida...<br>";

$sql = "INSERT INTO contratantes (
            nome_fantasia, logomarca, usuario_id, razao_social, cnpj, cpf, email_contato, 
            telefone, endereco_completo, tipo_recebimento, chave_pix, banco, agencia, 
            conta, titular_conta, ativo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

echo "SQL: OK<br>";

$stmt = mysqli_prepare($con, $sql);
if (!$stmt) {
    echo "❌ Erro preparar: " . mysqli_error($con) . "<br>";
    exit;
}
echo "Prepare: OK<br>";

$bind_result = mysqli_stmt_bind_param($stmt, "ssisssssssssssi", 
    $nome_fantasia, $logomarca, $usuario_id, $razao_social, $cnpj, $cpf, $email_contato, 
    $telefone, $endereco_completo, $tipo_recebimento, $chave_pix, $banco, $agencia, 
    $conta, $titular_conta, $ativo);

if (!$bind_result) {
    echo "❌ Erro bind: " . mysqli_error($con) . "<br>";
    exit;
}
echo "Bind: OK<br>";

$exec_result = mysqli_stmt_execute($stmt);
if (!$exec_result) {
    echo "❌ Erro execute: " . mysqli_error($con) . "<br>";
    echo "❌ Stmt error: " . mysqli_stmt_error($stmt) . "<br>";
    exit;
}

echo "✅ SUCESSO! ID inserido: " . mysqli_insert_id($con) . "<br>";
mysqli_stmt_close($stmt);

echo "<br>🎉 CORREÇÃO FUNCIONOU!<br>";
echo "<a href='organizadores.php'>Testar organizadores.php</a>";
?>
