<?php
// Página simples para testar se o PIX está funcionando
session_start();
include("conm/conn.php");

$slug = isset($_GET['evento']) ? $_GET['evento'] : 'goianarh';

echo "<h1>Teste da Página PIX</h1>";
echo "<p>Slug do evento: $slug</p>";

// Testar conexão com banco
try {
    $sql = "SELECT * FROM eventos WHERE slug = ? LIMIT 1";
    $stmt = $con->prepare($sql);
    $stmt->bind_param("s", $slug);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $evento = $result->fetch_assoc();
        echo "<p>✅ Evento encontrado: " . htmlspecialchars($evento['nome']) . "</p>";
        
        echo "<p><a href='pagamento-pix.php?evento=$slug' class='btn btn-primary'>Testar Página PIX</a></p>";
        
    } else {
        echo "<p>❌ Evento não encontrado para slug: $slug</p>";
        
        // Listar eventos disponíveis
        $eventos = $con->query("SELECT slug, nome FROM eventos WHERE status = 'publicado' LIMIT 5");
        echo "<h3>Eventos disponíveis:</h3>";
        while ($evt = $eventos->fetch_assoc()) {
            echo "<p><a href='?evento=" . $evt['slug'] . "'>" . htmlspecialchars($evt['nome']) . "</a></p>";
        }
    }
    
} catch (Exception $e) {
    echo "<p>❌ Erro: " . $e->getMessage() . "</p>";
}
?>

<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
</style>
