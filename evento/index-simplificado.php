<?php
// ESTRATÉGIA FINAL: Criar versão simplificada do index.php para localizar erro
// Copiando estrutura exata do arquivo original, mas comentando seções suspeitas

error_reporting(E_ALL);
ini_set('display_errors', 1);

include("conm/conn.php");
include("../includes/imagem-helpers.php");

// Verificar se foi redirecionado de pagamento pendente
$payment_status = isset($_GET['status']) ? $_GET['status'] : '';

// Pegar o slug do evento da URL
$slug = '';
if (isset($_GET['evento'])) {
    $slug = $_GET['evento'];
} elseif (isset($_GET['slug'])) {
    $slug = $_GET['slug'];
} else {
    $slug = 'evento'; // usar diretamente
}

// Consulta para buscar dados do evento usando prepared statement
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

if (mysqli_num_rows($result_evento) == 0) {
    echo "<h1>Evento não encontrado</h1>";
    echo "<p>Slug procurado: " . htmlspecialchars($slug) . "</p>";
    exit;
}

$evento = mysqli_fetch_assoc($result_evento);

// Buscar ingressos do evento
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

// Formatação de datas
$data_inicio = formatarData($evento['data_inicio'], $evento['timezone']);
$data_fim = formatarData($evento['data_fim'], $evento['timezone']);

// Determinar se é evento de múltiplos dias
$mesmo_dia = date('Y-m-d', $data_inicio['timestamp']) === date('Y-m-d', $data_fim['timestamp']);

// Montar endereço completo
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

// Nome do produtor para exibição
$nome_produtor_display = !empty($evento['nome_exibicao_produtor']) ? $evento['nome_exibicao_produtor'] : 
                        (!empty($evento['nome_exibicao']) ? $evento['nome_exibicao'] : 
                        (!empty($evento['nome_fantasia']) ? $evento['nome_fantasia'] : $evento['nome_usuario']));
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
        $imagem_meta = normalizarCaminhoImagem($evento['imagem_capa']);
        ?>
    <meta property="og:image" content="<?php echo htmlspecialchars($imagem_meta); ?>">
    <?php endif; ?>

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    
    <!-- CSS SIMPLIFICADO PARA TESTE -->
    <style>
        body {
            font-family: 'Roboto', Arial, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
        }
        
        .hero-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 80px 0;
            position: relative;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 15px;
        }
        
        /* Comentando CSS complexo que pode estar causando problema */
        /*
        CSS ORIGINAL COMENTADO PARA TESTE
        - Efeitos de backdrop-filter
        - Animações complexas  
        - Media queries extensas
        */
    </style>
</head>
<body>
    <div class="hero-section text-center">
        <div class="container">
            <h1 class="display-4 mb-4"><?php echo htmlspecialchars($evento['nome']); ?></h1>
            <p class="lead"><?php echo truncarTexto($evento['descricao'], 200); ?></p>
            
            <div class="row mt-5">
                <div class="col-md-6">
                    <h5><i class="fas fa-calendar"></i> Data</h5>
                    <p><?php echo $data_inicio['data']; ?> às <?php echo $data_inicio['hora']; ?></p>
                </div>
                <div class="col-md-6">
                    <h5><i class="fas fa-map-marker-alt"></i> Local</h5>
                    <p><?php echo htmlspecialchars($endereco_completo ?: $nomelocal); ?></p>
                </div>
            </div>
        </div>
    </div>

    <div class="container mt-5">
        <h2>Tipos de Ingresso</h2>
        <div class="row">
            <?php foreach ($ingressos as $ingresso): ?>
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title"><?php echo htmlspecialchars($ingresso['titulo']); ?></h5>
                            <p class="card-text">
                                Tipo: <?php echo ucfirst($ingresso['tipo']); ?><br>
                                <?php if ($ingresso['preco'] > 0): ?>
                                    Preço: R$ <?php echo number_format($ingresso['preco'], 2, ',', '.'); ?>
                                <?php else: ?>
                                    <strong>GRATUITO</strong>
                                <?php endif; ?>
                            </p>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <div class="container mt-5 mb-5">
        <h2>Sobre o Evento</h2>
        <div class="card">
            <div class="card-body">
                <?php echo limparHTML($evento['descricao']); ?>
            </div>
        </div>
        
        <div class="mt-4">
            <h5>Produtor: <?php echo htmlspecialchars($nome_produtor_display); ?></h5>
        </div>
    </div>

    <!-- JavaScript básico -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Comentando JavaScript complexo que pode estar causando problema -->
    <script>
        console.log('✅ Versão simplificada carregada com sucesso');
        console.log('Evento:', <?php echo json_encode($evento['nome']); ?>);
        console.log('Ingressos:', <?php echo count($ingressos); ?>);
    </script>
</body>
</html>