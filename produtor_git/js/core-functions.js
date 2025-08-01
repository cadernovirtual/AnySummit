/**
 * =====================================================
 * CORE FUNCTIONS - FUNÇÕES COMPARTILHADAS
 * =====================================================
 * Funções compartilhadas entre diferentes páginas
 * Criado em: 29/01/2025
 * 
 * Este arquivo contém apenas as funções essenciais
 * que são usadas em múltiplas páginas do sistema
 * =====================================================
 */

// =====================================================
// 1. SISTEMA DE MODAIS
// =====================================================

/**
 * Abre um modal
 * Usada em: novoevento.php, vendas.php
 */
function openModal(modalId) {
    console.log('🔓 Abrindo modal:', modalId);
    
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error('Modal não encontrado:', modalId);
        return;
    }
    
    // Remover style inline primeiro
    modal.style.display = '';
    
    // Adicionar classe show (CSS fará display: flex)
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    console.log('✅ Modal aberto:', modalId);
}

/**
 * Fecha um modal
 * Usada em: novoevento.php, vendas.php
 */
function closeModal(modalId) {
    console.log('🔒 Fechando modal:', modalId);
    
    // Se modalId não for passado, tenta fechar o modal ativo
    if (!modalId) {
        const activeModal = document.querySelector('.modal.show');
        if (activeModal) {
            activeModal.classList.remove('show');
            activeModal.style.display = '';
            return;
        }
    }
    
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        // Remover style inline para voltar ao CSS padrão
        modal.style.display = '';
    }
}

// =====================================================
// 2. MÁSCARAS DE INPUT
// =====================================================

/**
 * Máscara para telefone
 * Usada em: cadastro.php, novo-cadastro.php
 */
function phoneMask(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 10) {
        // Formato: (XX) XXXX-XXXX
        value = value.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
        // Formato: (XX) XXXXX-XXXX
        value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    input.value = value;
}

/**
 * Máscara para CPF
 * Usada em: cadastro.php, novo-cadastro.php
 */
function cpfMask(input) {
    let value = input.value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    value = value.substring(0, 11);
    
    // Aplica máscara: XXX.XXX.XXX-XX
    value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    
    input.value = value;
}

/**
 * Máscara para CNPJ
 * Usada em: cadastro.php, novo-cadastro.php
 */
function cnpjMask(input) {
    let value = input.value.replace(/\D/g, '');
    
    // Limita a 14 dígitos
    value = value.substring(0, 14);
    
    // Aplica máscara: XX.XXX.XXX/XXXX-XX
    value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    
    input.value = value;
}

// =====================================================
// 3. UTILITÁRIOS GERAIS
// =====================================================

/**
 * Debounce para otimizar chamadas de função
 * Útil para eventos de input, scroll, resize
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Formata valor monetário
 * Compartilhada entre várias páginas
 */
function formatarMoeda(valor) {
    if (typeof valor === 'string') {
        valor = parseFloat(valor.replace(',', '.'));
    }
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Parse de valor monetário
 * Converte string formatada em número
 */
function parsearValorMonetario(valor) {
    if (typeof valor === 'number') return valor;
    
    return parseFloat(
        valor.toString()
            .replace(/[R$\s]/g, '')
            .replace(/\./g, '')
            .replace(',', '.')
    ) || 0;
}

// =====================================================
// 4. TOGGLE DE ELEMENTOS
// =====================================================

/**
 * Toggle de menu mobile
 * Usada em: meuseventos.php e outras páginas com menu
 */
function toggleMobileMenu() {
    const menu = document.querySelector('.mobile-menu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

/**
 * Fecha menu mobile
 */
function closeMobileMenu() {
    const menu = document.querySelector('.mobile-menu');
    if (menu) {
        menu.classList.remove('active');
    }
}

/**
 * Toggle de dropdown do usuário
 */
function toggleUserDropdown() {
    const dropdown = document.querySelector('.user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// =====================================================
// 5. VALIDAÇÕES
// =====================================================

/**
 * Valida email
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Valida CPF
 */
function validateCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

/**
 * Valida CNPJ
 */
function validateCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    
    if (cnpj.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Validação do primeiro dígito verificador
    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    let digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result != digits.charAt(0)) return false;
    
    // Validação do segundo dígito verificador
    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result != digits.charAt(1)) return false;
    
    return true;
}

// =====================================================
// 6. COOKIES
// =====================================================

/**
 * Define um cookie
 */
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

/**
 * Obtém um cookie
 */
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            let value = c.substring(nameEQ.length, c.length);
            try {
                return decodeURIComponent(value);
            } catch(e) {
                return value;
            }
        }
    }
    return null;
}

/**
 * Remove um cookie
 */
function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

// =====================================================
// 7. INICIALIZAÇÃO
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Core Functions carregado');
    
    // Configurar máscaras automaticamente se os elementos existirem
    const phoneInputs = document.querySelectorAll('[data-mask="phone"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', () => phoneMask(input));
    });
    
    const cpfInputs = document.querySelectorAll('[data-mask="cpf"]');
    cpfInputs.forEach(input => {
        input.addEventListener('input', () => cpfMask(input));
    });
    
    const cnpjInputs = document.querySelectorAll('[data-mask="cnpj"]');
    cnpjInputs.forEach(input => {
        input.addEventListener('input', () => cnpjMask(input));
    });
});

console.log('✅ core-functions.js carregado com sucesso');
