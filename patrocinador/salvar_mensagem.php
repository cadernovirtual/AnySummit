<?php
include("check_login.php");
include("conm/conn.php");

// Configura charset para suportar emojis
mysqli_set_charset($con, "utf8mb4");

header('Content-Type: application/json; charset=utf-8');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Método não permitido");
    }
    
    $participante_id = $_SESSION['participanteid'] ?? $_COOKIE['participanteid'] ?? 1;
    $mensagem = trim($_POST['mensagem'] ?? '');
    $msgId = trim($_POST['msgId'] ?? '');
    
    if (empty($mensagem)) {
        throw new Exception("Mensagem não pode estar vazia");
    }
    
    if (strlen($mensagem) > 1000) {
        throw new Exception("Mensagem muito longa (máximo 1000 caracteres)");
    }
    
    // Verifica se já existe uma mensagem para este participante
    if (!empty($msgId)) {
        // Atualiza mensagem existente
        $sql = "UPDATE participante_msgpersonalizado SET msg = ? WHERE msgpersoid = ? AND participanteid = ?";
        $stmt = mysqli_prepare($con, $sql);
        
        if ($stmt) {
            mysqli_stmt_bind_param($stmt, "sii", $mensagem, $msgId, $participante_id);
            $success = mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);
            
            if ($success) {
                $response = [
                    'success' => true,
                    'message' => 'Mensagem atualizada com sucesso',
                    'msgId' => $msgId
                ];
            } else {
                throw new Exception("Erro ao atualizar mensagem");
            }
        } else {
            throw new Exception("Erro na preparação da query de atualização");
        }
        
    } else {
        // Verifica se já existe alguma mensagem para este participante
        $check_sql = "SELECT msgpersoid FROM participante_msgpersonalizado WHERE participanteid = ?";
        $check_stmt = mysqli_prepare($con, $check_sql);
        
        if ($check_stmt) {
            mysqli_stmt_bind_param($check_stmt, "i", $participante_id);
            mysqli_stmt_execute($check_stmt);
            $result = mysqli_stmt_get_result($check_stmt);
            
            if ($existing = mysqli_fetch_assoc($result)) {
                // Já existe, atualiza
                $existing_id = $existing['msgpersoid'];
                mysqli_stmt_close($check_stmt);
                
                $update_sql = "UPDATE participante_msgpersonalizado SET msg = ? WHERE msgpersoid = ?";
                $update_stmt = mysqli_prepare($con, $update_sql);
                
                if ($update_stmt) {
                    mysqli_stmt_bind_param($update_stmt, "si", $mensagem, $existing_id);
                    $success = mysqli_stmt_execute($update_stmt);
                    mysqli_stmt_close($update_stmt);
                    
                    if ($success) {
                        $response = [
                            'success' => true,
                            'message' => 'Mensagem atualizada com sucesso',
                            'msgId' => $existing_id
                        ];
                    } else {
                        throw new Exception("Erro ao atualizar mensagem existente");
                    }
                } else {
                    throw new Exception("Erro na preparação da query de atualização");
                }
                
            } else {
                // Não existe, cria nova
                mysqli_stmt_close($check_stmt);
                
                $insert_sql = "INSERT INTO participante_msgpersonalizado (msg, participanteid) VALUES (?, ?)";
                $insert_stmt = mysqli_prepare($con, $insert_sql);
                
                if ($insert_stmt) {
                    mysqli_stmt_bind_param($insert_stmt, "si", $mensagem, $participante_id);
                    $success = mysqli_stmt_execute($insert_stmt);
                    
                    if ($success) {
                        $new_id = mysqli_insert_id($con);
                        $response = [
                            'success' => true,
                            'message' => 'Mensagem criada com sucesso',
                            'msgId' => $new_id
                        ];
                    } else {
                        throw new Exception("Erro ao criar nova mensagem");
                    }
                    
                    mysqli_stmt_close($insert_stmt);
                } else {
                    throw new Exception("Erro na preparação da query de inserção");
                }
            }
        } else {
            throw new Exception("Erro na verificação de mensagem existente");
        }
    }
    
} catch (Exception $e) {
    $response = [
        'success' => false,
        'error' => $e->getMessage()
    ];
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
mysqli_close($con);
?>
