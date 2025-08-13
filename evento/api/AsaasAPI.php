<?php

class AsaasAPI {
    private $base_url;
    private $access_token;
    
    public function __construct($environment = 'production') {
        // TOKEN ATUAL MANTIDO (funcionando)
        $this->access_token = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojk5NTM1N2ZmLTA3NTctNDM2Yi1hZGUyLTgxMzFjMWZjMDFlODo6JGFhY2hfMjA5ZDAyYWItNGEyOS00MTg1LTg5ZWMtOTJiYzU3NGUxODlm';
        
        // URL da API
        if ($environment === 'production') {
            $this->base_url = 'https://api.asaas.com/v3';
        } else {
            $this->base_url = 'https://sandbox.asaas.com/api/v3';
        }
    }
    
    /**
     * Fazer requisição para a API do Asaas - VERSÃO SIMPLIFICADA COMO GITHUB
     */
    private function makeRequest($endpoint, $data = null, $method = 'GET') {
        $url = $this->base_url . $endpoint;
        
        // Headers simples como no GitHub
        $headers = [
            'Content-Type: application/json',
            'access_token: ' . $this->access_token,
            'User-Agent: AsaasAPI-PHP'  // CORREÇÃO: User-Agent original
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
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            throw new Exception('Erro cURL: ' . $error);
        }
        
        $decoded_response = json_decode($response, true);
        
        if ($http_code >= 400) {
            $error_message = 'Erro HTTP ' . $http_code;
            if (isset($decoded_response['errors'])) {
                $error_message .= ': ' . json_encode($decoded_response['errors']);
            }
            throw new Exception($error_message);
        }
        
        return $decoded_response;
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
     * Criar cobrança com cartão de crédito - CORREÇÃO: ENDPOINT ORIGINAL
     */
    public function createCreditCardPayment($paymentData) {
        return $this->makeRequest('/payments', $paymentData, 'POST');  // CORREÇÃO: não é /lean/payments
    }
    
    /**
     * Criar cobrança PIX - MANTIDO COMO ESTÁ
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
     * Obter QR Code PIX - MANTIDO COMO ESTÁ
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