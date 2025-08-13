# 🧪 COMO TESTAR SEM COMPRAR INGRESSO

## 🚀 MÉTODOS DE TESTE DISPONÍVEIS:

### 1. **SIMULADOR DE WEBHOOK (Recomendado)**
```
Acesse: https://anysummit.com.br/evento/teste-hash-urgente.php

Passos:
1. Escolha um pedido existente na tabela
2. Clique "🚀 SIMULAR CONFIRMAÇÃO DE PAGAMENTO"
3. Clique no botão verde "🎟️ ABRIR PÁGINA DE CONFIRMAÇÃO"
4. ✅ Deve abrir a página SEM pedir login!
```

### 2. **TESTE DIRETO COM CÓDIGO**
```
Na mesma página acima:
1. Digite um código de pedido existente (ex: PED_20250810_123...)
2. Clique "🎯 TESTAR ACESSO DIRETO"
3. ✅ Deve funcionar com o fallback
```

### 3. **TESTE DE HASH MANUAL**
```
Na mesma página:
1. Digite qualquer código no campo "Teste Manual"
2. Clique "Gerar Hash"
3. Teste o link gerado
```

### 4. **TESTE DA API DE HASH**
```
Acesse: https://anysummit.com.br/evento/api/gerar-hash-acesso.php

Envie POST com:
{
  "pedido_id": "PED_20250810_123..."
}

Resposta:
{
  "success": true,
  "hash": "abc123...",
  "url": "pagamento-sucesso.php?h=abc123..."
}
```

## 🎯 O QUE TESTAR:

### ✅ **Deve Funcionar:**
- Página abre SEM pedir login
- Mostra detalhes do pedido
- Permite vincular participantes  
- Mostra ingressos
- Botões funcionam

### ❌ **NÃO Deve Acontecer:**
- Redirecionamento para login
- Página de erro de acesso
- Bloqueio por falta de sessão

## 🔧 CENÁRIOS DE TESTE:

### **Cenário 1: Webhook Simulado**
1. Use o simulador para marcar pedido como "aprovado"
2. Acesse via hash gerado
3. ✅ Deve funcionar perfeitamente

### **Cenário 2: Link de Email**
1. Pegue hash gerado pelo simulador
2. Simule recebimento por email
3. ✅ Deve abrir direto

### **Cenário 3: Fallback**
1. Use código_pedido diretamente
2. ✅ Deve funcionar como fallback

### **Cenário 4: Hash Inválido**
1. Use hash incorreto
2. ✅ Deve mostrar página de erro amigável (não login)

## 🚨 SE DER PROBLEMA:

### **Se redirecionar para login:**
❌ ERRO! O sistema ainda tem problema.

### **Se mostrar "Link Inválido":**
✅ CORRETO! Comportamento esperado para hash inválido.

### **Se não encontrar pedido:**
⚠️ Verificar se código/hash estão corretos.

## 📧 TESTE DE EMAIL:

Para testar o sistema completo de email:
1. Use o simulador
2. Após simular webhook
3. Copie o link gerado
4. ✅ Este seria o link enviado por email

**🎉 PRONTO! Agora você pode testar completamente sem comprar ingresso! 🎉**
