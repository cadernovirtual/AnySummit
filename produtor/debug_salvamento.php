<?php
echo "=== DEBUG SALVAMENTO ORGANIZADOR ===<br>";

// Simular dados de POST para testar
$_POST = [
    'acao' => 'salvar',
    'tipo_pessoa' => 'fisica',
    'nome_fantasia' => 'Teste Nome',
    'cpf' => '123.456.789-00',
    'email_contato' => 'teste@teste.com',
    'telefone' => '(11) 99999-9999',
    'endereco_completo' => 'Rua Teste, 123',
    'tipo_recebimento' => 'pix',
    'chave_pix' => 'teste@pix.com'
];

echo "1. Dados POST simulados:<br>";
echo "<pre>" . print_r($_POST, true) . "</pre>";

// Incluir arquivos básicos
include("check_login.php");
include_once('conm/conn.php');

$usuario_id = $_SESSION['usuarioid'];
echo "2. Usuario ID: " . $usuario_id . "<br>";

// Testar processamento passo a passo
echo "3. Testando validação...<br>";

$acao = $_POST['acao'];
echo "- Ação: " . $acao . "<br>";

if ($acao === 'salvar') {
    echo "- Entrou no bloco de salvamento<br>";
    
    // Tipo de pessoa
    $tipo_pessoa = $_POST['tipo_pessoa'];
    echo "- Tipo pessoa: " . $tipo_pessoa . "<br>";
    
    // Campos do formulário
    $nome_fantasia = trim($_POST['nome_fantasia']);
    $razao_social = $tipo_pessoa === 'juridica' ? trim($_POST['razao_social'] ?? '') : '';
    $cnpj = $tipo_pessoa === 'juridica' ? trim($_POST['cnpj'] ?? '') : '';
    $cpf = $tipo_pessoa === 'fisica' ? trim($_POST['cpf'] ?? '') : '';
    
    echo "- Nome fantasia: " . $nome_fantasia . "<br>";
    echo "- CPF: " . $cpf . "<br>";
    echo "- CNPJ: " . $cnpj . "<br>";
    
    // Validação básica
    echo "4. Testando validações...<br>";
    
    if (empty($nome_fantasia)) {
        echo "❌ Nome é obrigatório<br>";
    } elseif ($tipo_pessoa === 'fisica' && empty($cpf)) {
        echo "❌ CPF é obrigatório para pessoa física<br>";
    } elseif ($tipo_pessoa === 'juridica' && empty($cnpj)) {
        echo "❌ CNPJ é obrigatório para pessoa jurídica<br>";
    } else {
        echo "✅ Validações passaram<br>";
        
        // Testar preparação da query
        echo "5. Testando query INSERT...<br>";
        
        $sql = "INSERT INTO contratantes (
                    nome_fantasia, logomarca, usuario_id, razao_social, cnpj, cpf, email_contato, 
                    telefone, endereco_completo, tipo_recebimento, chave_pix, banco, agencia, 
                    conta, titular_conta, ativo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        echo "- SQL preparado: OK<br>";
        
        $stmt = mysqli_prepare($con, $sql);
        if (!$stmt) {
            echo "❌ Erro ao preparar statement: " . mysqli_error($con) . "<br>";
        } else {
            echo "✅ Statement preparado com sucesso<br>";
            
            // Testar bind_param
            $logomarca = '';
            $email_contato = trim($_POST['email_contato'] ?? '');
            $telefone = trim($_POST['telefone'] ?? '');
            $endereco_completo = trim($_POST['endereco_completo'] ?? '');
            $tipo_recebimento = $_POST['tipo_recebimento'] ?? 'pix';
            $chave_pix = trim($_POST['chave_pix'] ?? '');
            $banco = '';
            $agencia = '';
            $conta = '';
            $titular_conta = '';
            $ativo = 1;
            
            echo "6. Testando bind_param...<br>";
            echo "- Parâmetros: nome=$nome_fantasia, logo=$logomarca, user=$usuario_id, etc.<br>";
            
            $bind_result = mysqli_stmt_bind_param($stmt, "ssisssssssssssi", 
                $nome_fantasia, $logomarca, $usuario_id, $razao_social, $cnpj, $cpf, $email_contato, 
                $telefone, $endereco_completo, $tipo_recebimento, $chave_pix, $banco, $agencia, 
                $conta, $titular_conta, $ativo);
            
            if (!$bind_result) {
                echo "❌ Erro no bind_param: " . mysqli_error($con) . "<br>";
            } else {
                echo "✅ bind_param executado com sucesso<br>";
                
                // NÃO EXECUTAR A QUERY (apenas testar até aqui)
                echo "7. ⚠️ Query não será executada (apenas teste)<br>";
                echo "✅ TESTE CONCLUÍDO - Problema não está na preparação<br>";
            }
            
            mysqli_stmt_close($stmt);
        }
    }
}

echo "<br>=== FIM DEBUG SALVAMENTO ===";
?>
