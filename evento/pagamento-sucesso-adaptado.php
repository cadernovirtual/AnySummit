<?php
session_start();
include("conm/conn.php");

// Verificar se existe sessão válida
if (!isset($_SESSION['checkout_session'])) {
    //header('Location: /');
    //exit;
}

// Para teste - você pode alterar este ID para um pedido real
$pedido_id = 'PED_20250627_685e13f3c7dd6';

// Buscar dados do pedido
$pedido_data = null;
$itens_pedido = [];
$comprador_data = null;

try {
    // Query para buscar o pedido com dados do comprador
    $sql_pedido = "
        SELECT 
            p.*,
            c.nome as comprador_nome_completo,
            c.email as comprador_email,
            c.celular as comprador_celular,
            c.cpf as comprador_cpf,
            c.cnpj as comprador_cnpj,
            c.endereco as comprador_endereco,
            c.numero as comprador_numero,
            c.bairro as comprador_bairro,
            c.cidade as comprador_cidade,
            c.estado as comprador_estado,
            c.cep as comprador_cep_completo
        FROM tb_pedidos p 
        LEFT JOIN compradores c ON p.compradorid = c.id 
        WHERE p.codigo_pedido = ? OR p.asaas_payment_id = ?
        LIMIT 1
    ";
    
    $stmt_pedido = $mysqli->prepare($sql_pedido);
    $stmt_pedido->bind_param("ss", $pedido_id, $pedido_id);
    $stmt_pedido->execute();
    $result_pedido = $stmt_pedido->get_result();
    
    if ($result_pedido->num_rows > 0) {
        $pedido_data = $result_pedido->fetch_assoc();
        
        // Buscar itens do pedido
        $sql_itens = "
            SELECT 
                ip.*,
                i.titulo as ingresso_titulo,
                i.descricao as ingresso_descricao,
                i.tipo as ingresso_tipo
            FROM tb_itens_pedido ip
            LEFT JOIN ingressos i ON ip.ingresso_id = i.id
            WHERE ip.pedidoid = ?
        ";
        
        $stmt_itens = $mysqli->prepare($sql_itens);
        $stmt_itens->bind_param("i", $pedido_data['pedidoid']);
        $stmt_itens->execute();
        $result_itens = $stmt_itens->get_result();
        
        while ($item = $result_itens->fetch_assoc()) {
            $itens_pedido[] = $item;
        }
    }
    
} catch (Exception $e) {
    error_log("Erro ao buscar dados do pedido: " . $e->getMessage());
}

// Limpar sessão de checkout após sucesso
unset($_SESSION['checkout_session']);
unset($_SESSION['checkout_start_time']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pagamento Aprovado - Any Summit</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8f9fa;
        }
        
        .success-card {
            background: white;
            border-radius: 12px;
            border: 1px solid #e9ecef;
            max-width: 600px;
            margin: 2rem auto;
        }
        
        .success-icon {
            width: 80px;
            height: 80px;
            background: #28a745;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            font-size: 2rem;
        }
        
        .btn-primary-gradient {
            background: linear-gradient(135deg, #007bff, #0056b3);
            border: none;
            color: white;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn-primary-gradient:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
        }
        
        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-approved {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .status-cancelled {
            background-color: #f8d7da;
            color: #721c24;
        }
    </style>
</head>

<body>
    <!-- Header -->
    <div class="bg-white border-bottom">
        <div class="container py-3">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <img src="img/anysummitlogo.png" style="max-width: 150px;">
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <?php if ($pedido_data): ?>
        <div class="success-card">
            <div class="p-5 text-center">
                <!-- Ícone de Sucesso -->
                <div class="success-icon">
                    <i class="fas fa-check"></i>
                </div>
                
                <h3 class="fw-bold text-success mb-3">
                    <?php 
                    $status_text = 'Pedido Processado!';
                    if ($pedido_data['status_pagamento'] == 'RECEIVED' || $pedido_data['status_pagamento'] == 'CONFIRMED') {
                        $status_text = 'Pagamento Aprovado!';
                    } elseif ($pedido_data['status_pagamento'] == 'PENDING') {
                        $status_text = 'Pagamento Pendente';
                    }
                    echo $status_text;
                    ?>
                </h3>
                
                <p class="text-muted mb-4">
                    <?php if ($pedido_data['status_pagamento'] == 'RECEIVED' || $pedido_data['status_pagamento'] == 'CONFIRMED'): ?>
                        Seu pedido foi processado com sucesso. Os ingressos foram enviados para o seu e-mail.
                    <?php elseif ($pedido_data['status_pagamento'] == 'PENDING'): ?>
                        Seu pedido está sendo processado. Você receberá uma confirmação em breve.
                    <?php else: ?>
                        Pedido registrado. Verifique o status do pagamento.
                    <?php endif; ?>
                </p>

                <!-- Detalhes do Pedido -->
                <div class="bg-light p-4 rounded mb-4">
                    <h6 class="fw-bold mb-3">Detalhes do Pedido</h6>
                    <div class="row text-start">
                        <div class="col-md-4">
                            <strong>Número do Pedido:</strong><br>
                            <span class="text-muted"><?php echo htmlspecialchars($pedido_data['codigo_pedido'] ?: $pedido_id); ?></span>
                        </div>
                        <div class="col-md-4">
                            <strong>Data:</strong><br>
                            <span class="text-muted"><?php echo date('d/m/Y H:i', strtotime($pedido_data['data_pedido'])); ?></span>
                        </div>
                        <div class="col-md-4">
                            <strong>Status:</strong><br>
                            <span class="status-badge <?php 
                                echo ($pedido_data['status_pagamento'] == 'RECEIVED' || $pedido_data['status_pagamento'] == 'CONFIRMED') ? 'status-approved' : 
                                     ($pedido_data['status_pagamento'] == 'PENDING' ? 'status-pending' : 'status-cancelled'); 
                            ?>">
                                <?php echo htmlspecialchars($pedido_data['status_pagamento']); ?>
                            </span>
                        </div>
                    </div>
                    
                    <hr class="my-3">
                    
                    <!-- Dados do Comprador -->
                    <div class="row text-start mb-3">
                        <div class="col-md-6">
                            <strong>Comprador:</strong><br>
                            <span class="text-muted"><?php echo htmlspecialchars($pedido_data['comprador_nome_completo'] ?: $pedido_data['comprador_nome']); ?></span>
                        </div>
                        <div class="col-md-6">
                            <strong>E-mail:</strong><br>
                            <span class="text-muted"><?php echo htmlspecialchars($pedido_data['comprador_email'] ?: 'Não informado'); ?></span>
                        </div>
                    </div>
                    
                    <hr class="my-3">
                    
                    <!-- Itens do Pedido -->
                    <h6 class="fw-bold mb-3 text-start">Ingressos Adquiridos</h6>
                    <?php if (!empty($itens_pedido)): ?>
                        <?php foreach ($itens_pedido as $item): ?>
                        <div class="d-flex justify-content-between mb-2">
                            <div class="text-start">
                                <strong><?php echo htmlspecialchars($item['ingresso_titulo']); ?></strong>
                                <small class="text-muted d-block">Quantidade: <?php echo $item['quantidade']; ?>x</small>
                                <?php if ($item['ingresso_descricao']): ?>
                                <small class="text-muted d-block"><?php echo htmlspecialchars($item['ingresso_descricao']); ?></small>
                                <?php endif; ?>
                            </div>
                            <div class="text-end">
                                <strong>R$ <?php echo number_format($item['subtotal'], 2, ',', '.'); ?></strong>
                                <small class="text-muted d-block">R$ <?php echo number_format($item['preco_unitario'], 2, ',', '.'); ?> cada</small>
                            </div>
                        </div>
                        <hr class="my-2">
                        <?php endforeach; ?>
                    <?php endif; ?>
                    
                    <div class="d-flex justify-content-between fw-bold">
                        <span>Total Pago:</span>
                        <span>R$ <?php echo number_format($pedido_data['valor_total'], 2, ',', '.'); ?></span>
                    </div>
                    
                    <?php if ($pedido_data['metodo_pagamento']): ?>
                    <div class="mt-2 text-start">
                        <small class="text-muted">
                            <strong>Método de Pagamento:</strong> <?php echo htmlspecialchars($pedido_data['metodo_pagamento']); ?>
                            <?php if ($pedido_data['parcelas'] > 1): ?>
                                (<?php echo $pedido_data['parcelas']; ?>x)
                            <?php endif; ?>
                        </small>
                    </div>
                    <?php endif; ?>
                    
                    <?php if ($pedido_data['asaas_payment_id']): ?>
                    <div class="mt-1 text-start">
                        <small class="text-muted">
                            <strong>ID do Pagamento:</strong> <?php echo htmlspecialchars($pedido_data['asaas_payment_id']); ?>
                        </small>
                    </div>
                    <?php endif; ?>
                </div>

                <!-- Próximos Passos -->
                <div class="alert alert-info text-start">
                    <h6><i class="fas fa-info-circle me-2"></i>Próximos Passos:</h6>
                    <ul class="mb-0">
                        <?php if ($pedido_data['status_pagamento'] == 'RECEIVED' || $pedido_data['status_pagamento'] == 'CONFIRMED'): ?>
                        <li>Verifique sua caixa de entrada para o e-mail com os ingressos</li>
                        <li>Caso não encontre, verifique a pasta de spam</li>
                        <li>Apresente o ingresso (impresso ou digital) no dia do evento</li>
                        <li>Chegue com antecedência para evitar filas</li>
                        <?php elseif ($pedido_data['status_pagamento'] == 'PENDING'): ?>
                        <li>Aguarde a confirmação do pagamento</li>
                        <li>Você receberá um e-mail assim que o pagamento for processado</li>
                        <li>Os ingressos serão enviados após a confirmação</li>
                        <?php else: ?>
                        <li>Verifique o status do seu pagamento</li>
                        <li>Entre em contato com o suporte se necessário</li>
                        <?php endif; ?>
                    </ul>
                </div>

                <!-- Ações -->
                <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                    <?php if ($pedido_data['status_pagamento'] == 'RECEIVED' || $pedido_data['status_pagamento'] == 'CONFIRMED'): ?>
                    <button class="btn btn-primary-gradient me-md-2" onClick="downloadTickets()">
                        <i class="fas fa-download me-2"></i>
                        Baixar Ingressos
                    </button>
                    <?php endif; ?>
                    <a href="/" class="btn btn-outline-secondary">
                        <i class="fas fa-home me-2"></i>
                        Voltar ao Início
                    </a>
                </div>

                <!-- Suporte -->
                <div class="mt-4">
                    <small class="text-muted">
                        Precisa de ajuda? Entre em contato com nosso 
                        <a href="mailto:suporte@anysummit.com" class="text-decoration-none">suporte</a>
                    </small>
                </div>
            </div>
        </div>
        
        <?php else: ?>
        <!-- Caso o pedido não seja encontrado -->
        <div class="success-card">
            <div class="p-5 text-center">
                <div class="text-warning mb-3">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem;"></i>
                </div>
                <h3 class="fw-bold text-warning mb-3">Pedido não encontrado</h3>
                <p class="text-muted mb-4">
                    Não foi possível localizar os dados do pedido. Verifique se o ID está correto ou entre em contato com o suporte.
                </p>
                <div class="bg-light p-3 rounded mb-4">
                    <strong>ID pesquisado:</strong> <?php echo htmlspecialchars($pedido_id); ?>
                </div>
                <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                    <a href="/" class="btn btn-primary">
                        <i class="fas fa-home me-2"></i>
                        Voltar ao Início
                    </a>
                    <a href="mailto:suporte@anysummit.com" class="btn btn-outline-secondary">
                        <i class="fas fa-envelope me-2"></i>
                        Contatar Suporte
                    </a>
                </div>
            </div>
        </div>
        <?php endif; ?>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        function downloadTickets() {
            // Implementar download dos ingressos
            // Você pode fazer uma requisição AJAX para gerar o PDF dos ingressos
            alert('Download dos ingressos iniciado! Verifique sua pasta de Downloads.');
            
            // Exemplo de implementação:
            // window.open('/gerar-ingressos.php?pedido_id=<?php echo urlencode($pedido_data['codigo_pedido'] ?? $pedido_id); ?>', '_blank');
        }

        // Opcional: Auto-refresh para pedidos pendentes
        <?php if ($pedido_data && $pedido_data['status_pagamento'] == 'PENDING'): ?>
        setTimeout(function() {
            location.reload();
        }, 30000); // Refresh a cada 30 segundos para pedidos pendentes
        <?php endif; ?>
    </script>
</body>
</html>