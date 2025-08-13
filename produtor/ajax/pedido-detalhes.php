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

// Ajustar verificação dependendo dos cookies disponíveis
if ($contratante_id > 0) {
    // Verificação completa com contratante e usuário
    $sql = "SELECT p.*, 
                   c.nome as comprador_nome,
                   c.email as comprador_email,
                   c.celular as comprador_celular,
                   c.cpf, c.cnpj, c.tipo_documento,
                   c.cep, c.endereco, c.numero, c.complemento,
                   c.bairro, c.cidade, c.estado, c.telefone,
                   e.nome as evento_nome
            FROM tb_pedidos p
            LEFT JOIN compradores c ON p.compradorid = c.id
            LEFT JOIN eventos e ON p.eventoid = e.id
            WHERE p.pedidoid = ? AND e.contratante_id = ? AND e.usuario_id = ?";
    
    $stmt = mysqli_prepare($con, $sql);
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "iii", $pedido_id, $contratante_id, $usuario_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $pedido = mysqli_fetch_assoc($result);
        mysqli_stmt_close($stmt);
    } else {
        $pedido = false;
        error_log("Erro na query pedido-detalhes (modo completo): " . mysqli_error($con));
    }
} else {
    // Verificação apenas com usuário (quando contratante_id não disponível)
    $sql = "SELECT p.*, 
                   c.nome as comprador_nome,
                   c.email as comprador_email,
                   c.celular as comprador_celular,
                   c.cpf, c.cnpj, c.tipo_documento,
                   c.cep, c.endereco, c.numero, c.complemento,
                   c.bairro, c.cidade, c.estado, c.telefone,
                   e.nome as evento_nome
            FROM tb_pedidos p
            LEFT JOIN compradores c ON p.compradorid = c.id
            LEFT JOIN eventos e ON p.eventoid = e.id
            WHERE p.pedidoid = ? AND e.usuario_id = ?";
    
    $stmt = mysqli_prepare($con, $sql);
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "ii", $pedido_id, $usuario_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $pedido = mysqli_fetch_assoc($result);
        mysqli_stmt_close($stmt);
    } else {
        $pedido = false;
        error_log("Erro na query pedido-detalhes (modo usuario): " . mysqli_error($con));
    }
}

if (!$pedido) {
    echo '<div style="color: #FF5252; text-align: center;">Pedido não encontrado ou sem permissão</div>';
    exit;
}
?>

<div style="color: #FFFFFF;">
    <!-- Cabeçalho do pedido -->
    <div style="background: rgba(0, 194, 255, 0.1); padding: 15px; border-radius: 12px; margin-bottom: 20px; border: 1px solid rgba(0, 194, 255, 0.2);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0; color: #00C2FF;">Pedido <?php echo htmlspecialchars($pedido['codigo_pedido']); ?></h3>
            <span class="status-badge status-<?php echo str_replace(' ', '-', strtolower($pedido['status_pagamento'])); ?>" style="padding: 6px 12px; border-radius: 16px; font-size: 11px; font-weight: 600; text-transform: uppercase;">
                <?php echo ucfirst($pedido['status_pagamento']); ?>
            </span>
        </div>
        <div style="color: #B8B8C8; font-size: 14px;">
            📅 Criado em: <?php 
            $data_pedido = new DateTime($pedido['created_at']);
            echo $data_pedido->format('d/m/Y H:i:s');
            ?>
            <?php if ($pedido['updated_at'] && $pedido['updated_at'] !== $pedido['created_at']): ?>
                <br>🔄 Atualizado em: <?php 
                $data_atualizacao = new DateTime($pedido['updated_at']);
                echo $data_atualizacao->format('d/m/Y H:i:s');
                ?>
            <?php endif; ?>
        </div>
    </div>

    <!-- Informações do comprador -->
    <div style="margin-bottom: 20px;">
        <h4 style="color: #E0E0E8; margin-bottom: 10px; font-size: 16px;">👤 Dados do Comprador</h4>
        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div>
                    <div style="font-size: 12px; color: #B8B8C8; text-transform: uppercase; margin-bottom: 4px;">Nome</div>
                    <div style="font-weight: 500;"><?php echo htmlspecialchars($pedido['comprador_nome']); ?></div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #B8B8C8; text-transform: uppercase; margin-bottom: 4px;">Email</div>
                    <div style="font-weight: 500;"><?php echo htmlspecialchars($pedido['comprador_email']); ?></div>
                </div>
                <?php if ($pedido['comprador_celular']): ?>
                <div>
                    <div style="font-size: 12px; color: #B8B8C8; text-transform: uppercase; margin-bottom: 4px;">Celular</div>
                    <div style="font-weight: 500;">📱 <?php echo htmlspecialchars($pedido['comprador_celular']); ?></div>
                </div>
                <?php endif; ?>
                <?php if ($pedido['telefone']): ?>
                <div>
                    <div style="font-size: 12px; color: #B8B8C8; text-transform: uppercase; margin-bottom: 4px;">Telefone</div>
                    <div style="font-weight: 500;">📞 <?php echo htmlspecialchars($pedido['telefone']); ?></div>
                </div>
                <?php endif; ?>
                <div>
                    <div style="font-size: 12px; color: #B8B8C8; text-transform: uppercase; margin-bottom: 4px;">Documento</div>
                    <div style="font-weight: 500;">
                        <?php 
                        if ($pedido['tipo_documento'] === 'cpf' && $pedido['cpf']) {
                            echo 'CPF: ' . htmlspecialchars($pedido['cpf']);
                        } elseif ($pedido['tipo_documento'] === 'cnpj' && $pedido['cnpj']) {
                            echo 'CNPJ: ' . htmlspecialchars($pedido['cnpj']);
                        } else {
                            echo 'Não informado';
                        }
                        ?>
                    </div>
                </div>
            </div>
            
            <?php if ($pedido['endereco']): ?>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="font-size: 12px; color: #B8B8C8; text-transform: uppercase; margin-bottom: 8px;">Endereço</div>
                <div style="font-weight: 500;">
                    📍 <?php echo htmlspecialchars($pedido['endereco']); ?>
                    <?php if ($pedido['numero']): ?>, <?php echo htmlspecialchars($pedido['numero']); ?><?php endif; ?>
                    <?php if ($pedido['complemento']): ?>, <?php echo htmlspecialchars($pedido['complemento']); ?><?php endif; ?>
                    <br>
                    <?php echo htmlspecialchars($pedido['bairro']); ?> - <?php echo htmlspecialchars($pedido['cidade']); ?>/<?php echo htmlspecialchars($pedido['estado']); ?>
                    <?php if ($pedido['cep']): ?> - CEP: <?php echo htmlspecialchars($pedido['cep']); ?><?php endif; ?>
                </div>
            </div>
            <?php endif; ?>
        </div>
    </div>

    <!-- Informações do pedido e pagamento -->
    <div style="margin-bottom: 20px;">
        <h4 style="color: #E0E0E8; margin-bottom: 10px; font-size: 16px;">💰 Informações Financeiras</h4>
        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                <div>
                    <div style="font-size: 12px; color: #B8B8C8; text-transform: uppercase; margin-bottom: 4px;">Valor Total</div>
                    <div style="font-weight: 600; color: #00C851; font-size: 18px;">R$ <?php echo number_format($pedido['valor_total'], 2, ',', '.'); ?></div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #B8B8C8; text-transform: uppercase; margin-bottom: 4px;">Método de Pagamento</div>
                    <div style="font-weight: 500;">
                        <?php if ($pedido['metodo_pagamento'] === 'pix'): ?>
                            🔷 PIX
                        <?php elseif ($pedido['metodo_pagamento'] === 'cartao' || $pedido['metodo_pagamento'] === 'credit'): ?>
                            💳 Cartão de Crédito
                        <?php elseif ($pedido['metodo_pagamento'] === 'boleto'): ?>
                            📄 Boleto Bancário
                        <?php else: ?>
                            <?php 
                            // Transformar outros termos conhecidos
                            $metodo_display = $pedido['metodo_pagamento'];
                            if (strtolower($metodo_display) === 'credit') {
                                $metodo_display = 'Cartão de Crédito';
                            }
                            echo htmlspecialchars($metodo_display); 
                            ?>
                        <?php endif; ?>
                    </div>
                </div>
                <?php if ($pedido['parcelas'] && $pedido['parcelas'] > 1): ?>
                <div>
                    <div style="font-size: 12px; color: #B8B8C8; text-transform: uppercase; margin-bottom: 4px;">Parcelas</div>
                    <div style="font-weight: 500;"><?php echo $pedido['parcelas']; ?>x de R$ <?php echo number_format($pedido['valor_total'] / $pedido['parcelas'], 2, ',', '.'); ?></div>
                </div>
                <?php endif; ?>
                <div>
                    <div style="font-size: 12px; color: #B8B8C8; text-transform: uppercase; margin-bottom: 4px;">Status do Pagamento</div>
                    <div style="font-weight: 500;">
                        <?php 
                        switch($pedido['status_pagamento']) {
                            case 'pago':
                                echo '✅ Pagamento confirmado';
                                break;
                            case 'pendente':
                                echo '⏳ Aguardando pagamento';
                                break;
                            case 'cancelado':
                                echo '❌ Cancelado';
                                break;
                            case 'estornado':
                                echo '↩️ Estornado';
                                break;
                            default:
                                echo ucfirst($pedido['status_pagamento']);
                        }
                        ?>
                    </div>
                </div>
            </div>
            
            <!-- Códigos de aprovação e transação -->
            <?php if ($pedido['codigo_aprovacao'] || $pedido['transacao_id'] || $pedido['asaas_payment_id']): ?>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="font-size: 12px; color: #B8B8C8; text-transform: uppercase; margin-bottom: 8px;">🔐 Códigos de Transação</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
                    <?php if ($pedido['codigo_aprovacao']): ?>
                    <div>
                        <div style="font-size: 11px; color: #B8B8C8; margin-bottom: 2px;">Código de Aprovação</div>
                        <div style="font-weight: 500; color: #00C851; font-family: monospace; font-size: 13px;"><?php echo htmlspecialchars($pedido['codigo_aprovacao']); ?></div>
                    </div>
                    <?php endif; ?>
                    <?php if ($pedido['transacao_id']): ?>
                    <div>
                        <div style="font-size: 11px; color: #B8B8C8; margin-bottom: 2px;">ID da Transação</div>
                        <div style="font-weight: 500; color: #00C2FF; font-family: monospace; font-size: 13px;"><?php echo htmlspecialchars($pedido['transacao_id']); ?></div>
                    </div>
                    <?php endif; ?>
                    <?php if ($pedido['asaas_payment_id']): ?>
                    <div>
                        <div style="font-size: 11px; color: #B8B8C8; margin-bottom: 2px;">ASAAS Payment ID</div>
                        <div style="font-weight: 500; color: #725EFF; font-family: monospace; font-size: 13px;"><?php echo htmlspecialchars($pedido['asaas_payment_id']); ?></div>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
            <?php endif; ?>

            <!-- Informações de taxa de serviço -->
            <?php if (isset($pedido['taxa_servico']) && $pedido['taxa_servico'] > 0): ?>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="font-size: 12px; color: #B8B8C8; text-transform: uppercase; margin-bottom: 8px;">💼 Taxas e Valores</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px;">
                    <div>
                        <div style="font-size: 11px; color: #B8B8C8; margin-bottom: 2px;">Subtotal</div>
                        <div style="font-weight: 500; color: #FFFFFF;">R$ <?php echo number_format($pedido['valor_total'] - $pedido['taxa_servico'], 2, ',', '.'); ?></div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: #B8B8C8; margin-bottom: 2px;">Taxa de Serviço</div>
                        <div style="font-weight: 500; color: #FFC107;">R$ <?php echo number_format($pedido['taxa_servico'], 2, ',', '.'); ?></div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: #B8B8C8; margin-bottom: 2px;">Total</div>
                        <div style="font-weight: 600; color: #00C851; font-size: 16px;">R$ <?php echo number_format($pedido['valor_total'], 2, ',', '.'); ?></div>
                    </div>
                </div>
            </div>
            <?php endif; ?>

            <!-- Informações de data de vencimento (para boleto) -->
            <?php if ($pedido['data_vencimento']): ?>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="font-size: 12px; color: #B8B8C8; text-transform: uppercase; margin-bottom: 8px;">📅 Vencimento</div>
                <div style="font-weight: 500; color: <?php echo (new DateTime($pedido['data_vencimento']) < new DateTime()) ? '#FF5252' : '#FFFFFF'; ?>;">
                    <?php 
                    $vencimento = new DateTime($pedido['data_vencimento']);
                    echo $vencimento->format('d/m/Y H:i');
                    if ($vencimento < new DateTime()) {
                        echo ' ⚠️ VENCIDO';
                    }
                    ?>
                </div>
            </div>
            <?php endif; ?>
        </div>
    </div>

    <!-- Observações ou notas -->
    <?php if ($pedido['observacoes']): ?>
    <div style="margin-bottom: 20px;">
        <h4 style="color: #E0E0E8; margin-bottom: 10px; font-size: 16px;">📝 Observações</h4>
        <div style="background: rgba(255, 193, 7, 0.1); padding: 15px; border-radius: 12px; border: 1px solid rgba(255, 193, 7, 0.2);">
            <div style="color: #FFFFFF; line-height: 1.5;">
                <?php echo nl2br(htmlspecialchars($pedido['observacoes'])); ?>
            </div>
        </div>
    </div>
    <?php endif; ?>

    <!-- Botões de ação -->
    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
        <button onclick="verItens(<?php echo $pedido['pedidoid']; ?>)" 
                style="background: rgba(0, 194, 255, 0.2); border: 1px solid rgba(0, 194, 255, 0.3); color: #00C2FF; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.3s ease;">
            📋 Ver Itens
        </button>
        <button onclick="verIngressos(<?php echo $pedido['pedidoid']; ?>)" 
                style="background: rgba(114, 94, 255, 0.2); border: 1px solid rgba(114, 94, 255, 0.3); color: #725EFF; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.3s ease;">
            🎫 Ver Ingressos
        </button>
        <?php if ($pedido['status_pagamento'] === 'pendente'): ?>
        <button onclick="confirmarPagamento(<?php echo $pedido['pedidoid']; ?>)" 
                style="background: rgba(0, 200, 81, 0.2); border: 1px solid rgba(0, 200, 81, 0.3); color: #00C851; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.3s ease;">
            ✅ Confirmar Pagamento
        </button>
        <?php endif; ?>
        <?php if ($pedido['metodo_pagamento'] === 'boleto' && $pedido['linha_digitavel']): ?>
        <button onclick="mostrarLinhaDigitavel('<?php echo htmlspecialchars($pedido['linha_digitavel']); ?>')" 
                style="background: rgba(255, 193, 7, 0.2); border: 1px solid rgba(255, 193, 7, 0.3); color: #FFC107; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.3s ease;">
            📄 Linha Digitável
        </button>
        <?php endif; ?>
    </div>
</div>

<style>
.status-pago {
    background: rgba(0, 200, 81, 0.2);
    color: #00C851;
}

.status-pendente {
    background: rgba(255, 193, 7, 0.2);
    color: #FFC107;
}

.status-cancelado {
    background: rgba(255, 82, 82, 0.2);
    color: #FF5252;
}

.status-estornado {
    background: rgba(255, 82, 82, 0.2);
    color: #FF5252;
}
</style>

<script>
function mostrarLinhaDigitavel(linhaDigitavel) {
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
        max-width: 500px;
        width: 90%;
    `;
    
    content.innerHTML = `
        <h3 style="color: #FFFFFF; margin: 0 0 15px 0;">📄 Linha Digitável do Boleto</h3>
        <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0; font-family: monospace; font-size: 16px; color: #FFFFFF; word-break: break-all; line-height: 1.5;">
            ${linhaDigitavel}
        </div>
        <div style="margin-top: 15px;">
            <button onclick="navigator.clipboard.writeText('${linhaDigitavel}').then(() => alert('Linha digitável copiada!')).catch(() => alert('Erro ao copiar'))" 
                    style="background: rgba(0, 194, 255, 0.2); border: 1px solid rgba(0, 194, 255, 0.3); color: #00C2FF; padding: 8px 16px; border-radius: 8px; cursor: pointer; margin-right: 10px;">
                📋 Copiar
            </button>
            <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
                    style="background: rgba(255, 82, 82, 0.2); border: 1px solid rgba(255, 82, 82, 0.3); color: #FF5252; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
                Fechar
            </button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Fechar ao clicar fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}
</script>