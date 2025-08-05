<?php
include("check_login.php");
include_once('conm/conn.php');

// Verificação de login (igual meuseventos.php)
if (!isset($_SESSION['usuario_logado']) || $_SESSION['usuario_logado'] !== true) {
    header('Location: /produtor/index.php');
    exit;
}

$usuario_id = $_SESSION['usuarioid'];
$contratante_id = $_COOKIE['contratanteid'] ?? 0;

// Buscar dados do usuário para o header
$usuario = null;
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

// Variáveis de mensagem
$success_message = '';
$error_message = '';

// Dados para edição
$editando = false;
$dados = [];

if (isset($_GET['id']) && is_numeric($_GET['id'])) {
    $id = (int)$_GET['id'];
    $sql = "SELECT * FROM contratantes WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($dados = mysqli_fetch_assoc($result)) {
        $editando = true;
    }
    mysqli_stmt_close($stmt);
}

// Processar formulário (LÓGICA SIMPLIFICADA)
if ($_POST && isset($_POST['acao']) && $_POST['acao'] === 'salvar') {
    $tipo_pessoa = $_POST['tipo_pessoa'] ?? 'fisica';
    $nome_fantasia = trim($_POST['nome_fantasia'] ?? '');
    $cpf = $tipo_pessoa === 'fisica' ? trim($_POST['cpf'] ?? '') : '';
    $cnpj = $tipo_pessoa === 'juridica' ? trim($_POST['cnpj'] ?? '') : '';
    $razao_social = trim($_POST['razao_social'] ?? '');
    $email_contato = trim($_POST['email_contato'] ?? '');
    $telefone = trim($_POST['telefone'] ?? '');
    $endereco_completo = trim($_POST['endereco_completo'] ?? '');
    
    // Dados de recebimento
    $tipo_recebimento = $_POST['tipo_recebimento'] ?? 'pix';
    $chave_pix = $tipo_recebimento === 'pix' ? trim($_POST['chave_pix'] ?? '') : '';
    $banco = $tipo_recebimento === 'bancario' ? trim($_POST['banco'] ?? '') : '';
    $agencia = $tipo_recebimento === 'bancario' ? trim($_POST['agencia'] ?? '') : '';
    $conta = $tipo_recebimento === 'bancario' ? trim($_POST['conta'] ?? '') : '';
    $titular_conta = $tipo_recebimento === 'bancario' ? trim($_POST['titular_conta'] ?? '') : '';
    
    // Processar upload da logomarca
    $logomarca_path = '';
    $upload_error = '';
    
    if (isset($_FILES['logomarca']) && $_FILES['logomarca']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = '../uploads/organizadores/';
        $file_tmp = $_FILES['logomarca']['tmp_name'];
        $file_name = $_FILES['logomarca']['name'];
        $file_size = $_FILES['logomarca']['size'];
        $file_type = $_FILES['logomarca']['type'];
        
        // Validar tipo de arquivo
        $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file_type, $allowed_types)) {
            $upload_error = 'Tipo de arquivo não permitido. Use apenas: JPG, PNG, GIF ou WebP.';
        }
        
        // Validar tamanho (máximo 5MB)
        if ($file_size > 5 * 1024 * 1024) {
            $upload_error = 'Arquivo muito grande. Tamanho máximo: 5MB.';
        }
        
        if (empty($upload_error)) {
            // Gerar nome único para o arquivo
            $file_extension = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
            $new_filename = 'org_' . $usuario_id . '_' . time() . '.' . $file_extension;
            $upload_path = $upload_dir . $new_filename;
            
            // Criar diretório se não existir
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0755, true);
            }
            
            // Fazer upload
            if (move_uploaded_file($file_tmp, $upload_path)) {
                $logomarca_path = '/uploads/organizadores/' . $new_filename;
            } else {
                $upload_error = 'Erro ao fazer upload do arquivo.';
            }
        }
    }
    
    // Se há erro de upload, mostrar mensagem
    if (!empty($upload_error)) {
        $error_message = $upload_error;
    }
    
    
    // Validação básica
    if (empty($nome_fantasia)) {
        $error_message = "Nome é obrigatório.";
    } elseif ($tipo_pessoa === 'fisica' && empty($cpf)) {
        $error_message = "CPF é obrigatório para pessoa física.";
    } elseif ($tipo_pessoa === 'juridica' && empty($cnpj)) {
        $error_message = "CNPJ é obrigatório para pessoa jurídica.";
    } else {
        // Salvamento
        if ($editando && isset($_POST['id'])) {
            // UPDATE
            $id = (int)$_POST['id'];
            
            // Se não houve upload de nova logomarca, manter a existente
            if (empty($logomarca_path) && isset($dados['logomarca'])) {
                $logomarca_path = $dados['logomarca'];
            }
            
            $sql = "UPDATE contratantes SET 
                    nome_fantasia = ?, razao_social = ?, cpf = ?, cnpj = ?, 
                    email_contato = ?, telefone = ?, endereco_completo = ?,
                    tipo_recebimento = ?, chave_pix = ?, banco = ?, 
                    agencia = ?, conta = ?, titular_conta = ?, logomarca = ?
                    WHERE id = ? AND usuario_id = ?";
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "ssssssssssssssii", 
                $nome_fantasia, $razao_social, $cpf, $cnpj,
                $email_contato, $telefone, $endereco_completo,
                $tipo_recebimento, $chave_pix, $banco,
                $agencia, $conta, $titular_conta, $logomarca_path, $id, $usuario_id);
            
            if (mysqli_stmt_execute($stmt)) {
                header("Location: organizadores.php?updated=1");
                exit;
            } else {
                $error_message = "Erro ao atualizar organizador.";
            }
            mysqli_stmt_close($stmt);
        } else {
            // INSERT
            $sql = "INSERT INTO contratantes (
                    nome_fantasia, razao_social, cpf, cnpj, email_contato, telefone, 
                    endereco_completo, tipo_recebimento, chave_pix, banco, agencia, 
                    conta, titular_conta, logomarca, usuario_id, ativo, criado_em
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())";
            $stmt = mysqli_prepare($con, $sql);
            mysqli_stmt_bind_param($stmt, "ssssssssssssssi", 
                $nome_fantasia, $razao_social, $cpf, $cnpj, $email_contato, $telefone,
                $endereco_completo, $tipo_recebimento, $chave_pix, $banco, $agencia,
                $conta, $titular_conta, $logomarca_path, $usuario_id);
            
            if (mysqli_stmt_execute($stmt)) {
                header("Location: organizadores.php?success=1");
                exit;
            } else {
                $error_message = "Erro ao cadastrar organizador.";
            }
            mysqli_stmt_close($stmt);
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $editando ? 'Editar' : 'Novo'; ?> Organizador - Anysummit</title>
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
    <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-1.css">
    <style>
        .organizadores-container {
            padding: 20px;
            max-width: 1400px;
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

        .novo-organizador-btn {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(0, 194, 255, 0.3);
            text-decoration: none;
            display: inline-block;
        }

        .novo-organizador-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 194, 255, 0.4);
        }

        .alert {
            padding: 15px 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .alert-success {
            background: rgba(0, 200, 81, 0.2);
            color: #00C851;
            border: 1px solid rgba(0, 200, 81, 0.3);
        }

        .alert-error {
            background: rgba(255, 82, 82, 0.2);
            color: #FF5252;
            border: 1px solid rgba(255, 82, 82, 0.3);
        }

        .form-container {
            background: rgba(42, 42, 56, 0.8);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            display: block;
            animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .form-container h3 {
            color: #FFFFFF;
            font-size: 24px;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid rgba(0, 194, 255, 0.3);
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            color: #E0E0E8;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }

        .form-control {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: #FFFFFF;
            font-size: 14px;
            transition: all 0.3s ease;
            box-sizing: border-box;
        }

        .form-control:focus {
            outline: none;
            border-color: #00C2FF;
            background: rgba(0, 194, 255, 0.1);
            box-shadow: 0 0 0 3px rgba(0, 194, 255, 0.2);
        }

        .form-control::placeholder {
            color: #B8B8C8;
        }

        .radio-group {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }

        .radio-option {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            padding: 10px 15px;
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .radio-option:hover {
            background: rgba(0, 194, 255, 0.1);
        }

        .radio-option input[type="radio"] {
            width: 18px;
            height: 18px;
            margin: 0;
        }

        .radio-option label {
            color: #E0E0E8;
            font-weight: 500;
            margin: 0;
            cursor: pointer;
        }

        .btn-group {
            display: flex;
            gap: 15px;
            margin-top: 25px;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 194, 255, 0.4);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #E0E0E8;
            border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        /* Estilos para upload de logomarca */
        .logo-preview {
            margin-top: 15px;
            text-align: center;
        }

        .logo-circle {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid rgba(0, 194, 255, 0.3);
            box-shadow: 0 4px 15px rgba(0, 194, 255, 0.2);
            transition: all 0.3s ease;
        }

        .logo-circle:hover {
            border-color: #00C2FF;
            box-shadow: 0 6px 20px rgba(0, 194, 255, 0.4);
            transform: scale(1.05);
        }

        .logo-placeholder {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(0, 194, 255, 0.1), rgba(114, 94, 255, 0.1));
            border: 2px dashed rgba(0, 194, 255, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            font-size: 32px;
            color: rgba(0, 194, 255, 0.6);
            transition: all 0.3s ease;
        }

        .logo-placeholder:hover {
            border-color: #00C2FF;
            background: linear-gradient(135deg, rgba(0, 194, 255, 0.2), rgba(114, 94, 255, 0.2));
            color: #00C2FF;
        }

        .logo-text {
            display: block;
            color: #B8B8C8;
            font-size: 12px;
            margin-top: 8px;
        }

        /* Mobile responsivo */
        @media (max-width: 768px) {
            .organizadores-container {
                padding: 15px;
            }

            .organizadores-header {
                flex-direction: column;
                align-items: stretch;
                gap: 15px;
            }

            .organizadores-header h1 {
                font-size: 24px;
                text-align: center;
            }

            .form-grid {
                grid-template-columns: 1fr;
            }

            .radio-group {
                flex-direction: column;
                gap: 10px;
            }

            .btn-group {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
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
                <div class="organizadores-header">
                    <h1><?php echo $editando ? '✏️ Editar' : '➕ Novo'; ?> Organizador</h1>
                    <a href="organizadores.php" class="novo-organizador-btn">
                        ⬅️ Voltar à Lista
                    </a>
                </div>
                
                <!-- Alertas -->
                <?php if ($success_message): ?>
                    <div class="alert alert-success">✅ <?php echo $success_message; ?></div>
                <?php endif; ?>
                
                <?php if ($error_message): ?>
                    <div class="alert alert-error">❌ <?php echo $error_message; ?></div>
                <?php endif; ?>

                <!-- Formulário -->
                <div class="form-container">
                    <h3><?php echo $editando ? '✏️ Editar Organizador' : '➕ Novo Organizador'; ?></h3>
                    <form method="post" enctype="multipart/form-data">
                        <input type="hidden" name="acao" value="salvar">
                        <?php if ($editando): ?>
                            <input type="hidden" name="id" value="<?php echo $dados['id']; ?>">
                        <?php endif; ?>
                        
                        <div class="form-group">
                            <label>Tipo de Pessoa</label>
                            <div class="radio-group">
                                <div class="radio-option">
                                    <input type="radio" id="fisica" name="tipo_pessoa" value="fisica" 
                                           <?php echo ($editando && !empty($dados['cpf'])) ? 'checked' : (!$editando ? 'checked' : ''); ?> 
                                           onchange="toggleTipoPessoa()">
                                    <label for="fisica">👤 Pessoa Física</label>
                                </div>
                                <div class="radio-option">
                                    <input type="radio" id="juridica" name="tipo_pessoa" value="juridica" 
                                           <?php echo ($editando && !empty($dados['cnpj'])) ? 'checked' : ''; ?> 
                                           onchange="toggleTipoPessoa()">
                                    <label for="juridica">🏢 Pessoa Jurídica</label>
                                </div>
                            </div>
                        </div>
                        
                        <div id="campos-fisica" style="<?php echo ($editando && !empty($dados['cnpj'])) ? 'display: none;' : ''; ?>">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="nome_fantasia_pf">Nome Completo *</label>
                                    <input type="text" id="nome_fantasia_pf" name="nome_fantasia_pf" class="form-control" 
                                           value="<?php echo ($editando && empty($dados['cnpj'])) ? htmlspecialchars($dados['nome_fantasia']) : ''; ?>">
                                </div>
                                
                                <div class="form-group">
                                    <label for="cpf">CPF *</label>
                                    <input type="text" id="cpf" name="cpf" class="form-control" 
                                           value="<?php echo $editando ? htmlspecialchars($dados['cpf']) : ''; ?>" 
                                           placeholder="000.000.000-00">
                                </div>
                            </div>
                        </div>
                        
                        <div id="campos-juridica" style="<?php echo (!$editando || empty($dados['cnpj'])) ? 'display: none;' : ''; ?>">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="nome_fantasia_pj">Nome Fantasia *</label>
                                    <input type="text" id="nome_fantasia_pj" name="nome_fantasia_pj" class="form-control" 
                                           value="<?php echo ($editando && !empty($dados['cnpj'])) ? htmlspecialchars($dados['nome_fantasia']) : ''; ?>">
                                </div>
                                
                                <div class="form-group">
                                    <label for="razao_social">Razão Social</label>
                                    <input type="text" id="razao_social" name="razao_social" class="form-control" 
                                           value="<?php echo $editando ? htmlspecialchars($dados['razao_social']) : ''; ?>">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="cnpj">CNPJ *</label>
                                <input type="text" id="cnpj" name="cnpj" class="form-control" 
                                       value="<?php echo $editando ? htmlspecialchars($dados['cnpj']) : ''; ?>" 
                                       placeholder="00.000.000/0000-00">
                            </div>
                        </div>
                        
                        <!-- Campo hidden que será preenchido pelo JavaScript -->
                        <input type="hidden" id="nome_fantasia_final" name="nome_fantasia" value="<?php echo $editando ? htmlspecialchars($dados['nome_fantasia']) : ''; ?>">
                        
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="email_contato">E-mail de Contato</label>
                                <input type="email" id="email_contato" name="email_contato" class="form-control" 
                                       value="<?php echo $editando ? htmlspecialchars($dados['email_contato']) : ''; ?>">
                            </div>
                            
                            <div class="form-group">
                                <label for="telefone">Telefone</label>
                                <input type="text" id="telefone" name="telefone" class="form-control" 
                                       value="<?php echo $editando ? htmlspecialchars($dados['telefone']) : ''; ?>" 
                                       placeholder="(00) 00000-0000">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="endereco_completo">Endereço Completo</label>
                            <textarea id="endereco_completo" name="endereco_completo" class="form-control" 
                                      rows="3"><?php echo $editando ? htmlspecialchars($dados['endereco_completo']) : ''; ?></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="logomarca">Logomarca</label>
                            <input type="file" id="logomarca" name="logomarca" class="form-control" accept="image/*" onchange="previewLogo(this)">
                            
                            <div class="logo-preview">
                                <?php if ($editando && !empty($dados['logomarca'])): ?>
                                    <img src="<?php echo htmlspecialchars($dados['logomarca']); ?>" 
                                         alt="Logomarca atual" class="logo-circle" id="logo-preview">
                                    <span class="logo-text">Logomarca atual - clique para alterar</span>
                                <?php else: ?>
                                    <div class="logo-placeholder" id="logo-placeholder">
                                        🏢
                                    </div>
                                    <span class="logo-text">Nenhuma logomarca selecionada</span>
                                    <img id="logo-preview" class="logo-circle" style="display: none;" alt="Preview da logomarca">
                                <?php endif; ?>
                            </div>
                        </div>
                        
                        <h4 style="margin-top: 30px; margin-bottom: 20px; color: #FFFFFF; padding-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.2);">💳 Dados de Recebimento</h4>
                        
                        <div class="form-group">
                            <label for="tipo_recebimento">Tipo de Recebimento</label>
                            <select id="tipo_recebimento" name="tipo_recebimento" class="form-control" onchange="toggleTipoRecebimento()">
                                <option value="pix" <?php echo ($editando && isset($dados['tipo_recebimento']) && $dados['tipo_recebimento'] === 'pix') ? 'selected' : ''; ?>>🔑 PIX</option>
                                <option value="bancario" <?php echo ($editando && isset($dados['tipo_recebimento']) && $dados['tipo_recebimento'] === 'bancario') ? 'selected' : ''; ?>>🏦 Transferência Bancária</option>
                            </select>
                        </div>
                        
                        <div id="dados-pix" style="<?php echo ($editando && isset($dados['tipo_recebimento']) && $dados['tipo_recebimento'] === 'bancario') ? 'display: none;' : ''; ?>">
                            <div class="form-group">
                                <label for="chave_pix">Chave PIX</label>
                                <input type="text" id="chave_pix" name="chave_pix" class="form-control" 
                                       value="<?php echo $editando ? htmlspecialchars($dados['chave_pix'] ?? '') : ''; ?>"
                                       placeholder="Digite sua chave PIX">
                            </div>
                        </div>
                        
                        <div id="dados-bancario" style="<?php echo (!$editando || !isset($dados['tipo_recebimento']) || $dados['tipo_recebimento'] === 'pix') ? 'display: none;' : ''; ?>">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="banco">Banco</label>
                                    <input type="text" id="banco" name="banco" class="form-control" 
                                           value="<?php echo $editando ? htmlspecialchars($dados['banco'] ?? '') : ''; ?>">
                                </div>
                                
                                <div class="form-group">
                                    <label for="agencia">Agência</label>
                                    <input type="text" id="agencia" name="agencia" class="form-control" 
                                           value="<?php echo $editando ? htmlspecialchars($dados['agencia'] ?? '') : ''; ?>">
                                </div>
                            </div>
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="conta">Conta</label>
                                    <input type="text" id="conta" name="conta" class="form-control" 
                                           value="<?php echo $editando ? htmlspecialchars($dados['conta'] ?? '') : ''; ?>">
                                </div>
                                
                                <div class="form-group">
                                    <label for="titular_conta">Titular da Conta</label>
                                    <input type="text" id="titular_conta" name="titular_conta" class="form-control" 
                                           value="<?php echo $editando ? htmlspecialchars($dados['titular_conta'] ?? '') : ''; ?>">
                                </div>
                            </div>
                        </div>
                        
                        <div class="btn-group">
                            <button type="submit" class="btn btn-primary">
                                <?php echo $editando ? '💾 Atualizar' : '➕ Cadastrar'; ?>
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="cancelarFormulario()">
                                ❌ Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    </div>

    <script>
        // Função para alternar campos de pessoa física/jurídica
        function toggleTipoPessoa() {
            const tipoPessoa = document.querySelector('input[name="tipo_pessoa"]:checked').value;
            const camposFisica = document.getElementById('campos-fisica');
            const camposJuridica = document.getElementById('campos-juridica');
            
            const nomePF = document.getElementById('nome_fantasia_pf');
            const cpf = document.getElementById('cpf');
            const nomePJ = document.getElementById('nome_fantasia_pj');
            const cnpj = document.getElementById('cnpj');
            
            if (tipoPessoa === 'fisica') {
                camposFisica.style.display = 'block';
                camposJuridica.style.display = 'none';
                
                nomePF.required = true;
                cpf.required = true;
                nomePJ.required = false;
                cnpj.required = false;
                
                nomePJ.value = '';
                document.getElementById('razao_social').value = '';
                cnpj.value = '';
                
            } else {
                camposFisica.style.display = 'none';
                camposJuridica.style.display = 'block';
                
                nomePF.required = false;
                cpf.required = false;
                nomePJ.required = true;
                cnpj.required = true;
                
                nomePF.value = '';
                cpf.value = '';
            }
            
            atualizarNomeFantasia();
        }
        
        // Função para atualizar o campo nome_fantasia hidden
        function atualizarNomeFantasia() {
            const tipoPessoa = document.querySelector('input[name="tipo_pessoa"]:checked').value;
            const nomeFantasiaFinal = document.getElementById('nome_fantasia_final');
            
            if (tipoPessoa === 'fisica') {
                nomeFantasiaFinal.value = document.getElementById('nome_fantasia_pf').value;
            } else {
                nomeFantasiaFinal.value = document.getElementById('nome_fantasia_pj').value;
            }
        }
        
        // Função para alternar tipo de recebimento
        function toggleTipoRecebimento() {
            const tipo = document.getElementById('tipo_recebimento').value;
            const dadosPix = document.getElementById('dados-pix');
            const dadosBancario = document.getElementById('dados-bancario');
            
            if (tipo === 'pix') {
                dadosPix.style.display = 'block';
                dadosBancario.style.display = 'none';
            } else {
                dadosPix.style.display = 'none';
                dadosBancario.style.display = 'block';
            }
        }
        
        // Função para cancelar formulário
        function cancelarFormulario() {
            if (confirm('Tem certeza que deseja cancelar? Os dados não salvos serão perdidos.')) {
                window.location.href = 'organizadores.php';
            }
        }
        
        // Função para preview da logomarca
        function previewLogo(input) {
            const preview = document.getElementById('logo-preview');
            const placeholder = document.getElementById('logo-placeholder');
            const logoText = document.querySelector('.logo-text');
            
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    if (placeholder) {
                        placeholder.style.display = 'none';
                    }
                    logoText.textContent = 'Nova logomarca selecionada';
                };
                
                reader.readAsDataURL(input.files[0]);
            }
        }
        
        // Aplicar máscaras nos campos
        document.addEventListener('DOMContentLoaded', function() {
            // Máscara CNPJ
            document.getElementById('cnpj').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{2})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1/$2');
                value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            });
            
            // Máscara CPF
            document.getElementById('cpf').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            });
            
            // Máscara telefone
            document.getElementById('telefone').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d)(\d{4})$/, '$1-$2');
                e.target.value = value;
            });
            
            // Inicializar tipo de pessoa correto
            toggleTipoPessoa();
            
            // Adicionar eventos para sincronizar o campo nome_fantasia
            document.getElementById('nome_fantasia_pf').addEventListener('input', atualizarNomeFantasia);
            document.getElementById('nome_fantasia_pj').addEventListener('input', atualizarNomeFantasia);
            
            // Sincronizar antes do submit
            document.querySelector('form').addEventListener('submit', function(e) {
                atualizarNomeFantasia();
            });
        });
        
        // Funções do sistema (header e menu)
        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                window.location = '/produtor/logout.php';
            }
        }
        
        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('show');
        }
        
        function toggleMobileMenu() {
            const overlay = document.getElementById('mobileOverlay');
            overlay.classList.toggle('show');
        }
        
        function closeMobileMenu() {
            const overlay = document.getElementById('mobileOverlay');
            overlay.classList.remove('show');
        }
        
        // Fechar dropdown do usuário ao clicar fora
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.user-menu')) {
                document.getElementById('userDropdown').classList.remove('show');
            }
        });
    </script>
</body>
</html>
