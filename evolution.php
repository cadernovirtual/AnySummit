<?php
/**
 * AnySummit - Evolution API Proxy
 * Proxy para comunicação com a API Evolution WhatsApp
 * 
 * @author Gustavo Lopes
 * @version 1.0
 * @date 2025-08-06
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Timezone brasileiro
date_default_timezone_set('America/Sao_Paulo');

// Logs de erro
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/evolution_error.log');

// Função para logs personalizados
function logEvolution($message) {
    $logDir = __DIR__ . '/logs';
    if (!file_exists($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $logFile = $logDir . '/evolution.log';
    file_put_contents($logFile, "[$timestamp] $message" . PHP_EOL, FILE_APPEND | LOCK_EX);
}

// Função para conectar ao banco
function conectarBanco() {
    try {
        // Buscar configuração de conexão existente
        $configFiles = [
            __DIR__ . '/admin/conm/conn.php',
            __DIR__ . '/produtor/conm/conn.php',
            __DIR__ . '/evento/conm/conn.php'
        ];
        
        foreach ($configFiles as $file) {
            if (file_exists($file)) {
                include_once $file;
                break;
            }
        }
        
        // Se não encontrou, usar configuração padrão
        if (!isset($con)) {
            $host = 'anysummit.com.br';
            $database = 'anysummit_db';
            $username = 'anysummit_user';
            $password = 'Miran@Janyne@Gustavo';
            
            $con = new mysqli($host, $username, $password, $database);
            $con->set_charset("utf8mb4");
            
            if ($con->connect_error) {
                throw new Exception("Erro de conexão: " . $con->connect_error);
            }
        }
        
        return $con;
    } catch (Exception $e) {
        logEvolution("Erro ao conectar banco: " . $e->getMessage());
        return null;
    }
}

// Função para buscar parâmetros do Evolution
function buscarParametrosEvolution() {
    $con = conectarBanco();
    if (!$con) {
        return null;
    }
    
    $query = "SELECT evolution_instance_id, evolution_api_base_url, evolution_webhook_token, evolution_numero_whatsapp FROM parametros WHERE id = 1";
    $result = $con->query($query);
    
    if ($result && $result->num_rows > 0) {
        $params = $result->fetch_assoc();
        $con->close();
        return $params;
    }
    
    $con->close();
    return null;
}

// Função para salvar mensagem no banco
function salvarMensagemWhatsApp($eventoid, $participanteid, $compradorid, $numero_destino, $origem, $tipo, $mensagem, $erro = null) {
    $con = conectarBanco();
    if (!$con) {
        return false;
    }
    
    $stmt = $con->prepare("INSERT INTO eventos_mensagens_whatsapp (eventoid, participanteid, compradorid, numero_destino, origem, tipo, mensagem, enviado_em, erro_envio) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)");
    
    $stmt->bind_param("iiisssss", $eventoid, $participanteid, $compradorid, $numero_destino, $origem, $tipo, $mensagem, $erro);
    
    $resultado = $stmt->execute();
    
    $stmt->close();
    $con->close();
    
    return $resultado;
}

// Função para fazer chamada cURL para a API Evolution
function chamarEvolutionAPI($endpoint, $data = null, $method = 'POST') {
    $params = buscarParametrosEvolution();
    
    if (!$params || !$params['evolution_api_base_url']) {
        return [
            'status' => 'erro',
            'mensagem' => 'URL base da API Evolution não configurada'
        ];
    }
    
    $url = rtrim($params['evolution_api_base_url'], '/') . '/' . ltrim($endpoint, '/');
    
    logEvolution("Chamando API: $method $url");
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json'
        ],
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false
    ]);
    
    if ($data && ($method === 'POST' || $method === 'PUT')) {
        // Adicionar instance_id se não estiver presente
        if (is_array($data) && !isset($data['instance']) && $params['evolution_instance_id']) {
            $data['instance'] = $params['evolution_instance_id'];
        }
        
        $jsonData = is_string($data) ? $data : json_encode($data);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $jsonData);
        
        logEvolution("Dados enviados: " . $jsonData);
    }
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);
    
    curl_close($curl);
    
    logEvolution("Resposta HTTP: $httpCode");
    logEvolution("Resposta: " . $response);
    
    if ($error) {
        logEvolution("Erro cURL: " . $error);
        return [
            'status' => 'erro',
            'mensagem' => 'Erro na comunicação com a API: ' . $error
        ];
    }
    
    $responseData = json_decode($response, true);
    
    if ($httpCode >= 200 && $httpCode < 300) {
        return [
            'status' => 'ok',
            'dados' => $responseData,
            'http_code' => $httpCode
        ];
    } else {
        return [
            'status' => 'erro',
            'mensagem' => 'Erro HTTP ' . $httpCode,
            'dados' => $responseData,
            'http_code' => $httpCode
        ];
    }
}

// Processa a requisição
try {
    $acao = $_GET['acao'] ?? $_POST['acao'] ?? '';
    
    if (!$acao) {
        throw new Exception('Ação não especificada');
    }
    
    logEvolution("Ação solicitada: $acao");
    
    switch ($acao) {
        case 'create_connection':
        case 'get_qrcode':
            $result = chamarEvolutionAPI('/qr-code', [
                'instance' => buscarParametrosEvolution()['evolution_instance_id'] ?? 'anysummit_main'
            ]);
            break;
            
        case 'get_status':
        case 'status':
            $result = chamarEvolutionAPI('/status', [
                'instance' => buscarParametrosEvolution()['evolution_instance_id'] ?? 'anysummit_main'
            ]);
            break;
            
        case 'send_message':
            $numero = $_POST['numero'] ?? '';
            $mensagem = $_POST['mensagem'] ?? '';
            $eventoid = $_POST['eventoid'] ?? null;
            $participanteid = $_POST['participanteid'] ?? null;
            $compradorid = $_POST['compradorid'] ?? null;
            
            if (!$numero || !$mensagem) {
                throw new Exception('Número e mensagem são obrigatórios');
            }
            
            // Formatar número para padrão internacional
            $numeroFormatado = preg_replace('/[^0-9]/', '', $numero);
            if (strlen($numeroFormatado) === 11 && substr($numeroFormatado, 0, 2) !== '55') {
                $numeroFormatado = '55' . $numeroFormatado;
            }
            
            $result = chamarEvolutionAPI('/send-message', [
                'instance' => buscarParametrosEvolution()['evolution_instance_id'] ?? 'anysummit_main',
                'number' => $numeroFormatado,
                'message' => $mensagem
            ]);
            
            // Salvar mensagem no banco
            $erro = ($result['status'] === 'erro') ? $result['mensagem'] : null;
            salvarMensagemWhatsApp($eventoid, $participanteid, $compradorid, $numeroFormatado, 'sistema', 'texto', $mensagem, $erro);
            
            break;
            
        case 'test_connection':
            $params = buscarParametrosEvolution();
            if (!$params || !$params['evolution_api_base_url']) {
                $result = [
                    'status' => 'erro',
                    'mensagem' => 'Parâmetros Evolution não configurados'
                ];
            } else {
                $result = chamarEvolutionAPI('/test', [
                    'instance' => $params['evolution_instance_id'] ?? 'anysummit_main'
                ]);
            }
            break;
            
        case 'get_instance_info':
            $params = buscarParametrosEvolution();
            $result = [
                'status' => 'ok',
                'dados' => [
                    'instance_id' => $params['evolution_instance_id'] ?? null,
                    'api_url' => $params['evolution_api_base_url'] ?? null,
                    'numero_whatsapp' => $params['evolution_numero_whatsapp'] ?? null,
                    'configured' => !empty($params['evolution_api_base_url']) && !empty($params['evolution_instance_id'])
                ]
            ];
            break;
            
        default:
            throw new Exception('Ação inválida: ' . $acao);
    }
    
    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    logEvolution("Erro: " . $e->getMessage());
    
    echo json_encode([
        'status' => 'erro',
        'mensagem' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
?>
