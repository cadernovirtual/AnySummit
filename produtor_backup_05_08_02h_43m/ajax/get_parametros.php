<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// Incluir conexão com banco
require_once('../conm/conn.php');

// Verificar se usuário está logado
if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado']);
    exit;
}

// Verificar parâmetro
$tipo = isset($_GET['tipo']) ? $_GET['tipo'] : '';

if (!in_array($tipo, ['termos', 'politicas'])) {
    echo json_encode(['success' => false, 'message' => 'Tipo inválido']);
    exit;
}

try {
    // Buscar conteúdo da tabela parametros
    $campo = ($tipo === 'termos') ? 'termos_anysummit' : 'politicas_anysummit';
    
    $sql = "SELECT $campo FROM parametros WHERE id = 1";
    $result = mysqli_query($conn, $sql);
    
    if ($result && mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        $content = $row[$campo];
        
        // Se não houver conteúdo específico, usar o padrão
        if (empty($content)) {
            $campo_default = ($tipo === 'termos') ? 'termos_eventos_default' : 'politicas_eventos_default';
            $sql_default = "SELECT $campo_default FROM parametros WHERE id = 1";
            $result_default = mysqli_query($conn, $sql_default);
            
            if ($result_default && mysqli_num_rows($result_default) > 0) {
                $row_default = mysqli_fetch_assoc($result_default);
                $content = $row_default[$campo_default];
            }
        }
        
        echo json_encode([
            'success' => true,
            'content' => $content
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Conteúdo não encontrado'
        ]);
    }
    
} catch (Exception $e) {
    error_log("Erro ao buscar $tipo: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar conteúdo'
    ]);
}

mysqli_close($conn);
?>