/**
 * FIX: Erro "salvarLoteData is not defined"
 * 
 * PROBLEMA RESOLVIDO:
 * - Função salvarLoteData não estava disponível globalmente
 * - Modal de edição de lote chamava função inexistente
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Fix para salvarLoteData carregado');
    
    // =======================================================
    // VERIFICAR E CRIAR FUNÇÃO salvarLoteData SE NÃO EXISTIR
    // =======================================================
    
    setTimeout(() => {
        if (typeof window.salvarLoteData !== 'function') {
            console.log('⚠️ Função salvarLoteData não encontrada, criando implementação...');
            
            window.salvarLoteData = function() {
                console.log('💾 [FIX] Salvando edição de lote por data...');
                
                try {
                    // COLETAR DADOS DO MODAL
                    const id = document.getElementById('editLoteDataId')?.value;
                    
                    // CORREÇÃO: Buscar nome original do lote, não forçar "Lote Editado"
                    let nome = document.getElementById('editLoteDataNome')?.value;
                    if (!nome || nome.trim() === '') {
                        // Se não há campo nome ou está vazio, manter nome original
                        const loteOriginal = window.lotesData?.porData?.find(l => l.id == id);
                        nome = loteOriginal?.nome || `Lote por Data ${id}`;
                        console.log('📝 Nome não informado, usando:', nome);
                    }
                    
                    const dataInicio = document.getElementById('editLoteDataInicio')?.value;
                    const dataFim = document.getElementById('editLoteDataFim')?.value;
                    const divulgar = document.getElementById('editLoteDataDivulgar')?.checked || false;
                    
                    console.log('📊 Dados coletados:', { id, nome, dataInicio, dataFim, divulgar });
                    
                    // VALIDAÇÕES
                    if (!id) {
                        alert('Erro: ID do lote não encontrado');
                        return;
                    }
                    
                    if (!dataInicio || !dataFim) {
                        alert('Por favor, preencha as datas de início e fim');
                        return;
                    }
                    
                    // Verificar se as datas são válidas
                    const dataInicioObj = new Date(dataInicio);
                    const dataFimObj = new Date(dataFim);
                    
                    if (isNaN(dataInicioObj.getTime()) || isNaN(dataFimObj.getTime())) {
                        alert('Datas inválidas. Verifique o formato das datas.');
                        return;
                    }
                    
                    if (dataInicioObj >= dataFimObj) {
                        alert('A data de fim deve ser posterior à data de início');
                        return;
                    }
                    
                    // SALVAR NO BANCO
                    salvarLoteNoBanco({
                        id: parseInt(id),
                        nome: nome,
                        tipo: 'data',
                        data_inicio: dataInicio,
                        data_fim: dataFim,
                        divulgar_criterio: divulgar
                    });
                    
                } catch (error) {
                    console.error('❌ Erro ao salvar lote:', error);
                    alert('Erro interno. Verifique o console para mais detalhes.');
                }
            };
            
            console.log('✅ Função salvarLoteData criada');
            
        } else {
            console.log('✅ Função salvarLoteData já existe');
        }
        
        // VERIFICAR OUTRAS FUNÇÕES DE LOTE
        verificarFuncoesLote();
        
    }, 1000);
    
    // =======================================================
    // FUNÇÃO AUXILIAR PARA SALVAR NO BANCO
    // =======================================================
    
    async function salvarLoteNoBanco(dadosLote) {
        try {
            const eventoId = new URLSearchParams(window.location.search).get('evento_id');
            
            const dadosEnvio = {
                action: 'salvar_lote',
                evento_id: eventoId,
                id: dadosLote.id, // Para UPDATE
                nome: dadosLote.nome,
                tipo: dadosLote.tipo,
                data_inicio: dadosLote.data_inicio,
                data_fim: dadosLote.data_fim,
                divulgar_criterio: dadosLote.divulgar_criterio ? 1 : 0
            };
            
            console.log('📤 Enviando dados do lote para API:', dadosEnvio);
            
            const response = await fetch('/produtor/ajax/wizard_evento.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(dadosEnvio).toString()
            });
            
            const resultado = await response.json();
            console.log('📥 Resposta da API:', resultado);
            
            if (resultado.sucesso) {
                alert('Lote salvo com sucesso!');
                
                // FECHAR MODAL
                if (window.closeModal) {
                    window.closeModal('editLoteDataModal');
                }
                
                // CORREÇÃO: NÃO recarregar nada para preservar interface
                console.log('✅ Lote salvo com sucesso - interface preservada');
                // NÃO chama atualizarListaLotes() que estava limpando a tela
                
            } else {
                console.error('❌ Erro na API:', resultado.erro);
                alert('Erro ao salvar: ' + (resultado.erro || 'Erro desconhecido'));
            }
            
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
            alert('Erro de conexão. Tente novamente.');
        }
    }
    
    // =======================================================
    // VERIFICAR OUTRAS FUNÇÕES DE LOTE
    // =======================================================
    
    function verificarFuncoesLote() {
        const funcoesNecessarias = [
            'salvarLotePercentual',
            'editarLoteData', 
            'editarLotePercentual',
            'excluirLoteData',
            'excluirLotePercentual'
        ];
        
        funcoesNecessarias.forEach(nomeFuncao => {
            if (typeof window[nomeFuncao] !== 'function') {
                console.warn(`⚠️ Função ${nomeFuncao} não encontrada`);
                
                // Criar stub para evitar erros
                window[nomeFuncao] = function() {
                    alert(`Função ${nomeFuncao} não implementada. Verifique se o arquivo lotes.js está carregado.`);
                };
            }
        });
    }
    
    // =======================================================
    // FUNÇÃO AUXILIAR PARA ATUALIZAR LISTA
    // =======================================================
    
    function atualizarListaLotes() {
        // Tentar recarregar a lista de lotes se a função existir
        if (typeof window.carregarLotesDoCookie === 'function') {
            window.carregarLotesDoCookie();
        } else if (typeof window.renderizarLotesPorData === 'function') {
            window.renderizarLotesPorData();
        } else {
            console.log('🔄 Funções de atualização de lista não encontradas');
            
            // Forçar refresh da página como último recurso
            setTimeout(() => {
                if (confirm('Lote salvo! Deseja recarregar a página para ver as alterações?')) {
                    window.location.reload();
                }
            }, 500);
        }
    }
    
    console.log('✅ Fix para salvarLoteData configurado');
});
