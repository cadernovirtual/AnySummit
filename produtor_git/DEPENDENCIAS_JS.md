# Dependências JavaScript - Módulo Produtor AnySummit

## ANÁLISE COMPLETA: 83 ARQUIVOS JS

## 1. VARIÁVEIS GLOBAIS PRINCIPAIS

### 1.1 Variáveis de Estado do Wizard
- **window.currentStep** (number): Step atual do wizard (1-8)
  - Definida em: `criaevento.js` (com window.), `editarevento.js` (sem window.), `editarevento-v2.js` (sem window.)
  - Redefinida/corrigida em: `fix-current-step.js`, `wizard-fix.js`, `wizard-fix-definitivo.js`
  - Usada em: Praticamente todos os arquivos de wizard e correção
  - **CONFLITO**: Múltiplas definições com e sem window.

- **window.wizardState** (object): Estado alternativo do wizard
  - Definida em: `wizard-fix-definitivo.js`
  - Estrutura: `{ currentStep: 1, totalSteps: 8 }`
  - **CONFLITO**: Criado como alternativa ao currentStep

### 1.2 Variáveis de Lotes
- **window.lotesData** (object): Armazena lotes por data e percentual
  ```javascript
  {
    porData: [],      // Array de lotes por data
    porPercentual: [] // Array de lotes por percentual
  }
  ```
  - Definida em: `lotes.js`
  - Garantida em: `modal-correto.js`, `lotes-fix.js`
  - Usada em: `combo-functions.js`, `ingressos-pagos.js`, `ingressos-gratuitos.js`
  - Persistida em: `lotes-ingressos-persistence.js`

- **lotesCarregados** (array): Lista de lotes do evento atual
  - Definida em: `ingressos-pagos.js`
  - Usada em: Funções de ingresso pago

- **loteAtualPercentual** (number|null): Percentual do lote selecionado
  - Definida em: `ingressos-pagos.js`
  - Versão free: `loteAtualPercentualFree` em `ingressos-gratuitos.js`

### 1.3 Variáveis de Ingressos
- **temporaryTickets** (Map): Ingressos temporários durante criação
  - Definida em: `temporary-tickets.js`
  - Usada em: `ticket-functions-fix.js`, `urgent-ticket-fix.js`
  - Métodos principais: `addTicketToCreationList()`, `removeTemporaryTicket()`, `editTemporaryTicket()`

- **ticketCounter** (number): Contador para IDs únicos de ingressos
  - Definida em: `temporary-tickets.js`
  - Incrementada em: `addTicketToCreationList()`

- **ticketCount** (number): Contador de ingressos criados
  - Definida em: `criaevento.js`
  - Usada em: Funções de criação de ingressos

- **ticketCodes** (object): Códigos de ingressos
  - Definida em: `criaevento.js`

### 1.4 Variáveis de Combos
- **window.comboItems** (array): Itens do combo atual
  - Definida em: `combo-functions.js`, `combo-override.js`
  - Redefinida em: `combo-complete-fix.js`, `combo-final-fixes.js`
  - Modificada em: `combo-visual-fixes.js`, `combo-tax-fix.js`
  - **CONFLITO**: Múltiplas redefinições

- **window.ultimoLoteSelecionado**: Último lote selecionado no combo
  - Definida em: `combo-functions.js`
  - Usada em: `updateComboTicketDates()`

- **window.comboTickets** (Map): Tipos de ingresso disponíveis no combo
  - Definida em: `combo-functions.js`, `combo-complete-fix.js`

### 1.5 Variáveis de Upload
- **window.uploadedImages** (object): URLs das imagens enviadas
  ```javascript
  {
    logo: '',
    capa: '',
    fundo: ''
  }
  ```
  - Definida em: `upload-images.js`
  - Corrigida em: `upload-images-fix.js`

### 1.6 Variáveis de Taxa
- **taxaServicoPadrao** (number): Taxa de serviço padrão (8%)
  - Definida em: `ingressos-pagos.js`
  - Alternativa: `window.TAXA_SERVICO_PADRAO` em `correcoes-definitivas.js`, `taxa-servico-completa.js`
  - **CONFLITO**: Duas versões (com e sem window.)

### 1.7 Variáveis de Mapa
- **map**, **geocoder**, **marker**, **autocompleteService**, **placesService**
  - Definidas em: `criaevento.js`
  - Corrigidas em: `maps-fix.js`

### 1.8 Variáveis de Diálogos
- **window.customDialog**: Sistema de diálogos customizados
  - Definida em: `custom-dialogs.js`
  - Usada em: `alert-overrides.js` e todos os arquivos que mostram alertas

- **originalAlert**, **originalConfirm**: Referências aos métodos nativos
  - Salvos em: `alert-overrides.js`

## 2. FUNÇÕES COM DEPENDÊNCIAS COMPLEXAS

### 2.1 Funções de Navegação do Wizard
- **nextStep()** 
  - Versão original: `criaevento.js`
  - Sobrescrita em: `wizard-fix.js`, `wizard-fix-definitivo.js`, `wizard-essential-fixes.js`
  - Override especial em: `step5-validation.js` (validação de lotes)
  - Depende de: `validateStep()`, `updateStepDisplay()`, `window.currentStep`

- **validateStep()**
  - Versão original: `criaevento.js`
  - Sobrescrita em: `consolidated-fix.js`, `wizard-essential-fixes.js`, `validation-fix.js`
  - **CONFLITO**: Múltiplas versões com lógicas diferentes

### 2.2 Funções de Modal
- **openModal()**: Função original (não encontrada nos arquivos analisados)
- **abrirModalCorreto()**: `modal-correto.js`
- **openModalWithFix()**: `modal-fixes.js`
- **ModalManager.open()**: `lotes-fix.js` (classe gerenciadora)
- **CONFLITO**: 4+ sistemas diferentes para abrir modais

### 2.3 Funções de Lotes
- **adicionarLotePorData()**
  - Original: `lotes.js`
  - Sobrescrita: `modal-correto.js`
  - Debug: `debug-lote-completo.js`

- **renomearLotesAutomaticamente()**
  - Definida em: `lotes.js`
  - Chamada em: Várias funções de salvamento

### 2.4 Funções de Cálculo
- **calcularValoresIngresso()**
  - Original: `ingressos-pagos.js`
  - Sobrescrita em: `correcoes-definitivas.js`, `taxa-servico-completa.js`
  - **CONFLITO**: Múltiplas versões com diferentes fórmulas de taxa

- **formatarMoeda()**
  - Definida em: `combo-functions.js`, `ingressos-pagos.js`, `ingressos-gratuitos.js`
  - **CONFLITO**: Função duplicada em múltiplos arquivos

### 2.5 Funções de Salvamento
- **saveWizardData()**
  - Original: `criaevento.js`
  - Estendida em: `lotes-ingressos-persistence.js`
  - Corrigida em: `wizard-fix.js`

## 3. ORDEM CORRETA DE CARREGAMENTO

### Fase 1: Bibliotecas e Utilitários
1. **qrcode.min.js** - Biblioteca externa
2. **custom-dialogs.js** - Sistema de diálogos
3. **alert-overrides.js** - Substitui alerts nativos

### Fase 2: Core do Sistema
4. **criaevento.js** - Core do wizard de criação
5. **lotes.js** - Sistema de lotes
6. **temporary-tickets.js** - Sistema de ingressos temporários
7. **upload-images.js** - Upload de imagens

### Fase 3: Funcionalidades Específicas
8. **ingressos-pagos.js** - Gestão de ingressos pagos
9. **ingressos-gratuitos.js** - Gestão de ingressos gratuitos
10. **combo-functions.js** - Funções base de combos

### Fase 4: Correções Primárias
11. **correcoes-definitivas.js** - Correções de taxa e persistência
12. **wizard-fix.js** - Correções gerais do wizard
13. **modal-correto.js** - Correções de modais
14. **consolidated-fix.js** - Correções consolidadas

### Fase 5: Correções Secundárias
15. **wizard-essential-fixes.js** - Correções essenciais
16. **lotes-ingressos-persistence.js** - Persistência de dados
17. **step5-validation.js** - Validação específica de lotes
18. **taxa-servico-completa.js** - Correções de taxa

### Fase 6: Correções Visuais e Finais
19. **combo-visual-fixes.js** - Correções visuais de combos
20. **address-improvements.js** - Melhorias de endereço
21. **preview-update-fix.js** - Correções de preview
22. **final-fixes.js** - Correções finais

## 4. CONFLITOS CRÍTICOS IDENTIFICADOS

### 4.1 Conflito: currentStep (CRÍTICO)
- **Problema**: 3 sistemas diferentes para gerenciar o step atual
- **Arquivos**: 
  - `criaevento.js`: usa `window.currentStep`
  - `editarevento.js`, `editarevento-v2.js`: usa `currentStep` (sem window)
  - `wizard-fix-definitivo.js`: cria `window.wizardState.currentStep`
- **Impacto**: Navegação inconsistente entre steps

### 4.2 Conflito: Sistema de Modais (CRÍTICO)
- **Problema**: 4+ implementações diferentes
- **Sistemas**:
  - `openModal()` - original (referenciada mas não encontrada)
  - `abrirModalCorreto()` - modal-correto.js
  - `openModalWithFix()` - modal-fixes.js
  - `ModalManager` - lotes-fix.js
- **Impacto**: Modais podem não abrir ou comportamento inconsistente

### 4.3 Conflito: Taxa de Serviço (CRÍTICO)
- **Problema**: 2 variáveis diferentes e múltiplas implementações
- **Variáveis**:
  - `taxaServicoPadrao` (sem window)
  - `window.TAXA_SERVICO_PADRAO`
- **Arquivos**: `ingressos-pagos.js`, `correcoes-definitivas.js`, `taxa-servico-completa.js`
- **Impacto**: Cálculos incorretos de valores

### 4.4 Conflito: validateStep (ALTO)
- **Problema**: 4+ versões diferentes da função
- **Arquivos**: `criaevento.js`, `consolidated-fix.js`, `wizard-essential-fixes.js`, `validation-fix.js`
- **Impacto**: Validações inconsistentes

### 4.5 Conflito: Combo Functions (ALTO)
- **Problema**: Múltiplas redefinições e correções
- **Arquivos**: 15+ arquivos de correção de combo
- **Impacto**: Comportamento imprevisível dos combos

## 5. ARQUIVOS REDUNDANTES/OBSOLETOS

### Para Remoção Imediata:
- Todos os arquivos `.deleted`
- Todos os arquivos `.old`
- Arquivos com prefixo `_old_` ou `_deletar_`
- `criaevento_backup_problematico.js`
- `trash-icon-patch-deleted.js`
- Arquivos `debug-*.js` (após resolver os bugs)
- Arquivos `test-*.js`
- `emergencia-limpar-lote.js`

### Para Consolidação:
- **Combo fixes**: 15+ arquivos → consolidar em 1-2 arquivos
- **Wizard fixes**: 7+ arquivos → consolidar em 1 arquivo
- **Modal fixes**: 5+ arquivos → consolidar em 1 arquivo
- **Validation fixes**: 4+ arquivos → consolidar em 1 arquivo

## 6. RECOMENDAÇÕES URGENTES

### 6.1 Namespace Global Único
```javascript
window.AnySummit = {
    // Estado do wizard
    wizard: {
        currentStep: 1,
        totalSteps: 8,
        data: {}
    },
    
    // Lotes
    lotes: {
        porData: [],
        porPercentual: [],
        carregados: []
    },
    
    // Ingressos
    ingressos: {
        temporary: new Map(),
        counter: 0,
        codes: {}
    },
    
    // Combos
    combos: {
        items: [],
        tickets: new Map(),
        ultimoLote: null
    },
    
    // Configurações
    config: {
        taxaServico: 8.00,
        uploadedImages: {}
    },
    
    // Utilitários
    utils: {
        formatarMoeda: function() {},
        formatarData: function() {},
        // ... outras funções comuns
    }
};
```

### 6.2 Ações Imediatas
1. **Backup completo** antes de qualquer mudança
2. **Remover arquivos obsoletos** (30+ arquivos)
3. **Consolidar correções** por categoria
4. **Padronizar variáveis globais** com namespace
5. **Criar arquivo utilities.js** para funções comuns
6. **Documentar** a nova estrutura

### 6.3 Estrutura Final Sugerida
- Total atual: 83 arquivos
- Meta: 15-20 arquivos bem organizados
- Redução: ~75% dos arquivos

## 7. MAPA DE DEPENDÊNCIAS CIRCULARES

### Detectadas:
1. `wizard-fix.js` → `criaevento.js` → `wizard-fix.js`
2. `modal-correto.js` → `lotes.js` → `modal-correto.js`
3. `combo-functions.js` → `combo-fixes.js` → `combo-functions.js`

### Solução:
- Criar arquivos de interface clara
- Evitar sobrescrever funções em múltiplos arquivos
- Usar eventos ao invés de chamadas diretas quando possível