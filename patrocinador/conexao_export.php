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
        'ID Conexão',
        'Nome Participante', 
        'Email',
        'Celular',
        'Evento',
        'Data da Conexão'
    ];
    
    fputcsv($output, $headers, ';');
    
    // Dados
    foreach ($dados as $row) {
        $linha = [
            $row['conexaoid'],
            $row['nome'],
            $row['email'],
            $row['celular'],
            $row['evento_nome'],
            date('d/m/Y H:i:s', strtotime($row['data_conexao']))
        ];
        
        fputcsv($output, $linha, ';');
    }
    
    fclose($output);
    exit();
}

try {
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    
    // Pega o ID do participante logado
    $participante_id = $_SESSION['participanteid'] ?? $_COOKIE['participanteid'] ?? 1;
    
    if (!$participante_id) {
        $participante_id = 1;
    }
    
    // Query para todos os dados (sem paginação para export)
    $sql = "
        SELECT
            pc.conexaoid,
            pc.participanteid1,
            pc.participanteid2,
            pc.data as data_conexao,
            e.nome as evento_nome,
            p1.Nome as nome1,
            p1.email as email1,
            p1.celular as celular1,
            p2.Nome as nome2,
            p2.email as email2,
            p2.celular as celular2
        FROM participante_conexao pc
        INNER JOIN eventos e ON pc.eventoid = e.id
        INNER JOIN participantes p1 ON pc.participanteid1 = p1.participanteid
        INNER JOIN participantes p2 ON pc.participanteid2 = p2.participanteid
        WHERE (pc.participanteid1 = ? OR pc.participanteid2 = ?)
    ";
    
    $params = [$participante_id, $participante_id];
    $param_types = "ii";
    
    // Adiciona filtro de busca se necessário
    if (!empty($search)) {
        $sql .= " AND (p1.Nome LIKE ? OR p2.Nome LIKE ? OR e.nome LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $param_types .= "sss";
    }
    
    $sql .= " ORDER BY pc.data DESC";
    
    $stmt = mysqli_prepare($con, $sql);
    
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, $param_types, ...$params);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        $dados = [];
        while ($row = mysqli_fetch_assoc($result)) {
            // Determina qual participante mostrar (o que NÃO é o logado)
            if ($row['participanteid1'] == $participante_id) {
                $nome = $row['nome2'];
                $email = $row['email2'];
                $celular = $row['celular2'];
            } else {
                $nome = $row['nome1'];
                $email = $row['email1'];
                $celular = $row['celular1'];
            }
            
            $dados[] = [
                'conexaoid' => $row['conexaoid'],
                'nome' => $nome,
                'email' => $email,
                'celular' => $celular,
                'evento_nome' => $row['evento_nome'],
                'data_conexao' => $row['data_conexao']
            ];
        }
        
        mysqli_stmt_close($stmt);
        
        // Nome do arquivo
        $filename = 'minhas_conexoes_' . date('Y-m-d_H-i-s') . '.csv';
        
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
