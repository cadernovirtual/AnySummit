<?php
// API para verificar código usando banco de dados
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Incluir arquivo de conexão
require_once '../conm/conn.php';

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido', 'success' => false]);
    exit;
}

// Pegar dados do POST
$input = json_decode(file_get_contents('php://input'), true);
$email = isset($input['email']) ? trim($input['email']) : '';
$codigo = isset($input['codigo']) ? trim($input['codigo']) : '';

// Validar dados
if (empty($email) || empty($codigo)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Email e código são obrigatórios'
    ]);
    exit;
}

try {
    // Buscar código no banco
    $sql = "SELECT id, email, token, expires_at, used 
            FROM password_tokens 
            WHERE email = ? AND token = ? AND used = 0 
            ORDER BY created_at DESC 
            LIMIT 1";
    
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ss", $email, $codigo);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($row = mysqli_fetch_assoc($result)) {
        // Verificar se expirou
        $expires_at = strtotime($row['expires_at']);
        if (time() > $expires_at) {
            // Marcar como usado
            $updateSql = "UPDATE password_tokens SET used = 1 WHERE id = ?";
            $updateStmt = mysqli_prepare($con, $updateSql);
            mysqli_stmt_bind_param($updateStmt, "i", $row['id']);
            mysqli_stmt_execute($updateStmt);
            mysqli_stmt_close($updateStmt);
            
            echo json_encode([
                'success' => false,
                'message' => 'Código expirado. Solicite um novo código.'
            ]);
        } else {
            // Código válido - NÃO marcar como usado ainda
            // Vamos marcar apenas após o cadastro completo
            
            // Iniciar sessão se não estiver iniciada
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            
            // Salvar na sessão para o próximo passo
            $_SESSION['email_verified'] = true;
            $_SESSION['verified_email'] = $email;
            $_SESSION['verification_token_id'] = $row['id'];
            
            echo json_encode([
                'success' => true,
                'message' => 'Email verificado com sucesso',
                'debug' => [
                    'session_id' => session_id(),
                    'tempo_restante' => $expires_at - time()
                ]
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Código inválido. Tente novamente.'
        ]);
    }
    
    mysqli_stmt_close($stmt);
    
} catch (Exception $e) {
    error_log("Erro ao verificar código: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao verificar código. Tente novamente.',
        'debug' => [
            'error' => $e->getMessage()
        ]
    ]);
} finally {
    mysqli_close($con);
}
?>