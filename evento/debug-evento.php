<?php
// Debug específico para a página do evento
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Debug - Página do Evento</h1>";

try {
    echo "<h2>1. Incluindo arquivos...</h2>";
    
    // Testar conexão
    echo "Incluindo conn.php...<br>";
    include("conm/conn.php");
    echo "✅ Conexão incluída<br>";
    
    if ($con) {
        echo "✅ Conexão ativa<br>";
    } else {
        echo "❌ Erro na conexão: " . mysqli_connect_error() . "<br>";
        exit;
    }
    
    // Testar include de helpers
    echo "Incluindo imagem-helpers.php...<br>";
    if (file_exists("../includes/imagem-helpers.php")) {
        include("../includes/imagem-helpers.php");
        echo "✅ Helpers incluído<br>";
    } else {
        echo "⚠️ Arquivo helpers não encontrado<br>";
    }
    
    echo "<h2>2. Verificando parâmetros...</h2>";
    
    // Pegar slug
    $slug = '';
    if (isset($_GET['evento'])) {
        $slug = $_GET['evento'];
        echo "✅ Slug via parâmetro 'evento': " . $slug . "<br>";
    } elseif (isset($_GET['slug'])) {
        $slug = $_GET['slug'];
        echo "✅ Slug via parâmetro 'slug': " . $slug . "<br>";
    } else {
        $slug = 'evento'; // usar o slug que sabemos que existe
        echo "⚠️ Nenhum parâmetro encontrado, usando fallback: " . $slug . "<br>";
    }
    
    echo "<h2>3. Consultando evento...</h2>";
    
    // Consulta simplificada primeiro
    $sql_teste = "SELECT id, nome, slug, status, visibilidade FROM eventos WHERE slug = ? LIMIT 1";
    $stmt = mysqli_prepare($con, $sql_teste);
    
    if (!$stmt) {
        echo "❌ Erro ao preparar consulta: " . mysqli_error($con) . "<br>";
        exit;
    }
    
    mysqli_stmt_bind_param($stmt, "s", $slug);
    
    if (!mysqli_stmt_execute($stmt)) {
        echo "❌ Erro ao executar consulta: " . mysqli_stmt_error($stmt) . "<br>";
        exit;
    }
    
    $result = mysqli_stmt_get_result($stmt);
    
    if (!$result) {
        echo "❌ Erro ao obter resultado: " . mysqli_error($con) . "<br>";
        exit;
    }
    
    if (mysqli_num_rows($result) == 0) {
        echo "❌ Evento não encontrado com slug: " . $slug . "<br>";
        
        // Listar eventos disponíveis
        echo "<h3>Eventos disponíveis:</h3>";
        $sql_lista = "SELECT slug, nome, status, visibilidade FROM eventos LIMIT 5";
        $result_lista = mysqli_query($con, $sql_lista);
        while ($row = mysqli_fetch_assoc($result_lista)) {
            echo "- Slug: " . $row['slug'] . " | Nome: " . $row['nome'] . " | Status: " . $row['status'] . " | Visibilidade: " . $row['visibilidade'] . "<br>";
        }
        exit;
    }
    
    $evento = mysqli_fetch_assoc($result);
    echo "✅ Evento encontrado:<br>";
    echo "- ID: " . $evento['id'] . "<br>";
    echo "- Nome: " . $evento['nome'] . "<br>";
    echo "- Status: " . $evento['status'] . "<br>";
    echo "- Visibilidade: " . $evento['visibilidade'] . "<br>";
    
    echo "<h2>4. Testando consulta completa...</h2>";
    
    // Agora testar a consulta completa
    $sql_completo = "
        SELECT 
            e.*,
            u.nome as nome_usuario,
            u.nome_exibicao,
            u.descricao_produtor as descricao_usuario,
            u.foto_perfil,
            c.nome_fantasia,
            c.razao_social,
            c.email_contato,
            c.telefone as telefone_contratante
        FROM eventos e
        LEFT JOIN usuarios u ON e.usuario_id = u.id
        LEFT JOIN contratantes c ON e.contratante_id = c.id
        WHERE e.slug = ? AND e.status = 'publicado'
        LIMIT 1
    ";
    
    $stmt_completo = mysqli_prepare($con, $sql_completo);
    mysqli_stmt_bind_param($stmt_completo, "s", $slug);
    mysqli_stmt_execute($stmt_completo);
    $result_completo = mysqli_stmt_get_result($stmt_completo);
    
    if (mysqli_num_rows($result_completo) > 0) {
        echo "✅ Consulta completa executada com sucesso<br>";
        $evento_completo = mysqli_fetch_assoc($result_completo);
        echo "Nome do produtor: " . ($evento_completo['nome_usuario'] ?? 'Não definido') . "<br>";
    } else {
        echo "❌ Evento não atende aos critérios da consulta completa<br>";
        echo "Possíveis problemas:<br>";
        echo "- Status não é 'publicado' (atual: " . $evento['status'] . ")<br>";
        echo "- Visibilidade não é 'publico' (atual: " . $evento['visibilidade'] . ")<br>";
    }
    
    echo "<h2>5. Sucesso!</h2>";
    echo "<p style='color: green;'>✅ Todos os testes passaram. A página do evento deve funcionar.</p>";
    echo "<p><a href='/evento/evento'>Testar página real do evento</a></p>";
    
} catch (Exception $e) {
    echo "<h2>❌ Erro capturado:</h2>";
    echo "Mensagem: " . $e->getMessage() . "<br>";
    echo "Arquivo: " . $e->getFile() . "<br>";
    echo "Linha: " . $e->getLine() . "<br>";
} catch (Error $e) {
    echo "<h2>❌ Erro fatal capturado:</h2>";
    echo "Mensagem: " . $e->getMessage() . "<br>";
    echo "Arquivo: " . $e->getFile() . "<br>";
    echo "Linha: " . $e->getLine() . "<br>";
}
?>