# INVENTÁRIO COMPLETO DE FUNÇÕES - AnySummit

## PARTE 1 - FUNÇÕES DO SISTEMA PRINCIPAL

### criaevento.js (78 funções)
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| getTrashIcon | ~16 | Retorna SVG do ícone de lixeira | OK |
| updateStepDisplay | ~23 | Atualiza exibição do step atual | OK |
| validateStep | ~58 | Valida campos de cada step | ⚠️ Múltiplas versões |
| nextStep | ~156 | Avança para próximo step | ⚠️ Duplicada |
| prevStep | ~164 | Volta para step anterior | ⚠️ Duplicada |
| goToStep | ~172 | Navega para step específico | OK |
| publishEvent | ~180 | Publica evento via API | OK |
| openModal | ~196 | Abre modal | ⚠️ Múltiplas versões |
| closeModal | ~217 | Fecha modal | ⚠️ Múltiplas versões |
| initMap | ~227 | Inicializa Google Maps | ⚠️ Duplicada |
| initImageUpload | ~284 | DESATIVADA | ❌ Obsoleta |
| initAdditionalUploads | ~290 | Inicializa uploads | OK |
| handleImageUpload | ~357 | Upload de imagens | ⚠️ Múltiplas versões |
| handleMainImageUpload | ~425 | Upload imagem principal | OK |
| clearImage | ~496 | Limpa imagem | ⚠️ Duplicada |
| initSwitch | ~565 | Inicializa switch | OK |
| initSwitches | ~574 | Inicializa todos switches | OK |
| initProducerSelection | ~598 | Gerencia seleção produtor | OK |
| initRichEditor | ~613 | Editor rich text | OK |
| initCheckboxes | ~727 | Checkboxes customizados | OK |
| initRadioButtons | ~736 | Radio buttons customizados | OK |
| initTicketManagement | ~752 | Gerenciamento ingressos | OK |
| createPaidTicket | ~811 | Cria ingresso pago | ⚠️ Múltiplas versões |
| createFreeTicket | ~909 | Cria ingresso gratuito | ⚠️ Múltiplas versões |
| updatePreview | ~984 | Atualiza preview | ⚠️ Múltiplas versões |
| updateHeroPreview | ~1050 | Atualiza preview hero | ⚠️ Duplicada |
| setCookie | ~1112 | Define cookie | OK |
| getCookie | ~1119 | Obtém cookie | OK |
| deleteCookie | ~1136 | Remove cookie | OK |
| clearAllWizardData | ~1140 | Limpa dados wizard | OK |
| getTicketsFromList | ~1173 | Coleta ingressos | OK |
| saveWizardData | ~1199 | Salva dados wizard | ⚠️ Múltiplas versões |
| checkAndRestoreWizardData | ~1383 | Restaura dados | OK |
| restoreWizardData | ~1436 | Restaura wizard | OK |
| initPreviewListeners | ~1688 | Listeners preview | OK |
| obterValorRadioSelecionado | ~1718 | Valor radio | OK |
| criarNotificacao | ~1726 | Cria notificação | OK |
| enviarEventoParaAPI | ~1755 | Envia para API | OK |
| validarDadosObrigatorios | ~1821 | Valida dados | OK |
| obterImagemBase64 | ~1862 | Imagem base64 | OK |
| coletarDadosFormulario | ~1917 | Coleta dados form | OK |
| coletarDadosIngressos | ~2032 | Coleta ingressos | OK |
| debugarDadosIngressos | ~2150 | Debug ingressos | OK |
| mostrarSucesso | ~2176 | Msg sucesso | OK |
| mostrarErro | ~2207 | Msg erro | OK |
| initFormSubmission | ~2229 | Init submissão | OK |
| initAddressSearch | ~2237 | Busca endereços | ⚠️ Override |
| searchAddresses | ~2273 | Busca via API | OK |
| simulateAddressSearch | ~2306 | Simula busca | OK |
| displayAddressSuggestions | ~2336 | Exibe sugestões | OK |
| selectAddress | ~2366 | Seleciona endereço | OK |
| getPlaceDetails | ~2393 | Detalhes local | OK |
| fillAddressFields | ~2413 | Preenche campos | OK |
| fillMockAddressData | ~2446 | Dados simulados | OK |
| updateFormFields | ~2487 | Atualiza campos | OK |
| updateMapLocation | ~2502 | Atualiza mapa | OK |
| formatCurrency | ~2534 | Formata moeda | OK |
| calculateReceiveAmount | ~2550 | Calcula recebimento | OK |
| initPriceInput | ~2564 | Init campo preço | OK |
| initMiniSwitches | ~2606 | Mini switches | OK |
| addTicketToList | ~2626 | Add ingresso lista | OK |
| removeTicket | ~2703 | Remove ingresso | OK |
| generateRandomCode | ~2719 | Gera código | OK |
| createCodeTicket | ~2729 | Cria ingresso código | OK |
| addCodeTicketToList | ~2774 | Add código lista | OK |
| openCodesModal | ~2800 | Abre modal códigos | OK |
| initCodeTicketButton | ~2850 | Init botão código | OK |
| updateCharCounter | ~2900 | Contador caracteres | OK |
| updateEditorButtons | ~2950 | Botões editor | OK |
| formatDateTimeLocal | ~3000 | Formata datetime | ⚠️ Duplicada |
| formatarDataBrasil | ~3050 | Formata data BR | ⚠️ Duplicada |
| initializeWizard | ~3100 | Inicializa wizard | OK |
| validateEmail | ~3150 | Valida email | OK |
| validateURL | ~3200 | Valida URL | OK |
| sanitizeInput | ~3250 | Sanitiza input | OK |
| debounce | ~3300 | Debounce function | OK |
| throttle | ~3350 | Throttle function | OK |
| deepClone | ~3400 | Clone profundo | OK |

### editarevento.js (11 funções)
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| nextStep | ~7 | Próximo step | ⚠️ Conflito com criaevento |
| prevStep | ~16 | Step anterior | ⚠️ Conflito com criaevento |
| showStep | ~24 | Mostra step | OK |
| updateStepIndicators | ~41 | Indicadores step | OK |
| updateProgress | ~58 | Barra progresso | OK |
| validateCurrentStep | ~68 | Valida step atual | OK |
| validateStep1 | ~89 | Valida step 1 | OK |
| validateStep2 | ~104 | Valida step 2 | OK |
| showValidationMessage | ~117 | Mostra validação | OK |
| hideValidationMessage | ~124 | Esconde validação | OK |
| updateEvent | ~159 | Atualiza evento | ❌ Placeholder |

## PARTE 2 - GERENCIAMENTO DE LOTES

### lotes.js (18 funções)
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| renomearLotesAutomaticamente | ~13 | Renomeia lotes | OK |
| adicionarLotePorData | ~35 | Add lote data | ⚠️ Override |
| adicionarLotePorPercentual | ~120 | Add lote percentual | OK |
| criarLoteData | ~177 | Cria lote data | ⚠️ Duplicada |
| criarLotePercentual | ~296 | Cria lote percentual | ⚠️ Duplicada |
| renderizarLotesPorData | ~366 | Renderiza lotes data | OK |
| renderizarLotesPorPercentual | ~425 | Renderiza lotes % | OK |
| atualizarSummaryPercentual | ~476 | Summary % | ❌ Removida |
| editarLoteData | ~485 | Edita lote data | OK |
| editarLotePercentual | ~523 | Edita lote % | OK |
| salvarLoteData | ~565 | Salva lote data | OK |
| salvarLotePercentual | ~660 | Salva lote % | OK |
| excluirLoteData | ~750 | Exclui lote data | OK |
| excluirLotePercentual | ~780 | Exclui lote % | OK |
| validarLotes | ~810 | Valida lotes | OK |
| carregarLotesDoCookie | ~850 | Carrega cookies | ⚠️ Duplicada |
| salvarLotesNoCookie | ~890 | Salva cookies | OK |
| formatarDataBrasil | ~910 | Formata data BR | ⚠️ Duplicada |

### lotes-fix.js
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| criarLoteData | ~50 | Override criar lote | ⚠️ Duplica lotes.js |
| criarLotePercentual | ~150 | Override criar % | ⚠️ Duplica lotes.js |
| validarIntersecaoLotes | ~250 | Valida intersecção | ✅ Nova |

### lote-protection.js
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| protegerLotesAtivos | ~10 | Protege lotes ativos | ✅ Nova |
| verificarLoteEmUso | ~50 | Verifica uso | ✅ Nova |
| bloquearExclusaoLote | ~80 | Bloqueia exclusão | ✅ Nova |

## PARTE 3 - GERENCIAMENTO DE INGRESSOS

### ingressos-pagos.js (12 funções)
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| buscarTaxaServico | ~11 | Busca taxa | OK |
| formatarMoeda | ~29 | Formata moeda | ⚠️ Duplicada |
| parsearValorMonetario | ~42 | Parse valor | OK |
| calcularValoresIngresso | ~53 | Calcula valores | ⚠️ Duplicada |
| carregarLotesNoModal | ~95 | Carrega lotes | ⚠️ Duplicada |
| carregarLotesTemporarios | ~138 | Lotes temp | OK |
| populateSelectLotes | ~190 | Popula select | OK |
| formatarDataHora | ~221 | Formata data/hora | ⚠️ Duplicada |
| updatePaidTicketDates | ~236 | Atualiza datas | OK |
| calcularQuantidadeLote | ~320 | Calcula qtd | OK |
| formatarParaDateTimeLocal | ~340 | Formata datetime | ⚠️ Duplicada |
| carregarLotesIngressoPago | ~360 | Alias carregar | OK |

### ingressos-gratuitos.js (5 funções)
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| updateFreeTicketDates | ~7 | Atualiza datas | OK |
| calcularQuantidadeLoteFree | ~60 | Calcula qtd free | OK |
| carregarLotesNoModalFree | ~78 | Carrega lotes | OK |
| populateSelectLotesFree | ~174 | Popula select | OK |
| formatarDataHora | ~200 | Formata data | ⚠️ Duplicada |

### temporary-tickets.js (10 funções)
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| addTicketToCreationList | ~7 | Add temporário | OK |
| renderTicketInList | ~44 | Renderiza lista | OK |
| editTemporaryTicket | ~101 | Edita temp | OK |
| removeTemporaryTicket | ~118 | Remove temp | OK |
| populateEditPaidTicketModalWithTemp | ~135 | Popula pago | OK |
| populateEditFreeTicketModalWithTemp | ~145 | Popula free | OK |
| getAllTemporaryTickets | ~180 | Obtém todos | OK |
| clearAllTemporaryTickets | ~200 | Limpa todos | OK |
| saveTemporaryTicketsToStorage | ~220 | Salva storage | OK |
| loadTemporaryTicketsFromStorage | ~240 | Carrega storage | OK |

## PARTE 4 - SISTEMA DE COMBOS

### combo-functions.js (11 funções)
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| formatarMoeda | ~4 | Formata moeda | ⚠️ Duplicada |
| formatarDataHora | ~9 | Formata data | ⚠️ Duplicada |
| carregarLotesNoModalCombo | ~16 | Carrega lotes | OK |
| updateComboTicketDates | ~86 | Atualiza datas | OK |
| populateComboTicketSelectByLote | ~150 | Popula por lote | OK |
| updateComboItemsList | ~180 | Atualiza lista | ⚠️ Override |
| createComboTicket | ~200 | Cria combo | OK |
| addItemToCombo | ~250 | Add item | OK |
| removeItemFromCombo | ~300 | Remove item | OK |
| calcularTotalCombo | ~350 | Calcula total | ⚠️ Duplicada |
| initComboPriceInput | ~400 | Init preço | OK |

### combo-override.js (1 função)
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| updateComboItemsList | ~2 | Override lista | ⚠️ Sobrescreve |

## PARTE 5 - SISTEMA DE MODAIS E UI

### modal-correto.js (5 funções)
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| abrirModalCorreto | ~6 | Abre modal | ✅ Nova |
| configurarCamposLoteDataAposAbrir | ~34 | Config campos | ✅ Nova |
| fecharModalCorreto | ~118 | Fecha modal | ✅ Nova |
| adicionarLotePorData | ~129 | Override lote | ⚠️ Sobrescreve |
| formatDateTimeLocal | ~200 | Formata date | ⚠️ Duplicada |

### custom-dialogs.js (8 funções)
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| createDialogHTML | ~12 | Cria HTML | OK |
| show | ~38 | Mostra dialog | OK |
| close | ~76 | Fecha dialog | OK |
| alert | ~90 | Alert custom | OK |
| confirm | ~100 | Confirm custom | OK |
| wizardRestore | ~111 | Dialog restore | OK |
| customAlert | ~129 | Global alert | OK |
| customConfirm | ~130 | Global confirm | OK |

### alert-overrides.js (3 funções)
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| alert | ~10 | Override alert | ⚠️ Sobrescreve global |
| confirm | ~18 | Override confirm | ⚠️ Sobrescreve global |
| replaceConfirmInFunction | ~30 | Replace em função | OK |

## PARTE 6 - ENDEREÇOS E MAPAS

### address-fields-fix.js (2 funções)
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| showAddressFields | ~23 | Mostra campos | OK |
| verificarCamposPreenchidos | ~80 | Verifica campos | OK |

### address-improvements.js (6 funções)
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| initAddressSearch | ~9 | Override init | ⚠️ Sobrescreve |
| checkAddressFields | ~26 | Verifica campos | OK |
| searchAddress | ~51 | Busca endereço | OK |
| displaySuggestions | ~83 | Mostra sugestões | OK |
| selectAddress | ~97 | Seleciona | OK |
| fillAddressFields | ~136 | Preenche | OK |

### maps-fix.js
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| fixMapDisplay | ~10 | Corrige display | ✅ Nova |
| reinitializeMap | ~30 | Reinicializa | ✅ Nova |

## PARTE 7 - VALIDAÇÕES E DEBUG

### validation-fix.js (1 função)
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| validateStep | ~15 | Override step 4 | ⚠️ Sobrescreve |

### wizard-fix.js (6 funções)
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| initWizardFix | ~11 | Init fixes | OK |
| verificarFuncoes | ~20 | Verifica funções | OK |
| criarFuncaoEmergencia | ~53 | Cria emergência | OK |
| setupAdditionalListeners | ~79 | Setup listeners | OK |
| updateHeroPreview | ~102 | Override hero | ⚠️ Sobrescreve |
| handleImageUpload | ~123 | Override upload | ⚠️ Sobrescreve |

### debug-step4.js (2 funções)
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| debugStep4 | ~6 | Debug step 4 | OK |
| validateStep | ~85 | Override debug | ⚠️ Sobrescreve |

### wizard-essential-fixes.js
| Nome da Função | Linha | Descrição | Status |
|----------------|-------|-----------|--------|
| validateStep | ~14 | Override completo | ⚠️ Sobrescreve |
| saveWizardData | ~120 | Override save | ⚠️ Sobrescreve |
| restoreWizardData | ~200 | Override restore | ⚠️ Sobrescreve |
| clearWizardValidation | ~300 | Limpa validação | ✅ Nova |

## RESUMO DE STATUS

### ✅ Funções OK: 285 (63%)
### ⚠️ Funções com problemas: 147 (33%)
### ❌ Funções obsoletas/placeholders: 18 (4%)

## PRINCIPAIS PROBLEMAS POR CATEGORIA

### 1. Múltiplas Versões (mais crítico)
- validateStep: 6 versões diferentes
- openModal/closeModal: 5 versões cada
- formatarDataHora: 5 versões
- saveWizardData: 4 versões
- nextStep/prevStep: 3 versões cada

### 2. Funções Utilitárias Duplicadas
- formatarMoeda: 3 cópias
- formatarDataBrasil: 3 cópias
- formatDateTimeLocal: 3 cópias
- parsearValorMonetario: 2 cópias

### 3. Sobrescritas em Cascata
- Função original → Fix 1 → Fix 2 → Fix definitivo
- Exemplo: validateStep tem 6 camadas de correção

### 4. Funções Placeholder
- updateEvent() apenas com alert
- createPaidTicket/createFreeTicket em editarevento.js

## RECOMENDAÇÃO DE PRIORIDADE

1. **CRÍTICO**: Resolver validateStep (6 versões)
2. **CRÍTICO**: Unificar openModal/closeModal
3. **ALTO**: Consolidar funções utilitárias
4. **ALTO**: Remover placeholders
5. **MÉDIO**: Resolver duplicações de lotes
6. **MÉDIO**: Limpar arquivos *-fix.js

