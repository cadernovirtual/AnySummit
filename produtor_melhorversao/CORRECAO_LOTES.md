# PROMPT COMPLETO PARA CORREÇÃO DA ETAPA 5 - SISTEMA DE LOTES

## 🎯 OBJETIVO PRINCIPAL
Corrigir EXCLUSIVAMENTE a Etapa 5 (Cadastro de Lotes) do wizard de criação de eventos. O objetivo é remover persistência em cookies e fazer todas as operações trabalharem diretamente com o banco de dados MySQL (tabela `lotes`), seguindo regras de negócio específicas.

**IMPORTANTE: Manter 100% da interface visual intacta (botões, CSS, layout, modais). Alterar APENAS o funcionamento interno.**

---

## 📋 REGRAS DE NEGÓCIO DA ETAPA 5

### **1a) CARACTERÍSTICAS GERAIS DOS LOTES**
- Existem 2 tipos de lotes: `lotes.tipo="data"` e `lotes.tipo="quantidade"`
- Os lotes são nomeados automaticamente pelo sistema seguindo o padrão "Lote {X}" onde X é número sequencial
- A numeração de {X} é independente para cada tipo (podemos ter Lote 1 tipo="data" e Lote 1 tipo="quantidade")
- Se um lote for excluído, o sistema deve renomear os demais para manter numeração sequencial começando de 1
- Nenhum lote pode ser excluído se houver ingressos associados (verificar `ingressos.lote_id`)

### **1b) REGRAS PARA LOTES TIPO="DATA"**
- Primeiro lote: `data_inicio` = data atual, `data_fim` = 7 dias depois
- Lotes subsequentes: `data_inicio` = maior `data_fim` existente + 1 minuto (NÃO pode ser alterada)
- `data_fim` = `data_inicio` + 7 dias (PODE ser alterada)
- Ao editar: apenas Lote 1 pode alterar `data_inicio`, demais só podem alterar `data_fim`
- Períodos devem ser mutuamente exclusivos (sem sobreposição)

### **1c) REGRAS PARA LOTES TIPO="QUANTIDADE"**
- Só podem existir se `eventos.controlar_limite_vendas=1`
- Quando usuário marcar checkbox, mostrar campo `eventos.limite_vendas` + botão confirmar (sempre visíveis após ativação)
- Quando desmarcar: verificar se existem ingressos associados aos lotes quantidade. Se existirem = impossível, avisar usuário. Se não = apagar todos os lotes quantidade
- Validação: pelo menos um lote quantidade deve ter `percentual_venda=100`
- `percentual_venda` deve ser único (1-100) entre lotes quantidade

---

## ⚠️ SISTEMAS QUE FUNCIONAM - NUNCA ALTERAR

### **🚨 RECUPERAÇÃO DE RASCUNHOS (SAGRADO)**
**NUNCA ALTERE ESTES ARQUIVOS:**
- `/produtor/js/gerenciar-rascunhos.js` ✅ FUNCIONA
- `/produtor/js/modal-rascunho.js` ✅ FUNCIONA  
- `/produtor/ajax/wizard_evento.php` - funções `verificarRascunho()` e `excluirRascunho()` ✅ FUNCIONAM
- Headers JSON do `wizard_evento.php` ✅ FUNCIONAM

### **🚨 RECUPERAÇÃO DE DADOS DO WIZARD (SAGRADO)**
**NUNCA REMOVA ESTES ARQUIVOS:**
- `/produtor/js/wizard-database.js` ✅ ESSENCIAL - Recupera dados de todas as etapas
- Qualquer script com nome `*restaurar*`, `*recuperar*`, `*restore*` ✅ NÃO TOCAR
- `/produtor/js/wizard-restore-helpers.js` ✅ ESSENCIAL - Helpers de restauração
- Qualquer arquivo com `fix-restaurar` no nome ✅ NÃO TOCAR

### **🚨 SISTEMA DE PREENCHIMENTO DE CAMPOS (SAGRADO)**
**NUNCA ALTERE:**
- Funções que preenchem campos das etapas 1-4 e 6-8
- Sistema de navegação entre etapas  
- Validações de etapas
- Sistema de salvamento automático
- Qualquer arquivo `wizard-*` que não seja específico de lotes

### **🚨 INTERFACE VISUAL (INTOCÁVEL)**
**NUNCA ALTERE:**
- HTML dos modais de lotes
- CSS de botões, layouts, estilos
- Estrutura visual da Etapa 5
- Nomes de classes CSS
- IDs de elementos HTML
- Textos de botões ou labels

---

## 🎯 FOCO EXCLUSIVO: APENAS LÓGICA DE LOTES

### **✅ O QUE PODE SER ALTERADO (APENAS FUNCIONAMENTO INTERNO):**
1. **Funções JavaScript** de criação/edição/exclusão de lotes
2. **Lógica de persistência** (trocar cookies por MySQL)
3. **Endpoints específicos** de lotes no `wizard_evento.php`
4. **Validações internas** das regras de negócio
5. **Funções de renomeação** automática de lotes

### **❌ O QUE É ABSOLUTAMENTE PROIBIDO:**
1. **Remover scripts** do `novoevento.php` sem confirmar dependências
2. **Alterar headers JSON** ou estrutura de resposta geral
3. **Modificar sistema** de carregamento inicial de dados
4. **Alterar interface visual** (HTML, CSS, textos, botões)
5. **Fazer "limpeza agressiva"** de arquivos
6. **Modificar funções** que outras etapas dependem
7. **Alterar sistema** de navegação ou validação de etapas

---

## 🛠️ ESTRUTURA DO BANCO DE DADOS

### **Tabela `eventos`:**
- `controlar_limite_vendas` (tinyint) - 0=não controla, 1=controla limite
- `limite_vendas` (int) - limite máximo de vendas

### **Tabela `lotes`:**
- `tipo` (varchar) - "data" ou "quantidade"
- `data_inicio/data_fim` (datetime) - para lotes tipo="data"  
- `percentual_venda` (int 1-100) - para lotes tipo="quantidade"
- `divulgar_criterio` (tinyint) - 0=oculto, 1=público

### **Tabela `ingressos`:**
- `lote_id` (int) - referência para verificar associações antes de excluir

---

## 📁 ESTRUTURA DE ARQUIVOS

### **Pasta do projeto:** `D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\produtor\`

### **Arquivos que PODEM ter funções de lotes (investigar):**
- `novoevento.php` - Interface principal do wizard
- `js/criaevento.js` - Lógica central (pode ter funções de lotes)
- `js/lotes.js` - Se existir, provavelmente tem funções específicas
- `js/controle-limite-vendas.js` - Se existir, para lotes por quantidade
- `ajax/wizard_evento.php` - API centralizada

### **MySQL:** Supabase
- Host: anysubd.mysql.dbaas.com.br
- User: anysubd
- Password: Swko15357523@#
- Database: anysubd

---

## 🛡️ REGRAS DE SEGURANÇA OBRIGATÓRIAS

### **CHECKLIST ANTES DE QUALQUER ALTERAÇÃO:**
- [ ] Esta alteração afeta APENAS funções de lotes?
- [ ] Esta alteração mantém recuperação de rascunhos funcionando?
- [ ] Esta alteração mantém carregamento de dados funcionando?
- [ ] Esta alteração não remove scripts essenciais?
- [ ] Esta alteração não modifica interface visual?
- [ ] Esta alteração não altera headers/estrutura JSON global?

**SE QUALQUER RESPOSTA FOR "NÃO" OU "TALVEZ" → NÃO FAZER A ALTERAÇÃO**

### **METODOLOGIA OBRIGATÓRIA:**
1. **MAPEAR** todas as funções relacionadas APENAS a lotes
2. **IDENTIFICAR** funções que usam cookies (`setCookie`, `getCookie`)
3. **SUBSTITUIR** uma função por vez, testando cada alteração
4. **PRESERVAR** 100% da interface visual existente
5. **TESTAR** recuperação de rascunhos após cada mudança
6. **NUNCA** fazer alterações em massa ou "limpezas"

---

## 🚫 PADRÕES QUE CAUSAM PROBLEMAS

### **❌ NUNCA MAIS FAZER:**
- Remoção em massa de scripts do `novoevento.php`
- Alteração de headers JSON "preventivamente"  
- "Limpeza" de arquivos sem entender dependências
- Sobrescrita de funções que outras etapas usam
- Criação de arquivos que "substituam" o sistema existente
- Modificação de arquivos `wizard-*` ou `*restore*`
- Alteração de sistema de debug sem necessidade

### **❌ ARQUIVOS/FUNÇÕES PERIGOSAS (NÃO TOCAR):**
- Qualquer função com "restore", "recuperar", "carregar"
- Arquivos que fazem fetch para carregar dados de etapas
- Sistema de modal de rascunhos
- Funções de navegação entre etapas
- Headers de autenticação ou sessão

---

## 🎯 RESULTADO ESPERADO

Após as correções, a Etapa 5 deve:
1. ✅ **Trabalhar APENAS com MySQL** (zero cookies para lotes)
2. ✅ **Seguir todas as regras de negócio** listadas acima
3. ✅ **Manter interface visual** 100% intacta
4. ✅ **Preservar recuperação** de rascunhos e dados funcionando
5. ✅ **Funcionar para eventos** novos E editados
6. ✅ **Não afetar** nenhuma outra etapa do wizard

---

## 💡 INSTRUÇÕES FINAIS CRÍTICAS

- **SEJA EXTREMAMENTE CIRÚRGICO:** Altere apenas o mínimo necessário
- **TESTE CONSTANTEMENTE:** Cada alteração deve ser validada
- **PRESERVE FUNCIONAMENTO EXISTENTE:** Recuperação de dados é prioritária
- **FOQUE EXCLUSIVAMENTE:** Apenas lógica de lotes, nada mais
- **INTERFACE INTOCÁVEL:** Zero alterações visuais
- **QUANDO EM DÚVIDA:** NÃO altere, investigue antes
- **UMA MUDANÇA POR VEZ:** Nunca faça alterações múltiplas simultaneamente

**LEMBRE-SE: O sistema já funciona perfeitamente para tudo exceto persistência de lotes. O objetivo é trocar cookies por MySQL apenas na Etapa 5, sem quebrar nada que já funciona.**