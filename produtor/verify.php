<?php
// Habilitar exibição de erros para debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

// Verificar se o arquivo de conexão existe
if (!file_exists("conm/conn.php")) {
    die("Erro: Arquivo de conexão não encontrado!");
}

include("conm/conn.php");

// Verificar conexão
if (!$con) {
    die("Erro de conexão: " . mysqli_connect_error());
}

// Função para definir cookies sem expiração
function setCookieForever($name, $value) {
    $expire = time() + (10 * 365 * 24 * 60 * 60); // 10 anos
    setcookie($name, $value, $expire, "/", "", false, true);
}

// Verifica se os dados foram enviados via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = mysqli_real_escape_string($con, trim($_POST['email'] ?? ''));
    $senha = trim($_POST['password'] ?? '');
    
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
    
    // Verificar se a tabela usuarios existe
    $check_table = mysqli_query($con, "SHOW TABLES LIKE 'usuarios'");
    if (mysqli_num_rows($check_table) == 0) {
        header("Location: index.php?erro=tabela_nao_existe");
        exit();
    }
    
    // Consulta no banco de dados
    $sql = "SELECT id, nome, email, senha_hash, contratante_id FROM usuarios WHERE email = ? AND ativo = 1 LIMIT 1";
    $stmt = mysqli_prepare($con, $sql);
    
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "s", $email);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if ($row = mysqli_fetch_assoc($result)) {
            // Verificar senha (suporta tanto hash moderno quanto MD5 legado)
            $senha_valida = false;
            
            if (password_verify($senha, $row['senha_hash'])) {
                // Senha com hash moderno (password_hash)
                $senha_valida = true;
            } elseif ($row['senha_hash'] === md5($senha)) {
                // Senha com MD5 (legado)
                $senha_valida = true;
            } elseif ($row['senha_hash'] === $senha) {
                // Senha em texto plano (muito inseguro, mas pode existir)
                $senha_valida = true;
            }
            
            if ($senha_valida) {
                // Login bem-sucedido
                
                // Atualizar último acesso
                $update_sql = "UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = ?";
                $update_stmt = mysqli_prepare($con, $update_sql);
                if ($update_stmt) {
                    mysqli_stmt_bind_param($update_stmt, "i", $row['id']);
                    mysqli_stmt_execute($update_stmt);
                    mysqli_stmt_close($update_stmt);
                }
                
                // Definir sessões
                $_SESSION['usuario_logado'] = true;
                $_SESSION['usuarioid'] = $row['id'];
                $_SESSION['usuario_nome'] = $row['nome'];
                $_SESSION['usuario_email'] = $row['email'];
                $_SESSION['contratanteid'] = $row['contratante_id'];
                
                // Definir cookies
                setCookieForever('usuario_logado', '1');
                setCookieForever('usuarioid', $row['id']);
                setCookieForever('usuario_nome', $row['nome']);
                setCookieForever('usuario_email', $row['email']);
                setCookieForever('contratanteid', $row['contratante_id']);
                
                // Redirecionar
                header("Location: meuseventos.php");
                exit();
                
            } else {
                // Senha incorreta
                header("Location: index.php?erro=senha_incorreta");
                exit();
            }
        } else {
            // Email não encontrado ou usuário inativo
            header("Location: index.php?erro=usuario_nao_encontrado");
            exit();
        }
        
        mysqli_stmt_close($stmt);
    } else {
        // Erro na preparação da query
        error_log("Erro na query de login: " . mysqli_error($con));
        header("Location: index.php?erro=erro_sistema");
        exit();
    }
    
} else {
    // Acesso direto sem POST
    header("Location: index.php");
    exit();
}

mysqli_close($con);
?>
