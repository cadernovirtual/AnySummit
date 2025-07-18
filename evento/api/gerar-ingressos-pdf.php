<?php
include("../conm/conn.php");

// Verificar se o pedido_id foi fornecido
$pedido_id = isset($_GET['pedido_id']) ? intval($_GET['pedido_id']) : 0;

if (!$pedido_id) {
    die('ID do pedido não fornecido');
}

try {
    // Buscar dados do pedido
    $sql_pedido = "SELECT p.*, c.nome as comprador_nome, c.email as comprador_email 
                   FROM tb_pedidos p 
                   LEFT JOIN compradores c ON p.compradorid = c.id 
                   WHERE p.pedidoid = ?";
    
    $stmt_pedido = $con->prepare($sql_pedido);
    $stmt_pedido->bind_param("i", $pedido_id);
    $stmt_pedido->execute();
    $result_pedido = $stmt_pedido->get_result();
    
    if ($result_pedido->num_rows === 0) {
        die('Pedido não encontrado');
    }
    
    $pedido = $result_pedido->fetch_assoc();
    
    // Buscar ingressos individuais
    $sql_ingressos = "SELECT 
        ii.codigo_ingresso, ii.titulo_ingresso, ii.preco_unitario,
        ii.participante_nome, ii.participante_email, ii.data_vinculacao, ii.criado_em,
        e.nome as evento_titulo, e.data_inicio, e.nome_local as local_evento, e.busca_endereco as endereco_completo
        FROM tb_ingressos_individuais ii
        LEFT JOIN eventos e ON ii.eventoid = e.id
        WHERE ii.pedidoid = ?
        ORDER BY ii.id";
    
    $stmt_ingressos = $con->prepare($sql_ingressos);
    $stmt_ingressos->bind_param("i", $pedido_id);
    $stmt_ingressos->execute();
    $result_ingressos = $stmt_ingressos->get_result();
    
    $ingressos = [];
    while ($row = $result_ingressos->fetch_assoc()) {
        $ingressos[] = $row;
    }
    
    if (empty($ingressos)) {
        die('Nenhum ingresso encontrado para este pedido');
    }
    
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Ingressos - Any Summit</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Arial', sans-serif; 
                background: #f5f5f5;
                padding: 10px;
            }
            
            .ingresso {
                background: linear-gradient(135deg, #87CEEB 0%, #4682B4 100%);
                border-radius: 15px;
                overflow: hidden;
                margin: 20px auto;
                max-width: 800px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                page-break-after: always;
                page-break-inside: avoid;
            }
            
            .header {
                background: rgba(255,255,255,0.95);
                padding: 20px;
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
            
            .evento-info {
                color: #34495e;
                font-size: 14px;
                margin: 5px 0;
            }
            
            .main-content {
                display: flex;
                background: rgba(255,255,255,0.95);
                min-height: 300px;
            }
            
            .left-section {
                flex: 2;
                padding: 25px;
            }
            
            .right-section {
                flex: 1;
                background: rgba(240,240,240,0.9);
                padding: 25px;
                text-align: center;
                border-left: 2px dashed #ccc;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            
            .section-title {
                background: #2c3e50;
                color: white;
                padding: 8px 15px;
                font-size: 14px;
                font-weight: bold;
                border-radius: 5px;
                margin-bottom: 10px;
                text-transform: uppercase;
            }
            
            .ingresso-info {
                background: #ecf0f1;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 15px;
            }
            
            .tipo-ingresso {
                font-size: 22px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 8px;
            }
            
            .preco {
                font-size: 24px;
                font-weight: bold;
                color: #27ae60;
            }
            
            .compra-info {
                font-size: 12px;
                color: #7f8c8d;
                margin-top: 5px;
            }
            
            .participante-info {
                background: #e8f5e8;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #27ae60;
            }
            
            .participante-nome {
                font-size: 20px;
                font-weight: bold;
                color: #2c3e50;
            }
            
            .participante-nao-vinculado {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                color: #856404;
                font-style: italic;
            }
            
            .qr-code {
                width: 120px;
                height: 120px;
                background: white;
                border: 2px solid #2c3e50;
                border-radius: 8px;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #7f8c8d;
            }
            
            .codigo-ingresso {
                font-size: 16px;
                font-weight: bold;
                font-family: 'Courier New', monospace;
                color: #2c3e50;
                background: white;
                padding: 8px 12px;
                border-radius: 5px;
                border: 2px solid #2c3e50;
                letter-spacing: 2px;
            }
            
            .rodape {
                background: rgba(44, 62, 80, 0.9);
                color: white;
                text-align: center;
                padding: 15px;
                font-size: 12px;
            }
            
            @media print {
                body { background: white; padding: 0; }
                .ingresso { 
                    page-break-after: always; 
                    margin: 0;
                    box-shadow: none;
                    max-width: none;
                }
                .ingresso:last-child { page-break-after: avoid; }
            }
        </style>
    </head>
    <body>    
        <?php foreach ($ingressos as $index => $ingresso): ?>
        <div class="ingresso">
            <!-- Header do Evento -->
            <div class="header">
                <div class="evento-titulo"><?php echo htmlspecialchars($ingresso['evento_titulo'] ?: 'Any Summit'); ?></div>
                <?php if ($ingresso['data_inicio']): ?>
                <div class="evento-info">
                    📅 <?php echo date('d/m/Y, H\h', strtotime($ingresso['data_inicio'])); ?>
                </div>
                <?php endif; ?>
                <?php if ($ingresso['local_evento']): ?>
                <div class="evento-info">
                    📍 <?php echo htmlspecialchars($ingresso['local_evento']); ?>
                </div>
                <?php endif; ?>
                <?php if ($ingresso['endereco_completo']): ?>
                <div class="evento-info">
                    <?php echo htmlspecialchars($ingresso['endereco_completo']); ?>
                </div>
                <?php endif; ?>
            </div>
            
            <!-- Conteúdo Principal -->
            <div class="main-content">
                <!-- Seção Esquerda -->
                <div class="left-section">
                    <!-- Informações do Ingresso -->
                    <div class="section-title">Ingresso</div>
                    <div class="ingresso-info">
                        <div class="tipo-ingresso"><?php echo htmlspecialchars($ingresso['titulo_ingresso']); ?></div>
                        <div class="preco">R$ <?php echo number_format($ingresso['preco_unitario'], 2, ',', '.'); ?></div>
                        <div class="compra-info">
                            Comprado em <?php echo date('d/m/Y - H:i', strtotime($ingresso['criado_em'])); ?>
                        </div>
                    </div>
                    
                    <!-- Participante -->
                    <div class="section-title">Participante</div>
                    <?php if ($ingresso['participante_nome']): ?>
                    <div class="participante-info">
                        <div class="participante-nome"><?php echo htmlspecialchars($ingresso['participante_nome']); ?></div>
                        <?php if ($ingresso['participante_email']): ?>
                        <div style="font-size: 14px; color: #7f8c8d; margin-top: 5px;">
                            <?php echo htmlspecialchars($ingresso['participante_email']); ?>
                        </div>
                        <?php endif; ?>
                    </div>
                    <?php else: ?>
                    <div class="participante-info participante-nao-vinculado">
                        <div class="participante-nome">Não vinculado</div>
                        <div style="font-size: 12px; margin-top: 5px;">
                            Este ingresso ainda não foi vinculado a um participante
                        </div>
                    </div>
                    <?php endif; ?>
                </div>
                
                <!-- Seção Direita -->
                <div class="right-section">
                    <!-- QR Code -->
                    <div class="qr-code">
                        <?php 
                        // Dados para o QR Code
                        $qr_data = urlencode(json_encode([
                            'codigo' => $ingresso['codigo_ingresso'],
                            'pedido' => $pedido['codigo_pedido'],
                            'tipo' => $ingresso['titulo_ingresso'],
                            'evento' => $ingresso['evento_titulo']
                        ]));
                        
                        // URL do QR Code usando API gratuita
                        $qr_url = "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=" . $qr_data;
                        ?>
                        <img src="<?php echo $qr_url; ?>" alt="QR Code" style="width: 100%; height: 100%; object-fit: contain;" />
                    </div>
                    
                    <!-- Código do Ingresso -->
                    <div class="codigo-ingresso">
                        <?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?>
                    </div>
                </div>
            </div>
            
            <!-- Rodapé -->
            <div class="rodape">
                <div>Apresente este ingresso (impresso ou digital) na entrada do evento</div>
                <div style="margin-top: 5px; font-size: 10px;">
                    Código: <?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?> | 
                    Pedido: <?php echo htmlspecialchars($pedido['codigo_pedido']); ?>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
        
        <script>
            // Auto-print quando a página carregar
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 500);
            }
        </script>
    </body>
    </html>
    <?php
    
} catch (Exception $e) {
    error_log('Erro ao gerar PDF: ' . $e->getMessage());
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Erro</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 50px; text-align: center; }
            .erro { color: #dc3545; font-size: 18px; }
        </style>
    </head>
    <body>
        <div class="erro">
            <h2>Erro ao gerar ingressos</h2>
            <p><?php echo htmlspecialchars($e->getMessage()); ?></p>
            <button onclick="window.close()">Fechar</button>
        </div>
    </body>
    </html>
    <?php
}
?>