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
    
    $eventoid = $_COOKIE['eventoid'];
    
    // Base da query
    $base_sql = "
        SELECT
            MAX(checkin.checkinid) as checkinid,
            checkin.participanteid,
            checkin.eventoid,
            MAX(checkin.datacheck) as datacheck,
            MAX(checkin.staffid) as staffid,
            participantes.Nome,
            participantes.email,
            participantes.CPF,
            participantes.tipoingresso,
            participantes.thumb,
            participantes.celular,
            staff.nome as staff_nome,
            COUNT(checkin.checkinid) as total_checkins
        FROM checkin
        INNER JOIN participantes ON checkin.participanteid = participantes.participanteid
        INNER JOIN staff ON checkin.staffid = staff.staffid
        WHERE checkin.eventoid = ?
    ";
    
    // Adiciona filtro de busca se necessário
    $search_condition = "";
    $group_by = " GROUP BY checkin.participanteid";
    $params = [$eventoid];
    $param_types = "i";
    
    if (!empty($search)) {
        $search_condition = " AND participantes.Nome LIKE ?";
        $params[] = "%$search%";
        $param_types .= "s";
    }
    
    // Query para contar total de registros
    $count_sql = "SELECT COUNT(DISTINCT checkin.participanteid) as total FROM checkin 
                  INNER JOIN participantes ON checkin.participanteid = participantes.participanteid
                  WHERE checkin.eventoid = ?";
    
    if (!empty($search)) {
        $count_sql .= " AND participantes.Nome LIKE ?";
    }
    
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
    $main_sql = $base_sql . $search_condition . $group_by . " ORDER BY MAX(checkin.datacheck) DESC LIMIT $limit OFFSET $offset";
    $main_stmt = mysqli_prepare($con, $main_sql);
    
    if ($main_stmt) {
        mysqli_stmt_bind_param($main_stmt, $param_types, ...$params);
        mysqli_stmt_execute($main_stmt);
        $result = mysqli_stmt_get_result($main_stmt);
        
        $checkins = [];
        while ($row = mysqli_fetch_assoc($result)) {
            // Define a imagem padrão se não tiver thumb
            $thumb_url = !empty($row['thumb']) ? "/uploads/thumbs/" . $row['thumb'] : "https://anysummit.com.br/staff/img/user.jpg";
            
            $checkins[] = [
                'checkinid' => $row['checkinid'],
                'participanteid' => $row['participanteid'],
                'nome' => $row['Nome'],
                'email' => $row['email'],
                'cpf' => $row['CPF'],
                'celular' => $row['celular'],
                'tipoingresso' => $row['tipoingresso'],
                'thumb' => $thumb_url,
                'staff_nome' => $row['staff_nome'],
                'datacheck' => $row['datacheck'],
                'total_checkins' => $row['total_checkins']
            ];
        }
        
        mysqli_stmt_close($main_stmt);
        
        // Calcula informações de paginação
        $total_pages = ceil($total_records / $limit);
        
        $response = [
            'success' => true,
            'checkins' => $checkins,
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
        'checkins' => [],
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
