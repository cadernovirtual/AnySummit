<?php
session_start();

echo "TESTE DIRETO - SESSÃO ATUAL:\n";
echo "SESSION VARS:\n";
print_r($_SESSION);

if (isset($_SESSION['usuarioid'])) {
    echo "\nUsuário logado: " . $_SESSION['usuarioid'];
    
    require_once '../conm/conn.php';
    
    $usuario_id = $_SESSION['usuarioid'];
    
    $sql = "SELECT id, nome, criado_em, atualizado_em 
            FROM eventos 
            WHERE usuario_id = ? 
            AND status = 'rascunho' 
            ORDER BY atualizado_em DESC 
            LIMIT 1";
    
    $stmt = mysqli_prepare($con, $sql);
    mysqli_stmt_bind_param($stmt, "i", $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($row = mysqli_fetch_assoc($result)) {
        echo "\n\nRascunho encontrado:\n";
        print_r($row);
        
        $response = [
            'existe_rascunho' => true,
            'evento_id' => $row['id'],
            'nome' => $row['nome'],
            'criado_em' => date('d/m/Y H:i', strtotime($row['criado_em'])),
            'atualizado_em' => date('d/m/Y H:i', strtotime($row['atualizado_em']))
        ];
        
        echo "\n\nJSON que seria retornado:\n";
        echo json_encode($response);
    } else {
        echo "\n\nNenhum rascunho encontrado.";
        
        $response = ['existe_rascunho' => false];
        
        echo "\n\nJSON que seria retornado:\n";
        echo json_encode($response);
    }
    
} else {
    echo "\nUsuário NÃO logado - SESSION usuarioid não existe";
}
?>