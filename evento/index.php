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

// NOVA: Função para formatar badge do lote
function formatarBadgeLote($ingresso) {
    if (empty($ingresso['lote_nome'])) {
        return '';
    }
    
    $badge_text = htmlspecialchars($ingresso['lote_nome']);
    
    // Se o lote é por data e deve divulgar critério
    if ($ingresso['divulgar_criterio'] == 1 && !empty($ingresso['lote_data_fim'])) {
        $data_fim = new DateTime($ingresso['lote_data_fim']);
        $data_fim_formatada = $data_fim->format('d/m/Y');
        $badge_text .= " - até " . $data_fim_formatada;
    }
    
    return $badge_text;
}

// NOVA: Função para processar conteúdo do combo e buscar nomes dos ingressos
function processarConteudoCombo($conteudo_combo, $con) {
    if (empty($conteudo_combo)) {
        return null;
    }
    
    // Decodificar JSON
    $combo_data = json_decode($conteudo_combo, true);
    
    if (!$combo_data || !is_array($combo_data)) {
        return null;
    }
    
    $itens_processados = [];
    
    foreach ($combo_data as $item) {
        if (isset($item['ingresso_id']) && isset($item['quantidade'])) {
            $ingresso_id = (int)$item['ingresso_id'];
            $quantidade = (int)$item['quantidade'];
            
            // Buscar nome do ingresso
            $sql_nome = "SELECT titulo FROM ingressos WHERE id = ?";
            $stmt_nome = mysqli_prepare($con, $sql_nome);
            
            if ($stmt_nome) {
                mysqli_stmt_bind_param($stmt_nome, "i", $ingresso_id);
                mysqli_stmt_execute($stmt_nome);
                $result_nome = mysqli_stmt_get_result($stmt_nome);
                
                if ($row_nome = mysqli_fetch_assoc($result_nome)) {
                    $itens_processados[] = [
                        'ingresso_id' => $ingresso_id,
                        'nome' => $row_nome['titulo'],
                        'quantidade' => $quantidade
                    ];
                }
                
                mysqli_stmt_close($stmt_nome);
            }
        }
    }
    
    return !empty($itens_processados) ? $itens_processados : null;
}

// Função para truncar texto
function truncarTexto($texto, $limite = 300, $sufixo = '...') {
    // Primeiro limpar HTML para contar caracteres corretamente
    $texto_limpo = strip_tags($texto);
    
    if (strlen($texto_limpo) <= $limite) {
        return $texto;
    }
    
    // Truncar no limite
    $texto_truncado = substr($texto_limpo, 0, $limite);
    
    // Procurar último espaço para não cortar palavra
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
$nome_organizador_display = !empty($evento['nome_fantasia']) ? $evento['nome_fantasia'] : 
                            (!empty($evento['nome_exibicao_produtor']) ? $evento['nome_exibicao_produtor'] : 
                            (!empty($evento['nome_exibicao']) ? $evento['nome_exibicao'] : $evento['nome_usuario']));
$email_organizador = !empty($evento['email_contato']) ? $evento['email_contato'] : '';
$telefone_organizador = !empty($evento['telefone_contratante']) ? $evento['telefone_contratante'] : '';
$logomarca_organizador = !empty($evento['logomarca']) ? $evento['logomarca'] : '';
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
    <meta name="description" content=" <?php echo truncarTexto($evento['descricao'], 160); ?>">
    <meta name="author" content="<?php echo htmlspecialchars($nome_organizador_display); ?>">

    <meta property="og:title" content="<?php echo htmlspecialchars($evento['nome']); ?>">
    <meta property="og:description" content="<?php echo truncarTexto($evento['descricao'], 160); ?>">
    <meta property="og:type" content="website">
    <?php if (!empty($evento['imagem_capa'])): ?>
    <meta property="og:image" content="<?php echo htmlspecialchars($evento['imagem_capa']); ?>">    
    <?php endif; ?>

    <meta name="twitter:card" content="summary_large_image">
    <?php if (!empty($evento['imagem_capa'])): ?>
    <meta name="twitter:image" content="<?php echo htmlspecialchars($evento['imagem_capa']); ?>">
    <?php endif; ?>

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

     <link rel="stylesheet" href="css/evento.css">
     
     <!-- CSS dinâmico para background -->
     <style>
        <?php if (!empty($evento['imagem_fundo'])){ ?>
        .hero-section {
            background-image: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6)), url('<?php echo htmlspecialchars($evento['imagem_fundo']); ?>');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
            position: relative;
        }
        
        .hero-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            backdrop-filter: blur(8px);
            background: rgba(0, 0, 0, 0.3);
            z-index: 1;
        }
        
        .hero-section .container {
            position: relative;
            z-index: 2;
        }
        
        /* Cores dos textos quando há imagem de fundo */
        .hero-section h1,
        .hero-section .lead,
        .hero-section p,
        .hero-section h6 {
            color: white !important;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        }
        
        .hero-section .badge {
            background: rgba(0, 123, 255, 0.9) !important;
            backdrop-filter: blur(5px);
        }
        
        .hero-section .badge.bg-success {
            background: rgba(40, 167, 69, 0.9) !important;
        }
        
        .hero-section .share-btn {
            backdrop-filter: blur(5px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
        
        .hero-section .btn-outline-primary {
            border-color: white;
            color: white;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(5px);
        }
        
        .hero-section .btn-outline-primary:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: white;
            color: white;
        }
		@media (max-width: 768px) {
            .hero-section {                
				padding-top:50px;
            }
		}
        <?php }else{ ?>
		    .hero-section {
			background:<?php echo !empty($evento['cor_fundo']) ? htmlspecialchars($evento['cor_fundo']) : '#8323C4'; ?>;
           
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-attachment: fixed;
            position: relative;
        }
        
        .hero-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            backdrop-filter: blur(8px);
            background: rgba(0, 0, 0, 0.3);
            z-index: 1;
        }
        
        .hero-section .container {
            position: relative;
            z-index: 2;
        }
        
        /* Cores dos textos quando há imagem de fundo */
        .hero-section h1,
        .hero-section .lead,
        .hero-section p,
        .hero-section h6 {
            color: white !important;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        }
        
        .hero-section .badge {
            background: rgba(0, 123, 255, 0.9) !important;
            backdrop-filter: blur(5px);
        }
        
        .hero-section .badge.bg-success {
            background: rgba(40, 167, 69, 0.9) !important;
        }
        
        .hero-section .share-btn {
            backdrop-filter: blur(5px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
        
        .hero-section .btn-outline-primary {
            border-color: white;
            color: white;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(5px);
        }
        
        .hero-section .btn-outline-primary:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: white;
            color: white;
        }
		@media (max-width: 768px) {
            .hero-section {                
				padding-top:50px;
            }

            /* Responsividade dos cards de informação */
            .info-card {
                padding: 20px;
                gap: 16px;
                flex-direction: column;
                text-align: center;
                align-items: center;
                justify-content: center;
            }

            .info-icon {
                width: 45px;
                height: 45px;
                font-size: 1.1rem;
                margin: 0 auto;
            }

            .info-content {
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 100%;
            }

            .info-content h5 {
                font-size: 1rem;
            }

            .date-info, .time-info {
                font-size: 0.9rem;
                justify-content: center;
            }

            .address-details {
                font-size: 0.85rem;
            }

            .address-details div {
                justify-content: center;
            }

            /* Botão de calendário responsivo */
            .dropdown-toggle {
                font-size: 0.85rem;
                padding: 8px 12px;
            }
		}
		<?php }?>
        
        /* Estilos para logo do evento */
        .event-logo {
            transition: all 0.3s ease;
        }
        
        .event-logo:hover {
            transform: scale(1.05);
        }
        
        /* Responsividade da logo */
        @media (max-width: 768px) {
            .event-logo {
                max-height: 80px !important;
            }
        }
        
        @media (max-width: 576px) {
            .event-logo {
                max-height: 60px !important;
            }

            /* Cards ainda menores em telas muito pequenas */
            .info-card {
                padding: 16px;
                gap: 12px;
                flex-direction: column;
                text-align: center;
            }

            .info-icon {
                width: 40px;
                height: 40px;
                font-size: 1rem;
                align-self: center;
            }

            .info-content {
                text-align: center;
            }

            .date-info, .time-info {
                justify-content: center;
                font-size: 0.85rem;
            }

            .address-details div {
                justify-content: center;
                font-size: 0.8rem;
            }

            .location-info h6 {
                font-size: 0.95rem;
            }

            /* Botão de calendário em telas pequenas */
            .dropdown-toggle {
                font-size: 0.8rem;
                padding: 6px 10px;
                width: 100%;
                justify-content: center;
            }

            .dropdown-menu {
                width: 100%;
                text-align: center;
            }
        }
        
        /* Estilos para os Cards de Informação */
        .info-card {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border: 1px solid #f1f3f4;
            transition: all 0.3s ease;
            display: flex;
            align-items: flex-start;
            gap: 20px;
        }

        .info-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
            border-color: #e91e63;
        }

        .info-icon {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            background: linear-gradient(135deg, #e91e63, #9c27b0);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.25rem;
            flex-shrink: 0;
        }

        .info-content {
            flex: 1;
        }

        .info-content h5 {
            color: #2c3e50;
            font-size: 1.1rem;
            margin-bottom: 12px;
        }

        .info-details {
            color: #6c757d;
        }

        .date-info, .time-info {
            display: flex;
            align-items: center;
            font-size: 0.95rem;
        }

        .time-info {
            margin-top: 8px;
        }

        .timezone-info {
            margin-top: 8px;
            font-size: 0.85rem;
        }

        .location-info h6 {
            color: #2c3e50;
            font-size: 1rem;
        }

        .address-details {
            font-size: 0.9rem;
            line-height: 1.5;
        }

        .address-details div {
            display: flex;
            align-items: center;
            margin-bottom: 4px;
        }

        .online-info, .location-tbd {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .online-info .fw-medium {
            font-size: 1rem;
        }

        .location-tbd .fw-medium {
            font-size: 1rem;
        }

        /* Estilos para o botão de calendário */
        .dropdown-menu {
            border-radius: 12px;
            border: none;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            padding: 8px 0;
        }

        .dropdown-item {
            padding: 10px 20px;
            transition: all 0.2s ease;
            border-radius: 8px;
            margin: 2px 8px;
        }

        .dropdown-item:hover {
            background: linear-gradient(135deg, #e91e63, #9c27b0);
            color: white;
            transform: translateX(5px);
        }

        .dropdown-item:hover i {
            color: white !important;
        }

        .btn-outline-primary.dropdown-toggle {
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .btn-outline-primary.dropdown-toggle:hover {
            background: linear-gradient(135deg, #e91e63, #9c27b0);
            border-color: transparent;
            color: white;
        }
     </style>
</head>

<body>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white ">
        <div class="container">
            <div class="w-100 d-flex justify-content-center">
                <a class="navbar-brand gradient-text" href="#">
                   <img src="img/anysummitlogo.png" style=" width:100%; max-width:200px; ">
                </a>
            </div>
        </div>
    </nav>

    <!-- Notificação de Status de Pagamento -->
    <?php if ($payment_status === 'payment_pending'): ?>
    <div class="alert alert-warning alert-dismissible fade show m-0" role="alert" style="border-radius: 0; border: none; background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);">
        <div class="container">
            <div class="d-flex align-items-center">
                <i class="fas fa-exclamation-triangle text-warning me-3 fs-4"></i>
                <div class="flex-grow-1">
                    <strong><i class="fas fa-clock me-1"></i> Pagamento Pendente</strong><br>
                    <small>Seu pedido ainda não foi processado. Complete o pagamento para garantir seus ingressos.</small>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        </div>
    </div>
    <?php endif; ?>

    <!-- Hero Section -->
    <section class="hero-section<?php echo !empty($evento['imagem_fundo']) ? ' hero-with-background' : ''; ?>" id="evento" 
             >
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <div class="pe-lg-5">
                        <div class="mb-3">
                            <span class="badge bg-primary rounded-pill px-3 py-2">
                                <i class="fas fa-calendar me-1"></i>
                                <?php if ($mesmo_dia): ?>
                                    <?php echo $data_inicio['data']; ?> • <?php echo $data_inicio['hora']; ?> > <?php echo $data_fim['hora']; ?>
                                <?php else: ?>
                                    <?php echo $data_inicio['data']; ?> • <?php echo $data_inicio['hora']; ?> > <?php echo $data_fim['data']; ?> • <?php echo $data_fim['hora']; ?>
                                <?php endif; ?>
                            </span>
                            <?php if ($evento['tipo_local'] == 'online'): ?>
                                <span class="badge bg-success rounded-pill px-3 py-2 ms-2">
                                    <i class="fas fa-video me-1"></i>
                                    Evento Online
                                </span>
                            <?php else: ?>
                                <?php 
                                // Montar endereço para Google Maps (para o badge)
                                $endereco_badge_maps = urlencode(implode(', ', array_filter([
                                    $evento['nome_local'],
                                    $evento['rua'] . ($evento['numero'] ? ', ' . $evento['numero'] : ''),
                                    $evento['bairro'],
                                    $evento['cidade'],
                                    $evento['estado'],
                                    $evento['pais']
                                ])));
                                ?>
                                <a href="https://www.google.com/maps/search/?api=1&query=<?php echo $endereco_badge_maps; ?>" 
                                   target="_blank" 
                                   class="badge bg-success rounded-pill px-3 py-2 ms-2 text-decoration-none text-white">
                                    <i class="fas fa-map-marker-alt me-1"></i>
                                    <?php echo htmlspecialchars($nomelocal ?: 'Local a definir'); ?>
                                </a>
                            <?php endif; ?>
                        </div>
                        <h1 class="display-4 fw-bold mb-4">
                            <?php if (!empty($evento['logo_evento'])): ?>
                                <img 
                                    src="<?php echo htmlspecialchars($evento['logo_evento']); ?>" 
                                    alt="<?php echo htmlspecialchars($evento['nome']); ?>" 
                                    class="img-fluid event-logo"
                                    style="max-height: 120px; max-width: 100%; object-fit: contain; 
                                           <?php echo !empty($evento['imagem_fundo']) ? 'filter: drop-shadow(2px 2px 8px rgba(0,0,0,0.8));' : ''; ?>"
                                >
                            <?php else: ?>
                                <?php echo htmlspecialchars($evento['nome']); ?>
                            <?php endif; ?>
                        </h1>
                        
                        <div class="mb-4">
                            <p class="<?php echo !empty($evento['imagem_fundo']) ? '' : 'text-muted'; ?>">
                                <strong>Evento <?php echo $evento['tipo_local'] == 'online' ? 'online' : 'presencial'; ?></strong> 
                                <?php if ($evento['tipo_local'] == 'presencial' && $endereco_completo): ?>
                                    em <?php echo htmlspecialchars($endereco_completo); ?>
                                <?php endif; ?>
                            </p>
                        </div>
                        <div class="share-section">
                            <h6 class="mb-3">Compartilhe este evento:</h6>
                            <div class="share-buttons">
                                <button class="share-btn facebook" onClick="shareEvent('facebook')">
                                    <i class="fab fa-facebook-f"></i>
                                </button>
                                <button class="share-btn twitter" onClick="shareEvent('twitter')">
                                    <i class="fab fa-twitter"></i>
                                </button>
                                <button class="share-btn linkedin" onClick="shareEvent('linkedin')">
                                    <i class="fab fa-linkedin-in"></i>
                                </button>
                                <button class="share-btn whatsapp" onClick="shareEvent('whatsapp')">
                                    <i class="fab fa-whatsapp"></i>
                                </button>
                                <button class="btn btn-outline-primary btn-sm ms-2" onClick="copyLink()">
                                    <i class="fas fa-link me-1"></i>
                                    Copiar Link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <?php if (!empty($evento['imagem_capa'])): ?>
                        <img 
                            src="<?php echo htmlspecialchars($evento['imagem_capa']); ?>" 
                            alt="<?php echo htmlspecialchars($evento['nome']); ?>" 
                            class="img-fluid event-image w-100 <?php echo !empty($evento['imagem_fundo']) ? 'shadow-lg' : ''; ?>"
                            style="<?php echo !empty($evento['imagem_fundo']) ? 'border: 3px solid rgba(255,255,255,0.8); border-radius: 15px;' : ''; ?>">
                        >
                    <?php else: ?>
                        <img 
                            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                            alt="<?php echo htmlspecialchars($evento['nome']); ?>" 
                            class="img-fluid event-image w-100 <?php echo !empty($evento['imagem_fundo']) ? 'shadow-lg' : ''; ?>"
                            style="<?php echo !empty($evento['imagem_fundo']) ? 'border: 3px solid rgba(255,255,255,0.8); border-radius: 15px;' : ''; ?>"
                        >
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </section>

    <!-- Tickets Section - Mobile First -->
    <div class="d-lg-none">
        <div class="container">
            <div class="ticket-card mobile-ticket-card" id="ingressos">
                <div class="p-4">
                    <h4 class="fw-bold mb-4">
                        <i class="fas fa-ticket-alt text-primary me-2"></i>
                        Ingressos
                    </h4>
                    
                    <div id="mobile-tickets-list">
                        <!-- Tickets will be dynamically populated here -->
                    </div>

                    <div id="mobile-summary" class="mt-4 p-3 bg-light rounded" style="display: none;">
                        <!-- Summary will be populated here -->
                    </div>

                    <!-- Promo Code -->
                    <div class="mt-4">
                        <div class="d-flex gap-2">
                            <input 
                                type="text" 
                                class="form-control promo-input"
                                placeholder="Código promocional"
                                id="mobile-promo-code"
                            >
                            <button 
                                class="btn btn-outline-primary"
                                onclick="applyPromoCode()"
                                id="mobile-promo-btn"
                            >
                                <i class="fas fa-tag"></i>
                            </button>
                        </div>
                        
                    </div>

                    <!-- Buy Button -->
                    <button 
                        class="btn btn-primary-gradient w-100 mt-4"
                        id="mobile-buy-btn"
                        onclick="comprarIngressoMobile()"
                        style="touch-action: manipulation; -webkit-tap-highlight-color: rgba(0,0,0,0);"
                        disabled
                    >
                        <i class="fas fa-shopping-cart me-2"></i>
                        Comprar Ingressos
                    </button>
                    <!-- Payment Methods -->
                    <div class="mt-4 text-center">
                        <h6 class="mb-3">Métodos de Pagamento</h6>
                        <div class="payment-methods">
                             <div class="payment-icon" title="Credito">
                                    <i class="fa fa-credit-card text-primary"></i>
                                </div>                                
                                <div class="payment-icon" title="PIX">
                                    <i class="fab fa-pix text-success"></i>
                                </div>
                                 
                        </div>
                        <small class="text-muted d-block mt-2">
                            Ambiente seguro • Dados protegidos
                        </small>
                    </div>
 
                </div>
            </div>
        </div>
    </div>

    <div class="container my-5">
        <div class="row">
            <!-- Content Column -->
            <div class="col-lg-8">
                <!-- Event Description -->
                <section class="mb-5">
                    <h2 class="h3 fw-bold mb-4">Sobre o Evento</h2>
                    <div class="row">
                        <div class="col-md-12">
                            <?php if (!empty($evento['descricao'])): ?>
                                <?php echo limparHTML($evento['descricao']); ?>
                            <?php else: ?>
                                <p class="mb-4">
                                    Mais informações sobre este evento em breve.
                                </p>
                            <?php endif; ?>
                        </div>
                        
                    </div>
                </section>

                <!-- Local e Data Section -->
                <section class="mb-5">
                    <h2 class="h3 fw-bold mb-4">
                        <i class="fas fa-info-circle text-primary me-2"></i>
                        Informações do Evento
                    </h2>
                    
                    <div class="row g-4">
                        <!-- Data e Horário -->
                        <div class="col-lg-6">
                            <div class="info-card h-100">
                                <div class="info-icon">
                                    <i class="fas fa-calendar-alt"></i>
                                </div>
                                <div class="info-content">
                                    <h5 class="fw-semibold mb-2">Data e Horário</h5>
                                    <div class="info-details">
                                        <div class="date-info mb-2">
                                            <i class="fas fa-calendar text-primary me-2"></i>
                                            <span class="fw-medium">
                                                <?php if ($mesmo_dia): ?>
                                                    <?php echo $data_inicio['data']; ?>
                                                <?php else: ?>
                                                    <?php echo $data_inicio['data']; ?> até <?php echo $data_fim['data']; ?>
                                                <?php endif; ?>
                                            </span>
                                        </div>
                                        <div class="time-info">
                                            <i class="fas fa-clock text-primary me-2"></i>
                                            <span>
                                                <?php if ($mesmo_dia): ?>
                                                    <?php echo $data_inicio['hora']; ?> às <?php echo $data_fim['hora']; ?>
                                                <?php else: ?>
                                                    <?php echo $data_inicio['hora']; ?> até <?php echo $data_fim['hora']; ?>
                                                <?php endif; ?>
                                            </span>
                                        </div>
                                        <?php if (!empty($evento['timezone']) && $evento['timezone'] != 'America/Sao_Paulo'): ?>
                                        <div class="timezone-info mt-2">
                                            <small class="text-muted">
                                                <i class="fas fa-globe me-1"></i>
                                                Fuso horário: <?php echo htmlspecialchars($evento['timezone']); ?>
                                            </small>
                                        </div>
                                        <?php endif; ?>
                                        
                                        <!-- Botão Adicionar à Agenda -->
                                        <div class="mt-3">
                                            <div class="dropdown">
                                                <button class="btn btn-outline-primary btn-sm dropdown-toggle" type="button" id="addToCalendarBtn" data-bs-toggle="dropdown" aria-expanded="false">
                                                    <i class="fas fa-calendar-plus me-2"></i>
                                                    Adicionar à Agenda
                                                </button>
                                                <ul class="dropdown-menu" aria-labelledby="addToCalendarBtn">
                                                    <li>
                                                        <a class="dropdown-item" href="#" onclick="addToGoogleCalendar()">
                                                            <i class="fab fa-google text-danger me-2"></i>
                                                            Google Calendar
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a class="dropdown-item" href="#" onclick="addToOutlookCalendar()">
                                                            <i class="fab fa-microsoft text-primary me-2"></i>
                                                            Outlook Calendar
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a class="dropdown-item" href="#" onclick="downloadICSFile()">
                                                            <i class="fas fa-download text-success me-2"></i>
                                                            Baixar arquivo .ics
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Local -->
                        <div class="col-lg-6">
                            <div class="info-card h-100">
                                <div class="info-icon">
                                    <i class="fas fa-<?php echo $evento['tipo_local'] == 'online' ? 'video' : 'map-marker-alt'; ?>"></i>
                                </div>
                                <div class="info-content">
                                    <h5 class="fw-semibold mb-2">Local</h5>
                                    <div class="info-details">
                                        <?php if ($evento['tipo_local'] == 'online'): ?>
                                            <div class="online-info">
                                                <div class="mb-2">
                                                    <i class="fas fa-video text-success me-2"></i>
                                                    <span class="fw-medium text-success">Evento Online</span>
                                                </div>
                                                <p class="text-muted mb-0">
                                                    Link de acesso será enviado por e-mail após a confirmação da inscrição.
                                                </p>
                                            </div>
                                        <?php elseif (!empty($evento['nome_local'])): ?>
                                            <div class="location-info">
                                                <h6 class="fw-semibold mb-2"><?php echo htmlspecialchars($evento['nome_local']); ?></h6>
                                                <div class="address-details text-muted mb-3">
                                                    <?php 
                                                    $endereco_linhas = array_filter([
                                                        $evento['rua'] . ($evento['numero'] ? ', ' . $evento['numero'] : ''),
                                                        $evento['complemento'],
                                                        $evento['bairro'] . ($evento['cep'] ? ' - CEP: ' . $evento['cep'] : ''),
                                                        $evento['cidade'] . ($evento['estado'] ? ', ' . $evento['estado'] : '') . ($evento['pais'] ? ', ' . $evento['pais'] : '')
                                                    ]);
                                                    
                                                    foreach ($endereco_linhas as $linha) {
                                                        if (!empty($linha)) {
                                                            echo '<div><i class="fas fa-map-pin text-primary me-2"></i>' . htmlspecialchars($linha) . '</div>';
                                                        }
                                                    }
                                                    ?>
                                                </div>
                                                
                                                <?php
                                                // Montar endereço para Google Maps
                                                $endereco_maps = urlencode(implode(', ', array_filter([
                                                    $evento['nome_local'],
                                                    $evento['rua'] . ($evento['numero'] ? ', ' . $evento['numero'] : ''),
                                                    $evento['bairro'],
                                                    $evento['cidade'],
                                                    $evento['estado'],
                                                    $evento['pais']
                                                ])));
                                                ?>
                                                
                                                <a href="https://www.google.com/maps/search/?api=1&query=<?php echo $endereco_maps; ?>" 
                                                   target="_blank" 
                                                   class="btn btn-outline-primary btn-sm">
                                                    <i class="fas fa-map-marker-alt me-2"></i>
                                                    Ver no Mapa
                                                </a>
                                            </div>
                                        <?php else: ?>
                                            <div class="location-tbd">
                                                <div class="mb-2">
                                                    <i class="fas fa-clock text-warning me-2"></i>
                                                    <span class="text-warning fw-medium">Local a definir</span>
                                                </div>
                                                <p class="text-muted mb-0">
                                                    As informações do local serão divulgadas em breve.
                                                </p>
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Producer Section -->
                <section id="produtor" class="mb-5">
                    <hr class="section-divider">
                    <h2 class="h3 fw-bold mb-4">Sobre o Organizador</h2>
                    <div class="row align-items-center">
                        <div class="col-md-3 text-center text-md-start">
                            <div class="producer-avatar mx-auto mx-md-0">
                                <?php if (!empty($logomarca_organizador)): ?>
                                    <img src="<?php echo htmlspecialchars($logomarca_organizador); ?>" alt="<?php echo htmlspecialchars($nome_organizador_display); ?>" class="rounded-circle w-100 h-100" style="object-fit: cover;">
                                <?php else: ?>
                                    <?php echo obterIniciais($nome_organizador_display); ?>
                                <?php endif; ?>
                            </div>
                        </div>
                        <div class="col-md-9">
                            <h4><?php echo htmlspecialchars($nome_organizador_display); ?></h4>
                            
                            <?php if (!empty($email_organizador)): ?>
                                <p class="text-muted mb-3">
                                    <i class="fas fa-envelope me-2"></i>
                                    <a href="mailto:<?php echo htmlspecialchars($email_organizador); ?>" class="text-decoration-none">
                                        <?php echo htmlspecialchars($email_organizador); ?>
                                    </a>
                                </p>
                            <?php endif; ?>
                            
                            <?php if (!empty($telefone_organizador)): ?>
                                <p class="text-muted mb-3">
                                    <i class="fas fa-phone me-2"></i>
                                    <?php echo htmlspecialchars($telefone_organizador); ?>
                                </p>
                            <?php endif; ?>
                        </div>
                    </div>
                </section>
            </div>

            <!-- Tickets Column - Desktop Only -->
            <div class="col-lg-4 d-none d-lg-block">
                <div class="ticket-card" id="ingressos">
                    <div class="p-4">
                        <h4 class="fw-bold mb-4">
                            <i class="fas fa-ticket-alt text-primary me-2"></i>
                            Ingressos
                        </h4>
                        
                        <div id="desktop-tickets-list">
                            <!-- Tickets will be dynamically populated here -->
                        </div>

                        <div id="desktop-summary" class="mt-4 p-3 bg-light rounded" style="display: none;">
                            <!-- Summary will be populated here -->
                        </div>
                        <!-- Promo Code -->
                        <div class="mt-4">
                            <div class="d-flex gap-2">
                                <input 
                                    type="text" 
                                    class="form-control promo-input"
                                    placeholder="Código promocional"
                                    id="desktop-promo-code"
                                >
                                <button 
                                    class="btn btn-outline-primary"
                                    onclick="applyPromoCode()"
                                    id="desktop-promo-btn"
                                >
                                    <i class="fas fa-tag"></i>
                                </button>
                            </div>
                            
                        </div>

                        <!-- Buy Button -->
                        <button 
                            class="btn btn-primary-gradient w-100 mt-4"
                            id="desktop-buy-btn"
                            onclick="if(window.processarCompra) { console.log('Onclick desktop direto'); window.processarCompra(); } else { console.error('processarCompra não encontrada'); }"
                            disabled
                        >
                            <i class="fas fa-shopping-cart me-2"></i>
                            Comprar Ingressos
                        </button>
                          
                        </button>

                        <!-- Payment Methods -->
                        <div class="mt-4 text-center">
                            <h6 class="mb-3">Métodos de Pagamento</h6>
                            <div class="payment-methods">
                                <div class="payment-icon" title="Credito">
                                    <i class="fa fa-credit-card text-primary"></i>
                                </div>                                
                                <div class="payment-icon" title="PIX">
                                    <i class="fab fa-pix text-success"></i>
                                </div>
                                
                            </div>
                            <small class="text-muted d-block mt-2">
                                Ambiente seguro • Dados protegidos
                            </small>
                        </div>

                        
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4 mt-5">
        <div class="container">
         
           
            <div class="text-center">
                <small class="text-white">&copy; 2025 AnySummit é uma solução da suíte <a href="https://www.anysolutions.ai" target="_blank" rel="noopener noreferrer" class="text-white">AnySolutions.ai</a> da Caderno Virtual Ltda. Todos os Direitos reservados.</small>
            </div>
        </div>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/functions-evento-modified.js"></script>
    <!-- DEBUG TEMPORÁRIO PARA MOBILE -->
    <script src="debug-forcar-botao.js"></script>
    
    <!-- Script para integrar dados do PHP com o JavaScript do functions-evento.js -->
    <script>
        // Dados dos ingressos vigentes (apenas os que estão no período de venda)
        const phpIngressos = <?php echo json_encode($ingressos); ?>;
        const eventoData = {
            id: <?php echo $evento['id']; ?>,
            nome: <?php echo json_encode($evento['nome']); ?>,
            slug: <?php echo json_encode($evento['slug']); ?>
        };

        // Converter dados do PHP para o formato esperado pelo functions-evento.js
        if (phpIngressos && phpIngressos.length > 0) {
            // Substituir os dados estáticos pelos dados reais
            tickets = phpIngressos.map((ingresso, index) => {
                const disponivel = ingresso.quantidade_total - ingresso.quantidade_vendida - ingresso.quantidade_reservada;
                const preco = parseFloat(ingresso.preco || 0);
                const taxa = parseFloat(ingresso.taxa_plataforma || 0);
                
                // NOVO: Processar informações do lote
                let badgeLote = '';
                if (<?php echo $mostrar_badge_lote ? 'true' : 'false'; ?> && ingresso.lote_nome) {
                    badgeLote = ingresso.lote_nome;
                    if (ingresso.divulgar_criterio == 1 && ingresso.lote_data_fim) {
                        const dataFim = new Date(ingresso.lote_data_fim);
                        badgeLote += " - até " + dataFim.toLocaleDateString('pt-BR');
                    }
                }
                
                // NOVO: Aplicar aumento percentual do lote no preço
                let precoFinal = preco;
                if (ingresso.lote_tipo && ingresso.percentual_aumento_valor) {
                    const aumentoPercentual = parseFloat(ingresso.percentual_aumento_valor || 0);
                    if (aumentoPercentual > 0) {
                        precoFinal = preco * (1 + aumentoPercentual / 100);
                    }
                }
                
                // NOVO: Processar conteúdo do combo com nomes dos ingressos
                let comboItens = null;
                if (ingresso.tipo === 'combo' && ingresso.conteudo_combo) {
                    // Usar dados processados pelo PHP que já incluem os nomes
                    comboItens = ingresso.combo_itens_processados || null;
                }
                
                return {
                    id: ingresso.id.toString(),
                    name: ingresso.titulo,
                    originalPrice: preco, // Preço original sem lote
                    currentPrice: precoFinal, // Preço com ajuste do lote
                    quantity: 0,
                    maxQuantity: ingresso.limite_max > 0 ? Math.min(disponivel, ingresso.limite_max) : 0,
                    available: disponivel > 0 && ingresso.ativo == 1,
                    taxa_plataforma: taxa,
                    // NOVOS CAMPOS
                    tipo: ingresso.tipo,
                    badgeLote: badgeLote,
                    comboItens: comboItens,
                    descricao: ingresso.descricao || '',
                    // CAMPOS DO LOTE
                    lote_nome: ingresso.lote_nome || '',
                    lote_tipo: ingresso.lote_tipo || '',
                    lote_data_inicio: ingresso.lote_data_inicio || null,
                    lote_data_fim: ingresso.lote_data_fim || null,
                    percentual_aumento_valor: ingresso.percentual_aumento_valor || 0
                };
            });

            // Reinicializar o sistema de tickets com os dados reais
            document.addEventListener('DOMContentLoaded', function() {
                // Aguardar o functions-evento.js carregar primeiro
                setTimeout(() => {
                    if (typeof renderTickets === 'function') {
                        renderTickets();
                        updateSummary();
                        console.log('Ingressos vigentes carregados:', tickets);
                        
                        // Debug dos preços
                        tickets.forEach(ticket => {
                            console.log(`Ingresso: ${ticket.name} - Preço: R$ ${ticket.currentPrice.toFixed(2).replace('.', ',')}`);
                            
                            // Debug específico para combos
                            if (ticket.tipo === 'combo' && ticket.comboItens) {
                                console.log(`  Combo contém:`, ticket.comboItens);
                                ticket.comboItens.forEach(item => {
                                    console.log(`    - ${item.quantidade}x ${item.nome} (ID: ${item.ingresso_id})`);
                                });
                            }
                        });
                    }
                }, 100);
            });
        }

        // Atualizar as funções de compartilhamento com dados reais
        function shareEvent(platform) {
            const url = window.location.href;
            const text = `Confira este evento: ${eventoData.nome}`;
            
            const shareUrls = {
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
                whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
            };
            
            if (shareUrls[platform]) {
                window.open(shareUrls[platform], '_blank', 'width=600,height=400');
            }
        }

        function copyLink() {
            navigator.clipboard.writeText(window.location.href).then(() => {
                // Mostrar feedback visual
                const btn = event.target.closest('button');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check me-1"></i> Copiado!';
                btn.classList.add('btn-success');
                btn.classList.remove('btn-outline-primary');
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove('btn-success');
                    btn.classList.add('btn-outline-primary');
                }, 2000);
            }).catch(() => {
                alert('Link copiado para a área de transferência!');
            });
        }
    </script>
    
    <!-- FUNÇÕES PARA ADICIONAR À AGENDA -->
    <script>
        // Dados do evento para calendário
        const eventoCalendario = {
            nome: <?php echo json_encode($evento['nome']); ?>,
            descricao: <?php echo json_encode(strip_tags($evento['descricao'])); ?>,
            dataInicio: '<?php echo $evento['data_inicio']; ?>',
            dataFim: '<?php echo $evento['data_fim']; ?>',
            timezone: '<?php echo $evento['timezone'] ?: 'America/Sao_Paulo'; ?>',
            local: <?php echo json_encode($evento['tipo_local'] == 'online' ? 'Evento Online' : $endereco_completo); ?>,
            url: window.location.href
        };

        // Função para formatar data para diferentes calendários
        function formatarDataCalendario(dataString, formato = 'google') {
            const data = new Date(dataString);
            
            if (formato === 'google') {
                // Formato Google Calendar: YYYYMMDDTHHMMSSZ
                return data.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
            } else if (formato === 'outlook') {
                // Formato Outlook: YYYY-MM-DDTHH:mm:ss.sssZ
                return data.toISOString();
            } else if (formato === 'ics') {
                // Formato ICS: YYYYMMDDTHHMMSSZ
                return data.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
            }
        }

        // Adicionar ao Google Calendar
        function addToGoogleCalendar() {
            const dataInicio = formatarDataCalendario(eventoCalendario.dataInicio, 'google');
            const dataFim = formatarDataCalendario(eventoCalendario.dataFim, 'google');
            
            const params = new URLSearchParams({
                action: 'TEMPLATE',
                text: eventoCalendario.nome,
                dates: `${dataInicio}/${dataFim}`,
                details: `${eventoCalendario.descricao}\n\nMais informações: ${eventoCalendario.url}`,
                location: eventoCalendario.local || '',
                ctz: eventoCalendario.timezone
            });
            
            const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
            window.open(url, '_blank');
        }

        // Adicionar ao Outlook Calendar
        function addToOutlookCalendar() {
            const dataInicio = formatarDataCalendario(eventoCalendario.dataInicio, 'outlook');
            const dataFim = formatarDataCalendario(eventoCalendario.dataFim, 'outlook');
            
            const params = new URLSearchParams({
                path: '/calendar/action/compose',
                rru: 'addevent',
                subject: eventoCalendario.nome,
                startdt: dataInicio,
                enddt: dataFim,
                body: `${eventoCalendario.descricao}\n\nMais informações: ${eventoCalendario.url}`,
                location: eventoCalendario.local || ''
            });
            
            const url = `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
            window.open(url, '_blank');
        }

        // Baixar arquivo ICS
        function downloadICSFile() {
            const dataInicio = formatarDataCalendario(eventoCalendario.dataInicio, 'ics');
            const dataFim = formatarDataCalendario(eventoCalendario.dataFim, 'ics');
            
            // Criar o conteúdo do arquivo ICS
            const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Any Summit//Event Calendar//PT
BEGIN:VEVENT
UID:${Date.now()}@anysummit.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}
DTSTART:${dataInicio}
DTEND:${dataFim}
SUMMARY:${eventoCalendario.nome}
DESCRIPTION:${eventoCalendario.descricao.replace(/\n/g, '\\n')}\\n\\nMais informações: ${eventoCalendario.url}
LOCATION:${eventoCalendario.local || ''}
URL:${eventoCalendario.url}
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

            // Criar e baixar o arquivo
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${eventoCalendario.nome.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }
    </script>
    
    <!-- FUNÇÃO DE BACKUP PARA MOBILE -->
    <script>
        // Função específica para mobile
        function comprarIngressoMobile() {
            console.log('🛒 comprarIngressoMobile chamada');
            
            // Verificar se há ingressos selecionados
            let totalSelecionado = 0;
            let ingressosSelecionados = [];
            
            // Se a variável tickets existir, usar ela
            if (typeof tickets !== 'undefined' && tickets) {
                tickets.forEach(ticket => {
                    if (ticket.quantity > 0) {
                        totalSelecionado += ticket.quantity;
                        ingressosSelecionados.push({
                            id: ticket.id,
                            nome: ticket.name,
                            preco: ticket.currentPrice,
                            quantidade: ticket.quantity,
                            subtotal: ticket.currentPrice * ticket.quantity
                        });
                    }
                });
            }
            
            // Se não há ingressos selecionados, criar um padrão para teste
            if (totalSelecionado === 0) {
                console.log('⚠️ Nenhum ingresso selecionado, criando ingresso padrão');
                ingressosSelecionados = [{
                    id: 1,
                    nome: 'Almoço (dois dias)',
                    preco: 150.00,
                    quantidade: 1,
                    subtotal: 150.00
                }];
                totalSelecionado = 1;
            }
            
            // Criar carrinho
            const carrinho = {
                evento: eventoData || {
                    id: <?php echo $evento['id']; ?>,
                    nome: <?php echo json_encode($evento['nome']); ?>,
                    slug: <?php echo json_encode($evento['slug']); ?>
                },
                ingressos: ingressosSelecionados,
                subtotal: ingressosSelecionados.reduce((sum, ing) => sum + ing.subtotal, 0),
                total: ingressosSelecionados.reduce((sum, ing) => sum + ing.subtotal, 0)
            };
            
            console.log('🛒 Carrinho criado:', carrinho);
            
            try {
                // Salvar no sessionStorage
                sessionStorage.setItem('carrinho', JSON.stringify(carrinho));
                console.log('✅ Carrinho salvo no sessionStorage');
                
                // Redirecionar
                const checkoutUrl = '/evento/checkout/' + encodeURIComponent(carrinho.evento.slug);
                console.log('🔄 Redirecionando para:', checkoutUrl);
                
                window.location.href = checkoutUrl;
                
            } catch (error) {
                console.error('❌ Erro:', error);
                alert('Erro ao processar: ' + error.message);
            }
        }
        
        // Forçar habilitação do botão após carregar
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                const mobileBuyBtn = document.getElementById('mobile-buy-btn');
                if (mobileBuyBtn) {
                    mobileBuyBtn.disabled = false;
                    console.log('✅ Botão mobile habilitado forçadamente');
                }
            }, 3000);
        });
    </script>
</body>
</html>
