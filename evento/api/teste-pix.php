<?php
// Arquivo para testar a integração PIX com Asaas
include("AsaasAPI.php");

try {
    echo "=== TESTE DE INTEGRAÇÃO PIX ASAAS ===\n\n";
    
    // Inicializar API
    $asaas = new AsaasAPI('production'); // Altere para 'sandbox' se necessário
    
    // 1. Criar cliente de teste
    echo "1. Criando cliente de teste...\n";
    
    $customerData = [
        'name' => 'João da Silva Teste',
        'cpfCnpj' => '12345678901', // CPF fictício para teste
        'email' => 'joao.teste@email.com',
        'phone' => '1140041234',
        'mobilePhone' => '11999887766',
        'postalCode' => '01310100',
        'address' => 'Av. Paulista',
        'addressNumber' => '1000',
        'complement' => 'Sala 100',
        'province' => 'Bela Vista',
        'city' => 'São Paulo',
        'state' => 'SP'
    ];
    
    $customer = $asaas->createCustomer($customerData);
    echo "Cliente criado: " . $customer['id'] . " - " . $customer['name'] . "\n\n";
    
    // 2. Criar cobrança PIX
    echo "2. Criando cobrança PIX...\n";
    
    $paymentData = [
        'customer' => $customer['id'],
        'billingType' => 'PIX',
        'value' => 100.00, // R$ 100,00 para teste
        'dueDate' => date('Y-m-d'),
        'description' => 'Teste PIX - Ingresso Evento',
        'externalReference' => 'TESTE_PIX_' . date('YmdHis')
    ];
    
    $payment = $asaas->createPixPayment($paymentData);
    echo "Cobrança PIX criada: " . $payment['id'] . "\n";
    echo "Status: " . $payment['status'] . "\n";
    echo "Valor: R$ " . $payment['value'] . "\n\n";
    
    // 3. Obter QR Code PIX
    echo "3. Obtendo QR Code PIX...\n";
    
    // Aguardar um pouco para o QR Code ser gerado
    sleep(3);
    
    $qrCodeData = $asaas->getPixQrCode($payment['id']);
    
    if (isset($qrCodeData['qrCode'])) {
        echo "QR Code gerado com sucesso!\n";
        echo "Payload PIX: " . substr($qrCodeData['payload'], 0, 50) . "...\n";
        echo "Tamanho da imagem: " . strlen($qrCodeData['encodedImage']) . " bytes\n\n";
    } else {
        echo "Erro ao gerar QR Code: " . print_r($qrCodeData, true) . "\n\n";
    }
    
    echo "=== TESTE CONCLUÍDO COM SUCESSO ===\n";
    echo "ID do Pagamento: " . $payment['id'] . "\n";
    echo "Use este ID para consultar o status do pagamento.\n";
    
} catch (Exception $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
    echo "Verifique:\n";
    echo "- Token de acesso do Asaas\n";
    echo "- Configuração de produção/sandbox\n";
    echo "- Conectividade com a API\n";
}
?>
