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
    
    // Gerar PDF usando uma biblioteca
    require_once('pdf-lib.php'); // Arquivo que criaremos com a biblioteca
    
    $filename = "ingressos_pedido_" . $pedido['codigo_pedido'] . ".pdf";
    
    // Gerar PDF
    $pdf_content = gerarPDFIngressos($ingressos, $pedido, $evento_dados);
    
    // Headers para download de PDF
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . strlen($pdf_content));
    header('Cache-Control: private, max-age=0, must-revalidate');
    header('Pragma: public');
    
    echo $pdf_content;
    exit;
    
} catch (Exception $e) {
    error_log('Erro ao gerar PDF: ' . $e->getMessage());
    
    // Em caso de erro, mostrar página de erro
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
            .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
        </style>
    </head>
    <body>
        <div class="erro">
            <h2>Erro ao gerar PDF</h2>
            <p><?php echo htmlspecialchars($e->getMessage()); ?></p>
            <a href="javascript:history.back()" class="btn">Voltar</a>
            <a href="../admin/teste-download-pdf.php" class="btn">Testar Novamente</a>
        </div>
        <script>
            // Fechar a aba após 3 segundos se foi aberta em nova aba
            setTimeout(function() {
                window.close();
            }, 3000);
        </script>
    </body>
    </html>
    <?php
}

function gerarPDFIngressos($ingressos, $pedido, $evento_dados) {
    // Usar TCPDF (mais simples de implementar)
    require_once('tcpdf/tcpdf.php');
    
    // Criar novo PDF
    $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
    
    // Configurações do PDF
    $pdf->SetCreator('Any Summit');
    $pdf->SetAuthor('Any Summit');
    $pdf->SetTitle('Ingressos - Pedido ' . $pedido['codigo_pedido']);
    $pdf->SetSubject('Ingressos do Evento');
    
    // Remover header e footer padrão
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    
    // Configurar margens
    $pdf->SetMargins(0, 0, 0);
    $pdf->SetAutoPageBreak(false, 0);
    
    // Para cada ingresso, criar uma página
    foreach ($ingressos as $ingresso) {
        $pdf->AddPage();
        
        // HTML do ingresso
        $html = gerarHTMLIngresso($ingresso, $pedido, $evento_dados);
        
        // Escrever HTML no PDF
        $pdf->writeHTML($html, true, false, true, false, '');
    }
    
    // Retornar conteúdo do PDF
    return $pdf->Output('', 'S');
}

function gerarHTMLIngresso($ingresso, $pedido, $evento_dados) {
    $evento_nome = $evento_dados ? htmlspecialchars($evento_dados['nome']) : 'Any Summit';
    $evento_data = $evento_dados && $evento_dados['data_inicio'] ? date('d/m/Y, H\h', strtotime($evento_dados['data_inicio'])) : '';
    $evento_local = $evento_dados && $evento_dados['nome_local'] ? htmlspecialchars($evento_dados['nome_local']) : '';
    
    $participante_nome = $ingresso['participante_nome'] ? htmlspecialchars($ingresso['participante_nome']) : 'Não vinculado';
    $participante_email = $ingresso['participante_email'] ? htmlspecialchars($ingresso['participante_email']) : '';
    $participante_class = $ingresso['participante_nome'] ? 'vinculado' : 'nao-vinculado';
    
    return '
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .ingresso { 
            width: 100%; 
            height: 100%; 
            background: linear-gradient(135deg, #87CEEB 0%, #4682B4 100%);
        }
        .header { 
            background: rgba(255,255,255,0.95); 
            padding: 20mm; 
            text-align: center; 
            border-bottom: 4px solid #4682B4; 
        }
        .evento-titulo { 
            font-size: 28pt; 
            font-weight: bold; 
            color: #2c3e50; 
            margin-bottom: 10mm; 
            font-style: italic; 
        }
        .evento-info { color: #34495e; font-size: 12pt; margin: 3mm 0; }
        .main-content { 
            background: rgba(255,255,255,0.95); 
            padding: 15mm;
            height: 150mm;
        }
        .secao { margin-bottom: 15mm; }
        .section-title { 
            background: #2c3e50; 
            color: white; 
            padding: 5mm 8mm; 
            font-size: 12pt; 
            font-weight: bold; 
            border-radius: 4mm; 
            margin-bottom: 8mm; 
            text-transform: uppercase;
            display: inline-block;
        }
        .ingresso-info { 
            background: #ecf0f1; 
            padding: 10mm; 
            border-radius: 6mm; 
        }
        .tipo-ingresso { 
            font-size: 18pt; 
            font-weight: bold; 
            color: #2c3e50; 
            margin-bottom: 5mm; 
        }
        .preco { 
            font-size: 22pt; 
            font-weight: bold; 
            color: #27ae60; 
        }
        .participante-info { 
            background: #e8f5e8; 
            padding: 10mm; 
            border-radius: 6mm; 
            border-left: 4mm solid #27ae60; 
        }
        .participante-info.nao-vinculado { 
            background: #fff3cd; 
            border-left: 4mm solid #ffc107; 
            color: #856404; 
        }
        .participante-nome { 
            font-size: 16pt; 
            font-weight: bold; 
            color: #2c3e50; 
        }
        .codigo-section {
            text-align: center;
            margin-top: 10mm;
        }
        .codigo-ingresso { 
            font-size: 16pt; 
            font-weight: bold; 
            font-family: Courier; 
            color: #2c3e50; 
            background: white; 
            padding: 8mm; 
            border-radius: 4mm; 
            border: 2mm solid #2c3e50; 
            letter-spacing: 2mm;
            display: inline-block;
        }
        .rodape { 
            background: rgba(44, 62, 80, 0.9); 
            color: white; 
            text-align: center; 
            padding: 8mm; 
            font-size: 10pt;
            position: absolute;
            bottom: 0;
            width: 100%;
        }
    </style>
    
    <div class="ingresso">
        <div class="header">
            <div class="evento-titulo">' . $evento_nome . '</div>
            ' . ($evento_data ? '<div class="evento-info">📅 ' . $evento_data . '</div>' : '') . '
            ' . ($evento_local ? '<div class="evento-info">📍 ' . $evento_local . '</div>' : '') . '
        </div>
        
        <div class="main-content">
            <div class="secao">
                <div class="section-title">Ingresso</div>
                <div class="ingresso-info">
                    <div class="tipo-ingresso">' . htmlspecialchars($ingresso['titulo_ingresso']) . '</div>
                    <div class="preco">R$ ' . number_format($ingresso['preco_unitario'], 2, ',', '.') . '</div>
                    <div style="font-size: 10pt; color: #7f8c8d; margin-top: 3mm;">
                        Comprado em ' . date('d/m/Y - H:i', strtotime($ingresso['criado_em'])) . '
                    </div>
                </div>
            </div>
            
            <div class="secao">
                <div class="section-title">Participante</div>
                <div class="participante-info ' . $participante_class . '">
                    <div class="participante-nome">' . $participante_nome . '</div>
                    ' . ($participante_email ? '<div style="font-size: 11pt; color: #7f8c8d; margin-top: 3mm;">' . $participante_email . '</div>' : '') . '
                    ' . (!$ingresso['participante_nome'] ? '<div style="font-size: 10pt; margin-top: 3mm;">Este ingresso ainda não foi vinculado a um participante</div>' : '') . '
                </div>
            </div>
            
            <div class="codigo-section">
                <div class="codigo-ingresso">' . htmlspecialchars($ingresso['codigo_ingresso']) . '</div>
            </div>
        </div>
        
        <div class="rodape">
            <div style="font-size: 12pt; margin-bottom: 3mm;">Apresente este ingresso (impresso ou digital) na entrada do evento</div>
            <div>
                Código: ' . htmlspecialchars($ingresso['codigo_ingresso']) . ' | 
                Pedido: ' . htmlspecialchars($pedido['codigo_pedido']) . '
            </div>
        </div>
    </div>';
}
?>