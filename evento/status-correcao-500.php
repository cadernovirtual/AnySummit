<?php
echo "<h1>✅ Erro 500 da Página do Evento - CORRIGIDO!</h1>";

echo "<h2>Problemas Identificados e Corrigidos:</h2>";

echo "<h3>1. Sintaxe MySQLi Inconsistente</h3>";
echo "❌ <strong>Problema:</strong> Arquivo usava sintaxe OOP (\$con->prepare()) com conexão procedural<br>";
echo "✅ <strong>Corrigido:</strong> Alterado para mysqli_prepare(), mysqli_stmt_bind_param(), etc.<br>";

echo "<h3>2. Visibilidade do Evento</h3>";
echo "❌ <strong>Problema:</strong> Evento tinha visibilidade vazia, mas consulta procurava 'publico'<br>";
echo "✅ <strong>Corrigido:</strong> Atualizada visibilidade no banco para 'publico' e consulta aceita valores vazios<br>";

echo "<h2>Correções Aplicadas:</h2>";
echo "<ul>";
echo "<li>✅ Substituído \$con->prepare() por mysqli_prepare()</li>";
echo "<li>✅ Substituído \$stmt->bind_param() por mysqli_stmt_bind_param()</li>";
echo "<li>✅ Substituído \$stmt->execute() por mysqli_stmt_execute()</li>";
echo "<li>✅ Substituído \$stmt->get_result() por mysqli_stmt_get_result()</li>";
echo "<li>✅ Substituído \$result->fetch_assoc() por mysqli_fetch_assoc()</li>";
echo "<li>✅ Atualizada visibilidade do evento no banco</li>";
echo "<li>✅ Consulta SQL aceita visibilidade vazia ou 'publico'</li>";
echo "</ul>";

echo "<h2>Status do Evento:</h2>";
include("conm/conn.php");
$sql = "SELECT id, nome, slug, status, visibilidade FROM eventos WHERE slug = 'evento'";
$result = mysqli_query($con, $sql);
$evento = mysqli_fetch_assoc($result);

if ($evento) {
    echo "<div style='background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>Evento encontrado:</strong><br>";
    echo "ID: " . $evento['id'] . "<br>";
    echo "Nome: " . $evento['nome'] . "<br>";
    echo "Slug: " . $evento['slug'] . "<br>";
    echo "Status: " . $evento['status'] . "<br>";
    echo "Visibilidade: " . $evento['visibilidade'] . "<br>";
    echo "</div>";
} else {
    echo "<div style='background: #f8d7da; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
    echo "❌ Evento não encontrado";
    echo "</div>";
}

echo "<h2>Testar Agora:</h2>";
echo "<div style='background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
echo "<strong>URL Correta:</strong><br>";
echo "<a href='/evento/evento' target='_blank' style='font-size: 18px; color: #0066cc;'>";
echo "https://anysummit.anysolutions.com.br/evento/evento";
echo "</a>";
echo "</div>";

echo "<p><strong>A página do evento deve funcionar normalmente agora!</strong></p>";
?>