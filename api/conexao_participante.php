<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Permitir OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Configuração do banco (ajuste conforme necessário)
$host = "anysubd.mysql.dbaas.com.br";
$user = "anysubd";
$senha = "Swko15357523@#";
$db = "anysubd";

$con = mysqli_connect($host, $user, $senha, $db);
mysqli_set_charset($con, "utf8mb4");

if (!$con) {
    echo json_encode([
        'error' => 'Erro de conexão com banco de dados',
        'msg' => 'Erro interno do servidor'
    ]);
    exit();
}

try {
    // Recebe parâmetros via GET ou POST
    $userid = $_REQUEST['userid'] ?? $_REQUEST['participanteid1'] ?? null;
    $cpf = $_REQUEST['cpf'] ?? null;
    $eventoid = $_REQUEST['eventoid'] ?? null;
    
    // Validações básicas
    if (!$userid || !$cpf || !$eventoid) {
        throw new Exception('Parâmetros obrigatórios: userid, cpf, eventoid');
    }
    
    // 1. Verificar se existe participante com aquele CPF
    $sql_participante = "SELECT participanteid, Nome, email, celular, CPF 
                         FROM participantes 
                         WHERE CPF = ? OR REPLACE(REPLACE(REPLACE(CPF, '.', ''), '-', ''), ' ', '') = ?";
    
    $cpf_clean = preg_replace('/[^0-9]/', '', $cpf);
    $stmt_participante = mysqli_prepare($con, $sql_participante);
    
    if (!$stmt_participante) {
        throw new Exception('Erro na preparação da query de participante');
    }
    
    mysqli_stmt_bind_param($stmt_participante, "ss", $cpf, $cpf_clean);
    mysqli_stmt_execute($stmt_participante);
    $result_participante = mysqli_stmt_get_result($stmt_participante);
    
    $participante = mysqli_fetch_assoc($result_participante);
    mysqli_stmt_close($stmt_participante);
    
    if (!$participante) {
        echo json_encode(['msg' => 'Participante nao existe']);
        exit();
    }
    
    $participanteid = $participante['participanteid'];
    $nome_participante = $participante['Nome'];
    $celular_participante = $participante['celular'];
    
    // 2. Verificar se já é uma conexão
    $sql_conexao = "SELECT conexaoid FROM participante_conexao 
                    WHERE participanteid1 = ? AND participanteid2 = ? AND eventoid = ?";
    
    $stmt_conexao = mysqli_prepare($con, $sql_conexao);
    mysqli_stmt_bind_param($stmt_conexao, "iii", $userid, $participanteid, $eventoid);
    mysqli_stmt_execute($stmt_conexao);
    $result_conexao = mysqli_stmt_get_result($stmt_conexao);
    
    $conexao_existente = mysqli_fetch_assoc($result_conexao);
    mysqli_stmt_close($stmt_conexao);
    
    $status_conexao = '';
    
    if ($conexao_existente) {
        $status_conexao = 'Participante ja conectado';
    } else {
        // 3. Inserir nova conexão
        $sql_insert = "INSERT INTO participante_conexao (eventoid, participanteid1, participanteid2, data) 
                       VALUES (?, ?, ?, NOW())";
        
        $stmt_insert = mysqli_prepare($con, $sql_insert);
        mysqli_stmt_bind_param($stmt_insert, "iii", $eventoid, $userid, $participanteid);
        
        if (mysqli_stmt_execute($stmt_insert)) {
            $status_conexao = 'Participante foi salvo';
        } else {
            $status_conexao = 'Erro ao salvar conexao';
        }
        
        mysqli_stmt_close($stmt_insert);
    }
    
    // 4. Buscar nome do evento
    $sql_evento = "SELECT nome FROM eventos WHERE id = ?";
    $stmt_evento = mysqli_prepare($con, $sql_evento);
    mysqli_stmt_bind_param($stmt_evento, "i", $eventoid);
    mysqli_stmt_execute($stmt_evento);
    $result_evento = mysqli_stmt_get_result($stmt_evento);
    
    $evento = mysqli_fetch_assoc($result_evento);
    $nome_evento = $evento ? $evento['nome'] : 'Evento';
    mysqli_stmt_close($stmt_evento);
    
    // 4.1. Buscar nome do userid (quem está fazendo a conexão)
    $sql_userid = "SELECT Nome FROM participantes WHERE participanteid = ?";
    $stmt_userid = mysqli_prepare($con, $sql_userid);
    mysqli_stmt_bind_param($stmt_userid, "i", $userid);
    mysqli_stmt_execute($stmt_userid);
    $result_userid = mysqli_stmt_get_result($stmt_userid);
    
    $usuario = mysqli_fetch_assoc($result_userid);
    $nome_usuario = $usuario ? $usuario['Nome'] : 'Participante';
    mysqli_stmt_close($stmt_userid);
    
    // 5. Buscar mensagem personalizada
    $sql_msg = "SELECT msg FROM participante_msgpersonalizado WHERE participanteid = ?";
    $stmt_msg = mysqli_prepare($con, $sql_msg);
    mysqli_stmt_bind_param($stmt_msg, "i", $userid);
    mysqli_stmt_execute($stmt_msg);
    $result_msg = mysqli_stmt_get_result($stmt_msg);
    
    $msg_data = mysqli_fetch_assoc($result_msg);
    mysqli_stmt_close($stmt_msg);
    
    // Mensagem personalizada ou padrão
    if ($msg_data && !empty($msg_data['msg'])) {
        $mensagem = $msg_data['msg'];
    } else {
        $mensagem = "Olá {{Nome}}! 👋\n\nFoi um prazer te conhecer no evento {{Evento}}! 🎉\n\nVamos manter contato! Adoraria trocar ideias e experiências.\n\nUm abraço {{MeuNome}}! 😊";
    }
    
    // Substituir variáveis
    $mensagem = str_replace('{{Nome}}', $nome_participante, $mensagem);
    $mensagem = str_replace('{{Evento}}', $nome_evento, $mensagem);
    $mensagem = str_replace('{{MeuNome}}', $nome_usuario, $mensagem);
    
    // 6. Criar link do WhatsApp
    $celular_limpo = preg_replace('/[^0-9]/', '', $celular_participante);
    
    // Adicionar 55 se não começar com 55
    if (!str_starts_with($celular_limpo, '55')) {
        $celular_limpo = '55' . $celular_limpo;
    }
    
    // Codificar mensagem para URL (preservando emojis para WhatsApp)
    $mensagem_encoded = http_build_query(['text' => $mensagem]);
    $mensagem_encoded = substr($mensagem_encoded, 5); // Remove 'text=' do início
    
    $link_whatsapp = "https://wa.me/{$celular_limpo}?text={$mensagem_encoded}";
    
    // Resposta final
    $response = [
        'nomeparticipante' => $nome_participante,
        'participanteid' => $participanteid,
        'celular' => $celular_participante,
        'msgpersonalisada' => $mensagem,
        'Linkwhatsappcompleto' => $link_whatsapp,
        'conexao' => $status_conexao
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    echo json_encode([
        'error' => true,
        'msg' => $e->getMessage()
    ]);
}

mysqli_close($con);
?>
