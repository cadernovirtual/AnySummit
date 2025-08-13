<?php
// Checkout corrigido - Versão robusta e otimizada
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Função para tratamento de erros
function tratarErro($erro) {
    error_log("Erro Checkout: " . $erro);
    return false;
}

try {
    session_start();
    
    // Verificar conexão
    if (!file_exists("conm/conn.php")) {
        throw new Exception("Arquivo de conexão não encontrado");
    }
    include("conm/conn.php");
    
    if (!isset($con) || !$con) {
        throw new Exception("Falha na conexão com banco de dados");
    }
    
    // Verificar helpers
    if (!file_exists("../includes/imagem-helpers.php")) {
        throw new Exception("Arquivo de helpers não encontrado");
    }
    include("../includes/imagem-helpers.php");
    
    // Função de criptografia
    function criptografarPedidoId($pedido_id) {
        $chave = 'AnySummit2025@#$%';
        return base64_encode(openssl_encrypt($pedido_id, 'AES-128-CTR', $chave, 0, '1234567890123456'));
    }
    
    // Verificar slug
    $slug = isset($_GET['evento']) ? trim($_GET['evento']) : '';
    
    if (empty($slug)) {
        header('Location: /');
        exit;
    }
    
    // Buscar evento com prepared statement
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
        WHERE e.slug = ? AND e.status = 'publicado' AND e.visibilidade = 'publico'
        LIMIT 1
    ";
    
    $stmt = $con->prepare($sql_evento);
    if (!$stmt) {
        throw new Exception("Erro ao preparar query: " . $con->error);
    }
    
    $stmt->bind_param("s", $slug);
    $stmt->execute();
    $result_evento = $stmt->get_result();
    
    if ($result_evento->num_rows == 0) {
        header('Location: /');
        exit;
    }
    
    $evento = $result_evento->fetch_assoc();
    $stmt->close();
    
    // Nome do produtor
    $nome_produtor_display = '';
    if (!empty($evento['nome_exibicao'])) {
        $nome_produtor_display = $evento['nome_exibicao'];
    } elseif (!empty($evento['nome_fantasia'])) {
        $nome_produtor_display = $evento['nome_fantasia'];
    } else {
        $nome_produtor_display = $evento['nome_usuario'];
    }
    
    // Sessão de checkout
    if (!isset($_SESSION['checkout_session'])) {
        $_SESSION['checkout_session'] = uniqid('checkout_', true);
        $_SESSION['checkout_start_time'] = time();
    }
    
    $checkout_session = $_SESSION['checkout_session'];
    $time_remaining = 15 * 60 - (time() - $_SESSION['checkout_start_time']);
    
    if ($time_remaining <= 0) {
        unset($_SESSION['checkout_session']);
        unset($_SESSION['checkout_start_time']);
        header('Location: /evento/' . $slug . '?expired=1');
        exit;
    }
    
    // Verificar comprador logado
    $comprador_logado = false;
    $comprador_dados = null;
    
    if (isset($_COOKIE['compradorid']) && !empty($_COOKIE['compradorid'])) {
        $comprador_id = $_COOKIE['compradorid'];
        $sql_comprador = "SELECT * FROM compradores WHERE id = ? LIMIT 1";
        $stmt_comp = $con->prepare($sql_comprador);
        
        if ($stmt_comp) {
            $stmt_comp->bind_param("s", $comprador_id);
            $stmt_comp->execute();
            $result_comprador = $stmt_comp->get_result();
            
            if ($result_comprador && $result_comprador->num_rows > 0) {
                $comprador_dados = $result_comprador->fetch_assoc();
                $comprador_logado = true;
            }
            $stmt_comp->close();
        }
        
        if (!$comprador_logado) {
            setcookie('compradorid', '', time() - 3600, '/');
            setcookie('compradornome', '', time() - 3600, '/');
        }
    }
    
    // Funções helper
    function getCompradorData($field, $default = '') {
        global $comprador_logado, $comprador_dados;
        return ($comprador_logado && isset($comprador_dados[$field])) ? $comprador_dados[$field] : $default;
    }
    
    function isCompradorFieldSelected($field, $value) {
        global $comprador_logado, $comprador_dados;
        return ($comprador_logado && isset($comprador_dados[$field]) && $comprador_dados[$field] == $value) ? 'selected' : '';
    }
    
} catch (Exception $e) {
    error_log("Erro fatal no checkout: " . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    die('<!DOCTYPE html>
<html><head><title>Erro no Sistema</title></head><body>
<div style="padding:50px; text-align:center; font-family:Arial;">
<h2>Sistema Temporariamente Indisponível</h2>
<p>Estamos trabalhando para resolver este problema.</p>
<p><a href="/evento/' . htmlspecialchars($slug) . '">Voltar para o evento</a></p>
</div></body></html>');
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout - <?php echo htmlspecialchars($evento['nome']); ?></title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUa+IIVtdQrHPm7pNVT6+ZQl39dcFjx3rWJ7JOQ8WJP2GzZk4VYT3C3B8t2Q" crossorigin="anonymous">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" integrity="sha384-KyZXEAg3QhqLMpG8r+8fhAXLRk2vvoC2f3B09zVXn8CA5QIVfZOJ3BCsw2P0p/We" crossorigin="anonymous">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="css/checkout.css">
</head>
<body>
    <!-- Header -->
    <div class="checkout-header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <a href="/evento/<?php echo urlencode($slug); ?>" class="text-decoration-none">
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
                        <!-- Comprador Logado -->
                        <?php if ($comprador_logado && $comprador_dados): ?>
                        <div class="alert alert-success">
                            <div class="d-flex align-items-center justify-content-between">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-user-check text-success me-2"></i>
                                    <span><strong>Logado como:</strong> <?php echo htmlspecialchars(getCompradorData('nome', 'Usuário')); ?></span>
                                </div>
                                <button type="button" class="btn btn-sm btn-outline-danger" onclick="deslogarComprador()">
                                    <i class="fas fa-sign-out-alt me-1"></i>Sair
                                </button>
                            </div>
                        </div>
                        <?php else: ?>
                        <!-- Opções de Login/Cadastro -->
                        <div class="mb-4">
                            <h6 class="mb-3">Você já tem cadastro?</h6>
                            
                            <div class="login-option" onclick="toggleLoginOption('login')" data-login="login">
                                <div class="d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center">
                                        <i class="fas fa-sign-in-alt text-primary me-2"></i>
                                        <span>Já tenho cadastro - fazer login</span>
                                    </div>
                                    <input type="radio" name="comprador_method" value="login" class="form-check-input">
                                </div>
                            </div>

                            <div class="login-option" onclick="toggleLoginOption('cadastro')" data-login="cadastro">
                                <div class="d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center">
                                        <i class="fas fa-user-plus text-success me-2"></i>
                                        <span>Não tenho cadastro - preencher dados</span>
                                    </div>
                                    <input type="radio" name="comprador_method" value="cadastro" class="form-check-input">
                                </div>
                            </div>

                            <!-- Formulário de Login -->
                            <div id="comprador-login-form" style="display: none; padding: 15px; background: #f3f3f3; border-radius: 10px; border: 1px solid #d7d7d7; margin-top: 10px;">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6 class="mb-0">Login de Comprador</h6>
                                    <button type="button" class="btn btn-sm btn-outline-secondary" onclick="closeCompradorLogin()">
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
                                        <button type="button" class="btn btn-sm btn-primary" onclick="realizarLoginComprador()">
                                            <i class="fas fa-sign-in-alt me-2"></i>Entrar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <?php endif; ?>

                        <hr class="my-4">

                        <!-- Dados do Comprador -->
                        <div id="dados-comprador-section" style="display: <?php echo $comprador_logado ? 'block' : 'none'; ?>;">
                            <h6 class="mb-3">Dados do comprador</h6>
                            <form id="comprador-form">-md-3 mb-3">
                                        <label for="card_expiry" class="form-label">Validade *</label>
                                        <input type="text" class="form-control" id="card_expiry" name="card_expiry" placeholder="MM/AA">
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <label for="card_cvv" class="form-label">CVV *</label>
                                        <input type="text" class="form-control" id="card_cvv" name="card_cvv" placeholder="000">
                                    </div>
                                </div>

                                <!-- Parcelamento -->
                                <div class="mb-3">
                                    <label class="form-label">Parcelamento</label>
                                    <div id="installments-list">
                                        <!-- Preenchido via JavaScript -->
                                    </div>
                                </div>
                            </div>

                            <!-- Detalhes do PIX -->
                            <div id="pix-details" style="display: none;">
                                <div class="alert alert-info">
                                    <h6><i class="fab fa-pix me-2"></i>Pagamento via PIX</h6>
                                    <p class="mb-0">Ao finalizar a compra, será gerado um QR Code para pagamento instantâneo.</p>
                                </div>
                            </div>

                            <div class="text-end">
                                <button type="button" class="btn btn-primary-gradient" onclick="finalizePayment()">
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
                        <!-- Info do Evento -->
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
                            <!-- Preenchido via JavaScript -->
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
                                <a href="#" class="text-decoration-none">Termos e Políticas</a>.
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>
    
    <!-- JavaScript do Checkout -->
    <script src="js/checkout.js"></script>
    
    <script>
        // Variáveis globais
        const eventoSlug = '<?php echo addslashes($slug); ?>';
        const compradorLogado = <?php echo json_encode($comprador_logado); ?>;
        let timeRemaining = <?php echo $time_remaining; ?>;
        
        // Inicialização
        document.addEventListener('DOMContentLoaded', function() {
            try {
                initializeCheckout();
            } catch (error) {
                console.error('Erro na inicialização:', error);
                showError('Erro ao carregar checkout. Recarregue a página.');
            }
        });
        
        function initializeCheckout() {
            startTimer();
            loadCheckoutData();
            setupEventListeners();
            
            if (compradorLogado) {
                document.getElementById('dados-comprador-section').style.display = 'block';
                document.getElementById('pagamento-section').style.display = 'block';
            }
        }
        
        function startTimer() {
            const timerElement = document.getElementById('timer');
            
            const interval = setInterval(() => {
                const minutes = Math.floor(timeRemaining / 60);
                const seconds = timeRemaining % 60;
                
                timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                if (timeRemaining <= 0) {
                    clearInterval(interval);
                    alert('Tempo esgotado! Redirecionando...');
                    window.location.href = '/evento/' + eventoSlug;
                    return;
                }
                
                timeRemaining--;
            }, 1000);
        }
        
        function setupEventListeners() {
            // Máscaras para campos
            setupFieldMasks();
        }
        
        function setupFieldMasks() {
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

            // Máscaras para cartão
            const cardNumberField = document.getElementById('card_number');
            if (cardNumberField) {
                cardNumberField.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                    e.target.value = value;
                });
            }

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

            const cardCvvField = document.getElementById('card_cvv');
            if (cardCvvField) {
                cardCvvField.addEventListener('input', function(e) {
                    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
                });
            }
        }
        
        // Funções principais
        function toggleLoginOption(option) {
            document.querySelectorAll('.login-option').forEach(opt => {
                opt.classList.remove('selected');
            });

            document.querySelector(`[data-login="${option}"]`).classList.add('selected');
            
            const radioButton = document.querySelector(`input[value="${option}"]`);
            if (radioButton) {
                radioButton.checked = true;
            }

            const loginForm = document.getElementById('comprador-login-form');
            const dadosSection = document.getElementById('dados-comprador-section');
            const pagamentoSection = document.getElementById('pagamento-section');
            
            if (option === 'login') {
                loginForm.style.display = 'block';
                dadosSection.style.display = 'none';
                pagamentoSection.style.display = 'none';
            } else if (option === 'cadastro') {
                loginForm.style.display = 'none';
                dadosSection.style.display = 'block';
                pagamentoSection.style.display = 'block';
            }
        }

        function closeCompradorLogin() {
            document.getElementById('comprador-login-form').style.display = 'none';
            document.getElementById('dados-comprador-section').style.display = 'none';
            document.getElementById('pagamento-section').style.display = 'none';
            
            document.querySelectorAll('.login-option').forEach(opt => {
                opt.classList.remove('selected');
            });
        }

        function deslogarComprador() {
            if (confirm('Deseja sair da sua conta?')) {
                document.cookie = 'compradorid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'compradornome=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                location.reload();
            }
        }

        async function realizarLoginComprador() {
            const email = document.getElementById('comprador_login_email').value;
            const senha = document.getElementById('comprador_login_senha').value;

            if (!email || !senha) {
                showError('Preencha e-mail e senha.');
                return;
            }

            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Entrando...';
            btn.disabled = true;

            try {
                const response = await fetch('/evento/api/login-comprador.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });

                const result = await response.json();

                if (result.success) {
                    showSuccess('Login realizado! Recarregando...');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showError(result.message || 'Login inválido.');
                }
            } catch (error) {
                showError('Erro no login: ' + error.message);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }

        function toggleDocumentField() {
            const tipoDoc = document.getElementById('tipo_documento').value;
            const documentoField = document.getElementById('documento');
            
            if (tipoDoc === 'CPF') {
                documentoField.placeholder = '000.000.000-00';
                documentoField.maxLength = 14;
            } else {
                documentoField.placeholder = '00.000.000/0000-00';
                documentoField.maxLength = 18;
            }
        }

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
                        document.getElementById('endereco-fields').style.display = 'block';
                        document.getElementById('numero').focus();
                    } else {
                        showError('CEP não encontrado.');
                    }
                } catch (error) {
                    showError('Erro ao buscar CEP.');
                }
            }
        }

        function selectPayment(method) {
            document.querySelectorAll('.payment-option').forEach(option => {
                option.classList.remove('selected');
            });

            document.querySelector(`[data-payment="${method}"]`).classList.add('selected');
            document.querySelector(`input[value="${method}"]`).checked = true;

            document.getElementById('credit-details').style.display = method === 'credit' ? 'block' : 'none';
            document.getElementById('pix-details').style.display = method === 'pix' ? 'block' : 'none';
            
            if (method === 'credit') {
                generateInstallments();
            }
        }

        function generateInstallments() {
            // Simulação de parcelamento
            const html = `
                <div class="installment-option selected" onclick="selectInstallment(this, 1)">
                    <input type="radio" name="installments" value="1" checked>
                    <strong>1x de R$ 100,00</strong> à vista
                </div>
                <div class="installment-option" onclick="selectInstallment(this, 2)">
                    <input type="radio" name="installments" value="2">
                    <strong>2x de R$ 52,50</strong> com juros
                </div>
            `;
            document.getElementById('installments-list').innerHTML = html;
        }

        function selectInstallment(element, installments) {
            document.querySelectorAll('.installment-option').forEach(option => {
                option.classList.remove('selected');
            });
            element.classList.add('selected');
            element.querySelector('input').checked = true;
        }

        function loadCheckoutData() {
            // Simulação de dados do carrinho
            const ticketsHtml = `
                <div class="d-flex justify-content-between mb-2">
                    <div>
                        <div class="fw-semibold">Ingresso Padrão</div>
                        <small class="text-muted">Qtd: 1</small>
                    </div>
                    <div>R$ 100,00</div>
                </div>
            `;
            
            document.getElementById('summary-tickets').innerHTML = ticketsHtml;
            document.getElementById('valor-total').textContent = 'R$ 100,00';
        }

        async function finalizePayment() {
            const paymentMethod = document.querySelector('input[name="payment_method"]:checked');
            
            if (!paymentMethod) {
                showError('Selecione uma forma de pagamento.');
                return;
            }

            if (!validateForm()) {
                return;
            }

            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...';
            btn.disabled = true;

            try {
                // Simular processamento
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                if (paymentMethod.value === 'pix') {
                    window.location.href = '/evento/pagamento-pix.php?evento=' + eventoSlug;
                } else {
                    window.location.href = '/evento/pagamento-sucesso.php?evento=' + eventoSlug;
                }
                
            } catch (error) {
                showError('Erro ao processar pagamento: ' + error.message);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }

        function validateForm() {
            const requiredFields = [
                'nome_completo', 'email', 'whatsapp', 'documento', 
                'cep', 'endereco', 'numero', 'bairro', 'cidade', 'estado'
            ];
            
            for (let fieldId of requiredFields) {
                const field = document.getElementById(fieldId);
                if (!field || !field.value.trim()) {
                    showError(`Campo obrigatório: ${field ? field.previousElementSibling.textContent : fieldId}`);
                    return false;
                }
            }
            
            return true;
        }

        function showError(message) {
            alert('Erro: ' + message);
        }

        function showSuccess(message) {
            alert('Sucesso: ' + message);
        }
        
        console.log('Checkout corrigido carregado com sucesso!');
    </script>
</body>
</html>
