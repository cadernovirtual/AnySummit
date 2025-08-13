<?php
include("conm/conn.php");
include("../includes/imagem-helpers.php");

// Verificar se foi redirecionado de pagamento pendente ou tempo expirado
$payment_status = isset($_GET['status']) ? $_GET['status'] : '';
$checkout_expired = isset($_GET['expired']) ? $_GET['expired'] : false;

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
        c.telefone as telefone_contratante,
        c.logomarca
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

// QUERY ATUALIZADA COM JOIN DOS LOTES E FILTRO DE DATAS
$sql_ingressos = "
    SELECT 
        i.*,  -- Todas as colunas da tabela ingressos
        l.nome as lote_nome,
        l.data_inicio as lote_data_inicio,
        l.data_fim as lote_data_fim,
        l.tipo as lote_tipo,
        l.divulgar_criterio,
        l.percentual_venda,
        l.percentual_aumento_valor
    FROM 
        ingressos i
    LEFT JOIN 
        lotes l ON i.lote_id = l.id
    WHERE 
        i.evento_id = ? 
        AND i.ativo = 1 
        AND i.disponibilidade = 'publico'
        AND (
            -- Se o lote for do tipo 'data', verificar se está no período válido (com hora)
            (l.tipo = 'data' AND NOW() BETWEEN l.data_inicio AND l.data_fim)
            OR 
            -- Se o lote for do tipo 'quantidade', trazer todos
            l.tipo = 'quantidade'
            OR
            -- Se o lote tem tipo NULL, considerar válido também
            l.tipo IS NULL
            OR
            -- Se não há lote associado, trazer também
            l.id IS NULL
        )
    ORDER BY i.posicao_ordem ASC, i.id ASC
";

$stmt_ingressos = mysqli_prepare($con, $sql_ingressos);
mysqli_stmt_bind_param($stmt_ingressos, "i", $evento['id']);
mysqli_stmt_execute($stmt_ingressos);
$result_ingressos = mysqli_stmt_get_result($stmt_ingressos);

// MODIFICADO: Função para validar se o lote está dentro das datas válidas
function validarDataLote($data_inicio, $data_fim) {
    if (empty($data_inicio) && empty($data_fim)) {
        return true; // Se não tem datas definidas, considera válido
    }
    
    $hoje = new DateTime();
    
    if (!empty($data_inicio)) {
        $inicio = new DateTime($data_inicio);
        if ($hoje < $inicio) {
            return false; // Ainda não começou
        }
    }
    
    if (!empty($data_fim)) {
        $fim = new DateTime($data_fim);
        if ($hoje > $fim) {
            return false; // Já acabou
        }
    }
    
    return true;
}

// PROCESSAMENTO DOS INGRESSOS COM COMBOS EXPANDIDOS
$ingressos = [];
$ids_processados = [];

while ($row = mysqli_fetch_assoc($result_ingressos)) {
    // Evitar duplicação por ID (proteção contra base poluída)
    if (in_array($row['id'], $ids_processados)) {
        continue;
    }
    
    // Processar conteúdo do combo se for tipo combo
    if ($row['tipo'] === 'combo' && !empty($row['conteudo_combo'])) {
        $row['combo_itens_processados'] = processarConteudoCombo($row['conteudo_combo'], $con);
    }
    
    $ingressos[] = $row;
    $ids_processados[] = $row['id'];
}

$mostrar_badge_lote = true;