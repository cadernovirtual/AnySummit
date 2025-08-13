<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// CORS para desenvolvimento
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

include("../conm/conn.php");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Obter dados da requisição
$input = json_decode(file_get_contents('php://input'), true);
$codigo = isset($input['codigo']) ? trim($input['codigo']) : '';
$evento_id = isset($input['evento_id']) ? (int)$input['evento_id'] : 0;

// Validações básicas
if (empty($codigo)) {
    echo json_encode(['success' => false, 'message' => 'Código promocional não informado']);
    exit;
}

if ($evento_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Evento inválido']);
    exit;
}

// Normalizar código (maiúscula, sem acentos, espaços viram underscore)
function normalizarCodigo($codigo) {
    // Converter para maiúsculas
    $codigo = strtoupper($codigo);
    
    // Remover acentos
    $acentos = [
        'À' => 'A', 'Á' => 'A', 'Â' => 'A', 'Ã' => 'A', 'Ä' => 'A', 'Å' => 'A',
        'Æ' => 'AE', 'Ç' => 'C',
        'È' => 'E', 'É' => 'E', 'Ê' => 'E', 'Ë' => 'E',
        'Ì' => 'I', 'Í' => 'I', 'Î' => 'I', 'Ï' => 'I',
        'Ð' => 'D', 'Ñ' => 'N',
        'Ò' => 'O', 'Ó' => 'O', 'Ô' => 'O', 'Õ' => 'O', 'Ö' => 'O', 'Ø' => 'O',
        'Ù' => 'U', 'Ú' => 'U', 'Û' => 'U', 'Ü' => 'U',
        'Ý' => 'Y', 'Þ' => 'TH', 'ß' => 'SS'
    ];
    
    $codigo = strtr($codigo, $acentos);
    
    // Substituir espaços por underscore
    $codigo = str_replace(' ', '_', $codigo);
    
    // Remover caracteres especiais (manter apenas letras, números e underscore)
    $codigo = preg_replace('/[^A-Z0-9_]/', '', $codigo);
    
    return $codigo;
}

$codigo_normalizado = normalizarCodigo($codigo);

try {
    // Buscar cupom válido
    $sql = "SELECT c.*, 
                   c.id as cupom_id,
                   c.tipo_desconto,
                   c.percentual_desconto,
                   c.valor_desconto,
                   c.data_inicio,
                   c.data_fim,
                   c.limite_uso,
                   c.usado,
                   c.ativo,
                   c.uso_multiplo
            FROM cupons c 
            WHERE c.codigo = ? 
            AND c.evento_id = ? 
            AND c.ativo = 1";
    
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "si", $codigo_normalizado, $evento_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!$cupom = mysqli_fetch_assoc($result)) {
        echo json_encode([
            'success' => false, 
            'message' => 'Cupom não encontrado ou inválido para este evento'
        ]);
        exit;
    }
    
    // Verificar se cupom está dentro do período válido
    $agora = new DateTime();
    $data_inicio = new DateTime($cupom['data_inicio']);
    $data_fim = new DateTime($cupom['data_fim']);
    
    if ($agora < $data_inicio) {
        echo json_encode([
            'success' => false, 
            'message' => 'Este cupom ainda não está válido. Válido a partir de ' . 
                        $data_inicio->format('d/m/Y H:i')
        ]);
        exit;
    }
    
    if ($agora > $data_fim) {
        echo json_encode([
            'success' => false, 
            'message' => 'Este cupom expirou em ' . $data_fim->format('d/m/Y H:i')
        ]);
        exit;
    }
    
    // Verificar limite de uso se definido
    if (!empty($cupom['limite_uso']) && $cupom['usado'] >= $cupom['limite_uso']) {
        echo json_encode([
            'success' => false, 
            'message' => 'Este cupom atingiu o limite máximo de uso'
        ]);
        exit;
    }
    
    // Determinar valor do desconto
    $tipo_desconto = $cupom['tipo_desconto'];
    $valor_desconto = 0;
    $descricao_desconto = '';
    
    if ($tipo_desconto === 'percentual') {
        $percentual = (float)$cupom['percentual_desconto'];
        $descricao_desconto = "Desconto de {$percentual}%";
        $valor_desconto = $percentual;
    } else if ($tipo_desconto === 'valor') {
        $valor = (float)$cupom['valor_desconto'];
        $descricao_desconto = "Desconto de R$ " . number_format($valor, 2, ',', '.');
        $valor_desconto = $valor;
    }
    
    // Retornar sucesso
    echo json_encode([
        'success' => true,
        'message' => $descricao_desconto,
        'cupom' => [
            'id' => $cupom['cupom_id'],
            'codigo' => $cupom['codigo'],
            'tipo_desconto' => $tipo_desconto,
            'valor_desconto' => $valor_desconto,
            'descricao' => $descricao_desconto,
            'uso_multiplo' => (bool)$cupom['uso_multiplo']
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Erro na validação de cupom: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Erro interno do servidor. Tente novamente.'
    ]);
}
?>
