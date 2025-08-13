<?php
// Teste simples e direto das APIs
include("evento/conm/conn.php");

echo "<h2>Teste Rápido - APIs de JPG</h2>";

// Buscar ingresso
$sql = "SELECT ii.*, e.nome as evento_nome 
        FROM tb_ingressos_individuais ii
        LEFT JOIN eventos e ON ii.eventoid = e.id
        WHERE ii.participanteid IS NOT NULL 
        LIMIT 1";

$result = $con->query($sql);

if ($result && $result->num_rows > 0) {
    $ingresso = $result->fetch_assoc();
    
    $secret_key = "AnySummit2025@#$%ingresso";
    $timestamp = strtotime($ingresso['criado_em']);
    $hash = hash('sha256', $secret_key . $ingresso['id'] . $timestamp);
    
    echo "<strong>Ingresso ID:</strong> " . $ingresso['id'] . "<br>";
    echo "<strong>Hash:</strong> " . $hash . "<br><br>";
    
    // Testar API PHP GD diretamente
    echo "<h3>Testando API PHP GD:</h3>";
    
    try {
        // Verificar se GD está disponível
        if (extension_loaded('gd')) {
            echo "✅ Extensão GD disponível<br>";
            
            // Criar uma imagem de teste simples
            $test_img = imagecreatetruecolor(200, 100);
            $white = imagecolorallocate($test_img, 255, 255, 255);
            $black = imagecolorallocate($test_img, 0, 0, 0);
            imagefill($test_img, 0, 0, $white);
            imagestring($test_img, 3, 10, 10, "TESTE GD", $black);
            
            $temp_file = sys_get_temp_dir() . '/teste_gd.jpg';
            if (imagejpeg($test_img, $temp_file)) {
                echo "✅ GD pode criar imagens JPG<br>";
                unlink($temp_file);
            } else {
                echo "❌ GD não consegue criar JPG<br>";
            }
            imagedestroy($test_img);
            
        } else {
            echo "❌ Extensão GD não disponível<br>";
        }
    } catch (Exception $e) {
        echo "❌ Erro no teste GD: " . $e->getMessage() . "<br>";
    }
    
    echo "<br>";
    
    // Links para testar
    echo "<h3>Links para testar:</h3>";
    echo "<a href='/evento/api/gerar-ingresso-jpg-php.php?h=" . $hash . "&action=path' target='_blank' style='display: inline-block; padding: 10px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 5px;'>Testar API PHP GD (JSON)</a><br>";
    echo "<a href='/evento/api/gerar-ingresso-jpg-php.php?h=" . $hash . "' target='_blank' style='display: inline-block; padding: 10px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 5px;'>Download direto PHP GD</a><br>";
    
    if (isset($_GET['debug'])) {
        echo "<h3>Debug - Dados do ingresso:</h3>";
        echo "<pre>";
        print_r($ingresso);
        echo "</pre>";
    }
    
    echo "<br><a href='?debug=1'>Ver dados do ingresso</a>";
    
} else {
    echo "❌ Nenhum ingresso vinculado encontrado";
}
?>
