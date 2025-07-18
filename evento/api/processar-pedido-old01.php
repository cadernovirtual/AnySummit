<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include("../conm/conn.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
    exit;
}

// Log para debug
error_log('Processando pedido: ' . print_r($input, true));

try {
    // Iniciar transação
    $con->autocommit(false);
    
    // Extrair dados
    $carrinho = $input['carrinho'] ?? [];
    $participante = $input['participante'] ?? [];
    $comprador = $input['comprador'] ?? [];
    $pagamento = $input['pagamento'] ?? [];
    
    // Validar dados obrigatórios
    if (empty($carrinho) || empty($participante) || empty($comprador) || empty($pagamento)) {
        throw new Exception('Dados obrigatórios não informados');
    }
    
    $eventoid = $carrinho['evento']['id'] ?? 0;
    if (!$eventoid) {
        throw new Exception('Evento não identificado');
    }
    
    // ========================================
    // 1. PROCESSAR PARTICIPANTE
    // ========================================
    $participanteid = null;
    
    if ($participante['metodo_dados'] === 'logged') {
        // Usar participante logado
        $participanteid = intval($participante['participante_id']);
        
    } else if ($participante['metodo_dados'] === 'login') {
        // Buscar participante pelo email do login
        $email = mysqli_real_escape_string($con, $participante['email']);
        $sql = "SELECT participanteid FROM participantes WHERE email = '$email'";
        $result = $con->query($sql);
        if ($result->num_rows > 0) {
            $participanteid = $result->fetch_assoc()['participanteid'];
        } else {
            throw new Exception('Participante não encontrado após login');
        }
        
    } else {
        // Cadastrar novo participante
        $nome = mysqli_real_escape_string($con, $participante['nome'] . ' ' . $participante['sobrenome']);
        $email = mysqli_real_escape_string($con, $participante['email']);
        $whatsapp = mysqli_real_escape_string($con, $participante['whatsapp']);
        
        // Verificar se email já existe
        $check_sql = "SELECT participanteid FROM participantes WHERE email = '$email'";
        $check_result = $con->query($check_sql);
        
        if ($check_result->num_rows > 0) {
            // Email já existe, usar participante existente
            $participanteid = $check_result->fetch_assoc()['participanteid'];
        } else {
            // Criar novo participante
            $insert_sql = "INSERT INTO participantes (Nome, email, celular, eventoid) 
                          VALUES ('$nome', '$email', '$whatsapp', $eventoid)";
            
            if ($con->query($insert_sql)) {
                $participanteid = $con->insert_id;
            } else {
                throw new Exception('Erro ao cadastrar participante: ' . $con->error);
            }
        }
    }
    
    if (!$participanteid) {
        throw new Exception('Não foi possível identificar o participante');
    }
    
    // ========================================
    // 2. PROCESSAR COMPRADOR
    // ========================================
    $compradorid = null;
    
    if (isset($comprador['metodo_comprador']) && $comprador['metodo_comprador'] === 'logged') {
        // Usar comprador logado
        $compradorid = intval($comprador['comprador_id']);
        
    } else {
        // Verificar se já existe comprador com este CPF/CNPJ
        $documento = mysqli_real_escape_string($con, $comprador['documento']);
        $check_comprador = "SELECT id FROM compradores WHERE cpf = '$documento' OR cnpj = '$documento'";
        $result_comprador = $con->query($check_comprador);
        
        if ($result_comprador->num_rows > 0) {
            // Comprador já existe, usar o existente
            $compradorid = $result_comprador->fetch_assoc()['id'];
        } else {
            // Criar novo comprador
            $nome = mysqli_real_escape_string($con, $comprador['nome_completo']);
            $email = mysqli_real_escape_string($con, $participante['email']); // Email do participante
            $celular = mysqli_real_escape_string($con, $participante['whatsapp']); // WhatsApp do participante
            $tipo_documento = mysqli_real_escape_string($con, $comprador['tipo_documento']);
            $cep = mysqli_real_escape_string($con, $comprador['cep']);
            $endereco = mysqli_real_escape_string($con, $comprador['endereco']);
            $numero = mysqli_real_escape_string($con, $comprador['numero']);
            $complemento = mysqli_real_escape_string($con, $comprador['complemento']);
            $bairro = mysqli_real_escape_string($con, $comprador['bairro']);
            $cidade = mysqli_real_escape_string($con, $comprador['cidade']);
            $estado = mysqli_real_escape_string($con, $comprador['estado']);
            $telefone = mysqli_real_escape_string($con, $comprador['telefone']);
            
            // Definir qual campo de documento usar
            $cpf_field = ($tipo_documento === 'CPF') ? "'$documento'" : 'NULL';
            $cnpj_field = ($tipo_documento === 'CNPJ') ? "'$documento'" : 'NULL';
            
            $insert_comprador = "INSERT INTO compradores (
                nome, email, celular, cpf, cnpj, tipo_documento, cep, endereco, numero, 
                complemento, bairro, cidade, estado, telefone, ativo, criado_em
            ) VALUES (
                '$nome', '$email', '$celular', $cpf_field, $cnpj_field, '$tipo_documento', 
                '$cep', '$endereco', '$numero', '$complemento', '$bairro', '$cidade', 
                '$estado', '$telefone', 1, NOW()
            )";
            
            if ($con->query($insert_comprador)) {
                $compradorid = $con->insert_id;
            } else {
                throw new Exception('Erro ao cadastrar comprador: ' . $con->error);
            }
        }
    }
    
    if (!$compradorid) {
        throw new Exception('Não foi possível identificar o comprador');
    }

    // ========================================
    // 3. CRIAR PEDIDO
    // ========================================
    $valor_total = floatval($carrinho['total']);
    $metodo_pagamento = mysqli_real_escape_string($con, $pagamento['metodo']);
    $parcelas = intval($pagamento['parcelas'] ?? 1);
    
    $comprador_nome = mysqli_real_escape_string($con, $comprador['nome_completo']);
    $comprador_documento = mysqli_real_escape_string($con, $comprador['documento']);
    $comprador_tipo_documento = mysqli_real_escape_string($con, $comprador['tipo_documento']);
    $comprador_cep = mysqli_real_escape_string($con, $comprador['cep']);
    
    // Gerar código único do pedido
    $codigo_pedido = 'PED_' . date('Ymd') . '_' . uniqid();
    
    $sql_pedido = "INSERT INTO tb_pedidos (
        eventoid, participanteid, compradorid, valor_total, metodo_pagamento, parcelas,
        comprador_nome, comprador_documento, comprador_tipo_documento, comprador_cep,
        codigo_pedido
    ) VALUES (
        $eventoid, $participanteid, $compradorid, $valor_total, '$metodo_pagamento', $parcelas,
        '$comprador_nome', '$comprador_documento', '$comprador_tipo_documento', '$comprador_cep',
        '$codigo_pedido'
    )";
    
    if (!$con->query($sql_pedido)) {
        throw new Exception('Erro ao criar pedido: ' . $con->error);
    }
    
    $pedidoid = $con->insert_id;
    
    // ========================================
    // 4. CRIAR ITENS DO PEDIDO
    // ========================================
    foreach ($carrinho['ingressos'] as $ingresso) {
        $ingresso_id = intval($ingresso['id']);
        $quantidade = intval($ingresso['quantidade']);
        $preco_unitario = floatval($ingresso['preco']);
        $subtotal = floatval($ingresso['subtotal']);
        
        $sql_item = "INSERT INTO tb_itens_pedido (
            pedidoid, eventoid, ingresso_id, quantidade, preco_unitario, subtotal
        ) VALUES (
            $pedidoid, $eventoid, $ingresso_id, $quantidade, $preco_unitario, $subtotal
        )";
        
        if (!$con->query($sql_item)) {
            throw new Exception('Erro ao criar item do pedido: ' . $con->error);
        }
    }
    
    // Confirmar transação
    $con->commit();
    
    // Resposta de sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Pedido criado com sucesso',
        'pedido' => [
            'pedidoid' => $pedidoid,
            'codigo_pedido' => $codigo_pedido,
            'participanteid' => $participanteid,
            'compradorid' => $compradorid,
            'valor_total' => $valor_total,
            'metodo_pagamento' => $metodo_pagamento
        ]
    ]);
    
} catch (Exception $e) {
    // Reverter transação em caso de erro
    $con->rollback();
    
    error_log('Erro ao processar pedido: ' . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao processar pedido: ' . $e->getMessage()
    ]);
}

// Restaurar autocommit
$con->autocommit(true);
?>