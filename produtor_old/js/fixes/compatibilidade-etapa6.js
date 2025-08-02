// =====================================================
// CORREÇÃO PARA COMPATIBILIDADE COM ETAPA 6
// =====================================================

console.log('🔧 Aplicando correção de compatibilidade...');

// Interceptar e corrigir a função carregarLotesTemporarios
const carregarLotesTemporariosOriginal = window.carregarLotesTemporarios;

window.carregarLotesTemporarios = function() {
    console.log('📋 Carregando lotes temporários (com correção)...');
    
    if (typeof window.lotesData !== 'undefined') {
        const todosLotes = [];
        
        // Adicionar lotes por data
        if (window.lotesData.porData && window.lotesData.porData.length > 0) {
            window.lotesData.porData.forEach((lote, index) => {
                todosLotes.push({
                    id: lote.id || `temp_data_${index}`,
                    nome: lote.nome,
                    tipo: 'POR DATA',
                    data_inicio: lote.dataInicio,  // Campo esperado pela etapa 6
                    data_fim: lote.dataFim,         // Campo esperado pela etapa 6
                    percentual_venda: null
                });
            });
        }
        
        // Adicionar lotes por percentual
        if (window.lotesData.porPercentual && window.lotesData.porPercentual.length > 0) {
            window.lotesData.porPercentual.forEach((lote, index) => {
                todosLotes.push({
                    id: lote.id || `temp_perc_${index}`,
                    nome: lote.nome,
                    tipo: 'POR PERCENTUAL',
                    data_inicio: lote.dataInicio,  // Adicionado para compatibilidade
                    data_fim: lote.dataFim,         // Adicionado para compatibilidade
                    percentual_venda: lote.percentual
                });
            });
        }
        
        if (todosLotes.length > 0) {
            window.lotesCarregados = todosLotes;
            if (window.populateSelectLotes) {
                window.populateSelectLotes(todosLotes);
            }
            console.log('✅ Lotes carregados:', todosLotes);
        } else {
            console.log('❌ Nenhum lote temporário encontrado');
        }
    } else {
        console.log('❌ Variável lotesData não está definida');
    }
};

// Garantir que carregarLotesNoModal seja chamado quando abrir modais
document.addEventListener('DOMContentLoaded', function() {
    
    // Para ingresso pago
    const btnAddPaid = document.getElementById('addPaidTicket');
    if (btnAddPaid) {
        btnAddPaid.addEventListener('click', function() {
            setTimeout(() => {
                if (window.carregarLotesNoModal) {
                    window.carregarLotesNoModal();
                }
            }, 100);
        });
    }
    
    // Para ingresso gratuito
    const btnAddFree = document.getElementById('addFreeTicket');
    if (btnAddFree) {
        btnAddFree.addEventListener('click', function() {
            setTimeout(() => {
                if (window.carregarLotesNoModalFree) {
                    window.carregarLotesNoModalFree();
                }
            }, 100);
        });
    }
    
    // Para combo
    const btnAddCombo = document.getElementById('addComboTicket');
    if (btnAddCombo) {
        btnAddCombo.addEventListener('click', function() {
            setTimeout(() => {
                if (window.carregarLotesNoModalCombo) {
                    window.carregarLotesNoModalCombo();
                }
            }, 100);
        });
    }
});

// Corrigir também a formatação dos lotes na etapa 5
const criarElementoLoteOriginal = window.criarElementoLote;
window.criarElementoLote = function(lote, tipo, index) {
    const div = document.createElement('div');
    div.className = 'lote-card ' + (tipo === 'data' ? 'por-data' : 'por-percentual');
    div.setAttribute('data-lote-id', lote.id);
    
    const formatarData = (dataStr) => {
        if (!dataStr) return 'Não definida';
        const data = new Date(dataStr);
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        const hora = String(data.getHours()).padStart(2, '0');
        const minuto = String(data.getMinutes()).padStart(2, '0');
        return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
    };
    
    // Estrutura mais simples e limpa
    div.innerHTML = `
        <div class="lote-header">
            <div class="lote-title">
                <span class="lote-nome">${lote.nome}</span>
                ${tipo === 'percentual' ? `<span class="lote-badge">${lote.percentual}%</span>` : ''}
            </div>
            <div class="lote-actions">
                <button class="btn-icon" onclick="editarLote('${lote.id}', '${tipo}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" onclick="excluirLoteSeguro('${lote.id}', '${tipo}')" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="lote-dates">
            <div class="lote-date">
                <i class="fas fa-calendar-alt"></i>
                <span>Início: ${formatarData(lote.dataInicio)}</span>
            </div>
            <div class="lote-date">
                <i class="fas fa-calendar-check"></i>
                <span>Fim: ${formatarData(lote.dataFim)}</span>
            </div>
        </div>
    `;
    
    return div;
};

// Adicionar estilos CSS para melhor formatação
const style = document.createElement('style');
style.textContent = `
    .lote-card {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        transition: all 0.2s;
    }
    
    .lote-card:hover {
        border-color: #00C2FF;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .lote-card.por-data {
        border-left: 4px solid #00C2FF;
    }
    
    .lote-card.por-percentual {
        border-left: 4px solid #28a745;
    }
    
    .lote-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .lote-title {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .lote-nome {
        font-weight: 600;
        color: #333;
        font-size: 16px;
    }
    
    .lote-badge {
        background: #28a745;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
    }
    
    .lote-actions {
        display: flex;
        gap: 5px;
    }
    
    .lote-actions .btn-icon {
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 5px 10px;
        cursor: pointer;
        transition: all 0.2s;
        color: #6c757d;
    }
    
    .lote-actions .btn-icon:hover {
        background: #f8f9fa;
        border-color: #adb5bd;
        color: #495057;
    }
    
    .lote-actions .btn-icon.delete:hover {
        background: #dc3545;
        border-color: #dc3545;
        color: white;
    }
    
    .lote-dates {
        display: flex;
        gap: 20px;
        color: #6c757d;
        font-size: 14px;
    }
    
    .lote-date {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .lote-date i {
        font-size: 12px;
    }
`;
document.head.appendChild(style);

console.log('✅ Correção de compatibilidade aplicada');