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

// Log para debug
error_log("=== INÍCIO PROCESSAMENTO PEDIDO GRATUITO ===");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_log("Método não permitido: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Obter dados da requisição
$raw_input = file_get_contents('php://input');
error_log("Raw input recebido: " . $raw_input);

$input = json_decode($raw_input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("Erro ao decodificar JSON: " . json_last_error_msg());
    echo json_encode(['success' => false, 'message' => 'JSON inválido']);
    exit;
}

// Validações básicas
if (!isset($input['evento_id']) || !isset($input['ingressos']) || !isset($input['comprador'])) {
    error_log("Dados incompletos. Evento_id: " . (isset($input['evento_id']) ? 'OK' : 'FALTANDO') . 
              ", Ingressos: " . (isset($input['ingressos']) ? 'OK' : 'FALTANDO') . 
              ", Comprador: " . (isset($input['comprador']) ? 'OK' : 'FALTANDO'));
    echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
    exit;
}

$evento_id = (int)$input['evento_id'];
$ingressos = $input['ingressos'];
$comprador = $input['comprador'];
$cupom_id = isset($input['cupom_id']) ? (int)$input['cupom_id'] : null;
$desconto_cupom = isset($input['desconto_cupom']) ? (float)$input['desconto_cupom'] : 0;
$valor_subtotal = isset($input['valor_subtotal']) ? (float)$input['valor_subtotal'] : 0;

error_log("Dados extraídos - Evento ID: $evento_id, Comprador: " . json_encode($comprador));
error_log("Ingressos: " . json_encode($ingressos));

try {
    // Iniciar transação
    mysqli_autocommit($con, false);
    error_log("Transação iniciada");
    
    // 1. Criar ou atualizar comprador
    $comprador_id = null;
    
    // Verificar se já existe comprador com este email
    $sql_check = "SELECT id FROM compradores WHERE email = ?";
    $stmt_check = mysqli_prepare($con, $sql_check);
    
    if (!$stmt_check) {
        throw new Exception("Erro ao preparar consulta de verificação: " . mysqli_error($con));
    }
    
    mysqli_stmt_bind_param($stmt_check, "s", $comprador['email']);
    mysqli_stmt_execute($stmt_check);
    $result_check = mysqli_stmt_get_result($stmt_check);
    
    error_log("Verificando email: " . $comprador['email']);
    
    if ($row = mysqli_fetch_assoc($result_check)) {
        // Atualizar comprador existente
        $comprador_id = $row['id'];
        error_log("Comprador encontrado, ID: $comprador_id. Atualizando dados.");
        
        $sql_update = "UPDATE compradores SET 
                       nome = ?, cpf = ?, cnpj = ?, tipo_documento = ?, 
                       celular = ?, telefone = ?, cep = ?, endereco = ?, 
                       numero = ?, complemento = ?, bairro = ?, cidade = ?, estado = ?
                       WHERE id = ?";
        
        $stmt_update = mysqli_prepare($con, $sql_update);
        
        if (!$stmt_update) {
            throw new Exception("Erro ao preparar UPDATE: " . mysqli_error($con));
        }
        
        // Determinar CPF ou CNPJ baseado no tipo de documento
        $cpf_value = ($comprador['tipo_documento'] === 'cpf') ? $comprador['documento'] : null;
        $cnpj_value = ($comprador['tipo_documento'] === 'cnpj') ? $comprador['documento'] : null;
        
        mysqli_stmt_bind_param($stmt_update, "sssssssssssssi", 
            $comprador['nome_completo'], $cpf_value, $cnpj_value, $comprador['tipo_documento'],
            $comprador['whatsapp'], $comprador['whatsapp'], $comprador['cep'], 
            $comprador['endereco'], $comprador['numero'], $comprador['complemento'],
            $comprador['bairro'], $comprador['cidade'], $comprador['estado'],
            $comprador_id
        );
        
        if (!mysqli_stmt_execute($stmt_update)) {
            throw new Exception("Erro ao atualizar comprador: " . mysqli_error($con));
        }
        
        error_log("Comprador atualizado com sucesso");
        
    } else {
        // Criar novo comprador
        error_log("Comprador não encontrado. Criando novo.");
        
        $sql_insert = "INSERT INTO compradores 
                       (nome, email, cpf, cnpj, tipo_documento, celular, telefone,
                        cep, endereco, numero, complemento, bairro, cidade, estado, 
                        ativo, criado_em)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())";
        
        $stmt_insert = mysqli_prepare($con, $sql_insert);
        
        if (!$stmt_insert) {
            throw new Exception("Erro ao preparar INSERT: " . mysqli_error($con));
        }
        
        // Determinar CPF ou CNPJ baseado no tipo de documento
        $cpf_value = ($comprador['tipo_documento'] === 'cpf') ? $comprador['documento'] : null;
        $cnpj_value = ($comprador['tipo_documento'] === 'cnpj') ? $comprador['documento'] : null;
        
        mysqli_stmt_bind_param($stmt_insert, "ssssssssssssss",
            $comprador['nome_completo'], $comprador['email'], $cpf_value, $cnpj_value, 
            $comprador['tipo_documento'], $comprador['whatsapp'], $comprador['whatsapp'],
            $comprador['cep'], $comprador['endereco'], $comprador['numero'], $comprador['complemento'],
            $comprador['bairro'], $comprador['cidade'], $comprador['estado']
        );
        
        if (!mysqli_stmt_execute($stmt_insert)) {
            throw new Exception("Erro ao criar comprador: " . mysqli_error($con));
        }
        
        $comprador_id = mysqli_insert_id($con);
        error_log("Novo comprador criado com ID: $comprador_id");
    }
    
    // 2. Gerar código único do pedido
    $codigo_pedido = 'PED-' . strtoupper(uniqid());
    error_log("Código do pedido gerado: $codigo_pedido");
    
    // 3. Criar pedido (estrutura idêntica à API principal)
    error_log("Preparando dados do pedido...");
    $comprador_cep = $comprador['cep'] ? mysqli_real_escape_string($con, $comprador['cep']) : '';
    $comprador_nome_escaped = mysqli_real_escape_string($con, $comprador['nome_completo']);
    $comprador_documento_escaped = mysqli_real_escape_string($con, $comprador['documento']);
    $comprador_tipo_documento_escaped = mysqli_real_escape_string($con, $comprador['tipo_documento']);
    $codigo_pedido_escaped = mysqli_real_escape_string($con, $codigo_pedido);
    
    error_log("Dados preparados - Evento: $evento_id, Comprador: $comprador_id");
    
    $sql_pedido = "INSERT INTO tb_pedidos (
        eventoid, participanteid, compradorid, valor_total, metodo_pagamento, parcelas,
        comprador_nome, comprador_documento, comprador_tipo_documento, comprador_cep,
        codigo_pedido, cupom_id, desconto_cupom, created_at, updated_at
    ) VALUES (
        $evento_id, $comprador_id, $comprador_id, 0.00, 'gratuito', 1,
        '$comprador_nome_escaped', '$comprador_documento_escaped', '$comprador_tipo_documento_escaped', '$comprador_cep',
        '$codigo_pedido_escaped', " . ($cupom_id ? $cupom_id : 'NULL') . ", $desconto_cupom, NOW(), NOW()
    )";
    
    error_log("SQL do pedido: " . $sql_pedido);
    
    if (!$con->query($sql_pedido)) {
        error_log("ERRO SQL ao criar pedido: " . $con->error);
        throw new Exception('Erro ao criar pedido: ' . $con->error);
    }
    
    $pedido_id = $con->insert_id;
    error_log("Pedido criado com ID: $pedido_id");
    
    // 4. Criar itens do pedido
    error_log("Criando itens do pedido - Total de tipos de ingresso: " . count($ingressos));
    
    foreach ($ingressos as $ingresso) {
        error_log("Processando ingresso: " . json_encode($ingresso));
        
        for ($i = 0; $i < $ingresso['quantidade']; $i++) {
            // Gerar código único para cada ingresso
            $codigo_ingresso = strtoupper(uniqid('TKT'));
            
            $sql_item = "INSERT INTO tb_itens_pedido 
                         (pedidoid, ingresso_id, nome_ingresso, preco_unitario, 
                          codigo_ingresso, status, criado_em)
                         VALUES (?, ?, ?, 0.00, ?, 'ativo', NOW())";
            
            $stmt_item = mysqli_prepare($con, $sql_item);
            
            if (!$stmt_item) {
                throw new Exception("Erro ao preparar INSERT item: " . mysqli_error($con));
            }
            
            mysqli_stmt_bind_param($stmt_item, "iiss", 
                $pedido_id, $ingresso['id'], $ingresso['nome'], $codigo_ingresso
            );
            
            if (!mysqli_stmt_execute($stmt_item)) {
                throw new Exception("Erro ao criar item do pedido: " . mysqli_error($con));
            }
            
            error_log("Item criado: Ingresso {$ingresso['nome']}, Código: $codigo_ingresso");
        }
    }
    
    // 5. Atualizar contador de uso do cupom se aplicável
    if ($cupom_id) {
        error_log("Atualizando contador do cupom ID: $cupom_id");
        
        $sql_cupom = "UPDATE cupons SET usado = usado + 1 WHERE id = ?";
        $stmt_cupom = mysqli_prepare($con, $sql_cupom);
        
        if (!$stmt_cupom) {
            throw new Exception("Erro ao preparar UPDATE cupom: " . mysqli_error($con));
        }
        
        mysqli_stmt_bind_param($stmt_cupom, "i", $cupom_id);
        
        if (!mysqli_stmt_execute($stmt_cupom)) {
            throw new Exception("Erro ao atualizar cupom: " . mysqli_error($con));
        }
        
        error_log("Cupom atualizado com sucesso");
    }
    
    // Confirmar transação
    mysqli_commit($con);
    error_log("Transação confirmada com sucesso");
    
    // Definir cookies do comprador
    setcookie('compradorid', $comprador_id, time() + (86400 * 30), '/'); // 30 dias
    setcookie('compradornome', $comprador['nome_completo'], time() + (86400 * 30), '/');
    
    error_log("Processamento concluído - Pedido ID: $pedido_id");
    
    echo json_encode([
        'success' => true,
        'message' => 'Pedido processado com sucesso!',
        'pedido_id' => $pedido_id,
        'codigo_pedido' => $codigo_pedido
    ]);
    
} catch (Exception $e) {
    // Rollback em caso de erro
    mysqli_rollback($con);
    
    $error_message = $e->getMessage();
    error_log("ERRO no processamento de pedido gratuito: " . $error_message);
    error_log("Stack trace: " . $e->getTraceAsString());
    
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor. Tente novamente.',
        'debug' => $error_message // Remover em produção
    ]);
}

error_log("=== FIM PROCESSAMENTO PEDIDO GRATUITO ===");
?>
