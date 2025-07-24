<?php
// Script simplificado para criar apenas a tabela lotes
require_once 'evento/conm/conn.php';

// Apenas criar a tabela básica primeiro
$sql = "CREATE TABLE IF NOT EXISTS lotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

$result = mysqli_query($con, $sql);
if ($result) {
    echo "OK - Tabela lotes criada";
} else {
    echo "ERRO: " . mysqli_error($con);
}
mysqli_close($con);
?>
