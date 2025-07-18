<?php
include("debug.php"); // Para debug
session_start();
include("conm/conn.php");

// Função para definir cookies sem expiração
function setCookieForever($name, $value) {
    // Define cookie com tempo de expiração muito longe no futuro (10 anos)
    $expire = time() + (10 * 365 * 24 * 60 * 60); // 10 anos
    setcookie($name, $value, $expire, "/", "", false, true); // HttpOnly para segurança
}

// Verifica se os dados foram enviados via POST
if ($_POST) {
    $email = mysqli_real_escape_string($con, trim($_POST['email']));
    $senha = mysqli_real_escape_string($con, trim($_POST['password']));
    
    // Validação básica
    if (empty($email) || empty($senha)) {
        header("Location: index.php?erro=campos_vazios");
        exit();
    }
    
    // Verifica se o email é válido
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: index.php?erro=email_invalido");
        exit();
    }
    
    // Consulta no banco de dados
    $sql = "SELECT participanteid, Nome, email, senha, eventoid FROM participantes WHERE email = ? LIMIT 1";
    $stmt = mysqli_prepare($con, $sql);
    
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "s", $email);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if ($row = mysqli_fetch_assoc($result)) {
            // Verifica a senha (assumindo que está em hash MD5 ou texto plano)
            $senha_hash = md5($senha); // Usando MD5 como exemplo, mas recomendo usar password_hash()
            
            if ($row['senha'] === $senha || $row['senha'] === $senha_hash) {
                // Login bem-sucedido
                
                // Atualiza o último login
                $update_sql = "UPDATE participantes SET ultimologin = NOW() WHERE participanteid = ?";
                $update_stmt = mysqli_prepare($con, $update_sql);
                if ($update_stmt) {
                    mysqli_stmt_bind_param($update_stmt, "i", $row['participanteid']);
                    mysqli_stmt_execute($update_stmt);
                    mysqli_stmt_close($update_stmt);
                }
                
                // Define as sessões
                $_SESSION['participante_logado'] = true;
                $_SESSION['participanteid'] = $row['participanteid'];
                $_SESSION['participante_nome'] = $row['Nome'];
                $_SESSION['participante_email'] = $row['email'];
                $_SESSION['eventoid'] = $row['eventoid'];
                
                // Define os cookies sem expiração
                setCookieForever('participante_logado', '1');
                setCookieForever('participanteid', $row['participanteid']);
                setCookieForever('participante_nome', $row['Nome']);
                setCookieForever('participante_email', $row['email']);
                setCookieForever('eventoid', $row['eventoid']);
                
             
                
                // Redireciona para a página de check-in
                header("Location: /participante/checkin");
                exit();
                
            } else {
                // Senha incorreta
                header("Location: index.php?erro=senha_incorreta");
                exit();
            }
        } else {
            // Email não encontrado
            header("Location: index.php?erro=email_nao_encontrado");
            exit();
        }
        
        mysqli_stmt_close($stmt);
    } else {
        // Erro na preparação da query
        header("Location: index.php?erro=erro_sistema");
        exit();
    }
    
} else {
    // Acesso direto ao arquivo sem POST
    header("Location: index.php");
    exit();
}

mysqli_close($con);
?>
