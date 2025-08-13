# DIAGNÓSTICO: Por que cartões de teste estão sendo recusados?

## 🚨 HIPÓTESES REAIS DO PROBLEMA

### 1. **Problema no mobilePhone**
```
Seu WhatsApp: (34) 99202-4884 → 34992024884
```
- ❌ DDD 34 pode não estar na lista válida do Asaas
- ❌ Telefone obrigatório mesmo sendo "opcional"

### 2. **Problema no address/addressNumber**
```
address: "Avenida 136"
addressNumber: "123"
```
- ❌ Conflito: endereço já tem número e campo separado também

### 3. **Problema no CPF de teste**
```
documento: "167.867.448-69" → "16786744869"
```
- ❌ CPF real em ambiente de teste pode causar conflito

### 4. **Problema na estrutura creditCardHolderInfo**
- ❌ Campo `phone` vazio
- ❌ Campo `addressComplement` vazio
- ❌ Possível incompatibilidade de campos

## 🧪 TESTE DIRETO

Execute: `/evento/api/debug-erro-real.php`

Este arquivo vai capturar o erro EXATO do Asaas com dados mínimos.

## 🎯 SOLUÇÕES A TESTAR

### 1. **Remover mobilePhone se inválido**
```php
// Só adicionar se for válido
if (strlen($mobilePhone) === 11 && substr($mobilePhone, 2, 1) === '9') {
    $data['mobilePhone'] = $mobilePhone;
}
```

### 2. **Simplificar endereço**
```php
'address' => 'Rua Teste',
'addressNumber' => '123',
```

### 3. **CPF de teste válido**
```php
'cpfCnpj' => '12345678901'  // CPF de teste
```

### 4. **Remover campos vazios**
```php
// Não enviar campos vazios
if (!empty($value)) {
    $data[$field] = $value;
}
```

## 🔍 PRÓXIMO PASSO

1. Execute `/evento/api/debug-erro-real.php`
2. Copie o erro EXATO
3. Vamos corrigir especificamente o que o Asaas está rejeitando

**O problema está nos DADOS, não no ambiente!**
