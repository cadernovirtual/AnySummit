<?php
// Arquivo: /admin/index.php
// Dashboard principal do admin

$page_title = "Dashboard";
require_once 'includes/header.php';
?>

<div class="page-header">
    <h1><i class="fas fa-tachometer-alt me-2"></i>Dashboard Administrativo</h1>
    <p>Painel de controle e configurações do sistema AnySummit</p>
</div>

<div class="row">
    <div class="col-md-6 mb-4">
        <div class="admin-card">
            <div class="admin-card-header">
                <h5 class="mb-0">
                    <i class="fas fa-cogs me-2"></i>
                    Parâmetros Gerais
                </h5>
            </div>
            <div class="admin-card-body">
                <p class="text-muted mb-3">
                    Configure políticas, termos de uso e taxas padrão do sistema.
                </p>
                <a href="/admin/parametros.php" class="btn btn-primary">
                    <i class="fas fa-arrow-right me-1"></i>
                    Acessar Configurações
                </a>
            </div>
        </div>
    </div>
    
    <div class="col-md-6 mb-4">
        <div class="admin-card">
            <div class="admin-card-header">
                <h5 class="mb-0">
                    <i class="fab fa-whatsapp me-2"></i>
                    Instância WhatsApp
                </h5>
            </div>
            <div class="admin-card-body">
                <p class="text-muted mb-3">
                    Configure a integração com WhatsApp via Evolution API.
                </p>
                <a href="/admin/evolution.php" class="btn btn-success">
                    <i class="fas fa-arrow-right me-1"></i>
                    Configurar WhatsApp
                </a>
            </div>
        </div>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>