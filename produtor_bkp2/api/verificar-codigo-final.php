<?php
// API para verificar código - VERSÃO FINAL (usa banco de dados)
error_reporting(0);
ini_set('display_errors', 0);

// Limpar buffer
if (ob_get_level()) ob_clean();

// Headers
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Incluir conexão
require_once '../conm/conn.php';

// Iniciar sessão
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Resposta padrão
$response = ['success' => false, 'message' => ''];

try {
    // Verificar método
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }
    
    // Pegar dados
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['email']) || !isset($input['codigo'])) {
        throw new Exception('Dados inválidos');
    }
    
    $email = trim($input['email']);
    $codigo = trim($input['codigo']);
    
    // Buscar código no banco
    $sql = "SELECT id, email, token, expires_at, used 
            FROM password_tokens 
            WHERE email = ? AND token = ? AND used = 0 
            ORDER BY created_at DESC 
            LIMIT 1";
    
    $stmt = mysqli_prepare($con, $sql);
    if (!$stmt) {
        throw new Exception('Erro ao preparar consulta');
    }
    
    mysqli_stmt_bind_param($stmt, "ss", $email, $codigo);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($row = mysqli_fetch_assoc($result)) {
        // Verificar se expirou
        $expires_at = strtotime($row['expires_at']);
        $now = time();
        
        if ($now > $expires_at) {
            // Marcar como usado
            $updateSql = "UPDATE password_tokens SET used = 1 WHERE id = ?";
            $updateStmt = mysqli_prepare($con, $updateSql);
            mysqli_stmt_bind_param($updateStmt, "i", $row['id']);
            mysqli_stmt_execute($updateStmt);
            mysqli_stmt_close($updateStmt);
            
            $response['message'] = 'Código expirado. Solicite um novo código.';
            $response['debug'] = [
                'expires_at' => $row['expires_at'],
                'now' => date('Y-m-d H:i:s'),
                'diferenca' => ($now - $expires_at) . ' segundos'
            ];
        } else {
            // Código válido - NÃO marcar como usado ainda
            // Marcar email como verificado na sessão
            $_SESSION['email_verified'] = true;
            $_SESSION['verified_email'] = $email;
            $_SESSION['verification_token_id'] = $row['id'];
            
            $response['success'] = true;
            $response['message'] = 'Email verificado com sucesso';
            $response['debug'] = [
                'session_id' => session_id(),
                'tempo_restante' => ($expires_at - $now) . ' segundos'
            ];
        }
    } else {
        // Código não encontrado - verificar se existe algum código para este email
        $checkSql = "SELECT id, token, expires_at, used, created_at 
                     FROM password_tokens 
                     WHERE email = ? 
                     ORDER BY created_at DESC 
                     LIMIT 5";
        
        $checkStmt = mysqli_prepare($con, $checkSql);
        mysqli_stmt_bind_param($checkStmt, "s", $email);
        mysqli_stmt_execute($checkStmt);
        $checkResult = mysqli_stmt_get_result($checkStmt);
        
        $debug_info = [
            'codigo_informado' => $codigo,
            'email' => $email,
            'codigos_no_banco' => []
        ];
        
        while ($checkRow = mysqli_fetch_assoc($checkResult)) {
            $debug_info['codigos_no_banco'][] = [
                'token' => $checkRow['token'],
                'expires_at' => $checkRow['expires_at'],
                'used' => $checkRow['used'],
                'created_at' => $checkRow['created_at']
            ];
        }
        
        mysqli_stmt_close($checkStmt);
        
        $response['message'] = 'Código inválido. Verifique se digitou corretamente.';
        $response['debug'] = $debug_info;
    }
    
    mysqli_stmt_close($stmt);
    
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = 'Erro ao verificar código: ' . $e->getMessage();
} finally {
    if (isset($con)) {
        mysqli_close($con);
    }
}

// Enviar resposta
echo json_encode($response);
exit();
?>