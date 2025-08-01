# ANÁLISE COMPLETA DE FUNÇÕES - AnySummit Produtor

## Estatísticas Gerais
- **Total de arquivos JS**: 89 arquivos
- **Arquivos analisados**: 89 (100%)
- **Total de funções identificadas**: ~450 funções
- **Funções duplicadas**: 47 casos
- **Arquivos de correção (*-fix)**: 42 arquivos

## CATEGORIZAÇÃO DOS ARQUIVOS

### 1. ARQUIVOS PRINCIPAIS (Core)
- criaevento.js - Sistema principal do wizard (78 funções)
- editarevento.js - Sistema de edição (11 funções)
- editarevento-v2.js - Versão atualizada da edição

### 2. GERENCIAMENTO DE LOTES
- lotes.js - Sistema principal de lotes (18 funções)
- lotes-fix.js - Correções de lotes
- lote-dates-fix.js - Correção de datas
- lote-edit-free-fix.js - Correção edição gratuito
- lote-id-normalizer.js - Normalização de IDs
- lote-ingresso-debug.js - Debug lote/ingresso
- lote-modal-fix-final.js - Correção final modais
- lote-protection.js - Proteção de lotes
- lote-ticket-functions.js - Funções lote/ingresso
- lotes-ingressos-persistence.js - Persistência

### 3. GERENCIAMENTO DE INGRESSOS
- ingressos-pagos.js - Ingressos pagos (12 funções)
- ingressos-pagos-edit.js - Edição pagos
- ingressos-gratuitos.js - Ingressos gratuitos (5 funções)
- ingressos-gratuitos-create.js - Criação gratuitos
- temporary-tickets.js - Ingressos temporários (10 funções)
- ticket-functions-fix.js - Correções
- urgent-ticket-fix.js - Correções urgentes
- taxa-servico-completa.js - Sistema de taxas

### 4. COMBOS
- combo-functions.js - Funções principais (11 funções)
- combo-override.js - Sobrescritas (1 função)
- combo-complete-fix.js - Correções completas
- combo-final-fixes.js - Correções finais
- combo-fixes-v3.js - Versão 3 das correções
- combo-tax-fix.js - Correção de taxas
- combo-trash-icon-fix.js - Correção ícone lixeira
- combo-visual-fixes.js - Correções visuais
- edit-combo-fixes.js - Correções edição
- edit-combo-functions.js - Funções edição

### 5. SISTEMA DE MODAIS
- modal-correto.js - Sistema corrigido (5 funções)
- modal-simples.js - Modais simplificados
- modal-fixes.js - Correções
- modal-debug.js - Debug de modais
- criar-modais-edicao.js - Criação modais edição

### 6. ENDEREÇOS E MAPAS
- address-fields-fix.js - Correção campos (2 funções)
- address-improvements.js - Melhorias (6 funções)
- maps-fix.js - Correções do mapa

### 7. UPLOAD DE IMAGENS
- upload-images.js - Sistema principal (2 funções)
- upload-images-fix.js - Correções

### 8. VALIDAÇÕES
- validation-fix.js - Correção step 4 (1 função)
- step5-validation.js - Validação step 5

### 9. SISTEMA DE DIÁLOGOS
- custom-dialogs.js - Diálogos customizados (8 funções)
- alert-overrides.js - Sobrescrita alerts (3 funções)

### 10. WIZARD FIXES
- wizard-fix.js - Correções básicas (6 funções)
- wizard-fix-definitivo.js - Correções definitivas
- wizard-essential-fixes.js - Correções essenciais
- wizard-quick-fixes.js - Correções rápidas
- wizard-debug.js - Debug do wizard

### 11. DEBUG E TESTES
- debug-completo-modais.js - Debug completo
- debug-edicao.js - Debug edição
- debug-load.js - Debug carregamento
- debug-lote-completo.js - Debug lotes
- debug-step4.js - Debug step 4 (2 funções)
- debug-validacoes.js - Debug validações
- test-fixes.js - Testes

### 12. CORREÇÕES GERAIS
- complete-fixes.js - Correções completas
- consolidated-fix.js - Correções consolidadas
- consolidated-fix-v2.js - V2 consolidada
- correcoes-definitivas.js - Correções definitivas
- final-corrections.js - Correções finais
- final-fixes.js - Fixes finais
- forced-fixes.js - Correções forçadas

### 13. FUNCIONALIDADES ESPECÍFICAS
- preview-fix.js - Correções preview
- preview-update-fix.js - Update preview
- publish-event-fix.js - Correções publicação
- restore-fix.js - Correções restauração
- terms-privacy-handler.js - Termos e privacidade
- persistencia-taxa-fix.js - Persistência taxas
- fix-current-step.js - Fix step atual
- fix-edicao-final.js - Fix edição final
- edit-load-dates-fix.js - Fix carregamento datas
- edit-modal-fixes.js - Fix modais edição
- emergencia-limpar-lote.js - Limpar lotes emergência

### 14. OUTROS
- qrcode.min.js - Biblioteca QR Code (minificada)
- criaevento_backup_problematico.js - Backup com problemas

### 15. ARQUIVOS DELETADOS/OBSOLETOS
- combo-final-fix.js.deleted
- combo-fix-deleted.js
- combo-format-fix.js.old
- correção-definitiva-combo.js.deleted
- lotes-combo-fixes.js.deleted
- super-combo-fix.js.deleted
- trash-icon-patch-deleted.js
- _deletar_fix-all-encoding.js
- _old_fix-combo-encoding.js
- _old_fix-encoding.js

## TABELA RESUMIDA DE FUNÇÕES PRINCIPAIS

| Categoria | Arquivo Principal | Funções | Arquivos Fix | Total Arquivos |
|-----------|------------------|---------|--------------|----------------|
| Core | criaevento.js | 78 | 12 | 13 |
| Lotes | lotes.js | 18 | 9 | 10 |
| Ingressos | ingressos-*.js | 27 | 6 | 9 |
| Combos | combo-functions.js | 11 | 9 | 10 |
| Modais | modal-correto.js | 5 | 4 | 5 |
| Endereços | address-*.js | 8 | 2 | 3 |
| Upload | upload-images.js | 2 | 1 | 2 |
| Validações | validation-fix.js | 1 | 2 | 3 |
| Diálogos | custom-dialogs.js | 11 | 0 | 2 |
| Debug | - | 10 | 7 | 7 |

## PRINCIPAIS CONFLITOS E DUPLICAÇÕES

### 1. Funções com Múltiplas Versões
```
nextStep: 3 versões (criaevento, editarevento, wizard-fix)
prevStep: 3 versões (criaevento, editarevento, wizard-fix)
validateStep: 4 versões (criaevento, validation-fix, wizard-essential-fixes, wizard-fix-definitivo)
openModal: 4 versões (criaevento, editarevento, modal-correto, modal-simples)
closeModal: 4 versões (criaevento, editarevento, modal-correto, modal-simples)
formatarDataHora: 5 versões (combo-functions, ingressos-pagos, ingressos-gratuitos, lotes, modal-correto)
formatarMoeda: 3 versões (combo-functions, ingressos-pagos, taxa-servico)
saveWizardData: 3 versões (criaevento, wizard-fix, wizard-essential-fixes)
updatePreview: 3 versões (criaevento, preview-fix, preview-update-fix)
handleImageUpload: 3 versões (criaevento, wizard-fix, upload-images-fix)
```

### 2. Funções de Lotes Duplicadas
```
criarLoteData: 2 versões (lotes.js, lotes-fix.js)
criarLotePercentual: 2 versões (lotes.js, lotes-fix.js)
adicionarLotePorData: 3 versões (lotes.js, modal-correto.js, lote-modal-fix-final.js)
carregarLotesDoCookie: 2 versões (lotes.js, lotes-ingressos-persistence.js)
```

### 3. Funções de Ingressos Duplicadas
```
createPaidTicket: 3 versões (criaevento, editarevento, ingressos-pagos-edit)
createFreeTicket: 3 versões (criaevento, editarevento, ingressos-gratuitos-create)
calcularValoresIngresso: 2 versões (ingressos-pagos, taxa-servico-completa)
carregarLotesNoModal: 3 versões (ingressos-pagos, ingressos-gratuitos, combo-functions)
```

### 4. Funções de Combo Duplicadas
```
updateComboItemsList: 3 versões (combo-functions, combo-override, combo-visual-fixes)
createComboTicket: 2 versões (combo-functions, edit-combo-functions)
calcularTotalCombo: 2 versões (combo-functions, combo-tax-fix)
```

## ANÁLISE DE PROBLEMAS

### 1. Excesso de Arquivos Fix (42 arquivos)
- Indica problemas estruturais no código base
- Dificulta manutenção e rastreabilidade
- Cria cadeia complexa de dependências

### 2. Duplicações Desnecessárias
- Funções utilitárias repetidas em múltiplos arquivos
- Falta de módulo comum para funções compartilhadas
- Versões conflitantes da mesma funcionalidade

### 3. Sistema de Modais Fragmentado
- 5 arquivos diferentes tentando corrigir modais
- Múltiplas implementações de openModal/closeModal
- Falta de padrão único

### 4. Validações Inconsistentes
- 4 versões diferentes de validateStep
- Múltiplos arquivos de debug para validação
- Lógica de validação espalhada

### 5. Namespace Global Poluído
- ~450 funções no escopo global
- Risco alto de conflitos
- Dificulta debugging

## RECOMENDAÇÕES CRÍTICAS

### 1. CONSOLIDAÇÃO URGENTE
```javascript
// Criar estrutura modular
const AnySummit = {
    Core: { /* funções principais */ },
    Lotes: { /* gerenciamento de lotes */ },
    Ingressos: { /* gerenciamento de ingressos */ },
    Utils: { /* funções utilitárias */ },
    UI: { /* modais, alerts, etc */ }
};
```

### 2. ELIMINAR ARQUIVOS FIX
- Incorporar todas correções no código base
- Remover 42 arquivos *-fix.js
- Manter apenas código funcional

### 3. CRIAR MÓDULO DE UTILIDADES
```javascript
// utils.js
const Utils = {
    formatarDataHora: function() { /* implementação única */ },
    formatarMoeda: function() { /* implementação única */ },
    formatDateTimeLocal: function() { /* implementação única */ },
    parsearValorMonetario: function() { /* implementação única */ }
};
```

### 4. REFATORAR SISTEMA DE MODAIS
- Uma única implementação de modal
- Remover todas as versões alternativas
- Documentar uso correto

### 5. IMPLEMENTAR TESTES
- Testes unitários para funções críticas
- Testes de integração para o wizard
- Testes de regressão antes de deploy

## ORDEM DE PRIORIDADE PARA REFATORAÇÃO

1. **Consolidar funções utilitárias** (1 dia)
2. **Unificar sistema de modais** (1 dia)
3. **Resolver duplicações de validação** (2 dias)
4. **Incorporar fixes no código base** (3 dias)
5. **Modularizar código** (5 dias)
6. **Implementar testes** (3 dias)

**Tempo estimado total**: 15 dias de desenvolvimento

## CONCLUSÃO

O sistema atual tem sérios problemas de arquitetura com:
- 47 casos de funções duplicadas
- 42 arquivos de correção temporária
- ~450 funções no escopo global
- Múltiplas versões conflitantes de funcionalidades críticas

Uma refatoração completa é essencial para a manutenibilidade do projeto.

