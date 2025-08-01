/**
 * Melhorias para restauração de dados do wizard
 * Complementa a função restoreWizardData existente
 */

(function() {
    'use strict';
    
    console.log('🔧 Carregando melhorias de restauração...');
    
    // Salvar referência da função original
    const originalRestoreWizardData = window.restoreWizardData;
    
    // Nova função melhorada
    window.restoreWizardData = function(data) {
        console.log('📋 Restaurando dados do wizard (versão melhorada)...');
        console.log('Dados recebidos:', data);
        
        // Chamar função original primeiro
        if (originalRestoreWizardData) {
            originalRestoreWizardData.call(this, data);
        }
        
        // === MELHORIAS DE RESTAURAÇÃO ===
        
        // 1. RESTAURAR IMAGENS E COR DE FUNDO (Step 1)
        setTimeout(() => {
            // Cor de fundo
            if (data.corFundo || data.cor_fundo) {
                const corFundo = data.corFundo || data.cor_fundo;
                const colorInput = document.getElementById('corFundo');
                const colorHex = document.getElementById('corFundoHex');
                const colorPreview = document.getElementById('colorPreview');
                
                if (colorInput) colorInput.value = corFundo;
                if (colorHex) colorHex.value = corFundo;
                if (colorPreview) colorPreview.style.backgroundColor = corFundo;
                
                console.log('✅ Cor de fundo restaurada:', corFundo);
            }
            
            // URLs das imagens
            if (data.uploadedImages) {
                // Logo
                if (data.uploadedImages.logo) {
                    const logoContainer = document.getElementById('logoPreviewContainer');
                    if (logoContainer) {
                        logoContainer.innerHTML = `
                            <img src="${data.uploadedImages.logo}" alt="Logo">
                            <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                        `;
                        const clearBtn = document.getElementById('clearLogo');
                        if (clearBtn) clearBtn.style.display = 'flex';
                    }
                }
                
                // Capa
                if (data.uploadedImages.capa) {
                    const capaContainer = document.getElementById('capaPreviewContainer');
                    if (capaContainer) {
                        capaContainer.innerHTML = `
                            <img src="${data.uploadedImages.capa}" alt="Capa">
                            <div class="upload-text" style="margin-top: 10px;">Clique para alterar</div>
                        `;
                        const clearBtn = document.getElementById('clearCapa');
                        if (clearBtn) clearBtn.style.display = 'flex';
                    }
                }
                
                // Fundo
                if (data.uploadedImages.fundo) {
                    const fundoContainer = document.getElementById('fundoPreviewMain');
                    if (fundoContainer) {
                        fundoContainer.innerHTML = `
                            <img src="${data.uploadedImages.fundo}" alt="Fundo">
                        `;
                        const clearBtn = document.getElementById('clearFundo');
                        if (clearBtn) clearBtn.style.display = 'flex';
                    }
                }
            }
            
            // Atualizar preview também
            if (window.updatePreview) {
                window.updatePreview();
            }
            
        }, 500);
        
        // 2. RESTAURAR DESCRIÇÃO (Step 3)
        if (data.eventDescription || data.descricao) {
            setTimeout(() => {
                const descricao = data.eventDescription || data.descricao;
                const editor = document.getElementById('eventDescription');
                if (editor) {
                    editor.innerHTML = descricao;
                    console.log('✅ Descrição restaurada');
                }
            }, 700);
        }
        
        // 3. RESTAURAR LOTES (Step 5)
        if (data.lotes || data.lotesData) {
            setTimeout(() => {
                console.log('🎫 Restaurando lotes...');
                
                // Garantir que window.lotesData existe
                if (!window.lotesData) {
                    window.lotesData = {
                        porData: [],
                        porPercentual: []
                    };
                }
                
                // Se temos lotes no formato antigo (lotesData)
                if (data.lotesData) {
                    window.lotesData = data.lotesData;
                }
                
                // Se temos lotes no formato novo (array)
                if (data.lotes && Array.isArray(data.lotes)) {
                    // Limpar arrays existentes
                    window.lotesData.porData = [];
                    window.lotesData.porPercentual = [];
                    
                    // Separar lotes por tipo
                    data.lotes.forEach(lote => {
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
                }
                
                // Renderizar lotes na interface
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
                
                console.log('✅ Lotes restaurados:', window.lotesData);
                
            }, 1000);
        }
        
        // 4. MELHORAR RESTAURAÇÃO DE INGRESSOS (Step 6)
        if (data.ingressos && data.ingressos.length > 0) {
            setTimeout(() => {
                console.log('🎟️ Melhorando restauração de ingressos...');
                
                // Garantir que temporaryTickets existe
                if (!window.temporaryTickets) {
                    window.temporaryTickets = new Map();
                }
                
                // Limpar ingressos existentes
                window.temporaryTickets.clear();
                const ticketList = document.getElementById('ticketList');
                if (ticketList) ticketList.innerHTML = '';
                
                // Restaurar cada ingresso
                data.ingressos.forEach((ingresso, index) => {
                    // Criar estrutura compatível com temporary tickets
                    const ticketData = {
                        id: ingresso.id || `temp_${index + 1}`,
                        type: ingresso.tipo || 'pago',
                        title: ingresso.nome || '',
                        description: ingresso.descricao || '',
                        quantity: parseInt(ingresso.quantidade) || 0,
                        price: parseFloat(ingresso.valor) || 0,
                        taxaPlataforma: parseFloat(ingresso.taxa) || 0,
                        maxLimit: parseInt(ingresso.por_pessoa) || 1,
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
                    if (window.addTicketToList) {
                        window.addTicketToList(
                            ticketData.type,
                            ticketData.title,
                            ticketData.quantity,
                            ticketData.price,
                            ticketData.description,
                            '', // saleStart
                            '', // saleEnd
                            1, // minLimit
                            ticketData.maxLimit,
                            1, // cobrarTaxa
                            ticketData.taxaPlataforma,
                            0, // valorReceber
                            ticketData.loteId
                        );
                    }
                });
                
                console.log('✅ Ingressos melhorados:', window.temporaryTickets);
                
            }, 1500);
        }
        
        console.log('✅ Restauração melhorada concluída');
    };
    
    console.log('✅ Melhorias de restauração carregadas!');
    
})();
