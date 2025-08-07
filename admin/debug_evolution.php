<?php
// Teste simples para debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "1. Teste de PHP funcionando<br>";

require_once 'conm/conn.php';
echo "2. Conexão carregada<br>";

$usuario_id = verificarAutenticacaoAdmin();
echo "3. Autenticação OK - Usuário ID: " . $usuario_id . "<br>";

$result = $con->query("SELECT evolution_instance_id FROM parametros WHERE id = 1");
if ($result && $result->num_rows > 0) {
    $param = $result->fetch_assoc();
    echo "4. Parâmetros carregados: " . ($param['evolution_instance_id'] ?? 'NULL') . "<br>";
} else {
    echo "4. Erro ao carregar parâmetros<br>";
}

echo "5. Teste concluído com sucesso!";
?>
