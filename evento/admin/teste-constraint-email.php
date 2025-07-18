<?php
include("../conm/conn.php");

echo "<h2>Teste de Constraint no Email</h2>";

// Tentar inserir dois registros com o mesmo email para testar
$email_teste = 'teste_duplicado@gmail.com';

echo "<p>Tentando inserir primeiro registro com email: $email_teste</p>";

$sql1 = "INSERT INTO participantes (Nome, email, celular, eventoid) 
         VALUES ('Teste 1', '$email_teste', '11999999999', 1)";

if ($con->query($sql1)) {
    echo "<p style='color: green;'>✅ Primeiro registro inserido com sucesso. ID: " . $con->insert_id . "</p>";
    
    echo "<p>Tentando inserir segundo registro com o mesmo email...</p>";
    
    $sql2 = "INSERT INTO participantes (Nome, email, celular, eventoid) 
             VALUES ('Teste 2', '$email_teste', '11888888888', 1)";
    
    if ($con->query($sql2)) {
        echo "<p style='color: orange;'>⚠️  Segundo registro também foi inserido! ID: " . $con->insert_id . "</p>";
        echo "<p>Isso significa que NÃO há constraint UNIQUE no email.</p>";
        
        // Limpar registros de teste
        $con->query("DELETE FROM participantes WHERE email = '$email_teste'");
        echo "<p>Registros de teste removidos.</p>";
        
    } else {
        echo "<p style='color: red;'>❌ Erro ao inserir segundo registro: " . $con->error . "</p>";
        echo "<p>Isso confirma que HÁ uma constraint UNIQUE no email.</p>";
        
        // Limpar registro de teste
        $con->query("DELETE FROM participantes WHERE email = '$email_teste'");
        echo "<p>Registro de teste removido.</p>";
    }
} else {
    echo "<p style='color: red;'>❌ Erro ao inserir primeiro registro: " . $con->error . "</p>";
}

// Verificar estrutura da tabela
echo "<h3>Estrutura da tabela participantes:</h3>";
$result = $con->query("DESCRIBE participantes");
echo "<table border='1'>";
echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
while ($row = $result->fetch_assoc()) {
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
?>
