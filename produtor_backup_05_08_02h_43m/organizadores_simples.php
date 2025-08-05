<?php
include("check_login.php");
include_once('conm/conn.php');

// Verificar se o usuário está logado
if (!isset($_SESSION['usuario_logado']) || $_SESSION['usuario_logado'] !== true) {
    header('Location: /produtor/index.php');
    exit;
}

$usuario_id = $_SESSION['usuarioid'];

// Mensagens
$success_message = '';
$error_message = '';

if (isset($_GET['success'])) {
    $success_message = "Organizador cadastrado com sucesso!";
}

// Buscar organizadores
$organizadores = [];
$sql = "SELECT * FROM contratantes WHERE usuario_id = ? ORDER BY nome_fantasia ASC";
$stmt = mysqli_prepare($con, $sql);
mysqli_stmt_bind_param($stmt, "i", $usuario_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$organizadores = mysqli_fetch_all($result, MYSQLI_ASSOC);
mysqli_stmt_close($stmt);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organizadores - Anysummit</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a2e; color: white; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .btn { padding: 10px 20px; background: #00C2FF; color: white; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; display: inline-block; }
        .alert { padding: 15px; margin-bottom: 20px; border-radius: 8px; }
        .alert-success { background: rgba(0, 200, 81, 0.2); color: #00C851; border: 1px solid rgba(0, 200, 81, 0.3); }
        .alert-error { background: rgba(255, 82, 82, 0.2); color: #FF5252; border: 1px solid rgba(255, 82, 82, 0.3); }
        table { width: 100%; border-collapse: collapse; background: rgba(42, 42, 56, 0.8); border-radius: 12px; overflow: hidden; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
        th { background: rgba(0, 194, 255, 0.1); }
        .empty { text-align: center; padding: 60px; background: rgba(42, 42, 56, 0.8); border-radius: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 Organizadores</h1>
            <a href="organizadores_form.php" class="btn">➕ Novo Organizador</a>
        </div>
        
        <?php if ($success_message): ?>
            <div class="alert alert-success">✅ <?php echo $success_message; ?></div>
        <?php endif; ?>
        
        <?php if ($error_message): ?>
            <div class="alert alert-error">❌ <?php echo $error_message; ?></div>
        <?php endif; ?>
        
        <?php if (empty($organizadores)): ?>
            <div class="empty">
                <h3>Nenhum organizador cadastrado</h3>
                <p>Comece cadastrando seu primeiro organizador!</p>
                <a href="organizadores_form.php" class="btn">🚀 Cadastrar Primeiro Organizador</a>
            </div>
        <?php else: ?>
            
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Tipo</th>
                        <th>Documento</th>
                        <th>Email</th>
                        <th>Data</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($organizadores as $org): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($org['nome_fantasia'] ?? ''); ?></td>
                        <td>
                            <?php if (!empty($org['cnpj'])): ?>
                                🏢 PJ
                            <?php else: ?>
                                👤 PF
                            <?php endif; ?>
                        </td>
                        <td>
                            <?php if (!empty($org['cnpj'])): ?>
                                <?php echo htmlspecialchars($org['cnpj']); ?>
                            <?php elseif (!empty($org['cpf'])): ?>
                                <?php echo htmlspecialchars($org['cpf']); ?>
                            <?php else: ?>
                                -
                            <?php endif; ?>
                        </td>
                        <td><?php echo htmlspecialchars($org['email_contato'] ?? '-'); ?></td>
                        <td>
                            <?php 
                            if (!empty($org['criado_em'])) {
                                try {
                                    $data = new DateTime($org['criado_em']);
                                    echo $data->format('d/m/Y');
                                } catch (Exception $e) {
                                    echo 'Data inválida';
                                }
                            } else {
                                echo '-';
                            }
                            ?>
                        </td>
                        <td>
                            <a href="organizadores_form.php?id=<?php echo $org['id']; ?>" class="btn" style="font-size: 12px; padding: 5px 10px;">✏️ Editar</a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            
        <?php endif; ?>
        
        <br>
        <a href="dashboard.php" class="btn">⬅️ Voltar ao Dashboard</a>
    </div>
</body>
</html>
