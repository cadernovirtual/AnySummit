/**
 * CORREÇÃO DEFINITIVA - WIZARD EVENTOS ETAPA 5
 * Resolve os 2 problemas críticos:
 * 1. Lotes não são excluídos do MySQL
 * 2. Botões de edição desaparecem após operações
 */

(function() {
    console.log('🚨 CORREÇÃO FINAL - Iniciando...');
    
    // ===== PROBLEMA 1: EXCLUSÃO NÃO ATINGE MYSQL =====
    
    // Função corrigida que efetivamente exclui do MySQL
    window.excluirLoteData = async function(id) {
        console.log('🗑️ [MYSQL] Excluindo lote do banco:', id);
        
        try {
            // Verificar ingressos
            if (window.verificarIngressosNoLote && window.verificarIngressosNoLote(id)) {
                alert('Não é possível excluir este lote pois existem ingressos associados a ele. Exclua os ingressos primeiro.');
                return;
            }
            
            // Confirmar exclusão
            if (!confirm('Tem certeza que deseja excluir este lote?')) {
                return;
            }
            
            // Pegar evento_id
            const eventoId = window.getEventoId?.() || 
                           new URLSearchParams(window.location.search).get('evento_id') ||
                           window.eventoAtual?.id;
            
            if (!eventoId) {
                throw new Error('ID do evento não encontrado');
            }
            
            console.log('📡 Enviando requisição para MySQL...', { lote_id: id, evento_id: eventoId });
            
            // Fazer requisição para o backend
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=excluir_lote&lote_id=${id}&evento_id=${eventoId}`
            });
            
            console.log('📡 Response status:', response.status);
            const resultText = await response.text();
            console.log('📡 Response raw:', resultText);
            
            let result;
            try {
                result = JSON.parse(resultText);
            } catch (e) {
                console.error('❌ Erro ao parsear JSON:', e);
                throw new Error('Resposta inválida do servidor: ' + resultText);
            }
            
            if (result.sucesso) {
                console.log('✅ Lote excluído do MySQL com sucesso');
                
                // Remover do array local
                if (window.lotesData?.porData) {
                    window.lotesData.porData = window.lotesData.porData.filter(l => l.id != id);
                }
                
                // Renomear automaticamente
                if (window.renomearLotesAutomaticamente) {
                    window.renomearLotesAutomaticamente();
                }
                
                // Atualizar interface (com botões)
                atualizarInterfaceComBotoes();
                
                // Salvar no cookie
                if (window.salvarLotesNoCookie) {
                    window.salvarLotesNoCookie();
                }
                
                alert('Lote excluído com sucesso!');
            } else {
                throw new Error(result.erro || 'Erro desconhecido ao excluir lote');
            }
            
        } catch (error) {
            console.error('❌ Erro ao excluir lote:', error);
            alert('Erro ao excluir lote: ' + error.message);
        }
    };
    
    // Função corrigida para lotes por percentual
    window.excluirLotePercentual = async function(id) {
        console.log('🗑️ [MYSQL] Excluindo lote percentual do banco:', id);
        
        try {
            // Verificar ingressos
            if (window.verificarIngressosNoLote && window.verificarIngressosNoLote(id)) {
                alert('Não é possível excluir este lote pois existem ingressos associados a ele. Exclua os ingressos primeiro.');
                return;
            }
            
            // Confirmar exclusão
            if (!confirm('Tem certeza que deseja excluir este lote?')) {
                return;
            }
            
            // Pegar evento_id
            const eventoId = window.getEventoId?.() || 
                           new URLSearchParams(window.location.search).get('evento_id') ||
                           window.eventoAtual?.id;
            
            if (!eventoId) {
                throw new Error('ID do evento não encontrado');
            }
            
            console.log('📡 Enviando requisição para MySQL...', { lote_id: id, evento_id: eventoId });
            
            // Fazer requisição para o backend
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=excluir_lote&lote_id=${id}&evento_id=${eventoId}`
            });
            
            console.log('📡 Response status:', response.status);
            const resultText = await response.text();
            console.log('📡 Response raw:', resultText);
            
            let result;
            try {
                result = JSON.parse(resultText);
            } catch (e) {
                console.error('❌ Erro ao parsear JSON:', e);
                throw new Error('Resposta inválida do servidor: ' + resultText);
            }
            
            if (result.sucesso) {
                console.log('✅ Lote percentual excluído do MySQL com sucesso');
                
                // Remover do array local
                if (window.lotesData?.porPercentual) {
                    window.lotesData.porPercentual = window.lotesData.porPercentual.filter(l => l.id != id);
                }
                
                // Renomear automaticamente
                if (window.renomearLotesAutomaticamente) {
                    window.renomearLotesAutomaticamente();
                }
                
                // Atualizar interface (com botões)
                atualizarInterfaceComBotoes();
                
                // Salvar no cookie
                if (window.salvarLotesNoCookie) {
                    window.salvarLotesNoCookie();
                }
                
                alert('Lote excluído com sucesso!');
            } else {
                throw new Error(result.erro || 'Erro desconhecido ao excluir lote');
            }
            
        } catch (error) {
            console.error('❌ Erro ao excluir lote percentual:', error);
            alert('Erro ao excluir lote: ' + error.message);
        }
    };
    
    // ===== PROBLEMA 2: INTERFACE SEM BOTÕES =====
    
    // Função corrigida de atualização que inclui botões de edição
    function atualizarInterfaceComBotoes() {
        console.log('🖼️ Atualizando interface COM botões de edição...');
        
        // LOTES POR DATA
        const containerData = document.getElementById('lotesPorDataList');
        const emptyData = document.getElementById('loteDataEmpty');
        
        if (containerData) {
            containerData.innerHTML = '';
            
            if (window.lotesData?.porData?.length > 0) {
                // Esconder empty state
                if (emptyData) emptyData.style.display = 'none';
                
                // Renderizar cada lote COM BOTÕES
                window.lotesData.porData.forEach(function(lote) {
                    const div = document.createElement('div');
                    div.className = 'lote-item';
                    div.style.position = 'relative';
                    div.setAttribute('data-id', lote.id);
                    
                    const dataInicio = formatarDataHora(lote.dataInicio);
                    const dataFim = formatarDataHora(lote.dataFim);
                    
                    div.innerHTML = `
                        <div class="lote-item-info">
                            <div class="lote-item-name"><strong>${lote.nome}</strong></div>
                            <div class="lote-item-details">
                                ${dataInicio} até ${dataFim}
                                ${lote.divulgar ? ' • Critério público' : ' • Critério oculto'}
                            </div>
                        </div>
                        <div class="lote-item-actions" style="position: absolute; top: 10px; right: 10px; display: flex; gap: 5px;">
                            <button onclick="editarLote('${lote.id}', 'data')" 
                                    style="background: transparent; border: none; cursor: pointer; font-size: 14px; padding: 4px; border-radius: 3px;"
                                    title="Editar lote"
                                    onmouseover="this.style.backgroundColor='rgba(0,0,0,0.1)'"
                                    onmouseout="this.style.backgroundColor='transparent'">✏️</button>
                            <button onclick="excluirLoteData('${lote.id}')" 
                                    style="background: transparent; border: none; cursor: pointer; font-size: 14px; padding: 4px; border-radius: 3px; color: #dc3545;"
                                    title="Excluir lote"
                                    onmouseover="this.style.backgroundColor='rgba(220,53,69,0.1)'"
                                    onmouseout="this.style.backgroundColor='transparent'">🗑️</button>
                        </div>
                    `;
                    
                    containerData.appendChild(div);
                    console.log('✅ Lote por data renderizado COM BOTÕES:', lote.nome);
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
            
            if (window.lotesData?.porPercentual?.length > 0) {
                // Esconder empty state
                if (emptyPercentual) emptyPercentual.style.display = 'none';
                
                // Renderizar cada lote COM BOTÕES
                window.lotesData.porPercentual.forEach(function(lote) {
                    const div = document.createElement('div');
                    div.className = 'lote-item';
                    div.style.position = 'relative';
                    div.setAttribute('data-id', lote.id);
                    
                    div.innerHTML = `
                        <div class="lote-item-info">
                            <div class="lote-item-name"><strong>${lote.nome}</strong></div>
                            <div class="lote-item-details">
                                Encerra aos ${lote.percentual}% das vendas
                                ${lote.divulgar ? ' • Critério público' : ' • Critério oculto'}
                            </div>
                        </div>
                        <div class="lote-item-actions" style="position: absolute; top: 10px; right: 10px; display: flex; gap: 5px;">
                            <button onclick="editarLote('${lote.id}', 'percentual')" 
                                    style="background: transparent; border: none; cursor: pointer; font-size: 14px; padding: 4px; border-radius: 3px;"
                                    title="Editar lote"
                                    onmouseover="this.style.backgroundColor='rgba(0,0,0,0.1)'"
                                    onmouseout="this.style.backgroundColor='transparent'">✏️</button>
                            <button onclick="excluirLotePercentual('${lote.id}')" 
                                    style="background: transparent; border: none; cursor: pointer; font-size: 14px; padding: 4px; border-radius: 3px; color: #dc3545;"
                                    title="Excluir lote"
                                    onmouseover="this.style.backgroundColor='rgba(220,53,69,0.1)'"
                                    onmouseout="this.style.backgroundColor='transparent'">🗑️</button>
                        </div>
                    `;
                    
                    containerPercentual.appendChild(div);
                    console.log('✅ Lote percentual renderizado COM BOTÕES:', lote.nome);
                });
            } else {
                // Mostrar empty state
                if (emptyPercentual) emptyPercentual.style.display = 'block';
            }
        }
        
        console.log('✅ Interface atualizada com botões funcionais!');
    }
    
    // ===== FUNÇÃO AUXILIAR PARA FORMATAÇÃO =====
    function formatarDataHora(dateStr) {
        if (!dateStr) return 'Data não definida';
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateStr;
        }
    }
    
    // ===== SOBRESCREVER FUNÇÕES PROBLEMÁTICAS =====
    
    // Sobrescrever atualizarTelaLotes para usar versão com botões
    window.atualizarTelaLotes = atualizarInterfaceComBotoes;
    
    // Sobrescrever renderizarLotesPorData para usar versão com botões
    const originalRenderizarLotesPorData = window.renderizarLotesPorData;
    window.renderizarLotesPorData = function() {
        console.log('🔄 Renderização por data interceptada - usando versão com botões');
        atualizarInterfaceComBotoes();
    };
    
    // Sobrescrever renderizarLotesPorPercentual para usar versão com botões
    const originalRenderizarLotesPorPercentual = window.renderizarLotesPorPercentual;
    window.renderizarLotesPorPercentual = function() {
        console.log('🔄 Renderização por percentual interceptada - usando versão com botões');
        atualizarInterfaceComBotoes();
    };
    
    // ===== FUNÇÃO DE ROTEAMENTO PARA EXCLUSÃO =====
    
    // Garantir que função global de exclusão use as versões corretas
    window.excluirLote = function(loteId, tipo) {
        console.log('🗑️ [ROTEAMENTO] excluirLote chamada:', loteId, tipo);
        
        if (tipo === 'data') {
            return window.excluirLoteData(loteId);
        } else if (tipo === 'percentual') {
            return window.excluirLotePercentual(loteId);
        } else {
            console.error('❌ Tipo de lote não reconhecido:', tipo);
        }
    };
    
    // ===== FUNÇÃO DE EDIÇÃO BÁSICA =====
    
    // Função placeholder para edição (pode ser expandida depois)
    window.editarLote = function(loteId, tipo) {
        console.log('✏️ Editando lote:', loteId, tipo);
        
        // Por enquanto, mostrar modal básico
        if (tipo === 'data') {
            // Buscar o lote nos dados
            const lote = window.lotesData?.porData?.find(l => l.id == loteId);
            if (lote) {
                const novoNome = prompt('Nome do lote:', lote.nome);
                if (novoNome && novoNome !== lote.nome) {
                    lote.nome = novoNome;
                    atualizarInterfaceComBotoes();
                    if (window.salvarLotesNoCookie) {
                        window.salvarLotesNoCookie();
                    }
                }
            }
        } else if (tipo === 'percentual') {
            // Buscar o lote nos dados
            const lote = window.lotesData?.porPercentual?.find(l => l.id == loteId);
            if (lote) {
                const novoNome = prompt('Nome do lote:', lote.nome);
                if (novoNome && novoNome !== lote.nome) {
                    lote.nome = novoNome;
                    atualizarInterfaceComBotoes();
                    if (window.salvarLotesNoCookie) {
                        window.salvarLotesNoCookie();
                    }
                }
            }
        }
    };
    
    // ===== INTERCEPTAR CRIAÇÃO DE LOTES =====
    
    // Garantir que após criar lote, a interface seja atualizada com botões
    const originalCriarLoteData = window.criarLoteData;
    if (originalCriarLoteData) {
        window.criarLoteData = function() {
            const result = originalCriarLoteData.apply(this, arguments);
            
            // Forçar atualização com botões após criar
            setTimeout(() => {
                atualizarInterfaceComBotoes();
            }, 500);
            
            return result;
        };
    }
    
    const originalCriarLotePercentual = window.criarLotePercentual;
    if (originalCriarLotePercentual) {
        window.criarLotePercentual = function() {
            const result = originalCriarLotePercentual.apply(this, arguments);
            
            // Forçar atualização com botões após criar
            setTimeout(() => {
                atualizarInterfaceComBotoes();
            }, 500);
            
            return result;
        };
    }
    
    // ===== APLICAR CORREÇÃO QUANDO DOCUMENTO ESTIVER PRONTO =====
    
    function aplicarCorrecaoCompleta() {
        console.log('🔧 Aplicando correção completa...');
        
        // Se já existem lotes, atualizar interface
        if (window.lotesData && 
            (window.lotesData.porData?.length > 0 || window.lotesData.porPercentual?.length > 0)) {
            console.log('📦 Lotes existentes encontrados, aplicando botões...');
            atualizarInterfaceComBotoes();
        }
        
        console.log('✅ CORREÇÃO FINAL APLICADA COM SUCESSO!');
        console.log('🎯 Problemas resolvidos:');
        console.log('   1. ✅ Exclusão agora remove do MySQL');
        console.log('   2. ✅ Botões de edição permanecem após operações');
    }
    
    // Aplicar correção
    if (document.readyState === 'complete') {
        setTimeout(aplicarCorrecaoCompleta, 1000);
    } else {
        window.addEventListener('load', () => setTimeout(aplicarCorrecaoCompleta, 1000));
    }
    
    // Função de teste para verificar se está funcionando
    window.testarCorrecaoFinal = function() {
        console.log('🧪 Testando correção final...');
        console.log('Lotes por data:', window.lotesData?.porData?.length || 0);
        console.log('Lotes por percentual:', window.lotesData?.porPercentual?.length || 0);
        atualizarInterfaceComBotoes();
        console.log('✅ Teste concluído');
    };
    
})();
