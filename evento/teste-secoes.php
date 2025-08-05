<?php
// Estratégia para localizar o erro 500: Renderizar seções do HTML progressivamente
error_reporting(E_ALL);
ini_set('display_errors', 1);

$slug = 'evento';

// Carregar dados (sabemos que funciona)
include("conm/conn.php");
if (file_exists("../includes/imagem-helpers.php")) {
    include("../includes/imagem-helpers.php");
}

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

// Funções auxiliares
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

// Processamento dos dados
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

// Agora vamos testar seção por seção
$secao = $_GET['secao'] ?? '1';

echo "<h1>Teste por Seções - Seção $secao</h1>";
echo "<p><strong>Dados carregados:</strong> " . $evento['nome'] . " (" . count($ingressos) . " ingressos)</p>";

echo "<p><strong>Navegação:</strong> ";
for ($i = 1; $i <= 8; $i++) {
    if ($i == $secao) {
        echo "<strong>[$i]</strong> ";
    } else {
        echo "<a href='?secao=$i'>[$i]</a> ";
    }
}
echo "</p>";

switch($secao) {
    case '1':
        echo "<h2>Seção 1: DOCTYPE + HEAD básico</h2>";
        ?>
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title><?php echo htmlspecialchars($evento['nome']); ?></title>
            <meta name="description" content="<?php echo truncarTexto($evento['descricao'], 160); ?>">
        </head>
        <body>
            <h1>✅ Seção 1 OK - DOCTYPE + HEAD básico</h1>
            <p>Evento: <?php echo htmlspecialchars($evento['nome']); ?></p>
            <p><a href="?secao=2">Próxima seção →</a></p>
        </body>
        </html>
        <?php
        break;
        
    case '2':
        echo "<h2>Seção 2: Meta tags completas</h2>";
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
            <h1>✅ Seção 2 OK - Meta tags completas</h1>
            <p>Evento: <?php echo htmlspecialchars($evento['nome']); ?></p>
            <p>Produtor: <?php echo htmlspecialchars($nome_produtor_display); ?></p>
            <p><a href="?secao=3">Próxima seção →</a></p>
        </body>
        </html>
        <?php
        break;
        
    case '3':
        echo "<h2>Seção 3: CSS básico (primeiras 100 linhas)</h2>";
        // Vou pegar as primeiras linhas de CSS do arquivo original
        $arquivo_original = file_get_contents('index.php');
        $inicio_css = strpos($arquivo_original, '<style>');
        $fim_css = strpos($arquivo_original, '</style>', $inicio_css);
        
        if ($inicio_css !== false && $fim_css !== false) {
            $css_completo = substr($arquivo_original, $inicio_css, $fim_css - $inicio_css + 8);
            $linhas_css = explode("\n", $css_completo);
            $css_parcial = implode("\n", array_slice($linhas_css, 0, 100));
            
            ?>
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title><?php echo htmlspecialchars($evento['nome']); ?></title>
                <?php echo $css_parcial; ?>
                </style>
            </head>
            <body>
                <h1>✅ Seção 3 OK - CSS básico (primeiras 100 linhas)</h1>
                <p><a href="?secao=4">Próxima seção →</a></p>
            </body>
            </html>
            <?php
        } else {
            echo "<p>❌ Não foi possível extrair CSS</p>";
        }
        break;
        
    default:
        echo "<h2>Seção $secao: Em desenvolvimento</h2>";
        echo "<p>Use as seções 1, 2 ou 3 para testar progressivamente.</p>";
        break;
}
?>