                            
                            <div class="form-group">
                                <label for="logomarca">Logomarca</label>
                                <input type="file" class="form-control" id="logomarca" name="logomarca" 
                                       accept="image/*">
                                <?php if ($organizador_dados && !empty($organizador_dados['logomarca'])): ?>
                                    <div style="margin-top: 10px;">
                                        <img src="/uploads/organizadores/<?php echo htmlspecialchars($organizador_dados['logomarca']); ?>" 
                                             alt="Logomarca atual" style="max-width: 100px; max-height: 100px;">
                                        <small style="display: block; color: rgba(255,255,255,0.6);">Logomarca atual</small>
                                    </div>
                                <?php endif; ?>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="cnpj">CNPJ</label>
                                        <input type="text" class="form-control" id="cnpj" name="cnpj" 
                                               value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['cnpj']) : ''; ?>"
                                               placeholder="00.000.000/0000-00">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="cpf">CPF</label>
                                        <input type="text" class="form-control" id="cpf" name="cpf" 
                                               value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['cpf']) : ''; ?>"
                                               placeholder="000.000.000-00">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="email_contato">E-mail de Contato</label>
                                        <input type="email" class="form-control" id="email_contato" name="email_contato" 
                                               value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['email_contato']) : ''; ?>">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="telefone">Telefone</label>
                                        <input type="tel" class="form-control" id="telefone" name="telefone" 
                                               value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['telefone']) : ''; ?>"
                                               placeholder="(11) 99999-9999">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="endereco_completo">Endereço Completo</label>
                                <textarea class="form-control" id="endereco_completo" name="endereco_completo" 
                                          rows="3"><?php echo $organizador_dados ? htmlspecialchars($organizador_dados['endereco_completo']) : ''; ?></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="tipo_recebimento">Tipo de Recebimento</label>
                                <select class="form-control" id="tipo_recebimento" name="tipo_recebimento" onchange="toggleRecebimentoFields()">
                                    <option value="pix" <?php echo ($organizador_dados && $organizador_dados['tipo_recebimento'] == 'pix') ? 'selected' : ''; ?>>PIX</option>
                                    <option value="transferencia" <?php echo ($organizador_dados && $organizador_dados['tipo_recebimento'] == 'transferencia') ? 'selected' : ''; ?>>Transferência Bancária</option>
                                </select>
                            </div>
                            
                            <div id="pix-fields" style="<?php echo ($organizador_dados && $organizador_dados['tipo_recebimento'] == 'transferencia') ? 'display: none;' : ''; ?>">
                                <div class="form-group">
                                    <label for="chave_pix">Chave PIX</label>
                                    <input type="text" class="form-control" id="chave_pix" name="chave_pix" 
                                           value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['chave_pix']) : ''; ?>"
                                           placeholder="CPF, CNPJ, e-mail ou telefone">
                                </div>
                            </div>
                            
                            <div id="banco-fields" style="<?php echo (!$organizador_dados || $organizador_dados['tipo_recebimento'] == 'pix') ? 'display: none;' : ''; ?>">
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="form-group">
                                            <label for="banco">Banco</label>
                                            <input type="text" class="form-control" id="banco" name="banco" 
                                                   value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['banco']) : ''; ?>"
                                                   placeholder="Nome do banco">
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-group">
                                            <label for="agencia">Agência</label>
                                            <input type="text" class="form-control" id="agencia" name="agencia" 
                                                   value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['agencia']) : ''; ?>"
                                                   placeholder="0000">
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-group">
                                            <label for="conta">Conta</label>
                                            <input type="text" class="form-control" id="conta" name="conta" 
                                                   value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['conta']) : ''; ?>"
                                                   placeholder="00000-0">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="titular_conta">Titular da Conta</label>
                                    <input type="text" class="form-control" id="titular_conta" name="titular_conta" 
                                           value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['titular_conta']) : ''; ?>">
                                </div>
                            </div>
                            
                            <div class="form-check">
                                <input type="checkbox" id="ativo" name="ativo" value="1" 
                                       <?php echo (!$organizador_dados || $organizador_dados['ativo']) ? 'checked' : ''; ?>>
                                <label for="ativo">Organizador ativo</label>
                            </div>
                            
                            <div style="margin-top: 30px; display: flex; gap: 15px;">
                                <button type="submit" class="btn-primary">
                                    <i class="fas fa-save"></i> 
                                    <?php echo $acao == 'novo' ? 'Cadastrar' : 'Atualizar'; ?>
                                </button>
                                <a href="?acao=listar" class="btn-secondary">
                                    <i class="fas fa-times"></i> Cancelar
                                </a>
                            </div>
                        </form>
                    </div>
                    
                <?php elseif ($acao == 'ver' && $organizador_dados): ?>
                    <!-- Visualização detalhada -->
                    <div class="organizadores-header">
                        <h1>Detalhes do Organizador</h1>
                        <div style="display: flex; gap: 10px;">
                            <a href="?acao=editar&id=<?php echo $organizador_dados['id']; ?>" class="btn-primary">
                                <i class="fas fa-edit"></i> Editar
                            </a>
                            <a href="?acao=listar" class="btn-secondary">
                                <i class="fas fa-arrow-left"></i> Voltar
                            </a>
                        </div>
                    </div>
                    
                    <div class="form-container">
                        <div class="organizador-header" style="margin-bottom: 30px;">
                            <div class="organizador-logo" style="width: 100px; height: 100px; font-size: 2.5rem;">
                                <?php if (!empty($organizador_dados['logomarca'])): ?>
                                    <img src="/uploads/organizadores/<?php echo htmlspecialchars($organizador_dados['logomarca']); ?>" 
                                         alt="Logo">
                                <?php else: ?>
                                    <i class="fas fa-building"></i>
                                <?php endif; ?>
                            </div>
                            <div class="organizador-info">
                                <h2 style="margin: 0; color: #00C2FF;"><?php echo htmlspecialchars($organizador_dados['nome_fantasia']); ?></h2>
                                <p style="margin: 5px 0; font-size: 1.1rem;"><?php echo htmlspecialchars($organizador_dados['razao_social']); ?></p>
                                <span class="status-badge status-<?php echo $organizador_dados['ativo'] ? 'ativo' : 'inativo'; ?>">
                                    <?php echo $organizador_dados['ativo'] ? 'Ativo' : 'Inativo'; ?>
                                </span>
                            </div>
                        </div>                        <form method="POST" enctype="multipart/form-data">
                            <input type="hidden" name="acao" value="salvar">
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="nome_fantasia">Nome Fantasia *</label>
                                        <input type="text" class="form-control" id="nome_fantasia" name="nome_fantasia" 
                                               value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['nome_fantasia']) : ''; ?>" 
                                               required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="razao_social">Razão Social</label>
                                        <input type="text" class="form-control" id="razao_social" name="razao_social" 
                                               value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['razao_social']) : ''; ?>">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="logomarca">Logomarca</label>
                                <input type="file" class="form-control" id="logomarca" name="logomarca" 
                                       accept="image/*">
                                <?php if ($organizador_dados && !empty($organizador_dados['logomarca'])): ?>
                                    <div style="margin-top: 10px;">
                                        <img src="/uploads/organizadores/<?php echo htmlspecialchars($organizador_dados['logomarca']); ?>" 
                                             alt="Logomarca atual" style="max-width: 100px; max-height: 100px;">
                                        <small style="display: block; color: rgba(255,255,255,0.6);">Logomarca atual</small>
                                    </div>
                                <?php endif; ?>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="cnpj">CNPJ</label>
                                        <input type="text" class="form-control" id="cnpj" name="cnpj" 
                                               value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['cnpj']) : ''; ?>"
                                               placeholder="00.000.000/0000-00">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="cpf">CPF</label>
                                        <input type="text" class="form-control" id="cpf" name="cpf" 
                                               value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['cpf']) : ''; ?>"
                                               placeholder="000.000.000-00">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="email_contato">E-mail de Contato</label>
                                        <input type="email" class="form-control" id="email_contato" name="email_contato" 
                                               value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['email_contato']) : ''; ?>">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="telefone">Telefone</label>
                                        <input type="tel" class="form-control" id="telefone" name="telefone" 
                                               value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['telefone']) : ''; ?>"
                                               placeholder="(11) 99999-9999">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="endereco_completo">Endereço Completo</label>
                                <textarea class="form-control" id="endereco_completo" name="endereco_completo" 
                                          rows="3"><?php echo $organizador_dados ? htmlspecialchars($organizador_dados['endereco_completo']) : ''; ?></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="tipo_recebimento">Tipo de Recebimento</label>
                                <select class="form-control" id="tipo_recebimento" name="tipo_recebimento" onchange="toggleRecebimentoFields()">
                                    <option value="pix" <?php echo ($organizador_dados && $organizador_dados['tipo_recebimento'] == 'pix') ? 'selected' : ''; ?>>PIX</option>
                                    <option value="transferencia" <?php echo ($organizador_dados && $organizador_dados['tipo_recebimento'] == 'transferencia') ? 'selected' : ''; ?>>Transferência Bancária</option>
                                </select>
                            </div>
                            
                            <div id="pix-fields" style="<?php echo ($organizador_dados && $organizador_dados['tipo_recebimento'] == 'transferencia') ? 'display: none;' : ''; ?>">
                                <div class="form-group">
                                    <label for="chave_pix">Chave PIX</label>
                                    <input type="text" class="form-control" id="chave_pix" name="chave_pix" 
                                           value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['chave_pix']) : ''; ?>"
                                           placeholder="CPF, CNPJ, e-mail ou telefone">
                                </div>
                            </div>
                            
                            <div id="banco-fields" style="<?php echo (!$organizador_dados || $organizador_dados['tipo_recebimento'] == 'pix') ? 'display: none;' : ''; ?>">
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="form-group">
                                            <label for="banco">Banco</label>
                                            <input type="text" class="form-control" id="banco" name="banco" 
                                                   value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['banco']) : ''; ?>"
                                                   placeholder="Nome do banco">
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-group">
                                            <label for="agencia">Agência</label>
                                            <input type="text" class="form-control" id="agencia" name="agencia" 
                                                   value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['agencia']) : ''; ?>"
                                                   placeholder="0000">
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="form-group">
                                            <label for="conta">Conta</label>
                                            <input type="text" class="form-control" id="conta" name="conta" 
                                                   value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['conta']) : ''; ?>"
                                                   placeholder="00000-0">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="titular_conta">Titular da Conta</label>
                                    <input type="text" class="form-control" id="titular_conta" name="titular_conta" 
                                           value="<?php echo $organizador_dados ? htmlspecialchars($organizador_dados['titular_conta']) : ''; ?>">
                                </div>
                            </div>
                            
                            <div class="form-check">
                                <input type="checkbox" id="ativo" name="ativo" value="1" 
                                       <?php echo (!$organizador_dados || $organizador_dados['ativo']) ? 'checked' : ''; ?>>
                                <label for="ativo">Organizador ativo</label>
                            </div>
                            
                            <div style="margin-top: 30px; display: flex; gap: 15px;">
                                <button type="submit" class="btn-primary">
                                    <i class="fas fa-save"></i> 
                                    <?php echo $acao == 'novo' ? 'Cadastrar' : 'Atualizar'; ?>
                                </button>
                                <a href="?acao=listar" class="btn-secondary">
                                    <i class="fas fa-times"></i> Cancelar
                                </a>
                            </div>
                        </form>
                    </div>
                    
                <?php elseif ($acao == 'ver' && $organizador_dados): ?>
                    <!-- Visualização detalhada -->
                    <div class="organizadores-header">
                        <h1>Detalhes do Organizador</h1>
                        <div style="display: flex; gap: 10px;">
                            <a href="?acao=editar&id=<?php echo $organizador_dados['id']; ?>" class="btn-primary">
                                <i class="fas fa-edit"></i> Editar
                            </a>
                            <a href="?acao=listar" class="btn-secondary">
                                <i class="fas fa-arrow-left"></i> Voltar
                            </a>
                        </div>
                    </div>
                    
                    <div class="form-container">
                        <div class="organizador-header" style="margin-bottom: 30px;">
                            <div class="organizador-logo" style="width: 100px; height: 100px; font-size: 2.5rem;">
                                <?php if (!empty($organizador_dados['logomarca'])): ?>
                                    <img src="/uploads/organizadores/<?php echo htmlspecialchars($organizador_dados['logomarca']); ?>" 
                                         alt="Logo">
                                <?php else: ?>
                                    <i class="fas fa-building"></i>
                                <?php endif; ?>
                            </div>
                            <div class="organizador-info">
                                <h2 style="margin: 0; color: #00C2FF;"><?php echo htmlspecialchars($organizador_dados['nome_fantasia']); ?></h2>
                                <p style="margin: 5px 0; font-size: 1.1rem;"><?php echo htmlspecialchars($organizador_dados['razao_social']); ?></p>
                                <span class="status-badge status-<?php echo $organizador_dados['ativo'] ? 'ativo' : 'inativo'; ?>">
                                    <?php echo $organizador_dados['ativo'] ? 'Ativo' : 'Inativo'; ?>
                                </span>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <h4 style="color: #00C2FF; margin-bottom: 15px;">Informações Básicas</h4>
                                
                                <?php if (!empty($organizador_dados['cnpj'])): ?>
                                    <div class="detail-item" style="margin-bottom: 15px;">
                                        <i class="fas fa-id-card"></i>
                                        <strong>CNPJ:</strong> <?php echo htmlspecialchars($organizador_dados['cnpj']); ?>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if (!empty($organizador_dados['cpf'])): ?>
                                    <div class="detail-item" style="margin-bottom: 15px;">
                                        <i class="fas fa-user"></i>
                                        <strong>CPF:</strong> <?php echo htmlspecialchars($organizador_dados['cpf']); ?>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if (!empty($organizador_dados['email_contato'])): ?>
                                    <div class="detail-item" style="margin-bottom: 15px;">
                                        <i class="fas fa-envelope"></i>
                                        <strong>E-mail:</strong> <?php echo htmlspecialchars($organizador_dados['email_contato']); ?>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if (!empty($organizador_dados['telefone'])): ?>
                                    <div class="detail-item" style="margin-bottom: 15px;">
                                        <i class="fas fa-phone"></i>
                                        <strong>Telefone:</strong> <?php echo htmlspecialchars($organizador_dados['telefone']); ?>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if (!empty($organizador_dados['endereco_completo'])): ?>
                                    <div class="detail-item" style="margin-bottom: 15px;">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <strong>Endereço:</strong><br>
                                        <span style="margin-left: 24px;"><?php echo nl2br(htmlspecialchars($organizador_dados['endereco_completo'])); ?></span>
                                    </div>
                                <?php endif; ?>
                            </div>
                            
                            <div class="col-md-6">
                                <h4 style="color: #00C2FF; margin-bottom: 15px;">Dados de Recebimento</h4>
                                
                                <div class="detail-item" style="margin-bottom: 15px;">
                                    <i class="fas fa-credit-card"></i>
                                    <strong>Tipo:</strong> <?php echo ucfirst($organizador_dados['tipo_recebimento']); ?>
                                </div>
                                
                                <?php if ($organizador_dados['tipo_recebimento'] == 'pix' && !empty($organizador_dados['chave_pix'])): ?>
                                    <div class="detail-item" style="margin-bottom: 15px;">
                                        <i class="fas fa-qrcode"></i>
                                        <strong>Chave PIX:</strong> <?php echo htmlspecialchars($organizador_dados['chave_pix']); ?>
                                    </div>
                                <?php elseif ($organizador_dados['tipo_recebimento'] == 'transferencia'): ?>
                                    <?php if (!empty($organizador_dados['banco'])): ?>
                                        <div class="detail-item" style="margin-bottom: 15px;">
                                            <i class="fas fa-university"></i>
                                            <strong>Banco:</strong> <?php echo htmlspecialchars($organizador_dados['banco']); ?>
                                        </div>
                                    <?php endif; ?>
                                    
                                    <?php if (!empty($organizador_dados['agencia'])): ?>
                                        <div class="detail-item" style="margin-bottom: 15px;">
                                            <i class="fas fa-building"></i>
                                            <strong>Agência:</strong> <?php echo htmlspecialchars($organizador_dados['agencia']); ?>
                                        </div>
                                    <?php endif; ?>
                                    
                                    <?php if (!empty($organizador_dados['conta'])): ?>
                                        <div class="detail-item" style="margin-bottom: 15px;">
                                            <i class="fas fa-credit-card"></i>
                                            <strong>Conta:</strong> <?php echo htmlspecialchars($organizador_dados['conta']); ?>
                                        </div>
                                    <?php endif; ?>
                                    
                                    <?php if (!empty($organizador_dados['titular_conta'])): ?>
                                        <div class="detail-item" style="margin-bottom: 15px;">
                                            <i class="fas fa-user-tie"></i>
                                            <strong>Titular:</strong> <?php echo htmlspecialchars($organizador_dados['titular_conta']); ?>
                                        </div>
                                    <?php endif; ?>
                                <?php endif; ?>
                                
                                <div class="detail-item" style="margin-bottom: 15px;">
                                    <i class="fas fa-calendar"></i>
                                    <strong>Cadastrado em:</strong> <?php echo date('d/m/Y H:i', strtotime($organizador_dados['criado_em'])); ?>
                                </div>
                                
                                <div class="detail-item" style="margin-bottom: 15px;">
                                    <i class="fas fa-clock"></i>
                                    <strong>Última atualização:</strong> <?php echo date('d/m/Y H:i', strtotime($organizador_dados['atualizado_em'])); ?>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        </main>
    </div>

    <!-- Modal de confirmação de exclusão -->
    <div id="modalExclusao" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; align-items: center; justify-content: center;">
        <div style="background: rgba(42, 42, 56, 0.95); padding: 30px; border-radius: 16px; color: white; max-width: 400px; text-align: center;">
            <h3 style="color: #fc8181; margin-bottom: 15px;">Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir o organizador <strong id="nomeOrganizador"></strong>?</p>
            <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">Esta ação não pode ser desfeita.</p>
            
            <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
                <button onclick="fecharModal()" class="btn-secondary">Cancelar</button>
                <form method="POST" style="display: inline;">
                    <input type="hidden" name="acao" value="excluir">
                    <input type="hidden" name="id" id="idExcluir">
                    <button type="submit" class="btn-danger">Excluir</button>
                </form>
            </div>
        </div>
    </div>

    <script>
        // Alternar campos de recebimento
        function toggleRecebimentoFields() {
            const tipo = document.getElementById('tipo_recebimento').value;
            const pixFields = document.getElementById('pix-fields');
            const bancoFields = document.getElementById('banco-fields');
            
            if (tipo === 'pix') {
                pixFields.style.display = 'block';
                bancoFields.style.display = 'none';
            } else {
                pixFields.style.display = 'none';
                bancoFields.style.display = 'block';
            }
        }
        
        // Confirmar exclusão
        function confirmarExclusao(id, nome) {
            document.getElementById('idExcluir').value = id;
            document.getElementById('nomeOrganizador').textContent = nome;
            document.getElementById('modalExclusao').style.display = 'flex';
        }
        
        // Fechar modal
        function fecharModal() {
            document.getElementById('modalExclusao').style.display = 'none';
        }
        
        // Auto-dismiss para alertas
        setTimeout(function() {
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach(function(alert) {
                alert.style.opacity = '0';
                setTimeout(function() {
                    alert.remove();
                }, 300);
            });
        }, 5000);
        
        // ===== SCRIPTS DO HEADER =====
        
        // Toggle user dropdown
        function toggleUserDropdown() {
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('active');
        }

        // Toggle mobile menu
        function toggleMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('mobileOverlay');
            
            sidebar.classList.toggle('mobile-active');
            overlay.classList.toggle('active');
        }

        // Close mobile menu
        function closeMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.getElementById('mobileOverlay');
            
            sidebar.classList.remove('mobile-active');
            overlay.classList.remove('active');
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            const userMenu = document.querySelector('.user-menu');
            const dropdown = document.getElementById('userDropdown');
            const sidebar = document.querySelector('.sidebar');
            const menuToggle = document.querySelector('.menu-toggle');
            
            if (!userMenu.contains(event.target)) {
                dropdown.classList.remove('active');
            }
            
            if (window.innerWidth <= 768 && 
                !sidebar.contains(event.target) && 
                !menuToggle.contains(event.target)) {
                closeMobileMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });

        // Logout function
        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                window.location = 'logout.php';
            }
        }

        // Mouse interaction with particles
        document.addEventListener('mousemove', function(e) {
            const particles = document.querySelectorAll('.particle');
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            particles.forEach((particle, index) => {
                const speed = (index + 1) * 0.5;
                const x = mouseX * speed;
                const y = mouseY * speed;
                
                particle.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    </script>
</body>
</html>