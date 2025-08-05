<?php
echo "=== TESTE BÁSICO ORGANIZADORES ===<br>";

// Teste 1: Include básico
try {
    include("check_login.php");
    echo "✅ check_login.php incluído com sucesso<br>";
} catch (Exception $e) {
    echo "❌ Erro no check_login.php: " . $e->getMessage() . "<br>";
    exit;
}

// Teste 2: Conexão
try {
    include_once('conm/conn.php');
    echo "✅ conn.php incluído com sucesso<br>";
    
    if (isset($con) && $con) {
        echo "✅ Conexão com banco OK<br>";
    } else {
        echo "❌ Falha na conexão com banco<br>";
        exit;
    }
} catch (Exception $e) {
    echo "❌ Erro na conexão: " . $e->getMessage() . "<br>";
    exit;
}

// Teste 3: Verificar usuário logado
if (!isset($_SESSION['usuario_logado']) || $_SESSION['usuario_logado'] !== true) {
    echo "❌ Usuário não está logado<br>";
    exit;
}

$usuario_id = $_SESSION['usuarioid'];
echo "✅ Usuário logado ID: " . $usuario_id . "<br>";

// Teste 4: Query simples na tabela contratantes
try {
    $sql = "SELECT COUNT(*) as total FROM contratantes WHERE usuario_id = ?";
    $stmt = mysqli_prepare($con, $sql);
    
    if (!$stmt) {
        echo "❌ Erro ao preparar query: " . mysqli_error($con) . "<br>";
        exit;
    }
    
    mysqli_stmt_bind_param($stmt, "i", $usuario_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    
    echo "✅ Query executada: " . $row['total'] . " organizadores encontrados<br>";
    mysqli_stmt_close($stmt);
    
} catch (Exception $e) {
    echo "❌ Erro na query: " . $e->getMessage() . "<br>";
    exit;
}

echo "<br>🎉 TODOS OS TESTES PASSARAM! O problema pode ser específico do arquivo completo.<br>";
echo "<br><a href='organizadores.php'>Tentar acessar organizadores.php novamente</a>";
?>
