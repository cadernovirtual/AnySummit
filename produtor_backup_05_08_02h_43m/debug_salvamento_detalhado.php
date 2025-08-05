<?php
echo "=== DEBUG ESPECÍFICO SALVAMENTO ===<br>";

// Simular POST real para testar exatamente onde falha
$_POST = [
    'acao' => 'salvar',
    'tipo_pessoa' => 'fisica',
    'nome_fantasia' => 'Teste Debug',
    'cpf' => '123.456.789-00',
    'email_contato' => '',
    'telefone' => '',
    'endereco_completo' => '',
    'tipo_recebimento' => 'pix',
    'chave_pix' => '',
    'banco' => '',
    'agencia' => '',
    'conta' => '',
    'titular_conta' => ''
];

echo "POST simulado criado<br>";

// Includes básicos
try {
    include("check_login.php");
    echo "✅ check_login.php OK<br>";
} catch (Exception $e) {
    echo "❌ Erro check_login: " . $e->getMessage() . "<br>";
    exit;
}

try {
    include_once('conm/conn.php');
    echo "✅ conn.php OK<br>";
} catch (Exception $e) {
    echo "❌ Erro conn: " . $e->getMessage() . "<br>";
    exit;
}

$usuario_id = $_SESSION['usuarioid'];
echo "Usuario ID: $usuario_id<br>";

echo "<br>=== INICIANDO PROCESSAMENTO ===<br>";

if ($_POST && isset($_POST['acao'])) {
    echo "1. POST detectado<br>";
    
    $acao = $_POST['acao'];
    echo "2. Ação: $acao<br>";
    
    if ($acao === 'salvar') {
        echo "3. Entrou no bloco salvar<br>";
        
        try {
            // Tipo de pessoa
            $tipo_pessoa = $_POST['tipo_pessoa'];
            echo "4. Tipo pessoa: $tipo_pessoa<br>";
            
            // Campos do formulário
            $nome_fantasia = trim($_POST['nome_fantasia']);
            echo "5. Nome fantasia: '$nome_fantasia'<br>";
            
            $razao_social = $tipo_pessoa === 'juridica' ? trim($_POST['razao_social'] ?? '') : '';
            $cnpj = $tipo_pessoa === 'juridica' ? trim($_POST['cnpj'] ?? '') : '';
            $cpf = $tipo_pessoa === 'fisica' ? trim($_POST['cpf'] ?? '') : '';
            
            echo "6. CPF: '$cpf', CNPJ: '$cnpj'<br>";
            
            // Validação básica
            echo "7. Iniciando validações...<br>";
            
            if (empty($nome_fantasia)) {
                echo "❌ Nome vazio<br>";
                exit;
            } elseif ($tipo_pessoa === 'fisica' && empty($cpf)) {
                echo "❌ CPF vazio para PF<br>";
                exit;
            } elseif ($tipo_pessoa === 'juridica' && empty($cnpj)) {
                echo "❌ CNPJ vazio para PJ<br>";
                exit;
            } else {
                echo "✅ Validações passaram<br>";
                
                // Campos adicionais
                echo "8. Processando campos adicionais...<br>";
                
                $email_contato = trim($_POST['email_contato'] ?? '');
                $telefone = trim($_POST['telefone'] ?? '');
                $endereco_completo = trim($_POST['endereco_completo'] ?? '');
                $tipo_recebimento = $_POST['tipo_recebimento'] ?? 'pix';
                $chave_pix = trim($_POST['chave_pix'] ?? '');
                $banco = trim($_POST['banco'] ?? '');
                $agencia = trim($_POST['agencia'] ?? '');
                $conta = trim($_POST['conta'] ?? '');
                $titular_conta = trim($_POST['titular_conta'] ?? '');
                
                echo "✅ Campos processados<br>";
                
                // Upload (simplificado para teste)
                echo "9. Processando upload...<br>";
                $logomarca = '';
                echo "✅ Upload processado (vazio para teste)<br>";
                
                // Query - AQUI PODE ESTAR O PROBLEMA
                echo "10. Preparando query INSERT...<br>";
                
                $sql = "INSERT INTO contratantes (
                            nome_fantasia, logomarca, usuario_id, razao_social, cnpj, cpf, email_contato, 
                            telefone, endereco_completo, tipo_recebimento, chave_pix, banco, agencia, 
                            conta, titular_conta, ativo
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)";
                        
                echo "✅ SQL preparado<br>";
                
                $stmt = mysqli_prepare($con, $sql);
                if (!$stmt) {
                    echo "❌ Erro ao preparar statement: " . mysqli_error($con) . "<br>";
                    exit;
                }
                echo "✅ Statement preparado<br>";
                
                // BIND PARAM - VERIFICAR TIPOS E QUANTIDADE
                echo "11. Testando bind_param...<br>";
                echo "Tipos: ssisssssssssss (15 tipos)<br>";
                echo "Valores: nome=$nome_fantasia, logo=$logomarca, user=$usuario_id, etc.<br>";
                
                $bind_result = mysqli_stmt_bind_param($stmt, "ssisssssssssss", 
                    $nome_fantasia, $logomarca, $usuario_id, $razao_social, $cnpj, $cpf, $email_contato, 
                    $telefone, $endereco_completo, $tipo_recebimento, $chave_pix, $banco, $agencia, 
                    $conta, $titular_conta);
                
                if (!$bind_result) {
                    echo "❌ Erro no bind_param: " . mysqli_error($con) . "<br>";
                    exit;
                }
                echo "✅ bind_param OK<br>";
                
                // EXECUTAR - AQUI PODE DAR ERRO
                echo "12. EXECUTANDO query...<br>";
                
                $exec_result = mysqli_stmt_execute($stmt);
                if (!$exec_result) {
                    echo "❌ Erro ao executar: " . mysqli_error($con) . "<br>";
                    echo "❌ Erro stmt: " . mysqli_stmt_error($stmt) . "<br>";
                    exit;
                }
                
                echo "✅ Query executada com sucesso!<br>";
                echo "✅ ID inserido: " . mysqli_insert_id($con) . "<br>";
                
                mysqli_stmt_close($stmt);
                echo "✅ Statement fechado<br>";
            }
            
        } catch (Exception $e) {
            echo "❌ EXCEPTION: " . $e->getMessage() . "<br>";
            echo "❌ Linha: " . $e->getLine() . "<br>";
            exit;
        }
    }
}

echo "<br>🎉 TESTE CONCLUÍDO SEM ERROS!<br>";
echo "<a href='organizadores.php'>Voltar para organizadores</a>";
?>
