<?php
/**
 * Funções para geração de links seguros de confirmação de pagamento
 * Sistema baseado em hash como validar-ingresso.php (CORRETO)
 */

// Função para gerar hash de acesso baseado no código do pedido
function gerarHashAcesso($codigo_pedido) {
    $chave_secreta = 'AnySummit2025@#$%';
    return hash('sha256', $codigo_pedido . $chave_secreta);
}

// Função para gerar link seguro de confirmação
function gerarLinkConfirmacao($codigo_pedido) {
    $hash = gerarHashAcesso($codigo_pedido);
    return "https://anysummit.com.br/evento/pagamento-sucesso.php?h=" . $hash;
}

// Exemplo de uso:
// $link_seguro = gerarLinkConfirmacao($pedido['codigo_pedido']);
// 
// O link gerado será:
// https://anysummit.com.br/evento/pagamento-sucesso.php?h=abc123def456...
//
// E funcionará independente de sessões ou autenticação!

?>
