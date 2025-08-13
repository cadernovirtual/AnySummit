<?php
// Teste detalhado de geração de JPG e envio de email
include("evento/conm/conn.php");

echo "<h2>Teste Detalhado - Email com Anexo JPG</h2>";

// Buscar um ingresso vinculado para teste
$sql = "SELECT ii.*, e.nome as evento_nome 
        FROM tb_ingressos_individuais ii
        LEFT JOIN eventos e ON ii.eventoid = e.id
        WHERE ii.participanteid IS NOT NULL 
        LIMIT 1";

$result = $con->query($sql);

if ($result && $result->num_rows > 0) {
    $ingresso = $result->fetch_assoc();
    
    // Gerar hash para teste
    $secret_key = "AnySummit2025@#$%ingresso";
    $timestamp = strtotime($ingresso['criado_em']);
    $hash = hash('sha256', $secret_key . $ingresso['id'] . $timestamp);
    
    echo "<div style='background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>Dados do Ingresso:</strong><br>";
    echo "ID: " . $ingresso['id'] . "<br>";
    echo "Código: " . $ingresso['codigo_ingresso'] . "<br>";
    echo "Evento: " . $ingresso['evento_nome'] . "<br>";
    echo "Hash: " . $hash . "<br>";
    echo "Participante: " . ($ingresso['participante_nome'] ?: 'Não vinculado') . "<br>";
    echo "Email: " . ($ingresso['participante_email'] ?: 'Não informado') . "<br>";
    echo "</div>";
    
    // Testar APIs de geração de JPG
    echo "<h3>1. Testando APIs de Geração de JPG:</h3>";
    
    // Testar API 1 (ImageMagick)
    echo "<strong>API 1 (ImageMagick):</strong><br>";
    $api1_url = "https://" . $_SERVER['HTTP_HOST'] . "/evento/api/gerar-ingresso-jpg.php?h=" . $hash . "&action=path";
    echo "URL: <a href='$api1_url' target='_blank'>$api1_url</a><br>";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $api1_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response1 = curl_exec($ch);
    $http_code1 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Code: $http_code1<br>";
    echo "Response: " . htmlspecialchars(substr($response1, 0, 500)) . "<br>";
    
    $api1_success = false;
    if ($http_code1 == 200) {
        $decoded1 = json_decode($response1, true);
        if ($decoded1 && isset($decoded1['success']) && $decoded1['success']) {
            echo "<span style='color: green;'>✅ API 1 funcionou!</span><br>";
            echo "Arquivo: " . $decoded1['file_path'] . "<br>";
            $api1_success = true;
        } else {
            echo "<span style='color: red;'>❌ API 1 falhou - JSON inválido</span><br>";
        }
    } else {
        echo "<span style='color: red;'>❌ API 1 falhou - HTTP $http_code1</span><br>";
    }
    
    echo "<br>";
    
    // Testar API 2 (PHP GD)
    echo "<strong>API 2 (PHP GD):</strong><br>";
    $api2_url = "https://" . $_SERVER['HTTP_HOST'] . "/evento/api/gerar-ingresso-jpg-php.php?h=" . $hash . "&action=path";
    echo "URL: <a href='$api2_url' target='_blank'>$api2_url</a><br>";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $api2_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response2 = curl_exec($ch);
    $http_code2 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Code: $http_code2<br>";
    echo "Response: " . htmlspecialchars(substr($response2, 0, 500)) . "<br>";
    
    $api2_success = false;
    if ($http_code2 == 200) {
        $decoded2 = json_decode($response2, true);
        if ($decoded2 && isset($decoded2['success']) && $decoded2['success']) {
            echo "<span style='color: green;'>✅ API 2 funcionou!</span><br>";
            echo "Arquivo: " . $decoded2['file_path'] . "<br>";
            $api2_success = true;
        } else {
            echo "<span style='color: red;'>❌ API 2 falhou - JSON inválido</span><br>";
        }
    } else {
        echo "<span style='color: red;'>❌ API 2 falhou - HTTP $http_code2</span><br>";
    }
    
    echo "<br>";
    
    // Teste de email
    if (!empty($ingresso['participante_email']) && ($api1_success || $api2_success)) {
        echo "<h3>2. Teste de Envio de Email:</h3>";
        
        if (isset($_POST['enviar_teste'])) {
            include_once('evento/api/email-com-anexo.php');
            
            echo "<div style='background: #e7f3ff; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;'>";
            echo "<strong>Enviando email de teste...</strong><br><br>";
            
            $inicio = microtime(true);
            
            $sucesso = EmailComAnexo::enviarIngressoComJPG(
                $ingresso['participante_email'],
                $ingresso['participante_nome'],
                "TESTE DETALHADO - Seu ingresso para " . $ingresso['evento_nome'],
                $ingresso
            );
            
            $tempo = round((microtime(true) - $inicio), 2);
            
            if ($sucesso) {
                echo "<span style='color: green; font-weight: bold;'>✅ Email enviado com sucesso!</span><br>";
                echo "Tempo: {$tempo}s<br>";
                echo "Destinatário: " . $ingresso['participante_email'] . "<br>";
                echo "<em>Verifique a caixa de entrada (e spam) do destinatário.</em>";
            } else {
                echo "<span style='color: red; font-weight: bold;'>❌ Falha ao enviar email</span><br>";
                echo "Tempo: {$tempo}s<br>";
            }
            echo "</div>";
        } else {
            echo "<form method='POST' style='margin: 10px 0;'>";
            echo "<button type='submit' name='enviar_teste' style='padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;'>";
            echo "🚀 Enviar Email de Teste para " . $ingresso['participante_email'];
            echo "</button>";
            echo "</form>";
            
            echo "<div style='background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0;'>";
            echo "<strong>⚠️ Atenção:</strong> Este teste enviará um email real para o participante.";
            echo "</div>";
        }
    } else {
        echo "<h3>2. Teste de Email:</h3>";
        if (empty($ingresso['participante_email'])) {
            echo "<span style='color: orange;'>⚠️ Ingresso não tem email vinculado</span><br>";
        }
        if (!$api1_success && !$api2_success) {
            echo "<span style='color: red;'>❌ Nenhuma API de JPG funcionou - não é possível testar email</span><br>";
        }
    }
    
    // Links de download direto
    echo "<h3>3. Download Direto:</h3>";
    echo "<a href='/evento/api/gerar-ingresso-jpg.php?h=" . $hash . "' target='_blank' style='display: inline-block; margin: 5px; padding: 10px 15px; background: #28a745; color: white; text-decoration: none; border-radius: 5px;'>📥 Download JPG (ImageMagick)</a><br>";
    echo "<a href='/evento/api/gerar-ingresso-jpg-php.php?h=" . $hash . "' target='_blank' style='display: inline-block; margin: 5px; padding: 10px 15px; background: #17a2b8; color: white; text-decoration: none; border-radius: 5px;'>📥 Download JPG (PHP GD)</a><br>";
    echo "<a href='/evento/api/ver-ingresso-individual.php?h=" . $hash . "' target='_blank' style='display: inline-block; margin: 5px; padding: 10px 15px; background: #6f42c1; color: white; text-decoration: none; border-radius: 5px;'>👁️ Ver HTML Original</a><br>";
    
} else {
    echo "<div style='background: #f8d7da; padding: 15px; border-radius: 5px; color: #721c24;'>";
    echo "<strong>❌ Nenhum ingresso vinculado encontrado</strong><br>";
    echo "Para testar, primeiro vincule um ingresso a um participante usando a página de validação.";
    echo "</div>";
}

echo "<br><br><a href='/validar-ingresso.php' style='color: #007bff; text-decoration: none;'>← Voltar para validação</a>";
echo " | <a href='/teste-jpg.php' style='color: #007bff; text-decoration: none;'>Ver teste simples</a>";
?>
