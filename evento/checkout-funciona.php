<?php
session_start();
include("conm/conn.php");

// Verificar se existe um slug de evento na URL
$slug = isset($_GET['evento']) ? $_GET['evento'] : '';

if (empty($slug)) {
    header('Location: /');
    exit;
}

// Buscar dados do evento
$sql_evento = "
    SELECT 
        e.*,
        u.nome as nome_usuario,
        u.nome_exibicao,
        c.nome_fantasia,
        c.razao_social
    FROM eventos e
    LEFT JOIN usuarios u ON e.usuario_id = u.id
    LEFT JOIN contratantes c ON e.contratante_id = c.id
    WHERE e.slug = '$slug' AND e.status = 'publicado' AND e.visibilidade = 'publico'
    LIMIT 1
";

$result_evento = $con->query($sql_evento);

if ($result_evento->num_rows == 0) {
    header('Location: /');
    exit;
}

$evento = $result_evento->fetch_assoc();

// Nome do produtor para exibição
$nome_produtor_display = !empty($evento['nome_exibicao']) ? $evento['nome_exibicao'] : 
                        (!empty($evento['nome_fantasia']) ? $evento['nome_fantasia'] : $evento['nome_usuario']);

// Gerar ID único para a sessão de compra
if (!isset($_SESSION['checkout_session'])) {
    $_SESSION['checkout_session'] = uniqid('checkout_', true);
    $_SESSION['checkout_start_time'] = time();
}

$checkout_session = $_SESSION['checkout_session'];
$time_remaining = 15 * 60 - (time() - $_SESSION['checkout_start_time']); // 15 minutos em segundos

// Se o tempo expirou, limpar sessão
if ($time_remaining <= 0) {
    unset($_SESSION['checkout_session']);
    unset($_SESSION['checkout_start_time']);
    header('Location: /evento/' . $slug . '?expired=1');
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, shrink-to-fit=no">
    <title>Checkout - <?php echo htmlspecialchars($evento['nome']); ?></title>
    
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
        
        .checkout-header {
            background: white;
            border-bottom: 1px solid #e9ecef;
            padding: 1rem 0;
        }
        
        .step-indicator {
            display: flex;
            align-items: center;
            margin-bottom: 2rem;
        }
        
        .step {
            display: flex;
            align-items: center;
            flex: 1;
        }
        
        .step-number {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
            margin-right: 0.5rem;
        }
        
        .step.active .step-number {
            background: #007bff;
            color: white;
        }
        
        .step.completed .step-number {
            background: #28a745;
            color: white;
        }
        
        .step.inactive .step-number {
            background: #e9ecef;
            color: #6c757d;
        }
        
        .step-line {
            flex: 1;
            height: 2px;
            background: #e9ecef;
            margin: 0 1rem;
        }
        
        .step.completed + .step .step-line {
            background: #28a745;
        }
        
        .checkout-card {
            background: white;
            border-radius: 12px;
            border: 1px solid #e9ecef;
            margin-bottom: 1.5rem;
        }
        
        .checkout-card-header {
            padding: 1.5rem 1.5rem 0;
            border-bottom: none;
        }
        
        .checkout-card-body {
            padding: 0 1.5rem 1.5rem;
        }
        
        .form-control, .form-select {
            border-radius: 8px;
            border: 1px solid #dee2e6;
            padding: 0.75rem 1rem;
        }
        
        .form-control:focus, .form-select:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
        
        .login-option {
            border: 2px solid #e9ecef;
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .login-option:hover, .login-option.selected {
            border-color: #007bff;
            background-color: #f8f9ff;
        }
        
        .payment-option {
            border: 2px solid #e9ecef;
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .payment-option:hover {
            border-color: #007bff;
            background-color: #f8f9ff;
        }
        
        .payment-option.selected {
            border-color: #007bff;
            background-color: #f8f9ff;
        }
        
        .payment-icon {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            margin-right: 1rem;
        }
        
        .payment-icon.credit {
            background: #e3f2fd;
            color: #1976d2;
        }
        
        .payment-icon.pix {
            background: #e8f5e8;
            color: #2e7d32;
        }
        
        .payment-icon.boleto {
            background: #fff3e0;
            color: #f57c00;
        }
        
        .summary-card {
            background: white;
            border-radius: 12px;
            border: 1px solid #e9ecef;
            position: sticky;
            top: 2rem;
        }
        
        .event-thumb {
            width: 80px;
            height: 60px;
            border-radius: 8px;
            object-fit: cover;
        }
        
        .timer-badge {
            background: #dc3545;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9rem;
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
        
        .installment-option {
            padding: 0.75rem;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .installment-option:hover {
            border-color: #007bff;
            background-color: #f8f9ff;
        }
        
        .installment-option.selected {
            border-color: #007bff;
            background-color: #f8f9ff;
        }
        
        .installment-option input[type="radio"] {
            margin-right: 0.5rem;
        }
        
        @media (max-width: 768px) {
            .step-indicator {
                flex-direction: column;
                gap: 1rem;
            }
            
            .step {
                width: 100%;
                justify-content: center;
            }
            
            .step-line {
                display: none;
            }
            
            .summary-card {
                position: static;
                margin-top: 2rem;
            }
        }
    </style>
</head>

<body>
    <!-- Header -->
    <div class="checkout-header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <a href="/evento/<?php echo $slug; ?>" class="text-decoration-none">
                        <img src="img/anysummitlogo.png" style="max-width: 150px;">
                    </a>
                </div>
                <div class="col-md-6 text-end">
                    <div class="timer-badge">
                        <i class="fas fa-clock me-2"></i>
                        <span id="timer">15:00</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container my-4">
        <div class="row">
            <!-- Formulário Principal -->
            <div class="col-lg-8">
                <!-- Indicador de Passos -->
                <div class="step-indicator">
                    <div class="step active" id="step-1">
                        <div class="step-number">1</div>
                        <span>Dados do Participante</span>
                    </div>
                    <div class="step-line"></div>
                    <div class="step inactive" id="step-2">
                        <div class="step-number">2</div>
                        <span>Pagamento e dados do comprador</span>
                    </div>
                </div>

                <!-- Passo 1: Dados do Participante -->
                <div class="checkout-card" id="participante-section">
                    <div class="checkout-card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-user text-primary me-2"></i>
                            Recebimento do ingresso
                        </h5>
                    </div>
                    <div class="checkout-card-body">
                        <?php 
                        $participante_logado = isset($_COOKIE['participanteid']) && !empty($_COOKIE['participanteid']);
                        if ($participante_logado): 
                            // Buscar dados do participante logado
                            $participante_id = $_COOKIE['participanteid'];
                            $sql_participante = "SELECT Nome, email FROM participantes WHERE participanteid = '$participante_id'";
                            $result_participante = $con->query($sql_participante);
                            $participante_dados = $result_participante->fetch_assoc();
                        ?>
                        <!-- Participante logado -->
                        <div class="login-option selected" data-login="logged">
                            <div class="d-flex align-items-center justify-content-between">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-user text-primary me-2"></i>
                                    <span>Continuar como <?php echo htmlspecialchars($participante_dados['Nome']); ?></span>
                                </div>
                                <input type="radio" name="login_method" value="logged" checked class="form-check-input">
                            </div>
                        </div>

                        <div class="login-option" onClick="deslogar()" data-login="logout">
                            <div class="d-flex align-items-center justify-content-between">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-sign-out-alt text-danger me-2"></i>
                                    <span>Deslogar</span>
                                </div>
                                <i class="fas fa-external-link-alt"></i>
                            </div>
                        </div>
                        <?php else: ?>
                        <!-- Não logado -->
                        <div class="login-option" onClick="toggleLoginOption('login')" data-login="login">
                            <div class="d-flex align-items-center justify-content-between">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-sign-in-alt text-primary me-2"></i>
                                    <span>Realizar login</span>
                                </div>
                                <input type="radio" name="login_method" value="login" class="form-check-input">
                            </div>
                        </div>

                        <!-- Formulário de login (oculto inicialmente) -->
                        <div id="login-form" style="display: none;  
    padding: 15px;
    background: #f3f3f3;
    border-radius: 10px;
    border: 1px solid #d7d7d7;
    margin-bottom: 10px;"  >
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="mb-0">Fazer Login</h6>
                                <button type="button" class="btn btn-sm btn-outline-secondary" onClick="closeLogin()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <form id="login-participante-form">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="login_email" class="form-label">E-mail *</label>
                                        <input type="email" class="form-control" id="login_email" name="login_email" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="login_senha" class="form-label">Senha *</label>
                                        <input type="password" class="form-control" id="login_senha" name="login_senha" required>
                                    </div>
                                </div>
                                <div class="text-end">
                                    <button type="button" class="btn btn-sm btn-primary" onClick="realizarLogin()">
                                        <i class="fas fa-sign-in-alt me-2"></i>Entrar
                                    </button>
                                </div>
                            </form>
                        </div>
                        <?php endif; ?>

                        <!-- Formulário de cadastro (sempre visível) -->
                        <div id="manual-form">
                            <form id="participante-form">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="nome" class="form-label">Nome *</label>
                                        <input type="text" class="form-control" id="nome" name="nome" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="sobrenome" class="form-label">Sobrenome *</label>
                                        <input type="text" class="form-control" id="sobrenome" name="sobrenome" required>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="email" class="form-label">E-mail *</label>
                                        <input type="email" class="form-control" id="email" name="email" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="confirmacao_email" class="form-label">Confirmação do e-mail *</label>
                                        <input type="email" class="form-control" id="confirmacao_email" name="confirmacao_email" required>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="whatsapp" class="form-label">WhatsApp *</label>
                                        <input type="tel" class="form-control" id="whatsapp" name="whatsapp" required>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div class="text-muted mt-3">
                            <small>Os ingressos serão enviados por e-mail assim que recebermos a confirmação do pagamento.</small>
                        </div>

                        <div class="text-end mt-4">
                            <button type="button" class="btn btn-primary-gradient" onClick="nextStep()">
                                Próximo <i class="fas fa-arrow-right ms-2"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Passo 2: Pagamento e dados do comprador -->
                <div class="checkout-card" id="pagamento-section" style="display: none;">
                    <div class="checkout-card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-credit-card text-primary me-2"></i>
                            Pagamento e dados do comprador
                        </h5>
                        <small class="text-muted">Dados para confirmação da contratação do Pedido Protegido</small>
                    </div>
                    <div class="checkout-card-body">
                        <!-- Dados do Comprador -->
                        <form id="comprador-form">
                            <div class="row">
                                <div class="col-md-8 mb-3">
                                    <label for="nome_completo" class="form-label">Nome completo / Razão Social *</label>
                                    <input type="text" class="form-control" id="nome_completo" name="nome_completo" required>
                                    <small class="text-muted">41 caracteres restantes</small>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label for="tipo_documento" class="form-label">Tipo de documento *</label>
                                    <select class="form-select" id="tipo_documento" name="tipo_documento" required onChange="toggleDocumentField()">
                                        <option value="CPF">CPF</option>
                                        <option value="CNPJ">CNPJ</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="documento" class="form-label">CPF / CNPJ *</label>
                                    <input type="text" class="form-control" id="documento" name="documento" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="cep" class="form-label">CEP *</label>
                                    <input type="text" class="form-control" id="cep" name="cep" required onBlur="buscarCEP()">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-8 mb-3">
                                    <label for="endereco" class="form-label">Endereço *</label>
                                    <input type="text" class="form-control" id="endereco" name="endereco" required>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label for="numero" class="form-label">Número *</label>
                                    <input type="text" class="form-control" id="numero" name="numero" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <label for="complemento" class="form-label">Complemento</label>
                                    <input type="text" class="form-control" id="complemento" name="complemento">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label for="bairro" class="form-label">Bairro *</label>
                                    <input type="text" class="form-control" id="bairro" name="bairro" required>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label for="cidade" class="form-label">Cidade *</label>
                                    <input type="text" class="form-control" id="cidade" name="cidade" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="estado" class="form-label">Estado *</label>
                                    <select class="form-select" id="estado" name="estado" required>
                                        <option value="">Selecione</option>
                                        <option value="AC">Acre</option>
                                        <option value="AL">Alagoas</option>
                                        <option value="AP">Amapá</option>
                                        <option value="AM">Amazonas</option>
                                        <option value="BA">Bahia</option>
                                        <option value="CE">Ceará</option>
                                        <option value="DF">Distrito Federal</option>
                                        <option value="ES">Espírito Santo</option>
                                        <option value="GO">Goiás</option>
                                        <option value="MA">Maranhão</option>
                                        <option value="MT">Mato Grosso</option>
                                        <option value="MS">Mato Grosso do Sul</option>
                                        <option value="MG">Minas Gerais</option>
                                        <option value="PA">Pará</option>
                                        <option value="PB">Paraíba</option>
                                        <option value="PR">Paraná</option>
                                        <option value="PE">Pernambuco</option>
                                        <option value="PI">Piauí</option>
                                        <option value="RJ">Rio de Janeiro</option>
                                        <option value="RN">Rio Grande do Norte</option>
                                        <option value="RS">Rio Grande do Sul</option>
                                        <option value="RO">Rondônia</option>
                                        <option value="RR">Roraima</option>
                                        <option value="SC">Santa Catarina</option>
                                        <option value="SP">São Paulo</option>
                                        <option value="SE">Sergipe</option>
                                        <option value="TO">Tocantins</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="telefone" class="form-label">Telefone</label>
                                    <input type="tel" class="form-control" id="telefone" name="telefone">
                                </div>
                            </div>
                        </form>

                        <hr class="my-4">

                        <!-- Informações de pagamento -->
                        <h6 class="mb-3">Informações de pagamento</h6>
                        
                        <!-- Opções de Pagamento -->
                        <div class="payment-options mb-4">
                            <div class="payment-option" data-payment="credit" onClick="selectPayment('credit')">
                                <div class="d-flex align-items-center">
                                    <div class="payment-icon credit">
                                        <i class="fas fa-credit-card fa-lg"></i>
                                    </div>
                                    <div>
                                        <h6 class="mb-1">Cartão de crédito</h6>
                                        <small class="text-muted">Parcele em até 12x</small>
                                    </div>
                                    <div class="ms-auto">
                                        <input type="radio" name="payment_method" value="credit" class="form-check-input">
                                    </div>
                                </div>
                            </div>

                            <div class="payment-option" data-payment="pix" onClick="selectPayment('pix')">
                                <div class="d-flex align-items-center">
                                    <div class="payment-icon pix">
                                        <i class="fab fa-pix fa-lg"></i>
                                    </div>
                                    <div>
                                        <h6 class="mb-1">Pix</h6>
                                        <small class="text-muted">À vista</small>
                                    </div>
                                    <div class="ms-auto">
                                        <input type="radio" name="payment_method" value="pix" class="form-check-input">
                                    </div>
                                </div>
                            </div>

                           

                            <div class="payment-option" data-payment="ifood" onClick="selectPayment('ifood')">
                                <div class="d-flex align-items-center">
                                    <div class="payment-icon" style="background: #e3f2fd; color: #000000;">
                                        <i class="fas fa-barcode"></i>
                                    </div>
                                    <div>
                                        <h6 class="mb-1">Boleto</h6>
                                        <small class="text-muted">À vista</small>
                                    </div>
                                    <div class="ms-auto">
                                        <input type="radio" name="payment_method" value="ifood" class="form-check-input">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Detalhes do Cartão -->
                        <div id="credit-details" style="display: none;">
                            <h6 class="mb-3">Adicione seu cartão</h6>
                            <div class="mb-3">
                                <label class="form-label">Cartão emitido no Brasil? *</label>
                                <div>
                                    <input type="radio" name="card_country" value="sim" checked class="form-check-input me-2"> Sim
                                    <input type="radio" name="card_country" value="nao" class="form-check-input me-2 ms-3"> Não
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-12 mb-3">
                                    <label for="card_name" class="form-label">Nome impresso no cartão *</label>
                                    <input type="text" class="form-control" id="card_name" name="card_name">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="card_number" class="form-label">Número do cartão *</label>
                                    <input type="text" class="form-control" id="card_number" name="card_number" placeholder="0000 0000 0000 0000">
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label for="card_expiry" class="form-label">Data de validade *</label>
                                    <input type="text" class="form-control" id="card_expiry" name="card_expiry" placeholder="MM/AA">
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label for="card_cvv" class="form-label">Código de segurança *</label>
                                    <input type="text" class="form-control" id="card_cvv" name="card_cvv" placeholder="000">
                                </div>
                            </div>

                            <!-- Parcelamento -->
                            <div class="mb-3">
                                <label class="form-label">Parcelamento</label>
                                <p class="small text-muted">Compre em até 12 vezes <i class="fas fa-info-circle" data-bs-toggle="tooltip" title="Veja as condições de parcelamento"></i></p>
                                <div id="installments-list">
                                    <!-- Será preenchido via JavaScript -->
                                </div>
                            </div>
                        </div>

                        <!-- Detalhes do PIX -->
                        <div id="pix-details" style="display: none;">
                            <div class="alert alert-info">
                                <h6><i class="fab fa-pix me-2"></i>Como pagar com PIX?</h6>
                                <p class="mb-0">Ao finalizar a compra, será gerado um QR Code de pagamento. Use o aplicativo do seu banco ou carteira digital para escanear e realizar o pagamento.</p>
                            </div>
                        </div>

                        <div class="text-end">
                            <button type="button" class="btn btn-outline-secondary me-2" onClick="prevStep()">
                                <i class="fas fa-arrow-left me-2"></i> Voltar
                            </button>
                            <button type="button" class="btn btn-primary-gradient" onClick="finalizePayment()">
                                <i class="fas fa-lock me-2"></i> Continuar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resumo da Compra -->
            <div class="col-lg-4">
                <div class="summary-card">
                    <div class="p-4">
                        <!-- Evento Info -->
                        <div class="d-flex align-items-center mb-3">
                            <?php if (!empty($evento['imagem_capa'])): ?>
                                <img src="/produtor/<?php echo htmlspecialchars($evento['imagem_capa']); ?>" alt="<?php echo htmlspecialchars($evento['nome']); ?>" class="event-thumb me-3">
                            <?php endif; ?>
                            <div>
                                <h6 class="mb-1"><?php echo htmlspecialchars($evento['nome']); ?></h6>
                                <small class="text-muted"><?php echo htmlspecialchars($nome_produtor_display); ?></small>
                            </div>
                        </div>

                        <hr>

                        <!-- Resumo dos Ingressos -->
                        <div id="summary-tickets">
                            <!-- Será preenchido via JavaScript -->
                        </div>

                        <!-- Pedido Protegido -->
                        <!--<div id="pedido-protegido" class="mt-3">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span>Pedido Protegido</span>
                                <span id="taxa-protecao">R$ 56,37</span>
                            </div>
                        </div>-->

                        <!-- Taxas -->
                        <!--<div id="taxas-resumo" class="mt-3">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span>Taxas <i class="fas fa-info-circle text-muted" data-bs-toggle="tooltip" title="Taxas de processamento"></i></span>
                                <span id="valor-taxas">R$ 49,93</span>
                            </div>
                        </div>-->

                        <hr>

                        <!-- Totais -->
                        <div id="summary-totals">
                            <div class="d-flex justify-content-between fw-bold mb-2">
                                <span>Total</span>
                                <span id="valor-total">R$ 506,30</span>
                            </div>
                            <small class="text-muted">(1 item) (selecione a forma de pagamento)</small>
                        </div>

                        <!-- Políticas -->
                        <div class="mt-4">
                            <small class="text-muted">
                                Ao prosseguir, você declara estar ciente dos 
                                <a href="#" class="text-decoration-none">Termos e Políticas da Sympla</a> 
                                e das 
                                <a href="#" class="text-decoration-none">condições de pagamento</a> do pedido.
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- JavaScript do Checkout -->
    <script>
        let currentStep = 1;
        let carrinho = null;
        let timeRemaining = <?php echo $time_remaining; ?>;

        // Recuperar dados do carrinho
        document.addEventListener('DOMContentLoaded', function() {
            const carrinhoData = sessionStorage.getItem('carrinho');
            if (!carrinhoData) {
                alert('Sessão expirada. Redirecionando...');
                window.location.href = '/evento/<?php echo $slug; ?>';
                return;
            }

            carrinho = JSON.parse(carrinhoData);
            renderSummary();
            startTimer();
        });

        // Timer countdown
        function startTimer() {
            const timerElement = document.getElementById('timer');
            
            const interval = setInterval(() => {
                const minutes = Math.floor(timeRemaining / 60);
                const seconds = timeRemaining % 60;
                
                timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                if (timeRemaining <= 0) {
                    clearInterval(interval);
                    alert('Tempo esgotado! Redirecionando...');
                    window.location.href = '/evento/<?php echo $slug; ?>';
                    return;
                }
                
                timeRemaining--;
            }, 1000);
        }

        // Renderizar resumo
        function renderSummary() {
            if (!carrinho) return;

            const ticketsHtml = carrinho.ingressos.map(ingresso => `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <div class="fw-semibold">${ingresso.nome}</div>
                        <small class="text-muted">Qtd: ${ingresso.quantidade}</small>
                        <div class="text-muted small">(R$ ${formatPrice(ingresso.preco)} cada)</div>
                    </div>
                    <div class="text-end">
                        <div>R$ ${formatPrice(ingresso.subtotal)}</div>
                    </div>
                </div>
            `).join('');

            document.getElementById('summary-tickets').innerHTML = ticketsHtml;

            // Atualizar valores no resumo
            const subtotal = carrinho.subtotal;
            //const taxa = subtotal * 0.12; // 12% de taxa
            //const protecao = subtotal * 0.10; // 10% pedido protegido
            const total = subtotal 

           // document.getElementById('taxa-protecao').textContent = 'R$ ' + formatPrice(protecao);
            //document.getElementById('valor-taxas').textContent = 'R$ ' + formatPrice(taxa);
            document.getElementById('valor-total').textContent = 'R$ ' + formatPrice(total);
        }

        // Utilitários
        function formatPrice(price) {
            return price.toFixed(2).replace('.', ',');
        }

        // Buscar CEP automaticamente
        async function buscarCEP() {
            const cep = document.getElementById('cep').value.replace(/\D/g, '');
            
            if (cep.length === 8) {
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();
                    
                    if (!data.erro) {
                        document.getElementById('endereco').value = data.logradouro || '';
                        document.getElementById('bairro').value = data.bairro || '';
                        document.getElementById('cidade').value = data.localidade || '';
                        document.getElementById('estado').value = data.uf || '';
                        
                        // Focar no campo número
                        document.getElementById('numero').focus();
                    }
                } catch (error) {
                    console.log('Erro ao buscar CEP:', error);
                }
            }
        }

        // Função para deslogar
        function deslogar() {
            if (confirm('Deseja realmente sair da sua conta?')) {
                // Limpar cookies
                document.cookie = 'participanteid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'participantenome=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                
                // Recarregar página
                location.reload();
            }
        }

        // Toggle entre opções de login
        function toggleLoginOption(option) {
            // Remove seleção de todas as opções
            document.querySelectorAll('.login-option').forEach(opt => {
                opt.classList.remove('selected');
            });

            // Adiciona seleção à opção clicada
            document.querySelector(`[data-login="${option}"]`).classList.add('selected');
            
            // Marca o radio button se existir
            const radioButton = document.querySelector(`input[value="${option}"]`);
            if (radioButton) {
                radioButton.checked = true;
            }

            // Mostra/esconde formulário de login
            const loginForm = document.getElementById('login-form');
            if (option === 'login') {
                loginForm.style.display = 'block';
            } else {
                loginForm.style.display = 'none';
                // Limpar campos de login quando sair
                document.getElementById('login_email').value = '';
                document.getElementById('login_senha').value = '';
            }
        }

        // Fechar formulário de login
        function closeLogin() {
            // Ocultar formulário de login
            document.getElementById('login-form').style.display = 'none';
            
            // Limpar campos de login
            document.getElementById('login_email').value = '';
            document.getElementById('login_senha').value = '';
            
            // Remover seleção de todas as opções
            document.querySelectorAll('.login-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Não seleciona nenhum radio (usuário pode escolher preencher manualmente)
            document.querySelectorAll('input[name="login_method"]').forEach(radio => {
                radio.checked = false;
            });
        }

        // Realizar login
        async function realizarLogin() {
            const email = document.getElementById('login_email').value;
            const senha = document.getElementById('login_senha').value;

            if (!email || !senha) {
                alert('Por favor, preencha e-mail e senha.');
                return;
            }

            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Entrando...';
            btn.disabled = true;

            try {
                console.log('Tentando login com:', email);
                
                const response = await fetch('api/login-participante.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        senha: senha
                    })
                });

                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Login result:', result);

                if (result.success) {
                    // Login bem-sucedido, atualizar página
                    alert('Login realizado com sucesso! Recarregando página...');
                    location.reload();
                } else {
                    alert(result.message || 'E-mail ou senha incorretos.');
                }
            } catch (error) {
                console.error('Erro no login:', error);
                alert('Erro ao fazer login: ' + error.message);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }

        // Navegação entre passos
        function nextStep() {
            if (currentStep === 1) {
                if (!validateStep1()) return;
                
                // Ocultar seção 1 e mostrar seção 2
                document.getElementById('participante-section').style.display = 'none';
                document.getElementById('pagamento-section').style.display = 'block';
                
                // Atualizar indicadores
                updateStepIndicator(2);
                currentStep = 2;
            }
        }

        function prevStep() {
            if (currentStep === 2) {
                // Ocultar seção 2 e mostrar seção 1
                document.getElementById('pagamento-section').style.display = 'none';
                document.getElementById('participante-section').style.display = 'block';
                
                // Atualizar indicadores
                updateStepIndicator(1);
                currentStep = 1;
            }
        }

        function updateStepIndicator(activeStep) {
            for (let i = 1; i <= 2; i++) {
                const stepElement = document.getElementById(`step-${i}`);
                stepElement.classList.remove('active', 'completed', 'inactive');
                
                if (i < activeStep) {
                    stepElement.classList.add('completed');
                } else if (i === activeStep) {
                    stepElement.classList.add('active');
                } else {
                    stepElement.classList.add('inactive');
                }
            }
        }

        // Validações
        function validateStep1() {
            const loginMethodRadio = document.querySelector('input[name="login_method"]:checked');
            
            // Se há participante logado, pode prosseguir
            const participanteLogado = <?php echo json_encode($participante_logado); ?>;
            if (participanteLogado && (!loginMethodRadio || loginMethodRadio.value === 'logged')) {
                return true;
            }
            
            // Se nenhuma opção foi selecionada, validar dados manuais
            if (!loginMethodRadio) {
                return validateManualForm();
            }
            
            const loginMethod = loginMethodRadio.value;
            
            if (loginMethod === 'login') {
                // Se escolheu fazer login, validar se campos estão preenchidos
                const loginEmail = document.getElementById('login_email').value;
                const loginSenha = document.getElementById('login_senha').value;
                
                if (!loginEmail || !loginSenha) {
                    alert('Por favor, faça o login ou feche para preencher os dados manuais.');
                    return false;
                }
                
                return true;
                
            } else {
                // Fallback: validar formulário manual
                return validateManualForm();
            }
        }

        function validateManualForm() {
            const form = document.getElementById('participante-form');
            const formData = new FormData(form);
            
            for (let [key, value] of formData.entries()) {
                if (!value.trim()) {
                    alert('Por favor, preencha todos os campos obrigatórios.');
                    return false;
                }
            }

            const email = formData.get('email');
            const confirmEmail = formData.get('confirmacao_email');
            
            if (email !== confirmEmail) {
                alert('Os e-mails não conferem.');
                return false;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor, insira um e-mail válido.');
                return false;
            }

            const whatsapp = formData.get('whatsapp');
            if (whatsapp.replace(/\D/g, '').length < 10) {
                alert('Por favor, insira um WhatsApp válido.');
                return false;
            }
            
            return true;
        }

        function validateStep2() {
            console.log('Validando Step 2...');
            
            // Verificar campos obrigatórios específicos (não o telefone que é opcional)
            const camposObrigatorios = [
                { id: 'nome_completo', nome: 'Nome completo' },
                { id: 'tipo_documento', nome: 'Tipo de documento' },
                { id: 'documento', nome: 'CPF/CNPJ' },
                { id: 'cep', nome: 'CEP' },
                { id: 'endereco', nome: 'Endereço' },
                { id: 'numero', nome: 'Número' },
                { id: 'bairro', nome: 'Bairro' },
                { id: 'cidade', nome: 'Cidade' },
                { id: 'estado', nome: 'Estado' }
            ];
            
            const camposFaltando = [];
            
            for (let campo of camposObrigatorios) {
                const elemento = document.getElementById(campo.id);
                if (!elemento) {
                    console.error('Elemento não encontrado:', campo.id);
                    camposFaltando.push(campo.nome + ' (campo não encontrado)');
                    continue;
                }
                
                const valor = elemento.value;
                console.log(`Campo ${campo.id}:`, valor);
                
                if (!valor || !valor.trim()) {
                    camposFaltando.push(campo.nome);
                }
            }
            
            if (camposFaltando.length > 0) {
                console.log('Campos obrigatórios faltando:', camposFaltando);
                alert('Por favor, preencha todos os campos obrigatórios:\n• ' + camposFaltando.join('\n• '));
                return false;
            }

            const paymentMethod = document.querySelector('input[name="payment_method"]:checked');
            
            if (!paymentMethod) {
                alert('Selecione uma forma de pagamento.');
                return false;
            }

            if (paymentMethod.value === 'credit' && !validateCreditCard()) {
                return false;
            }

            console.log('Step 2 validado com sucesso');
            return true;
        }

        // Seleção de pagamento
        function selectPayment(method) {
            // Remove seleção anterior
            document.querySelectorAll('.payment-option').forEach(option => {
                option.classList.remove('selected');
            });

            // Adiciona seleção atual
            document.querySelector(`[data-payment="${method}"]`).classList.add('selected');
            
            // Marca o radio button
            document.querySelector(`input[value="${method}"]`).checked = true;

            // Mostra/esconde detalhes
            document.getElementById('credit-details').style.display = method === 'credit' ? 'block' : 'none';
            document.getElementById('pix-details').style.display = method === 'pix' ? 'block' : 'none';
            
            // Gerar parcelamento se for cartão
            if (method === 'credit') {
                generateInstallments();
            }
        }

        // Gerar opções de parcelamento
        function generateInstallments() {
            if (!carrinho) return;

            const subtotal = carrinho.subtotal;
            //const taxa = subtotal * 0.12;
            //const protecao = subtotal * 0.10;
            const total = subtotal;
            
            const installmentsList = document.getElementById('installments-list');
            let html = '';

            for (let i = 1; i <= 12; i++) {
                const installmentValue = total / i;
                const isSelected = i === 6 ? 'selected' : ''; // 6x selecionado como padrão
                
                html += `
                    <div class="installment-option ${isSelected}" onclick="selectInstallment(this, ${i})">
                        <input type="radio" name="installments" value="${i}" ${i === 6 ? 'checked' : ''}>
                        <strong>${i}x</strong> de <strong>R$ ${formatPrice(installmentValue)}</strong>
                        ${i === 1 ? ' à vista' : ` R$ ${formatPrice(total)}`}
                        ${i <= 6 ? ' sem juros' : ' com juros'}
                    </div>
                `;
            }

            installmentsList.innerHTML = html;
        }

        function selectInstallment(element, installments) {
            document.querySelectorAll('.installment-option').forEach(option => {
                option.classList.remove('selected');
            });
            element.classList.add('selected');
            element.querySelector('input').checked = true;
        }

        // Toggle tipo de documento
        function toggleDocumentField() {
            const tipoDoc = document.getElementById('tipo_documento').value;
            const documentoField = document.getElementById('documento');
            
            if (tipoDoc === 'CPF') {
                documentoField.placeholder = '000.000.000-00';
                documentoField.maxLength = 14;
            } else if (tipoDoc === 'CNPJ') {
                documentoField.placeholder = '00.000.000/0000-00';
                documentoField.maxLength = 18;
            }
        }

        // Máscaras para campos
        document.addEventListener('DOMContentLoaded', function() {
            // Máscara para WhatsApp
            const whatsappField = document.getElementById('whatsapp');
            whatsappField.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                }
                e.target.value = value;
            });

            // Máscara para telefone
            const telefoneField = document.getElementById('telefone');
            if (telefoneField) {
                telefoneField.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 11) {
                        if (value.length === 11) {
                            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                        } else {
                            value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                        }
                    }
                    e.target.value = value;
                });
            }

            // Máscara para CEP
            const cepField = document.getElementById('cep');
            cepField.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 8) {
                    value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
                }
                e.target.value = value;
            });

            // Máscara para cartão
            const cardNumberField = document.getElementById('card_number');
            if (cardNumberField) {
                cardNumberField.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                    e.target.value = value;
                });
            }

            // Máscara para data de validade
            const cardExpiryField = document.getElementById('card_expiry');
            if (cardExpiryField) {
                cardExpiryField.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                        value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    }
                    e.target.value = value;
                });
            }

            // Máscara para CVV
            const cardCvvField = document.getElementById('card_cvv');
            if (cardCvvField) {
                cardCvvField.addEventListener('input', function(e) {
                    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
                });
            }

            // Máscara para documento
            const documentoField = document.getElementById('documento');
            documentoField.addEventListener('input', function(e) {
                const tipoDoc = document.getElementById('tipo_documento').value;
                let value = e.target.value.replace(/\D/g, '');
                
                if (tipoDoc === 'CPF') {
                    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                } else if (tipoDoc === 'CNPJ') {
                    value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                }
                
                e.target.value = value;
            });
        });

        // Finalizar pagamento
        async function finalizePayment() {
            if (!validateStep2()) return;

            const paymentMethod = document.querySelector('input[name="payment_method"]:checked');
            
            // Coletar todos os dados
            const loginMethodRadio = document.querySelector('input[name="login_method"]:checked');
            let participanteData = {};
            
            if (!loginMethodRadio) {
                // Nenhuma opção selecionada, usar dados manuais
                participanteData = Object.fromEntries(new FormData(document.getElementById('participante-form')));
                participanteData.metodo_dados = 'manual';
            } else {
                const loginMethod = loginMethodRadio.value;
                
                if (loginMethod === 'logged') {
                    // Usar dados do participante logado (já no cookie)
                    participanteData = {
                        participante_id: '<?php echo isset($_COOKIE["participanteid"]) ? $_COOKIE["participanteid"] : ""; ?>',
                        metodo_dados: 'logged'
                    };
                } else if (loginMethod === 'login') {
                    // Usar dados do login feito
                    participanteData = {
                        email: document.getElementById('login_email').value,
                        metodo_dados: 'login'
                    };
                } else {
                    // Usar dados do formulário manual
                    participanteData = Object.fromEntries(new FormData(document.getElementById('participante-form')));
                    participanteData.metodo_dados = 'manual';
                }
            }
            
            const compradorData = Object.fromEntries(new FormData(document.getElementById('comprador-form')));
            
            console.log('=== DEBUG FINALIZAR PAGAMENTO ===');
            console.log('Participante Data:', participanteData);
            console.log('Comprador Data:', compradorData);
            console.log('Payment Method:', paymentMethod.value);
            
            const pedidoData = {
                carrinho: carrinho,
                participante: participanteData,
                comprador: compradorData,
                pagamento: {
                    metodo: paymentMethod.value,
                    parcelas: paymentMethod.value === 'credit' ? 
                        document.querySelector('input[name="installments"]:checked').value : 1
                }
            };

            // Processar pedido no backend
            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Processando...';
            btn.disabled = true;

            try {
                console.log('Enviando pedido:', pedidoData);
                
                const response = await fetch('api/processar-pedido.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(pedidoData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Resultado do pedido:', result);

                if (result.success) {
                    // Salvar dados do pedido para as próximas páginas
                    sessionStorage.setItem('pedido_criado', JSON.stringify(result.pedido));
                    
                    // Salvar dados do comprador para as próximas páginas
                    sessionStorage.setItem('comprador_data', JSON.stringify(compradorData));
                    
                    // Se for cartão de crédito, processar pagamento imediatamente
                    if (paymentMethod.value === 'credit') {
                        await processarPagamentoCartao(result.pedido, compradorData, participanteData);
                    } else if (paymentMethod.value === 'pix') {
                        // Para PIX, redirecionar para página específica
                        window.location.href = 'evento/pag-pix/' + encodeURIComponent('<?php echo $slug; ?>');
                    } else {
                        // Para outros métodos, redirecionar diretamente
                        window.location.href = 'pagamento-boleto.php?evento=' + encodeURIComponent('<?php echo $slug; ?>');
                    }
                } else {
                    alert('Erro ao processar pedido: ' + result.message);
                }
                
            } catch (error) {
                console.error('Erro ao processar pedido:', error);
                alert('Erro ao processar pedido: ' + error.message);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }

        // Processar pagamento com cartão de crédito
        async function processarPagamentoCartao(pedido, comprador, participante) {
            try {
                console.log('=== PROCESSANDO PAGAMENTO CARTÃO ===');
                console.log('Pedido recebido:', pedido);
                console.log('Comprador recebido:', comprador);
                console.log('Participante recebido:', participante);
                
                // Coletar dados do cartão
                const cartaoData = {
                    nome: document.getElementById('card_name').value,
                    numero: document.getElementById('card_number').value,
                    mes: document.getElementById('card_expiry').value.split('/')[0],
                    ano: '20' + document.getElementById('card_expiry').value.split('/')[1],
                    cvv: document.getElementById('card_cvv').value
                };
                
                console.log('Dados do cartão coletados:', cartaoData);
                
                // Preparar dados do comprador para o Asaas
                const compradorAsaas = {
                    nome_completo: comprador.nome_completo,
                    documento: comprador.documento,
                    cep: comprador.cep,
                    endereco: comprador.endereco || '',
                    numero: comprador.numero || '1',
                    complemento: comprador.complemento || '',
                    bairro: comprador.bairro || '',
                    cidade: comprador.cidade || '',
                    estado: comprador.estado || '',
                    telefone: comprador.telefone || '',
                    email: participante.metodo_dados === 'manual' ? participante.email : 
                           participante.metodo_dados === 'login' ? participante.email : '',
                    whatsapp: participante.metodo_dados === 'manual' ? participante.whatsapp : ''
                };
                
                console.log('Comprador para Asaas:', compradorAsaas);
                
                // Verificar campos obrigatórios
                const camposObrigatorios = ['nome_completo', 'documento', 'cep', 'endereco', 'numero', 'bairro', 'cidade', 'estado'];
                const camposFaltando = camposObrigatorios.filter(campo => !compradorAsaas[campo] || !compradorAsaas[campo].toString().trim());
                
                if (camposFaltando.length > 0) {
                    console.error('Campos obrigatórios faltando para Asaas:', camposFaltando);
                    alert('Dados incompletos para pagamento. Campos faltando: ' + camposFaltando.join(', '));
                    return;
                }
                
                // Adicionar dados do evento
                const pedidoCompleto = {
                    ...pedido,
                    evento_nome: carrinho.evento.nome,
                    parcelas: document.querySelector('input[name="installments"]:checked').value
                };
                
                const pagamentoData = {
                    pedido: pedidoCompleto,
                    cartao: cartaoData,
                    comprador: compradorAsaas
                };
                
                console.log('Dados completos para envio:', pagamentoData);
                
                const response = await fetch('api/pagamento-cartao.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(pagamentoData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Resultado pagamento cartão:', result);

                if (result.success) {
                    // Salvar dados do pagamento
                    sessionStorage.setItem('pagamento_resultado', JSON.stringify(result));
                    
                    // Redirecionar para página de sucesso
                    window.location.href = 'pagamento-sucesso.php';
                } else {
                    alert('Erro no pagamento: ' + result.message);
                }
                
            } catch (error) {
                console.error('Erro ao processar pagamento cartão:', error);
                alert('Erro ao processar pagamento: ' + error.message);
            }
        }

        function validateCreditCard() {
            const cardName = document.getElementById('card_name').value;
            const cardNumber = document.getElementById('card_number').value;
            const cardExpiry = document.getElementById('card_expiry').value;
            const cardCvv = document.getElementById('card_cvv').value;

            if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
                alert('Preencha todos os dados do cartão.');
                return false;
            }

            // Validações básicas
            if (cardNumber.replace(/\s/g, '').length < 16) {
                alert('Número do cartão inválido.');
                return false;
            }

            if (cardCvv.length < 3) {
                alert('CVV inválido.');
                return false;
            }

            return true;
        }
    </script>
</body>
</html>