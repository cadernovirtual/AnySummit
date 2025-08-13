<?php
// Teste básico para checkout.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "=== TESTE DE CHECKOUT ===<br>";

// Teste 1: Session
session_start();
echo "✅ Session iniciada<br>";

// Teste 2: Conexão
echo "🔄 Testando conexão...<br>";
try {
    include("conm/conn.php");
    echo "✅ Arquivo conn.php incluído<br>";
    
    if (isset($con) && $con) {
        echo "✅ Conexão BD OK<br>";
    } else {
        echo "❌ Conexão BD falhou<br>";
    }
} catch (Exception $e) {
    echo "❌ Erro na conexão: " . $e->getMessage() . "<br>";
}

// Teste 3: Imagem helpers
echo "🔄 Testando imagem helpers...<br>";
try {
    include("../includes/imagem-helpers.php");
    echo "✅ Arquivo imagem-helpers.php incluído<br>";
} catch (Exception $e) {
    echo "❌ Erro imagem helpers: " . $e->getMessage() . "<br>";
}

// Teste 4: Parâmetros URL
echo "🔄 Testando parâmetros...<br>";
$slug = isset($_GET['evento']) ? $_GET['evento'] : '';
echo "Slug recebido: '" . $slug . "'<br>";

if (empty($slug)) {
    echo "❌ Slug vazio - redirecionaria para /<br>";
} else {
    echo "✅ Slug válido<br>";
    
    // Teste 5: Query do evento
    if (isset($con) && $con) {
        echo "🔄 Testando query evento...<br>";
        $sql_evento = "
            SELECT 
                e.*,
                u.nome as nome_usuario,
                u.nome_exibicao,
                c.nome_fantasia,
                c.razao_social
            FROM eventos e
            LEFT JOIN usuarios u ON e.usuario_id = u.id
            LEFT JOIN contratantes c ON e.contratante_id = c.id
            WHERE e.slug = '$slug' AND e.status = 'publicado' AND e.visibilidade = 'publico'
            LIMIT 1
        ";

        $result_evento = $con->query($sql_evento);
        
        if ($result_evento === false) {
            echo "❌ Erro na query: " . $con->error . "<br>";
        } else if ($result_evento->num_rows == 0) {
            echo "❌ Evento não encontrado com slug '$slug'<br>";
            
            // Listar eventos disponíveis
            $sql_list = "SELECT slug, nome, status, visibilidade FROM eventos LIMIT 5";
            $result_list = $con->query($sql_list);
            if ($result_list) {
                echo "<strong>Eventos disponíveis:</strong><br>";
                while ($row = $result_list->fetch_assoc()) {
                    echo "- Slug: '{$row['slug']}', Nome: '{$row['nome']}', Status: '{$row['status']}', Visibilidade: '{$row['visibilidade']}'<br>";
                }
            }
        } else {
            echo "✅ Evento encontrado<br>";
            $evento = $result_evento->fetch_assoc();
            echo "Nome do evento: " . $evento['nome'] . "<br>";
        }
    }
}

echo "<br>=== FIM DO TESTE ===<br>";
echo "<br><a href='checkout.php?evento=" . urlencode($slug) . "'>Voltar para checkout original</a>";
?>
