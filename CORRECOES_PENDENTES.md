# CONTEXTO DE CORREÇÕES PENDENTES - AnySummit

## Estado Atual do Sistema

### Problemas Identificados e Status

#### 1. ❌ Validação de Lotes (Etapa 5)
**Problema**: Sistema bloqueia avanço mesmo COM lotes cadastrados
**Arquivo afetado**: `js/forced-fixes.js`
**Causa provável**: A validação está muito agressiva e não está detectando corretamente os lotes criados
**Onde investigar**:
- Função `nextStep` interceptada em `forced-fixes.js`
- Seletor `.lote-card` pode estar incorreto
- Verificar se os lotes estão sendo renderizados com a classe correta

#### 2. ❌ Proteção de Lotes com Ingressos
**Problema**: Permite excluir lotes que têm ingressos associados
**Arquivos afetados**: 
- `js/lote-protection.js`
- `js/forced-fixes.js`
**Causa provável**: 
- Sistema não está persistindo corretamente a associação loteId nos ingressos
- Função `loteTemIngressos` não está encontrando os ingressos
**Onde investigar**:
- Verificar se `dataset.loteId` está sendo salvo nos ticket-items
- Verificar estrutura do cookie `eventoWizard`
- Confirmar se ingressos salvam o loteId na persistência

#### 3. ⚠️ Datas de Lote na Edição (Não testado)
**Status**: Não foi possível testar devido ao bloqueio na etapa 5
**Arquivos relacionados**:
- `js/lote-dates-fix.js`
- `js/edit-modal-fixes.js`
- `js/forced-fixes.js`

#### 4. ⚠️ Ícone de Lixeira no Combo (Não testado)
**Status**: Não foi possível testar devido ao bloqueio na etapa 5
**Arquivos relacionados**:
- `js/criaevento.js` (linha ~4027)
- `js/trash-icon-fix.js`

## Arquivos de Correção Criados

### JavaScript
1. `js/lote-protection.js` - Proteção contra exclusão de lotes
2. `js/combo-tax-fix.js` - Cálculo de taxas em combos
3. `js/lote-dates-fix.js` - Aplicação de datas do lote
4. `js/edit-modal-fixes.js` - Correções para modais de edição
5. `js/preview-update-fix.js` - Atualização do preview em tempo real
6. `js/debug-load.js` - Debug de carregamento
7. `js/final-corrections.js` - Correções finais
8. `js/forced-fixes.js` - Correções forçadas (PROBLEMÁTICO)
9. `js/trash-icon-fix.js` - Correção do ícone de lixeira
10. `js/test-fixes.js` - Testes automáticos

### Modificações em Arquivos Existentes
1. `novoevento.php` - Adicionados todos os scripts com versionamento (?v=<?php echo time(); ?>)
2. `js/criaevento.js` - Várias modificações:
   - Linha ~141: Validação de lotes (PRECISA REVISAR)
   - Linha ~1851: Restauração de ingressos
   - Linha ~4027: Ícone de lixeira em combo

## Investigações Necessárias

### 1. Estrutura de Dados dos Lotes
Verificar como os lotes são renderizados no DOM:
```javascript
// No console, executar:
document.querySelectorAll('.lote-card')
document.querySelectorAll('[data-lote-id]')
```

### 2. Persistência de Ingressos
Verificar estrutura do cookie:
```javascript
// No console, executar:
const saved = getCookie('eventoWizard');
if (saved) {
    const data = JSON.parse(saved);
    console.log('Ingressos salvos:', data.ingressos);
    console.log('Tickets salvos:', data.tickets);
}
```

### 3. Associação Lote-Ingresso
Verificar se ingressos têm loteId:
```javascript
// No console, executar:
document.querySelectorAll('.ticket-item').forEach(item => {
    console.log('Ticket:', item.dataset.ticketId, 'Lote:', item.dataset.loteId);
});
```

## Soluções Propostas

### 1. Para Validação de Lotes
- Remover ou comentar a validação agressiva em `forced-fixes.js`
- Revisar o seletor usado para encontrar lotes
- Adicionar logs para entender o que está acontecendo

### 2. Para Proteção de Lotes
- Verificar se o loteId está sendo salvo ao criar ingressos
- Garantir que a função `saveWizardData` inclui o loteId
- Revisar a função `addTicketToList` para incluir loteId

### 3. Para Datas e Ícone
- Após resolver os problemas acima, testar essas funcionalidades
- Verificar se os overrides estão sendo aplicados corretamente

## Como Retomar

1. **Desabilitar temporariamente** `forced-fixes.js` comentando a linha no HTML
2. **Testar** se consegue avançar da etapa 5
3. **Debugar** a persistência de loteId nos ingressos
4. **Corrigir** a validação para detectar lotes corretamente
5. **Testar** as demais correções

## Comandos Úteis para Debug

```javascript
// Ver todas as funções relacionadas a lotes
console.log('excluirLoteData:', typeof window.excluirLoteData);
console.log('excluirLotePercentual:', typeof window.excluirLotePercentual);
console.log('loteTemIngressos:', typeof window.loteTemIngressos);

// Ver dados do wizard
console.log('Wizard data:', getCookie('eventoWizard'));

// Ver lotes no DOM
console.log('Lotes:', document.querySelectorAll('.lote-card'));

// Ver ingressos e seus lotes
document.querySelectorAll('.ticket-item').forEach((item, i) => {
    console.log(`Ingresso ${i}:`, {
        id: item.dataset.ticketId,
        tipo: item.dataset.ticketType,
        lote: item.dataset.loteId
    });
});
```

## Observações Importantes

- O sistema de persistência usa cookies (`setCookie`/`getCookie`)
- Os dados são salvos na função `saveWizardData` em `criaevento.js`
- A restauração acontece em `restoreWizardData`
- O problema principal parece ser a falta de associação loteId nos ingressos

## Próximos Passos Recomendados

1. Comentar `forced-fixes.js` para desbloquear navegação
2. Investigar por que loteId não está sendo persistido
3. Corrigir validação de lotes para não bloquear quando há lotes
4. Testar proteção de lotes após corrigir persistência
5. Verificar datas e ícone de lixeira
