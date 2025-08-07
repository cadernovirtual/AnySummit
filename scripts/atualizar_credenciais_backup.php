<?php
// Script para atualizar todas as credenciais de banco de dados
// Executar apenas uma vez

$credenciais_antigas = [
    'host' => 'anysubd.mysql.dbaas.com.br',
    'user' => 'anysubd',
    'senha' => 'Swko15357523@#',
    'db' => 'anysubd'
];

$credenciais_novas = [
    'host' => 'anysummit.com.br',
    'user' => 'anysummit_user',
    'senha' => 'Miran@Janyne@Gustavo',
    'db' => 'anysummit_db'
];

// Lista de diretórios a processar (apenas os principais)
$diretorios_principais = [
    'D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\produtor_git\conm',
    'D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\produtor_bkp_seguranca_correto\conm',
    'D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\produtor_melhorversao\conm',
    'D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\produtor_backup_05_08_02h_43m\conm'
];

// Função para processar arquivo
function processarArquivo($arquivo, $credenciais_antigas, $credenciais_novas) {
    if (!file_exists($arquivo)) return false;
    
    $conteudo = file_get_contents($arquivo);
    
    // Substituir credenciais
    foreach ($credenciais_antigas as $chave => $valor_antigo) {
        $valor_novo = $credenciais_novas[$chave];
        
        // Padrões a buscar
        $padroes = [
            '"' . $valor_antigo . '"',
            "'" . $valor_antigo . "'",
        ];
        
        $substituicoes = [
            '"' . $valor_novo . '"',
            "'" . $valor_novo . "'",
        ];
        
        $conteudo = str_replace($padroes, $substituicoes, $conteudo);
    }
    
    // Salvar arquivo
    return file_put_contents($arquivo, $conteudo) !== false;
}

echo "Iniciando atualização das credenciais...\n\n";

// Processar arquivos conn.php nos diretórios principais
foreach ($diretorios_principais as $diretorio) {
    $arquivo = $diretorio . '\conn.php';
    
    if (processarArquivo($arquivo, $credenciais_antigas, $credenciais_novas)) {
        echo "✅ Atualizado: $arquivo\n";
    } else {
        echo "❌ Erro/Não encontrado: $arquivo\n";
    }
}

// Lista de arquivos específicos importantes
$arquivos_especificos = [
    'D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\criaeventoapi.php',
    'D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\executar_lotes.php'
];

foreach ($arquivos_especificos as $arquivo) {
    if (processarArquivo($arquivo, $credenciais_antigas, $credenciais_novas)) {
        echo "✅ Atualizado: $arquivo\n";
    } else {
        echo "❌ Erro/Não encontrado: $arquivo\n";
    }
}

echo "\n🎉 Atualização concluída!\n";
echo "\n📝 Credenciais atualizadas para:\n";
echo "Host: {$credenciais_novas['host']}\n";
echo "User: {$credenciais_novas['user']}\n";
echo "Database: {$credenciais_novas['db']}\n";
?>
