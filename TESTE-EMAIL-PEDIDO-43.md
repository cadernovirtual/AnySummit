Por favor, acesse novamente a URL de teste:

**http://anysummit.com.br/evento/api/teste-email-confirmacao.php?pedido_id=43**

Com o debug melhorado, agora poderemos ver:

1. **Logs detalhados** de cada etapa do processo
2. **Erro específico** do SMTP se houver
3. **Verificação passo a passo** dos dados
4. **Logs do error_log** para debug

Após acessar, me informe:

1. Qual erro específico apareceu
2. O que mostraram os logs de debug
3. Se conseguiu identificar em qual etapa falhou

Se não conseguir acessar, posso criar um teste alternativo ou verificar diretamente no servidor.

### Alternativa: Teste Simples

Também criei um teste mais básico que você pode tentar:

```php
// Teste direto da função
include("evento/api/enviar-email-confirmacao.php");
include("evento/conm/conn.php");

$resultado = enviarEmailConfirmacao(43, $con);
echo $resultado === true ? "SUCESSO!" : "ERRO: " . $resultado;
```

Copie e cole isso em um arquivo .php e execute para teste rápido.
