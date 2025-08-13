   // State management - MODIFICADO para suportar lotes e combos
        let tickets = [
            {
                id: '1',
                name: '1º Lote - Early Bird',
                originalPrice: 89.90,
                currentPrice: 89.90,
                installments: 'em até 12x R$ 8,90',
                quantity: 0,
                maxQuantity: 10,
                available: true,
                tipo: 'pago',
                badgeLote: '',
                comboItens: null,
                descricao: ''
            },
            {
                id: '2',
                name: '2º Lote - Regular',
                originalPrice: 149.90,
                currentPrice: 149.90,
                installments: 'em até 12x R$ 14,99',
                quantity: 0,
                maxQuantity: 10,
                available: true,
                tipo: 'pago',
                badgeLote: '',
                comboItens: null,
                descricao: ''
            },
            {
                id: '3',
                name: 'Combo Família',
                originalPrice: 299.90,
                currentPrice: 299.90,
                installments: 'em até 12x R$ 29,99',
                quantity: 0,
                maxQuantity: 5,
                available: true,
                tipo: 'combo',
                badgeLote: '1º Lote - até 15/09/2025',
                comboItens: [
                    {id: 1, nome: 'Ingresso Individual A', quantidade: 2},
                    {id: 2, nome: 'Ingresso Individual B', quantidade: 2}
                ],
                descricao: 'Perfeito para famílias'
            }
        ];

        let promoCode = '';
        let promoDiscount = 0;
        let promoApplied = false;

        // Valid promo codes
        const validCodes = {
            'SUMMIT25': 10,
            'EARLY25': 15,
            'TECH25': 20
        };

        // Utility functions
        function formatPrice(price) {
            return price.toFixed(2).replace('.', ',');
        }

        function updateQuantity(ticketId, change) {
            const ticket = tickets.find(t => t.id === ticketId);
            if (ticket) {
                const newQuantity = Math.max(0, ticket.maxQuantity > 0 ? Math.min(ticket.maxQuantity, ticket.quantity + change) : ticket.quantity + change);
                ticket.quantity = newQuantity;
                renderTickets();
                updateSummary();
            }
        }
        
        function getTotalTickets() {
            return tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
        }

        function getSubtotal() {
            return tickets.reduce((sum, ticket) => sum + (ticket.currentPrice * ticket.quantity), 0);
        }

        function getTotal() {
            const subtotal = getSubtotal();
            return subtotal - (subtotal * promoDiscount / 100);
        }

        // NOVA: Função para renderizar badge de lote
        function renderBadgeLote(badgeLote) {
            if (!badgeLote) return '';
            
            return `
                <div class="mb-2">
                    <span class="badge bg-secondary text-white" style="font-size: 0.8em;">
                        <i class="fas fa-tags me-1"></i>
                        ${badgeLote}
                    </span>
                </div>
            `;
        }

        // NOVA: Função para renderizar conteúdo do combo
        function renderComboContent(comboItens) {
            if (!comboItens || !Array.isArray(comboItens)) return '';
            
            const itensHtml = comboItens.map(item => `
                <li class="combo-item">
                    <span class="fw-medium">${item.quantidade}x</span> 
                    ${item.nome}
                </li>
            `).join('');
            
            return `
                <div class="combo-content mt-3 p-3" style="background-color: #f8f9fa; border-left: 3px solid #007bff; border-radius: 5px;">
                    <h6 class="fw-bold mb-2" style="color: #495057;">
                        <i class="fas fa-box-open me-1"></i>
                        Este combo inclui:
                    </h6>
                    <ul class="mb-0" style="padding-left: 1.2rem;">
                        ${itensHtml}
                    </ul>
                </div>
            `;
        }

        function applyPromoCode() {
            const mobileInput = document.getElementById('mobile-promo-code');
            const desktopInput = document.getElementById('desktop-promo-code');
            const code = (mobileInput?.value || desktopInput?.value || '').toUpperCase();
            
            if (validCodes[code]) {
                promoDiscount = validCodes[code];
                promoApplied = true;
                promoCode = code;
                
                // Update both inputs
                if (mobileInput) {
                    mobileInput.value = code;
                    mobileInput.disabled = true;
                }
                if (desktopInput) {
                    desktopInput.value = code;
                    desktopInput.disabled = true;
                }
                
                // Disable buttons
                const mobileBtn = document.getElementById('mobile-promo-btn');
                const desktopBtn = document.getElementById('desktop-promo-btn');
                if (mobileBtn) mobileBtn.disabled = true;
                if (desktopBtn) desktopBtn.disabled = true;
                
                // Show success messages
                const mobileSuccess = document.getElementById('mobile-promo-success');
                const desktopSuccess = document.getElementById('desktop-promo-success');
                if (mobileSuccess) mobileSuccess.style.display = 'block';
                if (desktopSuccess) desktopSuccess.style.display = 'block';
                
                updateSummary();
                
                // Show success feedback
                showToast('Código promocional aplicado com sucesso!', 'success');
            } else {
                showToast('Código promocional inválido!', 'error');
            }
        }

        // NOVA: Função para mostrar toast de feedback
        function showToast(message, type = 'info') {
            // Criar elemento de toast se não existir
            let toastContainer = document.getElementById('toast-container');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'toast-container';
                toastContainer.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                `;
                document.body.appendChild(toastContainer);
            }
            
            const toast = document.createElement('div');
            const bgColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff';
            
            toast.style.cssText = `
                background: ${bgColor};
                color: white;
                padding: 12px 20px;
                border-radius: 5px;
                margin-bottom: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                animation: slideIn 0.3s ease;
                opacity: 0.95;
            `;
            
            toast.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle me-2"></i>
                ${message}
            `;
            
            // Adicionar animação CSS se não existir
            if (!document.getElementById('toast-animations')) {
                const style = document.createElement('style');
                style.id = 'toast-animations';
                style.textContent = `
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 0.95; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            toastContainer.appendChild(toast);
            
            // Remover após 3 segundos
            setTimeout(() => {
                toast.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, 3000);
        }

        // MODIFICADA: Função de renderização de tickets com badges e combos
        function renderTickets() {
            const mobileContainer = document.getElementById('mobile-tickets-list');
            const desktopContainer = document.getElementById('desktop-tickets-list');
            
            if (!mobileContainer && !desktopContainer) return;

            const availableTickets = tickets.filter(ticket => ticket.available);
            
            if (availableTickets.length === 0) {
                const noTicketsHtml = `
                    <div class="text-center p-4">
                        <i class="fas fa-ticket-alt fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Nenhum ingresso disponível</h5>
                        <p class="text-muted">Não há ingressos disponíveis para venda no momento.</p>
                    </div>
                `;
                if (mobileContainer) mobileContainer.innerHTML = noTicketsHtml;
                if (desktopContainer) desktopContainer.innerHTML = noTicketsHtml;
                return;
            }

            const ticketsHtml = availableTickets.map(ticket => `
                <div class="ticket-item border rounded p-3 mb-3" style="border-color: #e9ecef !important;">
                    ${renderBadgeLote(ticket.badgeLote)}
                    
                    <h6 class="fw-bold mb-2">${ticket.name}</h6>
                    
                    ${ticket.descricao ? `<p class="text-muted small mb-2">${ticket.descricao}</p>` : ''}
                    
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <span class="h5 text-primary fw-bold">R$ ${formatPrice(ticket.currentPrice)}</span>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <button 
                                class="btn btn-outline-secondary btn-sm" 
                                onclick="updateQuantity('${ticket.id}', -1)"
                                ${ticket.quantity === 0 ? 'disabled' : ''}
                                style="width: 32px; height: 32px; padding: 0; border-radius: 50%;"
                            >
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="mx-2 fw-bold" style="min-width: 20px; text-align: center;">${ticket.quantity}</span>
                            <button 
                                class="btn btn-outline-secondary btn-sm" 
                                onclick="updateQuantity('${ticket.id}', 1)"
                                ${ticket.maxQuantity > 0 && ticket.quantity >= ticket.maxQuantity ? 'disabled' : ''}
                                style="width: 32px; height: 32px; padding: 0; border-radius: 50%;"
                            >
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    
                    ${renderComboContent(ticket.comboItens)}
                </div>
            `).join('');

            if (mobileContainer) mobileContainer.innerHTML = ticketsHtml;
            if (desktopContainer) desktopContainer.innerHTML = ticketsHtml;
        }        // MODIFICADA: Função updateSummary
        function updateSummary() {
            const totalTickets = getTotalTickets();
            const subtotal = getSubtotal();
            const total = getTotal();
            
            const mobileSummary = document.getElementById('mobile-summary');
            const desktopSummary = document.getElementById('desktop-summary');
            const mobileBuyBtn = document.getElementById('mobile-buy-btn');
            const desktopBuyBtn = document.getElementById('desktop-buy-btn');
            
            console.log('🔄 updateSummary chamada', {
                totalTickets,
                subtotal,
                total,
                mobileBuyBtn: !!mobileBuyBtn,
                desktopBuyBtn: !!desktopBuyBtn
            });
            
            if (totalTickets > 0) {
                const summaryHtml = `
                    <div class="row mb-2">
                        <div class="col">Subtotal:</div>
                        <div class="col-auto">R$ ${formatPrice(subtotal)}</div>
                    </div>
                    ${promoApplied ? `
                        <div class="row mb-2 text-success">
                            <div class="col">Desconto (${promoDiscount}%):</div>
                            <div class="col-auto">-R$ ${formatPrice(subtotal * promoDiscount / 100)}</div>
                        </div>
                    ` : ''}
                    <hr>
                    <div class="row fw-bold">
                        <div class="col">Total:</div>
                        <div class="col-auto">R$ ${formatPrice(total)}</div>
                    </div>
                `;
                
                if (mobileSummary) mobileSummary.innerHTML = summaryHtml;
                if (desktopSummary) desktopSummary.innerHTML = summaryHtml;
                if (mobileSummary) mobileSummary.style.display = 'block';
                if (desktopSummary) desktopSummary.style.display = 'block';
                
                if (mobileBuyBtn) {
                    mobileBuyBtn.disabled = false;
                    mobileBuyBtn.className = mobileBuyBtn.className.replace('btn-secondary', 'btn-primary-gradient');
                    console.log('✅ Botão mobile habilitado');
                }
                if (desktopBuyBtn) {
                    desktopBuyBtn.disabled = false;
                    desktopBuyBtn.className = desktopBuyBtn.className.replace('btn-secondary', 'btn-primary-gradient');
                    console.log('✅ Botão desktop habilitado');
                }
            } else {
                if (mobileSummary) mobileSummary.style.display = 'none';
                if (desktopSummary) desktopSummary.style.display = 'none';
                
                if (mobileBuyBtn) {
                    mobileBuyBtn.disabled = true;
                    console.log('❌ Botão mobile desabilitado');
                }
                if (desktopBuyBtn) {
                    desktopBuyBtn.disabled = true;
                    console.log('❌ Botão desktop desabilitado');
                }
            }
        }

        // Função para processar compra - VERSÃO MODIFICADA
        function processarCompra() {
            console.log('🛒 processarCompra iniciada');
            
            const selectedTickets = tickets.filter(ticket => ticket.quantity > 0);
            
            if (selectedTickets.length === 0) {
                showToast('Selecione pelo menos um ingresso para continuar.', 'error');
                return;
            }
            
            console.log('✅ Ingressos selecionados:', selectedTickets);
            
            // Criar objeto do carrinho
            const carrinho = {
                evento: eventoData,
                ingressos: selectedTickets.map(ticket => ({
                    id: ticket.id,
                    nome: ticket.name,
                    preco: ticket.currentPrice,
                    quantidade: ticket.quantity,
                    subtotal: ticket.currentPrice * ticket.quantity,
                    tipo: ticket.tipo,
                    badgeLote: ticket.badgeLote,
                    comboItens: ticket.comboItens
                })),
                subtotal: getSubtotal(),
                desconto: promoApplied ? (getSubtotal() * promoDiscount / 100) : 0,
                total: getTotal(),
                codigoPromocional: promoApplied ? promoCode : null,
                percentualDesconto: promoApplied ? promoDiscount : 0
            };
            
            console.log('🛒 Carrinho criado:', carrinho);
            
            try {
                // Salvar no sessionStorage
                sessionStorage.setItem('carrinho', JSON.stringify(carrinho));
                console.log('✅ Carrinho salvo no sessionStorage');
                
                // Construir URL de redirecionamento
                const checkoutUrl = '/evento/checkout/' + encodeURIComponent(eventoData.slug);
                console.log('🔄 Redirecionando para:', checkoutUrl);
                
                // Redirecionamento
                window.location.href = checkoutUrl;
                
            } catch (error) {
                console.error('❌ Erro ao processar compra:', error);
                showToast('Erro ao processar compra: ' + error.message, 'error');
            }
        }

        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM carregado - iniciando sistema de tickets modificado');
            
            renderTickets();
            updateSummary();
            
            // Sync promo code inputs
            const mobilePromoInput = document.getElementById('mobile-promo-code');
            const desktopPromoInput = document.getElementById('desktop-promo-code');
            
            if (mobilePromoInput && desktopPromoInput) {
                mobilePromoInput.addEventListener('input', function() {
                    desktopPromoInput.value = this.value;
                });
                
                desktopPromoInput.addEventListener('input', function() {
                    mobilePromoInput.value = this.value;
                });
            }
            
            // Adicionar eventos aos botões de compra
            const mobileBuyBtn = document.getElementById('mobile-buy-btn');
            const desktopBuyBtn = document.getElementById('desktop-buy-btn');
            
            console.log('Botão mobile encontrado:', !!mobileBuyBtn);
            console.log('Botão desktop encontrado:', !!desktopBuyBtn);
            
            if (mobileBuyBtn) {
                mobileBuyBtn.addEventListener('click', function(e) {
                    console.log('Clique mobile detectado via addEventListener');
                    e.preventDefault();
                    e.stopPropagation();
                    processarCompra();
                });
                
                mobileBuyBtn.onclick = function(e) {
                    console.log('Clique mobile detectado via onclick');
                    e.preventDefault();
                    processarCompra();
                };
                
                console.log('✅ Eventos adicionados ao botão mobile');
            }
            
            if (desktopBuyBtn) {
                desktopBuyBtn.addEventListener('click', function(e) {
                    console.log('Clique desktop detectado via addEventListener');
                    e.preventDefault();
                    e.stopPropagation();
                    processarCompra();
                });
                
                desktopBuyBtn.onclick = function(e) {
                    console.log('Clique desktop detectado via onclick');
                    e.preventDefault();
                    processarCompra();
                };
                
                console.log('✅ Eventos adicionados ao botão desktop');
            }
        });
        
        // Função global como backup
        window.processarCompra = processarCompra;