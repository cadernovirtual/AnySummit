<?php
/**
 * Script utilitário para desabilitar notificações de clientes existentes no Asaas
 * Execute este script apenas se necessário para atualizar clientes criados antes das mudanças
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Incluir a API do Asaas
include('AsaasAPI.php');

try {
    // Inicializar API do Asaas
    $asaas = new AsaasAPI('production'); // ou 'sandbox' para teste
    
    echo "<h2>🔧 Utilitário: Desabilitar Notificações de Clientes Asaas</h2>";
    echo "<p><strong>⚠️ ATENÇÃO:</strong> Este script desabilita notificações para TODOS os clientes.</p>";
    echo "<p>Use apenas se necessário para corrigir clientes criados antes das mudanças.</p><hr>";
    
    // Buscar todos os clientes (API do Asaas retorna paginado)
    $offset = 0;
    $limit = 100;
    $totalProcessed = 0;
    $totalUpdated = 0;
    $totalErrors = 0;
    
    do {
        echo "<p>📋 Buscando clientes (offset: {$offset})...</p>";
        
        // Buscar página de clientes via endpoint
        $endpoint = "/customers?offset={$offset}&limit={$limit}";
        
        // Como makeRequest é privado, vamos usar uma abordagem mais simples
        // Fazendo requisição manual
        $url = 'https://api.asaas.com/v3' . $endpoint;
        $headers = [
            'Content-Type: application/json',
            'access_token: $aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojk5NTM1N2ZmLTA3NTctNDM2Yi1hZGUyLTgxMzFjMWZjMDFlODo6JGFhY2hfMjA5ZDAyYWItNGEyOS00MTg1LTg5ZWMtOTJiYzU3NGUxODlm',
            'User-Agent: AsaasAPI-PHP'
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response_text = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($http_code != 200) {
            throw new Exception("Erro ao buscar clientes: HTTP {$http_code}");
        }
        
        $response = json_decode($response_text, true);
        $customers = $response['data'] ?? [];
        
        echo "<p>🔍 Encontrados " . count($customers) . " clientes nesta página.</p>";
        
        foreach ($customers as $customer) {
            $totalProcessed++;
            
            try {
                // Atualizar configurações de notificação
                $asaas->updateCustomerNotifications($customer['id'], true);
                $totalUpdated++;
                
                echo "<p style='color: green'>✅ Cliente atualizado: {$customer['name']} (ID: {$customer['id']})</p>";
                
            } catch (Exception $e) {
                $totalErrors++;
                echo "<p style='color: red'>❌ Erro ao atualizar {$customer['name']}: {$e->getMessage()}</p>";
            }
            
            // Pausa pequena para não sobrecarregar a API
            usleep(100000); // 0.1 segundo
        }
        
        $offset += $limit;
        
    } while (count($customers) == $limit); // Continuar enquanto houver mais páginas
    
    echo "<hr>";
    echo "<h3>📊 Relatório Final:</h3>";
    echo "<p><strong>Total processados:</strong> {$totalProcessed}</p>";
    echo "<p><strong>Atualizados com sucesso:</strong> <span style='color: green'>{$totalUpdated}</span></p>";
    echo "<p><strong>Erros:</strong> <span style='color: red'>{$totalErrors}</span></p>";
    
    if ($totalErrors == 0) {
        echo "<p style='color: green; font-weight: bold'>🎉 Todos os clientes foram atualizados com sucesso!</p>";
    } else {
        echo "<p style='color: orange; font-weight: bold'>⚠️ Alguns clientes tiveram erros. Verifique os logs acima.</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red'><strong>❌ Erro geral:</strong> {$e->getMessage()}</p>";
}

echo "<hr>";
echo "<p><em>Script finalizado em " . date('d/m/Y H:i:s') . "</em></p>";
?>
