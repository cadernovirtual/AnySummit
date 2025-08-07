<?php
// Arquivo: /admin/parametros.php
// Página de configuração dos parâmetros gerais do sistema

$page_title = "Parâmetros Gerais";

// Adicionar TinyMCE no head
$custom_head = '
    <script src="https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
    <style>
        .tox-tinymce {
            border-radius: 8px !important;
            border: 2px solid #e1e5e9 !important;
        }
        .rich-editor {
            display: none; /* Esconder textarea original */
        }
        .editor-container {
            margin-bottom: 1rem;
        }
    </style>
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            tinymce.init({
                selector: ".rich-editor",
                height: 350,
                menubar: false,
                plugins: [
                    "advlist", "autolink", "lists", "link", "charmap", "preview",
                    "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
                    "insertdatetime", "table", "help", "wordcount", "paste"
                ],
                toolbar: "undo redo | blocks fontsize | bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent | link | removeformat | code fullscreen | help",
                content_style: "body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; line-height: 1.6; padding: 10px; }",
                language: "pt_BR",
                branding: false,
                promotion: false,
                paste_as_text: true,
                smart_paste: true,
                setup: function(editor) {
                    editor.on("change", function() {
                        formChanged = true;
                    });
                }
            });
        });
    </script>
';

require_once 'includes/header.php';

$mensagem = '';
$tipo_mensagem = '';

// Processar formulário quando enviado
if ($_POST && isset($_POST['salvar_parametros'])) {
    $politicas_anysummit = isset($_POST['politicas_anysummit']) ? trim($_POST['politicas_anysummit']) : '';
    $termos_anysummit = isset($_POST['termos_anysummit']) ? trim($_POST['termos_anysummit']) : '';
    $politicas_eventos_default = isset($_POST['politicas_eventos_default']) ? trim($_POST['politicas_eventos_default']) : '';
    $termos_eventos_default = isset($_POST['termos_eventos_default']) ? trim($_POST['termos_eventos_default']) : '';
    $taxa_servico_padrao = isset($_POST['taxa_servico_padrao']) ? trim($_POST['taxa_servico_padrao']) : '0.00';
    
    // Validar taxa de serviço
    if (!is_numeric($taxa_servico_padrao) || $taxa_servico_padrao < 0 || $taxa_servico_padrao > 100) {
        $mensagem = 'Taxa de serviço deve ser um número entre 0 e 100.';
        $tipo_mensagem = 'danger';
    } else {
        // Atualizar parâmetros no banco
        $stmt = $con->prepare("UPDATE parametros SET 
                                 politicas_anysummit = ?, 
                                 termos_anysummit = ?, 
                                 politicas_eventos_default = ?, 
                                 termos_eventos_default = ?, 
                                 taxa_servico_padrao = ? 
                               WHERE id = 1");
        
        $taxa_decimal = number_format((float)$taxa_servico_padrao, 2, '.', '');
        $stmt->bind_param("sssss", 
            $politicas_anysummit, 
            $termos_anysummit, 
            $politicas_eventos_default, 
            $termos_eventos_default, 
            $taxa_decimal
        );        
        if ($stmt->execute()) {
            $mensagem = 'Parâmetros salvos com sucesso!';
            $tipo_mensagem = 'success';
            error_log("Parâmetros atualizados pelo admin ID: " . $_SESSION['admin_usuarioid'] . " - " . date('Y-m-d H:i:s'));
        } else {
            $mensagem = 'Erro ao salvar parâmetros: ' . $con->error;
            $tipo_mensagem = 'danger';
            error_log("Erro ao atualizar parâmetros: " . $con->error);
        }
        $stmt->close();
    }
}

// Carregar parâmetros atuais
$stmt = $con->prepare("SELECT politicas_anysummit, termos_anysummit, politicas_eventos_default, termos_eventos_default, taxa_servico_padrao FROM parametros WHERE id = 1");
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $parametros = $result->fetch_assoc();
} else {
    $stmt_insert = $con->prepare("INSERT INTO parametros (id, politicas_anysummit, termos_anysummit, politicas_eventos_default, termos_eventos_default, taxa_servico_padrao) VALUES (1, '', '', '', '', 0.00)");
    $stmt_insert->execute();
    $stmt_insert->close();
    $parametros = [
        'politicas_anysummit' => '',
        'termos_anysummit' => '',
        'politicas_eventos_default' => '',
        'termos_eventos_default' => '',
        'taxa_servico_padrao' => '0.00'
    ];
}
$stmt->close();
?>
<div class="page-header">
    <h1><i class="fas fa-cogs me-2"></i>Parâmetros Gerais</h1>
    <p>Configure as políticas, termos de uso e taxas padrão do sistema</p>
</div>

<?php if (!empty($mensagem)): ?>
    <div class="alert alert-<?php echo $tipo_mensagem; ?> alert-dismissible fade show" role="alert">
        <i class="fas fa-<?php echo $tipo_mensagem == 'success' ? 'check-circle' : 'exclamation-triangle'; ?> me-2"></i>
        <?php echo htmlspecialchars($mensagem); ?>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
<?php endif; ?>

<div class="admin-card">
    <div class="admin-card-header">
        <h5 class="mb-0">
            <i class="fas fa-edit me-2"></i>
            Configurações do Sistema
        </h5>
    </div>
    <div class="admin-card-body">
        <form method="POST" action="" id="form_parametros">
            <div class="row">
                <div class="col-md-6 mb-4">
                    <label for="politicas_anysummit" class="form-label">
                        <i class="fas fa-shield-alt me-1"></i>
                        <strong>Políticas de Privacidade - AnySummit</strong>
                    </label>
                    <textarea class="form-control rich-editor" 
                              id="politicas_anysummit" 
                              name="politicas_anysummit" 
                              placeholder="Digite aqui as políticas de privacidade da plataforma AnySummit..."><?php echo htmlspecialchars($parametros['politicas_anysummit']); ?></textarea>
                </div>                
                <div class="col-md-6 mb-4">
                    <label for="termos_anysummit" class="form-label">
                        <i class="fas fa-file-contract me-1"></i>
                        <strong>Termos de Uso - AnySummit</strong>
                    </label>
                    <textarea class="form-control rich-editor" 
                              id="termos_anysummit" 
                              name="termos_anysummit" 
                              placeholder="Digite aqui os termos de uso da plataforma AnySummit..."><?php echo htmlspecialchars($parametros['termos_anysummit']); ?></textarea>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-4">
                    <label for="politicas_eventos_default" class="form-label">
                        <i class="fas fa-calendar-alt me-1"></i>
                        <strong>Políticas Padrão - Eventos</strong>
                    </label>
                    <textarea class="form-control rich-editor" 
                              id="politicas_eventos_default" 
                              name="politicas_eventos_default" 
                              placeholder="Digite aqui as políticas padrão que serão aplicadas nos eventos..."><?php echo htmlspecialchars($parametros['politicas_eventos_default']); ?></textarea>
                </div>
                
                <div class="col-md-6 mb-4">
                    <label for="termos_eventos_default" class="form-label">
                        <i class="fas fa-handshake me-1"></i>
                        <strong>Termos Padrão - Eventos</strong>
                    </label>
                    <textarea class="form-control rich-editor" 
                              id="termos_eventos_default" 
                              name="termos_eventos_default" 
                              placeholder="Digite aqui os termos padrão que serão aplicados nos eventos..."><?php echo htmlspecialchars($parametros['termos_eventos_default']); ?></textarea>
                </div>
            </div>            
            <div class="row">
                <div class="col-md-6 mb-4">
                    <label for="taxa_servico_padrao" class="form-label">
                        <i class="fas fa-percentage me-1"></i>
                        <strong>Taxa de Serviço Padrão (%)</strong>
                    </label>
                    <div class="input-group">
                        <input type="number" 
                               class="form-control" 
                               id="taxa_servico_padrao" 
                               name="taxa_servico_padrao" 
                               value="<?php echo number_format((float)$parametros['taxa_servico_padrao'], 2, '.', ''); ?>"
                               min="0" 
                               max="100" 
                               step="0.01"
                               required>
                        <span class="input-group-text">%</span>
                    </div>
                </div>
            </div>
            
            <div class="d-flex justify-content-between align-items-center mt-4">
                <div class="text-muted">
                    <i class="fas fa-info-circle me-1"></i>
                    Todas as alterações serão aplicadas imediatamente
                </div>
                
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-secondary" onclick="location.reload()">
                        <i class="fas fa-undo me-1"></i>
                        Cancelar
                    </button>
                    <button type="submit" name="salvar_parametros" class="btn btn-primary">
                        <i class="fas fa-save me-1"></i>
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>

<?php 
$custom_js = "
    // Integração com TinyMCE para detectar mudanças
    let formChanged = false;
    
    // Detectar mudanças nos campos normais
    document.getElementById('form_parametros').addEventListener('change', function() {
        formChanged = true;
    });
    
    // Detectar mudanças no campo de taxa
    document.getElementById('taxa_servico_padrao').addEventListener('input', function() {
        formChanged = true;
    });
    
    // Confirmar antes de sair se houver alterações não salvas
    window.addEventListener('beforeunload', function(e) {
        // Verificar se há mudanças no TinyMCE também
        if (typeof tinymce !== 'undefined') {
            tinymce.editors.forEach(function(editor) {
                if (editor.isDirty()) {
                    formChanged = true;
                }
            });
        }
        
        if (formChanged) {
            e.preventDefault();
            e.returnValue = 'Há alterações não salvas. Tem certeza que deseja sair?';
        }
    });
    
    // Resetar flag quando formulário for enviado
    document.getElementById('form_parametros').addEventListener('submit', function() {
        formChanged = false;
        
        // Sincronizar conteúdo do TinyMCE antes de enviar
        if (typeof tinymce !== 'undefined') {
            tinymce.triggerSave();
        }
    });
    
    // Melhorar botão cancelar
    document.querySelector('[onclick=\"location.reload()\"]').onclick = function(e) {
        if (formChanged || (typeof tinymce !== 'undefined' && tinymce.editors.some(editor => editor.isDirty()))) {
            if (!confirm('Há alterações não salvas. Tem certeza que deseja cancelar?')) {
                e.preventDefault();
                return false;
            }
        }
        location.reload();
    };
";

require_once 'includes/footer.php'; 
?>