/**
 * CORREÇÃO ETAPA 6 - EXCLUSÃO DE INGRESSOS
 * Remove confirm automático e adiciona verificações adequadas
 */

(function() {
    console.log('🎫 CORREÇÃO ETAPA 6 - Exclusão de Ingressos');
    
    setTimeout(function() {
        
        // ===== SOBRESCREVER EXCLUSÃO DE INGRESSOS PAGOS =====
        window.excluirTicketPago = async function(index) {
            console.log('🗑️ [INGRESSO] Iniciando exclusão de ingresso pago:', index);
            
            try {
                const ingresso = window.ingressosTemporarios?.pagos?.[index];
                if (!ingresso) {
                    console.error('❌ Ingresso não encontrado no índice:', index);
                    return;
                }
                
                // Confirmação customizada
                const confirmar = await mostrarConfirmacaoIngressoCustomizada(
                    'Confirmar Exclusão de Ingresso', 
                    `Tem certeza que deseja excluir o ingresso:\n\n"${ingresso.title}"\n\nEsta ação não pode ser desfeita.`
                );
                
                if (!confirmar) {
                    console.log('❌ Exclusão de ingresso cancelada pelo usuário');
                    return;
                }
                
                // Remover do array
                window.ingressosTemporarios.pagos.splice(index, 1);
                
                // Atualizar interface
                if (window.renderizarIngressosPagos) {
                    window.renderizarIngressosPagos();
                }
                
                // Salvar no cookie
                if (window.salvarIngressosNoCookie) {
                    window.salvarIngressosNoCookie();
                }
                
                console.log('✅ Ingresso pago excluído com sucesso');
                await mostrarMensagemSucessoIngresso('Ingresso excluído com sucesso!');
                
            } catch (error) {
                console.error('❌ Erro ao excluir ingresso pago:', error);
                alert('Erro ao excluir ingresso: ' + error.message);
            }
        };
        
        // ===== SOBRESCREVER EXCLUSÃO DE INGRESSOS GRATUITOS =====
        window.excluirTicketGratuito = async function(index) {
            console.log('🗑️ [INGRESSO] Iniciando exclusão de ingresso gratuito:', index);
            
            try {
                const ingresso = window.ingressosTemporarios?.gratuitos?.[index];
                if (!ingresso) {
                    console.error('❌ Ingresso gratuito não encontrado no índice:', index);
                    return;
                }
                
                // Confirmação customizada
                const confirmar = await mostrarConfirmacaoIngressoCustomizada(
                    'Confirmar Exclusão de Ingresso', 
                    `Tem certeza que deseja excluir o ingresso:\n\n"${ingresso.title}"\n\nEsta ação não pode ser desfeita.`
                );
                
                if (!confirmar) {
                    console.log('❌ Exclusão de ingresso gratuito cancelada pelo usuário');
                    return;
                }
                
                // Remover do array
                window.ingressosTemporarios.gratuitos.splice(index, 1);
                
                // Atualizar interface
                if (window.renderizarIngressosGratuitos) {
                    window.renderizarIngressosGratuitos();
                }
                
                // Salvar no cookie
                if (window.salvarIngressosNoCookie) {
                    window.salvarIngressosNoCookie();
                }
                
                console.log('✅ Ingresso gratuito excluído com sucesso');
                await mostrarMensagemSucessoIngresso('Ingresso excluído com sucesso!');
                
            } catch (error) {
                console.error('❌ Erro ao excluir ingresso gratuito:', error);
                alert('Erro ao excluir ingresso: ' + error.message);
            }
        };
        
        // ===== FUNÇÕES AUXILIARES PARA INGRESSOS =====
        
        // Confirmação customizada para ingressos
        function mostrarConfirmacaoIngressoCustomizada(titulo, mensagem) {
            return new Promise((resolve) => {
                // Remover modal existente
                const modalExistente = document.getElementById('modalConfirmacaoIngresso');
                if (modalExistente) {
                    modalExistente.remove();
                }
                
                // Criar modal
                const modal = document.createElement('div');
                modal.id = 'modalConfirmacaoIngresso';
                modal.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                `;
                
                modal.innerHTML = `
                    <div style="
                        background: white;
                        padding: 25px;
                        border-radius: 8px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                        max-width: 400px;
                        width: 90%;
                        text-align: center;
                    ">
                        <div style="color: #dc3545; font-size: 32px; margin-bottom: 15px;">🎫</div>
                        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">${titulo}</h3>
                        <p style="margin: 0 0 25px 0; color: #666; line-height: 1.5; white-space: pre-line;">${mensagem}</p>
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <button id="btnCancelarIngresso" style="
                                padding: 10px 20px;
                                border: 1px solid #ddd;
                                background: #f8f9fa;
                                color: #333;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 14px;
                            ">Cancelar</button>
                            <button id="btnExcluirIngresso" style="
                                padding: 10px 20px;
                                border: none;
                                background: #dc3545;
                                color: white;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 14px;
                            ">Excluir Ingresso</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Eventos
                document.getElementById('btnCancelarIngresso').onclick = () => {
                    modal.remove();
                    resolve(false);
                };
                
                document.getElementById('btnExcluirIngresso').onclick = () => {
                    modal.remove();
                    resolve(true);
                };
                
                // Fechar com ESC
                const handleEscape = (e) => {
                    if (e.key === 'Escape') {
                        modal.remove();
                        document.removeEventListener('keydown', handleEscape);
                        resolve(false);
                    }
                };
                document.addEventListener('keydown', handleEscape);
                
                // Fechar clicando fora
                modal.onclick = (e) => {
                    if (e.target === modal) {
                        modal.remove();
                        resolve(false);
                    }
                };
            });
        }
        
        // Mensagem de sucesso para ingressos
        function mostrarMensagemSucessoIngresso(mensagem) {
            return new Promise((resolve) => {
                const modal = document.createElement('div');
                modal.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                `;
                
                modal.innerHTML = `
                    <div style="
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                        max-width: 300px;
                        width: 90%;
                        text-align: center;
                    ">
                        <div style="color: #28a745; font-size: 24px; margin-bottom: 10px;">🎫✅</div>
                        <p style="margin: 0 0 15px 0; color: #333;">${mensagem}</p>
                        <button onclick="this.parentElement.parentElement.remove()" style="
                            padding: 8px 16px;
                            border: none;
                            background: #28a745;
                            color: white;
                            border-radius: 4px;
                            cursor: pointer;
                        ">OK</button>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Auto-remover após 3 segundos
                setTimeout(() => {
                    if (modal.parentElement) {
                        modal.remove();
                        resolve();
                    }
                }, 3000);
            });
        }
        
        console.log('✅ Correção da Etapa 6 aplicada - Ingressos com confirmação customizada');
        
    }, 2000); // Aguardar 2 segundos para aplicar após outros scripts
    
})();
