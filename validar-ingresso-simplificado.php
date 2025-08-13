<?php
session_start();
include("evento/conm/conn.php");

$hash_validacao = isset($_GET['h']) ? trim($_GET['h']) : '';

if (empty($hash_validacao) || strlen($hash_validacao) < 32) {
    $erro = "Link inválido.";
    include('pagina-erro.php');
    exit;
}

try {
    $sql_ingresso = "SELECT 
        ii.*,
        e.nome as evento_nome, 
        e.data_inicio, 
        e.nome_local, 
        e.cidade, 
        e.estado,
        e.imagem_capa,
        p.codigo_pedido, 
        p.data_pedido,
        c.nome as comprador_nome_completo
        FROM tb_ingressos_individuais ii
        LEFT JOIN eventos e ON ii.eventoid = e.id
        LEFT JOIN tb_pedidos p ON ii.pedidoid = p.pedidoid
        LEFT JOIN compradores c ON p.compradorid = c.id
        WHERE ii.hash_validacao = ? LIMIT 1";
    
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
        $erro = "Ingresso não encontrado.";
        include('pagina-erro.php');
        exit;
    }
    
    $ingresso = $result->fetch_assoc();
    
    $data_evento = $ingresso['data_inicio'] ? date('d/m/Y H:i', strtotime($ingresso['data_inicio'])) : '';
    $data_pedido = date('d/m/Y H:i', strtotime($ingresso['data_pedido']));
    
} catch (Exception $e) {
    error_log("Erro ao carregar ingresso: " . $e->getMessage());
    $erro = "Erro interno do servidor.";
    include('pagina-erro.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ingresso - <?php echo htmlspecialchars($ingresso['evento_nome']); ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background: #f8f9fa; padding: 20px; }
        .card { border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 2rem; text-align: center; border-radius: 15px 15px 0 0; }
        .codigo-ingresso { font-family: monospace; font-size: 1.5rem; font-weight: bold; color: #007bff; background: #f8f9fa; padding: 1rem; border-radius: 10px; text-align: center; margin: 1rem 0; border: 2px solid #007bff; }
    </style>
</head>
<body>
    <div class="container" style="max-width: 800px;">
        <div class="card">
            <div class="header">
                <h1><?php echo htmlspecialchars($ingresso['evento_nome']); ?></h1>
                <p><i class="fas fa-calendar"></i> <?php echo $data_evento; ?></p>
                <p><i class="fas fa-map-marker-alt"></i> <?php echo htmlspecialchars($ingresso['nome_local'] . ', ' . $ingresso['cidade'] . ' - ' . $ingresso['estado']); ?></p>
            </div>
            
            <div class="card-body p-4">
                <h3><?php echo htmlspecialchars($ingresso['titulo_ingresso']); ?></h3>
                
                <div class="codigo-ingresso">
                    <?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?>
                </div>
                
                <?php if ($ingresso['participante_nome']): ?>
                    <div class="alert alert-success">
                        <h5>Ingresso Vinculado!</h5>
                        <p><strong>Participante:</strong> <?php echo htmlspecialchars($ingresso['participante_nome']); ?></p>
                        <?php if ($ingresso['participante_email']): ?>
                            <p><strong>E-mail:</strong> <?php echo htmlspecialchars($ingresso['participante_email']); ?></p>
                        <?php endif; ?>
                    </div>
                <?php else: ?>
                    <div class="alert alert-warning">
                        <h5>Ingresso Disponível</h5>
                        <p>Este ingresso precisa ser vinculado a um participante.</p>
                        <button class="btn btn-primary">Vincular Participante</button>
                    </div>
                <?php endif; ?>
                
                <div class="mt-4 pt-4 border-top">
                    <div class="row">
                        <div class="col-md-6">
                            <small><strong>Pedido:</strong> <?php echo htmlspecialchars($ingresso['codigo_pedido']); ?></small>
                        </div>
                        <div class="col-md-6">
                            <small><strong>Comprado em:</strong> <?php echo $data_pedido; ?></small>
                        </div>
                    </div>
                    <div class="mt-2">
                        <small><strong>Comprador:</strong> <?php echo htmlspecialchars($ingresso['comprador_nome_completo']); ?></small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
