<?php
session_start();
include("conm/conn.php");
include("api/enviar-email-confirmacao.php");
include("api/notificar-organizador.php");

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
        
        // Se o pagamento foi aprovado, tentar enviar email de confirmação como backup
        // (caso o webhook ainda não tenha sido processado)
        if (($pedido_data['status_pagamento'] === 'pago' || $pedido_data['status_pagamento'] === 'aprovado') && 
            $pedido_data['comprador_email']) {
            try {
                // Enviar email de confirmação como backup
                $email_backup = enviarEmailConfirmacao($pedido_data['pedidoid'], $con);
                if ($email_backup) {
                    error_log("Email de confirmação (backup) enviado para pedido: " . $pedido_data['pedidoid']);
                } else {
                    error_log("Falha no envio de email de confirmação (backup) para pedido: " . $pedido_data['pedidoid']);
                }
                
                // Enviar notificação para organizador como backup
                $notificacao_backup = notificarOrganizadorCompra($pedido_data['pedidoid'], $con);
                if ($notificacao_backup === true) {
                    error_log("Notificação organizador (backup) enviada para pedido: " . $pedido_data['pedidoid']);
                } else {
                    error_log("Falha notificação organizador (backup) para pedido: " . $pedido_data['pedidoid']);
                }
            } catch (Exception $e) {
                error_log("Erro no envio de email de confirmação (backup): " . $e->getMessage());
            }
        }
        
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
            ii.data_vinculacao, ii.utilizado, ii.data_utilizacao
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
                        <div class="col-6">
                            <strong>Número do Pedido:</strong><br>
                            <span class="text-muted"><?php echo $pedido_data ? htmlspecialchars($pedido_data['codigo_pedido']) : $pedido_id; ?></span>
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
                            
                            <!-- Seção de Ingressos Individuais -->
                            <?php if (!empty($ingressos_individuais)): ?>
                            <hr class="my-4">
                            <h6 class="fw-bold mb-4 text-start">
                                <i class="fas fa-ticket-alt me-2 text-primary"></i>
                                Seus Ingressos Individuais
                            </h6>
                            <div id="ingressos-individuais">
                                <?php foreach ($ingressos_individuais as $index => $ingresso): ?>
                                <div class="card mb-3 shadow-sm" style="border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden;">
                                    <div class="card-header" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-bottom: 2px solid #dee2e6;">
                                        <div class="row align-items-center">
                                            <div class="col-md-8">
                                                <h6 class="mb-0 fw-bold text-dark">
                                                    <i class="fas fa-qrcode me-2 text-primary"></i>
                                                    <?php echo htmlspecialchars($ingresso['titulo_ingresso']); ?>
                                                </h6>
                                            </div>
                                            <div class="col-md-4 text-end">
                                                <span class="badge bg-primary fs-6" style="font-family: 'Courier New', monospace; letter-spacing: 1px;">
                                                    <?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?>
                                                </span>
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
                                                            <div class="fw-bold text-success">Vinculado - <?php echo htmlspecialchars($ingresso['participante_nome']); ?></div>
                                                            <?php if ($ingresso['participante_email']): ?>
                                                            <small class="text-muted">
                                                                <i class="fas fa-envelope me-1"></i>
                                                                <?php echo htmlspecialchars($ingresso['participante_email']); ?>
                                                            </small>
                                                            <?php endif; ?>
                                                        </div>
                                                    </div>
                                                <?php elseif ($ingresso['status'] === 'transferido'): ?>
                                                    <div class="d-flex align-items-center">
                                                        <div class="me-3">
                                                            <div class="bg-info rounded-circle d-flex align-items-center justify-content-center" style="width: 35px; height: 35px;">
                                                                <i class="fas fa-exchange-alt text-white"></i>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div class="fw-bold text-info">Transferido - Disponível para vinculação</div>
                                                            <small class="text-muted">Este ingresso pode ser vinculado a um participante</small>
                                                        </div>
                                                    </div>
                                                <?php else: ?>
                                                    <div class="d-flex align-items-center">
                                                        <div class="me-3">
                                                            <div class="bg-warning rounded-circle d-flex align-items-center justify-content-center" style="width: 35px; height: 35px;">
                                                                <i class="fas fa-user-slash text-white"></i>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div class="fw-bold text-warning">Não Vinculado - Ingresso disponível para uso</div>
                                                        </div>
                                                    </div>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                        
                                        <!-- Botões de Ação -->
                                        <?php if (!$ingresso['participanteid']): ?>
                                        <div class="row mb-2 g-2">
                                            <div class="col-6">
                                                <button class="btn btn-vincular btn-sm w-100" style="height:50px;" onClick="vincularParticipante(<?php echo $ingresso['id']; ?>)">
                                                    <i class="fas fa-user-plus me-1"></i>
                                                    Vincular Participante
                                                </button>
                                            </div>
                                            <div class="col-6">
                                                <button class="btn btn-enviar btn-sm w-100" style="height:50px;" onClick="enviarIngresso(<?php echo $ingresso['id']; ?>)">
                                                    <i class="fas fa-paper-plane me-1"></i>
                                                    Enviar Ingresso
                                                </button>
                                            </div>
                                        </div>
                                        <?php elseif (in_array($ingresso['status'], ['ativo', 'transferido'])): ?>
                                        <div class="row mb-2 g-2">
                                            <div class="col-12">
                                                <small class="text-muted">
                                                    <i class="fas fa-info-circle me-1"></i>
                                                    Ingresso já vinculado e pronto para uso
                                                </small>
                                            </div>
                                        </div>
                                        <?php endif; ?>
                                        
                                        <div class="row mb-3">
                                            <div class="col-12">
                                                <button class="btn btn-visualizar btn-sm w-100" onClick="verIngresso(<?php echo $ingresso['id']; ?>)">
                                                    <i class="fas fa-eye me-2"></i>
                                                    Visualizar Ingresso
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <!-- Informações do Ingresso -->
                                        <div class="row text-center pt-3" style="border-top: 1px solid #dee2e6;">
                                            <div class="col-md-6">
                                                <small class="text-muted">
                                                    <i class="fas fa-money-bill-wave me-1"></i>
                                                    <strong>R$ <?php echo number_format($ingresso['preco_unitario'], 2, ',', '.'); ?></strong>
                                                </small>
                                            </div>
                                            <div class="col-md-6">
                                                <small class="text-muted">
                                                    <i class="fas fa-info-circle me-1"></i>
                                                    Status: <?php echo ucfirst($ingresso['status']); ?>
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

                <!-- Próximos Passos -->
                <div class="alert alert-info text-start">
                    <h6><i class="fas fa-info-circle me-2"></i>Próximos Passos:</h6>
                    <ul class="mb-0">
                        <li>Vincule ou envie seus ingressos</li>
                        <li>O ingresso so é valido apos vincular a uma pessoa ou ele se vincular.</li>
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
                    <?php if (!empty($ingressos_individuais)): ?>
                    <button class="btn btn-success me-md-2" onClick="vincularTodosParticipantes()">
                        <i class="fas fa-users me-2"></i>
                        Vincular Participantes
                    </button>
                    <?php endif; ?>
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

    <!-- Modal para Vincular Participante -->
    <div class="modal fade" id="modalVincularParticipante" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Vincular Participante ao Ingresso</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="formVincularParticipante">
                        <input type="hidden" id="ingresso_id" name="ingresso_id">
                        
                        <div class="mb-3">
                            <label class="form-label">Código do Ingresso:</label>
                            <div id="codigo_ingresso_display" class="fw-bold text-primary"></div>
                        </div>
                        
                        <!-- Opção para usar dados do comprador -->
                        <?php if ($pedido_data && ($pedido_data['comprador_nome_completo'] || $pedido_data['comprador_nome'])): ?>
                        <div class="mb-3">
                            <div class="alert alert-info border-0" style="background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="flex-grow-1">
                                        <div class="d-flex align-items-center mb-1">
                                            <i class="fas fa-user-check text-primary me-2"></i>
                                            <strong class="text-primary">Usar dados do comprador</strong>
                                        </div>
                                        <small class="text-muted">
                                            <i class="fas fa-user me-1"></i>
                                            <?php echo htmlspecialchars($pedido_data['comprador_nome_completo'] ?: $pedido_data['comprador_nome']); ?>
                                            <?php if ($pedido_data['comprador_email']): ?>
                                                <br><i class="fas fa-envelope me-1"></i>
                                                <?php echo htmlspecialchars($pedido_data['comprador_email']); ?>
                                            <?php endif; ?>
                                            <?php if ($pedido_data['comprador_celular'] || $pedido_data['comprador_telefone']): ?>
                                                <br><i class="fas fa-phone me-1"></i>
                                                <?php echo htmlspecialchars($pedido_data['comprador_celular'] ?: $pedido_data['comprador_telefone']); ?>
                                            <?php endif; ?>
                                        </small>
                                    </div>
                                    <button type="button" class="btn btn-primary btn-sm ms-3" onclick="usarDadosComprador()" style="min-width: 120px;">
                                        <i class="fas fa-copy me-1"></i>
                                        Preencher
                                    </button>
                                </div>
                            </div>
                        </div>
                        <?php endif; ?>
                        
                        <div class="mb-3">
                            <label for="participante_nome" class="form-label">Nome Completo *</label>
                            <input type="text" class="form-control" id="participante_nome" name="participante_nome" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="participante_email" class="form-label">E-mail *</label>
                            <input type="email" class="form-control" id="participante_email" name="participante_email" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="participante_documento" class="form-label">CPF</label>
                            <input type="text" class="form-control" id="participante_documento" name="participante_documento" placeholder="000.000.000-00">
                        </div>
                        
                        <div class="mb-3">
                            <label for="participante_celular" class="form-label">Celular</label>
                            <input type="text" class="form-control" id="participante_celular" name="participante_celular" placeholder="(11) 99999-9999">
                        </div>

                        <!-- Campos Adicionais Dinâmicos -->
                        <?php if (!empty($evento_data['campos_adicionais'])): ?>
                            <hr class="my-4">
                            <h6 class="mb-3">
                                <i class="fas fa-clipboard-list me-2"></i>
                                Informações Adicionais
                            </h6>
                            <?php foreach ($evento_data['campos_adicionais'] as $campo): ?>
                                <div class="mb-3">
                                    <label for="campo_<?php echo htmlspecialchars($campo['campo']); ?>" class="form-label">
                                        <?php echo htmlspecialchars($campo['label']); ?>
                                        <?php if ($campo['obrigatorio']): ?>
                                            <span class="text-danger">*</span>
                                        <?php endif; ?>
                                    </label>

                                    <?php if ($campo['tipo'] === 'texto'): ?>
                                        <input type="text" 
                                               class="form-control" 
                                               id="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                               name="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                               <?php echo $campo['obrigatorio'] ? 'required' : ''; ?>>
                                    
                                    <?php elseif ($campo['tipo'] === 'selecao' && !empty($campo['opcoes'])): ?>
                                        <select class="form-control" 
                                                id="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                                name="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                                <?php echo $campo['obrigatorio'] ? 'required' : ''; ?>>
                                            <option value="">Selecione...</option>
                                            <?php foreach ($campo['opcoes'] as $opcao): ?>
                                                <option value="<?php echo htmlspecialchars($opcao); ?>">
                                                    <?php echo htmlspecialchars($opcao); ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    
                                    <?php elseif ($campo['tipo'] === 'url'): ?>
                                        <input type="url" 
                                               class="form-control" 
                                               id="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                               name="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                               placeholder="https://exemplo.com"
                                               <?php echo $campo['obrigatorio'] ? 'required' : ''; ?>>
                                    
                                    <?php elseif ($campo['tipo'] === 'email'): ?>
                                        <input type="email" 
                                               class="form-control" 
                                               id="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                               name="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                               placeholder="email@exemplo.com"
                                               <?php echo $campo['obrigatorio'] ? 'required' : ''; ?>>
                                    
                                    <?php else: ?>
                                        <input type="text" 
                                               class="form-control" 
                                               id="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                               name="campo_<?php echo htmlspecialchars($campo['campo']); ?>"
                                               <?php echo $campo['obrigatorio'] ? 'required' : ''; ?>>
                                    <?php endif; ?>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>

                        <!-- Aviso Importante -->
                        <div class="alert alert-warning mt-4">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>Atenção:</strong> Depois de associar esse voucher a uma pessoa, os dados não poderão ser mais alterados.
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" onClick="salvarVinculacao()">Vincular Participante</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para Enviar Ingresso -->
    <div class="modal fade" id="modalEnviarIngresso" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header" style="background: linear-gradient(135deg, #28a745, #20c997); color: white;">
                    <h5 class="modal-title">
                        <i class="fas fa-paper-plane me-2"></i>
                        Enviar Ingresso
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Envie este ingresso para alguém usar!</strong><br>
                        A pessoa receberá os dados do ingresso e poderá usá-lo no evento.
                    </div>
                    
                    <form id="formEnviarIngresso">
                        <input type="hidden" id="enviar_ingresso_id" name="ingresso_id">
                        
                        <div class="mb-3">
                            <label class="form-label">Ingresso:</label>
                            <div id="enviar_codigo_ingresso_display" class="fw-bold text-primary fs-5"></div>
                            <div id="enviar_tipo_ingresso_display" class="text-muted"></div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="enviar_nome" class="form-label">
                                <i class="fas fa-user me-1"></i>
                                Nome Completo *
                            </label>
                            <input type="text" class="form-control" id="enviar_nome" name="nome" required 
                                   placeholder="Nome de quem vai usar o ingresso">
                        </div>
                        
                        <div class="mb-3">
                            <label for="enviar_email" class="form-label">
                                <i class="fas fa-envelope me-1"></i>
                                E-mail *
                            </label>
                            <input type="email" class="form-control" id="enviar_email" name="email" required
                                   placeholder="email@exemplo.com">
                        </div>
                        
                        <div class="mb-3">
                            <label for="enviar_whatsapp" class="form-label">
                                <i class="fab fa-whatsapp me-1"></i>
                                WhatsApp
                            </label>
                            <input type="text" class="form-control" id="enviar_whatsapp" name="whatsapp"
                                   placeholder="(11) 99999-9999">
                        </div>
                        
                        <div class="mb-3">
                            <label for="enviar_mensagem" class="form-label">
                                <i class="fas fa-comment me-1"></i>
                                Mensagem (Opcional)
                            </label>
                            <textarea class="form-control" id="enviar_mensagem" name="mensagem" rows="3"
                                      placeholder="Deixe uma mensagem para quem vai receber o ingresso..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-1"></i>
                        Cancelar
                    </button>
                    <button type="button" class="btn btn-success" onClick="confirmarEnvioIngresso()">
                        <i class="fas fa-paper-plane me-1"></i>
                        Enviar Ingresso
                    </button>
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
        
        // Variáveis globais
        const pedidoId = <?php echo json_encode($pedido_data ? $pedido_data['pedidoid'] : null); ?>;
        const ingressosIndividuais = <?php echo json_encode($ingressos_individuais); ?>;
        
        // Dados do comprador para uso no modal
        const dadosComprador = {
            nome: <?php echo json_encode($pedido_data ? ($pedido_data['comprador_nome_completo'] ?: $pedido_data['comprador_nome']) : ''); ?>,
            email: <?php echo json_encode($pedido_data ? $pedido_data['comprador_email'] : ''); ?>,
            celular: <?php echo json_encode($pedido_data ? ($pedido_data['comprador_celular'] ?: $pedido_data['comprador_telefone']) : ''); ?>,
            cpf: <?php echo json_encode($pedido_data ? ($pedido_data['comprador_cpf'] ?: $pedido_data['comprador_documento']) : ''); ?>
        };
        
        // Função para usar dados do comprador no modal
        function usarDadosComprador() {
            let camposPreenchidos = 0;
            
            if (dadosComprador.nome) {
                document.getElementById('participante_nome').value = dadosComprador.nome;
                camposPreenchidos++;
            }
            if (dadosComprador.email) {
                document.getElementById('participante_email').value = dadosComprador.email;
                camposPreenchidos++;
            }
            if (dadosComprador.celular) {
                document.getElementById('participante_celular').value = dadosComprador.celular;
                camposPreenchidos++;
            }
            if (dadosComprador.cpf) {
                document.getElementById('participante_documento').value = dadosComprador.cpf;
                camposPreenchidos++;
            }
            
            // Feedback visual
            const btn = event.target;
            const textoOriginal = btn.innerHTML;
            btn.innerHTML = `<i class="fas fa-check me-1"></i> ${camposPreenchidos} dados copiados!`;
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-success');
            btn.disabled = true;
            
            setTimeout(() => {
                btn.innerHTML = textoOriginal;
                btn.classList.remove('btn-success');
                btn.classList.add('btn-primary');
                btn.disabled = false;
            }, 3000);
        }
        
        // Função para baixar PDF dos ingressos
        function baixarIngressosPDF() {
            if (!pedidoId) {
                alert('Erro: Pedido não encontrado');
                return;
            }
            
            // Usar a versão que ficou melhor (visualização/impressão)
            window.open(`api/gerar-ingressos-pdf.php?pedido_id=${pedidoId}`, '_blank');
        }
        
        // Função de debug para testar a API
        function debugVincularAPI(ingressoId) {
            const dadosDebug = {
                ingresso_id: ingressoId,
                participante_nome: 'Teste Debug',
                participante_email: 'debug@teste.com',
                participante_documento: '123.456.789-00',
                participante_celular: '(11) 99999-9999'
            };
            
            console.log('=== DEBUG API VINCULAR ===');
            console.log('Enviando dados:', dadosDebug);
            
            fetch('api/vincular-participante.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosDebug)
            })
            .then(response => {
                console.log('Status da resposta:', response.status);
                return response.text(); // Usar .text() primeiro para ver a resposta bruta
            })
            .then(text => {
                console.log('Resposta bruta:', text);
                try {
                    const json = JSON.parse(text);
                    console.log('JSON parseado:', json);
                } catch (e) {
                    console.error('Erro ao parsear JSON:', e);
                }
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
            });
        }
        
        // Função para abrir modal de vinculação de participante
        function vincularParticipante(ingressoId) {
            const ingresso = ingressosIndividuais.find(i => i.id == ingressoId);
            if (!ingresso) {
                alert('Erro: Ingresso não encontrado');
                return;
            }
            
            console.log('Abrindo modal para ingresso:', ingresso); // Debug
            
            // Preencher dados do modal
            document.getElementById('ingresso_id').value = ingressoId;
            document.getElementById('codigo_ingresso_display').textContent = ingresso.codigo_ingresso;
            
            // Limpar formulário
            document.getElementById('formVincularParticipante').reset();
            document.getElementById('ingresso_id').value = ingressoId;
            
            // Abrir modal
            const modal = new bootstrap.Modal(document.getElementById('modalVincularParticipante'));
            modal.show();
        }
        
        // Função para salvar vinculação
        async function salvarVinculacao() {
            const form = document.getElementById('formVincularParticipante');
            const formData = new FormData(form);
            
            // Validar campos obrigatórios
            const nome = formData.get('participante_nome').trim();
            const email = formData.get('participante_email').trim();
            
            if (!nome || !email) {
                alert('Por favor, preencha os campos obrigatórios (Nome e E-mail)');
                return;
            }

            // Coletar campos adicionais
            const campos_adicionais = {};
            const campos_extras = form.querySelectorAll('[name^="campo_"]');
            
            // Validar campos adicionais obrigatórios
            let camposObrigatoriosVazios = [];
            campos_extras.forEach(campo => {
                const nomeCampo = campo.name.replace('campo_', '');
                const valor = campo.value.trim();
                
                // Verificar se é obrigatório (tem asterisco na label)
                const label = form.querySelector(`label[for="${campo.id}"]`);
                const isObrigatorio = label && label.innerHTML.includes('text-danger');
                
                if (isObrigatorio && !valor) {
                    const labelText = label.textContent.replace('*', '').trim();
                    camposObrigatoriosVazios.push(labelText);
                }
                
                if (valor) {
                    campos_adicionais[nomeCampo] = valor;
                }
            });

            if (camposObrigatoriosVazios.length > 0) {
                alert('Por favor, preencha os campos obrigatórios: ' + camposObrigatoriosVazios.join(', '));
                return;
            }
            
            // Preparar dados para envio
            const dados = {
                ingresso_id: formData.get('ingresso_id'),
                participante_nome: nome,
                participante_email: email,
                participante_documento: formData.get('participante_documento').trim(),
                participante_celular: formData.get('participante_celular').trim(),
                dados_adicionais: campos_adicionais
            };
            
            // Debug: log dos dados que serão enviados
            console.log('Dados a serem enviados:', dados);
            console.log('Ingresso ID:', dados.ingresso_id);
            console.log('Lista de ingressos:', ingressosIndividuais);
            
            try {
                // Desabilitar botão durante envio
                const btnSalvar = event.target;
                btnSalvar.disabled = true;
                btnSalvar.textContent = 'Vinculando...';
                
                const response = await fetch('api/vincular-participante.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dados)
                });
                
                console.log('Response status:', response.status);
                
                const result = await response.json();
                console.log('Response data:', result);
                
                if (result.success) {
                    // Atualizar interface
                    const participanteSpan = document.getElementById(`participante-${dados.ingresso_id}`);
                    if (participanteSpan) {
                        participanteSpan.textContent = dados.participante_nome;
                    }
                    
                    // Fechar modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalVincularParticipante'));
                    modal.hide();
                    
                    alert('Participante vinculado com sucesso!');
                    
                    // Recarregar página para atualizar dados
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                    
                } else {
                    alert('Erro ao vincular participante: ' + result.message);
                }
                
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro de conexão. Tente novamente.');
            } finally {
                // Reabilitar botão
                btnSalvar.disabled = false;
                btnSalvar.textContent = 'Vincular Participante';
            }
        }
        
        // Função para vincular todos os participantes de uma vez
        function vincularTodosParticipantes() {
            const naoVinculados = ingressosIndividuais.filter(i => !i.participanteid);
            
            if (naoVinculados.length === 0) {
                alert('Todos os ingressos já estão vinculados!');
                return;
            }
            
            if (confirm(`Deseja vincular participantes aos ${naoVinculados.length} ingressos não vinculados?`)) {
                // Para simplicidade, abrir modal do primeiro não vinculado
                vincularParticipante(naoVinculados[0].id);
            }
        }
        
        // Função para enviar ingresso
        function enviarIngresso(ingressoId) {
            const ingresso = ingressosIndividuais.find(i => i.id == ingressoId);
            if (!ingresso) {
                alert('Erro: Ingresso não encontrado');
                return;
            }
            
            // Preencher dados do modal
            document.getElementById('enviar_ingresso_id').value = ingressoId;
            document.getElementById('enviar_codigo_ingresso_display').textContent = ingresso.codigo_ingresso;
            document.getElementById('enviar_tipo_ingresso_display').textContent = ingresso.titulo_ingresso;
            
            // Limpar formulário
            document.getElementById('formEnviarIngresso').reset();
            document.getElementById('enviar_ingresso_id').value = ingressoId;
            
            // Abrir modal
            const modal = new bootstrap.Modal(document.getElementById('modalEnviarIngresso'));
            modal.show();
        }
        
        // Função para confirmar envio do ingresso
        async function confirmarEnvioIngresso() {
            const form = document.getElementById('formEnviarIngresso');
            const formData = new FormData(form);
            
            // Validar campos obrigatórios
            const nome = formData.get('nome').trim();
            const email = formData.get('email').trim();
            
            if (!nome || !email) {
                alert('Por favor, preencha os campos obrigatórios (Nome e E-mail)');
                return;
            }
            
            const ingressoId = formData.get('ingresso_id');
            const ingresso = ingressosIndividuais.find(i => i.id == ingressoId);
            
            // Preparar dados para webhook
            const dadosEnvio = {
                ingresso: {
                    id: ingresso.id,
                    codigo: ingresso.codigo_ingresso,
                    titulo: ingresso.titulo_ingresso,
                    preco: ingresso.preco_unitario,
                    status: ingresso.status
                },
                destinatario: {
                    nome: nome,
                    email: email,
                    whatsapp: formData.get('whatsapp').trim(),
                    mensagem: formData.get('mensagem').trim()
                },
                evento: {
                    id: <?php echo json_encode($pedido_data ? $pedido_data['eventoid'] : null); ?>
                },
                pedido: {
                    id: pedidoId,
                    codigo: <?php echo json_encode($pedido_data ? $pedido_data['codigo_pedido'] : null); ?>
                },
                remetente: {
                    nome: <?php echo json_encode($pedido_data ? $pedido_data['comprador_nome'] : null); ?>,
                    email: <?php echo json_encode($pedido_data ? $pedido_data['comprador_email'] : null); ?>
                }
            };
            
            try {
                // Desabilitar botão durante envio
                const btnEnviar = event.target;
                btnEnviar.disabled = true;
                btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Enviando...';
                
                console.log('Enviando dados:', dadosEnvio); // Debug
                
                const response = await fetch('api/enviar-ingresso.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dadosEnvio)
                });
                
                console.log('Response status:', response.status); // Debug
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                console.log('Result:', result); // Debug
                
                if (result.success) {
                    // Fechar modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEnviarIngresso'));
                    modal.hide();
                    
                    alert('Ingresso enviado com sucesso!');
                    
                    // Opcional: Recarregar página para atualizar status
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                    
                } else {
                    alert('Erro ao enviar ingresso: ' + result.message);
                    console.error('Erro do servidor:', result);
                }
                
            } catch (error) {
                console.error('Erro completo:', error);
                alert('Erro de conexão: ' + error.message + '\n\nVerifique o console para mais detalhes.');
            } finally {
                // Reabilitar botão
                btnEnviar.disabled = false;
                btnEnviar.innerHTML = '<i class="fas fa-paper-plane me-1"></i> Enviar Ingresso';
            }
        }
        
        // Função para visualizar ingresso individual
        function verIngresso(ingressoId) {
            // Abrir página de visualização do ingresso específico
            window.open(`api/ver-ingresso-individual.php?ingresso_id=${ingressoId}`, '_blank');
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
            <?php endif; ?>
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