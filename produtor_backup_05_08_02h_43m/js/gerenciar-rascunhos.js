/**
 * Sistema para gerenciar criação de novos eventos
 * Verifica rascunhos existentes antes de criar novo
 */

(function() {
    'use strict';
    
    /**
     * Função chamada ao clicar em "Criar Novo Evento" na tela meuseventos.php
     */
    window.criarNovoEvento = function() {
        console.log('🆕 Verificando rascunhos existentes...');
        
        // Verificar se existe rascunho
        fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'action=verificar_rascunho'
        })
        .then(response => response.json())
        .then(data => {
            if (data.existe_rascunho) {
                // Existe rascunho, mostrar modal customizado
                window.mostrarModalRascunho(data);
            } else {
                // Não existe rascunho, ir direto para criação
                window.location.href = '/produtor/novoevento.php';
            }
        })
        .catch(error => {
            console.error('Erro ao verificar rascunho:', error);
            alert('Erro ao verificar eventos. Por favor, tente novamente.');
        });
    };
    
    /**
     * Excluir rascunho e redirecionar para novo
     */
    function excluirRascunhoECriarNovo(eventoId) {
        fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `action=excluir_rascunho&evento_id=${eventoId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                // Redirecionar para criar novo
                window.location.href = '/produtor/novoevento.php';
            } else {
                alert('Erro ao excluir rascunho: ' + data.erro);
            }
        })
        .catch(error => {
            console.error('Erro ao excluir rascunho:', error);
            alert('Erro ao excluir rascunho. Por favor, tente novamente.');
        });
    }
    
    console.log('✅ Sistema de gerenciamento de rascunhos carregado');
    
})();
