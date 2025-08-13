<?php

class AsaasAPI {
    private $base_url;
    private $access_token;
    
    public function __construct($environment = 'production') {
	//	$this->access_token = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjNhYzk1MzI5LWRkZGMtNDRmMy04ODY1LWJmMTA0ZGIxNTVlZTo6JGFhY2hfNjBlYzlkNzktZTEyZS00Njg0LTkxZTAtZTVlZTMzZTlkMjZk';
        $this->access_token = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojk5NTM1N2ZmLTA3NTctNDM2Yi1hZGUyLTgxMzFjMWZjMDFlODo6JGFhY2hfMjA5ZDAyYWItNGEyOS00MTg1LTg5ZWMtOTJiYzU3NGUxODlm';
		
		
        
        // URL da API
        if ($environment === 'production') {
            $this->base_url = 'https://api.asaas.com/v3';
        } else {
            $this->base_url = 'https://sandbox.asaas.com/api/v3';
        }
    }
    
    /**
     * Fazer requisição para a API do Asaas
     */
    private function makeRequest($endpoint, $data = null, $method = 'GET') {
        $url = $this->base_url . $endpoint;
        
        // DEBUG: Log completo da requisição
        error_log('=== ASAAS API REQUISIÇÃO CURL ===');
        error_log('Timestamp: ' . date('Y-m-d H:i:s'));
        error_log('Endpoint: ' . $endpoint);
        error_log('Method: ' . $method);
        error_log('URL: ' . $url);
        
        // Mascarar dados sensíveis para log
        $logData = $data;
        if ($logData && isset($logData['creditCard'])) {
            $logData['creditCard']['number'] = $this->maskCardNumber($logData['creditCard']['number']);
            $logData['creditCard']['ccv'] = '***';
        }
        
        error_log('Headers: ' . json_encode([
            'Content-Type: application/json',
            'access_token: [MASKED]',
            'User-Agent: AnySummit-PHP/1.0'
        ]));
        
        if ($logData) {
            error_log('Dados enviados (mascarados): ' . json_encode($logData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }
        
        // Preparar comando CURL equivalente (para debug)
        $curlCommand = "curl -X $method '$url' \\\n";
        $curlCommand .= "  -H 'Content-Type: application/json' \\\n";
        $curlCommand .= "  -H 'access_token: [MASKED]' \\\n";
        $curlCommand .= "  -H 'User-Agent: AnySummit-PHP/1.0'";
        
        if ($data && in_array($method, ['POST', 'PUT'])) {
            $curlCommand .= " \\\n  -d '" . json_encode($data) . "'"; // CORREÇÃO: usar dados reais, não mascarados
        }
        
        error_log('CURL Equivalente: ' . $curlCommand);
        
        $headers = [
            'Content-Type: application/json',
            'access_token: ' . $this->access_token,
            'User-Agent: AnySummit-PHP/1.0'
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        } elseif ($method === 'PUT') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        }
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_info = curl_getinfo($ch);
        $error = curl_error($ch);
        curl_close($ch);
        
        // DEBUG: Log completo da resposta
        error_log('=== ASAAS API RESPOSTA ===');
        error_log('HTTP Code: ' . $http_code);
        error_log('Response Time: ' . number_format($curl_info['total_time'], 3) . 's');
        error_log('Response Headers Info: ' . json_encode([
            'content_type' => $curl_info['content_type'],
            'http_code' => $curl_info['http_code'],
            'header_size' => $curl_info['header_size'],
            'request_size' => $curl_info['request_size']
        ]));
        
        if ($error) {
            error_log('CURL Error: ' . $error);
            error_log('=== FIM DEBUG COM ERRO ===');
            throw new Exception('Erro cURL: ' . $error);
        }
        
        error_log('Resposta Completa: ' . $response);
        error_log('=== FIM DEBUG SUCESSO ===');
        
        $decoded_response = json_decode($response, true);
        
        if ($http_code >= 400) {
            $error_message = 'Erro HTTP ' . $http_code;
            if (isset($decoded_response['errors'])) {
                $error_message .= ': ' . json_encode($decoded_response['errors']);
            }
            error_log('Erro processado: ' . $error_message);
            throw new Exception($error_message);
        }
        
        return $decoded_response;
    }
    
    /**
     * Mascarar número do cartão para logs
     */
    private function maskCardNumber($cardNumber) {
        if (!$cardNumber) return '****';
        $cleaned = preg_replace('/[^0-9]/', '', $cardNumber);
        if (strlen($cleaned) < 4) return '****';
        return '**** **** **** ' . substr($cleaned, -4);
    }
    
    /**
     * Criar um cliente no Asaas
     */
    public function createCustomer($customerData) {
        return $this->makeRequest('/customers', $customerData, 'POST');
    }
    
    /**
     * Buscar cliente por CPF/CNPJ
     */
    public function getCustomerByCpfCnpj($cpfCnpj) {
        $endpoint = '/customers?cpfCnpj=' . urlencode($cpfCnpj);
        $response = $this->makeRequest($endpoint);
        
        if (isset($response['data']) && count($response['data']) > 0) {
            return $response['data'][0];
        }
        
        return null;
    }
    
    /**
     * Criar cobrança com cartão de crédito (endpoint lean para cobrança imediata)
     */
    public function createCreditCardPayment($paymentData) {
        return $this->makeRequest('/lean/payments', $paymentData, 'POST');
    }
    
    /**
     * Criar cobrança PIX
     */
    public function createPixPayment($paymentData) {
        // Garantir que seja PIX e configurar adequadamente
        $paymentData['billingType'] = 'PIX';
        
        // Configurações específicas para PIX para evitar emails automáticos
        if (!isset($paymentData['notificationDisabled'])) {
            $paymentData['notificationDisabled'] = true;
        }
        if (!isset($paymentData['postalService'])) {
            $paymentData['postalService'] = false;
        }
        
        return $this->makeRequest('/payments', $paymentData, 'POST');
    }
    
    /**
     * Obter QR Code PIX
     */
    public function getPixQrCode($paymentId) {
        return $this->makeRequest('/payments/' . $paymentId . '/pixQrCode');
    }
    
    /**
     * Criar cobrança com boleto
     */
    public function createBoletoPayment($paymentData) {
        return $this->makeRequest('/payments', $paymentData, 'POST');
    }
    
    /**
     * Consultar status de um pagamento
     */
    public function getPaymentStatus($paymentId) {
        return $this->makeRequest('/payments/' . $paymentId);
    }
    
    /**
     * Alias para getPaymentStatus (compatibilidade)
     */
    public function getPayment($paymentId) {
        return $this->getPaymentStatus($paymentId);
    }
    
    /**
     * Listar webhooks configurados
     */
    public function getWebhooks() {
        return $this->makeRequest('/webhooks');
    }
    
    /**
     * Configurar webhook
     */
    public function createWebhook($webhookData) {
        return $this->makeRequest('/webhooks', $webhookData, 'POST');
    }
}
?>