<?php
// Habilitar exibição de erros para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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

// Verificar se há comprador logado nos cookies
$comprador_logado = isset($_COOKIE['compradorid']) && !empty($_COOKIE['compradorid']);
$comprador_dados = null;

if ($comprador_logado) {
    $comprador_id = $_COOKIE['compradorid'];
    $sql_comprador = "SELECT * FROM compradores WHERE id = '$comprador_id'";
    $result_comprador = $con->query($sql_comprador);
    if ($result_comprador && $result_comprador->num_rows > 0) {
        $comprador_dados = $result_comprador->fetch_assoc();
    } else {
        // Se não encontrou o comprador, considerar como não logado
        $comprador_logado = false;
        $comprador_dados = null;
        // Limpar cookies inválidos
        setcookie('compradorid', '', time() - 3600, '/');
        setcookie('compradornome', '', time() - 3600, '/');
    }
}

// Função helper para acessar dados do comprador de forma segura
function getCompradorData($field, $default = '') {
    global $comprador_logado, $comprador_dados;
    return ($comprador_logado && isset($comprador_dados[$field])) ? $comprador_dados[$field] : $default;
}

// Função helper para verificar se campo está selecionado
function isCompradorFieldSelected($field, $value) {
    global $comprador_logado, $comprador_dados;
    return ($comprador_logado && isset($comprador_dados[$field]) && $comprador_dados[$field] == $value) ? 'selected' : '';
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
            .summary-card {
                position: static;
                margin-top: 2rem;
            }
        }
        
        /* Efeito de loading para CEP */
        .loading {
            position: relative;
        }
        
        .loading::after {
            content: '';
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: translateY(-50%) rotate(0deg); }
            100% { transform: translateY(-50%) rotate(360deg); }
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
                        <img src="img/anysummitlogo.png" style="max-width: 150px;" alt="AnySummit">
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
                <div class="checkout-card">
                    <div class="checkout-card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-credit-card text-primary me-2"></i>
                            Pagamento e dados do comprador
                        </h5>
                        <small class="text-muted">Complete os dados abaixo para finalizar sua compra</small>
                    </div>
                    <div class="checkout-card-body">
                        <!-- Login de Comprador -->
                        <?php if ($comprador_logado && $comprador_dados): ?>
                        <!-- Comprador logado -->
                        <div class="alert alert-success">
                            <div class="d-flex align-items-center justify-content-between">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-user-check text-success me-2"></i>
                                    <span><strong>Logado como:</strong> <?php echo htmlspecialchars(getCompradorData('nome', 'Usuário')); ?></span>
                                </div>
                                <button type="button" class="btn btn-sm btn-outline-danger" onClick="deslogarComprador()">
                                    <i class="fas fa-sign-out-alt me-1"></i>Sair
                                </button>
                            </div>
                        </div>
                        <?php else: ?>
                        <!-- Opções de login ou cadastro -->
                        <div class="mb-4">
                            <h6 class="mb-3">Você já tem cadastro?</h6>
                            
                            <div class="login-option" onClick="toggleLoginOption('login')" data-login="login">
                                <div class="d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center">
                                        <i class="fas fa-sign-in-alt text-primary me-2"></i>
                                        <span>Já tenho cadastro - fazer login</span>
                                    </div>
                                    <input type="radio" name="comprador_method" value="login" class="form-check-input">
                                </div>
                            </div>

                            <div class="login-option" onClick="toggleLoginOption('cadastro')" data-login="cadastro">
                                <div class="d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center">
                                        <i class="fas fa-user-plus text-success me-2"></i>
                                        <span>Não tenho cadastro - preencher dados</span>
                                    </div>
                                    <input type="radio" name="comprador_method" value="cadastro" class="form-check-input">
                                </div>
                            </div>

                            <!-- Formulário de login (oculto inicialmente) -->
                            <div id="comprador-login-form" style="display: none; padding: 15px; background: #f3f3f3; border-radius: 10px; border: 1px solid #d7d7d7; margin-top: 10px;">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6 class="mb-0">Login de Comprador</h6>
                                    <button type="button" class="btn btn-sm btn-outline-secondary" onClick="closeCompradorLogin()">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                                <form id="login-comprador-form">
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="comprador_login_email" class="form-label">E-mail *</label>
                                            <input type="email" class="form-control" id="comprador_login_email" name="comprador_login_email" required>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="comprador_login_senha" class="form-label">Senha *</label>
                                            <input type="password" class="form-control" id="comprador_login_senha" name="comprador_login_senha" required>
                                        </div>
                                    </div>
                                    <div class="text-end">
                                        <button type="button" class="btn btn-sm btn-primary" onClick="realizarLoginComprador()">
                                            <i class="fas fa-sign-in-alt me-2"></i>Entrar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <?php endif; ?>

                        <hr class="my-4">

                        <!-- Dados do Comprador Completo -->
                        <h6 class="mb-3">Dados do comprador</h6>
                        <form id="comprador-form">
                            <div class="row">
                                <div class="col-md-8 mb-3">
                                    <label for="nome_completo" class="form-label">Nome completo / Razão Social *</label>
                                    <input type="text" class="form-control" id="nome_completo" name="nome_completo" required value="<?php echo htmlspecialchars(getCompradorData('nome')); ?>">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label for="tipo_documento" class="form-label">Tipo de documento *</label>
                                    <select class="form-select" id="tipo_documento" name="tipo_documento" required onChange="toggleDocumentField()">
                                        <option value="CPF" <?php echo isCompradorFieldSelected('tipo_documento', 'CPF'); ?>>CPF</option>
                                        <option value="CNPJ" <?php echo isCompradorFieldSelected('tipo_documento', 'CNPJ'); ?>>CNPJ</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="email" class="form-label">E-mail *</label>
                                    <input type="email" class="form-control" id="email" name="email" required value="<?php echo htmlspecialchars(getCompradorData('email')); ?>">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="whatsapp" class="form-label">WhatsApp *</label>
                                    <input type="tel" class="form-control" id="whatsapp" name="whatsapp" required value="<?php echo htmlspecialchars(getCompradorData('celular')); ?>">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="documento" class="form-label">CPF / CNPJ *</label>
                                    <input type="text" class="form-control" id="documento" name="documento" required value="<?php echo htmlspecialchars(getCompradorData('cpf') ?: getCompradorData('cnpj')); ?>">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="cep" class="form-label">CEP *</label>
                                    <input type="text" class="form-control" id="cep" name="cep" required onBlur="buscarCEP()" value="<?php echo htmlspecialchars(getCompradorData('cep')); ?>" placeholder="Digite o CEP para preencher o endereço">
                                </div>
                            </div>
                            
                            <!-- Campos de endereço - ocultos inicialmente -->
                            <div id="endereco-fields" style="display: <?php echo $comprador_logado ? 'block' : 'none'; ?>;">
                                <div class="row">
                                    <div class="col-md-8 mb-3">
                                        <label for="endereco" class="form-label">Endereço *</label>
                                        <input type="text" class="form-control" id="endereco" name="endereco" required value="<?php echo htmlspecialchars(getCompradorData('endereco')); ?>">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="numero" class="form-label">Número *</label>
                                        <input type="text" class="form-control" id="numero" name="numero" required value="<?php echo htmlspecialchars(getCompradorData('numero')); ?>" placeholder="Ex: 123">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="complemento" class="form-label">Complemento</label>
                                        <input type="text" class="form-control" id="complemento" name="complemento" value="<?php echo htmlspecialchars(getCompradorData('complemento')); ?>" placeholder="Apto, sala, etc.">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="bairro" class="form-label">Bairro *</label>
                                        <input type="text" class="form-control" id="bairro" name="bairro" required value="<?php echo htmlspecialchars(getCompradorData('bairro')); ?>">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="cidade" class="form-label">Cidade *</label>
                                        <input type="text" class="form-control" id="cidade" name="cidade" required value="<?php echo htmlspecialchars(getCompradorData('cidade')); ?>">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12 mb-3">
                                        <label for="estado" class="form-label">Estado *</label>
                                        <select class="form-select" id="estado" name="estado" required>
                                            <option value="">Selecione</option>
                                            <option value="AC" <?php echo isCompradorFieldSelected('estado', 'AC'); ?>>Acre</option>
                                            <option value="AL" <?php echo isCompradorFieldSelected('estado', 'AL'); ?>>Alagoas</option>
                                            <option value="AP" <?php echo isCompradorFieldSelected('estado', 'AP'); ?>>Amapá</option>
                                            <option value="AM" <?php echo isCompradorFieldSelected('estado', 'AM'); ?>>Amazonas</option>
                                            <option value="BA" <?php echo isCompradorFieldSelected('estado', 'BA'); ?>>Bahia</option>
                                            <option value="CE" <?php echo isCompradorFieldSelected('estado', 'CE'); ?>>Ceará</option>
                                            <option value="DF" <?php echo isCompradorFieldSelected('estado', 'DF'); ?>>Distrito Federal</option>
                                            <option value="ES" <?php echo isCompradorFieldSelected('estado', 'ES'); ?>>Espírito Santo</option>
                                            <option value="GO" <?php echo isCompradorFieldSelected('estado', 'GO'); ?>>Goiás</option>
                                            <option value="MA" <?php echo isCompradorFieldSelected('estado', 'MA'); ?>>Maranhão</option>
                                            <option value="MT" <?php echo isCompradorFieldSelected('estado', 'MT'); ?>>Mato Grosso</option>
                                            <option value="MS" <?php echo isCompradorFieldSelected('estado', 'MS'); ?>>Mato Grosso do Sul</option>
                                            <option value="MG" <?php echo isCompradorFieldSelected('estado', 'MG'); ?>>Minas Gerais</option>
                                            <option value="PA" <?php echo isCompradorFieldSelected('estado', 'PA'); ?>>Pará</option>
                                            <option value="PB" <?php echo isCompradorFieldSelected('estado', 'PB'); ?>>Paraíba</option>
                                            <option value="PR" <?php echo isCompradorFieldSelected('estado', 'PR'); ?>>Paraná</option>
                                            <option value="PE" <?php echo isCompradorFieldSelected('estado', 'PE'); ?>>Pernambuco</option>
                                            <option value="PI" <?php echo isCompradorFieldSelected('estado', 'PI'); ?>>Piauí</option>
                                            <option value="RJ" <?php echo isCompradorFieldSelected('estado', 'RJ'); ?>>Rio de Janeiro</option>
                                            <option value="RN" <?php echo isCompradorFieldSelected('estado', 'RN'); ?>>Rio Grande do Norte</option>
                                            <option value="RS" <?php echo isCompradorFieldSelected('estado', 'RS'); ?>>Rio Grande do Sul</option>
                                            <option value="RO" <?php echo isCompradorFieldSelected('estado', 'RO'); ?>>Rondônia</option>
                                            <option value="RR" <?php echo isCompradorFieldSelected('estado', 'RR'); ?>>Roraima</option>
                                            <option value="SC" <?php echo isCompradorFieldSelected('estado', 'SC'); ?>>Santa Catarina</option>
                                            <option value="SP" <?php echo isCompradorFieldSelected('estado', 'SP'); ?>>São Paulo</option>
                                            <option value="SE" <?php echo isCompradorFieldSelected('estado', 'SE'); ?>>Sergipe</option>
                                            <option value="TO" <?php echo isCompradorFieldSelected('estado', 'TO'); ?>>Tocantins</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <hr>

                        <!-- Pagamento -->
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
                                        <input type="radio" name="payment_method" value="credit" class="form-check-input"  >
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
                            <button type="button" class="btn btn-primary-gradient" onClick="finalizePayment()">
                                <i class="fas fa-lock me-2"></i> Finalizar Compra
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

                        <hr>

                        <!-- Totais -->
                        <div id="summary-totals">
                            <div class="d-flex justify-content-between fw-bold mb-2">
                                <span>Total</span>
                                <span id="valor-total">R$ 0,00</span>
                            </div>
                            <small class="text-muted">(selecione a forma de pagamento)</small>
                        </div>

                        <!-- Políticas -->
                        <div class="mt-4">
                            <small class="text-muted">
                                Ao prosseguir, você declara estar ciente dos 
                                <a href="#" class="text-decoration-none">Termos e Políticas</a> 
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
    
    <script>
        // Timer
        let timeRemaining = <?php echo $time_remaining; ?>;
        
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

        // Funções de login do comprador
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
            const loginForm = document.getElementById('comprador-login-form');
            if (option === 'login') {
                loginForm.style.display = 'block';
            } else {
                loginForm.style.display = 'none';
                // Limpar campos de login quando sair
                if (document.getElementById('comprador_login_email')) {
                    document.getElementById('comprador_login_email').value = '';
                    document.getElementById('comprador_login_senha').value = '';
                }
            }
        }

        function closeCompradorLogin() {
            // Ocultar formulário de login
            document.getElementById('comprador-login-form').style.display = 'none';
            
            // Limpar campos de login
            document.getElementById('comprador_login_email').value = '';
            document.getElementById('comprador_login_senha').value = '';
            
            // Remover seleção de todas as opções
            document.querySelectorAll('.login-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Não seleciona nenhum radio
            document.querySelectorAll('input[name="comprador_method"]').forEach(radio => {
                radio.checked = false;
            });
        }

        function deslogarComprador() {
            if (confirm('Deseja realmente sair da sua conta de comprador?')) {
                // Limpar cookies
                document.cookie = 'compradorid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'compradornome=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                
                // Recarregar página
                location.reload();
            }
        }

        async function realizarLoginComprador() {
            const email = document.getElementById('comprador_login_email').value;
            const senha = document.getElementById('comprador_login_senha').value;

            if (!email || !senha) {
                alert('Por favor, preencha e-mail e senha.');
                return;
            }

            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Entrando...';
            btn.disabled = true;

            try {
                const response = await fetch('api/login-comprador.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        senha: senha
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success) {
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

        // Buscar CEP automaticamente
        async function buscarCEP() {
            const cep = document.getElementById('cep').value.replace(/\D/g, '');
            
            if (cep.length === 8) {
                try {
                    // Mostrar loading
                    document.getElementById('cep').classList.add('loading');
                    
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();
                    
                    if (!data.erro) {
                        // Preencher campos
                        document.getElementById('endereco').value = data.logradouro || '';
                        document.getElementById('bairro').value = data.bairro || '';
                        document.getElementById('cidade').value = data.localidade || '';
                        document.getElementById('estado').value = data.uf || '';
                        
                        // Mostrar campos de endereço
                        document.getElementById('endereco-fields').style.display = 'block';
                        
                        // Focar no campo número
                        setTimeout(() => {
                            document.getElementById('numero').focus();
                        }, 100);
                        
                        // Adicionar efeito visual suave
                        const enderecoFields = document.getElementById('endereco-fields');
                        enderecoFields.style.opacity = '0';
                        enderecoFields.style.transform = 'translateY(-10px)';
                        enderecoFields.style.transition = 'all 0.3s ease';
                        
                        setTimeout(() => {
                            enderecoFields.style.opacity = '1';
                            enderecoFields.style.transform = 'translateY(0)';
                        }, 50);
                        
                    } else {
                        alert('CEP não encontrado. Verifique o número digitado.');
                    }
                } catch (error) {
                    console.log('Erro ao buscar CEP:', error);
                    alert('Erro ao buscar CEP. Tente novamente.');
                } finally {
                    document.getElementById('cep').classList.remove('loading');
                }
            }
        }
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
            const carrinhoData = sessionStorage.getItem('carrinho');
            if (!carrinhoData) return;

            const carrinho = JSON.parse(carrinhoData);
            const total = carrinho.total || carrinho.subtotal || 0;
            
            const installmentsList = document.getElementById('installments-list');
            let html = '';

            for (let i = 1; i <= 12; i++) {
                const installmentValue = total / i;
                const isSelected = i === 1 ? 'selected' : ''; // 1x selecionado como padrão
                
                html += `
                    <div class="installment-option ${isSelected}" onclick="selectInstallment(this, ${i})">
                        <input type="radio" name="installments" value="${i}" ${i === 1 ? 'checked' : ''}>
                        <strong>${i}x</strong> de <strong>R$ ${formatPrice(installmentValue)}</strong>
                        ${i === 1 ? ' à vista' : ` = R$ ${formatPrice(total)}`}
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

        function formatPrice(price) {
            return price.toFixed(2).replace('.', ',');
        }

        // Finalizar pagamento 
        async function finalizePayment() {
            // Validação básica
            const compradorForm = document.getElementById('comprador-form');
            const paymentMethod = document.querySelector('input[name="payment_method"]:checked');

            if (!paymentMethod) {
                alert('Selecione uma forma de pagamento.');
                return;
            }

            // Verificar campos obrigatórios do comprador
            const camposObrigatorios = [
                { id: 'nome_completo', nome: 'Nome completo' },
                { id: 'email', nome: 'E-mail' },
                { id: 'whatsapp', nome: 'WhatsApp' },
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
                
                if (!valor || !valor.trim()) {
                    camposFaltando.push(campo.nome);
                }
            }
            
            if (camposFaltando.length > 0) {
                alert('Por favor, preencha todos os campos obrigatórios:\n• ' + camposFaltando.join('\n• '));
                return;
            }

            // Verificar e-mail
            const email = document.getElementById('email').value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor, insira um e-mail válido.');
                return;
            }

            // Verificar WhatsApp
            const whatsapp = document.getElementById('whatsapp').value;
            if (whatsapp.replace(/\D/g, '').length < 10) {
                alert('Por favor, insira um WhatsApp válido.');
                return;
            }

            // Validar dados do cartão se for cartão de crédito
            if (paymentMethod.value === 'credit' && !validateCreditCard()) {
                return;
            }

            // Coletar dados
            const compradorData = Object.fromEntries(new FormData(compradorForm));
            
            // Verificar se comprador está logado
            const compradorLogado = <?php echo json_encode($comprador_logado); ?>;
            if (compradorLogado) {
                compradorData.comprador_id = <?php echo $comprador_logado && isset($comprador_dados['id']) ? $comprador_dados['id'] : 'null'; ?>;
                compradorData.metodo_comprador = 'logged';
            } else {
                compradorData.metodo_comprador = 'manual';
            }

            // Criar dados do participante baseado no comprador (já que agora só temos comprador)
            const participanteData = {
                nome: compradorData.nome_completo.split(' ')[0] || 'Nome',
                sobrenome: compradorData.nome_completo.split(' ').slice(1).join(' ') || 'Sobrenome',
                email: compradorData.email,
                whatsapp: compradorData.whatsapp,
                metodo_dados: 'manual'
            };

            const carrinho = JSON.parse(sessionStorage.getItem('carrinho') || '{}');
            
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
                        window.location.href = 'pagamento-pix.php?evento=' + encodeURIComponent('<?php echo $slug; ?>');
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

        // Processar pagamento com cartão de crédito
        async function processarPagamentoCartao(pedido, comprador, participante) {
            try {
                console.log('=== PROCESSANDO PAGAMENTO CARTÃO ===');
                console.log('Pedido recebido:', pedido);
                console.log('Comprador recebido:', comprador);
                console.log('Participante recebido:', participante);
                
                // Buscar carrinho do sessionStorage
                const carrinhoData = sessionStorage.getItem('carrinho');
                let carrinho = {};
                
                if (carrinhoData) {
                    carrinho = JSON.parse(carrinhoData);
                } else {
                    // Criar carrinho básico se não existir
                    carrinho = {
                        evento: {
                            id: <?php echo $evento['id']; ?>,
                            nome: '<?php echo addslashes($evento['nome']); ?>'
                        },
                        total: 100.00 // Valor padrão
                    };
                }
                
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
                    telefone: '', // Campo removido, usar WhatsApp
                    email: comprador.email,
                    whatsapp: comprador.whatsapp
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
                    evento_nome: carrinho?.evento?.nome || 'Evento',
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

        // Renderizar resumo básico
        function renderSummary() {
            let carrinhoData = sessionStorage.getItem('carrinho');
            
            if (!carrinhoData) {
                // Criar carrinho básico de teste se não existir
                const carrinhoTeste = {
                    evento: {
                        id: <?php echo $evento['id']; ?>,
                        nome: '<?php echo addslashes($evento['nome']); ?>'
                    },
                    ingressos: [
                        {
                            id: 1,
                            nome: 'Ingresso Padrão',
                            quantidade: 1,
                            preco: 100.00,
                            subtotal: 100.00
                        }
                    ],
                    subtotal: 100.00,
                    total: 100.00
                };
                
                sessionStorage.setItem('carrinho', JSON.stringify(carrinhoTeste));
                carrinhoData = JSON.stringify(carrinhoTeste);
            }
            
            const carrinho = JSON.parse(carrinhoData);
            
            // Renderizar ingressos
            if (carrinho.ingressos) {
                const ticketsHtml = carrinho.ingressos.map(ingresso => `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <div class="fw-semibold">${ingresso.nome}</div>
                            <small class="text-muted">Qtd: ${ingresso.quantidade}</small>
                        </div>
                        <div>R$ ${parseFloat(ingresso.subtotal).toFixed(2).replace('.', ',')}</div>
                    </div>
                `).join('');
                
                document.getElementById('summary-tickets').innerHTML = ticketsHtml;
                document.getElementById('valor-total').textContent = 'R$ ' + parseFloat(carrinho.total || carrinho.subtotal || 0).toFixed(2).replace('.', ',');
            }
        }

        // Inicializar quando a página carrega
        document.addEventListener('DOMContentLoaded', function() {
            startTimer();
            renderSummary();
            
            // Usuário deve escolher a forma de pagamento

            // Máscaras para campos
            // Máscara para WhatsApp
            const whatsappField = document.getElementById('whatsapp');
            if (whatsappField) {
                whatsappField.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 11) {
                        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                    }
                    e.target.value = value;
                });
            }

            // Máscara para CEP
            const cepField = document.getElementById('cep');
            if (cepField) {
                cepField.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 8) {
                        value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
                    }
                    e.target.value = value;
                });
            }

            // Máscara para documento
            const documentoField = document.getElementById('documento');
            if (documentoField) {
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
            }

            // Máscaras para campos do cartão
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
        });
        
        console.log('Checkout carregado com sucesso!');
    </script>
</body>
</html>