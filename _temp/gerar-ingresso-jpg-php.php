<?php
/**
 * API para gerar ingresso em formato JPG usando PHP GD
 * Uso: /evento/api/gerar-ingresso-jpg-php.php?h=hash_do_ingresso
 */

include("../conm/conn.php");

// Configurar headers para JSON
header('Content-Type: application/json');

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

// Função para gerar imagem do ingresso usando GD (PHP puro)
function gerarImagemIngressoGD($ingresso_data, $output_path) {
    try {
        // Verificar se GD está disponível
        if (!extension_loaded('gd')) {
            throw new Exception('Extensão GD não disponível');
        }
        
        // Dimensões da imagem
        $width = 800;
        $height = 1200;
        
        // Criar imagem
        $img = imagecreatetruecolor($width, $height);
        if (!$img) {
            throw new Exception('Erro ao criar imagem');
        }
        
        // Cores
        $white = imagecolorallocate($img, 255, 255, 255);
        $black = imagecolorallocate($img, 0, 0, 0);
        $blue = imagecolorallocate($img, 114, 94, 255);
        $gray = imagecolorallocate($img, 128, 128, 128);
        $light_gray = imagecolorallocate($img, 248, 249, 250);
        $dark_blue = imagecolorallocate($img, 15, 15, 35);
        
        // Fundo branco
        imagefill($img, 0, 0, $white);
        
        // Header gradient (aproximação)
        for ($y = 0; $y < 200; $y++) {
            $r = max(0, min(255, 114 - ($y * 0.2)));
            $g = max(0, min(255, 94 + ($y * 0.5)));
            $b = max(0, min(255, 255 - ($y * 0.3)));
            $color = imagecolorallocate($img, $r, $g, $b);
            imageline($img, 0, $y, $width, $y, $color);
        }
        
        // Textos do header
        $font_size_title = 5;
        $font_size_normal = 3;
        $font_size_small = 2;
        
        // Título principal
        imagestring($img, $font_size_title, 50, 30, "INGRESSO OFICIAL", $white);
        
        // Nome do evento
        $evento_nome = mb_strimwidth($ingresso_data['evento_nome'], 0, 60, "...");
        imagestring($img, $font_size_normal, 50, 70, strtoupper($evento_nome), $white);
        
        // Data do evento
        if ($ingresso_data['data_inicio']) {
            $data_evento = date('d/m/Y H:i', strtotime($ingresso_data['data_inicio']));
            imagestring($img, $font_size_small, 50, 100, "Data: " . $data_evento, $white);
        }
        
        // Local do evento
        if ($ingresso_data['nome_local']) {
            $local = mb_strimwidth($ingresso_data['nome_local'], 0, 50, "...");
            imagestring($img, $font_size_small, 50, 120, "Local: " . $local, $white);
        }
        
        // Cidade/Estado
        if ($ingresso_data['cidade']) {
            $cidade_estado = $ingresso_data['cidade'];
            if ($ingresso_data['estado']) {
                $cidade_estado .= " - " . $ingresso_data['estado'];
            }
            imagestring($img, $font_size_small, 50, 140, $cidade_estado, $white);
        }
        
        // Organizador
        if ($ingresso_data['organizador_nome']) {
            imagestring($img, $font_size_small, 50, 160, "Org: " . $ingresso_data['organizador_nome'], $white);
        }
        
        // Área do conteúdo (fundo branco)
        imagefilledrectangle($img, 0, 200, $width, $height, $white);
        
        // Código do ingresso (destaque)
        $codigo_x = 50;
        $codigo_y = 250;
        imagefilledrectangle($img, $codigo_x - 10, $codigo_y - 10, $codigo_x + 500, $codigo_y + 50, $light_gray);
        imagerectangle($img, $codigo_x - 10, $codigo_y - 10, $codigo_x + 500, $codigo_y + 50, $blue);
        imagestring($img, 5, $codigo_x, $codigo_y, "CODIGO: " . $ingresso_data['codigo_ingresso'], $blue);
        
        // Informações do ingresso
        $y_pos = 330;
        imagestring($img, $font_size_normal, 50, $y_pos, "DETALHES DO INGRESSO", $black);
        $y_pos += 30;
        
        imagestring($img, $font_size_small, 50, $y_pos, "Tipo: " . $ingresso_data['titulo_ingresso'], $gray);
        $y_pos += 25;
        
        imagestring($img, $font_size_small, 50, $y_pos, "Status: " . ucfirst($ingresso_data['status'] ?: 'Ativo'), $gray);
        $y_pos += 25;
        
        if ($ingresso_data['criado_em']) {
            $criado_em = date('d/m/Y H:i', strtotime($ingresso_data['criado_em']));
            imagestring($img, $font_size_small, 50, $y_pos, "Criado em: " . $criado_em, $gray);
            $y_pos += 25;
        }
        
        if ($ingresso_data['data_vinculacao']) {
            $vinculado_em = date('d/m/Y H:i', strtotime($ingresso_data['data_vinculacao']));
            imagestring($img, $font_size_small, 50, $y_pos, "Vinculado em: " . $vinculado_em, $gray);
            $y_pos += 25;
        }
        
        // Participante
        $y_pos += 20;
        imagestring($img, $font_size_normal, 50, $y_pos, "TITULAR DO INGRESSO", $black);
        $y_pos += 30;
        
        if ($ingresso_data['participante_nome']) {
            imagestring($img, $font_size_small, 50, $y_pos, "Nome: " . $ingresso_data['participante_nome'], $gray);
            $y_pos += 25;
            
            if ($ingresso_data['participante_email']) {
                imagestring($img, $font_size_small, 50, $y_pos, "Email: " . $ingresso_data['participante_email'], $gray);
                $y_pos += 25;
            }
            
            if ($ingresso_data['participante_documento']) {
                imagestring($img, $font_size_small, 50, $y_pos, "CPF: " . $ingresso_data['participante_documento'], $gray);
                $y_pos += 25;
            }
        } else {
            imagestring($img, $font_size_small, 50, $y_pos, "INGRESSO NAO VINCULADO", $gray);
            $y_pos += 25;
        }
        
        // QR Code placeholder (será uma representação textual)
        if ($ingresso_data['qr_code_data']) {
            $y_pos += 30;
            imagestring($img, $font_size_normal, 50, $y_pos, "CODIGO DE VALIDACAO", $black);
            $y_pos += 30;
            
            // Desenhar um "QR code" representativo (quadrado com bordas)
            $qr_size = 150;
            $qr_x = ($width - $qr_size) / 2;
            $qr_y = $y_pos;
            
            imagefilledrectangle($img, $qr_x, $qr_y, $qr_x + $qr_size, $qr_y + $qr_size, $black);
            imagefilledrectangle($img, $qr_x + 10, $qr_y + 10, $qr_x + $qr_size - 10, $qr_y + $qr_size - 10, $white);
            
            // Padrão interno simples
            for ($i = 0; $i < 10; $i++) {
                for ($j = 0; $j < 10; $j++) {
                    if (($i + $j) % 3 == 0) {
                        imagefilledrectangle(
                            $img, 
                            $qr_x + 20 + ($i * 10), 
                            $qr_y + 20 + ($j * 10),
                            $qr_x + 28 + ($i * 10), 
                            $qr_y + 28 + ($j * 10),
                            $black
                        );
                    }
                }
            }
            
            $y_pos += $qr_size + 20;
            imagestring($img, $font_size_small, 50, $y_pos, "Apresente este QR Code na entrada do evento", $gray);
            $y_pos += 25;
        }
        
        // Informações da compra
        $y_pos += 30;
        imagestring($img, $font_size_normal, 50, $y_pos, "INFORMACOES DA COMPRA", $black);
        $y_pos += 30;
        
        imagestring($img, $font_size_small, 50, $y_pos, "Pedido: " . $ingresso_data['codigo_pedido'], $gray);
        $y_pos += 25;
        
        if ($ingresso_data['comprador_nome_completo'] || $ingresso_data['comprador_nome']) {
            $comprador = $ingresso_data['comprador_nome_completo'] ?: $ingresso_data['comprador_nome'];
            imagestring($img, $font_size_small, 50, $y_pos, "Comprador: " . $comprador, $gray);
            $y_pos += 25;
        }
        
        // Rodapé
        $y_pos = $height - 80;
        imagefilledrectangle($img, 0, $y_pos, $width, $height, $dark_blue);
        
        imagestring($img, $font_size_small, 50, $y_pos + 15, "Apresente este ingresso (impresso ou digital)", $white);
        imagestring($img, $font_size_small, 50, $y_pos + 35, "na entrada do evento", $white);
        
        imagestring($img, $font_size_small, 50, $y_pos + 55, "Codigo: " . $ingresso_data['codigo_ingresso'], $white);
        imagestring($img, $font_size_small, 350, $y_pos + 55, "Pedido: " . $ingresso_data['codigo_pedido'], $white);
        
        // Salvar como JPEG
        $success = imagejpeg($img, $output_path, 90);
        
        // Limpar memória
        imagedestroy($img);
        
        return $success;
        
    } catch (Exception $e) {
        error_log("Erro ao gerar imagem GD: " . $e->getMessage());
        return false;
    }
}

try {
    // Verificar parâmetros
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
    
    // Gerar nome do arquivo
    $filename = 'ingresso_' . $ingresso['codigo_ingresso'] . '_' . date('Y-m-d_H-i-s') . '.jpg';
    $output_path = sys_get_temp_dir() . '/' . $filename;
    
    // Gerar a imagem usando GD
    $success = gerarImagemIngressoGD($ingresso, $output_path);
    
    if (!$success || !file_exists($output_path)) {
        echo json_encode([
            'success' => false,
            'error' => 'Erro ao gerar imagem do ingresso'
        ]);
        exit;
    }
    
    // Se chegou até aqui, a imagem foi gerada com sucesso
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
    error_log('Erro ao gerar JPG do ingresso (GD): ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Erro interno do servidor: ' . $e->getMessage()
    ]);
}
?>
