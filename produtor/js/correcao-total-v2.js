/**
 * CORREÇÃO TOTAL DEFINITIVA - Resolve todos os problemas
 * 1. Dialog com [object Object]
 * 2. Checkbox de termos funcionando
 * 3. Dados completos do wizard incluindo lotes e ingressos
 */

(function() {
    console.log('🚨 CORREÇÃO TOTAL DEFINITIVA - v2');
    
    // ===== 1. CORRIGIR DIALOG [object Object] =====
    
    const alertOriginal = window.customDialog ? window.customDialog.alert : null;
    if (window.customDialog && alertOriginal) {
        window.customDialog.alert = function(message, type) {
            // Se message for objeto, converter para string
            if (typeof message === 'object') {
                message = JSON.stringify(message, null, 2);
            }
            return alertOriginal.call(this, message, type);
        };
    }
    
    // ===== 2. SISTEMA DE CHECKBOX DEFINITIVO =====
    
    // Criar um sistema global de estado do checkbox
    window.termsState = {
        accepted: false
    };
    
    window.addEventListener('DOMContentLoaded', function() {
        console.log('📋 Configurando checkbox de termos...');
        
        const termsDiv = document.getElementById('termsCheckbox');
        if (!termsDiv) {
            console.error('❌ Div termsCheckbox não encontrada!');
            return;
        }
        
        // Verificar estado inicial
        window.termsState.accepted = termsDiv.classList.contains('checked');
        
        // Click handler melhorado
        termsDiv.onclick = function(e) {
            e.stopPropagation();
            
            if (this.classList.contains('checked')) {
                this.classList.remove('checked');
                window.termsState.accepted = false;
                console.log('❌ Termos desmarcados');
            } else {
                this.classList.add('checked');
                window.termsState.accepted = true;
                console.log('✅ Termos marcados');
            }
            
            // Salvar no wizard data
            saveTermsState();
        };
        
        // Label também clicável
        const label = document.querySelector('label[for="termsCheckbox"]');
        if (label) {
            label.style.cursor = 'pointer';
            label.onclick = function(e) {
                if (e.target.tagName !== 'A') {
                    e.preventDefault();
                    termsDiv.click();
                }
            };
        }
    });
    
    // ===== 3. SALVAR DADOS COMPLETOS DO WIZARD =====
    
    window.saveWizardData = function() {
        console.log('💾 Salvando dados COMPLETOS do wizard...');
        
        const wizardData = {
            // Step atual
            currentStep: window.currentStep || 8,
            timestamp: Date.now(),
            
            // Step 1 - Informações básicas
            eventName: document.getElementById('eventTitle')?.value || '',
            classification: document.getElementById('eventType')?.value || '',
            category: document.getElementById('eventCategory')?.value || '',
            
            // Step 2 - Data e Local
            startDateTime: document.getElementById('startDateTime')?.value || '',
            endDateTime: document.getElementById('endDateTime')?.value || '',
            eventLink: document.getElementById('eventLink')?.value || '',
            locationTypeSwitch: document.getElementById('locationTypeSwitch')?.checked || false,
            venueName: document.getElementById('location')?.value || '',
            addressSearch: document.getElementById('address')?.value || '',
            
            // Step 3 - Descrição
            eventDescription: document.getElementById('eventDescription')?.value || '',
            eventImage: document.getElementById('previewImage')?.src || '',
            bannerImage: document.getElementById('bannerPreview')?.src || '',
            
            // Step 4 - Produtor
            producer: document.querySelector('input[name="producerType"]:checked')?.value || 'current',
            producerName: document.getElementById('producerName')?.value || '',
            displayName: document.getElementById('producerName')?.value || '',
            producerDescription: document.getElementById('producerDescription')?.value || '',
            
            // Step 5 - LOTES
            lotes: window.lotesData || { porData: [], porPercentual: [] },
            
            // Step 6 - INGRESSOS
            ingressos: window.ingressosTemporarios || { pagos: [], gratuitos: [], combos: [] },
            
            // Step 7 - Extras
            hasParking: document.getElementById('hasParking')?.checked || false,
            parkingDetails: document.getElementById('parkingDetails')?.value || '',
            hasAccessibility: document.getElementById('hasAccessibility')?.checked || false,
            accessibilityDetails: document.getElementById('accessibilityDetails')?.value || '',
            acceptPix: document.getElementById('acceptPix')?.checked || false,
            acceptCredit: document.getElementById('acceptCredit')?.checked || false,
            acceptDebit: document.getElementById('acceptDebit')?.checked || false,
            acceptBoleto: document.getElementById('acceptBoleto')?.checked || false,
            
            // Step 8 - Termos e taxas
            termsAccepted: window.termsState.accepted,
            taxaPlataforma: document.getElementById('taxaPlataforma')?.value || '10',
            absorverTaxa: document.querySelector('input[name="absorverTaxa"]:checked')?.value || 'cliente',
            visibilidade: document.querySelector('.radio.checked[data-value]')?.getAttribute('data-value') || 'public'
        };
        
        // Salvar SEM encoding
        const jsonString = JSON.stringify(wizardData);
        document.cookie = `eventoWizard=${jsonString}; path=/; max-age=${7*24*60*60}`;
        
        console.log('✅ Dados salvos:', wizardData);
        return wizardData;
    };
    
    // Salvar estado dos termos
    function saveTermsState() {
        const data = window.saveWizardData();
        console.log('✅ Estado dos termos salvo:', data.termsAccepted);
    }
    
    // ===== 4. PUBLICAÇÃO CORRIGIDA =====
    
    window.publishEvent = async function() {
        console.log('🚀 Publicando evento (CORREÇÃO v2)...');
        
        // Verificar termos usando o estado global
        if (!window.termsState.accepted) {
            console.error('❌ Termos não aceitos!');
            
            // Destacar checkbox
            const termsDiv = document.getElementById('termsCheckbox');
            if (termsDiv) {
                termsDiv.style.border = '2px solid #ff0000';
                termsDiv.style.boxShadow = '0 0 5px rgba(255,0,0,0.5)';
                
                setTimeout(() => {
                    termsDiv.style.border = '';
                    termsDiv.style.boxShadow = '';
                }, 3000);
            }
            
            if (window.customDialog) {
                await window.customDialog.alert(
                    'Você precisa aceitar os termos de uso e política de privacidade para continuar.',
                    'warning'
                );
            } else {
                alert('Você precisa aceitar os termos de uso e política de privacidade!');
            }
            
            return false;
        }
        
        console.log('✅ Termos aceitos! Coletando dados...');
        
        try {
            // Coletar todos os dados
            const dadosWizard = window.saveWizardData();
            
            // Formatar para API
            const dadosAPI = {
                // Dados básicos
                nome: dadosWizard.eventName,
                descricao_completa: dadosWizard.eventDescription,
                classificacao: dadosWizard.classification,
                categoria: dadosWizard.category,
                
                // Datas
                data_inicio: formatarDataMySQL(dadosWizard.startDateTime),
                data_fim: formatarDataMySQL(dadosWizard.endDateTime || dadosWizard.startDateTime),
                
                // Local
                tipo_local: dadosWizard.locationTypeSwitch ? 'online' : 'presencial',
                nome_local: dadosWizard.venueName,
                busca_endereco: dadosWizard.addressSearch,
                
                // Produtor
                tipo_produtor: dadosWizard.producer,
                nome_produtor: dadosWizard.producerName,
                
                // Lotes
                lotes: formatarLotesParaAPI(dadosWizard.lotes),
                
                // Ingressos
                ingressos: formatarIngressosParaAPI(dadosWizard.ingressos),
                
                // Extras
                tem_estacionamento: dadosWizard.hasParking ? 'sim' : 'não',
                tem_acessibilidade: dadosWizard.hasAccessibility ? 'sim' : 'não',
                
                // Pagamento
                formas_pagamento: {
                    pix: dadosWizard.acceptPix,
                    cartao_credito: dadosWizard.acceptCredit,
                    cartao_debito: dadosWizard.acceptDebit,
                    boleto: dadosWizard.acceptBoleto
                },
                
                // Outros
                taxa_plataforma: parseFloat(dadosWizard.taxaPlataforma),
                visibilidade: dadosWizard.visibilidade
            };
            
            console.log('📤 Enviando para API:', dadosAPI);
            
            const response = await fetch('/produtor/criaeventoapi.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(dadosAPI)
            });
            
            const textoResposta = await response.text();
            console.log('📥 Resposta:', textoResposta);
            
            let resultado;
            try {
                resultado = JSON.parse(textoResposta);
            } catch (e) {
                throw new Error('Resposta inválida do servidor: ' + textoResposta);
            }
            
            if (resultado.success) {
                console.log('✅ Evento publicado com sucesso!');
                
                // Limpar cookies
                document.cookie = 'eventoWizard=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'lotesData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                
                if (window.customDialog) {
                    await window.customDialog.alert('Evento publicado com sucesso!', 'success');
                }
                
                setTimeout(() => {
                    window.location.href = '/produtor/meuseventos.php';
                }, 1000);
                
                return true;
            } else {
                throw new Error(resultado.message || 'Erro ao publicar');
            }
            
        } catch (error) {
            console.error('❌ Erro:', error);
            if (window.customDialog) {
                await window.customDialog.alert('Erro: ' + error.message, 'error');
            } else {
                alert('Erro: ' + error.message);
            }
            return false;
        }
    };
    
    // Funções auxiliares
    function formatarDataMySQL(dateTime) {
        if (!dateTime) return null;
        const d = new Date(dateTime);
        return d.toISOString().slice(0, 19).replace('T', ' ');
    }
    
    function formatarLotesParaAPI(lotes) {
        const resultado = [];
        
        if (lotes.porData) {
            lotes.porData.forEach(lote => {
                resultado.push({
                    nome: lote.nome,
                    tipo: 'data',
                    data_inicio: formatarDataMySQL(lote.dataInicio),
                    data_fim: formatarDataMySQL(lote.dataFim),
                    publico: lote.divulgar ? 'sim' : 'não'
                });
            });
        }
        
        if (lotes.porPercentual) {
            lotes.porPercentual.forEach(lote => {
                resultado.push({
                    nome: lote.nome,
                    tipo: 'percentual',
                    percentual: lote.percentual,
                    publico: lote.divulgar ? 'sim' : 'não'
                });
            });
        }
        
        return resultado;
    }
    
    function formatarIngressosParaAPI(ingressos) {
        const resultado = [];
        
        if (ingressos.pagos) {
            ingressos.pagos.forEach(ing => {
                resultado.push({
                    tipo: 'individual',
                    nome: ing.title,
                    valor: parseFloat(ing.price),
                    quantidade: parseInt(ing.quantity),
                    lote_id: ing.loteId
                });
            });
        }
        
        if (ingressos.gratuitos) {
            ingressos.gratuitos.forEach(ing => {
                resultado.push({
                    tipo: 'gratuito',
                    nome: ing.title,
                    valor: 0,
                    quantidade: parseInt(ing.quantity),
                    lote_id: ing.loteId
                });
            });
        }
        
        return resultado;
    }
    
    // ===== 5. FUNÇÕES DE DEBUG MELHORADAS =====
    
    window.debugTerms = function() {
        const termsDiv = document.getElementById('termsCheckbox');
        console.log('=== DEBUG TERMOS ===');
        console.log('Div:', termsDiv);
        console.log('Classes:', termsDiv?.className);
        console.log('Estado global:', window.termsState.accepted);
        console.log('Tem classe checked:', termsDiv?.classList.contains('checked'));
        console.log('===================');
    };
    
    window.debugCookies = function() {
        console.log('=== COOKIES COMPLETOS ===');
        const wizardData = window.saveWizardData();
        console.log('Dados salvos:', wizardData);
        console.log('=========================');
    };
    
    window.forceCheckTerms = function() {
        const termsDiv = document.getElementById('termsCheckbox');
        if (termsDiv) {
            termsDiv.classList.add('checked');
            window.termsState.accepted = true;
            saveTermsState();
            console.log('✅ Termos marcados forçadamente');
        }
    };
    
    console.log('✅ CORREÇÃO TOTAL v2 INSTALADA!');
    console.log('📌 Comandos: debugTerms(), debugCookies(), forceCheckTerms()');
    
})();