<?php
include("check_login.php");
include("conm/conn.php");

// Configura charset para suportar emojis
mysqli_set_charset($con, "utf8mb4");

// Headers para JSON
header('Content-Type: application/json; charset=utf-8');

// Log de debug
error_log("Credenciamento - Dados recebidos: " . print_r($_POST, true));

try {
    // Verifica conexão
    if (!$con) {
        throw new Exception("Erro na conexão com o banco de dados: " . mysqli_connect_error());
    }
    // Validação dos dados obrigatórios
    if (empty($_POST['nome']) || empty($_POST['email']) || empty($_POST['cpf'])) {
        throw new Exception("Preencha todos os campos obrigatórios");
    }

    $nome = trim($_POST['nome']);
    $email = trim($_POST['email']);
    $cpf = trim($_POST['cpf']);
    $celular = trim($_POST['celular'] ?? '');
    $tipoingresso = $_POST['tipoingresso'] ?? 'Participante';
    $eventoid = intval($_POST['eventoid'] ?? 0);
    
    // Limpa CPF para armazenar apenas números
    $cpf_clean = preg_replace('/[^0-9]/', '', $cpf);
    
    // Validação do CPF
    if (strlen($cpf_clean) !== 11) {
        throw new Exception("CPF deve conter 11 dígitos");
    }
    
    // Validação do email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Email inválido");
    }
    
    // Verifica se o participante já existe
    $sql_check = "SELECT participanteid FROM participantes WHERE CPF = ? AND eventoid = ?";
    $stmt_check = mysqli_prepare($con, $sql_check);
    mysqli_stmt_bind_param($stmt_check, "si", $cpf_clean, $eventoid);
    mysqli_stmt_execute($stmt_check);
    $result = mysqli_stmt_get_result($stmt_check);
    
    if (mysqli_num_rows($result) > 0) {
        throw new Exception("Participante já cadastrado com este CPF");
    }
    mysqli_stmt_close($stmt_check);
    
    // Processa a foto se fornecida
    $nome_foto = null;
    if (!empty($_POST['photoData'])) {
        $photo_data = $_POST['photoData'];
        
        // Remove o prefixo "data:image/jpeg;base64,"
        if (strpos($photo_data, 'data:image/jpeg;base64,') === 0) {
            $photo_data = substr($photo_data, strlen('data:image/jpeg;base64,'));
        }
        
        // Decodifica a imagem
        $photo_decoded = base64_decode($photo_data);
        
        if ($photo_decoded !== false) {
            // Cria diretório se não existir
            $upload_dir = 'fotos_participantes/';
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0755, true);
            }
            
            // Nome único para o arquivo
            $nome_foto = 'foto_' . $cpf_clean . '_' . time() . '.jpg';
            $caminho_foto = $upload_dir . $nome_foto;
            
            // Salva a foto
            if (!file_put_contents($caminho_foto, $photo_decoded)) {
                throw new Exception("Erro ao salvar a foto");
            }
        }
    }
    
    // Insere no banco de dados
    $sql_insert = "INSERT INTO participantes (Nome, email, CPF, celular, tipoingresso, eventoid, thumb) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $stmt_insert = mysqli_prepare($con, $sql_insert);
    
    if ($stmt_insert) {
        mysqli_stmt_bind_param($stmt_insert, "sssssis", 
            $nome, 
            $email, 
            $cpf_clean, 
            $celular, 
            $tipoingresso, 
            $eventoid,
            $nome_foto
        );
        
        if (mysqli_stmt_execute($stmt_insert)) {
            $participante_id = mysqli_insert_id($con);
            
            $response = [
                'success' => true,
                'message' => 'Participante credenciado com sucesso',
                'participante_id' => $participante_id,
                'nome' => $nome,
                'foto_salva' => !empty($nome_foto)
            ];
        } else {
            // Se houve erro, remove a foto se foi salva
            if (!empty($nome_foto) && file_exists($upload_dir . $nome_foto)) {
                unlink($upload_dir . $nome_foto);
            }
            throw new Exception("Erro ao salvar participante no banco de dados: " . mysqli_error($con));
        }
        
        mysqli_stmt_close($stmt_insert);
    } else {
        // Se houve erro, remove a foto se foi salva
        if (!empty($nome_foto) && file_exists($upload_dir . $nome_foto)) {
            unlink($upload_dir . $nome_foto);
        }
        throw new Exception("Erro na preparação da query de inserção: " . mysqli_error($con));
    }
    
} catch (Exception $e) {
    // Remove foto se houve erro após salvá-la
    if (!empty($nome_foto) && isset($upload_dir) && file_exists($upload_dir . $nome_foto)) {
        unlink($upload_dir . $nome_foto);
    }
    
    $response = [
        'success' => false,
        'error' => $e->getMessage()
    ];
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
mysqli_close($con);
?>