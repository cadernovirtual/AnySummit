<?php
// Debug para verificar o salvamento dos combos
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');

// Receber dados JSON
$json_input = file_get_contents('php://input');
$dados = json_decode($json_input, true);

// Log completo dos dados recebidos
$log_file = 'logs/debug_combo_' . date('Y-m-d_H-i-s') . '.json';
file_put_contents($log_file, json_encode([
    'timestamp' => date('Y-m-d H:i:s'),
    'raw_input' => $json_input,
    'parsed_data' => $dados,
    'combos' => $dados['combos'] ?? [],
    'ingressos' => $dados['ingressos'] ?? []
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

// Resposta detalhada
$response = [
    'success' => true,
    'message' => 'Debug executado',
    'log_file' => $log_file,
    'combos_received' => count($dados['combos'] ?? []),
    'combo_details' => []
];

// Detalhar cada combo
if (!empty($dados['combos'])) {
    foreach ($dados['combos'] as $idx => $combo) {
        $response['combo_details'][] = [
            'index' => $idx,
            'titulo' => $combo['titulo'] ?? 'SEM TÍTULO',
            'tem_itens' => !empty($combo['itens']),
            'qtd_itens' => count($combo['itens'] ?? []),
            'estrutura_itens' => $combo['itens'] ?? []
        ];
    }
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>