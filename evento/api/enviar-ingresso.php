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
    // Verificar conexão com banco
    if (!$con) {
        throw new Exception('Erro de conexão com banco de dados');
    }
    
    // Extrair dados
    $ingresso_data = $input['ingresso'] ?? [];
    $destinatario = $input['destinatario'] ?? [];
    $evento = $input['evento'] ?? [];
    $pedido = $input['pedido'] ?? [];
    $remetente = $input['remetente'] ?? [];
    
    // Validar dados obrigatórios
    if (empty($ingresso_data['id']) || empty($destinatario['nome']) || empty($destinatario['email'])) {
        throw new Exception('Dados obrigatórios não informados');
    }
    
    // Verificar se o ingresso existe e está disponível
    $ingresso_id = intval($ingresso_data['id']);
    $sql_check = "SELECT * FROM tb_ingressos_individuais WHERE id = ? AND status = 'ativo'";
    $stmt_check = $con->prepare($sql_check);
    
    if (!$stmt_check) {
        throw new Exception('Erro ao preparar consulta: ' . $con->error);
    }
    
    $stmt_check->bind_param("i", $ingresso_id);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    
    if ($result_check->num_rows === 0) {
        throw new Exception('Ingresso não encontrado ou não está disponível');
    }
    
    $ingresso_db = $result_check->fetch_assoc();
    
    // Buscar dados completos do evento
    $evento_dados = null;
    if ($ingresso_db['eventoid']) {
        $sql_evento = "SELECT nome, data_inicio, nome_local, busca_endereco FROM eventos WHERE id = ?";
        $stmt_evento = $con->prepare($sql_evento);
        if ($stmt_evento) {
            $stmt_evento->bind_param("i", $ingresso_db['eventoid']);
            $stmt_evento->execute();
            $result_evento = $stmt_evento->get_result();
            if ($result_evento->num_rows > 0) {
                $evento_dados = $result_evento->fetch_assoc();
            }
        }
    }
    
    // Preparar dados completos para o webhook
    $webhook_data = [
        'acao' => 'enviar_ingresso',
        'timestamp' => date('c'),
        'ingresso' => [
            'id' => $ingresso_db['id'],
            'codigo' => $ingresso_db['codigo_ingresso'],
            'titulo' => $ingresso_db['titulo_ingresso'],
            'preco' => floatval($ingresso_db['preco_unitario']),
            'status' => $ingresso_db['status'],
            'qr_code_data' => $ingresso_db['qr_code_data'],
            'hash_validacao' => $ingresso_db['hash_validacao']
        ],
        'destinatario' => [
            'nome' => trim($destinatario['nome']),
            'email' => trim($destinatario['email']),
            'whatsapp' => trim($destinatario['whatsapp'] ?? ''),
            'mensagem' => trim($destinatario['mensagem'] ?? '')
        ],
        'evento' => [
            'id' => $ingresso_db['eventoid'],
            'nome' => $evento_dados['nome'] ?? 'Any Summit',
            'data_inicio' => $evento_dados['data_inicio'] ?? null,
            'local' => $evento_dados['nome_local'] ?? '',
            'endereco' => $evento_dados['busca_endereco'] ?? ''
        ],
        'pedido' => [
            'id' => $pedido['id'] ?? null,
            'codigo' => $pedido['codigo'] ?? ''
        ],
        'remetente' => [
            'nome' => $remetente['nome'] ?? '',
            'email' => $remetente['email'] ?? ''
        ]
    ];
    
    // URL do webhook
    $webhook_url = 'https://n8n.webtoyou.com.br/webhook/3e669a00-7990-46b4-a6c7-58018270428a';
    
    // Log dos dados que serão enviados
    error_log('Enviando para webhook: ' . $webhook_url);
    error_log('Dados do webhook: ' . json_encode($webhook_data));
    
    // Enviar para webhook
    $webhook_response = enviarParaWebhook($webhook_url, $webhook_data);
    
    // Log da resposta do webhook
    error_log('Resposta do webhook: ' . json_encode($webhook_response));
    
    // Verificar se o webhook respondeu com sucesso
    if (!$webhook_response['success']) {
        // Log do erro mas não falha o processo (para não bloquear o usuário)
        error_log('Erro no webhook: ' . ($webhook_response['error'] ?? 'Erro desconhecido'));
    }
    
    // Atualizar status do ingresso para "transferido"
    $sql_update = "UPDATE tb_ingressos_individuais SET 
                   status = 'transferido',
                   transferido_para_email = ?,
                   data_transferencia = NOW(),
                   atualizado_em = NOW()
                   WHERE id = ?";
    
    $stmt_update = $con->prepare($sql_update);
    if (!$stmt_update) {
        throw new Exception('Erro ao preparar atualização: ' . $con->error);
    }
    
    $stmt_update->bind_param("si", $destinatario['email'], $ingresso_id);
    if (!$stmt_update->execute()) {
        throw new Exception('Erro ao atualizar ingresso: ' . $con->error);
    }
    
    // Resposta de sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Ingresso enviado com sucesso',
        'dados' => [
            'ingresso_id' => $ingresso_id,
            'codigo_ingresso' => $ingresso_db['codigo_ingresso'],
            'destinatario_email' => $destinatario['email'],
            'webhook_enviado' => $webhook_response['success'] ?? false,
            'webhook_response' => $webhook_response, // Para debug
            'webhook_url_usado' => $webhook_url, // Para verificar a URL
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    error_log('Erro ao enviar ingresso: ' . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug_info' => [
            'input_received' => $input ? 'sim' : 'nao',
            'connection' => $con ? 'ok' : 'erro'
        ]
    ]);
}

function enviarParaWebhook($url, $data) {
    try {
        error_log("Iniciando envio para webhook: $url");
        
        $json_data = json_encode($data);
        error_log("Tamanho dos dados: " . strlen($json_data) . " bytes");
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $json_data);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($json_data)
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Para teste, em produção deve ser true
        curl_setopt($ch, CURLOPT_VERBOSE, false);
        
        $result = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_error = curl_error($ch);
        
        error_log("HTTP Code: $http_code");
        error_log("Response: " . substr($result, 0, 500)); // Primeiros 500 chars
        
        if ($curl_error) {
            error_log("Curl Error: $curl_error");
        }
        
        curl_close($ch);
        
        if ($result === FALSE) {
            throw new Exception('Falha na execução do cURL: ' . $curl_error);
        }
        
        if ($http_code >= 400) {
            throw new Exception("HTTP Error $http_code: $result");
        }
        
        return [
            'success' => true,
            'response' => $result,
            'http_code' => $http_code
        ];
        
    } catch (Exception $e) {
        error_log("Erro na função enviarParaWebhook: " . $e->getMessage());
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}
?>