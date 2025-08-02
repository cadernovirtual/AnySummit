<?php
// Script para alterar tipo do campo dados_aceite
require_once 'conm/conn.php';

try {
    $sql = "ALTER TABLE eventos MODIFY COLUMN dados_aceite JSON";
    if (mysqli_query($con, $sql)) {
        echo "✅ Campo dados_aceite alterado para JSON com sucesso!\n";
    } else {
        echo "❌ Erro ao alterar campo: " . mysqli_error($con) . "\n";
    }
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n";
}

mysqli_close($con);
?>