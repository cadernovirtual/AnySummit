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
        
        // Campos básicos do combo - corrigidos os IDs
        const editComboTicketId = document.getElementById('editComboTicketId');
        if (editComboTicketId) editComboTicketId.value = dadosReais.id || '';
        
        const editComboTitle = document.getElementById('editComboTitle');
        if (editComboTitle) editComboTitle.value = dadosReais.titulo || '';
        
        const editComboPrice = document.getElementById('editComboPrice');
        if (editComboPrice) {
            // Formatar valor monetário corretamente
            const precoFormatado = formatarValorMonetario(dadosReais.preco || '0');
            editComboPrice.value = precoFormatado;
        }
        
        const editComboReceive = document.getElementById('editComboReceive');
        if (editComboReceive) {
            // Formatar valor monetário corretamente
            const valorReceberFormatado = formatarValorMonetario(dadosReais.valor_receber || dadosReais.preco || '0');
            editComboReceive.value = valorReceberFormatado;
        }
        
        const editComboSaleStart = document.getElementById('editComboSaleStart');
        if (editComboSaleStart) editComboSaleStart.value = formatDateForInput(dadosReais.inicio_venda);
        
        const editComboSaleEnd = document.getElementById('editComboSaleEnd');
        if (editComboSaleEnd) editComboSaleEnd.value = formatDateForInput(dadosReais.fim_venda);
        
        const editComboDescription = document.getElementById('editComboDescription');
        if (editComboDescription) editComboDescription.value = dadosReais.descricao || '';
        
        // Preencher lote_id no campo hidden
        const editComboTicketLote = document.getElementById('editComboTicketLote');
        if (editComboTicketLote) editComboTicketLote.value = dadosReais.lote_id || '';
        
        // Buscar e exibir nome do lote
        if (dadosReais.lote_id) {
            buscarNomeLoteEExibir(dadosReais.lote_id);
            // Aplicar regras de readonly nas datas se for lote do tipo "data"
            aplicarRegrasLoteCombo(dadosReais.lote_id);
        } else {
            const editComboLoteDisplay = document.getElementById('editComboLoteDisplay');
            if (editComboLoteDisplay) editComboLoteDisplay.textContent = 'Nenhum lote selecionado';
        }
        
        // Calcular valores da taxa de serviço e valor do comprador
        setTimeout(() => {
            calcularValoresModalCombo(dadosReais);
        }, 100);
        
        // Carregar itens do combo se existirem
        if (dadosReais.conteudo_combo) {
            console.log('📦 Itens do combo:', dadosReais.conteudo_combo);
            carregarItensComboNoModal(dadosReais.conteudo_combo);
        }
        
        console.log('✅ Modal combo populado com dados reais do banco');
    };
    
    /**
     * Buscar nome do lote e exibir no campo visual
     */
    async function buscarNomeLoteEExibir(loteId) {
        console.log('🔍 Buscando nome do lote:', loteId);
        
        try {
            // PRIMEIRA TENTATIVA: Buscar em lotes já carregados
            const nomeLoteCache = buscarNomeLoteNoCache(loteId);
            if (nomeLoteCache) {
                console.log('⚡ Nome do lote encontrado no cache:', nomeLoteCache);
                const editComboLoteDisplay = document.getElementById('editComboLoteDisplay');
                if (editComboLoteDisplay) {
                    editComboLoteDisplay.textContent = nomeLoteCache;
                }
                return;
            }
            
            // SEGUNDA TENTATIVA: Buscar via API
            const eventoId = window.eventoId ||
                getCookie('evento_id') ||
                new URLSearchParams(window.location.search).get('evento_id') ||
                document.querySelector('[name="evento_id"]')?.value || '';
            
            if (!eventoId) {
                console.error('❌ evento_id não encontrado para buscar lote');
                return;
            }
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'buscar_lote_especifico',
                    lote_id: loteId,
                    evento_id: eventoId
                })
            });
            
            const resultado = await response.json();
            console.log('📋 Resultado busca lote:', resultado);
            
            const editComboLoteDisplay = document.getElementById('editComboLoteDisplay');
            
            if (resultado.sucesso && resultado.lote && editComboLoteDisplay) {
                const nomeLote = resultado.lote.nome || resultado.lote.title || `Lote #${loteId}`;
                editComboLoteDisplay.textContent = nomeLote;
                console.log('✅ Nome do lote exibido:', nomeLote);
            } else {
                if (editComboLoteDisplay) {
                    editComboLoteDisplay.textContent = `Lote #${loteId}`;
                }
                console.warn('⚠️ Não foi possível obter nome do lote, usando ID');
            }
            
        } catch (error) {
            console.error('❌ Erro ao buscar nome do lote:', error);
            const editComboLoteDisplay = document.getElementById('editComboLoteDisplay');
            if (editComboLoteDisplay) {
                editComboLoteDisplay.textContent = `Lote #${loteId}`;
            }
        }
    }
    
    /**
     * Buscar nome do lote em estruturas de dados já carregadas (cache)
     */
    function buscarNomeLoteNoCache(loteId) {
        // Verificar múltiplas fontes de dados de lotes
        const fontesLotes = [
            window.lotesData?.porData || [],
            window.lotesData?.porPercentual || [],
            window.lotesCarregados || [],
            window.lotesCache?.data || []
        ];
        
        for (const lotes of fontesLotes) {
            if (Array.isArray(lotes)) {
                const lote = lotes.find(l => l.id == loteId);
                if (lote && lote.nome) {
                    return lote.nome;
                }
            }
        }
        
        return null;
    }
    
    /**
     * Aplicar regras de readonly nas datas se for lote do tipo "data"
     */
    async function aplicarRegrasLoteCombo(loteId) {
        console.log('🔒 Verificando regras do lote para combo:', loteId);
        
        try {
            const eventoId = window.eventoId ||
                getCookie('evento_id') ||
                new URLSearchParams(window.location.search).get('evento_id') ||
                document.querySelector('[name="evento_id"]')?.value || '';
            
            if (!eventoId) {
                console.error('❌ evento_id não encontrado para verificar tipo do lote');
                return;
            }
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'buscar_lote_especifico',
                    lote_id: loteId,
                    evento_id: eventoId
                })
            });
            
            const resultado = await response.json();
            
            if (resultado.sucesso && resultado.lote) {
                const lote = resultado.lote;
                console.log('🔍 Tipo do lote:', lote.tipo);
                
                const editComboSaleStart = document.getElementById('editComboSaleStart');
                const editComboSaleEnd = document.getElementById('editComboSaleEnd');
                
                if (lote.tipo === 'data') {
                    console.log('📅 Lote do tipo data - aplicando readonly nos campos de data');
                    
                    // Aplicar valores das datas do lote
                    if (editComboSaleStart && lote.data_inicio) {
                        editComboSaleStart.value = formatDateForInput(lote.data_inicio);
                        editComboSaleStart.readOnly = true;
                        editComboSaleStart.style.backgroundColor = '#f0f0f0';
                        editComboSaleStart.style.cursor = 'not-allowed';
                    }
                    
                    if (editComboSaleEnd && lote.data_fim) {
                        editComboSaleEnd.value = formatDateForInput(lote.data_fim);
                        editComboSaleEnd.readOnly = true;
                        editComboSaleEnd.style.backgroundColor = '#f0f0f0';
                        editComboSaleEnd.style.cursor = 'not-allowed';
                    }
                } else {
                    console.log('📝 Lote não é do tipo data - campos de data editáveis');
                    
                    // Liberar campos se não for lote por data
                    if (editComboSaleStart) {
                        editComboSaleStart.readOnly = false;
                        editComboSaleStart.style.backgroundColor = '';
                        editComboSaleStart.style.cursor = '';
                    }
                    
                    if (editComboSaleEnd) {
                        editComboSaleEnd.readOnly = false;
                        editComboSaleEnd.style.backgroundColor = '';
                        editComboSaleEnd.style.cursor = '';
                    }
                }
            }
            
        } catch (error) {
            console.error('❌ Erro ao aplicar regras do lote:', error);
        }
    }
    
    /**
     * Calcular valores da taxa de serviço e valor do comprador
     */
    function calcularValoresModalCombo(dadosReais) {
        console.log('💰 Calculando valores do combo modal');
        
        // Tentar usar a função global se disponível
        if (typeof window.calcularValoresEditCombo === 'function') {
            console.log('📞 Usando função global calcularValoresEditCombo');
            window.calcularValoresEditCombo();
            return;
        }
        
        // Fallback: calcular manualmente
        const precoRaw = dadosReais.preco || '0';
        const preco = window.converterPrecoParaNumero(precoRaw);
        const cobrarTaxa = dadosReais.cobrar_taxa_servico !== false; // Default true
        const percentualTaxa = 8; // 8% padrão
        
        let taxaValor = 0;
        let valorComprador = preco;
        let valorReceber = preco;
        
        if (cobrarTaxa && preco > 0) {
            taxaValor = preco * (percentualTaxa / 100);
            valorComprador = preco + taxaValor;
            valorReceber = preco; // O produtor recebe o valor original
        }
        
        // Preencher campos calculados
        const editComboTaxaValor = document.getElementById('editComboTaxaValor');
        if (editComboTaxaValor) {
            editComboTaxaValor.value = formatarValorMonetario(taxaValor);
        }
        
        const editComboValorComprador = document.getElementById('editComboValorComprador');
        if (editComboValorComprador) {
            editComboValorComprador.value = formatarValorMonetario(valorComprador);
        }
        
        // Atualizar checkbox de taxa
        const editComboTaxaServico = document.getElementById('editComboTaxaServico');
        if (editComboTaxaServico) {
            editComboTaxaServico.checked = cobrarTaxa;
        }
        
        console.log('💰 Valores calculados:', { preco, taxaValor, valorComprador, valorReceber });
    }
    
    /**
     * Carregar itens do combo no modal
     */
    function carregarItensComboNoModal(conteudoCombo) {
        console.log('📦 Carregando itens do combo no modal');
        
        const editComboItemsList = document.getElementById('editComboItemsList');
        if (!editComboItemsList) {
            console.warn('⚠️ Container editComboItemsList não encontrado');
            return;
        }
        
        try {
            let itens = [];
            
            // Tentar parsear se for string JSON
            if (typeof conteudoCombo === 'string') {
                itens = JSON.parse(conteudoCombo);
            } else if (Array.isArray(conteudoCombo)) {
                itens = conteudoCombo;
            }
            
            if (!Array.isArray(itens) || itens.length === 0) {
                console.log('📦 Nenhum item no combo');
                editComboItemsList.innerHTML = `
                    <div class="combo-empty-state">
                        <div style="font-size: 1.2rem; margin-bottom: 5px;">+</div>
                        <div style="color: #8B95A7; font-size: 11px;">Adicione tipos de ingresso</div>
                    </div>
                `;
                return;
            }
            
            // Buscar nomes dos ingressos antes de renderizar
            buscarNomesItensEExibir(itens, editComboItemsList);
            
        } catch (error) {
            console.error('❌ Erro ao carregar itens do combo:', error);
            editComboItemsList.innerHTML = `
                <div style="color: #dc3545; padding: 8px; font-size: 12px;">
                    Erro ao carregar itens do combo
                </div>
            `;
        }
    }
    
    /**
     * Buscar nomes dos ingressos e renderizar itens
     */
    async function buscarNomesItensEExibir(itens, container) {
        console.log('🔍 Buscando nomes dos ingressos para os itens do combo');
        
        // Renderizar primeiro com IDs, depois atualizar com nomes
        renderizarItensCombo(itens, container);
        
        try {
            const eventoId = window.eventoId ||
                getCookie('evento_id') ||
                new URLSearchParams(window.location.search).get('evento_id') ||
                document.querySelector('[name="evento_id"]')?.value || '';
            
            if (!eventoId) {
                console.warn('⚠️ evento_id não encontrado para buscar nomes dos ingressos');
                return;
            }
            
            // Buscar nomes dos ingressos
            for (let i = 0; i < itens.length; i++) {
                const item = itens[i];
                const ingressoId = item.ingresso_id;
                
                if (ingressoId) {
                    try {
                        const response = await fetch('/produtor/ajax/wizard_evento.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            body: new URLSearchParams({
                                action: 'buscar_ingresso',
                                ingresso_id: ingressoId,
                                evento_id: eventoId
                            })
                        });
                        
                        const resultado = await response.json();
                        
                        if (resultado.sucesso && resultado.ingresso) {
                            itens[i].nome = resultado.ingresso.titulo;
                        }
                    } catch (error) {
                        console.warn(`⚠️ Erro ao buscar nome do ingresso ${ingressoId}:`, error);
                    }
                }
            }
            
            // Re-renderizar com nomes atualizados
            renderizarItensCombo(itens, container);
            
        } catch (error) {
            console.error('❌ Erro ao buscar nomes dos ingressos:', error);
        }
    }
    
    /**
     * Renderizar itens do combo no container
     */
    function renderizarItensCombo(itens, container) {
        const itensHtml = itens.map((item, index) => `
            <div class="combo-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: #f8f9fa; border-radius: 4px; margin-bottom: 5px;">
                <div>
                    <strong>${item.nome || item.titulo || `Ingresso ${item.ingresso_id}` || 'Item sem nome'}</strong>
                    <span style="color: #666; font-size: 12px;"> × ${item.quantidade || 1}</span>
                </div>
                <button type="button" onclick="removerItemComboModal(${index})" style="background: #dc3545; color: white; border: none; border-radius: 3px; padding: 2px 6px; cursor: pointer;">×</button>
            </div>
        `).join('');
        
        container.innerHTML = itensHtml;
        console.log(`📦 ${itens.length} itens renderizados no combo`);
    }
    
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
    
    /**
     * Formatar valor monetário para o padrão brasileiro
     */
    function formatarValorMonetario(valor) {
        // Se já está formatado (contém R$), retornar como está
        if (typeof valor === 'string' && valor.includes('R$')) {
            return valor;
        }
        
        // Converter para número tratando ambos os formatos (ponto e vírgula)
        let numeroLimpo = valor;
        if (typeof valor === 'string') {
            // Remove R$, espaços e converte vírgula para ponto
            numeroLimpo = valor.replace(/[R$\s]/g, '').replace(',', '.');
        }
        
        const numero = parseFloat(numeroLimpo) || 0;
        
        // Formatar no padrão brasileiro: R$ 00,00
        return `R$ ${numero.toFixed(2).replace('.', ',')}`;
    }
    
    /**
     * Converter valor monetário brasileiro para número (função global)
     */
    window.converterPrecoParaNumero = function(valorMonetario) {
        if (typeof valorMonetario === 'number') {
            return valorMonetario;
        }
        
        if (!valorMonetario || valorMonetario === '') {
            return 0;
        }
        
        // Remove R$ e espaços
        let valor = valorMonetario.toString().replace(/[R$\s]/g, '');
        
        // Se contém vírgula, assumir que é o separador decimal brasileiro
        if (valor.includes(',')) {
            // Se tem pontos também, eles são separadores de milhares
            valor = valor.replace(/\./g, '').replace(',', '.');
        }
        // Se só tem pontos, verificar se é decimal ou separador de milhares
        else if (valor.includes('.')) {
            const partes = valor.split('.');
            // Se a última parte tem exatamente 2 dígitos, provavelmente é decimal
            if (partes.length === 2 && partes[1].length === 2) {
                // Manter como está (formato americano)
            } else {
                // Remover pontos (separadores de milhares)
                valor = valor.replace(/\./g, '');
            }
        }
        
        const numero = parseFloat(valor) || 0;
        return numero;
    };
    
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
