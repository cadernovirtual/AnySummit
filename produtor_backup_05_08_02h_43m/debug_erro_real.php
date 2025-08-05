<?php
// Habilitar exibição de erros
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

echo "=== DIAGNÓSTICO DETALHADO DO ERRO 500 ===<br>";

// Capturar dados POST reais
if ($_POST) {
    echo "<h3>POST RECEBIDO:</h3>";
    echo "<pre>" . print_r($_POST, true) . "</pre>";
    
    echo "<h3>FILES RECEBIDO:</h3>";
    echo "<pre>" . print_r($_FILES, true) . "</pre>";
}

// Testar includes step by step
echo "<h3>1. TESTANDO INCLUDES:</h3>";

try {
    echo "Incluindo check_login.php...<br>";
    include("check_login.php");
    echo "✅ check_login.php OK<br>";
    
    echo "Incluindo conn.php...<br>";
    include_once('conm/conn.php');
    echo "✅ conn.php OK<br>";
    
    if (!isset($con) || !$con) {
        throw new Exception("Conexão com banco falhou");
    }
    echo "✅ Conexão com banco OK<br>";
    
} catch (Exception $e) {
    echo "❌ ERRO nos includes: " . $e->getMessage() . "<br>";
    exit;
}

// Verificar sessão
echo "<h3>2. VERIFICANDO SESSÃO:</h3>";
if (!isset($_SESSION['usuario_logado']) || $_SESSION['usuario_logado'] !== true) {
    echo "❌ Usuário não logado<br>";
    exit;
}

$usuario_id = $_SESSION['usuarioid'];
echo "✅ Usuário logado - ID: $usuario_id<br>";

// Se não há POST, mostrar formulário de teste
if (!$_POST) {
    echo "<h3>3. FORMULÁRIO DE TESTE:</h3>";
    echo '<form method="post">
        <input type="hidden" name="acao" value="salvar">
        <input type="hidden" name="tipo_pessoa" value="fisica">
        <input type="hidden" name="nome_fantasia" value="Teste Debug Real">
        <input type="hidden" name="cpf" value="123.456.789-00">
        <input type="hidden" name="email_contato" value="teste@debug.com">
        <input type="hidden" name="telefone" value="">
        <input type="hidden" name="endereco_completo" value="">
        <input type="hidden" name="tipo_recebimento" value="pix">
        <input type="hidden" name="chave_pix" value="">
        <input type="hidden" name="banco" value="">
        <input type="hidden" name="agencia" value="">
        <input type="hidden" name="conta" value="">
        <input type="hidden" name="titular_conta" value="">
        <button type="submit">🚀 TESTAR SALVAMENTO REAL</button>
    </form>';
    exit;
}

// Processar POST real
echo "<h3>3. PROCESSANDO POST REAL:</h3>";

try {
    $acao = $_POST['acao'];
    echo "Ação: $acao<br>";
    
    if ($acao === 'salvar') {
        echo "Entrando no bloco salvar...<br>";
        
        // Capturar todos os campos
        $tipo_pessoa = $_POST['tipo_pessoa'] ?? '';
        $nome_fantasia = trim($_POST['nome_fantasia'] ?? '');
        $razao_social = $tipo_pessoa === 'juridica' ? trim($_POST['razao_social'] ?? '') : '';
        $cnpj = $tipo_pessoa === 'juridica' ? trim($_POST['cnpj'] ?? '') : '';
        $cpf = $tipo_pessoa === 'fisica' ? trim($_POST['cpf'] ?? '') : '';
        
        echo "Nome: '$nome_fantasia'<br>";
        echo "Tipo: '$tipo_pessoa'<br>";
        echo "CPF: '$cpf'<br>";
        echo "CNPJ: '$cnpj'<br>";
        
        // Validações
        if (empty($nome_fantasia)) {
            throw new Exception("Nome é obrigatório");
        }
        
        if ($tipo_pessoa === 'fisica' && empty($cpf)) {
            throw new Exception("CPF é obrigatório para pessoa física");
        }
        
        if ($tipo_pessoa === 'juridica' && empty($cnpj)) {
            throw new Exception("CNPJ é obrigatório para pessoa jurídica");
        }
        
        echo "✅ Validações passaram<br>";
        
        // Campos adicionais
        $email_contato = trim($_POST['email_contato'] ?? '');
        $telefone = trim($_POST['telefone'] ?? '');
        $endereco_completo = trim($_POST['endereco_completo'] ?? '');
        $tipo_recebimento = $_POST['tipo_recebimento'] ?? 'pix';
        $chave_pix = trim($_POST['chave_pix'] ?? '');
        $banco = trim($_POST['banco'] ?? '');
        $agencia = trim($_POST['agencia'] ?? '');
        $conta = trim($_POST['conta'] ?? '');
        $titular_conta = trim($_POST['titular_conta'] ?? '');
        $logomarca = '';
        
        echo "✅ Campos processados<br>";
        
        // Query simplificada para teste
        echo "Preparando query INSERT...<br>";
        
        $sql = "INSERT INTO contratantes (nome_fantasia, usuario_id, cpf, cnpj, ativo) VALUES (?, ?, ?, ?, 1)";
        
        echo "SQL: $sql<br>";
        
        $stmt = mysqli_prepare($con, $sql);
        if (!$stmt) {
            throw new Exception("Erro ao preparar statement: " . mysqli_error($con));
        }
        
        echo "Statement preparado<br>";
        
        $bind_result = mysqli_stmt_bind_param($stmt, "siss", $nome_fantasia, $usuario_id, $cpf, $cnpj);
        if (!$bind_result) {
            throw new Exception("Erro no bind_param: " . mysqli_error($con));
        }
        
        echo "Bind param OK<br>";
        
        $exec_result = mysqli_stmt_execute($stmt);
        if (!$exec_result) {
            throw new Exception("Erro ao executar: " . mysqli_error($con) . " | " . mysqli_stmt_error($stmt));
        }
        
        $id_inserido = mysqli_insert_id($con);
        mysqli_stmt_close($stmt);
        
        echo "✅ SUCESSO! Organizador inserido com ID: $id_inserido<br>";
        
    } else {
        echo "Ação desconhecida: $acao<br>";
    }
    
} catch (Exception $e) {
    echo "❌ EXCEPTION CAPTURADA:<br>";
    echo "Mensagem: " . $e->getMessage() . "<br>";
    echo "Arquivo: " . $e->getFile() . "<br>";
    echo "Linha: " . $e->getLine() . "<br>";
    echo "Stack trace:<br><pre>" . $e->getTraceAsString() . "</pre>";
}

echo "<br>=== FIM DO DIAGNÓSTICO ===<br>";
echo "<a href='organizadores.php'>Voltar para organizadores</a>";
?>
