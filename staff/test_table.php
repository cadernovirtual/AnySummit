<?php
include("check_login.php");
include("conm/conn.php");

// Define headers para exibir como texto
header('Content-Type: text/plain; charset=utf-8');

echo "=== TESTE DE CONEXÃO E TABELA ===\n\n";

// Verifica conexão
if ($con) {
    echo "✅ Conexão com MySQL: OK\n";
    echo "Charset: " . mysqli_character_set_name($con) . "\n\n";
} else {
    echo "❌ Erro na conexão: " . mysqli_connect_error() . "\n";
    exit;
}

// Verifica se a tabela participantes existe
$sql = "DESCRIBE participantes";
$result = mysqli_query($con, $sql);

if ($result) {
    echo "✅ Tabela participantes existe!\n\nColunas:\n";
    while ($row = mysqli_fetch_assoc($result)) {
        echo "- " . $row['Field'] . " (" . $row['Type'] . ")\n";
    }
} else {
    echo "❌ Tabela não existe. Erro: " . mysqli_error($con) . "\n\n";
    echo "⚠️ A tabela participantes deve ter a seguinte estrutura:\n";
    echo "- participanteid (int, AUTO_INCREMENT, PRIMARY KEY)\n";
    echo "- Nome (varchar)\n";
    echo "- email (varchar)\n";
    echo "- CPF (varchar)\n";
    echo "- tipoingresso (varchar)\n";
    echo "- senha (varchar)\n";
    echo "- eventoid (int)\n";
    echo "- thumb (varchar)\n";
    echo "- celular (varchar)\n";
    echo "- ultimologin (datetime)\n";
}

// Teste de eventoid
echo "\n=== TESTE DE EVENTOID ===\n";
if (isset($_COOKIE['eventoid'])) {
    echo "EventoID do cookie: " . $_COOKIE['eventoid'] . "\n";
} else {
    echo "⚠️ Cookie eventoid não encontrado\n";
}

mysqli_close($con);
echo "\n=== TESTE CONCLUÍDO ===\n";
?>