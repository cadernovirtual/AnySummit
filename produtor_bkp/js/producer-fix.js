// Correção definitiva para campos do novo produtor
(function() {
    console.log('🔧 Aplicando correção para campos do produtor...');
    
    // Função para configurar o produtor
    function setupProducerFields() {
        const producerSelect = document.getElementById('producer');
        const newProducerFields = document.getElementById('newProducerFields');
        
        if (!producerSelect || !newProducerFields) {
            console.log('❌ Elementos do produtor não encontrados');
            return;
        }
        
        console.log('✅ Elementos encontrados:', {
            select: producerSelect,
            fields: newProducerFields
        });
        
        // Função para atualizar visibilidade
        function updateFields() {
            const isNew = producerSelect.value === 'new';
            console.log('🔄 Produtor selecionado:', producerSelect.value, 'É novo?', isNew);
            
            if (isNew) {
                newProducerFields.style.display = 'block';
                newProducerFields.classList.add('show');
                
                // Tornar campos obrigatórios
                const nameField = document.getElementById('producerName');
                const displayField = document.getElementById('displayName');
                
                if (nameField) nameField.required = true;
                if (displayField) displayField.required = true;
                
                console.log('✅ Campos do novo produtor exibidos e obrigatórios');
            } else {
                newProducerFields.style.display = 'none';
                newProducerFields.classList.remove('show');
                
                // Remover obrigatoriedade
                const nameField = document.getElementById('producerName');
                const displayField = document.getElementById('displayName');
                
                if (nameField) {
                    nameField.required = false;
                    nameField.value = '';
                }
                if (displayField) {
                    displayField.required = false;
                    displayField.value = '';
                }
                
                const descField = document.getElementById('producerDescription');
                if (descField) descField.value = '';
                
                console.log('❌ Campos do novo produtor ocultados');
            }
        }
        
        // Adicionar evento
        producerSelect.addEventListener('change', updateFields);
        
        // Verificar estado inicial
        updateFields();
        
        console.log('✅ Setup do produtor concluído');
    }
    
    // Aguardar DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupProducerFields);
    } else {
        setupProducerFields();
    }
    
    // Também tentar após um delay
    setTimeout(setupProducerFields, 1000);
    
})();