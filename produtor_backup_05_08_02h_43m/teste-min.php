<?php
// Absolutamente mínimo
header('Content-Type: text/plain');
echo "OK - PHP funcionando\n";
echo "Versao: " . phpversion() . "\n";
echo "Extensoes: " . implode(', ', get_loaded_extensions()) . "\n";
?>
