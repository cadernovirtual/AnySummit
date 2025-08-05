<?php
session_start();
include("conm/conn.php");

// Função para verificar login via cookie
function verificarLoginCookie() {
    if (isset($_COOKIE['usuario_logado']) && $_COOKIE['usuario_logado'] == '1') {
        // Restaura as sessões a partir dos cookies
        $_SESSION['usuario_logado'] = true;
        $_SESSION['usuarioid'] = isset($_COOKIE['usuarioid']) ? $_COOKIE['usuarioid'] : '';
        $_SESSION['usuario_nome'] = isset($_COOKIE['usuario_nome']) ? $_COOKIE['usuario_nome'] : '';
        $_SESSION['usuario_email'] = isset($_COOKIE['usuario_email']) ? $_COOKIE['usuario_email'] : '';
        $_SESSION['contratanteid'] = isset($_COOKIE['contratanteid']) ? $_COOKIE['contratanteid'] : '';
        return true;
    }
    return false;
}

// Verificar se usuário está logado
if (!isset($_SESSION['usuario_logado']) || $_SESSION['usuario_logado'] !== true) {
    // Tenta verificar via cookie
    if (!verificarLoginCookie()) {
        // Não está logado, redireciona para index
        header("Location: index.php");
        exit();
    }
}

$usuario_id = $_SESSION['usuarioid'];
$sucesso = '';
$erro = '';

// Processar formulário de atualização de dados
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['action'])) {
        
        // Atualizar dados pessoais
        if ($_POST['action'] == 'atualizar_dados') {            $nome = trim($_POST['nome']);
            $email = trim($_POST['email']);
            $celular = trim($_POST['celular']);
            $nome_exibicao = trim($_POST['nome_exibicao']);
            $descricao_produtor = trim($_POST['descricao_produtor']);
            
            // Validações básicas
            if (empty($nome) || empty($email)) {
                $erro = "Nome e email são obrigatórios.";
            } else {
                // Verificar se email já existe para outro usuário
                $sql_check = "SELECT id FROM usuarios WHERE email = ? AND id != ?";
                $stmt_check = mysqli_prepare($con, $sql_check);
                mysqli_stmt_bind_param($stmt_check, "si", $email, $usuario_id);
                mysqli_stmt_execute($stmt_check);
                $result_check = mysqli_stmt_get_result($stmt_check);
                
                if (mysqli_num_rows($result_check) > 0) {
                    $erro = "Este email já está sendo usado por outro usuário.";
                } else {
                    // Atualizar dados
                    $sql_update = "UPDATE usuarios SET 
                                   nome = ?, 
                                   email = ?, 
                                   celular = ?, 
                                   nome_exibicao = ?, 
                                   descricao_produtor = ?,
                                   atualizado_em = NOW()
                                   WHERE id = ?";
                    
                    $stmt_update = mysqli_prepare($con, $sql_update);
                    mysqli_stmt_bind_param($stmt_update, "sssssi", 
                                         $nome, $email, $celular, $nome_exibicao, $descricao_produtor, $usuario_id);
                    
                    if (mysqli_stmt_execute($stmt_update)) {
                        $sucesso = "Dados atualizados com sucesso!";
                        // Atualizar variáveis de sessão se necessário
                        $_SESSION['usuario_nome'] = $nome;
                        $_SESSION['usuario_email'] = $email;
                    } else {
                        $erro = "Erro ao atualizar dados: " . mysqli_error($con);
                    }
                }
            }
        }
        
        // Alterar senha
        elseif ($_POST['action'] == 'alterar_senha') {
            $senha_atual = $_POST['senha_atual'];
            $nova_senha = $_POST['nova_senha'];
            $confirmar_senha = $_POST['confirmar_senha'];
            
            // Validações
            if (empty($senha_atual) || empty($nova_senha) || empty($confirmar_senha)) {
                $erro = "Todos os campos de senha são obrigatórios.";
            } elseif ($nova_senha !== $confirmar_senha) {
                $erro = "A nova senha e a confirmação não coincidem.";
            } elseif (strlen($nova_senha) < 6) {
                $erro = "A nova senha deve ter pelo menos 6 caracteres.";
            } else {
                // Verificar senha atual
                $sql_senha = "SELECT senha_hash FROM usuarios WHERE id = ?";
                $stmt_senha = mysqli_prepare($con, $sql_senha);
                mysqli_stmt_bind_param($stmt_senha, "i", $usuario_id);
                mysqli_stmt_execute($stmt_senha);
                $result_senha = mysqli_stmt_get_result($stmt_senha);
                $senha_data = mysqli_fetch_assoc($result_senha);
                
                if (!$senha_data || !password_verify($senha_atual, $senha_data['senha_hash'])) {
                    $erro = "Senha atual incorreta.";
                } else {
                    // Atualizar senha
                    $nova_senha_hash = password_hash($nova_senha, PASSWORD_DEFAULT);
                    $sql_update_senha = "UPDATE usuarios SET senha_hash = ?, atualizado_em = NOW() WHERE id = ?";
                    $stmt_update_senha = mysqli_prepare($con, $sql_update_senha);
                    mysqli_stmt_bind_param($stmt_update_senha, "si", $nova_senha_hash, $usuario_id);
                    
                    if (mysqli_stmt_execute($stmt_update_senha)) {
                        $sucesso = "Senha alterada com sucesso!";
                    } else {
                        $erro = "Erro ao alterar senha: " . mysqli_error($con);
                    }
                }
            }
        }
        
        // Upload de foto
        elseif ($_POST['action'] == 'upload_foto') {
            $upload_dir = "../uploads/capas/";
            
            // Criar diretório se não existir
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0755, true);
            }
            
            if (isset($_FILES['foto_perfil']) && $_FILES['foto_perfil']['error'] == 0) {
                $arquivo = $_FILES['foto_perfil'];
                $extensao = strtolower(pathinfo($arquivo['name'], PATHINFO_EXTENSION));
                $tipos_permitidos = ['jpg', 'jpeg', 'png', 'gif'];
                
                if (in_array($extensao, $tipos_permitidos)) {
                    if ($arquivo['size'] <= 5 * 1024 * 1024) { // 5MB
                        $nome_arquivo = 'perfil_' . $usuario_id . '_' . time() . '.' . $extensao;
                        $caminho_arquivo = $upload_dir . $nome_arquivo;
                        
                        if (move_uploaded_file($arquivo['tmp_name'], $caminho_arquivo)) {
                            
                            // Buscar foto anterior para deletar
                            $sql_foto_antiga = "SELECT foto_perfil FROM usuarios WHERE id = ?";
                            $stmt_foto_antiga = mysqli_prepare($con, $sql_foto_antiga);
                            mysqli_stmt_bind_param($stmt_foto_antiga, "i", $usuario_id);
                            mysqli_stmt_execute($stmt_foto_antiga);
                            $result_foto_antiga = mysqli_stmt_get_result($stmt_foto_antiga);
                            $foto_antiga_data = mysqli_fetch_assoc($result_foto_antiga);
                            
                            // Atualizar banco de dados
                            $sql_update_foto = "UPDATE usuarios SET foto_perfil = ?, atualizado_em = NOW() WHERE id = ?";
                            $stmt_update_foto = mysqli_prepare($con, $sql_update_foto);
                            mysqli_stmt_bind_param($stmt_update_foto, "si", $nome_arquivo, $usuario_id);
                            
                            if (mysqli_stmt_execute($stmt_update_foto)) {
                                // Deletar foto anterior se existir
                                if (!empty($foto_antiga_data['foto_perfil']) && 
                                    file_exists($upload_dir . $foto_antiga_data['foto_perfil'])) {
                                    unlink($upload_dir . $foto_antiga_data['foto_perfil']);
                                }
                                
                                $sucesso = "Foto atualizada com sucesso!";
                            } else {
                                $erro = "Erro ao salvar foto no banco de dados.";
                                // Deletar arquivo se falhou no banco
                                unlink($caminho_arquivo);
                            }
                        } else {
                            $erro = "Erro ao fazer upload da foto.";
                        }
                    } else {
                        $erro = "Arquivo muito grande. Tamanho máximo: 5MB.";
                    }
                } else {
                    $erro = "Tipo de arquivo não permitido. Use apenas: JPG, PNG ou GIF.";
                }
            } else {
                $erro = "Nenhum arquivo selecionado ou erro no upload.";
            }
        }
    }
}

// Buscar dados atuais do usuário
$sql_usuario = "SELECT * FROM usuarios WHERE id = ?";
$stmt_usuario = mysqli_prepare($con, $sql_usuario);
mysqli_stmt_bind_param($stmt_usuario, "i", $usuario_id);
mysqli_stmt_execute($stmt_usuario);
$result_usuario = mysqli_stmt_get_result($stmt_usuario);
$usuario = mysqli_fetch_assoc($result_usuario);

if (!$usuario) {
    header("Location: index.php");
    exit();
}
?><!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perfil do Usuário - AnySummit</title>
    
    <!-- CSS do Sistema - CORRIGINDO CAMINHOS ABSOLUTOS -->
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-1.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <style>
        /* Container principal alinhado com o sistema */
        .content-area {
            padding: 20px;
            min-height: calc(100vh - 120px);
            overflow-x: hidden;
        }
        
        .perfil-container {
            max-width: 900px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
        }
        
        /* Header do perfil - tamanho fixo para evitar sobreposição */
        .profile-header {
            background: rgba(42, 42, 56, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            padding: 30px;
            border-radius: 16px;
            margin-bottom: 30px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            position: relative;
        }
        
        /* Avatar com tamanho fixo */
        .profile-avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 4px solid rgba(255, 255, 255, 0.2);
            margin: 0 auto 20px;
            overflow: hidden;
            position: relative;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            transition: all 0.3s ease;
            /* IMPORTANTE: evitar que cresça */
            flex-shrink: 0;
        }
        
        .profile-avatar:hover {
            transform: scale(1.05);
            border-color: rgba(0, 194, 255, 0.5);
        }
        
        .profile-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        
        .avatar-placeholder {
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .upload-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;
            cursor: pointer;
            color: white;
            font-size: 1.5rem;
        }
        
        .profile-avatar:hover .upload-overlay {
            opacity: 1;
        }
        
        /* Cards de conteúdo */
        .profile-card {
            background: rgba(42, 42, 56, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            color: white;
        }
        
        .profile-card h4 {
            color: #00C2FF;
            margin-bottom: 20px;
            font-size: 1.3rem;
            font-weight: 600;
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
        
        .form-control, .form-select {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 2px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 12px !important;
            padding: 12px 16px !important;
            color: #FFFFFF !important;
            font-size: 0.95rem;
            transition: all 0.3s ease;
            width: 100%;
        }
        
        .form-control:focus, .form-select:focus {
            background: rgba(255, 255, 255, 0.08) !important;
            border-color: #00C2FF !important;
            box-shadow: 0 0 0 0.2rem rgba(0, 194, 255, 0.25) !important;
            color: #FFFFFF !important;
            outline: none;
        }
        
        .form-control::placeholder {
            color: rgba(255, 255, 255, 0.5) !important;
        }
        
        .btn-custom {
            background: linear-gradient(135deg, #00C2FF, #725EFF) !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 12px 24px !important;
            color: white !important;
            font-weight: 600 !important;
            font-size: 0.95rem !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 4px 20px rgba(0, 194, 255, 0.3) !important;
            cursor: pointer;
        }
        
        .btn-custom:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 30px rgba(0, 194, 255, 0.4) !important;
            color: white !important;
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
        
        .password-toggle {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            color: rgba(255, 255, 255, 0.6);
            transition: color 0.3s;
        }
        
        .password-toggle:hover {
            color: #00C2FF;
        }
        
        .input-group {
            position: relative;
        }
        
        #fileInput {
            display: none;
        }
        
        .stats-row {
            display: flex;
            justify-content: space-around;
            margin-top: 20px;
            gap: 20px;
            flex-wrap: wrap;
        }
        
        .stat-item {
            text-align: center;
            flex: 1;
            min-width: 120px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .stat-number {
            font-size: 1.8rem;
            font-weight: bold;
            color: #00C2FF;
            display: block;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
            margin-top: 5px;
        }
        
        .badge {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
            display: inline-block;
            margin-top: 10px;
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
            .perfil-container {
                padding: 10px;
            }
            
            .profile-card {
                padding: 20px;
            }
            
            .stats-row {
                flex-direction: column;
                gap: 10px;
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
                    <?php if (!empty($usuario['foto_perfil'])): ?>
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
        <div class="perfil-container">
            <!-- Alertas de feedback -->
            <?php if (!empty($sucesso)): ?>
                <div class="alert alert-success" role="alert">
                    <i class="fas fa-check-circle"></i> <?php echo htmlspecialchars($sucesso); ?>
                </div>
            <?php endif; ?>
            
            <?php if (!empty($erro)): ?>
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-circle"></i> <?php echo htmlspecialchars($erro); ?>
                </div>
            <?php endif; ?>
            
            <!-- Header do Perfil -->
            <div class="profile-header">
                <div class="profile-avatar" onclick="document.getElementById('fileInput').click()">
                    <?php if (!empty($usuario['foto_perfil'])): ?>
                        <img src="/uploads/capas/<?php echo htmlspecialchars($usuario['foto_perfil']); ?>" 
                             alt="Foto do perfil">
                    <?php else: ?>
                        <div class="avatar-placeholder">
                            <i class="fas fa-user"></i>
                        </div>
                    <?php endif; ?>
                    <div class="upload-overlay">
                        <i class="fas fa-camera"></i>
                    </div>
                </div>
                <h3><?php echo htmlspecialchars($usuario['nome_exibicao'] ?: $usuario['nome']); ?></h3>
                <p><?php echo htmlspecialchars($usuario['email']); ?></p>
                <span class="badge"><?php echo ucfirst($usuario['perfil']); ?></span>
                
                <!-- Estatísticas básicas -->
                <?php
                // Buscar estatísticas do usuário
                $sql_stats = "SELECT 
                                COUNT(*) as total_eventos,
                                SUM(CASE WHEN status = 'publicado' THEN 1 ELSE 0 END) as eventos_publicados
                              FROM eventos WHERE usuario_id = ?";
                $stmt_stats = mysqli_prepare($con, $sql_stats);
                mysqli_stmt_bind_param($stmt_stats, "i", $usuario_id);
                mysqli_stmt_execute($stmt_stats);
                $stats = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt_stats));
                ?>
                <div class="stats-row">
                    <div class="stat-item">
                        <div class="stat-number"><?php echo $stats['total_eventos']; ?></div>
                        <div class="stat-label">Total de Eventos</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number"><?php echo $stats['eventos_publicados']; ?></div>
                        <div class="stat-label">Eventos Publicados</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">
                            <?php echo $usuario['email_verificado'] ? '<i class="fas fa-check-circle" style="color: #48bb78;"></i>' : '<i class="fas fa-times-circle" style="color: #f56565;"></i>'; ?>
                        </div>
                        <div class="stat-label">Email Verificado</div>
                    </div>
                </div>
            </div>
            
            <!-- Upload de Foto (oculto) -->
            <form method="POST" enctype="multipart/form-data" id="formFoto">
                <input type="hidden" name="action" value="upload_foto">
                <input type="file" id="fileInput" name="foto_perfil" accept="image/*" 
                       onchange="document.getElementById('formFoto').submit();">
            </form>
            
            <!-- Dados Pessoais -->
            <div class="profile-card">
                <h4><i class="fas fa-user-edit"></i> Dados Pessoais</h4>
                <form method="POST">
                    <input type="hidden" name="action" value="atualizar_dados">
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="nome">Nome Completo *</label>
                                <input type="text" class="form-control" id="nome" name="nome" 
                                       value="<?php echo htmlspecialchars($usuario['nome']); ?>" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="nome_exibicao">Nome de Exibição</label>
                                <input type="text" class="form-control" id="nome_exibicao" name="nome_exibicao" 
                                       value="<?php echo htmlspecialchars($usuario['nome_exibicao'] ?: ''); ?>"
                                       placeholder="Como você quer ser chamado">
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="email">E-mail *</label>
                                <input type="email" class="form-control" id="email" name="email" 
                                       value="<?php echo htmlspecialchars($usuario['email']); ?>" required>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="celular">Celular</label>
                                <input type="tel" class="form-control" id="celular" name="celular" 
                                       value="<?php echo htmlspecialchars($usuario['celular'] ?: ''); ?>"
                                       placeholder="(11) 99999-9999">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="descricao_produtor">Descrição do Produtor</label>
                        <textarea class="form-control" id="descricao_produtor" name="descricao_produtor" 
                                  rows="4" placeholder="Fale um pouco sobre você e seus eventos..."><?php echo htmlspecialchars($usuario['descricao_produtor'] ?: ''); ?></textarea>
                    </div>
                    
                    <div class="text-end">
                        <button type="submit" class="btn btn-custom">
                            <i class="fas fa-save"></i> Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>            
            <!-- Alterar Senha -->
            <div class="profile-card">
                <h4><i class="fas fa-key"></i> Alterar Senha</h4>
                <form method="POST" id="formSenha">
                    <input type="hidden" name="action" value="alterar_senha">
                    
                    <div class="form-group">
                        <label for="senha_atual">Senha Atual *</label>
                        <div class="input-group">
                            <input type="password" class="form-control" id="senha_atual" name="senha_atual" required>
                            <span class="password-toggle" onclick="togglePassword('senha_atual')">
                                <i class="fas fa-eye" id="eye-senha_atual"></i>
                            </span>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="nova_senha">Nova Senha *</label>
                                <div class="input-group">
                                    <input type="password" class="form-control" id="nova_senha" name="nova_senha" 
                                           minlength="6" required>
                                    <span class="password-toggle" onclick="togglePassword('nova_senha')">
                                        <i class="fas fa-eye" id="eye-nova_senha"></i>
                                    </span>
                                </div>
                                <small class="form-text" style="color: rgba(255, 255, 255, 0.6);">
                                    Mínimo de 6 caracteres
                                </small>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="confirmar_senha">Confirmar Nova Senha *</label>
                                <div class="input-group">
                                    <input type="password" class="form-control" id="confirmar_senha" name="confirmar_senha" 
                                           minlength="6" required>
                                    <span class="password-toggle" onclick="togglePassword('confirmar_senha')">
                                        <i class="fas fa-eye" id="eye-confirmar_senha"></i>
                                    </span>
                                </div>
                                <small id="senha-match" class="form-text"></small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-end">
                        <button type="submit" class="btn btn-custom" id="btnAlterarSenha">
                            <i class="fas fa-lock"></i> Alterar Senha
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- Informações da Conta -->
            <div class="profile-card">
                <h4><i class="fas fa-info-circle"></i> Informações da Conta</h4>
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Conta criada em:</strong> 
                        <?php echo date('d/m/Y', strtotime($usuario['criado_em'])); ?></p>
                        <p><strong>Último acesso:</strong> 
                        <?php echo $usuario['ultimo_acesso'] ? date('d/m/Y H:i', strtotime($usuario['ultimo_acesso'])) : 'Nunca'; ?></p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Status da conta:</strong> 
                        <span style="color: <?php echo $usuario['ativo'] ? '#48bb78' : '#f56565'; ?>">
                            <?php echo $usuario['ativo'] ? 'Ativa' : 'Inativa'; ?>
                        </span></p>
                        <p><strong>Tipo de perfil:</strong> <?php echo ucfirst($usuario['perfil']); ?></p>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        // Função para alternar visibilidade da senha
        function togglePassword(fieldId) {
            const field = document.getElementById(fieldId);
            const eye = document.getElementById('eye-' + fieldId);
            
            if (field.type === 'password') {
                field.type = 'text';
                eye.classList.remove('fa-eye');
                eye.classList.add('fa-eye-slash');
            } else {
                field.type = 'password';
                eye.classList.remove('fa-eye-slash');
                eye.classList.add('fa-eye');
            }
        }
        
        // Validação em tempo real da confirmação de senha
        document.getElementById('confirmar_senha').addEventListener('input', function() {
            const novaSenha = document.getElementById('nova_senha').value;
            const confirmarSenha = this.value;
            const feedback = document.getElementById('senha-match');
            const btnSubmit = document.getElementById('btnAlterarSenha');
            
            if (confirmarSenha.length > 0) {
                if (novaSenha === confirmarSenha) {
                    feedback.textContent = '✓ Senhas coincidem';
                    feedback.style.color = '#48bb78';
                    btnSubmit.disabled = false;
                } else {
                    feedback.textContent = '✗ Senhas não coincidem';
                    feedback.style.color = '#f56565';
                    btnSubmit.disabled = true;
                }
            } else {
                feedback.textContent = '';
                btnSubmit.disabled = false;
            }
        });
        
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
        
        // ===== SCRIPTS DO HEADER (copiados do sistema) =====
        
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