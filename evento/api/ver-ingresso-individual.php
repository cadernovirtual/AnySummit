<?php
include("../conm/conn.php");

// Verificar se o ingresso_id foi fornecido
$ingresso_id = isset($_GET['ingresso_id']) ? intval($_GET['ingresso_id']) : 0;

if (!$ingresso_id) {
    die('ID do ingresso não fornecido');
}

try {
    // Buscar dados do ingresso individual
    $sql = "SELECT 
        ii.*,
        e.nome as evento_nome, e.data_inicio, e.nome_local, e.busca_endereco,
        p.codigo_pedido, p.comprador_nome
        FROM tb_ingressos_individuais ii
        LEFT JOIN eventos e ON ii.eventoid = e.id
        LEFT JOIN tb_pedidos p ON ii.pedidoid = p.pedidoid
        WHERE ii.id = ?";
    
    $stmt = $con->prepare($sql);
    $stmt->bind_param("i", $ingresso_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        die('Ingresso não encontrado');
    }
    
    $ingresso = $result->fetch_assoc();
    
    ?>
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ingresso - <?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?></title>
        
        <!-- Bootstrap CSS -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <!-- Font Awesome -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        
        <style>
            @page { margin: 0; size: A4 portrait; }
            body { font-family: Arial, sans-serif; background: #f8f9fa; padding: 20px; }
            .ingresso-card { 
                background: linear-gradient(135deg, #87CEEB 0%, #4682B4 100%);
                border-radius: 15px;
                overflow: hidden;
                max-width: 600px;
                margin: 0 auto;
                box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            }
            .header { 
                background: rgba(255,255,255,0.95); 
                padding: 30px; 
                text-align: center; 
                border-bottom: 3px solid #4682B4; 
            }
            .evento-titulo { 
                font-size: 28px; 
                font-weight: bold; 
                color: #2c3e50; 
                margin-bottom: 10px; 
                font-style: italic; 
            }
            .evento-info { color: #34495e; font-size: 14px; margin: 5px 0; }
            .content { background: rgba(255,255,255,0.95); padding: 30px; }
            .section-title { 
                background: #2c3e50; 
                color: white; 
                padding: 8px 15px; 
                font-size: 14px; 
                font-weight: bold; 
                border-radius: 5px; 
                margin-bottom: 15px; 
                text-transform: uppercase;
                display: inline-block;
            }
            .info-box { 
                background: #ecf0f1; 
                padding: 20px; 
                border-radius: 8px; 
                margin-bottom: 20px; 
            }
            .codigo-destaque { 
                font-size: 24px; 
                font-weight: bold; 
                font-family: 'Courier New', monospace; 
                color: #007bff; 
                background: white; 
                padding: 15px; 
                border-radius: 8px; 
                border: 2px solid #007bff; 
                text-align: center;
                letter-spacing: 2px;
                margin: 20px 0;
            }
            .status-badge {
                padding: 8px 15px;
                border-radius: 20px;
                font-weight: bold;
                text-transform: uppercase;
                font-size: 12px;
            }
            .status-ativo { background: #d4edda; color: #155724; }
            .status-utilizado { background: #f8d7da; color: #721c24; }
            .status-transferido { background: #fff3cd; color: #856404; }
            .rodape { 
                background: rgba(44, 62, 80, 0.9); 
                color: white; 
                text-align: center; 
                padding: 20px; 
                font-size: 12px; 
            }
            .btn-print { 
                position: fixed; 
                top: 20px; 
                right: 20px; 
                z-index: 1000; 
                background: #007bff; 
                color: white; 
                border: none; 
                padding: 10px 20px; 
                border-radius: 5px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
            @media print {
                .btn-print { display: none; }
                body { background: white; padding: 0; }
                .ingresso-card { box-shadow: none; max-width: none; }
            }
        </style>
    </head>
    <body>
        <button class="btn-print" onclick="window.print()">
            <i class="fas fa-print me-2"></i>
            Imprimir
        </button>
        
        <div class="ingresso-card">
            <!-- Header do Evento -->
            <div class="header">
                <div class="evento-titulo"><?php echo htmlspecialchars($ingresso['evento_nome'] ?: 'Any Summit'); ?></div>
                <?php if ($ingresso['data_inicio']): ?>
                <div class="evento-info">
                    <i class="fas fa-calendar me-1"></i>
                    <?php echo date('d/m/Y, H\h', strtotime($ingresso['data_inicio'])); ?>
                </div>
                <?php endif; ?>
                <?php if ($ingresso['nome_local']): ?>
                <div class="evento-info">
                    <i class="fas fa-map-marker-alt me-1"></i>
                    <?php echo htmlspecialchars($ingresso['nome_local']); ?>
                </div>
                <?php endif; ?>
            </div>
            
            <!-- Conteúdo Principal -->
            <div class="content">
                <!-- Código do Ingresso -->
                <div class="codigo-destaque">
                    <?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?>
                </div>
                
                <!-- Informações do Ingresso -->
                <div class="section-title">Detalhes do Ingresso</div>
                <div class="info-box">
                    <div class="row">
                        <div class="col-md-6">
                            <strong>Tipo:</strong><br>
                            <span class="text-muted"><?php echo htmlspecialchars($ingresso['titulo_ingresso']); ?></span>
                        </div>
                        <div class="col-md-6">
                            <strong>Valor:</strong><br>
                            <span class="text-success fw-bold">R$ <?php echo number_format($ingresso['preco_unitario'], 2, ',', '.'); ?></span>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-md-6">
                            <strong>Status:</strong><br>
                            <span class="status-badge status-<?php echo $ingresso['status']; ?>">
                                <?php echo ucfirst($ingresso['status']); ?>
                            </span>
                        </div>
                        <div class="col-md-6">
                            <strong>Criado em:</strong><br>
                            <span class="text-muted"><?php echo date('d/m/Y H:i', strtotime($ingresso['criado_em'])); ?></span>
                        </div>
                    </div>
                </div>
                
                <!-- Participante -->
                <div class="section-title">Participante</div>
                <div class="info-box">
                    <?php if ($ingresso['participante_nome']): ?>
                        <div class="d-flex align-items-center">
                            <div class="me-3">
                                <div class="bg-success rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                    <i class="fas fa-user text-white"></i>
                                </div>
                            </div>
                            <div>
                                <div class="fw-bold"><?php echo htmlspecialchars($ingresso['participante_nome']); ?></div>
                                <?php if ($ingresso['participante_email']): ?>
                                <small class="text-muted">
                                    <i class="fas fa-envelope me-1"></i>
                                    <?php echo htmlspecialchars($ingresso['participante_email']); ?>
                                </small>
                                <?php endif; ?>
                                <?php if ($ingresso['data_vinculacao']): ?>
                                <br><small class="text-muted">
                                    Vinculado em: <?php echo date('d/m/Y H:i', strtotime($ingresso['data_vinculacao'])); ?>
                                </small>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php else: ?>
                        <div class="d-flex align-items-center">
                            <div class="me-3">
                                <div class="bg-warning rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                    <i class="fas fa-user-slash text-white"></i>
                                </div>
                            </div>
                            <div>
                                <div class="fw-bold text-warning">Não Vinculado</div>
                                <small class="text-muted">Este ingresso ainda não foi vinculado a um participante</small>
                            </div>
                        </div>
                    <?php endif; ?>
                </div>
                
                <!-- Informações do Pedido -->
                <div class="section-title">Informações do Pedido</div>
                <div class="info-box">
                    <div class="row">
                        <div class="col-md-6">
                            <strong>Pedido:</strong><br>
                            <span class="text-muted"><?php echo htmlspecialchars($ingresso['codigo_pedido']); ?></span>
                        </div>
                        <div class="col-md-6">
                            <strong>Comprador:</strong><br>
                            <span class="text-muted"><?php echo htmlspecialchars($ingresso['comprador_nome']); ?></span>
                        </div>
                    </div>
                </div>
                
                <!-- QR Code (se disponível) -->
                <?php if ($ingresso['qr_code_data']): ?>
                <div class="section-title">QR Code</div>
                <div class="text-center">
                    <?php 
                    $qr_url = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" . urlencode($ingresso['qr_code_data']);
                    ?>
                    <img src="<?php echo $qr_url; ?>" alt="QR Code" class="img-fluid" style="max-width: 150px;" />
                </div>
                <?php endif; ?>
            </div>
            
            <!-- Rodapé -->
            <div class="rodape">
                <div style="font-size: 14px; margin-bottom: 8px;">
                    <strong>Apresente este ingresso (impresso ou digital) na entrada do evento</strong>
                </div>
                <div>
                    Código: <?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?> | 
                    Pedido: <?php echo htmlspecialchars($ingresso['codigo_pedido']); ?>
                </div>
            </div>
        </div>
        
        <div class="text-center mt-4">
            <button class="btn btn-primary me-2" onclick="window.print()">
                <i class="fas fa-print me-1"></i>
                Imprimir Ingresso
            </button>
            <button class="btn btn-secondary" onclick="window.close()">
                <i class="fas fa-times me-1"></i>
                Fechar
            </button>
        </div>
        
        <script>
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
            body { font-family: Arial, sans-serif; padding: 50px; text-align: center; }
            .erro { color: #dc3545; }
        </style>
    </head>
    <body>
        <div class="erro">
            <h2>Erro ao carregar ingresso</h2>
            <p><?php echo htmlspecialchars($e->getMessage()); ?></p>
            <button onclick="window.close()">Fechar</button>
        </div>
    </body>
    </html>
    <?php
}
?>