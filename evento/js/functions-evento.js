   // State management
        let tickets = [
            {
                id: '1',
                name: '1º Lote - Early Bird',
                originalPrice: 89.90,
                currentPrice: 89.90,
                installments: 'em até 12x R$ 8,90',
                quantity: 0,
                maxQuantity: 10,
                available: true
            },
            {
                id: '2',
                name: '2º Lote - Regular',
                originalPrice: 149.90,
                currentPrice: 149.90,
                installments: 'em até 12x R$ 14,99',
                quantity: 0,
                maxQuantity: 10,
                available: true
            },
            {
                id: '3',
                name: '3º Lote - Last Chance',
                originalPrice: 199.90,
                currentPrice: 199.90,
                installments: 'em até 12x R$ 19,99',
                quantity: 0,
                maxQuantity: 10,
                available: false
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
                const newQuantity = Math.max(0, Math.min(ticket.maxQuantity, ticket.quantity + change));
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

        function applyPromoCode() {
            const mobileInput = document.getElementById('mobile-promo-code');
            const desktopInput = document.getElementById('desktop-promo-code');
            const code = (mobileInput.value || desktopInput.value).toUpperCase();
            
            if (validCodes[code]) {
                promoDiscount = validCodes[code];
                promoApplied = true;
                promoCode = code;
                
                // Update both inputs
                mobileInput.value = code;
                desktopInput.value = code;
                
                // Disable inputs and buttons
                mobileInput.disabled = true;
                desktopInput.disabled = true;
                document.getElementById('mobile-promo-btn').disabled = true;
                document.getElementById('desktop-promo-btn').disabled = true;
                
                // Show success messages
                document.getElementById('mobile-promo-success').style.display = 'block';
                document.getElementById('desktop-promo-success').style.display = 'block';
                
                updateSummary();
            } else {
                alert('Código promocional inválido!');
            }
        }

        function shareEvent(platform) {
            const url = window.location.href;
            const text = 'AnySummit 2025 - O maior evento de tecnologia do Brasil!';
            
            const shareUrls = {
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
                whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
            };
            
            if (shareUrls[platform]) {
                window.open(shareUrls[platform], '_blank', 'width=600,height=400');
            }
        }

        function copyLink() {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copiado para a área de transferência!');
        }
        function renderTicketItem(ticket, prefix) {
            return `
                <div class="ticket-item">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div class="flex-grow-1">
                            <h6 class="fw-semibold mb-1">${ticket.name}</h6>
                            <div class="text-success fw-bold mb-1">
                                R$ ${formatPrice(ticket.currentPrice)}
                            </div>
                            <small class="text-success">${ticket.installments}</small>
                            ${!ticket.available ? '<div class="text-muted mt-1"><small><i class="fas fa-lock me-1"></i>Esgotado</small></div>' : ''}
                        </div>
                        <div class="quantity-controls">
                            <button 
                                class="quantity-btn minus"
                                onclick="updateQuantity('${ticket.id}', -1)"
                                ${ticket.quantity === 0 || !ticket.available ? 'disabled' : ''}
                            >
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-display">${ticket.quantity}</span>
                            <button 
                                class="quantity-btn plus"
                                onclick="updateQuantity('${ticket.id}', 1)"
                                ${ticket.quantity >= ticket.maxQuantity || !ticket.available ? 'disabled' : ''}
                            >
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderTickets() {
            const mobileList = document.getElementById('mobile-tickets-list');
            const desktopList = document.getElementById('desktop-tickets-list');
            
            const ticketsHtml = tickets.map(ticket => renderTicketItem(ticket, '')).join('');
            
            mobileList.innerHTML = ticketsHtml;
            desktopList.innerHTML = ticketsHtml;
        }

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
                    <small class="text-muted">ou 12x R$ ${formatPrice(total / 12)}</small>
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
            
            // DEBUG PARA MOBILE: Forçar habilitação se houver tickets disponíveis
            if (tickets && tickets.length > 0 && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                console.log('📱 Mobile detectado - verificando se deve forçar habilitação');
                
                if (mobileBuyBtn && totalTickets === 0) {
                    // Se não há tickets selecionados mas há tickets disponíveis, 
                    // vamos pelo menos deixar clicável para debug
                    console.log('🔧 DEBUG: Mantendo botão mobile clicável para debug');
                }
            }
        }

        // Função para processar compra - VERSÃO MOBILE-FRIENDLY
        function processarCompra() {
            console.log('🛒 processarCompra iniciada');
            
            const selectedTickets = tickets.filter(ticket => ticket.quantity > 0);
            
            if (selectedTickets.length === 0) {
                alert('Selecione pelo menos um ingresso para continuar.');
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
                    subtotal: ticket.currentPrice * ticket.quantity
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
                
                // Redirecionamento específico para mobile
                if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                    console.log('📱 Dispositivo mobile detectado - usando window.location.href');
                    window.location.href = checkoutUrl;
                } else {
                    console.log('🖥️ Desktop detectado - usando window.location.href');
                    window.location.href = checkoutUrl;
                }
                
            } catch (error) {
                console.error('❌ Erro ao processar compra:', error);
                alert('Erro ao processar compra: ' + error.message);
            }
        }

        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM carregado - iniciando sistema de tickets');
            
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
            
            // Adicionar eventos aos botões de compra - MÚLTIPLAS TENTATIVAS
            const mobileBuyBtn = document.getElementById('mobile-buy-btn');
            const desktopBuyBtn = document.getElementById('desktop-buy-btn');
            
            console.log('Botão mobile encontrado:', !!mobileBuyBtn);
            console.log('Botão desktop encontrado:', !!desktopBuyBtn);
            
            // Método 1: addEventListener normal
            if (mobileBuyBtn) {
                mobileBuyBtn.addEventListener('click', function(e) {
                    console.log('Clique mobile detectado via addEventListener');
                    e.preventDefault();
                    e.stopPropagation();
                    processarCompra();
                });
                
                // Método 2: onclick como backup
                mobileBuyBtn.onclick = function(e) {
                    console.log('Clique mobile detectado via onclick');
                    e.preventDefault();
                    processarCompra();
                };
                
                // Método 3: touchstart para mobile
                mobileBuyBtn.addEventListener('touchstart', function(e) {
                    console.log('Touch mobile detectado');
                });
                
                console.log('✅ Eventos adicionados ao botão mobile');
            } else {
                console.error('❌ Botão mobile não encontrado!');
            }
            
            if (desktopBuyBtn) {
                desktopBuyBtn.addEventListener('click', function(e) {
                    console.log('Clique desktop detectado via addEventListener');
                    e.preventDefault();
                    e.stopPropagation();
                    processarCompra();
                });
                
                // Backup onclick
                desktopBuyBtn.onclick = function(e) {
                    console.log('Clique desktop detectado via onclick');
                    e.preventDefault();
                    processarCompra();
                };
                
                console.log('✅ Eventos adicionados ao botão desktop');
            } else {
                console.error('❌ Botão desktop não encontrado!');
            }
            
            // Verificação adicional após 1 segundo
            setTimeout(function() {
                const mobileBtnCheck = document.getElementById('mobile-buy-btn');
                const desktopBtnCheck = document.getElementById('desktop-buy-btn');
                
                console.log('Verificação tardia:');
                console.log('- Mobile button:', !!mobileBtnCheck);
                console.log('- Desktop button:', !!desktopBtnCheck);
                
                if (mobileBtnCheck && !mobileBtnCheck.onclick) {
                    console.log('Adicionando onclick de emergência ao mobile');
                    mobileBtnCheck.onclick = function() {
                        console.log('Onclick de emergência mobile');
                        processarCompra();
                    };
                }
                
                if (desktopBtnCheck && !desktopBtnCheck.onclick) {
                    console.log('Adicionando onclick de emergência ao desktop');
                    desktopBtnCheck.onclick = function() {
                        console.log('Onclick de emergência desktop');
                        processarCompra();
                    };
                }
            }, 1000);
        });
        
        // Função global como backup
        window.processarCompra = processarCompra;