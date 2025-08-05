/**
 * CORREÇÃO: Checkbox dos termos na etapa 8
 * - Problema 1: Checkbox vinha marcado e readonly quando não deveria
 * - Problema 2: Botão "Publicar Evento" não era habilitado quando checkbox estava marcado
 * - Problema 3: Campo eventos.termos_aceitos não recebia 1 quando checkbox era marcado
 * - Problema 4: Após evento publicado, checkbox deveria desaparecer e botão virar "Acessar Página do Evento"
 */

console.log('🔧 [Termos Fix] Carregando correção do checkbox dos termos...');

// Aguardar DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 [Termos Fix] DOM carregado, aplicando correções...');
    
    // Dados do evento do PHP
    const dadosEvento = window.dadosEvento || {};
    console.log('🔧 [Termos Fix] Dados do evento:', dadosEvento);
    
    const eventoPublicado = dadosEvento.status === 'publicado';
    const termosJaAceitos = dadosEvento.termosAceitos === 1;
    
    console.log('🔧 [Termos Fix] Status:', {
        eventoPublicado,
        termosJaAceitos,
        status: dadosEvento.status,
        termosAceitos: dadosEvento.termosAceitos
    });
    
    // Aguardar elemento estar disponível
    setTimeout(() => {
        inicializarCheckboxTermos();
    }, 1000);
});

function inicializarCheckboxTermos() {
    const checkbox = document.getElementById('termsCheckbox');
    const botaoPublicar = document.querySelector('button[onclick="publicarEvento()"]');
    const dadosEvento = window.dadosEvento || {};
    
    if (!checkbox) {
        console.log('🔧 [Termos Fix] Checkbox não encontrado ainda, tentando novamente...');
        setTimeout(inicializarCheckboxTermos, 500);
        return;
    }
    
    console.log('🔧 [Termos Fix] Checkbox encontrado:', checkbox);
    console.log('🔧 [Termos Fix] Botão publicar encontrado:', botaoPublicar);
    
    const eventoPublicado = dadosEvento.status === 'publicado';
    const termosJaAceitos = dadosEvento.termosAceitos === 1;
    
    // CORREÇÃO 1: Se evento já foi publicado, alterar interface
    if (eventoPublicado && termosJaAceitos) {
        console.log('🔧 [Termos Fix] Evento já publicado - alterando interface...');
        
        // Esconder checkbox e texto dos termos
        const checkboxGroup = checkbox.closest('.checkbox-group');
        if (checkboxGroup) {
            checkboxGroup.style.display = 'none';
        }
        
        // Alterar botão para "Acessar Página do Evento"
        if (botaoPublicar) {
            botaoPublicar.innerHTML = '🌐 Acessar Página do Evento';
            botaoPublicar.onclick = function() {
                // Gerar slug do evento ou usar ID
                const eventoId = dadosEvento.id;
                window.open(`/evento/evento.php?id=${eventoId}`, '_blank');
            };
        }
        
        return; // Não aplicar outras correções
    }
    
    // CORREÇÃO 2: Estado inicial correto do checkbox
    if (termosJaAceitos) {
        console.log('🔧 [Termos Fix] Termos já aceitos - marcando checkbox...');
        checkbox.classList.add('checked');
    } else {
        console.log('🔧 [Termos Fix] Termos não aceitos - desmarcando checkbox...');
        checkbox.classList.remove('checked');
    }
    
    // CORREÇÃO 3: Remover readonly do checkbox (se existir)
    checkbox.removeAttribute('readonly');
    checkbox.style.pointerEvents = 'auto';
    checkbox.style.cursor = 'pointer';
    
    // CORREÇÃO 4: Adicionar listener de clique
    checkbox.addEventListener('click', function() {
        console.log('🔧 [Termos Fix] Checkbox clicado');
        
        // Alternar estado
        if (checkbox.classList.contains('checked')) {
            checkbox.classList.remove('checked');
        } else {
            checkbox.classList.add('checked');
        }
        
        // Verificar estado do botão
        verificarEstadoBotaoPublicar();
        
        // Salvar estado no banco via AJAX
        salvarEstadoTermos();
    });
    
    // CORREÇÃO 5: Estado inicial do botão
    verificarEstadoBotaoPublicar();
}

function verificarEstadoBotaoPublicar() {
    const checkbox = document.getElementById('termsCheckbox');
    const botaoPublicar = document.querySelector('button[onclick="publicarEvento()"]');
    
    if (!checkbox || !botaoPublicar) return;
    
    const termosAceitos = checkbox.classList.contains('checked');
    
    console.log('🔧 [Termos Fix] Verificando botão publicar:', {
        termosAceitos,
        botaoEncontrado: !!botaoPublicar
    });
    
    if (termosAceitos) {
        // Habilitar botão
        botaoPublicar.disabled = false;
        botaoPublicar.style.opacity = '1';
        botaoPublicar.style.cursor = 'pointer';
        botaoPublicar.style.pointerEvents = 'auto';
    } else {
        // Desabilitar botão
        botaoPublicar.disabled = true;
        botaoPublicar.style.opacity = '0.5';
        botaoPublicar.style.cursor = 'not-allowed';
        botaoPublicar.style.pointerEvents = 'none';
    }
}

function salvarEstadoTermos() {
    const checkbox = document.getElementById('termsCheckbox');
    const dadosEvento = window.dadosEvento || {};
    
    if (!checkbox || !dadosEvento.id) return;
    
    const termosAceitos = checkbox.classList.contains('checked') ? 1 : 0;
    
    console.log('🔧 [Termos Fix] Salvando estado dos termos:', termosAceitos);
    
    // Chamar a mesma função de salvar etapa que já existe
    const formData = new FormData();
    formData.append('action', 'salvar_etapa');
    formData.append('etapa', '8');
    formData.append('evento_id', dadosEvento.id);
    formData.append('termos_aceitos', termosAceitos);
    formData.append('visibilidade', getVisibilidadeAtual());
    
    fetch('/produtor/ajax/wizard_evento.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('🔧 [Termos Fix] Estado dos termos salvo:', data);
        
        // Atualizar dados locais
        window.dadosEvento.termosAceitos = termosAceitos;
    })
    .catch(error => {
        console.error('🔧 [Termos Fix] Erro ao salvar termos:', error);
    });
}

function getVisibilidadeAtual() {
    // Pegar visibilidade selecionada nos radio buttons
    const radioPublico = document.querySelector('.radio[data-value="public"]');
    const radioPrivado = document.querySelector('.radio[data-value="private"]');
    
    if (radioPublico && radioPublico.classList.contains('checked')) {
        return 'public';
    } else if (radioPrivado && radioPrivado.classList.contains('checked')) {
        return 'private';
    }
    
    return 'public'; // Padrão
}

// CORREÇÃO 6: Override da função de validação da etapa 8
function validarEtapa8() {
    const checkbox = document.getElementById('termsCheckbox');
    const dadosEvento = window.dadosEvento || {};
    
    // Se evento já foi publicado, sempre válido
    if (dadosEvento.status === 'publicado') {
        return true;
    }
    
    // Verificar se termos foram aceitos
    const termosAceitos = checkbox && checkbox.classList.contains('checked');
    
    console.log('🔧 [Termos Fix] Validação etapa 8:', {
        termosAceitos,
        checkboxEncontrado: !!checkbox
    });
    
    return termosAceitos;
}

// CORREÇÃO 7: Override da função publicarEvento para garantir que termos sejam salvos
const publicarEventoOriginal = window.publicarEvento;

window.publicarEvento = function() {
    console.log('🔧 [Termos Fix] Função publicarEvento interceptada');
    
    const dadosEvento = window.dadosEvento || {};
    
    // Se evento já foi publicado, redirecionar
    if (dadosEvento.status === 'publicado') {
        const eventoId = dadosEvento.id;
        window.open(`/evento/evento.php?id=${eventoId}`, '_blank');
        return;
    }
    
    // Verificar se termos foram aceitos
    if (!validarEtapa8()) {
        alert('Por favor, aceite os termos de uso para publicar o evento.');
        return;
    }
    
    // Salvar termos antes de publicar
    salvarEstadoTermos();
    
    // Aguardar salvamento e chamar função original
    setTimeout(() => {
        if (publicarEventoOriginal) {
            publicarEventoOriginal();
        }
    }, 500);
};

console.log('🔧 [Termos Fix] Correções aplicadas com sucesso!');