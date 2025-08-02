# CONTEXTO DO PROJETO - WIZARD DE CRIAÇÃO DE EVENTOS

## VISÃO GERAL
Estamos finalizando os ajustes na **Etapa 5** de um wizard de criação de eventos. O sistema permite criar diferentes tipos de lotes (por data, por percentual/quantidade) e gerenciar ingressos. Após concluir a Etapa 5, partiremos para pequenos ajustes nas etapas subsequentes.

## ESTRUTURA DO PROJETO

### **Frontend Principal:**
- **Página**: `/produtor/novoevento.php` - Interface principal do wizard
- **JS Principal**: `/produtor/js/criaevento.js` - Lógica central do wizard
- **Lotes**: `/produtor/js/lotes.js` - Sistema de gerenciamento de lotes
- **Controle Limite**: `/produtor/js/controle-limite-vendas.js` - Lotes por quantidade

### **Backend API:**
- **Endpoint**: `/produtor/ajax/wizard_evento.php` - API centralizada
- **Ações disponíveis**: `excluir_lote`, `atualizar_lote`, `carregar_limite_vendas`, etc.
- **MySQL**: Tabela `lotes` com campos: `id`, `evento_id`, `nome`, `tipo`, `data_inicio`, `data_fim`, `percentual_venda`, `divulgar_criterio`

### **Arquivos de Correção (criados durante debugging):**
- `/produtor/js/fix-exclusao-lote-mysql.js` - Tentativa de correção da exclusão
- `/produtor/js/debug-interface-cleanup.js` - Sistema de debug para interceptar funções
- `/produtor/js/fixes/restaurar-funcoes-lotes.js` - Funções de roteamento

## FUNCIONAMENTO ATUAL

### **Tipos de Lotes:**
1. **Lotes por Data**: Definidos por data_inicio e data_fim
2. **Lotes por Percentual/Quantidade**: Baseados em percentual_venda

### **Interface:**
- Container: `lotesPorDataList` (para lotes por data)
- Container: `lotesPorPercentualList` (para lotes por percentual)
- Botões esperados: `<button onclick="editarLote('48', 'data')">✏️</button>`

### **Fluxo de Exclusão Esperado:**
1. Usuário clica botão excluir
2. `excluirLote(id, 'data')` → `excluirLoteData(id)`
3. API call: `action=excluir_lote&lote_id=X&evento_id=Y`
4. MySQL: `DELETE FROM lotes WHERE id=X AND evento_id=Y`
5. Frontend: Remove elemento do DOM

### PROBLEMAS CRÍTICOS ATUAIS

##ETAPA DE CADASTRO DE LOTES ESTÁ CARREGANDO DADOS DE COOKIES**
- Essa etapa precisa trabalhar diretamente com dados do banco de dados mysql - tabela lotes
- Suspeita: Em uma etapa anterior tentamos fazer a persistência em cookies e isso deve ter bagunçado funções


##REGRAS: 
1) VOCÊ DEVE TRABALHAR DIRETAMENTE NOS ARQUIVOS QUE ESTÃO NA PASTA /produtor ATRAVÉS DO MCP DESKTOP COMMANDER
2) Não crie novas funções javascript para sobrepor antigas. Procure a causa e corrija/exclua as funções problemáticas
3) Só crie novas funçõe se elas realmente forem necessárias e não com o intúito de sobrescrever/maquiar/econder erros de outras funções.


