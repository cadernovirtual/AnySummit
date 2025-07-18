<?php
include("check_login.php");
include("conm/conn.php");

// Função para exportar para Excel (CSV)
function exportarParaExcel($dados, $filename) {
    header('Content-Type: application/vnd.ms-excel; charset=UTF-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: max-age=0');
    
    // BOM para UTF-8
    echo "\xEF\xBB\xBF";
    
    $output = fopen('php://output', 'w');
    
    // Cabeçalhos
    $headers = [
        'ID Check-in',
        'Nome Participante', 
        'Email',
        'CPF',
        'Celular',
        'Tipo Ingresso',
        'Staff Responsável',
        'Qtd Checkins',
        'Último Check-in'
    ];
    
    fputcsv($output, $headers, ';');
    
    // Dados
    foreach ($dados as $row) {
        $linha = [
            $row['checkinid'],
            $row['Nome'],
            $row['email'],
            $row['CPF'],
            $row['celular'],
            $row['tipoingresso'],
            $row['staff_nome'],
            $row['total_checkins'],
            date('d/m/Y H:i:s', strtotime($row['datacheck']))
        ];
        
        fputcsv($output, $linha, ';');
    }
    
    fclose($output);
    exit();
}

try {
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $eventoid = $_COOKIE['eventoid'];
    
    // Query para todos os dados (sem paginação para export)
    $sql = "
        SELECT
            MAX(checkin.checkinid) as checkinid,
            checkin.participanteid,
            MAX(checkin.datacheck) as datacheck,
            participantes.Nome,
            participantes.email,
            participantes.CPF,
            participantes.tipoingresso,
            participantes.celular,
            staff.nome as staff_nome,
            COUNT(checkin.checkinid) as total_checkins
        FROM checkin
        INNER JOIN participantes ON checkin.participanteid = participantes.participanteid
        INNER JOIN staff ON checkin.staffid = staff.staffid
        WHERE checkin.eventoid = ?
    ";
    
    $params = [$eventoid];
    $param_types = "i";
    
    // Adiciona filtro de busca se necessário
    if (!empty($search)) {
        $sql .= " AND participantes.Nome LIKE ?";
        $params[] = "%$search%";
        $param_types .= "s";
    }
    
    $sql .= " GROUP BY checkin.participanteid ORDER BY MAX(checkin.datacheck) DESC";
    
    $stmt = mysqli_prepare($con, $sql);
    
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, $param_types, ...$params);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        $dados = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $dados[] = $row;
        }
        
        mysqli_stmt_close($stmt);
        
        // Nome do arquivo
        $filename = 'checkins_realizados_' . date('Y-m-d_H-i-s') . '.csv';
        
        // Exporta
        exportarParaExcel($dados, $filename);
        
    } else {
        throw new Exception("Erro na consulta ao banco de dados");
    }
    
} catch (Exception $e) {
    echo "Erro ao exportar dados: " . $e->getMessage();
}

mysqli_close($con);
?>
