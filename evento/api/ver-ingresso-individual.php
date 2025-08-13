<?php
include("../conm/conn.php");

// Função para decodificar hash do ingresso
function decodificarHashIngresso($hash) {
    global $con;
    
    $sql = "SELECT ii.id, ii.criado_em 
            FROM tb_ingressos_individuais ii 
            WHERE SHA2(CONCAT('AnySummit2025@#$%ingresso', ii.id, UNIX_TIMESTAMP(ii.criado_em)), 256) = ?
            LIMIT 1";
    
    $stmt = $con->prepare($sql);
    $stmt->bind_param("s", $hash);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return $row['id'];
    }
    
    return false;
}

// Verificar se o hash ou ingresso_id foi fornecido
$hash = isset($_GET['h']) ? trim($_GET['h']) : '';
$ingresso_id = isset($_GET['ingresso_id']) ? intval($_GET['ingresso_id']) : 0;

// Decodificar hash se fornecido
if (!empty($hash)) {
    $ingresso_id = decodificarHashIngresso($hash);
    if (!$ingresso_id) {
        die('Hash inválido ou ingresso não encontrado');
    }
} elseif (!$ingresso_id) {
    die('ID do ingresso não fornecido');
}

try {
    // Buscar dados completos do ingresso individual
    $sql = "SELECT 
        ii.*,
        e.nome as evento_nome, 
        e.data_inicio, 
        e.nome_local, 
        e.cidade, 
        e.estado,
        e.imagem_capa,
        e.busca_endereco,
        p.codigo_pedido, 
        p.comprador_nome,
        c.nome as comprador_nome_completo,
        c.email as comprador_email,
        cont.nome_fantasia as organizador_nome,
        cont.logomarca as organizador_logo
        FROM tb_ingressos_individuais ii
        LEFT JOIN eventos e ON ii.eventoid = e.id
        LEFT JOIN tb_pedidos p ON ii.pedidoid = p.pedidoid
        LEFT JOIN compradores c ON p.compradorid = c.id
        LEFT JOIN contratantes cont ON e.contratante_id = cont.id
        WHERE ii.id = ?";
    
    $stmt = $con->prepare($sql);
    $stmt->bind_param("i", $ingresso_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        die('Ingresso não encontrado');
    }
    
    $ingresso = $result->fetch_assoc();
    
    // VERIFICAÇÃO PARA PARTICIPANTE_ID
    if (empty($ingresso['participanteid'])) {
        ?>
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Voucher - <?php echo htmlspecialchars($ingresso['evento_nome']); ?></title>
            
            <!-- Bootstrap CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <!-- Font Awesome -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
            <!-- Google Fonts -->
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    background: linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%);
                    min-height: 100vh;
                    padding: 20px 0;
                    margin: 0;
                }
                
                .main-container {
                    max-width: 800px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 80vh;
                }
                
                .voucher-card {
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    border: 1px solid rgba(255, 193, 7, 0.3);
                    background: rgba(26, 26, 46, 0.95);
                    backdrop-filter: blur(15px);
                    overflow: hidden;
                    width: 100%;
                    max-width: 600px;
                }
                
                .header-gradient {
                    background: linear-gradient(135deg, #FFC107 0%, #FF8F00 100%);
                    color: white;
                    padding: 2rem;
                    text-align: center;
                    position: relative;
                }
                
                .content {
                    background: white;
                    padding: 2rem;
                    text-align: center;
                }
                
                .warning-icon {
                    font-size: 4rem;
                    color: #FFC107;
                    margin-bottom: 1rem;
                }
                
                .warning-title {
                    color: #495057;
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }
                
                .warning-message {
                    color: #6c757d;
                    font-size: 1.1rem;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                }
                
                .voucher-code {
                    font-size: 18px;
                    font-weight: 700;
                    font-family: 'Courier New', monospace;
                    color: #FFC107;
                    background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 143, 0, 0.1));
                    padding: 15px;
                    border-radius: 15px;
                    border: 2px solid #FFC107;
                    text-align: center;
                    letter-spacing: 2px;
                    margin: 15px 0;
                    text-transform: uppercase;
                }
                
                .event-info {
                    background: rgba(255, 193, 7, 0.1);
                    border: 1px solid rgba(255, 193, 7, 0.2);
                    padding: 20px;
                    border-radius: 12px;
                    margin: 20px 0;
                    text-align: left;
                }
                
                .btn-action {
                    background: linear-gradient(135deg, #FFC107 0%, #FF8F00 100%);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-weight: 600;
                    box-shadow: 0 8px 25px rgba(255, 193, 7, 0.4);
                    transition: all 0.3s ease;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0 5px;
                }
                
                .btn-action:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 35px rgba(255, 193, 7, 0.6);
                    color: white;
                    text-decoration: none;
                }
                
                .btn-secondary {
                    background: linear-gradient(135deg, #6c757d, #495057);
                }
                
                @media print {
                    body {
                        background: white !important;
                    }
                    .voucher-card {
                        box-shadow: none !important;
                        border: 2px solid #FFC107 !important;
                    }
                    .header-gradient {
                        background: linear-gradient(135deg, #FFC107 0%, #FF8F00 100%) !important;
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                }
            </style>
        </head>
        <body>
            <div class="main-container">
                <div class="voucher-card">
                    <!-- Header -->
                    <div class="header-gradient">
                        <h1 class="mb-2 fs-2">
                            <i class="fas fa-ticket-alt me-2"></i>
                            Voucher de Evento
                        </h1>
                        <h3 class="mb-0 opacity-90"><?php echo htmlspecialchars($ingresso['evento_nome']); ?></h3>
                    </div>
                    
                    <!-- Conteúdo Principal -->
                    <div class="content">
                        <div class="warning-icon">
                            <i class="fas fa-user-plus"></i>
                        </div>
                        
                        <h2 class="warning-title">Voucher Aguardando Vinculação</h2>
                        
                        <div class="alert alert-danger mb-3" role="alert" style="background: rgba(220, 53, 69, 0.1); border: 1px solid rgba(220, 53, 69, 0.3); color: #dc3545; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <strong>⚠️ Atenção: Esse documento não garante acesso ao evento!</strong>
                        </div>
                        
                        <p class="warning-message">
                            <strong>Para gerar o ingresso com QR CODE para esse voucher é necessário vinculá-lo à pessoa que efetivamente participará do evento.</strong>
                        </p>
                        
                        <!-- Código do Voucher -->
                        <div class="voucher-code">
                            <?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?>
                        </div>
                        
                        <!-- Informações do Evento -->
                        <div class="event-info">
                            <h5 class="mb-3">
                                <i class="fas fa-info-circle text-warning me-2"></i>
                                Informações do Evento
                            </h5>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <strong>Evento:</strong><br>
                                    <span class="text-muted"><?php echo htmlspecialchars($ingresso['evento_nome']); ?></span>
                                </div>
                                <div class="col-md-6">
                                    <strong>Tipo de Ingresso:</strong><br>
                                    <span class="text-muted"><?php echo htmlspecialchars($ingresso['titulo_ingresso']); ?></span>
                                </div>
                            </div>
                            
                            <?php 
                            $data_evento = '';
                            if ($ingresso['data_inicio']) {
                                $data_evento = date('d/m/Y \à\s H\hi', strtotime($ingresso['data_inicio']));
                            }
                            ?>
                            
                            <?php if ($data_evento): ?>
                            <div class="row mt-3">
                                <div class="col-md-6">
                                    <strong>Data:</strong><br>
                                    <span class="text-muted">
                                        <i class="fas fa-calendar me-1"></i>
                                        <?php echo $data_evento; ?>
                                    </span>
                                </div>
                                <?php if ($ingresso['nome_local']): ?>
                                <div class="col-md-6">
                                    <strong>Local:</strong><br>
                                    <span class="text-muted">
                                        <i class="fas fa-map-marker-alt me-1"></i>
                                        <?php echo htmlspecialchars($ingresso['nome_local']); ?>
                                        <?php if ($ingresso['cidade']): ?>
                                            <br><small><?php echo htmlspecialchars($ingresso['cidade']); ?>
                                            <?php if ($ingresso['estado']): ?>
                                                - <?php echo htmlspecialchars($ingresso['estado']); ?>
                                            <?php endif; ?></small>
                                        <?php endif; ?>
                                    </span>
                                </div>
                                <?php endif; ?>
                            </div>
                            <?php endif; ?>
                            
                            <div class="row mt-3">
                                <div class="col-md-6">
                                    <strong>Código do Voucher:</strong><br>
                                    <span class="text-muted"><?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?></span>
                                </div>
                                <div class="col-md-6">
                                    <strong>Pedido:</strong><br>
                                    <span class="text-muted"><?php echo htmlspecialchars($ingresso['codigo_pedido']); ?></span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Instruções -->
                        <div class="alert alert-warning mt-4" role="alert">
                            <h6 class="alert-heading">
                                <i class="fas fa-lightbulb me-2"></i>
                                Como proceder:
                            </h6>
                            <ul class="mb-0 text-start">
                                <li><strong>Se foi você quem fez a compra:</strong> No corpo do email de confirmação que você recebeu clique no botão "Vincular Participante" e faça a identificação e a impressão do ingresso.</li>
                                <li><strong>Se você recebeu esse voucher de alguém:</strong> No seu email também existe um botão "Vincular Participante". Clique nele, identifique o participante e o ingresso oficial será gerado.</li>
                                <li><strong>Caso não tenha recebido nenhum desses emails ou estiver com dificuldades:</strong> Contate diretamente o organizador do evento, identifique-se e forneça o código desse voucher: <strong><?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?></strong></li>
                            </ul>
                        </div>
                        
                        <!-- Botões de Ação -->
                        <div class="mt-4">
                            <button class="btn-action" onclick="window.print()">
                                <i class="fas fa-print"></i>
                                Imprimir Voucher
                            </button>
                            
                            <button class="btn-action btn-secondary" onclick="window.close()">
                                <i class="fas fa-times"></i>
                                Fechar
                            </button>
                        </div>
                        
                        <!-- Informações de Contato -->
                        <?php if (!empty($ingresso['organizador_nome'])): ?>
                        <div class="mt-4 pt-3 border-top">
                            <small class="text-muted">
                                <i class="fas fa-building me-1"></i>
                                Evento organizado por: <strong><?php echo htmlspecialchars($ingresso['organizador_nome']); ?></strong>
                            </small>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            
            <!-- Bootstrap JS -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
        <?php
        exit;
    }
    
    // Formatações para exibição
    $data_evento = '';
    if ($ingresso['data_inicio']) {
        $data_evento = date('d/m/Y \à\s H\hi', strtotime($ingresso['data_inicio']));
    }
    
    // URLs das imagens
    $imagem_capa_url = '';
    if ($ingresso['imagem_capa']) {
        // Verificar se já tem o caminho completo
        if (strpos($ingresso['imagem_capa'], '/uploads/') === 0) {
            $imagem_capa_url = $ingresso['imagem_capa'];
        } else {
            $imagem_capa_url = '/uploads/eventos/' . $ingresso['imagem_capa'];
        }
    }
    
    $logo_organizador_url = '';
    if ($ingresso['organizador_logo']) {
        $logo_organizador_url = $ingresso['organizador_logo'];
    }
    
    ?>
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ingresso - <?php echo htmlspecialchars($ingresso['evento_nome']); ?></title>
        
        <!-- Bootstrap CSS -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <!-- Font Awesome -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <!-- Google Fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        
        <style>
            @page { 
                margin: 10mm; 
                size: A4 portrait; 
            }
            
            body {
                font-family: 'Inter', sans-serif;
                background: linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%);
                min-height: 100vh;
                padding: 20px 0;
                margin: 0;
            }
            
            .main-container {
                max-width: 800px;
                margin: 0 auto;
            }
            
            .ingresso-card {
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                border: 1px solid rgba(114, 94, 255, 0.3);
                background: rgba(26, 26, 46, 0.95);
                backdrop-filter: blur(15px);
                overflow: hidden;
                margin-bottom: 2rem;
            }
            
            .header-gradient {
                background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%);
                color: white;
                padding: 1.5rem 2rem 1rem 2rem;
                text-align: center;
                position: relative;
            }
            
            .anysummit-logo {
                width: 300px;
                height: auto;
                object-fit: contain;
                margin-bottom: 15px;
            }
            
            .evento-imagem, .organizador-logo {
                border: 3px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
            
            .evento-imagem {
                width: 70px;
                height: 70px;
                border-radius: 50%;
                object-fit: cover;
                background: white;
            }
            
            .organizador-logo {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                object-fit: cover;
                background: white;
            }
            
            .content {
                background: white;
                padding: 1.5rem;
            }
            
            .codigo-destaque {
                font-size: 24px;
                font-weight: 700;
                font-family: 'Courier New', monospace;
                color: #725EFF;
                background: linear-gradient(135deg, rgba(114, 94, 255, 0.1), rgba(0, 194, 255, 0.1));
                padding: 15px;
                border-radius: 15px;
                border: 2px solid #725EFF;
                text-align: center;
                letter-spacing: 2px;
                margin: 15px 0;
                text-transform: uppercase;
            }
            
            .section-title {
                background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%);
                color: white;
                padding: 8px 15px;
                font-size: 14px;
                font-weight: 600;
                border-radius: 8px;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .info-box {
                background: rgba(114, 94, 255, 0.05);
                border: 1px solid rgba(114, 94, 255, 0.2);
                padding: 15px;
                border-radius: 12px;
                margin-bottom: 20px;
            }
            
            .status-badge {
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 600;
                text-transform: uppercase;
                font-size: 12px;
                letter-spacing: 0.5px;
            }
            
            .status-ativo { 
                background: linear-gradient(135deg, #28a745, #20c997); 
                color: white; 
            }
            .status-utilizado { 
                background: linear-gradient(135deg, #dc3545, #fd7e14); 
                color: white; 
            }
            .status-transferido { 
                background: linear-gradient(135deg, #ffc107, #fd7e14); 
                color: white; 
            }
            
            .qr-container {
                text-align: center;
                margin: 30px 0;
            }
            
            .qr-code {
                background: white;
                padding: 20px;
                border-radius: 15px;
                display: inline-block;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            
            .rodape {
                background: linear-gradient(135deg, #2c3e50, #34495e);
                color: white;
                text-align: center;
                padding: 25px;
                font-size: 13px;
            }
            
            .actions-bar {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                display: flex;
                gap: 10px;
            }
            
            .btn-action {
                background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 10px;
                font-weight: 600;
                box-shadow: 0 8px 25px rgba(114, 94, 255, 0.4);
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-action:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 35px rgba(114, 94, 255, 0.6);
                color: white;
                text-decoration: none;
            }
            
            .btn-secondary-action {
                background: linear-gradient(135deg, #6c757d, #495057);
            }
            
            .btn-success-action {
                background: linear-gradient(135deg, #28a745, #20c997);
            }
            
            .dropdown-menu {
                background: rgba(26, 26, 46, 0.95);
                border: 1px solid rgba(114, 94, 255, 0.3);
                border-radius: 10px;
            }
            
            .dropdown-item {
                color: white;
                padding: 10px 20px;
            }
            
            .dropdown-item:hover {
                background: rgba(114, 94, 255, 0.2);
                color: white;
            }
            
            @media print {
                @page {
                    margin: 5mm !important;
                    size: A4 portrait !important;
                }
                
                body {
                    background: white !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    font-size: 12px !important;
                }
                
                .main-container {
                    max-width: none !important;
                    margin: 0 !important;
                }
                
                .ingresso-card {
                    box-shadow: none !important;
                    border: 2px solid #725EFF !important;
                    background: white !important;
                    margin: 0 !important;
                    page-break-inside: avoid !important;
                    height: auto !important;
                    max-height: none !important;
                }
                
                .header-gradient {
                    background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%) !important;
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    padding: 1rem !important;
                }
                
                .anysummit-logo {
                    width: 250px !important;
                    margin-bottom: 10px !important;
                }
                
                .content {
                    padding: 1rem !important;
                }
                
                .codigo-destaque {
                    font-size: 20px !important;
                    padding: 10px !important;
                    margin: 10px 0 !important;
                }
                
                .section-title {
                    background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%) !important;
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    padding: 6px 12px !important;
                    font-size: 12px !important;
                    margin-bottom: 10px !important;
                }
                
                .info-box {
                    padding: 10px !important;
                    margin-bottom: 15px !important;
                    border: 1px solid #ddd !important;
                    background: #f8f9fa !important;
                }
                
                .qr-container {
                    margin: 15px 0 !important;
                    page-break-inside: avoid !important;
                }
                
                .qr-code {
                    padding: 10px !important;
                }
                
                .qr-code img {
                    width: 150px !important;
                    height: 150px !important;
                }
                
                .rodape {
                    background: linear-gradient(135deg, #2c3e50, #34495e) !important;
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    padding: 10px !important;
                    font-size: 10px !important;
                }
                
                .actions-bar {
                    display: none !important;
                }
                
                .status-ativo, .status-utilizado, .status-transferido {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                
                h1, h2, h3, h4, h5, h6 {
                    font-size: 14px !important;
                    margin: 5px 0 !important;
                }
                
                p {
                    font-size: 11px !important;
                    margin: 3px 0 !important;
                }
                
                .row {
                    margin-bottom: 5px !important;
                }
            }
            
            @media screen and (max-width: 768px) {
                .actions-bar {
                    position: relative;
                    top: auto;
                    right: auto;
                    margin-bottom: 20px;
                    justify-content: center;
                }
                
                .btn-action {
                    padding: 10px 15px;
                    font-size: 14px;
                }
            }
        </style>
        
        <!-- HTML2Canvas para salvar como imagem -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
        <!-- jsPDF para salvar como PDF -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    </head>
    <body>
        <!-- Barra de Ações -->
        <div class="actions-bar">
            <button class="btn-action" onclick="window.print()">
                <i class="fas fa-print"></i>
                Imprimir
            </button>
            
            <div class="dropdown">
                <button class="btn-action btn-success-action dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="fas fa-download"></i>
                    Salvar
                </button>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" onclick="salvarComoPDF()">
                        <i class="fas fa-file-pdf me-2"></i>Salvar como PDF
                    </a></li>
                    <li><a class="dropdown-item" href="#" onclick="salvarComoImagem()">
                        <i class="fas fa-image me-2"></i>Salvar como Imagem
                    </a></li>
                </ul>
            </div>
            
            <button class="btn-action btn-secondary-action" onclick="window.close()">
                <i class="fas fa-times"></i>
                Fechar
            </button>
        </div>
        
        <div class="main-container">
            <div class="ingresso-card" id="ingresso-content">
                <!-- Header com Logomarcas e Informações do Evento -->
                <div class="header-gradient">
                    <!-- Logo AnySummit -->
                    <img src="https://anysummit.com.br/img/anysummitlogo.png" alt="AnySummit" class="anysummit-logo">
                    
                    <div class="d-flex align-items-center justify-content-center gap-4 mb-3">
                        <!-- Imagem do Evento -->
                        <?php if ($imagem_capa_url): ?>
                            <img src="<?php echo $imagem_capa_url; ?>" alt="Capa do Evento" class="evento-imagem">
                        <?php else: ?>
                            <div class="evento-imagem bg-white bg-opacity-25 d-flex align-items-center justify-content-center">
                                <i class="fas fa-calendar-alt text-primary fs-4"></i>
                            </div>
                        <?php endif; ?>
                        
                        <!-- Logo do Organizador -->
                        <?php if ($logo_organizador_url): ?>
                            <img src="<?php echo $logo_organizador_url; ?>" alt="Logo Organizador" class="organizador-logo">
                        <?php else: ?>
                            <div class="organizador-logo bg-white bg-opacity-25 d-flex align-items-center justify-content-center">
                                <i class="fas fa-building text-primary fs-6"></i>
                            </div>
                        <?php endif; ?>
                    </div>
                    
                    <h1 class="mb-2 fs-2"><?php echo htmlspecialchars($ingresso['evento_nome']); ?></h1>
                    
                    <?php if ($data_evento): ?>
                    <p class="mb-1 fs-6 opacity-90">
                        <i class="fas fa-calendar me-2"></i>
                        <?php echo $data_evento; ?>
                    </p>
                    <?php endif; ?>
                    
                    <?php if ($ingresso['nome_local']): ?>
                    <p class="mb-2 fs-6 opacity-90">
                        <i class="fas fa-map-marker-alt me-2"></i>
                        <?php echo htmlspecialchars($ingresso['nome_local']); ?>
                        <?php if ($ingresso['cidade']): ?>
                            , <?php echo htmlspecialchars($ingresso['cidade']); ?>
                            <?php if ($ingresso['estado']): ?>
                                - <?php echo htmlspecialchars($ingresso['estado']); ?>
                            <?php endif; ?>
                        <?php endif; ?>
                    </p>
                    <?php endif; ?>
                    
                    <?php if (!empty($ingresso['organizador_nome'])): ?>
                    <p class="mb-0 fs-6 opacity-75">
                        <i class="fas fa-user-tie me-2"></i>
                        Organizado por: <strong><?php echo htmlspecialchars($ingresso['organizador_nome']); ?></strong>
                    </p>
                    <?php endif; ?>
                </div>
                
                <!-- Conteúdo Principal -->
                <div class="content">
                    <!-- Código do Ingresso -->
                    <div class="codigo-destaque">
                        <?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?>
                    </div>
                    
                    <!-- Informações do Ingresso -->
                    <div class="section-title">
                        <i class="fas fa-ticket-alt me-2"></i>
                        Detalhes do Ingresso
                    </div>
                    <div class="info-box">
                        <div class="row">
                            <div class="col-md-8">
                                <h5 class="mb-1">
                                    <i class="fas fa-ticket-alt text-primary me-2"></i>
                                    <?php echo htmlspecialchars($ingresso['titulo_ingresso']); ?>
                                </h5>
                            </div>
                            <div class="col-md-4 text-md-end">
                                <span class="status-badge status-<?php echo $ingresso['status'] ?: 'ativo'; ?>">
                                    <i class="fas fa-<?php echo $ingresso['status'] == 'utilizado' ? 'check-circle' : ($ingresso['status'] == 'transferido' ? 'exchange-alt' : 'check'); ?> me-1"></i>
                                    <?php echo ucfirst($ingresso['status'] ?: 'Ativo'); ?>
                                </span>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-md-6">
                                <small class="text-muted">
                                    <strong>Criado em:</strong><br>
                                    <?php echo date('d/m/Y H:i', strtotime($ingresso['criado_em'])); ?>
                                </small>
                            </div>
                            <?php if ($ingresso['data_vinculacao']): ?>
                            <div class="col-md-6">
                                <small class="text-muted">
                                    <strong>Vinculado em:</strong><br>
                                    <?php echo date('d/m/Y H:i', strtotime($ingresso['data_vinculacao'])); ?>
                                </small>
                            </div>
                            <?php endif; ?>
                        </div>
                    </div>
                    
                    <!-- Participante -->
                    <div class="section-title">
                        <i class="fas fa-user me-2"></i>
                        Titular do Ingresso
                    </div>
                    <div class="info-box">
                        <?php if ($ingresso['participante_nome']): ?>
                            <div class="d-flex align-items-center">
                                <div class="me-3">
                                    <div class="bg-success rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                        <i class="fas fa-user text-white fs-5"></i>
                                    </div>
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="mb-1 fw-bold"><?php echo htmlspecialchars($ingresso['participante_nome']); ?></h6>
                                    <?php if ($ingresso['participante_email']): ?>
                                    <p class="mb-1 text-muted">
                                        <i class="fas fa-envelope me-1"></i>
                                        <?php echo htmlspecialchars($ingresso['participante_email']); ?>
                                    </p>
                                    <?php endif; ?>
                                    <?php if ($ingresso['participante_documento']): ?>
                                    <p class="mb-0 text-muted">
                                        <i class="fas fa-id-card me-1"></i>
                                        CPF: <?php echo htmlspecialchars($ingresso['participante_documento']); ?>
                                    </p>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php else: ?>
                            <div class="d-flex align-items-center">
                                <div class="me-3">
                                    <div class="bg-warning rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                        <i class="fas fa-user-slash text-white fs-5"></i>
                                    </div>
                                </div>
                                <div>
                                    <h6 class="mb-1 fw-bold text-warning">Ingresso Não Vinculado</h6>
                                    <p class="mb-0 text-muted">Este ingresso ainda não foi vinculado a um participante</p>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                    
                    <!-- QR Code (aumentado) -->
                    <?php if ($ingresso['qr_code_data']): ?>
                    <div class="section-title">
                        <i class="fas fa-qrcode me-2"></i>
                        Código de Validação
                    </div>
                    <div class="qr-container">
                        <div class="qr-code">
                            <?php 
                            $qr_url = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" . urlencode($ingresso['qr_code_data']);
                            ?>
                            <img src="<?php echo $qr_url; ?>" alt="QR Code" style="width: 200px; height: 200px;" />
                        </div>
                        <p class="mt-3 text-muted text-center">
                            <small>Apresente este QR Code na entrada do evento</small>
                        </p>
                    </div>
                    <?php endif; ?>
                    
                    <!-- Informações do Pedido -->
                    <div class="section-title">
                        <i class="fas fa-shopping-cart me-2"></i>
                        Informações da Compra
                    </div>
                    <div class="info-box">
                        <div class="row">
                            <div class="col-md-6">
                                <strong>Código do Pedido:</strong><br>
                                <span class="text-muted"><?php echo htmlspecialchars($ingresso['codigo_pedido']); ?></span>
                            </div>
                            <div class="col-md-6">
                                <strong>Comprador:</strong><br>
                                <span class="text-muted"><?php echo htmlspecialchars($ingresso['comprador_nome_completo'] ?: $ingresso['comprador_nome']); ?></span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Rodapé -->
                <div class="rodape">
                    <div style="font-size: 16px; margin-bottom: 12px;">
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Apresente este ingresso (impresso ou digital) na entrada do evento</strong>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <small>Código: <?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?></small>
                        </div>
                        <div class="col-md-6">
                            <small>Pedido: <?php echo htmlspecialchars($ingresso['codigo_pedido']); ?></small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Bootstrap JS -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        
        <script>
            // Função para salvar como PDF
            function salvarComoPDF() {
                const { jsPDF } = window.jspdf;
                const elemento = document.getElementById('ingresso-content');
                
                // Ocultar barra de ações temporariamente
                const actionsBar = document.querySelector('.actions-bar');
                actionsBar.style.display = 'none';
                
                html2canvas(elemento, {
                    scale: 1.5,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    height: elemento.scrollHeight,
                    width: elemento.scrollWidth
                }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    
                    // Calcular dimensões para caber em uma página
                    const pageWidth = 210; // A4 width in mm
                    const pageHeight = 297; // A4 height in mm
                    const margin = 10;
                    const maxWidth = pageWidth - (margin * 2);
                    const maxHeight = pageHeight - (margin * 2);
                    
                    const imgWidth = maxWidth;
                    const imgHeight = (canvas.height * maxWidth) / canvas.width;
                    
                    // Se a imagem for muito alta, reduzir proporcionalmente
                    if (imgHeight > maxHeight) {
                        const scale = maxHeight / imgHeight;
                        const finalWidth = imgWidth * scale;
                        const finalHeight = maxHeight;
                        
                        // Centralizar horizontalmente
                        const xPosition = (pageWidth - finalWidth) / 2;
                        
                        pdf.addImage(imgData, 'PNG', xPosition, margin, finalWidth, finalHeight);
                    } else {
                        // Centralizar verticalmente
                        const yPosition = (pageHeight - imgHeight) / 2;
                        
                        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
                    }
                    
                    const nomeArquivo = `ingresso-${<?php echo json_encode($ingresso['codigo_ingresso']); ?>}.pdf`;
                    pdf.save(nomeArquivo);
                    
                    // Restaurar barra de ações
                    actionsBar.style.display = 'flex';
                }).catch(error => {
                    console.error('Erro ao gerar PDF:', error);
                    alert('Erro ao gerar PDF. Tente novamente.');
                    actionsBar.style.display = 'flex';
                });
            }
            
            // Função para salvar como imagem
            function salvarComoImagem() {
                const elemento = document.getElementById('ingresso-content');
                
                // Ocultar barra de ações temporariamente
                const actionsBar = document.querySelector('.actions-bar');
                actionsBar.style.display = 'none';
                
                html2canvas(elemento, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff'
                }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = `ingresso-${<?php echo json_encode($ingresso['codigo_ingresso']); ?>}.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                    
                    // Restaurar barra de ações
                    actionsBar.style.display = 'flex';
                }).catch(error => {
                    console.error('Erro ao gerar imagem:', error);
                    alert('Erro ao gerar imagem. Tente novamente.');
                    actionsBar.style.display = 'flex';
                });
            }
            
            // Auto-focus para melhor UX
            window.focus();
        </script>
    </body>
    </html>
    <?php
    
} catch (Exception $e) {
    error_log('Erro ao exibir ingresso: ' . $e->getMessage());
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Erro</title>
        <style>
            body { 
                font-family: 'Inter', sans-serif; 
                padding: 50px; 
                text-align: center; 
                background: linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%);
                color: white;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .erro { 
                background: rgba(26, 26, 46, 0.9);
                padding: 40px;
                border-radius: 20px;
                border: 1px solid rgba(114, 94, 255, 0.3);
                max-width: 500px;
            }
            .erro h2 { color: #ff6b6b; margin-bottom: 20px; }
            .btn { 
                background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 10px;
                cursor: pointer;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="erro">
            <h2><i class="fas fa-exclamation-triangle"></i> Erro ao carregar ingresso</h2>
            <p><?php echo htmlspecialchars($e->getMessage()); ?></p>
            <button class="btn" onclick="window.close()">
                <i class="fas fa-times me-2"></i>Fechar
            </button>
        </div>
    </body>
    </html>
    <?php
}
?>
