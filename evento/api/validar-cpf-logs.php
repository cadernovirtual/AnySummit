<?php
// Validar o CPF que aparece nos seus logs
function validarCPF($cpf) {
    // Remove formatação
    $cpf = preg_replace('/[^0-9]/', '', $cpf);
    
    // Verifica se tem 11 dígitos
    if (strlen($cpf) != 11) {
        return false;
    }
    
    // Verifica se não é sequência repetida
    if (preg_match('/(\d)\1{10}/', $cpf)) {
        return false;
    }
    
    // Calcula primeiro dígito verificador
    $soma = 0;
    for ($i = 0; $i < 9; $i++) {
        $soma += intval($cpf[$i]) * (10 - $i);
    }
    $resto = $soma % 11;
    $digito1 = ($resto < 2) ? 0 : 11 - $resto;
    
    // Calcula segundo dígito verificador
    $soma = 0;
    for ($i = 0; $i < 10; $i++) {
        $soma += intval($cpf[$i]) * (11 - $i);
    }
    $resto = $soma % 11;
    $digito2 = ($resto < 2) ? 0 : 11 - $resto;
    
    // Verifica se os dígitos conferem
    return ($cpf[9] == $digito1 && $cpf[10] == $digito2);
}

echo "<h1>🔍 VALIDAÇÃO DO SEU CPF DOS LOGS</h1>";

$cpfDosLogs = '16786744869';

echo "<h2>CPF dos logs: {$cpfDosLogs}</h2>";

if (validarCPF($cpfDosLogs)) {
    echo "✅ <span style='color: green; font-size: 18px;'><strong>CPF VÁLIDO</strong></span><br>";
    echo "O problema NÃO é o CPF.<br>";
} else {
    echo "❌ <span style='color: red; font-size: 18px;'><strong>CPF INVÁLIDO</strong></span><br>";
    echo "O problema É o CPF sendo enviado para o Asaas.<br>";
}

echo "<h2>Análise detalhada:</h2>";
echo "CPF: {$cpfDosLogs}<br>";
echo "Tamanho: " . strlen($cpfDosLogs) . " caracteres<br>";

// Mostrar cálculo dos dígitos verificadores
$cpfLimpo = preg_replace('/[^0-9]/', '', $cpfDosLogs);
echo "CPF limpo: {$cpfLimpo}<br>";

if (strlen($cpfLimpo) == 11) {
    // Calcular dígito 1
    $soma1 = 0;
    for ($i = 0; $i < 9; $i++) {
        $soma1 += intval($cpfLimpo[$i]) * (10 - $i);
    }
    $resto1 = $soma1 % 11;
    $digito1Calculado = ($resto1 < 2) ? 0 : 11 - $resto1;
    
    // Calcular dígito 2
    $soma2 = 0;
    for ($i = 0; $i < 10; $i++) {
        $soma2 += intval($cpfLimpo[$i]) * (11 - $i);
    }
    $resto2 = $soma2 % 11;
    $digito2Calculado = ($resto2 < 2) ? 0 : 11 - $resto2;
    
    echo "Dígito 1 - Esperado: {$cpfLimpo[9]}, Calculado: {$digito1Calculado} " . ($cpfLimpo[9] == $digito1Calculado ? "✅" : "❌") . "<br>";
    echo "Dígito 2 - Esperado: {$cpfLimpo[10]}, Calculado: {$digito2Calculado} " . ($cpfLimpo[10] == $digito2Calculado ? "✅" : "❌") . "<br>";
}

echo "<hr>";

echo "<h2>🎯 CONCLUSÃO:</h2>";

if (validarCPF($cpfDosLogs)) {
    echo "<div style='background: lightgreen; padding: 15px; border-radius: 8px;'>";
    echo "<h3>CPF está correto!</h3>";
    echo "<p>O problema NÃO é o CPF. Pode ser:</p>";
    echo "<ul>";
    echo "<li>Campo mobilePhone específico</li>";
    echo "<li>Combinação de campos</li>";
    echo "<li>Configuração da conta Asaas</li>";
    echo "<li>Outro campo obrigatório faltando</li>";
    echo "</ul>";
    echo "</div>";
} else {
    echo "<div style='background: lightcoral; padding: 15px; border-radius: 8px;'>";
    echo "<h3>CPF está INVÁLIDO!</h3>";
    echo "<p>Este é o problema! O sistema está enviando um CPF inválido para o Asaas.</p>";
    echo "<p>Verificar:</p>";
    echo "<ul>";
    echo "<li>Validação de CPF no frontend</li>";
    echo "<li>Limpeza/formatação do CPF</li>";
    echo "<li>Como o CPF está chegando na API</li>";
    echo "</ul>";
    echo "</div>";
}

?>
