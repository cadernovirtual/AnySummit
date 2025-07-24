# 🧪 INSTRUÇÕES DE TESTE - Sistema de Lotes

## ❌ **Problema Identificado:**
Você está testando na página errada! Os elementos DOM só existem na página do novo evento.

## ✅ **Onde Testar:**

### **❌ NÃO TESTE EM:**
- `/debug_lotes.html` ← Para debug apenas
- Outras páginas do sistema

### **✅ TESTE EM:**
- `/produtor/novoevento.php` ← Página correta!

---

## 🎯 **Processo de Teste Correto:**

### **1. Primeira Etapa - Página Principal:**
```
1. Acesse: /produtor/novoevento.php
2. Preencha Steps 1-4 (informações básicas)
3. Chegue no Step 5 (Lotes) ← AQUI estão os elementos!
4. Abra F12 → Console
5. Digite: window.adicionarLotePorData ← deve mostrar "function"
```

### **2. Segunda Etapa - Teste Funcional:**
```
No Step 5 (Lotes):
1. Clique "➕ Adicionar Lote por Data" ← Deve abrir modal
2. Preencha e crie lote ← Deve aparecer na lista
3. Clique ✏️ (Editar) ← Deve abrir modal de edição
4. Clique 🗑️ (Excluir) ← Deve pedir confirmação
5. Teste o mesmo para lotes por percentual
```

### **3. Terceira Etapa - Debug:**
```
Console (F12):
- Não deve ter erros vermelhos
- Deve mostrar: "Sistema de lotes iniciando..."
- Deve mostrar: "Elementos DOM encontrados..."
```

---

## 🔧 **Se Ainda Houver Problemas:**

### **Verificar Arquivos Carregados:**
```
F12 → Network → Reload
Verificar se carregou:
✅ /produtor/js/lotes.js
✅ /produtor/js/criaevento.js
```

### **Verificar Console:**
```javascript
// Digite no console para testar:
console.log(typeof window.adicionarLotePorData);
console.log(document.getElementById('lotesPorDataList'));
console.log(window.lotesData);
```

---

## 📋 **Checklist de Validação:**

### **No Step 5 (Lotes):**
- [ ] ✅ Dois quadros lado a lado visíveis
- [ ] ✅ Tema escuro aplicado  
- [ ] ✅ Botões "Adicionar" funcionam
- [ ] ✅ Modais abrem corretamente
- [ ] ✅ Lotes aparecem na lista
- [ ] ✅ Botões ✏️ e 🗑️ funcionam
- [ ] ✅ Validação funciona (mínimo 1 lote)
- [ ] ✅ Console sem erros

---

## 🚨 **IMPORTANTE:**

1. **Teste SEMPRE em `/produtor/novoevento.php`**
2. **Chegue até o Step 5 antes de testar**
3. **Os elementos só existem nessa página específica**
4. **Debug console é fundamental**

---

## 🎯 **Resultado Esperado:**

Ao chegar no Step 5 da página novoevento.php:
- ✅ Quadros de lotes visíveis
- ✅ Funções window.* disponíveis  
- ✅ Elementos DOM existem
- ✅ Sistema funcional completo

**Se seguir essas instruções, o teste deve passar! 🚀**
