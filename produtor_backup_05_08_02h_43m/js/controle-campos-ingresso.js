/**
 * CONTROLE DE CAMPOS DE INGRESSO BASEADO NO TIPO DE LOTE
 * Bloqueia edição de inicio_venda e fim_venda quando lote é "por data"
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 Sistema de controle de campos de ingresso carregado');
    
    // Monitorar mudanças nos campos de lote
    function monitorarCamposLote() {
        // Buscar todos os selects de lote em modais de ingresso
        const loteSelects = document.querySelectorAll('select[name*="lote"], select[id*="lote"], select[class*="lote"]');
        
        loteSelects.forEach(select => {
            select.addEventListener('change', function() {
                controlarCamposDataIngresso(this);
            });
            
            // Aplicar controle inicial
            if (select.value) {
                controlarCamposDataIngresso(select);
            }
        });
        
        console.log(`🎯 Monitorando ${loteSelects.length} campos de lote`);
    }
    
    // Controlar campos de data do ingresso baseado no tipo de lote
    function controlarCamposDataIngresso(loteSelect) {
        const loteNome = loteSelect.value;
        
        if (!loteNome) {
            liberarCamposData(loteSelect);
            return;
        }
        
        // Obter informações do lote selecionado
        const tipoLote = obterTipoLote(loteNome);
        
        console.log(`🔍 Lote selecionado: "${loteNome}" - Tipo: ${tipoLote}`);
        
        if (tipoLote === 'data') {
            bloquearCamposData(loteSelect, loteNome);
        } else {
            liberarCamposData(loteSelect);
        }
    }
    
    // Obter tipo do lote baseado no nome
    function obterTipoLote(nomeDoLote) {
        // Verificar em window.lotesData primeiro
        if (window.lotesData) {
            // Verificar lotes por data
            const lotePorData = window.lotesData.porData?.find(lote => lote.nome === nomeDoLote);
            if (lotePorData) {
                return 'data';
            }
            
            // Verificar lotes por percentual
            const lotePorPercentual = window.lotesData.porPercentual?.find(lote => lote.nome === nomeDoLote);
            if (lotePorPercentual) {
                return 'percentual';
            }
        }
        
        // Tentar identificar pelo nome (fallback)
        if (nomeDoLote.includes('Data') || nomeDoLote.includes('Prazo')) {
            return 'data';
        }
        
        if (nomeDoLote.includes('%') || nomeDoLote.includes('Percentual')) {
            return 'percentual';
        }
        
        console.warn(`⚠️ Não foi possível determinar o tipo do lote: ${nomeDoLote}`);
        return 'desconhecido';
    }
    
    // Bloquear campos de data quando lote é por data
    function bloquearCamposData(loteSelect, loteNome) {
        const container = loteSelect.closest('.modal, .ticket-form, .form-container') || document;
        
        // Buscar campos de data
        const camposData = container.querySelectorAll(
            'input[name*="inicio"], input[name*="start"], input[id*="start"], ' +
            'input[name*="fim"], input[name*="end"], input[id*="end"], ' +
            'input[type="datetime-local"]'
        );
        
        camposData.forEach(campo => {
            if (campo.name.includes('inicio') || campo.name.includes('start') || 
                campo.id.includes('inicio') || campo.id.includes('start') ||
                campo.name.includes('fim') || campo.name.includes('end') ||
                campo.id.includes('fim') || campo.id.includes('end')) {
                
                // Bloquear campo
                campo.disabled = true;
                campo.style.backgroundColor = '#f5f5f5';
                campo.style.cursor = 'not-allowed';
                
                // Adicionar explicação
                adicionarExplicacao(campo, loteNome);
                
                console.log(`🔒 Campo bloqueado: ${campo.name || campo.id}`);
            }
        });
        
        // Buscar datas do lote e aplicar
        aplicarDatasDoLote(container, loteNome);
    }
    
    // Liberar campos de data quando lote não é por data
    function liberarCamposData(loteSelect) {
        const container = loteSelect.closest('.modal, .ticket-form, .form-container') || document;
        
        const camposData = container.querySelectorAll(
            'input[name*="inicio"], input[name*="start"], input[id*="start"], ' +
            'input[name*="fim"], input[name*="end"], input[id*="end"], ' +
            'input[type="datetime-local"]'
        );
        
        camposData.forEach(campo => {
            // Liberar campo
            campo.disabled = false;
            campo.style.backgroundColor = '';
            campo.style.cursor = '';
            
            // Remover explicação
            removerExplicacao(campo);
            
            console.log(`🔓 Campo liberado: ${campo.name || campo.id}`);
        });
    }
    
    // Adicionar explicação sobre bloqueio
    function adicionarExplicacao(campo, loteNome) {
        const explicacaoId = `explicacao-${campo.id || campo.name}`;
        
        // Remover explicação anterior
        const explicacaoAnterior = document.getElementById(explicacaoId);
        if (explicacaoAnterior) {
            explicacaoAnterior.remove();
        }
        
        // Criar nova explicação
        const explicacao = document.createElement('div');
        explicacao.id = explicacaoId;
        explicacao.className = 'explicacao-lote-data';
        explicacao.style.cssText = `
            font-size: 12px;
            color: #666;
            margin-top: 4px;
            padding: 6px;
            background: #fff3cd;
            border: 1px solid #ffeeba;
            border-radius: 4px;
        `;
        explicacao.innerHTML = `
            <i>🔒 Campo bloqueado: As datas serão iguais às do lote "${loteNome}" (por data). 
            Para editá-las, associe o ingresso a um lote por percentual ou deixe sem lote.</i>
        `;
        
        campo.parentNode.insertBefore(explicacao, campo.nextSibling);
    }
    
    // Remover explicação
    function removerExplicacao(campo) {
        const explicacaoId = `explicacao-${campo.id || campo.name}`;
        const explicacao = document.getElementById(explicacaoId);
        if (explicacao) {
            explicacao.remove();
        }
    }
    
    // Aplicar datas do lote aos campos
    function aplicarDatasDoLote(container, loteNome) {
        if (!window.lotesData || !window.lotesData.porData) {
            return;
        }
        
        const lote = window.lotesData.porData.find(l => l.nome === loteNome);
        if (!lote) {
            return;
        }
        
        // Aplicar data de início
        const camposInicio = container.querySelectorAll(
            'input[name*="inicio"], input[name*="start"], input[id*="start"]'
        );
        camposInicio.forEach(campo => {
            if (lote.dataInicio) {
                campo.value = lote.dataInicio;
            }
        });
        
        // Aplicar data de fim
        const camposFim = container.querySelectorAll(
            'input[name*="fim"], input[name*="end"], input[id*="end"]'
        );
        camposFim.forEach(campo => {
            if (lote.dataFim) {
                campo.value = lote.dataFim;
            }
        });
        
        console.log(`📅 Datas do lote "${loteNome}" aplicadas: ${lote.dataInicio} até ${lote.dataFim}`);
    }
    
    // Inicializar monitoramento
    setTimeout(() => {
        monitorarCamposLote();
        
        // Re-monitorar quando novos modais forem abertos
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && (node.classList?.contains('modal') || node.querySelector?.('.modal'))) {
                        setTimeout(monitorarCamposLote, 100);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
    }, 1000);
    
    console.log('✅ Sistema de controle de campos de ingresso inicializado');
});
