<?php
include("../conm/conn.php");

// Verificar se o pedido_id foi fornecido
$pedido_id = isset($_GET['pedido_id']) ? intval($_GET['pedido_id']) : 0;

if (!$pedido_id) {
    die('ID do pedido não fornecido');
}

try {
    // Buscar dados básicos do pedido
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
    
    // Buscar dados do evento se possível
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
    
    // Usar método híbrido: tentar PDF real, se não conseguir, usar HTML otimizado
    if (function_exists('exec') && isWkhtmltopdfAvailable()) {
        gerarPDFComWkhtmltopdf($ingressos, $pedido, $evento_dados);
    } else {
        gerarHTMLParaConversao($ingressos, $pedido, $evento_dados);
    }
    
} catch (Exception $e) {
    error_log('Erro ao gerar PDF: ' . $e->getMessage());
    exibirErro($e->getMessage());
}

function isWkhtmltopdfAvailable() {
    $output = [];
    $return_var = 0;
    @exec('wkhtmltopdf --version 2>&1', $output, $return_var);
    return $return_var === 0;
}

function gerarPDFComWkhtmltopdf($ingressos, $pedido, $evento_dados) {
    // Gerar HTML temporário
    $html_content = gerarHTMLIngressos($ingressos, $pedido, $evento_dados);
    
    // Salvar HTML temporário
    $temp_dir = sys_get_temp_dir();
    $temp_html = $temp_dir . '/ingresso_' . uniqid() . '.html';
    $temp_pdf = $temp_dir . '/ingresso_' . uniqid() . '.pdf';
    
    file_put_contents($temp_html, $html_content);
    
    // Comando wkhtmltopdf
    $cmd = "wkhtmltopdf --page-size A4 --orientation Portrait --margin-top 0 --margin-bottom 0 --margin-left 0 --margin-right 0 --disable-smart-shrinking --print-media-type '$temp_html' '$temp_pdf' 2>&1";
    
    $output = [];
    $return_var = 0;
    exec($cmd, $output, $return_var);
    
    if ($return_var === 0 && file_exists($temp_pdf) && filesize($temp_pdf) > 0) {
        // PDF gerado com sucesso
        $filename = "ingressos_pedido_" . $pedido['codigo_pedido'] . ".pdf";
        
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . filesize($temp_pdf));
        
        readfile($temp_pdf);
        
        // Limpar arquivos temporários
        @unlink($temp_html);
        @unlink($temp_pdf);
        
        exit;
    } else {
        // Se falhou, usar método HTML
        @unlink($temp_html);
        @unlink($temp_pdf);
        gerarHTMLParaConversao($ingressos, $pedido, $evento_dados);
    }
}

function gerarHTMLParaConversao($ingressos, $pedido, $evento_dados) {
    $filename = "ingressos_pedido_" . $pedido['codigo_pedido'] . ".html";
    
    // Headers para download HTML
    header('Content-Type: text/html; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    
    echo gerarHTMLIngressos($ingressos, $pedido, $evento_dados);
    
    // Adicionar instruções de conversão
    ?>
    <div id="instrucoes-conversao" style="
        position: fixed; 
        top: 20px; 
        right: 20px; 
        background: linear-gradient(135deg, #007bff, #0056b3); 
        color: white; 
        padding: 20px; 
        border-radius: 10px; 
        z-index: 9999; 
        max-width: 350px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        font-family: Arial, sans-serif;
    ">
        <h4 style="margin: 0 0 15px 0; font-size: 16px;">📥 Converter para PDF</h4>
        <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.5;">
            <li>Pressione <strong>Ctrl+P</strong> (ou Cmd+P no Mac)</li>
            <li>Em "Destino" escolha <strong>"Salvar como PDF"</strong></li>
            <li>Configure:
                <ul style="margin: 5px 0; font-size: 12px;">
                    <li>Tamanho: A4</li>
                    <li>Margens: Nenhuma</li>
                    <li>Orientação: Retrato</li>
                </ul>
            </li>
            <li>Clique em <strong>"Salvar"</strong></li>
        </ol>
        <div style="text-align: center; margin-top: 15px;">
            <button onclick="this.parentElement.style.display='none'; window.print();" style="
                background: white; 
                color: #007bff; 
                border: none; 
                padding: 10px 20px; 
                border-radius: 5px; 
                cursor: pointer; 
                font-weight: bold;
                font-size: 14px;
            ">🖨️ Converter Agora</button>
        </div>
    </div>
    
    <script>
        // Auto-print após 3 segundos
        setTimeout(function() {
            document.getElementById('instrucoes-conversao').style.animation = 'pulse 1s infinite';
        }, 3000);
        
        // Esconder instruções após print
        window.addEventListener("beforeprint", function() {
            document.getElementById('instrucoes-conversao').style.display = 'none';
        });
        
        window.addEventListener("afterprint", function() {
            document.getElementById('instrucoes-conversao').style.display = 'block';
        });
        
        // CSS para animação
        var style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            @media print {
                #instrucoes-conversao { display: none !important; }
            }
        `;
        document.head.appendChild(style);
    </script>
    <?php
    exit;
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
                font-size: 32pt; 
                font-weight: bold; 
                color: #2c3e50; 
                margin-bottom: 10mm; 
                font-style: italic; 
                line-height: 1.2;
            }
            .evento-info { color: #34495e; font-size: 14pt; margin: 4mm 0; }
            .main-content { 
                background: rgba(255,255,255,0.95); 
                padding: 20mm;
                flex: 1;
                display: flex;
                flex-direction: column;
            }
            .row { display: flex; gap: 15mm; margin-bottom: 15mm; }
            .col-left { flex: 2; }
            .col-right { flex: 1; text-align: center; }
            .section-title { 
                background: #2c3e50; 
                color: white; 
                padding: 8mm 12mm; 
                font-size: 12pt; 
                font-weight: bold; 
                border-radius: 6mm; 
                margin-bottom: 10mm; 
                text-transform: uppercase;
                display: inline-block;
            }
            .box { 
                background: #ecf0f1; 
                padding: 15mm; 
                border-radius: 8mm; 
                margin-bottom: 15mm;
            }
            .tipo-ingresso { 
                font-size: 20pt; 
                font-weight: bold; 
                color: #2c3e50; 
                margin-bottom: 8mm; 
                line-height: 1.3;
            }
            .preco { 
                font-size: 24pt; 
                font-weight: bold; 
                color: #27ae60; 
            }
            .compra-info { font-size: 10pt; color: #7f8c8d; margin-top: 5mm; }
            .participante-box { 
                background: #e8f5e8; 
                padding: 15mm; 
                border-radius: 8mm; 
                border-left: 4mm solid #27ae60; 
            }
            .participante-box.nao-vinculado { 
                background: #fff3cd; 
                border-left: 4mm solid #ffc107; 
                color: #856404; 
                font-style: italic; 
            }
            .participante-nome { 
                font-size: 18pt; 
                font-weight: bold; 
                color: #2c3e50; 
                line-height: 1.3;
            }
            .participante-email { font-size: 12pt; color: #7f8c8d; margin-top: 4mm; }
            .qr-box { 
                width: 35mm; 
                height: 35mm; 
                background: white; 
                border: 2mm solid #2c3e50; 
                border-radius: 6mm; 
                margin: 0 auto 15mm;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10pt;
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
                border-radius: 6mm; 
                border: 2mm solid #2c3e50; 
                letter-spacing: 2mm;
                text-align: center;
                word-break: break-all;
            }
            .rodape { 
                background: rgba(44, 62, 80, 0.9); 
                color: white; 
                text-align: center; 
                padding: 12mm; 
                font-size: 11pt;
                margin-top: auto;
            }
            .rodape-titulo { font-size: 13pt; margin-bottom: 5mm; font-weight: bold; }
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
                <div class="row">
                    <div class="col-left">
                        <div class="section-title">Ingresso</div>
                        <div class="box">
                            <div class="tipo-ingresso"><?php echo htmlspecialchars($ingresso['titulo_ingresso']); ?></div>
                            <div class="preco">R$ <?php echo number_format($ingresso['preco_unitario'], 2, ',', '.'); ?></div>
                            <div class="compra-info">
                                Comprado em <?php echo date('d/m/Y - H:i', strtotime($ingresso['criado_em'])); ?>
                            </div>
                        </div>
                        
                        <div class="section-title">Participante</div>
                        <?php if ($ingresso['participante_nome']): ?>
                        <div class="participante-box">
                            <div class="participante-nome"><?php echo htmlspecialchars($ingresso['participante_nome']); ?></div>
                            <?php if ($ingresso['participante_email']): ?>
                            <div class="participante-email"><?php echo htmlspecialchars($ingresso['participante_email']); ?></div>
                            <?php endif; ?>
                        </div>
                        <?php else: ?>
                        <div class="participante-box nao-vinculado">
                            <div class="participante-nome">Não vinculado</div>
                            <div style="font-size: 11pt; margin-top: 4mm;">
                                Este ingresso ainda não foi vinculado a um participante
                            </div>
                        </div>
                        <?php endif; ?>
                    </div>
                    
                    <div class="col-right">
                        <div class="qr-box">
                            QR CODE<br>
                            <small><?php echo substr($ingresso['codigo_ingresso'], 0, 6); ?></small>
                        </div>
                        <div class="codigo-ingresso"><?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?></div>
                    </div>
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

function exibirErro($mensagem) {
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Erro</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 50px; text-align: center; background: #f8f9fa; }
            .erro { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
            .erro h2 { color: #dc3545; margin-bottom: 20px; }
            .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
        </style>
    </head>
    <body>
        <div class="erro">
            <h2>Erro ao gerar PDF</h2>
            <p><?php echo htmlspecialchars($mensagem); ?></p>
            <a href="javascript:history.back()" class="btn">Voltar</a>
            <a href="../admin/teste-download-pdf.php" class="btn">Testar Novamente</a>
        </div>
        <script>
            // Tentar fechar a aba após alguns segundos
            setTimeout(function() {
                if (window.history.length <= 1) {
                    window.close();
                }
            }, 5000);
        </script>
    </body>
    </html>
    <?php
}
?>