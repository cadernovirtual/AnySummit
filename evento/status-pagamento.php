<?php
include("conm/conn.php");

$pedido_id = isset($_GET['pedido_id']) ? $_GET['pedido_id'] : '';

if (empty($pedido_id)) {
    header('Location: /');
    exit;
}

// Buscar dados do pedido
$sql = "SELECT p.*, e.nome as evento_nome, e.slug as evento_slug 
        FROM tb_pedidos p 
        LEFT JOIN eventos e ON p.eventoid = e.id 
        WHERE p.codigo_pedido = ? OR p.asaas_payment_id = ?";

$stmt = $con->prepare($sql);
$stmt->bind_param("ss", $pedido_id, $pedido_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    header('Location: /');
    exit;
}

$pedido = $result->fetch_assoc();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Status do Pagamento - Any Summit</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <meta http-equiv="refresh" content="30"> <!-- Refresh a cada 30 segundos -->
</head>
<body class="bg-light">
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card shadow">
                    <div class="card-body text-center p-5">
                        <?php if ($pedido['status_pagamento'] === 'pago' || $pedido['status_pagamento'] === 'aprovado'): ?>
                            <!-- Pagamento Aprovado -->
                            <div class="text-success mb-4">
                                <i class="fas fa-check-circle" style="font-size: 4rem;"></i>
                            </div>
                            <h3 class="text-success mb-3">Pagamento Aprovado!</h3>
                            <p class="text-muted">Seu pagamento foi confirmado com sucesso.</p>
                            <a href="pagamento-sucesso.php?pedido_id=<?php echo urlencode($pedido['codigo_pedido']); ?>" 
                               class="btn btn-success btn-lg">
                                <i class="fas fa-ticket-alt me-2"></i>
                                Ver Meus Ingressos
                            </a>
                        <?php else: ?>
                            <!-- Pagamento Pendente -->
                            <div class="text-warning mb-4">
                                <i class="fas fa-clock" style="font-size: 4rem;"></i>
                            </div>
                            <h3 class="text-warning mb-3">Processando Pagamento</h3>
                            <p class="text-muted mb-4">
                                Estamos aguardando a confirmação do seu pagamento com a operadora do cartão.<br>
                                <small>Esta página será atualizada automaticamente.</small>
                            </p>
                            
                            <div class="alert alert-info">
                                <strong>Pedido:</strong> <?php echo htmlspecialchars($pedido['codigo_pedido']); ?><br>
                                <strong>Status:</strong> <?php echo ucfirst($pedido['status_pagamento']); ?><br>
                                <strong>Valor:</strong> R$ <?php echo number_format($pedido['valor_total'], 2, ',', '.'); ?>
                            </div>
                            
                            <button onclick="verificarStatusAgora()" class="btn btn-primary me-2">
                                <i class="fas fa-sync-alt me-1"></i>
                                Verificar Agora
                            </button>
                            
                            <?php if ($pedido['evento_slug']): ?>
                            <a href="/evento/<?php echo $pedido['evento_slug']; ?>" class="btn btn-outline-secondary">
                                <i class="fas fa-arrow-left me-1"></i>
                                Voltar ao Evento
                            </a>
                            <?php endif; ?>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function verificarStatusAgora() {
            const btn = event.target;
            const textoOriginal = btn.innerHTML;
            
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Verificando...';
            
            // Verificar status
            fetch(`api/verificar-status-pagamento.php?pedido_id=<?php echo urlencode($pedido_id); ?>`)
                .then(response => response.json())
                .then(result => {
                    if (result.success && result.approved) {
                        window.location.href = 'pagamento-sucesso.php?pedido_id=<?php echo urlencode($pedido['codigo_pedido']); ?>';
                    } else {
                        // Atualizar página para mostrar status atual
                        location.reload();
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                    alert('Erro ao verificar status. Tente novamente.');
                })
                .finally(() => {
                    btn.disabled = false;
                    btn.innerHTML = textoOriginal;
                });
        }

        // Auto-verificar a cada 10 segundos
        setInterval(() => {
            fetch(`api/verificar-status-pagamento.php?pedido_id=<?php echo urlencode($pedido_id); ?>`)
                .then(response => response.json())
                .then(result => {
                    if (result.success && result.approved) {
                        window.location.href = 'pagamento-sucesso.php?pedido_id=<?php echo urlencode($pedido['codigo_pedido']); ?>';
                    }
                })
                .catch(error => {
                    console.log('Verificação automática falhou:', error);
                });
        }, 10000); // 10 segundos
    </script>
</body>
</html>
