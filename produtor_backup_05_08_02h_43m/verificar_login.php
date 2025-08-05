<?php
include("conm/conn.php");

// Verificar se a tabela usuarios existe
$check_usuarios = mysqli_query($con, "SHOW TABLES LIKE 'usuarios'");

if (mysqli_num_rows($check_usuarios) > 0) {
    echo "<h3>Tabela 'usuarios' existe!</h3>";
    
    // Verificar estrutura da tabela
    $desc = mysqli_query($con, "DESCRIBE usuarios");
    echo "<h4>Estrutura da tabela usuarios:</h4>";
    echo "<table border='1'><tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    while ($row = mysqli_fetch_assoc($desc)) {
        echo "<tr>";
        echo "<td>" . $row['Field'] . "</td>";
        echo "<td>" . $row['Type'] . "</td>";
        echo "<td>" . $row['Null'] . "</td>";
        echo "<td>" . $row['Key'] . "</td>";
        echo "<td>" . $row['Default'] . "</td>";
        echo "<td>" . $row['Extra'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // Verificar se há usuários cadastrados
    $count = mysqli_query($con, "SELECT COUNT(*) as total FROM usuarios");
    $total = mysqli_fetch_assoc($count);
    echo "<p>Total de usuários cadastrados: " . $total['total'] . "</p>";
    
    if ($total['total'] > 0) {
        echo "<h4>Primeiros 5 usuários:</h4>";
        $users = mysqli_query($con, "SELECT id, nome, email, perfil, contratante_id FROM usuarios LIMIT 5");
        echo "<table border='1'><tr><th>ID</th><th>Nome</th><th>Email</th><th>Perfil</th><th>Contratante ID</th></tr>";
        while ($user = mysqli_fetch_assoc($users)) {
            echo "<tr>";
            echo "<td>" . $user['id'] . "</td>";
            echo "<td>" . $user['nome'] . "</td>";
            echo "<td>" . $user['email'] . "</td>";
            echo "<td>" . $user['perfil'] . "</td>";
            echo "<td>" . $user['contratante_id'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
    
} else {
    echo "<h3 style='color: red;'>Tabela 'usuarios' NÃO existe!</h3>";
    echo "<p>A tabela precisa ser criada para o login funcionar.</p>";
}

// Verificar tabela contratantes também
$check_contratantes = mysqli_query($con, "SHOW TABLES LIKE 'contratantes'");
if (mysqli_num_rows($check_contratantes) > 0) {
    echo "<h3>Tabela 'contratantes' existe!</h3>";
} else {
    echo "<h3 style='color: red;'>Tabela 'contratantes' NÃO existe!</h3>";
}
?>
