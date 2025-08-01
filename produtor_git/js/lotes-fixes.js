/**
 * Correções para os problemas identificados nos lotes
 */

// 1. CORRIGIR BOTÕES COM EMOJIS
(function() {
    // Override da função renderizarLotesPorData
    if (window.AnySummit && window.AnySummit.Lotes) {
        window.AnySummit.Lotes.renderizarLotesPorData = function() {
            const container = document.getElementById('lotesPorDataList');
            const emptyState = document.getElementById('loteDataEmpty');
            
            if (!container) return;
            
            // Esconder/mostrar empty state
            if (emptyState) {
                emptyState.style.display = (!window.lotesData?.porData?.length) ? 'block' : 'none';
            }
            
            container.innerHTML = '';
            
            if (!window.lotesData?.porData?.length) {
                return;
            }
            
            window.lotesData.porData.forEach(lote => {
                const dataInicioFormatada = new Date(lote.dataInicio).toLocaleString('pt-BR');
                const dataFimFormatada = new Date(lote.dataFim).toLocaleString('pt-BR');
                
                const loteEl = document.createElement('div');
                loteEl.className = 'lote-item';
                loteEl.setAttribute('data-id', lote.id);
                loteEl.innerHTML = `
                    <div class="lote-item-info">
                        <div class="lote-item-name">${lote.nome}</div>
                        <div class="lote-item-details">
                            ${dataInicioFormatada} até ${dataFimFormatada}
                            ${lote.divulgar ? ' • Critério público' : ' • Critério oculto'}
                        </div>
                    </div>
                    <div class="lote-item-actions">
                        <button type="button" onclick="editarLoteData('${lote.id}')" title="Editar" style="background: none; border: none; font-size: 20px; cursor: pointer; padding: 5px;">
                            ✏️
                        </button>
                        <button type="button" onclick="excluirLoteData('${lote.id}')" title="Excluir" style="background: none; border: none; font-size: 20px; cursor: pointer; padding: 5px;">
                            🗑️
                        </button>
                    </div>
                `;
                container.appendChild(loteEl);
            });
        };
        
        window.AnySummit.Lotes.renderizarLotesPorPercentual = function() {
            const container = document.getElementById('lotesPorPercentualList');
            const emptyState = document.getElementById('lotePercentualEmpty');
            const summary = document.getElementById('percentualSummary');
            
            if (!container) return;
            
            // Esconder/mostrar empty state
            if (emptyState) {
                emptyState.style.display = (!window.lotesData?.porPercentual?.length) ? 'block' : 'none';
            }
            
            container.innerHTML = '';
            
            if (!window.lotesData?.porPercentual?.length) {
                if (summary) summary.style.display = 'none';
                return;
            }
            
            let totalPercentual = 0;
            
            window.lotesData.porPercentual.forEach(lote => {
                totalPercentual += parseInt(lote.percentual);
                
                const loteEl = document.createElement('div');
                loteEl.className = 'lote-item';
                loteEl.setAttribute('data-id', lote.id);
                loteEl.innerHTML = `
                    <div class="lote-item-info">
                        <div class="lote-item-name">${lote.nome}</div>
                        <div class="lote-item-details">
                            ${lote.percentual}% das vendas
                            ${lote.divulgar ? ' • Critério público' : ' • Critério oculto'}
                        </div>
                    </div>
                    <div class="lote-item-actions">
                        <button type="button" onclick="editarLotePercentual('${lote.id}')" title="Editar" style="background: none; border: none; font-size: 20px; cursor: pointer; padding: 5px;">
                            ✏️
                        </button>
                        <button type="button" onclick="excluirLotePercentual('${lote.id}')" title="Excluir" style="background: none; border: none; font-size: 20px; cursor: pointer; padding: 5px;">
                            🗑️
                        </button>
                    </div>
                `;
                container.appendChild(loteEl);
            });
            
            // Atualizar summary
            if (summary) {
                summary.style.display = 'block';
                const totalEl = document.getElementById('totalPercentual');
                const restanteEl = document.getElementById('restantePercentual');
                if (totalEl) totalEl.textContent = totalPercentual + '%';
                if (restanteEl) restanteEl.textContent = (100 - totalPercentual) + '%';
            }
        };
    }
})();

// 2. CORRIGIR FUNÇÃO DE EXCLUSÃO (usar confirm simples)
window.AnySummit.Lotes.excluirLote = function(loteId) {
    console.log('[Lotes] Tentando excluir:', loteId);
    
    // Verifica se há ingressos no lote
    const ingressosNoLote = this.verificarIngressosNoLote(loteId);
    
    if (ingressosNoLote.length > 0) {
        const msg = `Este lote possui ${ingressosNoLote.length} ingresso(s) associado(s):\n\n` +
            ingressosNoLote.map(i => `- ${i.nome}`).join('\n') +
            '\n\nRemova os ingressos antes de excluir o lote.';
        
        alert(msg);
        return;
    }
    
    // Confirma exclusão
    if (!confirm('Tem certeza que deseja excluir este lote?')) {
        return;
    }
    
    // Remove lote
    if (loteId.startsWith('lote_data_')) {
        window.lotesData.porData = window.lotesData.porData.filter(l => l.id !== loteId);
        this.renderizarLotesPorData();
    } else {
        window.lotesData.porPercentual = window.lotesData.porPercentual.filter(l => l.id !== loteId);
        this.renderizarLotesPorPercentual();
    }
    
    // Renomeia e salva
    this.renomearLotesAutomaticamente();
    if (window.AnySummit.Storage) {
        window.AnySummit.Storage.saveLotes();
    }
    
    console.log('[Lotes] Lote excluído:', loteId);
};

// 3. CORRIGIR NOMENCLATURA DOS LOTES (sequências separadas)
window.AnySummit.Lotes.renomearLotesAutomaticamente = function() {
    console.log('[Lotes] Renomeando lotes automaticamente');
    
    // Renomeia lotes por data (sequência própria)
    if (window.lotesData?.porData) {
        window.lotesData.porData.forEach((lote, index) => {
            lote.nome = `${index + 1}º Lote`;
        });
    }
    
    // Renomeia lotes por percentual (sequência própria)
    if (window.lotesData?.porPercentual) {
        window.lotesData.porPercentual.forEach((lote, index) => {
            lote.nome = `${index + 1}º Lote`;
        });
    }
};

// 4. VALIDAR INTERSECÇÃO DE DATAS
window.AnySummit.Lotes.validarInterseccaoDatas = function(novaDataInicio, novaDataFim, loteIdExcluir) {
    const inicio = new Date(novaDataInicio);
    const fim = new Date(novaDataFim);
    
    for (let lote of window.lotesData.porData) {
        // Pula o lote sendo editado
        if (loteIdExcluir && lote.id === loteIdExcluir) continue;
        
        const loteInicio = new Date(lote.dataInicio);
        const loteFim = new Date(lote.dataFim);
        
        // Verifica intersecção
        if (
            (inicio >= loteInicio && inicio <= loteFim) || // Início dentro de outro lote
            (fim >= loteInicio && fim <= loteFim) || // Fim dentro de outro lote
            (inicio <= loteInicio && fim >= loteFim) // Engloba outro lote
        ) {
            return {
                valido: false,
                loteConflito: lote.nome,
                mensagem: `As datas conflitam com o ${lote.nome} (${new Date(lote.dataInicio).toLocaleString('pt-BR')} até ${new Date(lote.dataFim).toLocaleString('pt-BR')})`
            };
        }
    }
    
    return { valido: true };
};

// Adicionar validação ao criar lote
const criarLoteDataOriginal = window.AnySummit.Lotes.criarLoteData;
window.AnySummit.Lotes.criarLoteData = function() {
    const dataInicio = document.getElementById('loteDataInicio')?.value;
    const dataFim = document.getElementById('loteDataFim')?.value;
    
    if (dataInicio && dataFim) {
        const validacao = this.validarInterseccaoDatas(dataInicio, dataFim);
        if (!validacao.valido) {
            alert(validacao.mensagem);
            return;
        }
    }
    
    return criarLoteDataOriginal.apply(this, arguments);
};

// 5. VALIDAR LOTES PERCENTUAIS (pelo menos um com 100%)
window.AnySummit.Lotes.validarLotesPercentuais = function() {
    if (!window.lotesData?.porPercentual?.length) {
        return true; // Se não há lotes percentuais, está OK
    }
    
    const totalPercentual = window.lotesData.porPercentual.reduce((sum, lote) => 
        sum + parseInt(lote.percentual), 0);
    
    return totalPercentual === 100;
};

// Adicionar validação ao step 5
const validateStep5Original = window.AnySummit.Wizard.validateStep5;
window.AnySummit.Wizard.validateStep5 = function() {
    // Validação original
    const result = validateStep5Original ? validateStep5Original.call(this) : true;
    if (!result) return false;
    
    // Validar lotes percentuais
    if (window.lotesData?.porPercentual?.length > 0) {
        if (!window.AnySummit.Lotes.validarLotesPercentuais()) {
            const total = window.lotesData.porPercentual.reduce((sum, lote) => 
                sum + parseInt(lote.percentual), 0);
            
            alert(`Os lotes por percentual devem somar 100%. Atualmente somam ${total}%.`);
            return false;
        }
    }
    
    return true;
};

// 6. CORRIGIR DIALOG DUPLICADO DE RECUPERAÇÃO
// Remover o dialog do simple-fixes.js e manter apenas um
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que tudo carregou
    setTimeout(() => {
        // Verificar se já foi perguntado
        if (window.recoveryDialogShown) return;
        window.recoveryDialogShown = true;
        
        const savedData = window.AnySummit.Storage?.getCookie('eventoWizard');
        if (savedData) {
            if (confirm('Foram encontrados dados salvos de uma sessão anterior. Deseja recuperá-los?')) {
                window.AnySummit.Storage.restoreWizardData();
                
                // Forçar atualização do preview
                if (window.updatePreviewSimple) {
                    setTimeout(window.updatePreviewSimple, 500);
                }
            }
        }
    }, 1000);
});

// Adicionar CSS para os botões emoji
const emojiButtonStyle = document.createElement('style');
emojiButtonStyle.textContent = `
    .lote-item-actions button {
        background: none !important;
        border: none !important;
        font-size: 20px !important;
        cursor: pointer !important;
        padding: 5px !important;
        opacity: 0.7;
        transition: opacity 0.2s;
    }
    
    .lote-item-actions button:hover {
        opacity: 1;
        transform: scale(1.1);
    }
`;
document.head.appendChild(emojiButtonStyle);

console.log('[Correções Lotes] Todas as correções aplicadas');
