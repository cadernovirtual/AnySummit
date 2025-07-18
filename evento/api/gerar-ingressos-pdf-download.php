<?php
include("../conm/conn.php");

// Verificar se o pedido_id foi fornecido
$pedido_id = isset($_GET['pedido_id']) ? intval($_GET['pedido_id']) : 0;

if (!$pedido_id) {
    die('ID do pedido não fornecido');
}

try {
    // Buscar dados do pedido e ingressos
    $sql_pedido = "SELECT * FROM tb_pedidos WHERE pedidoid = ?";
    $stmt_pedido = $con->prepare($sql_pedido);
    $stmt_pedido->bind_param("i", $pedido_id);
    $stmt_pedido->execute();
    $result_pedido = $stmt_pedido->get_result();
    
    if ($result_pedido->num_rows === 0) {
        die('Pedido não encontrado');
    }
    
    $pedido = $result_pedido->fetch_assoc();
    
    // Buscar ingressos individuais
    $sql_ingressos = "SELECT * FROM tb_ingressos_individuais WHERE pedidoid = ? ORDER BY id";
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
    
    // Buscar dados do evento
    $evento_dados = null;
    if (isset($pedido['eventoid'])) {
        $sql_evento = "SELECT nome, data_inicio, nome_local, busca_endereco FROM eventos WHERE id = ?";
        $stmt_evento = $con->prepare($sql_evento);
        $stmt_evento->bind_param("i", $pedido['eventoid']);
        $stmt_evento->execute();
        $result_evento = $stmt_evento->get_result();
        if ($result_evento->num_rows > 0) {
            $evento_dados = $result_evento->fetch_assoc();
        }
    }
    
    // Nome do arquivo
    $filename = "ingressos_pedido_" . $pedido['codigo_pedido'] . ".pdf";
    
    // Tentar diferentes métodos para gerar PDF
    if (class_exists('Dompdf\Dompdf')) {
        // Método 1: DomPDF (se disponível)
        gerarPDFComDomPDF($ingressos, $pedido, $evento_dados, $filename);
    } else {
        // Método 2: Gerar HTML otimizado para conversão manual
        gerarHTMLParaPDF($ingressos, $pedido, $evento_dados, $filename);
    }
    
} catch (Exception $e) {
    error_log('Erro ao gerar PDF: ' . $e->getMessage());
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Erro</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 50px; text-align: center; background: #f8f9fa; }
            .erro { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .erro h2 { color: #dc3545; margin-bottom: 20px; }
            .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="erro">
            <h2>Erro ao gerar ingressos</h2>
            <p><?php echo htmlspecialchars($e->getMessage()); ?></p>
            <a href="javascript:history.back()" class="btn">Voltar</a>
        </div>
    </body>
    </html>
    <?php
}

function gerarPDFComDomPDF($ingressos, $pedido, $evento_dados, $filename) {
    require_once '../vendor/autoload.php';
    
    $dompdf = new \Dompdf\Dompdf();
    $html = gerarHTMLIngressos($ingressos, $pedido, $evento_dados);
    
    $dompdf->loadHtml($html);
    $dompdf->setPaper('A4', 'portrait');
    $dompdf->render();
    
    // Headers para download
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    
    echo $dompdf->output();
}

function gerarHTMLParaPDF($ingressos, $pedido, $evento_dados, $filename) {
    $html = gerarHTMLIngressos($ingressos, $pedido, $evento_dados);
    
    // Headers para download do HTML (que pode ser convertido em PDF pelo usuário)
    header('Content-Type: text/html; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . str_replace('.pdf', '.html', $filename) . '"');
    
    echo $html;
    
    // Adicionar instruções e auto-print
    echo '
    <div id="instrucoes" style="position: fixed; top: 10px; right: 10px; background: #007bff; color: white; padding: 15px; border-radius: 8px; z-index: 9999; font-family: Arial; font-size: 14px; max-width: 300px;">
        <strong>📥 Para salvar como PDF:</strong><br>
        1. Pressione Ctrl+P (ou Cmd+P no Mac)<br>
        2. Escolha "Salvar como PDF"<br>
        3. Clique em Salvar<br>
        <button onclick="document.getElementById(\'instrucoes\').style.display=\'none\'; window.print();" style="background: white; color: #007bff; border: none; padding: 8px 15px; border-radius: 4px; margin-top: 10px; cursor: pointer; font-weight: bold;">Imprimir Agora</button>
    </div>
    <script>
        // Auto-print após 2 segundos
        setTimeout(function() {
            window.print();
        }, 2000);
        
        // Esconder instruções após print
        window.addEventListener("afterprint", function() {
            document.getElementById("instrucoes").style.display = "none";
        });
    </script>';
}

function gerarHTMLIngressos($ingressos, $pedido, $evento_dados) {
    ob_start();
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Ingressos - Any Summit</title>
        <style>
            @page { margin: 0; size: A4 portrait; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; background: white; }
            .ingresso { 
                width: 210mm; 
                height: 297mm; 
                page-break-after: always; 
                background: linear-gradient(135deg, #87CEEB 0%, #4682B4 100%);
                position: relative;
                display: flex;
                flex-direction: column;
            }
            .ingresso:last-child { page-break-after: avoid; }
            .header { 
                background: rgba(255,255,255,0.95); 
                padding: 25mm; 
                text-align: center; 
                border-bottom: 4px solid #4682B4; 
            }
            .evento-titulo { 
                font-size: 28pt; 
                font-weight: bold; 
                color: #2c3e50; 
                margin-bottom: 10mm; 
                font-style: italic; 
                line-height: 1.2;
            }
            .evento-info { color: #34495e; font-size: 12pt; margin: 3mm 0; }
            .main-content { 
                display: flex; 
                background: rgba(255,255,255,0.95); 
                flex: 1;
                min-height: 180mm;
            }
            .left-section { flex: 2; padding: 20mm; }
            .right-section { 
                flex: 1; 
                background: rgba(240,240,240,0.9); 
                padding: 20mm; 
                text-align: center; 
                border-left: 3px dashed #ccc;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            .section-title { 
                background: #2c3e50; 
                color: white; 
                padding: 8mm 12mm; 
                font-size: 12pt; 
                font-weight: bold; 
                border-radius: 6mm; 
                margin-bottom: 12mm; 
                text-transform: uppercase;
                display: inline-block;
            }
            .ingresso-info { 
                background: #ecf0f1; 
                padding: 15mm; 
                border-radius: 8mm; 
                margin-bottom: 20mm; 
            }
            .tipo-ingresso { 
                font-size: 18pt; 
                font-weight: bold; 
                color: #2c3e50; 
                margin-bottom: 8mm; 
                line-height: 1.3;
            }
            .preco { 
                font-size: 22pt; 
                font-weight: bold; 
                color: #27ae60; 
            }
            .compra-info { font-size: 10pt; color: #7f8c8d; margin-top: 5mm; }
            .participante-info { 
                background: #e8f5e8; 
                padding: 15mm; 
                border-radius: 8mm; 
                border-left: 4mm solid #27ae60; 
            }
            .participante-nao-vinculado { 
                background: #fff3cd; 
                border-left: 4mm solid #ffc107; 
                color: #856404; 
                font-style: italic; 
            }
            .participante-nome { 
                font-size: 16pt; 
                font-weight: bold; 
                color: #2c3e50; 
                line-height: 1.3;
            }
            .participante-email { font-size: 11pt; color: #7f8c8d; margin-top: 3mm; }
            .qr-placeholder { 
                width: 35mm; 
                height: 35mm; 
                background: white; 
                border: 2mm solid #2c3e50; 
                border-radius: 6mm; 
                margin-bottom: 12mm;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8pt;
                color: #7f8c8d;
                text-align: center;
                line-height: 1.2;
            }
            .codigo-ingresso { 
                font-size: 14pt; 
                font-weight: bold; 
                font-family: 'Courier New', monospace; 
                color: #2c3e50; 
                background: white; 
                padding: 8mm 12mm; 
                border-radius: 4mm; 
                border: 2mm solid #2c3e50; 
                letter-spacing: 2mm;
                text-align: center;
            }
            .rodape { 
                background: rgba(44, 62, 80, 0.9); 
                color: white; 
                text-align: center; 
                padding: 12mm; 
                font-size: 10pt;
                margin-top: auto;
            }
            .rodape-titulo { font-size: 12pt; margin-bottom: 5mm; font-weight: bold; }
            @media print {
                .ingresso { page-break-after: always; }
                .ingresso:last-child { page-break-after: avoid; }
            }
        </style>
    </head>
    <body>
        <?php foreach ($ingressos as $ingresso): ?>
        <div class="ingresso">
            <div class="header">
                <div class="evento-titulo">
                    <?php echo $evento_dados ? htmlspecialchars($evento_dados['nome']) : 'Any Summit'; ?>
                </div>
                <?php if ($evento_dados && $evento_dados['data_inicio']): ?>
                <div class="evento-info">📅 <?php echo date('d \d\e F \d\e Y, H\h', strtotime($evento_dados['data_inicio'])); ?></div>
                <?php endif; ?>
                <?php if ($evento_dados && $evento_dados['nome_local']): ?>
                <div class="evento-info">📍 <?php echo htmlspecialchars($evento_dados['nome_local']); ?></div>
                <?php endif; ?>
            </div>
            
            <div class="main-content">
                <div class="left-section">
                    <div class="section-title">Ingresso</div>
                    <div class="ingresso-info">
                        <div class="tipo-ingresso"><?php echo htmlspecialchars($ingresso['titulo_ingresso']); ?></div>
                        <div class="preco">R$ <?php echo number_format($ingresso['preco_unitario'], 2, ',', '.'); ?></div>
                        <div class="compra-info">
                            Comprado em <?php echo date('d/m/Y - H:i', strtotime($ingresso['criado_em'])); ?>
                        </div>
                    </div>
                    
                    <div class="section-title">Participante</div>
                    <?php if ($ingresso['participante_nome']): ?>
                    <div class="participante-info">
                        <div class="participante-nome"><?php echo htmlspecialchars($ingresso['participante_nome']); ?></div>
                        <?php if ($ingresso['participante_email']): ?>
                        <div class="participante-email"><?php echo htmlspecialchars($ingresso['participante_email']); ?></div>
                        <?php endif; ?>
                    </div>
                    <?php else: ?>
                    <div class="participante-info participante-nao-vinculado">
                        <div class="participante-nome">Não vinculado</div>
                        <div style="font-size: 10pt; margin-top: 3mm;">
                            Este ingresso ainda não foi vinculado a um participante
                        </div>
                    </div>
                    <?php endif; ?>
                </div>
                
                <div class="right-section">
                    <div class="qr-placeholder">
                        QR CODE<br>
                        <small><?php echo substr($ingresso['codigo_ingresso'], 0, 8); ?></small>
                    </div>
                    <div class="codigo-ingresso"><?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?></div>
                </div>
            </div>
            
            <div class="rodape">
                <div class="rodape-titulo">Apresente este ingresso (impresso ou digital) na entrada do evento</div>
                <div>
                    Código: <?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?> | 
                    Pedido: <?php echo htmlspecialchars($pedido['codigo_pedido']); ?>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
    </body>
    </html>
    <?php
    return ob_get_clean();
}
?>