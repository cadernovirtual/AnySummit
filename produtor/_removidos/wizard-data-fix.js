/**
 * Correção para salvar dados do wizard corretamente
 * Resolve problemas de encoding e estrutura JSON
 */

(function() {
    console.log('🔧 Iniciando correção de salvamento de dados do wizard...');
    
    // Função auxiliar para salvar cookie corretamente
    function setCookieCorretamente(name, value, days) {
        try {
            // Garantir que o valor seja uma string JSON válida
            let jsonString;
            if (typeof value === 'object') {
                jsonString = JSON.stringify(value);
            } else if (typeof value === 'string') {
                // Verificar se já é JSON válido
                try {
                    JSON.parse(value);
                    jsonString = value;
                } catch (e) {
                    // Se não for JSON válido, criar objeto
                    jsonString = JSON.stringify({ data: value });
                }
            } else {
                jsonString = JSON.stringify({ data: value });
            }
            
            // NÃO usar encodeURIComponent - deixar o navegador lidar com isso
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = `${name}=${jsonString};expires=${expires.toUTCString()};path=/`;
            
            console.log(`✅ Cookie ${name} salvo corretamente`);
            return true;
        } catch (error) {
            console.error(`❌ Erro ao salvar cookie ${name}:`, error);
            return false;
        }
    }
    
    // Função para ler cookie corretamente
    function getCookieCorretamente(name) {
        try {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) {
                    const cookieValue = c.substring(nameEQ.length, c.length);
                    
                    // Tentar decodificar se estiver encoded
                    let decodedValue = cookieValue;
                    try {
                        decodedValue = decodeURIComponent(cookieValue);
                    } catch (e) {
                        // Se falhar, usar valor original
                    }
                    
                    // Tentar parsear como JSON
                    try {
                        return JSON.parse(decodedValue);
                    } catch (e) {
                        // Se falhar, retornar string
                        return decodedValue;
                    }
                }
            }
            return null;
        } catch (error) {
            console.error(`❌ Erro ao ler cookie ${name}:`, error);
            return null;
        }
    }
    
    // Sobrescrever saveWizardData para salvar corretamente
    const originalSaveWizardData = window.saveWizardData;
    window.saveWizardData = function() {
        console.log('💾 Salvando dados do wizard (versão corrigida)...');
        
        try {
            // Coletar todos os dados do wizard
            const wizardData = {
                currentStep: window.currentStep || 1,
                timestamp: new Date().toISOString(),
                
                // Step 1 - Informações básicas
                eventType: document.getElementById('eventType')?.value || '',
                eventCategory: document.getElementById('eventCategory')?.value || '',
                eventTitle: document.getElementById('eventTitle')?.value || '',
                
                // Step 2 - Data e Local
                startDateTime: document.getElementById('startDateTime')?.value || '',
                endDateTime: document.getElementById('endDateTime')?.value || '',
                location: document.getElementById('location')?.value || '',
                cep: document.getElementById('cep')?.value || '',
                address: document.getElementById('address')?.value || '',
                addressNumber: document.getElementById('addressNumber')?.value || '',
                addressComplement: document.getElementById('addressComplement')?.value || '',
                neighborhood: document.getElementById('neighborhood')?.value || '',
                city: document.getElementById('city')?.value || '',
                state: document.getElementById('state')?.value || '',
                
                // Step 3 - Descrição e Imagens
                eventDescription: document.getElementById('eventDescription')?.value || '',
                eventImage: document.getElementById('previewImage')?.src || '',
                bannerImage: document.getElementById('bannerPreview')?.src || '',
                
                // Step 4 - Produtor
                producerType: document.querySelector('input[name="producerType"]:checked')?.value || '',
                producerName: document.getElementById('producerName')?.value || '',
                producerDocument: document.getElementById('producerDocument')?.value || '',
                producerEmail: document.getElementById('producerEmail')?.value || '',
                producerPhone: document.getElementById('producerPhone')?.value || '',
                
                // Step 5 - Lotes
                lotes: window.lotesData || { porData: [], porPercentual: [] },
                
                // Step 6 - Ingressos
                ingressos: {
                    pagos: window.ingressosTemporarios?.pagos || [],
                    gratuitos: window.ingressosTemporarios?.gratuitos || [],
                    combos: window.ingressosTemporarios?.combos || []
                },
                
                // Step 7 - Extras
                hasParking: document.getElementById('hasParking')?.checked || false,
                parkingDetails: document.getElementById('parkingDetails')?.value || '',
                hasAccessibility: document.getElementById('hasAccessibility')?.checked || false,
                accessibilityDetails: document.getElementById('accessibilityDetails')?.value || '',
                acceptPix: document.getElementById('acceptPix')?.checked || false,
                acceptCredit: document.getElementById('acceptCredit')?.checked || false,
                acceptDebit: document.getElementById('acceptDebit')?.checked || false,
                acceptBoleto: document.getElementById('acceptBoleto')?.checked || false,
                
                // Step 8 - Revisão (taxas e termos)
                taxaPlataforma: document.getElementById('taxaPlataforma')?.value || '10',
                absorverTaxa: document.querySelector('input[name="absorverTaxa"]:checked')?.value || 'cliente',
                acceptTerms: document.getElementById('acceptTerms')?.checked || false,
                acceptPrivacy: document.getElementById('acceptPrivacy')?.checked || false,
                
                // Dados adicionais
                isEditMode: window.editandoEvento || false,
                eventId: window.eventoId || null
            };
            
            // Salvar no cookie principal
            setCookieCorretamente('eventoWizard', wizardData, 7);
            
            // Salvar dados específicos em cookies separados para backup
            setCookieCorretamente('lotesData', window.lotesData || { porData: [], porPercentual: [] }, 7);
            setCookieCorretamente('ingressosData', wizardData.ingressos, 7);
            
            console.log('✅ Dados do wizard salvos com sucesso!');
            console.log('📊 Dados salvos:', wizardData);
            
            // Chamar função original se existir
            if (originalSaveWizardData && typeof originalSaveWizardData === 'function') {
                try {
                    originalSaveWizardData.call(this);
                } catch (e) {
                    console.warn('Erro ao chamar saveWizardData original:', e);
                }
            }
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar dados do wizard:', error);
            return false;
        }
    };
    
    // Sobrescrever loadWizardData para carregar corretamente
    const originalLoadWizardData = window.loadWizardData;
    window.loadWizardData = function() {
        console.log('📂 Carregando dados do wizard (versão corrigida)...');
        
        try {
            const wizardData = getCookieCorretamente('eventoWizard');
            
            if (wizardData) {
                console.log('✅ Dados do wizard encontrados:', wizardData);
                
                // Restaurar dados nos campos
                if (wizardData.eventType) document.getElementById('eventType').value = wizardData.eventType;
                if (wizardData.eventCategory) document.getElementById('eventCategory').value = wizardData.eventCategory;
                if (wizardData.eventTitle) document.getElementById('eventTitle').value = wizardData.eventTitle;
                // ... continuar para todos os campos ...
                
                // Restaurar lotes
                if (wizardData.lotes) {
                    window.lotesData = wizardData.lotes;
                }
                
                // Restaurar ingressos
                if (wizardData.ingressos) {
                    window.ingressosTemporarios = wizardData.ingressos;
                }
                
                // Chamar função original se existir
                if (originalLoadWizardData && typeof originalLoadWizardData === 'function') {
                    try {
                        originalLoadWizardData.call(this);
                    } catch (e) {
                        console.warn('Erro ao chamar loadWizardData original:', e);
                    }
                }
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Erro ao carregar dados do wizard:', error);
            return false;
        }
    };
    
    // Função para obter dados completos do wizard (para uso no final)
    window.obterDadosCompletosWizard = function() {
        console.log('📊 Obtendo dados completos do wizard...');
        
        // Primeiro salvar tudo
        window.saveWizardData();
        
        // Depois recuperar
        const dados = getCookieCorretamente('eventoWizard');
        
        if (dados) {
            console.log('✅ Dados completos obtidos:', dados);
            return dados;
        } else {
            console.error('❌ Nenhum dado encontrado no cookie!');
            return null;
        }
    };
    
    // Aplicar correções ao carregar
    console.log('✅ Sistema de salvamento corrigido instalado!');
    
    // Salvar dados atuais se houver
    if (document.getElementById('eventTitle')?.value) {
        console.log('💾 Salvando dados existentes...');
        window.saveWizardData();
    }
})();