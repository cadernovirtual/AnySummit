BACKUP_PLACEHOLDERrador-section').style.display = 'block';
                                document.getElementById('pagamento-section').style.display = 'block';
                                location.reload();
                            }
                        }
                    );
                } else {
                    showCustomDialog(
                        result.message || 'E-mail ou senha incorretos. Verifique os dados e tente novamente.',
                        'error',
                        {
                            title: 'Erro no Login'
                        }
                    );
                }
            } catch (error) {
                console.error('Erro no login:', error);
                showCustomDialog(
                    'Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.',
                    'error',
                    {
                        title: 'Erro de Conexão'
                    }
                );
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }

        // Toggle tipo de documento
        function toggleDocumentField() {
            const tipoDoc = document.getElementById('tipo_documento').value;
            const documentoField = document.getElementById('documento');
            
            if (tipoDoc === 'CPF') {
                documentoField.placeholder = '000.000.000-00';
                documentoField.maxLength = 14;
            } else if (tipoDoc === 'CNPJ') {
                documentoField.placeholder = '00.000.000/0000-00';
                documentoField.maxLength = 18;
            }
        }

        // Buscar CEP automaticamente
        async function buscarCEP() {
            const cep = document.getElementById('cep').value.replace(/\D/g, '');
            
            if (cep.length === 8) {
                try {
                    // Mostrar loading
                    document.getElementById('cep').classList.add('loading');
                    
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();
                    
                    if (!data.erro) {
                        // Preencher campos
                        document.getElementById('endereco').value = data.logradouro || '';
                        document.getElementById('bairro').value = data.bairro || '';
                        document.getElementById('cidade').value = data.localidade || '';
                        document.getElementById('estado').value = data.uf || '';
                        
                        // Mostrar campos de endereço
                        document.getElementById('endereco-fields').style.display = 'block';
                        
                        // Focar no campo número
                        setTimeout(() => {
                            document.getElementById('numero').focus();
                        }, 100);
                        
                        // Adicionar efeito visual suave
                        const enderecoFields = document.getElementById('endereco-fields');
                        enderecoFields.style.opacity = '0';
                        enderecoFields.style.transform = 'translateY(-10px)';
                        enderecoFields.style.transition = 'all 0.3s ease';
                        
                        setTimeout(() => {
                            enderecoFields.style.opacity = '1';
                            enderecoFields.style.transform = 'translateY(0)';
                        }, 50);
                        
                    } else {
                        showCustomDialog(
                            'CEP não encontrado. Verifique o número digitado e tente novamente.',
                            'warning',
                            {
                                title: 'CEP Inválido'
                            }
                        );
                    }
                } catch (error) {
                    console.log('Erro ao buscar CEP:', error);
                    showCustomDialog(
                        'Erro ao buscar o CEP. Verifique sua conexão e tente novamente.',
                        'error',
                        {
                            title: 'Erro na Busca'
                        }
                    );
                } finally {
                    document.getElementById('cep').classList.remove('loading');
                }
            }
        }
        
        function selectPayment(method) {
            // Verificar valor mínimo primeiro
            const carrinhoData = sessionStorage.getItem('carrinho');
            let valorOriginal = 0;
            
            if (carrinhoData) {
                const carrinho = JSON.parse(carrinhoData);
                valorOriginal = carrinho.total || carrinho.subtotal || 0;
            }
            
            // Se valor menor que R$ 5,00, não permitir nenhum método
            if (valorOriginal < 5) {
                showCustomDialog(
                    'O valor mínimo para qualquer forma de pagamento é R$ 5,00. Adicione mais itens ao seu carrinho.',
                    'warning',
                    {
                        title: 'Valor Mínimo Não Atingido'
                    }
                );
                return;
            }
            
            // Se valor menor que R$ 15,00 e tentou selecionar PIX
            if (valorOriginal < 15 && method === 'pix') {
                showCustomDialog(
                    'PIX está disponível apenas para valores acima de R$ 15,00. Para este valor, utilize cartão de crédito.',
                    'warning',
                    {
                        title: 'PIX Não Disponível'
                    }
                );
                return;
            }
            
            // Remove seleção anterior
            document.querySelectorAll('.payment-option').forEach(option => {
                option.classList.remove('selected');
            });

            // Adiciona seleção atual
            document.querySelector(`[data-payment="${method}"]`).classList.add('selected');
            
            // Marca o radio button
            document.querySelector(`input[value="${method}"]`).checked = true;

            // Mostra/esconde detalhes
            document.getElementById('credit-details').style.display = method === 'credit' ? 'block' : 'none';
            document.getElementById('pix-details').style.display = method === 'pix' ? 'block' : 'none';
            
            // Gerar parcelamento se for cartão
            if (method === 'credit') {
                generateInstallments();
                // Atualizar o total para 1x (padrão)
                updateSummaryTotal(1);
            } else {
                // Para PIX ou boleto, mostrar valor original
                if (carrinhoData) {
                    const carrinho = JSON.parse(carrinhoData);
                    const valorOriginal = carrinho.total || carrinho.subtotal || 0;
                    document.getElementById('valor-total').textContent = 'R$ ' + formatPrice(valorOriginal);
                    
                    // Atualizar texto explicativo
                    const summaryTotals = document.getElementById('summary-totals');
                    const existingSmall = summaryTotals.querySelector('small');
                    if (existingSmall) {
                        existingSmall.outerHTML = '<small class="text-muted">(pagamento à vista)</small>';
                    }
                }
            }
        }

        // Taxas do Asaas para cartão de crédito (baseadas na tabela oficial)
        // À vista (1x) não cobra taxas, somente a partir de 2x
        const asaasTaxas = {
            1: { taxa: 0, adicional: 0 },          // À vista: sem taxas
            2: { taxa: 3.49, adicional: 0.49 },   // 2 a 6 parcelas: R$ 0,49 + 3,49%
            3: { taxa: 3.49, adicional: 0.49 },
            4: { taxa: 3.49, adicional: 0.49 },
            5: { taxa: 3.49, adicional: 0.49 },
            6: { taxa: 3.49, adicional: 0.49 },
            7: { taxa: 3.99, adicional: 0.49 },   // 7 a 12 parcelas: R$ 0,49 + 3,99%
            8: { taxa: 3.99, adicional: 0.49 },
            9: { taxa: 3.99, adicional: 0.49 },
            10: { taxa: 3.99, adicional: 0.49 },
            11: { taxa: 3.99, adicional: 0.49 },
            12: { taxa: 4.29, adicional: 0.49 }   // 13 a 21 parcelas: R$ 0,49 + 4,29%
        };

        // Calcular valor total com taxas do Asaas
        function calcularValorComTaxas(valorOriginal, parcelas) {
            const config = asaasTaxas[parcelas];
            if (!config) return { valorTotal: valorOriginal, valorParcela: valorOriginal };
            
            // Calcular taxa percentual
            const taxaPercentual = valorOriginal * (config.taxa / 100);
            
            // Somar taxa fixa + taxa percentual
            const valorTotal = valorOriginal + config.adicional + taxaPercentual;
            
            // Calcular valor da parcela
            const valorParcela = valorTotal / parcelas;
            
            return {
                valorTotal: valorTotal,
                valorParcela: valorParcela,
                taxaAplicada: config.adicional + taxaPercentual
            };
        }

        // Gerar opções de parcelamento com valores reais do Asaas
        function generateInstallments() {
            const carrinhoData = sessionStorage.getItem('carrinho');
            if (!carrinhoData) return;

            const carrinho = JSON.parse(carrinhoData);
            const valorOriginal = carrinho.total || carrinho.subtotal || 0;
            
            // Verificar valor mínimo
            if (valorOriginal < 5) {
                // Valor menor que R$ 5,00 - não processa cartão nem PIX
                document.getElementById('installments-list').innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>Valor mínimo não atingido</strong><br>
                        O valor mínimo para pagamento é R$ 5,00.
                    </div>
                `;
                desabilitarPagamentos();
                return;
            }
            
            const installmentsList = document.getElementById('installments-list');
            let html = '';

            for (let i = 1; i <= 12; i++) {
                const resultado = calcularValorComTaxas(valorOriginal, i);
                
                // Verificar se a parcela é menor que R$ 5,00
                if (resultado.valorParcela < 5 && i > 1) {
                    continue; // Pular parcelas menores que R$ 5,00
                }
                
                const isSelected = i === 1 ? 'selected' : ''; // 1x selecionado como padrão
                
                let descricaoTexto = '';
                if (i === 1) {
                    descricaoTexto = ' à vista';
                } else {
                    descricaoTexto = ' com juros';
                }
                
                html += `
                    <div class="installment-option ${isSelected}" onclick="selectInstallment(this, ${i})">
                        <div>
                            <input type="radio" name="installments" value="${i}" ${i === 1 ? 'checked' : ''}>
                            <strong>${i}x de R$ ${formatPrice(resultado.valorParcela)}</strong>${descricaoTexto}
                        </div>
                    </div>
                `;
            }
            
            // Se valor é exatamente R$ 5,00, só mostrar à vista
            if (valorOriginal === 5) {
                html = `
                    <div class="installment-option selected" onclick="selectInstallment(this, 1)">
                        <div>
                            <input type="radio" name="installments" value="1" checked>
                            <strong>1x de R$ ${formatPrice(valorOriginal)}</strong> à vista
                        </div>
                    </div>
                    <div class="alert alert-info mt-2">
                        <i class="fas fa-info-circle me-2"></i>
                        <small>Para valores de R$ 5,00, apenas pagamento à vista.</small>
                    </div>
                `;
            }

            installmentsList.innerHTML = html;
        }

        function selectInstallment(element, installments) {
            document.querySelectorAll('.installment-option').forEach(option => {
                option.classList.remove('selected');
            });
            element.classList.add('selected');
            element.querySelector('input').checked = true;
            
            // Atualizar valor total no resumo
            updateSummaryTotal(installments);
        }

        // Desabilitar métodos de pagamento para valores menores que R$ 5,00
        function desabilitarPagamentos() {
            // Desabilitar botões de método de pagamento
            const cartaoBtn = document.querySelector('input[value="credit"]');
            const pixBtn = document.querySelector('input[value="pix"]');
            const boletoBtn = document.querySelector('input[value="boleto"]');
            
            if (cartaoBtn) {
                cartaoBtn.disabled = true;
                cartaoBtn.closest('.payment-method').classList.add('disabled');
            }
            if (pixBtn) {
                pixBtn.disabled = true;
                pixBtn.closest('.payment-method').classList.add('disabled');
            }
            if (boletoBtn) {
                boletoBtn.disabled = true;
                boletoBtn.closest('.payment-method').classList.add('disabled');
            }
            
            // Esconder detalhes de pagamento
            document.getElementById('credit-details').style.display = 'none';
            document.getElementById('pix-details').style.display = 'none';
            
            // Desabilitar botão de finalizar
            const finalizarBtn = document.getElementById('finalizar-pedido');
            if (finalizarBtn) {
                finalizarBtn.disabled = true;
                finalizarBtn.textContent = 'Valor mínimo não atingido';
                finalizarBtn.classList.add('btn-secondary');
                finalizarBtn.classList.remove('btn-success');
            }
        }
        
        // Habilitar métodos de pagamento novamente
        function habilitarPagamentos() {
            // Habilitar botões de método de pagamento
            const cartaoBtn = document.querySelector('input[value="credit"]');
            const pixBtn = document.querySelector('input[value="pix"]');
            const boletoBtn = document.querySelector('input[value="boleto"]');
            
            if (cartaoBtn) {
                cartaoBtn.disabled = false;
                cartaoBtn.closest('.payment-method').classList.remove('disabled');
            }
            if (pixBtn) {
                pixBtn.disabled = false;
                pixBtn.closest('.payment-method').classList.remove('disabled');
            }
            if (boletoBtn) {
                boletoBtn.disabled = false;
                boletoBtn.closest('.payment-method').classList.remove('disabled');
            }
            
            // Habilitar botão de finalizar
            const finalizarBtn = document.getElementById('finalizar-pedido');
            if (finalizarBtn) {
                finalizarBtn.disabled = false;
                finalizarBtn.textContent = 'Finalizar Pedido';
                finalizarBtn.classList.remove('btn-secondary');
                finalizarBtn.classList.add('btn-success');
            }
        }

        // Atualizar total no resumo com base no parcelamento selecionado
        function updateSummaryTotal(parcelas) {
            const carrinhoData = sessionStorage.getItem('carrinho');
            if (!carrinhoData) return;

            const carrinho = JSON.parse(carrinhoData);
            const valorOriginal = carrinho.total || carrinho.subtotal || 0;
            
            const resultado = calcularValorComTaxas(valorOriginal, parcelas);
            
            const valorTotalElement = document.getElementById('valor-total');
            if (valorTotalElement) {
                valorTotalElement.textContent = 'R$ ' + formatPrice(resultado.valorTotal);
                
                // Atualizar texto explicativo
                const summaryTotals = document.getElementById('summary-totals');
                let infoText = '';
                
                if (parcelas === 1) {
                    infoText = '<small class="text-muted">(pagamento à vista)</small>';
                } else {
                    infoText = `<small class="text-muted">(${parcelas}x de R$ ${formatPrice(resultado.valorParcela)})</small>`;
                }
                
                // Remover texto anterior e adicionar novo
                const existingSmall = summaryTotals.querySelector('small');
                if (existingSmall) {
                    existingSmall.remove();
                }
                summaryTotals.insertAdjacentHTML('beforeend', infoText);
            }
        }

        function formatPrice(price) {
            return price.toFixed(2).replace('.', ',');
        }

        // Finalizar pagamento 
        async function finalizePayment() {
            // Validação básica
            const compradorForm = document.getElementById('comprador-form');
            const paymentMethod = document.querySelector('input[name="payment_method"]:checked');

            if (!paymentMethod) {
                showCustomDialog(
                    'Por favor, selecione uma forma de pagamento antes de continuar.',
                    'warning',
                    {
                        title: 'Forma de Pagamento'
                    }
                );
                return;
            }

            // Verificar campos obrigatórios do comprador
            const camposObrigatorios = [
                { id: 'nome_completo', nome: 'Nome completo' },
                { id: 'email', nome: 'E-mail' },
                { id: 'whatsapp', nome: 'WhatsApp' },
                { id: 'tipo_documento', nome: 'Tipo de documento' },
                { id: 'documento', nome: 'CPF/CNPJ' },
                { id: 'cep', nome: 'CEP' },
                { id: 'endereco', nome: 'Endereço' },
                { id: 'numero', nome: 'Número' },
                { id: 'bairro', nome: 'Bairro' },
                { id: 'cidade', nome: 'Cidade' },
                { id: 'estado', nome: 'Estado' }
            ];
            
            const camposFaltando = [];
            
            for (let campo of camposObrigatorios) {
                const elemento = document.getElementById(campo.id);
                if (!elemento) {
                    console.error('Elemento não encontrado:', campo.id);
                    camposFaltando.push(campo.nome + ' (campo não encontrado)');
                    continue;
                }
                
                const valor = elemento.value;
                
                if (!valor || !valor.trim()) {
                    camposFaltando.push(campo.nome);
                }
            }
            
            if (camposFaltando.length > 0) {
                showCustomDialog(
                    'Preencha todos os campos obrigatórios antes de continuar:<br><br>• ' + camposFaltando.join('<br>• '),
                    'warning',
                    {
                        title: 'Campos Obrigatórios'
                    }
                );
                return;
            }

            // Verificar e-mail
            const email = document.getElementById('email').value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showCustomDialog(
                    'Por favor, insira um e-mail válido no formato: exemplo@dominio.com',
                    'warning',
                    {
                        title: 'E-mail Inválido'
                    }
                );
                return;
            }

            // Verificar WhatsApp
            const whatsapp = document.getElementById('whatsapp').value;
            if (whatsapp.replace(/\D/g, '').length < 10) {
                showCustomDialog(
                    'Por favor, insira um número de WhatsApp válido com pelo menos 10 dígitos.',
                    'warning',
                    {
                        title: 'WhatsApp Inválido'
                    }
                );
                return;
            }

            // Validar dados do cartão se for cartão de crédito
            if (paymentMethod.value === 'credit' && !validateCreditCard()) {
                return;
            }

            // Coletar dados
            const compradorData = Object.fromEntries(new FormData(compradorForm));
            
            // Verificar se comprador está logado
            const compradorLogado = <?php echo json_encode($comprador_logado); ?>;
            if (compradorLogado) {
                compradorData.comprador_id = <?php echo $comprador_logado && isset($comprador_dados['id']) ? $comprador_dados['id'] : 'null'; ?>;
                compradorData.metodo_comprador = 'logged';
            } else {
                compradorData.metodo_comprador = 'manual';
            }

            // Criar dados do participante baseado no comprador (já que agora só temos comprador)
            const participanteData = {
                nome: compradorData.nome_completo.split(' ')[0] || 'Nome',
                sobrenome: compradorData.nome_completo.split(' ').slice(1).join(' ') || 'Sobrenome',
                email: compradorData.email,
                whatsapp: compradorData.whatsapp,
                metodo_dados: 'manual'
            };

            const carrinho = JSON.parse(sessionStorage.getItem('carrinho') || '{}');
            
            const pedidoData = {
                carrinho: carrinho,
                participante: participanteData,
                comprador: compradorData,
                pagamento: {
                    metodo: paymentMethod.value,
                    parcelas: paymentMethod.value === 'credit' ? 
                        document.querySelector('input[name="installments"]:checked').value : 1
                }
            };

            // Processar pedido no backend
            const btn = event.target;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Processando...';
            btn.disabled = true;

            try {
                console.log('Enviando pedido:', pedidoData);
                
                const response = await fetch('/evento/api/processar-pedido.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(pedidoData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Resultado do pedido:', result);

                if (result.success) {
                    // Salvar dados do pedido para as próximas páginas
                    sessionStorage.setItem('pedido_criado', JSON.stringify(result.pedido));
                    
                    // Salvar dados do comprador para as próximas páginas
                    sessionStorage.setItem('comprador_data', JSON.stringify(compradorData));
                    
                    // Se for cartão de crédito, processar pagamento imediatamente
                    if (paymentMethod.value === 'credit') {
                        await processarPagamentoCartao(result.pedido, compradorData, participanteData);
                    } else if (paymentMethod.value === 'pix') {
                        // Para PIX, redirecionar para página específica com o pedido_id
                        const pedidoParam = result.pedido && result.pedido.codigo_pedido ? 
                            '&pedido_id=' + encodeURIComponent(result.pedido.codigo_pedido) : '';
                        window.location.href = '/evento/pagamento-pix.php?evento=' + encodeURIComponent('<?php echo $slug; ?>') + pedidoParam;
                    } else {
                        // Para outros métodos, redirecionar diretamente
                        window.location.href = '/evento/pagamento-boleto.php?evento=' + encodeURIComponent('<?php echo $slug; ?>');
                    }
                } else {
                    showCustomDialog(
                        'Erro ao processar o pedido: ' + (result.message || 'Erro desconhecido'),
                        'error',
                        {
                            title: 'Erro no Processamento'
                        }
                    );
                }
                
            } catch (error) {
                console.error('Erro ao processar pedido:', error);
                showCustomDialog(
                    'Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.',
                    'error',
                    {
                        title: 'Erro de Conexão'
                    }
                );
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }

        function validateCreditCard() {
            const cardName = document.getElementById('card_name').value;
            const cardNumber = document.getElementById('card_number').value;
            const cardExpiry = document.getElementById('card_expiry').value;
            const cardCvv = document.getElementById('card_cvv').value;

            if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
                showCustomDialog(
                    'Preencha todos os dados do cartão de crédito antes de continuar.',
                    'warning',
                    {
                        title: 'Dados do Cartão'
                    }
                );
                return false;
            }

            // Validações básicas
            if (cardNumber.replace(/\s/g, '').length < 16) {
                showCustomDialog(
                    'O número do cartão deve ter pelo menos 16 dígitos. Verifique os dados digitados.',
                    'warning',
                    {
                        title: 'Número do Cartão Inválido'
                    }
                );
                return false;
            }

            if (cardCvv.length < 3) {
                showCustomDialog(
                    'O código de segurança (CVV) deve ter pelo menos 3 dígitos.',
                    'warning',
                    {
                        title: 'CVV Inválido'
                    }
                );
                return false;
            }

            return true;
        }

        // Processar pagamento com cartão de crédito
        async function processarPagamentoCartao(pedido, comprador, participante) {
            try {
                console.log('=== PROCESSANDO PAGAMENTO CARTÃO ===');
                console.log('Pedido recebido:', pedido);
                console.log('Comprador recebido:', comprador);
                console.log('Participante recebido:', participante);
                
                // Buscar carrinho do sessionStorage
                const carrinhoData = sessionStorage.getItem('carrinho');
                let carrinho = {};
                
                if (carrinhoData) {
                    carrinho = JSON.parse(carrinhoData);
                } else {
                    // Criar carrinho básico se não existir
                    carrinho = {
                        evento: {
                            id: <?php echo $evento['id']; ?>,
                            nome: '<?php echo addslashes($evento['nome']); ?>'
                        },
                        total: 100.00 // Valor padrão
                    };
                }
                
                // Coletar dados do cartão
                const cartaoData = {
                    nome: document.getElementById('card_name').value,
                    numero: document.getElementById('card_number').value,
                    mes: document.getElementById('card_expiry').value.split('/')[0],
                    ano: '20' + document.getElementById('card_expiry').value.split('/')[1],
                    cvv: document.getElementById('card_cvv').value
                };
                
                console.log('Dados do cartão coletados:', cartaoData);
                
                // Preparar dados do comprador para o Asaas
                const compradorAsaas = {
                    nome_completo: comprador.nome_completo,
                    documento: comprador.documento,
                    cep: comprador.cep,
                    endereco: comprador.endereco || '',
                    numero: comprador.numero || '1',
                    complemento: comprador.complemento || '',
                    bairro: comprador.bairro || '',
                    cidade: comprador.cidade || '',
                    estado: comprador.estado || '',
                    telefone: '', // Campo removido, usar WhatsApp
                    email: comprador.email,
                    whatsapp: comprador.whatsapp
                };
                
                console.log('Comprador para Asaas:', compradorAsaas);
                
                // Verificar campos obrigatórios
                const camposObrigatorios = ['nome_completo', 'documento', 'cep', 'endereco', 'numero', 'bairro', 'cidade', 'estado'];
                const camposFaltando = camposObrigatorios.filter(campo => !compradorAsaas[campo] || !compradorAsaas[campo].toString().trim());
                
                if (camposFaltando.length > 0) {
                    console.error('Campos obrigatórios faltando para Asaas:', camposFaltando);
                    showCustomDialog(
                        'Dados incompletos para processamento do pagamento. Campos faltando: ' + camposFaltando.join(', '),
                        'error',
                        {
                            title: 'Dados Incompletos'
                        }
                    );
                    return;
                }
                
                // Adicionar dados do evento
                const pedidoCompleto = {
                    ...pedido,
                    evento_nome: carrinho?.evento?.nome || 'Evento',
                    parcelas: document.querySelector('input[name="installments"]:checked').value
                };
                
                const pagamentoData = {
                    pedido: pedidoCompleto,
                    cartao: cartaoData,
                    comprador: compradorAsaas
                };
                
                console.log('Dados completos para envio:', pagamentoData);
                
                const response = await fetch('/evento/api/pagamento-cartao.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(pagamentoData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Resultado pagamento cartão:', result);

                if (result.success) {
                    // Salvar dados do pagamento
                    sessionStorage.setItem('pagamento_resultado', JSON.stringify(result));
                    
                    // Verificar se foi aprovado imediatamente
                    if (result.approved) {
                        // Pagamento aprovado imediatamente
                        if (result.pedido && result.pedido.codigo_pedido) {
                            window.location.href = '/evento/pagamento-sucesso.php?pedido_id=' + encodeURIComponent(result.pedido.codigo_pedido);
                        } else {
                            window.location.href = '/evento/pagamento-sucesso.php';
                        }
                    } else {
                        // Pagamento em processamento - iniciar verificação
                        mostrarProcessandoPagamento();
                        verificarStatusPagamento(result.payment.id, result.pedido?.codigo_pedido);
                    }
                } else {
                    // AQUI É ONDE MUDAMOS O ALERT POR DIALOG CUSTOMIZADO
                    customAlert('Problema no pagamento: ' + result.message);
                }
                
            } catch (error) {
                console.error('Erro ao processar pagamento cartão:', error);
                customAlert('Erro ao processar pagamento: ' + error.message);
            }
        }

        // Mostrar tela de processamento
        function mostrarProcessandoPagamento() {
            // Criar overlay de processamento
            const overlay = document.createElement('div');
            overlay.id = 'processamento-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                backdrop-filter: blur(5px);
            `;
            
            overlay.innerHTML = `
                <div style="
                    background: white;
                    padding: 3rem;
                    border-radius: 15px;
                    text-align: center;
                    max-width: 400px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                ">
                    <div style="
                        width: 60px;
                        height: 60px;
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #007bff;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 1.5rem;
                    "></div>
                    <h4 style="margin-bottom: 1rem; color: #333;">Processando Pagamento</h4>
                    <p style="color: #666; margin-bottom: 1.5rem;">
                        Aguarde enquanto confirmamos seu pagamento com a operadora...
                    </p>
                    <div id="tempo-processamento" style="color: #007bff; font-weight: bold;">
                        Tempo: <span id="contador">0</span>s
                    </div>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            
            document.body.appendChild(overlay);
            
            // Iniciar contador de tempo
            let tempo = 0;
            const contador = document.getElementById('contador');
            const intervaloCont = setInterval(() => {
                tempo++;
                if (contador) {
                    contador.textContent = tempo;
                }
            }, 1000);
            
            // Salvar o intervalo para poder limpar depois
            window.contadorProcessamento = intervaloCont;
        }
        
        // Verificar status do pagamento
        function verificarStatusPagamento(paymentId, codigoPedido) {
            let tentativas = 0;
            const maxTentativas = 24; // 2 minutos (24 x 5 segundos)
            
            const verificar = async () => {
                try {
                    tentativas++;
                    console.log(`Verificação ${tentativas}/${maxTentativas} - Payment ID: ${paymentId}`);
                    
                    const response = await fetch(`/evento/api/verificar-status-pagamento.php?payment_id=${paymentId}`);
                    const result = await response.json();
                    
                    console.log('Status verificação:', result);
                    
                    if (result.success) {
                        if (result.approved) {
                            // Pagamento aprovado!
                            limparProcessamento();
                            
                            if (codigoPedido) {
                                window.location.href = '/evento/pagamento-sucesso.php?pedido_id=' + encodeURIComponent(codigoPedido);
                            } else {
                                window.location.href = '/evento/pagamento-sucesso.php';
                            }
                            return;
                        }
                        
                        // Se ainda está processando e não excedeu tentativas, continuar
                        if (tentativas < maxTentativas) {
                            setTimeout(verificar, 5000); // Verificar novamente em 5 segundos
                        } else {
                            // Timeout - redirecionar para página com status pendente
                            limparProcessamento();
                            mostrarTimeoutPagamento(codigoPedido);
                        }
                    } else {
                        console.error('Erro ao verificar status:', result.message);
                        if (tentativas < maxTentativas) {
                            setTimeout(verificar, 5000);
                        } else {
                            limparProcessamento();
                            mostrarTimeoutPagamento(codigoPedido);
                        }
                    }
                } catch (error) {
                    console.error('Erro na verificação:', error);
                    if (tentativas < maxTentativas) {
                        setTimeout(verificar, 5000);
                    } else {
                        limparProcessamento();
                        mostrarTimeoutPagamento(codigoPedido);
                    }
                }
            };
            
            // Iniciar verificação após 3 segundos
            setTimeout(verificar, 3000);
        }
        
        // Limpar tela de processamento
        function limparProcessamento() {
            const overlay = document.getElementById('processamento-overlay');
            if (overlay) {
                overlay.remove();
            }
            
            if (window.contadorProcessamento) {
                clearInterval(window.contadorProcessamento);
            }
        }
        
        // Mostrar timeout do pagamento
        function mostrarTimeoutPagamento(codigoPedido) {
            showCustomDialog(
                'O processamento do pagamento está demorando mais que o esperado. Você será redirecionado para acompanhar o status do seu pedido.',
                'warning',
                {
                    title: 'Processamento Demorado',
                    okText: 'Acompanhar Status',
                    onOk: () => {
                        if (codigoPedido) {
                            window.location.href = `/evento/status-pagamento.php?pedido_id=${encodeURIComponent(codigoPedido)}`;
                        } else {
                            window.location.href = '/';
                        }
                    }
                }
            );
        }
        
        // Verificar valor mínimo e ajustar interface
        function verificarValorMinimo() {
            const carrinhoData = sessionStorage.getItem('carrinho');
            if (!carrinhoData) return;
            
            const carrinho = JSON.parse(carrinhoData);
            const valorOriginal = carrinho.total || carrinho.subtotal || 0;
            
            if (valorOriginal < 5) {
                // Valor menor que R$ 5,00 - nenhum método disponível
                desabilitarPagamentos();
                
                // Mostrar aviso na seção de pagamento
                const paymentSection = document.querySelector('.payment-options');
                if (paymentSection) {
                    const aviso = document.createElement('div');
                    aviso.className = 'alert alert-danger mb-3';
                    aviso.innerHTML = `
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>Valor insuficiente para pagamento</strong><br>
                        O valor mínimo para qualquer forma de pagamento é <strong>R$ 5,00</strong>.
                        <br><small>Adicione mais itens ao seu carrinho para continuar.</small>
                    `;
                    paymentSection.prepend(aviso);
                }
            } else if (valorOriginal < 15) {
                // Valor entre R$ 5,00 e R$ 14,99 - só cartão disponível
                const pixOption = document.querySelector('[data-payment="pix"]');
                const boletoOption = document.querySelector('[data-payment="boleto"]');
                
                if (pixOption) {
                    pixOption.classList.add('disabled');
                    pixOption.style.position = 'relative';
                    const overlay = pixOption.querySelector('.disabled-overlay');
                    if (!overlay) {
                        const overlayDiv = document.createElement('div');
                        overlayDiv.className = 'disabled-overlay';
                        overlayDiv.style.cssText = `
                            position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
                            background: rgba(255,255,255,0.8); display: flex; align-items: center; 
                            justify-content: center; border-radius: 12px; z-index: 10;
                        `;
                        overlayDiv.innerHTML = `<small class="text-muted fw-bold">PIX disponível a partir de R$ 15,00</small>`;
                        pixOption.appendChild(overlayDiv);
                    }
                }
                
                if (boletoOption) {
                    boletoOption.classList.add('disabled');
                    boletoOption.style.position = 'relative';
                    const overlay = boletoOption.querySelector('.disabled-overlay');
                    if (!overlay) {
                        const overlayDiv = document.createElement('div');
                        overlayDiv.className = 'disabled-overlay';
                        overlayDiv.style.cssText = `
                            position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
                            background: rgba(255,255,255,0.8); display: flex; align-items: center; 
                            justify-content: center; border-radius: 12px; z-index: 10;
                        `;
                        overlayDiv.innerHTML = `<small class="text-muted fw-bold">Disponível a partir de R$ 15,00</small>`;
                        boletoOption.appendChild(overlayDiv);
                    }
                }
                
                // Selecionar cartão automaticamente
                selectPayment('credit');
                
                // Mostrar aviso informativo
                const paymentSection = document.querySelector('.payment-options');
                if (paymentSection && !paymentSection.querySelector('.alert-info')) {
                    const aviso = document.createElement('div');
                    aviso.className = 'alert alert-info mb-3';
                    aviso.innerHTML = `
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Valor entre R$ 5,00 e R$ 14,99</strong><br>
                        Apenas <strong>cartão de crédito</strong> está disponível. PIX disponível a partir de R$ 15,00.
                    `;
                    paymentSection.prepend(aviso);
                }
            } else {
                // Valor R$ 15,00 ou mais - todos os métodos disponíveis
                // Remover overlays se existirem
                document.querySelectorAll('.disabled-overlay').forEach(overlay => overlay.remove());
                document.querySelectorAll('.payment-option').forEach(option => option.classList.remove('disabled'));
            }
        }

        // Renderizar resumo básico
        function loadCheckoutData() {
            let carrinhoData = sessionStorage.getItem('carrinho');
            
            if (!carrinhoData) {
                // Criar carrinho básico de teste se não existir
                const carrinhoTeste = {
                    evento: {
                        id: <?php echo $evento['id']; ?>,
                        nome: '<?php echo addslashes($evento['nome']); ?>'
                    },
                    ingressos: [
                        {
                            id: 1,
                            nome: 'Ingresso Padrão',
                            quantidade: 1,
                            preco: 100.00,
                            subtotal: 100.00
                        }
                    ],
                    subtotal: 100.00,
                    total: 100.00
                };
                
                sessionStorage.setItem('carrinho', JSON.stringify(carrinhoTeste));
                carrinhoData = JSON.stringify(carrinhoTeste);
            }
            
            const carrinho = JSON.parse(carrinhoData);
            
            // Renderizar ingressos
            if (carrinho.ingressos) {
                const ticketsHtml = carrinho.ingressos.map(ingresso => `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <div class="fw-semibold">${ingresso.nome}</div>
                            <small class="text-muted">Qtd: ${ingresso.quantidade}</small>
                        </div>
                        <div>R$ ${parseFloat(ingresso.subtotal).toFixed(2).replace('.', ',')}</div>
                    </div>
                `).join('');
                
                document.getElementById('summary-tickets').innerHTML = ticketsHtml;
                
                // Mostrar valor original inicialmente (sem taxas)
                const valorOriginal = carrinho.total || carrinho.subtotal || 0;
                document.getElementById('valor-total').textContent = 'R$ ' + parseFloat(valorOriginal).toFixed(2).replace('.', ',');
                
                // Adicionar texto inicial
                const summaryTotals = document.getElementById('summary-totals');
                const existingSmall = summaryTotals.querySelector('small');
                if (!existingSmall) {
                    summaryTotals.insertAdjacentHTML('beforeend', '<small class="text-muted">(selecione a forma de pagamento)</small>');
                }
            }
        }

        // Inicializar quando a página carrega
        document.addEventListener('DOMContentLoaded', function() {
            startTimer();
            loadCheckoutData();
            
            // Verificar valor mínimo na inicialização
            verificarValorMinimo();
            
            // Usuário deve escolher a forma de pagamento

            // Máscaras para campos
            // Máscara para WhatsApp
            const whatsappField = document.getElementById('whatsapp');
            if (whatsappField) {
                whatsappField.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 11) {
                        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                    }
                    e.target.value = value;
                });
            }

            // Máscara para CEP
            const cepField = document.getElementById('cep');
            if (cepField) {
                cepField.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 8) {
                        value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
                    }
                    e.target.value = value;
                });
            }

            // Máscara para documento
            const documentoField = document.getElementById('documento');
            if (documentoField) {
                documentoField.addEventListener('input', function(e) {
                    const tipoDoc = document.getElementById('tipo_documento').value;
                    let value = e.target.value.replace(/\D/g, '');
                    
                    if (tipoDoc === 'CPF') {
                        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                    } else if (tipoDoc === 'CNPJ') {
                        value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                    }
                    
                    e.target.value = value;
                });
            }

            // Máscaras para campos do cartão
            const cardNumberField = document.getElementById('card_number');
            if (cardNumberField) {
                cardNumberField.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                    e.target.value = value;
                });
            }

            // Máscara para data de validade
            const cardExpiryField = document.getElementById('card_expiry');
            if (cardExpiryField) {
                cardExpiryField.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                        value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    }
                    e.target.value = value;
                });
            }

            // Máscara para CVV
            const cardCvvField = document.getElementById('card_cvv');
            if (cardCvvField) {
                cardCvvField.addEventListener('input', function(e) {
                    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
                });
            }
        });
        
        console.log('Checkout carregado com sucesso!');
    </script>
</body>
</html>
