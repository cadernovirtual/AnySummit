/**
 * DIAGNÓSTICO ESPECÍFICO: PRIMEIRA CARGA DO EDITTICKET
 * 
 * Este arquivo diagnostica especificamente o problema da primeira carga,
 * onde os dados estão desatualizados na primeira abertura do editTicket.
 */

console.log('🩺 DIAGNOSTICO-PRIMEIRA-CARGA.JS carregando...');

// Aguardar carregamento completo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🩺 Iniciando diagnóstico da primeira carga...');
    
    // Aguardar mais um pouco para garantir que tudo carregou
    setTimeout(() => {
        diagnosticarPrimeiraCarga();
    }, 2000);
});

function diagnosticarPrimeiraCarga() {
    console.log('🔍 ========== DIAGNÓSTICO PRIMEIRA CARGA ==========');
    
    // 1. Verificar se a interceptação está ativa
    console.log('📋 Sistema de interceptação...');
    console.log('- editTicket existe?', typeof window.editTicket === 'function');
    console.log('- editTicket interceptado?', window.editTicket?._interceptado);
    console.log('- buscarDadosIngressoDoBanco existe?', typeof window.buscarDadosIngressoDoBanco === 'function');
    
    // 2. Verificar dados globais em memória
    console.log('📋 Dados em memória...');
    console.log('- window.dadosAtivos existe?', !!window.dadosAtivos);
    console.log('- window.dadosAtivos.ingressos?', window.dadosAtivos?.ingressos?.length || 'não encontrado');
    console.log('- window.eventoId?', window.eventoId || 'não definido');
    
    // 3. Verificar evento_id disponível
    const eventoId = window.eventoId || 
                    getCookie('evento_id') || 
                    new URLSearchParams(window.location.search).get('evento_id') ||
                    document.querySelector('[name="evento_id"]')?.value || '';
    
    console.log('📋 Evento ID disponível:', eventoId);
    
    // 4. Buscar todos os botões de edição
    const botoesEdicao = document.querySelectorAll('button[onclick*="editTicket"], button[onclick*="editarIngresso"]');
    console.log(`📋 Botões de edição encontrados: ${botoesEdicao.length}`);
    
    if (botoesEdicao.length > 0) {
        const primeiroBotao = botoesEdicao[0];
        const onclick = primeiroBotao.getAttribute('onclick');
        console.log('- Primeiro botão onclick:', onclick);
        
        // Extrair ID do primeiro botão
        const idMatch = onclick.match(/editTicket\((\d+)\)/) || onclick.match(/editarIngresso\((\d+)\)/);
        if (idMatch) {
            const ingressoId = idMatch[1];
            console.log(`- ID extraído: ${ingressoId}`);
            
            // Teste de consulta direta ao banco
            testarConsultaBanco(ingressoId, eventoId);
        }
    }
    
    // 5. Monitorar primeira abertura de modal
    monitorarPrimeiraAbertura();
    
    console.log('🩺 ========== FIM DO DIAGNÓSTICO ==========');
}

async function testarConsultaBanco(ingressoId, eventoId) {
    console.log('🧪 ========== TESTE CONSULTA BANCO ==========');
    console.log(`🔍 Testando consulta para ingresso ${ingressoId}...`);
    
    try {
        const formData = new FormData();
        formData.append('action', 'buscar_ingresso');
        formData.append('ingresso_id', ingressoId);
        formData.append('evento_id', eventoId);
        
        console.log('📤 Enviando requisição...');
        
        const response = await fetch('ajax/wizard_evento.php', {
            method: 'POST',
            body: formData
        });
        
        console.log(`📥 Resposta recebida - Status: ${response.status}`);
        
        const responseText = await response.text();
        console.log('📄 Resposta bruta:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('✅ JSON parseado com sucesso:', data);
            
            if (data.sucesso && data.ingresso) {
                console.log('🎯 DADOS DO BANCO:');
                console.log('- ID:', data.ingresso.id);
                console.log('- Título:', data.ingresso.titulo);
                console.log('- Tipo:', data.ingresso.tipo);
                console.log('- Quantidade Total:', data.ingresso.quantidade_total);
                console.log('- Preço:', data.ingresso.preco);
                
                // Comparar com dados em memória se existirem
                if (window.dadosAtivos?.ingressos) {
                    const ingressoMemoria = window.dadosAtivos.ingressos.find(ing => ing.id == ingressoId);
                    if (ingressoMemoria) {
                        console.log('🔄 COMPARAÇÃO BANCO vs MEMÓRIA:');
                        console.log('- Quantidade (banco):', data.ingresso.quantidade_total);
                        console.log('- Quantidade (memória):', ingressoMemoria.quantidade_total);
                        console.log('- São iguais?', data.ingresso.quantidade_total == ingressoMemoria.quantidade_total);
                    }
                }
                
            } else {
                console.error('❌ Erro na resposta:', data.erro);
            }
            
        } catch (parseError) {
            console.error('❌ Erro ao fazer parse do JSON:', parseError);
        }
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
    }
    
    console.log('🧪 ========== FIM TESTE CONSULTA ==========');
}

function monitorarPrimeiraAbertura() {
    console.log('👁️ Monitorando primeira abertura de modal...');
    
    // Interceptar abertura de modais
    const modaisParaMonitorar = [
        'editPaidTicketModal',
        'editFreeTicketModal', 
        'editComboTicketModal'
    ];
    
    modaisParaMonitorar.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            // Observer para detectar quando modal se torna visível
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (modal.style.display === 'flex') {
                            console.log(`🎯 MODAL ${modalId} ABERTO - analisando dados...`);
                            analisarDadosModal(modalId);
                            observer.disconnect(); // Parar de observar após primeira abertura
                        }
                    }
                });
            });
            
            observer.observe(modal, { 
                attributes: true, 
                attributeFilter: ['style'] 
            });
        }
    });
}

function analisarDadosModal(modalId) {
    console.log(`🔍 Analisando dados do modal ${modalId}...`);
    
    let checkboxId, campoId;
    
    if (modalId === 'editPaidTicketModal') {
        checkboxId = 'limitEditPaidQuantityCheck';
        campoId = 'editPaidTicketQuantity';
    } else if (modalId === 'editFreeTicketModal') {
        checkboxId = 'limitEditFreeQuantityCheck';
        campoId = 'editFreeTicketQuantity';
    }
    
    if (checkboxId && campoId) {
        const checkbox = document.getElementById(checkboxId);
        const campo = document.getElementById(campoId);
        
        console.log(`📋 Estado do modal ${modalId}:`);
        console.log(`- Checkbox (${checkboxId}):`, checkbox?.checked);
        console.log(`- Campo (${campoId}):`, campo?.value);
        
        // Verificar se editTicketId foi preenchido
        const idField = document.getElementById('editTicketId');
        console.log('- ID do ingresso no modal:', idField?.value);
    }
}

// Função auxiliar para getCookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
}

console.log('✅ DIAGNOSTICO-PRIMEIRA-CARGA.JS carregado!');
