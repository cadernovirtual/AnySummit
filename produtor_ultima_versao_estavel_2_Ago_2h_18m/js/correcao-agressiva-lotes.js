/**
 * CORREÇÃO FINAL AGRESSIVA - SOBRESCREVE TUDO
 * Resolve definitivamente os problemas de exclusão MySQL e botões
 * DEVE SER CARREGADA POR ÚLTIMO
 */

(function() {
    console.log('🚨 CORREÇÃO FINAL AGRESSIVA - Sobrescrevendo tudo...');
    
    // Aguardar carregamento completo
    setTimeout(function() {
        
        // ===== SOBRESCREVER TODAS AS FUNÇÕES PROBLEMÁTICAS =====
        
        // 1. FUNÇÃO DE EXCLUSÃO QUE REALMENTE FUNCIONA
        window.excluirLoteData = async function(id) {
            console.log('🗑️ [AGRESSIVA] Iniciando exclusão de lote:', id);
            
            try {
                // PRIMEIRO: Verificar se há ingressos associados
                console.log('🔍 Verificando ingressos associados...');
                const temIngressos = verificarIngressosAssociados(id);
                
                if (temIngressos.tem) {
                    alert(`Não é possível excluir este lote pois existem ${temIngressos.quantidade} ingressos associados a ele.\n\nExclua os ingressos primeiro:\n${temIngressos.lista.join('\n')}`);
                    console.log('❌ Exclusão cancelada - ingressos associados');
                    return;
                }
                
                // SEGUNDO: Confirmar exclusão (SEM confirm automático)
                const confirmar = await mostrarConfirmacaoCustomizada(
                    'Confirmar Exclusão', 
                    'Tem certeza que deseja excluir este lote?\n\nEsta ação não pode ser desfeita.'
                );
                
                if (!confirmar) {
                    console.log('❌ Exclusão cancelada pelo usuário');
                    return;
                }
                
                // TERCEIRO: Pegar evento_id
                const eventoId = window.getEventoId?.() || 
                               new URLSearchParams(window.location.search).get('evento_id') ||
                               window.eventoAtual?.id;
                
                if (!eventoId) {
                    throw new Error('ID do evento não encontrado');
                }
                
                console.log('📡 [AGRESSIVA] Enviando para MySQL...', { lote_id: id, evento_id: eventoId });
                
                // QUARTO: Fazer requisição REAL para o backend
                const response = await fetch('/produtor/ajax/wizard_evento.php', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: `action=excluir_lote&lote_id=${id}&evento_id=${eventoId}`
                });
                
                console.log('📡 Response status:', response.status);
                console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
                
                const resultText = await response.text();
                console.log('📡 Response raw text:', resultText);
                
                // Verificar se é JSON válido
                if (!resultText.trim()) {
                    throw new Error('Resposta vazia do servidor');
                }
                
                let result;
                try {
                    result = JSON.parse(resultText);
                    console.log('📡 Response parsed:', result);
                } catch (e) {
                    console.error('❌ Erro ao parsear JSON:', e);
                    console.error('❌ Texto recebido:', resultText);
                    throw new Error('Resposta inválida do servidor. Verifique os logs do backend.');
                }
                
                if (result.sucesso) {
                    console.log('✅ [AGRESSIVA] Lote excluído do MySQL com sucesso');
                    
                    // Remover do array local
                    if (window.lotesData?.porData) {
                        window.lotesData.porData = window.lotesData.porData.filter(l => l.id != id);
                        console.log('✅ Removido do array local, restam:', window.lotesData.porData.length);
                    }
                    
                    // Renomear
                    if (window.renomearLotesAutomaticamente) {
                        window.renomearLotesAutomaticamente();
                    }
                    
                    // Atualizar interface COM BOTÕES
                    renderizarInterfaceComBotoes();
                    
                    // Salvar cookie
                    if (window.salvarLotesNoCookie) {
                        window.salvarLotesNoCookie();
                    }
                    
                    // Mostrar sucesso
                    await mostrarMensagemSucesso('Lote excluído com sucesso!');
                } else {
                    throw new Error(result.erro || 'Erro ao excluir lote');
                }
                
            } catch (error) {
                console.error('❌ [AGRESSIVA] Erro:', error);
                alert('Erro ao excluir lote: ' + error.message);
            }
        };
        
        // 2. FUNÇÃO DE EXCLUSÃO PERCENTUAL
        window.excluirLotePercentual = async function(id) {
            console.log('🗑️ [AGRESSIVA] Iniciando exclusão de lote percentual:', id);
            
            try {
                // PRIMEIRO: Verificar ingressos associados
                console.log('🔍 Verificando ingressos associados...');
                const temIngressos = verificarIngressosAssociados(id);
                
                if (temIngressos.tem) {
                    alert(`Não é possível excluir este lote pois existem ${temIngressos.quantidade} ingressos associados a ele.\n\nExclua os ingressos primeiro:\n${temIngressos.lista.join('\n')}`);
                    console.log('❌ Exclusão cancelada - ingressos associados');
                    return;
                }
                
                // SEGUNDO: Confirmar exclusão
                const confirmar = await mostrarConfirmacaoCustomizada(
                    'Confirmar Exclusão', 
                    'Tem certeza que deseja excluir este lote?\n\nEsta ação não pode ser desfeita.'
                );
                
                if (!confirmar) {
                    console.log('❌ Exclusão cancelada pelo usuário');
                    return;
                }
                
                const eventoId = window.getEventoId?.() || 
                               new URLSearchParams(window.location.search).get('evento_id') ||
                               window.eventoAtual?.id;
                
                if (!eventoId) {
                    throw new Error('ID do evento não encontrado');
                }
                
                console.log('📡 [AGRESSIVA] Enviando para MySQL...', { lote_id: id, evento_id: eventoId });
                
                const response = await fetch('/produtor/ajax/wizard_evento.php', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: `action=excluir_lote&lote_id=${id}&evento_id=${eventoId}`
                });
                
                const resultText = await response.text();
                const result = JSON.parse(resultText);
                
                if (result.sucesso) {
                    console.log('✅ [AGRESSIVA] Lote percentual excluído do MySQL');
                    
                    if (window.lotesData?.porPercentual) {
                        window.lotesData.porPercentual = window.lotesData.porPercentual.filter(l => l.id != id);
                    }
                    
                    if (window.renomearLotesAutomaticamente) {
                        window.renomearLotesAutomaticamente();
                    }
                    
                    renderizarInterfaceComBotoes();
                    
                    if (window.salvarLotesNoCookie) {
                        window.salvarLotesNoCookie();
                    }
                    
                    await mostrarMensagemSucesso('Lote excluído com sucesso!');
                } else {
                    throw new Error(result.erro || 'Erro ao excluir lote');
                }
                
            } catch (error) {
                console.error('❌ [AGRESSIVA] Erro:', error);
                alert('Erro ao excluir lote: ' + error.message);
            }
        };
        
        // 3. FUNÇÃO DE RENDERIZAÇÃO QUE INCLUI BOTÕES
        function renderizarInterfaceComBotoes() {
            console.log('🖼️ [AGRESSIVA] Renderizando interface COM botões...');
            
            // LOTES POR DATA
            const containerData = document.getElementById('lotesPorDataList');
            if (containerData) {
                containerData.innerHTML = '';
                
                if (window.lotesData?.porData?.length > 0) {
                    console.log('📅 Renderizando', window.lotesData.porData.length, 'lotes por data');
                    
                    window.lotesData.porData.forEach(function(lote) {
                        const div = document.createElement('div');
                        div.className = 'lote-item';
                        div.style.position = 'relative';
                        div.setAttribute('data-id', lote.id);
                        
                        const dataInicio = formatarData(lote.dataInicio);
                        const dataFim = formatarData(lote.dataFim);
                        
                        div.innerHTML = `
                            <div class="lote-item-info">
                                <div class="lote-item-name"><strong>${lote.nome}</strong></div>
                                <div class="lote-item-details">
                                    ${dataInicio} até ${dataFim}
                                    ${lote.divulgar ? ' • Critério público' : ' • Critério oculto'}
                                </div>
                            </div>
                            <div class="lote-item-actions" style="position: absolute; top: 10px; right: 10px; display: flex; gap: 5px;">
                                <button onclick="editarLoteBasico(${lote.id}, 'data')" 
                                        style="background: transparent; border: none; cursor: pointer; font-size: 14px; padding: 4px; border-radius: 3px;"
                                        title="Editar lote (ID: ${lote.id})"
                                        onmouseover="this.style.backgroundColor='rgba(0,0,0,0.1)'"
                                        onmouseout="this.style.backgroundColor='transparent'">✏️</button>
                                <button onclick="excluirLoteData(${lote.id})" 
                                        style="background: transparent; border: none; cursor: pointer; font-size: 14px; padding: 4px; border-radius: 3px; color: #dc3545;"
                                        title="Excluir lote (ID: ${lote.id})"
                                        onmouseover="this.style.backgroundColor='rgba(220,53,69,0.1)'"
                                        onmouseout="this.style.backgroundColor='transparent'">🗑️</button>
                            </div>
                        `;
                        
                        containerData.appendChild(div);
                        console.log('✅ Lote renderizado COM BOTÕES:', lote.nome);
                    });
                } else {
                    console.log('⚠️ Nenhum lote por data para renderizar');
                }
            }
            
            // LOTES POR PERCENTUAL
            const containerPercentual = document.getElementById('lotesPorPercentualList');
            if (containerPercentual) {
                containerPercentual.innerHTML = '';
                
                if (window.lotesData?.porPercentual?.length > 0) {
                    console.log('📊 Renderizando', window.lotesData.porPercentual.length, 'lotes por percentual');
                    
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
                                <button onclick="editarLoteBasico(${lote.id}, 'percentual')" 
                                        style="background: transparent; border: none; cursor: pointer; font-size: 14px; padding: 4px; border-radius: 3px;"
                                        title="Editar lote (ID: ${lote.id})"
                                        onmouseover="this.style.backgroundColor='rgba(0,0,0,0.1)'"
                                        onmouseout="this.style.backgroundColor='transparent'">✏️</button>
                                <button onclick="excluirLotePercentual(${lote.id})" 
                                        style="background: transparent; border: none; cursor: pointer; font-size: 14px; padding: 4px; border-radius: 3px; color: #dc3545;"
                                        title="Excluir lote (ID: ${lote.id})"
                                        onmouseover="this.style.backgroundColor='rgba(220,53,69,0.1)'"
                                        onmouseout="this.style.backgroundColor='transparent'">🗑️</button>
                            </div>
                        `;
                        
                        containerPercentual.appendChild(div);
                        console.log('✅ Lote percentual renderizado COM BOTÕES:', lote.nome);
                    });
                } else {
                    console.log('⚠️ Nenhum lote por percentual para renderizar');
                }
            }
            
            console.log('✅ [AGRESSIVA] Interface renderizada com botões funcionais!');
        }
        
        // 4. FUNÇÃO AUXILIAR DE FORMATAÇÃO
        function formatarData(dateStr) {
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
        
        // 5. FUNÇÃO DE EDIÇÃO CORRETA (usando modal existente)
        window.editarLoteBasico = function(loteId, tipo) {
            console.log('✏️ [AGRESSIVA] Editando lote CORRETAMENTE:', loteId, tipo);
            console.log('📊 Estado atual window.lotesData:', window.lotesData);
            
            if (tipo === 'data') {
                console.log('📅 Tentando editar lote por data...');
                console.log('📊 Lotes por data disponíveis:', window.lotesData?.porData);
                
                // Verificar se lote existe
                const lote = window.lotesData?.porData?.find(l => {
                    console.log(`🔍 Comparando: lote.id=${l.id} (${typeof l.id}) com loteId=${loteId} (${typeof loteId})`);
                    return l.id == loteId; // Usar == para comparação flexível
                });
                
                if (!lote) {
                    console.error('❌ Lote por data não encontrado:', loteId);
                    console.log('📋 Lista de IDs disponíveis:', window.lotesData?.porData?.map(l => ({ id: l.id, tipo: typeof l.id })));
                    alert('Erro: Lote não encontrado. Verifique o console para detalhes.');
                    return;
                }
                
                console.log('✅ Lote encontrado:', lote);
                
                // Usar a função original do sistema
                if (window.editarLoteData && typeof window.editarLoteData === 'function') {
                    console.log('✅ Usando editarLoteData original');
                    window.editarLoteData(loteId);
                } else {
                    console.log('⚠️ editarLoteData não encontrada, usando fallback');
                    editarLoteDataFallback(loteId);
                }
                
            } else if (tipo === 'percentual') {
                console.log('📊 Tentando editar lote por percentual...');
                console.log('📊 Lotes por percentual disponíveis:', window.lotesData?.porPercentual);
                
                // Verificar se lote existe
                const lote = window.lotesData?.porPercentual?.find(l => {
                    console.log(`🔍 Comparando: lote.id=${l.id} (${typeof l.id}) com loteId=${loteId} (${typeof loteId})`);
                    return l.id == loteId; // Usar == para comparação flexível
                });
                
                if (!lote) {
                    console.error('❌ Lote por percentual não encontrado:', loteId);
                    console.log('📋 Lista de IDs disponíveis:', window.lotesData?.porPercentual?.map(l => ({ id: l.id, tipo: typeof l.id })));
                    alert('Erro: Lote não encontrado. Verifique o console para detalhes.');
                    return;
                }
                
                console.log('✅ Lote encontrado:', lote);
                
                // Usar a função original do sistema
                if (window.editarLotePercentual && typeof window.editarLotePercentual === 'function') {
                    console.log('✅ Usando editarLotePercentual original');
                    window.editarLotePercentual(loteId);
                } else {
                    console.log('⚠️ editarLotePercentual não encontrada, usando fallback');
                    editarLotePercentualFallback(loteId);
                }
            }
        };
        
        // Fallback para edição de lote por data
        function editarLoteDataFallback(id) {
            console.log('🔧 [FALLBACK] Editando lote por data:', id);
            
            const lote = window.lotesData?.porData?.find(l => {
                console.log(`🔍 [FALLBACK] Comparando: lote.id=${l.id} (${typeof l.id}) com id=${id} (${typeof id})`);
                return l.id == id; // Usar == para comparação flexível
            });
            
            if (!lote) {
                console.error('❌ [FALLBACK] Lote não encontrado:', id);
                console.log('📊 [FALLBACK] window.lotesData:', window.lotesData);
                console.log('📋 [FALLBACK] Lotes disponíveis:', window.lotesData?.porData?.map(l => ({ id: l.id, nome: l.nome, tipo: typeof l.id })));
                alert('Erro: Lote não encontrado no fallback. ID: ' + id);
                return;
            }
            
            console.log('📝 [FALLBACK] Preenchendo modal de edição para lote:', lote);
            
            // Preencher campos do modal
            const campos = {
                'editLoteDataId': id,
                'editLoteDataInicio': lote.dataInicio,
                'editLoteDataFim': lote.dataFim
            };
            
            for (let [campoId, valor] of Object.entries(campos)) {
                const elemento = document.getElementById(campoId);
                if (elemento) {
                    elemento.value = valor;
                    console.log(`✅ [FALLBACK] Campo ${campoId} preenchido com:`, valor);
                } else {
                    console.error(`❌ [FALLBACK] Elemento ${campoId} não encontrado`);
                }
            }
            
            // Preencher checkbox
            const divulgarCheckbox = document.getElementById('editLoteDataDivulgar');
            if (divulgarCheckbox) {
                divulgarCheckbox.checked = lote.divulgar || false;
                console.log('✅ [FALLBACK] Checkbox divulgar preenchido:', lote.divulgar);
            }
            
            // Abrir modal
            if (window.openModal) {
                console.log('✅ [FALLBACK] Abrindo modal editLoteDataModal');
                window.openModal('editLoteDataModal');
            } else {
                console.error('❌ [FALLBACK] Função openModal não encontrada');
                // Fallback manual
                const modal = document.getElementById('editLoteDataModal');
                if (modal) {
                    modal.style.display = 'flex';
                    console.log('✅ [FALLBACK] Modal aberto manualmente');
                } else {
                    console.error('❌ [FALLBACK] Modal editLoteDataModal não encontrado');
                }
            }
        }
        
        // Fallback para edição de lote por percentual
        function editarLotePercentualFallback(id) {
            console.log('🔧 [FALLBACK] Editando lote por percentual:', id);
            
            const lote = window.lotesData?.porPercentual?.find(l => {
                console.log(`🔍 [FALLBACK] Comparando: lote.id=${l.id} (${typeof l.id}) com id=${id} (${typeof id})`);
                return l.id == id; // Usar == para comparação flexível
            });
            
            if (!lote) {
                console.error('❌ [FALLBACK] Lote percentual não encontrado:', id);
                console.log('📊 [FALLBACK] window.lotesData:', window.lotesData);
                console.log('📋 [FALLBACK] Lotes percentuais disponíveis:', window.lotesData?.porPercentual?.map(l => ({ id: l.id, nome: l.nome, percentual: l.percentual, tipo: typeof l.id })));
                alert('Erro: Lote percentual não encontrado no fallback. ID: ' + id);
                return;
            }
            
            console.log('📝 [FALLBACK] Preenchendo modal de edição para lote percentual:', lote);
            
            // Preencher campos do modal
            const campos = {
                'editLotePercentualId': id,
                'editLotePercentualValor': lote.percentual
            };
            
            for (let [campoId, valor] of Object.entries(campos)) {
                const elemento = document.getElementById(campoId);
                if (elemento) {
                    elemento.value = valor;
                    console.log(`✅ [FALLBACK] Campo ${campoId} preenchido com:`, valor);
                } else {
                    console.error(`❌ [FALLBACK] Elemento ${campoId} não encontrado`);
                }
            }
            
            // Preencher checkbox
            const divulgarCheckbox = document.getElementById('editLotePercentualDivulgar');
            if (divulgarCheckbox) {
                divulgarCheckbox.checked = lote.divulgar || false;
                console.log('✅ [FALLBACK] Checkbox divulgar preenchido:', lote.divulgar);
            }
            
            // Abrir modal
            if (window.openModal) {
                console.log('✅ [FALLBACK] Abrindo modal editLotePercentualModal');
                window.openModal('editLotePercentualModal');
            } else {
                console.error('❌ [FALLBACK] Função openModal não encontrada');
                // Fallback manual
                const modal = document.getElementById('editLotePercentualModal');
                if (modal) {
                    modal.style.display = 'flex';
                    console.log('✅ [FALLBACK] Modal percentual aberto manualmente');
                } else {
                    console.error('❌ [FALLBACK] Modal editLotePercentualModal não encontrado');
                }
            }
        }
        
        // ===== SOBRESCREVER TODAS AS FUNÇÕES CONFLITANTES =====
        
        // Sobrescrever função de roteamento
        window.excluirLote = function(loteId, tipo) {
            console.log('🗑️ [AGRESSIVA] Roteamento de exclusão:', loteId, tipo);
            
            if (tipo === 'data') {
                return window.excluirLoteData(loteId);
            } else if (tipo === 'percentual') {
                return window.excluirLotePercentual(loteId);
            } else {
                console.error('❌ Tipo de lote não reconhecido:', tipo);
            }
        };
        
        // Sobrescrever funções de renderização
        window.atualizarTelaLotes = renderizarInterfaceComBotoes;
        window.renderizarLotesPorData = renderizarInterfaceComBotoes;
        window.renderizarLotesPorPercentual = renderizarInterfaceComBotoes;
        window.atualizarInterfaceLotes = renderizarInterfaceComBotoes;
        
        // Interceptar criação de lotes
        const originalCriarLoteData = window.criarLoteData;
        if (originalCriarLoteData) {
            window.criarLoteData = function() {
                console.log('📅 [AGRESSIVA] Interceptando criação de lote por data');
                const result = originalCriarLoteData.apply(this, arguments);
                
                setTimeout(() => {
                    renderizarInterfaceComBotoes();
                }, 500);
                
                return result;
            };
        }
        
        const originalCriarLotePercentual = window.criarLotePercentual;
        if (originalCriarLotePercentual) {
            window.criarLotePercentual = function() {
                console.log('📊 [AGRESSIVA] Interceptando criação de lote percentual');
                const result = originalCriarLotePercentual.apply(this, arguments);
                
                setTimeout(() => {
                    renderizarInterfaceComBotoes();
                }, 500);
                
                return result;
            };
        }
        
        // ===== APLICAR INTERFACE IMEDIATAMENTE =====
        if (window.lotesData && 
            (window.lotesData.porData?.length > 0 || window.lotesData.porPercentual?.length > 0)) {
            console.log('📦 [AGRESSIVA] Lotes existentes encontrados, aplicando interface...');
            renderizarInterfaceComBotoes();
        }
        
        // Função de teste
        window.testarCorrecaoAgressiva = function() {
            console.log('🧪 [AGRESSIVA] Testando correção...');
            console.log('Lotes por data:', window.lotesData?.porData?.length || 0);
            console.log('Lotes por percentual:', window.lotesData?.porPercentual?.length || 0);
            renderizarInterfaceComBotoes();
            console.log('✅ Teste concluído');
        };
        
        console.log('✅ CORREÇÃO AGRESSIVA APLICADA COM SUCESSO!');
        console.log('🎯 Todas as funções conflitantes foram sobrescritas');
        console.log('💡 Use testarCorrecaoAgressiva() para testar');
        
    }, 3000); // Aguardar 3 segundos para sobrescrever tudo
    
})();
        
        // ===== FUNÇÕES AUXILIARES =====
        
        // Verificar ingressos associados ao lote
        function verificarIngressosAssociados(loteId) {
            console.log('🔍 Verificando ingressos para lote:', loteId);
            
            let ingressosAssociados = [];
            let quantidade = 0;
            
            // Verificar ingressos temporários/locais
            if (window.ingressosTemporarios) {
                // Ingressos pagos
                if (window.ingressosTemporarios.pagos) {
                    window.ingressosTemporarios.pagos.forEach((ingresso, index) => {
                        const ingressoLoteId = String(ingresso.loteId || '').replace(/[^0-9]/g, '');
                        if (ingressoLoteId == String(loteId)) {
                            ingressosAssociados.push(`• ${ingresso.title || 'Ingresso Pago ' + (index + 1)} (Pago)`);
                            quantidade++;
                        }
                    });
                }
                
                // Ingressos gratuitos
                if (window.ingressosTemporarios.gratuitos) {
                    window.ingressosTemporarios.gratuitos.forEach((ingresso, index) => {
                        const ingressoLoteId = String(ingresso.loteId || '').replace(/[^0-9]/g, '');
                        if (ingressoLoteId == String(loteId)) {
                            ingressosAssociados.push(`• ${ingresso.title || 'Ingresso Gratuito ' + (index + 1)} (Gratuito)`);
                            quantidade++;
                        }
                    });
                }
            }
            
            // Verificar ingressos salvos no cookies/localStorage
            if (window.ingressosData) {
                if (window.ingressosData.pagos) {
                    window.ingressosData.pagos.forEach((ingresso, index) => {
                        const ingressoLoteId = String(ingresso.loteId || '').replace(/[^0-9]/g, '');
                        if (ingressoLoteId == String(loteId)) {
                            ingressosAssociados.push(`• ${ingresso.title || 'Ingresso Pago ' + (index + 1)} (Pago)`);
                            quantidade++;
                        }
                    });
                }
                
                if (window.ingressosData.gratuitos) {
                    window.ingressosData.gratuitos.forEach((ingresso, index) => {
                        const ingressoLoteId = String(ingresso.loteId || '').replace(/[^0-9]/g, '');
                        if (ingressoLoteId == String(loteId)) {
                            ingressosAssociados.push(`• ${ingresso.title || 'Ingresso Gratuito ' + (index + 1)} (Gratuito)`);
                            quantidade++;
                        }
                    });
                }
            }
            
            console.log(`📊 Encontrados ${quantidade} ingressos associados ao lote ${loteId}`);
            
            return {
                tem: quantidade > 0,
                quantidade: quantidade,
                lista: ingressosAssociados
            };
        }
        
        // Confirmação customizada (sem usar confirm nativo)
        function mostrarConfirmacaoCustomizada(titulo, mensagem) {
            return new Promise((resolve) => {
                // Remover modal existente se houver
                const modalExistente = document.getElementById('modalConfirmacaoCustomizada');
                if (modalExistente) {
                    modalExistente.remove();
                }
                
                // Criar modal de confirmação
                const modal = document.createElement('div');
                modal.id = 'modalConfirmacaoCustomizada';
                modal.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                `;
                
                modal.innerHTML = `
                    <div style="
                        background: white;
                        padding: 25px;
                        border-radius: 8px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                        max-width: 400px;
                        width: 90%;
                        text-align: center;
                    ">
                        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">${titulo}</h3>
                        <p style="margin: 0 0 25px 0; color: #666; line-height: 1.5; white-space: pre-line;">${mensagem}</p>
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <button id="btnCancelar" style="
                                padding: 10px 20px;
                                border: 1px solid #ddd;
                                background: #f8f9fa;
                                color: #333;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 14px;
                            ">Cancelar</button>
                            <button id="btnConfirmar" style="
                                padding: 10px 20px;
                                border: none;
                                background: #dc3545;
                                color: white;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 14px;
                            ">Excluir</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Adicionar eventos
                document.getElementById('btnCancelar').onclick = () => {
                    modal.remove();
                    resolve(false);
                };
                
                document.getElementById('btnConfirmar').onclick = () => {
                    modal.remove();
                    resolve(true);
                };
                
                // Fechar com ESC
                const handleEscape = (e) => {
                    if (e.key === 'Escape') {
                        modal.remove();
                        document.removeEventListener('keydown', handleEscape);
                        resolve(false);
                    }
                };
                document.addEventListener('keydown', handleEscape);
                
                // Fechar clicando fora
                modal.onclick = (e) => {
                    if (e.target === modal) {
                        modal.remove();
                        resolve(false);
                    }
                };
            });
        }
        
        // Mensagem de sucesso
        function mostrarMensagemSucesso(mensagem) {
            return new Promise((resolve) => {
                const modal = document.createElement('div');
                modal.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                `;
                
                modal.innerHTML = `
                    <div style="
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                        max-width: 300px;
                        width: 90%;
                        text-align: center;
                    ">
                        <div style="color: #28a745; font-size: 24px; margin-bottom: 10px;">✅</div>
                        <p style="margin: 0 0 15px 0; color: #333;">${mensagem}</p>
                        <button onclick="this.parentElement.parentElement.remove()" style="
                            padding: 8px 16px;
                            border: none;
                            background: #28a745;
                            color: white;
                            border-radius: 4px;
                            cursor: pointer;
                        ">OK</button>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Auto-remover após 3 segundos
                setTimeout(() => {
                    if (modal.parentElement) {
                        modal.remove();
                        resolve();
                    }
                }, 3000);
            });
        }
