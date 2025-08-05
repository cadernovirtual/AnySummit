/**
 * Sistema de diálogo customizado para retomar rascunho
 */

(function() {
    'use strict';
    
    // Criar o HTML do modal se não existir
    function criarModalRascunho() {
        if (document.getElementById('modalRetornarRascunho')) return;
        
        const modalHTML = `
            <div id="modalRetornarRascunho" class="modal-overlay" style="display: none;">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2>Evento em Rascunho Encontrado</h2>
                    </div>
                    <div class="modal-body">
                        <div class="rascunho-info">
                            <div class="info-icon">📋</div>
                            <div class="info-content">
                                <h3 id="rascunhoNome">Nome do Evento</h3>
                                <div class="info-dates">
                                    <p><strong>Criado em:</strong> <span id="rascunhoCriado"></span></p>
                                    <p><strong>Última atualização:</strong> <span id="rascunhoAtualizado"></span></p>
                                </div>
                            </div>
                        </div>
                        <p class="modal-question">O que você deseja fazer?</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="criarNovoEventoDescartandoRascunho()">
                            🗑️ Criar Novo Evento
                        </button>
                        <button class="btn btn-primary" onclick="continuarEditandoRascunho()">
                            ✏️ Continuar Editando
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Adicionar estilos se não existirem
        if (!document.getElementById('rascunho-modal-styles')) {
            const styles = `
                <style id="rascunho-modal-styles">
                    #modalRetornarRascunho {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.8);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 999999;
                        backdrop-filter: blur(4px);
                    }
                    
                    #modalRetornarRascunho .modal-container {
                        background: #2A2A38;
                        border-radius: 16px;
                        max-width: 500px;
                        width: 90%;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        overflow: hidden;
                        animation: modalSlideIn 0.3s ease;
                    }
                    
                    @keyframes modalSlideIn {
                        from {
                            opacity: 0;
                            transform: translateY(-20px) scale(0.95);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }
                    
                    #modalRetornarRascunho .modal-header {
                        background: linear-gradient(135deg, #00C2FF, #725EFF);
                        padding: 20px 24px;
                        color: white;
                    }
                    
                    #modalRetornarRascunho .modal-header h2 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: 600;
                    }
                    
                    #modalRetornarRascunho .modal-body {
                        padding: 24px;
                    }
                    
                    #modalRetornarRascunho .rascunho-info {
                        display: flex;
                        gap: 16px;
                        background: rgba(255, 255, 255, 0.05);
                        padding: 16px;
                        border-radius: 12px;
                        margin-bottom: 20px;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    
                    #modalRetornarRascunho .info-icon {
                        font-size: 48px;
                        flex-shrink: 0;
                    }
                    
                    #modalRetornarRascunho .info-content {
                        flex: 1;
                    }
                    
                    #modalRetornarRascunho .info-content h3 {
                        margin: 0 0 12px 0;
                        color: #FFFFFF;
                        font-size: 20px;
                    }
                    
                    #modalRetornarRascunho .info-dates p {
                        margin: 4px 0;
                        color: #B8B8C8;
                        font-size: 14px;
                    }
                    
                    #modalRetornarRascunho .modal-question {
                        color: #E0E0E8;
                        font-size: 16px;
                        text-align: center;
                        margin-bottom: 0;
                    }
                    
                    #modalRetornarRascunho .modal-footer {
                        padding: 20px 24px;
                        background: rgba(255, 255, 255, 0.02);
                        display: flex;
                        gap: 12px;
                        justify-content: flex-end;
                    }
                    
                    #modalRetornarRascunho .btn {
                        padding: 10px 20px;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    #modalRetornarRascunho .btn-primary {
                        background: linear-gradient(135deg, #00C2FF, #725EFF);
                        color: white;
                    }
                    
                    #modalRetornarRascunho .btn-primary:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(0, 194, 255, 0.4);
                    }
                    
                    #modalRetornarRascunho .btn-secondary {
                        background: rgba(255, 255, 255, 0.1);
                        color: #E0E0E8;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    }
                    
                    #modalRetornarRascunho .btn-secondary:hover {
                        background: rgba(255, 82, 82, 0.2);
                        border-color: rgba(255, 82, 82, 0.3);
                        color: #FF5252;
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }
    
    // Mostrar modal de rascunho
    window.mostrarModalRascunho = function(dadosRascunho) {
        criarModalRascunho();
        
        // Preencher dados
        document.getElementById('rascunhoNome').textContent = dadosRascunho.nome || 'Evento sem nome';
        document.getElementById('rascunhoCriado').textContent = dadosRascunho.criado_em || 'Não disponível';
        document.getElementById('rascunhoAtualizado').textContent = dadosRascunho.atualizado_em || 'Não disponível';
        
        // Guardar evento_id para uso posterior
        window.rascunhoEventoId = dadosRascunho.evento_id;
        
        // Mostrar modal
        document.getElementById('modalRetornarRascunho').style.display = 'flex';
    };
    
    // Continuar editando rascunho
    window.continuarEditandoRascunho = function() {
        if (window.rascunhoEventoId) {
            window.location.href = `/produtor/novoevento.php?evento_id=${window.rascunhoEventoId}`;
        }
    };
    
    // Criar novo evento descartando rascunho
    window.criarNovoEventoDescartandoRascunho = function() {
        const modal = document.getElementById('modalRetornarRascunho');
        modal.style.display = 'none';
        
        // Confirmar exclusão
        const confirmarHTML = `
            <div id="modalConfirmarExclusao" class="modal-overlay">
                <div class="modal-container" style="max-width: 400px;">
                    <div class="modal-header" style="background: #FF5252;">
                        <h2>Confirmar Exclusão</h2>
                    </div>
                    <div class="modal-body">
                        <p style="text-align: center; color: #E0E0E8; font-size: 16px;">
                            Tem certeza que deseja excluir o rascunho anterior?<br>
                            <strong>Esta ação não pode ser desfeita.</strong>
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="cancelarExclusao()">
                            Cancelar
                        </button>
                        <button class="btn btn-primary" style="background: #FF5252;" onclick="confirmarExclusaoRascunho()">
                            Sim, Excluir
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', confirmarHTML);
    };
    
    // Cancelar exclusão
    window.cancelarExclusao = function() {
        document.getElementById('modalConfirmarExclusao').remove();
        document.getElementById('modalRetornarRascunho').style.display = 'flex';
    };
    
    // Confirmar exclusão do rascunho
    window.confirmarExclusaoRascunho = function() {
        if (!window.rascunhoEventoId) return;
        
        fetch('/produtor/ajax/wizard_evento.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `action=excluir_rascunho&evento_id=${window.rascunhoEventoId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.sucesso) {
                // Remover modais
                document.getElementById('modalConfirmarExclusao').remove();
                document.getElementById('modalRetornarRascunho').remove();
                
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
    };
    
    // Formatar data
    function formatarData(dataString) {
        if (!dataString) return 'Não disponível';
        
        const data = new Date(dataString);
        const opcoes = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return data.toLocaleString('pt-BR', opcoes);
    }
    
    // Fechar modal ao clicar fora
    document.addEventListener('click', function(e) {
        if (e.target.id === 'modalRetornarRascunho') {
            // Não fechar ao clicar fora - forçar decisão
        }
    });
    
    console.log('✅ Sistema de modal de rascunho carregado');
    
})();
