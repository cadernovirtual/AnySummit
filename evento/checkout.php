<?php
// Habilitar exibição de erros para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
include("conm/conn.php");
include("../includes/imagem-helpers.php");

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
    header('Location: /evento/?evento=' . urlencode($slug) . '&expired=1');
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

        /* Estilos para logo da bandeira do cartão */
        .card-number-container {
            position: relative;
        }
        
        .card-brand-logo {
            display: none;
            z-index: 10;
            pointer-events: none;
        }
        
        .card-brand-logo img {
            height: 24px;
            width: auto;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        #card_brand_text {
            font-size: 0.8rem;
            color: #6c757d;
            margin-top: 0.25rem;
        }
        
        #cvv_help {
            font-size: 0.8rem;
            color: #6c757d;
            margin-top: 0.25rem;
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
        
        .payment-option.disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background-color: #f8f9fa;
            border-color: #dee2e6;
        }
        
        .payment-option.disabled:hover {
            border-color: #dee2e6;
            background-color: #f8f9fa;
        }
        
        .payment-option.disabled input {
            cursor: not-allowed;
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
            padding: 1rem;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            background-color: #ffffff;
        }
        
        .installment-option:hover {
            border-color: #007bff;
            background-color: #f8f9ff;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
        }
        
        .installment-option.selected {
            border-color: #007bff;
            background-color: #f8f9ff;
            box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
        }
        
        .installment-option input[type="radio"] {
            margin-right: 0.75rem;
            transform: scale(1.1);
        }

        .installment-option .text-warning {
            color: #856404 !important;
        }

        .installment-option .text-muted {
            color: #6c757d !important;
        }
        
        /* Dialog de Erro Personalizado */
        .custom-dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .custom-dialog-overlay.show {
            opacity: 1;
        }
        
        .custom-dialog {
            background: white;
            border-radius: 16px;
            padding: 0;
            max-width: 450px;
            width: 90%;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            transform: scale(0.8) translateY(-30px);
            transition: transform 0.3s ease;
            overflow: hidden;
        }
        
        .custom-dialog-overlay.show .custom-dialog {
            transform: scale(1) translateY(0);
        }
        
        .custom-dialog-header {
            background: linear-gradient(135deg, #dc3545, #c82333);
            color: white;
            padding: 1.5rem;
            text-align: center;
        }
        
        .custom-dialog-header.warning {
            background: linear-gradient(135deg, #ffc107, #e0a800);
        }
        
        .custom-dialog-header.info {
            background: linear-gradient(135deg, #17a2b8, #138496);
        }
        
        .custom-dialog-header.success {
            background: linear-gradient(135deg, #28a745, #1e7e34);
        }
        
        .custom-dialog-icon {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .custom-dialog-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
        }
        
        .custom-dialog-body {
            padding: 2rem 1.5rem;
            text-align: center;
        }
        
        .custom-dialog-message {
            font-size: 1rem;
            color: #495057;
            line-height: 1.5;
            margin-bottom: 1.5rem;
        }
        
        .custom-dialog-actions {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .custom-dialog-btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            min-width: 100px;
        }
        
        .custom-dialog-btn-primary {
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
        }
        
        .custom-dialog-btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }
        
        .custom-dialog-btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .custom-dialog-btn-secondary:hover {
            background: #545b62;
            transform: translateY(-1px);
        }
        
        .custom-dialog-btn-danger {
            background: linear-gradient(135deg, #dc3545, #c82333);
            color: white;
        }
        
        .custom-dialog-btn-danger:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
        }
            .summary-card {
                position: static;
                margin-top: 0;
                margin-bottom: 2rem;
            }
            
            /* Compactar o resumo no mobile */
            .summary-card .p-4 {
                padding: 1.5rem !important;
            }
            
            .event-thumb {
                width: 60px;
                height: 45px;
            }
            
            .summary-card h6 {
                font-size: 0.9rem;
                margin-bottom: 0.5rem;
            }
            
            .summary-card small {
                font-size: 0.75rem;
            }
            
            .summary-card .d-flex.justify-content-between {
                margin-bottom: 0.5rem;
            }
            
            .summary-card hr {
                margin: 1rem 0;
            }
            
            .summary-card .fw-bold {
                font-size: 1.1rem;
            }
            
            /* Reduzir padding dos cards do formulário no mobile */
            .checkout-card-header,
            .checkout-card-body {
                padding: 1rem !important;
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
                        <img src="/evento/img/anysummitlogo.png" style="max-width: 150px;" alt="AnySummit">
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
            <div class="col-lg-8 order-2 order-lg-1">
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

                        <!-- Dados do Comprador Completo - Oculto inicialmente -->
                        <div id="dados-comprador-section" style="display: none;">
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
                        </div>

                        <!-- Seção de Pagamento - Oculta inicialmente -->
                        <div id="pagamento-section" style="display: none;">
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
                                    <div class="card-number-container position-relative">
                                        <input type="text" class="form-control" id="card_number" name="card_number" placeholder="0000 0000 0000 0000">
                                        <div id="card_brand_logo" class="card-brand-logo position-absolute top-50 end-0 translate-middle-y me-3" style="display: none;">
                                            <img id="brand_img" src="" alt="" style="height: 24px; width: auto;">
                                        </div>
                                    </div>
                                    <small id="card_brand_text" class="text-muted"></small>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label for="card_expiry" class="form-label">Data de validade *</label>
                                    <input type="text" class="form-control" id="card_expiry" name="card_expiry" placeholder="MM/AA">
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label for="card_cvv" class="form-label">Código de segurança *</label>
                                    <input type="text" class="form-control" id="card_cvv" name="card_cvv" placeholder="000" maxlength="4">
                                    <small id="cvv_help" class="text-muted">3 dígitos no verso</small>
                                </div>
                            </div>

                            <!-- Parcelamento -->
                            <div class="mb-3">
                                <label class="form-label">Parcelamento</label>
                                <p class="small text-muted">Parcele em até 12x com taxas reais do Asaas <i class="fas fa-info-circle" data-bs-toggle="tooltip" title="Valores incluem as taxas cobradas pela operadora de pagamento"></i></p>
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
            </div>

            <!-- Resumo da Compra -->
            <div class="col-lg-4 order-1 order-lg-2">
                <div class="summary-card">
                    <div class="p-4">
                        <!-- Evento Info -->
                        <div class="d-flex align-items-center mb-3">
                            <?php if (!empty($evento['imagem_capa'])): ?>
                                <?php 
                                $imagem_checkout = normalizarCaminhoImagem($evento['imagem_capa']);
                                ?>
                                <img src="<?php echo htmlspecialchars($imagem_checkout); ?>" alt="<?php echo htmlspecialchars($evento['nome']); ?>" class="event-thumb me-3">
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
                            <div class="d-flex justify-content-between mb-2">
                                <span>Subtotal</span>
                                <span id="valor-subtotal">--</span>
                            </div>
                            
                            <!-- Desconto do cupom (oculto por padrão) -->
                            <div class="d-flex justify-content-between mb-2 text-success" id="desconto-cupom-row" style="display: none;">
                                <span>
                                    <i class="fas fa-tag me-1"></i>
                                    Desconto cupom
                                </span>
                                <span id="valor-desconto-cupom">- R$ 0,00</span>
                            </div>
                            
                            <hr class="my-2">
                            
                            <div class="d-flex justify-content-between fw-bold mb-2">
                                <span>Total</span>
                                <span id="valor-total">--</span>
                            </div>
                        </div>

                        <!-- Políticas -->
                        <div class="mt-4">
                            <small class="text-muted">
                                Ao prosseguir, você declara estar ciente dos 
                                <a href="#" class="text-decoration-none" onclick="abrirDialogTermos(event)">Termos e Políticas</a> 
                                e das 
                                <a href="#" class="text-decoration-none" onclick="abrirDialogPoliticas(event)">condições de pagamento</a> do pedido.
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
        // ========================================
        // FUNÇÕES DE VALIDAÇÃO DE CARTÃO AVANÇADAS (ESCOPO GLOBAL)
        // ========================================

        // Detectar bandeira do cartão
        function detectCardBrand(cardNumber) {
            const cleaned = cardNumber.replace(/\D/g, '');
            const length = cleaned.length;
            
            // Visa: começa com 4; comprimentos 13, 16, 19
            if (/^4/.test(cleaned) && [13, 16, 19].includes(length)) {
                return 'visa';
            }
            
            // Mastercard: 51-55 ou 2221-2720; comprimento 16
            if (length === 16 && (
                /^5[1-5]/.test(cleaned) || 
                /^222[1-9]/.test(cleaned) || 
                /^22[3-9][0-9]/.test(cleaned) || 
                /^2[3-6][0-9][0-9]/.test(cleaned) || 
                /^27[0-1][0-9]/.test(cleaned) || 
                /^2720/.test(cleaned)
            )) {
                return 'mastercard';
            }
            
            // American Express: começa com 34 ou 37; comprimento 15
            if (/^3[47]/.test(cleaned) && length === 15) {
                return 'amex';
            }
            
            // Elo: prefixos específicos; comprimento 16
            if (length === 16 && (
                /^4011/.test(cleaned) ||
                /^431274/.test(cleaned) ||
                /^438935/.test(cleaned) ||
                /^451416/.test(cleaned) ||
                /^457393/.test(cleaned) ||
                /^504175/.test(cleaned) ||
                /^506699|^5067/.test(cleaned) ||
                /^5090/.test(cleaned) ||
                /^627780/.test(cleaned) ||
                /^636297/.test(cleaned) ||
                /^636368/.test(cleaned)
            )) {
                return 'elo';
            }
            
            // Hipercard: 606282 ou 3841; comprimentos 13, 16, 19
            if ((/^606282/.test(cleaned) || /^3841/.test(cleaned)) && 
                [13, 16, 19].includes(length)) {
                return 'hipercard';
            }
            
            // Discover: vários prefixos; comprimentos 16-19
            if ([16, 17, 18, 19].includes(length) && (
                /^6011/.test(cleaned) ||
                /^622(12[6-9]|1[3-9][0-9]|[2-8][0-9][0-9]|9[0-1][0-9]|92[0-5])/.test(cleaned) ||
                /^64[4-9]/.test(cleaned) ||
                /^65/.test(cleaned)
            )) {
                return 'discover';
            }
            
            // Diners: vários prefixos; comprimento 14
            if (length === 14 && (
                /^30[0-5]/.test(cleaned) ||
                /^3095/.test(cleaned) ||
                /^36/.test(cleaned) ||
                /^3[8-9]/.test(cleaned)
            )) {
                return 'diners';
            }
            
            // JCB: 3528-3589; comprimentos 16-19
            if ([16, 17, 18, 19].includes(length) && 
                /^35(2[8-9]|[3-8][0-9])/.test(cleaned)) {
                return 'jcb';
            }
            
            return 'unknown';
        }

        // Algoritmo de Luhn
        function validateLuhn(cardNumber) {
            const cleaned = cardNumber.replace(/\D/g, '');
            let sum = 0;
            let alternate = false;
            
            for (let i = cleaned.length - 1; i >= 0; i--) {
                let digit = parseInt(cleaned.charAt(i), 10);
                
                if (alternate) {
                    digit *= 2;
                    if (digit > 9) {
                        digit = (digit % 10) + 1;
                    }
                }
                
                sum += digit;
                alternate = !alternate;
            }
            
            return (sum % 10) === 0;
        }

        // Validação completa do cartão
        function validateCardData(cardNumber, cardExpiry, cardCvv) {
            const cleaned = cardNumber.replace(/\D/g, '');
            const brand = detectCardBrand(cleaned);
            const length = cleaned.length;
            
            // Validar comprimento mínimo/máximo
            if (length < 12 || length > 19) {
                return {
                    valid: false,
                    message: 'Número do cartão deve ter entre 12 e 19 dígitos'
                };
            }
            
            // Validar comprimento específico por bandeira
            const validLengths = {
                'visa': [13, 16, 19],
                'mastercard': [16],
                'amex': [15],
                'elo': [16],
                'hipercard': [13, 16, 19],
                'discover': [16, 17, 18, 19],
                'diners': [14],
                'jcb': [16, 17, 18, 19]
            };
            
            if (brand !== 'unknown' && validLengths[brand]) {
                if (!validLengths[brand].includes(length)) {
                    return {
                        valid: false,
                        message: `Comprimento inválido para cartão ${brand.toUpperCase()}`
                    };
                }
            }
            
            // Validar algoritmo de Luhn
            if (!validateLuhn(cleaned)) {
                return {
                    valid: false,
                    message: 'Número do cartão inválido'
                };
            }
            
            // Validar data de validade
            const [month, year] = cardExpiry.split('/');
            const expiryMonth = parseInt(month, 10);
            const expiryYear = parseInt('20' + year, 10);
            
            if (expiryMonth < 1 || expiryMonth > 12) {
                return {
                    valid: false,
                    message: 'Mês de validade inválido'
                };
            }
            
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1;
            
            if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
                return {
                    valid: false,
                    message: 'Cartão expirado'
                };
            }
            
            // Validar CVV
            const expectedCvvLength = brand === 'amex' ? 4 : 3;
            if (cardCvv.length !== expectedCvvLength) {
                const cvvName = brand === 'amex' ? 'CVV (4 dígitos para American Express)' : 'CVV (3 dígitos)';
                return {
                    valid: false,
                    message: `Código de segurança inválido - esperado ${cvvName}`
                };
            }
            
            // Aviso para bandeiras não reconhecidas
            if (brand === 'unknown') {
                return {
                    valid: false,
                    message: 'Bandeira do cartão não reconhecida - verifique o número'
                };
            }
            
            return {
                valid: true,
                brand: brand
            };
        }

        // Atualizar logo da bandeira
        function updateCardBrandLogo(brand) {
            const logoContainer = document.getElementById('card_brand_logo');
            const brandImg = document.getElementById('brand_img');
            const brandText = document.getElementById('card_brand_text');
            const cvvHelp = document.getElementById('cvv_help');
            
            if (brand && brand !== 'unknown') {
                // URLs dos logos das bandeiras (usando SVGs simples)
                const brandLogos = {
                    'visa': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA0MCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzE0MzQ3QiIvPgo8dGV4dCB4PSIyMCIgeT0iMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VklTQTwvdGV4dD4KPC9zdmc+',
                    'mastercard': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA0MCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI0VCMDAxQiIvPgo8dGV4dCB4PSIyMCIgeT0iMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI3IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TUFTVEVSPC90ZXh0Pgo8L3N2Zz4=',
                    'amex': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA0MCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNkZDRiIvPgo8dGV4dCB4PSIyMCIgeT0iMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QU1FWDwvdGV4dD4KPC9zdmc+',
                    'elo': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA0MCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI0ZGRDUwMCIvPgo8dGV4dCB4PSIyMCIgeT0iMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmaWxsPSJibGFjayIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RUxPPC90ZXh0Pgo8L3N2Zz4=',
                    'hipercard': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA0MCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI0ZGMDAwMCIvPgo8dGV4dCB4PSIyMCIgeT0iMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SElQRVI8L3RleHQ+Cjwvc3ZnPg==',
                    'discover': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA0MCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI0ZGNjAwMCIvPgo8dGV4dCB4PSIyMCIgeT0iMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RElTQ09WRVI8L3RleHQ+Cjwvc3ZnPg==',
                    'diners': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA0MCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNzlBQSIvPgo8dGV4dCB4PSIyMCIgeT0iMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RElORVJTPC90ZXh0Pgo8L3N2Zz4=',
                    'jcb': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA0MCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNjZBQSIvPgo8dGV4dCB4PSIyMCIgeT0iMTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SkNCPC90ZXh0Pgo8L3N2Zz4='
                };
                
                brandImg.src = brandLogos[brand] || '';
                brandImg.alt = brand.toUpperCase();
                logoContainer.style.display = 'block';
                brandText.textContent = brand.toUpperCase();
                
                // Atualizar texto de ajuda do CVV
                if (brand === 'amex') {
                    cvvHelp.textContent = '4 dígitos na frente';
                    document.getElementById('card_cvv').placeholder = '0000';
                } else {
                    cvvHelp.textContent = '3 dígitos no verso';
                    document.getElementById('card_cvv').placeholder = '000';
                }
            } else {
                logoContainer.style.display = 'none';
                brandText.textContent = '';
                cvvHelp.textContent = '3 dígitos no verso';
                document.getElementById('card_cvv').placeholder = '000';
            }
        }

        // ===== SISTEMA DE DIALOG PERSONALIZADO =====
        
        /**
         * Exibe um dialog personalizado substituindo o alert nativo
         * @param {string} message - Mensagem a ser exibida
         * @param {string} type - Tipo do dialog: 'error', 'warning', 'info', 'success'
         * @param {object} options - Opções adicionais
         */
        function showCustomDialog(message, type = 'error', options = {}) {
            // Remover dialogs existentes
            const existingOverlay = document.querySelector('.custom-dialog-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
            
            // Configurações por tipo
            const configs = {
                error: {
                    icon: 'fas fa-exclamation-triangle',
                    title: options.title || 'Erro no Pagamento',
                    headerClass: ''
                },
                warning: {
                    icon: 'fas fa-exclamation-triangle',
                    title: options.title || 'Atenção',
                    headerClass: 'warning'
                },
                info: {
                    icon: 'fas fa-info-circle',
                    title: options.title || 'Informação',
                    headerClass: 'info'
                },
                success: {
                    icon: 'fas fa-check-circle',
                    title: options.title || 'Sucesso',
                    headerClass: 'success'
                }
            };
            
            const config = configs[type] || configs.error;
            
            // Criar HTML do dialog
            const overlay = document.createElement('div');
            overlay.className = 'custom-dialog-overlay';
            
            // Botões padrão
            let buttonsHtml = '';
            if (options.showRetry) {
                buttonsHtml = `
                    <button class="custom-dialog-btn custom-dialog-btn-primary" onclick="retryPayment()">
                        <i class="fas fa-redo me-2"></i>Tentar Novamente
                    </button>
                    <button class="custom-dialog-btn custom-dialog-btn-secondary" onclick="closeCustomDialog()">
                        Cancelar
                    </button>
                `;
            } else if (options.showOkCancel) {
                buttonsHtml = `
                    <button class="custom-dialog-btn custom-dialog-btn-primary" onclick="handleDialogOk()">
                        OK
                    </button>
                    <button class="custom-dialog-btn custom-dialog-btn-secondary" onclick="closeCustomDialog()">
                        Cancelar
                    </button>
                `;
            } else {
                // Verificar se existe callback onOk
                const onClickAction = options.onOk ? 'handleDialogOk()' : 'closeCustomDialog()';
                
                buttonsHtml = `
                    <button class="custom-dialog-btn custom-dialog-btn-primary" onclick="${onClickAction}">
                        ${options.okText || 'Entendi'}
                    </button>
                `;
            }
            
            overlay.innerHTML = `
                <div class="custom-dialog">
                    <div class="custom-dialog-header ${config.headerClass}">
                        <div class="custom-dialog-icon">
                            <i class="${config.icon}"></i>
                        </div>
                        <h3 class="custom-dialog-title">${config.title}</h3>
                    </div>
                    <div class="custom-dialog-body">
                        <div class="custom-dialog-message">${message}</div>
                        <div class="custom-dialog-actions">
                            ${buttonsHtml}
                        </div>
                    </div>
                </div>
            `;
            
            // Adicionar ao body
            document.body.appendChild(overlay);
            
            // Mostrar com animação
            setTimeout(() => {
                overlay.classList.add('show');
            }, 10);
            
            // Salvar callback se existir
            if (options.onOk) {
                window.customDialogOkCallback = options.onOk;
            }
            
            // Auto-close se especificado
            if (options.autoClose) {
                setTimeout(() => {
                    closeCustomDialog();
                }, options.autoClose);
            }
        }
        
        /**
         * Fecha o dialog personalizado
         */
        function closeCustomDialog() {
            const overlay = document.querySelector('.custom-dialog-overlay');
            if (overlay) {
                overlay.classList.remove('show');
                setTimeout(() => {
                    overlay.remove();
                }, 300);
            }
        }
        
        /**
         * Handler para botão OK do dialog
         */
        function handleDialogOk() {
            if (window.customDialogOkCallback) {
                window.customDialogOkCallback();
                window.customDialogOkCallback = null;
            }
            closeCustomDialog();
        }
        
        /**
         * Tentar novamente o pagamento
         */
        function retryPayment() {
            closeCustomDialog();
            // Focar no primeiro campo do cartão para correção
            const cardNameField = document.getElementById('card_name');
            if (cardNameField) {
                cardNameField.focus();
            }
        }
        
        /**
         * Traduz mensagens de erro técnicas para mensagens amigáveis
         * @param {string} errorMessage - Mensagem de erro original
         * @returns {string} - Mensagem traduzida e amigável
         */
        function translateErrorMessage(errorMessage) {
            // Decodificar caracteres Unicode se existirem
            let message = errorMessage;
            
            // Decodificar \u00e7 para ç e outros caracteres especiais
            message = message.replace(/\\u([0-9a-fA-F]{4})/g, function (match, code) {
                return String.fromCharCode(parseInt(code, 16));
            });
            
            // Extrair mensagens específicas do Asaas se existirem
            try {
                // Tentar extrair array de erros JSON do Asaas
                const jsonMatch = message.match(/\[{.*}\]/);
                if (jsonMatch) {
                    const errors = JSON.parse(jsonMatch[0]);
                    if (errors && errors.length > 0) {
                        const error = errors[0];
                        
                        // Mensagens específicas por código de erro do Asaas
                        const errorTranslations = {
                            'invalid_creditCard': 'Cartão de crédito recusado. Verifique os dados do cartão e tente novamente.',
                            'insufficient_funds': 'Saldo insuficiente no cartão. Tente com outro cartão ou forma de pagamento.',
                            'card_expired': 'Cartão expirado. Verifique a data de validade ou use outro cartão.',
                            'invalid_cvv': 'Código de segurança (CVV) inválido. Verifique os 3 dígitos no verso do cartão.',
                            'card_blocked': 'Cartão bloqueado. Entre em contato com seu banco ou use outro cartão.',
                            'invalid_card_number': 'Número do cartão inválido. Verifique os 16 dígitos digitados.',
                            'transaction_not_allowed': 'Transação não permitida. Entre em contato com seu banco.',
                            'exceeds_limit': 'Valor excede o limite do cartão. Tente um valor menor ou outro cartão.',
                            'issuer_unavailable': 'Banco emissor indisponível no momento. Tente novamente em alguns minutos.',
                            'invalid_transaction': 'Dados da transação inválidos. Verifique todas as informações.',
                            'fraud_suspected': 'Transação suspeita bloqueada por segurança. Entre em contato com seu banco.',
                            'invalid_merchant': 'Problema com o estabelecimento. Tente novamente ou entre em contato conosco.'
                        };
                        
                        // Se tem tradução específica, usar ela
                        if (errorTranslations[error.code]) {
                            return errorTranslations[error.code];
                        }
                        
                        // Se tem descrição mas não tem tradução, usar descrição limpa
                        if (error.description) {
                            return error.description;
                        }
                    }
                }
            } catch (e) {
                // Se falhou ao parsear JSON, continuar com outras verificações
            }
            
            // Verificações por palavras-chave na mensagem (fallback)
            const keywordTranslations = {
                'não autorizada': 'Cartão recusado pela operadora. Verifique os dados ou tente outro cartão.',
                'transação não autorizada': 'Cartão recusado pela operadora. Verifique os dados ou tente outro cartão.',
                'cartão inválido': 'Dados do cartão inválidos. Verifique número, validade e CVV.',
                'saldo insuficiente': 'Saldo insuficiente no cartão. Tente com outro cartão.',
                'cartão expirado': 'Cartão expirado. Verifique a data de validade.',
                'cvv inválido': 'Código de segurança (CVV) incorreto. Verifique os 3 dígitos no verso.',
                'cartão bloqueado': 'Cartão bloqueado. Entre em contato com seu banco.',
                'limite excedido': 'Limite do cartão excedido. Tente um valor menor.',
                'timeout': 'Tempo limite excedido. Tente novamente.',
                'connection': 'Erro de conexão. Verifique sua internet e tente novamente.',
                'network': 'Erro de rede. Tente novamente em alguns instantes.'
            };
            
            // Verificar palavras-chave
            for (const [keyword, translation] of Object.entries(keywordTranslations)) {
                if (message.toLowerCase().includes(keyword.toLowerCase())) {
                    return translation;
                }
            }
            
            // Remover prefixos técnicos comuns
            message = message.replace(/^Erro ao processar pagamento:\s*/i, '');
            message = message.replace(/^Erro HTTP \d+:\s*/i, '');
            message = message.replace(/^Problema no pagamento:\s*/i, '');
            
            // Se ainda tem JSON ou códigos técnicos, usar mensagem genérica amigável
            if (message.includes('[{') || message.includes('HTTP') || message.includes('code":')) {
                return 'Não foi possível processar o pagamento com este cartão. Verifique os dados ou tente outro cartão.';
            }
            
            // Retornar mensagem limpa
            return message || 'Erro no processamento do pagamento. Tente novamente.';
        }
        
        /**
         * Substituir alert nativo por dialog customizado com tradução de mensagens
         * Preserva compatibilidade com código existente
         */
        function customAlert(message, type = 'error', options = {}) {
            // Traduzir mensagem para formato amigável
            const friendlyMessage = translateErrorMessage(message);
            
            // Verificar se é erro de validação (não é problema do cartão)
            if (message.toLowerCase().includes('invalid_mobilephone') ||
                message.toLowerCase().includes('celular informado é inválido') ||
                message.toLowerCase().includes('invalid_email') ||
                message.toLowerCase().includes('invalid_cpfcnpj') ||
                message.toLowerCase().includes('invalid_postalcode')) {
                
                showCustomDialog(
                    'Erro nos dados informados. Verifique os campos e tente novamente.<br><br>' +
                    '<strong>Detalhes:</strong> ' + friendlyMessage,
                    'warning',
                    {
                        title: 'Dados Inválidos',
                        showRetry: false, // Não mostrar "tentar novamente" para erro de validação
                        okText: 'Corrigir Dados',
                        ...options
                    }
                );
            }
            // Se a mensagem contém "pagamento" e parece ser erro de cartão
            else if (message.toLowerCase().includes('pagamento') || 
                message.toLowerCase().includes('cartão') || 
                message.toLowerCase().includes('recus') ||
                message.toLowerCase().includes('rejeit') ||
                message.toLowerCase().includes('erro no pagamento') ||
                message.toLowerCase().includes('invalid_creditcard') ||
                message.toLowerCase().includes('não autorizada')) {
                
                showCustomDialog(friendlyMessage, 'error', {
                    title: 'Cartão Recusado',
                    showRetry: true,
                    ...options
                });
            } else {
                showCustomDialog(friendlyMessage, type, options);
            }
        }
        
        // ===== FIM DO SISTEMA DE DIALOG =====
        // Inicialização da página
        document.addEventListener('DOMContentLoaded', function() {
            startTimer();
            loadCheckoutData();
            
            // Se comprador está logado, mostrar seções automaticamente
            const compradorLogado = <?php echo json_encode($comprador_logado); ?>;
            if (compradorLogado) {
                document.getElementById('dados-comprador-section').style.display = 'block';
                document.getElementById('pagamento-section').style.display = 'block';
            }
        });

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
                    console.log('Timer expirado, redirecionando para:', '/evento/?evento=<?php echo urlencode($slug); ?>');
                    showCustomDialog(
                        'Seu tempo para finalizar a compra expirou. Você será redirecionado para o evento.',
                        'warning',
                        {
                            title: 'Tempo Expirado',
                            okText: 'Voltar ao Evento',
                            onOk: () => {
                                console.log('Executando redirecionamento...');
                                window.location.href = '/evento/?evento=<?php echo urlencode($slug); ?>';
                            }
                        }
                    );
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
            const dadosCompradorSection = document.getElementById('dados-comprador-section');
            const pagamentoSection = document.getElementById('pagamento-section');
            
            if (option === 'login') {
                loginForm.style.display = 'block';
                // Ocultar formulário de dados e pagamento até fazer login
                dadosCompradorSection.style.display = 'none';
                pagamentoSection.style.display = 'none';
            } else if (option === 'cadastro') {
                loginForm.style.display = 'none';
                // Mostrar formulário de dados e pagamento
                dadosCompradorSection.style.display = 'block';
                pagamentoSection.style.display = 'block';
                
                // Se é compra gratuita, mostrar botão específico
                verificarSeECompraGratuita();
                
                // Limpar campos de login quando sair
                if (document.getElementById('comprador_login_email')) {
                    document.getElementById('comprador_login_email').value = '';
                    document.getElementById('comprador_login_senha').value = '';
                }
            }
        }
        
        // Função para verificar se é compra gratuita e mostrar botão
        function verificarSeECompraGratuita() {
            const carrinhoData = sessionStorage.getItem('carrinho');
            if (carrinhoData) {
                const carrinho = JSON.parse(carrinhoData);
                const valorSubtotal = carrinho.subtotal || carrinho.total || 0;
                const descontoCupom = carrinho.desconto_cupom || 0;
                const valorFinal = Math.max(0, valorSubtotal - descontoCupom);
                
                if (valorFinal <= 0) {
                    // É compra gratuita - mostrar botão
                    criarBotaoCompraGratuita();
                }
            }
        }
        
        function criarBotaoCompraGratuita() {
            // Criar botão de compra gratuita se não existir
            let freeBtn = document.getElementById('btn-compra-gratuita');
            if (!freeBtn) {
                freeBtn = document.createElement('button');
                freeBtn.id = 'btn-compra-gratuita';
                freeBtn.type = 'button';
                freeBtn.onclick = processarCompraGratuita;
                
                // Inserir após as opções de pagamento
                const paymentSection = document.querySelector('.checkout-card-body');
                if (paymentSection) {
                    paymentSection.appendChild(freeBtn);
                    console.log('✅ Botão de compra gratuita criado');
                }
            }
            
            // Mostrar o botão habilitado
            freeBtn.style.display = 'block';
            freeBtn.disabled = false;
            freeBtn.innerHTML = '<i class="fas fa-gift me-2"></i>Confirmar Compra Gratuita';
            freeBtn.className = 'btn btn-success btn-lg w-100 mt-3';
            console.log('✅ Botão "Confirmar Compra Gratuita" exibido');
        }

        function closeCompradorLogin() {
            // Ocultar formulário de login
            document.getElementById('comprador-login-form').style.display = 'none';
            
            // Ocultar seções de dados e pagamento
            document.getElementById('dados-comprador-section').style.display = 'none';
            document.getElementById('pagamento-section').style.display = 'none';
            
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
            showCustomDialog(
                'Tem certeza que deseja sair da sua conta de comprador? Você precisará preencher os dados novamente.',
                'warning',
                {
                    title: 'Confirmar Logout',
                    showOkCancel: true,
                    onOk: () => {
                        // Limpar cookies
                        document.cookie = 'compradorid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                        document.cookie = 'compradornome=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                        
                        // Recarregar página
                        location.reload();
                    }
                }
            );
        }

        async function realizarLoginComprador() {
            const email = document.getElementById('comprador_login_email').value;
            const senha = document.getElementById('comprador_login_senha').value;

            if (!email || !senha) {
                showCustomDialog(
                    'Por favor, preencha o e-mail e a senha para fazer login.',
                    'warning',
                    {
                        title: 'Campos Obrigatórios'
                    }
                );
                return;
            }

            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Entrando...';
            btn.disabled = true;

            try {
                const response = await fetch('/evento/api/login-comprador.php', {
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
                    showCustomDialog(
                        'Login realizado com sucesso! A página será recarregada.',
                        'success',
                        {
                            title: 'Login Realizado',
                            autoClose: 2000,
                            onOk: () => {
                                // Mostrar seções de dados e pagamento antes de recarregar
                                document.getElementById('dados-comprador-section').style.display = 'block';
                                document.getElementById('pagamento-section').style.display = 'block';
                                location.reload();
                            }
                        }
                    );
                } else {
                    showCustomDialog(
                        result.message || 'E-mail ou senha incorretos. Verifique os dados e tente novamente.',
                        'error',
                        {
                            title: 'Erro no Login'
                        }
                    );
                }
            } catch (error) {
                console.error('Erro no login:', error);
                showCustomDialog(
                    'Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.',
                    'error',
                    {
                        title: 'Erro de Conexão'
                    }
                );
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
                        showCustomDialog(
                            'CEP não encontrado. Verifique o número digitado e tente novamente.',
                            'warning',
                            {
                                title: 'CEP Inválido'
                            }
                        );
                    }
                } catch (error) {
                    console.log('Erro ao buscar CEP:', error);
                    showCustomDialog(
                        'Erro ao buscar o CEP. Verifique sua conexão e tente novamente.',
                        'error',
                        {
                            title: 'Erro na Busca'
                        }
                    );
                } finally {
                    document.getElementById('cep').classList.remove('loading');
                }
            }
        }
        // Função utilitária para calcular valor do carrinho com fallback
        function calcularValorCarrinho(carrinho) {
            let valorSubtotal = carrinho.subtotal || carrinho.total || 0;
            
            // FALLBACK: Se subtotal/total zerado, calcular a partir dos ingressos
            if (valorSubtotal === 0 && carrinho.ingressos && carrinho.ingressos.length > 0) {
                valorSubtotal = carrinho.ingressos.reduce((total, ingresso) => {
                    return total + (parseFloat(ingresso.subtotal) || 0);
                }, 0);
                console.log('🔧 Valor recalculado a partir dos ingressos:', valorSubtotal);
            }
            
            return valorSubtotal;
        }
        
        function selectPayment(method) {
            console.log('🎯 selectPayment chamada com método:', method);
            
            // Obter dados do carrinho para validações de valor mínimo
            const carrinhoData = sessionStorage.getItem('carrinho');
            let valorFinal = 0;
            
            if (carrinhoData) {
                const carrinho = JSON.parse(carrinhoData);
                const valorOriginal = calcularValorCarrinho(carrinho);
                const descontoCupom = carrinho.desconto_cupom || 0;
                valorFinal = Math.max(0, valorOriginal - descontoCupom);
            }
            
            console.log('💰 Valor final para validação:', valorFinal);
            
            // NOTA: Se chegou até aqui, é porque o valor > 0 e os métodos de pagamento estão visíveis
            // Não há necessidade de verificar se é compra gratuita
            
            // Se valor final menor que R$ 5,00 (mas não zero por cupom), não permitir nenhum método
            if (valorFinal > 0 && valorFinal < 5) {
                showCustomDialog(
                    'O valor mínimo para qualquer forma de pagamento é R$ 5,00. Adicione mais itens ao seu carrinho.',
                    'warning',
                    {
                        title: 'Valor Mínimo Não Atingido'
                    }
                );
                return;
            }
            
            // PIX disponível para qualquer valor ≥ R$ 5,00 (conforme meio de pagamento)
            
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
                // Atualizar o total para 1x (padrão)
                updateSummaryTotal(1);
            } else {
                // Para PIX ou boleto, mostrar valor original
                if (carrinhoData) {
                    const carrinho = JSON.parse(carrinhoData);
                    const valorSubtotal = calcularValorCarrinho(carrinho);
                    const descontoCupom = carrinho.desconto_cupom || 0;
                    const valorFinal = Math.max(0, valorSubtotal - descontoCupom);
                    
                    document.getElementById('valor-total').textContent = 'R$ ' + formatPrice(valorFinal);
                    
                    // Atualizar texto explicativo
                    const summaryTotals = document.getElementById('summary-totals');
                    const existingSmall = summaryTotals.querySelector('small');
                    if (existingSmall) {
                        existingSmall.outerHTML = '<small class="text-muted">(pagamento à vista)</small>';
                    }
                }
            }
        }

        // Taxas do Asaas para cartão de crédito (baseadas na tabela oficial)
        // À vista (1x) não cobra taxas, somente a partir de 2x
        const asaasTaxas = {
            1: { taxa: 0, adicional: 0 },          // À vista: sem taxas
            2: { taxa: 3.49, adicional: 0.49 },   // 2 a 6 parcelas: R$ 0,49 + 3,49%
            3: { taxa: 3.49, adicional: 0.49 },
            4: { taxa: 3.49, adicional: 0.49 },
            5: { taxa: 3.49, adicional: 0.49 },
            6: { taxa: 3.49, adicional: 0.49 },
            7: { taxa: 3.99, adicional: 0.49 },   // 7 a 12 parcelas: R$ 0,49 + 3,99%
            8: { taxa: 3.99, adicional: 0.49 },
            9: { taxa: 3.99, adicional: 0.49 },
            10: { taxa: 3.99, adicional: 0.49 },
            11: { taxa: 3.99, adicional: 0.49 },
            12: { taxa: 4.29, adicional: 0.49 }   // 13 a 21 parcelas: R$ 0,49 + 4,29%
        };

        // Calcular valor total com taxas do Asaas
        function calcularValorComTaxas(valorOriginal, parcelas) {
            const config = asaasTaxas[parcelas];
            if (!config) return { valorTotal: valorOriginal, valorParcela: valorOriginal };
            
            // Calcular taxa percentual
            const taxaPercentual = valorOriginal * (config.taxa / 100);
            
            // Somar taxa fixa + taxa percentual
            const valorTotal = valorOriginal + config.adicional + taxaPercentual;
            
            // Calcular valor da parcela
            const valorParcela = valorTotal / parcelas;
            
            return {
                valorTotal: valorTotal,
                valorParcela: valorParcela,
                taxaAplicada: config.adicional + taxaPercentual
            };
        }

        // Gerar opções de parcelamento com valores reais do Asaas
        function generateInstallments() {
            const carrinhoData = sessionStorage.getItem('carrinho');
            if (!carrinhoData) return;

            const carrinho = JSON.parse(carrinhoData);
            const valorOriginal = calcularValorCarrinho(carrinho);
            const descontoCupom = carrinho.desconto_cupom || 0;
            
            // CORREÇÃO: Aplicar desconto do cupom no valor para parcelamento
            const valorParaParcelamento = Math.max(0, valorOriginal - descontoCupom);
            
            // Verificar valor mínimo
            if (valorParaParcelamento < 5) {
                // Valor menor que R$ 5,00 - não processa cartão nem PIX
                document.getElementById('installments-list').innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>Valor mínimo não atingido</strong><br>
                        O valor mínimo para pagamento é R$ 5,00.
                    </div>
                `;
                desabilitarPagamentos();
                return;
            }
            
            const installmentsList = document.getElementById('installments-list');
            let html = '';

            for (let i = 1; i <= 12; i++) {
                const resultado = calcularValorComTaxas(valorParaParcelamento, i);
                
                // Verificar se a parcela é menor que R$ 5,00
                if (resultado.valorParcela < 5 && i > 1) {
                    continue; // Pular parcelas menores que R$ 5,00
                }
                
                const isSelected = i === 1 ? 'selected' : ''; // 1x selecionado como padrão
                
                let descricaoTexto = '';
                if (i === 1) {
                    descricaoTexto = ' à vista';
                } else {
                    descricaoTexto = ' com juros';
                }
                
                html += `
                    <div class="installment-option ${isSelected}" onclick="selectInstallment(this, ${i})">
                        <div>
                            <input type="radio" name="installments" value="${i}" ${i === 1 ? 'checked' : ''}>
                            <strong>${i}x de R$ ${formatPrice(resultado.valorParcela)}</strong>${descricaoTexto}
                        </div>
                    </div>
                `;
            }
            
            // Se valor é exatamente R$ 5,00, só mostrar à vista
            if (valorParaParcelamento === 5) {
                html = `
                    <div class="installment-option selected" onclick="selectInstallment(this, 1)">
                        <div>
                            <input type="radio" name="installments" value="1" checked>
                            <strong>1x de R$ ${formatPrice(valorParaParcelamento)}</strong> à vista
                        </div>
                    </div>
                    <div class="alert alert-info mt-2">
                        <i class="fas fa-info-circle me-2"></i>
                        <small>Para valores de R$ 5,00, apenas pagamento à vista.</small>
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
            
            // Atualizar valor total no resumo
            updateSummaryTotal(installments);
        }

        // Desabilitar métodos de pagamento para valores menores que R$ 5,00
        function desabilitarPagamentos() {
            // Desabilitar botões de método de pagamento
            const cartaoBtn = document.querySelector('input[value="credit"]');
            const pixBtn = document.querySelector('input[value="pix"]');
            const boletoBtn = document.querySelector('input[value="boleto"]');
            
            if (cartaoBtn) {
                cartaoBtn.disabled = true;
                cartaoBtn.closest('.payment-method').classList.add('disabled');
            }
            if (pixBtn) {
                pixBtn.disabled = true;
                pixBtn.closest('.payment-method').classList.add('disabled');
            }
            if (boletoBtn) {
                boletoBtn.disabled = true;
                boletoBtn.closest('.payment-method').classList.add('disabled');
            }
            
            // Esconder detalhes de pagamento
            document.getElementById('credit-details').style.display = 'none';
            document.getElementById('pix-details').style.display = 'none';
            
            // Desabilitar botão de finalizar
            const finalizarBtn = document.getElementById('finalizar-pedido');
            if (finalizarBtn) {
                finalizarBtn.disabled = true;
                finalizarBtn.textContent = 'Valor mínimo não atingido';
                finalizarBtn.classList.add('btn-secondary');
                finalizarBtn.classList.remove('btn-success');
            }
        }
        
        // Habilitar métodos de pagamento novamente
        function habilitarPagamentos() {
            // Habilitar botões de método de pagamento
            const cartaoBtn = document.querySelector('input[value="credit"]');
            const pixBtn = document.querySelector('input[value="pix"]');
            const boletoBtn = document.querySelector('input[value="boleto"]');
            
            if (cartaoBtn) {
                cartaoBtn.disabled = false;
                cartaoBtn.closest('.payment-method').classList.remove('disabled');
            }
            if (pixBtn) {
                pixBtn.disabled = false;
                pixBtn.closest('.payment-method').classList.remove('disabled');
            }
            if (boletoBtn) {
                boletoBtn.disabled = false;
                boletoBtn.closest('.payment-method').classList.remove('disabled');
            }
            
            // Habilitar botão de finalizar
            const finalizarBtn = document.getElementById('finalizar-pedido');
            if (finalizarBtn) {
                finalizarBtn.disabled = false;
                finalizarBtn.textContent = 'Finalizar Pedido';
                finalizarBtn.classList.remove('btn-secondary');
                finalizarBtn.classList.add('btn-success');
            }
        }

        // Atualizar total no resumo com base no parcelamento selecionado
        function updateSummaryTotal(parcelas) {
            const carrinhoData = sessionStorage.getItem('carrinho');
            if (!carrinhoData) return;

            const carrinho = JSON.parse(carrinhoData);
            const valorOriginal = calcularValorCarrinho(carrinho);
            const descontoCupom = carrinho.desconto_cupom || 0;
            
            // CORREÇÃO: Aplicar desconto do cupom ANTES de calcular as taxas de parcelamento
            const valorComDesconto = Math.max(0, valorOriginal - descontoCupom);
            const resultado = calcularValorComTaxas(valorComDesconto, parcelas);
            
            const valorTotalElement = document.getElementById('valor-total');
            if (valorTotalElement) {
                valorTotalElement.textContent = 'R$ ' + formatPrice(resultado.valorTotal);
                
                // Atualizar texto explicativo
                const summaryTotals = document.getElementById('summary-totals');
                let infoText = '';
                
                if (parcelas === 1) {
                    infoText = '<small class="text-muted">(pagamento à vista)</small>';
                } else {
                    infoText = `<small class="text-muted">(${parcelas}x de R$ ${formatPrice(resultado.valorParcela)})</small>`;
                }
                
                // Remover texto anterior e adicionar novo
                const existingSmall = summaryTotals.querySelector('small');
                if (existingSmall) {
                    existingSmall.remove();
                }
                summaryTotals.insertAdjacentHTML('beforeend', infoText);
            }
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
                showCustomDialog(
                    'Por favor, selecione uma forma de pagamento antes de continuar.',
                    'warning',
                    {
                        title: 'Forma de Pagamento'
                    }
                );
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
                showCustomDialog(
                    'Preencha todos os campos obrigatórios antes de continuar:<br><br>• ' + camposFaltando.join('<br>• '),
                    'warning',
                    {
                        title: 'Campos Obrigatórios'
                    }
                );
                return;
            }

            // Verificar e-mail
            const email = document.getElementById('email').value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showCustomDialog(
                    'Por favor, insira um e-mail válido no formato: exemplo@dominio.com',
                    'warning',
                    {
                        title: 'E-mail Inválido'
                    }
                );
                return;
            }

            /**
             * Validar WhatsApp para formato brasileiro
             */
            function validarWhatsApp(whatsapp) {
                // Limpar tudo que não é número
                let numero = whatsapp.replace(/[^0-9]/g, '');
                
                // Remover código do país se presente (55)
                if (numero.length === 13 && numero.startsWith('55')) {
                    numero = numero.substring(2);
                }
                
                // Remover zero inicial se presente (0XX)
                if (numero.length === 12 && numero.startsWith('0')) {
                    numero = numero.substring(1);
                }
                
                // Se tem 10 dígitos, adicionar 9 na 3ª posição
                if (numero.length === 10) {
                    numero = numero.substring(0, 2) + '9' + numero.substring(2);
                }
                
                // Validar formato final: 11 dígitos com 9 na 3ª posição
                if (numero.length === 11 && numero.charAt(2) === '9') {
                    return { valido: true, numero: numero, erro: null };
                }
                
                return { 
                    valido: false, 
                    numero: numero, 
                    erro: 'WhatsApp deve ter formato válido brasileiro: (11) 99999-9999' 
                };
            }

            // Verificar WhatsApp
            const whatsapp = document.getElementById('whatsapp').value;
            const validacaoWhatsApp = validarWhatsApp(whatsapp);
            
            if (!validacaoWhatsApp.valido) {
                showCustomDialog(
                    validacaoWhatsApp.erro + '<br><br><strong>Formato atual:</strong> ' + whatsapp + 
                    '<br><strong>Exemplo correto:</strong> (11) 99999-9999<br><strong>Exemplo correto:</strong> (21) 98765-4321',
                    'warning',
                    {
                        title: 'WhatsApp Inválido'
                    }
                );
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
                
                const response = await fetch('/evento/api/processar-pedido.php', {
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
                        // Para PIX, redirecionar para página específica com o pedido_id
                        const pedidoParam = result.pedido && result.pedido.codigo_pedido ? 
                            '&pedido_id=' + encodeURIComponent(result.pedido.codigo_pedido) : '';
                        window.location.href = '/evento/pagamento-pix.php?evento=' + encodeURIComponent('<?php echo $slug; ?>') + pedidoParam;
                    } else {
                        // Para outros métodos, redirecionar diretamente
                        window.location.href = '/evento/pagamento-boleto.php?evento=' + encodeURIComponent('<?php echo $slug; ?>');
                    }
                } else {
                    showCustomDialog(
                        'Erro ao processar o pedido: ' + (result.message || 'Erro desconhecido'),
                        'error',
                        {
                            title: 'Erro no Processamento'
                        }
                    );
                }
                
            } catch (error) {
                console.error('Erro ao processar pedido:', error);
                showCustomDialog(
                    'Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.',
                    'error',
                    {
                        title: 'Erro de Conexão'
                    }
                );
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
                showCustomDialog(
                    'Preencha todos os dados do cartão de crédito antes de continuar.',
                    'warning',
                    {
                        title: 'Dados do Cartão'
                    }
                );
                return false;
            }

            // Validações avançadas com detecção de bandeira
            const validation = validateCardData(cardNumber, cardExpiry, cardCvv);
            
            if (!validation.valid) {
                showCustomDialog(
                    validation.message,
                    'warning',
                    {
                        title: 'Dados do Cartão Inválidos'
                    }
                );
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
                    ano: (() => {
                        const anoInput = document.getElementById('card_expiry').value.split('/')[1];
                        // Se já tem 4 dígitos, usar como está. Se tem 2, adicionar '20'
                        return anoInput.length === 4 ? anoInput : '20' + anoInput;
                    })(),
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
                    showCustomDialog(
                        'Dados incompletos para processamento do pagamento. Campos faltando: ' + camposFaltando.join(', '),
                        'error',
                        {
                            title: 'Dados Incompletos'
                        }
                    );
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
                    customer: compradorAsaas  // Corrigido: 'customer' conforme documentação Asaas
                };
                
                console.log('Dados completos para envio:', pagamentoData);
                
                const response = await fetch('/evento/api/pagamento-cartao.php', {
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
                    
                    // Verificar se foi aprovado imediatamente
                    if (result.approved) {
                        // Pagamento aprovado imediatamente
                        if (result.pedido && result.pedido.codigo_pedido) {
                            window.location.href = '/evento/pagamento-sucesso.php?pedido_id=' + encodeURIComponent(result.pedido.codigo_pedido);
                        } else {
                            window.location.href = '/evento/pagamento-sucesso.php';
                        }
                    } else {
                        // Pagamento em processamento - iniciar verificação
                        mostrarProcessandoPagamento();
                        verificarStatusPagamento(result.payment.id, result.pedido?.codigo_pedido);
                    }
                } else {
                    // AQUI É ONDE MUDAMOS O ALERT POR DIALOG CUSTOMIZADO
                    customAlert('Problema no pagamento: ' + result.message);
                }
                
            } catch (error) {
                console.error('Erro ao processar pagamento cartão:', error);
                customAlert('Erro ao processar pagamento: ' + error.message);
            }
        }

        // Mostrar tela de processamento
        function mostrarProcessandoPagamento() {
            // Criar overlay de processamento
            const overlay = document.createElement('div');
            overlay.id = 'processamento-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                backdrop-filter: blur(5px);
            `;
            
            overlay.innerHTML = `
                <div style="
                    background: white;
                    padding: 3rem;
                    border-radius: 15px;
                    text-align: center;
                    max-width: 400px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                ">
                    <div style="
                        width: 60px;
                        height: 60px;
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #007bff;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 1.5rem;
                    "></div>
                    <h4 style="margin-bottom: 1rem; color: #333;">Processando Pagamento</h4>
                    <p style="color: #666; margin-bottom: 1.5rem;">
                        Aguarde enquanto confirmamos seu pagamento com a operadora...
                    </p>
                    <div id="tempo-processamento" style="color: #007bff; font-weight: bold;">
                        Tempo: <span id="contador">0</span>s
                    </div>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            
            document.body.appendChild(overlay);
            
            // Iniciar contador de tempo
            let tempo = 0;
            const contador = document.getElementById('contador');
            const intervaloCont = setInterval(() => {
                tempo++;
                if (contador) {
                    contador.textContent = tempo;
                }
            }, 1000);
            
            // Salvar o intervalo para poder limpar depois
            window.contadorProcessamento = intervaloCont;
        }
        
        // Verificar status do pagamento
        function verificarStatusPagamento(paymentId, codigoPedido) {
            let tentativas = 0;
            const maxTentativas = 24; // 2 minutos (24 x 5 segundos)
            
            const verificar = async () => {
                try {
                    tentativas++;
                    console.log(`Verificação ${tentativas}/${maxTentativas} - Payment ID: ${paymentId}`);
                    
                    const response = await fetch(`/evento/api/verificar-status-pagamento.php?payment_id=${paymentId}`);
                    const result = await response.json();
                    
                    console.log('Status verificação:', result);
                    
                    if (result.success) {
                        if (result.approved) {
                            // Pagamento aprovado!
                            limparProcessamento();
                            
                            if (codigoPedido) {
                                window.location.href = '/evento/pagamento-sucesso.php?pedido_id=' + encodeURIComponent(codigoPedido);
                            } else {
                                window.location.href = '/evento/pagamento-sucesso.php';
                            }
                            return;
                        }
                        
                        // Se ainda está processando e não excedeu tentativas, continuar
                        if (tentativas < maxTentativas) {
                            setTimeout(verificar, 5000); // Verificar novamente em 5 segundos
                        } else {
                            // Timeout - redirecionar para página com status pendente
                            limparProcessamento();
                            mostrarTimeoutPagamento(codigoPedido);
                        }
                    } else {
                        console.error('Erro ao verificar status:', result.message);
                        if (tentativas < maxTentativas) {
                            setTimeout(verificar, 5000);
                        } else {
                            limparProcessamento();
                            mostrarTimeoutPagamento(codigoPedido);
                        }
                    }
                } catch (error) {
                    console.error('Erro na verificação:', error);
                    if (tentativas < maxTentativas) {
                        setTimeout(verificar, 5000);
                    } else {
                        limparProcessamento();
                        mostrarTimeoutPagamento(codigoPedido);
                    }
                }
            };
            
            // Iniciar verificação após 3 segundos
            setTimeout(verificar, 3000);
        }
        
        // Limpar tela de processamento
        function limparProcessamento() {
            const overlay = document.getElementById('processamento-overlay');
            if (overlay) {
                overlay.remove();
            }
            
            if (window.contadorProcessamento) {
                clearInterval(window.contadorProcessamento);
            }
        }
        
        // Mostrar timeout do pagamento
        function mostrarTimeoutPagamento(codigoPedido) {
            showCustomDialog(
                'O processamento do pagamento está demorando mais que o esperado. Você será redirecionado para acompanhar o status do seu pedido.',
                'warning',
                {
                    title: 'Processamento Demorado',
                    okText: 'Acompanhar Status',
                    onOk: () => {
                        if (codigoPedido) {
                            window.location.href = `/evento/status-pagamento.php?pedido_id=${encodeURIComponent(codigoPedido)}`;
                        } else {
                            window.location.href = '/';
                        }
                    }
                }
            );
        }
        
        // Verificar valor mínimo e ajustar interface
        function verificarValorMinimo() {
            const carrinhoData = sessionStorage.getItem('carrinho');
            if (!carrinhoData) return;
            
            const carrinho = JSON.parse(carrinhoData);
            const valorOriginal = calcularValorCarrinho(carrinho);
            const descontoCupom = carrinho.desconto_cupom || 0;
            const valorFinal = Math.max(0, valorOriginal - descontoCupom);
            
            // Se valor final é zero por cupom, não aplicar validação de valor mínimo
            if (valorFinal <= 0 && descontoCupom > 0) {
                // Compra gratuita por cupom - não precisa verificar valor mínimo
                return;
            }
            
            if (valorFinal > 0 && valorFinal < 5) {
                // Valor menor que R$ 5,00 - nenhum método disponível
                desabilitarPagamentos();
                
                // Mostrar aviso na seção de pagamento
                const paymentSection = document.querySelector('.payment-methods');
                if (paymentSection) {
                    const aviso = document.createElement('div');
                    aviso.className = 'alert alert-danger mb-3';
                    aviso.innerHTML = `
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>Valor insuficiente para pagamento</strong><br>
                        O valor mínimo para qualquer forma de pagamento é <strong>R$ 5,00</strong>.
                        <br><small>Adicione mais itens ao seu carrinho para continuar.</small>
                    `;
                    paymentSection.prepend(aviso);
                }
            } else {
                // Valor R$ 5,00 ou mais - todos os métodos disponíveis (PIX liberado)
                // Remover overlays se existirem
                document.querySelectorAll('.disabled-overlay').forEach(overlay => overlay.remove());
                document.querySelectorAll('.payment-option').forEach(option => option.classList.remove('disabled'));
                
                // Remover avisos antigos
                document.querySelectorAll('.alert-info, .alert-danger').forEach(alert => alert.remove());
            }
        }

        // Renderizar resumo básico
        function loadCheckoutData() {
            console.log('🔄 Iniciando loadCheckoutData...');
            
            let carrinhoData = sessionStorage.getItem('carrinho');
            
            if (!carrinhoData) {
                // Se não há carrinho, redirecionar de volta para o evento
                console.error('Nenhum carrinho encontrado, redirecionando para o evento');
                window.location.href = '/evento/?evento=<?php echo urlencode($slug); ?>';
                return;
            }
            
            console.log('📦 Carrinho encontrado no sessionStorage');
            const carrinho = JSON.parse(carrinhoData);
            
            // Verificar se elementos existem
            const summaryTickets = document.getElementById('summary-tickets');
            const subtotalElement = document.getElementById('valor-subtotal');
            const totalElement = document.getElementById('valor-total');
            const summaryTotals = document.getElementById('summary-totals');
            
            console.log('🔍 Verificando elementos DOM:', {
                summaryTickets: !!summaryTickets,
                subtotalElement: !!subtotalElement,
                totalElement: !!totalElement,
                summaryTotals: !!summaryTotals
            });
            
            // Renderizar ingressos
            if (carrinho.ingressos && summaryTickets) {
                const ticketsHtml = carrinho.ingressos.map(ingresso => `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <div class="fw-semibold">${ingresso.nome}</div>
                            <small class="text-muted">Qtd: ${ingresso.quantidade}</small>
                        </div>
                        <div>R$ ${parseFloat(ingresso.subtotal).toFixed(2).replace('.', ',')}</div>
                    </div>
                `).join('');
                
                summaryTickets.innerHTML = ticketsHtml;
                
                // DEBUG: Verificar dados do carrinho
                console.log('🛒 Dados do carrinho:', carrinho);
                console.log('📊 Subtotal do carrinho:', carrinho.subtotal);
                console.log('📊 Total do carrinho:', carrinho.total);
                
                // Calcular e exibir valores com desconto de cupom
                let valorSubtotal = calcularValorCarrinho(carrinho);
                
                const descontoCupom = carrinho.desconto_cupom || 0;
                const valorFinal = Math.max(0, valorSubtotal - descontoCupom);
                
                console.log('💰 Valores calculados - Subtotal:', valorSubtotal, 'Desconto:', descontoCupom, 'Final:', valorFinal);
                
                // Atualizar subtotal - verificar se elemento existe
                const subtotalElement = document.getElementById('valor-subtotal');
                if (subtotalElement) {
                    subtotalElement.textContent = 'R$ ' + parseFloat(valorSubtotal).toFixed(2).replace('.', ',');
                }
                
                // Mostrar/ocultar linha de desconto
                const descontoRow = document.getElementById('desconto-cupom-row');
                if (descontoCupom > 0 && carrinho.cupom) {
                    if (descontoRow) {
                        descontoRow.style.display = 'flex';
                    }
                    const descontoElement = document.getElementById('valor-desconto-cupom');
                    if (descontoElement) {
                        descontoElement.textContent = '- R$ ' + parseFloat(descontoCupom).toFixed(2).replace('.', ',');
                    }
                    const codigoCupomElement = document.getElementById('codigo-cupom-display');
                    if (codigoCupomElement) {
                        codigoCupomElement.textContent = '(' + carrinho.cupom.codigo + ')';
                    }
                } else {
                    if (descontoRow) {
                        descontoRow.style.display = 'none';
                    }
                }
                
                // CORREÇÃO: Atualizar total final CORRETAMENTE - verificar se elemento existe
                const totalElement = document.getElementById('valor-total');
                if (totalElement) {
                    totalElement.textContent = 'R$ ' + parseFloat(valorFinal).toFixed(2).replace('.', ',');
                }
                
                // CORREÇÃO: Atualizar texto informativo baseado no valor
                const summaryTotals = document.getElementById('summary-totals');
                if (summaryTotals) {
                    const existingSmall = summaryTotals.querySelector('small');
                    if (existingSmall) {
                        existingSmall.remove();
                    }
                    
                    // Mostrar texto apropriado baseado no valor
                    if (valorFinal > 0) {
                        summaryTotals.insertAdjacentHTML('beforeend', '<small class="text-muted">(selecione a forma de pagamento)</small>');
                    } else {
                        summaryTotals.insertAdjacentHTML('beforeend', '<small class="text-success fw-bold">(compra sem custos)</small>');
                    }
                }
                
                // Verificar se é compra gratuita
                if (valorFinal <= 0) {
                    mostrarOpcaoCompraGratuita();
                } else {
                    ocultarOpcaoCompraGratuita();
                }
                
                // CORREÇÃO: Verificar valor mínimo após atualizar valores
                verificarValorMinimo();
            }
        }

        // Inicializar quando a página carrega
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM carregado, iniciando checkout...');
            
            // Aguardar um pouco para garantir que todos os elementos estejam prontos
            setTimeout(() => {
                startTimer();
                loadCheckoutData();
                
                // Verificar valor mínimo na inicialização
                verificarValorMinimo();
            }, 100);
            
            // Se comprador está logado, mostrar seções automaticamente
            const compradorLogado = <?php echo json_encode($comprador_logado); ?>;
            if (compradorLogado) {
                document.getElementById('dados-comprador-section').style.display = 'block';
                document.getElementById('pagamento-section').style.display = 'block';
            }

            // Máscaras para campos
            // Máscara para WhatsApp (mais inteligente)
            const whatsappField = document.getElementById('whatsapp');
            if (whatsappField) {
                whatsappField.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    
                    // Remover código do país se digitado
                    if (value.startsWith('55') && value.length > 11) {
                        value = value.substring(2);
                    }
                    
                    // Remover zero inicial
                    if (value.startsWith('0') && value.length > 10) {
                        value = value.substring(1);
                    }
                    
                    // Se tem 10 dígitos e não começa com 9 na 3ª posição, adicionar
                    if (value.length === 10 && value.charAt(2) !== '9') {
                        value = value.substring(0, 2) + '9' + value.substring(2);
                    }
                    
                    // Aplicar máscara
                    if (value.length <= 11) {
                        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                    }
                    
                    e.target.value = value;
                    
                    // Validação visual em tempo real
                    const numeroLimpo = value.replace(/\D/g, '');
                    if (numeroLimpo.length === 11 && numeroLimpo.charAt(2) === '9') {
                        e.target.style.borderColor = '#28a745'; // Verde se válido
                        e.target.style.backgroundColor = '#f8fff8';
                    } else if (numeroLimpo.length > 0) {
                        e.target.style.borderColor = '#ffc107'; // Amarelo se incompleto
                        e.target.style.backgroundColor = '#fffef8';
                    } else {
                        e.target.style.borderColor = '#dee2e6'; // Padrão se vazio
                        e.target.style.backgroundColor = 'white';
                    }
                });
                
                // Dica visual no placeholder
                whatsappField.placeholder = '(11) 99999-9999';
                whatsappField.title = 'Digite seu WhatsApp com DDD. Ex: (11) 99999-9999';
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

            // ========================================
            // EVENT LISTENERS PARA MÁSCARAS DE CARTÃO COM DETECÇÃO DE BANDEIRA
            // ========================================

            // Máscaras para campos do cartão
            const cardNumberField = document.getElementById('card_number');
            if (cardNumberField) {
                cardNumberField.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    
                    // Detectar bandeira e atualizar logo
                    const brand = detectCardBrand(value);
                    updateCardBrandLogo(brand);
                    
                    // Aplicar máscara baseada na bandeira
                    if (brand === 'amex') {
                        // American Express: 4-6-5
                        value = value.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
                    } else {
                        // Outros cartões: 4-4-4-4
                        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                    }
                    
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
        
        // ========================================
        // FUNÇÕES PARA COMPRA GRATUITA COM CUPOM
        // ========================================
        
        function mostrarOpcaoCompraGratuita() {
            console.log('🎁 Mostrando opção de compra gratuita');
            
            // SEMPRE ocultar opções de pagamento quando valor é zero
            const paymentOptions = document.querySelectorAll('.payment-option');
            paymentOptions.forEach(option => {
                option.style.display = 'none';
                console.log('🚫 Ocultando opção de pagamento:', option);
            });
            
            // Ocultar seções de cartão e PIX
            const cardForm = document.getElementById('card-form');
            const pixForm = document.getElementById('pix-form');
            if (cardForm) {
                cardForm.style.display = 'none';
                console.log('🚫 Ocultando formulário de cartão');
            }
            if (pixForm) {
                pixForm.style.display = 'none';
                console.log('🚫 Ocultando formulário PIX');
            }
            
            // Ocultar botão "Finalizar Compra"
            const finalizeBtns = document.querySelectorAll('button[onclick="finalizePayment()"]');
            finalizeBtns.forEach(btn => {
                btn.style.display = 'none';
                console.log('🚫 Ocultando botão Finalizar Compra');
            });
            
            // Atualizar texto informativo
            const infoText = document.querySelector('#summary-totals small');
            if (infoText) {
                infoText.textContent = '(compra sem custos)';
                infoText.className = 'text-success fw-bold';
                console.log('✅ Texto informativo atualizado');
            }
            
            // AGUARDAR usuário escolher preencher dados ou fazer login
            // Não criar o botão ainda - será criado pelo toggleLoginOption
            console.log('⏳ Aguardando usuário escolher opção de dados');
        }
        
        function ocultarOpcaoCompraGratuita() {
            console.log('💳 Ocultando opção de compra gratuita e mostrando pagamento normal');
            
            // Mostrar opções de pagamento normais
            const paymentOptions = document.querySelectorAll('.payment-option');
            paymentOptions.forEach(option => {
                option.style.display = 'block';
                console.log('✅ Mostrando opção de pagamento');
            });
            
            // Mostrar botão "Finalizar Compra"
            const finalizeBtns = document.querySelectorAll('button[onclick="finalizePayment()"]');
            finalizeBtns.forEach(btn => {
                btn.style.display = 'block';
                console.log('✅ Mostrando botão Finalizar Compra');
            });
            
            // Ocultar botão de compra gratuita
            const freeBtn = document.getElementById('btn-compra-gratuita');
            if (freeBtn) {
                freeBtn.style.display = 'none';
                console.log('🚫 Ocultando botão compra gratuita');
            }
            
            // Restaurar texto informativo
            const infoText = document.querySelector('#summary-totals small');
            if (infoText) {
                infoText.textContent = '(selecione a forma de pagamento)';
                infoText.className = 'text-muted';
                console.log('✅ Texto informativo restaurado');
            }
        }
        
        async function processarCompraGratuita() {
            const btn = document.getElementById('btn-compra-gratuita');
            const originalText = btn.innerHTML;
            
            // Validar formulário primeiro
            if (!validarFormulario()) {
                return;
            }
            
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...';
            
            try {
                // Usar EXATAMENTE o mesmo fluxo de uma compra paga
                // Simular que veio confirmação do webhook
                
                // Obter dados do carrinho e comprador
                const carrinhoData = sessionStorage.getItem('carrinho');
                const carrinho = JSON.parse(carrinhoData);
                
                // Dados do comprador (mesmo formato da compra paga)
                const comprador = {
                    nome_completo: document.getElementById('nome_completo')?.value || '',
                    email: document.getElementById('email')?.value || '',
                    whatsapp: document.getElementById('whatsapp')?.value || '',
                    tipo_documento: document.getElementById('tipo_documento')?.value || '',
                    documento: document.getElementById('documento')?.value || '',
                    cep: document.getElementById('cep')?.value || '',
                    endereco: document.getElementById('endereco')?.value || '',
                    numero: document.getElementById('numero')?.value || '',
                    complemento: document.getElementById('complemento')?.value || '',
                    bairro: document.getElementById('bairro')?.value || '',
                    cidade: document.getElementById('cidade')?.value || '',
                    estado: document.getElementById('estado')?.value || '',
                    data_nascimento: document.getElementById('data_nascimento')?.value || ''
                };
                
                // Dados do pagamento (simulando aprovação instantânea)
                const pagamento = {
                    metodo: 'gratuito',
                    parcelas: 1,
                    status: 'approved', // Simular aprovação
                    payment_id: 'GRATUITO_' + Date.now()
                };
                
                // Dados do participante (necessário para API)
                const participante = {
                    metodo_dados: 'cadastro', // Sempre cadastro para compra gratuita
                    email: comprador.email,
                    nome: comprador.nome_completo,
                    whatsapp: comprador.whatsapp
                };
                
                // Enviar para a API principal (mesma que processa compras pagas)
                console.log('📤 Processando como compra normal - valor R$ 0,00');
                
                const response = await fetch('/evento/api/processar-pedido.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        carrinho: carrinho,
                        participante: participante,
                        comprador: comprador,
                        pagamento: pagamento
                    })
                });
                
                console.log('📥 Response status:', response.status);
                console.log('📥 Response headers:', [...response.headers.entries()]);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const responseText = await response.text();
                console.log('📥 Raw response:', responseText);
                
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (e) {
                    console.error('Erro ao fazer parse do JSON:', e);
                    console.error('Response text:', responseText);
                    throw new Error('Resposta inválida do servidor');
                }
                
                console.log('📥 Response data parsed:', result);
                
                if (result.success) {
                    console.log('✅ Pedido processado com sucesso!', result);
                    
                    // Limpar carrinho
                    sessionStorage.removeItem('carrinho');
                    
                    // Redirecionar para página de sucesso (mesma da compra paga)
                    const codigoPedido = result.pedido?.codigo_pedido || 'erro';
                    window.location.href = `/evento/pagamento-sucesso.php?pedido_id=${codigoPedido}`;
                } else {
                    console.error('❌ Erro retornado pela API:', result);
                    throw new Error(result.message || 'Erro ao processar pedido');
                }
                
            } catch (error) {
                console.error('🚨 Erro detalhado:', error);
                console.error('🚨 Stack trace:', error.stack);
                
                let errorMessage = 'Erro ao processar compra gratuita: ' + error.message;
                
                // Se for erro de rede
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    errorMessage = 'Erro de conexão com o servidor. Verifique sua conexão de internet.';
                }
                
                showCustomDialog(
                    errorMessage,
                    'error',
                    { title: 'Erro no Processamento' }
                );
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }
        
        // Função para obter dados do formulário
        function obterDadosFormulario() {
            return {
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value,
                documento: document.getElementById('documento').value,
                tipo_documento: document.getElementById('tipo_documento').value,
                telefone: document.getElementById('telefone').value,
                whatsapp: document.getElementById('whatsapp').value,
                cep: document.getElementById('cep').value,
                endereco: document.getElementById('endereco').value,
                numero: document.getElementById('numero').value,
                complemento: document.getElementById('complemento').value,
                bairro: document.getElementById('bairro').value,
                cidade: document.getElementById('cidade').value,
                estado: document.getElementById('estado').value
            };
        }
        
        // Função básica de validação do formulário
        function validarFormulario() {
            const campos = [
                { id: 'nome_completo', nome: 'Nome completo' },
                { id: 'email', nome: 'E-mail' },
                { id: 'whatsapp', nome: 'WhatsApp' },
                { id: 'documento', nome: 'CPF/CNPJ' }
            ];
            
            for (let campo of campos) {
                const elemento = document.getElementById(campo.id);
                if (!elemento) {
                    console.error(`Campo ${campo.id} não encontrado`);
                    return false;
                }
                
                if (!elemento.value || !elemento.value.trim()) {
                    elemento.focus();
                    showCustomDialog(
                        `Por favor, preencha o campo ${campo.nome}`,
                        'warning',
                        { title: 'Campo Obrigatório' }
                    );
                    return false;
                }
            }
            
            return true;
        }
        
        // Função para verificar se todos os campos obrigatórios estão preenchidos
        function todosComposObrigatoriosPreenchidos() {
            const campos = ['nome', 'email', 'documento', 'telefone'];
            
            for (let campo of campos) {
                const elemento = document.getElementById(campo);
                if (!elemento || !elemento.value || !elemento.value.trim()) {
                    return false;
                }
            }
            
            return true;
        }
        
        // ========================================
        // FUNÇÕES PARA EXIBIR TERMOS E POLÍTICAS
        // ========================================
        
        function abrirDialogTermos(event) {
            event.preventDefault();
            
            // Buscar os termos do evento
            fetch('/evento/api/get-evento-termos.php?evento=<?php echo urlencode($slug); ?>')
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.termos) {
                        mostrarModalTermos('Termos e Condições', data.termos);
                    } else {
                        mostrarModalTermos('Termos e Condições', '<p>Termos não disponíveis para este evento.</p>');
                    }
                })
                .catch(error => {
                    console.error('Erro ao carregar termos:', error);
                    mostrarModalTermos('Termos e Condições', '<p>Erro ao carregar os termos. Tente novamente.</p>');
                });
        }
        
        function abrirDialogPoliticas(event) {
            event.preventDefault();
            
            // Buscar as políticas do evento
            fetch('/evento/api/get-evento-termos.php?evento=<?php echo urlencode($slug); ?>')
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.politicas) {
                        mostrarModalTermos('Política de Privacidade', data.politicas);
                    } else {
                        mostrarModalTermos('Política de Privacidade', '<p>Política de privacidade não disponível para este evento.</p>');
                    }
                })
                .catch(error => {
                    console.error('Erro ao carregar políticas:', error);
                    mostrarModalTermos('Política de Privacidade', '<p>Erro ao carregar a política. Tente novamente.</p>');
                });
        }
        
        function mostrarModalTermos(titulo, conteudo) {
            // Remover modal existente se houver
            const modalExistente = document.getElementById('modalTermos');
            if (modalExistente) {
                modalExistente.remove();
            }
            
            // Criar o modal
            const modalHTML = `
                <div class="modal fade" id="modalTermos" tabindex="-1" aria-labelledby="modalTermosLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-scrollable">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="modalTermosLabel">${titulo}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                            </div>
                            <div class="modal-body">
                                ${conteudo}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Adicionar ao DOM
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Exibir o modal
            const modal = new bootstrap.Modal(document.getElementById('modalTermos'));
            modal.show();
            
            // Remover do DOM quando fechar
            document.getElementById('modalTermos').addEventListener('hidden.bs.modal', function() {
                this.remove();
            });
        }
        
        console.log('Checkout carregado com sucesso!');
    </script>
</body>
</html>