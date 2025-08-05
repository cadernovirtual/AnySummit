<?php
// Debug - garantir que não há saída antes dos headers
ob_start();

// Ativar exibição de erros para debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

include("check_login.php");
include("conm/conn.php");

// Pegar o ID do evento
$evento_id = isset($_GET['eventoid']) ? intval($_GET['eventoid']) : 0;
$novo = isset($_GET['novo']) ? 1 : 0;

if (!$evento_id) {
    header("Location: meuseventos.php");
    exit();
}

// Debug - log da operação
error_log("evento-publicado.php - Carregando evento ID: $evento_id para usuário: " . $_SESSION['usuarioid']);

// Buscar dados do evento
$sql = "SELECT e.*, c.nome as categoria_nome 
        FROM eventos e 
        LEFT JOIN categorias_evento c ON e.categoria_id = c.id 
        WHERE e.id = ? AND e.usuario_id = ?";
$stmt = mysqli_prepare($con, $sql);

if (!$stmt) {
    error_log("evento-publicado.php - Erro ao preparar consulta: " . mysqli_error($con));
    die("Erro interno do servidor");
}

mysqli_stmt_bind_param($stmt, "ii", $evento_id, $_SESSION['usuarioid']);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$evento = mysqli_fetch_assoc($result);

if (!$evento) {
    error_log("evento-publicado.php - Evento não encontrado ou usuário sem permissão. ID: $evento_id, Usuario: " . $_SESSION['usuarioid']);
    header("Location: meuseventos.php");
    exit();
}

error_log("evento-publicado.php - Evento carregado com sucesso: " . $evento['nome']);

// Buscar quantidade de ingressos
$sql_ing = "SELECT COUNT(*) as total FROM ingressos WHERE evento_id = ?";
$stmt_ing = mysqli_prepare($con, $sql_ing);

if (!$stmt_ing) {
    error_log("evento-publicado.php - Erro ao preparar consulta de ingressos: " . mysqli_error($con));
    die("Erro interno do servidor");
}

mysqli_stmt_bind_param($stmt_ing, "i", $evento_id);
mysqli_stmt_execute($stmt_ing);
$result_ing = mysqli_stmt_get_result($stmt_ing);
$row_ing = mysqli_fetch_assoc($result_ing);
$total_ingressos = $row_ing['total'];

error_log("evento-publicado.php - Total de ingressos: $total_ingressos");

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Evento Publicado - Anysummit</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="/produtor/css/criaevento.css" />
    <style>
        .success-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .success-card {
            background: rgba(26, 26, 46, 0.9);
            border: 1px solid rgba(114, 94, 255, 0.3);
            border-radius: 24px;
            padding: 48px;
            max-width: 600px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .success-icon {
            font-size: 72px;
            margin-bottom: 24px;
            animation: bounce 1s ease-in-out;
        }
        
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-20px); }
            60% { transform: translateY(-10px); }
        }
        
        .success-title {
            font-size: 32px;
            font-weight: 700;
            color: #E1E5F2;
            margin-bottom: 16px;
        }
        
        .success-message {
            font-size: 18px;
            color: #8B95A7;
            margin-bottom: 32px;
            line-height: 1.6;
        }
        
        .event-details {
            background: rgba(15, 15, 35, 0.6);
            border: 1px solid rgba(114, 94, 255, 0.2);
            border-radius: 16px;
            padding: 24px;
            margin: 32px 0;
            text-align: left;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid rgba(114, 94, 255, 0.1);
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            color: #8B95A7;
            font-weight: 500;
        }
        
        .detail-value {
            color: #E1E5F2;
            font-weight: 600;
        }
        
        .action-buttons {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 12px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            text-decoration: none;
            transition: all 0.3s ease;
            display: inline-block;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(114, 94, 255, 0.3);
        }
        
        .btn-secondary {
            background: transparent;
            color: #00C2FF;
            border: 1px solid rgba(0, 194, 255, 0.4);
        }
        
        .btn-secondary:hover {
            background: rgba(0, 194, 255, 0.1);
            border-color: rgba(0, 194, 255, 0.6);
        }
        
        .share-section {
            margin-top: 32px;
            padding-top: 32px;
            border-top: 1px solid rgba(114, 94, 255, 0.2);
        }
        
        .share-title {
            font-size: 18px;
            color: #E1E5F2;
            margin-bottom: 16px;
            font-weight: 600;
        }
        
        .share-link {
            background: rgba(15, 15, 35, 0.6);
            border: 1px solid rgba(114, 94, 255, 0.2);
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }
        
        .share-input {
            flex: 1;
            background: transparent;
            border: none;
            color: #8B95A7;
            font-size: 14px;
            outline: none;
        }
        
        .btn-copy {
            background: rgba(114, 94, 255, 0.2);
            border: 1px solid rgba(114, 94, 255, 0.3);
            padding: 8px 16px;
            border-radius: 8px;
            color: #00C2FF;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
        }
        
        .btn-copy:hover {
            background: rgba(0, 194, 255, 0.2);
            border-color: rgba(0, 194, 255, 0.4);
        }
    </style>
</head>
<body>
    <div class="success-container">
        <div class="success-card">
            <div class="success-icon">🎉</div>
            <h1 class="success-title">Evento Publicado com Sucesso!</h1>
            <p class="success-message">
                Parabéns! Seu evento foi criado e está pronto para receber inscrições.
            </p>
            
            <div class="event-details">
                <div class="detail-row">
                    <span class="detail-label">Nome do Evento</span>
                    <span class="detail-value"><?php echo htmlspecialchars($evento['nome']); ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Data de Início</span>
                    <span class="detail-value"><?php echo date('d/m/Y H:i', strtotime($evento['data_inicio'])); ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Categoria</span>
                    <span class="detail-value"><?php echo htmlspecialchars($evento['categoria_nome'] ?? 'Não definida'); ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Tipos de Ingresso</span>
                    <span class="detail-value"><?php echo $total_ingressos; ?> tipo(s)</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status</span>
                    <span class="detail-value" style="color: #10B981;">Publicado</span>
                </div>
            </div>
            
            <div class="share-section">
                <h3 class="share-title">Link do Evento</h3>
                <div class="share-link">
                    <input type="text" 
                           class="share-input" 
                           id="eventLink" 
                           value="https://anysummit.com.br/evento/<?php echo $evento['slug']; ?>" 
                           readonly>
                    <button class="btn-copy" onclick="copyLink()">Copiar</button>
                </div>
            </div>
            
            <div class="action-buttons">
                <a href="/evento/<?php echo $evento['slug']; ?>" class="btn btn-primary" target="_blank">
                    Ver Página do Evento
                </a>
                <a href="editar-evento.php?eventoid=<?php echo $evento_id; ?>" class="btn btn-secondary">
                    Editar Evento
                </a>
                <a href="meuseventos.php" class="btn btn-secondary">
                    Meus Eventos
                </a>
            </div>
        </div>
    </div>
    
    <script>
        function copyLink() {
            const input = document.getElementById('eventLink');
            input.select();
            document.execCommand('copy');
            
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = 'Copiado!';
            btn.style.background = 'rgba(16, 185, 129, 0.2)';
            btn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            btn.style.color = '#10B981';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 2000);
        }
        
        // Limpar dados do wizard após sucesso
        if (typeof(Storage) !== "undefined") {
            localStorage.removeItem('eventoWizard');
            localStorage.removeItem('lotesData');
            localStorage.removeItem('temporaryTickets');
        }
        
        // Limpar cookies
        document.cookie = "eventoWizard=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
        document.cookie = "lotesData=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
    </script>
</body>
</html>
<?php
mysqli_close($con);
ob_end_flush(); // Finalizar buffer de saída
?>
