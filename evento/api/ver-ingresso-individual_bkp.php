<?php
include("../conm/conn.php");

// Verificar se o ingresso_id foi fornecido
$ingresso_id = isset($_GET['ingresso_id']) ? intval($_GET['ingresso_id']) : 0;

if (!$ingresso_id) {
    die('ID do ingresso não fornecido');
}

try {
    // Buscar dados completos do ingresso individual
    $sql = "SELECT 
        ii.*,
        e.nome as evento_nome, 
        e.data_inicio, 
        e.nome_local, 
        e.cidade, 
        e.estado,
        e.imagem_capa,
        e.busca_endereco,
        p.codigo_pedido, 
        p.comprador_nome,
        c.nome as comprador_nome_completo,
        c.email as comprador_email,
        cont.nome_fantasia as organizador_nome,
        cont.logomarca as organizador_logo
        FROM tb_ingressos_individuais ii
        LEFT JOIN eventos e ON ii.eventoid = e.id
        LEFT JOIN tb_pedidos p ON ii.pedidoid = p.pedidoid
        LEFT JOIN compradores c ON p.compradorid = c.id
        LEFT JOIN contratantes cont ON e.contratante_id = cont.id
        WHERE ii.id = ?";
    
    $stmt = $con->prepare($sql);
    $stmt->bind_param("i", $ingresso_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        die('Ingresso não encontrado');
    }
    
    $ingresso = $result->fetch_assoc();
    
    // ... [resto do arquivo] ...
    
} catch (Exception $e) {
    error_log('Erro ao exibir ingresso: ' . $e->getMessage());
    die('Erro interno do servidor');
}
?>