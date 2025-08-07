<?php
/**
 * AnySummit - Admin - Instância WhatsApp Evolution
 * Interface para gerenciamento da instância WhatsApp
 * 
 * @author Gustavo Lopes
 * @version 1.0
 * @date 2025-08-06
 */

require_once 'conm/conn.php';

// Verificar autenticação
verificarAutenticacaoAdmin();

// Processar formulário se enviado
$mensagem_sucesso = '';
$mensagem_erro = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $instance_id = trim($_POST['instance_id'] ?? '');
    $api_url = trim($_POST['api_url'] ?? '');
    $webhook_token = trim($_POST['webhook_token'] ?? '');
    
    if (empty($instance_id) || empty($api_url)) {
        $mensagem_erro = 'Instance ID e URL da API são obrigatórios';
    } else {
        // Validar URL
        if (!filter_var($api_url, FILTER_VALIDATE_URL)) {
            $mensagem_erro = 'URL da API inválida';
        } else {
            // Salvar parâmetros
            $stmt = $con->prepare("UPDATE parametros SET evolution_instance_id = ?, evolution_api_base_url = ?, evolution_webhook_token = ? WHERE id = 1");
            $stmt->bind_param("sss", $instance_id, $api_url, $webhook_token);
            
            if ($stmt->execute()) {
                $mensagem_sucesso = 'Parâmetros salvos com sucesso!';
            } else {
                $mensagem_erro = 'Erro ao salvar parâmetros: ' . $stmt->error;
            }
            
            $stmt->close();
        }
    }
}

// Buscar parâmetros atuais
$parametros = null;
$result = $con->query("SELECT evolution_instance_id, evolution_api_base_url, evolution_webhook_token, evolution_numero_whatsapp FROM parametros WHERE id = 1");
if ($result && $result->num_rows > 0) {
    $parametros = $result->fetch_assoc();
}

include_once 'includes/header.php';
?>

<div class="container-fluid py-4">
    <!-- Alertas -->
    <?php if ($mensagem_sucesso): ?>
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle me-2"></i><?php echo htmlspecialchars($mensagem_sucesso); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    <?php endif; ?>
    
    <?php if ($mensagem_erro): ?>
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i><?php echo htmlspecialchars($mensagem_erro); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    <?php endif; ?>

    <!-- Título da página -->
    <div class="row">
        <div class="col-12">
            <div class="card mb-4">
                <div class="card-body">
                    <h4 class="card-title mb-0">
                        <i class="fab fa-whatsapp me-2 text-success"></i>
                        Instância WhatsApp Evolution
                    </h4>
                    <p class="text-muted mb-0">Gerencie a conexão com a API Evolution para envio de mensagens WhatsApp</p>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- Configuração da Instância -->
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-cogs me-2"></i>
                        Configuração da API
                    </h5>
                </div>
                <div class="card-body">
                    <form method="POST">
                        <div class="mb-3">
                            <label for="instance_id" class="form-label">
                                <i class="fas fa-tag me-1"></i>Instance ID
                            </label>
                            <input type="text" 
                                   class="form-control" 
                                   id="instance_id" 
                                   name="instance_id" 
                                   value="<?php echo htmlspecialchars($parametros['evolution_instance_id'] ?? ''); ?>"
                                   placeholder="Ex: anysummit_main"
                                   required>
                            <div class="form-text">Identificador único da sua instância Evolution</div>
                        </div>

                        <div class="mb-3">
                            <label for="api_url" class="form-label">
                                <i class="fas fa-link me-1"></i>URL da API Evolution
                            </label>
                            <input type="url" 
                                   class="form-control" 
                                   id="api_url" 
                                   name="api_url" 
                                   value="<?php echo htmlspecialchars($parametros['evolution_api_base_url'] ?? ''); ?>"
                                   placeholder="https://api.evolution.com.br"
                                   required>
                            <div class="form-text">URL base da sua API Evolution</div>
                        </div>

                        <div class="mb-3">
                            <label for="webhook_token" class="form-label">
                                <i class="fas fa-key me-1"></i>Webhook Token
                            </label>
                            <input type="password" 
                                   class="form-control" 
                                   id="webhook_token" 
                                   name="webhook_token" 
                                   value="<?php echo htmlspecialchars($parametros['evolution_webhook_token'] ?? ''); ?>"
                                   placeholder="Token opcional para webhooks">
                            <div class="form-text">Token para autenticação de webhooks (opcional)</div>
                        </div>

                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save me-1"></i>Salvar Configuração
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Status da Conexão -->
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-satellite-dish me-2"></i>
                        Status da Conexão
                    </h5>
                </div>
                <div class="card-body">
                    <div id="status-conexao" class="text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Verificando...</span>
                        </div>
                        <p class="mt-2 text-muted">Verificando status da instância...</p>
                    </div>
                </div>
            </div>

            <!-- QR Code -->
            <div class="card mt-4" id="card-qrcode" style="display: none;">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-qrcode me-2"></i>
                        QR Code de Conexão
                    </h5>
                </div>
                <div class="card-body text-center">
                    <div id="qrcode-container">
                        <!-- QR Code será inserido aqui -->
                    </div>
                    <p class="text-muted mt-3">
                        <i class="fas fa-info-circle me-1"></i>
                        Escaneie com o WhatsApp para conectar a instância
                    </p>
                    <button type="button" class="btn btn-outline-success" onclick="atualizarQRCode()">
                        <i class="fas fa-sync-alt me-1"></i>Atualizar QR Code
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Teste de Envio -->
    <div class="row mt-4">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-paper-plane me-2"></i>
                        Teste de Envio
                    </h5>
                </div>
                <div class="card-body">
                    <form id="form-teste-envio">
                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="numero_teste" class="form-label">
                                        <i class="fas fa-phone me-1"></i>Número (com DDD)
                                    </label>
                                    <input type="text" 
                                           class="form-control" 
                                           id="numero_teste" 
                                           name="numero_teste" 
                                           placeholder="81999999999"
                                           pattern="[0-9]{10,11}"
                                           required>
                                    <div class="form-text">Apenas números, com DDD</div>
                                </div>
                            </div>
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label for="mensagem_teste" class="form-label">
                                        <i class="fas fa-comment me-1"></i>Mensagem
                                    </label>
                                    <textarea class="form-control" 
                                              id="mensagem_teste" 
                                              name="mensagem_teste" 
                                              rows="3"
                                              placeholder="Digite a mensagem de teste..."
                                              required></textarea>
                                </div>
                            </div>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button type="submit" class="btn btn-success" id="btn-enviar-teste">
                                <i class="fas fa-paper-plane me-1"></i>Enviar Teste
                            </button>
                            <button type="button" class="btn btn-info" onclick="verificarStatus()">
                                <i class="fas fa-sync-alt me-1"></i>Verificar Status
                            </button>
                        </div>
                    </form>
                    
                    <div id="resultado-teste" class="mt-3" style="display: none;"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Variáveis globais
let statusConexao = 'desconhecido';

// Verificar status ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    if (<?php echo json_encode(!empty($parametros['evolution_api_base_url']) && !empty($parametros['evolution_instance_id'])); ?>) {
        verificarStatus();
    } else {
        document.getElementById('status-conexao').innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Configure primeiro a API Evolution
            </div>
        `;
    }
});

// Função para verificar status da instância
function verificarStatus() {
    const statusElement = document.getElementById('status-conexao');
    
    statusElement.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Verificando...</span>
        </div>
        <p class="mt-2 text-muted">Verificando status da instância...</p>
    `;
    
    fetch('../evolution.php?acao=get_status')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                const status = data.dados?.status || 'desconhecido';
                statusConexao = status;
                
                if (status === 'connected') {
                    statusElement.innerHTML = `
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle me-2"></i>
                            <strong>Conectado</strong><br>
                            ${data.dados.message || 'Instância conectada com sucesso'}
                        </div>
                        <div class="mt-2">
                            <span class="badge bg-success">Online</span>
                            <span class="text-muted ms-2">Última verificação: ${new Date().toLocaleString('pt-BR')}</span>
                        </div>
                    `;
                    document.getElementById('card-qrcode').style.display = 'none';
                } else {
                    statusElement.innerHTML = `
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>Desconectado</strong><br>
                            Instância não está conectada
                        </div>
                        <div class="mt-2">
                            <span class="badge bg-warning">Offline</span>
                        </div>
                    `;
                    buscarQRCode();
                }
            } else {
                statusElement.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-times-circle me-2"></i>
                        <strong>Erro</strong><br>
                        ${data.mensagem || 'Erro ao verificar status'}
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            statusElement.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-times-circle me-2"></i>
                    <strong>Erro de Comunicação</strong><br>
                    Não foi possível conectar com a API
                </div>
            `;
        });
}

// Função para buscar QR Code
function buscarQRCode() {
    fetch('../evolution.php?acao=get_qrcode')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok' && data.dados?.qrcode) {
                document.getElementById('qrcode-container').innerHTML = `
                    <img src="${data.dados.qrcode}" 
                         alt="QR Code WhatsApp" 
                         class="img-fluid border rounded" 
                         style="max-width: 300px;">
                `;
                document.getElementById('card-qrcode').style.display = 'block';
            } else {
                document.getElementById('card-qrcode').style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar QR Code:', error);
            document.getElementById('card-qrcode').style.display = 'none';
        });
}

// Função para atualizar QR Code
function atualizarQRCode() {
    document.getElementById('qrcode-container').innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Gerando...</span>
        </div>
        <p class="mt-2 text-muted">Gerando novo QR Code...</p>
    `;
    
    setTimeout(() => {
        buscarQRCode();
    }, 1000);
}

// Formulário de teste de envio
document.getElementById('form-teste-envio').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const btnEnviar = document.getElementById('btn-enviar-teste');
    const resultadoDiv = document.getElementById('resultado-teste');
    
    // Desabilitar botão
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Enviando...';
    
    // Dados do formulário
    const formData = new FormData();
    formData.append('acao', 'send_message');
    formData.append('numero', document.getElementById('numero_teste').value);
    formData.append('mensagem', document.getElementById('mensagem_teste').value);
    
    fetch('../evolution.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        resultadoDiv.style.display = 'block';
        
        if (data.status === 'ok') {
            resultadoDiv.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>Mensagem enviada com sucesso!</strong>
                </div>
            `;
        } else {
            resultadoDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-times-circle me-2"></i>
                    <strong>Erro ao enviar:</strong><br>
                    ${data.mensagem || 'Erro desconhecido'}
                </div>
            `;
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        resultadoDiv.style.display = 'block';
        resultadoDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-times-circle me-2"></i>
                <strong>Erro de comunicação:</strong><br>
                Não foi possível enviar a mensagem
            </div>
        `;
    })
    .finally(() => {
        // Reabilitar botão
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = '<i class="fas fa-paper-plane me-1"></i>Enviar Teste';
    });
});

// Auto-hide alerts
setTimeout(function() {
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(alert => {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
    });
}, 5000);
</script>

<?php include_once 'includes/footer.php'; ?>
