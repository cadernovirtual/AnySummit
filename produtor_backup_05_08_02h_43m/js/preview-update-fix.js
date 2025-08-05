// Correções para atualização do preview durante o wizard
// Garante que todas as informações sejam atualizadas em tempo real

(function() {
    console.log('🔧 Aplicando correções para preview do wizard...');
    
    // Função completa para atualizar preview
    window.updatePreview = function() {
        console.log('🎨 Atualizando preview...');
        
        // Elementos do preview
        const previewTitle = document.getElementById('previewTitle');
        const previewDescription = document.getElementById('previewDescription');
        const previewDate = document.getElementById('previewDate');
        const previewLocation = document.getElementById('previewLocation');
        const previewCategory = document.getElementById('previewCategory');
        const previewType = document.getElementById('previewType');
        
        // Se não encontrar os elementos, tentar buscar na seção de preview
        const previewContent = document.querySelector('.preview-content');
        if (!previewContent) {
            console.warn('Preview content não encontrado');
            return;
        }
        
        // Obter valores dos campos
        const eventName = document.getElementById('eventName')?.value || 'Nome do evento';
        const startDateTime = document.getElementById('startDateTime')?.value;
        const endDateTime = document.getElementById('endDateTime')?.value;
        const category = document.getElementById('category')?.value;
        const venueName = document.getElementById('venueName')?.value;
        const eventLink = document.getElementById('eventLink')?.value;
        const isPresential = document.getElementById('locationTypeSwitch')?.classList.contains('active');
        
        // Obter descrição do editor rico
        const richEditor = document.getElementById('eventDescription');
        let description = '';
        if (richEditor) {
            // Pegar texto sem HTML
            description = richEditor.textContent || richEditor.innerText || '';
        }
        
        // Atualizar título
        if (previewTitle) {
            previewTitle.textContent = eventName;
        }
        
        // Atualizar descrição
        if (previewDescription) {
            if (description) {
                // Limitar a 150 caracteres
                const maxLength = 150;
                if (description.length > maxLength) {
                    previewDescription.textContent = description.substring(0, maxLength) + '...';
                } else {
                    previewDescription.textContent = description;
                }
            } else {
                previewDescription.textContent = 'Descrição do evento aparecerá aqui...';
            }
        }
        
        // Atualizar data
        if (previewDate) {
            if (startDateTime) {
                const startDateObj = new Date(startDateTime);
                let dateText = startDateObj.toLocaleDateString('pt-BR', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }) + ' às ' + startDateObj.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                // Adicionar data de fim se existir
                if (endDateTime) {
                    const endDateObj = new Date(endDateTime);
                    // Se for no mesmo dia, mostrar apenas horário final
                    if (startDateObj.toDateString() === endDateObj.toDateString()) {
                        dateText += ' - ' + endDateObj.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    } else {
                        // Dias diferentes, mostrar data completa
                        dateText += ' até ' + endDateObj.toLocaleDateString('pt-BR', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short'
                        }) + ' às ' + endDateObj.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    }
                }
                
                previewDate.textContent = dateText;
            } else {
                previewDate.textContent = 'Data não definida';
            }
        }
        
        // Atualizar local
        if (previewLocation) {
            if (isPresential && venueName) {
                // Evento presencial
                const street = document.getElementById('street')?.value;
                const number = document.getElementById('number')?.value;
                const city = document.getElementById('city')?.value;
                const state = document.getElementById('state')?.value;
                
                let locationText = venueName;
                
                // Adicionar endereço se disponível
                if (city && state) {
                    locationText += ` - ${city}/${state}`;
                }
                
                previewLocation.textContent = locationText;
            } else if (!isPresential && eventLink) {
                // Evento online
                previewLocation.textContent = 'Evento Online';
            } else {
                previewLocation.textContent = 'Local não definido';
            }
        }
        
        // Atualizar categoria
        if (previewCategory && category) {
            // Mapear valores de categoria para texto amigável
            const categoryMap = {
                'show': 'Show',
                'teatro': 'Teatro',
                'curso': 'Curso',
                'workshop': 'Workshop',
                'palestra': 'Palestra',
                'festa': 'Festa',
                'esporte': 'Esporte',
                'outros': 'Outros'
            };
            
            const categoryText = categoryMap[category] || category;
            previewCategory.textContent = categoryText;
        }
        
        // Atualizar tipo (presencial/online)
        if (previewType) {
            previewType.textContent = isPresential ? 'Presencial' : 'Online';
        }
        
        // Atualizar preview hero se existir
        if (window.updateHeroPreview) {
            window.updateHeroPreview(eventName, startDateTime, venueName, eventLink, isPresential);
        }
        
        console.log('✅ Preview atualizado');
    };
    
    // Adicionar listeners para atualizar preview em tempo real
    document.addEventListener('DOMContentLoaded', function() {
        // Lista de campos que devem atualizar o preview
        const fieldsToWatch = [
            'eventName',
            'eventDescription',
            'startDateTime',
            'endDateTime',
            'category',
            'venueName',
            'eventLink',
            'street',
            'number',
            'city',
            'state'
        ];
        
        // Adicionar listener para cada campo
        fieldsToWatch.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                // Para campos de texto
                field.addEventListener('input', window.updatePreview);
                field.addEventListener('change', window.updatePreview);
                
                // Para o editor rico
                if (fieldId === 'eventDescription') {
                    // Observar mudanças no conteúdo
                    const observer = new MutationObserver(window.updatePreview);
                    observer.observe(field, {
                        childList: true,
                        subtree: true,
                        characterData: true
                    });
                }
            }
        });
        
        // Listener para o switch de tipo de evento
        const locationSwitch = document.getElementById('locationTypeSwitch');
        if (locationSwitch) {
            locationSwitch.addEventListener('click', function() {
                setTimeout(window.updatePreview, 100);
            });
        }
        
        // Atualizar preview inicial
        setTimeout(window.updatePreview, 100);
    });
    
    console.log('✅ Correções de preview aplicadas com sucesso!');
})();
