/**
 * Sistema de Dialogs Customizados
 * AnySummit - Substitui alerts e confirms nativos
 */

class CustomDialog {
    constructor() {
        this.activeDialog = null;
    }
    
    // Criar estrutura HTML do dialog
    createDialogHTML(options) {
        const dialogId = 'dialog-' + Date.now();
        
        const html = `
            <div class="custom-dialog-overlay" id="${dialogId}">
                <div class="custom-dialog">
                    ${options.title ? `
                        <div class="custom-dialog-header">
                            <h3 class="custom-dialog-title">${options.title}</h3>
                        </div>
                    ` : ''}
                    <div class="custom-dialog-body">
                        ${options.message}
                    </div>
                    <div class="custom-dialog-footer">
                        ${options.buttons.map(btn => `
                            <button class="custom-dialog-btn ${btn.className || 'custom-dialog-btn-secondary'}" 
                                    data-action="${btn.action}">
                                ${btn.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        return { id: dialogId, html };
    }
    
    // Mostrar dialog
    show(options) {
        return new Promise((resolve) => {
            const { id, html } = this.createDialogHTML(options);
            
            // Adicionar ao DOM
            document.body.insertAdjacentHTML('beforeend', html);
            const dialog = document.getElementById(id);
            
            // Forçar reflow para animação
            dialog.offsetHeight;
            
            // Mostrar com animação
            dialog.classList.add('show');
            
            // Adicionar listeners aos botões
            dialog.querySelectorAll('.custom-dialog-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.getAttribute('data-action');
                    this.close(dialog);
                    resolve(action);
                });
            });
            
            // Fechar ao clicar no overlay
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog && options.allowBackdropDismiss !== false) {
                    this.close(dialog);
                    resolve('backdrop');
                }
            });
            
            this.activeDialog = dialog;
        });
    }
    
    // Fechar dialog
    close(dialog) {
        if (!dialog) dialog = this.activeDialog;
        if (!dialog) return;
        
        dialog.classList.remove('show');
        
        setTimeout(() => {
            dialog.remove();
        }, 300);
        
        this.activeDialog = null;
    }
    
    // Métodos de conveniência
    alert(message, title = '') {
        return this.show({
            title,
            message,
            buttons: [
                { text: 'OK', action: 'ok', className: 'custom-dialog-btn-primary' }
            ]
        });
    }
    
    confirm(message, title = '') {
        return this.show({
            title,
            message,
            buttons: [
                { text: 'Cancelar', action: 'cancel' },
                { text: 'Confirmar', action: 'confirm', className: 'custom-dialog-btn-primary' }
            ]
        });
    }
    
    // Dialog específico para recuperação do wizard
    wizardRestore(eventName) {
        return this.show({
            title: '🔄 Continuar Configuração',
            message: `Você deseja continuar a configuração do evento <strong>"${eventName}"</strong> do ponto onde parou?`,
            buttons: [
                { text: 'Não, quero recomeçar...', action: 'restart' },
                { text: 'Sim, continuar', action: 'continue', className: 'custom-dialog-btn-primary' }
            ],
            allowBackdropDismiss: false
        });
    }
}

// Criar instância global
window.customDialog = new CustomDialog();

// Override de alert e confirm nativos (opcional)
window.customAlert = (message, title) => window.customDialog.alert(message, title);
window.customConfirm = (message, title) => window.customDialog.confirm(message, title);

console.log('Sistema de dialogs customizados carregado');