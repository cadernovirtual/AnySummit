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
    
    // Pega os dados do formulário
    $nome = trim($_POST['nome'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $celular = trim($_POST['celular'] ?? '');
    $senha_atual = trim($_POST['senha_atual'] ?? '');
    $nova_senha = trim($_POST['nova_senha'] ?? '');
    $confirmar_senha = trim($_POST['confirmar_senha'] ?? '');
    
    // Validações básicas
    if (empty($nome)) {
        throw new Exception("Nome é obrigatório");
    }
    
    if (empty($email)) {
        throw new Exception("E-mail é obrigatório");
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("E-mail inválido");
    }
    
    // Se está tentando alterar senha
    $alterar_senha = false;
    if (!empty($nova_senha)) {
        if (empty($senha_atual)) {
            throw new Exception("Digite a senha atual para alterar a senha");
        }
        
        if ($nova_senha !== $confirmar_senha) {
            throw new Exception("As senhas não coincidem");
        }
        
        if (strlen($nova_senha) < 6) {
            throw new Exception("Nova senha deve ter pelo menos 6 caracteres");
        }
        
        // Verifica senha atual
        $sql_check = "SELECT senha FROM participantes WHERE participanteid = ?";
        $stmt_check = mysqli_prepare($con, $sql_check);
        
        if ($stmt_check) {
            mysqli_stmt_bind_param($stmt_check, "i", $participante_id);
            mysqli_stmt_execute($stmt_check);
            $result_check = mysqli_stmt_get_result($stmt_check);
            
            if ($row_check = mysqli_fetch_assoc($result_check)) {
                $senha_hash_atual = md5($senha_atual);
                
                if ($row_check['senha'] !== $senha_atual && $row_check['senha'] !== $senha_hash_atual) {
                    mysqli_stmt_close($stmt_check);
                    throw new Exception("Senha atual incorreta");
                }
                
                $alterar_senha = true;
            } else {
                mysqli_stmt_close($stmt_check);
                throw new Exception("Participante não encontrado");
            }
            
            mysqli_stmt_close($stmt_check);
        }
    }
    
    // Processamento da foto
    $novo_thumb = '';
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = '../uploads/foto/';
        
        // Cria diretório se não existir
        if (!is_dir($upload_dir)) {
            if (!mkdir($upload_dir, 0755, true)) {
                throw new Exception("Erro ao criar diretório de upload");
            }
        }
        
        $file_info = pathinfo($_FILES['photo']['name']);
        $extension = strtolower($file_info['extension']);
        
        // Valida extensão
        $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];
        if (!in_array($extension, $allowed_extensions)) {
            throw new Exception("Formato de arquivo não permitido. Use JPG, PNG ou GIF");
        }
        
        // Valida tamanho (2MB)
        if ($_FILES['photo']['size'] > 2 * 1024 * 1024) {
            throw new Exception("Arquivo muito grande. Máximo 2MB");
        }
        
        // Gera nome único
        $novo_thumb = 'participante_' . $participante_id . '_' . time() . '.' . $extension;
        $caminho_completo = $upload_dir . $novo_thumb;
        
        // Move arquivo
        if (!move_uploaded_file($_FILES['photo']['tmp_name'], $caminho_completo)) {
            throw new Exception("Erro ao fazer upload da foto");
        }
        
        // Remove foto antiga se existir
        $sql_thumb_antigo = "SELECT thumb FROM participantes WHERE participanteid = ?";
        $stmt_thumb = mysqli_prepare($con, $sql_thumb_antigo);
        
        if ($stmt_thumb) {
            mysqli_stmt_bind_param($stmt_thumb, "i", $participante_id);
            mysqli_stmt_execute($stmt_thumb);
            $result_thumb = mysqli_stmt_get_result($stmt_thumb);
            
            if ($row_thumb = mysqli_fetch_assoc($result_thumb)) {
                $thumb_antigo = $row_thumb['thumb'];
                if (!empty($thumb_antigo) && file_exists($upload_dir . $thumb_antigo)) {
                    unlink($upload_dir . $thumb_antigo);
                }
            }
            
            mysqli_stmt_close($stmt_thumb);
        }
    }
    
    // Monta SQL de atualização
    $campos_update = [];
    $tipos_param = '';
    $params = [];
    
    // Campos básicos
    $campos_update[] = "Nome = ?";
    $tipos_param .= 's';
    $params[] = $nome;
    
    $campos_update[] = "email = ?";
    $tipos_param .= 's';
    $params[] = $email;
    
    $campos_update[] = "celular = ?";
    $tipos_param .= 's';
    $params[] = $celular;
    
    // Foto se foi enviada
    if (!empty($novo_thumb)) {
        $campos_update[] = "thumb = ?";
        $tipos_param .= 's';
        $params[] = $novo_thumb;
    }
    
    // Senha se foi alterada
    if ($alterar_senha) {
        $campos_update[] = "senha = ?";
        $tipos_param .= 's';
        $params[] = md5($nova_senha); // Usando MD5 como no sistema original
    }
    
    // ID do participante
    $tipos_param .= 'i';
    $params[] = $participante_id;
    
    // Executa update
    $sql_update = "UPDATE participantes SET " . implode(', ', $campos_update) . " WHERE participanteid = ?";
    $stmt_update = mysqli_prepare($con, $sql_update);
    
    if ($stmt_update) {
        mysqli_stmt_bind_param($stmt_update, $tipos_param, ...$params);
        $success = mysqli_stmt_execute($stmt_update);
        mysqli_stmt_close($stmt_update);
        
        if ($success) {
            // Atualiza sessões se o nome mudou
            if ($_SESSION['participante_nome'] !== $nome) {
                $_SESSION['participante_nome'] = $nome;
                
                // Atualiza cookies também
                $expire = time() + (10 * 365 * 24 * 60 * 60);
                setcookie('participante_nome', $nome, $expire, "/", "", false, true);
            }
            
            $response = [
                'success' => true,
                'message' => 'Dados atualizados com sucesso',
                'nome_atualizado' => ($_SESSION['participante_nome'] !== $nome)
            ];
        } else {
            throw new Exception("Erro ao atualizar dados no banco");
        }
    } else {
        throw new Exception("Erro na preparação da query de atualização");
    }
    
} catch (Exception $e) {
    // Remove arquivo de foto se houve erro após o upload
    if (!empty($novo_thumb) && file_exists('../uploads/foto/' . $novo_thumb)) {
        unlink('../uploads/foto/' . $novo_thumb);
    }
    
    $response = [
        'success' => false,
        'error' => $e->getMessage()
    ];
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
mysqli_close($con);
?>
