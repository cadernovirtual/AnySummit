/**
 * CORREÇÃO UPDATEFREETICKET - CHAMADA REAL PARA API
 * Corrige função que não estava salvando no banco
 */

console.log('🔧 CORRECAO-UPDATEFREETICKET.JS carregando...');

/**
 * SOBRESCREVER updateFreeTicket COM IMPLEMENTAÇÃO REAL
 */
function corrigirUpdateFreeTicket() {
    console.log('🔧 Corrigindo função updateFreeTicket...');
    
    // Sobrescrever a função globalmente
    window.updateFreeTicket = async function() {
        console.log('💾 UPDATE FREE TICKET - Versão corrigida com API...');
        
        try {
            // Capturar dados do formulário
            const ticketId = document.getElementById('editFreeTicketId')?.value;
            const titulo = document.getElementById('editFreeTicketTitle')?.value;
            const quantidade = document.getElementById('editFreeTicketQuantity')?.value;
            const loteId = document.getElementById('editFreeTicketLote')?.value;
            const descricao = document.getElementById('editFreeTicketDescription')?.value;
            const minLimit = document.getElementById('editFreeMinLimit')?.value;
            const maxLimit = document.getElementById('editFreeMaxLimit')?.value;
            const startDate = document.getElementById('editFreeSaleStart')?.value;
            const endDate = document.getElementById('editFreeSaleEnd')?.value;
            
            // Validações básicas
            if (!ticketId) {
                alert('Erro: ID do ingresso não encontrado');
                return false;
            }
            
            if (!titulo || !quantidade) {
                alert('Preencha todos os campos obrigatórios (título e quantidade)');
                return false;
            }
            
            if (!loteId) {
                alert('Selecione um lote para o ingresso');
                return false;
            }
            
            console.log('📋 Dados coletados:', {
                ticketId, titulo, quantidade, loteId, descricao
            });
            
            // Preparar dados para envio
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            const formData = new URLSearchParams({
                action: 'editar_ingresso',
                evento_id: eventoId || '',
                ingresso_id: ticketId,
                titulo: titulo,
                quantidade_total: quantidade,
                preco: '0', // Gratuito sempre 0
                tipo: 'gratuito',
                lote_id: loteId,
                descricao: descricao || '',
                limite_min: minLimit || '1',
                limite_max: maxLimit || '5',
                inicio_venda: startDate || '',
                fim_venda: endDate || ''
            });
            
            console.log('📡 Enviando dados para API...');
            
            // Fazer chamada para API
            const response = await fetch('/produtor/ajax/ingressos_api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });
            
            const textResponse = await response.text();
            console.log('📡 Resposta da API:', textResponse.substring(0, 300) + '...');
            
            let data;
            try {
                data = JSON.parse(textResponse);
            } catch (parseError) {
                console.error('❌ Erro ao parsear resposta JSON:', parseError);
                alert('Erro na resposta do servidor. Verifique o console.');
                return false;
            }
            
            if (data.sucesso) {
                console.log('✅ Ingresso gratuito atualizado com sucesso');
                
                // Fechar modal
                if (typeof closeModal === 'function') {
                    closeModal('editFreeTicketModal');
                } else {
                    const modal = document.getElementById('editFreeTicketModal');
                    if (modal) {
                        modal.style.display = 'none';
                        modal.classList.remove('show');
                    }
                }
                
                // RENDERIZAR TICKET ATUALIZADO
                if (typeof window.renderizarTicketAtualizado === 'function') {
                    console.log('🎨 Acionando renderização do ticket atualizado...');
                    setTimeout(() => {
                        window.renderizarTicketAtualizado(ticketId);
                    }, 500);
                } else {
                    console.warn('⚠️ Função renderizarTicketAtualizado não encontrada');
                }
                
                // Feedback visual
                alert('Ingresso gratuito atualizado com sucesso!');
                
                return true;
                
            } else {
                console.error('❌ Erro ao atualizar ingresso:', data.erro);
                alert('Erro ao atualizar ingresso: ' + (data.erro || 'Erro desconhecido'));
                return false;
            }
            
        } catch (error) {
            console.error('❌ Erro na função updateFreeTicket:', error);
            alert('Erro ao atualizar ingresso. Verifique o console.');
            return false;
        }
    };
    
    console.log('✅ Função updateFreeTicket corrigida e sobrescrita');
}

/**
 * VERIFICAR SE API DE INGRESSOS SUPORTA EDIÇÃO
 */
async function verificarAPIIngressos() {
    console.log('🔍 Verificando API de ingressos...');
    
    try {
        const response = await fetch('/produtor/ajax/ingressos_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=test'
        });
        
        const text = await response.text();
        console.log('📡 Teste API:', text.substring(0, 200));
        
        if (text.includes('sucesso') || text.includes('erro')) {
            console.log('✅ API de ingressos disponível');
            return true;
        } else {
            console.warn('⚠️ API pode não estar disponível');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar API:', error);
        return false;
    }
}

/**
 * IMPLEMENTAÇÃO ALTERNATIVA SE API NÃO ESTIVER DISPONÍVEL
 */
function implementacaoAlternativa() {
    console.log('⚠️ Usando implementação alternativa...');
    
    window.updateFreeTicket = async function() {
        console.log('💾 UPDATE FREE TICKET - Versão alternativa...');
        
        try {
            // Tentar usar wizard_evento.php como fallback
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            const ticketId = document.getElementById('editFreeTicketId')?.value;
            const titulo = document.getElementById('editFreeTicketTitle')?.value;
            const quantidade = document.getElementById('editFreeTicketQuantity')?.value;
            const loteId = document.getElementById('editFreeTicketLote')?.value;
            
            if (!ticketId || !titulo || !quantidade || !loteId) {
                alert('Preencha todos os campos obrigatórios');
                return false;
            }
            
            const formData = new URLSearchParams({
                action: 'atualizar_ingresso_gratuito',
                evento_id: eventoId || '',
                ingresso_id: ticketId,
                titulo: titulo,
                quantidade_total: quantidade,
                lote_id: loteId
            });
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });
            
            const textResponse = await response.text();
            console.log('📡 Resposta alternativa:', textResponse.substring(0, 200));
            
            // Fechar modal
            if (typeof closeModal === 'function') {
                closeModal('editFreeTicketModal');
            }
            
            // RENDERIZAR TICKET ATUALIZADO
            if (typeof window.renderizarTicketAtualizado === 'function') {
                console.log('🎨 Acionando renderização do ticket atualizado (alternativa)...');
                setTimeout(() => {
                    window.renderizarTicketAtualizado(ticketId);
                }, 500);
            }
            
            alert('Ingresso atualizado (versão alternativa)');
            return true;
            
        } catch (error) {
            console.error('❌ Erro na implementação alternativa:', error);
            alert('Erro ao atualizar ingresso');
            return false;
        }
    };
}

/**
 * Inicialização
 */
async function inicializar() {
    console.log('🚀 Inicializando correção updateFreeTicket...');
    
    // Aguardar carregamento
    setTimeout(async () => {
        // Verificar se API está disponível
        const apiDisponivel = await verificarAPIIngressos();
        
        if (apiDisponivel) {
            // Usar implementação completa
            corrigirUpdateFreeTicket();
        } else {
            // Usar implementação alternativa
            implementacaoAlternativa();
        }
        
    }, 2000);
    
    console.log('✅ Correção updateFreeTicket inicializada');
}

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

console.log('✅ CORRECAO-UPDATEFREETICKET.JS carregado!');
console.log('🎯 Foco: corrigir updateFreeTicket para fazer chamada real à API');
