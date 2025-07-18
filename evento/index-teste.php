<?php
// Versão mínima para testar - index-teste.php
include("conm/conn.php");

$slug = 'congresso-2025';

// Buscar evento
$sql_evento = "SELECT * FROM eventos WHERE slug = '$slug' LIMIT 1";
$result_evento = $con->query($sql_evento);

if ($result_evento->num_rows == 0) {
    echo "<h1>Evento não encontrado</h1>";
    exit;
}

$evento = $result_evento->fetch_assoc();

// Buscar ingressos
$sql_ingressos = "SELECT * FROM ingressos WHERE evento_id = " . $evento['id'];
$result_ingressos = $con->query($sql_ingressos);

$ingressos = [];
while ($row = $result_ingressos->fetch_assoc()) {
    $ingressos[] = $row;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $evento['nome']; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1><?php echo $evento['nome']; ?></h1>
        <p><?php echo $evento['descricao']; ?></p>
        
        <h2>Ingressos (<?php echo count($ingressos); ?>)</h2>
        
        <?php if (empty($ingressos)): ?>
            <p>Nenhum ingresso encontrado</p>
        <?php else: ?>
            <?php foreach ($ingressos as $ingresso): ?>
                <div class="card mb-2">
                    <div class="card-body">
                        <h5><?php echo $ingresso['titulo']; ?></h5>
                        <p>R$ <?php echo number_format($ingresso['preco'], 2, ',', '.'); ?></p>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
    
    <script>
        console.log('Ingressos:', <?php echo json_encode($ingressos); ?>);
    </script>
</body>
</html>
