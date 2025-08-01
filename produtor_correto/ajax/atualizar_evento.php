<?php
// Garantir que não haja saída antes do JSON
ob_start();

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0); // Não mostrar erros no output para não quebrar JSON

// Verificação de login específica para AJAX
session_start();

function verificarLoginCookie() {
    if (isset($_COOKIE['usuario_logado']) && $_COOKIE['usuario_logado'] == '1') {
        $_SESSION['usuario_logado'] = true;
        $_SESSION['usuarioid'] = $_COOKIE['usuarioid'] ?? '';
        $_SESSION['usuario_nome'] = $_COOKIE['usuario_nome'] ?? '';
        $_SESSION['usuario_email'] = $_COOKIE['usuario_email'] ?? '';
        $_SESSION['contratanteid'] = $_COOKIE['contratanteid'] ?? '';
        return true;
    }
    return false;
}

if (!isset($_SESSION['usuario_logado']) || $_SESSION['usuario_logado'] !== true) {
    if (!verificarLoginCookie()) {
        ob_clean();
        echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
        exit();
    }
}

include("../conm/conn.php");

// Usar a variável de conexão correta
$conn = $con;

// Verificar se é uma requisição POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit();
}

// Receber dados JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
    exit();
}

$evento_id = intval($data['evento_id']);
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

// Verificar se o evento pertence ao usuário logado
$sql_check = "SELECT id FROM eventos WHERE id = ? AND usuario_id = ?";
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("ii", $evento_id, $usuario_id);
$stmt_check->execute();
$result_check = $stmt_check->get_result();

if ($result_check->num_rows == 0) {
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Evento não encontrado ou acesso negado']);
    exit();
}

try {
    // Atualizar evento
    $sql_evento = "UPDATE eventos SET 
                   nome = ?, 
                   categoria_id = ?, 
                   classificacao = ?, 
                   descricao = ?, 
                   data_inicio = ?, 
                   data_fim = ?, 
                   tipo_local = ?, 
                   link_online = ?, 
                   busca_endereco = ?, 
                   nome_local = ?, 
                   cep = ?, 
                   rua = ?, 
                   numero = ?, 
                   complemento = ?, 
                   bairro = ?, 
                   cidade = ?, 
                   estado = ?, 
                   produtor_selecionado = ?, 
                   nome_produtor = ?, 
                   nome_exibicao_produtor = ?, 
                   descricao_produtor = ?, 
                   visibilidade = ?, 
                   atualizado_em = NOW() 
                   WHERE id = ? AND usuario_id = ?";
    
    $stmt_evento = $conn->prepare($sql_evento);
    
    // Preparar dados do evento
    $nome = trim($data['nome']);
    $categoria_id = intval($data['categoria_id']);
    $classificacao = $data['classificacao'];
    $descricao = $data['descricao'];
    $data_inicio = $data['data_inicio'];
    $data_fim = !empty($data['data_fim']) ? $data['data_fim'] : null;
    $tipo_local = $data['tipo_local'];
    $link_online = $data['link_online'];
    $busca_endereco = $data['busca_endereco'];
    $nome_local = $data['nome_local'];
    $cep = $data['cep'];
    $rua = $data['rua'];
    $numero = $data['numero'];
    $complemento = $data['complemento'];
    $bairro = $data['bairro'];
    $cidade = $data['cidade'];
    $estado = $data['estado'];
    $produtor_selecionado = $data['produtor_selecionado'];
    $nome_produtor = $data['nome_produtor'];
    $nome_exibicao_produtor = $data['nome_exibicao_produtor'];
    $descricao_produtor = $data['descricao_produtor'];
    $visibilidade = $data['visibilidade'];
    
    $stmt_evento->bind_param("sissssssssssssssssssssii", 
        $nome, $categoria_id, $classificacao, $descricao, $data_inicio, $data_fim, 
        $tipo_local, $link_online, $busca_endereco, $nome_local, $cep, $rua, 
        $numero, $complemento, $bairro, $cidade, $estado, $produtor_selecionado, 
        $nome_produtor, $nome_exibicao_produtor, $descricao_produtor, $visibilidade, 
        $evento_id, $usuario_id
    );
    
    if (!$stmt_evento->execute()) {
        throw new Exception('Erro ao atualizar evento: ' . $stmt_evento->error);
    }
    
    ob_clean();
    echo json_encode([
        'success' => true, 
        'message' => 'Evento atualizado com sucesso',
        'evento_id' => $evento_id
    ]);
    
} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>
