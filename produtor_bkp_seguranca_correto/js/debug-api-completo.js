/**
 * DEBUG COMPLETO - Mostra exatamente o que está sendo enviado e recebido
 */

(function() {
    console.log('🔍 DEBUG COMPLETO DE ENVIO ATIVADO');
    
    // Interceptar fetch para ver detalhes
    const fetchOriginal = window.fetch;
    window.fetch = async function(url, options) {
        if (url.includes('criaeventoapi.php')) {
            console.log('📤 === INTERCEPTANDO ENVIO PARA API ===');
            console.log('URL:', url);
            console.log('Method:', options.method);
            console.log('Headers:', options.headers);
            
            // Mostrar dados sendo enviados
            if (options.body) {
                console.log('📊 DADOS SENDO ENVIADOS:');
                try {
                    const dados = JSON.parse(options.body);
                    console.log(JSON.stringify(dados, null, 2));
                    
                    // Validar campos obrigatórios
                    console.log('\n✅ VALIDAÇÃO DE CAMPOS:');
                    console.log('- nome:', dados.nome || '❌ FALTANDO');
                    console.log('- descricao_completa:', dados.descricao_completa || '❌ FALTANDO');
                    console.log('- classificacao:', dados.classificacao || '❌ FALTANDO');
                    console.log('- categoria:', dados.categoria || '❌ FALTANDO');
                    console.log('- data_inicio:', dados.data_inicio || '❌ FALTANDO');
                    console.log('- tipo_local:', dados.tipo_local || '❌ FALTANDO');
                    console.log('- nome_local:', dados.nome_local || '❌ FALTANDO');
                    console.log('- tipo_produtor:', dados.tipo_produtor || '❌ FALTANDO');
                    console.log('- visibilidade:', dados.visibilidade || '❌ FALTANDO');
                    console.log('- lotes:', Array.isArray(dados.lotes) ? dados.lotes.length + ' lotes' : '❌ FALTANDO');
                    console.log('- ingressos:', Array.isArray(dados.ingressos) ? dados.ingressos.length + ' ingressos' : '❌ FALTANDO');
                    
                } catch (e) {
                    console.error('❌ Body não é JSON válido:', e);
                }
            }
            
            // Fazer a requisição
            try {
                const response = await fetchOriginal.apply(this, arguments);
                
                // Clonar resposta para ler
                const responseClone = response.clone();
                const texto = await responseClone.text();
                
                console.log('\n📥 === RESPOSTA DA API ===');
                console.log('Status:', response.status, response.statusText);
                console.log('Headers:', response.headers);
                console.log('Resposta completa:', texto);
                
                // Se for erro 500, tentar extrair mensagem
                if (response.status === 500) {
                    console.error('❌ ERRO 500 - Erro interno do servidor');
                    
                    // Procurar por mensagens de erro PHP
                    if (texto.includes('Fatal error')) {
                        console.error('💀 ERRO FATAL PHP:', texto.match(/Fatal error[^<]*/)?.[0]);
                    }
                    if (texto.includes('Warning')) {
                        console.error('⚠️ WARNING PHP:', texto.match(/Warning[^<]*/)?.[0]);
                    }
                    if (texto.includes('Notice')) {
                        console.error('📌 NOTICE PHP:', texto.match(/Notice[^<]*/)?.[0]);
                    }
                    
                    // Procurar por mensagens SQL
                    if (texto.includes('SQL')) {
                        console.error('🗄️ POSSÍVEL ERRO SQL');
                    }
                }
                
                return response;
                
            } catch (error) {
                console.error('❌ ERRO NA REQUISIÇÃO:', error);
                throw error;
            }
        }
        
        return fetchOriginal.apply(this, arguments);
    };
    
    // Criar função para testar com dados mínimos
    window.testarAPIDireta = async function() {
        console.log('🧪 TESTANDO API COM DADOS MÍNIMOS...');
        
        const dadosMinimos = {
            nome: "Evento Teste Debug",
            descricao_completa: "Descrição de teste para debug",
            classificacao: "L",
            categoria: "1", // ID numérico
            data_inicio: "2025-12-01 19:00:00",
            data_fim: "2025-12-01 22:00:00",
            tipo_local: "presencial",
            nome_local: "Local Teste",
            busca_endereco: "Rua Teste, 123",
            endereco: "Rua Teste",
            numero: "123",
            bairro: "Centro",
            cidade: "São Paulo",
            estado: "SP",
            cep: "01234-567",
            pais: "Brasil",
            tipo_produtor: "atual",
            nome_produtor: "Produtor Teste",
            visibilidade: "public",
            tem_estacionamento: "sim",
            tem_acessibilidade: "sim",
            formas_pagamento: {
                pix: true,
                cartao_credito: true,
                cartao_debito: false,
                boleto: false
            },
            taxa_plataforma: 10,
            absorver_taxa_produtor: false,
            lotes: [{
                nome: "Lote 1",
                tipo: "data",
                data_inicio: "2025-07-30 00:00:00",
                data_fim: "2025-11-30 23:59:59",
                publico: "sim",
                ordem: 1
            }],
            ingressos: [{
                tipo: "individual",
                nome: "Ingresso Teste",
                descricao: "Ingresso de teste",
                valor: 50.00,
                quantidade: 100,
                quantidade_por_pedido: 5,
                lote_id: 1,
                ordem: 1,
                taxa_conveniencia: "sim",
                meia_entrada: "não"
            }]
        };
        
        console.log('📤 Enviando dados mínimos:', dadosMinimos);
        
        try {
            const response = await fetch('/produtor/criaeventoapi.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(dadosMinimos)
            });
            
            const texto = await response.text();
            console.log('📥 Resposta:', texto);
            
            if (response.ok) {
                console.log('✅ API respondeu com sucesso!');
            } else {
                console.error('❌ API retornou erro:', response.status);
            }
            
        } catch (error) {
            console.error('❌ Erro ao testar:', error);
        }
    };
    
    // Verificar estrutura esperada pela API
    window.verificarEstruturaDados = function() {
        console.log('📋 === ESTRUTURA DE DADOS ESPERADA PELA API ===');
        console.log(`
Campos obrigatórios:
- nome: string
- descricao_completa: string (não 'descricao')
- classificacao: string (L, 10, 12, 14, 16, 18)
- categoria: número (ID da categoria)
- data_inicio: YYYY-MM-DD HH:MM:SS
- data_fim: YYYY-MM-DD HH:MM:SS
- tipo_local: 'presencial' ou 'online'
- nome_local: string
- tipo_produtor: 'atual' ou 'novo'
- visibilidade: 'public', 'private' ou 'password'

Lotes:
- nome: string
- tipo: 'data' ou 'percentual'
- data_inicio/data_fim: se tipo='data'
- percentual: se tipo='percentual'
- publico: 'sim' ou 'não'

Ingressos:
- tipo: 'individual', 'gratuito' ou 'combo'
- nome: string
- valor: decimal
- quantidade: inteiro
- lote_id: ID do lote (começando em 1)
        `);
    };
    
    console.log('✅ DEBUG COMPLETO INSTALADO!');
    console.log('📌 Comandos disponíveis:');
    console.log('- testarAPIDireta() - Testa com dados mínimos');
    console.log('- verificarEstruturaDados() - Mostra estrutura esperada');
    
})();