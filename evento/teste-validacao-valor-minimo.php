<?php
// Teste das validações de valor mínimo no checkout
echo "<h3>🧪 Teste das Validações de Valor Mínimo - Checkout</h3>";

echo "<h4>📋 Regras Implementadas:</h4>";
echo "<div style='border: 1px solid #ddd; padding: 15px; margin: 10px 0; background: #f9f9f9;'>";
echo "<ul>";
echo "<li><strong>Valor < R$ 5,00:</strong> ❌ Nenhum método disponível</li>";
echo "<li><strong>Valor R$ 5,00 - R$ 14,99:</strong> ⚠️ Só cartão de crédito</li>";
echo "<li><strong>Valor ≥ R$ 15,00:</strong> ✅ Todos os métodos (cartão, PIX, boleto)</li>";
echo "<li><strong>Parcela < R$ 5,00:</strong> 🚫 Opção não aparece</li>";
echo "<li><strong>PIX:</strong> 💳 Disponível apenas acima de R$ 15,00</li>";
echo "</ul>";
echo "</div>";

echo "<h4>🎯 Cenários de Teste:</h4>";

$cenarios = [
    ['valor' => 3.50, 'descricao' => 'Valor muito baixo', 'esperado' => 'Nenhum método disponível'],
    ['valor' => 4.99, 'descricao' => 'Quase R$ 5,00', 'esperado' => 'Nenhum método disponível'],
    ['valor' => 5.00, 'descricao' => 'Exatamente R$ 5,00', 'esperado' => 'Só cartão à vista'],
    ['valor' => 7.50, 'descricao' => 'R$ 7,50', 'esperado' => 'Só cartão (até 1x), PIX bloqueado'],
    ['valor' => 10.00, 'descricao' => 'R$ 10,00', 'esperado' => 'Só cartão (até 2x), PIX bloqueado'],
    ['valor' => 14.99, 'descricao' => 'Quase R$ 15,00', 'esperado' => 'Só cartão (até 2x), PIX bloqueado'],
    ['valor' => 15.00, 'descricao' => 'Exatamente R$ 15,00', 'esperado' => 'Todos os métodos, cartão até 3x'],
    ['valor' => 25.00, 'descricao' => 'R$ 25,00', 'esperado' => 'Todos os métodos, cartão até 5x'],
    ['valor' => 60.00, 'descricao' => 'R$ 60,00', 'esperado' => 'Todos os métodos, cartão até 12x']
];

foreach ($cenarios as $index => $cenario) {
    $parcelas_max = floor($cenario['valor'] / 5); // Máximo de parcelas com valor >= R$ 5,00
    if ($parcelas_max > 12) $parcelas_max = 12;
    
    $cor = '';
    if ($cenario['valor'] < 5) {
        $cor = '#f8d7da'; // Vermelho claro - nenhum método
    } elseif ($cenario['valor'] < 15) {
        $cor = '#fff3cd'; // Amarelo claro - só cartão
    } else {
        $cor = '#d1edff'; // Azul claro - todos os métodos
    }
    
    echo "<div style='border: 1px solid #ccc; padding: 15px; margin: 10px 0; background: $cor;'>";
    echo "<h5>📊 Cenário " . ($index + 1) . ": " . $cenario['descricao'] . "</h5>";
    echo "<p><strong>Valor:</strong> R$ " . number_format($cenario['valor'], 2, ',', '.') . "</p>";
    echo "<p><strong>Resultado Esperado:</strong> " . $cenario['esperado'] . "</p>";
    
    if ($cenario['valor'] >= 5) {
        echo "<p><strong>Parcelas Disponíveis:</strong> ";
        if ($cenario['valor'] < 15) {
            echo "1x até {$parcelas_max}x (só cartão, PIX bloqueado)";
        } else {
            echo "1x até {$parcelas_max}x + PIX e boleto disponíveis";
        }
        echo "</p>";
        
        // Mostrar status do PIX
        if ($cenario['valor'] < 15) {
            echo "<p><strong>PIX:</strong> <span style='color: #dc3545;'>❌ Bloqueado (mín. R$ 15,00)</span></p>";
        } else {
            echo "<p><strong>PIX:</strong> <span style='color: #28a745;'>✅ Disponível</span></p>";
        }
    }
    
    // Simular carrinho para teste
    $carrinho = json_encode([
        'total' => $cenario['valor'],
        'subtotal' => $cenario['valor'],
        'desconto' => 0,
        'evento' => ['nome' => 'Evento Teste']
    ]);
    
    echo "<button onclick='testarCenario($index, $carrinho)' class='btn btn-primary btn-sm'>🧪 Testar este Cenário</button>";
    echo "</div>";
}

echo "<h4>💻 JavaScript para Teste:</h4>";
echo "<div style='background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace;'>";
echo "function testarCenario(index, carrinho) {<br>";
echo "&nbsp;&nbsp;sessionStorage.setItem('carrinho', JSON.stringify(carrinho));<br>";
echo "&nbsp;&nbsp;window.open('/evento/checkout.php?evento=goianarh', '_blank');<br>";
echo "}<br>";
echo "</div>";

echo "<h4>🔍 Como Testar:</h4>";
echo "<ol>";
echo "<li>Clique em 'Testar este Cenário' para abrir o checkout com o valor específico</li>";
echo "<li>Observe quais métodos de pagamento estão disponíveis</li>";
echo "<li>Se for cartão, verifique quantas parcelas aparecem</li>";
echo "<li>Tente selecionar métodos desabilitados para ver os alertas</li>";
echo "</ol>";

echo "<h4>✅ Validações Implementadas:</h4>";
echo "<div style='background: #d4edda; padding: 15px; border-radius: 5px;'>";
echo "<ul>";
echo "<li>✅ <strong>Valor mínimo R$ 5,00</strong> para qualquer pagamento</li>";
echo "<li>✅ <strong>Parcela mínima R$ 5,00</strong> no cartão</li>";
echo "<li>✅ <strong>PIX mínimo R$ 15,00</strong> - bloqueado abaixo deste valor</li>";
echo "<li>✅ <strong>Valores R$ 5,00-R$ 14,99:</strong> Só cartão disponível</li>";
echo "<li>✅ <strong>Interface visual</strong> mostra métodos desabilitados</li>";
echo "<li>✅ <strong>Alertas informativos</strong> para cada faixa de valor</li>";
echo "<li>✅ <strong>Validação em tempo real</strong> ao selecionar métodos</li>";
echo "</ul>";
echo "</div>";

echo "<h4>📱 Arquivo de Teste Rápido:</h4>";
echo "<p>Para teste direto: <a href='checkout.php?evento=goianarh' target='_blank'>🔗 Abrir Checkout</a></p>";
echo "<p><small>Lembre-se de ter itens no sessionStorage do carrinho para testar</small></p>";

echo "<script>";
echo "function testarCenario(index, carrinho) {";
echo "    sessionStorage.setItem('carrinho', JSON.stringify(carrinho));";
echo "    window.open('checkout.php?evento=goianarh', '_blank');";
echo "}";
echo "</script>";

echo "<style>";
echo ".btn { padding: 8px 16px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; border: none; cursor: pointer; }";
echo ".btn:hover { background: #0056b3; }";
echo ".btn-sm { padding: 6px 12px; font-size: 0.875rem; }";
echo "</style>";
?>
