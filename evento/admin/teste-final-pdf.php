<?php
// Teste final - Todas as versões de PDF
include("../conm/conn.php");

echo "<h1>🎫 Teste Completo - Gerador de PDF de Ingressos</h1>";

// Buscar pedidos disponíveis
$sql = "SELECT DISTINCT p.pedidoid, p.codigo_pedido, COUNT(ii.id) as total_ingressos
        FROM tb_pedidos p 
        INNER JOIN tb_ingressos_individuais ii ON p.pedidoid = ii.pedidoid
        GROUP BY p.pedidoid, p.codigo_pedido
        ORDER BY p.pedidoid DESC
        LIMIT 3";

$result = $con->query($sql);

if ($result->num_rows > 0) {
    echo "<div style='background: #e3f2fd; padding: 20px; border-radius: 10px; margin: 20px 0;'>";
    echo "<h2 style='color: #1976d2; margin-bottom: 15px;'>📋 Versões Disponíveis</h2>";
    echo "<table border='1' style='border-collapse: collapse; width: 100%; margin: 10px 0;'>";
    echo "<tr style='background: #f8f9fa;'>
        <th style='padding: 15px;'>Versão</th>
        <th style='padding: 15px;'>Descrição</th>
        <th style='padding: 15px;'>Resultado</th>
        <th style='padding: 15px;'>Ação</th>
    </tr>";
    
    // Pegar o primeiro pedido para teste
    $pedido_teste = $result->fetch_assoc();
    $pid = $pedido_teste['pedidoid'];
    
    echo "<tr>";
    echo "<td style='padding: 12px;'><strong>Final (Recomendada)</strong></td>";
    echo "<td style='padding: 12px;'>Tenta PDF real primeiro, se não conseguir usa HTML otimizado</td>";
    echo "<td style='padding: 12px;'><span style='background: #4caf50; color: white; padding: 4px 8px; border-radius: 4px;'>PDF ou HTML</span></td>";
    echo "<td style='padding: 12px; text-align: center;'>";
    echo "<a href='../api/gerar-pdf-final.php?pedido_id=$pid' style='background: #4caf50; color: white; padding: 8px 16px; text-decoration: none; border-radius: 5px; font-weight: bold;'>🏆 Testar</a>";
    echo "</td>";
    echo "</tr>";
    
    echo "<tr>";
    echo "<td style='padding: 12px;'>HTML Avançado</td>";
    echo "<td style='padding: 12px;'>HTML otimizado para conversão manual em PDF</td>";
    echo "<td style='padding: 12px;'><span style='background: #2196f3; color: white; padding: 4px 8px; border-radius: 4px;'>HTML</span></td>";
    echo "<td style='padding: 12px; text-align: center;'>";
    echo "<a href='../api/gerar-ingressos-pdf-download.php?pedido_id=$pid' style='background: #2196f3; color: white; padding: 8px 16px; text-decoration: none; border-radius: 5px;'>📄 Testar</a>";
    echo "</td>";
    echo "</tr>";
    
    echo "<tr>";
    echo "<td style='padding: 12px;'>Visualização</td>";
    echo "<td style='padding: 12px;'>Abre em nova aba para visualização (versão original)</td>";
    echo "<td style='padding: 12px;'><span style='background: #ff9800; color: white; padding: 4px 8px; border-radius: 4px;'>Visualizar</span></td>";
    echo "<td style='padding: 12px; text-align: center;'>";
    echo "<a href='../api/gerar-ingressos-pdf.php?pedido_id=$pid' target='_blank' style='background: #ff9800; color: white; padding: 8px 16px; text-decoration: none; border-radius: 5px;'>👁️ Testar</a>";
    echo "</td>";
    echo "</tr>";
    
    echo "</table>";
    echo "</div>";
    
    // Lista de todos os pedidos
    echo "<div style='background: #f3e5f5; padding: 20px; border-radius: 10px; margin: 20px 0;'>";
    echo "<h2 style='color: #7b1fa2; margin-bottom: 15px;'>📦 Todos os Pedidos Disponíveis</h2>";
    
    // Reset result
    $result = $con->query($sql);
    
    echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    echo "<tr style='background: #f8f9fa;'>
        <th style='padding: 10px;'>ID</th>
        <th style='padding: 10px;'>Código</th>
        <th style='padding: 10px;'>Ingressos</th>
        <th style='padding: 10px;'>Teste Rápido</th>
    </tr>";
    
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td style='padding: 8px; text-align: center;'>" . $row['pedidoid'] . "</td>";
        echo "<td style='padding: 8px;'>" . htmlspecialchars($row['codigo_pedido']) . "</td>";
        echo "<td style='padding: 8px; text-align: center;'>" . $row['total_ingressos'] . "</td>";
        echo "<td style='padding: 8px; text-align: center;'>";
        echo "<a href='../api/gerar-pdf-final.php?pedido_id=" . $row['pedidoid'] . "' style='background: #9c27b0; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; font-size: 12px;'>💾 Download</a>";
        echo "</td>";
        echo "</tr>";
    }
    echo "</table>";
    echo "</div>";
    
    // Instruções
    echo "<div style='background: #e8f5e9; padding: 20px; border-radius: 10px; margin: 20px 0;'>";
    echo "<h2 style='color: #2e7d32; margin-bottom: 15px;'>📖 Como Funciona</h2>";
    echo "<ol style='line-height: 1.8; font-size: 16px;'>";
    echo "<li><strong>Versão Final (Recomendada):</strong>";
    echo "<ul style='margin: 8px 0; font-size: 14px;'>";
    echo "<li>🔄 Tenta gerar PDF real usando wkhtmltopdf</li>";
    echo "<li>📄 Se não conseguir, gera HTML otimizado para conversão</li>";
    echo "<li>✅ Melhor experiência para o usuário</li>";
    echo "</ul></li>";
    echo "<li><strong>Se baixar HTML:</strong>";
    echo "<ul style='margin: 8px 0; font-size: 14px;'>";
    echo "<li>📁 Abra o arquivo baixado</li>";
    echo "<li>🖨️ Pressione Ctrl+P</li>";
    echo "<li>💾 Escolha 'Salvar como PDF'</li>";
    echo "<li>⚙️ Configure: A4, sem margens, retrato</li>";
    echo "</ul></li>";
    echo "</ol>";
    echo "</div>";
    
    // Status do sistema
    echo "<div style='background: #fff3e0; padding: 20px; border-radius: 10px; margin: 20px 0;'>";
    echo "<h2 style='color: #f57c00; margin-bottom: 15px;'>⚙️ Status do Sistema</h2>";
    
    // Verificar wkhtmltopdf
    $wkhtmltopdf_status = '❌ Não disponível';
    if (function_exists('exec')) {
        $output = [];
        $return_var = 0;