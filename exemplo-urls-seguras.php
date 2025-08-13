<?php
/**
 * EXEMPLO DE IMPLEMENTAÇÃO: URLs Criptografadas
 * 
 * Este arquivo demonstra como implementar URLs seguras em todo o sistema
 * para substituir as URLs que expõem pedido_id
 */

include_once("evento/conm/conn.php");

// Funções de criptografia (copiar para outros arquivos que precisem)
function criptografarPedidoId($pedido_id) {
    $chave = 'AnySummit2025@#$%'; // Chave única do sistema
    return base64_encode(openssl_encrypt($pedido_id, 'AES-128-CTR', $chave, 0, '1234567890123456'));
}

function descriptografarPedidoId($pedido_id_criptografado) {
    $chave = 'AnySummit2025@#$%'; // Mesma chave do sistema
    $pedido_id = openssl_decrypt(base64_decode($pedido_id_criptografado), 'AES-128-CTR', $chave, 0, '1234567890123456');
    return $pedido_id ? $pedido_id : false;
}

// ===============================================
// EXEMPLOS DE USO EM DIFERENTES CONTEXTOS
// ===============================================

// 1. REDIRECIONAMENTO APÓS PAGAMENTO APROVADO (ex: webhook do Asaas)
function redirecionarAposPagamento($pedido_id) {
    $ref_criptografada = criptografarPedidoId($pedido_id);
    $url_segura = "https://anysummit.com.br/evento/pagamento-sucesso.php?ref=" . urlencode($ref_criptografada);
    
    // Usar em redirecionamento
    header("Location: $url_segura");
    exit;
}

// 2. GERAÇÃO DE LINK PARA EMAIL DE CONFIRMAÇÃO
function gerarLinkEmailConfirmacao($pedido_id) {
    $ref_criptografada = criptografarPedidoId($pedido_id);
    $link_seguro = "https://anysummit.com.br/evento/pagamento-sucesso.php?ref=" . urlencode($ref_criptografada);
    
    return $link_seguro;
}

// 3. VALIDAÇÃO EM QUALQUER PÁGINA QUE RECEBE pedido_id
function validarAcessoSeguro() {
    $pedido_id = null;
    $acesso_autorizado = false;
    
    // Tentar descriptografar ref
    if (isset($_GET['ref']) && !empty($_GET['ref'])) {
        $pedido_id = descriptografarPedidoId($_GET['ref']);
        if ($pedido_id) {
            $acesso_autorizado = true;
        }
    }
    
    // Se não conseguiu descriptografar ou não há ref, negar acesso
    if (!$acesso_autorizado) {
        header('Location: /?erro=acesso_negado');
        exit;
    }
    
    return $pedido_id;
}

// ===============================================
// ARQUIVOS QUE PRECISAM SER ATUALIZADOS
// ===============================================

/*
LISTA DE ARQUIVOS PARA ATUALIZAR:

1. /evento/api/pagamento-pix.php
   - Linha de redirecionamento após pagamento aprovado
   - Trocar: header("Location: pagamento-sucesso.php?pedido_id=$pedido_id");
   - Por: header("Location: pagamento-sucesso.php?ref=" . criptografarPedidoId($pedido_id));

2. /evento/api/pagamento-cartao.php
   - Mesma alteração que acima

3. /evento/api/processar-pedido.php
   - Qualquer redirecionamento que use pedido_id

4. /evento/api/webhook-asaas.php (se existir)
   - Redirecionamentos após confirmação de pagamento

5. /evento/api/enviar-email-confirmacao.php
   - Links no email de confirmação
   - Trocar: "pagamento-sucesso.php?pedido_id=$pedido_id"
   - Por: "pagamento-sucesso.php?ref=" . criptografarPedidoId($pedido_id)

6. Templates de email
   - Todos os links que apontam para pagamento-sucesso.php

IMPLEMENTAÇÃO GRADUAL:
1. Adicionar funções de criptografia em todos os arquivos necessários
2. Manter compatibilidade com ambos os formatos (ref e pedido_id) durante transição
3. Atualizar todos os redirecionamentos para usar ref
4. Remover suporte a pedido_id após validação completa
*/

// ===============================================
// TESTE DA IMPLEMENTAÇÃO
// ===============================================

// Exemplo de teste
$pedido_teste = "PED_20250810_68990ab4a8b18";
$ref_criptografada = criptografarPedidoId($pedido_teste);
$pedido_descriptografado = descriptografarPedidoId($ref_criptografada);

echo "<h3>Teste de Criptografia:</h3>";
echo "<p><strong>Pedido Original:</strong> $pedido_teste</p>";
echo "<p><strong>Ref Criptografada:</strong> $ref_criptografada</p>";
echo "<p><strong>Descriptografado:</strong> $pedido_descriptografado</p>";
echo "<p><strong>Teste:</strong> " . ($pedido_teste === $pedido_descriptografado ? "✅ SUCESSO" : "❌ FALHOU") . "</p>";

echo "<h3>URLs de Exemplo:</h3>";
echo "<p><strong>URL Insegura (ANTES):</strong><br>";
echo "https://anysummit.com.br/evento/pagamento-sucesso.php?pedido_id=$pedido_teste</p>";

echo "<p><strong>URL Segura (AGORA):</strong><br>";
echo "https://anysummit.com.br/evento/pagamento-sucesso.php?ref=$ref_criptografada</p>";

?>
