// Monitor para garantir que nextStep não seja sobrescrito
console.log('👮 Iniciando monitor de proteção do nextStep...');

// Variável para controlar se já aplicamos nossa correção
let correctNextStepApplied = false;

// Função para verificar se é nossa versão correta
function isCorrectNextStep(fn) {
    return fn && fn.toString().includes('[FORÇADO]');
}

// Monitorar mudanças no nextStep
Object.defineProperty(window, 'nextStep', {
    configurable: true,
    get() {
        return this._nextStep;
    },
    set(value) {
        if (correctNextStepApplied && !isCorrectNextStep(value)) {
            console.warn('⚠️ Tentativa de sobrescrever nextStep bloqueada!');
            console.log('Função rejeitada:', value.toString().substring(0, 100) + '...');
            return; // Bloquear sobrescrita
        }
        
        if (isCorrectNextStep(value)) {
            correctNextStepApplied = true;
            console.log('✅ nextStep correta aplicada e protegida');
        }
        
        this._nextStep = value;
    }
});

console.log('🛡️ Proteção ativada - nextStep está sendo monitorada');