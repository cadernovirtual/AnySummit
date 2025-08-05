<?php
include("check_login.php");
include_once('conm/conn.php');

$usuario_id = $_SESSION['usuarioid'];

echo "=== TESTE SALVAMENTO REAL ===<br>";

if ($_POST && isset($_POST['acao']) && $_POST['acao'] === 'salvar') {
    echo "POST recebido, processando...<br>";
    
    try {
        // Dados básicos apenas
        $nome_fantasia = trim($_POST['nome_fantasia'] ?? '');
        $tipo_pessoa = $_POST['tipo_pessoa'] ?? 'fisica';
        $cpf = $tipo_pessoa === 'fisica' ? trim($_POST['cpf'] ?? '') : '';
        $cnpj = $tipo_pessoa === 'juridica' ? trim($_POST['cnpj'] ?? '') : '';
        
        echo "Nome: $nome_fantasia<br>";
        echo "Tipo: $tipo_pessoa<br>";
        echo "CPF: $cpf<br>";
        echo "CNPJ: $cnpj<br>";
        
        // Validação simples
        if (empty($nome_fantasia)) {
            throw new Exception("Nome é obrigatório");
        }
        
        if ($tipo_pessoa === 'fisica' && empty($cpf)) {
            throw new Exception("CPF é obrigatório para pessoa física");
        }
        
        if ($tipo_pessoa === 'juridica' && empty($cnpj)) {
            throw new Exception("CNPJ é obrigatório para pessoa jurídica");
        }
        
        // Query mínima
        $sql = "INSERT INTO contratantes (nome_fantasia, usuario_id, cpf, cnpj, ativo) VALUES (?, ?, ?, ?, 1)";
        $stmt = mysqli_prepare($con, $sql);
        
        if (!$stmt) {
            throw new Exception("Erro ao preparar query: " . mysqli_error($con));
        }
        
        mysqli_stmt_bind_param($stmt, "siss", $nome_fantasia, $usuario_id, $cpf, $cnpj);
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception("Erro ao executar query: " . mysqli_error($con));
        }
        
        $id_inserido = mysqli_insert_id($con);
        mysqli_stmt_close($stmt);
        
        echo "✅ SUCESSO! Organizador inserido com ID: $id_inserido<br>";
        echo "<a href='organizadores.php'>Voltar para organizadores</a>";
        
    } catch (Exception $e) {
        echo "❌ ERRO: " . $e->getMessage() . "<br>";
        echo "<a href='organizadores.php'>Voltar para organizadores</a>";
    }
    
} else {
    // Formulário simples para teste
    echo '<form method="post">
        <input type="hidden" name="acao" value="salvar">
        <label>Nome: <input type="text" name="nome_fantasia" required></label><br><br>
        <label>Tipo: 
            <select name="tipo_pessoa">
                <option value="fisica">Pessoa Física</option>
                <option value="juridica">Pessoa Jurídica</option>
            </select>
        </label><br><br>
        <label>CPF: <input type="text" name="cpf"></label><br><br>
        <label>CNPJ: <input type="text" name="cnpj"></label><br><br>
        <button type="submit">Salvar Teste</button>
    </form>';
}
?>
