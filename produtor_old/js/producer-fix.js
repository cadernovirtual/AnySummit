// Fix para Step 7 - Produtor
console.log('🧑‍💼 Aplicando fix do produtor...');

document.addEventListener('DOMContentLoaded', function() {
    // Buscar dados do usuário atual via AJAX ou usar dados da sessão
    const producerSelect = document.getElementById('producer');
    const newProducerFields = document.getElementById('newProducerFields');
    const producerNameField = document.getElementById('producerName');
    const displayNameField = document.getElementById('displayName');
    const producerDescField = document.getElementById('producerDescription');
    
    if (producerSelect) {
        // Buscar nome real do usuário (pode vir de uma variável PHP ou AJAX)
        // Por enquanto, vou usar um placeholder genérico
        const currentUserName = window.currentUserName || 'Usuário Atual';
        
        // Atualizar primeira opção
        producerSelect.options[0].text = `Você (${currentUserName})`;
        producerSelect.options[0].value = 'current';
        
        // Esconder campos por padrão
        if (newProducerFields) {
            newProducerFields.style.display = 'none';
        }
        
        // Adicionar listener para mostrar/esconder campos
        producerSelect.addEventListener('change', function() {
            if (this.value === 'new') {
                // Mostrar campos para novo produtor
                newProducerFields.style.display = 'block';
                
                // Limpar campos
                if (producerNameField) producerNameField.value = '';
                if (displayNameField) displayNameField.value = '';
                if (producerDescField) producerDescField.value = '';
                
                // Tornar campos obrigatórios
                if (producerNameField) producerNameField.required = true;
                
            } else {
                // Esconder campos
                newProducerFields.style.display = 'none';
                
                // Preencher com dados do usuário atual
                if (producerNameField) {
                    producerNameField.value = currentUserName;
                    producerNameField.required = false;
                }
                if (displayNameField) {
                    displayNameField.value = currentUserName;
                }
                if (producerDescField) {
                    producerDescField.value = '';
                }
            }
            
            // Salvar dados
            if (window.saveWizardData) {
                window.saveWizardData();
            }
        });
        
        // Disparar evento change inicial
        producerSelect.dispatchEvent(new Event('change'));
        
        console.log('✅ Fix do produtor aplicado');
    }
});