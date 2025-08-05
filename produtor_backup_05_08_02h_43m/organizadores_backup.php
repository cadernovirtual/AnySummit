<?php
include("check_login.php");
include("conm/conn.php");

// Buscar dados do usuário para o header
$usuario = null;
$usuario_id = $_SESSION['usuarioid'];
if ($usuario_id) {
    $sql_usuario = "SELECT id, nome, email, foto_perfil FROM usuarios WHERE id = ?";
    $stmt_usuario = mysqli_prepare($con, $sql_usuario);
    if ($stmt_usuario) {
        mysqli_stmt_bind_param($stmt_usuario, "i", $usuario_id);
        mysqli_stmt_execute($stmt_usuario);
        $result_usuario = mysqli_stmt_get_result($stmt_usuario);
        $usuario = mysqli_fetch_assoc($result_usuario);
        mysqli_stmt_close($stmt_usuario);
    }
}

$sucesso = '';
$erro = '';
$organizador_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$acao = isset($_GET['acao']) ? $_GET['acao'] : 'listar';

// Processar formulário
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $acao_form = $_POST['acao'];
    
    if ($acao_form == 'salvar') {
        $nome_fantasia = trim($_POST['nome_fantasia']);
        $razao_social = trim($_POST['razao_social']);
        $cnpj = trim($_POST['cnpj']);
        $cpf = trim($_POST['cpf']);
        $email_contato = trim($_POST['email_contato']);
        $telefone = trim($_POST['telefone']);
        $endereco_completo = trim($_POST['endereco_completo']);
        $tipo_recebimento = $_POST['tipo_recebimento'];
        $chave_pix = trim($_POST['chave_pix']);
        $banco = trim($_POST['banco']);
        $agencia = trim($_POST['agencia']);
        $conta = trim($_POST['conta']);
        $titular_conta = trim($_POST['titular_conta']);
        $ativo = isset($_POST['ativo']) ? 1 : 0;
        
        // Upload de logomarca
        $logomarca = '';
        if (isset($_FILES['logomarca']) && $_FILES['logomarca']['error'] == 0) {
            $upload_dir = "../uploads/organizadores/";
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0755, true);
            }
            
            $arquivo = $_FILES['logomarca'];
            $extensao = strtolower(pathinfo($arquivo['name'], PATHINFO_EXTENSION));
            $tipos_permitidos = ['jpg', 'jpeg', 'png', 'gif'];
            
            if (in_array($extensao, $tipos_permitidos) && $arquivo['size'] <= 5 * 1024 * 1024) {
                $nome_arquivo = 'logo_' . time() . '.' . $extensao;
                $caminho_arquivo = $upload_dir . $nome_arquivo;
                
                if (move_uploaded_file($arquivo['tmp_name'], $caminho_arquivo)) {
                    $logomarca = $nome_arquivo;
                }
            }
        }
        
        // Validações básicas
        if (empty($nome_fantasia)) {
            $erro = "Nome fantasia é obrigatório.";
        } else {
            if ($organizador_id > 0) {
                // Editar
                $sql = "UPDATE contratantes SET 
                        nome_fantasia = ?, razao_social = ?, cnpj = ?, cpf = ?, 
                        email_contato = ?, telefone = ?, endereco_completo = ?, 
                        tipo_recebimento = ?, chave_pix = ?, banco = ?, agencia = ?, 
                        conta = ?, titular_conta = ?, ativo = ?, atualizado_em = NOW()";
                
                if (!empty($logomarca)) {
                    $sql .= ", logomarca = ?";
                }
                
                $sql .= " WHERE id = ? AND usuario_id = ?";
                
                $stmt = mysqli_prepare($con, $sql);
                
                if (!empty($logomarca)) {
                    mysqli_stmt_bind_param($stmt, "ssssssssssssissii", 
                        $nome_fantasia, $razao_social, $cnpj, $cpf, $email_contato, 
                        $telefone, $endereco_completo, $tipo_recebimento, $chave_pix, 
                        $banco, $agencia, $conta, $titular_conta, $ativo, $logomarca, 
                        $organizador_id, $usuario_id);
                } else {
                    mysqli_stmt_bind_param($stmt, "ssssssssssssissii", 
                        $nome_fantasia, $razao_social, $cnpj, $cpf, $email_contato, 
                        $telefone, $endereco_completo, $tipo_recebimento, $chave_pix, 
                        $banco, $agencia, $conta, $titular_conta, $ativo, 
                        $organizador_id, $usuario_id);
                }
                
                if (mysqli_stmt_execute($stmt)) {
                    $sucesso = "Organizador atualizado com sucesso!";
                    $acao = 'listar';
                } else {
                    $erro = "Erro ao atualizar organizador: " . mysqli_error($con);
                }
            } else {
                // Criar novo
                $sql = "INSERT INTO contratantes (nome_fantasia, razao_social, cnpj, cpf, 
                        email_contato, telefone, endereco_completo, tipo_recebimento, 
                        chave_pix, banco, agencia, conta, titular_conta, ativo, usuario_id, 
                        logomarca, criado_em, atualizado_em) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
                
                $stmt = mysqli_prepare($con, $sql);
                mysqli_stmt_bind_param($stmt, "sssssssssssssiis", 
                    $nome_fantasia, $razao_social, $cnpj, $cpf, $email_contato, 
                    $telefone, $endereco_completo, $tipo_recebimento, $chave_pix, 
                    $banco, $agencia, $conta, $titular_conta, $ativo, $usuario_id, $logomarca);
                
                if (mysqli_stmt_execute($stmt)) {
                    $sucesso = "Organizador cadastrado com sucesso!";
                    $acao = 'listar';
                } else {
                    $erro = "Erro ao cadastrar organizador: " . mysqli_error($con);
                }
            }
        }
    } elseif ($acao_form == 'excluir') {
        $id_excluir = intval($_POST['id']);
        
        $sql = "DELETE FROM contratantes WHERE id = ? AND usuario_id = ?";
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, "ii", $id_excluir, $usuario_id);
        
        if (mysqli_stmt_execute($stmt)) {
            $sucesso = "Organizador excluído com sucesso!";
        } else {
            $erro = "Erro ao excluir organizador: " . mysqli_error($con);
        }
        $acao = 'listar';
    }
}

// Buscar organizadores do usuário
$organizadores = [];
$sql = "SELECT * FROM contratantes WHERE usuario_id = ? ORDER BY nome_fantasia";
$stmt = mysqli_prepare($con, $sql);
mysqli_stmt_bind_param($stmt, "i", $usuario_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
while ($row = mysqli_fetch_assoc($result)) {
    $organizadores[] = $row;
}

// Buscar dados do organizador para edição
$organizador_dados = null;
if ($organizador_id > 0 && ($acao == 'editar' || $acao == 'ver')) {
    $sql = "SELECT * FROM contratantes WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $organizador_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $organizador_dados = mysqli_fetch_assoc($result);
    
    if (!$organizador_dados) {
        $erro = "Organizador não encontrado.";
        $acao = 'listar';
    }
}
?><!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organizadores - AnySummit</title>
    
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-1.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <style>
        .content-area {
            padding: 20px;
            min-height: calc(100vh - 120px);
            overflow-x: hidden;
        }
        
        .organizadores-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .organizadores-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .organizadores-header h1 {
            color: #FFFFFF;
            font-size: 32px;
            font-weight: 700;
            margin: 0;
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(0, 194, 255, 0.4);
        }
        
        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }
        
        .btn-danger {
            background: rgba(245, 101, 101, 0.2);
            color: #fc8181;
            border: 1px solid rgba(245, 101, 101, 0.3);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
        }
        
        .btn-danger:hover {
            background: rgba(245, 101, 101, 0.3);
        }
        
        .organizadores-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .organizador-card {
            background: rgba(42, 42, 56, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 25px;
            transition: all 0.3s ease;
            color: white;
        }
        
        .organizador-card:hover {
            transform: translateY(-5px);
            border-color: rgba(0, 194, 255, 0.3);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
        
        .organizador-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .organizador-logo {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            flex-shrink: 0;
            overflow: hidden;
        }
        
        .organizador-logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .organizador-info h3 {
            margin: 0 0 5px 0;
            font-size: 1.2rem;
            color: #00C2FF;
        }
        
        .organizador-info p {
            margin: 0;
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;
        }
        
        .organizador-details {
            margin: 15px 0;
        }
        
        .detail-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-size: 0.9rem;
        }
        
        .detail-item i {
            width: 16px;
            color: rgba(255, 255, 255, 0.5);
        }
        
        .organizador-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .status-ativo {
            background: rgba(72, 187, 120, 0.2);
            color: #68d391;
            border: 1px solid rgba(72, 187, 120, 0.3);
        }
        
        .status-inativo {
            background: rgba(245, 101, 101, 0.2);
            color: #fc8181;
            border: 1px solid rgba(245, 101, 101, 0.3);
        }
        
        .form-container {
            background: rgba(42, 42, 56, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 30px;
            color: white;
            margin-bottom: 30px;
        }
        
        .form-container h2 {
            color: #00C2FF;
            margin-bottom: 25px;
            font-size: 1.5rem;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 500;
        }
        
        .form-control {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 2px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 12px !important;
            padding: 12px 16px !important;
            color: #FFFFFF !important;
            font-size: 0.95rem;
            transition: all 0.3s ease;
            width: 100%;
        }
        
        .form-control:focus {
            background: rgba(255, 255, 255, 0.08) !important;
            border-color: #00C2FF !important;
            box-shadow: 0 0 0 0.2rem rgba(0, 194, 255, 0.25) !important;
            color: #FFFFFF !important;
            outline: none;
        }
        
        .form-control::placeholder {
            color: rgba(255, 255, 255, 0.5) !important;
        }
        
        .form-check {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
        }
        
        .form-check input[type="checkbox"] {
            width: 18px;
            height: 18px;
        }
        
        .alert {
            border-radius: 12px !important;
            border: none !important;
            backdrop-filter: blur(20px);
            margin-bottom: 20px;
            padding: 12px 16px;
        }
        
        .alert-success {
            background: rgba(72, 187, 120, 0.2) !important;
            color: #68d391 !important;
            border: 1px solid rgba(72, 187, 120, 0.3) !important;
        }
        
        .alert-danger {
            background: rgba(245, 101, 101, 0.2) !important;
            color: #fc8181 !important;
            border: 1px solid rgba(245, 101, 101, 0.3) !important;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: rgba(255, 255, 255, 0.6);
        }
        
        .empty-state i {
            font-size: 4rem;
            margin-bottom: 20px;
            opacity: 0.3;
        }
        
        .hidden {
            display: none;
        }
        
        @media (max-width: 768px) {
            .organizadores-grid {
                grid-template-columns: 1fr;
            }
            
            .organizadores-header {
                flex-direction: column;
                align-items: stretch;
            }
        }
    </style>
</head><body>
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
                <div class="user-icon" onClick="toggleUserDropdown()">
                    <?php if ($usuario && !empty($usuario['foto_perfil'])): ?>
                        <img src="/uploads/capas/<?php echo htmlspecialchars($usuario['foto_perfil']); ?>" 
                             alt="Foto do usuário" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                    <?php else: ?>
                        👤
                    <?php endif; ?>
                </div>
                <div class="user-dropdown" id="userDropdown">
                    <div class="dropdown-item" onClick="window.location.href='perfil.php'">
                        👤 Perfil
                    </div>
                    <div class="dropdown-item" onClick="window.location.href='meuseventos.php'">
                        📅 Meus Eventos
                    </div>
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
            <div class="organizadores-container">
                <!-- Alertas -->
                <?php if (!empty($sucesso)): ?>
                    <div class="alert alert-success">
                        <i class="fas fa-check-circle"></i> <?php echo htmlspecialchars($sucesso); ?>
                    </div>
                <?php endif; ?>
                
                <?php if (!empty($erro)): ?>
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle"></i> <?php echo htmlspecialchars($erro); ?>
                    </div>
                <?php endif; ?>
                
                <?php if ($acao == 'listar'): ?>
                    <!-- Header da listagem -->
                    <div class="organizadores-header">
                        <h1>Organizadores</h1>
                        <a href="?acao=novo" class="btn-primary">
                            <i class="fas fa-plus"></i> Novo Organizador
                        </a>
                    </div>
                    
                    <?php if (empty($organizadores)): ?>
                        <div class="empty-state">
                            <i class="fas fa-building"></i>
                            <h3>Nenhum organizador cadastrado</h3>
                            <p>Comece cadastrando seu primeiro organizador para gerenciar eventos.</p>
                            <a href="?acao=novo" class="btn-primary" style="margin-top: 20px;">
                                <i class="fas fa-plus"></i> Cadastrar Primeiro Organizador
                            </a>
                        </div>
                    <?php else: ?>
                        <!-- Grid de organizadores -->
                        <div class="organizadores-grid">
                            <?php foreach ($organizadores as $org): ?>
                                <div class="organizador-card">
                                    <div class="organizador-header">
                                        <div class="organizador-logo">
                                            <?php if (!empty($org['logomarca'])): ?>
                                                <img src="/uploads/organizadores/<?php echo htmlspecialchars($org['logomarca']); ?>" 
                                                     alt="Logo">
                                            <?php else: ?>
                                                <i class="fas fa-building"></i>
                                            <?php endif; ?>
                                        </div>
                                        <div class="organizador-info">
                                            <h3><?php echo htmlspecialchars($org['nome_fantasia']); ?></h3>
                                            <p><?php echo htmlspecialchars($org['razao_social']); ?></p>
                                            <span class="status-badge status-<?php echo $org['ativo'] ? 'ativo' : 'inativo'; ?>">
                                                <?php echo $org['ativo'] ? 'Ativo' : 'Inativo'; ?>
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div class="organizador-details">
                                        <?php if (!empty($org['cnpj'])): ?>
                                            <div class="detail-item">
                                                <i class="fas fa-id-card"></i>
                                                <span>CNPJ: <?php echo htmlspecialchars($org['cnpj']); ?></span>
                                            </div>
                                        <?php endif; ?>
                                        
                                        <?php if (!empty($org['cpf'])): ?>
                                            <div class="detail-item">
                                                <i class="fas fa-user"></i>
                                                <span>CPF: <?php echo htmlspecialchars($org['cpf']); ?></span>
                                            </div>
                                        <?php endif; ?>
                                        
                                        <?php if (!empty($org['email_contato'])): ?>
                                            <div class="detail-item">
                                                <i class="fas fa-envelope"></i>
                                                <span><?php echo htmlspecialchars($org['email_contato']); ?></span>
                                            </div>
                                        <?php endif; ?>
                                        
                                        <?php if (!empty($org['telefone'])): ?>
                                            <div class="detail-item">
                                                <i class="fas fa-phone"></i>
                                                <span><?php echo htmlspecialchars($org['telefone']); ?></span>
                                            </div>
                                        <?php endif; ?>
                                        
                                        <div class="detail-item">
                                            <i class="fas fa-credit-card"></i>
                                            <span>Recebimento: <?php echo ucfirst($org['tipo_recebimento']); ?></span>
                                        </div>
                                    </div>
                                    
                                    <div class="organizador-actions">
                                        <a href="?acao=editar&id=<?php echo $org['id']; ?>" class="btn-secondary">
                                            <i class="fas fa-edit"></i> Editar
                                        </a>
                                        <a href="?acao=ver&id=<?php echo $org['id']; ?>" class="btn-secondary">
                                            <i class="fas fa-eye"></i> Ver
                                        </a>
                                        <button type="button" class="btn-danger" onclick="confirmarExclusao(<?php echo $org['id']; ?>, '<?php echo addslashes($org['nome_fantasia']); ?>')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                    
                <?php elseif ($acao == 'novo' || $acao == 'editar'): ?>
                    <!-- Formulário de cadastro/edição -->
                    <div class="organizadores-header">
                        <h1><?php echo $acao == 'novo' ? 'Novo Organizador' : 'Editar Organizador'; ?></h1>
                        <a href="?acao=listar" class="btn-secondary">
                            <i class="fas fa-arrow-left"></i> Voltar
                        </a>
                    </div>
                    
                    <div class="form-container">
                        <form method="POST" enctype="multipart/form-data">
                            <input type="hidden" name="acao" value="salvar">
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="nome_fantasia">Nome Fantasia *</label>
                                        <input type="text" class="form-control" id="nome_fantasia" name="nome_fantasia" 
                                               value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['nome_fantasia']) : ''; ?>" 
                                               required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="razao_social">Razão Social</label>
                                        <input type="text" class="form-control" id="razao_social" name="razao_social" 
                                               value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['razao_social']) : ''; ?>">
                                    </div>
                                </div>
                            </div>
                            
                        <div class="row">
                            <div class="col-md-6">
                                <h4 style="color: #00C2FF; margin-bottom: 15px;">Informações Básicas</h4>
                                
                                <?php if (!empty($organizador_dados['cnpj'])): ?>
                                    <div class="detail-item" style="margin-bottom: 15px;">
                                        <i class="fas fa-id-card"></i>
                                        <strong>CNPJ:</strong> <?php echo htmlspecialchars($organizador_dados['cnpj']); ?>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if (!empty($organizador_dados['cpf'])): ?>
                                    <div class="detail-item" style="margin-bottom: 15px;">
                                        <i class="fas fa-user"></i>
                                        <strong>CPF:</strong> <?php echo htmlspecialchars($organizador_dados['cpf']); ?>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if (!empty($organizador_dados['email_contato'])): ?>
                                    <div class="detail-item" style="margin-bottom: 15px;">
                                        <i class="fas fa-envelope"></i>
                                        <strong>E-mail:</strong> <?php echo htmlspecialchars($organizador_dados['email_contato']); ?>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if (!empty($organizador_dados['telefone'])): ?>
                                    <div class="detail-item" style="margin-bottom: 15px;">
                                        <i class="fas fa-phone"></i>
                                        <strong>Telefone:</strong> <?php echo htmlspecialchars($organizador_dados['telefone']); ?>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if (!empty($organizador_dados['endereco_completo'])): ?>
                                    <div class="detail-item" style="margin-bottom: 15px;">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <strong>Endereço:</strong><br>
                                        <span style="margin-left: 24px;"><?php echo nl2br(htmlspecialchars($organizador_dados['endereco_completo'])); ?></span>
                                    </div>
                                <?php endif; ?>
                            </div>
                            
                            <div class="col-md-6">
                                <h4 style="color: #00C2FF; margin-bottom: 15px;">Dados de Recebimento</h4>
                                
                                <div class="detail-item" style="margin-bottom: 15px;">
                                    <i class="fas fa-credit-card"></i>
                                    <strong>Tipo:</strong> <?php echo ucfirst($organizador_dados['tipo_recebimento']); ?>
                                </div>
                                
                                <?php if ($organizador_dados['tipo_recebimento'] == 'pix' && !empty($organizador_dados['chave_pix'])): ?>
                                    <div class="detail-item" style="margin-bottom: 15px;">
                                        <i class="fas fa-qrcode"></i>
                                        <strong>Chave PIX:</strong> <?php echo htmlspecialchars($organizador_dados['chave_pix']); ?>
                                    </div>
                                <?php elseif ($organizador_dados['tipo_recebimento'] == 'transferencia'): ?>
                                    <?php if (!empty($organizador_dados['banco'])): ?>
                                        <div class="detail-item" style="margin-bottom: 15px;">
                                            <i class="fas fa-university"></i>
                                            <strong>Banco:</strong> <?php echo htmlspecialchars($organizador_dados['banco']); ?>
                                        </div>
                                    <?php endif; ?>
                                    
                                    <?php if (!empty($organizador_dados['agencia'])): ?>
                                        <div class="detail-item" style="margin-bottom: 15px;">
                                            <i class="fas fa-building"></i>
                                            <strong>Agência:</strong> <?php echo htmlspecialchars($organizador_dados['agencia']); ?>
                                        </div>
                                    <?php endif; ?>
                                    
                                    <?php if (!empty($organizador_dados['conta'])): ?>
                                        <div class="detail-item" style="margin-bottom: 15px;">
                                            <i class="fas fa-credit-card"></i>
                                            <strong>Conta:</strong> <?php echo htmlspecialchars($organizador_dados['conta']); ?>
                                        </div>
                                    <?php endif; ?>
                                    
                                    <?php if (!empty($organizador_dados['titular_conta'])): ?>
                                        <div class="detail-item" style="margin-bottom: 15px;">
                                            <i class="fas fa-user-tie"></i>
                                            <strong>Titular:</strong> <?php echo htmlspecialchars($organizador_dados['titular_conta']); ?>
                                        </div>
                                    <?php endif; ?>
                                <?php endif; ?>
                                
                                <div class="detail-item" style="margin-bottom: 15px;">
                                    <i class="fas fa-calendar"></i>
                                    <strong>Cadastrado em:</strong> <?php echo date('d/m/Y H:i', strtotime($organizador_dados['criado_em'])); ?>
                                </div>
                                
                                <div class="detail-item" style="margin-bottom: 15px;">
                                    <i class="fas fa-clock"></i>
                                    <strong>Última atualização:</strong> <?php echo date('d/m/Y H:i', strtotime($organizador_dados['atualizado_em'])); ?>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        </main>
    </div>

    <!-- Modal de confirmação de exclusão -->
    <div id="modalExclusao" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; align-items: center; justify-content: center;">
        <div style="background: rgba(42, 42, 56, 0.95); padding: 30px; border-radius: 16px; color: white; max-width: 400px; text-align: center;">
            <h3 style="color: #fc8181; margin-bottom: 15px;">Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir o organizador <strong id="nomeOrganizador"></strong>?</p>
            <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Esta ação não pode ser desfeita.</p>
            
            <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
                <button onclick="fecharModal()" class="btn-secondary">Cancelar</button>
                <form method="POST" style="display: inline;">
                    <input type="hidden" name="acao" value="excluir">
                    <input type="hidden" name="id" id="idExcluir">
                    <button type="submit" class="btn-danger">Excluir</button>
                </form>
            </div>
        </div>
    </div>

    <script>
        // Alternar campos de recebimento
        function toggleRecebimentoFields() {
            const tipo = document.getElementById('tipo_recebimento').value;
            const pixFields = document.getElementById('pix-fields');
            const bancoFields = document.getElementById('banco-fields');
            
            if (tipo === 'pix') {
                pixFields.style.display = 'block';
                bancoFields.style.display = 'none';
            } else {
                pixFields.style.display = 'none';
                bancoFields.style.display = 'block';
            }
        }
        
        // Confirmar exclusão
        function confirmarExclusao(id, nome) {
            document.getElementById('idExcluir').value = id;
            document.getElementById('nomeOrganizador').textContent = nome;
            document.getElementById('modalExclusao').style.display = 'flex';
        }
        
        // Fechar modal
        function fecharModal() {
            document.getElementById('modalExclusao').style.display = 'none';
        }
        
        // Auto-dismiss para alertas
        setTimeout(function() {
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach(function(alert) {
                alert.style.opacity = '0';
                setTimeout(function() {
                    alert.remove();
                }, 300);
            });
        }, 5000);
        
        // ===== SCRIPTS DO HEADER =====
        
        // Toggle user dropdown
        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('active');
        }

        // Toggle mobile menu
        function toggleMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('mobileOverlay');
            
            sidebar.classList.toggle('mobile-active');
            overlay.classList.toggle('active');
        }

        // Close mobile menu
        function closeMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('mobileOverlay');
            
            sidebar.classList.remove('mobile-active');
            overlay.classList.remove('active');
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            const userMenu = document.querySelector('.user-menu');
            const dropdown = document.getElementById('userDropdown');
            const sidebar = document.querySelector('.sidebar');
            const menuToggle = document.querySelector('.menu-toggle');
            
            if (!userMenu.contains(event.target)) {
                dropdown.classList.remove('active');
            }
            
            if (window.innerWidth <= 768 && 
                !sidebar.contains(event.target) && 
                !menuToggle.contains(event.target)) {
                closeMobileMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });

        // Logout function
        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                window.location = 'logout.php';
            }
        }

        // Mouse interaction with particles
        document.addEventListener('mousemove', function(e) {
            const particles = document.querySelectorAll('.particle');
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            particles.forEach((particle, index) => {
                const speed = (index + 1) * 0.5;
                const x = mouseX * speed;
                const y = mouseY * speed;
                
                particle.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    </script>
</body>
</html>