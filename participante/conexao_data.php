<?php
include("check_login.php");
include("conm/conn.php");

header('Content-Type: application/json');

try {
    // Pega os parâmetros
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $limit = 10; // 10 por página
    $offset = ($page - 1) * $limit;
    
    // Pega o ID do participante logado
    $participante_id = $_SESSION['participanteid'] ?? $_COOKIE['participanteid'] ?? 1;
    
    if (!$participante_id) {
        $participante_id = 1; // Fallback para teste
    }
    
    // Base da query SIMPLIFICADA - usando LEFT JOIN para eventos
    $base_sql = "
        SELECT
            pc.conexaoid,
            pc.eventoid,
            pc.participanteid1,
            pc.participanteid2,
            pc.data as data_conexao,
            COALESCE(e.nome, CONCAT('Evento ID ', pc.eventoid)) as evento_nome,
            p1.Nome as nome1,
            p1.email as email1,
            p1.celular as celular1,
            p1.thumb as thumb1,
            p2.Nome as nome2,
            p2.email as email2,
            p2.celular as celular2,
            p2.thumb as thumb2
        FROM participante_conexao pc
        LEFT JOIN eventos e ON pc.eventoid = e.id
        INNER JOIN participantes p1 ON pc.participanteid1 = p1.participanteid
        INNER JOIN participantes p2 ON pc.participanteid2 = p2.participanteid
        WHERE (pc.participanteid1 = ? OR pc.participanteid2 = ?)
    ";
    
    // Parâmetros básicos - SIMPLIFICADO
    $params = [$participante_id, $participante_id];
    $param_types = "ii";
    
    // Adiciona filtro de busca se necessário
    $search_condition = "";
    if (!empty($search)) {
        $search_condition = " AND (p1.Nome LIKE ? OR p2.Nome LIKE ? OR COALESCE(e.nome, '') LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $param_types .= "sss";
    }
    
    // Query para contar total de registros
    $count_sql = "SELECT COUNT(*) as total FROM ($base_sql $search_condition) as temp";
    $count_stmt = mysqli_prepare($con, $count_sql);
    
    if ($count_stmt) {
        mysqli_stmt_bind_param($count_stmt, $param_types, ...$params);
        mysqli_stmt_execute($count_stmt);
        $count_result = mysqli_stmt_get_result($count_stmt);
        $total_records = mysqli_fetch_assoc($count_result)['total'];
        mysqli_stmt_close($count_stmt);
    } else {
        throw new Exception("Erro na query de contagem");
    }
    
    // Query principal com paginação
    $main_sql = $base_sql . $search_condition . " ORDER BY pc.data DESC LIMIT $limit OFFSET $offset";
    $main_stmt = mysqli_prepare($con, $main_sql);
    
    if ($main_stmt) {
        mysqli_stmt_bind_param($main_stmt, $param_types, ...$params);
        mysqli_stmt_execute($main_stmt);
        $result = mysqli_stmt_get_result($main_stmt);
        
        $conexoes = [];
        while ($row = mysqli_fetch_assoc($result)) {
            // Determina qual participante mostrar (o que NÃO é o logado)
            if ($row['participanteid1'] == $participante_id) {
                // Mostra dados do participante 2
                $nome = $row['nome2'];
                $email = $row['email2'];
                $celular = $row['celular2'];
                $thumb = $row['thumb2'];
                $outro_participante_id = $row['participanteid2'];
            } else {
                // Mostra dados do participante 1
                $nome = $row['nome1'];
                $email = $row['email1'];
                $celular = $row['celular1'];
                $thumb = $row['thumb1'];
                $outro_participante_id = $row['participanteid1'];
            }
            
            // Define a imagem padrão se não tiver thumb
            $thumb_url = !empty($thumb) ? "/uploads/thumbs/" . $thumb : "https://anysummit.com.br/participante/img/user.jpg";
            
            $conexoes[] = [
                'conexaoid' => $row['conexaoid'],
                'participanteid' => $outro_participante_id,
                'nome' => $nome,
                'email' => $email,
                'telefone' => $celular, // Mantém 'telefone' no retorno para compatibilidade com o frontend
                'thumb' => $thumb_url,
                'evento_nome' => $row['evento_nome'],
                'data_conexao' => $row['data_conexao']
            ];
        }
        
        mysqli_stmt_close($main_stmt);
        
        // Calcula informações de paginação
        $total_pages = ceil($total_records / $limit);
        
        $response = [
            'success' => true,
            'conexoes' => $conexoes,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $total_pages,
                'total_records' => $total_records,
                'limit' => $limit,
                'has_next' => $page < $total_pages,
                'has_prev' => $page > 1
            ]
        ];
        
    } else {
        throw new Exception("Erro na query principal");
    }
    
} catch (Exception $e) {
    $response = [
        'success' => false,
        'error' => $e->getMessage(),
        'conexoes' => [],
        'pagination' => [
            'current_page' => 1,
            'total_pages' => 0,
            'total_records' => 0,
            'limit' => $limit,
            'has_next' => false,
            'has_prev' => false
        ]
    ];
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
mysqli_close($con);
?>
