<?php
// Habilitar exibição de erros para identificar problemas
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

try {
    include_once("conm/conn.php");
    include_once("api/enviar-email-confirmacao.php");
    include_once("api/notificar-organizador.php");
} catch (Exception $e) {
    die("Erro nos includes: " . $e->getMessage());
}

// Verificar se existe pedido_id válido
$pedido_id = $_GET['pedido_id'] ?? null;

if (!$pedido_id) {
    header('Location: /');
    exit;
}

// Buscar dados do pedido
$pedido_data = null;
$itens_pedido = [];
$ingressos_individuais = [];
$evento_data = null;

try {
    // Query para buscar o pedido com dados do comprador
    $sql_pedido = "SELECT p.*, c.nome as comprador_nome_completo, c.email as comprador_email, 
                   c.celular as comprador_celular, c.cpf as comprador_cpf, c.telefone as comprador_telefone
                   FROM tb_pedidos p LEFT JOIN compradores c ON p.compradorid = c.id 
                   WHERE p.codigo_pedido = ? OR p.asaas_payment_id = ? LIMIT 1";
    
    $stmt_pedido = $con->prepare($sql_pedido);
    if (!$stmt_pedido) {
        throw new Exception("Erro ao preparar query do pedido: " . $con->error);
    }
    
    $stmt_pedido->bind_param("ss", $pedido_id, $pedido_id);
    $stmt_pedido->execute();
    $result_pedido = $stmt_pedido->get_result();
    
    if ($result_pedido->num_rows > 0) {
        $pedido_data = $result_pedido->fetch_assoc();
        
        // Verificar se o pedido foi realmente pago
        if ($pedido_data['status_pagamento'] !== 'pago' && $pedido_data['status_pagamento'] !== 'aprovado') {
            header('Location: /?status=payment_pending');
            exit;
        }
        
        // Enviar email de confirmação como backup
        if (($pedido_data['status_pagamento'] === 'pago' || $pedido_data['status_pagamento'] === 'aprovado') && 
            $pedido_data['comprador_email']) {
            try {
                enviarEmailConfirmacao($pedido_data['pedidoid'], $con);
                notificarOrganizadorCompra($pedido_data['pedidoid'], $con);
            } catch (Exception $e) {
                error_log("Erro no envio de email: " . $e->getMessage());
            }
        }
        
        // Buscar itens do pedido
        $sql_itens = "SELECT ip.*, i.titulo as ingresso_titulo, i.descricao as ingresso_descricao, i.tipo as ingresso_tipo
                      FROM tb_itens_pedido ip LEFT JOIN ingressos i ON ip.ingresso_id = i.id 
                      WHERE ip.pedidoid = ?";
        
        $stmt_itens = $con->prepare($sql_itens);
        if ($stmt_itens) {
            $stmt_itens->bind_param("i", $pedido_data['pedidoid']);
            $stmt_itens->execute();
            $result_itens = $stmt_itens->get_result();
            
            while ($item = $result_itens->fetch_assoc()) {
                $itens_pedido[] = $item;
            }
        }
        
        // Buscar dados do evento
        if ($pedido_data['eventoid']) {
            $sql_evento = "SELECT id, nome, slug, data_inicio, nome_local, cidade, estado, imagem_capa, 
                          campos_adicionais_participante 
                          FROM eventos WHERE id = ? LIMIT 1";
            $stmt_evento = $con->prepare($sql_evento);
            if ($stmt_evento) {
                $stmt_evento->bind_param("i", $pedido_data['eventoid']);
                $stmt_evento->execute();
                $result_evento = $stmt_evento->get_result();
                if ($result_evento->num_rows > 0) {
                    $evento_data = $result_evento->fetch_assoc();
                    // Decodificar campos adicionais JSON
                    $evento_data['campos_adicionais'] = [];
                    if ($evento_data['campos_adicionais_participante']) {
                        $decoded = json_decode($evento_data['campos_adicionais_participante'], true);
                        if ($decoded) {
                            $evento_data['campos_adicionais'] = $decoded;
                        }
                    }
                }
            }
        }
        
        // Buscar ingressos individuais
        $sql_ingressos = "SELECT 
            ii.id, ii.codigo_ingresso, ii.titulo_ingresso, ii.preco_unitario, ii.status,
            ii.participanteid, ii.participante_nome, ii.participante_email, ii.participante_documento,
            ii.data_vinculacao, ii.utilizado, ii.data_utilizacao
            FROM tb_ingressos_individuais ii 
            WHERE ii.pedidoid = ? 
            ORDER BY ii.id";
        
        $stmt_ingressos = $con->prepare($sql_ingressos);
        if ($stmt_ingressos) {
            $stmt_ingressos->bind_param("i", $pedido_data['pedidoid']);
            $stmt_ingressos->execute();
            $result_ingressos = $stmt_ingressos->get_result();
            
            while ($ingresso = $result_ingressos->fetch_assoc()) {
                $ingressos_individuais[] = $ingresso;
            }
        }
    }
} catch (Exception $e) {
    error_log("Erro ao buscar dados do pedido: " . $e->getMessage());
    die("Erro ao carregar dados do pedido: " . $e->getMessage());
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
        
        .btn-vincular { background-color: #007bff !important; border-color: #007bff !important; color: white !important; }
        .btn-enviar { background-color: #28a745 !important; border-color: #28a745 !important; color: white !important; }
        .btn-visualizar { background-color: #17a2b8 !important; border-color: #17a2b8 !important; color: white !important; }
        .btn-vincular:hover { background-color: #0056b3 !important; border-color: #0056b3 !important; }
        .btn-enviar:hover { background-color: #1e7e34 !important; border-color: #1e7e34 !important; }
        .btn-visualizar:hover { background-color: #138496 !important; border-color: #138496 !important; }
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
                            <span class="text-muted"><?php echo $pedido_data ? htmlspecialchars($pedido_data['codigo_pedido']) : htmlspecialchars($pedido_id); ?></span>
                        </div>
                        <div class="col-6">
                            <strong>Data:</strong><br>
                            <span class="text-muted"><?php echo $pedido_data ? date('d/m/Y H:i', strtotime($pedido_data['data_pedido'])) : date('d/m/Y H:i'); ?></span>
                        </div>
                    </div>
                    
                    <hr class="my-3">
                    
                    <div id="order-details">
                        <?php if ($pedido_data): ?>
                            <!-- Dados do Comprador -->
                            <?php if ($pedido_data['comprador_nome_completo'] || $pedido_data['comprador_nome']): ?>
                            <div class="d-flex justify-content-between mb-2">
                                <strong>Comprador:</strong>
                                <span><?php echo htmlspecialchars($pedido_data['comprador_nome_completo'] ?: $pedido_data['comprador_nome']); ?></span>
                            </div>
                            <?php endif; ?>
                            
                            <!-- Itens do Pedido -->
                            <?php if (!empty($itens_pedido)): ?>
                                <?php foreach ($itens_pedido as $item): ?>
                                <div class="d-flex justify-content-between mb-2">
                                    <span><?php echo htmlspecialchars($item['ingresso_titulo']); ?> (<?php echo $item['quantidade']; ?>x)</span>
                                    <span>R$ <?php echo number_format($item['subtotal'], 2, ',', '.'); ?></span>
                                </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                            
                            <hr>
                            <div class="d-flex justify-content-between fw-bold">
                                <span>Total Pago:</span>
                                <span>R$ <?php echo number_format($pedido_data['valor_total'], 2, ',', '.'); ?></span>
                            </div>
                        <?php else: ?>
                            <p class="text-muted">Carregando dados do pedido...</p>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Próximos Passos -->
                <div class="alert alert-info text-start">
                    <h6><i class="fas fa-info-circle me-2"></i>Próximos Passos:</h6>
                    <ul class="mb-0">
                        <li>Verifique seu e-mail para acessar os ingressos</li>
                        <li>Apresente o ingresso (impresso ou digital) no dia do evento</li>
                        <li>Chegue com antecedência para evitar filas</li>
                    </ul>
                </div>

                <!-- Ações -->
                <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                    <button class="btn btn-primary-gradient me-md-2" onClick="baixarIngressosPDF()">
                        <i class="fas fa-print me-2"></i>
                        Ver/Imprimir Ingressos
                    </button>
                    <?php 
                    $url_voltar = '/';
                    $texto_voltar = 'Voltar ao Início';
                    
                    if ($evento_data && $evento_data['slug']) {
                        $url_voltar = '/evento/' . $evento_data['slug'];
                        $texto_voltar = 'Voltar ao Evento';
                    }
                    ?>
                    <a href="<?php echo $url_voltar; ?>" class="btn btn-outline-secondary">
                        <i class="fas fa-arrow-left me-2"></i>
                        <?php echo $texto_voltar; ?>
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
        const pedidoId = <?php echo json_encode($pedido_data ? $pedido_data['pedidoid'] : null); ?>;
        
        function baixarIngressosPDF() {
            if (!pedidoId) {
                alert('Erro: Pedido não encontrado');
                return;
            }
            
            window.open(`api/gerar-ingressos-pdf.php?pedido_id=${pedidoId}`, '_blank');
        }
    </script>
</body>
</html>
