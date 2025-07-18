<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include("../conm/conn.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

// Log para debug
error_log('Login attempt - Input: ' . print_r($input, true));

if (!$input) {
    error_log('Login failed - Invalid JSON input');
    echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
    exit;
}

$email = trim($input['email'] ?? '');
$senha = trim($input['senha'] ?? '');

if (empty($email) || empty($senha)) {
    echo json_encode(['success' => false, 'message' => 'E-mail e senha são obrigatórios']);
    exit;
}

// Buscar participante no banco de dados
$email = mysqli_real_escape_string($con, $email);
$sql = "SELECT participanteid, Nome, email, senha FROM participantes WHERE email = '$email'";
error_log('Login SQL: ' . $sql);
$result = $con->query($sql);

if ($result->num_rows === 0) {
    error_log('Login failed - Email not found: ' . $email);
    echo json_encode(['success' => false, 'message' => 'E-mail não encontrado']);
    exit;
}

$participante = $result->fetch_assoc();
error_log('Found participant: ' . print_r($participante, true));

// Verificar senha (pode estar criptografada, MD5 ou em texto simples)
$senhaValida = false;
$metodoUsado = '';

// Log da senha recebida e hash do banco
error_log('Senha recebida: ' . $senha);
error_log('Hash no banco: ' . $participante['senha']);
error_log('MD5 da senha recebida: ' . md5($senha));

// Primeiro tentar com password_verify (se estiver criptografada com password_hash)
if (password_verify($senha, $participante['senha'])) {
    $senhaValida = true;
    $metodoUsado = 'password_verify';
} 
// Se não funcionou, tentar MD5 (formato antigo)
else if (md5($senha) === $participante['senha']) {
    $senhaValida = true;
    $metodoUsado = 'md5';
}
// Se não funcionou, tentar comparação direta (senha em texto simples)
else if ($senha === $participante['senha']) {
    $senhaValida = true;
    $metodoUsado = 'texto_simples';
}

error_log('Senha válida: ' . ($senhaValida ? 'SIM' : 'NÃO') . ' - Método: ' . $metodoUsado);

if ($senhaValida) {
    // Login bem-sucedido
    setcookie('participanteid', $participante['participanteid'], time() + (86400 * 30), '/'); // 30 dias
    setcookie('participantenome', $participante['Nome'], time() + (86400 * 30), '/'); // 30 dias
    
    // Atualizar último login
    $update_sql = "UPDATE participantes SET ultimologin = NOW() WHERE participanteid = " . $participante['participanteid'];
    $con->query($update_sql);
    
    echo json_encode([
        'success' => true,
        'message' => 'Login realizado com sucesso',
        'metodo' => $metodoUsado,
        'participante' => [
            'id' => $participante['participanteid'],
            'nome' => $participante['Nome'],
            'email' => $participante['email']
        ]
    ]);
} else {
    echo json_encode([
        'success' => false, 
        'message' => 'Senha incorreta',
        'debug' => [
            'senha_recebida' => $senha,
            'hash_banco' => $participante['senha'],
            'md5_senha' => md5($senha),
            'comparacao_md5' => (md5($senha) === $participante['senha']),
            'comparacao_direta' => ($senha === $participante['senha'])
        ]
    ]);
}
?>