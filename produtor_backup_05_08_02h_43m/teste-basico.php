<?php
// Teste mais básico possível
echo "TESTE 1 - PHP funcionando<br>";

// Teste 2 - Verificar se PDO existe
echo "TESTE 2 - PDO existe? ";
if (class_exists('PDO')) {
    echo "SIM<br>";
} else {
    echo "NAO<br>";
}

// Teste 3 - phpinfo resumido
echo "TESTE 3 - PHP Version: " . phpversion() . "<br>";

// Só isso, nada mais
?>
