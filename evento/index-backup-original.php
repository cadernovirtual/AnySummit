<?php
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
    $slug = 'congresso-2025'; // fallback padrão
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

// Função para limpar HTML mantendo tags básicas
function limparHTML($texto) {
    // Permitir apenas tags básicas de formatação
    $tags_permitidas = '<p><br><strong><b><em><i><u><span><div><h1><h2><h3><h4><h5><h6><ul><ol><li>';
    return strip_tags($texto, $tags_permitidas);
}