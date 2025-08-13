<?php
session_start();
require_once('../conm/conn.php');

// Verificar se o usuario esta logado
$usuario_id = $_COOKIE['usuarioid'] ?? 0;
if (!$usuario_id) {
    echo json_encode(['success' => false, 'message' => 'Usuario nao autenticado']);
    exit;
}

// Receber parametros
$action = isset($_GET['action']) ? $_GET['action'] : '';
$evento_id = isset($_GET['evento_id']) ? intval($_GET['evento_id']) : 0;

if ($action == 'form') {
    if ($evento_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID do evento invalido']);
        exit;
    }
    
    // Verificar se o evento pertence ao usuario
    $sql = "SELECT nome FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $evento = mysqli_fetch_assoc($result);
    
    if (!$evento) {
        echo json_encode(['success' => false, 'message' => 'Evento nao encontrado']);
        exit;
    }
    
    // Renderizar formulario
    ?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novo Lote - <?php echo htmlspecialchars($evento['nome']); ?></title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: #1a1a2e; 
            color: white; 
            margin: 0;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: rgba(42, 42, 56, 0.9);
            padding: 30px;
            border-radius: 10px;
        }
        h1 { 
            color: #00C2FF; 
            text-align: center;
            margin-bottom: 30px;
        }
        .form-group { 
            margin-bottom: 20px; 
        }
        .form-label { 
            display: block; 
            margin-bottom: 8px; 
            font-weight: bold;
            color: #E0E0E8;
        }
        .form-input { 
            width: 100%; 
            padding: 12px; 
            border-radius: 8px; 
            border: 1px solid #555; 
            background: rgba(255,255,255,0.1);
            color: white;
            box-sizing: border-box;
        }
        .form-input:focus {
            outline: none;
            border-color: #00C2FF;
        }
        .btn { 
            padding: 12px 24px; 
            background: #00C2FF; 
            color: white; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            margin-right: 10px;
            font-size: 16px;
        }
        .btn:hover { 
            background: #0099cc; 
        }
        .btn-secondary {
            background: #666;
        }
        .btn-secondary:hover {
            background: #777;
        }
        .form-actions {
            text-align: center;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Novo Lote</h1>
        <p><strong>Evento:</strong> <?php echo htmlspecialchars($evento['nome']); ?></p>
        
        <form id="loteForm">
            <input type="hidden" name="evento_id" value="<?php echo $evento_id; ?>">
            <input type="hidden" name="action" value="save">
            
            <div class="form-group">
                <label class="form-label">Nome do Lote:</label>
                <input type="text" name="nome" class="form-input" placeholder="Ex: Primeiro Lote, Promocao..." required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Data e Hora de Inicio:</label>
                <input type="datetime-local" name="data_inicio" class="form-input" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Data e Hora de Fim:</label>
                <input type="datetime-local" name="data_fim" class="form-input" required>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="window.history.back()">Voltar</button>
                <button type="submit" class="btn">Salvar Lote</button>
            </div>
        </form>
    </div>
    
    <script>
        document.getElementById('loteForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar datas
            const dataInicio = new Date(document.querySelector('[name="data_inicio"]').value);
            const dataFim = new Date(document.querySelector('[name="data_fim"]').value);
            
            if (dataFim <= dataInicio) {
                alert('A data de fim deve ser posterior a data de inicio');
                return;
            }
            
            // Preparar dados
            const formData = new FormData(this);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            // Enviar via AJAX
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
                    alert('Lote salvo com sucesso!');
                    window.location.href = '/produtor/lotes.php?evento_id=' + <?php echo $evento_id; ?>;
                } else {
                    alert('Erro: ' + result.message);
                }
            })
            .catch(error => {
                alert('Erro de comunicacao: ' + error);
            });
        });
    </script>
</body>
</html>
    <?php
    exit;
}

// Para outras acoes (POST)
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$action = $input['action'] ?? '';

if ($action == 'save') {
    $evento_id = intval($input['evento_id'] ?? 0);
    $nome = trim($input['nome'] ?? '');
    $data_inicio = $input['data_inicio'] ?? '';
    $data_fim = $input['data_fim'] ?? '';
    
    if (!$evento_id || !$nome || !$data_inicio || !$data_fim) {
        echo json_encode(['success' => false, 'message' => 'Todos os campos sao obrigatorios']);
        exit;
    }
    
    // Verificar se o evento pertence ao usuario
    $sql = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $evento_id, $usuario_id);
    mysqli_stmt_execute($stmt);
    
    if (mysqli_stmt_get_result($stmt)->num_rows == 0) {
        echo json_encode(['success' => false, 'message' => 'Evento nao encontrado']);
        exit;
    }
    
    // Inserir lote
    $sql = "INSERT INTO lotes (evento_id, nome, data_inicio, data_fim, criado_em) VALUES (?, ?, ?, ?, NOW())";
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "isss", $evento_id, $nome, $data_inicio, $data_fim);
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(['success' => true, 'message' => 'Lote criado com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao criar lote']);
    }
    
} else {
    echo json_encode(['success' => false, 'message' => 'Acao nao reconhecida']);
}
?>
