<?php
/**
 * AnySummit - Admin - Instância WhatsApp Evolution (Versão Simplificada)
 */

// Debug ativado temporariamente
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'conm/conn.php';
verificarAutenticacaoAdmin();

$mensagem_sucesso = '';
$mensagem_erro = '';

// Processar formulário
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $instance_id = trim($_POST['instance_id'] ?? '');
    $api_url = trim($_POST['api_url'] ?? '');
    $webhook_token = trim($_POST['webhook_token'] ?? '');
    
    if (empty($instance_id) || empty($api_url)) {
        $mensagem_erro = 'Instance ID e URL da API são obrigatórios';
    } else {
        if (!filter_var($api_url, FILTER_VALIDATE_URL)) {
            $mensagem_erro = 'URL da API inválida';
        } else {
            $stmt = $con->prepare("UPDATE parametros SET evolution_instance_id = ?, evolution_api_base_url = ?, evolution_webhook_token = ? WHERE id = 1");
            $stmt->bind_param("sss", $instance_id, $api_url, $webhook_token);
            
            if ($stmt->execute()) {
                $mensagem_sucesso = 'Parâmetros salvos com sucesso!';
            } else {
                $mensagem_erro = 'Erro ao salvar: ' . $stmt->error;
            }
            $stmt->close();
        }
    }
}

// Buscar parâmetros
$parametros = null;
$result = $con->query("SELECT evolution_instance_id, evolution_api_base_url, evolution_webhook_token FROM parametros WHERE id = 1");
if ($result && $result->num_rows > 0) {
    $parametros = $result->fetch_assoc();
}

include_once 'includes/header.php';
?>

<div class="container-fluid py-4">
    <?php if ($mensagem_sucesso): ?>
        <div class="alert alert-success"><?= $mensagem_sucesso ?></div>
    <?php endif; ?>
    
    <?php if ($mensagem_erro): ?>
        <div class="alert alert-danger"><?= $mensagem_erro ?></div>
    <?php endif; ?>

    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5><i class="fab fa-whatsapp me-2"></i>Instância WhatsApp Evolution</h5>
                </div>
                <div class="card-body">
                    <form method="POST">
                        <div class="mb-3">
                            <label for="instance_id" class="form-label">Instance ID</label>
                            <input type="text" class="form-control" id="instance_id" name="instance_id" 
                                   value="<?= htmlspecialchars($parametros['evolution_instance_id'] ?? '') ?>" 
                                   placeholder="Ex: anysummit_main" required>
                        </div>

                        <div class="mb-3">
                            <label for="api_url" class="form-label">URL da API Evolution</label>
                            <input type="url" class="form-control" id="api_url" name="api_url" 
                                   value="<?= htmlspecialchars($parametros['evolution_api_base_url'] ?? '') ?>" 
                                   placeholder="https://api.evolution.com.br" required>
                        </div>

                        <div class="mb-3">
                            <label for="webhook_token" class="form-label">Webhook Token</label>
                            <input type="password" class="form-control" id="webhook_token" name="webhook_token" 
                                   value="<?= htmlspecialchars($parametros['evolution_webhook_token'] ?? '') ?>" 
                                   placeholder="Token opcional">
                        </div>

                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-1"></i>Salvar Configuração
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    
    <div class="row mt-4">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5><i class="fas fa-satellite-dish me-2"></i>Status da Conexão</h5>
                </div>
                <div class="card-body">
                    <p class="text-muted">Para verificar o status da conexão, configure primeiro a API Evolution acima.</p>
                    
                    <?php if (!empty($parametros['evolution_api_base_url']) && !empty($parametros['evolution_instance_id'])): ?>
                        <div class="alert alert-info">
                            <strong>Configurado:</strong><br>
                            URL: <?= htmlspecialchars($parametros['evolution_api_base_url']) ?><br>
                            Instance: <?= htmlspecialchars($parametros['evolution_instance_id']) ?>
                        </div>
                        
                        <button type="button" class="btn btn-outline-primary" onclick="verificarStatus()">
                            <i class="fas fa-sync-alt me-1"></i>Verificar Status
                        </button>
                        
                        <div id="status-resultado" class="mt-3" style="display:none;"></div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function verificarStatus() {
    const resultadoDiv = document.getElementById('status-resultado');
    resultadoDiv.style.display = 'block';
    resultadoDiv.innerHTML = '<div class="spinner-border" role="status"><span class="visually-hidden">Verificando...</span></div>';
    
    fetch('../evolution.php?acao=get_status')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                resultadoDiv.innerHTML = `
                    <div class="alert alert-success">
                        <i class="fas fa-check-circle me-2"></i>
                        <strong>Sucesso!</strong><br>
                        Status: ${data.dados?.status || 'conectado'}
                    </div>
                `;
            } else {
                resultadoDiv.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-times-circle me-2"></i>
                        <strong>Erro:</strong><br>
                        ${data.mensagem || 'Erro desconhecido'}
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            resultadoDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-times-circle me-2"></i>
                    <strong>Erro de comunicação</strong><br>
                    Não foi possível conectar com a API
                </div>
            `;
        });
}
</script>

<?php include_once 'includes/footer.php'; ?>
