# ANÁLISE COMPLETA DOS SCRIPTS DE LOTES, INGRESSOS E COMBOS

## TABELA DE FUNÇÕES E ARQUIVOS

| Arquivo | Funções Principais | O que faz | Status |
|---------|-------------------|-----------|---------|
| **lotes.js** | - `renomearLotesAutomaticamente()`<br>- `adicionarLotePorData()`<br>- `adicionarLotePorPercentual()`<br>- `criarLoteData()`<br>- `criarLotePercentual()`<br>- `editarLoteData()`<br>- `salvarLoteData()`<br>- `excluirLoteData()`<br>- `validarLotes()`<br>- `carregarLotesDoCookie()` | Sistema principal de gestão de lotes. Cria, edita, exclui e valida lotes por data e percentual. Renomeia automaticamente mantendo ordem cronológica. | **CRÍTICO - Principal** |
| **lote-ticket-functions.js** | - `getLotesSalvos()`<br>- `populatePaidTicketLote()`<br>- `populateFreeTicketLote()`<br>- `populateComboTicketLote()`<br>- `onLoteSelectChange()` | Popula os selects de lotes nos modais de ingressos. Busca lotes de várias fontes (window, cookie). Atualiza datas do ingresso quando lote é selecionado. | **IMPORTANTE** |
| **lotes-ingressos-persistence.js** | - Override de `saveWizardData()`<br>- `restaurarLotesCompletos()`<br>- `restaurarIngressosCompletos()` | Garante persistência completa de lotes e ingressos no wizard. Salva e restaura dados detalhados incluindo ticketData. | **IMPORTANTE** |
| **lote-dates-fix.js** | - `formatDateForDisplay()`<br>- `updateLoteDataDisplay()`<br>- `fixLoteDateCalculation()` | Corrige formatação e cálculo de datas dos lotes. Garante formato DD/MM/YYYY HH:MM. | Correção |
| **lote-modal-fix-final.js** | - `openModal()` override<br>- `calcularDataInicioProximoLote()`<br>- `atualizarResumoPercentual()` | Corrige abertura de modais e cálculo automático de data inicial (+1 minuto do último lote). | **IMPORTANTE** |
| **lote-protection.js** | - `protegerLotesExistentes()`<br>- `bloquearEdicaoLote()` | Protege lotes com ingressos vinculados contra exclusão/edição. | Proteção |
| **lote-id-normalizer.js** | - `normalizarIdsLotes()`<br>- `garantirIdsUnicos()` | Normaliza IDs dos lotes para evitar duplicatas. | Utilidade |
| **ingressos-pagos.js** | - `calcularValoresIngresso()`<br>- `carregarLotesNoModal()`<br>- `createPaidTicket()`<br>- `buscarTaxaServico()`<br>- `formatarMoeda()` | Sistema completo de ingressos pagos. Calcula taxas, formata valores, vincula com lotes. | **CRÍTICO** |
| **ingressos-gratuitos.js** | - `carregarLotesNoModalFree()`<br>- `createFreeTicket()`<br>- `validarIngressoGratuito()` | Sistema de ingressos gratuitos. Vincula com lotes, valida campos. | **CRÍTICO** |
| **combo-functions.js** | - `addItemToCombo()`<br>- `updateComboItemsList()`<br>- `calculateComboTotal()`<br>- `createComboTicket()`<br>- `loadTicketTypesForLote()` | Sistema completo de combos. Adiciona múltiplos ingressos, calcula totais, gerencia lista. | **CRÍTICO** |
| **debug-lote-completo.js** | Funções de debug | Debug detalhado do sistema de lotes. | Debug |
| **emergencia-limpar-lote.js** | - `limparTodosLotes()`<br>- `resetarContadores()` | Limpa todos os lotes em caso de emergência. | Utilidade |

## REGRAS DE NEGÓCIO IDENTIFICADAS

### LOTES
1. **Numeração**: Lotes por data e percentual têm numeração independente começando em 1
2. **Ordenação**: Lotes por data ordenados cronologicamente, percentuais por valor
3. **Data inicial**: Sempre +1 minuto do fim do lote anterior
4. **Validação**: Pelo menos 1 lote deve existir, se houver percentual deve ter 100%
5. **Proteção**: Lotes com ingressos não podem ser excluídos

### INGRESSOS
1. **Vinculação**: Todo ingresso DEVE estar vinculado a um lote
2. **Datas**: Ao selecionar lote, datas de venda são preenchidas automaticamente
3. **Taxa**: 8% padrão, pode ser absorvida ou repassada
4. **Validação**: Nome, quantidade e lote são obrigatórios

### COMBOS
1. **Composição**: Múltiplos ingressos do mesmo lote
2. **Preço**: Soma dos ingressos individuais
3. **Tipos**: Carrega tipos de ingresso baseado no lote selecionado

## RECOMENDAÇÃO DE RECUPERAÇÃO

### PRIORIDADE 1 (Essenciais)
1. **lotes.js** - Sistema principal
2. **ingressos-pagos.js** - Ingressos pagos completo
3. **ingressos-gratuitos.js** - Ingressos gratuitos
4. **combo-functions.js** - Sistema de combos

### PRIORIDADE 2 (Importantes)
5. **lote-ticket-functions.js** - Vinculação lote-ingresso
6. **lote-modal-fix-final.js** - Cálculo de datas
7. **lotes-ingressos-persistence.js** - Persistência

### PRIORIDADE 3 (Correções)
8. **lote-dates-fix.js** - Formatação de datas
9. **lote-protection.js** - Proteção contra exclusão

## AÇÕES NECESSÁRIAS

1. Importar os arquivos da PRIORIDADE 1 primeiro
2. Testar funcionalidades básicas
3. Adicionar arquivos da PRIORIDADE 2
4. Aplicar correções conforme necessário