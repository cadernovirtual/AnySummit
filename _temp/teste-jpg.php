<?php
// Teste de geração de JPG para ingressos
include("evento/conm/conn.php");

echo "<h2>Teste de Geração de JPG para Ingressos</h2>";

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
    
    echo "<strong>Ingresso encontrado:</strong><br>";
    echo "ID: " . $ingresso['id'] . "<br>";
    echo "Código: " . $ingresso['codigo_ingresso'] . "<br>";
    echo "Evento: " . $ingresso['evento_nome'] . "<br>";
    echo "Hash: " . $hash . "<br><br>";
    
    echo "<strong>Links de teste:</strong><br>";
    echo "1. <a href='/evento/api/ver-ingresso-individual.php?h=" . $hash . "' target='_blank'>Ver Ingresso HTML</a><br>";
    echo "2. <a href='/evento/api/gerar-ingresso-jpg.php?h=" . $hash . "' target='_blank'>Download JPG (wkhtmltoimage)</a><br>";
    echo "3. <a href='/evento/api/gerar-ingresso-jpg-php.php?h=" . $hash . "' target='_blank'>Download JPG (PHP GD)</a><br>";
    echo "4. <a href='/evento/api/gerar-ingresso-jpg.php?h=" . $hash . "&action=path' target='_blank'>Testar API wkhtmltoimage (JSON)</a><br>";
    echo "5. <a href='/evento/api/gerar-ingresso-jpg-php.php?h=" . $hash . "&action=path' target='_blank'>Testar API PHP GD (JSON)</a><br><br>";
    
    // Testar envio de email
    echo "<strong>Teste de Email:</strong><br>";
    if (!empty($ingresso['participante_email'])) {
        echo "<form method='POST' style='margin: 10px 0;'>";
        echo "<input type='hidden' name='ingresso_id' value='" . $ingresso['id'] . "'>";
        echo "<input type='hidden' name='hash' value='" . $hash . "'>";
        echo "<button type='submit' name='testar_email' style='padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;'>";
        echo "Enviar Email de Teste para " . $ingresso['participante_email'];
        echo "</button>";
        echo "</form>";
    } else {
        echo "<em>Ingresso não tem email vinculado</em><br>";
    }
    
    // Processar envio de email de teste
    if (isset($_POST['testar_email'])) {
        include_once('evento/api/email-com-anexo.php');
        
        echo "<div style='margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px;'>";
        echo "<strong>Testando envio de email...</strong><br>";
        
        $sucesso = EmailComAnexo::enviarIngressoComJPG(
            $ingresso['participante_email'],
            $ingresso['participante_nome'],
            "TESTE - Seu ingresso para " . $ingresso['evento_nome'],
            $ingresso
        );
        
        if ($sucesso) {
            echo "<span style='color: green;'>✅ Email enviado com sucesso!</span>";
        } else {
            echo "<span style='color: red;'>❌ Falha ao enviar email</span>";
        }
        echo "</div>";
    }
    
} else {
    echo "<em>Nenhum ingresso vinculado encontrado para teste.</em><br>";
    echo "Para testar, primeiro vincule um ingresso a um participante.";
}

echo "<br><br><strong>Verificações de sistema:</strong><br>";

// Verificar se wkhtmltoimage está disponível
$cmd_test = "wkhtmltoimage --version 2>&1";
$output = [];
$return_code = 0;
exec($cmd_test, $output, $return_code);

if ($return_code === 0) {
    echo "✅ wkhtmltoimage disponível: " . implode(' ', $output) . "<br>";
} else {
    echo "❌ wkhtmltoimage não encontrado<br>";
    
    // Testar ImageMagick
    $cmd_test2 = "convert -version 2>&1";
    $output2 = [];
    $return_code2 = 0;
    exec($cmd_test2, $output2, $return_code2);
    
    if ($return_code2 === 0) {
        echo "✅ ImageMagick disponível: " . $output2[0] . "<br>";
    } else {
        echo "❌ ImageMagick não encontrado<br>";
        echo "<em>Nota: Para geração de JPG, é necessário ter wkhtmltoimage ou ImageMagick instalado no servidor.</em>";
    }
}

echo "<br><br><a href='/validar-ingresso.php' style='color: #007bff;'>← Voltar para validação</a>";
?>
