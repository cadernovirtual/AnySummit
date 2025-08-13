<?php
/**
 * API para gerar ingresso em formato JPG
 * Uso: /evento/api/gerar-ingresso-jpg.php?h=hash_do_ingresso
 */

include("../conm/conn.php");

// Configurar headers para JSON se action=path
$action = $_GET['action'] ?? 'download';
if ($action === 'path') {
    header('Content-Type: application/json');
}

// Função para gerar hash do ingresso
function gerarHashIngresso($ingresso_id, $timestamp = null) {
    $secret_key = "AnySummit2025@#$%ingresso";
    $timestamp = $timestamp ?: time();
    return hash('sha256', $secret_key . $ingresso_id . $timestamp);
}

// Função para validar e decodificar hash do ingresso
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

// Função para converter HTML em JPG usando wkhtmltoimage
function gerarImagemIngresso($html_content, $output_path) {
    // Salvar HTML temporário
    $temp_html = tempnam(sys_get_temp_dir(), 'ingresso_') . '.html';
    file_put_contents($temp_html, $html_content);
    
    // Comando wkhtmltoimage (precisa estar instalado no servidor)
    $cmd = sprintf(
        'wkhtmltoimage --width 800 --height 1200 --quality 90 --format jpg "%s" "%s" 2>&1',
        $temp_html,
        $output_path
    );
    
    $output = [];
    $return_code = 0;
    exec($cmd, $output, $return_code);
    
    // Limpar arquivo temporário
    unlink($temp_html);
    
    return $return_code === 0;
}

// Função alternativa usando biblioteca PHP (caso wkhtmltoimage não esteja disponível)
function gerarImagemIngressoPHP($html_content, $output_path) {
    // Salvar HTML temporário
    $temp_html = tempnam(sys_get_temp_dir(), 'ingresso_') . '.html';
    file_put_contents($temp_html, $html_content);
    
    // Comando usando ImageMagick (já disponível no sistema)
    $commands = [
        // Tentar convert (ImageMagick) primeiro
        sprintf('convert -density 150 -quality 90 -background white -flatten "%s" "%s" 2>&1', $temp_html, $output_path),
        // Fallback para magick (versão mais nova do ImageMagick)
        sprintf('magick -density 150 -quality 90 -background white -flatten "%s" "%s" 2>&1', $temp_html, $output_path),
        // Tentar wkhtmltoimage se disponível
        sprintf('wkhtmltoimage --width 800 --height 1200 --quality 90 --format jpg "%s" "%s" 2>&1', $temp_html, $output_path),
    ];
    
    $success = false;
    $last_error = '';
    
    foreach ($commands as $cmd) {
        $output = [];
        $return_code = 0;
        exec($cmd, $output, $return_code);
        
        error_log("Tentando comando: $cmd");
        error_log("Return code: $return_code");
        error_log("Output: " . implode(' ', $output));
        
        if ($return_code === 0 && file_exists($output_path) && filesize($output_path) > 0) {
            $success = true;
            error_log("Sucesso com comando: $cmd");
            break;
        } else {
            $last_error = implode(' ', $output);
        }
    }
    
    // Limpar arquivo temporário
    if (file_exists($temp_html)) {
        unlink($temp_html);
    }
    
    if (!$success) {
        error_log("Falha em todos os comandos. Último erro: $last_error");
    }
    
    return $success;
}

// Verificar se o hash foi fornecido
$hash = isset($_GET['h']) ? trim($_GET['h']) : '';
$ingresso_id = isset($_GET['ingresso_id']) ? intval($_GET['ingresso_id']) : 0;

// Decodificar hash se fornecido
if (!empty($hash)) {
    $ingresso_id = decodificarHashIngresso($hash);
    if (!$ingresso_id) {
        echo json_encode([
            'success' => false,
            'error' => 'Hash inválido ou ingresso não encontrado'
        ]);
        exit;
    }
} elseif (!$ingresso_id) {
    echo json_encode([
        'success' => false,
        'error' => 'Parâmetro de acesso inválido'
    ]);
    exit;
}

try {
    // Buscar dados do ingresso
    $sql = "SELECT 
        ii.*,
        e.nome as evento_nome, 
        e.data_inicio, 
        e.nome_local, 
        e.cidade, 
        e.estado,
        e.imagem_capa,
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
        echo json_encode([
            'success' => false,
            'error' => 'Ingresso não encontrado'
        ]);
        exit;
    }
    
    $ingresso = $result->fetch_assoc();
    
    // Verificar se ingresso está vinculado
    if (empty($ingresso['participanteid'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Ingresso não vinculado'
        ]);
        exit;
    }
    
    // Gerar hash para usar no link
    $timestamp = strtotime($ingresso['criado_em']);
    $hash_link = hash('sha256', "AnySummit2025@#$%ingresso" . $ingresso['id'] . $timestamp);
    
    // Obter HTML do ingresso
    $url_ingresso = "https://" . $_SERVER['HTTP_HOST'] . "/evento/api/ver-ingresso-individual.php?h=" . $hash_link;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url_ingresso);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    $html_content = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    error_log("Obtenção HTML - HTTP Code: $http_code, Tamanho: " . strlen($html_content));
    
    if ($http_code !== 200 || empty($html_content)) {
        error_log("Erro ao obter HTML. HTTP: $http_code, Conteúdo vazio: " . (empty($html_content) ? 'SIM' : 'NÃO'));
        echo json_encode([
            'success' => false,
            'error' => 'Erro ao obter conteúdo do ingresso'
        ]);
        exit;
    }
    
    // Melhorar HTML para geração de imagem
    $html_content = str_replace('position: fixed', 'display: none', $html_content); // Ocultar barra de ações
    $html_content = str_replace('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css', '', $html_content);
    
    // Adicionar CSS inline básico para melhor renderização
    $css_inline = '
    <style>
    body { 
        font-family: Arial, sans-serif !important; 
        background: #0F0F23 !important; 
        margin: 0 !important; 
        padding: 20px !important;
        width: 800px !important;
    }
    .ingresso-card { 
        background: white !important; 
        border-radius: 20px !important; 
        overflow: hidden !important;
        margin: 0 auto !important;
    }
    .header-gradient { 
        background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%) !important; 
        color: white !important; 
        padding: 20px !important; 
        text-align: center !important;
    }
    .content { 
        background: white !important; 
        padding: 20px !important; 
    }
    .actions-bar { display: none !important; }
    </style>';
    
    $html_content = str_replace('</head>', $css_inline . '</head>', $html_content);
    
    // Gerar nome do arquivo
    $filename = 'ingresso_' . $ingresso['codigo_ingresso'] . '_' . date('Y-m-d_H-i-s') . '.jpg';
    $output_path = sys_get_temp_dir() . '/' . $filename;
    
    // Tentar gerar a imagem
    $success = gerarImagemIngressoPHP($html_content, $output_path);
    
    if (!$success || !file_exists($output_path)) {
        echo json_encode([
            'success' => false,
            'error' => 'Erro ao gerar imagem do ingresso'
        ]);
        exit;
    }
    
    // Se chegou até aqui, a imagem foi gerada com sucesso
    // Retornar a imagem ou caminho dependendo do parâmetro
    $action = $_GET['action'] ?? 'download';
    
    if ($action === 'path') {
        // Retornar apenas o caminho do arquivo (para uso interno)
        echo json_encode([
            'success' => true,
            'file_path' => $output_path,
            'filename' => $filename
        ]);
    } else {
        // Download da imagem
        header('Content-Type: image/jpeg');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . filesize($output_path));
        
        readfile($output_path);
        
        // Limpar arquivo temporário após download
        unlink($output_path);
    }
    
} catch (Exception $e) {
    error_log('Erro ao gerar JPG do ingresso: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Erro interno do servidor: ' . $e->getMessage()
    ]);
}
?>