<?php
echo "=== DEBUG GRID ORGANIZADORES ===<br>";

include("check_login.php");
include_once('conm/conn.php');

$usuario_id = $_SESSION['usuarioid'];

// Buscar organizadores para debug
$sql_organizadores = "SELECT * FROM contratantes WHERE usuario_id = ? ORDER BY nome_fantasia ASC";
$stmt_organizadores = mysqli_prepare($con, $sql_organizadores);
mysqli_stmt_bind_param($stmt_organizadores, "i", $usuario_id);
mysqli_stmt_execute($stmt_organizadores);
$result_organizadores = mysqli_stmt_get_result($stmt_organizadores);
$organizadores = mysqli_fetch_all($result_organizadores, MYSQLI_ASSOC);

echo "Número de organizadores encontrados: " . count($organizadores) . "<br><br>";

if (count($organizadores) > 0) {
    echo "<h3>DADOS DOS ORGANIZADORES:</h3>";
    
    foreach ($organizadores as $index => $organizador) {
        echo "<h4>Organizador " . ($index + 1) . " (ID: {$organizador['id']}):</h4>";
        echo "<table border='1' style='margin-bottom: 20px;'>";
        
        foreach ($organizador as $campo => $valor) {
            echo "<tr>";
            echo "<td><strong>$campo</strong></td>";
            echo "<td>" . htmlspecialchars($valor ?? 'NULL') . "</td>";
            echo "<td>";
            
            // Testes específicos para campos problemáticos
            if ($campo === 'criado_em') {
                if (empty($valor)) {
                    echo "<span style='color: red;'>⚠️ VAZIO - PODE CAUSAR ERRO</span>";
                } else {
                    try {
                        $test_date = new DateTime($valor);
                        echo "<span style='color: green;'>✅ Data válida: " . $test_date->format('d/m/Y') . "</span>";
                    } catch (Exception $e) {
                        echo "<span style='color: red;'>❌ ERRO: " . $e->getMessage() . "</span>";
                    }
                }
            } elseif ($campo === 'logomarca') {
                if (!empty($valor)) {
                    $path = "../" . $valor;
                    if (file_exists($path)) {
                        echo "<span style='color: green;'>✅ Arquivo existe</span>";
                    } else {
                        echo "<span style='color: orange;'>⚠️ Arquivo não encontrado: $path</span>";
                    }
                }
            } elseif (in_array($campo, ['nome_fantasia', 'cpf', 'cnpj'])) {
                if (empty($valor)) {
                    echo "<span style='color: red;'>⚠️ Campo obrigatório vazio</span>";
                } else {
                    echo "<span style='color: green;'>✅ OK</span>";
                }
            }
            
            echo "</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
    
    echo "<h3>🧪 TESTE DE RENDERIZAÇÃO:</h3>";
    echo "Testando se consegue gerar a tabela...<br>";
    
    try {
        echo "<table border='1'>";
        echo "<tr><th>Nome</th><th>Tipo</th><th>Data</th><th>Status</th></tr>";
        
        foreach ($organizadores as $organizador) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($organizador['nome_fantasia'] ?? '') . "</td>";
            
            if (!empty($organizador['cnpj'])) {
                echo "<td>PJ</td>";
            } else {
                echo "<td>PF</td>";
            }
            
            // Teste da data
            try {
                if (!empty($organizador['criado_em'])) {
                    $criado = new DateTime($organizador['criado_em']);
                    echo "<td>" . $criado->format('d/m/Y') . "</td>";
                } else {
                    echo "<td>N/A</td>";
                }
            } catch (Exception $e) {
                echo "<td>ERRO: " . $e->getMessage() . "</td>";
            }
            
            echo "<td>✅ OK</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        echo "<br>✅ <strong>Tabela renderizada com sucesso!</strong><br>";
        
    } catch (Exception $e) {
        echo "❌ <strong>ERRO ao renderizar tabela:</strong> " . $e->getMessage() . "<br>";
        echo "Linha: " . $e->getLine() . "<br>";
    }
    
} else {
    echo "Nenhum organizador encontrado. Isso pode ser normal se você excluiu os registros de teste.<br>";
}

echo "<br><a href='organizadores.php'>🚀 Testar organizadores.php corrigido</a>";
?>
