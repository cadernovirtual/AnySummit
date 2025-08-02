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

$sql = "SELECT ii.*, 
               i.titulo as ingresso_titulo,
               ii.participante_nome,
               ii.participante_email,
               p.celular as participante_celular
        FROM tb_ingressos_individuais ii
        LEFT JOIN ingressos i ON ii.ingresso_id = i.id
        LEFT JOIN participantes p ON ii.participanteid = p.participanteid
        LEFT JOIN eventos e ON ii.eventoid = e.id
        WHERE ii.pedidoid = ? AND e.contratante_id = ? AND e.usuario_id = ?
        ORDER BY ii.codigo_ingresso";

$stmt = mysqli_prepare($con, $sql);
mysqli_stmt_bind_param($stmt, "iii", $pedido_id, $contratante_id, $usuario_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$ingressos = mysqli_fetch_all($result, MYSQLI_ASSOC);
mysqli_stmt_close($stmt);

if (empty($ingressos)) {
    echo '<div style="color: #FF5252; text-align: center;">Nenhum ingresso encontrado para este pedido</div>';
    exit;
}

// Calcular estatísticas
$total_ingressos = count($ingressos);
$ingressos_usados = 0;
$ingressos_com_participante = 0;
$valor_total = 0;

foreach ($ingressos as $ingresso) {
    if ($ingresso['utilizado']) $ingressos_usados++;
    if ($ingresso['participante_nome']) $ingressos_com_participante++;
    $valor_total += $ingresso['preco_unitario'];
}
?>

<div style="color: #FFFFFF;">
    <h4 style="color: #E0E0E8; margin-bottom: 15px; font-size: 16px;">🎫 Ingressos Individuais</h4>
    
    <!-- Estatísticas dos ingressos -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px;">
        <div style="background: rgba(0, 194, 255, 0.1); padding: 12px; border-radius: 10px; text-align: center; border: 1px solid rgba(0, 194, 255, 0.2);">
            <div style="font-size: 20px; font-weight: 700; color: #00C2FF; margin-bottom: 4px;"><?php echo $total_ingressos; ?></div>
            <div style="font-size: 11px; color: #B8B8C8; text-transform: uppercase;">Total</div>
        </div>
        <div style="background: rgba(0, 200, 81, 0.1); padding: 12px; border-radius: 10px; text-align: center; border: 1px solid rgba(0, 200, 81, 0.2);">
            <div style="font-size: 20px; font-weight: 700; color: #00C851; margin-bottom: 4px;"><?php echo $ingressos_usados; ?></div>
            <div style="font-size: 11px; color: #B8B8C8; text-transform: uppercase;">Utilizados</div>
        </div>
        <div style="background: rgba(114, 94, 255, 0.1); padding: 12px; border-radius: 10px; text-align: center; border: 1px solid rgba(114, 94, 255, 0.2);">
            <div style="font-size: 20px; font-weight: 700; color: #725EFF; margin-bottom: 4px;"><?php echo $ingressos_com_participante; ?></div>
            <div style="font-size: 11px; color: #B8B8C8; text-transform: uppercase;">Com Participante</div>
        </div>
        <div style="background: rgba(255, 193, 7, 0.1); padding: 12px; border-radius: 10px; text-align: center; border: 1px solid rgba(255, 193, 7, 0.2);">
            <div style="font-size: 16px; font-weight: 700; color: #FFC107; margin-bottom: 4px;">R$ <?php echo number_format($valor_total, 2, ',', '.'); ?></div>
            <div style="font-size: 11px; color: #B8B8C8; text-transform: uppercase;">Valor Total</div>
        </div>
    </div>

    <!-- Lista de ingressos -->
    <div style="max-height: 400px; overflow-y: auto;">
        <?php foreach ($ingressos as $ingresso): ?>
        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 15px;">
                <div style="flex: 1;">
                    <!-- Cabeçalho do ingresso -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                        <div>
                            <h5 style="color: #00C2FF; margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">
                                🎫 <?php echo htmlspecialchars($ingresso['titulo_ingresso']); ?>
                            </h5>
                            <div style="font-size: 13px; color: #B8B8C8; font-family: monospace;">
                                Código: <span style="color: #FFFFFF; font-weight: 600;"><?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?></span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                            <?php if ($ingresso['utilizado']): ?>
                                <span style="background: rgba(0, 200, 81, 0.2); color: #00C851; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                                    ✅ USADO
                                </span>
                            <?php else: ?>
                                <span style="background: rgba(255, 193, 7, 0.2); color: #FFC107; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                                    ⏳ DISPONÍVEL
                                </span>
                            <?php endif; ?>
                            <div style="font-weight: 600; color: #00C851; font-size: 16px;">
                                R$ <?php echo number_format($ingresso['preco_unitario'], 2, ',', '.'); ?>
                            </div>
                        </div>
                    </div>

                    <!-- Dados do participante -->
                    <?php if ($ingresso['participante_nome']): ?>
                    <div style="background: rgba(114, 94, 255, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(114, 94, 255, 0.2); margin-bottom: 12px;">
                        <div style="font-size: 12px; color: #B8B8C8; text-transform: uppercase; margin-bottom: 8px;">👤 Participante Associado</div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px;">
                            <div>
                                <div style="font-size: 11px; color: #B8B8C8; margin-bottom: 2px;">Nome</div>
                                <div style="font-weight: 500; color: #FFFFFF;"><?php echo htmlspecialchars($ingresso['participante_nome']); ?></div>
                            </div>
                            <div>
                                <div style="font-size: 11px; color: #B8B8C8; margin-bottom: 2px;">Email</div>
                                <div style="font-weight: 500; color: #FFFFFF;"><?php echo htmlspecialchars($ingresso['participante_email']); ?></div>
                            </div>
                            <?php if ($ingresso['participante_celular']): ?>
                            <div>
                                <div style="font-size: 11px; color: #B8B8C8; margin-bottom: 2px;">Celular</div>
                                <div style="font-weight: 500; color: #FFFFFF;">📱 <?php echo htmlspecialchars($ingresso['participante_celular']); ?></div>
                            </div>
                            <?php endif; ?>
                        </div>
                    </div>
                    <?php else: ?>
                    <div style="background: rgba(255, 193, 7, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(255, 193, 7, 0.2); margin-bottom: 12px;">
                        <div style="color: #FFC107; font-size: 13px; text-align: center;">
                            ⚠️ Nenhum participante associado ainda
                        </div>
                    </div>
                    <?php endif; ?>

                    <!-- Dados de uso -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; font-size: 12px;">
                        <div>
                            <div style="color: #B8B8C8; margin-bottom: 2px;">Criado em</div>
                            <div style="color: #FFFFFF; font-weight: 500;">
                                <?php 
                                $criado = new DateTime($ingresso['criado_em']);
                                echo $criado->format('d/m/Y H:i');
                                ?>
                            </div>
                        </div>
                        
                        <?php if ($ingresso['utilizado'] && $ingresso['data_utilizacao']): ?>
                        <div>
                            <div style="color: #B8B8C8; margin-bottom: 2px;">Usado em</div>
                            <div style="color: #00C851; font-weight: 500;">
                                <?php 
                                $usado = new DateTime($ingresso['data_utilizacao']);
                                echo $usado->format('d/m/Y H:i');
                                ?>
                            </div>
                        </div>
                        <?php endif; ?>
                        
                        <div>
                            <div style="color: #B8B8C8; margin-bottom: 2px;">Hash de Validação</div>
                            <div style="color: #FFFFFF; font-weight: 500; font-family: monospace; font-size: 10px; word-break: break-all;">
                                <?php echo substr($ingresso['hash_validacao'] ?? 'N/A', 0, 16); ?>...
                            </div>
                        </div>
                    </div>

                    <!-- QR Code (se existir) -->
                    <?php if ($ingresso['qr_code_data']): ?>
                    <div style="margin-top: 12px; text-align: center;">
                        <button onclick="mostrarQRCode('<?php echo htmlspecialchars($ingresso['codigo_ingresso']); ?>', '<?php echo htmlspecialchars($ingresso['qr_code_data']); ?>')" 
                                style="background: rgba(0, 194, 255, 0.2); border: 1px solid rgba(0, 194, 255, 0.3); color: #00C2FF; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.3s ease;">
                            📱 Mostrar QR Code
                        </button>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>

    <!-- Resumo final -->
    <div style="background: rgba(0, 194, 255, 0.1); padding: 15px; border-radius: 12px; border: 1px solid rgba(0, 194, 255, 0.2); margin-top: 20px;">
        <div style="text-align: center;">
            <div style="font-size: 14px; color: #B8B8C8; margin-bottom: 8px;">📊 Resumo dos Ingressos</div>
            <div style="display: flex; justify-content: space-around; text-align: center;">
                <div>
                    <div style="font-size: 16px; font-weight: 600; color: #00C2FF;"><?php echo $total_ingressos; ?></div>
                    <div style="font-size: 11px; color: #B8B8C8;">Total</div>
                </div>
                <div>
                    <div style="font-size: 16px; font-weight: 600; color: #00C851;"><?php echo $ingressos_usados; ?></div>
                    <div style="font-size: 11px; color: #B8B8C8;">Utilizados</div>
                </div>
                <div>
                    <div style="font-size: 16px; font-weight: 600; color: #725EFF;"><?php echo $ingressos_com_participante; ?></div>
                    <div style="font-size: 11px; color: #B8B8C8;">Com Participante</div>
                </div>
                <div>
                    <div style="font-size: 16px; font-weight: 600; color: #FFC107;">
                        <?php echo $total_ingressos > 0 ? number_format((($ingressos_usados / $total_ingressos) * 100), 1) : 0; ?>%
                    </div>
                    <div style="font-size: 11px; color: #B8B8C8;">Taxa de Uso</div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function mostrarQRCode(codigo, dados) {
    // Criar modal para QR Code
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        backdrop-filter: blur(4px);
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: rgba(42, 42, 56, 0.98);
        padding: 20px;
        border-radius: 16px;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
    `;
    
    content.innerHTML = `
        <h3 style="color: #FFFFFF; margin: 0 0 15px 0;">QR Code do Ingresso</h3>
        <div style="color: #B8B8C8; font-size: 14px; margin-bottom: 15px;">Código: ${codigo}</div>
        <div id="qrcode-container" style="margin: 15px 0; padding: 15px; background: white; border-radius: 10px; display: inline-block;"></div>
        <div style="margin-top: 15px;">
            <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
                    style="background: rgba(255, 82, 82, 0.2); border: 1px solid rgba(255, 82, 82, 0.3); color: #FF5252; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
                Fechar
            </button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Gerar QR Code usando a biblioteca
    try {
        const qrContainer = content.querySelector('#qrcode-container');
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrContainer, {
                text: dados,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#FFFFFF",
                correctLevel: QRCode.CorrectLevel.M
            });
        } else {
            qrContainer.innerHTML = '<div style="color: #FF5252;">Biblioteca QRCode não carregada</div>';
        }
    } catch (error) {
        content.querySelector('#qrcode-container').innerHTML = '<div style="color: #FF5252;">Erro ao gerar QR Code</div>';
    }
    
    // Fechar ao clicar fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}
</script>
