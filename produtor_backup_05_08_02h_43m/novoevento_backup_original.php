<?php
include("check_login.php");
include("conm/conn.php");
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Produtor - Anysummit</title>
        <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qr-scanner/1.4.2/qr-scanner.umd.min.js"></script>
      <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-1-0-0.css">
      <link rel="stylesheet" type="text/css" href="/produtor/css/checkin-painel-1-0-0.css">
         <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" type="text/css" href="/produtor/css/criaevento.css" />
  
    <style>
        /* Estilo para botão cancelar */
        .btn-cancel {
            background: #6b7280 !important;
            color: white !important;
        }
        
        .btn-cancel:hover {
            background: #4b5563 !important;
        }
    </style>
</head>
<body>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>

    <!-- Header -->
    <header class="header">
        <div class="logo-section">
          <img src="img/logohori.png" style="width:100%; max-width:200px;">
        </div>
        
        <div class="header-right">
            <div class="menu-toggle" onClick="toggleMobileMenu()">
                <div class="hamburger-line"></div>
                <div class="hamburger-line"></div>
                <div class="hamburger-line"></div>
            </div>
            <div class="user-menu">
                <div class="user-icon" onClick="toggleUserDropdown()">👤</div>
                <div class="user-dropdown" id="userDropdown">
                    
                    <div class="dropdown-item" onClick="logout()">
                        🚪 Sair
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Mobile Overlay -->
    <div class="mobile-overlay" id="mobileOverlay" onClick="closeMobileMenu()"></div>

    <!-- Main Layout -->
    <div class="main-layout">
        <!-- Sidebar -->
        <?php include 'menu.php'?>

        <!-- Content Area -->
        <main class="content-area">
     <div class="container">
      <div class="header" style="display: block;    position: relative;    z-index: 8;    text-align: center;    margin-bottom: 25px;    border-radius: 20px;">
               
            <p>Criar novo evento</p>
        </div>

        <!-- Progress Bar -->
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-line" id="progressLine"></div>
                <div class="step active" data-step="1">
                    <div class="step-number"><span>1</span></div>
                    <div class="step-title">Informações</div>
                </div>
                <div class="step" data-step="2">
                    <div class="step-number"><span>2</span></div>
                    <div class="step-title">Data e Hora</div>
                </div>
                <div class="step" data-step="3">
                    <div class="step-number"><span>3</span></div>
                    <div class="step-title">Descrição</div>
                </div>
                <div class="step" data-step="4">
                    <div class="step-number"><span>4</span></div>
                    <div class="step-title">Localização</div>
                </div>
                <div class="step" data-step="5">
                    <div class="step-number"><span>5</span></div>
                    <div class="step-title">Tipos de Ingresso</div>
                </div>
                <div class="step" data-step="6">
                    <div class="step-number"><span>6</span></div>
                    <div class="step-title">Produtor</div>
                </div>
                <div class="step" data-step="7">
                    <div class="step-number"><span>7</span></div>
                    <div class="step-title">Publicar</div>
                </div>
            </div>
        </div>

        <div class="main-content">
            <div class="form-container">
                <!-- Step 1: Informações Básicas -->
                <div class="section-card active" data-step-content="1">
                    <div class="section-header">
                        <div class="section-number">1</div>
                        <div>
                            <div class="section-title">📦 Informações básicas</div>
                            <div class="section-subtitle">Adicione as principais informações do evento</div>
                        </div>
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="eventName">Nome do evento <span class="required">*</span></label>
                        <input type="text" id="eventName" placeholder="Ex: Summit de Tecnologia 2025" required>
                    </div>

                    <div class="form-group full-width">
                        <label>Imagem de capa </label>
                        <div class="upload-area" onClick="document.getElementById('imageUpload').click()">
                            <div class="upload-icon">🖼️</div>
                            <div class="upload-text">Clique para adicionar uma imagem</div>
                            <div class="upload-hint">PNG, JPG até 5MB • Tamanho mínimo: 1200x600px</div>
                        </div>
                        <input type="file" id="imageUpload" accept="image/*" style="display: none;">
                        <img id="imagePreview" class="image-preview" style="display: none;">
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label for="classification">Classificação do evento <span class="required">*</span></label>
                            <select id="classification">
                                <option value="">Selecione uma classificação</option>
                                <option value="livre">Livre</option>
                                <option value="10">10 anos</option>
                                <option value="12">12 anos</option>
                                <option value="14">14 anos</option>
                                <option value="16">16 anos</option>
                                <option value="18">18 anos</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="category">Categoria <span class="required">*</span></label>
                            <select id="category">
                                <option value="">Selecione uma categoria</option>
                                <option value="tecnologia">Tecnologia</option>
                                <option value="negocios">Negócios</option>
                                <option value="educacao">Educação</option>
                                <option value="entretenimento">Entretenimento</option>
                                <option value="esportes">Esportes</option>
                                <option value="arte-cultura">Arte e Cultura</option>
                            </select>
                        </div>
                    </div>

                    <div class="validation-message" id="validation-step-1">
                        Por favor, preencha todos os campos obrigatórios.
                    </div>

                    <div class="step-navigation">
                        <button class="nav-btn btn-back" disabled>← Voltar</button>
                        <button class="nav-btn btn-cancel" onClick="window.location.href='/produtor/meuseventos.php'">Cancelar</button>
                        <button class="nav-btn btn-continue" onClick="nextStep()">Avançar →</button>
                    </div>
                </div>

                <!-- Step 2: Data e Horário -->
                <div class="section-card" data-step-content="2">
                    <div class="section-header">
                        <div class="section-number">2</div>
                        <div>
                            <div class="section-title">📅 Data e horário</div>
                            <div class="section-subtitle">Defina quando seu evento irá acontecer</div>
                        </div>
                    </div>

                    <div class="datetime-grid">
                        <div class="form-group">
                            <label for="startDateTime">Data e hora de início <span class="required">*</span></label>
                            <input type="datetime-local" id="startDateTime" required>
                        </div>
                        <div class="form-group">
                            <label for="endDateTime">Data e hora de término</label>
                            <input type="datetime-local" id="endDateTime">
                        </div>
                    </div>

                 <!--   <div class="switch-container">
                        <div class="switch" id="multiDaySwitch">
                            <div class="switch-handle"></div>
                        </div>
                        <label>Evento com duração em dias diferentes?</label>
                    </div>-->

                    <div class="validation-message" id="validation-step-2">
                        Por favor, defina a data e hora de início do evento.
                    </div>

                    <div class="step-navigation">
                        <button class="nav-btn btn-back" onClick="prevStep()">← Voltar</button>
                        <button class="nav-btn btn-cancel" onClick="window.location.href='/produtor/meuseventos.php'">Cancelar</button>
                        <button class="nav-btn btn-continue" onClick="nextStep()">Avançar →</button>
                    </div>
                </div>

                <!-- Step 3: Descrição do Evento -->
                <div class="section-card" data-step-content="3">
                    <div class="section-header">
                        <div class="section-number">3</div>
                        <div>
                            <div class="section-title">📝 Descrição do evento</div>
                            <div class="section-subtitle">Conte sobre o seu evento, inclua detalhes e formatação</div>
                        </div>
                    </div>

                    <div class="form-group full-width">
                        <label>Descrição completa</label>
                        <div class="editor-toolbar">
                            <button type="button" class="editor-btn" data-command="bold" title="Negrito">
                                <strong>B</strong>
                            </button>
                            <button type="button" class="editor-btn" data-command="italic" title="Itálico">
                                <em>I</em>
                            </button>
                            <button type="button" class="editor-btn" data-command="underline" title="Sublinhado">
                                <u>U</u>
                            </button>
                            <button type="button" class="editor-btn" data-command="insertUnorderedList" title="Lista">
                                •
                            </button>
                        </div>
                        <div id="eventDescription" class="rich-editor" contenteditable="true" placeholder="Descreva detalhadamente seu evento, inclua agenda, palestrantes, benefícios..."></div>
                        <div class="char-counter" id="charCounter">0 caracteres</div>
                    </div>

                <!--    <div class="info-box">
                        <div class="info-box-title">📋 Política de cancelamento</div>
                        <div class="info-box-text">
                            Você pode cancelar ou reagendar seu evento até 7 dias antes da data de realização. 
                            Cancelamentos realizados com menos de 7 dias de antecedência podem estar sujeitos a taxas. 
                            <a href="#" style="color: #00C2FF;">Saiba mais sobre nossa política</a>
                        </div>
                    </div>-->

                    <div class="step-navigation">
                        <button class="nav-btn btn-back" onClick="prevStep()">← Voltar</button>
                        <button class="nav-btn btn-cancel" onClick="window.location.href='/produtor/meuseventos.php'">Cancelar</button>
                        <button class="nav-btn btn-continue" onClick="nextStep()">Avançar →</button>
                    </div>
                </div>

                <!-- Step 4: Localização -->
                <div class="section-card" data-step-content="4">
                    <div class="section-header">
                        <div class="section-number">4</div>
                        <div>
                            <div class="section-title">📍 Onde o seu evento vai acontecer</div>
                            <div class="section-subtitle">Local físico ou plataforma online</div>
                        </div>
                    </div>

                    <div class="switch-container">
                        <div class="switch active" id="locationTypeSwitch">
                            <div class="switch-handle"></div>
                        </div>
                        <label>Evento presencial</label>
                    </div>

                    <div class="conditional-section show" id="presentialLocation">
                        <div class="form-group full-width">
                            <label for="addressSearch">Buscar endereço <span class="required">*</span></label>
                            <input type="text" id="addressSearch" placeholder="Digite o endereço completo ou nome do local">
                            <div id="addressSuggestions" class="address-suggestions"></div>
                        </div>
                        
                        <div class="location-grid">
                            <div class="form-group">
                                <label for="venueName">Nome do local <span class="required">*</span></label>
                                <input type="text" id="venueName" placeholder="Ex: Centro de Convenções Anhembi">
                            </div>
                            <div class="form-group">
                                <label for="cep">CEP</label>
                                <input type="text" id="cep" placeholder="00000-000" readonly>
                            </div>
                            <div class="form-group">
                                <label for="street">Rua</label>
                                <input type="text" id="street" placeholder="Nome da rua" readonly>
                            </div>
                            <div class="form-group">
                                <label for="number">Número</label>
                                <input type="text" id="number" placeholder="123">
                            </div>
                            <div class="form-group">
                                <label for="complement">Complemento</label>
                                <input type="text" id="complement" placeholder="Sala, andar...">
                            </div>
                            <div class="form-group">
                                <label for="neighborhood">Bairro</label>
                                <input type="text" id="neighborhood" placeholder="Nome do bairro" readonly>
                            </div>
                            <div class="form-group">
                                <label for="city">Cidade</label>
                                <input type="text" id="city" placeholder="Nome da cidade" readonly>
                            </div>
                            <div class="form-group">
                                <label for="state">Estado</label>
                                <input type="text" id="state" placeholder="Estado" readonly>
                            </div>
                        </div>
                        <div id="map" class="map-container" style="display:none;"></div>
                    </div>

                    <div class="conditional-section" id="onlineLocation">
                        <div class="form-group">
                            <label for="eventLink">Link do evento <span class="required">*</span></label>
                            <input type="url" id="eventLink" placeholder="https://zoom.us/j/123456789">
                        </div>
                    </div>

                    <div class="validation-message" id="validation-step-4">
                        Por favor, informe o local do evento.
                    </div>

                    <div class="step-navigation">
                        <button class="nav-btn btn-back" onClick="prevStep()">← Voltar</button>
                        <button class="nav-btn btn-cancel" onClick="window.location.href='/produtor/meuseventos.php'">Cancelar</button>
                        <button class="nav-btn btn-continue" onClick="nextStep()">Avançar →</button>
                    </div>
                </div>

                <!-- Step 5: Ingressos -->
                <div class="section-card" data-step-content="5">
                    <div class="section-header">
                        <div class="section-number">5</div>
                        <div>
                            <div class="section-title">🎟️ Tipos de Ingresso</div>
                            <div class="section-subtitle">Configure os tipos de ingresso e valores</div>
                        </div>
                    </div>

                    <div class="ticket-list" id="ticketList"></div>

                    <div class="ticket-actions">
                        <button class="btn btn-outline" type="button" id="addPaidTicket">
                            ➕ Tipo de Ingresso Pago
                        </button>
                        <button class="btn btn-outline" type="button" id="addFreeTicket">
                            🆓 Tipo de Ingresso Gratuito
                        </button>
                        <button class="btn btn-outline" type="button" id="addComboTicket" onclick="console.log('Combo clicked!'); openModal('comboTicketModal');">
                            📦 Combo de Tipos de Ingresso
                        </button>
                    </div>

                    <div class="step-navigation">
                        <button class="nav-btn btn-back" onClick="prevStep()">← Voltar</button>
                        <button class="nav-btn btn-cancel" onClick="window.location.href='/produtor/meuseventos.php'">Cancelar</button>
                        <button class="nav-btn btn-continue" onClick="nextStep()">Avançar →</button>
                    </div>
                </div>

                <!-- Step 6: Sobre o Produtor -->
                <div class="section-card" data-step-content="6">
                    <div class="section-header">
                        <div class="section-number">6</div>
                        <div>
                            <div class="section-title">🧑‍💼 Sobre o produtor</div>
                            <div class="section-subtitle">Informações sobre quem está organizando o evento</div>
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label for="producer">Selecionar produtor</label>
                            <select id="producer">
                                <option value="current">Você (João Silva)</option>
                                <option value="new">Novo produtor</option>
                            </select>
                        </div>
                    </div>

                    <div class="conditional-section" id="newProducerFields">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="producerName">Nome do produtor <span class="required">*</span></label>
                                <input type="text" id="producerName" placeholder="Nome completo ou empresa">
                            </div>
                            <div class="form-group">
                                <label for="displayName">Nome de exibição</label>
                                <input type="text" id="displayName" placeholder="Como aparecerá no evento">
                            </div>
                        </div>
                        <div class="form-group full-width">
                            <label for="producerDescription">Descrição do produtor (opcional)</label>
                            <textarea id="producerDescription" rows="4" placeholder="Conte um pouco sobre você ou sua empresa..."></textarea>
                        </div>
                    </div>

                    <div class="step-navigation">
                        <button class="nav-btn btn-back" onClick="prevStep()">← Voltar</button>
                        <button class="nav-btn btn-cancel" onClick="window.location.href='/produtor/meuseventos.php'">Cancelar</button>
                        <button class="nav-btn btn-continue" onClick="nextStep()">Avançar →</button>
                    </div>
                </div>

                <!-- Step 7: Responsabilidades e Publicação -->
                <div class="section-card" data-step-content="7">
                    <div class="section-header">
                        <div class="section-number">7</div>
                        <div>
                            <div class="section-title">📜 Responsabilidades e publicação</div>
                            <div class="section-subtitle">Configurações finais e termos de uso</div>
                        </div>
                    </div>

                    <div class="checkbox-group">
                        <div class="checkbox" id="termsCheckbox"></div>
                        <label for="termsCheckbox">
                            Concordo com os <a href="#" style="color: #00C2FF;">Termos de uso</a> e 
                            <a href="#" style="color: #00C2FF;">Políticas de privacidade</a> da plataforma
                        </label>
                    </div>

                    <div class="form-group">
                        <label>Visibilidade do evento</label>
                        <div class="radio-group">
                            <div class="radio-item">
                                <div class="radio checked" data-value="public"></div>
                                <div>
                                    <div style="font-weight: 500;">Público</div>
                                    <div style="font-size: 0.85rem; color: #8B95A7;">Qualquer pessoa pode encontrar e se inscrever no seu evento</div>
                                </div>
                            </div>
                            <div class="radio-item">
                                <div class="radio" data-value="private"></div>
                                <div>
                                    <div style="font-weight: 500;">Privado</div>
                                    <div style="font-size: 0.85rem; color: #8B95A7;">Apenas pessoas com convite ou link direto podem acessar</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="validation-message" id="validation-step-7">
                        Por favor, aceite os termos de uso para publicar o evento.
                    </div>

                    <div class="step-navigation">
                        <button class="nav-btn btn-back" onClick="prevStep()">← Voltar</button>
                        <button class="nav-btn btn-publish" onClick="publishEvent()">
                            ✓ Publicar evento
                        </button>
                    </div>
                </div>
            </div>

            <!-- Preview Card -->
            <div class="preview-card">
                <div class="preview-title">
                    👁️ Prévia do Evento
                </div>
                <div class="event-preview">
                    <div class="preview-image" id="previewImage">
                        <div style="text-align: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 5px;">🖼️</div>
                            <div>Imagem do evento</div>
                        </div>
                    </div>
                    <div class="preview-content">
                        <div class="preview-event-title" id="previewTitle">Nome do evento</div>
                        <div class="preview-description" id="previewDescription">Descrição do evento aparecerá aqui...</div>
                        <div class="preview-details">
                            <div class="preview-detail">
                                <div class="detail-icon"></div>
                                <span id="previewDate">Data não definida</span>
                            </div>
                            <div class="preview-detail">
                                <div class="detail-icon"></div>
                                <span id="previewLocation">Local não definido</span>
                            </div>
                            <div class="preview-detail">
                                <div class="detail-icon"></div>
                                <span id="previewCategory">Categoria não definida</span>
                            </div>
                            <div class="preview-detail">
                                <div class="detail-icon"></div>
                                <span id="previewType">Presencial</span>
                            </div>
                        </div>
                         
                    </div>
                </div>
            </div>
        </div>
    </div>
        </main>
    </div>
    
     <!-- Modal para Criar Ingresso Pago -->
    <div class="modal-overlay" id="paidTicketModal">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Criar tipo de ingresso pago</div>
                <button class="modal-close" onClick="closeModal('paidTicketModal')">&times;</button>
            </div>
            
            <div class="info-banner">
                Ao absorver a taxa de serviço, ela será incluída no preço final de venda e não será mostrada ao comprador
            </div>

            <div class="form-grid">
                <div class="form-group">
                    <label>Título do tipo de ingresso <span class="required">*</span></label>
                    <input type="text" id="paidTicketTitle" placeholder="Tipo VIP, Meia-Entrada, Premium, etc." maxlength="45">
                    <small style="color: #8B95A7;">45 caracteres restantes</small>
                </div>
                <div class="form-group">
                    <label>Quantidade <span class="required">*</span></label>
                    <input type="number" id="paidTicketQuantity" placeholder="Ex. 100" min="1">
                </div>
            </div>

            <div class="form-grid">
                <div class="form-group">
                    <label>Valor do comprador <span class="required">*</span></label>
                    <input type="text" id="paidTicketPrice" placeholder="R$ 0,00" maxlength="15">
                </div>
                <div class="form-group">
                    <label>Valor a receber</label>
                    <input type="text" id="paidTicketReceive" placeholder="R$ 0,00" readonly>
                </div>
            </div>

            <hr class="section-divider">

            <div class="ticket-type-section">
                <h4 style="color: #00C2FF; margin-bottom: 15px;">Período das vendas deste tipo de ingresso:</h4>

                <div class="form-grid" id="paidDateFields">
                    <div class="form-group">
                        <label>Data de Início das Vendas <span class="required">*</span></label>
                        <input type="datetime-local" id="paidSaleStart">
                        <small style="color: #8B95A7;">Horário de Brasília</small>
                    </div>
                    <div class="form-group">
                        <label>Data de Término das Vendas <span class="required">*</span></label>
                        <input type="datetime-local" id="paidSaleEnd">
                        <small style="color: #8B95A7;">Horário de Brasília</small>
                    </div>
                </div>
            </div>

            <hr class="section-divider">

            <h4 style="color: #00C2FF; margin-bottom: 15px;">Quantidade permitida por compra:</h4>

            <div class="form-grid">
                <div class="form-group">
                    <label>Mínima</label>
                    <input type="number" id="paidMinQuantity" value="1" min="1">
                </div>
                <div class="form-group">
                    <label>Máxima</label>
                    <input type="number" id="paidMaxQuantity" value="5" min="1">
                </div>
            </div>

            <div class="form-group full-width">
                <label>Descrição do Tipo de Ingresso (opcional):</label>
                <textarea id="paidTicketDescription" rows="3" placeholder="Informações adicionais ao nome do tipo de ingresso. Ex.: Esse tipo de ingresso dá direito a um copo" maxlength="100"></textarea>
                <small style="color: #8B95A7;">100 caracteres restantes</small>
            </div>

            <div class="modal-actions">
                <button class="btn btn-secondary" onClick="closeModal('paidTicketModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="createPaidTicket()">Criar Tipo de Ingresso</button>
            </div>
        </div>
    </div>

    <!-- Modal para Criar Ingresso Gratuito -->
    <div class="modal-overlay" id="freeTicketModal">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Criar tipo de ingresso gratuito</div>
                <button class="modal-close" onClick="closeModal('freeTicketModal')">&times;</button>
            </div>

            <div class="form-grid">
                <div class="form-group">
                    <label>Título do tipo de ingresso <span class="required">*</span></label>
                    <input type="text" id="freeTicketTitle" placeholder="Tipo Estudante, Cortesia, Acesso Livre, etc." maxlength="45">
                    <small style="color: #8B95A7;">45 caracteres restantes</small>
                </div>
                <div class="form-group">
                    <label>Quantidade <span class="required">*</span></label>
                    <input type="number" id="freeTicketQuantity" placeholder="Ex. 100" min="1">
                </div>
            </div>

            <div class="form-group">
                <label>Valor do comprador</label>
                <input type="text" value="Grátis" readonly style="background: rgba(139, 149, 167, 0.1);">
            </div>

            <hr class="section-divider">

            <div class="ticket-type-section">
                <h4 style="color: #00C2FF; margin-bottom: 15px;">Período das vendas deste tipo de ingresso:</h4>

                <div class="form-grid" id="freeDateFields">
                    <div class="form-group">
                        <label>Data de Início das Vendas <span class="required">*</span></label>
                        <input type="datetime-local" id="freeSaleStart">
                        <small style="color: #8B95A7;">Horário de Brasília</small>
                    </div>
                    <div class="form-group">
                        <label>Data de Término das Vendas <span class="required">*</span></label>
                        <input type="datetime-local" id="freeSaleEnd">
                        <small style="color: #8B95A7;">Horário de Brasília</small>
                    </div>
                </div>
            </div>

            <hr class="section-divider">
            
            <h4 style="color: #00C2FF; margin-bottom: 15px;">Quantidade permitida por compra:</h4>

            <div class="form-grid">
                <div class="form-group">
                    <label>Mínima</label>
                    <input type="number" id="freeMinQuantity" value="1" min="1">
                </div>
                <div class="form-group">
                    <label>Máxima</label>
                    <input type="number" id="freeMaxQuantity" value="5" min="1">
                </div>
            </div>

            <div class="form-group full-width">
                <label>Descrição do Tipo de Ingresso (opcional):</label>
                <textarea id="freeTicketDescription" rows="3" placeholder="Informações adicionais ao nome do tipo de ingresso. Ex.: Esse tipo de ingresso dá direito a um copo" maxlength="100"></textarea>
                <small style="color: #8B95A7;">100 caracteres restantes</small>
            </div>

            <div class="modal-actions">
                <button class="btn btn-secondary" onClick="closeModal('freeTicketModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="createFreeTicket()">Criar Tipo de Ingresso</button>
            </div>
        </div>
    </div>

    <!-- Modal para Criar Ingresso Códigos -->
    <div class="modal-overlay" id="codeTicketModal">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Criar tipo de ingresso por códigos</div>
                <button class="modal-close" onClick="closeModal('codeTicketModal')">&times;</button>
            </div>

            <div class="info-banner">
                Os códigos serão gerados automaticamente e poderão ser compartilhados individualmente com os participantes
            </div>

            <div class="form-grid">
                <div class="form-group">
                    <label>Título do tipo de ingresso <span class="required">*</span></label>
                    <input type="text" id="codeTicketTitle" placeholder="Convite VIP, Acesso Restrito, etc." maxlength="45">
                    <small style="color: #8B95A7;">45 caracteres restantes</small>
                </div>
                <div class="form-group">
                    <label>Quantidade de códigos <span class="required">*</span></label>
                    <input type="number" id="codeTicketQuantity" placeholder="Ex. 50" min="1" max="1000">
                    <small style="color: #8B95A7;">Máximo 1000 códigos</small>
                </div>
            </div>

            <div class="form-group">
                <label>Valor do ingresso</label>
                <input type="text" value="Acesso via código" readonly style="background: rgba(139, 149, 167, 0.1);">
            </div>

            <hr class="section-divider">

            <div class="ticket-type-section">
                <h4 style="color: #00C2FF; margin-bottom: 15px;">Período de validade dos códigos:</h4>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label>Data de Início <span class="required">*</span></label>
                        <input type="datetime-local" id="codeSaleStart">
                        <small style="color: #8B95A7;">Horário de Brasília</small>
                    </div>
                    <div class="form-group">
                        <label>Data de Término <span class="required">*</span></label>
                        <input type="datetime-local" id="codeSaleEnd">
                        <small style="color: #8B95A7;">Horário de Brasília</small>
                    </div>
                </div>
            </div>

            <hr class="section-divider">

            <div class="form-group full-width">
                <label>Descrição do Tipo de Ingresso (opcional):</label>
                <textarea id="codeTicketDescription" rows="3" placeholder="Informações sobre este tipo de acesso especial..." maxlength="100"></textarea>
                <small style="color: #8B95A7;">100 caracteres restantes</small>
            </div>

            <div class="modal-actions">
                <button class="btn btn-secondary" onClick="closeModal('codeTicketModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="createCodeTicket()">Gerar Códigos</button>
            </div>
        </div>
    </div>

    <!-- Modal para Criar Combo de Tipos de Ingresso -->
    <div class="modal-overlay" id="comboTicketModal">
        <div class="modal" style="max-width: 800px;">
            <div class="modal-header">
                <div class="modal-title">Criar combo de tipos de ingresso</div>
                <button class="modal-close" onClick="closeModal('comboTicketModal')">&times;</button>
            </div>

            <div class="info-banner">
                Um combo agrupa múltiplos tipos de ingresso em um único produto. O comprador paga pelo combo e recebe vouchers individuais de cada tipo incluído.
            </div>

            <div class="form-grid">
                <div class="form-group">
                    <label>Título do combo <span class="required">*</span></label>
                    <input type="text" id="comboTicketTitle" placeholder="Combo Família, Pacote Premium, etc." maxlength="45">
                    <small style="color: #8B95A7;">45 caracteres restantes</small>
                </div>
                <div class="form-group">
                    <label>Quantidade de combos <span class="required">*</span></label>
                    <input type="number" id="comboTicketQuantity" placeholder="Ex. 50" min="1">
                    <small style="color: #8B95A7;">Quantos combos estarão disponíveis</small>
                </div>
            </div>

            <hr class="section-divider">

            <h4 style="color: #00C2FF; margin-bottom: 15px;">Tipos de ingresso incluídos no combo:</h4>
            
            <div id="comboItemsList" class="combo-items-list">
                <div class="combo-empty-state">
                    <div style="font-size: 2rem; margin-bottom: 10px;">📦</div>
                    <div style="color: #8B95A7;">Adicione tipos de ingresso ao combo</div>
                    <div style="color: #8B95A7; font-size: 0.85rem;">Selecione os tipos já criados e defina quantidades</div>
                </div>
            </div>

            <div class="combo-add-section">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Selecionar tipo de ingresso</label>
                        <select id="comboTicketTypeSelect">
                            <option value="">Escolha um tipo de ingresso</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Quantidade</label>
                        <input type="number" id="comboItemQuantity" placeholder="Ex. 2" min="1" max="10">
                    </div>
                </div>
                <button class="btn btn-outline" type="button" onclick="addItemToCombo()">➕ Adicionar ao combo</button>
            </div>

            <hr class="section-divider">

            <div class="combo-pricing-section">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Preço do combo <span class="required">*</span></label>
                        <input type="text" id="comboTicketPrice" placeholder="R$ 0,00" maxlength="15">
                        <small style="color: #8B95A7;">Preço total que o comprador pagará</small>
                    </div>
                    <div class="form-group">
                        <label>Valor a receber</label>
                        <input type="text" id="comboTicketReceive" placeholder="R$ 0,00" readonly>
                        <small style="color: #8B95A7;">Valor líquido após taxas</small>
                    </div>
                </div>
            </div>

            <hr class="section-divider">

            <div class="form-grid">
                <div class="form-group">
                    <label>Data de Início das Vendas <span class="required">*</span></label>
                    <input type="datetime-local" id="comboSaleStart">
                    <small style="color: #8B95A7;">Horário de Brasília</small>
                </div>
                <div class="form-group">
                    <label>Data de Término das Vendas <span class="required">*</span></label>
                    <input type="datetime-local" id="comboSaleEnd">
                    <small style="color: #8B95A7;">Horário de Brasília</small>
                </div>
            </div>

            <div class="form-group full-width">
                <label>Descrição do Combo (opcional):</label>
                <textarea id="comboTicketDescription" rows="3" placeholder="Descreva os benefícios e conteúdo do combo..." maxlength="200"></textarea>
                <small style="color: #8B95A7;">200 caracteres restantes</small>
            </div>

            <div class="modal-actions">
                <button class="btn btn-secondary" onClick="closeModal('comboTicketModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="createComboTicket()">Criar Combo</button>
            </div>
        </div>
    </div>

    <!-- Modal para Listar Códigos -->
    <div class="modal-overlay" id="codesListModal">
        <div class="modal" style="max-width: 900px;">
            <div class="modal-header">
                <div class="modal-title">Gerenciar Códigos - <span id="codesModalTitle">Nome do Ingresso</span></div>
                <button class="modal-close" onClick="closeModal('codesListModal')">&times;</button>
            </div>

            <div class="codes-actions">
                <button class="btn btn-outline btn-small" onClick="exportCodes()">📋 Exportar todos</button>
                <button class="btn btn-outline btn-small" onClick="copyAllCodes()">📄 Copiar todos</button>
                <button class="btn btn-secondary btn-small" onClick="regenerateUsedCodes()">🔄 Regenerar usados</button>
            </div>

            <input type="text" class="search-codes" id="searchCodes" placeholder="Buscar por código, email ou status..." onKeyUp="filterCodes()">

            <div style="max-height: 400px; overflow-y: auto;">
                <table class="codes-table" id="codesTable">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Encaminhado para</th>
                            <th>Utilizado</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="codesTableBody">
                        <!-- Códigos serão inseridos aqui via JavaScript -->
                    </tbody>
                </table>
            </div>

            <div class="modal-actions">
                <button class="btn btn-secondary" onClick="closeModal('codesListModal')">Fechar</button>
            </div>
        </div>
    </div>

    <script>
        // Toggle mobile menu
        function toggleMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('mobileOverlay');
            const menuToggle = document.querySelector('.menu-toggle');
            
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            menuToggle.classList.toggle('active');
        }

        // Close mobile menu
        function closeMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('mobileOverlay');
            const menuToggle = document.querySelector('.menu-toggle');
            
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            menuToggle.classList.remove('active');
        }

        // Toggle user dropdown
        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('active');
        }

        // Close dropdown and mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const userMenu = document.querySelector('.user-menu');
            const dropdown = document.getElementById('userDropdown');
            const sidebar = document.querySelector('.sidebar');
            const menuToggle = document.querySelector('.menu-toggle');
            
            // Close user dropdown
            if (!userMenu.contains(event.target)) {
                dropdown.classList.remove('active');
            }
            
            // Close mobile menu if clicking outside sidebar and menu toggle
            if (window.innerWidth <= 768 && 
                !sidebar.contains(event.target) && 
                !menuToggle.contains(event.target)) {
                closeMobileMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });

        // Set active menu item
        function setActiveMenu(element, section) {
            // Remove active class from all menu items
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked item
            element.classList.add('active');
            
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
            
            // Update content area (placeholder for now)
            updateContentArea(section);
        }

       
        // Settings function
        function openSettings() {
            document.getElementById('userDropdown').classList.remove('active');
            alert('Abrindo configurações...');
        }

        // Logout function
        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                window.location = 'logout.php';
                // Aqui você adicionaria a lógica real de logout
            }
        }

        // Mouse interaction with particles
        document.addEventListener('mousemove', function(e) {
            const particles = document.querySelectorAll('.particle');
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            particles.forEach((particle, index) => {
                const speed = (index + 1) * 0.5;
                const x = mouseX * speed;
                const y = mouseY * speed;
                
                particle.style.transform = `translate(${x}px, ${y}px)`;
            });
        });

        // Add smooth interactions
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.boxShadow = '0 4px 20px rgba(0, 194, 255, 0.2)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.boxShadow = 'none';
            });
        });
    </script>
    
    <!-- ==================== MODAIS DE EDIÇÃO ==================== -->
    <!-- Modal para Editar Ingresso Pago -->
    <div class="modal-overlay" id="editPaidTicketModal">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Editar ingresso pago</div>
                <button class="modal-close" onClick="closeModal('editPaidTicketModal')">&times;</button>
            </div>
            
            <div class="info-banner">
                Ao absorver a taxa de serviço, ela será incluída no preço final de venda e não será mostrada ao comprador
            </div>

            <input type="hidden" id="editTicketId">

            <div class="form-grid">
                <div class="form-group">
                    <label>Título do ingresso <span class="required">*</span></label>
                    <input type="text" id="editPaidTicketTitle" placeholder="Ingresso único, Meia-Entrada, VIP, etc." maxlength="45">
                    <small style="color: #8B95A7;">45 caracteres restantes</small>
                </div>
                <div class="form-group">
                    <label>Quantidade <span class="required">*</span></label>
                    <input type="number" id="editPaidTicketQuantity" placeholder="Ex. 100" min="1">
                </div>
            </div>

            <div class="form-grid">
                <div class="form-group">
                    <label>Valor do comprador <span class="required">*</span></label>
                    <input type="text" id="editPaidTicketPrice" placeholder="R$ 0,00" maxlength="15">
                </div>
                <div class="form-group">
                    <label>Valor a receber</label>
                    <input type="text" id="editPaidTicketReceive" placeholder="R$ 0,00" readonly>
                </div>
            </div>

            <hr class="section-divider">

            <div class="ticket-type-section">
                <h4 style="color: #00C2FF; margin-bottom: 15px;">Período das vendas deste ingresso:</h4>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Data de Início das Vendas <span class="required">*</span></label>
                        <input type="datetime-local" id="editPaidSaleStart">
                        <small style="color: #8B95A7;">Horário de Brasília</small>
                    </div>
                    <div class="form-group">
                        <label>Data de Fim das Vendas <span class="required">*</span></label>
                        <input type="datetime-local" id="editPaidSaleEnd">
                        <small style="color: #8B95A7;">Horário de Brasília</small>
                    </div>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Limite mínimo por compra</label>
                        <input type="number" id="editPaidMinLimit" placeholder="1" min="1">
                    </div>
                    <div class="form-group">
                        <label>Limite máximo por compra</label>
                        <input type="number" id="editPaidMaxLimit" placeholder="5" min="1">
                    </div>
                </div>

                <div class="form-group">
                    <label>Descrição do ingresso</label>
                    <textarea id="editPaidTicketDescription" placeholder="Descrição detalhada do ingresso..." rows="3"></textarea>
                </div>
            </div>

            <div class="modal-actions">
                <button class="btn btn-secondary" onClick="closeModal('editPaidTicketModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="updatePaidTicket()">Salvar alterações</button>
            </div>
        </div>
    </div>

    <!-- Modal para Editar Ingresso Gratuito -->
    <div class="modal-overlay" id="editFreeTicketModal">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Editar ingresso gratuito</div>
                <button class="modal-close" onClick="closeModal('editFreeTicketModal')">&times;</button>
            </div>

            <input type="hidden" id="editFreeTicketId">

            <div class="form-grid">
                <div class="form-group">
                    <label>Título do ingresso <span class="required">*</span></label>
                    <input type="text" id="editFreeTicketTitle" placeholder="Ingresso único, Meia-Entrada, VIP, etc." maxlength="45">
                    <small style="color: #8B95A7;">45 caracteres restantes</small>
                </div>
                <div class="form-group">
                    <label>Quantidade <span class="required">*</span></label>
                    <input type="number" id="editFreeTicketQuantity" placeholder="Ex. 100" min="1">
                </div>
            </div>

            <hr class="section-divider">

            <div class="ticket-type-section">
                <h4 style="color: #00C2FF; margin-bottom: 15px;">Período das vendas deste ingresso:</h4>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Data de Início das Vendas <span class="required">*</span></label>
                        <input type="datetime-local" id="editFreeSaleStart">
                        <small style="color: #8B95A7;">Horário de Brasília</small>
                    </div>
                    <div class="form-group">
                        <label>Data de Fim das Vendas <span class="required">*</span></label>
                        <input type="datetime-local" id="editFreeSaleEnd">
                        <small style="color: #8B95A7;">Horário de Brasília</small>
                    </div>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Limite mínimo por compra</label>
                        <input type="number" id="editFreeMinLimit" placeholder="1" min="1">
                    </div>
                    <div class="form-group">
                        <label>Limite máximo por compra</label>
                        <input type="number" id="editFreeMaxLimit" placeholder="5" min="1">
                    </div>
                </div>

                <div class="form-group">
                    <label>Descrição do ingresso</label>
                    <textarea id="editFreeTicketDescription" placeholder="Descrição detalhada do ingresso..." rows="3"></textarea>
                </div>
            </div>

            <div class="modal-actions">
                <button class="btn btn-secondary" onClick="closeModal('editFreeTicketModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="updateFreeTicket()">Salvar alterações</button>
            </div>
        </div>
    </div>

    <!-- Modal para Editar Combo -->
    <div class="modal-overlay" id="editComboModal">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Editar combo de tipos de ingresso</div>
                <button class="modal-close" onClick="closeModal('editComboModal')">&times;</button>
            </div>

            <input type="hidden" id="editComboId">

            <div class="form-grid">
                <div class="form-group">
                    <label>Título do combo <span class="required">*</span></label>
                    <input type="text" id="editComboTitle" placeholder="Combo VIP, Família, etc." maxlength="45">
                    <small style="color: #8B95A7;">45 caracteres restantes</small>
                </div>
                <div class="form-group">
                    <label>Quantidade <span class="required">*</span></label>
                    <input type="number" id="editComboQuantity" placeholder="Ex. 50" min="1">
                </div>
            </div>

            <div class="form-grid">
                <div class="form-group">
                    <label>Valor do comprador <span class="required">*</span></label>
                    <input type="text" id="editComboPrice" placeholder="R$ 0,00" maxlength="15">
                </div>
                <div class="form-group">
                    <label>Valor a receber</label>
                    <input type="text" id="editComboReceive" placeholder="R$ 0,00" readonly>
                </div>
            </div>

            <hr class="section-divider">

            <div class="ticket-type-section">
                <h4 style="color: #00C2FF; margin-bottom: 15px;">Período das vendas deste combo:</h4>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Data de Início das Vendas <span class="required">*</span></label>
                        <input type="datetime-local" id="editComboSaleStart">
                        <small style="color: #8B95A7;">Horário de Brasília</small>
                    </div>
                    <div class="form-group">
                        <label>Data de Fim das Vendas <span class="required">*</span></label>
                        <input type="datetime-local" id="editComboSaleEnd">
                        <small style="color: #8B95A7;">Horário de Brasília</small>
                    </div>
                </div>

                <div class="form-group">
                    <label>Descrição do combo</label>
                    <textarea id="editComboDescription" placeholder="Descrição detalhada do combo..." rows="3"></textarea>
                </div>
            </div>

            <hr class="section-divider">

            <div class="combo-items-section">
                <h4 style="color: #00C2FF; margin-bottom: 15px;">Tipos de ingresso incluídos:</h4>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Selecionar tipo de ingresso</label>
                        <select id="editComboTicketTypeSelect">
                            <option value="">Escolha um tipo de ingresso</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Quantidade</label>
                        <input type="number" id="editComboItemQuantity" placeholder="1" min="1">
                    </div>
                </div>

                <button class="btn btn-outline" type="button" onClick="addItemToEditCombo()">
                    ➕ Adicionar tipo de ingresso
                </button>

                <div class="combo-items-list" id="editComboItemsList"></div>
            </div>

            <div class="modal-actions">
                <button class="btn btn-secondary" onClick="closeModal('editComboModal')">Cancelar</button>
                <button class="btn btn-primary" onClick="updateComboTicket()">Salvar alterações</button>
            </div>
        </div>
    </div>
    
    <!-- ==================== FIM DOS MODAIS DE EDIÇÃO ==================== -->
    
     <script language='javascript' src="/produtor/js/temporary-tickets.js"></script>
     <script language='javascript' src="/produtor/js/criaevento.js"></script>

     <!-- Script de Teste para Debug do Combo -->
     <script>
         // Teste adicional para debug
         window.addEventListener('load', function() {
             console.log('🧪 Teste de debug carregado');
             
             const comboBtn = document.getElementById('addComboTicket');
             console.log('🔍 Botão encontrado:', comboBtn);
             
             if (typeof openModal === 'function') {
                 console.log('✅ Função openModal existe');
             } else {
                 console.error('❌ Função openModal NÃO existe');
             }
             
             if (typeof populateComboTicketSelect === 'function') {
                 console.log('✅ Função populateComboTicketSelect existe');
             } else {
                 console.error('❌ Função populateComboTicketSelect NÃO existe');
             }
             
             // Teste direto no botão
             if (comboBtn) {
                 comboBtn.addEventListener('click', function() {
                     console.log('🎯 Clique detectado no botão combo!');
                 });
             }
         });
     </script>

        <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDU5-cOqdusZMBI5pqbsLihQVKEI0fEO9o&libraries=places&callback=initMap" async defer></script>
    
    
</body>
</html>