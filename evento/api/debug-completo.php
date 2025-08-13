<?php
// Debug específico do pagamento-cartao.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== DEBUG PAGAMENTO CARTAO ===\n";

// Verificar se os includes funcionam
echo "1. Testando includes...\n";

try {
    include("../conm/conn.php");
    echo "   conn.php: OK\n";
} catch (Throwable $e) {
    echo "   conn.php: ERRO - " . $e->getMessage() . "\n";
    exit;
}

try {
    include("AsaasAPI.php");
    echo "   AsaasAPI.php: OK\n";
} catch (Throwable $e) {
    echo "   AsaasAPI.php: ERRO - " . $e->getMessage() . "\n";
    exit;
}

// Verificar se as funções podem ser definidas
echo "2. Testando definições de função...\n";

function maskCardNumber($cardNumber) {
    $cleaned = preg_replace('/[^0-9]/', '', $cardNumber);
    if (strlen($cleaned) < 4) return '****';
    return str_repeat('*', strlen($cleaned) - 4) . substr($cleaned, -4);
}

function cleanCvv($cvv) {
    $cleaned = preg_replace('/\D+/', '', trim($cvv));
    return substr($cleaned, 0, 4);
}

function filterEmptyFields($array) {
    if (!is_array($array)) {
        return $array;
    }
    
    $filtered = [];
    
    foreach ($array as $key => $value) {
        if (is_array($value)) {
            $filteredSubArray = filterEmptyFields($value);
            if (!empty($filteredSubArray)) {
                $filtered[$key] = $filteredSubArray;
            }
        } elseif ($value !== "" && $value !== null && $value !== false) {
            $filtered[$key] = $value;
        }
    }
    
    return $filtered;
}

echo "   Funções básicas: OK\n";

// Testar AsaasAPI
echo "3. Testando AsaasAPI...\n";
try {
    $asaas = new AsaasAPI('production');
    echo "   AsaasAPI instanciada: OK\n";
} catch (Throwable $e) {
    echo "   AsaasAPI: ERRO - " . $e->getMessage() . "\n";
    echo "   Linha: " . $e->getLine() . "\n";
}

echo "=== FIM DEBUG ===\n";
?>