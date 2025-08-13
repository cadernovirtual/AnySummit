// Checkout JavaScript - AnySummit
// Versão otimizada e modular

class CheckoutManager {
    constructor() {
        this.eventoSlug = '';
        this.compradorLogado = false;
        this.timeRemaining = 0;
        this.timer = null;
    }
    
    init(slug, logado, tempo) {
        this.eventoSlug = slug;
        this.compradorLogado = logado;
        this.timeRemaining = tempo;
        
        this.startTimer();
        this.loadCheckoutData();
        this.setupEventListeners();
        
        if (this.compradorLogado) {
            this.showSections();
        }
    }
    
    startTimer() {
        const timerElement = document.getElementById('timer');
        
        this.timer = setInterval(() => {
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (this.timeRemaining <= 0) {
                clearInterval(this.timer);
                alert('Tempo esgotado! Redirecionando...');
                window.location.href = '/evento/' + this.eventoSlug;
                return;
            }
            
            this.timeRemaining--;
        }, 1000);
    }
    
    setupEventListeners() {
        this.setupFieldMasks();
    }
    
    setupFieldMasks() {
        // WhatsApp mask
        const whatsapp = document.getElementById('whatsapp');
        if (whatsapp) {
            whatsapp.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                }
                e.target.value = value;
            });
        }

        // CEP mask
        const cep = document.getElementById('cep');
        if (cep) {
            cep.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 8) {
                    value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
                }
                e.target.value = value;
            });
        }

        // Document mask
        const documento = document.getElementById('documento');
        if (documento) {
            documento.addEventListener('input', (e) => {
                const tipo = document.getElementById('tipo_documento').value;
                let value = e.target.value.replace(/\D/g, '');
                
                if (tipo === 'CPF') {
                    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                } else if (tipo === 'CNPJ') {
                    value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                }
                
                e.target.value = value;
            });
        }

        // Card number mask
        const cardNumber = document.getElementById('card_number');
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                e.target.value = value;
            });
        }

        // Card expiry mask
        const cardExpiry = document.getElementById('card_expiry');
        if (cardExpiry) {
            cardExpiry.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        // CVV mask
        const cardCvv = document.getElementById('card_cvv');
        if (cardCvv) {
            cardCvv.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
            });
        }
    }
    
    showSections() {
        document.getElementById('dados-comprador-section').style.display = 'block';
        document.getElementById('pagamento-section').style.display = 'block';
    }
    
    loadCheckoutData() {
        // Simular dados do carrinho
        const ticketsHtml = `
            <div class="d-flex justify-content-between mb-2">
                <div>
                    <div class="fw-semibold">Ingresso Padrão</div>
                    <small class="text-muted">Qtd: 1</small>
                </div>
                <div>R$ 100,00</div>
            </div>
        `;
        
        document.getElementById('summary-tickets').innerHTML = ticketsHtml;
        document.getElementById('valor-total').textContent = 'R$ 100,00';
    }
    
    toggleLoginOption(option) {
        document.querySelectorAll('.login-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        document.querySelector(`[data-login="${option}"]`).classList.add('selected');
        
        const radio = document.querySelector(`input[value="${option}"]`);
        if (radio) radio.checked = true;

        const loginForm = document.getElementById('comprador-login-form');
        const dadosSection = document.getElementById('dados-comprador-section');
        const pagamentoSection = document.getElementById('pagamento-section');
        
        if (option === 'login') {
            loginForm.style.display = 'block';
            dadosSection.style.display = 'none';
            pagamentoSection.style.display = 'none';
        } else if (option === 'cadastro') {
            loginForm.style.display = 'none';
            dadosSection.style.display = 'block';
            pagamentoSection.style.display = 'block';
        }
    }
    
    closeCompradorLogin() {
        document.getElementById('comprador-login-form').style.display = 'none';
        document.getElementById('dados-comprador-section').style.display = 'none';
        document.getElementById('pagamento-section').style.display = 'none';
        
        document.querySelectorAll('.login-option').forEach(opt => {
            opt.classList.remove('selected');
        });
    }
    
    deslogarComprador() {
        if (confirm('Deseja sair da sua conta?')) {
            document.cookie = 'compradorid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'compradornome=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            location.reload();
        }
    }
    
    async realizarLoginComprador() {
        const email = document.getElementById('comprador_login_email').value;
        const senha = document.getElementById('comprador_login_senha').value;

        if (!email || !senha) {
            this.showError('Preencha e-mail e senha.');
            return;
        }

        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Entrando...';
        btn.disabled = true;

        try {
            const response = await fetch('/evento/api/login-comprador.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess('Login realizado! Recarregando...');
                setTimeout(() => location.reload(), 1000);
            } else {
                this.showError(result.message || 'Login inválido.');
            }
        } catch (error) {
            this.showError('Erro no login: ' + error.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
    
    toggleDocumentField() {
        const tipo = document.getElementById('tipo_documento').value;
        const campo = document.getElementById('documento');
        
        if (tipo === 'CPF') {
            campo.placeholder = '000.000.000-00';
            campo.maxLength = 14;
        } else {
            campo.placeholder = '00.000.000/0000-00';
            campo.maxLength = 18;
        }
    }
    
    async buscarCEP() {
        const cep = document.getElementById('cep').value.replace(/\D/g, '');
        
        if (cep.length === 8) {
            try {
                document.getElementById('cep').classList.add('loading');
                
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                
                if (!data.erro) {
                    document.getElementById('endereco').value = data.logradouro || '';
                    document.getElementById('bairro').value = data.bairro || '';
                    document.getElementById('cidade').value = data.localidade || '';
                    document.getElementById('estado').value = data.uf || '';
                    document.getElementById('endereco-fields').style.display = 'block';
                    
                    setTimeout(() => {
                        document.getElementById('numero').focus();
                    }, 100);
                } else {
                    this.showError('CEP não encontrado.');
                }
            } catch (error) {
                this.showError('Erro ao buscar CEP.');
            } finally {
                document.getElementById('cep').classList.remove('loading');
            }
        }
    }
    
    selectPayment(method) {
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('selected');
        });

        document.querySelector(`[data-payment="${method}"]`).classList.add('selected');
        document.querySelector(`input[value="${method}"]`).checked = true;

        document.getElementById('credit-details').style.display = method === 'credit' ? 'block' : 'none';
        document.getElementById('pix-details').style.display = method === 'pix' ? 'block' : 'none';
        
        if (method === 'credit') {
            this.generateInstallments();
        }
    }
    
    generateInstallments() {
        const html = `
            <div class="installment-option selected" onclick="checkoutManager.selectInstallment(this, 1)">
                <input type="radio" name="installments" value="1" checked>
                <strong>1x de R$ 100,00</strong> à vista
            </div>
            <div class="installment-option" onclick="checkoutManager.selectInstallment(this, 2)">
                <input type="radio" name="installments" value="2">
                <strong>2x de R$ 52,50</strong> com juros
            </div>
            <div class="installment-option" onclick="checkoutManager.selectInstallment(this, 3)">
                <input type="radio" name="installments" value="3">
                <strong>3x de R$ 35,50</strong> com juros
            </div>
        `;
        document.getElementById('installments-list').innerHTML = html;
    }
    
    selectInstallment(element, installments) {
        document.querySelectorAll('.installment-option').forEach(option => {
            option.classList.remove('selected');
        });
        element.classList.add('selected');
        element.querySelector('input').checked = true;
    }
    
    async finalizePayment() {
        const paymentMethod = document.querySelector('input[name="payment_method"]:checked');
        
        if (!paymentMethod) {
            this.showError('Selecione uma forma de pagamento.');
            return;
        }

        if (!this.validateForm()) {
            return;
        }

        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...';
        btn.disabled = true;

        try {
            // Simular processamento
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (paymentMethod.value === 'pix') {
                window.location.href = '/evento/pagamento-pix.php?evento=' + this.eventoSlug;
            } else {
                window.location.href = '/evento/pagamento-sucesso.php?evento=' + this.eventoSlug;
            }
            
        } catch (error) {
            this.showError('Erro ao processar pagamento: ' + error.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
    
    validateForm() {
        const requiredFields = [
            'nome_completo', 'email', 'whatsapp', 'documento', 
            'cep', 'endereco', 'numero', 'bairro', 'cidade', 'estado'
        ];
        
        for (let fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                this.showError(`Campo obrigatório não preenchido.`);
                if (field) field.focus();
                return false;
            }
        }
        
        // Validar e-mail
        const email = document.getElementById('email').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError('E-mail inválido.');
            document.getElementById('email').focus();
            return false;
        }
        
        return true;
    }
    
    showError(message) {
        alert('Erro: ' + message);
    }
    
    showSuccess(message) {
        alert('Sucesso: ' + message);
    }
}

// Instância global
const checkoutManager = new CheckoutManager();

// Funções globais para compatibilidade
function toggleLoginOption(option) {
    checkoutManager.toggleLoginOption(option);
}

function closeCompradorLogin() {
    checkoutManager.closeCompradorLogin();
}

function deslogarComprador() {
    checkoutManager.deslogarComprador();
}

function realizarLoginComprador() {
    checkoutManager.realizarLoginComprador();
}

function toggleDocumentField() {
    checkoutManager.toggleDocumentField();
}

function buscarCEP() {
    checkoutManager.buscarCEP();
}

function selectPayment(method) {
    checkoutManager.selectPayment(method);
}

function finalizePayment() {
    checkoutManager.finalizePayment();
}

console.log('Checkout JavaScript carregado com sucesso!');
