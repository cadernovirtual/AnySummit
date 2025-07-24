# Plano de Correção dos Combos - CORRIGIR_COMBO.md

## Situação Atual

### Problemas Identificados
1. Nome do combo não está com cor azul (falta classe CSS)
2. Informações do lote não aparecem no formato correto
3. Múltiplos arquivos JS criando conflito e sobrescrevendo funções

### Arquivos Envolvidos (Bagunça Atual)
```
produtor/js/
├── criaevento.js (arquivo principal - linha ~2486 cria combo)
├── combo-functions.js (conflito)
├── combo-override.js (conflito)
├── combo-final-fix.js (gambiarra)
├── super-combo-fix.js (gambiarra)
├── lotes-combo-fixes.js (gambiarra)
└── correção-definitiva-combo.js (gambiarra que funcionou)
```

## Plano de Execução

### PASSO 1: Identificar a Origem
1. Abrir `criaevento.js`
2. Localizar função `addComboToList` (linha ~2469)
3. Esta é a função que cria o HTML do combo incorretamente

### PASSO 2: Corrigir na Origem
No arquivo `criaevento.js`, função `addComboToList`, alterar:

**DE:**
```javascript
<div class="ticket-title">
    ${title} 📦
    <span class="ticket-type-badge combo">Combo</span>
</div>
```

**PARA:**
```javascript
<div class="ticket-title">
    <span class="ticket-name">${title}</span>
    <span class="ticket-type-badge combo">(Combo)</span>
    <span class="ticket-lote-info" style="font-size: 11px; color: #666; margin-left: 10px;">
        ${loteNome} - ${tipoLote || 'Por Data'} (${formatDate(startDate)} até ${formatDate(endDate)})
    </span>
</div>
```

### PASSO 3: Remover Duplicação "Inclui:"
Na mesma função, remover estas linhas duplicadas:
```javascript
${description ? `<div class="ticket-description">${description}</div>` : ''}
<div class="combo-items">
    <strong>Inclui:</strong>
    ${comboData.itens.map(item => `${item.quantidade}x ${item.nome}`).join(', ')}
</div>
```

Substituir por apenas:
```javascript
<div class="combo-items" style="margin-top: 10px; padding: 8px 12px; background: #f0f4ff; border-radius: 6px;">
    <strong style="color: #9C27B0;">Inclui:</strong>
    <span style="color: #555; margin-left: 5px;">
        ${comboData.itens.map(item => `${item.quantidade}x ${item.nome}`).join(', ')}
    </span>
</div>
```

### PASSO 4: Adicionar CSS para ticket-name
No arquivo `produtor/novoevento.php`, adicionar no `<style>`:
```css
.ticket-name {
    color: #00C2FF;
    font-weight: 600;
}
```

### PASSO 5: Limpeza de Arquivos
Deletar todos os arquivos de correção desnecessários:
```bash
rm produtor/js/combo-final-fix.js
rm produtor/js/super-combo-fix.js
rm produtor/js/lotes-combo-fixes.js
rm produtor/js/correção-definitiva-combo.js
rm produtor/js/combo-format-fix.js.old
```

### PASSO 6: Remover Scripts do HTML
No arquivo `produtor/novoevento.php`, remover:
```html
<script src="js/combo-final-fix.js"></script>
<script src="js/super-combo-fix.js"></script>
<script src="js/lotes-combo-fixes.js"></script>
<script src="js/correção-definitiva-combo.js"></script>
```

## Resultado Esperado

O combo deve aparecer assim:
```html
<div class="ticket-title">
    <span class="ticket-name">Combo VIP</span>
    <span class="ticket-type-badge combo">(Combo)</span>
    <span class="ticket-lote-info" style="font-size: 11px; color: #666; margin-left: 10px;">
        lote 1 - Por Data (19/07/2025 23:38 até 26/07/2025 23:38)
    </span>
</div>
```

## Código Completo Corrigido

A função `addComboToList` deve ficar assim:
```javascript
function addComboToList(title, quantity, price, comboData, totalItems, description, loteId, loteNome, startDate, endDate) {
    ticketCount++;
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) return;

    const cleanPrice = parseFloat(price.replace(/[R$\s\.]/g, '').replace(',', '.'));
    const tax = cleanPrice * 0.1;
    const receiveAmount = cleanPrice * 0.9;
    
    const taxFormatted = `R$ ${tax.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    const receiveFormatted = `R$ ${receiveAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR') + ' ' + 
               date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
    };
    
    const ticketItem = document.createElement('div');
    ticketItem.className = 'ticket-item';
    ticketItem.dataset.ticketId = ticketCount;
    ticketItem.dataset.comboData = JSON.stringify(comboData);
    
    ticketItem.innerHTML = `
        <div class="ticket-header">
            <div class="ticket-title">
                <span class="ticket-name">${title}</span>
                <span class="ticket-type-badge combo">(Combo)</span>
                <span class="ticket-lote-info" style="font-size: 11px; color: #666; margin-left: 10px;">
                    ${loteNome} - Por Data (${formatDate(startDate)} até ${formatDate(endDate)})
                </span>
            </div>
            <div class="ticket-actions">
                <button class="btn-icon" onClick="editTicket(${ticketCount})" title="Editar">✏️</button>
                <button class="btn-icon" onClick="removeTicket(${ticketCount})" title="Remover">🗑️</button>
            </div>
        </div>
        <div class="ticket-details">
            <div class="ticket-info">
                <span>Quantidade: <strong>${quantity}</strong></span>
                <span>Preço: <strong>${price}</strong></span>
                <span>Taxa: <strong>${taxFormatted}</strong></span>
                <span>Você recebe: <strong>${receiveFormatted}</strong></span>
            </div>
            <div class="combo-items" style="margin-top: 10px; padding: 8px 12px; background: #f0f4ff; border-radius: 6px;">
                <strong style="color: #9C27B0;">Inclui:</strong>
                <span style="color: #555; margin-left: 5px;">
                    ${comboData.itens.map(item => `${item.quantidade}x ${item.nome}`).join(', ')}
                </span>
            </div>
        </div>
    `;
    
    ticketList.appendChild(ticketItem);
    
    ticketItem.ticketData = {
        type: 'combo',
        title: title,
        quantity: quantity,
        price: cleanPrice,
        description: description,
        comboData: comboData
    };
}
```

## Observações Importantes

1. **Não criar mais arquivos de correção** - sempre corrigir na origem
2. **Verificar se há CSS para .ticket-name** - deve ser azul (#00C2FF)
3. **Testar após cada mudança** - não acumular correções
4. **Documentar mudanças** - atualizar STATUS.md

## Checklist Final
- [ ] Função addComboToList corrigida em criaevento.js
- [ ] CSS .ticket-name adicionado
- [ ] Arquivos de correção deletados
- [ ] Scripts removidos do HTML
- [ ] Testado criação de novo combo
- [ ] Formato idêntico aos ingressos pagos