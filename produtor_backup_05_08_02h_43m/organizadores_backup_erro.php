<?php
include("check_login.php");
include_once('conm/conn.php');

// Verificar se o usuário está logado
if (!isset($_SESSION['usuario_logado']) || $_SESSION['usuario_logado'] !== true) {
    header('Location: /produtor/index.php');
    exit;
}

// Usar a variável correta do sistema
$usuario_id = $_SESSION['usuarioid'];

// Pegar dados do usuário logado
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

// Variáveis para mensagens
$success_message = '';
$error_message = '';

// Processar formulário (inserção/edição)
if ($_POST && isset($_POST['acao'])) {
    $acao = $_POST['acao'];
    
    // Debug: Log dados recebidos
    error_log("Organizadores - Ação: " . $acao);
    error_log("Organizadores - POST data: " . print_r($_POST, true));
    
    if ($acao === 'salvar') {
        // Tipo de pessoa
        $tipo_pessoa = $_POST['tipo_pessoa'];
        
        // Campos do formulário (exceto taxa_plataforma)
        $nome_fantasia = trim($_POST['nome_fantasia']); // Agora vem do campo hidden que é sincronizado
        $razao_social = $tipo_pessoa === 'juridica' ? trim($_POST['razao_social']) : '';
        $cnpj = $tipo_pessoa === 'juridica' ? trim($_POST['cnpj']) : '';
        $cpf = $tipo_pessoa === 'fisica' ? trim($_POST['cpf']) : '';
        
        // Validação básica
        if (empty($nome_fantasia)) {
            $error_message = "Nome é obrigatório.";
        } elseif ($tipo_pessoa === 'fisica' && empty($cpf)) {
            $error_message = "CPF é obrigatório para pessoa física.";
        } elseif ($tipo_pessoa === 'juridica' && empty($cnpj)) {
            $error_message = "CNPJ é obrigatório para pessoa jurídica.";
        } else {
            // Continuar com o processamento se validação passou
            $email_contato = trim($_POST['email_contato']);
            $telefone = trim($_POST['telefone']);
            $endereco_completo = trim($_POST['endereco_completo']);
            $tipo_recebimento = $_POST['tipo_recebimento'];
            $chave_pix = trim($_POST['chave_pix']);
            $banco = trim($_POST['banco']);
            $agencia = trim($_POST['agencia']);
            $conta = trim($_POST['conta']);
            $titular_conta = trim($_POST['titular_conta']);
            
            // Upload da logomarca
            $logomarca = '';
            $remover_logo = isset($_POST['remove_logo']) && $_POST['remove_logo'] === '1';
        
        if ($remover_logo && isset($_POST['id'])) {
            // Remoção de logomarca na edição
            $logomarca = ''; // Será salvo como vazio no banco
        } elseif (isset($_FILES['logomarca']) && $_FILES['logomarca']['error'] === UPLOAD_ERR_OK) {
            $upload_dir = '../uploads/organizadores/';
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0755, true);
            }
            
            $file_extension = strtolower(pathinfo($_FILES['logomarca']['name'], PATHINFO_EXTENSION));
            $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];
            
            if (in_array($file_extension, $allowed_extensions)) {
                // Verificar tamanho (máximo 2MB)
                if ($_FILES['logomarca']['size'] <= 2 * 1024 * 1024) {
                    $new_filename = 'logo_' . time() . '_' . rand(1000, 9999) . '.' . $file_extension;
                    $upload_path = $upload_dir . $new_filename;
                    
                    if (move_uploaded_file($_FILES['logomarca']['tmp_name'], $upload_path)) {
                        // Salvar caminho relativo completo (sem ../ inicial)
                        $logomarca = 'uploads/organizadores/' . $new_filename;
                    }
                } else {
                    $error_message = "A imagem deve ter no máximo 2MB.";
                }
            } else {
                $error_message = "Apenas arquivos JPG, PNG e GIF são permitidos.";
            }
        }
        
        if (isset($_POST['id']) && !empty($_POST['id'])) {
            // Edição
            $id = (int)$_POST['id'];
            
            // Verificar se o organizador pertence ao usuário
            $sql_verificar = "SELECT id, logomarca FROM contratantes WHERE id = ? AND usuario_id = ?";
            $stmt_verificar = mysqli_prepare($con, $sql_verificar);
            mysqli_stmt_bind_param($stmt_verificar, "ii", $id, $usuario_id);
            mysqli_stmt_execute($stmt_verificar);
            $result_verificar = mysqli_stmt_get_result($stmt_verificar);
            
            if ($row_verificar = mysqli_fetch_assoc($result_verificar)) {
                // Construir query de atualização
                if ($remover_logo || !empty($logomarca)) {
                    // Atualizar com nova logomarca ou remover
                    $nova_logomarca = $remover_logo ? '' : $logomarca;
                    
                    $sql = "UPDATE contratantes SET 
                            nome_fantasia = ?, razao_social = ?, cnpj = ?, cpf = ?, email_contato = ?, 
                            telefone = ?, endereco_completo = ?, tipo_recebimento = ?, chave_pix = ?, 
                            banco = ?, agencia = ?, conta = ?, titular_conta = ?, logomarca = ?
                            WHERE id = ? AND usuario_id = ?";
                    
                    $stmt = mysqli_prepare($con, $sql);
                    mysqli_stmt_bind_param($stmt, "ssssssssssssssii", 
                        $nome_fantasia, $razao_social, $cnpj, $cpf, $email_contato, 
                        $telefone, $endereco_completo, $tipo_recebimento, $chave_pix, 
                        $banco, $agencia, $conta, $titular_conta, $nova_logomarca, $id, $usuario_id);
                    
                    // Apagar logomarca antiga se existe e se está removendo ou trocando
                    if (!empty($row_verificar['logomarca']) && file_exists('../' . $row_verificar['logomarca'])) {
                        unlink('../' . $row_verificar['logomarca']);
                    }
                } else {
                    // Atualizar sem alterar logomarca
                    $sql = "UPDATE contratantes SET 
                            nome_fantasia = ?, razao_social = ?, cnpj = ?, cpf = ?, email_contato = ?, 
                            telefone = ?, endereco_completo = ?, tipo_recebimento = ?, chave_pix = ?, 
                            banco = ?, agencia = ?, conta = ?, titular_conta = ?
                            WHERE id = ? AND usuario_id = ?";
                    
                    $stmt = mysqli_prepare($con, $sql);
                    mysqli_stmt_bind_param($stmt, "sssssssssssssii", 
                        $nome_fantasia, $razao_social, $cnpj, $cpf, $email_contato, 
                        $telefone, $endereco_completo, $tipo_recebimento, $chave_pix, 
                        $banco, $agencia, $conta, $titular_conta, $id, $usuario_id);
                }
                
                if (mysqli_stmt_execute($stmt)) {
                    $success_message = "Organizador atualizado com sucesso!";
                } else {
                    $error_message = "Erro ao atualizar organizador: " . mysqli_error($con);
                }
                mysqli_stmt_close($stmt);
            } else {
                $error_message = "Organizador não encontrado ou você não tem permissão para editá-lo.";
            }
            mysqli_stmt_close($stmt_verificar);
            
        } else {
            // Inserção
            $sql = "INSERT INTO contratantes (
                        nome_fantasia, logomarca, usuario_id, razao_social, cnpj, cpf, email_contato, 
                        telefone, endereco_completo, tipo_recebimento, chave_pix, banco, agencia, 
                        conta, titular_conta, ativo
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = mysqli_prepare($con, $sql);
            $ativo = 1;
            mysqli_stmt_bind_param($stmt, "ssisssssssssssi", 
                $nome_fantasia, $logomarca, $usuario_id, $razao_social, $cnpj, $cpf, $email_contato, 
                $telefone, $endereco_completo, $tipo_recebimento, $chave_pix, $banco, $agencia, 
                $conta, $titular_conta, $ativo);
            
            if (mysqli_stmt_execute($stmt)) {
                $success_message = "Organizador cadastrado com sucesso!";
            } else {
                $error_message = "Erro ao cadastrar organizador: " . mysqli_error($con);
            }
            mysqli_stmt_close($stmt);
        } // Fim do bloco de validação
    }
    
    elseif ($acao === 'excluir') {
        $id = (int)$_POST['id'];
        
        // Verificar se o organizador tem eventos associados
        $sql_verificar_eventos = "SELECT COUNT(*) as total FROM eventos WHERE contratante_id = ?";
        $stmt_verificar_eventos = mysqli_prepare($con, $sql_verificar_eventos);
        mysqli_stmt_bind_param($stmt_verificar_eventos, "i", $id);
        mysqli_stmt_execute($stmt_verificar_eventos);
        $result_eventos = mysqli_stmt_get_result($stmt_verificar_eventos);
        $row_eventos = mysqli_fetch_assoc($result_eventos);
        
        if ($row_eventos['total'] > 0) {
            $error_message = "Não é possível excluir este organizador pois ele possui eventos associados.";
        } else {
            // Buscar logomarca para apagar
            $sql_buscar = "SELECT logomarca FROM contratantes WHERE id = ? AND usuario_id = ?";
            $stmt_buscar = mysqli_prepare($con, $sql_buscar);
            mysqli_stmt_bind_param($stmt_buscar, "ii", $id, $usuario_id);
            mysqli_stmt_execute($stmt_buscar);
            $result_buscar = mysqli_stmt_get_result($stmt_buscar);
            
            if ($row_buscar = mysqli_fetch_assoc($result_buscar)) {
                // Excluir organizador
                $sql_excluir = "DELETE FROM contratantes WHERE id = ? AND usuario_id = ?";
                $stmt_excluir = mysqli_prepare($con, $sql_excluir);
                mysqli_stmt_bind_param($stmt_excluir, "ii", $id, $usuario_id);
                
                if (mysqli_stmt_execute($stmt_excluir)) {
                    // Apagar logomarca se existe
                    if (!empty($row_buscar['logomarca']) && file_exists('../' . $row_buscar['logomarca'])) {
                        unlink('../' . $row_buscar['logomarca']);
                    }
                    $success_message = "Organizador excluído com sucesso!";
                } else {
                    $error_message = "Erro ao excluir organizador: " . mysqli_error($con);
                }
                mysqli_stmt_close($stmt_excluir);
            } else {
                $error_message = "Organizador não encontrado ou você não tem permissão para excluí-lo.";
            }
            mysqli_stmt_close($stmt_buscar);
        }
        mysqli_stmt_close($stmt_verificar_eventos);
    }
}

// Buscar organizadores do usuário logado
$sql_organizadores = "SELECT * FROM contratantes WHERE usuario_id = ? ORDER BY nome_fantasia ASC";
$stmt_organizadores = mysqli_prepare($con, $sql_organizadores);
mysqli_stmt_bind_param($stmt_organizadores, "i", $usuario_id);
mysqli_stmt_execute($stmt_organizadores);
$result_organizadores = mysqli_stmt_get_result($stmt_organizadores);
$organizadores = mysqli_fetch_all($result_organizadores, MYSQLI_ASSOC);

// Se está editando, buscar dados
$editando = false;
$dados_edicao = [];
if (isset($_GET['editar'])) {
    $id_editar = (int)$_GET['editar'];
    $sql_editar = "SELECT * FROM contratantes WHERE id = ? AND usuario_id = ?";
    $stmt_editar = mysqli_prepare($con, $sql_editar);
    mysqli_stmt_bind_param($stmt_editar, "ii", $id_editar, $usuario_id);
    mysqli_stmt_execute($stmt_editar);
    $result_editar = mysqli_stmt_get_result($stmt_editar);
    
    if ($dados_edicao = mysqli_fetch_assoc($result_editar)) {
        $editando = true;
    }
    mysqli_stmt_close($stmt_editar);
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organizadores - Anysummit</title>
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
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .novo-organizador-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 194, 255, 0.4);
        }

        /* Alertas */
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

        /* Formulário */
        .form-container {
            background: rgba(42, 42, 56, 0.8);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            display: none;
        }

        .form-container.show {
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

        /* Radio buttons personalizados */
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

        /* Botões */
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

        /* Tabela de organizadores */
        .organizadores-table-container {
            background: rgba(42, 42, 56, 0.8);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .organizadores-table {
            width: 100%;
            border-collapse: collapse;
        }

        .organizadores-table th {
            background: rgba(0, 194, 255, 0.1);
            color: #E0E0E8;
            padding: 16px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .organizadores-table td {
            padding: 16px 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #FFFFFF;
            vertical-align: middle;
        }

        .organizadores-table tr:hover {
            background: rgba(0, 194, 255, 0.05);
        }

        .organizadores-table tr:last-child td {
            border-bottom: none;
        }

        /* Upload de logomarca melhorado */
        .upload-container {
            display: flex;
            align-items: flex-start;
            gap: 20px;
            margin-top: 10px;
        }

        .upload-input-wrapper {
            flex: 1;
        }

        .upload-preview {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }

        .logo-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            border: 3px solid rgba(0, 194, 255, 0.3);
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
            transition: all 0.3s ease;
        }

        .logo-circle:hover {
            border-color: rgba(0, 194, 255, 0.6);
            transform: scale(1.05);
        }

        .logo-circle img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .logo-placeholder {
            color: #B8B8C8;
            font-size: 36px;
            text-align: center;
        }

        .upload-hint {
            font-size: 12px;
            color: #B8B8C8;
            text-align: center;
            max-width: 120px;
        }

        .logo-actions {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }

        .btn-upload {
            background: rgba(0, 194, 255, 0.2);
            color: #00C2FF;
            border: 1px solid rgba(0, 194, 255, 0.3);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-upload:hover {
            background: rgba(0, 194, 255, 0.3);
        }

        .btn-remove {
            background: rgba(255, 82, 82, 0.2);
            color: #FF5252;
            border: 1px solid rgba(255, 82, 82, 0.3);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-remove:hover {
            background: rgba(255, 82, 82, 0.3);
        }

        /* Ajuste no campo de arquivo */
        .form-control[type="file"] {
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.05);
            cursor: pointer;
        }

        .form-control[type="file"]::-webkit-file-upload-button {
            background: rgba(0, 194, 255, 0.2);
            color: #00C2FF;
            border: 1px solid rgba(0, 194, 255, 0.3);
            padding: 6px 12px;
            border-radius: 6px;
            margin-right: 10px;
            cursor: pointer;
        }

        /* Logo na tabela circular também */
        .table-logo {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
            background: linear-gradient(135deg, #1A1A2E, #16213E);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #888899;
            font-size: 20px;
            border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .organizador-title {
            font-size: 16px;
            font-weight: 600;
            color: #FFFFFF;
            margin-bottom: 4px;
        }

        .organizador-info {
            font-size: 12px;
            color: #B8B8C8;
        }

        /* Dropdown de ações */
        .actions-dropdown {
            position: relative;
            display: inline-block;
        }

        .actions-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #FFFFFF;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .actions-btn:hover {
            background: rgba(0, 194, 255, 0.2);
            border-color: rgba(0, 194, 255, 0.3);
        }

        .dropdown-content {
            display: none;
            position: absolute;
            right: 0;
            top: 100%;
            background: rgba(42, 42, 56, 0.98);
            min-width: 180px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            z-index: 999999;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
            backdrop-filter: blur(20px);
            margin-top: 4px;
        }

        .dropdown-content.show {
            display: block;
        }

        .dropdown-item {
            color: #FFFFFF;
            padding: 12px 16px;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: background 0.3s ease;
            font-size: 14px;
        }

        .dropdown-item:hover {
            background: rgba(0, 194, 255, 0.1);
        }

        .dropdown-item.danger:hover {
            background: rgba(255, 82, 82, 0.1);
            color: #FF5252;
        }

        /* Estado vazio */
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            background: rgba(42, 42, 56, 0.8);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .empty-state-icon {
            font-size: 64px;
            margin-bottom: 20px;
        }

        .empty-state h3 {
            color: #FFFFFF;
            font-size: 24px;
            margin-bottom: 15px;
        }

        .empty-state p {
            color: #B8B8C8;
            font-size: 16px;
            margin-bottom: 30px;
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

            .organizadores-table-container {
                overflow-x: auto;
            }

            .form-grid {
                grid-template-columns: 1fr;
            }

            .radio-group {
                flex-direction: column;
                gap: 10px;
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
                    <h1>🏢 Organizadores</h1>
                    <button onclick="mostrarFormulario()" class="novo-organizador-btn">
                        ➕ Novo Organizador
                    </button>
                </div>
                
                <?php if ($success_message): ?>
                    <div class="alert alert-success">✅ <?php echo $success_message; ?></div>
                <?php endif; ?>
                
                <?php if ($error_message): ?>
                    <div class="alert alert-error">❌ <?php echo $error_message; ?></div>
                <?php endif; ?>
                
                <div id="formulario-container" class="form-container <?php echo $editando ? 'show' : ''; ?>">
                    <h3><?php echo $editando ? '✏️ Editar Organizador' : '➕ Novo Organizador'; ?></h3>
                    <form method="post" enctype="multipart/form-data">
                        <input type="hidden" name="acao" value="salvar">
                        <?php if ($editando): ?>
                            <input type="hidden" name="id" value="<?php echo $dados_edicao['id']; ?>">
                        <?php endif; ?>
                        
                        <div class="form-group">
                            <label>Tipo de Pessoa</label>
                            <div class="radio-group">
                                <div class="radio-option">
                                    <input type="radio" id="fisica" name="tipo_pessoa" value="fisica" 
                                           <?php echo ($editando && !empty($dados_edicao['cpf'])) ? 'checked' : (!$editando ? 'checked' : ''); ?> 
                                           onchange="toggleTipoPessoa()">
                                    <label for="fisica">👤 Pessoa Física</label>
                                </div>
                                <div class="radio-option">
                                    <input type="radio" id="juridica" name="tipo_pessoa" value="juridica" 
                                           <?php echo ($editando && !empty($dados_edicao['cnpj'])) ? 'checked' : ''; ?> 
                                           onchange="toggleTipoPessoa()">
                                    <label for="juridica">🏢 Pessoa Jurídica</label>
                                </div>
                            </div>
                        </div>
                        
                        <div id="campos-fisica" style="<?php echo ($editando && !empty($dados_edicao['cnpj'])) ? 'display: none;' : ''; ?>">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="nome_fantasia_pf">Nome Completo *</label>
                                    <input type="text" id="nome_fantasia_pf" name="nome_fantasia_pf" class="form-control" 
                                           value="<?php echo ($editando && empty($dados_edicao['cnpj'])) ? htmlspecialchars($dados_edicao['nome_fantasia']) : ''; ?>">
                                </div>
                                
                                <div class="form-group">
                                    <label for="cpf">CPF *</label>
                                    <input type="text" id="cpf" name="cpf" class="form-control" 
                                           value="<?php echo $editando ? htmlspecialchars($dados_edicao['cpf']) : ''; ?>" 
                                           placeholder="000.000.000-00">
                                </div>
                            </div>
                        </div>
                        
                        <div id="campos-juridica" style="<?php echo (!$editando || empty($dados_edicao['cnpj'])) ? 'display: none;' : ''; ?>">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="nome_fantasia_pj">Nome Fantasia *</label>
                                    <input type="text" id="nome_fantasia_pj" name="nome_fantasia_pj" class="form-control" 
                                           value="<?php echo ($editando && !empty($dados_edicao['cnpj'])) ? htmlspecialchars($dados_edicao['nome_fantasia']) : ''; ?>">
                                </div>
                                
                                <div class="form-group">
                                    <label for="razao_social">Razão Social</label>
                                    <input type="text" id="razao_social" name="razao_social" class="form-control" 
                                           value="<?php echo $editando ? htmlspecialchars($dados_edicao['razao_social']) : ''; ?>">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="cnpj">CNPJ *</label>
                                <input type="text" id="cnpj" name="cnpj" class="form-control" 
                                       value="<?php echo $editando ? htmlspecialchars($dados_edicao['cnpj']) : ''; ?>" 
                                       placeholder="00.000.000/0000-00">
                            </div>
                        </div>
                        
                        <!-- Campo hidden que será preenchido pelo JavaScript -->
                        <input type="hidden" id="nome_fantasia_final" name="nome_fantasia" value="<?php echo $editando ? htmlspecialchars($dados_edicao['nome_fantasia']) : ''; ?>">
                        
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="email_contato">E-mail de Contato</label>
                                <input type="email" id="email_contato" name="email_contato" class="form-control" 
                                       value="<?php echo $editando ? htmlspecialchars($dados_edicao['email_contato']) : ''; ?>">
                            </div>
                            
                            <div class="form-group">
                                <label for="telefone">Telefone</label>
                                <input type="text" id="telefone" name="telefone" class="form-control" 
                                       value="<?php echo $editando ? htmlspecialchars($dados_edicao['telefone']) : ''; ?>" 
                                       placeholder="(00) 00000-0000">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="endereco_completo">Endereço Completo</label>
                            <textarea id="endereco_completo" name="endereco_completo" class="form-control" 
                                      rows="3"><?php echo $editando ? htmlspecialchars($dados_edicao['endereco_completo']) : ''; ?></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="logomarca">Logomarca</label>
                            <div class="upload-container">
                                <div class="upload-input-wrapper">
                                    <input type="file" id="logomarca" name="logomarca" class="form-control" 
                                           accept="image/*" onchange="previewLogo(this)">
                                    <div style="margin-top: 8px; font-size: 12px; color: #B8B8C8;">
                                        Formatos aceitos: JPG, PNG, GIF. Máximo 2MB.
                                    </div>
                                </div>
                                
                                <div class="upload-preview">
                                    <div class="logo-circle" id="logo-preview">
                                        <?php if ($editando && !empty($dados_edicao['logomarca'])): ?>
                                            <img src="<?php echo htmlspecialchars($dados_edicao['logomarca']); ?>" alt="Logo atual">
                                        <?php else: ?>
                                            <div class="logo-placeholder">🏢</div>
                                        <?php endif; ?>
                                    </div>
                                    <div class="upload-hint">
                                        Preview da logomarca como aparecerá no evento
                                    </div>
                                    <div class="logo-actions" id="logo-actions" style="<?php echo (!$editando || empty($dados_edicao['logomarca'])) ? 'display: none;' : ''; ?>">
                                        <button type="button" class="btn-remove" onclick="removeLogo()">
                                            🗑️ Remover
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <h4 style="margin-top: 30px; margin-bottom: 20px; color: #FFFFFF; padding-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.2);">💳 Dados de Recebimento</h4>
                        
                        <div class="form-group">
                            <label for="tipo_recebimento">Tipo de Recebimento</label>
                            <select id="tipo_recebimento" name="tipo_recebimento" class="form-control" onchange="toggleTipoRecebimento()">
                                <option value="pix" <?php echo ($editando && $dados_edicao['tipo_recebimento'] === 'pix') ? 'selected' : ''; ?>>🔑 PIX</option>
                                <option value="bancario" <?php echo ($editando && $dados_edicao['tipo_recebimento'] === 'bancario') ? 'selected' : ''; ?>>🏦 Transferência Bancária</option>
                            </select>
                        </div>
                        
                        <div id="dados-pix" style="<?php echo ($editando && $dados_edicao['tipo_recebimento'] === 'bancario') ? 'display: none;' : ''; ?>">
                            <div class="form-group">
                                <label for="chave_pix">Chave PIX</label>
                                <input type="text" id="chave_pix" name="chave_pix" class="form-control" 
                                       value="<?php echo $editando ? htmlspecialchars($dados_edicao['chave_pix']) : ''; ?>"
                                       placeholder="Digite sua chave PIX (CPF, CNPJ, e-mail, telefone ou chave aleatória)">
                            </div>
                        </div>
                        
                        <div id="dados-bancario" style="<?php echo (!$editando || $dados_edicao['tipo_recebimento'] === 'pix') ? 'display: none;' : ''; ?>">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="banco">Banco</label>
                                    <input type="text" id="banco" name="banco" class="form-control" 
                                           value="<?php echo $editando ? htmlspecialchars($dados_edicao['banco']) : ''; ?>"
                                           placeholder="Nome do banco">
                                </div>
                                
                                <div class="form-group">
                                    <label for="agencia">Agência</label>
                                    <input type="text" id="agencia" name="agencia" class="form-control" 
                                           value="<?php echo $editando ? htmlspecialchars($dados_edicao['agencia']) : ''; ?>"
                                           placeholder="0000">
                                </div>
                            </div>
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="conta">Conta</label>
                                    <input type="text" id="conta" name="conta" class="form-control" 
                                           value="<?php echo $editando ? htmlspecialchars($dados_edicao['conta']) : ''; ?>"
                                           placeholder="00000-0">
                                </div>
                                
                                <div class="form-group">
                                    <label for="titular_conta">Titular da Conta</label>
                                    <input type="text" id="titular_conta" name="titular_conta" class="form-control" 
                                           value="<?php echo $editando ? htmlspecialchars($dados_edicao['titular_conta']) : ''; ?>"
                                           placeholder="Nome do titular">
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
                
                <?php if (empty($organizadores)): ?>
                    <div class="empty-state" id="empty-state">
                        <div class="empty-state-icon">🏢</div>
                        <h3>Nenhum organizador cadastrado</h3>
                        <p>Comece cadastrando seu primeiro organizador para gerenciar seus eventos!</p>
                        <button onclick="mostrarFormulario()" class="novo-organizador-btn">
                            🚀 Cadastrar Primeiro Organizador
                        </button>
                    </div>
                <?php else: ?>
                    
                    <!-- Tabela de Organizadores -->
                    <div class="organizadores-table-container">
                        <table class="organizadores-table">
                            <thead>
                                <tr>
                                    <th>Organizador</th>
                                    <th>Tipo</th>
                                    <th>Documento</th>
                                    <th>Contato</th>
                                    <th>Recebimento</th>
                                    <th>Cadastrado</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($organizadores as $organizador): ?>
                                <tr>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <?php if (!empty($organizador['logomarca'])): ?>
                                                <img src="/<?php echo htmlspecialchars($organizador['logomarca']); ?>" 
                                                     alt="Logo" class="table-logo">
                                            <?php else: ?>
                                                <div class="table-logo">🏢</div>
                                            <?php endif; ?>
                                            <div>
                                                <div class="organizador-title"><?php echo htmlspecialchars($organizador['nome_fantasia']); ?></div>
                                                <?php if (!empty($organizador['razao_social'])): ?>
                                                    <div class="organizador-info"><?php echo htmlspecialchars($organizador['razao_social']); ?></div>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <?php if (!empty($organizador['cnpj'])): ?>
                                            <span style="color: #725EFF;">🏢 Pessoa Jurídica</span>
                                        <?php else: ?>
                                            <span style="color: #00C2FF;">👤 Pessoa Física</span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <?php if (!empty($organizador['cnpj'])): ?>
                                            <div><?php echo htmlspecialchars($organizador['cnpj']); ?></div>
                                        <?php elseif (!empty($organizador['cpf'])): ?>
                                            <div><?php echo htmlspecialchars($organizador['cpf']); ?></div>
                                        <?php else: ?>
                                            <span style="color: #B8B8C8;">Não informado</span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <div style="font-size: 13px;">
                                            <?php if (!empty($organizador['email_contato'])): ?>
                                                <div>📧 <?php echo htmlspecialchars($organizador['email_contato']); ?></div>
                                            <?php endif; ?>
                                            <?php if (!empty($organizador['telefone'])): ?>
                                                <div>📱 <?php echo htmlspecialchars($organizador['telefone']); ?></div>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                    <td>
                                        <?php if ($organizador['tipo_recebimento'] === 'pix'): ?>
                                            <span style="color: #00C851;">🔑 PIX</span>
                                            <?php if (!empty($organizador['chave_pix'])): ?>
                                                <div style="font-size: 11px; color: #B8B8C8;"><?php echo htmlspecialchars(substr($organizador['chave_pix'], 0, 20) . (strlen($organizador['chave_pix']) > 20 ? '...' : '')); ?></div>
                                            <?php endif; ?>
                                        <?php else: ?>
                                            <span style="color: #FFC107;">🏦 Bancário</span>
                                            <?php if (!empty($organizador['banco'])): ?>
                                                <div style="font-size: 11px; color: #B8B8C8;"><?php echo htmlspecialchars($organizador['banco']); ?></div>
                                            <?php endif; ?>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <?php 
                                        $criado = new DateTime($organizador['criado_em']);
                                        echo $criado->format('d/m/Y');
                                        ?>
                                    </td>
                                    <td>
                                        <div class="actions-dropdown">
                                            <button class="actions-btn" onClick="toggleDropdown(this)">
                                                ⋮ Opções
                                            </button>
                                            <div class="dropdown-content">
                                                <a href="organizadores.php?editar=<?php echo $organizador['id']; ?>" class="dropdown-item">
                                                    ✏️ Editar
                                                </a>
                                                <div class="dropdown-item danger" onClick="confirmarExclusao(<?php echo $organizador['id']; ?>, '<?php echo addslashes($organizador['nome_fantasia']); ?>')">
                                                    🗑️ Excluir
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                    
                <?php endif; ?>
            </div>
        </main>
    </div>

    <script>
        function mostrarFormulario() {
            document.getElementById('formulario-container').classList.add('show');
            
            // Esconder empty-state se existir
            const emptyState = document.getElementById('empty-state');
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            
            // Focar no campo correto
            const tipoPessoa = document.querySelector('input[name="tipo_pessoa"]:checked').value;
            if (tipoPessoa === 'fisica') {
                document.getElementById('nome_fantasia_pf').focus();
            } else {
                document.getElementById('nome_fantasia_pj').focus();
            }
        }

        function cancelarFormulario() {
            if (confirm('Tem certeza que deseja cancelar? Os dados não salvos serão perdidos.')) {
                window.location.href = 'organizadores.php';
            }
        }

        function confirmarExclusao(id, nome) {
            if (confirm('Tem certeza que deseja excluir o organizador "' + nome + '"?\n\nEsta ação não pode ser desfeita.')) {
                // Criar form para exclusão
                const form = document.createElement('form');
                form.method = 'POST';
                form.innerHTML = '<input type="hidden" name="acao" value="excluir"><input type="hidden" name="id" value="' + id + '">';
                document.body.appendChild(form);
                form.submit();
            }
        }

        function toggleTipoPessoa() {
            const tipoPessoa = document.querySelector('input[name="tipo_pessoa"]:checked').value;
            const camposFisica = document.getElementById('campos-fisica');
            const camposJuridica = document.getElementById('campos-juridica');
            
            // Campos PF
            const nomePF = document.getElementById('nome_fantasia_pf');
            const cpf = document.getElementById('cpf');
            
            // Campos PJ
            const nomePJ = document.getElementById('nome_fantasia_pj');
            const cnpj = document.getElementById('cnpj');
            
            if (tipoPessoa === 'fisica') {
                // Mostrar campos PF
                camposFisica.style.display = 'block';
                camposJuridica.style.display = 'none';
                
                // Gerenciar required
                nomePF.required = true;
                cpf.required = true;
                nomePJ.required = false;
                cnpj.required = false;
                
                // Limpar campos PJ se estiver trocando
                nomePJ.value = '';
                document.getElementById('razao_social').value = '';
                cnpj.value = '';
                
            } else {
                // Mostrar campos PJ
                camposFisica.style.display = 'none';
                camposJuridica.style.display = 'block';
                
                // Gerenciar required
                nomePF.required = false;
                cpf.required = false;
                nomePJ.required = true;
                cnpj.required = true;
                
                // Limpar campos PF se estiver trocando
                nomePF.value = '';
                cpf.value = '';
            }
            
            // Atualizar campo hidden
            atualizarNomeFantasia();
        }

        function previewLogo(input) {
            const preview = document.getElementById('logo-preview');
            const actions = document.getElementById('logo-actions');
            
            if (input.files && input.files[0]) {
                const file = input.files[0];
                
                // Verificar tipo de arquivo
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                if (!allowedTypes.includes(file.type)) {
                    alert('Apenas arquivos de imagem (JPG, PNG, GIF) são permitidos.');
                    input.value = '';
                    return;
                }
                
                // Verificar tamanho (2MB)
                if (file.size > 2 * 1024 * 1024) {
                    alert('A imagem deve ter no máximo 2MB.');
                    input.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = '<img src="' + e.target.result + '" alt="Preview">';
                    actions.style.display = 'flex';
                };
                reader.readAsDataURL(file);
            }
        }

        function removeLogo() {
            if (confirm('Tem certeza que deseja remover a logomarca?')) {
                const input = document.getElementById('logomarca');
                const preview = document.getElementById('logo-preview');
                const actions = document.getElementById('logo-actions');
                
                input.value = '';
                preview.innerHTML = '<div class="logo-placeholder">🏢</div>';
                actions.style.display = 'none';
                
                // Se está editando, marcar para remoção
                const isEditing = document.querySelector('input[name="id"]');
                if (isEditing) {
                    // Criar campo hidden para indicar remoção
                    let removeField = document.getElementById('remove-logo');
                    if (!removeField) {
                        removeField = document.createElement('input');
                        removeField.type = 'hidden';
                        removeField.name = 'remove_logo';
                        removeField.id = 'remove-logo';
                        removeField.value = '1';
                        document.querySelector('form').appendChild(removeField);
                    }
                }
            }
        }

        function atualizarNomeFantasia() {
            const tipoPessoa = document.querySelector('input[name="tipo_pessoa"]:checked').value;
            const nomeFantasiaFinal = document.getElementById('nome_fantasia_final');
            
            if (tipoPessoa === 'fisica') {
                nomeFantasiaFinal.value = document.getElementById('nome_fantasia_pf').value;
            } else {
                nomeFantasiaFinal.value = document.getElementById('nome_fantasia_pj').value;
            }
        }

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

        function toggleDropdown(button) {
            // Fechar todos os outros dropdowns
            document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                if (dropdown !== button.nextElementSibling) {
                    dropdown.classList.remove('show');
                }
            });
            
            // Toggle do dropdown atual
            const dropdown = button.nextElementSibling;
            dropdown.classList.toggle('show');
        }

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', function(event) {
            if (!event.target.matches('.actions-btn')) {
                document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            }
        });

        // Máscaras para campos
        document.getElementById('cnpj').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/^(\d{2})(\d)/, '$1.$2');
            value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
            e.target.value = value;
        });

        document.getElementById('cpf').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });

        document.getElementById('telefone').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d)(\d{4})$/, '$1-$2');
            e.target.value = value;
        });

        // Funções do sistema original
        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                window.location = 'logout.php';
            }
        }

        function toggleMobileMenu() {
            // Implementar menu mobile se necessário
        }

        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('show');
        }

        // Inicializar tipo de pessoa correto na carga da página
        document.addEventListener('DOMContentLoaded', function() {
            toggleTipoPessoa();
            
            // Adicionar eventos para sincronizar o campo nome_fantasia
            document.getElementById('nome_fantasia_pf').addEventListener('input', atualizarNomeFantasia);
            document.getElementById('nome_fantasia_pj').addEventListener('input', atualizarNomeFantasia);
            
            // Sincronizar antes do submit
            document.querySelector('form').addEventListener('submit', function(e) {
                atualizarNomeFantasia();
            });
        });
    </script>
</body>
</html>
