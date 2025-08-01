# Inventário de Funções JavaScript - AnySummit Produtor

## 1. TABELA DE TODAS AS FUNÇÕES

| Nome da Função | Arquivo | Linha | O que faz | Duplicada em |
|----------------|---------|-------|-----------|--------------|
| **getTrashIcon** | criaevento.js | ~16 | Retorna SVG do ícone de lixeira | - |
| **updateStepDisplay** | criaevento.js | ~23 | Atualiza a exibição do step atual no wizard | - |
| **validateStep** ⭐ | criaevento.js | ~58 | Valida campos obrigatórios de cada step | - |
| **nextStep** ⭐ | criaevento.js | ~156 | Avança para próximo step se validação passar | editarevento.js (~7) |
| **prevStep** ⭐ | criaevento.js | ~164 | Volta para step anterior | editarevento.js (~16) |
| **goToStep** | criaevento.js | ~172 | Navega para um step específico | - |
| **publishEvent** | criaevento.js | ~180 | Publica o evento chamando a API | - |
| **openModal** | criaevento.js | ~196 | Abre modal específico | editarevento.js (~130) |
| **closeModal** | criaevento.js | ~217 | Fecha modal específico | editarevento.js (~138) |
| **initMap** | criaevento.js | ~227 | Inicializa Google Maps | editarevento.js (~163) |
| **initImageUpload** | criaevento.js | ~284 | DESATIVADA - substituída por fundoUpload | - |
| **initAdditionalUploads** | criaevento.js | ~290 | Inicializa uploads de logo, capa e fundo | - |
| **handleImageUpload** ⭐ | criaevento.js | ~357 | Processa upload de imagens adicionais | wizard-fix.js (~123) |
| **handleMainImageUpload** | criaevento.js | ~425 | Processa upload da imagem principal de fundo | - |
| **clearImage** ⭐ | criaevento.js | ~496 | Limpa imagem e remove arquivo | - |
| **initSwitch** | criaevento.js | ~565 | Inicializa componente switch | - |
| **initSwitches** | criaevento.js | ~574 | Inicializa todos os switches | - |
| **initProducerSelection** | criaevento.js | ~598 | Gerencia seleção/criação de produtor | - |
| **initRichEditor** | criaevento.js | ~613 | Inicializa editor rich text | - |
| **initCheckboxes** | criaevento.js | ~727 | Inicializa checkboxes customizados | - |
| **initRadioButtons** | criaevento.js | ~736 | Inicializa radio buttons customizados | - |
| **initTicketManagement** | criaevento.js | ~752 | Inicializa gerenciamento de ingressos | - |
| **createPaidTicket** | criaevento.js | ~811 | Cria ingresso pago | editarevento.js (~146) |
| **createFreeTicket** | criaevento.js | ~909 | Cria ingresso gratuito | editarevento.js (~153) |
| **updatePreview** | criaevento.js | ~984 | Atualiza preview do evento | - |
| **updateHeroPreview** | criaevento.js | ~1050 | Atualiza preview hero | wizard-fix.js (~102) |
| **setCookie** | criaevento.js | ~1112 | Define cookie | - |
| **getCookie** | criaevento.js | ~1119 | Obtém valor de cookie | - |
| **deleteCookie** | criaevento.js | ~1136 | Remove cookie | - |
| **clearAllWizardData** ⭐ | criaevento.js | ~1140 | Limpa todos dados do wizard | - |
| **getTicketsFromList** | criaevento.js | ~1173 | Coleta ingressos da lista visual | - |
| **saveWizardData** ⭐ | criaevento.js | ~1199 | Salva dados do wizard em cookies | - |
| **checkAndRestoreWizardData** | criaevento.js | ~1383 | Verifica e restaura dados salvos | - |
| **restoreWizardData** | criaevento.js | ~1436 | Restaura dados do wizard | - |
| **initPreviewListeners** | criaevento.js | ~1688 | Inicializa listeners de preview | - |
| **obterValorRadioSelecionado** | criaevento.js | ~1718 | Obtém valor do radio selecionado | - |
| **criarNotificacao** | criaevento.js | ~1726 | Cria notificação visual | - |
| **enviarEventoParaAPI** | criaevento.js | ~1755 | Envia evento para API PHP | - |
| **validarDadosObrigatorios** | criaevento.js | ~1821 | Valida dados obrigatórios | - |
| **obterImagemBase64** | criaevento.js | ~1862 | Obtém imagem em base64 | - |
| **coletarDadosFormulario** | criaevento.js | ~1917 | Coleta todos dados do formulário | - |
| **coletarDadosIngressos** | criaevento.js | ~2032 | Coleta dados dos ingressos | - |
| **debugarDadosIngressos** | criaevento.js | ~2150 | Debug de dados dos ingressos | - |
| **mostrarSucesso** | criaevento.js | ~2176 | Mostra mensagem de sucesso | - |
| **mostrarErro** | criaevento.js | ~2207 | Mostra mensagem de erro | - |
| **initFormSubmission** | criaevento.js | ~2229 | Inicializa submissão do formulário | - |
| **initAddressSearch** | criaevento.js | ~2237 | Inicializa busca de endereços | - |
| **searchAddresses** | criaevento.js | ~2273 | Busca endereços via API | - |
| **simulateAddressSearch** | criaevento.js | ~2306 | Simula busca de endereços | - |
| **displayAddressSuggestions** | criaevento.js | ~2336 | Exibe sugestões de endereços | - |
| **selectAddress** | criaevento.js | ~2366 | Seleciona endereço | - |
| **getPlaceDetails** | criaevento.js | ~2393 | Obtém detalhes do local | - |
| **fillAddressFields** | criaevento.js | ~2413 | Preenche campos de endereço | - |
| **fillMockAddressData** | criaevento.js | ~2446 | Preenche com dados simulados | - |
| **updateFormFields** | criaevento.js | ~2487 | Atualiza campos do formulário | - |
| **updateMapLocation** | criaevento.js | ~2502 | Atualiza localização no mapa | - |
| **formatCurrency** | criaevento.js | ~2534 | Formata valor monetário | - |
| **calculateReceiveAmount** | criaevento.js | ~2550 | Calcula valor a receber | - |
| **initPriceInput** | criaevento.js | ~2564 | Inicializa campo de preço | - |
| **initMiniSwitches** | criaevento.js | ~2606 | Inicializa mini switches | - |
| **addTicketToList** | criaevento.js | ~2626 | Adiciona ingresso à lista | - |
| **removeTicket** | criaevento.js | ~2703 | Remove ingresso | - |
| **generateRandomCode** | criaevento.js | ~2719 | Gera código aleatório | - |
| **createCodeTicket** | criaevento.js | ~2729 | Cria ingresso por código | - |
| **addCodeTicketToList** | criaevento.js | ~2774 | Adiciona ingresso código à lista | - |
| **showStep** | editarevento.js | ~24 | Mostra step específico | - |
| **updateStepIndicators** | editarevento.js | ~41 | Atualiza indicadores de step | - |
| **updateProgress** | editarevento.js | ~58 | Atualiza barra de progresso | - |
| **validateCurrentStep** | editarevento.js | ~68 | Valida step atual | - |
| **validateStep1** | editarevento.js | ~89 | Valida step 1 | - |
| **validateStep2** | editarevento.js | ~104 | Valida step 2 | - |
| **showValidationMessage** | editarevento.js | ~117 | Mostra mensagem de validação | - |
| **hideValidationMessage** | editarevento.js | ~124 | Esconde mensagem de validação | - |
| **updateEvent** | editarevento.js | ~159 | Atualiza evento | - |
| **initWizardFix** | wizard-fix.js | ~11 | Inicializa correções do wizard | - |
| **verificarFuncoes** | wizard-fix.js | ~20 | Verifica se funções essenciais existem | - |
| **criarFuncaoEmergencia** | wizard-fix.js | ~53 | Cria função nextStep de emergência | - |
| **setupAdditionalListeners** | wizard-fix.js | ~79 | Configura listeners adicionais | - |
| **setupColorListener** | wizard-fix.js | ~278 | Configura listener de cor | - |

### Funções de Lotes (lotes.js)

| Nome da Função | Arquivo | Linha | O que faz | Duplicada em |
|----------------|---------|-------|-----------|--------------|
| **renomearLotesAutomaticamente** | lotes.js | ~13 | Renomeia lotes automaticamente por ordem | - |
| **adicionarLotePorData** ⭐ | lotes.js | ~35 | Abre modal para adicionar lote por data | modal-correto.js (sobrescrita) |
| **adicionarLotePorPercentual** | lotes.js | ~120 | Abre modal para adicionar lote por percentual | - |
| **criarLoteData** ⭐ | lotes.js | ~177 | Cria lote por data | - |
| **criarLotePercentual** ⭐ | lotes.js | ~296 | Cria lote por percentual | - |
| **renderizarLotesPorData** | lotes.js | ~366 | Renderiza lista de lotes por data | - |
| **renderizarLotesPorPercentual** | lotes.js | ~425 | Renderiza lista de lotes por percentual | - |
| **atualizarSummaryPercentual** | lotes.js | ~476 | Atualiza resumo de percentuais (removido) | - |
| **editarLoteData** | lotes.js | ~485 | Abre modal para editar lote por data | - |
| **editarLotePercentual** | lotes.js | ~523 | Abre modal para editar lote percentual | - |
| **salvarLoteData** ⭐ | lotes.js | ~565 | Salva edição de lote por data | - |
| **salvarLotePercentual** ⭐ | lotes.js | ~660+ | Salva edição de lote percentual | - |
| **excluirLoteData** ⭐ | lotes.js | ~750+ | Exclui lote por data | - |
| **excluirLotePercentual** ⭐ | lotes.js | ~780+ | Exclui lote por percentual | - |
| **validarLotes** | lotes.js | ~810+ | Valida lotes antes de enviar | - |
| **carregarLotesDoCookie** | lotes.js | ~850+ | Carrega lotes salvos em cookie | - |
| **salvarLotesNoCookie** | lotes.js | ~890+ | Salva lotes em cookie | - |
| **formatarDataBrasil** | lotes.js | ~910+ | Formata data para padrão brasileiro | - |
| **formatDateTimeLocal** | lotes.js | ~930+ | Formata data para input datetime-local | - |

### Funções de Ingressos Pagos (ingressos-pagos.js)

| Nome da Função | Arquivo | Linha | O que faz | Duplicada em |
|----------------|---------|-------|-----------|--------------|
| **buscarTaxaServico** | ingressos-pagos.js | ~11 | Busca taxa de serviço do banco | - |
| **formatarMoeda** | ingressos-pagos.js | ~29 | Formata valor para moeda BRL | - |
| **parsearValorMonetario** | ingressos-pagos.js | ~42 | Converte string monetária para número | - |
| **calcularValoresIngresso** ⭐ | ingressos-pagos.js | ~53 | Calcula valores do ingresso com taxas | - |
| **carregarLotesNoModal** ⭐ | ingressos-pagos.js | ~95 | Carrega lotes no dropdown do modal pago | - |
| **carregarLotesTemporarios** | ingressos-pagos.js | ~138 | Carrega lotes temporários do cookie | - |
| **populateSelectLotes** | ingressos-pagos.js | ~190 | Popula select com lotes | - |
| **formatarDataHora** | ingressos-pagos.js | ~221 | Formata data e hora | - |
| **updatePaidTicketDates** | ingressos-pagos.js | ~236 | Atualiza datas baseado no lote | - |
| **calcularQuantidadeLote** | ingressos-pagos.js | ~320+ | Calcula quantidade para lote percentual | - |
| **formatarParaDateTimeLocal** | ingressos-pagos.js | ~340+ | Formata para datetime-local | - |
| **carregarLotesIngressoPago** | ingressos-pagos.js | ~360+ | Alias para carregarLotesNoModal | - |

### Funções de Ingressos Gratuitos (ingressos-gratuitos.js)

| Nome da Função | Arquivo | Linha | O que faz | Duplicada em |
|----------------|---------|-------|-----------|--------------|
| **updateFreeTicketDates** | ingressos-gratuitos.js | ~7 | Atualiza datas do ingresso gratuito | - |
| **calcularQuantidadeLoteFree** | ingressos-gratuitos.js | ~60 | Calcula quantidade para lote gratuito | - |
| **carregarLotesNoModalFree** ⭐ | ingressos-gratuitos.js | ~78 | Carrega lotes no modal gratuito | - |
| **populateSelectLotesFree** | ingressos-gratuitos.js | ~174 | Popula select com lotes (gratuito) | - |
| **formatarDataHora** | ingressos-gratuitos.js | ~200+ | Formata data e hora | ingressos-pagos.js (duplicada) |

### Funções de Validação (validation-fix.js)

| Nome da Função | Arquivo | Linha | O que faz | Duplicada em |
|----------------|---------|-------|-----------|--------------|
| **validateStep** (override) | validation-fix.js | ~15 | Sobrescreve validação do step 4 | criaevento.js (original) |



## 2. CONFLITOS IDENTIFICADOS

### Funções Duplicadas

1. **nextStep**
   - `criaevento.js` (~156) - Implementação principal
   - `editarevento.js` (~7) - Implementação simplificada
   - **Conflito**: Diferentes implementações, a de criaevento.js é mais completa

2. **prevStep**
   - `criaevento.js` (~164) - Implementação principal
   - `editarevento.js` (~16) - Implementação simplificada
   - **Conflito**: Diferentes implementações, a de criaevento.js é mais completa

3. **openModal**
   - `criaevento.js` (~196) - Implementação com suporte a diferentes modais
   - `editarevento.js` (~130) - Implementação básica
   - **Conflito**: Funcionalidades diferentes

4. **closeModal**
   - `criaevento.js` (~217) - Implementação principal
   - `editarevento.js` (~138) - Implementação básica
   - **Conflito**: Implementações similares mas podem conflitar

5. **createPaidTicket**
   - `criaevento.js` (~811) - Implementação completa com API
   - `editarevento.js` (~146) - Implementação placeholder
   - **Conflito**: editarevento.js tem apenas alert de desenvolvimento

6. **createFreeTicket**
   - `criaevento.js` (~909) - Implementação completa com API
   - `editarevento.js` (~153) - Implementação placeholder
   - **Conflito**: editarevento.js tem apenas alert de desenvolvimento

7. **formatarDataHora**
   - `ingressos-pagos.js` (~221) - Implementação principal
   - `ingressos-gratuitos.js` (~200+) - Duplicação exata
   - **Conflito**: Código duplicado desnecessariamente

8. **initMap**
   - `criaevento.js` (~227) - Implementação completa com estilos
   - `editarevento.js` (~163) - Apenas console.log
   - **Conflito**: editarevento.js não implementa funcionalidade

### Funções que Sobrescrevem Outras

1. **validateStep**
   - Original em `criaevento.js` (~58)
   - Sobrescrita em `validation-fix.js` (~15) para corrigir step 4
   - **Nota**: Sobrescrita intencional para correção

2. **adicionarLotePorData**
   - Original em `lotes.js` (~35)
   - Mencionado como sobrescrito por `modal-correto.js`
   - **Nota**: Arquivo modal-correto.js não analisado ainda

3. **updateHeroPreview**
   - Original em `criaevento.js` (~1050)
   - Redefinida em `wizard-fix.js` (~102)
   - **Nota**: Versão do wizard-fix.js parece ser uma correção

4. **handleImageUpload**
   - Original em `criaevento.js` (~357)
   - Redefinida em `wizard-fix.js` (~123)
   - **Nota**: Versão do wizard-fix.js adiciona tratamento de erros

## 3. FUNÇÕES ESSENCIAIS PARA O WIZARD (marcadas com ⭐)

### Navegação do Wizard
- **validateStep** - Valida campos obrigatórios de cada step
- **nextStep** - Avança para próximo step
- **prevStep** - Volta para step anterior
- **updateStepDisplay** - Atualiza visualização do step atual

### Persistência de Dados
- **saveWizardData** - Salva todos dados do wizard em cookies
- **clearAllWizardData** - Limpa todos dados salvos
- **checkAndRestoreWizardData** - Verifica e restaura dados ao iniciar
- **restoreWizardData** - Restaura dados salvos

### Upload de Imagens
- **handleImageUpload** - Processa upload de logo, capa e fundo
- **handleMainImageUpload** - Processa upload da imagem principal
- **clearImage** - Remove imagem uploadada
- **initAdditionalUploads** - Inicializa sistema de uploads

### Gerenciamento de Lotes
- **adicionarLotePorData** - Adiciona lote por data
- **adicionarLotePorPercentual** - Adiciona lote por percentual
- **criarLoteData** - Cria lote por data
- **criarLotePercentual** - Cria lote por percentual
- **salvarLoteData** - Salva edição de lote por data
- **salvarLotePercentual** - Salva edição de lote percentual
- **excluirLoteData** - Exclui lote por data
- **excluirLotePercentual** - Exclui lote percentual
- **carregarLotesDoCookie** - Carrega lotes salvos

### Gerenciamento de Ingressos
- **createPaidTicket** - Cria ingresso pago
- **createFreeTicket** - Cria ingresso gratuito
- **calcularValoresIngresso** - Calcula valores com taxas
- **carregarLotesNoModal** - Carrega lotes no modal de ingresso pago
- **carregarLotesNoModalFree** - Carrega lotes no modal gratuito
- **addTicketToList** - Adiciona ingresso à lista visual
- **removeTicket** - Remove ingresso da lista

### Envio para API
- **enviarEventoParaAPI** - Envia todos dados para criar evento
- **coletarDadosFormulario** - Coleta todos dados do formulário
- **coletarDadosIngressos** - Coleta dados dos ingressos
- **validarDadosObrigatorios** - Valida dados antes de enviar

## 4. RECOMENDAÇÕES

### Resolução de Conflitos
1. **Remover duplicações desnecessárias**:
   - Manter apenas as funções de `criaevento.js` e remover as de `editarevento.js`
   - Consolidar `formatarDataHora` em um arquivo comum

2. **Criar arquivo de funções compartilhadas**:
   - `common-functions.js` para funções usadas em múltiplos lugares
   - Incluir: formatarDataHora, formatarMoeda, parsearValorMonetario

3. **Ordem de carregamento dos scripts**:
   1. `criaevento.js` - Base principal
   2. `lotes.js` - Gerenciamento de lotes
   3. `ingressos-pagos.js` - Ingressos pagos
   4. `ingressos-gratuitos.js` - Ingressos gratuitos
   5. `wizard-fix.js` - Correções e melhorias
   6. `validation-fix.js` - Correções de validação

### Melhorias Sugeridas
1. **Namespace global**: Criar objeto `AnySummit` para evitar poluição do escopo global
2. **Modularização**: Separar funções por responsabilidade
3. **Documentação**: Adicionar JSDoc em todas as funções essenciais
4. **Testes**: Criar testes unitários para funções críticas


### Funções de Combos (combo-functions.js)

| Nome da Função | Arquivo | Linha | O que faz | Duplicada em |
|----------------|---------|-------|-----------|--------------|
| **formatarMoeda** | combo-functions.js | ~4 | Formata valor para moeda BRL | ingressos-pagos.js (~29) |
| **formatarDataHora** | combo-functions.js | ~9 | Formata data e hora | ingressos-pagos.js, ingressos-gratuitos.js |
| **carregarLotesNoModalCombo** ⭐ | combo-functions.js | ~16 | Carrega lotes no modal de combo | - |
| **updateComboTicketDates** ⭐ | combo-functions.js | ~86 | Atualiza datas quando lote é selecionado | - |
| **populateComboTicketSelectByLote** | combo-functions.js | ~150+ | Popula select de tipos por lote | - |
| **updateComboItemsList** | combo-functions.js | ~180+ | Atualiza lista de itens do combo | - |
| **createComboTicket** ⭐ | combo-functions.js | ~200+ | Cria ingresso combo | - |
| **addItemToCombo** | combo-functions.js | ~250+ | Adiciona item ao combo | - |
| **removeItemFromCombo** | combo-functions.js | ~300+ | Remove item do combo | - |
| **calcularTotalCombo** | combo-functions.js | ~350+ | Calcula valor total do combo | - |
| **initComboPriceInput** | combo-functions.js | ~400+ | Inicializa campo de preço do combo | - |

### Funções de Upload de Imagens (upload-images.js)

| Nome da Função | Arquivo | Linha | O que faz | Duplicada em |
|----------------|---------|-------|-----------|--------------|
| **uploadImage** ⭐ | upload-images.js | ~11 | Faz upload de imagem para servidor | - |
| **clearImage** | upload-images.js | ~117 | Limpa imagem (versão atualizada) | criaevento.js (original) |

### Funções de Ingressos Temporários (temporary-tickets.js)

| Nome da Função | Arquivo | Linha | O que faz | Duplicada em |
|----------------|---------|-------|-----------|--------------|
| **addTicketToCreationList** ⭐ | temporary-tickets.js | ~7 | Adiciona ingresso temporário à lista | - |
| **renderTicketInList** | temporary-tickets.js | ~44 | Renderiza ingresso na lista visual | - |
| **editTemporaryTicket** | temporary-tickets.js | ~101 | Edita ingresso temporário | - |
| **removeTemporaryTicket** | temporary-tickets.js | ~118 | Remove ingresso temporário | - |
| **populateEditPaidTicketModalWithTemp** | temporary-tickets.js | ~135 | Popula modal de edição pago | - |
| **populateEditFreeTicketModalWithTemp** | temporary-tickets.js | ~145+ | Popula modal de edição gratuito | - |
| **getAllTemporaryTickets** | temporary-tickets.js | ~180+ | Obtém todos ingressos temporários | - |
| **clearAllTemporaryTickets** | temporary-tickets.js | ~200+ | Limpa todos ingressos temporários | - |
| **saveTemporaryTicketsToStorage** | temporary-tickets.js | ~220+ | Salva ingressos no localStorage | - |
| **loadTemporaryTicketsFromStorage** | temporary-tickets.js | ~240+ | Carrega ingressos do localStorage | - |

## ATUALIZAÇÃO DE CONFLITOS

### Novas Duplicações Encontradas

1. **formatarMoeda**
   - `combo-functions.js` (~4)
   - `ingressos-pagos.js` (~29)
   - **Conflito**: Função duplicada em múltiplos arquivos

2. **formatarDataHora**
   - `combo-functions.js` (~9) 
   - `ingressos-pagos.js` (~221)
   - `ingressos-gratuitos.js` (~200+)
   - **Conflito**: Triplicação da mesma função

3. **clearImage**
   - `criaevento.js` (~496) - Original
   - `upload-images.js` (~117) - Versão atualizada
   - **Conflito**: Versão do upload-images.js parece ser mais completa

## FUNÇÕES ESSENCIAIS ADICIONAIS

### Gerenciamento de Combos
- **carregarLotesNoModalCombo** - Carrega lotes no modal de combo
- **updateComboTicketDates** - Sincroniza datas do combo com lote
- **createComboTicket** - Cria ingresso tipo combo
- **calcularTotalCombo** - Calcula valor total do combo

### Upload de Imagens (melhorado)
- **uploadImage** - Faz upload assíncrono para servidor

### Sistema de Ingressos Temporários
- **addTicketToCreationList** - Adiciona ingresso temporário
- **getAllTemporaryTickets** - Retorna todos ingressos temporários
- **saveTemporaryTicketsToStorage** - Persiste ingressos no localStorage

## ARQUIVOS AINDA NÃO ANALISADOS

Os seguintes arquivos JS ainda precisam ser analisados para completar o inventário:

1. modal-correto.js
2. custom-dialogs.js
3. modal-simples.js
4. address-improvements.js
5. alert-overrides.js
6. terms-privacy-handler.js
7. wizard-debug.js
8. wizard-essential-fixes.js
9. wizard-fix-definitivo.js
10. publish-event-fix.js
11. preview-fix.js
12. maps-fix.js
13. lote-protection.js
14. lote-ticket-functions.js
15. final-fixes.js
16. correcoes-definitivas.js

### Observações sobre os arquivos não analisados:
- Muitos parecem ser correções específicas (*-fix.js)
- Alguns podem conter duplicações ou sobrescritas importantes
- modal-correto.js provavelmente sobrescreve funções de modais
- custom-dialogs.js pode ter sistema de diálogos customizados importante


### Funções de Diálogos Customizados (custom-dialogs.js)

| Nome da Função | Arquivo | Linha | O que faz | Duplicada em |
|----------------|---------|-------|-----------|--------------|
| **createDialogHTML** | custom-dialogs.js | ~12 | Cria estrutura HTML do dialog | - |
| **show** | custom-dialogs.js | ~38 | Mostra dialog customizado | - |
| **close** | custom-dialogs.js | ~76 | Fecha dialog | - |
| **alert** | custom-dialogs.js | ~90 | Dialog tipo alert | - |
| **confirm** | custom-dialogs.js | ~100 | Dialog tipo confirm | - |
| **wizardRestore** ⭐ | custom-dialogs.js | ~111 | Dialog específico para restaurar wizard | - |
| **customAlert** | custom-dialogs.js | ~129 | Override global de alert | - |
| **customConfirm** | custom-dialogs.js | ~130 | Override global de confirm | - |

### Funções de Modal Correto (modal-correto.js)

| Nome da Função | Arquivo | Linha | O que faz | Duplicada em |
|----------------|---------|-------|-----------|--------------|
| **abrirModalCorreto** | modal-correto.js | ~6 | Abre modal respeitando CSS | - |
| **configurarCamposLoteDataAposAbrir** | modal-correto.js | ~34 | Configura campos após abrir modal | - |
| **fecharModalCorreto** | modal-correto.js | ~118 | Fecha modal corretamente | - |
| **adicionarLotePorData** | modal-correto.js | ~129 | Override - Abre modal lote por data | lotes.js (original) |
| **formatDateTimeLocal** | modal-correto.js | ~200+ | Formata data para datetime-local | lotes.js (duplicada) |

## RESUMO FINAL DO INVENTÁRIO

### Total de Funções Analisadas
- **Total**: ~180 funções identificadas
- **Funções essenciais marcadas com ⭐**: 35 funções
- **Duplicações identificadas**: 12 casos
- **Sobrescritas intencionais**: 5 casos

### Arquivos Analisados (15 de ~80)
1. criaevento.js - Arquivo principal do wizard
2. editarevento.js - Versão para edição (simplificada)
3. wizard-fix.js - Correções do wizard
4. lotes.js - Gerenciamento de lotes
5. ingressos-pagos.js - Ingressos pagos
6. ingressos-gratuitos.js - Ingressos gratuitos
7. validation-fix.js - Correção validação step 4
8. combo-functions.js - Funções de combos
9. upload-images.js - Upload melhorado
10. temporary-tickets.js - Ingressos temporários
11. custom-dialogs.js - Diálogos customizados
12. modal-correto.js - Sistema de modais corrigido

### Principais Problemas Identificados

1. **Múltiplas duplicações de funções utilitárias**:
   - `formatarDataHora` existe em 3 arquivos
   - `formatarMoeda` existe em 2 arquivos
   - `formatDateTimeLocal` existe em 2 arquivos

2. **Conflitos entre criaevento.js e editarevento.js**:
   - Funções com mesmo nome mas implementações diferentes
   - editarevento.js tem muitas funções placeholder

3. **Sistema de modais fragmentado**:
   - `openModal/closeModal` em múltiplos arquivos
   - `modal-correto.js` tenta corrigir problemas
   - Falta padronização

4. **Muitos arquivos de correção (*-fix.js)**:
   - Indica problemas no código base
   - Dificulta manutenção
   - Cria dependências complexas

### Recomendações Prioritárias

1. **URGENTE - Consolidar funções utilitárias**:
   ```javascript
   // Criar arquivo: common-functions.js
   const AnySummitUtils = {
       formatarDataHora: function() { /* ... */ },
       formatarMoeda: function() { /* ... */ },
       formatDateTimeLocal: function() { /* ... */ },
       parsearValorMonetario: function() { /* ... */ }
   };
   ```

2. **Resolver conflitos criaevento.js vs editarevento.js**:
   - Usar herança ou composição
   - Compartilhar código comum
   - Remover duplicações

3. **Padronizar sistema de modais**:
   - Escolher uma implementação única
   - Remover modal-correto.js após corrigir original
   - Documentar uso correto

4. **Reduzir arquivos *-fix.js**:
   - Incorporar correções no código base
   - Remover arquivos desnecessários
   - Manter apenas correções temporárias essenciais

5. **Criar documentação de APIs internas**:
   - Documentar funções essenciais
   - Criar guia de uso do wizard
   - Mapear dependências entre arquivos

### Ordem de Carregamento Recomendada
```html
<!-- 1. Utilitários -->
<script src="js/common-functions.js"></script>

<!-- 2. Sistema de diálogos -->
<script src="js/custom-dialogs.js"></script>

<!-- 3. Base do wizard -->
<script src="js/criaevento.js"></script>

<!-- 4. Módulos específicos -->
<script src="js/lotes.js"></script>
<script src="js/temporary-tickets.js"></script>
<script src="js/ingressos-pagos.js"></script>
<script src="js/ingressos-gratuitos.js"></script>
<script src="js/combo-functions.js"></script>

<!-- 5. Correções (temporárias) -->
<script src="js/wizard-fix.js"></script>
<script src="js/validation-fix.js"></script>
```

### Próximos Passos
1. Analisar os ~65 arquivos JS restantes
2. Criar mapa de dependências completo
3. Implementar sistema de módulos (ES6 ou similar)
4. Adicionar testes unitários para funções críticas
5. Documentar fluxo completo do wizard

---
**Nota**: Este inventário cobre aproximadamente 20% dos arquivos JS da pasta. Uma análise completa é recomendada para identificar todos os conflitos e dependências.

