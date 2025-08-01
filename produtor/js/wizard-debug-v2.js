/**
 * Debug completo do sistema de salvamento V2
 * Verifica todos os dados salvos e identifica problemas
 */
(function() {
    console.log('🔍 Sistema de Debug V2 carregado');
    
    // Função de debug completa
    window.debugWizardCompleto = function() {
        console.log('=== DEBUG COMPLETO DO WIZARD V2 ===');
        
        if (!window.WizardSaveSystemV2) {
            console.error('❌ WizardSaveSystemV2 não encontrado!');
            return;
        }
        
        // Forçar salvamento de todos os steps
        console.log('💾 Salvando todos os steps...');
        for (let i = 1; i <= 8; i++) {
            window.WizardSaveSystemV2.salvarStepAtual(i);
        }
        
        // Obter dados completos
        const dados = window.WizardSaveSystemV2.obterDadosCompletos();
        
        console.log('📊 ESTRUTURA COMPLETA:');
        console.log(dados);
        
        // Verificar campos do evento
        console.log('\n📋 DADOS DO EVENTO:');
        console.log('Nome:', dados.evento.nome || '❌ VAZIO');
        console.log('Classificação:', dados.evento.classificacao || '❌ VAZIO');
        console.log('Categoria:', dados.evento.categoria || '❌ VAZIO');
        console.log('Cor de fundo:', dados.evento.cor_fundo || '❌ VAZIO');
        console.log('Data início:', dados.evento.data_inicio || '❌ VAZIO');
        console.log('Data fim:', dados.evento.data_fim || '❌ VAZIO');
        console.log('Tipo local:', dados.evento.tipo_local || '❌ VAZIO');
        console.log('Descrição completa:', dados.evento.descricao_completa ? '✅ Preenchida' : '❌ VAZIA');
        console.log('Visibilidade:', dados.evento.visibilidade || '❌ VAZIO');
        console.log('Termos aceitos:', dados.evento.termos_aceitos ? '✅ SIM' : '❌ NÃO');
        console.log('Estacionamento:', dados.evento.tem_estacionamento || '❌ VAZIO');
        console.log('Acessibilidade:', dados.evento.tem_acessibilidade || '❌ VAZIO');
        
        // Verificar ingressos
        console.log('\n🎟️ INGRESSOS:');
        if (dados.ingressos && dados.ingressos.length > 0) {
            console.log(`Total: ${dados.ingressos.length} ingresso(s)`);
            dados.ingressos.forEach((ingresso, index) => {
                console.log(`\nIngresso ${index + 1}:`);
                console.log('  Tipo:', ingresso.tipo);
                console.log('  Título:', ingresso.titulo);
                console.log('  Preço:', ingresso.preco);
                console.log('  Quantidade:', ingresso.quantidade_total);
                console.log('  Ativo:', ingresso.ativo);
            });
        } else {
            console.log('❌ Nenhum ingresso encontrado');
        }
        
        // Verificar lotes
        console.log('\n📦 LOTES:');
        const lotes = window.WizardSaveSystemV2.lotes;
        if (lotes && (lotes.porData?.length > 0 || lotes.porPercentual?.length > 0)) {
            console.log('Lotes por data:', lotes.porData?.length || 0);
            console.log('Lotes por percentual:', lotes.porPercentual?.length || 0);
        } else {
            console.log('❌ Nenhum lote encontrado');
        }
        
        // Verificar cookies
        console.log('\n🍪 COOKIES:');
        console.log('eventoWizardV2:', getCookie('eventoWizardV2') ? '✅ Existe' : '❌ Não existe');
        console.log('lotesData:', getCookie('lotesData') ? '✅ Existe' : '❌ Não existe');
        
        // Formato JSON para envio
        console.log('\n📤 JSON PARA ENVIO:');
        console.log(JSON.stringify(dados, null, 2));
    };
    
    // Função para verificar campos vazios
    window.verificarCamposVazios = function() {
        console.log('=== VERIFICANDO CAMPOS VAZIOS ===');
        
        const campos = {
            'eventName': 'Nome do evento',
            'classification': 'Classificação',
            'category': 'Categoria',
            'corFundo': 'Cor de fundo',
            'startDateTime': 'Data/hora início',
            'endDateTime': 'Data/hora fim',
            'eventDescription': 'Descrição',
            'venueName': 'Nome do local',
            'city': 'Cidade',
            'state': 'Estado'
        };
        
        Object.entries(campos).forEach(([id, nome]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                const valor = elemento.value || elemento.innerHTML || '';
                if (!valor.trim()) {
                    console.log(`❌ ${nome}: VAZIO`);
                } else {
                    console.log(`✅ ${nome}: ${valor.substring(0, 50)}...`);
                }
            } else {
                console.log(`⚠️ ${nome}: Elemento não encontrado`);
            }
        });
    };
    
    // Auto-executar debug ao carregar
    setTimeout(() => {
        console.log('💡 Execute debugWizardCompleto() para ver todos os dados');
        console.log('💡 Execute verificarCamposVazios() para verificar campos');
    }, 1000);
})();