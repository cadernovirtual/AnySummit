# DEBUG - Verificar Persistência

## Problema: Nome do evento aparece como "GUSTAVO CIBIM KALLAJIAN"

### Possíveis causas:

1. **Conflito de IDs**: Pode haver outro elemento com id="eventName" na página
2. **Dados antigos no cookie**: Cookie com dados corrompidos
3. **Campo errado sendo capturado**: Algum campo de perfil do usuário

### Para investigar no console do navegador:

```javascript
// 1. Verificar se há múltiplos elementos com mesmo ID
document.querySelectorAll('#eventName').length

// 2. Ver o valor atual do campo
document.getElementById('eventName').value

// 3. Ver o cookie atual
document.cookie.split(';').find(c => c.includes('eventoWizard'))

// 4. Limpar o cookie corrompido
document.cookie = "eventoWizard=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";

// 5. Verificar se há algum campo com o nome do usuário
Array.from(document.querySelectorAll('input')).filter(i => i.value.includes('GUSTAVO'))
```

### Solução temporária aplicada:
- Adicionado debug no salvamento
- Detecção de nomes de pessoa
- Limpeza automática se detectar nome suspeito

### Correção definitiva:
Precisamos identificar de onde vem esse valor "GUSTAVO CIBIM KALLAJIAN"
