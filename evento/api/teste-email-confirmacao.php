<?php
/**
 * Teste do Email de Confirmação de Pagamento - VERSÃO CORRIGIDA
 * Para testar, acesse: /evento/api/teste-email-confirmacao.php?pedido_id=NUMERO_DO_PEDIDO
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

include("../conm/conn.php");
include("enviar-email-confirmacao.php");
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste Email Confirmação</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #f8f9fa; }
        .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .error { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .info { background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .logs { background: #f8f9fa; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px; font-family: monospace; font-size: 12px; max-height: 400px; overflow-y: auto; }
        code { background: #f8f9fa; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>🧪 Teste Email de Confirmação de Pagamento</h1>
    <p><strong>Data/Hora:</strong> <?php echo date('d/m/Y H:i:s'); ?></p>
    <hr>

    <?php
    // Verificar se foi passado um pedido_id
    $pedido_id = $_GET['pedido_id'] ?? null;

    if (!$pedido_id) {
        echo "<h2>❌ Erro: Pedido ID não informado</h2>";
        echo "<p>Use: <code>?pedido_id=NUMERO_DO_PEDIDO</code></p>";
        
        // Listar alguns pedidos disponíveis para teste
        echo "<h3>📋 Pedidos Disponíveis para Teste:</h3>";
        
        $sql_pedidos = "SELECT p.pedidoid, p.codigo_pedido, p.status_pagamento, p.valor_total, c.nome, c.email, e.nome as evento_nome
                        FROM tb_pedidos p 
                        LEFT JOIN compradores c ON p.compradorid = c.id 
                        LEFT JOIN eventos e ON p.eventoid = e.id
                        ORDER BY p.pedidoid DESC 
                        LIMIT 10";
        
        $result = $con->query($sql_pedidos);
        
        if ($result && $result->num_rows > 0) {
            echo "<table>";
            echo "<tr><th>ID</th><th>Código</th><th>Status</th><th>Valor</th><th>Comprador</th><th>Email</th><th>Evento</th><th>Ação</th></tr>";
            
            while ($pedido = $result->fetch_assoc()) {
                $status_color = $pedido['status_pagamento'] === 'pago' ? 'green' : 
                               ($pedido['status_pagamento'] === 'aprovado' ? 'blue' : 'orange');
                
                echo "<tr>";
                echo "<td>" . $pedido['pedidoid'] . "</td>";
                echo "<td>" . htmlspecialchars($pedido['codigo_pedido']) . "</td>";
                echo "<td style='color: $status_color; font-weight: bold;'>" . $pedido['status_pagamento'] . "</td>";
                echo "<td>R$ " . number_format($pedido['valor_total'], 2, ',', '.') . "</td>";
                echo "<td>" . htmlspecialchars($pedido['nome']) . "</td>";
                echo "<td>" . htmlspecialchars($pedido['email']) . "</td>";
                echo "<td>" . htmlspecialchars($pedido['evento_nome']) . "</td>";
                echo "<td><a href='?pedido_id=" . $pedido['pedidoid'] . "'>🧪 Testar</a></td>";
                echo "</tr>";
            }
            
            echo "</table>";
        } else {
            echo "<p>Nenhum pedido encontrado.</p>";
        }
        
        exit;
    }

    echo "<h2>📨 Testando Email para Pedido ID: $pedido_id</h2>";

    // Buscar dados do pedido
    $sql_pedido = "SELECT p.*, c.nome as comprador_nome, c.email as comprador_email
                   FROM tb_pedidos p 
                   LEFT JOIN compradores c ON p.compradorid = c.id 
                   WHERE p.pedidoid = ?";

    $stmt = $con->prepare($sql_pedido);
    $stmt->bind_param("i", $pedido_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo "<div class='error'>";
        echo "<h3>❌ Pedido não encontrado!</h3>";
        echo "<p>Pedido ID $pedido_id não existe no banco de dados.</p>";
        echo "</div>";
        echo "<p><a href='?'>« Voltar</a></p>";
        exit;
    }

    $pedido = $result->fetch_assoc();

    echo "<h3>📋 Dados do Pedido:</h3>";
    echo "<ul>";
    echo "<li><strong>Código:</strong> " . htmlspecialchars($pedido['codigo_pedido']) . "</li>";
    echo "<li><strong>Status:</strong> <span style='color: " . ($pedido['status_pagamento'] === 'pago' ? 'green' : 'orange') . "; font-weight: bold;'>" . $pedido['status_pagamento'] . "</span></li>";
    echo "<li><strong>Comprador:</strong> " . htmlspecialchars($pedido['comprador_nome']) . "</li>";
    echo "<li><strong>Email:</strong> " . htmlspecialchars($pedido['comprador_email']) . "</li>";
    echo "<li><strong>Valor:</strong> R$ " . number_format($pedido['valor_total'], 2, ',', '.') . "</li>";
    echo "<li><strong>Data:</strong> " . date('d/m/Y H:i', strtotime($pedido['data_pedido'])) . "</li>";
    echo "</ul>";

    if (!$pedido['comprador_email']) {
        echo "<div class='error'>";
        echo "<h3>⚠️ Aviso: Email do comprador não encontrado</h3>";
        echo "<p>Não é possível enviar o email pois o comprador não possui email cadastrado.</p>";
        echo "</div>";
        echo "<p><a href='?'>« Voltar</a></p>";
        exit;
    }

    // Tentar enviar o email
    echo "<h3>🚀 Enviando Email...</h3>";
    echo "<p>Destinatário: <strong>" . htmlspecialchars($pedido['comprador_email']) . "</strong></p>";

    try {
        $inicio = microtime(true);
        
        $resultado = enviarEmailConfirmacao($pedido_id, $con);
        
        $tempo = round((microtime(true) - $inicio) * 1000, 2);
        
        if ($resultado === true) {
            echo "<div class='success'>";
            echo "<h4>✅ Email Enviado com Sucesso!</h4>";
            echo "<p>⏱️ Tempo de envio: {$tempo}ms</p>";
            echo "<p>📧 Verifique a caixa de entrada de <strong>" . htmlspecialchars($pedido['comprador_email']) . "</strong></p>";
            echo "</div>";
            
            // Verificar ingressos enviados
            $sql_ingressos = "SELECT COUNT(*) as total, titulo_ingresso 
                              FROM tb_ingressos_individuais 
                              WHERE pedidoid = ? 
                              GROUP BY titulo_ingresso";
            $stmt_ingressos = $con->prepare($sql_ingressos);
            $stmt_ingressos->bind_param("i", $pedido_id);
            $stmt_ingressos->execute();
            $result_ingressos = $stmt_ingressos->get_result();
            
            if ($result_ingressos->num_rows > 0) {
                echo "<h4>🎫 Vouchers Incluídos no Email:</h4>";
                echo "<ul>";
                while ($ingresso = $result_ingressos->fetch_assoc()) {
                    echo "<li>" . $ingresso['total'] . "x " . htmlspecialchars($ingresso['titulo_ingresso']) . "</li>";
                }
                echo "</ul>";
            }
            
        } else {
            echo "<div class='error'>";
            echo "<h4>❌ Erro no Envio do Email</h4>";
            echo "<p><strong>Detalhes:</strong> " . htmlspecialchars($resultado ?: 'Erro desconhecido') . "</p>";
            echo "<p>⏱️ Tempo tentativa: {$tempo}ms</p>";
            echo "</div>";
            
            echo "<div class='info'>";
            echo "<h4>💡 Possíveis Causas:</h4>";
            echo "<ul>";
            echo "<li>Configurações SMTP do servidor</li>";
            echo "<li>Credenciais de email incorretas</li>";
            echo "<li>Bloqueio de firewall na porta 465</li>";
            echo "<li>Problemas com SSL/TLS</li>";
            echo "</ul>";
            echo "</div>";
        }
        
    } catch (Exception $e) {
        echo "<div class='error'>";
        echo "<h4>💥 Erro de Exceção</h4>";
        echo "<p><strong>Mensagem:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
        echo "<p><strong>Linha:</strong> " . $e->getLine() . "</p>";
        echo "<p><strong>Arquivo:</strong> " . htmlspecialchars(basename($e->getFile())) . "</p>";
        echo "</div>";
    }
    ?>

    <hr>
    <p><a href="?">« Testar Outro Pedido</a></p>
    <p><em>Teste executado em <?php echo date('d/m/Y H:i:s'); ?></em></p>

</body>
</html>
