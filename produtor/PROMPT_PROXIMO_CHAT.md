# PROMPT PARA NOVO CHAT - CORREÇÃO ETAPA 6: DOM ESPELHO DO MYSQL

## 🎯 OBJETIVO
Fazer com que o DOM da lista de ingressos seja sempre um **espelho exato da tabela `ingressos` do MySQL**. Todas as operações (inserção, edição, exclusão, carregamento) devem sempre partir de dados recém-lidos do banco, nunca usar IDs temporários ou dados em memória.

## 📋 CONTEXTO ATUAL DO SISTEMA

### **Localização do Projeto**
- **Pasta**: `D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\produtor`
- **Arquivo principal**: `novoevento.php`
- **Banco**: MySQL hospedado no Supabase

### **Etapa 5 (Lotes) - 100% FUNCIONAL** 
**🚫 NÃO MEXER EM NADA DA ETAPA 5** - Sistema de lotes está perfeito:
- `js/sistema-lotes-mysql.js` ✅ INTOCADO
- `js/interface-lotes-mysql.js` ✅ INTOCADO  
- `ajax/wizard_evento.php` (APIs de lotes) ✅ INTOCADO
- Função `window.carregarLotesDoBanco()` ✅ FUNCIONANDO

### **Problema Atual da Etapa 6**
O sistema está **misturando dados temporários do DOM com dados reais do MySQL**:

1. **Carregamento**: Usa dados do MySQL ✅
2. **Inserções**: Algumas usam MySQL, outras criam apenas no DOM ❌
3. **Exclusões**: Algumas excluem do MySQL, outras apenas do DOM ❌
4. **Resultado**: DOM não reflete a tabela `ingressos` real ❌

## 🔍 DIAGNÓSTICO TÉCNICO

### **Arquivos Envolvidos na Etapa 6**

#### **1. Carregamento de Dados (FUNCIONA CORRETO)**
- **`js/criaevento.js`**: Função `restoreWizardData()` 
- **Usa**: `addTicketToList()` com dados do MySQL
- **Status**: ✅ CORRETO - IDs reais do banco

#### **2. Inserção de Ingressos (PROBLEMÁTICO)**
- **`js/ticket-functions-fix.js`**: Funções `createPaidTicket()` e `createFreeTicket()`
- **Problema**: Usam `addTicketToList()` mas com IDs automáticos temporários
- **Status**: ❌ PROBLEMÁTICO - Não salvam no MySQL imediatamente

#### **3. Exclusão de Ingressos (PROBLEMÁTICO)**
- **`js/ticket-functions-fix.js`**: Função `removeTicket()`
- **Problema**: Só remove do DOM (`ticketElement.remove()`), não do MySQL
- **Status**: ❌ PROBLEMÁTICO - Inconsistência DOM vs MySQL

#### **4. Edição de Ingressos (PROBLEMÁTICO)**
- **`js/ticket-functions-fix.js`**: Função `editTicket()`
- **Problema**: Só mostra alert, não implementada
- **Status**: ❌ PROBLEMÁTICO - Não funciona

#### **5. Sistema de Banco (EXISTE MAS NÃO É USADO)**
- **`js/sistema-ingressos-etapa6-corrigido.js`**: Funções com MySQL
- **Problema**: Tem funções corretas mas não são chamadas pelas operações
- **Status**: ⚠️ EXISTE MAS NÃO É INTEGRADO

### **APIs Disponíveis (FUNCIONAM)**
- **`/produtor/ajax/wizard_evento.php`**:
  - `action=salvar_ingresso` ✅ FUNCIONA
  - `action=excluir_ingresso` ✅ FUNCIONA  
  - `action=recuperar_evento_simples` ✅ FUNCIONA
  - `action=atualizar_ingresso` ✅ FUNCIONA

## 🎯 PLANO DE CORREÇÃO NECESSÁRIO

### **1. INSERÇÃO DE INGRESSOS**
**Problema**: `createPaidTicket()` e `createFreeTicket()` criam apenas no DOM

**Solução Necessária**:
```javascript
// EM VEZ DE: addTicketToList() apenas
// FAZER:
1. Salvar no MySQL via API (POST /ajax/wizard_evento.php)
2. Recarregar lista completa do MySQL 
3. Renderizar DOM baseado nos dados reais do banco
```

### **2. EXCLUSÃO DE INGRESSOS**
**Problema**: `removeTicket()` só remove do DOM

**Solução Necessária**:
```javascript
// EM VEZ DE: ticketElement.remove() apenas
// FAZER:
1. Excluir do MySQL via API (POST /ajax/wizard_evento.php)
2. Recarregar lista completa do MySQL
3. Renderizar DOM baseado nos dados reais do banco
```

### **3. EDIÇÃO DE INGRESSOS**
**Problema**: `editTicket()` não funciona

**Solução Necessária**:
```javascript
// IMPLEMENTAR:
1. Buscar dados atuais do MySQL
2. Popular modal de edição  
3. Salvar alterações no MySQL via API
4. Recarregar lista completa do MySQL
5. Renderizar DOM baseado nos dados reais do banco
```

### **4. PADRÃO UNIFICADO**
**Todas as operações devem seguir o padrão**:
```javascript
async function operacaoIngresso() {
    // 1. Operação no MySQL via API
    const response = await fetch('/produtor/ajax/wizard_evento.php', {...});
    
    // 2. Se sucesso, recarregar dados do MySQL
    if (response.sucesso) {
        await recarregarIngressosDoMySQL();
    }
}

async function recarregarIngressosDoMySQL() {
    // 1. Buscar dados atuais do MySQL
    const dados = await fetch('/produtor/ajax/wizard_evento.php?action=recuperar_evento_simples');
    
    // 2. Limpar DOM
    document.getElementById('ticketList').innerHTML = '';
    
    // 3. Renderizar cada ingresso usando addTicketToList() com IDs REAIS
    dados.ingressos.forEach(ingresso => {
        addTicketToList(...); // com ID real do banco
        // Corrigir IDs dos botões para IDs reais
    });
}
```

## 📂 ARQUIVOS A MODIFICAR

### **Principal (OBRIGATÓRIO)**
- **`js/ticket-functions-fix.js`**:
  - Modificar `createPaidTicket()` → Salvar no MySQL + recarregar
  - Modificar `createFreeTicket()` → Salvar no MySQL + recarregar  
  - Modificar `removeTicket()` → Excluir do MySQL + recarregar
  - Implementar `editTicket()` → Editar no MySQL + recarregar

### **Secundário (SE NECESSÁRIO)**
- **`js/sistema-ingressos-etapa6-corrigido.js`**: 
  - Integrar funções existentes que já fazem MySQL
  - Substituir as do `ticket-functions-fix.js` se necessário

### **Não Modificar (CRÍTICO)**
- **`js/sistema-lotes-mysql.js`** 🚫
- **`js/interface-lotes-mysql.js`** 🚫
- **`ajax/wizard_evento.php`** (APIs de lotes) 🚫
- **Qualquer coisa da Etapa 5** 🚫

## 🔧 ESTRATÉGIA DE IMPLEMENTAÇÃO

### **Passo 1: Criar Função Unificada de Recarregamento**
```javascript
window.recarregarIngressosDoMySQL = async function() {
    // Buscar + limpar + renderizar com IDs reais
}
```

### **Passo 2: Modificar Operações para Usar MySQL**
- `createPaidTicket()` → MySQL + recarregar
- `createFreeTicket()` → MySQL + recarregar
- `removeTicket()` → MySQL + recarregar  
- `editTicket()` → MySQL + recarregar

### **Passo 3: Validar Funcionamento**
- Inserir ingresso → Deve aparecer com ID real do banco
- Excluir ingresso → Deve sumir da lista E da tabela MySQL
- Recarregar página → Lista deve permanecer idêntica
- DOM sempre = MySQL

## ⚠️ REGRAS CRÍTICAS

1. **NUNCA usar IDs temporários** (`ticket_` + timestamp)
2. **SEMPRE buscar dados do MySQL** antes de renderizar
3. **NUNCA modificar apenas o DOM** sem MySQL
4. **SEMPRE recarregar após operações** para garantir sincronização
5. **NÃO MEXER NA ETAPA 5** (lotes) - está perfeita

## 🎯 RESULTADO ESPERADO

Após a correção:
- **Inserir**: Salva no MySQL → Recarrega → DOM tem ID real
- **Excluir**: Remove do MySQL → Recarrega → DOM atualizado  
- **Editar**: Altera no MySQL → Recarrega → DOM atualizado
- **Recarregar página**: DOM idêntico (pois vem do MySQL)
- **DOM = MySQL sempre**: Fonte única da verdade

---

**EXECUTE ESTE PLANO PARA TORNAR O DOM UM ESPELHO PERFEITO DA TABELA MYSQL `ingressos`**
