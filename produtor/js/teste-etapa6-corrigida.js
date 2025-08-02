/**
 * TESTE RÁPIDO PARA ETAPA 6 CORRIGIDA
 * Verifica se o salvamento funciona após correção do bind_param
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Função para testar salvamento simples
    window.testeRapidoEtapa6 = function() {
        console.log('🧪 Teste rápido - Salvamento Etapa 6');
        
        const eventoId = new URLSearchParams(window.location.search).get('evento_id') || '49';
        
        const ingressoSimples = [{
            tipo: "paid",
            titulo: "Teste Simples", 
            descricao: "Teste após correção",
            quantidade: 50,
            preco: 25.00,
            taxa_plataforma: 2.00,
            valor_receber: 25.00,
            limite_min: 1,
            limite_max: 2,
            lote_nome: ""
        }];
        
        console.log('📤 Enviando ingresso de teste:', ingressoSimples);
        
        fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'salvar_etapa',
                evento_id: eventoId,
                etapa: '6',
                ingressos: JSON.stringify(ingressoSimples)
            })
        })
        .then(response => {
            console.log('📥 Status da resposta:', response.status);
            return response.text(); // Usar text() primeiro para ver se há erro
        })
        .then(data => {
            console.log('📄 Resposta bruta:', data);
            
            try {
                const jsonData = JSON.parse(data);
                if (jsonData.sucesso) {
                    console.log('✅ TESTE PASSOU!', jsonData.mensagem);
                    alert('✅ Teste passou! O salvamento está funcionando.');
                } else {
                    console.error('❌ TESTE FALHOU:', jsonData.erro);
                    alert('❌ Teste falhou: ' + jsonData.erro);
                }
            } catch (e) {
                console.error('❌ Resposta não é JSON válido:', data);
                alert('❌ Erro: Resposta inválida do servidor');
            }
        })
        .catch(error => {
            console.error('❌ Erro na requisição:', error);
            alert('❌ Erro na requisição: ' + error.message);
        });
    };
    
    // Auto-executar teste após 2 segundos se estivermos na página certa
    if (window.location.href.includes('evento_id=')) {
        setTimeout(() => {
            console.log('🎯 Para testar a correção, execute: testeRapidoEtapa6()');
        }, 2000);
    }
    
});
