<?php
include("conm/conn.php");

// Pegar o slug do evento da URL
$slug = isset($_GET['slug']) ? $_GET['slug'] : 'congresso-2025';

// Consulta para buscar dados do evento
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
    WHERE e.slug = '$slug' AND e.status = 'publicado' AND e.visibilidade = 'publico'
    LIMIT 1
";

$result_evento = $con->query($sql_evento);

if ($result_evento->num_rows == 0) {
    echo "<h1>Evento não encontrado</h1>";
    exit;
}

$evento = $result_evento->fetch_assoc();

// Buscar ingressos do evento
$sql_ingressos = "
    SELECT *
    FROM ingressos 
    WHERE evento_id = " . $evento['id'] . "
    AND ativo = 1 
    AND disponibilidade = 'publico'
    AND (inicio_venda IS NULL OR inicio_venda <= NOW())
    AND (fim_venda IS NULL OR fim_venda >= NOW())
    ORDER BY posicao_ordem ASC, preco ASC
";

// Buscar APENAS ingressos vigentes (dentro do período de venda)
$sql_ingressos = "
    SELECT *
    FROM ingressos 
    WHERE evento_id = " . $evento['id'] . "
    AND ativo = 1 
    AND disponibilidade = 'publico'
    AND (inicio_venda IS NULL OR inicio_venda <= NOW())
    AND (fim_venda IS NULL OR fim_venda >= NOW())
    ORDER BY posicao_ordem ASC, preco ASC
";

$result_ingressos = $con->query($sql_ingressos);

$ingressos = [];
while ($row = $result_ingressos->fetch_assoc()) {
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
$nome_produtor_display = !empty($evento['nome_exibicao_produtor']) ? $evento['nome_exibicao_produtor'] : 
                        (!empty($evento['nome_exibicao']) ? $evento['nome_exibicao'] : 
                        (!empty($evento['nome_fantasia']) ? $evento['nome_fantasia'] : $evento['nome_usuario']));
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, shrink-to-fit=no">
     
    <title><?php echo htmlspecialchars($evento['nome']); ?></title>
    <meta name="description" content=" <?php echo truncarTexto($evento['descricao'], 160); ?>">
    <meta name="author" content="<?php echo htmlspecialchars($nome_produtor_display); ?>">

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
        <?php if (!empty($evento['imagem_fundo'])): ?>
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
        <?php endif; ?>
        
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
        }
        
        /* Estilos para seção Local */
        .location-section {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            transition: all 0.3s ease;
        }
        
        .location-section:hover {
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .location-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #007bff, #0056b3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
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

    <!-- Hero Section -->
    <section class="hero-section<?php echo !empty($evento['imagem_fundo']) ? ' hero-with-background' : ''; ?>" id="evento" 
             style="<?php echo !empty($evento['imagem_fundo']) ? '' : 'margin-top: 76px;'; ?>">
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
                            <span class="badge bg-success rounded-pill px-3 py-2 ms-2">
                                <i class="fas fa-<?php echo $evento['tipo_local'] == 'online' ? 'video' : 'map-marker-alt'; ?> me-1"></i>
                                <?php 
                                if ($evento['tipo_local'] == 'online') {
                                    echo 'Evento Online';
                                } else {
                                    echo htmlspecialchars($nomelocal ?: 'Local a definir');
                                }
                                ?>
                            </span>
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
                        <p class="lead mb-4<?php echo !empty($evento['imagem_fundo']) ? '' : ' text-muted'; ?>">
                            <?php echo truncarTexto($evento['descricao'], 250); ?>
                        </p>
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
                            src="/produtor/<?php echo htmlspecialchars($evento['imagem_capa']); ?>" 
                            alt="<?php echo htmlspecialchars($evento['nome']); ?>" 
                            class="img-fluid event-image w-100 <?php echo !empty($evento['imagem_fundo']) ? 'shadow-lg' : ''; ?>"
                            style="<?php echo !empty($evento['imagem_fundo']) ? 'border: 3px solid rgba(255,255,255,0.8); border-radius: 15px;' : ''; ?>"
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
                                <div class="payment-icon" title="Boleto">
                                    <i class="fas fa-barcode text-dark"></i>
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

                <!-- Local Section -->
                <?php if ($evento['tipo_local'] == 'presencial' && !empty($evento['nome_local'])): ?>
                <section class="mb-5">
                    <div class=" ">
                        <h2 class="h3 fw-bold mb-4">
                            <i class="fas fa-map-marker-alt text-primary me-2"></i>
                            Local
                        </h2>
                        
                        <div class="row">
                            <div class="col-md-12">
                                <h4 class="fw-semibold mb-2"><?php echo htmlspecialchars($evento['nome_local']); ?></h4>
                                <div class="text-muted mb-3">
                                    <?php 
                                    $endereco_linhas = array_filter([
                                        $evento['rua'] . ($evento['numero'] ? ', ' . $evento['numero'] : ''),
                                        $evento['complemento'],
                                        $evento['bairro'] . ($evento['cep'] ? ' - CEP: ' . $evento['cep'] : ''),
                                        $evento['cidade'] . ($evento['estado'] ? ', ' . $evento['estado'] : '') . ($evento['pais'] ? ', ' . $evento['pais'] : '')
                                    ]);
                                    
                                    foreach ($endereco_linhas as $linha) {
                                        if (!empty($linha)) {
                                            echo '<div>' . htmlspecialchars($linha) . '</div>';
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
                                   class="btn btn-outline-primary">
                                    <i class="fas fa-map-marker-alt me-2"></i>
                                    Ver no Mapa
                                </a>
                            </div>
                            
                             
                        </div>
                    </div>
                </section>
                <?php endif; ?>

                <!-- Producer Section -->
                <section id="produtor" class="mb-5">
                    <hr class="section-divider">
                    <h2 class="h3 fw-bold mb-4">Sobre o Produtor</h2>
                    <div class="row align-items-center">
                        <div class="col-md-3 text-center text-md-start">
                            <div class="producer-avatar mx-auto mx-md-0">
                                <?php if (!empty($evento['foto_perfil'])): ?>
                                    <img src="<?php echo htmlspecialchars($evento['foto_perfil']); ?>" alt="<?php echo htmlspecialchars($nome_produtor_display); ?>" class="rounded-circle w-100 h-100" style="object-fit: cover;">
                                <?php else: ?>
                                    <?php echo obterIniciais($nome_produtor_display); ?>
                                <?php endif; ?>
                            </div>
                        </div>
                        <div class="col-md-9">
                            <h4><?php echo htmlspecialchars($nome_produtor_display); ?></h4>
                            <?php if (!empty($evento['descricao_produtor']) || !empty($evento['descricao_usuario'])): ?>
                                <p class="text-muted mb-3">
                                    <?php echo nl2br(htmlspecialchars($evento['descricao_produtor'] ?: $evento['descricao_usuario'])); ?>
                                </p>
                            <?php endif; ?>
                            
                            <?php if (!empty($evento['email_contato'])): ?>
                                <p class="text-muted mb-3">
                                    <i class="fas fa-envelope me-2"></i>
                                    <a href="mailto:<?php echo htmlspecialchars($evento['email_contato']); ?>" class="text-decoration-none">
                                        <?php echo htmlspecialchars($evento['email_contato']); ?>
                                    </a>
                                </p>
                            <?php endif; ?>
                            
                            <?php if (!empty($evento['telefone_contratante'])): ?>
                                <p class="text-muted mb-3">
                                    <i class="fas fa-phone me-2"></i>
                                    <?php echo htmlspecialchars($evento['telefone_contratante']); ?>
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
                                <div class="payment-icon" title="Boleto">
                                    <i class="fas fa-barcode text-dark"></i>
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
                <small class="text-white">&copy; <?php echo date('Y'); ?> Any Summit. Todos os direitos reservados.</small>
            </div>
        </div>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/functions-evento.js"></script>
    
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
                
                return {
                    id: ingresso.id.toString(),
                    name: ingresso.titulo,
                    originalPrice: preco, // Apenas o preço base
                    currentPrice: preco,  // Apenas o preço base
                    installments: preco > 0 ? `em até 12x R$ ${(preco / 12).toFixed(2).replace('.', ',')}` : '',
                    quantity: 0,
                    maxQuantity: Math.min(disponivel, ingresso.limite_max || disponivel),
                    available: disponivel > 0 && ingresso.ativo == 1,
                    taxa_plataforma: taxa // Manter taxa separada se precisar mostrar depois
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
</body>
</html>
