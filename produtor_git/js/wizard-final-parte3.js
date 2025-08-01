// =====================================================
// PARTE 3: FUNÇÕES DE EDIÇÃO E EXCLUSÃO DE LOTES
// =====================================================

/**
 * Adiciona as funções de edição e exclusão aos Lotes
 */
(function() {
    if (!window.AnySummit.Lotes) return;
    
    /**
     * Editar lote por data
     */
    window.AnySummit.Lotes.editarLoteData = function(id) {
        console.log('[Lotes] Editando lote data:', id);
        
        const lote = window.lotesData?.porData.find(l => l.id === id);
        if (!lote) {
            console.error('[Lotes] Lote não encontrado:', id);
            return;
        }
        
        // Preencher campos do modal
        const campos = {
            'editLoteDataId': id,
            'editLoteDataInicio': lote.dataInicio,
            'editLoteDataFim': lote.dataFim
        };
        
        for (let [campoId, valor] of Object.entries(campos)) {
            const campo = document.getElementById(campoId);
            if (campo) {
                campo.value = valor;
            }
        }
        
        // Checkbox de divulgar
        const checkbox = document.getElementById('editLoteDataDivulgar');
        if (checkbox) {
            checkbox.checked = lote.divulgar !== false;
        }
        
        // Abrir modal
        if (window.openModal) {
            window.openModal('editLoteDataModal');
        } else {
            const modal = document.getElementById('editLoteDataModal');
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('show');
            }
        }
    };
    
    /**
     * Salvar edição do lote por data
     */
    window.AnySummit.Lotes.salvarLoteData = function() {
        console.log('[Lotes] Salvando edição de lote data');
        
        const id = document.getElementById('editLoteDataId')?.value;
        const dataInicio = document.getElementById('editLoteDataInicio')?.value;
        const dataFim = document.getElementById('editLoteDataFim')?.value;
        const divulgar = document.getElementById('editLoteDataDivulgar')?.checked;
        
        if (!id || !dataInicio || !dataFim) {
            alert('Por favor, preencha todos os campos');
            return;
        }
        
        // Validações
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        
        if (inicio >= fim) {
            alert('A data de início deve ser anterior à data de fim');
            return;
        }
        
        // Atualizar lote
        const loteIndex = window.lotesData.porData.findIndex(l => l.id === id);
        if (loteIndex >= 0) {
            window.lotesData.porData[loteIndex].dataInicio = dataInicio;
            window.lotesData.porData[loteIndex].dataFim = dataFim;
            window.lotesData.porData[loteIndex].divulgar = divulgar;
            
            // Renderizar e fechar modal
            window.AnySummit.Lotes.renderizarLotesPorData();
            if (window.closeModal) {
                window.closeModal('editLoteDataModal');
            }
            
            // Salvar
            if (window.AnySummit.Storage) {
                window.AnySummit.Storage.saveLotes();
            }
        }
    };
    
    /**
     * Verifica se um lote tem ingressos associados
     */
    window.AnySummit.Lotes.verificarIngressosNoLote = function(loteId) {
        console.log('[Lotes] Verificando ingressos no lote:', loteId);
        
        // Verificar no DOM
        const ticketItems = document.querySelectorAll('.ticket-item');
        let temIngressos = false;
        
        ticketItems.forEach(item => {
            if (item.ticketData && item.ticketData.loteId === loteId) {
                temIngressos = true;
            }
        });
        
        // Verificar nos dados salvos
        if (!temIngressos) {
            const savedData = window.AnySummit.Storage?.getSavedData();
            if (savedData && savedData.tickets) {
                savedData.tickets.forEach(ticket => {
                    if (ticket.loteId === loteId) {
                        temIngressos = true;
                    }
                });
            }
        }
        
        console.log('[Lotes] Lote tem ingressos:', temIngressos);
        return temIngressos;
    };
    
    /**
     * Excluir lote por data
     */
    window.AnySummit.Lotes.excluirLoteData = function(id) {
        console.log('[Lotes] Tentando excluir lote data:', id);
        
        // Verificar se tem ingressos
        if (this.verificarIngressosNoLote(id)) {
            if (window.customDialog && window.customDialog.warning) {
                window.customDialog.warning(
                    'Não é possível excluir',
                    'Este lote possui ingressos associados. Remova os ingressos antes de excluir o lote.'
                );
            } else {
                alert('Este lote possui ingressos associados. Remova os ingressos antes de excluir o lote.');
            }
            return false;
        }
        
        // Confirmar exclusão
        if (confirm('Tem certeza que deseja excluir este lote?')) {
            window.lotesData.porData = window.lotesData.porData.filter(l => l.id !== id);
            this.renomearLotesAutomaticamente();
            this.renderizarLotesPorData();
            
            // Salvar
            if (window.AnySummit.Storage) {
                window.AnySummit.Storage.saveLotes();
            }
            
            console.log('[Lotes] Lote excluído:', id);
        }
    };
    
    /**
     * Editar lote por percentual
     */
    window.AnySummit.Lotes.editarLotePercentual = function(id) {
        console.log('[Lotes] Editando lote percentual:', id);
        
        const lote = window.lotesData?.porPercentual.find(l => l.id === id);
        if (!lote) {
            console.error('[Lotes] Lote não encontrado:', id);
            return;
        }
        
        // Preencher campos
        document.getElementById('editLotePercentualId').value = id;
        document.getElementById('editLotePercentualValor').value = lote.percentual;
        
        const checkbox = document.getElementById('editLotePercentualDivulgar');
        if (checkbox) {
            checkbox.checked = lote.divulgar !== false;
        }
        
        // Abrir modal
        if (window.openModal) {
            window.openModal('editLotePercentualModal');
        }
    };
    
    /**
     * Salvar edição do lote por percentual
     */
    window.AnySummit.Lotes.salvarLotePercentual = function() {
        console.log('[Lotes] Salvando edição de lote percentual');
        
        const id = document.getElementById('editLotePercentualId')?.value;
        const percentual = parseInt(document.getElementById('editLotePercentualValor')?.value);
        const divulgar = document.getElementById('editLotePercentualDivulgar')?.checked;
        
        if (!id || !percentual) {
            alert('Por favor, preencha todos os campos');
            return;
        }
        
        // Validações
        if (percentual < 1 || percentual > 100) {
            alert('O percentual deve estar entre 1 e 100');
            return;
        }
        
        // Verificar total
        const loteAtual = window.lotesData.porPercentual.find(l => l.id === id);
        const percentualAtual = loteAtual ? loteAtual.percentual : 0;
        const totalOutros = window.lotesData.porPercentual
            .filter(l => l.id !== id)
            .reduce((sum, l) => sum + l.percentual, 0);
        
        if (totalOutros + percentual > 100) {
            alert(`Percentual excede 100%. Disponível: ${100 - totalOutros}%`);
            return;
        }
        
        // Atualizar
        const loteIndex = window.lotesData.porPercentual.findIndex(l => l.id === id);
        if (loteIndex >= 0) {
            window.lotesData.porPercentual[loteIndex].percentual = percentual;
            window.lotesData.porPercentual[loteIndex].divulgar = divulgar;
            
            // Renderizar e fechar
            window.AnySummit.Lotes.renderizarLotesPorPercentual();
            if (window.closeModal) {
                window.closeModal('editLotePercentualModal');
            }
            
            // Salvar
            if (window.AnySummit.Storage) {
                window.AnySummit.Storage.saveLotes();
            }
        }
    };
    
    /**
     * Excluir lote por percentual
     */
    window.AnySummit.Lotes.excluirLotePercentual = function(id) {
        console.log('[Lotes] Tentando excluir lote percentual:', id);
        
        // Verificar se tem ingressos
        if (this.verificarIngressosNoLote(id)) {
            if (window.customDialog && window.customDialog.warning) {
                window.customDialog.warning(
                    'Não é possível excluir',
                    'Este lote possui ingressos associados. Remova os ingressos antes de excluir o lote.'
                );
            } else {
                alert('Este lote possui ingressos associados. Remova os ingressos antes de excluir o lote.');
            }
            return false;
        }
        
        // Confirmar
        if (confirm('Tem certeza que deseja excluir este lote?')) {
            window.lotesData.porPercentual = window.lotesData.porPercentual.filter(l => l.id !== id);
            this.renomearLotesAutomaticamente();
            this.renderizarLotesPorPercentual();
            
            // Salvar
            if (window.AnySummit.Storage) {
                window.AnySummit.Storage.saveLotes();
            }
            
            console.log('[Lotes] Lote excluído:', id);
        }
    };
    
})();

// =====================================================
// PARTE 4: SISTEMA DE PERSISTÊNCIA (COOKIES/STORAGE)
// =====================================================

window.AnySummit.Storage = {
    /**
     * Salva todos os dados do wizard
     */
    saveWizardData: function() {
        console.log('[Storage] Salvando dados do wizard...');
        
        const wizardData = {
            currentStep: window.AnySummit.Wizard?.currentStep || 1,
            // Step 1 - Informações básicas
            eventName: document.getElementById('eventName')?.value || '',
            classification: document.getElementById('classification')?.value || '',
            category: document.getElementById('category')?.value || '',
            // Step 2 - Imagens
            logo: document.querySelector('#logoPreviewContainer img')?.src || '',
            capa: document.querySelector('#capaPreviewContainer img')?.src || '',
            fundo: document.querySelector('#fundoPreviewMain img')?.src || '',
            corFundo: document.getElementById('corFundo')?.value || '#000000',
            // Step 3 - Data e hora
            startDateTime: document.getElementById('startDateTime')?.value || '',
            endDateTime: document.getElementById('endDateTime')?.value || '',
            // Step 4 - Local
            isPresential: document.getElementById('locationTypeSwitch')?.classList.contains('active'),
            venueName: document.getElementById('venueName')?.value || '',
            addressSearch: document.getElementById('addressSearch')?.value || '',
            street: document.getElementById('street')?.value || '',
            number: document.getElementById('number')?.value || '',
            neighborhood: document.getElementById('neighborhood')?.value || '',
            city: document.getElementById('city')?.value || '',
            state: document.getElementById('state')?.value || '',
            cep: document.getElementById('cep')?.value || '',
            eventLink: document.getElementById('eventLink')?.value || '',
            // Step 5 - Lotes
            lotesData: window.lotesData || { porData: [], porPercentual: [] },
            // Step 6 - Ingressos
            tickets: this.collectTickets(),
            // Step 7 - Descrição
            eventDescription: document.getElementById('eventDescription')?.value || '',
            // Step 8 - Configurações
            urlAmigavel: document.getElementById('urlAmigavel')?.value || '',
            codigoEvento: document.getElementById('codigoEvento')?.value || ''
        };
        
        // Salvar no cookie
        this.setCookie('eventoWizard', JSON.stringify(wizardData), 7);
        console.log('[Storage] Dados salvos:', wizardData);
    },
    
    /**
     * Restaura dados do wizard
     */
    restoreWizardData: function() {
        console.log('[Storage] Restaurando dados do wizard...');
        
        const savedData = this.getCookie('eventoWizard');
        if (!savedData) {
            console.log('[Storage] Nenhum dado salvo encontrado');
            return;
        }
        
        try {
            const data = JSON.parse(savedData);
            console.log('[Storage] Dados encontrados:', data);
            
            // Restaurar campos básicos
            if (data.eventName) document.getElementById('eventName').value = data.eventName;
            if (data.classification) document.getElementById('classification').value = data.classification;
            if (data.category) document.getElementById('category').value = data.category;
            
            // Restaurar imagens
            if (data.logo) this.restoreImage('logo', data.logo);
            if (data.capa) this.restoreImage('capa', data.capa);
            if (data.fundo) this.restoreImage('fundo', data.fundo);
            if (data.corFundo) {
                document.getElementById('corFundo').value = data.corFundo;
                document.getElementById('corFundoHex').value = data.corFundo;
                const colorPreview = document.getElementById('colorPreview');
                if (colorPreview) colorPreview.style.backgroundColor = data.corFundo;
            }
            
            // Restaurar datas
            if (data.startDateTime) document.getElementById('startDateTime').value = data.startDateTime;
            if (data.endDateTime) document.getElementById('endDateTime').value = data.endDateTime;
            
            // Restaurar local
            if (data.isPresential !== undefined) {
                const locationSwitch = document.getElementById('locationTypeSwitch');
                if (data.isPresential) {
                    locationSwitch.classList.add('active');
                } else {
                    locationSwitch.classList.remove('active');
                }
                // Disparar evento para atualizar a UI
                locationSwitch.click();
                locationSwitch.click();
            }
            
            if (data.venueName) document.getElementById('venueName').value = data.venueName;
            if (data.addressSearch) document.getElementById('addressSearch').value = data.addressSearch;
            if (data.street) document.getElementById('street').value = data.street;
            if (data.number) document.getElementById('number').value = data.number;
            if (data.neighborhood) document.getElementById('neighborhood').value = data.neighborhood;
            if (data.city) document.getElementById('city').value = data.city;
            if (data.state) document.getElementById('state').value = data.state;
            if (data.cep) document.getElementById('cep').value = data.cep;
            if (data.eventLink) document.getElementById('eventLink').value = data.eventLink;
            
            // Restaurar lotes
            if (data.lotesData) {
                window.lotesData = data.lotesData;
                if (window.AnySummit.Lotes) {
                    window.AnySummit.Lotes.renderizarLotesPorData();
                    window.AnySummit.Lotes.renderizarLotesPorPercentual();
                }
            }
            
            // Restaurar descrição
            if (data.eventDescription) {
                document.getElementById('eventDescription').value = data.eventDescription;
            }
            
            // Restaurar configurações
            if (data.urlAmigavel) document.getElementById('urlAmigavel').value = data.urlAmigavel;
            if (data.codigoEvento) document.getElementById('codigoEvento').value = data.codigoEvento;
            
            // Atualizar preview
            if (window.updatePreviewSimple) {
                window.updatePreviewSimple();
            }
            
            // Restaurar step atual
            if (data.currentStep && window.AnySummit.Wizard) {
                window.AnySummit.Wizard.goToStep(data.currentStep);
            }
            
            console.log('[Storage] Dados restaurados com sucesso');
            
        } catch (error) {
            console.error('[Storage] Erro ao restaurar dados:', error);
        }
    },
    
    /**
     * Restaura uma imagem
     */
    restoreImage: function(tipo, url) {
        if (!url || url.includes('placeholder')) return;
        
        switch(tipo) {
            case 'logo':
                const logoContainer = document.getElementById('logoPreviewContainer');
                if (logoContainer) {
                    logoContainer.innerHTML = `
                        <img src="${url}" style="width: 100%; height: 100%; object-fit: cover;">
                        <div style="margin-top: 10px;">
                            <button type="button" class="btn btn-sm btn-danger" onclick="clearImage('logo')">
                                <i class="fas fa-trash"></i> Remover
                            </button>
                        </div>
                    `;
                }
                break;
                
            case 'capa':
                const capaContainer = document.getElementById('capaPreviewContainer');
                if (capaContainer) {
                    capaContainer.innerHTML = `
                        <img src="${url}" style="width: 100%; height: 100%; object-fit: cover;">
                        <div style="margin-top: 10px;">
                            <button type="button" class="btn btn-sm btn-danger" onclick="clearImage('capa')">
                                <i class="fas fa-trash"></i> Remover
                            </button>
                        </div>
                    `;
                }
                break;
                
            case 'fundo':
                const fundoContainer = document.getElementById('fundoPreviewMain');
                if (fundoContainer) {
                    fundoContainer.innerHTML = `
                        <img src="${url}" style="width: 100%; height: 100%; object-fit: cover;">
                        <div style="margin-top: 10px;">
                            <button type="button" class="btn btn-sm btn-danger" onclick="clearImage('fundo')">
                                <i class="fas fa-trash"></i> Remover
                            </button>
                        </div>
                    `;
                }
                
                // Atualizar hero também
                const heroBackground = document.getElementById('heroBackground');
                if (heroBackground) {
                    heroBackground.style.backgroundImage = `url(${url})`;
                }
                break;
        }
    },
    
    /**
     * Coleta tickets do DOM
     */
    collectTickets: function() {
        const tickets = [];
        const ticketItems = document.querySelectorAll('.ticket-item');
        
        ticketItems.forEach(item => {
            if (item.ticketData) {
                tickets.push(item.ticketData);
            }
        });
        
        return tickets;
    },
    
    /**
     * Salva lotes especificamente
     */
    saveLotes: function() {
        if (window.lotesData) {
            this.setCookie('lotesData', JSON.stringify(window.lotesData), 7);
        }
    },
    
    /**
     * Recupera dados salvos
     */
    getSavedData: function() {
        const savedData = this.getCookie('eventoWizard');
        if (savedData) {
            try {
                return JSON.parse(savedData);
            } catch (e) {
                console.error('[Storage] Erro ao parsear dados:', e);
            }
        }
        return null;
    },
    
    /**
     * Limpa todos os dados
     */
    clearAllData: function() {
        console.log('[Storage] Limpando todos os dados...');
        this.deleteCookie('eventoWizard');
        this.deleteCookie('lotesData');
        this.deleteCookie('ingressosTemporarios');
    },
    
    /**
     * Funções auxiliares de cookie
     */
    setCookie: function(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    },
    
    getCookie: function(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    
    deleteCookie: function(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    }
};

// =====================================================
// PARTE 5: CORREÇÃO DOS BOTÕES DE LOTE
// =====================================================

// Adicionar estilos para corrigir os botões
const style = document.createElement('style');
style.textContent = `
    /* Correção dos botões de editar/excluir lote */
    .lote-item-actions {
        display: flex;
        gap: 8px;
    }
    
    .lote-item-actions button {
        background: transparent !important;
        border: 1px solid #dee2e6 !important;
        padding: 0.25rem 0.5rem !important;
        font-size: 0.875rem !important;
        border-radius: 0.25rem !important;
        color: #495057 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: auto !important;
        width: auto !important;
        height: auto !important;
        line-height: 1 !important;
    }
    
    .lote-item-actions button:hover {
        background-color: #f8f9fa !important;
        border-color: #adb5bd !important;
        color: #212529 !important;
    }
    
    .lote-item-actions button i {
        font-size: 14px;
        margin: 0;
    }
    
    /* Garantir que não haja faixas azuis */
    .btn-sm.btn-outline-primary {
        background: transparent !important;
        color: #007bff !important;
        border-color: #007bff !important;
    }
    
    .btn-sm.btn-outline-primary:hover {
        background-color: #007bff !important;
        color: white !important;
    }
    
    .btn-sm.btn-outline-danger {
        background: transparent !important;
        color: #dc3545 !important;
        border-color: #dc3545 !important;
    }
    
    .btn-sm.btn-outline-danger:hover {
        background-color: #dc3545 !important;
        color: white !important;
    }
`;
document.head.appendChild(style);

// =====================================================
// PARTE 6: AUTO-SAVE E RECUPERAÇÃO
// =====================================================

// Salvar automaticamente a cada mudança
document.addEventListener('DOMContentLoaded', function() {
    // Lista de campos para monitorar
    const fieldsToWatch = [
        'eventName', 'classification', 'category',
        'startDateTime', 'endDateTime',
        'venueName', 'addressSearch', 'eventLink',
        'street', 'number', 'neighborhood', 'city', 'state', 'cep',
        'eventDescription', 'urlAmigavel', 'codigoEvento'
    ];
    
    // Adicionar listeners para auto-save
    fieldsToWatch.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', () => {
                clearTimeout(window.autoSaveTimeout);
                window.autoSaveTimeout = setTimeout(() => {
                    window.AnySummit.Storage.saveWizardData();
                }, 1000); // Salva após 1 segundo de inatividade
            });
        }
    });
    
    // Verificar se há dados salvos ao carregar
    // REMOVIDO - Dialog de recuperação movido para lotes-fixes.js
});

// Salvar ao mudar de step
if (window.AnySummit.Wizard) {
    const originalNextStep = window.AnySummit.Wizard.nextStep;
    window.AnySummit.Wizard.nextStep = function() {
        window.AnySummit.Storage.saveWizardData();
        return originalNextStep.apply(this, arguments);
    };
}

// Expor função saveWizardData globalmente para compatibilidade
window.saveWizardData = function() {
    if (window.AnySummit.Storage) {
        window.AnySummit.Storage.saveWizardData();
    }
};

// Expor funções de edição/exclusão globalmente
window.editarLoteData = function(id) {
    if (window.AnySummit.Lotes) {
        window.AnySummit.Lotes.editarLoteData(id);
    }
};

window.excluirLoteData = function(id) {
    if (window.AnySummit.Lotes) {
        window.AnySummit.Lotes.excluirLoteData(id);
    }
};

window.editarLotePercentual = function(id) {
    if (window.AnySummit.Lotes) {
        window.AnySummit.Lotes.editarLotePercentual(id);
    }
};

window.excluirLotePercentual = function(id) {
    if (window.AnySummit.Lotes) {
        window.AnySummit.Lotes.excluirLotePercentual(id);
    }
};

window.salvarLoteData = function() {
    if (window.AnySummit.Lotes) {
        window.AnySummit.Lotes.salvarLoteData();
    }
};

window.salvarLotePercentual = function() {
    if (window.AnySummit.Lotes) {
        window.AnySummit.Lotes.salvarLotePercentual();
    }
};

console.log('[AnySummit] Parte 3 carregada: Edição, exclusão e persistência');
