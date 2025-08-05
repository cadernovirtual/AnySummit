<?php
// Teste específico para replicar o erro 500 da página do evento
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<!-- DEBUG: Iniciando teste da página do evento -->\n";
echo "<h1>Teste Detalhado - Página do Evento</h1>";

try {
    echo "<h2>Passo 1: Conexão com o banco</h2>";
    include("conm/conn.php");
    
    if (!$con) {
        throw new Exception("Falha na conexão: " . mysqli_connect_error());
    }
    echo "✅ Conexão estabelecida<br>";
    
    echo "<h2>Passo 2: Include de helpers</h2>";
    if (file_exists("../includes/imagem-helpers.php")) {
        include("../includes/imagem-helpers.php");
        echo "✅ Helpers incluído<br>";
    } else {
        echo "⚠️ Helpers não encontrado, continuando...<br>";
    }
    
    echo "<h2>Passo 3: Definindo slug</h2>";
    $slug = '';
    if (isset($_GET['evento'])) {
        $slug = $_GET['evento'];
    } elseif (isset($_GET['slug'])) {
        $slug = $_GET['slug'];
    } else {
        $slug = 'evento'; // usar diretamente o slug que sabemos
    }
    echo "Slug definido: " . htmlspecialchars($slug) . "<br>";
    
    echo "<h2>Passo 4: Preparando consulta do evento</h2>";
    $sql_evento = "
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
        WHERE e.slug = ? AND e.status = 'publicado' AND (e.visibilidade = 'publico' OR e.visibilidade = '' OR e.visibilidade IS NULL)
        LIMIT 1
    ";
    
    echo "✅ SQL preparado<br>";
    
    echo "<h2>Passo 5: Executando consulta</h2>";
    $stmt_evento = mysqli_prepare($con, $sql_evento);
    if (!$stmt_evento) {
        throw new Exception("Erro ao preparar statement: " . mysqli_error($con));
    }
    echo "✅ Statement preparado<br>";
    
    mysqli_stmt_bind_param($stmt_evento, "s", $slug);
    echo "✅ Parâmetro vinculado<br>";
    
    if (!mysqli_stmt_execute($stmt_evento)) {
        throw new Exception("Erro ao executar statement: " . mysqli_stmt_error($stmt_evento));
    }
    echo "✅ Statement executado<br>";
    
    $result_evento = mysqli_stmt_get_result($stmt_evento);
    if (!$result_evento) {
        throw new Exception("Erro ao obter resultado: " . mysqli_error($con));
    }
    echo "✅ Resultado obtido<br>";
    
    if (mysqli_num_rows($result_evento) == 0) {
        echo "<h3>❌ Evento não encontrado</h3>";
        echo "Slug procurado: " . htmlspecialchars($slug) . "<br>";
        
        // Listar eventos disponíveis para debug
        $debug_sql = "SELECT slug, nome, status, visibilidade FROM eventos WHERE status = 'publicado' LIMIT 5";
        $debug_result = mysqli_query($con, $debug_sql);
        echo "<h4>Eventos publicados disponíveis:</h4>";
        while ($row = mysqli_fetch_assoc($debug_result)) {
            echo "- " . $row['slug'] . " (" . $row['nome'] . ") - Status: " . $row['status'] . " - Vis: " . $row['visibilidade'] . "<br>";
        }
        exit;
    }
    
    $evento = mysqli_fetch_assoc($result_evento);
    echo "✅ Evento encontrado: " . $evento['nome'] . "<br>";
    
    echo "<h2>Passo 6: Consultando ingressos</h2>";
    $sql_ingressos = "
        SELECT *
        FROM ingressos 
        WHERE evento_id = ?
        AND ativo = 1 
        AND disponibilidade = 'publico'
        AND (inicio_venda IS NULL OR inicio_venda <= NOW())
        AND (fim_venda IS NULL OR fim_venda >= NOW())
        ORDER BY posicao_ordem ASC, preco ASC
    ";
    
    $stmt_ingressos = mysqli_prepare($con, $sql_ingressos);
    if (!$stmt_ingressos) {
        throw new Exception("Erro ao preparar consulta de ingressos: " . mysqli_error($con));
    }
    
    mysqli_stmt_bind_param($stmt_ingressos, "i", $evento['id']);
    
    if (!mysqli_stmt_execute($stmt_ingressos)) {
        throw new Exception("Erro ao executar consulta de ingressos: " . mysqli_stmt_error($stmt_ingressos));
    }
    
    $result_ingressos = mysqli_stmt_get_result($stmt_ingressos);
    if (!$result_ingressos) {
        throw new Exception("Erro ao obter resultado dos ingressos: " . mysqli_error($con));
    }
    
    $ingressos = [];
    while ($row = mysqli_fetch_assoc($result_ingressos)) {
        $ingressos[] = $row;
    }
    
    echo "✅ " . count($ingressos) . " ingressos encontrados<br>";
    
    echo "<h2>✅ SUCESSO! Todos os passos executados sem erro</h2>";
    echo "<p>Os dados foram carregados corretamente. O problema não está na lógica principal.</p>";
    
    echo "<h3>Dados do evento:</h3>";
    echo "<pre>";
    print_r([
        'id' => $evento['id'],
        'nome' => $evento['nome'],
        'slug' => $evento['slug'],
        'status' => $evento['status'],
        'visibilidade' => $evento['visibilidade'],
        'usuario_id' => $evento['usuario_id']
    ]);
    echo "</pre>";
    
    echo "<h3>Ingressos encontrados:</h3>";
    echo "<ul>";
    foreach ($ingressos as $ingresso) {
        echo "<li>" . $ingresso['titulo'] . " - " . $ingresso['tipo'] . "</li>";
    }
    echo "</ul>";
    
    echo "<hr>";
    echo "<p><strong>CONCLUSÃO:</strong> A lógica está funcionando. O erro 500 deve estar em outra parte do arquivo index.php</p>";
    echo "<p>Próximo passo: verificar se há código HTML/JavaScript com erro no arquivo original.</p>";
    
} catch (Exception $e) {
    echo "<h2>❌ ERRO CAPTURADO:</h2>";
    echo "<div style='background: #ffebee; padding: 15px; border-left: 4px solid #f44336;'>";
    echo "<strong>Mensagem:</strong> " . $e->getMessage() . "<br>";
    echo "<strong>Arquivo:</strong> " . $e->getFile() . "<br>";
    echo "<strong>Linha:</strong> " . $e->getLine() . "<br>";
    echo "</div>";
    
    echo "<h3>Stack Trace:</h3>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
} catch (Error $e) {
    echo "<h2>❌ ERRO FATAL CAPTURADO:</h2>";
    echo "<div style='background: #ffebee; padding: 15px; border-left: 4px solid #f44336;'>";
    echo "<strong>Mensagem:</strong> " . $e->getMessage() . "<br>";
    echo "<strong>Arquivo:</strong> " . $e->getFile() . "<br>";
    echo "<strong>Linha:</strong> " . $e->getLine() . "<br>";
    echo "</div>";
}
?>