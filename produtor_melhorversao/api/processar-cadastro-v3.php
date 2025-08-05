<?php
// API para processar cadastro completo - VERSÃO FINAL
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Iniciar sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Incluir arquivo de conexão
require_once '../conm/conn.php';

// Função para definir cookies sem expiração
function setCookieForever($name, $value) {
    $expire = time() + (10 * 365 * 24 * 60 * 60); // 10 anos
    setcookie($name, $value, $expire, "/", "", false, true);
}

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido', 'success' => false]);
    exit;
}

// Verificar se email foi verificado
if (!isset($_SESSION['email_verified']) || !$_SESSION['email_verified']) {
    error_log("ERRO: Email não verificado na sessão");
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Email não verificado. Por favor, verifique seu código primeiro.'
    ]);
    exit;
}

// Pegar dados do POST
$input = json_decode(file_get_contents('php://input'), true);

// Validar dados obrigatórios
$requiredFields = ['email', 'nome', 'celular', 'senha', 'tipoPessoa'];
foreach ($requiredFields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => "Campo $field é obrigatório"
        ]);
        exit;
    }
}

// Verificar se email verificado corresponde ao email do cadastro
if ($_SESSION['verified_email'] !== $input['email']) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Email não corresponde ao verificado'
    ]);
    exit;
}

// Extrair dados
$email = trim($input['email']);
$nome = trim($input['nome']);
$celular = trim($input['celular']);
$senha = $input['senha'];
$tipoPessoa = $input['tipoPessoa'];

// Dados específicos por tipo de pessoa
$cpf = null;
$cnpj = null;
$nomeFantasia = $nome; // Por padrão, usar o nome
$razaoSocial = null;

if ($tipoPessoa === 'fisica') {
    if (empty($input['cpf'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'CPF é obrigatório para pessoa física'
        ]);
        exit;
    }
    $cpf = preg_replace('/[^0-9]/', '', $input['cpf']);
} else {
    if (empty($input['nomeFantasia']) || empty($input['razaoSocial']) || empty($input['cnpj'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Nome fantasia, razão social e CNPJ são obrigatórios para pessoa jurídica'
        ]);
        exit;
    }
    $nomeFantasia = trim($input['nomeFantasia']);
    $razaoSocial = trim($input['razaoSocial']);
    $cnpj = preg_replace('/[^0-9]/', '', $input['cnpj']);
}

try {
    // Iniciar transação
    mysqli_autocommit($con, false);
    
    // Verificar se email já existe
    $sqlCheck = "SELECT id FROM usuarios WHERE email = ?";
    $stmtCheck = mysqli_prepare($con, $sqlCheck);
    mysqli_stmt_bind_param($stmtCheck, "s", $email);
    mysqli_stmt_execute($stmtCheck);
    mysqli_stmt_store_result($stmtCheck);
    
    if (mysqli_stmt_num_rows($stmtCheck) > 0) {
        mysqli_stmt_close($stmtCheck);
        throw new Exception('Este email já está cadastrado');
    }
    mysqli_stmt_close($stmtCheck);
    
    // Inserir contratante
    $sql = "INSERT INTO contratantes (
        nome_fantasia, razao_social, cnpj, cpf, email_contato, 
        telefone, ativo, criado_em, atualizado_em
    ) VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())";
    
    $stmt = mysqli_prepare($con, $sql);
    if (!$stmt) {
        throw new Exception('Erro ao preparar inserção de contratante: ' . mysqli_error($con));
    }
    
    mysqli_stmt_bind_param($stmt, "ssssss", 
        $nomeFantasia, $razaoSocial, $cnpj, $cpf, $email, $celular
    );
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception('Erro ao inserir contratante: ' . mysqli_stmt_error($stmt));
    }
    
    $contratanteId = mysqli_insert_id($con);
    mysqli_stmt_close($stmt);
    
    // Inserir usuário
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    
    // Verificar se a tabela tem o campo senha_hash ou senha
    $sqlUser = "INSERT INTO usuarios (
        contratante_id, nome, email, celular, senha, 
        nome_exibicao, ativo, criado_em, atualizado_em
    ) VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())";
    
    $stmtUser = mysqli_prepare($con, $sqlUser);
    if (!$stmtUser) {
        throw new Exception('Erro ao preparar inserção de usuário: ' . mysqli_error($con));
    }
    
    mysqli_stmt_bind_param($stmtUser, "isssss", 
        $contratanteId, $nome, $email, $celular, $senhaHash, $nome
    );
    
    if (!mysqli_stmt_execute($stmtUser)) {
        throw new Exception('Erro ao inserir usuário: ' . mysqli_stmt_error($stmtUser));
    }
    
    $usuarioId = mysqli_insert_id($con);
    mysqli_stmt_close($stmtUser);
    
    // Salvar log
    salvarLog($con, "CADASTRO_PRODUTOR", $contratanteId, 
        "Novo produtor cadastrado: $nome ($email)");
    
    // Marcar token como usado se existir na sessão
    if (isset($_SESSION['verification_token_id'])) {
        $tokenId = $_SESSION['verification_token_id'];
        $sqlUpdate = "UPDATE password_tokens SET used = 1 WHERE id = ?";
        $stmtUpdate = mysqli_prepare($con, $sqlUpdate);
        mysqli_stmt_bind_param($stmtUpdate, "i", $tokenId);
        mysqli_stmt_execute($stmtUpdate);
        mysqli_stmt_close($stmtUpdate);
    }
    
    // Confirmar transação
    mysqli_commit($con);
    
    // Limpar sessão de verificação
    unset($_SESSION['email_verified']);
    unset($_SESSION['verified_email']);
    unset($_SESSION['verification_token_id']);
    
    // Definir sessões de login
    $_SESSION['usuario_logado'] = true;
    $_SESSION['usuarioid'] = $usuarioId;
    $_SESSION['usuario_nome'] = $nome;
    $_SESSION['usuario_email'] = $email;
    $_SESSION['contratanteid'] = $contratanteId;
    
    // Definir cookies persistentes
    setCookieForever('usuario_logado', '1');
    setCookieForever('usuarioid', $usuarioId);
    setCookieForever('usuario_nome', $nome);
    setCookieForever('usuario_email', $email);
    setCookieForever('contratanteid', $contratanteId);
    
    echo json_encode([
        'success' => true,
        'message' => 'Cadastro realizado com sucesso',
        'usuarioId' => $usuarioId
    ]);
    
} catch (Exception $e) {
    mysqli_rollback($con);
    error_log("ERRO ao processar cadastro: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao criar conta: ' . $e->getMessage()
    ]);
} finally {
    mysqli_close($con);
}
?>