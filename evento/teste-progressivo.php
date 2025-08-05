<?php
// Teste progressivo - carrega parte por parte do index.php até encontrar o erro
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Teste Progressivo - Localizando Erro 500</h1>";

$slug = 'evento';

try {
    // Parte 1: Includes
    echo "<h2>✓ Passo 1: Includes</h2>";
    include("conm/conn.php");
    if (file_exists("../includes/imagem-helpers.php")) {
        include("../includes/imagem-helpers.php");
    }
    echo "Includes OK<br>";
    
    // Parte 2: Consulta do evento
    echo "<h2>✓ Passo 2: Consulta do evento</h2>";
    $sql_evento = "
        SELECT 
            e.*,
            u.nome as nome_usuario,
            u.nome_exibicao,
            u.descricao_produtor as descricao_usuario,
            u.foto_perfil,
            c.nome_fantasia,
            c.razao_social,
            c.email_contato,
            c.telefone as telefone_contratante
        FROM eventos e
        LEFT JOIN usuarios u ON e.usuario_id = u.id
        LEFT JOIN contratantes c ON e.contratante_id = c.id
        WHERE e.slug = ? AND e.status = 'publicado' AND (e.visibilidade = 'publico' OR e.visibilidade = '' OR e.visibilidade IS NULL)
        LIMIT 1
    ";
    
    $stmt_evento = mysqli_prepare($con, $sql_evento);
    mysqli_stmt_bind_param($stmt_evento, "s", $slug);
    mysqli_stmt_execute($stmt_evento);
    $result_evento = mysqli_stmt_get_result($stmt_evento);
    $evento = mysqli_fetch_assoc($result_evento);
    echo "Evento encontrado: " . $evento['nome'] . "<br>";
    
    // Parte 3: Consulta dos ingressos
    echo "<h2>✓ Passo 3: Consulta dos ingressos</h2>";
    $sql_ingressos = "
        SELECT *
        FROM ingressos 
        WHERE evento_id = ?
        AND ativo = 1 
        AND disponibilidade = 'publico'
        AND (inicio_venda IS NULL OR inicio_venda <= NOW())
        AND (fim_venda IS NULL OR fim_venda >= NOW())
        ORDER BY posicao_ordem ASC, preco ASC
    ";
    
    $stmt_ingressos = mysqli_prepare($con, $sql_ingressos);
    mysqli_stmt_bind_param($stmt_ingressos, "i", $evento['id']);
    mysqli_stmt_execute($stmt_ingressos);
    $result_ingressos = mysqli_stmt_get_result($stmt_ingressos);
    
    $ingressos = [];
    while ($row = mysqli_fetch_assoc($result_ingressos)) {
        $ingressos[] = $row;
    }
    echo count($ingressos) . " ingressos encontrados<br>";
    
    // Parte 4: Funções auxiliares
    echo "<h2>✓ Passo 4: Funções auxiliares</h2>";
    
    function formatarData($data, $timezone = 'America/Sao_Paulo') {
        if (empty($data)) return '';
        $dt = new DateTime($data);
        $dt->setTimezone(new DateTimeZone($timezone));
        return [
            'data' => $dt->format('d M Y'),
            'hora' => $dt->format('H:i'),
            'timestamp' => $dt->getTimestamp()
        ];
    }
    
    function obterIniciais($nome) {
        $palavras = explode(' ', trim($nome));
        $iniciais = '';
        foreach ($palavras as $palavra) {
            if (!empty($palavra)) {
                $iniciais .= strtoupper(substr($palavra, 0, 1));
                if (strlen($iniciais) >= 2) break;
            }
        }
        return $iniciais ?: 'EV';
    }
    
    function limparHTML($texto) {
        $tags_permitidas = '<p><br><strong><b><em><i><u><span><div><h1><h2><h3><h4><h5><h6><ul><ol><li>';
        return strip_tags($texto, $tags_permitidas);
    }
    
    function truncarTexto($texto, $limite = 300, $sufixo = '...') {
        $texto_limpo = strip_tags($texto);
        
        if (strlen($texto_limpo) <= $limite) {
            return $texto;
        }
        
        $texto_truncado = substr($texto_limpo, 0, $limite);
        $ultimo_espaco = strrpos($texto_truncado, ' ');
        if ($ultimo_espaco !== false) {
            $texto_truncado = substr($texto_truncado, 0, $ultimo_espaco);
        }
        
        return $texto_truncado . $sufixo;
    }
    
    echo "Funções definidas OK<br>";
    
    // Parte 5: Processamento dos dados
    echo "<h2>✓ Passo 5: Processamento dos dados</h2>";
    
    $data_inicio = formatarData($evento['data_inicio'], $evento['timezone']);
    $data_fim = formatarData($evento['data_fim'], $evento['timezone']);
    
    $mesmo_dia = date('Y-m-d', $data_inicio['timestamp']) === date('Y-m-d', $data_fim['timestamp']);
    
    $endereco_completo = '';
    if ($evento['tipo_local'] == 'presencial') {
        $endereco_parts = array_filter([
            $evento['nome_local'],
            $evento['rua'] . ($evento['numero'] ? ', ' . $evento['numero'] : ''),
            $evento['bairro'],
            $evento['cidade'] . ($evento['estado'] ? ' - ' . $evento['estado'] : '')
        ]);
        $endereco_completo = implode(', ', $endereco_parts);
    }
    $nomelocal = $evento['nome_local'];
    
    $nome_produtor_display = !empty($evento['nome_exibicao_produtor']) ? $evento['nome_exibicao_produtor'] : 
                            (!empty($evento['nome_exibicao']) ? $evento['nome_exibicao'] : 
                            (!empty($evento['nome_fantasia']) ? $evento['nome_fantasia'] : $evento['nome_usuario']));
    
    echo "Dados processados OK<br>";
    echo "Nome do produtor: " . $nome_produtor_display . "<br>";
    echo "Endereço: " . $endereco_completo . "<br>";
    
    // Parte 6: Testar início do HTML
    echo "<h2>✓ Passo 6: Testando início do HTML</h2>";
    
    ob_start();
    ?>
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, shrink-to-fit=no">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        
        <title><?php echo htmlspecialchars($evento['nome']); ?></title>
        <meta name="description" content="<?php echo truncarTexto($evento['descricao'], 160); ?>">
        <meta name="author" content="<?php echo htmlspecialchars($nome_produtor_display); ?>">

        <meta property="og:title" content="<?php echo htmlspecialchars($evento['nome']); ?>">
        <meta property="og:description" content="<?php echo truncarTexto($evento['descricao'], 160); ?>">
        <meta property="og:type" content="website">
        <?php if (!empty($evento['imagem_capa'])): ?>
            <?php 
            $imagem_meta = function_exists('normalizarCaminhoImagem') ? 
                          normalizarCaminhoImagem($evento['imagem_capa']) : 
                          $evento['imagem_capa'];
            ?>
        <meta property="og:image" content="<?php echo htmlspecialchars($imagem_meta); ?>">
        <?php endif; ?>
    </head>
    <body>
        <h1>Teste - HTML básico funcionando</h1>
        <p>Evento: <?php echo htmlspecialchars($evento['nome']); ?></p>
    </body>
    </html>
    <?php
    $html_output = ob_get_clean();
    
    echo "HTML básico gerado com " . strlen($html_output) . " caracteres<br>";
    echo "<div style='background: #e8f5e8; padding: 10px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>✅ SUCESSO!</strong> Todas as partes principais estão funcionando.<br>";
    echo "O erro 500 deve estar em uma parte específica do HTML/CSS/JavaScript do arquivo original.";
    echo "</div>";
    
    echo "<hr>";
    echo "<h3>HTML Gerado (primeiros 500 caracteres):</h3>";
    echo "<pre>" . htmlspecialchars(substr($html_output, 0, 500)) . "...</pre>";
    
} catch (Exception $e) {
    echo "<div style='background: #ffebee; padding: 15px; border-left: 4px solid #f44336; margin: 10px 0;'>";
    echo "<h3>❌ ERRO ENCONTRADO:</h3>";
    echo "<strong>Mensagem:</strong> " . $e->getMessage() . "<br>";
    echo "<strong>Arquivo:</strong> " . $e->getFile() . "<br>";
    echo "<strong>Linha:</strong> " . $e->getLine() . "<br>";
    echo "</div>";
} catch (Error $e) {
    echo "<div style='background: #ffebee; padding: 15px; border-left: 4px solid #f44336; margin: 10px 0;'>";
    echo "<h3>❌ ERRO FATAL:</h3>";
    echo "<strong>Mensagem:</strong> " . $e->getMessage() . "<br>";
    echo "<strong>Arquivo:</strong> " . $e->getFile() . "<br>";
    echo "<strong>Linha:</strong> " . $e->getLine() . "<br>";
    echo "</div>";
}
?>