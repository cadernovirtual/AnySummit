<?php
// Backup do modal de combo original
?>
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
