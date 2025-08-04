/**
 * CORREÇÃO: CONSULTA DIRETA AO BANCO PARA MODAIS DE EDIÇÃO
 * 
 * Sempre que um modal de edição for aberto, busca os dados reais do banco
 * em vez de confiar nos dados em memória que podem estar desatualizados.
 */

(function() {
    'use strict';
    
    console.log('🔄 Aplicando correção de consulta direta ao banco para modais...');
    
    /**
     * Função para buscar dados do ingresso diretamente do banco
     */
    async function buscarDadosIngressoDoBanco(ingressoId) {
        try {
            console.log(`🔍 [BANCO] Buscando ingresso ${ingressoId} no banco...`);
            
            // Buscar evento_id de múltiplas fontes
            const eventoId = window.eventoId || 
                            getCookie('evento_id') || 
                            new URLSearchParams(window.location.search).get('evento_id') ||
                            document.querySelector('[name="evento_id"]')?.value || '';
            
            console.log(`📝 [BANCO] Usando evento_id: ${eventoId}`);
            
            if (!eventoId) {
                console.error('❌ [BANCO] evento_id não encontrado!');
                return null;
            }
            
            const formData = new FormData();
            formData.append('action', 'buscar_ingresso');
            formData.append('ingresso_id', ingressoId);
            formData.append('evento_id', eventoId);
            
            console.log(`🌐 [BANCO] Fazendo requisição para ajax/wizard_evento.php...`);
            
            const response = await fetch('ajax/wizard_evento.php', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                console.error(`❌ [BANCO] Resposta HTTP inválida: ${response.status}`);
                return null;
            }
            
            const responseText = await response.text();
            console.log(`📄 [BANCO] Resposta bruta do servidor:`, responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ [BANCO] Erro ao fazer parse do JSON:', parseError);
                console.error('📄 [BANCO] Resposta que causou erro:', responseText);
                return null;
            }
            
            if (data.sucesso && data.ingresso) {
                console.log('✅ [BANCO] Dados carregados com sucesso:', {
                    id: data.ingresso.id,
                    titulo: data.ingresso.titulo,
                    tipo: data.ingresso.tipo,
                    quantidade_total: data.ingresso.quantidade_total,
                    preco: data.ingresso.preco
                });
                return data.ingresso;
            } else {
                console.error('❌ [BANCO] Erro na resposta:', data.erro || 'Resposta inválida');
                console.error('📄 [BANCO] Dados completos:', data);
                return null;
            }
            
        } catch (error) {
            console.error('❌ [BANCO] Erro na requisição:', error);
            return null;
        }
    }
    
    /**
     * Função para configurar checkbox baseado na quantidade real do banco
     */
    function configurarCheckboxPorQuantidade(quantidade, checkboxId, campoId) {
        console.log(`🔧 Configurando checkbox ${checkboxId} com quantidade: ${quantidade}`);
        
        const checkbox = document.getElementById(checkboxId);
        const campo = document.getElementById(campoId);
        
        if (checkbox && campo) {
            if (quantidade > 0) {
                // Tem quantidade definida - marcar checkbox e mostrar campo
                checkbox.checked = true;
                campo.value = quantidade;
                
                // Mostrar container se existir
                const container = document.getElementById(checkboxId.replace('Check', 'Container'));
                if (container) {
                    container.style.display = 'block';
                }
                
                console.log(`✅ Checkbox ${checkboxId} marcado - quantidade: ${quantidade}`);
                
            } else {
                // Quantidade zero ou null - desmarcar checkbox e ocultar campo
                checkbox.checked = false;
                campo.value = '0';
                
                // Ocultar container se existir
                const container = document.getElementById(checkboxId.replace('Check', 'Container'));
                if (container) {
                    container.style.display = 'none';
                }
                
                console.log(`✅ Checkbox ${checkboxId} desmarcado - quantidade: ${quantidade}`);
            }
            
            // Disparar evento de mudança para atualizar a interface
            checkbox.dispatchEvent(new Event('change'));
        } else {
            console.warn(`⚠️ Elementos não encontrados: checkbox=${!!checkbox}, campo=${!!campo}`);
        }
    }
    
    /**
     * Popular modal de ingresso pago com dados reais do banco
     */
    window.populateEditPaidTicketModalWithRealData = function(dadosReais) {
        console.log('🔄 Populando modal pago com dados reais:', dadosReais);
        
        // Campos básicos
        document.getElementById('editTicketId').value = dadosReais.id || '';
        document.getElementById('editPaidTicketTitle').value = dadosReais.titulo || '';
        document.getElementById('editPaidTicketPrice').value = dadosReais.preco || '0';
        document.getElementById('editPaidTicketReceive').value = dadosReais.valor_receber || dadosReais.preco || '0';
        document.getElementById('editPaidSaleStart').value = formatDateForInput(dadosReais.inicio_venda);
        document.getElementById('editPaidSaleEnd').value = formatDateForInput(dadosReais.fim_venda);
        document.getElementById('editPaidMinQuantity').value = dadosReais.limite_min || '1';
        document.getElementById('editPaidMaxQuantity').value = dadosReais.limite_max || '5';
        document.getElementById('editPaidTicketDescription').value = dadosReais.descricao || '';
        
        // Lote se disponível
        const loteSelect = document.getElementById('editPaidTicketLote');
        if (loteSelect && dadosReais.lote_id) {
            loteSelect.value = dadosReais.lote_id;
        }
        
        // CRUCIAL: Configurar checkbox baseado na quantidade real do banco
        const quantidade = parseInt(dadosReais.quantidade_total) || 0;
        configurarCheckboxPorQuantidade(quantidade, 'limitEditPaidQuantityCheck', 'editPaidTicketQuantity');
        
        console.log('✅ Modal pago populado com dados reais do banco');
    };
    
    /**
     * Popular modal de ingresso gratuito com dados reais do banco
     */
    window.populateEditFreeTicketModalWithRealData = function(dadosReais) {
        console.log('🔄 Populando modal gratuito com dados reais:', dadosReais);
        
        // Campos básicos
        document.getElementById('editTicketId').value = dadosReais.id || '';
        document.getElementById('editFreeTicketTitle').value = dadosReais.titulo || '';
        document.getElementById('editFreeSaleStart').value = formatDateForInput(dadosReais.inicio_venda);
        document.getElementById('editFreeSaleEnd').value = formatDateForInput(dadosReais.fim_venda);
        document.getElementById('editFreeMinQuantity').value = dadosReais.limite_min || '1';
        document.getElementById('editFreeMaxQuantity').value = dadosReais.limite_max || '5';
        document.getElementById('editFreeTicketDescription').value = dadosReais.descricao || '';
        
        // Lote se disponível
        const loteSelect = document.getElementById('editFreeTicketLote');
        if (loteSelect && dadosReais.lote_id) {
            loteSelect.value = dadosReais.lote_id;
        }
        
        // CRUCIAL: Configurar checkbox baseado na quantidade real do banco
        const quantidade = parseInt(dadosReais.quantidade_total) || 0;
        configurarCheckboxPorQuantidade(quantidade, 'limitEditFreeQuantityCheck', 'editFreeTicketQuantity');
        
        console.log('✅ Modal gratuito populado com dados reais do banco');
    };
    
    /**
     * Popular modal de combo com dados reais do banco
     */
    window.populateEditComboTicketModalWithRealData = function(dadosReais) {
        console.log('🔄 Populando modal combo com dados reais:', dadosReais);
        
        // Campos básicos do combo
        document.getElementById('editComboTicketId').value = dadosReais.id || '';
        document.getElementById('editComboTicketTitle').value = dadosReais.titulo || '';
        document.getElementById('editComboTicketPrice').value = dadosReais.preco || '0';
        document.getElementById('editComboTicketReceive').value = dadosReais.valor_receber || dadosReais.preco || '0';
        document.getElementById('editComboSaleStart').value = formatDateForInput(dadosReais.inicio_venda);
        document.getElementById('editComboSaleEnd').value = formatDateForInput(dadosReais.fim_venda);
        document.getElementById('editComboTicketDescription').value = dadosReais.descricao || '';
        
        // Combos sempre têm quantidade 0
        const quantityField = document.getElementById('editComboQuantity');
        if (quantityField) {
            quantityField.value = '0';
        }
        
        // Se houver checkbox de combo, sempre desmarcar
        const comboCheckbox = document.getElementById('limitEditComboQuantityCheck');
        if (comboCheckbox) {
            comboCheckbox.checked = false;
        }
        
        // Carregar itens do combo se existirem
        if (dadosReais.conteudo_combo) {
            console.log('📦 Itens do combo:', dadosReais.conteudo_combo);
        }
        
        console.log('✅ Modal combo populado com dados reais do banco');
    };
    
    /**
     * Interceptar editTicket - DESATIVADO
     * A consulta ao banco agora é feita diretamente na função editTicket original
     */
    function interceptarEditTicket() {
        console.log('ℹ️ Interceptação de editTicket desativada - usando implementação nativa');
        return false; // Não interceptar mais
    }
    
    /**
     * Interceptar editComboTicket
     */
    function interceptarEditComboTicket() {
        const editComboTicketOriginal = window.editComboTicket;
        if (!editComboTicketOriginal) return false;
        
        window.editComboTicket = async function(comboId) {
            console.log('🔄 editComboTicket interceptado - consultando banco para ID:', comboId);
            
            // Buscar dados reais do banco
            const dadosReais = await buscarDadosIngressoDoBanco(comboId);
            
            if (!dadosReais) {
                console.error('❌ Não foi possível carregar dados do banco, usando função original');
                return editComboTicketOriginal.call(this, comboId);
            }
            
            // Popular modal do combo com dados reais
            populateEditComboTicketModalWithRealData(dadosReais);
            document.getElementById('editComboTicketModal').style.display = 'flex';
        };
        
        window.editComboTicket._interceptado = true;
        console.log('✅ Função editComboTicket interceptada com sucesso');
        return true;
    }
    
    /**
     * Tentar interceptar funções de edição com retry caso ainda não existam
     */
    function tentarInterceptarFuncoesEdicao() {
        let tentativas = 0;
        const maxTentativas = 15;
        
        const interval = setInterval(() => {
            tentativas++;
            
            // Interceptar editTicket se ainda não foi interceptado
            if (typeof window.editTicket === 'function' && !window.editTicket._interceptado) {
                interceptarEditTicket();
            }
            
            // Interceptar editComboTicket se ainda não foi interceptado
            if (typeof window.editComboTicket === 'function' && !window.editComboTicket._interceptado) {
                interceptarEditComboTicket();
            }
            
            // Parar se ambas foram interceptadas ou atingiu max tentativas
            if ((window.editTicket?._interceptado && window.editComboTicket?._interceptado) || tentativas >= maxTentativas) {
                clearInterval(interval);
                console.log(`✅ Interceptação finalizada após ${tentativas} tentativas`);
            }
        }, 500); // Verifica a cada 500ms
    }
    
    /**
     * Função auxiliar para formatar data para input
     */
    function formatDateForInput(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            return date.toISOString().slice(0, 16);
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return '';
        }
    }
    
    /**
     * Função auxiliar para obter cookie
     */
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return '';
    }
    
    // Aplicar interceptações quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tentarInterceptarFuncoesEdicao);
    } else {
        tentarInterceptarFuncoesEdicao();
    }
    
    console.log('✅ Sistema de consulta direta ao banco aplicado!');
})();

// Função global para debug
window.debugModalData = function(ingressoId) {
    console.log('🔍 Debug - Testando busca de dados para ingresso:', ingressoId);
    
    // Esta função pode ser chamada no console para testar
    return buscarDadosIngressoDoBanco(ingressoId).then(dados => {
        console.log('Dados encontrados:', dados);
        return dados;
    });
};

console.log('🎯 Sistema de consulta direta ao banco para modais carregado!');
