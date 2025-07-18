<?php
include("check_login.php");
include("conm/conn.php");
include("../includes/imagem-helpers.php");

// Pegar dados do usuário logado dos cookies
$contratante_id = $_COOKIE['contratanteid'] ?? 0;
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

// Verificar se foi fornecido um ID de evento
if (!isset($_GET['eventoid']) || empty($_GET['eventoid'])) {
    header("Location: meuseventos.php");
    exit();
}

$evento_id = intval($_GET['eventoid']);

// Busca os dados do evento
$sql_evento = "SELECT e.*, c.nome as categoria_nome 
               FROM eventos e 
               LEFT JOIN categorias_evento c ON e.categoria_id = c.id 
               WHERE e.id = ? AND e.usuario_id = ?";

$stmt_evento = $con->prepare($sql_evento);
if (!$stmt_evento) {
    die("Erro na preparação da query: " . $con->error);
}

$stmt_evento->bind_param("ii", $evento_id, $usuario_id);
$stmt_evento->execute();
$resultado_evento = $stmt_evento->get_result();

if ($resultado_evento->num_rows == 0) {
    header("Location: meuseventos.php");
    exit();
}

$evento = $resultado_evento->fetch_assoc();

// URL da página pública do evento
$base_url = "https://anysummit.com.br";
$evento_url = $base_url . "/evento/?evento=" . $evento['slug'];

// Verificar se é nova publicação
$nova_publicacao = isset($_GET['novo']) && $_GET['novo'] == '1';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $nova_publicacao ? 'Evento Publicado!' : 'Detalhes do Evento'; ?> - Anysummit</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-1.css">
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs/qrcode.min.js"></script>
    <script>
        // Função SIMPLES usando biblioteca que FUNCIONA
        function generateQRCode() {
            const eventoUrl = '<?php echo $evento_url; ?>';
            const qrContainer = document.getElementById('qrcode');
            
            console.log('Gerando QR Code para:', eventoUrl);
            
            // Limpar container
            qrContainer.innerHTML = '';
            
            // Usar biblioteca que FUNCIONA
            new QRCode(qrContainer, {
                text: eventoUrl,
                width: 150,
                height: 150,
                colorDark: "#1A1A2E",
                colorLight: "#FFFFFF",
                correctLevel: QRCode.CorrectLevel.M
            });
            
            console.log('QR Code gerado com biblioteca REAL');
        }

        // Executar quando página carregar
        document.addEventListener('DOMContentLoaded', generateQRCode);
    </script>
    <style>
        .page-content {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .success-header {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 30px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            margin-bottom: 30px;
            text-align: center;
        }

        .success-check {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: checkPulse 2s infinite;
            box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
        }

        .check-icon {
            width: 40px;
            height: 40px;
            fill: white;
        }

        @keyframes checkPulse {
            0% { transform: scale(1); box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3); }
            50% { transform: scale(1.05); box-shadow: 0 12px 35px rgba(76, 175, 80, 0.5); }
            100% { transform: scale(1); box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3); }
        }

        .success-title {
            font-size: 2rem;
            font-weight: 700;
            color: #00C2FF;
            margin-bottom: 10px;
        }

        .success-subtitle {
            font-size: 1.1rem;
            color: #B0BEC5;
            margin-bottom: 10px;
        }

        .success-message {
            color: #81C784;
            font-weight: 500;
        }

        .main-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }

        .card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .event-card {
            display: flex;
            gap: 20px;
        }

        .event-image {
            width: 180px;
            height: 120px;
            object-fit: cover;
            border-radius: 12px;
            border: 2px solid rgba(0, 194, 255, 0.3);
            flex-shrink: 0;
        }

        .event-placeholder {
            width: 180px;
            height: 120px;
            background: rgba(0,194,255,0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #00C2FF;
            font-size: 2rem;
            flex-shrink: 0;
        }

        .event-info h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #00C2FF;
            margin-bottom: 15px;
        }

        .event-details {
            display: grid;
            gap: 8px;
        }

        .detail-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #B0BEC5;
            font-size: 0.95rem;
        }

        .event-url {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .event-url-text {
            color: #81C784;
            font-family: monospace;
            font-size: 0.9rem;
            flex: 1;
            word-break: break-all;
        }

        .copy-btn {
            background: #00C2FF;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85rem;
            font-weight: 500;
            transition: all 0.2s;
            flex-shrink: 0;
        }

        .copy-btn:hover {
            background: #0099CC;
            transform: translateY(-1px);
        }

        .section-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #00C2FF;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .share-buttons {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }

        .share-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px;
            border: none;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            cursor: pointer;
            font-size: 0.9rem;
        }

        .share-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .share-btn.whatsapp {
            background: linear-gradient(135deg, #25D366, #128C7E);
            color: white;
        }

        .share-btn.facebook {
            background: linear-gradient(135deg, #1877F2, #42A5F5);
            color: white;
        }

        .share-btn.twitter {
            background: linear-gradient(135deg, #1DA1F2, #0D8BF0);
            color: white;
        }

        .share-btn.linkedin {
            background: linear-gradient(135deg, #0077B5, #00A0DC);
            color: white;
        }

        .share-icon {
            width: 20px;
            height: 20px;
            filter: brightness(0) invert(1);
        }

        .qr-container {
            text-align: center;
        }

        #qrcode {
            margin: 15px auto;
            padding: 15px;
            background: white;
            border-radius: 12px;
            display: inline-block;
        }

        .qr-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 15px;
        }

        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.9rem;
        }

        .btn:hover {
            transform: translateY(-2px);
        }

        .btn-primary {
            background: linear-gradient(135deg, #00C2FF 0%, #0099CC 100%);
            color: white;
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.2);
            color: #E1E5F2;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .action-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 20px;
        }

        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .event-card {
                flex-direction: column;
            }
            
            .event-image, .event-placeholder {
                width: 100%;
                height: 160px;
            }
            
            .share-buttons {
                grid-template-columns: 1fr;
            }
            
            .action-buttons {
                flex-direction: column;
            }
            
            .qr-actions {
                flex-direction: column;
            }

            .event-url {
                flex-direction: column;
                gap: 10px;
            }

            .copy-btn {
                align-self: stretch;
            }
        }
    </style>
</head>
<body>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>

    <!-- Header -->
    <header class="header">
        <div class="logo-section">
            <img src="img/logohori.png" style="width:100%; max-width:200px;">
        </div>
        
        <div class="header-right">
            <div class="menu-toggle" onClick="toggleMobileMenu()">
                <div class="hamburger-line"></div>
                <div class="hamburger-line"></div>
                <div class="hamburger-line"></div>
            </div>
            <div class="user-menu">
                <div class="user-icon" onClick="toggleUserDropdown()">👤</div>
                <div class="user-dropdown" id="userDropdown">
                    <div class="dropdown-item" onClick="logout()">
                        🚪 Sair
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Mobile Overlay -->
    <div class="mobile-overlay" id="mobileOverlay" onClick="closeMobileMenu()"></div>

    <!-- Main Layout -->
    <div class="main-layout">
        <!-- Sidebar -->
        <?php include 'menu.php'; ?>

        <!-- Content Area -->
        <main class="content-area">
            <div class="page-content">
                <?php if ($nova_publicacao): ?>
                <div class="success-header">
                    <div class="success-check">
                        <svg class="check-icon" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                    </div>
                    <h1 class="success-title">Parabéns!</h1>
                    <p class="success-subtitle">Seu evento foi publicado com sucesso e está pronto para receber inscrições!</p>
                    <p class="success-message">Acompanhe as vendas pelo menu "Inscrições e Vendas"</p>
                </div>
                <?php else: ?>
                <div class="success-header">
                    <div class="success-check">
                        <svg class="check-icon" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                    </div>
                    <h1 class="success-title">Evento Salvo!</h1>
                    <p class="success-subtitle">Todas as alterações foram salvas com sucesso</p>
                    <p class="success-message">Seu evento está ativo e recebendo inscrições</p>
                </div>
                <?php endif; ?>

                <div class="main-content">
                    <div class="left-column">
                        <!-- Card do Evento -->
                        <div class="card event-card">
                            <?php if (!empty($evento['imagem_capa'])): ?>
                                <?php 
                                // Verificar se a imagem_capa já tem o caminho completo
                                $imagem_src = $evento['imagem_capa'];
                                
                                // Usar função helper para normalizar caminho
                                $imagem_src = normalizarCaminhoImagem($evento['imagem_capa']);
                                ?>
                                <img src="<?php echo htmlspecialchars($imagem_src); ?>" 
                                     alt="Imagem do Evento" 
                                     class="event-image"
                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <div class="event-placeholder" style="display: none;">🎉</div>
                            <?php else: ?>
                                <div class="event-placeholder">🎉</div>
                            <?php endif; ?>
                            
                            <div class="event-info">
                                <h2><?php echo htmlspecialchars($evento['nome']); ?></h2>
                                <div class="event-details">
                                    <div class="detail-item">
                                        <span>📅</span>
                                        <strong>Data:</strong> <?php echo date('d/m/Y H:i', strtotime($evento['data_inicio'])); ?>
                                    </div>
                                    <div class="detail-item">
                                        <span>📍</span>
                                        <strong>Local:</strong> 
                                        <?php 
                                        if ($evento['tipo_local'] == 'presencial') {
                                            echo htmlspecialchars($evento['nome_local'] ?: $evento['busca_endereco']);
                                        } else {
                                            echo 'Evento Online';
                                        }
                                        ?>
                                    </div>
                                    <div class="detail-item">
                                        <span>🎯</span>
                                        <strong>Categoria:</strong> <?php echo htmlspecialchars($evento['categoria_nome'] ?: 'Não definida'); ?>
                                    </div>
                                    <div class="detail-item">
                                        <span>👁️</span>
                                        <strong>Visibilidade:</strong> <?php echo ucfirst($evento['visibilidade']); ?>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Link da Página -->
                        <div class="card">
                            <div class="section-title">🔗 Link da página de inscrições</div>
                            <div class="event-url">
                                <div class="event-url-text"><?php echo $evento_url; ?></div>
                                <button class="copy-btn" onclick="copyLink()">📋 Copiar</button>
                            </div>
                        </div>
                    </div>

                    <div class="right-column">
                        <!-- Compartilhamento -->
                        <div class="card">
                            <div class="section-title">📢 Compartilhar evento</div>
                            <div class="share-buttons">
                                <a href="https://wa.me/?text=<?php echo urlencode('Confira este evento: ' . $evento['nome'] . ' - ' . $evento_url); ?>" 
                                   target="_blank" class="share-btn whatsapp">
                                    <svg class="share-icon" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
                                    WhatsApp
                                </a>
                                <a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo urlencode($evento_url); ?>" 
                                   target="_blank" class="share-btn facebook">
                                    <svg class="share-icon" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    Facebook
                                </a>
                                <a href="https://twitter.com/intent/tweet?text=<?php echo urlencode('Confira este evento: ' . $evento['nome']); ?>&url=<?php echo urlencode($evento_url); ?>" 
                                   target="_blank" class="share-btn twitter">
                                    <svg class="share-icon" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                                    Twitter
                                </a>
                                <a href="https://www.linkedin.com/sharing/share-offsite/?url=<?php echo urlencode($evento_url); ?>" 
                                   target="_blank" class="share-btn linkedin">
                                    <svg class="share-icon" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                    LinkedIn
                                </a>
                            </div>
                        </div>

                        <!-- QR Code -->
                        <div class="card">
                            <div class="section-title">📱 QR Code da página de inscrições</div>
                            <div class="qr-container">
                                <div id="qrcode"></div>
                                <div class="qr-actions">
                                    <button onclick="downloadQR()" class="btn btn-primary">
                                        💾 Baixar QR Code
                                    </button>
                                    <a href="<?php echo $evento_url; ?>" target="_blank" class="btn btn-secondary">
                                        👁️ Ver Página
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="action-buttons">
                    <a href="meuseventos.php" class="btn btn-primary">
                        📊 Voltar aos Meus Eventos
                    </a>
                    <a href="editar-evento.php?eventoid=<?php echo $evento_id; ?>" class="btn btn-secondary">
                        ✏️ Editar Evento
                    </a>
                </div>
            </div>
        </main>
    </div>

    <script>
        // Função para baixar QR Code
        function downloadQR() {
            const canvas = document.querySelector('#qrcode canvas');
            if (canvas) {
                try {
                    const link = document.createElement('a');
                    link.download = 'qrcode-evento-<?php echo $evento['slug']; ?>.png';
                    link.href = canvas.toDataURL('image/png');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    console.log('✅ QR Code baixado');
                } catch (e) {
                    console.error('❌ Erro ao baixar QR Code:', e);
                    alert('Erro ao baixar QR Code: ' + e.message);
                }
            } else {
                console.error('❌ Canvas do QR Code não encontrado');
                alert('QR Code não disponível para download');
            }
        }

        // Função para copiar link
        function copyLink() {
            const eventoUrl = '<?php echo $evento_url; ?>';
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(eventoUrl).then(function() {
                    const btn = document.querySelector('.copy-btn');
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '✅ Copiado!';
                    btn.style.background = '#4CAF50';
                    
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.background = '#00C2FF';
                    }, 2000);
                    
                    console.log('✅ Link copiado');
                }, function(err) {
                    console.error('❌ Erro ao copiar link:', err);
                    fallbackCopyLink(eventoUrl);
                });
            } else {
                fallbackCopyLink(eventoUrl);
            }
        }
        
        // Fallback para copiar link
        function fallbackCopyLink(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                const btn = document.querySelector('.copy-btn');
                const originalText = btn.innerHTML;
                btn.innerHTML = '✅ Copiado!';
                btn.style.background = '#4CAF50';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '#00C2FF';
                }, 2000);
                
                console.log('✅ Link copiado (fallback)');
            } catch (err) {
                console.error('❌ Erro no fallback de cópia:', err);
                alert('Não foi possível copiar o link automaticamente. Por favor, copie manualmente:\n\n' + text);
            }
            
            document.body.removeChild(textArea);
        }

        // Funções do sistema - mobile menu
        function toggleMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            const toggle = document.querySelector('.menu-toggle');
            
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            toggle.classList.toggle('active');
        }

        function closeMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            const toggle = document.querySelector('.menu-toggle');
            
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            toggle.classList.remove('active');
        }

        // Função do dropdown do usuário
        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('active');
        }

        // Função de logout
        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                window.location = '/produtor/logout.php';
            }
        }

        // Fechar dropdown quando clicar fora
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.user-menu')) {
                document.getElementById('userDropdown').classList.remove('active');
            }
        });
    </script>
</body>
</html>
