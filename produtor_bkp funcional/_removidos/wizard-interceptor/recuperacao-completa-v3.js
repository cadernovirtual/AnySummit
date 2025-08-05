/**
 * Sistema completo de recuperação de dados v3
 * Corrige TODOS os problemas de recuperação
 */

(function() {
    'use strict';
    
    console.log('🔄 Sistema de recuperação v3 iniciando...');
    
    // Override da função checkAndRestoreWizardDataUnified
    const originalRestore = window.checkAndRestoreWizardDataUnified;
    
    window.checkAndRestoreWizardDataUnified = function() {
        console.log('🎯 Recuperação v3 interceptada');
        
        // Chamar original primeiro
        if (originalRestore) {
            originalRestore.apply(this, arguments);
        }
        
        // Esperar um pouco e aplicar recuperação completa
        setTimeout(() => {
            recuperarDadosCompletos();
        }, 1000);
    };
    
    // Função principal de recuperação
    function recuperarDadosCompletos() {
        console.log('📂 Iniciando recuperação completa...');
        
        // 1. Buscar dados do wizardDataCollector
        const dadosCollector = localStorage.getItem('wizardCollectedData');
        if (!dadosCollector) {
            console.log('❌ Nenhum dado do collector encontrado');
            return;
        }
        
        try {
            const data = JSON.parse(dadosCollector);
            const dados = data.dados;
            
            console.log('✅ Dados encontrados:', dados);
            
            // ETAPA 1 - Imagens e Cor
            recuperarEtapa1(dados);
            
            // ETAPA 3 - Descrição
            recuperarEtapa3(dados);
            
            // ETAPA 5 - Localização completa
            recuperarEtapa5(dados);
            
            // ETAPA 6 - Lotes
            recuperarEtapa6(dados);
            
            // ETAPA 7 - Ingressos
            recuperarEtapa7(dados);
            
            console.log('✅ Recuperação completa finalizada!');
            
        } catch (e) {
            console.error('Erro ao recuperar dados:', e);
        }
    }
    
    // ETAPA 1 - Imagens e Cor
    function recuperarEtapa1(dados) {
        console.log('🖼️ Recuperando Etapa 1 - Imagens e Cor...');
        
        // Cor de fundo
        if (dados.cor_fundo) {
            const colorInput = document.getElementById('corFundo');
            const colorHex = document.getElementById('corFundoHex');
            const colorPreview = document.getElementById('colorPreview');
            
            if (colorInput) colorInput.value = dados.cor_fundo;
            if (colorHex) colorHex.value = dados.cor_fundo;
            if (colorPreview) colorPreview.style.backgroundColor = dados.cor_fundo;
            
            // Aplicar ao preview
            const previewBg = document.querySelector('.event-preview');
            if (previewBg) previewBg.style.backgroundColor = dados.cor_fundo;
            
            console.log('✅ Cor aplicada:', dados.cor_fundo);
        }
        
        // Logo
        if (dados.logo_url) {
            const logoContainer = document.getElementById('logoPreviewContainer');
            if (logoContainer) {
                logoContainer.innerHTML = `
                    <img src="${dados.logo_url}" alt="Logo" style="max-width: 100%; max-height: 100%;">
                    <div class="upload-text" style="display: none;">Clique para alterar</div>
                `;
                
                // Mostrar botão de limpar
                const clearBtn = document.getElementById('clearLogo');
                if (clearBtn) clearBtn.style.display = 'flex';
                
                // Aplicar ao preview
                const previewLogo = document.querySelector('.preview-logo img');
                if (previewLogo) previewLogo.src = dados.logo_url;
            }
            
            // Salvar em uploadedImages
            if (!window.uploadedImages) window.uploadedImages = {};
            window.uploadedImages.logo = dados.logo_url;
        }
        
        // Capa
        if (dados.capa_url) {
            const capaContainer = document.getElementById('capaPreviewContainer');
            if (capaContainer) {
                capaContainer.innerHTML = `
                    <img src="${dados.capa_url}" alt="Capa" style="max-width: 100%; max-height: 100%;">
                    <div class="upload-text" style="display: none;">Clique para alterar</div>
                `;
                
                const clearBtn = document.getElementById('clearCapa');
                if (clearBtn) clearBtn.style.display = 'flex';
                
                // Aplicar ao preview
                const previewCapa = document.querySelector('.preview-image img');
                if (previewCapa) previewCapa.src = dados.capa_url;
            }
            
            if (!window.uploadedImages) window.uploadedImages = {};
            window.uploadedImages.capa = dados.capa_url;
        }
        
        // Fundo
        if (dados.fundo_url) {
            const fundoContainer = document.getElementById('fundoPreviewMain');
            if (fundoContainer) {
                fundoContainer.innerHTML = `
                    <img src="${dados.fundo_url}" alt="Fundo" style="width: 100%; height: 100%; object-fit: cover;">
                `;
                
                const clearBtn = document.getElementById('clearFundo');
                if (clearBtn) clearBtn.style.display = 'flex';
                
                // Aplicar ao preview
                const previewBg = document.querySelector('.event-preview');
                if (previewBg) {
                    previewBg.style.backgroundImage = `url(${dados.fundo_url})`;
                    previewBg.style.backgroundSize = 'cover';
                    previewBg.style.backgroundPosition = 'center';
                }
            }
            
            if (!window.uploadedImages) window.uploadedImages = {};
            window.uploadedImages.fundo = dados.fundo_url;
        }
        
        // Forçar atualização do preview
        if (window.updatePreview) {
            setTimeout(() => window.updatePreview(), 100);
        }
    }
    
    // ETAPA 3 - Descrição
    function recuperarEtapa3(dados) {
        console.log('📝 Recuperando Etapa 3 - Descrição...');
        
        if (dados.descricao) {
            const editor = document.getElementById('eventDescription');
            if (editor) {
                editor.innerHTML = dados.descricao;
                console.log('✅ Descrição restaurada');
            }
        }
    }
    
    // ETAPA 5 - Localização
    function recuperarEtapa5(dados) {
        console.log('📍 Recuperando Etapa 5 - Localização completa...');
        
        // Todos os campos de endereço
        const campos = {
            'venueName': dados.nome_local,
            'addressSearch': `${dados.rua}, ${dados.numero} - ${dados.bairro}, ${dados.cidade} - ${dados.estado}`,
            'cep': dados.cep,
            'street': dados.rua,
            'number': dados.numero,
            'complement': dados.complemento,
            'neighborhood': dados.bairro,
            'city': dados.cidade,
            'state': dados.estado
        };
        
        for (const [id, valor] of Object.entries(campos)) {
            const campo = document.getElementById(id);
            if (campo && valor) {
                campo.value = valor;
                console.log(`✅ ${id}: ${valor}`);
            }
        }
    }
    
    // ETAPA 6 - Lotes
    function recuperarEtapa6(dados) {
        console.log('🎫 Recuperando Etapa 6 - Lotes...');
        
        if (!dados.lotes || dados.lotes.length === 0) {
            console.log('❌ Nenhum lote para recuperar');
            return;
        }
        
        // Garantir estrutura
        if (!window.lotesData) {
            window.lotesData = {
                porData: [],
                porPercentual: []
            };
        }
        
        // Limpar lotes existentes
        window.lotesData.porData = [];
        window.lotesData.porPercentual = [];
        
        // Processar cada lote
        dados.lotes.forEach(lote => {
            if (lote.tipo === 'data') {
                window.lotesData.porData.push({
                    id: lote.id,
                    nome: lote.nome,
                    dataInicio: lote.data_inicio,
                    dataFim: lote.data_fim,
                    divulgar: lote.divulgar || false
                });
            } else if (lote.tipo === 'percentual') {
                window.lotesData.porPercentual.push({
                    id: lote.id,
                    nome: lote.nome,
                    percentual: lote.percentual,
                    divulgar: lote.divulgar || false
                });
            }
        });
        
        // Renderizar
        if (window.renderizarLotesPorData) {
            window.renderizarLotesPorData();
        }
        if (window.renderizarLotesPorPercentual) {
            window.renderizarLotesPorPercentual();
        }
        
        // Salvar no cookie
        if (window.salvarLotesNoCookie) {
            window.salvarLotesNoCookie();
        }
        
        // Adicionar listener para quando entrar no step 5
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.dataset && target.dataset.step === '5' && target.classList.contains('active')) {
                        console.log('📍 Entrou no step 5 - renderizando lotes');
                        setTimeout(() => {
                            if (window.renderizarLotesPorData) window.renderizarLotesPorData();
                            if (window.renderizarLotesPorPercentual) window.renderizarLotesPorPercentual();
                        }, 100);
                    }
                }
            });
        });
        
        // Observar mudanças no step
        const stepElement = document.querySelector('[data-step="5"]');
        if (stepElement) {
            observer.observe(stepElement, { attributes: true });
        }
        
        console.log('✅ Lotes restaurados:', window.lotesData);
    }
    
    // ETAPA 7 - Ingressos
    function recuperarEtapa7(dados) {
        console.log('🎟️ Recuperando Etapa 7 - Ingressos...');
        
        if (!dados.ingressos || dados.ingressos.length === 0) {
            console.log('❌ Nenhum ingresso para recuperar');
            return;
        }
        
        // Limpar ingressos existentes
        if (!window.temporaryTickets) {
            window.temporaryTickets = new Map();
        } else {
            window.temporaryTickets.clear();
        }
        
        // Limpar lista visual
        const ticketList = document.getElementById('ticketList');
        if (ticketList) ticketList.innerHTML = '';
        
        // Processar cada ingresso
        dados.ingressos.forEach(ingresso => {
            // Criar estrutura do ingresso
            const ticketData = {
                id: ingresso.id,
                type: ingresso.tipo === 'pago' ? 'paid' : ingresso.tipo === 'gratuito' ? 'free' : 'combo',
                title: ingresso.nome,
                description: ingresso.descricao,
                quantity: parseInt(ingresso.quantidade) || 0,
                price: parseFloat(ingresso.valor) || 0,
                taxaPlataforma: parseFloat(ingresso.taxa) || 0,
                minLimit: parseInt(ingresso.qtd_minima_por_pessoa) || 1,
                maxLimit: parseInt(ingresso.qtd_maxima_por_pessoa) || 5,
                loteId: ingresso.lote_id || '',
                isTemporary: true
            };
            
            // Se for combo, adicionar dados do combo
            if (ingresso.tipo === 'combo' && ingresso.conteudo_combo) {
                ticketData.comboData = [];
                for (const [ticketId, quantity] of Object.entries(ingresso.conteudo_combo)) {
                    ticketData.comboData.push({
                        ticketId: ticketId,
                        quantity: quantity
                    });
                }
            }
            
            // Adicionar ao Map
            window.temporaryTickets.set(ticketData.id, ticketData);
            
            // Renderizar na interface
            if (window.addTicketToCreationList) {
                window.addTicketToCreationList(
                    ticketData.type,
                    ticketData.title,
                    ticketData.quantity,
                    ticketData.price,
                    ticketData.description,
                    '', // saleStart
                    '', // saleEnd
                    ticketData.minLimit,
                    ticketData.maxLimit,
                    true, // cobrarTaxa
                    ticketData.taxaPlataforma,
                    0, // valorReceber
                    ticketData.loteId
                );
            }
        });
        
        console.log('✅ Ingressos restaurados:', window.temporaryTickets);
    }
    
    // Comando manual
    window.recuperarTudo = recuperarDadosCompletos;
    
    console.log('✅ Sistema de recuperação v3 carregado!');
    console.log('💡 Use recuperarTudo() para recuperação manual');
    
})();
