<?php
// Script para criar categorias padrão se não existirem
include("../conm/conn.php");

// Verificar se existem categorias
$sql = "SELECT COUNT(*) as total FROM categorias_evento WHERE ativo = 1";
$result = mysqli_query($con, $sql);
$row = mysqli_fetch_assoc($result);

if ($row['total'] == 0) {
    echo "Criando categorias padrão...<br>";
    
    $categorias_padrao = [
        'Tecnologia',
        'Negócios',
        'Educação',
        'Entretenimento',
        'Esportes',
        'Arte e Cultura',
        'Saúde e Bem-estar',
        'Gastronomia',
        'Religioso',
        'Outros'
    ];
    
    foreach ($categorias_padrao as $nome) {
        $sql = "INSERT INTO categorias_evento (nome, ativo) VALUES (?, 1)";
        $stmt = mysqli_prepare($con, $sql);
        mysqli_stmt_bind_param($stmt, "s", $nome);
        mysqli_stmt_execute($stmt);
        echo "Categoria criada: $nome<br>";
    }
    
    echo "<br>Categorias criadas com sucesso!";
} else {
    echo "Já existem {$row['total']} categorias ativas no banco.";
}

// Listar categorias existentes
echo "<br><br>Categorias no banco:<br>";
$sql = "SELECT id, nome FROM categorias_evento WHERE ativo = 1 ORDER BY nome";
$result = mysqli_query($con, $sql);
while ($row = mysqli_fetch_assoc($result)) {
    echo "ID: {$row['id']} - Nome: {$row['nome']}<br>";
}
?>