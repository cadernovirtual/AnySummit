/**
 * TESTE ESPECÍFICO PARA VERIFICAR SALVAMENTO DO LOTE_ID
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Função para testar salvamento do lote_id
    window.testarSalvamentoLoteId = function() {
        console.log('🧪 Testando salvamento do lote_id...');
        
        const eventoId = new URLSearchParams(window.location.search).get('evento_id') || '49';
        
        // Verificar se há lotes disponíveis
        console.log('📦 Lotes disponíveis:', window.lotesData);
        
        if (!window.lotesData || (!window.lotesData.porData?.length && !window.lotesData.porPercentual?.length)) {
            console.log('⚠️ Nenhum lote disponível. Criando lote de teste...');
            alert('⚠️ Primeiro crie um lote na etapa 5 para testar a associação');
            return;
        }
        
        // Pegar primeiro lote disponível
        const lotesTodos = [...(window.lotesData.porData || []), ...(window.lotesData.porPercentual || [])];
        const primeiroLote = lotesTodos[0];
        
        console.log('🎯 Usando lote para teste:', primeiroLote);
        
        // Criar ingresso de teste com lote associado
        const ingressoComLote = [{
            tipo: "pago",
            titulo: "Teste Lote ID",
            descricao: "Testando associação com lote",
            quantidade: 50,
            preco: 100.00,
            taxa_plataforma: 8.00,
            valor_receber: 100.00,
            inicio_venda: "2024-03-01T10:00",
            fim_venda: "2024-03-31T23:59",
            limite_min: 1,
            limite_max: 3,
            lote_nome: primeiroLote.nome // ESTE É O CAMPO CHAVE
        }];
        
        console.log('📤 Enviando ingresso com lote:', ingressoComLote);
        
        fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'salvar_etapa',
                evento_id: eventoId,
                etapa: '6',
                ingressos: JSON.stringify(ingressoComLote)
            })
        })
        .then(response => response.text())
        .then(data => {
            console.log('📥 Resposta do servidor:', data);
            
            try {
                const jsonData = JSON.parse(data);
                if (jsonData.sucesso) {
                    console.log('✅ Ingresso salvo! Verificando no banco...');
                    verificarLoteIdNoBanco(eventoId);
                } else {
                    console.error('❌ Erro ao salvar:', jsonData.erro);
                    alert('❌ Erro: ' + jsonData.erro);
                }
            } catch (e) {
                console.error('❌ Resposta não é JSON:', data);
                
                // Se há erro de PHP, pode estar nos logs
                if (data.includes('Fatal error') || data.includes('Warning')) {
                    console.error('🐛 Erro de PHP detectado na resposta');
                    alert('❌ Erro de PHP - verifique o console');
                } else {
                    alert('❌ Resposta inesperada do servidor');
                }
            }
        })
        .catch(error => {
            console.error('❌ Erro na requisição:', error);
            alert('❌ Erro na requisição: ' + error.message);
        });
    };
    
    // Função para verificar lote_id no banco (via debug)
    function verificarLoteIdNoBanco(eventoId) {
        console.log('🔍 Verificando lote_id salvo no banco...');
        
        // Abrir página de debug em nova aba
        const debugUrl = `/produtor/debug-tabelas.php?evento_id=${eventoId}`;
        window.open(debugUrl, '_blank');
        
        console.log('📊 Página de debug aberta. Verifique a coluna lote_id na tabela ingressos');
    }
    
    // Função para verificar mapeamento de lotes
    window.verificarMapeamentoLotes = function() {
        console.log('🗺️ Verificando mapeamento de lotes...');
        
        if (!window.lotesData) {
            console.log('❌ window.lotesData não disponível');
            return;
        }
        
        console.log('📦 Lotes por data:', window.lotesData.porData?.length || 0);
        window.lotesData.porData?.forEach((lote, index) => {
            console.log(`  ${index + 1}. "${lote.nome}" (ID: ${lote.id}) - ${lote.dataInicio} até ${lote.dataFim}`);
        });
        
        console.log('📊 Lotes por percentual:', window.lotesData.porPercentual?.length || 0);
        window.lotesData.porPercentual?.forEach((lote, index) => {
            console.log(`  ${index + 1}. "${lote.nome}" (ID: ${lote.id}) - ${lote.percentual}%`);
        });
        
        // Testar se nomes coincidem
        const todosLotes = [...(window.lotesData.porData || []), ...(window.lotesData.porPercentual || [])];
        console.log('🎯 Nomes de lotes disponíveis para associação:');
        todosLotes.forEach(lote => {
            console.log(`  - "${lote.nome}"`);
        });
    };
    
    console.log('🧪 Testes de lote_id carregados:');
    console.log('  - testarSalvamentoLoteId() - Testa salvamento completo');
    console.log('  - verificarMapeamentoLotes() - Lista lotes disponíveis');
});
