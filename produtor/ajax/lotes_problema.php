<?php
include("../check_login.php");
include("../conm/conn.php");

// Configurar cabeçalhos para JSON
header('Content-Type: application/json');

// Verificar se o usuário está logado
$usuario_id = $_COOKIE['usuarioid'] ?? 0;
if (!$usuario_id) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

// Determinar ação
$action = $_GET['action'] ?? ($_POST['action'] ?? '');
$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

if (isset($input['action'])) {
    $action = $input['action'];
}

try {
    switch ($action) {
        case 'form':
            // Mostrar formulário para criar/editar lote
            handleFormAction();
            break;
            
        case 'save':
            // Salvar lote (criar ou atualizar)
            handleSaveAction($input);
            break;
            
        case 'delete':
            // Excluir lote
            handleDeleteAction($input);
            break;
            
        case 'toggle_divulgar':
            // Toggle divulgar critério
            handleToggleDivulgarAction($input);
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Ação inválida']);
    }
    
} catch (Exception $e) {
    error_log("Erro em lotes.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro interno do servidor']);
}

function handleFormAction() {
    global $con, $usuario_id;
    
    $evento_id = intval($_GET['evento_id'] ?? 0);
    $lote_id = intval($_GET['lote_id'] ?? 0);
    
    if (!$evento_id) {
        echo json_encode(['success' => false, 'message' => 'ID do evento é obrigatório']);
        return;
    }
    
    // Verificar se o evento pertence ao usuário
    $sql_evento = "SELECT e.*, COUNT(l.id) as total_lotes 
                   FROM eventos e 
                   LEFT JOIN lotes l ON e.id = l.evento_id 
                   WHERE e.id = ? AND e.usuario_id = ? 
                   GROUP BY e.id";
    $stmt_evento = mysqli_prepare($con, $sql_evento);
    mysqli_stmt_bind_param($stmt_evento, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt_evento);
    $result_evento = mysqli_stmt_get_result($stmt_evento);
    $evento = mysqli_fetch_assoc($result_evento);
    
    if (!$evento) {
        echo json_encode(['success' => false, 'message' => 'Evento não encontrado']);
        return;
    }
    
    $lote = null;
    $eh_primeiro_lote = ($evento['total_lotes'] == 0 && !$lote_id);
    
    // Se está editando, buscar dados do lote
    if ($lote_id) {
        $sql_lote = "SELECT * FROM lotes WHERE id = ? AND evento_id = ?";
        $stmt_lote = mysqli_prepare($con, $sql_lote);
        mysqli_stmt_bind_param($stmt_lote, "ii", $lote_id, $evento_id);
        mysqli_stmt_execute($stmt_lote);
        $result_lote = mysqli_stmt_get_result($stmt_lote);
        $lote = mysqli_fetch_assoc($result_lote);
        
        if (!$lote) {
            echo json_encode(['success' => false, 'message' => 'Lote não encontrado']);
            return;
        }
        
        // Verificar se é o primeiro lote (data_inicio mais antiga)
        $sql_primeiro = "SELECT MIN(data_inicio) as primeira_data FROM lotes WHERE evento_id = ?";
        $stmt_primeiro = mysqli_prepare($con, $sql_primeiro);
        mysqli_stmt_bind_param($stmt_primeiro, "i", $evento_id);
        mysqli_stmt_execute($stmt_primeiro);
        $result_primeiro = mysqli_stmt_get_result($stmt_primeiro);
        $primeira_data = mysqli_fetch_assoc($result_primeiro)['primeira_data'];
        
        $eh_primeiro_lote = ($lote['data_inicio'] === $primeira_data);
    }
    
    // Calcular próxima data_inicio para novos lotes
    $proxima_data_inicio = null;
    if (!$lote_id && !$eh_primeiro_lote) {
        $sql_max_data = "SELECT MAX(data_fim) as max_data_fim FROM lotes WHERE evento_id = ?";
        $stmt_max = mysqli_prepare($con, $sql_max_data);
        mysqli_stmt_bind_param($stmt_max, "i", $evento_id);
        mysqli_stmt_execute($stmt_max);
        $result_max = mysqli_stmt_get_result($stmt_max);
        $max_data = mysqli_fetch_assoc($result_max)['max_data_fim'];
        
        if ($max_data) {
            $data_max = new DateTime($max_data);
            $data_max->add(new DateInterval('PT1M')); // Adicionar 1 minuto
            $proxima_data_inicio = $data_max->format('Y-m-d\TH:i');
        }
    }
    
    // Renderizar formulário
    renderFormulario($evento, $lote, $eh_primeiro_lote, $proxima_data_inicio);
}
function renderFormulario($evento, $lote, $eh_primeiro_lote, $proxima_data_inicio) {
    $titulo = $lote ? 'Editar Lote' : 'Novo Lote';
    $evento_id = $evento['id'];
    $lote_id = $lote ? $lote['id'] : 0;
    
    // Valores padrão
    $nome = $lote['nome'] ?? '';
    $data_inicio = '';
    $data_fim = '';
    $divulgar_criterio = $lote['divulgar_criterio'] ?? 0;
    
    if ($lote) {
        if ($lote['data_inicio']) {
            $dt_inicio = new DateTime($lote['data_inicio']);
            $data_inicio = $dt_inicio->format('Y-m-d\TH:i');
        }
        if ($lote['data_fim']) {
            $dt_fim = new DateTime($lote['data_fim']);
            $data_fim = $dt_fim->format('Y-m-d\TH:i');
        }
    } elseif ($proxima_data_inicio) {
        $data_inicio = $proxima_data_inicio;
    }
    
    $readonly_inicio = (!$eh_primeiro_lote && !$lote) ? 'readonly' : '';
    
    // Renderizar HTML do formulário
    ?>
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title><?php echo $titulo; ?> - Anysummit</title>
        <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
        <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-1.css">
        <style>
            .form-container {
                padding: 20px;
                max-width: 800px;
                margin: 0 auto;
            }

            .form-header {
                background: rgba(42, 42, 56, 0.8);
                border-radius: 16px;
                padding: 24px;
                margin-bottom: 30px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .form-title {
                color: #FFFFFF;
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
            }

            .form-subtitle {
                color: #B8B8C8;
                font-size: 16px;
            }

            .form-card {
                background: rgba(42, 42, 56, 0.8);
                border-radius: 16px;
                padding: 32px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }

            .form-group {
                margin-bottom: 24px;
            }

            .form-label {
                display: block;
                color: #E0E0E8;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 8px;
            }

            .form-input {
                width: 100%;
                padding: 12px 16px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: #FFFFFF;
                font-size: 16px;
                transition: all 0.3s ease;
                box-sizing: border-box;
            }

            .form-input:focus {
                outline: none;
                border-color: #00C2FF;
                background: rgba(0, 194, 255, 0.1);
                box-shadow: 0 0 0 3px rgba(0, 194, 255, 0.2);
            }

            .form-input:readonly {
                background: rgba(255, 255, 255, 0.02);
                border-color: rgba(255, 255, 255, 0.05);
                color: #888899;
                cursor: not-allowed;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }

            .switch-field {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px 0;
            }

            .switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
            }

            .switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #404058;
                transition: .4s;
                border-radius: 24px;
            }

            .slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
            }

            input:checked + .slider {
                background: linear-gradient(135deg, #00C2FF, #725EFF);
            }

            input:checked + .slider:before {
                transform: translateX(26px);
            }

            .form-help {
                font-size: 12px;
                color: #B8B8C8;
                margin-top: 4px;
                line-height: 1.4;
            }

            .form-actions {
                display: flex;
                gap: 16px;
                justify-content: flex-end;
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .btn {
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
                border: none;
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
                color: #FFFFFF;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .alert {
                padding: 16px;
                border-radius: 12px;
                margin-bottom: 24px;
                border: 1px solid;
                display: none;
            }

            .alert-info {
                background: rgba(0, 194, 255, 0.1);
                border-color: rgba(0, 194, 255, 0.3);
                color: #00C2FF;
            }

            .alert-warning {
                background: rgba(255, 193, 7, 0.1);
                border-color: rgba(255, 193, 7, 0.3);
                color: #FFC107;
            }

            .alert-error {
                background: rgba(255, 82, 82, 0.1);
                border-color: rgba(255, 82, 82, 0.3);
                color: #FF5252;
            }

            @media (max-width: 768px) {
                .form-container {
                    padding: 15px;
                }

                .form-row {
                    grid-template-columns: 1fr;
                    gap: 16px;
                }

                .form-actions {
                    flex-direction: column;
                }
            }
        </style>
    </head>
    <body>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>

        <div class="form-container">
            <div class="form-header">
                <h1 class="form-title"><?php echo $titulo; ?></h1>
                <p class="form-subtitle">
                    Evento: <strong><?php echo htmlspecialchars($evento['nome']); ?></strong>
                </p>
            </div>

            <div class="alert alert-info" id="alertInfo">
                <strong>ℹ️ Informação:</strong> <span id="alertInfoText"></span>
            </div>

            <div class="alert alert-warning" id="alertWarning">
                <strong>⚠️ Atenção:</strong> <span id="alertWarningText"></span>
            </div>

            <div class="alert alert-error" id="alertError">
                <strong>❌ Erro:</strong> <span id="alertErrorText"></span>
            </div>

            <form class="form-card" id="loteForm">
                <input type="hidden" name="evento_id" value="<?php echo $evento_id; ?>">
                <input type="hidden" name="lote_id" value="<?php echo $lote_id; ?>">
                <input type="hidden" name="action" value="save">

                <div class="form-group">
                    <label class="form-label" for="nome">Nome do Lote *</label>
                    <input type="text" 
                           id="nome" 
                           name="nome" 
                           class="form-input" 
                           value="<?php echo htmlspecialchars($nome); ?>" 
                           placeholder="Ex: Primeiro Lote, Promoção Natal, etc."
                           required>
                    <div class="form-help">
                        Escolha um nome descritivo para identificar este lote
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="data_inicio">Data e Hora de Início *</label>
                        <input type="datetime-local" 
                               id="data_inicio" 
                               name="data_inicio" 
                               class="form-input" 
                               value="<?php echo $data_inicio; ?>" 
                               <?php echo $readonly_inicio; ?>
                               required>
                        <?php if (!$eh_primeiro_lote && !$lote): ?>
                        <div class="form-help">
                            Data calculada automaticamente (1 minuto após o lote anterior)
                        </div>
                        <?php else: ?>
                        <div class="form-help">
                            Data e hora em que este lote estará disponível
                        </div>
                        <?php endif; ?>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="data_fim">Data e Hora de Fim *</label>
                        <input type="datetime-local" 
                               id="data_fim" 
                               name="data_fim" 
                               class="form-input" 
                               value="<?php echo $data_fim; ?>" 
                               required>
                        <div class="form-help">
                            Data e hora em que este lote expirará
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <div class="switch-field">
                        <label class="switch">
                            <input type="checkbox" 
                                   id="divulgar_criterio" 
                                   name="divulgar_criterio" 
                                   value="1" 
                                   <?php echo $divulgar_criterio ? 'checked' : ''; ?>>
                            <span class="slider"></span>
                        </label>
                        <label for="divulgar_criterio" class="form-label" style="margin: 0; cursor: pointer;">
                            Divulgar datas de virada de lote para os compradores
                        </label>
                    </div>
                    <div class="form-help">
                        Quando ativado, os compradores verão quando este lote termina e o próximo inicia
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="voltar()">
                        ← Voltar
                    </button>
                    <button type="submit" class="btn btn-primary">
                        💾 Salvar Lote
                    </button>
                </div>
            </form>
        </div>

        <script>
            // Validar datas
            function validarDatas() {
                const dataInicio = document.getElementById('data_inicio').value;
                const dataFim = document.getElementById('data_fim').value;
                
                if (!dataInicio || !dataFim) {
                    return { valid: false, message: 'Datas de início e fim são obrigatórias' };
                }
                
                const inicio = new Date(dataInicio);
                const fim = new Date(dataFim);
                
                if (fim <= inicio) {
                    return { valid: false, message: 'Data de fim deve ser posterior à data de início' };
                }
                
                return { valid: true };
            }

            // Mostrar alerta
            function showAlert(type, message) {
                // Esconder todos os alertas
                document.querySelectorAll('.alert').forEach(alert => {
                    alert.style.display = 'none';
                });
                
                // Mostrar o alerta específico
                const alert = document.getElementById('alert' + type.charAt(0).toUpperCase() + type.slice(1));
                const textElement = document.getElementById('alert' + type.charAt(0).toUpperCase() + type.slice(1) + 'Text');
                
                if (alert && textElement) {
                    textElement.textContent = message;
                    alert.style.display = 'block';
                    
                    // Scroll para o topo
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    
                    // Auto-esconder após alguns segundos
                    if (type === 'info') {
                        setTimeout(() => {
                            alert.style.display = 'none';
                        }, 5000);
                    }
                }
            }

            // Submeter formulário
            document.getElementById('loteForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Validar datas
                const validacao = validarDatas();
                if (!validacao.valid) {
                    showAlert('error', validacao.message);
                    return;
                }
                
                // Preparar dados
                const formData = new FormData(this);
                const data = {};
                
                for (let [key, value] of formData.entries()) {
                    data[key] = value;
                }
                
                // Ajustar checkbox
                data.divulgar_criterio = document.getElementById('divulgar_criterio').checked ? 1 : 0;
                
                // Enviar dados
                fetch('/produtor/ajax/lotes.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        showAlert('info', 'Lote salvo com sucesso! Redirecionando...');
                        setTimeout(() => {
                            window.location.href = '/produtor/lotes.php?evento_id=<?php echo $evento_id; ?>';
                        }, 2000);
                    } else {
                        showAlert('error', result.message || 'Erro ao salvar lote');
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                    showAlert('error', 'Erro de comunicação com o servidor');
                });
            });

            // Voltar
            function voltar() {
                window.location.href = '/produtor/lotes.php?evento_id=<?php echo $evento_id; ?>';
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
    <?php
    exit; // Importante para não processar mais nada
}

function handleSaveAction($input) {
    global $con, $usuario_id;
    
    $evento_id = intval($input['evento_id'] ?? 0);
    $lote_id = intval($input['lote_id'] ?? 0);
    $nome = trim($input['nome'] ?? '');
    $data_inicio = $input['data_inicio'] ?? '';
    $data_fim = $input['data_fim'] ?? '';
    $divulgar_criterio = intval($input['divulgar_criterio'] ?? 0);
    
    // Validações
    if (!$evento_id || !$nome || !$data_inicio || !$data_fim) {
        echo json_encode(['success' => false, 'message' => 'Todos os campos obrigatórios devem ser preenchidos']);
        return;
    }
    
    // Verificar se o evento pertence ao usuário
    $sql_evento = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt_evento = mysqli_prepare($con, $sql_evento);
    mysqli_stmt_bind_param($stmt_evento, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt_evento);
    $result_evento = mysqli_stmt_get_result($stmt_evento);
    
    if (mysqli_num_rows($result_evento) == 0) {
        echo json_encode(['success' => false, 'message' => 'Evento não encontrado']);
        return;
    }
    
    // Validar datas
    $dt_inicio = new DateTime($data_inicio);
    $dt_fim = new DateTime($data_fim);
    
    if ($dt_fim <= $dt_inicio) {
        echo json_encode(['success' => false, 'message' => 'Data de fim deve ser posterior à data de início']);
        return;
    }
    
    // Verificar intersecções de datas com outros lotes
    $sql_intersecao = "SELECT id, nome FROM lotes 
                       WHERE evento_id = ? 
                         AND id != ? 
                         AND (
                           (data_inicio <= ? AND data_fim >= ?) OR
                           (data_inicio <= ? AND data_fim >= ?) OR
                           (data_inicio >= ? AND data_fim <= ?)
                         )";
    $stmt_intersecao = mysqli_prepare($con, $sql_intersecao);
    mysqli_stmt_bind_param($stmt_intersecao, "iissssss", 
        $evento_id, $lote_id,
        $data_inicio, $data_inicio,
        $data_fim, $data_fim,
        $data_inicio, $data_fim
    );
    mysqli_stmt_execute($stmt_intersecao);
    $result_intersecao = mysqli_stmt_get_result($stmt_intersecao);
    
    if (mysqli_num_rows($result_intersecao) > 0) {
        $lote_conflito = mysqli_fetch_assoc($result_intersecao);
        echo json_encode([
            'success' => false, 
            'message' => 'As datas informadas se sobrepõem com o lote "' . $lote_conflito['nome'] . '"'
        ]);
        return;
    }
    
    // Salvar ou atualizar lote
    if ($lote_id) {
        // Atualizar lote existente
        $sql = "UPDATE lotes SET 
                nome = ?, 
                data_inicio = ?, 
                data_fim = ?, 
                divulgar_criterio = ?,
                atualizado_em = NOW()
                WHERE id = ? AND evento_id = ?";
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, "sssiii", $nome, $data_inicio, $data_fim, $divulgar_criterio, $lote_id, $evento_id);
    } else {
        // Criar novo lote - removido o campo 'tipo' da inserção
        $sql = "INSERT INTO lotes (evento_id, nome, data_inicio, data_fim, divulgar_criterio, criado_em, atualizado_em) 
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())";
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, "isssi", $evento_id, $nome, $data_inicio, $data_fim, $divulgar_criterio);
    }
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(['success' => true, 'message' => 'Lote salvo com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao salvar lote']);
    }
}

function handleDeleteAction($input) {
    global $con, $usuario_id;
    
    $lote_id = intval($input['lote_id'] ?? 0);
    
    if (!$lote_id) {
        echo json_encode(['success' => false, 'message' => 'ID do lote é obrigatório']);
        return;
    }
    
    // Verificar se o lote existe e pertence ao usuário
    $sql_verificar = "SELECT l.id, l.nome, e.usuario_id,
                             (SELECT COUNT(*) FROM ingressos i WHERE i.lote_id = l.id) as total_ingressos
                      FROM lotes l 
                      INNER JOIN eventos e ON l.evento_id = e.id 
                      WHERE l.id = ?";
    $stmt_verificar = mysqli_prepare($con, $sql_verificar);
    mysqli_stmt_bind_param($stmt_verificar, "i", $lote_id);
    mysqli_stmt_execute($stmt_verificar);
    $result_verificar = mysqli_stmt_get_result($stmt_verificar);
    $lote = mysqli_fetch_assoc($result_verificar);
    
    if (!$lote) {
        echo json_encode(['success' => false, 'message' => 'Lote não encontrado']);
        return;
    }
    
    if ($lote['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Acesso negado']);
        return;
    }
    
    // Verificar se há ingressos associados ao lote
    if ($lote['total_ingressos'] > 0) {
        echo json_encode([
            'success' => false, 
            'message' => 'Não é possível excluir lotes que possuem ingressos associados'
        ]);
        return;
    }
    
    // Excluir lote
    $sql_delete = "DELETE FROM lotes WHERE id = ?";
    $stmt_delete = mysqli_prepare($con, $sql_delete);
    mysqli_stmt_bind_param($stmt_delete, "i", $lote_id);
    
    if (mysqli_stmt_execute($stmt_delete)) {
        echo json_encode(['success' => true, 'message' => 'Lote excluído com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao excluir lote']);
    }
}

function handleToggleDivulgarAction($input) {
    global $con, $usuario_id;
    
    $lote_id = intval($input['lote_id'] ?? 0);
    $divulgar_criterio = intval($input['divulgar_criterio'] ?? 0);
    
    if (!$lote_id) {
        echo json_encode(['success' => false, 'message' => 'ID do lote é obrigatório']);
        return;
    }
    
    // Verificar se o lote existe e pertence ao usuário
    $sql_verificar = "SELECT l.id, e.usuario_id 
                      FROM lotes l 
                      INNER JOIN eventos e ON l.evento_id = e.id 
                      WHERE l.id = ?";
    $stmt_verificar = mysqli_prepare($con, $sql_verificar);
    mysqli_stmt_bind_param($stmt_verificar, "i", $lote_id);
    mysqli_stmt_execute($stmt_verificar);
    $result_verificar = mysqli_stmt_get_result($stmt_verificar);
    $lote = mysqli_fetch_assoc($result_verificar);
    
    if (!$lote) {
        echo json_encode(['success' => false, 'message' => 'Lote não encontrado']);
        return;
    }
    
    if ($lote['usuario_id'] != $usuario_id) {
        echo json_encode(['success' => false, 'message' => 'Acesso negado']);
        return;
    }
    
    // Atualizar divulgar_criterio
    $sql_update = "UPDATE lotes SET divulgar_criterio = ?, atualizado_em = NOW() WHERE id = ?";
    $stmt_update = mysqli_prepare($con, $sql_update);
    mysqli_stmt_bind_param($stmt_update, "ii", $divulgar_criterio, $lote_id);
    
    if (mysqli_stmt_execute($stmt_update)) {
        echo json_encode(['success' => true, 'message' => 'Configuração atualizada com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar configuração']);
    }
}
?>