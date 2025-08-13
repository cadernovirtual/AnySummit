<?php
session_start();
include("evento/conm/conn.php");

// Verificar se o hash foi fornecido
$hash_validacao = isset($_GET['h']) ? trim($_GET['h']) : '';

if (empty($hash_validacao)) {
    echo "Hash não fornecido";
    exit;
}

echo "Hash recebido: " . htmlspecialchars($hash_validacao) . "<br>";

try {
    // Buscar o ingresso pelo hash de validação - query simplificada
    $sql_ingresso = "SELECT 
        ii.id,
        ii.codigo_ingresso,
        ii.participante_nome,
        e.nome as evento_nome
        FROM tb_ingressos_individuais ii
        LEFT JOIN eventos e ON ii.eventoid = e.id
        WHERE ii.hash_validacao = ? 
        AND ii.hash_validacao IS NOT NULL 
        AND ii.hash_validacao != ''
        LIMIT 1";
    
    $stmt = $con->prepare($sql_ingresso);
    if (!$stmt) {
        throw new Exception("Erro ao preparar consulta: " . $con->error);
    }
    
    $stmt->bind_param("s", $hash_validacao);
    if (!$stmt->execute()) {
        throw new Exception("Erro ao executar consulta: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo "Ingresso não encontrado.";
        exit;
    }
    
    $ingresso = $result->fetch_assoc();
    
    echo "Ingresso encontrado!<br>";
    echo "ID: " . $ingresso['id'] . "<br>";
    echo "Código: " . $ingresso['codigo_ingresso'] . "<br>";
    echo "Evento: " . htmlspecialchars($ingresso['evento_nome']) . "<br>";
    echo "Participante: " . htmlspecialchars($ingresso['participante_nome'] ?: 'Não vinculado') . "<br>";
    
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage();
}
?>
