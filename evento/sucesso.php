<?php
// Verificar se há pedido_id na URL
$pedido_id = isset($_GET['pedido']) ? (int)$_GET['pedido'] : null;

if (!$pedido_id) {
    header('Location: /evento/');
    exit;
}

// Incluir conexão para buscar dados do pedido
include("conm/conn.php");

// Buscar dados do pedido com informações do cupom
$sql = "SELECT p.*, e.nome as evento_nome, e.slug as evento_slug,
               c.codigo as cupom_codigo, p.desconto_cupom
        FROM tb_pedidos p 
        LEFT JOIN eventos e ON p.eventoid = e.id 
        LEFT JOIN cupons c ON p.cupom_id = c.id
        WHERE p.id = ?";

$stmt = mysqli_prepare($con, $sql);
mysqli_stmt_bind_param($stmt, "i", $pedido_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$pedido = mysqli_fetch_assoc($result);

if (!$pedido) {
    header('Location: /evento/');
    exit;
}

// Buscar itens do pedido
$sql_itens = "SELECT * FROM tb_itens_pedido WHERE pedidoid = ?";
$stmt_itens = mysqli_prepare($con, $sql_itens);
mysqli_stmt_bind_param($stmt_itens, "i", $pedido_id);
mysqli_stmt_execute($stmt_itens);
$result_itens = mysqli_stmt_get_result($stmt_itens);
$itens = mysqli_fetch_all($result_itens, MYSQLI_ASSOC);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pedido Confirmado - <?php echo htmlspecialchars($pedido['evento_nome']); ?></title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    
    <style>
        .success-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .success-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 600px;
            width: 100%;
            overflow: hidden;
        }
        
        .success-header {
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .success-icon {
            font-size: 4rem;
            margin-bottom: 20px;
            animation: bounce 1s infinite alternate;
        }
        
        @keyframes bounce {
            0% { transform: scale(1); }
            100% { transform: scale(1.1); }
        }
        
        .pedido-info {
            padding: 30px;
        }
        
        .pedido-card {
            border: 1px solid #e9ecef;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            background: #f8f9fa;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            border: none;
            border-radius: 10px;
            padding: 15px 30px;
            font-weight: 600;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class="success-container">
        <div class="success-card">
            <div class="success-header">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h1 class="h2 mb-3">Pedido Confirmado!</h1>
                <p class="mb-0">Sua compra gratuita foi processada com sucesso</p>
            </div>
            
            <div class="pedido-info">
                <div class="pedido-card">
                    <h5 class="mb-3"><i class="fas fa-ticket-alt me-2"></i>Detalhes do Pedido</h5>
                    
                    <div class="row mb-3">
                        <div class="col-6">
                            <strong>Código do Pedido:</strong><br>
                            <span class="text-primary"><?php echo htmlspecialchars($pedido['codigo_pedido']); ?></span>
                        </div>
                        <div class="col-6">
                            <strong>Data:</strong><br>
                            <?php echo date('d/m/Y H:i', strtotime($pedido['data_pedido'])); ?>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <strong>Evento:</strong><br>
                        <?php echo htmlspecialchars($pedido['evento_nome']); ?>
                    </div>
                    
                    <div class="mb-3">
                        <strong>Participante:</strong><br>
                        <?php echo htmlspecialchars($pedido['comprador_nome']); ?>
                    </div>
                    
                    <div class="mb-3">
                        <strong>Ingressos:</strong>
                        <ul class="list-unstyled mt-2">
                            <?php foreach ($itens as $item): ?>
                            <li class="border-bottom py-2">
                                <i class="fas fa-ticket me-2 text-success"></i>
                                <?php echo htmlspecialchars($item['nome_ingresso']); ?>
                                <small class="text-muted d-block">Código: <?php echo htmlspecialchars($item['codigo_ingresso']); ?></small>
                            </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                    
                    <?php if ($pedido['desconto_cupom'] > 0 && !empty($pedido['cupom_codigo'])): ?>
                    <div class="mb-3">
                        <strong>Cupom Aplicado:</strong><br>
                        <span class="text-success">
                            <i class="fas fa-tag me-1"></i>
                            <?php echo htmlspecialchars($pedido['cupom_codigo']); ?>
                            <small class="text-muted">
                                (Desconto: R$ <?php echo number_format($pedido['desconto_cupom'], 2, ',', '.'); ?>)
                            </small>
                        </span>
                    </div>
                    <?php endif; ?>
                    
                    <div class="text-center pt-3">
                        <span class="badge bg-success fs-6 px-3 py-2">
                            <i class="fas fa-gift me-2"></i>Compra Gratuita
                        </span>
                    </div>
                </div>
                
                <div class="text-center">
                    <a href="/evento/?evento=<?php echo urlencode($pedido['evento_slug']); ?>" 
                       class="btn btn-primary btn-lg me-3">
                        <i class="fas fa-arrow-left me-2"></i>Voltar ao Evento
                    </a>
                    
                    <button onclick="window.print()" class="btn btn-outline-secondary btn-lg">
                        <i class="fas fa-print me-2"></i>Imprimir
                    </button>
                </div>
                
                <div class="text-center mt-4">
                    <small class="text-muted">
                        <i class="fas fa-info-circle me-1"></i>
                        Em caso de dúvidas, entre em contato conosco apresentando o código do pedido
                    </small>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>