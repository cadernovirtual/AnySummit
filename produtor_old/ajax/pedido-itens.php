<?php
include("../check_login.php");
include("../conm/conn.php");

$pedido_id = $_GET['id'] ?? 0;

if (!$pedido_id) {
    echo '<div style="color: #FF5252; text-align: center;">Pedido não encontrado</div>';
    exit;
}

// Verificar se o pedido pertence ao usuário
$contratante_id = $_COOKIE['contratanteid'] ?? 0;
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

$sql = "SELECT ip.*, 
               i.titulo as ingresso_titulo,
               i.descricao as ingresso_descricao
        FROM tb_itens_pedido ip
        LEFT JOIN ingressos i ON ip.ingresso_id = i.id
        LEFT JOIN eventos e ON ip.eventoid = e.id
        WHERE ip.pedidoid = ? AND e.contratante_id = ? AND e.usuario_id = ?
        ORDER BY ip.id";

$stmt = mysqli_prepare($con, $sql);
mysqli_stmt_bind_param($stmt, "iii", $pedido_id, $contratante_id, $usuario_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$itens = mysqli_fetch_all($result, MYSQLI_ASSOC);
mysqli_stmt_close($stmt);

if (empty($itens)) {
    echo '<div style="color: #FF5252; text-align: center;">Nenhum item encontrado para este pedido</div>';
    exit;
}

// Calcular totais
$total_quantidade = 0;
$total_valor = 0;
foreach ($itens as $item) {
    $total_quantidade += $item['quantidade'];
    $total_valor += $item['subtotal'];
}
?>

<div style="color: #FFFFFF;">
    <h4 style="color: #E0E0E8; margin-bottom: 15px; font-size: 16px;">📋 Itens do Pedido</h4>
    
    <!-- Lista de itens -->
    <div style="margin-bottom: 20px;">
        <?php foreach ($itens as $item): ?>
        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 15px;">
                <div style="flex: 1;">
                    <h5 style="color: #00C2FF; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                        🎫 <?php echo htmlspecialchars($item['ingresso_titulo']); ?>
                    </h5>
                    <?php if ($item['ingresso_descricao']): ?>
                    <p style="color: #B8B8C8; margin: 0 0 12px 0; font-size: 14px; line-height: 1.4;">
                        <?php echo nl2br(htmlspecialchars($item['ingresso_descricao'])); ?>
                    </p>
                    <?php endif; ?>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-top: 12px;">
                        <div>
                            <div style="font-size: 12px; color: #B8B8C8; text-transform: uppercase; margin-bottom: 4px;">Quantidade</div>
                            <div style="font-weight: 600; color: #FFFFFF; font-size: 18px;"><?php echo number_format($item['quantidade']); ?>x</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: #B8B8C8; text-transform: uppercase; margin-bottom: 4px;">Preço Unitário</div>
                            <div style="font-weight: 500; color: #FFFFFF;">R$ <?php echo number_format($item['preco_unitario'], 2, ',', '.'); ?></div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: #B8B8C8; text-transform: uppercase; margin-bottom: 4px;">Subtotal</div>
                            <div style="font-weight: 600; color: #00C851; font-size: 18px;">R$ <?php echo number_format($item['subtotal'], 2, ',', '.'); ?></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>

    <!-- Resumo total -->
    <div style="background: rgba(0, 194, 255, 0.1); padding: 15px; border-radius: 12px; border: 1px solid rgba(0, 194, 255, 0.2);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="font-size: 14px; color: #B8B8C8; margin-bottom: 4px;">Total de Itens</div>
                <div style="font-weight: 600; font-size: 18px; color: #00C2FF;">
                    <?php echo number_format($total_quantidade); ?> ingressos
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 14px; color: #B8B8C8; margin-bottom: 4px;">Valor Total</div>
                <div style="font-weight: 700; font-size: 24px; color: #00C851;">
                    R$ <?php echo number_format($total_valor, 2, ',', '.'); ?>
                </div>
            </div>
        </div>
    </div>

    <!-- Botão para ver ingressos gerados -->
    <div style="text-align: center; margin-top: 20px;">
        <button onclick="verIngressos(<?php echo $pedido_id; ?>)" 
                style="background: linear-gradient(135deg, #00C2FF, #725EFF); border: none; color: white; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s ease;">
            🎫 Ver Ingressos Individuais Gerados
        </button>
    </div>
</div>