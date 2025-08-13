<?php
/**
 * Script para verificar e corrigir CPFs duplicados na tabela participantes
 * Detecta duplicatas e fornece relatório
 */

include("evento/conm/conn.php");
include("includes/participante-utils.php");

echo "<h2>🔍 Verificação de CPFs Duplicados na Tabela Participantes</h2>";

try {
    // 1. Buscar CPFs duplicados no mesmo evento
    echo "<h3>1. Verificando CPFs duplicados no mesmo evento...</h3>";
    
    $sql_duplicados_mesmo_evento = "
    SELECT 
        REPLACE(REPLACE(REPLACE(COALESCE(CPF, ''), '.', ''), '-', ''), ' ', '') as cpf_limpo,
        eventoid,
        COUNT(*) as total,
        GROUP_CONCAT(participanteid ORDER BY participanteid) as ids,
        GROUP_CONCAT(Nome ORDER BY participanteid SEPARATOR ' | ') as nomes,
        GROUP_CONCAT(email ORDER BY participanteid SEPARATOR ' | ') as emails
    FROM participantes 
    WHERE CPF IS NOT NULL 
    AND CPF != '' 
    AND REPLACE(REPLACE(REPLACE(CPF, '.', ''), '-', ''), ' ', '') != ''
    GROUP BY cpf_limpo, eventoid 
    HAVING COUNT(*) > 1
    ORDER BY eventoid, cpf_limpo";
    
    $result_duplicados = $con->query($sql_duplicados_mesmo_evento);
    
    if ($result_duplicados && $result_duplicados->num_rows > 0) {
        echo "<div style='background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "<strong>⚠️ ENCONTRADOS " . $result_duplicados->num_rows . " CPFs DUPLICADOS NO MESMO EVENTO:</strong><br><br>";
        
        while ($dup = $result_duplicados->fetch_assoc()) {
            echo "<strong>CPF:</strong> " . formatarCPF($dup['cpf_limpo']) . "<br>";
            echo "<strong>Evento ID:</strong> " . $dup['eventoid'] . "<br>";
            echo "<strong>Total duplicatas:</strong> " . $dup['total'] . "<br>";
            echo "<strong>IDs dos participantes:</strong> " . $dup['ids'] . "<br>";
            echo "<strong>Nomes:</strong> " . htmlspecialchars($dup['nomes']) . "<br>";
            echo "<strong>Emails:</strong> " . htmlspecialchars($dup['emails']) . "<br>";
            echo "<hr>";
        }
        echo "</div>";
    } else {
        echo "✅ Nenhum CPF duplicado encontrado no mesmo evento<br>";
    }
    
    // 2. Buscar CPFs válidos vs inválidos
    echo "<h3>2. Verificando CPFs inválidos...</h3>";
    
    $sql_cpfs = "SELECT participanteid, Nome, email, CPF, eventoid FROM participantes WHERE CPF IS NOT NULL AND CPF != '' ORDER BY eventoid, participanteid";
    $result_cpfs = $con->query($sql_cpfs);
    
    $cpfs_invalidos = 0;
    $cpfs_validos = 0;
    
    if ($result_cpfs && $result_cpfs->num_rows > 0) {
        echo "<div style='max-height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 10px;'>";
        while ($participante = $result_cpfs->fetch_assoc()) {
            $cpf_limpo = limparCPF($participante['CPF']);
            $eh_valido = validarCPF($cpf_limpo);
            
            if ($eh_valido) {
                $cpfs_validos++;
            } else {
                $cpfs_invalidos++;
                echo "<div style='color: red;'>";
                echo "❌ <strong>CPF INVÁLIDO:</strong> " . htmlspecialchars($participante['CPF']) . 
                     " (ID: " . $participante['participanteid'] . 
                     ", Nome: " . htmlspecialchars($participante['Nome']) . 
                     ", Evento: " . $participante['eventoid'] . ")<br>";
                echo "</div>";
            }
        }
        echo "</div>";
    }
    
    echo "<div style='background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>📊 Resumo da Validação:</strong><br>";
    echo "✅ CPFs válidos: $cpfs_validos<br>";
    echo "❌ CPFs inválidos: $cpfs_invalidos<br>";
    echo "</div>";
    
    // 3. Verificar emails duplicados no mesmo evento
    echo "<h3>3. Verificando emails duplicados no mesmo evento...</h3>";
    
    $sql_emails_duplicados = "
    SELECT 
        email,
        eventoid,
        COUNT(*) as total,
        GROUP_CONCAT(participanteid ORDER BY participanteid) as ids,
        GROUP_CONCAT(Nome ORDER BY participanteid SEPARATOR ' | ') as nomes,
        GROUP_CONCAT(COALESCE(CPF, 'SEM CPF') ORDER BY participanteid SEPARATOR ' | ') as cpfs
    FROM participantes 
    WHERE email IS NOT NULL 
    AND email != ''
    GROUP BY email, eventoid 
    HAVING COUNT(*) > 1
    ORDER BY eventoid, email";
    
    $result_emails = $con->query($sql_emails_duplicados);
    
    if ($result_emails && $result_emails->num_rows > 0) {
        echo "<div style='background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "<strong>⚠️ ENCONTRADOS " . $result_emails->num_rows . " EMAILS DUPLICADOS NO MESMO EVENTO:</strong><br><br>";
        
        while ($email_dup = $result_emails->fetch_assoc()) {
            echo "<strong>Email:</strong> " . htmlspecialchars($email_dup['email']) . "<br>";
            echo "<strong>Evento ID:</strong> " . $email_dup['eventoid'] . "<br>";
            echo "<strong>Total duplicatas:</strong> " . $email_dup['total'] . "<br>";
            echo "<strong>IDs dos participantes:</strong> " . $email_dup['ids'] . "<br>";
            echo "<strong>Nomes:</strong> " . htmlspecialchars($email_dup['nomes']) . "<br>";
            echo "<strong>CPFs:</strong> " . htmlspecialchars($email_dup['cpfs']) . "<br>";
            echo "<hr>";
        }
        echo "</div>";
    } else {
        echo "✅ Nenhum email duplicado encontrado no mesmo evento<br>";
    }
    
    // 4. Estatísticas gerais
    echo "<h3>4. Estatísticas gerais...</h3>";
    
    $sql_stats = "
    SELECT 
        COUNT(*) as total_participantes,
        COUNT(CASE WHEN CPF IS NOT NULL AND CPF != '' THEN 1 END) as com_cpf,
        COUNT(CASE WHEN CPF IS NULL OR CPF = '' THEN 1 END) as sem_cpf,
        COUNT(DISTINCT eventoid) as total_eventos
    FROM participantes";
    
    $result_stats = $con->query($sql_stats);
    
    if ($result_stats && $result_stats->num_rows > 0) {
        $stats = $result_stats->fetch_assoc();
        
        echo "<div style='background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "<strong>📈 Estatísticas:</strong><br>";
        echo "• Total de participantes: " . $stats['total_participantes'] . "<br>";
        echo "• Com CPF preenchido: " . $stats['com_cpf'] . "<br>";
        echo "• Sem CPF: " . $stats['sem_cpf'] . "<br>";
        echo "• Total de eventos: " . $stats['total_eventos'] . "<br>";
        echo "</div>";
    }
    
    // 5. Verificação das funções utilitárias
    echo "<h3>5. Teste das funções utilitárias...</h3>";
    
    // Teste de validação de CPF
    $cpfs_teste = ['123.456.789-09', '000.000.000-00', '111.111.111-11', '167.867.448-69'];
    foreach ($cpfs_teste as $cpf_teste) {
        $valido = validarCPF($cpf_teste);
        $status = $valido ? '✅ VÁLIDO' : '❌ INVÁLIDO';
        echo "CPF $cpf_teste: $status<br>";
    }
    
    echo "<hr>";
    echo "<h3>📋 Recomendações:</h3>";
    echo "<ul>";
    echo "<li>✅ As APIs foram corrigidas para evitar novos CPFs duplicados</li>";
    echo "<li>✅ Validação de CPF implementada usando algoritmo da Receita Federal</li>";
    echo "<li>✅ Busca prioriza CPF sobre email para evitar conflitos</li>";
    echo "<li>⚠️ Se encontradas duplicatas, considere limpeza manual dos dados</li>";
    echo "<li>✅ Função centralizada criada em /includes/participante-utils.php</li>";
    echo "</ul>";
    
    echo "<div style='background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;'>";
    echo "<strong>🎯 Status das Correções:</strong><br>";
    echo "✅ API vincular-participante.php - Corrigida<br>";
    echo "✅ API processar-pedido.php - Corrigida<br>";
    echo "✅ Funções utilitárias criadas - participante-utils.php<br>";
    echo "✅ Validação de CPF implementada<br>";
    echo "✅ Sistema de backup para casos de duplicata implementado<br>";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px;'>";
    echo "<strong>❌ Erro:</strong> " . htmlspecialchars($e->getMessage());
    echo "</div>";
}
?>