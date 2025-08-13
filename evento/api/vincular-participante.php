<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include("../conm/conn.php");
include("../../includes/participante-utils.php");

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
    
    // CORREÇÃO: Buscar participante primeiro por CPF (se fornecido), depois por email
    $participanteid = null;
    $participante_encontrado_por = null;
    
    // Limpar CPF para comparação (remover pontos e hífens)
    $documento_limpo = '';
    if (!empty($documento)) {
        $documento_limpo = preg_replace('/[^0-9]/', '', $documento);
    }
    
    // PRIORIDADE 1: Buscar por CPF se fornecido
    if (!empty($documento_limpo) && strlen($documento_limpo) >= 11) {
        error_log("Buscando participante por CPF: $documento_limpo");
        $sql_buscar_cpf = "SELECT participanteid, Nome, email FROM participantes 
                           WHERE REPLACE(REPLACE(REPLACE(COALESCE(CPF, ''), '.', ''), '-', ''), ' ', '') = ? 
                           AND eventoid = ? LIMIT 1";
        $stmt_buscar_cpf = $con->prepare($sql_buscar_cpf);
        $stmt_buscar_cpf->bind_param("si", $documento_limpo, $eventoid);
        $stmt_buscar_cpf->execute();
        $result_buscar_cpf = $stmt_buscar_cpf->get_result();
        
        if ($result_buscar_cpf && $result_buscar_cpf->num_rows > 0) {
            $participante_data = $result_buscar_cpf->fetch_assoc();
            $participanteid = $participante_data['participanteid'];
            $participante_encontrado_por = 'CPF';
            error_log("Participante encontrado por CPF: ID = $participanteid, Nome = " . $participante_data['Nome']);
            
            // Verificar se o email é diferente e alertar
            if (strtolower($participante_data['email']) !== strtolower($email)) {
                error_log("ATENÇÃO: CPF encontrado mas email diferente. DB: " . $participante_data['email'] . " vs Novo: $email");
                // Podemos decidir se atualizamos o email ou não
            }
        }
    }
    
    // CORREÇÃO APLICADA: Removida busca por email que violava a regra de chave única por CPF
    // Se não encontrou por CPF, cria novo participante
    
    // Preparar JSON dos dados adicionais
    $dados_adicionais_json = !empty($dados_adicionais) ? json_encode($dados_adicionais, JSON_UNESCAPED_UNICODE) : null;
    
    if (!$participanteid) {
        // Criar novo participante
        error_log("Criando novo participante com CPF: $documento_limpo");
        $sql_criar_participante = "INSERT INTO participantes (Nome, email, CPF, celular, eventoid, dados_adicionais) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt_criar = $con->prepare($sql_criar_participante);
        $stmt_criar->bind_param("ssssis", $nome, $email, $documento, $celular, $eventoid, $dados_adicionais_json);
        
        if (!$stmt_criar->execute()) {
            throw new Exception('Erro ao criar participante: ' . $stmt_criar->error);
        }
        
        $participanteid = $con->insert_id;
        error_log("Novo participante criado: ID = $participanteid");
    } else {
        // Atualizar participante existente (encontrado por CPF)
        error_log("Atualizando participante existente: ID = $participanteid");
        $sql_atualizar_participante = "UPDATE participantes SET Nome = ?, email = ?, celular = ?, dados_adicionais = ? WHERE participanteid = ?";
        $stmt_atualizar = $con->prepare($sql_atualizar_participante);
        $stmt_atualizar->bind_param("ssssi", $nome, $email, $celular, $dados_adicionais_json, $participanteid);
        
        if (!$stmt_atualizar->execute()) {
            throw new Exception('Erro ao atualizar participante: ' . $stmt_atualizar->error);
        }
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
            'cpf' => $documento,
            'encontrado_por' => $participante_encontrado_por,
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