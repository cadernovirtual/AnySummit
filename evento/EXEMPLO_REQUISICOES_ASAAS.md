# Exemplo de Requisições Asaas - Conforme Documentação

## 1. cURL Completo para Criação de Cliente

```bash
curl -X POST "https://api.asaas.com/v3/customers" \
-H "Content-Type: application/json" \
-H "access_token: {{ASAAS_API_KEY}}" \
-d '{
  "name": "{{NOME}}",
  "cpfCnpj": "{{CPF_CNPJ_DIGITOS}}",
  "email": "{{EMAIL_OPCIONAL}}",
  "mobilePhone": "{{MOBILE_OPCIONAL}}",
  "notificationDisabled": true
}'
```

### Substituir os placeholders:
- `{{ASAAS_API_KEY}}` → sua API key do Asaas
- `{{NOME}}` → nome do cliente
- `{{CPF_CNPJ_DIGITOS}}` → CPF/CNPJ somente números (11 ou 14 dígitos)
- `{{EMAIL_OPCIONAL}}` → e-mail do cliente (remover linha se não houver)
- `{{MOBILE_OPCIONAL}}` → celular com DDD (remover linha se não houver)

### Exemplo Real:
```bash
curl -X POST "https://api.asaas.com/v3/customers" \
-H "Content-Type: application/json" \
-H "access_token: $aact_prod_..." \
-d '{
  "name": "João Silva",
  "cpfCnpj": "12345678901",
  "email": "joao@email.com",
  "mobilePhone": "11999999999",
  "notificationDisabled": true
}'
```

## 2. Exemplo em VB.NET (HttpClient)

```vb
Imports System.Net.Http
Imports System.Text
Imports Newtonsoft.Json

Public Async Function CriarClienteAsaas(nome As String, cpfCnpj As String, 
                                       Optional email As String = "", 
                                       Optional mobilePhone As String = "") As Task(Of String)
    
    ' Validar CPF/CNPJ - somente dígitos
    Dim cpfCnpjNumeros As String = Regex.Replace(cpfCnpj, "[^0-9]", "")
    
    ' Verificar tamanho: 11 = CPF, 14 = CNPJ
    If cpfCnpjNumeros.Length <> 11 AndAlso cpfCnpjNumeros.Length <> 14 Then
        Throw New ArgumentException("CPF/CNPJ inválido")
    End If
    
    ' Preparar dados do cliente
    Dim customerData As New Dictionary(Of String, Object) From {
        {"name", nome},
        {"cpfCnpj", cpfCnpjNumeros},
        {"notificationDisabled", True}
    }
    
    ' Adicionar email se não estiver vazio
    If Not String.IsNullOrEmpty(email) Then
        customerData("email") = email
    End If
    
    ' Adicionar mobilePhone se não estiver vazio
    If Not String.IsNullOrEmpty(mobilePhone) Then
        customerData("mobilePhone") = mobilePhone
    End If
    
    ' Converter para JSON
    Dim jsonContent As String = JsonConvert.SerializeObject(customerData)
    
    Using client As New HttpClient()
        ' Headers
        client.DefaultRequestHeaders.Add("access_token", "SUA_API_KEY_AQUI")
        
        ' Content
        Using content As New StringContent(jsonContent, Encoding.UTF8, "application/json")
            Try
                ' Fazer requisição
                Dim response As HttpResponseMessage = Await client.PostAsync("https://api.asaas.com/v3/customers", content)
                Dim responseContent As String = Await response.Content.ReadAsStringAsync()
                
                If response.IsSuccessStatusCode Then
                    ' Sucesso - retornar JSON da resposta
                    Return responseContent
                Else
                    ' Erro - lançar exceção com detalhes
                    Throw New HttpRequestException($"Erro HTTP {response.StatusCode}: {responseContent}")
                End If
                
            Catch ex As Exception
                Throw New Exception($"Erro ao criar cliente: {ex.Message}")
            End Try
        End Using
    End Using
End Function
```

## 3. Exemplo de Resposta de Sucesso

```json
{
  "id": "cus_000125294002",
  "name": "João Silva",
  "cpfCnpj": "12345678901",
  "email": "joao@email.com",
  "mobilePhone": "11999999999",
  "notificationDisabled": true,
  "dateCreated": "2025-08-10"
}
```

## 4. Exemplo de Erro Comum

```json
[
  {
    "code": "invalid_object",
    "description": "O CPF/CNPJ informado é inválido."
  }
]
```

### Outros códigos de erro possíveis:
- `invalid_mobilePhone` - Telefone em formato inválido
- `duplicated_cpfCnpj` - CPF/CNPJ já cadastrado
- `invalid_email` - E-mail em formato inválido

## 5. Observações Importantes

### notificationDisabled: true
- **Desativa notificações automáticas** enviadas pelo Asaas ao cliente
- **Inclui**: e-mail, SMS, voz e WhatsApp
- **NÃO afeta**: webhooks da sua conta (continuam funcionando)
- **Obrigatório** para evitar spam ao cliente

### Validação de mobilePhone
- **Formato brasileiro**: 11 dígitos (DDD + 9 + 8 dígitos)
- **Exemplo válido**: "11999999999" (São Paulo)
- **DDDs válidos**: 11-99 (conforme ANATEL)
- **Se inválido**: não enviar o campo (opcional)

### Validação de CPF/CNPJ
- **CPF**: exatamente 11 dígitos
- **CNPJ**: exatamente 14 dígitos
- **Somente números**: remover pontos, traços, espaços
- **Obrigatório**: sempre validar antes de enviar

## 6. Melhorias Implementadas no Sistema

### ✅ Correções Aplicadas:
1. **Campo 'customer'** em vez de 'comprador' no frontend
2. **notificationDisabled: true** obrigatório
3. **Validação completa de DDDs** do Brasil (11-99)
4. **mobilePhone opcional** - só envia se válido
5. **Estrutura conforme documentação** oficial

### ✅ Resultado:
- **Antes**: Todas as transações recusadas por dados inválidos
- **Depois**: Validação correta conforme Asaas API v3

### 🧪 Para Testar:
Use cartões de teste do Asaas para validar se as correções funcionam:

**Aprovado (Visa)**: 4000 0000 0000 0010
**Aprovado (Mastercard)**: 5555 5555 5555 4444
**Recusado (para teste)**: 4000 0000 0000 0002

CVV: 123, Validade: 12/2030
