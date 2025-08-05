<?php
// Teste simples da API wizard_evento.php
session_start();

// Log para debug
error_log("=== TESTE wizard_evento.php ===");
error_log("POST: " . print_r($_POST, true));
error_log("SESSION: " . print_r($_SESSION, true));

// Verificar se tem action
if (!isset($_POST['action'])) {
    echo json_encode(['erro' => 'Action não especificada']);
    exit;
}

// Simular resposta para salvar_etapa
if ($_POST['action'] === 'salvar_etapa') {
    // Verificar campos obrigatórios
    if (!isset($_POST['evento_id']) || !isset($_POST['etapa'])) {
        echo json_encode(['erro' => 'Campos obrigatórios faltando']);
        exit;
    }
    
    // Log dos dados recebidos
    error_log("Salvando etapa {$_POST['etapa']} do evento {$_POST['evento_id']}");
    error_log("Dados recebidos: " . print_r($_POST, true));
    
    // Resposta de sucesso simulada
    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Etapa salva com sucesso (teste)'
    ]);
    exit;
}

// Para outras actions
echo json_encode(['erro' => 'Action não implementada: ' . $_POST['action']]);
?>