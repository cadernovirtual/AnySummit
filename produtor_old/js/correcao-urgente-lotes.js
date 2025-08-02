/**
 * CORREÇÃO URGENTE - Renderização de Lotes
 * Resolve problema de lotes não aparecendo na tela
 */

(function() {
    console.log('🚨 CORREÇÃO URGENTE - Renderização de Lotes');
    
    // Aguardar um pouco para garantir que tudo carregou
    setTimeout(function() {
        
        // ===== CORREÇÃO 1: FORÇAR RENDERIZAÇÃO APÓS CRIAR LOTE =====
        const criarLoteDataOriginal = window.criarLoteData;
        window.criarLoteData = function() {
            console.log('📅 Criando lote por data (CORREÇÃO URGENTE)...');
            
            // Chamar função original se existir
            if (criarLoteDataOriginal) {
                criarLoteDataOriginal.call(this);
            }
            
            // FORÇAR RENDERIZAÇÃO
            console.log('🔄 FORÇANDO RENDERIZAÇÃO...');
            if (window.renderizarLotesPorData) {
                window.renderizarLotesPorData();
            }
            
            // Garantir que apareça na tela
            atualizarTelaLotes();
        };
        
        const criarLotePercentualOriginal = window.criarLotePercentual;
        window.criarLotePercentual = function() {
            console.log('📊 Criando lote percentual (CORREÇÃO URGENTE)...');
            
            // Chamar função original se existir
            if (criarLotePercentualOriginal) {
                criarLotePercentualOriginal.call(this);
            }
            
            // FORÇAR RENDERIZAÇÃO
            console.log('🔄 FORÇANDO RENDERIZAÇÃO...');
            if (window.renderizarLotesPorPercentual) {
                window.renderizarLotesPorPercentual();
            }
            
            // Garantir que apareça na tela
            atualizarTelaLotes();
        };
        
        // ===== FUNÇÃO PARA ATUALIZAR TELA IMEDIATAMENTE =====
        function atualizarTelaLotes() {
            console.log('🖼️ ATUALIZANDO TELA DE LOTES...');
            console.log('Lotes por data:', window.lotesData?.porData);
            console.log('Lotes por percentual:', window.lotesData?.porPercentual);
            
            // LOTES POR DATA
            const containerData = document.getElementById('lotesPorDataList');
            const emptyData = document.getElementById('loteDataEmpty');
            
            if (containerData) {
                containerData.innerHTML = '';
                
                if (window.lotesData && window.lotesData.porData && window.lotesData.porData.length > 0) {
                    // Esconder empty state
                    if (emptyData) emptyData.style.display = 'none';
                    
                    // Renderizar cada lote
                    window.lotesData.porData.forEach(function(lote) {
                        const div = document.createElement('div');
                        div.className = 'lote-item';
                        div.setAttribute('data-id', lote.id);
                        
                        const dataInicio = new Date(lote.dataInicio).toLocaleString('pt-BR');
                        const dataFim = new Date(lote.dataFim).toLocaleString('pt-BR');
                        
                        div.innerHTML = `
                            <div class="lote-item-info">
                                <div class="lote-item-name">${lote.nome}</div>
                                <div class="lote-item-details">
                                    ${dataInicio} até ${dataFim}
                                    ${lote.divulgar ? ' • Critério público' : ' • Critério oculto'}
                                </div>
                            </div>
                            <div class="lote-item-actions">
                                <button class="btn-icon delete" onclick="excluirLote(${lote.id}, 'data')" title="Excluir">🗑️</button>
                            </div>
                        `;
                        
                        containerData.appendChild(div);
                        console.log('✅ Lote por data renderizado:', lote.nome);
                    });
                } else {
                    // Mostrar empty state
                    if (emptyData) emptyData.style.display = 'block';
                }
            }
            
            // LOTES POR PERCENTUAL
            const containerPercentual = document.getElementById('lotesPorPercentualList');
            const emptyPercentual = document.getElementById('lotePercentualEmpty');
            
            if (containerPercentual) {
                containerPercentual.innerHTML = '';
                
                if (window.lotesData && window.lotesData.porPercentual && window.lotesData.porPercentual.length > 0) {
                    // Esconder empty state
                    if (emptyPercentual) emptyPercentual.style.display = 'none';
                    
                    // Renderizar cada lote
                    window.lotesData.porPercentual.forEach(function(lote) {
                        const div = document.createElement('div');
                        div.className = 'lote-item';
                        div.setAttribute('data-id', lote.id);
                        
                        div.innerHTML = `
                            <div class="lote-item-info">
                                <div class="lote-item-name">${lote.nome}</div>
                                <div class="lote-item-details">
                                    Encerra aos ${lote.percentual}% das vendas
                                    ${lote.divulgar ? ' • Critério público' : ' • Critério oculto'}
                                </div>
                            </div>
                            <div class="lote-item-actions">
                                <button class="btn-icon delete" onclick="excluirLote(${lote.id}, 'percentual')" title="Excluir">🗑️</button>
                            </div>
                        `;
                        
                        containerPercentual.appendChild(div);
                        console.log('✅ Lote percentual renderizado:', lote.nome);
                    });
                } else {
                    // Mostrar empty state
                    if (emptyPercentual) emptyPercentual.style.display = 'block';
                }
            }
            
            console.log('✅ TELA ATUALIZADA!');
        }
        
        // Tornar global para uso em outros lugares
        window.atualizarTelaLotes = atualizarTelaLotes;
        
        // ===== CORREÇÃO DO SCROLL =====
        // Remover overflow desnecessário que pode estar causando scroll
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        
        // Verificar se há algum modal com backdrop causando scroll
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(function(backdrop) {
            if (!backdrop.nextElementSibling || !backdrop.nextElementSibling.classList.contains('show')) {
                backdrop.remove();
                console.log('🧹 Backdrop órfão removido');
            }
        });
        
        // ===== ATUALIZAR TELA AGORA SE JÁ HOUVER LOTES =====
        if (window.lotesData && (window.lotesData.porData?.length > 0 || window.lotesData.porPercentual?.length > 0)) {
            console.log('🔄 Lotes existentes encontrados, atualizando tela...');
            atualizarTelaLotes();
        }
        
        console.log('✅ CORREÇÃO URGENTE APLICADA!');
        
    }, 1000);
    
})();