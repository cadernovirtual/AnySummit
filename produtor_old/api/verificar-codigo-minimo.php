<?php
// Versão MÍNIMA para verificar código - sem banco
error_reporting(0);
ini_set('display_errors', 0);

// Limpar saída
if (ob_get_level()) ob_clean();

// Headers
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

// Inicializar resposta
$response = array(
    'success' => false,
    'message' => ''
);

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
    
    $email = $input['email'];
    $codigo = $input['codigo'];
    
    // Verificar arquivo temporário
    $temp_file = sys_get_temp_dir() . '/anysummit_code_' . md5($email) . '.txt';
    
    if (file_exists($temp_file)) {
        $data = json_decode(file_get_contents($temp_file), true);
        
        // Verificar expiração
        if ($data && time() <= $data['expires']) {
            // Verificar código
            if ($data['codigo'] === $codigo) {
                // Iniciar sessão para marcar como verificado
                session_start();
                $_SESSION['email_verified'] = true;
                $_SESSION['verified_email'] = $email;
                
                $response['success'] = true;
                $response['message'] = 'Email verificado com sucesso';
            } else {
                $response['message'] = 'Código inválido';
            }
        } else {
            $response['message'] = 'Código expirado';
            unlink($temp_file); // Remover arquivo expirado
        }
    } else {
        $response['message'] = 'Código não encontrado. Solicite um novo.';
    }
    
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
}

// Enviar resposta
echo json_encode($response);
exit();
?>