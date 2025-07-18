<?php
session_start();
include("conm/conn.php");

// Verificar se existe sessão válida
if (!isset($_SESSION['checkout_session'])) {
    //header('Location: /');
    //exit;
}

// Limpar sessão de checkout após sucesso
unset($_SESSION['checkout_session']);
unset($_SESSION['checkout_start_time']);

// Simular dados do pedido
$pedido_id = uniqid('PED_20250627_685e13f3c7dd6', true);
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
        <div class="success-card">
            <div class="p-5 text-center">
                <!-- Ícone de Sucesso -->
                <div class="success-icon">
                    <i class="fas fa-check"></i>
                </div>
                
                <h3 class="fw-bold text-success mb-3">Pagamento Aprovado!</h3>
                <p class="text-muted mb-4">
                    Seu pedido foi processado com sucesso. Os ingressos foram enviados para o seu e-mail.
                </p>

                <!-- Detalhes do Pedido -->
                <div class="bg-light p-4 rounded mb-4">
                    <h6 class="fw-bold mb-3">Detalhes do Pedido</h6>
                    <div class="row text-start">
                        <div class="col-6">
                            <strong>Número do Pedido:</strong><br>
                            <span class="text-muted"><?php echo $pedido_id; ?></span>
                        </div>
                        <div class="col-6">
                            <strong>Data:</strong><br>
                            <span class="text-muted"><?php echo date('d/m/Y H:i'); ?></span>
                        </div>
                    </div>
                    
                    <hr class="my-3">
                    
                    <div id="order-details">
                        <!-- Será preenchido via JavaScript -->
                    </div>
                </div>

                <!-- Próximos Passos -->
                <div class="alert alert-info text-start">
                    <h6><i class="fas fa-info-circle me-2"></i>Próximos Passos:</h6>
                    <ul class="mb-0">
                        <li>Verifique sua caixa de entrada para o e-mail com os ingressos</li>
                        <li>Caso não encontre, verifique a pasta de spam</li>
                        <li>Apresente o ingresso (impresso ou digital) no dia do evento</li>
                        <li>Chegue com antecedência para evitar filas</li>
                    </ul>
                </div>

                <!-- Ações -->
                <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                    <button class="btn btn-primary-gradient me-md-2" onClick="downloadTickets()">
                        <i class="fas fa-download me-2"></i>
                        Baixar Ingressos
                    </button>
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
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        function formatPrice(price) {
            return price.toFixed(2).replace('.', ',');
        }

        function loadOrderDetails() {
            const carrinho = JSON.parse(sessionStorage.getItem('carrinho') || '{}');
            const pagamentoResultado = JSON.parse(sessionStorage.getItem('pagamento_resultado') || '{}');
            
            console.log('Carrinho:', carrinho);
            console.log('Pagamento:', pagamentoResultado);
            
            if (carrinho.ingressos) {
                let html = '';
                carrinho.ingressos.forEach(ingresso => {
                    html += `
                        <div class="d-flex justify-content-between mb-2">
                            <span>${ingresso.nome} (${ingresso.quantidade}x)</span>
                            <span>R$ ${formatPrice(ingresso.subtotal)}</span>
                        </div>
                    `;
                });
                
                if (carrinho.desconto > 0) {
                    html += `
                        <div class="d-flex justify-content-between mb-2 text-success">
                            <span>Desconto aplicado:</span>
                            <span>-R$ ${formatPrice(carrinho.desconto)}</span>
                        </div>
                    `;
                }
                
                html += `
                    <hr>
                    <div class="d-flex justify-content-between fw-bold">
                        <span>Total Pago:</span>
                        <span>R$ ${formatPrice(carrinho.total)}</span>
                    </div>
                `;
                
                // Adicionar informações do pagamento se disponível
                if (pagamentoResultado.payment) {
                    html += `
                        <hr>
                        <div class="mt-3">
                            <small class="text-muted">
                                <strong>ID do Pagamento:</strong> ${pagamentoResultado.payment.id}<br>
                                <strong>Status:</strong> ${pagamentoResultado.payment.status}
                            </small>
                        </div>
                    `;
                }
                
                document.getElementById('order-details').innerHTML = html;
            }
        }

        function downloadTickets() {
            // Simular download dos ingressos
            alert('Download dos ingressos iniciado! Verifique sua pasta de Downloads.');
        }

        // Inicializar página
        document.addEventListener('DOMContentLoaded', function() {
            loadOrderDetails();
            
            // Limpar dados do carrinho após sucesso
            sessionStorage.removeItem('carrinho');
        });
    </script>
</body>
</html>