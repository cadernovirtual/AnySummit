<?php
// Habilitar exibição de erros para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
include("conm/conn.php");

// Obter slug do evento e pedido_id da URL
$slug = isset($_GET['evento']) ? $_GET['evento'] : '';
$pedido_id = isset($_GET['pedido_id']) ? $_GET['pedido_id'] : '';

if (empty($slug)) {
    header('Location: index.php');
    exit;
}

// Buscar dados do evento
$sql_evento = "
    SELECT e.*, u.nome as nome_usuario, u.nome_exibicao, c.nome_fantasia, c.razao_social
    FROM eventos e
    LEFT JOIN usuarios u ON e.usuario_id = u.id
    LEFT JOIN contratantes c ON e.contratante_id = c.id
    WHERE e.slug = ? AND e.status = 'publicado' AND e.visibilidade = 'publico'
    LIMIT 1
";

$stmt = $con->prepare($sql_evento);
$stmt->bind_param("s", $slug);
$stmt->execute();
$result_evento = $stmt->get_result();

if ($result_evento->num_rows == 0) {
    header('Location: index.php');
    exit;
}

$evento = $result_evento->fetch_assoc();

// Nome do produtor para exibição
$nome_produtor_display = !empty($evento['nome_exibicao']) ? $evento['nome_exibicao'] : 
                        (!empty($evento['nome_fantasia']) ? $evento['nome_fantasia'] : $evento['nome_usuario']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pagamento PIX - <?php echo htmlspecialchars($evento['nome']); ?></title>
    
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
        
        .payment-header {
            background: white;
            border-bottom: 1px solid #e9ecef;
            padding: 1rem 0;
        }
        
        .payment-card {
            background: white;
            border-radius: 12px;
            border: 1px solid #e9ecef;
            margin-bottom: 1.5rem;
        }
        
        .payment-card-header {
            padding: 1.5rem 1.5rem 0;
            border-bottom: none;
        }
        
        .payment-card-body {
            padding: 1.5rem;
        }
        
        .pix-qr-container {
            text-align: center;
            padding: 2rem;
            background: #f8f9fa;
            border-radius: 12px;
            margin: 1rem 0;
        }
        
        .pix-qr-code {
            max-width: 300px;
            height: auto;
            border: 3px solid #28a745;
            border-radius: 12px;
            background: white;
            padding: 1rem;
        }
        
        .pix-copy-paste {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 1rem;
            font-family: monospace;
            font-size: 12px;
            word-break: break-all;
            max-height: 100px;
            overflow-y: auto;
        }
        
        .btn-copy {
            background: #28a745;
            border: none;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 14px;
        }
        
        .btn-copy:hover {
            background: #218838;
        }
        
        .payment-status {
            text-align: center;
            padding: 2rem;
        }
        
        .status-icon {
            font-size: 4rem;
            color: #ffc107;
            margin-bottom: 1rem;
        }
        
        .timer-payment {
            background: #dc3545;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9rem;
            display: inline-block;
        }
        
        .instructions-list {
            list-style: none;
            padding: 0;
        }
        
        .instructions-list li {
            padding: 0.5rem 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .instructions-list li:last-child {
            border-bottom: none;
        }
        
        .step-number {
            background: #007bff;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            margin-right: 0.5rem;
        }
        
        /* Modal de Pagamento Aprovado */
        .payment-success-modal {
            border: none;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        
        .success-animation {
            position: relative;
            margin: 0 auto 1rem;
            width: 120px;
            height: 120px;
        }
        
        .pix-icon-animated {
            font-size: 4rem;
            animation: pixBounce 2s ease-in-out infinite;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
        }
        
        .checkmark-circle {
            position: absolute;
            top: -10px;
            right: -10px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #28a745, #20c997);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: checkmarkPop 0.8s ease-out 1s both;
            transform: scale(0);
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        }
        
        .checkmark {
            color: white;
            font-size: 1.5rem;
            font-weight: bold;
            animation: checkmarkDraw 0.5s ease-out 1.2s both;
            opacity: 0;
        }
        
        .success-title {
            color: #28a745;
            font-weight: 700;
            font-size: 1.8rem;
            animation: slideInUp 0.6s ease-out 0.3s both;
            transform: translateY(20px);
            opacity: 0;
        }
        
        .success-message {
            color: #6c757d;
            font-size: 1.1rem;
            line-height: 1.6;
            animation: slideInUp 0.6s ease-out 0.5s both;
            transform: translateY(20px);
            opacity: 0;
        }
        
        .success-loader {
            animation: slideInUp 0.6s ease-out 0.7s both;
            transform: translateY(20px);
            opacity: 0;
        }
        
        /* Animações */
        @keyframes pixBounce {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-10px) scale(1.1); }
        }
        
        @keyframes checkmarkPop {
            0% { transform: scale(0) rotate(-45deg); }
            50% { transform: scale(1.2) rotate(-45deg); }
            100% { transform: scale(1) rotate(0deg); }
        }
        
        @keyframes checkmarkDraw {
            0% { opacity: 0; transform: scale(0.5); }
            100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes slideInUp {
            0% { 
                opacity: 0; 
                transform: translateY(20px); 
            }
            100% { 
                opacity: 1; 
                transform: translateY(0); 
            }
        }
        
        /* Efeito de backdrop personalizado */
        .modal.show {
            backdrop-filter: blur(5px);
        }
        
        .modal-backdrop.show {
            background: rgba(0, 0, 0, 0.6);
        }
    </style>
</head>

<body>
    <!-- Header -->
    <div class="payment-header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <a href="/evento/<?php echo $slug; ?>" class="text-decoration-none">
                        <img src="img/anysummitlogo.png" style="max-width: 150px;" alt="AnySummit">
                    </a>
                </div>
                <div class="col-md-6 text-end">
                    <div class="timer-payment">
                        <i class="fas fa-clock me-2"></i>
                        <span id="timer">24:00:00</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container my-4">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                
                <!-- Status do Pagamento -->
                <div class="payment-card">
                    <div class="payment-card-body">
                        <div class="payment-status">
                            <div class="status-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <h4>Aguardando Pagamento PIX</h4>
                            <p class="text-muted mb-0">Seu pedido foi criado com sucesso! Agora é só efetuar o pagamento via PIX.</p>
                        </div>
                    </div>
                </div>

                <!-- QR Code PIX -->
                <div class="payment-card">
                    <div class="payment-card-header">
                        <h5 class="mb-0">
                            <i class="fab fa-pix text-success me-2"></i>
                            Pagamento via PIX
                        </h5>
                    </div>
                    <div class="payment-card-body">
                        <div id="pix-loading" class="text-center">
                            <i class="fas fa-spinner fa-spin fa-2x text-primary"></i>
                            <p class="mt-2">Gerando QR Code PIX...</p>
                        </div>
                        
                        <div id="pix-content" style="display: none;">
                            <!-- QR Code -->
                            <div class="pix-qr-container">
                                <p><strong>Escaneie o QR Code com seu banco ou carteira digital:</strong></p>
                                <img id="pix-qr-image" src="" alt="QR Code PIX" class="pix-qr-code">
                            </div>
                            
                            <!-- Código PIX -->
                            <div class="row">
                                <div class="col-12 mb-3">
                                    <label class="form-label"><strong>Ou copie e cole o código PIX:</strong></label>
                                    <div class="input-group">
                                        <div class="pix-copy-paste" id="pix-code">Código PIX será carregado aqui...</div>
                                        <button class="btn btn-copy" type="button" onclick="copyPixCode()">
                                            <i class="fas fa-copy me-1"></i>Copiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Instruções -->
                <div class="payment-card">
                    <div class="payment-card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-info-circle text-info me-2"></i>
                            Como pagar com PIX
                        </h5>
                    </div>
                    <div class="payment-card-body">
                        <ul class="instructions-list">
                            <li>
                                <span class="step-number">1</span>
                                Abra o aplicativo do seu banco ou carteira digital
                            </li>
                            <li>
                                <span class="step-number">2</span>
                                Procure pela opção "PIX" ou "Pagamento PIX"
                            </li>
                            <li>
                                <span class="step-number">3</span>
                                Escaneie o QR Code acima ou cole o código PIX
                            </li>
                            <li>
                                <span class="step-number">4</span>
                                Confirme os dados e finalize o pagamento
                            </li>
                            <li>
                                <span class="step-number">5</span>
                                Após o pagamento, você receberá a confirmação por e-mail
                            </li>
                        </ul>
                        
                        <div class="alert alert-warning mt-3">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>Importante:</strong> O pagamento via PIX deve ser realizado hoje. 
                            Após esse prazo, o pedido será cancelado automaticamente.
                        </div>
                    </div>
                </div>

                <!-- Resumo do Pedido -->
                <div class="payment-card">
                    <div class="payment-card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-receipt text-primary me-2"></i>
                            Resumo do Pedido
                        </h5>
                    </div>
                    <div class="payment-card-body">
                        <div id="order-summary">
                            <div class="text-center">
                                <i class="fas fa-spinner fa-spin"></i>
                                <p class="mt-2">Carregando resumo do pedido...</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Modal de Pagamento Aprovado -->
    <div class="modal fade" id="modalPagamentoAprovado" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content payment-success-modal">
                <div class="modal-body text-center p-5">
                    <div class="success-animation">
                        <div class="pix-icon-animated">💳</div>
                        <div class="checkmark-circle">
                            <div class="checkmark">✓</div>
                        </div>
                    </div>
                    
                    <h3 class="success-title mt-4 mb-3">
                        Acabamos de Receber o seu PIX!
                    </h3>
                    
                    <p class="success-message mb-4">
                        <strong>Obrigado!</strong> Seu pagamento foi processado com sucesso.<br>
                        Você será redirecionado em alguns segundos...
                    </p>
                    
                    <div class="success-loader">
                        <div class="spinner-border text-success" role="status">
                            <span class="visually-hidden">Carregando...</span>
                        </div>
                        <p class="mt-2 text-muted">Redirecionando...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        let paymentData = null;
        let checkPaymentInterval = null;
        
        // Carregar dados do pedido ao inicializar
        document.addEventListener('DOMContentLoaded', function() {
            // Verificar se existe dados do pedido
            const pedidoData = sessionStorage.getItem('pedido_criado');
            const carrinhoData = sessionStorage.getItem('carrinho');
            
            if (!pedidoData || !carrinhoData) {
                console.log('Dados do pedido não encontrados, criando pedido PIX...');
                criarPedidoPix();
                return;
            }
            
            try {
                const pedido = JSON.parse(pedidoData);
                const carrinho = JSON.parse(carrinhoData);
                
                console.log('Dados do pedido:', pedido);
                console.log('Dados do carrinho:', carrinho);
                
                // Processar PIX com dados existentes
                processarPixComDados(pedido, carrinho);
                
            } catch (error) {
                console.error('Erro ao processar dados:', error);
                alert('Erro ao carregar dados do pedido.');
            }
        });

        // Criar pedido PIX quando não há dados na sessão
        async function criarPedidoPix() {
            try {
                // Buscar dados do comprador na sessão (se houver)
                const compradorData = sessionStorage.getItem('comprador_data');
                
                if (!compradorData) {
                    // Se não há dados do comprador, criar dados de teste
                    console.log('Criando dados de teste para PIX...');
                    const dadosCompradorTeste = {
                        nome_completo: 'Teste PIX',
                        email: 'teste@example.com',
                        whatsapp: '(11) 99999-9999',
                        documento: '12345678901',
                        tipo_documento: 'CPF',
                        cep: '01234-567',
                        endereco: 'Rua Teste',
                        numero: '123',
                        bairro: 'Centro',
                        cidade: 'São Paulo',
                        estado: 'SP'
                    };
                    sessionStorage.setItem('comprador_data', JSON.stringify(dadosCompradorTeste));
                    
                    // Recarregar a função
                    criarPedidoPix();
                    return;
                }

                const comprador = JSON.parse(compradorData);
                
                // Criar dados básicos do carrinho se não existir
                const carrinho = {
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

                // Criar dados do participante baseado no comprador
                const participante = {
                    nome: comprador.nome_completo?.split(' ')[0] || 'Nome',
                    sobrenome: comprador.nome_completo?.split(' ').slice(1).join(' ') || 'Sobrenome',
                    email: comprador.email,
                    whatsapp: comprador.whatsapp,
                    metodo_dados: 'manual'
                };

                const pedidoData = {
                    carrinho: carrinho,
                    participante: participante,
                    comprador: comprador,
                    pagamento: {
                        metodo: 'pix',
                        parcelas: 1
                    }
                };

                console.log('Criando pedido PIX:', pedidoData);

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
                console.log('Resultado do pedido PIX:', result);

                if (result.success) {
                    // Salvar dados na sessão
                    sessionStorage.setItem('pedido_criado', JSON.stringify(result.pedido));
                    sessionStorage.setItem('carrinho', JSON.stringify(carrinho));
                    
                    // Processar PIX
                    processarPixComDados(result.pedido, carrinho);
                } else {
                    alert('Erro ao criar pedido: ' + result.message);
                }

            } catch (error) {
                console.error('Erro ao criar pedido PIX:', error);
                alert('Erro ao processar pedido PIX: ' + error.message);
            }
        }

        // Processar PIX com dados do pedido
        function processarPixComDados(pedido, carrinho) {
                
                // Renderizar resumo do pedido
                renderOrderSummary(carrinho, pedido);
                
                // Processar pagamento PIX
                processarPagamentoPix(pedido, carrinho);
                
                // Iniciar verificação de status se houver pedido ID
                if (pedido.pedidoid) {
                    startPaymentCheck(pedido.pedidoid);
                }
        }

        function renderOrderSummary(carrinho, pedido) {
            const summaryHtml = `
                <div class="d-flex justify-content-between mb-2">
                    <strong>Evento:</strong>
                    <span>${carrinho.evento?.nome || 'Evento'}</span>
                </div>
                <hr>
                ${carrinho.ingressos?.map(ingresso => `
                    <div class="d-flex justify-content-between mb-2">
                        <div>
                            <div>${ingresso.nome}</div>
                            <small class="text-muted">Qtd: ${ingresso.quantidade} x R$ ${formatPrice(ingresso.preco)}</small>
                        </div>
                        <span>R$ ${formatPrice(ingresso.subtotal)}</span>
                    </div>
                `).join('') || ''}
                <hr>
                <div class="d-flex justify-content-between">
                    <strong>Total:</strong>
                    <strong class="text-success">R$ ${formatPrice(pedido.valor_total || carrinho.total || 0)}</strong>
                </div>
                <div class="text-muted mt-2">
                    <small>Pedido: ${pedido.codigo_pedido || 'Gerando...'}</small>
                </div>
            `;
            
            document.getElementById('order-summary').innerHTML = summaryHtml;
        }

        async function processarPagamentoPix(pedido, carrinho) {
            try {
                // Obter dados do comprador da sessão
                const compradorDataStr = sessionStorage.getItem('comprador_data');
                if (!compradorDataStr) {
                    throw new Error('Dados do comprador não encontrados');
                }
                
                const compradorData = JSON.parse(compradorDataStr);
                
                const dadosPagamento = {
                    pedido: {
                        ...pedido,
                        evento_nome: carrinho.evento?.nome || 'Evento'
                    },
                    comprador: compradorData
                };

                console.log('Processando PIX:', dadosPagamento);

                const response = await fetch('api/pagamento-pix.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dadosPagamento)
                });

                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }

                const result = await response.json();
                console.log('Resultado PIX:', result);

                if (result.success) {
                    paymentData = result;
                    showPixData(result);
                } else {
                    showPixError(result.message || 'Erro desconhecido');
                }

            } catch (error) {
                console.error('Erro ao processar PIX:', error);
                showPixError('Erro ao gerar PIX: ' + error.message);
            }
        }

        function showPixData(data) {
            // Ocultar loading
            document.getElementById('pix-loading').style.display = 'none';
            
            // Mostrar conteúdo PIX
            document.getElementById('pix-content').style.display = 'block';
            
            // Exibir QR Code se disponível
            if (data.pix && data.pix.encodedImage) {
                document.getElementById('pix-qr-image').src = 'data:image/png;base64,' + data.pix.encodedImage;
            } else {
                document.getElementById('pix-qr-image').style.display = 'none';
            }
            
            // Exibir código PIX
            if (data.pix && data.pix.payload) {
                document.getElementById('pix-code').textContent = data.pix.payload;
            } else {
                document.getElementById('pix-code').textContent = 'Código PIX não disponível no momento.';
            }
        }

        function showPixError(message) {
            // Ocultar loading
            document.getElementById('pix-loading').style.display = 'none';
            
            // Mostrar erro
            document.getElementById('pix-content').innerHTML = `
                <div class="alert alert-danger">
                    <h6><i class="fas fa-exclamation-triangle me-2"></i>Erro ao gerar PIX</h6>
                    <p class="mb-0">${message}</p>
                    <button class="btn btn-sm btn-outline-danger mt-2" onclick="location.reload()">
                        Tentar novamente
                    </button>
                </div>
            `;
            document.getElementById('pix-content').style.display = 'block';
        }

        function mostrarModalPagamentoAprovado() {
            // Criar instância do modal Bootstrap
            const modalElement = document.getElementById('modalPagamentoAprovado');
            const modal = new bootstrap.Modal(modalElement, {
                backdrop: 'static',  // Não fechar clicando fora
                keyboard: false      // Não fechar com ESC
            });
            
            // Mostrar o modal
            modal.show();
            
            // Adicionar efeitos sonoros se suportado
            try {
                // Som de sucesso (opcional - pode ser removido se não desejar)
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            } catch (e) {
                // Som não suportado, continuar sem ele
                console.log('Audio não suportado');
            }
        }

        function copyPixCode() {
            const pixCode = document.getElementById('pix-code').textContent;
            
            if (navigator.clipboard && pixCode !== 'Código PIX será carregado aqui...') {
                navigator.clipboard.writeText(pixCode).then(() => {
                    const btn = event.target.closest('button');
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check me-1"></i>Copiado!';
                    btn.classList.add('btn-success');
                    btn.classList.remove('btn-copy');
                    
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.classList.remove('btn-success');
                        btn.classList.add('btn-copy');
                    }, 2000);
                });
            } else {
                alert('Código PIX ainda não disponível ou navegador não suporta cópia automática.');
            }
        }

        function startPaymentCheck(pedidoId) {
            // Verificar status do pagamento a cada 15 segundos
            checkPaymentInterval = setInterval(async () => {
                try {
                    const response = await fetch(`api/verificar-pagamento.php?pedido_id=${pedidoId}`);
                    const result = await response.json();
                    
                    if (result.success && result.status === 'aprovado') {
                        clearInterval(checkPaymentInterval);
                        
                        // Salvar dados do pagamento aprovado
                        sessionStorage.setItem('pagamento_aprovado', JSON.stringify(result));
                        
                        // Mostrar modal de sucesso animado
                        mostrarModalPagamentoAprovado();
                        
                        // Redirecionar após animação
                        setTimeout(() => {
                            const pedidoId = '<?php echo $pedido_id; ?>' || 
                                            (result.pedido && result.pedido.codigo_pedido) || '';
                            
                            if (pedidoId) {
                                window.location.href = 'pagamento-sucesso.php?pedido_id=' + encodeURIComponent(pedidoId);
                            } else {
                                window.location.href = 'pagamento-sucesso.php';
                            }
                        }, 4000); // 4 segundos para ver a animação
                    }
                } catch (error) {
                    console.error('Erro ao verificar pagamento:', error);
                }
            }, 15000); // 15 segundos
        }

        function formatPrice(price) {
            if (price === undefined || price === null) return '0,00';
            return parseFloat(price).toFixed(2).replace('.', ',');
        }

        // Timer até o final do dia (23:59:59)
        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        let timeRemaining = Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
        
        const timerInterval = setInterval(() => {
            const hours = Math.floor(timeRemaining / 3600);
            const minutes = Math.floor((timeRemaining % 3600) / 60);
            const seconds = timeRemaining % 60;
            
            document.getElementById('timer').textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                if (checkPaymentInterval) {
                    clearInterval(checkPaymentInterval);
                }
                alert('Tempo para pagamento expirado! Redirecionando...');
                window.location.href = '/evento/<?php echo $slug; ?>';
                return;
            }
            
            timeRemaining--;
        }, 1000);
    </script>
</body>
</html>
