<?php
include("check_login.php");
include("conm/conn.php");

header('Content-Type: application/json; charset=utf-8');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Método não permitido");
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception("Dados inválidos");
    }
    
    $eventoid = $input['eventoid'] ?? $_COOKIE['eventoid'] ?? 0;
    
    if (!$eventoid) {
        throw new Exception("Evento não identificado");
    }
    
    // Se foi enviado participanteid, busca dados específicos
    if (isset($input['participanteid'])) {
        $participanteid = (int)$input['participanteid'];
        
        $sql = "SELECT participanteid, Nome, email, CPF, celular, tipoingresso, thumb 
                FROM participantes 
                WHERE participanteid = ? AND eventoid = ?";
        
        $stmt = mysqli_prepare($con, $sql);
        
        if ($stmt) {
            mysqli_stmt_bind_param($stmt, "ii", $participanteid, $eventoid);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            
            if ($row = mysqli_fetch_assoc($result)) {
                $response = [
                    'success' => true,
                    'participant' => $row
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => 'Participante não encontrado'
                ];
            }
            
            mysqli_stmt_close($stmt);
        } else {
            throw new Exception("Erro na consulta ao banco de dados");
        }
        
    } else {
        // Busca por CPF ou nome - SIMPLIFICADA
        $search = trim($input['search'] ?? '');
        
        if (empty($search)) {
            throw new Exception("Termo de busca não pode estar vazio");
        }
        
        if (strlen($search) < 3) {
            throw new Exception("Digite pelo menos 3 caracteres para buscar");
        }
        
        // Remove formatação do CPF para busca
        $cpf_clean = preg_replace('/[^0-9]/', '', $search);
        
        // Query mais simples
        $sql = "SELECT participanteid, Nome, email, CPF, celular, tipoingresso, thumb 
                FROM participantes 
                WHERE eventoid = ? AND (
                    Nome LIKE ? OR 
                    CPF = ? OR
                    REPLACE(REPLACE(REPLACE(CPF, '.', ''), '-', ''), ' ', '') = ?
                )
                ORDER BY Nome
                LIMIT 10";
        
        $search_name = "%$search%";
        
        $stmt = mysqli_prepare($con, $sql);
        
        if ($stmt) {
            mysqli_stmt_bind_param($stmt, "isss", $eventoid, $search_name, $search, $cpf_clean);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            
            $participants = [];
            while ($row = mysqli_fetch_assoc($result)) {
                $participants[] = $row;
            }
            
            if (count($participants) > 0) {
                $response = [
                    'success' => true,
                    'participants' => $participants,
                    'count' => count($participants)
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => 'Nenhum participante encontrado',
                    'participants' => []
                ];
            }
            
            mysqli_stmt_close($stmt);
        } else {
            throw new Exception("Erro na preparação da query: " . mysqli_error($con));
        }
    }
    
} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => $e->getMessage(),
        'participants' => [],
        'debug' => [
            'search' => $input['search'] ?? '',
            'eventoid' => $eventoid ?? 0,
            'error_line' => $e->getLine()
        ]
    ];
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
mysqli_close($con);
?>
