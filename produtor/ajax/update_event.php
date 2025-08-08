<?php
include("../check_login.php");
include("../conm/conn.php");

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit();
}

if (!isset($_POST['evento_id']) || !is_numeric($_POST['evento_id'])) {
    echo json_encode(['success' => false, 'message' => 'ID do evento inválido']);
    exit();
}

$evento_id = intval($_POST['evento_id']);
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

try {
    // Verificar se o evento pertence ao usuário
    $stmt = $con->prepare("SELECT id FROM eventos WHERE id = ? AND usuario_id = ?");
    $stmt->bind_param("ii", $evento_id, $usuario_id);
    $stmt->execute();
    
    if (!$stmt->get_result()->fetch_assoc()) {
        echo json_encode(['success' => false, 'message' => 'Evento não encontrado ou sem permissão']);
        exit();
    }
    
    // Preparar dados para atualização
    $updates = [];
    $params = [];
    $types = '';
    
    // Campos básicos
    $fieldMap = [
        'eventName' => 'nome',
        'classification' => 'classificacao',
        'category' => 'categoria_id',
        'startDateTime' => 'data_inicio',
        'endDateTime' => 'data_fim',
        'eventDescription' => 'descricao',
        'corFundo' => 'cor_fundo',
        'venueName' => 'nome_local',
        'cep' => 'cep',
        'street' => 'rua',
        'number' => 'numero',
        'complement' => 'complemento',
        'neighborhood' => 'bairro',
        'city' => 'cidade',
        'state' => 'estado',
        'eventLink' => 'link_online',
        'latitude' => 'latitude',
        'longitude' => 'longitude',
        'contratante' => 'contratante_id',
        'visibilidade' => 'visibilidade',
        'statusEvento' => 'status'
    ];
    
    foreach ($fieldMap as $postKey => $dbField) {
        if (isset($_POST[$postKey]) && $_POST[$postKey] !== '') {
            // Tratamento especial para campos numéricos
            $value = $_POST[$postKey];
            
            if (in_array($dbField, ['categoria_id', 'latitude', 'longitude', 'contratante_id'])) {
                // Campos numéricos - só adicionar se não estiver vazio
                if ($value !== '' && $value !== null && is_numeric($value)) {
                    $updates[] = "$dbField = ?";
                    $params[] = $value;
                    $types .= in_array($dbField, ['categoria_id', 'contratante_id']) ? 'i' : 'd';
                }
            } else {
                // Campos de texto
                $updates[] = "$dbField = ?";
                $params[] = $value;
                $types .= 's';
            }
        }
    }
    
    // Tipo de localização
    if (isset($_POST['locationType'])) {
        $updates[] = "tipo_local = ?";
        $params[] = $_POST['locationType'];
        $types .= 's';
    }
    
    // Aceite de termos
    if (isset($_POST['aceitarTermos']) && $_POST['aceitarTermos'] != '1') {
        // É um JSON com informações do dispositivo
        $deviceInfo = $_POST['aceitarTermos'];
        
        // Validar se é um JSON válido
        $decoded = json_decode($deviceInfo, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $updates[] = "dados_aceite = ?";
            $params[] = $deviceInfo;
            $types .= 's';
            
            // Marcar termos_aceitos como 1
            $updates[] = "termos_aceitos = ?";
            $params[] = 1;
            $types .= 'i';
            
            // Copiar conteúdos dos parâmetros para a tabela eventos
            $sql_parametros = "SELECT politicas_eventos_default, termos_eventos_default FROM parametros LIMIT 1";
            $result_parametros = mysqli_query($con, $sql_parametros);
            if ($row_parametros = mysqli_fetch_assoc($result_parametros)) {
                $updates[] = "politicas = ?";
                $params[] = $row_parametros['politicas_eventos_default'];
                $types .= 's';
                
                $updates[] = "termos = ?";
                $params[] = $row_parametros['termos_eventos_default'];
                $types .= 's';
            }
        }
    }
    
    // Processar uploads de imagens
    $imageResults = [];
    $uploadDir = realpath('../..') . '/uploads/eventos/';
    
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $imageFields = [
        'logoUpload' => 'logo_evento',
        'capaUpload' => 'imagem_capa', 
        'fundoUpload' => 'imagem_fundo'
    ];
    
    foreach ($imageFields as $uploadKey => $dbField) {
        if (isset($_FILES[$uploadKey]) && $_FILES[$uploadKey]['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES[$uploadKey];
            
            // Validar tipo de arquivo
            $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            if (!in_array($file['type'], $allowedTypes)) {
                continue;
            }
            
            // Validar tamanho (5MB max)
            if ($file['size'] > 5 * 1024 * 1024) {
                continue;
            }
            
            // Gerar nome único
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $fileName = 'evento_' . $evento_id . '_' . $uploadKey . '_' . time() . '.' . $extension;
            $targetPath = $uploadDir . $fileName;
            
            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                // Salvar caminho relativo completo no banco
                $relativePath = '/uploads/eventos/' . $fileName;
                $updates[] = "$dbField = ?";
                $params[] = $relativePath;
                $types .= 's';
                
                $imageResults[$uploadKey] = $relativePath;
            }
        }
    }
    
    // Executar atualização se houver campos para atualizar
    if (!empty($updates)) {
        $sql = "UPDATE eventos SET " . implode(', ', $updates) . " WHERE id = ? AND usuario_id = ?";
        $params[] = $evento_id;
        $params[] = $usuario_id;
        $types .= 'ii';
        
        $stmt = $con->prepare($sql);
        $stmt->bind_param($types, ...$params);
        
        if ($stmt->execute()) {
            $response = [
                'success' => true,
                'message' => 'Evento atualizado com sucesso'
            ];
            
            if (!empty($imageResults)) {
                $response['images'] = $imageResults;
            }
            
            echo json_encode($response);
        } else {
            throw new Exception('Erro ao executar atualização: ' . $stmt->error);
        }
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'Nenhuma alteração detectada'
        ]);
    }
    
} catch (Exception $e) {
    error_log("Erro ao atualizar evento: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Erro interno: ' . $e->getMessage()
    ]);
}
?>
