<?php
include("check_login.php");
include("conm/conn.php");

// Pegar ID do evento
$evento_id = isset($_GET['eventoid']) ? intval($_GET['eventoid']) : 0;

if (!$evento_id) {
    header("Location: meuseventos.php");
    exit();
}

// Buscar dados do evento
$query = mysqli_query($con, "
    SELECT e.*, c.nome_fantasia as nome_contratante 
    FROM eventos e 
    LEFT JOIN contratantes c ON e.contratante_id = c.id
    WHERE e.id = $evento_id AND e.usuario_id = " . $_SESSION['usuarioid']
);

if (!$query || mysqli_num_rows($query) == 0) {
    header("Location: meuseventos.php");
    exit();
}

$evento = mysqli_fetch_assoc($query);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Evento Publicado com Sucesso - AnySummit</title>
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-0.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', sans-serif;
        }
        
        .success-container {
            background: white;
            border-radius: 20px;
            padding: 60px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 600px;
            width: 90%;
            animation: slideUp 0.5s ease;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .success-icon {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 30px;
            animation: scaleIn 0.5s ease 0.2s both;
        }
        
        @keyframes scaleIn {
            from {
                transform: scale(0);
            }
            to {
                transform: scale(1);
            }
        }
        
        .success-icon svg {
            width: 50px;
            height: 50px;
            stroke: white;
            stroke-width: 3;
        }
        
        h1 {
            font-size: 32px;
            color: #1f2937;
            margin-bottom: 10px;
            animation: fadeIn 0.5s ease 0.3s both;
        }
        
        .subtitle {
            font-size: 18px;
            color: #6b7280;
            margin-bottom: 40px;
            animation: fadeIn 0.5s ease 0.4s both;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        
        .event-info {
            background: #f3f4f6;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            text-align: left;
            animation: fadeIn 0.5s ease 0.5s both;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .info-row:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }
        
        .info-label {
            font-weight: 600;
            color: #374151;
        }
        
        .info-value {
            color: #6b7280;
        }
        
        .action-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            animation: fadeIn 0.5s ease 0.6s both;
        }
        
        .btn {
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .btn-secondary {
            background: #f3f4f6;
            color: #374151;
        }
        
        .btn-secondary:hover {
            background: #e5e7eb;
        }
        
        .share-section {
            margin-top: 40px;
            padding-top: 40px;
            border-top: 1px solid #e5e7eb;
            animation: fadeIn 0.5s ease 0.7s both;
        }
        
        .share-title {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 15px;
        }
        
        .share-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        
        .share-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            transition: transform 0.3s ease;
        }
        
        .share-btn:hover {
            transform: scale(1.1);
        }
        
        .share-whatsapp {
            background: #25D366;
            color: white;
        }
        
        .share-facebook {
            background: #1877F2;
            color: white;
        }
        
        .share-twitter {
            background: #1DA1F2;
            color: white;
        }
        
        .qr-section {
            margin-top: 30px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 12px;
            text-align: center;
        }
        
        .qr-code {
            margin: 20px auto;
            padding: 20px;
            background: white;
            border-radius: 8px;
            display: inline-block;
        }
        
        .qr-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 15px;
        }
        
        .btn-small {
            padding: 8px 16px;
            font-size: 14px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            background: white;
            color: #374151;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            transition: all 0.3s ease;
        }
        
        .btn-small:hover {
            background: #f3f4f6;
            border-color: #d1d5db;
        }
    </style>
</head>
<body>
    <div class="success-container">
        <div class="success-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
            </svg>
        </div>
        
        <h1>Evento Publicado com Sucesso!</h1>
        <p class="subtitle">Seu evento já está disponível para o público</p>
        
        <div class="event-info">
            <div class="info-row">
                <span class="info-label">Nome do Evento:</span>
                <span class="info-value"><?php echo htmlspecialchars($evento['nome']); ?></span>
            </div>
            <div class="info-row">
                <span class="info-label">Data:</span>
                <span class="info-value"><?php echo date('d/m/Y H:i', strtotime($evento['data_inicio'])); ?></span>
            </div>
            <div class="info-row">
                <span class="info-label">ID do Evento:</span>
                <span class="info-value">#<?php echo $evento['id']; ?></span>
            </div>
            <div class="info-row">
                <span class="info-label">URL do Evento:</span>
                <span class="info-value">
                    <a href="/evento/<?php echo $evento['slug']; ?>" target="_blank" style="color: #667eea;">
                        anysummit.com.br/evento/<?php echo $evento['slug']; ?>
                    </a>
                </span>
            </div>
        </div>
        
        <div class="action-buttons">
            <a href="/evento/<?php echo $evento['slug']; ?>" target="_blank" class="btn btn-primary">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                Ver Evento
            </a>
            <a href="meuseventos.php" class="btn btn-secondary">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                Meus Eventos
            </a>
        </div>
        
        <div class="qr-section">
            <p class="share-title">QR Code do Evento</p>
            <div class="qr-code" id="qrcode"></div>
            <div class="qr-buttons">
                <button class="btn-small" onclick="copyLink()">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    Copiar Link
                </button>
                <button class="btn-small" onclick="downloadQR()">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    Baixar QR Code
                </button>
            </div>
        </div>
        
        <div class="share-section">
            <p class="share-title">Compartilhar evento:</p>
            <div class="share-buttons">
                <a href="https://wa.me/?text=Confira meu evento: <?php echo urlencode($evento['nome']); ?> - https://anysummit.com.br/evento/<?php echo $evento['slug']; ?>" target="_blank" class="share-btn share-whatsapp">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                </a>
                <a href="https://www.facebook.com/sharer/sharer.php?u=https://anysummit.com.br/evento/<?php echo $evento['slug']; ?>" target="_blank" class="share-btn share-facebook">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                </a>
                <a href="https://twitter.com/intent/tweet?text=Confira meu evento: <?php echo urlencode($evento['nome']); ?>&url=https://anysummit.com.br/evento/<?php echo $evento['slug']; ?>" target="_blank" class="share-btn share-twitter">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                </a>
                <a href="#" onclick="copyLink(); return false;" class="share-btn share-link">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                    </svg>
                </a>
            </div>
        </div>
    </div>
    
    <!-- QRCode Library -->
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    
    <script>
        // Gerar QR Code
        const url = 'https://anysummit.com.br/evento/<?php echo $evento['slug']; ?>';
        const qrcode = new QRCode(document.getElementById("qrcode"), {
            text: url,
            width: 200,
            height: 200,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
        
        function copyLink() {
            navigator.clipboard.writeText(url).then(() => {
                alert('Link copiado para a área de transferência!');
            });
        }
        
        function downloadQR() {
            const canvas = document.querySelector('#qrcode canvas');
            const link = document.createElement('a');
            link.download = 'qrcode-evento-<?php echo $evento['id']; ?>.png';
            link.href = canvas.toDataURL();
            link.click();
        }
    </script>
</body>
</html>