<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// CORS para desenvolvimento
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include("../conm/conn.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Obter dados da requisição
$input = json_decode(file_get_contents('php://input'), true);

// Validações básicas
if (!isset($input['evento_id']) || !isset($input['ingressos']) || !isset($input['comprador'])) {
    echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
    exit;
}

$evento_id = (int)$input['evento_id'];
$ingressos = $input['ingressos'];
$comprador = $input['comprador'];
$cupom_id = isset($input['cupom_id']) ? (int)$input['cupom_id'] : null;
$desconto_cupom = isset($input['desconto_cupom']) ? (float)$input['desconto_cupom'] : 0;
$valor_subtotal = isset($input['valor_subtotal']) ? (float)$input['valor_subtotal'] : 0;

try {
    // Iniciar transação
    mysqli_autocommit($con, false);
    
    // 1. Criar ou atualizar comprador
    $comprador_id = null;
    
    // Verificar se já existe comprador com este email
    $sql_check = "SELECT id FROM compradores WHERE email = ?";
    $stmt_check = mysqli_prepare($con, $sql_check);
    mysqli_stmt_bind_param($stmt_check, "s", $comprador['email']);
    mysqli_stmt_execute($stmt_check);
    $result_check = mysqli_stmt_get_result($stmt_check);
    
    if ($row = mysqli_fetch_assoc($result_check)) {
        // Atualizar comprador existente
        $comprador_id = $row['id'];
        
        $sql_update = "UPDATE compradores SET 
                       nome = ?, documento = ?, tipo_documento = ?, 
                       telefone = ?, whatsapp = ?, cep = ?, endereco = ?, 
                       numero = ?, complemento = ?, bairro = ?, cidade = ?, estado = ?
                       WHERE id = ?";
        
        $stmt_update = mysqli_prepare($con, $sql_update);
        mysqli_stmt_bind_param($stmt_update, "ssssssssssssi", 
            $comprador['nome'], $comprador['documento'], $comprador['tipo_documento'],
            $comprador['telefone'], $comprador['whatsapp'], $comprador['cep'], 
            $comprador['endereco'], $comprador['numero'], $comprador['complemento'],
            $comprador['bairro'], $comprador['cidade'], $comprador['estado'],
            $comprador_id
        );
        
        if (!mysqli_stmt_execute($stmt_update)) {
            throw new Exception("Erro ao atualizar comprador");
        }
        
    } else {
        // Criar novo comprador
        $sql_insert = "INSERT INTO compradores 
                       (nome, email, documento, tipo_documento, telefone, whatsapp, 
                        cep, endereco, numero, complemento, bairro, cidade, estado, criado_em)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt_insert = mysqli_prepare($con, $sql_insert);
        mysqli_stmt_bind_param($stmt_insert, "sssssssssssss",
            $comprador['nome'], $comprador['email'], $comprador['documento'], $comprador['tipo_documento'],
            $comprador['telefone'], $comprador['whatsapp'], $comprador['cep'], 
            $comprador['endereco'], $comprador['numero'], $comprador['complemento'],
            $comprador['bairro'], $comprador['cidade'], $comprador['estado']
        );
        
        if (!mysqli_stmt_execute($stmt_insert)) {
            throw new Exception("Erro ao criar comprador");
        }
        
        $comprador_id = mysqli_insert_id($con);
    }
    
    // 2. Gerar código único do pedido
    $codigo_pedido = 'PED-' . strtoupper(uniqid());
    
    // 3. Criar pedido
    $sql_pedido = "INSERT INTO tb_pedidos 
                   (eventoid, participanteid, data_pedido, status_pagamento, valor_total, 
                    metodo_pagamento, comprador_nome, comprador_documento, comprador_tipo_documento,
                    codigo_pedido, cupom_id, desconto_cupom, created_at, updated_at)
                   VALUES (?, ?, NOW(), 'confirmed', 0.00, 'gratuito', ?, ?, ?, ?, ?, ?, NOW(), NOW())";
    
    $stmt_pedido = mysqli_prepare($con, $sql_pedido);
    mysqli_stmt_bind_param($stmt_pedido, "iissssidd", 
        $evento_id, $comprador_id, $comprador['nome'], $comprador['documento'], 
        $comprador['tipo_documento'], $codigo_pedido, $cupom_id, $desconto_cupom
    );
    
    if (!mysqli_stmt_execute($stmt_pedido)) {
        throw new Exception("Erro ao criar pedido");
    }
    
    $pedido_id = mysqli_insert_id($con);
    
    // 4. Criar itens do pedido
    foreach ($ingressos as $ingresso) {
        for ($i = 0; $i < $ingresso['quantidade']; $i++) {
            // Gerar código único para cada ingresso
            $codigo_ingresso = strtoupper(uniqid('TKT'));
            
            $sql_item = "INSERT INTO tb_itens_pedido 
                         (pedidoid, ingresso_id, nome_ingresso, preco_unitario, 
                          codigo_ingresso, status, criado_em)
                         VALUES (?, ?, ?, 0.00, ?, 'ativo', NOW())";
            
            $stmt_item = mysqli_prepare($con, $sql_item);
            mysqli_stmt_bind_param($stmt_item, "iiss", 
                $pedido_id, $ingresso['id'], $ingresso['nome'], $codigo_ingresso
            );
            
            if (!mysqli_stmt_execute($stmt_item)) {
                throw new Exception("Erro ao criar item do pedido");
            }
        }
    }
    
    // 5. Atualizar contador de uso do cupom se aplicável
    if ($cupom_id) {
        $sql_cupom = "UPDATE cupons SET usado = usado + 1 WHERE id = ?";
        $stmt_cupom = mysqli_prepare($con, $sql_cupom);
        mysqli_stmt_bind_param($stmt_cupom, "i", $cupom_id);
        
        if (!mysqli_stmt_execute($stmt_cupom)) {
            throw new Exception("Erro ao atualizar cupom");
        }
    }
    
    // Confirmar transação
    mysqli_commit($con);
    
    // Definir cookies do comprador
    setcookie('compradorid', $comprador_id, time() + (86400 * 30), '/'); // 30 dias
    setcookie('compradornome', $comprador['nome'], time() + (86400 * 30), '/');
    
    echo json_encode([
        'success' => true,
        'message' => 'Pedido processado com sucesso!',
        'pedido_id' => $pedido_id,
        'codigo_pedido' => $codigo_pedido
    ]);
    
} catch (Exception $e) {
    // Rollback em caso de erro
    mysqli_rollback($con);
    
    error_log("Erro no processamento de pedido gratuito: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor. Tente novamente.'
    ]);
}
?>