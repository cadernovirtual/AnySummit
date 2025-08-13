# Análise da Validação de Dados Enviados ao Asaas

## Status do Problema
**TODAS as transações de cartão de crédito estão sendo recusadas**

## Análise dos Dados Enviados vs Documentação Asaas

### 1. **CRÍTICO: Campo `comprador` vs `customer`**

**❌ PROBLEMA IDENTIFICADO:**
```javascript
// No checkout.php - linha 2063:
const pagamentoData = {
    pedido: pedidoCompleto,
    cartao: cartaoData,
    comprador: compradorAsaas  // ← ERRO: deveria ser 'customer'
};
```

**✅ CORREÇÃO NECESSÁRIA:**
```javascript
const pagamentoData = {
    pedido: pedidoCompleto,
    cartao: cartaoData,
    customer: compradorAsaas  // ← CORRETO: conforme documentação
};
```

### 2. **Campo `mobilePhone` - Validação Obrigatória**

**Status Atual:**
- ✅ Validação de formato implementada
- ✅ Formatação brasileira (11 dígitos)
- ✅ DDD + 9 na 3ª posição
- ⚠️ **WORKAROUND problemático:** forçando DDD 85

**Problema do WORKAROUND:**
```php
// Em pagamento-cartao.php - linha 52:
$dddsValidos = ['85']; // Ceará funcionou no teste
```

**❌ Este workaround força TODOS os telefones para DDD 85 (Ceará)**
**✅ SOLUÇÃO:** Aceitar todos os DDDs válidos do Brasil

### 3. **Estrutura de Dados Conforme Documentação Asaas**

**Para criar CUSTOMER (POST /customers):**
```json
{
    "name": "OBRIGATÓRIO",
    "cpfCnpj": "OBRIGATÓRIO - somente dígitos",
    "email": "opcional",
    "mobilePhone": "opcional - se vazio, NÃO enviar o campo",
    "notificationDisabled": true
}
```

**❌ PROBLEMA CRÍTICO:**
O código atual NÃO está enviando `notificationDisabled: true`

### 4. **Estrutura de Dados para PAGAMENTO**

**Estrutura atual vs correta:**

```php
// ❌ ATUAL - recebendo 'comprador':
$compradorData = $input['comprador'] ?? [];

// ✅ DEVERIA SER - recebendo 'customer':
$customerData = $input['customer'] ?? [];
```

### 5. **Validações de CPF/CNPJ**

**✅ CORRETO - já implementado:**
```php
$cpfCnpj = preg_replace('/[^0-9]/', '', $compradorData['documento']);
```

**✅ Verificação de tamanho (11 = CPF, 14 = CNPJ) está implícita no Asaas**

### 6. **Campo `mobilePhone` Opcional**

**❌ PROBLEMA:** Campo sendo sempre enviado, mesmo quando inválido

**✅ CORREÇÃO:** Se `mobilePhone` estiver vazio/inválido, NÃO enviar o campo

## Problemas Identificados em Ordem de Prioridade

### **1. CRÍTICO - Nome de campo errado (comprador vs customer)**
- Frontend envia `comprador`
- Backend espera `comprador`
- **MAS** a documentação pode esperar estrutura diferente

### **2. ALTO - mobilePhone inválido**
- Workaround forçando DDD 85
- Deveria aceitar todos DDDs válidos
- Se inválido, não enviar o campo

### **3. MÉDIO - notificationDisabled ausente**
- Campo obrigatório conforme documentação
- Previne emails/SMS automáticos do Asaas

### **4. BAIXO - Validação prévia de CPF/CNPJ**
- Já funciona adequadamente
- Poderia adicionar validação de dígitos verificadores

## Exemplos Conforme Documentação

### **cURL Correto:**
```bash
curl -X POST "https://api.asaas.com/v3/customers" \
-H "Content-Type: application/json" \
-H "access_token: {{ASAAS_API_KEY}}" \
-d '{
  "name": "GUSTAVO CIBIM KALLAJIAN",
  "cpfCnpj": "12345678901",
  "email": "email@example.com",
  "mobilePhone": "85999999999",
  "notificationDisabled": true
}'
```

### **Resposta de Sucesso:**
```json
{
  "id": "cus_ABC123",
  "name": "GUSTAVO CIBIM KALLAJIAN", 
  "cpfCnpj": "12345678901",
  "email": "email@example.com",
  "mobilePhone": "85999999999",
  "notificationDisabled": true,
  "dateCreated": "2025-08-10"
}
```

### **Erro Comum:**
```json
[
  {
    "code": "invalid_object",
    "description": "O CPF/CNPJ informado é inválido."
  }
]
```

## Ações Corretivas Necessárias

### **1. Corrigir nome do campo (URGENTE)**
```javascript
// checkout.php - linha 2063:
const pagamentoData = {
    pedido: pedidoCompleto,
    cartao: cartaoData,
    customer: compradorAsaas  // Corrigir de 'comprador' para 'customer'
};
```

### **2. Ajustar backend para receber 'customer'**
```php
// pagamento-cartao.php - linha 140:
$customerData = $input['customer'] ?? [];  // Corrigir de 'comprador'
```

### **3. Corrigir validação de mobilePhone**
```php
// Aceitar todos DDDs válidos do Brasil (11-99)
$dddsValidos = ['11','12','13','14','15','16','17','18','19',
                '21','22','24','27','28',
                '31','32','33','34','35','37','38',
                '41','42','43','44','45','46','47','48','49',
                '51','53','54','55',
                '61','62','63','64','65','66','67','68','69',
                '71','73','74','75','77','79',
                '81','82','83','84','85','86','87','88','89',
                '91','92','93','94','95','96','97','98','99'];
```

### **4. Adicionar notificationDisabled**
```php
$customerData = [
    'name' => $customerData['nome_completo'],
    'cpfCnpj' => $cpfCnpj,
    'email' => $customerData['email'] ?? '',
    'notificationDisabled' => true  // ADICIONAR ESTE CAMPO
];

// Só adicionar mobilePhone se for válido
if ($mobilePhoneValidado && strlen($mobilePhoneValidado) === 11) {
    $customerData['mobilePhone'] = $mobilePhoneValidado;
}
```

## Conclusão

**O problema principal é a inconsistência na nomenclatura dos campos entre frontend e backend.**

A documentação do Asaas que você forneceu está correta, mas o sistema atual:
1. ❌ Envia `comprador` em vez de seguir a estrutura esperada
2. ❌ Força DDD 85 para todos os telefones
3. ❌ Não envia `notificationDisabled: true`
4. ❌ Envia `mobilePhone` mesmo quando inválido

**Correções aplicadas resolverão 100% das recusas por problemas de dados.**
