<?php
/**
 * AnySummit - Admin - Histórico de Mensagens WhatsApp
 * Visualização do histórico de mensagens trocadas com usuários
 * 
 * @author Gustavo Lopes
 * @version 1.0
 * @date 2025-08-06
 */

require_once 'conm/conn.php';

// Verificar autenticação
verificarAutenticacaoAdmin();

// Parâmetros de filtro
$filtro_texto = trim($_GET['texto'] ?? '');
$filtro_origem = $_GET['origem'] ?? '';
$filtro_tipo = $_GET['tipo'] ?? '';
$limite = (int)($_GET['limite'] ?? 50);
$pagina = max(1, (int)($_GET['pagina'] ?? 1));
$offset = ($pagina - 1) * $limite;

// Construir query com filtros
$where_conditions = [];
$params = [];
$param_types = '';

if (!empty($filtro_texto)) {
    $where_conditions[] = "(numero_destino LIKE ? OR mensagem LIKE ?)";
    $params[] = "%$filtro_texto%";
    $params[] = "%$filtro_texto%";
    $param_types .= 'ss';
}

if (!empty($filtro_origem)) {
    $where_conditions[] = "origem = ?";
    $params[] = $filtro_origem;
    $param_types .= 's';
}

if (!empty($filtro_tipo)) {
    $where_conditions[] = "tipo = ?";
    $params[] = $filtro_tipo;
    $param_types .= 's';
}

$where_sql = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';

// Query principal para buscar mensagens
$sql_mensagens = "SELECT 
    m.mensagemid,
    m.eventoid,
    m.participanteid,
    m.compradorid,
    m.numero_destino,
    m.origem,
    m.tipo,
    m.mensagem,
    m.enviado_em,
    m.recebido_em,
    m.recebido,
    m.erro_envio,
    e.nome_evento,
    COALESCE(p.nome, c.nome_comprador, 'N/A') as nome_usuario
FROM eventos_mensagens_whatsapp m
LEFT JOIN eventos e ON m.eventoid = e.evento_id
LEFT JOIN participantes p ON m.participanteid = p.participante_id
LEFT JOIN compradores c ON m.compradorid = c.comprador_id
$where_sql
ORDER BY m.enviado_em DESC
LIMIT ? OFFSET ?";

// Adicionar parâmetros de paginação
$params[] = $limite;
$params[] = $offset;
$param_types .= 'ii';

// Query para contar total
$sql_count = "SELECT COUNT(*) as total FROM eventos_mensagens_whatsapp m $where_sql";

// Executar queries
$mensagens = [];
$total_mensagens = 0;

try {
    // Contar total
    if (!empty($param_types) && count($params) > 2) {
        $stmt_count = $con->prepare($sql_count);
        $count_params = array_slice($params, 0, -2); // Remove limit e offset
        $count_types = substr($param_types, 0, -2);
        if (!empty($count_types)) {
            $stmt_count->bind_param($count_types, ...$count_params);
        }
    } else {
        $stmt_count = $con->prepare($sql_count);
    }
    
    $stmt_count->execute();
    $result_count = $stmt_count->get_result();
    $total_mensagens = $result_count->fetch_assoc()['total'];
    $stmt_count->close();
    
    // Buscar mensagens
    $stmt = $con->prepare($sql_mensagens);
    if (!empty($param_types)) {
        $stmt->bind_param($param_types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $mensagens[] = $row;
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    error_log("Erro ao buscar mensagens: " . $e->getMessage());
    $mensagens = [];
}

// Calcular paginação
$total_paginas = ceil($total_mensagens / $limite);

include_once 'includes/header.php';
?>

<div class="container-fluid py-4">
    <!-- Título da página -->
    <div class="row">
        <div class="col-12">
            <div class="card mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 class="card-title mb-0">
                                <i class="fas fa-comments me-2 text-primary"></i>
                                Histórico de Mensagens WhatsApp
                            </h4>
                            <p class="text-muted mb-0">Visualize todas as mensagens trocadas com participantes e compradores</p>
                        </div>
                        <div>
                            <span class="badge bg-info fs-6"><?php echo number_format($total_mensagens, 0, ',', '.'); ?> mensagens</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Filtros -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-filter me-2"></i>Filtros
                    </h5>
                </div>
                <div class="card-body">
                    <form method="GET" class="row g-3">
                        <div class="col-md-4">
                            <label for="texto" class="form-label">
                                <i class="fas fa-search me-1"></i>Buscar por texto ou número
                            </label>
                            <input type="text" 
                                   class="form-control" 
                                   id="texto" 
                                   name="texto" 
                                   value="<?php echo htmlspecialchars($filtro_texto); ?>"
                                   placeholder="Texto da mensagem ou número...">
                        </div>
                        
                        <div class="col-md-2">
                            <label for="origem" class="form-label">
                                <i class="fas fa-user me-1"></i>Origem
                            </label>
                            <select class="form-select" id="origem" name="origem">
                                <option value="">Todas</option>
                                <option value="sistema" <?php echo $filtro_origem === 'sistema' ? 'selected' : ''; ?>>Sistema</option>
                                <option value="participante" <?php echo $filtro_origem === 'participante' ? 'selected' : ''; ?>>Participante</option>
                                <option value="comprador" <?php echo $filtro_origem === 'comprador' ? 'selected' : ''; ?>>Comprador</option>
                                <option value="staff" <?php echo $filtro_origem === 'staff' ? 'selected' : ''; ?>>Staff</option>
                            </select>
                        </div>
                        
                        <div class="col-md-2">
                            <label for="tipo" class="form-label">
                                <i class="fas fa-tag me-1"></i>Tipo
                            </label>
                            <select class="form-select" id="tipo" name="tipo">
                                <option value="">Todos</option>
                                <option value="texto" <?php echo $filtro_tipo === 'texto' ? 'selected' : ''; ?>>Texto</option>
                                <option value="imagem" <?php echo $filtro_tipo === 'imagem' ? 'selected' : ''; ?>>Imagem</option>
                                <option value="documento" <?php echo $filtro_tipo === 'documento' ? 'selected' : ''; ?>>Documento</option>
                                <option value="audio" <?php echo $filtro_tipo === 'audio' ? 'selected' : ''; ?>>Áudio</option>
                            </select>
                        </div>
                        
                        <div class="col-md-2">
                            <label for="limite" class="form-label">
                                <i class="fas fa-list me-1"></i>Por página
                            </label>
                            <select class="form-select" id="limite" name="limite">
                                <option value="25" <?php echo $limite === 25 ? 'selected' : ''; ?>>25</option>
                                <option value="50" <?php echo $limite === 50 ? 'selected' : ''; ?>>50</option>
                                <option value="100" <?php echo $limite === 100 ? 'selected' : ''; ?>>100</option>
                            </select>
                        </div>
                        
                        <div class="col-md-2">
                            <label class="form-label">&nbsp;</label>
                            <div class="d-grid gap-2 d-md-flex">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-search me-1"></i>Filtrar
                                </button>
                                <a href="mensagens.php" class="btn btn-outline-secondary">
                                    <i class="fas fa-times me-1"></i>Limpar
                                </a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Lista de Mensagens -->
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-body p-0">
                    <?php if (empty($mensagens)): ?>
                        <div class="p-4 text-center">
                            <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">Nenhuma mensagem encontrada</h5>
                            <p class="text-muted mb-0">
                                <?php if (!empty($filtro_texto) || !empty($filtro_origem) || !empty($filtro_tipo)): ?>
                                    Tente ajustar os filtros para encontrar mensagens
                                <?php else: ?>
                                    Ainda não há mensagens WhatsApp registradas
                                <?php endif; ?>
                            </p>
                        </div>
                    <?php else: ?>
                        <div class="chat-container" style="max-height: 70vh; overflow-y: auto;">
                            <?php 
                            $numero_anterior = '';
                            foreach ($mensagens as $msg): 
                                // Agrupar por número de telefone
                                if ($msg['numero_destino'] !== $numero_anterior): 
                                    if ($numero_anterior !== '') echo '</div>'; // Fechar grupo anterior
                                    echo '<div class="chat-group border-bottom">';
                                    echo '<div class="chat-header p-3 bg-light">';
                                    echo '<div class="d-flex align-items-center">';
                                    echo '<div class="avatar-circle bg-primary text-white me-3">';
                                    echo '<i class="fas fa-user"></i>';
                                    echo '</div>';
                                    echo '<div>';
                                    echo '<h6 class="mb-1">' . htmlspecialchars($msg['nome_usuario']) . '</h6>';
                                    echo '<p class="mb-0 text-muted small">';
                                    echo '<i class="fas fa-phone me-1"></i>' . htmlspecialchars($msg['numero_destino']);
                                    if ($msg['nome_evento']) {
                                        echo ' • <i class="fas fa-calendar me-1"></i>' . htmlspecialchars($msg['nome_evento']);
                                    }
                                    echo '</p>';
                                    echo '</div>';
                                    echo '</div>';
                                    echo '</div>';
                                    echo '<div class="chat-messages p-3">';
                                endif;
                                
                                $numero_anterior = $msg['numero_destino'];
                                
                                // Classe da mensagem baseada na origem
                                $msg_class = $msg['origem'] === 'sistema' ? 'sent' : 'received';
                                $bg_class = $msg['origem'] === 'sistema' ? 'bg-primary text-white' : 'bg-light';
                                $align_class = $msg['origem'] === 'sistema' ? 'justify-content-end' : 'justify-content-start';
                            ?>
                            
                            <div class="message-row d-flex mb-3 <?php echo $align_class; ?>">
                                <div class="message-bubble <?php echo $bg_class; ?> p-3 rounded-3 shadow-sm" style="max-width: 70%;">
                                    <!-- Tipo e origem da mensagem -->
                                    <div class="message-meta mb-2">
                                        <small class="<?php echo $msg['origem'] === 'sistema' ? 'text-white-50' : 'text-muted'; ?>">
                                            <i class="fas fa-<?php 
                                                echo match($msg['tipo']) {
                                                    'imagem' => 'image',
                                                    'documento' => 'file',
                                                    'audio' => 'microphone',
                                                    default => 'comment'
                                                }; 
                                            ?> me-1"></i>
                                            <?php echo ucfirst($msg['origem']); ?> • <?php echo ucfirst($msg['tipo']); ?>
                                        </small>
                                    </div>
                                    
                                    <!-- Conteúdo da mensagem -->
                                    <div class="message-content">
                                        <?php if ($msg['tipo'] === 'texto'): ?>
                                            <p class="mb-0"><?php echo nl2br(htmlspecialchars($msg['mensagem'])); ?></p>
                                        <?php else: ?>
                                            <p class="mb-0">
                                                <i class="fas fa-paperclip me-1"></i>
                                                <?php echo ucfirst($msg['tipo']); ?>: 
                                                <?php echo htmlspecialchars(strlen($msg['mensagem']) > 50 ? substr($msg['mensagem'], 0, 50) . '...' : $msg['mensagem']); ?>
                                            </p>
                                        <?php endif; ?>
                                    </div>
                                    
                                    <!-- Data/hora e status -->
                                    <div class="message-footer mt-2 d-flex justify-content-between align-items-center">
                                        <small class="<?php echo $msg['origem'] === 'sistema' ? 'text-white-50' : 'text-muted'; ?>">
                                            <?php echo date('d/m/Y H:i', strtotime($msg['enviado_em'])); ?>
                                        </small>
                                        
                                        <?php if ($msg['origem'] === 'sistema'): ?>
                                            <div class="status-icons">
                                                <?php if ($msg['erro_envio']): ?>
                                                    <i class="fas fa-exclamation-triangle text-warning" 
                                                       title="Erro: <?php echo htmlspecialchars($msg['erro_envio']); ?>"></i>
                                                <?php elseif ($msg['recebido']): ?>
                                                    <i class="fas fa-check-double text-success" title="Entregue"></i>
                                                <?php else: ?>
                                                    <i class="fas fa-check text-info" title="Enviado"></i>
                                                <?php endif; ?>
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            </div>
                            
                            <?php endforeach; ?>
                            
                            <?php if (!empty($mensagens)) echo '</div></div>'; // Fechar último grupo ?>
                        </div>
                    <?php endif; ?>
                </div>
                
                <!-- Paginação -->
                <?php if ($total_paginas > 1): ?>
                <div class="card-footer">
                    <nav aria-label="Navegação das mensagens">
                        <ul class="pagination justify-content-center mb-0">
                            <!-- Primeira página -->
                            <?php if ($pagina > 1): ?>
                                <li class="page-item">
                                    <a class="page-link" href="?<?php echo http_build_query(array_merge($_GET, ['pagina' => 1])); ?>">
                                        <i class="fas fa-angle-double-left"></i>
                                    </a>
                                </li>
                                <li class="page-item">
                                    <a class="page-link" href="?<?php echo http_build_query(array_merge($_GET, ['pagina' => $pagina - 1])); ?>">
                                        <i class="fas fa-angle-left"></i>
                                    </a>
                                </li>
                            <?php endif; ?>
                            
                            <!-- Páginas numéricas -->
                            <?php
                            $inicio = max(1, $pagina - 2);
                            $fim = min($total_paginas, $pagina + 2);
                            
                            for ($i = $inicio; $i <= $fim; $i++):
                            ?>
                                <li class="page-item <?php echo $i === $pagina ? 'active' : ''; ?>">
                                    <a class="page-link" href="?<?php echo http_build_query(array_merge($_GET, ['pagina' => $i])); ?>">
                                        <?php echo $i; ?>
                                    </a>
                                </li>
                            <?php endfor; ?>
                            
                            <!-- Última página -->
                            <?php if ($pagina < $total_paginas): ?>
                                <li class="page-item">
                                    <a class="page-link" href="?<?php echo http_build_query(array_merge($_GET, ['pagina' => $pagina + 1])); ?>">
                                        <i class="fas fa-angle-right"></i>
                                    </a>
                                </li>
                                <li class="page-item">
                                    <a class="page-link" href="?<?php echo http_build_query(array_merge($_GET, ['pagina' => $total_paginas])); ?>">
                                        <i class="fas fa-angle-double-right"></i>
                                    </a>
                                </li>
                            <?php endif; ?>
                        </ul>
                        
                        <div class="text-center text-muted mt-2">
                            Página <?php echo $pagina; ?> de <?php echo $total_paginas; ?> 
                            (<?php echo number_format($total_mensagens, 0, ',', '.'); ?> mensagens)
                        </div>
                    </nav>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<style>
.chat-container {
    background: #f8f9fa;
}

.chat-group {
    background: white;
    margin-bottom: 1rem;
}

.chat-header {
    border-bottom: 1px solid #dee2e6;
}

.avatar-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
}

.message-bubble {
    border: 1px solid rgba(0,0,0,0.1);
    position: relative;
}

.message-bubble.bg-primary {
    border-color: rgba(255,255,255,0.2);
}

.message-row .message-bubble::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
}

/* Seta para mensagens enviadas (direita) */
.justify-content-end .message-bubble::before {
    top: 15px;
    right: -8px;
    border-width: 8px 0 8px 8px;
    border-color: transparent transparent transparent #0d6efd;
}

/* Seta para mensagens recebidas (esquerda) */
.justify-content-start .message-bubble::before {
    top: 15px;
    left: -8px;
    border-width: 8px 8px 8px 0;
    border-color: transparent #f8f9fa transparent transparent;
}

.message-content p:last-child {
    margin-bottom: 0 !important;
}

.status-icons i {
    font-size: 0.8rem;
    margin-left: 4px;
}

.pagination .page-item.active .page-link {
    background-color: #0d6efd;
    border-color: #0d6efd;
}

/* Responsividade */
@media (max-width: 768px) {
    .message-bubble {
        max-width: 85% !important;
    }
    
    .chat-header .d-flex {
        flex-direction: column;
        text-align: center;
    }
    
    .avatar-circle {
        margin: 0 auto;
    }
}
</style>

<?php include_once 'includes/footer.php'; ?>
