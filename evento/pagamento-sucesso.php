<?php
session_start();
include_once("conm/conn.php");
include_once("api/enviar-email-confirmacao.php");
include_once("api/notificar-organizador.php");

// Verificar se existe sessão válida ou se foi passado um pedido_id válido
$acesso_autorizado = false;
$pedido_id = null;

// Prioridade 1: pedido_id via GET (redirecionamento de pagamento)
if (isset($_GET['pedido_id']) && !empty($_GET['pedido_id'])) {
    $pedido_id = $_GET['pedido_id'];
    $acesso_autorizado = true;
} 
// Prioridade 2: sessão de checkout válida
elseif (isset($_SESSION['checkout_session'])) {
    // Buscar pedido pela sessão (implementar se necessário)
    $pedido_id = 'PED_20250702_6864a82e402dd'; // Fallback para teste
    $acesso_autorizado = true;
} 
// Fallback para teste/desenvolvimento
else {
    $pedido_id = 'PED_20250702_6864a82e402dd'; // Para teste
    $acesso_autorizado = true; // Comentar em produção
}

// Em produção, descomente esta verificação:
/*
if (!$acesso_autorizado) {
    header('Location: /');
    exit;
}
*/

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
        
        // IMPORTANTE: Verificar se o pedido foi realmente pago
        if ($pedido_data['status_pagamento'] !== 'pago' && $pedido_data['status_pagamento'] !== 'aprovado') {
            // Log da tentativa de acesso
            error_log("Tentativa de acesso a pedido não pago: " . $pedido_id . " - Status: " . $pedido_data['status_pagamento']);
            
            // Buscar slug do evento para redirecionar
            $redirect_url = '/';
            if ($pedido_data['eventoid']) {
                $sql_evento_redirect = "SELECT slug FROM eventos WHERE id = ? LIMIT 1";
                $stmt_evento_redirect = $con->prepare($sql_evento_redirect);
                if ($stmt_evento_redirect) {
                    $stmt_evento_redirect->bind_param("i", $pedido_data['eventoid']);
                    $stmt_evento_redirect->execute();
                    $result_evento_redirect = $stmt_evento_redirect->get_result();
                    if ($result_evento_redirect->num_rows > 0) {
                        $evento_redirect = $result_evento_redirect->fetch_assoc();
                        $redirect_url = '/evento/' . $evento_redirect['slug'];
                    }
                }
            }
            
            // Redirecionar para a página do evento
            header('Location: ' . $redirect_url . '?status=payment_pending');
            exit;
        }
        
        // CORREÇÃO: REMOVIDO - Não enviar emails duplicados aqui
        // Os emails de confirmação e notificação já foram enviados quando o pagamento foi processado
        // Esta página é apenas para mostrar o resultado e permitir ações nos ingressos
        
        // Buscar itens do pedido
        $sql_itens = "SELECT ip.*, i.titulo as ingresso_titulo, i.descricao as ingresso_descricao, i.tipo as ingresso_tipo
                      FROM tb_itens_pedido ip LEFT JOIN ingressos i ON ip.ingresso_id = i.id 
                      WHERE ip.pedidoid = ?";
        
        $stmt_itens = $con->prepare($sql_itens);
        if (!$stmt_itens) {
            throw new Exception("Erro ao preparar query dos itens: " . $con->error);
        }
        
        $stmt_itens->bind_param("i", $pedido_data['pedidoid']);
        $stmt_itens->execute();
        $result_itens = $stmt_itens->get_result();
        
        while ($item = $result_itens->fetch_assoc()) {
            $itens_pedido[] = $item;
        }
        
        // Buscar dados do evento, incluindo campos adicionais
        $evento_data = null;
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
                    if ($evento_data['campos_adicionais_participante']) {
                        $evento_data['campos_adicionais'] = json_decode($evento_data['campos_adicionais_participante'], true);
                    } else {
                        $evento_data['campos_adicionais'] = [];
                    }
                }
            }
        }
        
        // Buscar ingressos individuais
        $sql_ingressos = "SELECT 
            ii.id, ii.codigo_ingresso, ii.titulo_ingresso, ii.preco_unitario, ii.status,
            ii.participanteid, ii.participante_nome, ii.participante_email, ii.participante_documento,
            ii.data_vinculacao, ii.utilizado, ii.data_utilizacao, ii.hash_validacao
            FROM tb_ingressos_individuais ii 
            WHERE ii.pedidoid = ? 
            ORDER BY ii.id";
        
        $stmt_ingressos = $con->prepare($sql_ingressos);
        if (!$stmt_ingressos) {
            throw new Exception("Erro ao preparar query dos ingressos individuais: " . $con->error);
        }
        
        $stmt_ingressos->bind_param("i", $pedido_data['pedidoid']);
        $stmt_ingressos->execute();
        $result_ingressos = $stmt_ingressos->get_result();
        
        while ($ingresso = $result_ingressos->fetch_assoc()) {
            $ingressos_individuais[] = $ingresso;
        }
    }
} catch (Exception $e) {
    error_log("Erro ao buscar dados do pedido: " . $e->getMessage());
}

// Limpar sessão de checkout após sucesso
unset($_SESSION['checkout_session']);
unset($_SESSION['checkout_start_time']);
?>
<!DOCTYPE html><html lang="pt-BR">
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
        
        /* Estilos customizados para os botões dos ingressos */
        .btn-vincular {
            background-color: #007bff !important;
            border-color: #007bff !important;
            color: white !important;
        }
        
        .btn-enviar {
            background-color: #28a745 !important;
            border-color: #28a745 !important;
            color: white !important;
        }
        
        .btn-visualizar {
            background-color: #17a2b8 !important;
            border-color: #17a2b8 !important;
            color: white !important;
        }
        
        .btn-vincular:hover {
            background-color: #0056b3 !important;
            border-color: #0056b3 !important;
        }
        
        .btn-enviar:hover {
            background-color: #1e7e34 !important;
            border-color: #1e7e34 !important;
        }
        
        .btn-visualizar:hover {
            background-color: #138496 !important;
            border-color: #138496 !important;
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
                        <div class="col-lg-4 col-md-5 mb-3">
                            <strong>Número do Pedido:</strong><br>
                            <span class="text-muted"><?php echo $pedido_data ? htmlspecialchars($pedido_data['codigo_pedido']) : $pedido_id; ?></span>
                        </div>
                        <div class="col-lg-8 col-md-7 mb-3">
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
                            
                            <!-- Seção de Ingressos Individuais -->
                            <?php if (!empty($ingressos_individuais)): ?>
                            <hr class="my-4">
                            <h6 class="fw-bold mb-3 text-start">
                                <i class="fas fa-ticket-alt me-2 text-primary"></i>
                                Aqui estão os ingressos que você comprou
                            </h6>
                            
                            <!-- Instruções -->
                            <div class="alert alert-info mb-4" style="text-align: left;">
                                <h6><i class="fas fa-info-circle me-2"></i>Próximos passos:</h6>
                                <ul class="mb-0">
                                    <li><strong>Emita cada ingresso comprado</strong> identificando os dados do seu portador.</li>
                                    <li><strong>Você também terá a opção</strong> de enviar o ingresso para uso de outra pessoa.</li>
                                    <li><strong>Para entrar no evento</strong> será necessário apresentar o ingresso emitido impresso ou digital.</li>
                                </ul>
                            </div>
                            <div id="ingressos-individuais" style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%); padding: 20px; border-radius: 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.1); border: 2px dashed #6c757d; position: relative;">
                                <!-- Header decorativo para simular perfuração de ticket -->
                                <div style="position: absolute; top: -8px; left: 20px; right: 20px; height: 16px; background: repeating-linear-gradient(90deg, transparent 0px, transparent 8px, #6c757d 8px, #6c757d 12px); opacity: 0.3;"></div>
                                
                                <div style="text-align: center; margin-bottom: 25px; padding: 15px; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); border-radius: 10px; color: white; box-shadow: 0 4px 15px rgba(0,123,255,0.3);">
                                    <h5 style="margin: 0; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                                        <i class="fas fa-ticket-alt me-2"></i>
                                        SEUS INGRESSOS ADQUIRIDOS
                                    </h5>
                                    <small style="opacity: 0.9;">Emita cada ingresso individualmente identificando o portador</small>
                                </div>
                                
                                <?php foreach ($ingressos_individuais as $index => $ingresso): ?>
                                <div class="card mb-4 shadow-lg" style="border: none; border-radius: 20px; overflow: hidden; background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); position: relative; border-left: 8px solid #007bff;">
                                    <!-- Decoração lateral tipo ticket -->
                                    <div style="position: absolute; left: -4px; top: 50%; transform: translateY(-50%); width: 8px; height: 40px; background: #28a745; border-radius: 0 4px 4px 0;"></div>
                                    
                                    <div class="card-header" style="background: linear-gradient(135deg, #e9f4ff 0%, #cce7ff 100%); border-bottom: 3px solid #007bff; padding: 20px;">
                                        <div class="row align-items-center">
                                            <div class="col-md-8">
                                                <h6 class="mb-1 fw-bold text-dark" style="font-size: 1.1rem;">
                                                    <i class="fas fa-qrcode me-2 text-primary" style="font-size: 1.3rem;"></i>
                                                    <?php echo htmlspecialchars($ingresso['titulo_ingresso']); ?>
                                                </h6>
                                                <small class="text-muted">
                                                    <i class="fas fa-calendar-alt me-1"></i>
                                                    Ingresso #{$index + 1}
                                                </small>
                                            </div>
                                            <div class="col-md-4 text-end">
                                                <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); padding: 10px 15px; border-radius: 25px; display: inline-block; box-shadow: 0 4px 15px rgba(0,123,255,0.3);">
                                                    <span class="badge bg-transparent text-white fs-6" style="font-family: 'Courier New', monospace; letter-spacing: 2px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">
                                                        <?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <!-- Status do Participante -->
                                        <div class="row mb-3">
                                            <div class="col-12">
                                                <?php if ($ingresso['participante_nome']): ?>
                                                    <div class="d-flex align-items-center">
                                                        <div class="me-3">
                                                            <div class="bg-success rounded-circle d-flex align-items-center justify-content-center" style="width: 35px; height: 35px;">
                                                                <i class="fas fa-user text-white"></i>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div class="fw-bold text-success">Ingresso Emitido - <?php echo htmlspecialchars($ingresso['participante_nome']); ?></div>
                                                            <?php if ($ingresso['participante_email']): ?>
                                                            <small class="text-muted">
                                                                <i class="fas fa-envelope me-1"></i>
                                                                <?php echo htmlspecialchars($ingresso['participante_email']); ?>
                                                            </small>
                                                            <?php endif; ?>
                                                        </div>
                                                    </div>
                                                <?php else: ?>
                                                    <div class="d-flex align-items-center">
                                                        <div class="me-3">
                                                            <div class="bg-warning rounded-circle d-flex align-items-center justify-content-center" style="width: 35px; height: 35px;">
                                                                <i class="fas fa-exclamation-triangle text-white"></i>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div class="fw-bold text-warning">Ingresso aguardando emissão</div>
                                                            <small class="text-muted">Clique em "Emitir Ingresso" para identificar o portador</small>
                                                        </div>
                                                    </div>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                        
                                        <!-- Botão único: Emitir Ingresso -->
                                        <div class="row mb-3">
                                            <div class="col-12">
                                                <a href="https://anysummit.com.br/validar-ingresso.php?h=<?php echo $ingresso['hash_validacao']; ?>" 
                                                   class="btn btn-primary w-100" 
                                                   target="_blank"
                                                   style="background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%); border: none;">
                                                    <i class="fas fa-id-card me-2"></i>
                                                    Emitir Ingresso
                                                </a>
                                            </div>
                                        </div>
                                        
                                        <!-- Informações do Ingresso -->
                                        <div class="row text-center pt-3" style="border-top: 1px solid #dee2e6;">
                                            <div class="col-12">
                                                <small class="text-muted">
                                                    <i class="fas fa-info-circle me-1"></i>
                                                    Status: <?php echo $ingresso['participante_nome'] ? 'Emitido' : 'Pendente'; ?>
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            </div>
                            <?php endif; ?>
                        <?php else: ?>                            <!-- Fallback para dados do sessionStorage (caso não encontre no banco) -->
                            <p class="text-muted">Carregando dados do pedido...</p>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Ações -->
                <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                    <?php 
                    // Definir URL de voltar
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
        function formatPrice(price) {
            return price.toFixed(2).replace('.', ',');
        }

        function loadOrderDetails() {
            // Se não temos dados do banco, tentar carregar do sessionStorage
            <?php if (!$pedido_data): ?>
            const carrinho = JSON.parse(sessionStorage.getItem('carrinho') || '{}');
            const pagamentoResultado = JSON.parse(sessionStorage.getItem('pagamento_resultado') || '{}');
            
            if (carrinho.ingressos) {
                let html = '';
                carrinho.ingressos.forEach(ingresso => {                    html += `
                        <div class="d-flex justify-content-between mb-2">
                            <span>${ingresso.nome} (${ingresso.quantidade}x)</span>
                            <span>R$ ${formatPrice(ingresso.subtotal)}</span>
                        </div>
                    `;
                });
                
                if (carrinho.desconto > 0) {
                    const codigoCupom = carrinho.cupom ? ` (${carrinho.cupom.codigo})` : '';
                    html += `
                        <div class="d-flex justify-content-between mb-2 text-success">
                            <span>
                                <i class="fas fa-tag me-1"></i>
                                Desconto aplicado${codigoCupom}:
                            </span>
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
            <?php endif; ?>
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