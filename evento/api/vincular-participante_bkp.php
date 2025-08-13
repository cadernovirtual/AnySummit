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

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
    exit;
}

try {
    // Log dos dados recebidos para debug
    error_log('Dados recebidos: ' . json_encode($input));
    
    // Iniciar transação
    $con->autocommit(false);
    
    // Extrair dados
    $ingresso_id = intval($input['ingresso_id']);
    $nome = trim($input['participante_nome']);
    $email = trim($input['participante_email']);
    $documento = trim($input['participante_documento'] ?? '');
    $celular = trim($input['participante_celular'] ?? '');
    $dados_adicionais = $input['dados_adicionais'] ?? [];
    
    // Log dos dados processados
    error_log("Processando: ID=$ingresso_id, Nome=$nome, Email=$email");
    error_log("Dados adicionais: " . json_encode($dados_adicionais));
    
    // Validar dados obrigatórios
    if (!$ingresso_id || !$nome || !$email) {
        throw new Exception('Dados obrigatórios não informados');
    }
    
    // Validar se o ingresso existe e não está vinculado
    $sql_check_ingresso = "SELECT eventoid, participanteid, status FROM tb_ingressos_individuais WHERE id = ?";
    $stmt_check = $con->prepare($sql_check_ingresso);
    $stmt_check->bind_param("i", $ingresso_id);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    
    if ($result_check->num_rows === 0) {
        error_log("Ingresso não encontrado: ID = $ingresso_id");
        throw new Exception('Ingresso não encontrado ou inválido');
    }
    
    $ingresso_data = $result_check->fetch_assoc();
    $eventoid = $ingresso_data['eventoid'];
    $status_atual = $ingresso_data['status'];
    
    error_log("Ingresso encontrado: Status=$status_atual, EventoID=$eventoid, ParticipanteID=" . ($ingresso_data['participanteid'] ?? 'null'));
    
    // Verificar se o status permite vinculação (ativo ou transferido)
    if (!in_array($status_atual, ['ativo', 'transferido'])) {
        throw new Exception("Ingresso não pode ser vinculado. Status atual: $status_atual");
    }
    
    if ($ingresso_data['participanteid']) {
        throw new Exception('Este ingresso já está vinculado a um participante');
    }
    
    // Buscar ou criar participante
    $participanteid = null;    
    // Primeiro, verificar se já existe participante com este email para este evento
    $sql_buscar = "SELECT participanteid FROM participantes WHERE email = ? AND eventoid = ? LIMIT 1";
    $stmt_buscar = $con->prepare($sql_buscar);
    $stmt_buscar->bind_param("si", $email, $eventoid);
    $stmt_buscar->execute();
    $result_buscar = $stmt_buscar->get_result();
    
    // Preparar JSON dos dados adicionais
    $dados_adicionais_json = !empty($dados_adicionais) ? json_encode($dados_adicionais, JSON_UNESCAPED_UNICODE) : null;
    
    if ($result_buscar && $result_buscar->num_rows > 0) {
        // Participante já existe - atualizar dados
        $participanteid = $result_buscar->fetch_assoc()['participanteid'];
        error_log("Participante existente encontrado: ID = $participanteid");
        
        // Atualizar dados do participante existente
        $sql_atualizar = "UPDATE participantes SET Nome = ?, celular = ?, CPF = ?, dados_adicionais = ? WHERE participanteid = ?";
        $stmt_atualizar = $con->prepare($sql_atualizar);
        $stmt_atualizar->bind_param("ssssi", $nome, $celular, $documento, $dados_adicionais_json, $participanteid);
        $stmt_atualizar->execute();
        error_log("Dados do participante atualizados");
        
    } else {
        // Criar novo participante
        $sql_criar = "INSERT INTO participantes (Nome, email, celular, CPF, eventoid, dados_adicionais) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt_criar = $con->prepare($sql_criar);
        $stmt_criar->bind_param("ssssis", $nome, $email, $celular, $documento, $eventoid, $dados_adicionais_json);
        
        if ($stmt_criar->execute()) {
            $participanteid = $con->insert_id;
            error_log("Novo participante criado: ID = $participanteid");
        } else {
            error_log("Erro ao criar participante: " . $con->error);
            // Tentar buscar novamente (pode ter sido criado por outro processo)
            $stmt_buscar2 = $con->prepare($sql_buscar);
            $stmt_buscar2->bind_param("si", $email, $eventoid);
            $stmt_buscar2->execute();
            $result_buscar2 = $stmt_buscar2->get_result();
            
            if ($result_buscar2 && $result_buscar2->num_rows > 0) {
                $participanteid = $result_buscar2->fetch_assoc()['participanteid'];
                error_log("Participante encontrado na segunda tentativa: ID = $participanteid");
            } else {
                throw new Exception('Erro ao criar participante: ' . $con->error);
            }
        }
    }
    
    if (!$participanteid) {
        throw new Exception('Não foi possível identificar o participante');
    }
    
    // Atualizar o ingresso individual com os dados do participante
    $sql_vincular = "UPDATE tb_ingressos_individuais SET 
                     participanteid = ?,
                     participante_nome = ?,
                     participante_email = ?,
                     participante_documento = ?,
                     status = 'ativo',
                     data_vinculacao = NOW()
                     WHERE id = ?";
    
    $stmt_vincular = $con->prepare($sql_vincular);
    $stmt_vincular->bind_param("isssi", $participanteid, $nome, $email, $documento, $ingresso_id);
    
    if (!$stmt_vincular->execute()) {
        error_log("Erro ao executar update do ingresso: " . $con->error);
        throw new Exception('Erro ao vincular participante ao ingresso: ' . $con->error);
    }
    
    error_log("Ingresso vinculado com sucesso: participanteid=$participanteid, ingresso_id=$ingresso_id, status alterado para 'ativo'");
    
    // Confirmar transação
    $con->commit();
    
    // Resposta de sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Participante vinculado com sucesso',
        'dados' => [
            'participanteid' => $participanteid,
            'nome' => $nome,
            'email' => $email,
            'ingresso_id' => $ingresso_id
        ]
    ]);
    
} catch (Exception $e) {
    // Reverter transação em caso de erro
    $con->rollback();
    
    error_log('Erro ao vincular participante: ' . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Restaurar autocommit
$con->autocommit(true);
?>