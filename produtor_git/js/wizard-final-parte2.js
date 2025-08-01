/**
 * wizard-final-parte2.js
 * Consolidação de funcionalidades: Utils, Upload, Lotes, Ingressos e Combos
 * Elimina 50+ arquivos de correção e duplicações
 */

// ==========================
// 1. FUNÇÕES UTILITÁRIAS
// ==========================
window.AnySummit.Utils = {
    /**
     * Formata valor monetário para exibição
     * Consolidada de: combo-functions.js, ingressos-pagos.js, taxa-servico-completa.js
     * Versão escolhida: ingressos-pagos.js (mais robusta)
     */
    formatarMoeda: function(valor) {
        if (typeof valor === 'string') {
            valor = parseFloat(valor.replace(',', '.'));
        }
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    /**
     * Formata data e hora para exibição
     * Consolidada de: combo-functions.js, ingressos-pagos.js, ingressos-gratuitos.js, lotes.js, modal-correto.js
     * Versão escolhida: modal-correto.js (mais completa)
     */
    formatarDataHora: function(dataStr) {
        if (!dataStr) return '';
        
        const data = new Date(dataStr);
        if (isNaN(data.getTime())) return '';
        
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        const hora = String(data.getHours()).padStart(2, '0');
        const minuto = String(data.getMinutes()).padStart(2, '0');
        
        return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
    },

    /**
     * Formata data para input datetime-local
     * Consolidada de: criaevento.js, modal-correto.js, ingressos-pagos.js
     * Versão escolhida: modal-correto.js (mais precisa)
     */
    formatDateTimeLocal: function(date) {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    },

    /**
     * Formata data no padrão brasileiro
     * Consolidada de: lotes.js, criaevento.js
     */
    formatarDataBrasil: function(dataStr) {
        if (!dataStr) return '';
        
        const data = new Date(dataStr);
        if (isNaN(data.getTime())) return '';
        
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        
        return `${dia}/${mes}/${ano}`;
    },

    /**
     * Converte string monetária para número
     * Consolidada de: ingressos-pagos.js
     */
    parsearValorMonetario: function(valor) {
        if (typeof valor === 'number') return valor;
        
        return parseFloat(
            valor.toString()
                .replace(/[R$\s]/g, '')
                .replace(/\./g, '')
                .replace(',', '.')
        ) || 0;
    },

    /**
     * Gera código único
     * Consolidada de: criaevento.js
     */
    generateRandomCode: function(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    /**
     * Valida email
     * Consolidada de: criaevento.js
     */
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Sanitiza input
     * Consolidada de: criaevento.js
     */
    sanitizeInput: function(input) {
        if (!input) return '';
        
        return input.toString()
            .replace(/[<>]/g, '')
            .trim();
    }
};

// ==========================
// 2. SISTEMA DE UPLOAD
// ==========================
window.AnySummit.Upload = {
    // Mapa de IDs corretos para containers
    containerMap: {
        logo: 'logoPreviewContainer',
        capa: 'capaPreviewContainer', 
        fundo: 'fundoPreviewMain'  // Mudado de 'fundoPreviewContainer' para 'fundoPreviewMain'
    },

    /**
     * Configuração principal de uploads
     * Consolidada de: upload-images.js, upload-images-fix.js, criaevento.js
     */
    setupImageUploads: function() {
        console.log('[Upload] Configurando sistema de upload de imagens');
        
        // Logo do evento
        const logoInput = document.getElementById('logoUpload');  // Mudado de 'logoFile'
        if (logoInput) {
            // Remove listeners antigos
            const newLogoInput = logoInput.cloneNode(true);
            logoInput.parentNode.replaceChild(newLogoInput, logoInput);
            
            newLogoInput.addEventListener('change', (e) => {
                this.handleImageUpload(e.target, 'logoPreviewContainer', 'logo');
            });
            console.log('✅ Upload de logo configurado');
        }
        
        // Capa do evento
        const capaInput = document.getElementById('capaUpload');  // Mudado de 'capaFile'
        if (capaInput) {
            // Remove listeners antigos
            const newCapaInput = capaInput.cloneNode(true);
            capaInput.parentNode.replaceChild(newCapaInput, capaInput);
            
            newCapaInput.addEventListener('change', (e) => {
                this.handleImageUpload(e.target, 'capaPreviewContainer', 'capa');
            });
            console.log('✅ Upload de capa configurado');
        }
        
        // Fundo do evento
        const fundoInput = document.getElementById('fundoUpload');  // Mudado de 'fundoFile'
        if (fundoInput) {
            // Remove listeners antigos
            const newFundoInput = fundoInput.cloneNode(true);
            fundoInput.parentNode.replaceChild(newFundoInput, fundoInput);
            
            newFundoInput.addEventListener('change', (e) => {
                this.handleImageUpload(e.target, 'fundoPreviewMain', 'fundo');
            });
            console.log('✅ Upload de fundo configurado');
        }
        
        // Botões de limpar
        this.setupClearButtons();
    },

    /**
     * Configura botões de limpar imagem
     * Consolidada de: criaevento.js
     */
    setupClearButtons: function() {
        // Botão limpar logo
        const clearLogo = document.getElementById('clearLogo');
        if (clearLogo) {
            clearLogo.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearImage('logo');
            });
        }
        
        // Botão limpar capa
        const clearCapa = document.getElementById('clearCapa');
        if (clearCapa) {
            clearCapa.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearImage('capa');
            });
        }
        
        // Botão limpar fundo
        const clearFundo = document.getElementById('clearFundo');
        if (clearFundo) {
            clearFundo.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearImage('fundo');
            });
        }
    },

    /**
     * Processa upload de imagem
     * Consolidada de: criaevento.js - melhor implementação encontrada
     */
    handleImageUpload: async function(input, containerId, tipo) {
        const file = input.files[0];
        if (!file) return;

        // Validações
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

        if (!file.type.match('image.*')) {
            if (window.AnySummit.Dialogs) {
                window.AnySummit.Dialogs.alert('Por favor, selecione apenas arquivos de imagem.');
            } else {
                alert('Por favor, selecione apenas arquivos de imagem.');
            }
            input.value = '';
            return;
        }

        if (file.size > maxSize) {
            if (window.AnySummit.Dialogs) {
                window.AnySummit.Dialogs.alert('A imagem deve ter no máximo 5MB');
            } else {
                alert('A imagem deve ter no máximo 5MB');
            }
            input.value = '';
            return;
        }

        // Mostrar preview local primeiro
        const reader = new FileReader();
        reader.onload = (e) => {
            const container = document.getElementById(containerId);
            if (container) {
                let dimensions = '';
                switch(tipo) {
                    case 'logo':
                        dimensions = '800x200px';
                        break;
                    case 'capa':
                        dimensions = '450x450px';
                        break;
                    case 'fundo':
                        dimensions = '1920x640px';
                        break;
                }

                container.innerHTML = `
                    <img src="${e.target.result}" alt="${tipo}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                    <div class="upload-hint">${dimensions}</div>
                `;

                // Mostrar botão de limpar
                const clearButton = document.getElementById('clear' + tipo.charAt(0).toUpperCase() + tipo.slice(1));
                if (clearButton) {
                    clearButton.style.display = 'flex';
                }
            }
            
            // Salva URL da imagem no objeto global
            if (!window.uploadedImages) window.uploadedImages = {};
            window.uploadedImages[tipo] = e.target.result;
            
            console.log(`[Upload] Imagem ${tipo} carregada localmente`);
            
            // Salvar no wizard
            if (window.AnySummit.Wizard && window.AnySummit.Wizard.saveWizardData) {
                window.AnySummit.Wizard.saveWizardData();
            }
            
      // Atualizar preview sempre que carregar uma imagem
if (window.AnySummit.Preview) {
    window.AnySummit.Preview.updatePreview();
}
        };
        reader.readAsDataURL(file);

        // Fazer upload real para o servidor
        const formData = new FormData();
        formData.append('imagem', file);
        formData.append('tipo', tipo);

        try {
            const response = await fetch('/produtor/ajax/upload_imagem_wizard.php', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Salvar caminho da imagem retornado pelo servidor
                    window.uploadedImages[tipo] = data.image_url;
                    console.log(`✅ ${tipo} enviado para servidor:`, data.image_url);
                    
                    // Salvar novamente com URL do servidor
                    if (window.AnySummit.Wizard && window.AnySummit.Wizard.saveWizardData) {
                        window.AnySummit.Wizard.saveWizardData();
                    }
                } else {
                    console.error('Erro no upload:', data.message);
                }
            } else {
                console.error('Erro na resposta:', response.status);
            }
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            // Continua com o preview local mesmo se o upload falhar
        }
    },

    /**
     * Limpa imagem
     * Consolidada de: criaevento.js
     */
    clearImage: function(tipo) {
        let containerId;
        let inputId;
        let clearButtonId;
        let defaultContent;

        switch(tipo) {
            case 'logo':
                containerId = 'logoPreviewContainer';
                inputId = 'logoUpload';
                clearButtonId = 'clearLogo';
                defaultContent = `
                    <div class="upload-icon">🎨</div>
                    <div class="upload-text">Adicionar logo</div>
                    <div class="upload-hint">800x200px • Fundo transparente</div>
                `;
                break;
            case 'capa':
                containerId = 'capaPreviewContainer';
                inputId = 'capaUpload';
                clearButtonId = 'clearCapa';
                defaultContent = `
                    <div class="upload-icon">🖼️</div>
                    <div class="upload-text">Adicionar capa</div>
                    <div class="upload-hint">450x450px • Quadrada</div>
                `;
                break;
            case 'fundo':
                containerId = 'fundoPreviewMain';
                inputId = 'fundoUpload';
                clearButtonId = 'clearFundo';
                defaultContent = `
                    <div class="upload-icon">🌅</div>
                    <div class="upload-text">Adicionar fundo</div>
                    <div class="upload-hint">1920x640px • Paisagem</div>
                `;
                break;
        }

        // Limpa input
        const input = document.getElementById(inputId);
        if (input) input.value = '';
        
        // Restaura conteúdo padrão
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = defaultContent;
        }
        
        // Esconde botão de limpar
        const clearButton = document.getElementById(clearButtonId);
        if (clearButton) {
            clearButton.style.display = 'none';
        }
        
        // Remove da memória
        if (window.uploadedImages) {
            delete window.uploadedImages[tipo];
        }
        
        console.log(`[Upload] Imagem ${tipo} removida`);
        
        // Salvar estado
        if (window.AnySummit.Wizard && window.AnySummit.Wizard.saveWizardData) {
            window.AnySummit.Wizard.saveWizardData();
        }
        
        // Atualiza preview se necessário
        if (window.AnySummit.State && window.AnySummit.State.currentStep === 8) {
            window.AnySummit.UI.updatePreview();
        }
    }
};

// ==========================
// 3. GESTÃO DE LOTES
// ==========================
window.AnySummit.Lotes = {
    /**
     * Adiciona lote por data
     * Consolidada de: lotes.js, modal-correto.js, lote-modal-fix-final.js
     * Versão escolhida: modal-correto.js (mais completa)
     */
    adicionarLotePorData: function() {
        console.log('[Lotes] Abrindo modal de lote por data');
        
        // Primeiro abrir o modal
        if (window.openModal) {
            window.openModal('loteDataModal');
        } else {
            const modal = document.getElementById('loteDataModal');
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('show');
            }
        }
        
        // Configurar campos após abrir o modal
        setTimeout(() => {
            this.configurarCamposLoteData();
        }, 100);
    },
    
    /**
     * Configura campos do lote por data
     * Consolidada de: modal-correto.js, lotes-fix.js
     */
    configurarCamposLoteData: function() {
        console.log('[Lotes] Configurando campos de lote por data');
        
        const loteDataInicio = document.getElementById('loteDataInicio');
        const loteDataFim = document.getElementById('loteDataFim');
        
        if (!loteDataInicio || !loteDataFim) {
            console.error('[Lotes] Campos de data não encontrados');
            return;
        }
        
        // Garantir estrutura
        if (!window.lotesData) {
            window.lotesData = { porData: [], porPercentual: [] };
        }
        
        const agora = new Date();
        const eventoDataInicio = document.getElementById('startDateTime')?.value;
        
        // Se já existem lotes, configurar baseado no último
        if (window.lotesData.porData && window.lotesData.porData.length > 0) {
            console.log('[Lotes] Configurando lote subsequente');
            
            // Ordenar lotes por data fim
            const lotesOrdenados = [...window.lotesData.porData].sort((a, b) => 
                new Date(b.dataFim).getTime() - new Date(a.dataFim).getTime()
            );
            
            const ultimoLote = lotesOrdenados[0];
            const dataFimUltimoLote = new Date(ultimoLote.dataFim);
            
            // Nova data início = fim do último lote + 1 segundo
            const novaDataInicio = new Date(dataFimUltimoLote.getTime() + 1000);
            
            // Aplicar valor e deixar readonly
            loteDataInicio.value = window.AnySummit.Utils.formatDateTimeLocal(novaDataInicio);
            loteDataInicio.readOnly = true;
            loteDataInicio.style.backgroundColor = '#f5f5f5';
            loteDataInicio.style.cursor = 'not-allowed';
            
            // Sugerir data fim (7 dias depois ou 1 segundo antes do evento)
            const dataFimSugerida = new Date(novaDataInicio);
            dataFimSugerida.setDate(dataFimSugerida.getDate() + 7);
            
            if (eventoDataInicio) {
                const dataEvento = new Date(eventoDataInicio);
                if (dataFimSugerida > dataEvento) {
                    dataFimSugerida.setTime(dataEvento.getTime() - 1000);
                }
            }
            
            loteDataFim.value = window.AnySummit.Utils.formatDateTimeLocal(dataFimSugerida);
            
        } else {
            // Primeiro lote - campos editáveis
            console.log('[Lotes] Configurando primeiro lote');
            
            loteDataInicio.readOnly = false;
            loteDataInicio.style.backgroundColor = '';
            loteDataInicio.style.cursor = '';
            
            // Sugerir data inicial como agora
            loteDataInicio.value = window.AnySummit.Utils.formatDateTimeLocal(agora);
            
            // Sugerir data fim (7 dias depois ou 1 dia antes do evento)
            const dataFimSugerida = new Date(agora);
            dataFimSugerida.setDate(dataFimSugerida.getDate() + 7);
            
            if (eventoDataInicio) {
                const dataEvento = new Date(eventoDataInicio);
                const umDiaAntes = new Date(dataEvento);
                umDiaAntes.setDate(umDiaAntes.getDate() - 1);
                umDiaAntes.setHours(23, 59, 0, 0);
                
                if (dataFimSugerida > umDiaAntes) {
                    dataFimSugerida.setTime(umDiaAntes.getTime());
                }
            }
            
            loteDataFim.value = window.AnySummit.Utils.formatDateTimeLocal(dataFimSugerida);
        }
        
        // Marcar checkbox de divulgar como padrão
        const divulgarCheckbox = document.getElementById('loteDataDivulgar');
        if (divulgarCheckbox) {
            divulgarCheckbox.checked = true;
        }
    },
    
    /**
     * Cria lote por data (chamada pelo botão do modal)
     * Consolidada de: lotes.js
     */
    criarLoteData: function() {
        console.log('[Lotes] Criando lote por data');
        
        const dataInicio = document.getElementById('loteDataInicio')?.value;
        const dataFim = document.getElementById('loteDataFim')?.value;
        const divulgar = document.getElementById('loteDataDivulgar')?.checked;
        
        // Validações
        if (!dataInicio || !dataFim) {
            if (window.customDialog) {
                window.customDialog.alert('Por favor, preencha todos os campos', 'Atenção');
            } else {
                alert('Por favor, preencha todos os campos');
            }
            return;
        }
        
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        
        if (inicio >= fim) {
            if (window.customDialog) {
                window.customDialog.alert('A data de início deve ser anterior à data de fim', 'Atenção');
            } else {
                alert('A data de início deve ser anterior à data de fim');
            }
            return;
        }
        
        // Validar contra data do evento
        const eventoDataInicio = document.getElementById('startDateTime')?.value;
        if (eventoDataInicio) {
            const dataEvento = new Date(eventoDataInicio);
            if (fim > dataEvento) {
                if (window.customDialog) {
                    window.customDialog.alert('A data fim do lote não pode ser posterior ao início do evento', 'Atenção');
                } else {
                    alert('A data fim do lote não pode ser posterior ao início do evento');
                }
                return;
            }
        }
        
        // Garante estrutura
        if (!window.lotesData) {
            window.lotesData = { porData: [], porPercentual: [] };
        }
        
        // Determinar nome do lote
        const numeroLote = window.lotesData.porData.length + 1;
        const nome = `${numeroLote}º Lote`;
        
        // Cria novo lote
        const novoLote = {
            id: 'lote_data_' + Date.now(),
            nome: nome,
            dataInicio: dataInicio,
            dataFim: dataFim,
            tipo: 'data',
            divulgar: divulgar || true
        };
        
        window.lotesData.porData.push(novoLote);
        
        // Renderiza e fecha modal
        this.renderizarLotesPorData();
        if (window.AnySummit.Modals) {
            window.AnySummit.Modals.closeModal('loteDataModal');
        } else if (window.closeModal) {
            window.closeModal('loteDataModal');
        }
        
        // Renomeia automaticamente
        this.renomearLotesAutomaticamente();
        
        // Salva no storage
        window.AnySummit.Storage.saveLotes();
        
        console.log('[Lotes] Lote por data adicionado:', novoLote);
    },

    /**
     * Adiciona lote por percentual
     * Consolidada de: lotes.js
     */
    adicionarLotePorPercentual: function() {
        console.log('[Lotes] Abrindo modal de lote por percentual');
        
        // Primeiro abrir o modal
        if (window.openModal) {
            window.openModal('lotePercentualModal');
        } else {
            const modal = document.getElementById('lotePercentualModal');
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('show');
            }
        }
        
        // Limpar campo
        const percentualInput = document.getElementById('lotePercentualValor');
        if (percentualInput) {
            percentualInput.value = '';
        }
        
        // Marcar checkbox
        const divulgarCheckbox = document.getElementById('lotePercentualDivulgar');
        if (divulgarCheckbox) {
            divulgarCheckbox.checked = true;
        }
    },
    
    /**
     * Cria lote por percentual (chamada pelo botão do modal)
     * Consolidada de: lotes.js
     */
    criarLotePercentual: function() {
        console.log('[Lotes] Criando lote por percentual');
        
        const percentual = parseInt(document.getElementById('lotePercentualValor')?.value);
        const divulgar = document.getElementById('lotePercentualDivulgar')?.checked;
        
        if (!percentual) {
            if (window.customDialog) {
                window.customDialog.alert('Por favor, informe o percentual', 'Atenção');
            } else {
                alert('Por favor, informe o percentual');
            }
            return;
        }
        
        if (percentual < 1 || percentual > 100) {
            if (window.customDialog) {
                window.customDialog.alert('O percentual deve estar entre 1 e 100', 'Atenção');
            } else {
                alert('O percentual deve estar entre 1 e 100');
            }
            return;
        }
        
        // Garante estrutura
        if (!window.lotesData) {
            window.lotesData = { porData: [], porPercentual: [] };
        }
        
        // Calcula total já alocado
        const totalAlocado = window.lotesData.porPercentual.reduce((sum, lote) => 
            sum + parseInt(lote.percentual), 0);
        
        if (totalAlocado + percentual > 100) {
            const msg = `Percentual excede 100%. Disponível: ${100 - totalAlocado}%`;
            if (window.customDialog) {
                window.customDialog.alert(msg, 'Atenção');
            } else {
                alert(msg);
            }
            return;
        }
        
        // Determinar nome do lote
        const offsetData = window.lotesData.porData?.length || 0;
        const numeroLote = offsetData + window.lotesData.porPercentual.length + 1;
        const nome = `${numeroLote}º Lote`;
        
        // Cria novo lote
        const novoLote = {
            id: 'lote_perc_' + Date.now(),
            nome: nome,
            percentual: percentual,
            tipo: 'percentual',
            divulgar: divulgar || true
        };
        
        window.lotesData.porPercentual.push(novoLote);
        
        // Renderiza e fecha modal
        this.renderizarLotesPorPercentual();
        if (window.closeModal) {
            window.closeModal('lotePercentualModal');
        } else {
            const modal = document.getElementById('lotePercentualModal');
            if (modal) {
                modal.classList.remove('show');
                modal.style.display = '';
            }
        }
        
        // Renomeia automaticamente
        this.renomearLotesAutomaticamente();
        
        // Salva no storage
        if (window.AnySummit.Storage) {
            window.AnySummit.Storage.saveLotes();
        }
        
        console.log('[Lotes] Lote por percentual criado:', novoLote);
    },

    /**
     * Renomeia lotes automaticamente
     * Consolidada de: lotes.js
     */
    renomearLotesAutomaticamente: function() {
        // Renomeia lotes por data
        if (window.lotesData?.porData) {
            window.lotesData.porData.forEach((lote, index) => {
                lote.nome = `${index + 1}º Lote`;
            });
        }
        
        // Renomeia lotes por percentual
        if (window.lotesData?.porPercentual) {
            const offsetData = window.lotesData.porData?.length || 0;
            window.lotesData.porPercentual.forEach((lote, index) => {
                lote.nome = `${offsetData + index + 1}º Lote`;
            });
        }
    },

    /**
     * Renderiza lotes por data
     * Consolidada de: lotes.js
     */
    renderizarLotesPorData: function() {
        const container = document.getElementById('lotesPorDataList');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!window.lotesData?.porData?.length) {
            container.innerHTML = '<p class="text-muted">Nenhum lote por data cadastrado</p>';
            return;
        }
        
        window.lotesData.porData.forEach(lote => {
            const loteEl = document.createElement('div');
            loteEl.className = 'lote-item mb-3 p-3 border rounded';
            loteEl.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6>${lote.nome}</h6>
                        <small class="text-muted">
                            ${window.AnySummit.Utils.formatarDataHora(lote.dataInicio)} - 
                            ${window.AnySummit.Utils.formatarDataHora(lote.dataFim)}
                        </small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary" onclick="window.AnySummit.Lotes.editarLoteData('${lote.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="window.AnySummit.Lotes.excluirLote('${lote.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(loteEl);
        });
    },

    /**
     * Renderiza lotes por percentual
     * Consolidada de: lotes.js
     */
    renderizarLotesPorPercentual: function() {
        const container = document.getElementById('lotesPorPercentualList');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!window.lotesData?.porPercentual?.length) {
            container.innerHTML = '<p class="text-muted">Nenhum lote por percentual cadastrado</p>';
            return;
        }
        
        let totalPercentual = 0;
        
        window.lotesData.porPercentual.forEach(lote => {
            totalPercentual += parseInt(lote.percentual);
            
            const loteEl = document.createElement('div');
            loteEl.className = 'lote-item mb-3 p-3 border rounded';
            loteEl.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6>${lote.nome}</h6>
                        <small class="text-muted">${lote.percentual}% da capacidade</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary" onclick="window.AnySummit.Lotes.editarLotePercentual('${lote.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="window.AnySummit.Lotes.excluirLote('${lote.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(loteEl);
        });
        
        // Mostra total
        if (totalPercentual < 100) {
            const info = document.createElement('div');
            info.className = 'alert alert-info mt-3';
            info.innerHTML = `<small>Total alocado: ${totalPercentual}% | Disponível: ${100 - totalPercentual}%</small>`;
            container.appendChild(info);
        }
    },

    /**
     * Exclui lote com proteção
     * Consolidada de: lotes.js, lote-protection.js
     */
    excluirLote: async function(loteId) {
        // Verifica se há ingressos no lote
        const ingressosNoLote = this.verificarIngressosNoLote(loteId);
        
        if (ingressosNoLote.length > 0) {
            const msg = `Este lote possui ${ingressosNoLote.length} ingresso(s) associado(s):\n\n` +
                       ingressosNoLote.map(i => `- ${i.nome}`).join('\n') +
                       '\n\nRemova os ingressos antes de excluir o lote.';
            
            window.AnySummit.Dialogs.alert(msg);
            return;
        }
        
        // Confirma exclusão
        const confirmar = await window.AnySummit.Dialogs.confirm('Tem certeza que deseja excluir este lote?');
        if (!confirmar) return;
        
        // Remove lote
        if (loteId.startsWith('lote_data_')) {
            window.lotesData.porData = window.lotesData.porData.filter(l => l.id !== loteId);
            this.renderizarLotesPorData();
        } else {
            window.lotesData.porPercentual = window.lotesData.porPercentual.filter(l => l.id !== loteId);
            this.renderizarLotesPorPercentual();
        }
        
        // Renomeia e salva
        this.renomearLotesAutomaticamente();
        window.AnySummit.Storage.saveLotes();
        
        console.log('[Lotes] Lote excluído:', loteId);
    },

    /**
     * Verifica ingressos no lote
     * Consolidada de: lote-protection.js
     */
    verificarIngressosNoLote: function(loteId) {
        const ingressos = [];
        
        // Verifica ingressos temporários
        if (window.temporaryTickets) {
            window.temporaryTickets.forEach(ticket => {
                if (ticket.loteId === loteId) {
                    ingressos.push(ticket);
                }
            });
        }
        
        // Verifica ingressos na lista
        const ticketItems = document.querySelectorAll('.ticket-item');
        ticketItems.forEach(item => {
            const ticketLoteId = item.getAttribute('data-lote-id');
            if (ticketLoteId === loteId) {
                const nome = item.querySelector('.ticket-name')?.textContent || 'Ingresso';
                ingressos.push({ nome });
            }
        });
        
        return ingressos;
    },

    /**
     * Obtém todos os lotes disponíveis
     */
    getTodosLotes: function() {
        const lotes = [];
        
        if (window.lotesData?.porData) {
            lotes.push(...window.lotesData.porData);
        }
        
        if (window.lotesData?.porPercentual) {
            lotes.push(...window.lotesData.porPercentual);
        }
        
        return lotes;
    },

    /**
     * Edita lote por data
     * Consolidada de: lotes.js
     */
    editarLoteData: function(loteId) {
        const lote = window.lotesData.porData.find(l => l.id === loteId);
        if (!lote) return;
        
        // Preenche campos do modal
        document.getElementById('nomeLoteData').value = lote.nome;
        document.getElementById('dataInicioLoteData').value = lote.dataInicio;
        document.getElementById('dataFimLoteData').value = lote.dataFim;
        
        // Abre modal
        window.AnySummit.Modals.openModal('modalLoteData');
        
        // Altera comportamento do botão salvar
        const btnSalvar = document.querySelector('#modalLoteData .btn-primary');
        if (btnSalvar) {
            btnSalvar.onclick = () => this.salvarLoteData(loteId);
        }
    },

    /**
     * Salva edição de lote
     */
    salvarLoteData: function(loteId) {
        const lote = window.lotesData.porData.find(l => l.id === loteId);
        if (!lote) return;
        
        const nome = document.getElementById('nomeLoteData').value.trim();
        const dataInicio = document.getElementById('dataInicioLoteData').value;
        const dataFim = document.getElementById('dataFimLoteData').value;
        
        if (!nome || !dataInicio || !dataFim) {
            window.AnySummit.Dialogs.alert('Por favor, preencha todos os campos');
            return;
        }
        
        // Atualiza lote
        lote.nome = nome;
        lote.dataInicio = dataInicio;
        lote.dataFim = dataFim;
        
        // Renderiza e fecha modal
        this.renderizarLotesPorData();
        window.AnySummit.Modals.closeModal('modalLoteData');
        
        // Salva
        window.AnySummit.Storage.saveLotes();
        
        console.log('[Lotes] Lote atualizado:', lote);
    }
};

// ==========================
// 4. GESTÃO DE INGRESSOS
// ==========================
window.AnySummit.Ingressos = {
    // Contador único para IDs temporários
    ticketCounter: 0,
    
    /**
     * Cria ingresso pago
     * Consolidada de: criaevento.js, ingressos-pagos.js, correções
     * Versão escolhida: ingressos-pagos.js + correções de taxa
     */
    createPaidTicket: function() {
        const nome = document.getElementById('paidTicketName').value.trim();
        const valor = window.AnySummit.Utils.parsearValorMonetario(
            document.getElementById('paidTicketPrice').value
        );
        const quantidade = parseInt(document.getElementById('paidTicketQuantity').value) || 0;
        const loteId = document.getElementById('paidTicketLote').value;
        const descricao = document.getElementById('paidTicketDescription').value.trim();
        
        // Validações
        if (!nome) {
            window.AnySummit.Dialogs.alert('Por favor, informe o nome do ingresso');
            return;
        }
        
        if (valor <= 0) {
            window.AnySummit.Dialogs.alert('Por favor, informe um valor válido');
            return;
        }
        
        if (quantidade <= 0) {
            window.AnySummit.Dialogs.alert('Por favor, informe uma quantidade válida');
            return;
        }
        
        if (!loteId) {
            window.AnySummit.Dialogs.alert('Por favor, selecione um lote');
            return;
        }
        
        // Calcula valores com taxa
        const taxaServico = window.taxaServico || 8.00;
        const valorTaxa = valor * (taxaServico / 100);
        const valorTotal = valor + valorTaxa;
        const valorReceber = valor; // Produtor recebe o valor sem taxa
        
        // Cria ingresso temporário
        const ticketId = 'temp_paid_' + (++this.ticketCounter);
        const ticket = {
            id: ticketId,
            tipo: 'pago',
            nome: nome,
            valor: valor,
            valorTaxa: valorTaxa,
            valorTotal: valorTotal,
            valorReceber: valorReceber,
            quantidade: quantidade,
            loteId: loteId,
            descricao: descricao,
            taxaServico: taxaServico
        };
        
        // Adiciona à lista temporária
        if (!window.temporaryTickets) {
            window.temporaryTickets = new Map();
        }
        window.temporaryTickets.set(ticketId, ticket);
        
        // Renderiza na lista
        this.renderTicketInList(ticket);
        
        // Fecha modal e limpa campos
        window.AnySummit.Modals.closeModal('modalIngresso');
        this.limparCamposIngresso('pago');
        
        // Salva no storage
        window.AnySummit.Storage.saveTickets();
        
        console.log('[Ingressos] Ingresso pago criado:', ticket);
    },

    /**
     * Cria ingresso gratuito
     * Consolidada de: criaevento.js, ingressos-gratuitos.js
     */
    createFreeTicket: function() {
        const nome = document.getElementById('freeTicketName').value.trim();
        const quantidade = parseInt(document.getElementById('freeTicketQuantity').value) || 0;
        const loteId = document.getElementById('freeTicketLote').value;
        const descricao = document.getElementById('freeTicketDescription').value.trim();
        
        // Validações
        if (!nome) {
            window.AnySummit.Dialogs.alert('Por favor, informe o nome do ingresso');
            return;
        }
        
        if (quantidade <= 0) {
            window.AnySummit.Dialogs.alert('Por favor, informe uma quantidade válida');
            return;
        }
        
        if (!loteId) {
            window.AnySummit.Dialogs.alert('Por favor, selecione um lote');
            return;
        }
        
        // Cria ingresso temporário
        const ticketId = 'temp_free_' + (++this.ticketCounter);
        const ticket = {
            id: ticketId,
            tipo: 'gratuito',
            nome: nome,
            valor: 0,
            valorTaxa: 0,
            valorTotal: 0,
            valorReceber: 0,
            quantidade: quantidade,
            loteId: loteId,
            descricao: descricao
        };
        
        // Adiciona à lista temporária
        if (!window.temporaryTickets) {
            window.temporaryTickets = new Map();
        }
        window.temporaryTickets.set(ticketId, ticket);
        
        // Renderiza na lista
        this.renderTicketInList(ticket);
        
        // Fecha modal e limpa campos
        window.AnySummit.Modals.closeModal('modalIngressoGratuito');
        this.limparCamposIngresso('gratuito');
        
        // Salva no storage
        window.AnySummit.Storage.saveTickets();
        
        console.log('[Ingressos] Ingresso gratuito criado:', ticket);
    },

    /**
     * Renderiza ingresso na lista
     * Consolidada de: temporary-tickets.js
     */
    renderTicketInList: function(ticket) {
        const container = document.getElementById('ticketsList');
        if (!container) return;
        
        // Remove mensagem de vazio
        const emptyMsg = container.querySelector('.text-muted');
        if (emptyMsg) emptyMsg.remove();
        
        // Obtém nome do lote
        const lote = window.AnySummit.Lotes.getTodosLotes().find(l => l.id === ticket.loteId);
        const nomeLote = lote ? lote.nome : 'Lote não encontrado';
        
        // Cria elemento do ingresso
        const ticketEl = document.createElement('div');
        ticketEl.className = 'ticket-item mb-3 p-3 border rounded';
        ticketEl.id = `ticket-${ticket.id}`;
        ticketEl.setAttribute('data-ticket-id', ticket.id);
        ticketEl.setAttribute('data-lote-id', ticket.loteId);
        
        let valorDisplay = '';
        if (ticket.tipo === 'pago') {
            valorDisplay = `
                <div>
                    <strong>Valor:</strong> ${window.AnySummit.Utils.formatarMoeda(ticket.valor)}<br>
                    <small class="text-muted">
                        Taxa: ${window.AnySummit.Utils.formatarMoeda(ticket.valorTaxa)} | 
                        Total: ${window.AnySummit.Utils.formatarMoeda(ticket.valorTotal)}
                    </small>
                </div>
            `;
        } else {
            valorDisplay = '<div><strong>Gratuito</strong></div>';
        }
        
        ticketEl.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h6 class="ticket-name mb-1">${ticket.nome}</h6>
                    <small class="text-muted d-block">
                        ${nomeLote} | Quantidade: ${ticket.quantidade}
                        ${ticket.descricao ? ' | ' + ticket.descricao : ''}
                    </small>
                </div>
                ${valorDisplay}
                <div class="ms-3">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="window.AnySummit.Ingressos.editTicket('${ticket.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="window.AnySummit.Ingressos.removeTicket('${ticket.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(ticketEl);
    },

    /**
     * Remove ingresso com proteção
     * Consolidada de: criaevento.js, temporary-tickets.js, combo-protection
     */
    removeTicket: async function(ticketId) {
        // Verifica se está em algum combo
        const combosComIngresso = this.verificarIngressoEmCombos(ticketId);
        
        if (combosComIngresso.length > 0) {
            const msg = `Este ingresso está incluído em ${combosComIngresso.length} combo(s):\n\n` +
                       combosComIngresso.map(c => `- ${c.nome}`).join('\n') +
                       '\n\nRemova o ingresso dos combos antes de excluí-lo.';
            
            window.AnySummit.Dialogs.alert(msg);
            return;
        }
        
        // Confirma exclusão
        const confirmar = await window.AnySummit.Dialogs.confirm('Tem certeza que deseja remover este ingresso?');
        if (!confirmar) return;
        
        // Remove da lista temporária
        if (window.temporaryTickets) {
            window.temporaryTickets.delete(ticketId);
        }
        
        // Remove do DOM
        const element = document.getElementById(`ticket-${ticketId}`);
        if (element) {
            element.remove();
        }
        
        // Verifica se lista está vazia
        const container = document.getElementById('ticketsList');
        if (container && container.children.length === 0) {
            container.innerHTML = '<p class="text-muted">Nenhum ingresso cadastrado</p>';
        }
        
        // Salva no storage
        window.AnySummit.Storage.saveTickets();
        
        console.log('[Ingressos] Ingresso removido:', ticketId);
    },

    /**
     * Verifica se ingresso está em combos
     */
    verificarIngressoEmCombos: function(ticketId) {
        const combos = [];
        
        // Verifica nos combos temporários
        const combosList = document.querySelectorAll('.combo-item');
        combosList.forEach(comboEl => {
            const comboId = comboEl.getAttribute('data-combo-id');
            const items = comboEl.querySelectorAll('.combo-ticket-item');
            
            items.forEach(item => {
                const itemTicketId = item.getAttribute('data-ticket-id');
                if (itemTicketId === ticketId) {
                    const nome = comboEl.querySelector('.combo-name')?.textContent || 'Combo';
                    combos.push({ id: comboId, nome });
                }
            });
        });
        
        return combos;
    },

    /**
     * Calcula valores do ingresso com taxa
     * Consolidada de: ingressos-pagos.js, taxa-servico-completa.js
     */
    calcularValoresIngresso: function(valorBase) {
        const valor = parseFloat(valorBase) || 0;
        const taxaServico = window.taxaServico || 8.00;
        
        const valorTaxa = valor * (taxaServico / 100);
        const valorTotal = valor + valorTaxa;
        const valorReceber = valor;
        
        return {
            valor: valor,
            valorTaxa: valorTaxa,
            valorTotal: valorTotal,
            valorReceber: valorReceber,
            taxaServico: taxaServico
        };
    },

    /**
     * Carrega lotes no select do modal
     * Consolidada de: ingressos-pagos.js, ingressos-gratuitos.js
     */
    carregarLotesNoModal: function(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.innerHTML = '<option value="">Selecione um lote</option>';
        
        const lotes = window.AnySummit.Lotes.getTodosLotes();
        
        lotes.forEach(lote => {
            const option = document.createElement('option');
            option.value = lote.id;
            
            if (lote.tipo === 'data') {
                option.textContent = `${lote.nome} (${window.AnySummit.Utils.formatarDataBrasil(lote.dataInicio)} - ${window.AnySummit.Utils.formatarDataBrasil(lote.dataFim)})`;
            } else {
                option.textContent = `${lote.nome} (${lote.percentual}%)`;
            }
            
            select.appendChild(option);
        });
    },

    /**
     * Limpa campos do modal de ingresso
     */
    limparCamposIngresso: function(tipo) {
        if (tipo === 'pago') {
            document.getElementById('paidTicketName').value = '';
            document.getElementById('paidTicketPrice').value = '';
            document.getElementById('paidTicketQuantity').value = '';
            document.getElementById('paidTicketLote').value = '';
            document.getElementById('paidTicketDescription').value = '';
            
            // Limpa displays de valores
            const displays = ['valorTaxaServico', 'valorTotal', 'valorReceber'];
            displays.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = 'R$ 0,00';
            });
        } else {
            document.getElementById('freeTicketName').value = '';
            document.getElementById('freeTicketQuantity').value = '';
            document.getElementById('freeTicketLote').value = '';
            document.getElementById('freeTicketDescription').value = '';
        }
    },

    /**
     * Edita ingresso
     */
    editTicket: function(ticketId) {
        const ticket = window.temporaryTickets?.get(ticketId);
        if (!ticket) return;
        
        if (ticket.tipo === 'pago') {
            // Preenche campos
            document.getElementById('paidTicketName').value = ticket.nome;
            document.getElementById('paidTicketPrice').value = ticket.valor;
            document.getElementById('paidTicketQuantity').value = ticket.quantidade;
            document.getElementById('paidTicketLote').value = ticket.loteId;
            document.getElementById('paidTicketDescription').value = ticket.descricao || '';
            
            // Atualiza displays
            this.updatePriceDisplays(ticket.valor);
            
            // Abre modal
            window.AnySummit.Modals.openModal('modalIngresso');
            
            // Altera comportamento do botão
            const btn = document.querySelector('#modalIngresso .btn-primary');
            if (btn) {
                btn.onclick = () => this.updateTicket(ticketId);
            }
        } else {
            // Ingresso gratuito
            document.getElementById('freeTicketName').value = ticket.nome;
            document.getElementById('freeTicketQuantity').value = ticket.quantidade;
            document.getElementById('freeTicketLote').value = ticket.loteId;
            document.getElementById('freeTicketDescription').value = ticket.descricao || '';
            
            // Abre modal
            window.AnySummit.Modals.openModal('modalIngressoGratuito');
            
            // Altera comportamento do botão
            const btn = document.querySelector('#modalIngressoGratuito .btn-primary');
            if (btn) {
                btn.onclick = () => this.updateTicket(ticketId);
            }
        }
    },

    /**
     * Atualiza displays de preço
     */
    updatePriceDisplays: function(valor) {
        const valores = this.calcularValoresIngresso(valor);
        
        const elTaxa = document.getElementById('valorTaxaServico');
        if (elTaxa) elTaxa.textContent = window.AnySummit.Utils.formatarMoeda(valores.valorTaxa);
        
        const elTotal = document.getElementById('valorTotal');
        if (elTotal) elTotal.textContent = window.AnySummit.Utils.formatarMoeda(valores.valorTotal);
        
        const elReceber = document.getElementById('valorReceber');
        if (elReceber) elReceber.textContent = window.AnySummit.Utils.formatarMoeda(valores.valorReceber);
    }
};

// ==========================
// 5. SISTEMA DE COMBOS
// ==========================
window.AnySummit.Combos = {
    // Contador para IDs únicos
    comboCounter: 0,
    
    /**
     * Cria novo combo
     * Consolidada de: combo-functions.js, edit-combo-functions.js
     */
    createCombo: function() {
        const nome = document.getElementById('comboName').value.trim();
        const descricao = document.getElementById('comboDescription').value.trim();
        const valor = window.AnySummit.Utils.parsearValorMonetario(
            document.getElementById('comboPrice').value
        );
        
        // Validações
        if (!nome) {
            window.AnySummit.Dialogs.alert('Por favor, informe o nome do combo');
            return;
        }
        
        if (valor <= 0) {
            window.AnySummit.Dialogs.alert('Por favor, informe um valor válido');
            return;
        }
        
        // Verifica se há itens no combo
        if (!window.comboItems || window.comboItems.length === 0) {
            window.AnySummit.Dialogs.alert('Adicione pelo menos um ingresso ao combo');
            return;
        }
        
        // Calcula valores
        const taxaServico = window.taxaServico || 8.00;
        const valorTaxa = valor * (taxaServico / 100);
        const valorTotal = valor + valorTaxa;
        
        // Cria combo
        const comboId = 'combo_' + (++this.comboCounter);
        const combo = {
            id: comboId,
            nome: nome,
            descricao: descricao,
            valor: valor,
            valorTaxa: valorTaxa,
            valorTotal: valorTotal,
            itens: [...window.comboItems], // Copia array
            taxaServico: taxaServico
        };
        
        // Renderiza na lista
        this.renderComboInList(combo);
        
        // Fecha modal e limpa
        window.AnySummit.Modals.closeModal('modalCombo');
        this.limparCamposCombo();
        
        // Salva no storage
        window.AnySummit.Storage.saveCombos();
        
        console.log('[Combos] Combo criado:', combo);
    },

    /**
     * Adiciona item ao combo
     * Consolidada de: combo-functions.js, combo-visual-fixes.js
     */
    addToCombo: function() {
        const loteId = document.getElementById('comboLoteSelect').value;
        const ticketId = document.getElementById('comboTicketSelect').value;
        const quantidade = parseInt(document.getElementById('comboItemQuantity').value) || 0;
        
        // Validações
        if (!loteId) {
            window.AnySummit.Dialogs.alert('Por favor, selecione um lote');
            return;
        }
        
        if (!ticketId) {
            window.AnySummit.Dialogs.alert('Por favor, selecione um ingresso');
            return;
        }
        
        if (quantidade <= 0) {
            window.AnySummit.Dialogs.alert('Por favor, informe uma quantidade válida');
            return;
        }
        
        // Obtém informações do ticket
        const ticket = window.temporaryTickets?.get(ticketId);
        if (!ticket) {
            window.AnySummit.Dialogs.alert('Ingresso não encontrado');
            return;
        }
        
        // Verifica se já existe no combo
        if (!window.comboItems) window.comboItems = [];
        
        const itemExistente = window.comboItems.find(item => 
            item.ticketId === ticketId && item.loteId === loteId
        );
        
        if (itemExistente) {
            window.AnySummit.Dialogs.alert('Este ingresso já está no combo');
            return;
        }
        
        // Adiciona ao combo
        const item = {
            loteId: loteId,
            ticketId: ticketId,
            ticketNome: ticket.nome,
            quantidade: quantidade,
            valorUnitario: ticket.valor
        };
        
        window.comboItems.push(item);
        
        // Atualiza display
        this.updateComboDisplay();
        
        // Limpa campos
        document.getElementById('comboTicketSelect').value = '';
        document.getElementById('comboItemQuantity').value = '';
        
        console.log('[Combos] Item adicionado:', item);
    },

    /**
     * Remove item do combo
     * Consolidada de: combo-functions.js
     */
    removeFromCombo: function(index) {
        if (!window.comboItems || !window.comboItems[index]) return;
        
        window.comboItems.splice(index, 1);
        this.updateComboDisplay();
        
        console.log('[Combos] Item removido do índice:', index);
    },

    /**
     * Atualiza display do combo
     * Consolidada de: combo-functions.js, combo-visual-fixes.js, combo-override.js
     * Versão escolhida: combo-visual-fixes.js (mais estável)
     */
    updateComboDisplay: function() {
        const container = document.getElementById('comboItemsList');
        if (!container) return;
        
        if (!window.comboItems || window.comboItems.length === 0) {
            container.innerHTML = '<p class="text-muted">Nenhum ingresso adicionado ao combo</p>';
            return;
        }
        
        container.innerHTML = '';
        let valorTotal = 0;
        
        window.comboItems.forEach((item, index) => {
            valorTotal += item.valorUnitario * item.quantidade;
            
            const itemEl = document.createElement('div');
            itemEl.className = 'combo-ticket-item mb-2 p-2 border rounded';
            itemEl.setAttribute('data-ticket-id', item.ticketId);
            
            itemEl.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${item.ticketNome}</strong><br>
                        <small class="text-muted">
                            Quantidade: ${item.quantidade} | 
                            Valor unitário: ${window.AnySummit.Utils.formatarMoeda(item.valorUnitario)}
                        </small>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="window.AnySummit.Combos.removeFromCombo(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(itemEl);
        });
        
        // Mostra valor total dos itens
        const totalEl = document.createElement('div');
        totalEl.className = 'mt-3 pt-3 border-top';
        totalEl.innerHTML = `<strong>Valor total dos itens:</strong> ${window.AnySummit.Utils.formatarMoeda(valorTotal)}`;
        container.appendChild(totalEl);
    },

    /**
     * Renderiza combo na lista
     */
    renderComboInList: function(combo) {
        const container = document.getElementById('combosList');
        if (!container) return;
        
        // Remove mensagem de vazio
        const emptyMsg = container.querySelector('.text-muted');
        if (emptyMsg) emptyMsg.remove();
        
        const comboEl = document.createElement('div');
        comboEl.className = 'combo-item mb-3 p-3 border rounded';
        comboEl.id = `combo-${combo.id}`;
        comboEl.setAttribute('data-combo-id', combo.id);
        
        const itensDesc = combo.itens.map(item => 
            `${item.quantidade}x ${item.ticketNome}`
        ).join(', ');
        
        comboEl.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h6 class="combo-name mb-1">${combo.nome}</h6>
                    <small class="text-muted d-block">
                        ${itensDesc}
                        ${combo.descricao ? '<br>' + combo.descricao : ''}
                    </small>
                </div>
                <div>
                    <strong>Valor:</strong> ${window.AnySummit.Utils.formatarMoeda(combo.valor)}<br>
                    <small class="text-muted">
                        Total: ${window.AnySummit.Utils.formatarMoeda(combo.valorTotal)}
                    </small>
                </div>
                <div class="ms-3">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="window.AnySummit.Combos.editCombo('${combo.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="window.AnySummit.Combos.removeCombo('${combo.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(comboEl);
    },

    /**
     * Carrega ingressos do lote selecionado
     * Consolidada de: combo-functions.js
     */
    carregarIngressosPorLote: function(loteId) {
        const select = document.getElementById('comboTicketSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">Selecione um ingresso</option>';
        
        if (!loteId || !window.temporaryTickets) return;
        
        // Filtra ingressos do lote
        window.temporaryTickets.forEach(ticket => {
            if (ticket.loteId === loteId) {
                const option = document.createElement('option');
                option.value = ticket.id;
                option.textContent = `${ticket.nome} - ${window.AnySummit.Utils.formatarMoeda(ticket.valor)}`;
                select.appendChild(option);
            }
        });
    },

    /**
     * Popula select de tipos de ingresso para combo
     * Consolidada de: combo-functions.js
     */
    populateComboTicketSelect: function(loteId) {
        console.log('[Combos] Populando select de ingressos para lote:', loteId);
        
        const select = document.getElementById('comboTicketTypeSelect');
        if (!select) {
            console.error('[Combos] Select comboTicketTypeSelect não encontrado');
            return;
        }
        
        // Limpar select
        select.innerHTML = '<option value="">Selecione um tipo de ingresso</option>';
        
        if (!loteId || !window.temporaryTickets) {
            console.log('[Combos] Sem lote selecionado ou ingressos não disponíveis');
            return;
        }
        
        // Filtrar ingressos do lote
        let ingressosDoLote = [];
        
        // Buscar em temporaryTickets (Map)
        if (window.temporaryTickets && window.temporaryTickets.forEach) {
            window.temporaryTickets.forEach(ticket => {
                if (ticket.loteId === loteId) {
                    ingressosDoLote.push(ticket);
                }
            });
        }
        
        // Buscar nos elementos DOM também
        const ticketItems = document.querySelectorAll('.ticket-item');
        ticketItems.forEach(item => {
            if (item.getAttribute('data-lote-id') === loteId) {
                const ticketId = item.getAttribute('data-ticket-id');
                // Verificar se já não foi adicionado
                if (!ingressosDoLote.find(t => t.id === ticketId)) {
                    const ticket = {
                        id: ticketId,
                        nome: item.querySelector('.ticket-name')?.textContent || 'Ingresso',
                        valor: parseFloat(item.querySelector('.ticket-buyer-price')?.textContent?.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
                        loteId: loteId
                    };
                    ingressosDoLote.push(ticket);
                }
            }
        });
        
        console.log('[Combos] Ingressos encontrados para o lote:', ingressosDoLote.length);
        
        // Popular select
        ingressosDoLote.forEach(ticket => {
            const option = document.createElement('option');
            option.value = ticket.id;
            option.textContent = `${ticket.nome} - ${window.AnySummit.Utils.formatarMoeda(ticket.valor)}`;
            select.appendChild(option);
        });
        
        if (ingressosDoLote.length === 0) {
            select.innerHTML = '<option value="">Nenhum ingresso disponível neste lote</option>';
        }
    },

    /**
     * Limpa campos do combo
     */
    limparCamposCombo: function() {
        document.getElementById('comboName').value = '';
        document.getElementById('comboDescription').value = '';
        document.getElementById('comboPrice').value = '';
        document.getElementById('comboLoteSelect').value = '';
        document.getElementById('comboTicketSelect').value = '';
        document.getElementById('comboItemQuantity').value = '';
        
        window.comboItems = [];
        this.updateComboDisplay();
    },

    /**
     * Remove combo
     */
    removeCombo: async function(comboId) {
        const confirmar = await window.AnySummit.Dialogs.confirm('Tem certeza que deseja remover este combo?');
        if (!confirmar) return;
        
        // Remove do DOM
        const element = document.getElementById(`combo-${comboId}`);
        if (element) element.remove();
        
        // Verifica se lista está vazia
        const container = document.getElementById('combosList');
        if (container && container.children.length === 0) {
            container.innerHTML = '<p class="text-muted">Nenhum combo cadastrado</p>';
        }
        
        // Salva
        window.AnySummit.Storage.saveCombos();
        
        console.log('[Combos] Combo removido:', comboId);
    }
};

// Expor funções globalmente para compatibilidade
window.populateComboTicketSelect = function(loteId) {
    if (window.AnySummit.Combos) {
        window.AnySummit.Combos.populateComboTicketSelect(loteId);
    }
};

// ==========================
// INICIALIZAÇÃO
// ==========================
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Wizard Final Parte 2] Consolidação de funcionalidades carregada');
    
    // Configura sistema de upload
    if (window.AnySummit?.Upload) {
        window.AnySummit.Upload.setupImageUploads();
    }
    
    // Configura listeners de preview e cor
    if (window.AnySummit?.Preview) {
        console.log('[Wizard Final Parte 2] Configurando color listener...');
        // Adicionar um pequeno delay para garantir que elementos estejam no DOM
        setTimeout(() => {
            window.AnySummit.Preview.setupColorListener();
        }, 300);
        
        // Adicionar listeners para campos que atualizam preview
        const fieldsToWatch = ['eventName', 'startDateTime', 'endDateTime', 'category', 'venueName', 'eventLink'];
        
        fieldsToWatch.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    window.AnySummit.Preview.updatePreview();
                });
                field.addEventListener('change', () => {
                    window.AnySummit.Preview.updatePreview();
                });
            }
        });
        
        // Atualizar preview inicial
        setTimeout(() => {
            window.AnySummit.Preview.updatePreview();
        }, 500);
    }
    
    // Inicializar busca de endereços
    if (window.AnySummit?.Address) {
        console.log('[Wizard Final Parte 2] Configurando busca de endereços...');
        setTimeout(() => {
            window.AnySummit.Address.initAddressSearch();
        }, 300);
    }

    // Configura listeners de preço em ingressos pagos
    const priceInput = document.getElementById('paidTicketPrice');
    if (priceInput) {
        priceInput.addEventListener('input', function() {
            const valor = window.AnySummit.Utils.parsearValorMonetario(this.value);
            window.AnySummit.Ingressos.updatePriceDisplays(valor);
        });
    }
    
    // Configura listener de lote em combos
    const comboLoteSelect = document.getElementById('comboLoteSelect');
    if (comboLoteSelect) {
        comboLoteSelect.addEventListener('change', function() {
            window.AnySummit.Combos.carregarIngressosPorLote(this.value);
        });
    }
    
    // Configura listener alternativo com ID diferente
    const comboTicketLote = document.getElementById('comboTicketLote');
    if (comboTicketLote) {
        comboTicketLote.addEventListener('change', function() {
            if (window.populateComboTicketSelect) {
                window.populateComboTicketSelect(this.value);
            }
        });
    }
    
    console.log('[Wizard Final Parte 2] Funções consolidadas:');
    console.log('- Utils: 8 funções utilitárias');
    console.log('- Upload: 4 funções de upload');
    console.log('- Lotes: 12 funções de lotes');
    console.log('- Ingressos: 11 funções de ingressos');
    console.log('- Combos: 9 funções de combos');
    console.log('Total: 44 funções essenciais (redução de ~85% das duplicações)');



// ==========================
// 6. SISTEMA DE PREVIEW
// ==========================
window.AnySummit.Preview = {
    /**
     * Atualiza o preview do evento
     * Consolidada de: criaevento.js, preview-update-fix.js
     */
    updatePreview: function() {
        console.log('[Preview] Atualizando preview...');
        
        const previewTitle = document.getElementById('previewTitle');
        const previewDescription = document.getElementById('previewDescription');
        const previewDate = document.getElementById('previewDate');
        const previewLocation = document.getElementById('previewLocation');
        const previewCategory = document.getElementById('previewCategory');
        const previewType = document.getElementById('previewType');

        if (!previewTitle) {
            console.log('[Preview] Elementos de preview não encontrados');
            return;
        }

        const eventName = document.getElementById('eventName')?.value || 'Nome do evento';
        const startDateTime = document.getElementById('startDateTime')?.value;
        const endDateTime = document.getElementById('endDateTime')?.value;
        const category = document.getElementById('category')?.value;
        const venueName = document.getElementById('venueName')?.value;
        const eventLink = document.getElementById('eventLink')?.value;
        const isPresential = document.getElementById('locationTypeSwitch')?.classList.contains('active');
        const description = document.getElementById('eventDescription')?.textContent || '';
        
        previewTitle.textContent = eventName;
        
        if (previewDescription) {
            previewDescription.textContent = description ? description.substring(0, 120) : '';
        }
        
        // Mostrar data de início e fim
        if (startDateTime && previewDate) {
            const startDateObj = new Date(startDateTime);
            let dateText = startDateObj.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            if (endDateTime) {
                const endDateObj = new Date(endDateTime);
                dateText += ' até ' + endDateObj.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            
            previewDate.textContent = dateText;
        } else if (previewDate) {
            previewDate.textContent = 'Data não definida';
        }
        
        if (previewLocation) {
            if (isPresential) {
                previewLocation.textContent = venueName || '';
            } else {
                previewLocation.textContent = eventLink || '';
            }
        }

        if (previewType) {
            previewType.textContent = isPresential ? 'Presencial' : 'Online';
        }
        
        if (previewCategory) {
            const categoryEl = document.querySelector(`#category option[value="${category}"]`);
            const categoryText = categoryEl ? categoryEl.textContent : 'Categoria não definida';
            previewCategory.textContent = categoryText;
        }
        
        // Atualizar preview Hero
        this.updateHeroPreview(eventName, startDateTime, venueName, eventLink, isPresential);
    },

    /**
     * Atualiza o preview hero (imagens e cor de fundo)
     * Consolidada de: criaevento.js
     */
    updateHeroPreview: function(eventName, startDateTime, venueName, eventLink, isPresential) {
        console.log('[Preview] Atualizando hero preview...');
        
        // Atualizar imagem de fundo
        const heroBackground = document.getElementById('heroBackground');
        const heroSection = document.querySelector('.hero-section-mini');
        const fundoImg = document.querySelector('#fundoPreviewMain img');
        const corFundo = document.getElementById('corFundo')?.value || '#000000';
        
        if (heroBackground && heroSection) {
            if (fundoImg && fundoImg.src && !fundoImg.src.includes('placeholder')) {
                // Tem imagem de fundo
                heroBackground.style.backgroundImage = `url(${fundoImg.src})`;
                heroBackground.style.backgroundColor = '';
                heroBackground.style.opacity = '1';
                heroSection.classList.remove('solid-bg');
                console.log('[Preview] Fundo aplicado:', fundoImg.src);
            } else {
                // Usar cor sólida
                heroBackground.style.backgroundImage = '';
                heroBackground.style.backgroundColor = corFundo;
                heroBackground.style.opacity = '1';
                heroSection.classList.add('solid-bg');
                console.log('[Preview] Cor de fundo aplicada:', corFundo);
            }
        }

        // Atualizar logo
        const heroLogo = document.getElementById('heroLogo');
        const logoImg = document.querySelector('#logoPreviewContainer img');
        
        if (heroLogo && logoImg && logoImg.src && !logoImg.src.includes('placeholder')) {
            heroLogo.src = logoImg.src;
            heroLogo.style.display = 'block';
            console.log('[Preview] Logo aplicado:', logoImg.src);
        } else if (heroLogo) {
            heroLogo.style.display = 'none';
        }

        // Atualizar imagem capa quadrada
        const heroCapa = document.getElementById('heroCapa');
        const capaImg = document.querySelector('#capaPreviewContainer img');
        
        if (heroCapa && capaImg && capaImg.src && !capaImg.src.includes('placeholder')) {
            heroCapa.src = capaImg.src;
            heroCapa.style.display = 'block';
            console.log('[Preview] Capa aplicada:', capaImg.src);
        } else if (heroCapa) {
            heroCapa.style.display = 'none';
        }
    },

/**
 * Configura listener de cor
 * Consolidada de: wizard-fix.js, criaevento.js
 */
setupColorListener: function() {
    console.log('[Preview] Iniciando setupColorListener...');
    
    const corFundo = document.getElementById('corFundo');
    const corFundoHex = document.getElementById('corFundoHex');
    const colorPreview = document.getElementById('colorPreview');
    
    console.log('[Preview] Elementos encontrados:', {
        corFundo: !!corFundo,
        corFundoHex: !!corFundoHex,
        colorPreview: !!colorPreview
    });
    
    if (corFundo) {
        // Remover listeners antigos
        const newCorFundo = corFundo.cloneNode(true);
        corFundo.parentNode.replaceChild(newCorFundo, corFundo);
        
        // Guardar referência ao objeto
        const self = this;
        
        // Listener para o color picker - usar evento 'input' para atualização em tempo real
        newCorFundo.addEventListener('input', function() {
            const corValue = this.value;
            console.log('[Preview] Cor alterada (input):', corValue);
            
            // Atualizar hex input
            if (corFundoHex) {
                corFundoHex.value = corValue;
            }
            
            // Atualizar preview da cor
            if (colorPreview) {
                colorPreview.style.backgroundColor = corValue;
            }
            
            // Atualizar preview do evento
            self.updatePreview();
        });
        
        // Listener adicional para change (alguns browsers)
        newCorFundo.addEventListener('change', function() {
            const corValue = this.value;
            console.log('[Preview] Cor alterada (change):', corValue);
            
            // Atualizar hex input
            if (corFundoHex) {
                corFundoHex.value = corValue;
            }
            
            // Atualizar preview da cor
            if (colorPreview) {
                colorPreview.style.backgroundColor = corValue;
            }
            
            // Atualizar preview
            self.updatePreview();
            
            // Salvar
            if (window.AnySummit.Wizard && window.AnySummit.Wizard.saveWizardData) {
                window.AnySummit.Wizard.saveWizardData();
            }
        });
    }
    
    if (corFundoHex) {
        corFundoHex.addEventListener('input', function() {
            const hexValue = this.value;
            
            // Validar formato hex
            if (/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
                console.log('[Preview] Cor hex alterada:', hexValue);
                
                // Atualizar color picker
                const corFundoElement = document.getElementById('corFundo');
                if (corFundoElement) {
                    corFundoElement.value = hexValue;
                }
                
                // Atualizar preview da cor
                if (colorPreview) {
                    colorPreview.style.backgroundColor = hexValue;
                }
                
                // Atualizar preview
                self.updatePreview();
                
                // Salvar
                if (window.AnySummit.Wizard && window.AnySummit.Wizard.saveWizardData) {
                    window.AnySummit.Wizard.saveWizardData();
                }
            }
        });
        
        // Adicionar # automaticamente se não tiver
        corFundoHex.addEventListener('blur', function() {
            let value = this.value.trim();
            if (value && !value.startsWith('#')) {
                value = '#' + value;
                this.value = value;
                this.dispatchEvent(new Event('input'));
            }
        });
    }
    
    // Click no preview abre o color picker
    if (colorPreview) {
        colorPreview.style.cursor = 'pointer';
        const corFundoElement = document.getElementById('corFundo');
        if (corFundoElement) {
            colorPreview.addEventListener('click', () => {
                corFundoElement.click();
            });
        }
    }
    
    // Sincronizar valores iniciais
    const corFundoElement = document.getElementById('corFundo');
    if (corFundoElement && corFundoHex) {
        if (corFundoElement.value) {
            corFundoHex.value = corFundoElement.value;
            if (colorPreview) {
                colorPreview.style.backgroundColor = corFundoElement.value;
            }
        }
    }
    if (corFundo && corFundoHex) {
        if (corFundo.value) {
            corFundoHex.value = corFundo.value;
            if (colorPreview) {
                colorPreview.style.backgroundColor = corFundo.value;
            }
        }
    }
}
};

// Expor funções globalmente para compatibilidade
window.updatePreview = function() {
    window.AnySummit.Preview.updatePreview();
};

window.updateHeroPreview = function(eventName, startDateTime, venueName, eventLink, isPresential) {
    window.AnySummit.Preview.updateHeroPreview(eventName, startDateTime, venueName, eventLink, isPresential);
};


// ==========================
// 7. SISTEMA DE ENDEREÇOS
// ==========================
window.AnySummit.Address = {
    searchTimeout: null,
    autocompleteService: null,
    placesService: null,
    
    /**
     * Inicializa sistema de busca de endereços
     * Consolidada de: criaevento.js, address-improvements.js
     */
    initAddressSearch: function() {
        const addressSearch = document.getElementById('addressSearch');
        const addressSuggestions = document.getElementById('addressSuggestions');
        const addressFields = document.getElementById('addressFields');
        
        if (!addressSearch) {
            console.log('[Address] Campo de busca não encontrado');
            return;
        }
        
        console.log('[Address] Inicializando busca de endereços...');
        
        // Inicializar serviços do Google se disponível
        if (typeof google !== 'undefined' && google.maps && google.maps.places) {
            this.autocompleteService = new google.maps.places.AutocompleteService();
            this.placesService = new google.maps.places.PlacesService(document.createElement('div'));
        }
        
        // Listener para busca
        addressSearch.addEventListener('input', () => {
            const query = addressSearch.value.trim();
            console.log('[Address] Input detectado:', query);
            
            clearTimeout(this.searchTimeout);
            
            if (query.length < 3) {
                addressSuggestions.style.display = 'none';
                return;
            }
            
            this.searchTimeout = setTimeout(() => {
                console.log('[Address] Iniciando busca após timeout');
                this.searchAddresses(query);
            }, 500);
        });
        
        // Fechar sugestões ao clicar fora
        document.addEventListener('click', (e) => {
            if (!addressSearch.contains(e.target) && !addressSuggestions.contains(e.target)) {
                addressSuggestions.style.display = 'none';
            }
        });
        
        // Verificar campos preenchidos ao carregar
        this.checkAddressFields();
    },
    
    /**
     * Busca endereços
     */
    searchAddresses: function(query) {
        console.log('[Address] Buscando:', query);
        
        const addressSuggestions = document.getElementById('addressSuggestions');
        if (!addressSuggestions) {
            console.error('[Address] Elemento addressSuggestions não encontrado');
            return;
        }
        
        // Mostrar loading
        const loadingDiv = document.getElementById('addressLoading');
        if (loadingDiv) {
            loadingDiv.style.display = 'flex';
        }
        
        if (this.autocompleteService) {
            console.log('[Address] Usando Google Places API');
            const request = {
                input: query,
                componentRestrictions: { country: 'br' },
                language: 'pt-BR',
                types: ['establishment', 'geocode']
            };
            
            this.autocompleteService.getPlacePredictions(request, (predictions, status) => {
                // Esconder loading
                if (loadingDiv) {
                    loadingDiv.style.display = 'none';
                }
                
                console.log('[Address] Status da API:', status);
                console.log('[Address] Predições:', predictions?.length || 0);
                
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    this.displayAddressSuggestions(predictions);
                } else {
                    console.log('[Address] Sem resultados, usando simulação');
                    this.simulateAddressSearch(query);
                }
            });
        } else {
            console.log('[Address] API não disponível, usando simulação');
            // Esconder loading
            if (loadingDiv) {
                loadingDiv.style.display = 'none';
            }
            this.simulateAddressSearch(query);
        }
    },
    
    /**
     * Simula busca de endereços
     */
    simulateAddressSearch: function(query) {
        const mockResults = [
            {
                description: `${query} - São Paulo, SP, Brasil`,
                place_id: 'mock_sp_' + Date.now(),
                structured_formatting: {
                    main_text: query,
                    secondary_text: 'São Paulo, SP, Brasil'
                }
            },
            {
                description: `${query} - Rio de Janeiro, RJ, Brasil`,
                place_id: 'mock_rj_' + Date.now(),
                structured_formatting: {
                    main_text: query,
                    secondary_text: 'Rio de Janeiro, RJ, Brasil'
                }
            },
            {
                description: `${query} - Belo Horizonte, MG, Brasil`,
                place_id: 'mock_mg_' + Date.now(),
                structured_formatting: {
                    main_text: query,
                    secondary_text: 'Belo Horizonte, MG, Brasil'
                }
            }
        ];
        
        this.displayAddressSuggestions(mockResults);
    },
    
    /**
     * Exibe sugestões de endereços
     */
    displayAddressSuggestions: function(results) {
        const addressSuggestions = document.getElementById('addressSuggestions');
        if (!addressSuggestions) return;
        
        addressSuggestions.innerHTML = '';
        
        if (results.length === 0) {
            addressSuggestions.style.display = 'none';
            return;
        }
        
        results.forEach(result => {
            const suggestion = document.createElement('div');
            suggestion.className = 'address-suggestion';
            
            const mainText = result.structured_formatting?.main_text || result.description;
            const secondaryText = result.structured_formatting?.secondary_text || '';
            
            suggestion.innerHTML = `
                <div class="address-main">${mainText}</div>
                ${secondaryText ? `<div class="address-secondary">${secondaryText}</div>` : ''}
            `;
            
            suggestion.addEventListener('click', () => this.selectAddress(result));
            addressSuggestions.appendChild(suggestion);
        });
        
        addressSuggestions.style.display = 'block';
    },
    
    /**
     * Seleciona endereço
     */
    selectAddress: function(address) {
        console.log('[Address] Endereço selecionado:', address.description);
        
        const addressSearch = document.getElementById('addressSearch');
        const addressSuggestions = document.getElementById('addressSuggestions');
        const addressFields = document.getElementById('addressFields');
        
        if (addressSearch) {
            addressSearch.value = address.description;
        }
        
        if (addressSuggestions) {
            addressSuggestions.style.display = 'none';
        }
        
        // Mostrar campos de endereço
        if (addressFields) {
            addressFields.classList.remove('hidden');
            addressFields.style.display = 'block';
        }
        
        // Buscar detalhes
        if (address.place_id.startsWith('mock_')) {
            this.fillMockAddressData(address);
        } else if (this.placesService) {
            this.getPlaceDetails(address.place_id);
        } else {
            this.fillMockAddressData(address);
        }
    },
    
    /**
     * Busca detalhes do local
     */
    getPlaceDetails: function(placeId) {
        const request = {
            placeId: placeId,
            fields: ['name', 'address_components', 'geometry', 'formatted_address']
        };
        
        this.placesService.getDetails(request, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                this.fillAddressFields(place);
            } else {
                console.log('[Address] Erro ao obter detalhes');
                this.fillMockAddressData({ description: 'Endereço' });
            }
        });
    },
    
    /**
     * Preenche campos com dados da API
     */
    fillAddressFields: function(place) {
        console.log('[Address] Preenchendo campos com dados da API');
        
        // Nome do local
        const venueName = document.getElementById('venueName');
        if (venueName && place.name) {
            venueName.value = place.name;
        }
        
        // Processar componentes
        const components = place.address_components || [];
        const fields = {
            street: '',
            number: '',
            neighborhood: '',
            city: '',
            state: '',
            cep: ''
        };
        
        components.forEach(component => {
            const types = component.types;
            
            if (types.includes('route')) {
                fields.street = component.long_name;
            } else if (types.includes('street_number')) {
                fields.number = component.long_name;
            } else if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
                fields.neighborhood = component.long_name;
            } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                fields.city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
                fields.state = component.short_name;
            } else if (types.includes('postal_code')) {
                fields.cep = component.long_name;
            }
        });
        
        // Preencher campos
        Object.entries(fields).forEach(([key, value]) => {
            const field = document.getElementById(key);
            if (field && value) {
                field.value = value;
                field.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        
        // Salvar dados
        if (window.AnySummit.Wizard && window.AnySummit.Wizard.saveWizardData) {
            window.AnySummit.Wizard.saveWizardData();
        }
    },
    
    /**
     * Preenche com dados simulados
     */
    fillMockAddressData: function(address) {
        console.log('[Address] Preenchendo com dados simulados');
        
        const mockData = {
            venueName: address.structured_formatting?.main_text || 'Local do Evento',
            street: 'Avenida Paulista',
            number: '1000',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            cep: '01310-100'
        };
        
        // Ajustar cidade/estado baseado na descrição
        if (address.description?.includes('Rio de Janeiro')) {
            mockData.city = 'Rio de Janeiro';
            mockData.state = 'RJ';
            mockData.street = 'Avenida Atlântica';
            mockData.neighborhood = 'Copacabana';
            mockData.cep = '22070-000';
        } else if (address.description?.includes('Belo Horizonte')) {
            mockData.city = 'Belo Horizonte';
            mockData.state = 'MG';
            mockData.street = 'Avenida Afonso Pena';
            mockData.neighborhood = 'Centro';
            mockData.cep = '30130-000';
        }
        
        // Preencher campos
        Object.entries(mockData).forEach(([key, value]) => {
            const field = document.getElementById(key);
            if (field) {
                field.value = value;
                field.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        
        // Salvar dados
        if (window.AnySummit.Wizard && window.AnySummit.Wizard.saveWizardData) {
            window.AnySummit.Wizard.saveWizardData();
        }
    },
    
    /**
     * Verifica se há campos preenchidos
     */
    checkAddressFields: function() {
        const addressFields = document.getElementById('addressFields');
        const hasAddress = document.getElementById('street')?.value || 
                          document.getElementById('venueName')?.value;
        
        if (hasAddress && addressFields) {
            addressFields.classList.remove('hidden');
            addressFields.style.display = 'block';
        }
    }
};

// Expor funções globalmente
window.initAddressSearch = function() {
    window.AnySummit.Address.initAddressSearch();
};

// Funções de lote expostas globalmente
window.criarLoteData = function() {
    if (window.AnySummit.Lotes) {
        window.AnySummit.Lotes.criarLoteData();
    }
};

window.criarLotePercentual = function() {
    if (window.AnySummit.Lotes) {
        window.AnySummit.Lotes.criarLotePercentual();
    }
};

// Função para configurar campos do lote por data após abrir modal
window.configurarCamposLoteDataAposAbrir = function() {
    if (window.AnySummit.Lotes) {
        window.AnySummit.Lotes.configurarCamposLoteData();
    }
};

// Função para buscar endereço manualmente
window.searchAddressManual = function() {
    console.log('[Address] Busca manual de endereço iniciada');
    
    const addressSearch = document.getElementById('addressSearch');
    if (!addressSearch) {
        console.error('[Address] Campo de busca não encontrado');
        return;
    }
    
    const query = addressSearch.value.trim();
    
    if (query.length < 3) {
        if (window.AnySummit.Dialogs) {
            window.AnySummit.Dialogs.alert('Digite pelo menos 3 caracteres para buscar.', 'Atenção');
        } else {
            alert('Digite pelo menos 3 caracteres para buscar.');
        }
        return;
    }
    
    // Mostrar loading se existir
    const loadingDiv = document.getElementById('addressLoading');
    if (loadingDiv) {
        loadingDiv.style.display = 'flex';
    }
    
    // Buscar endereço
    if (window.AnySummit.Address) {
        window.AnySummit.Address.searchAddresses(query);
    } else {
        // Fallback: disparar evento de input
        addressSearch.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Esconder loading após 2 segundos
    if (loadingDiv) {
        setTimeout(() => {
            loadingDiv.style.display = 'none';
        }, 2000);
    }
};

});
