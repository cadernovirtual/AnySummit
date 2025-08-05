# Debug e Solução - Lotes não carregam na edição

## Problema Identificado:

O código estava procurando por elementos com classe `.lote-card`, mas os lotes são renderizados com classe `.lote-item`.

```javascript
// ERRADO
const loteCards = document.querySelectorAll('.lote-card');

// CORRETO
const loteItems = document.querySelectorAll('.lote-item');
```

## Estrutura HTML dos Lotes:

```html
<div class="lote-item" data-id="1753225686844">
    <div class="lote-item-info">
        <div class="lote-item-name">Lote 1</div>
        <div class="lote-item-details">
            01/01/2025 até 31/01/2025
        </div>
    </div>
</div>
```

## Solução Implementada:

1. Mudado para buscar `.lote-item` ao invés de `.lote-card`
2. Ajustado para pegar o ID do atributo `data-id`
3. Ajustado para pegar o nome de `.lote-item-name`
4. Adicionado fallback para usar `window.lotesData` se não houver elementos no DOM

## Para Testar:

1. Crie um lote
2. Crie um ingresso e selecione o lote
3. Clique em editar o ingresso
4. Verifique no console:
   - Deve aparecer "🔍 Lotes encontrados (.lote-item): 1" (ou mais)
   - O dropdown deve mostrar os lotes
   - O lote correto deve ser selecionado

## Estrutura de Dados:

O ID do lote é salvo como número timestamp (ex: 1753225686844) e precisa corresponder exatamente ao `data-id` do elemento `.lote-item`.
