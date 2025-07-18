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
                
                mobileSummary.innerHTML = summaryHtml;
                desktopSummary.innerHTML = summaryHtml;
                mobileSummary.style.display = 'block';
                desktopSummary.style.display = 'block';
                
                mobileBuyBtn.disabled = false;
                desktopBuyBtn.disabled = false;
            } else {
                mobileSummary.style.display = 'none';
                desktopSummary.style.display = 'none';
                mobileBuyBtn.disabled = true;
                desktopBuyBtn.disabled = true;
            }
        }

        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            renderTickets();
            updateSummary();
            
            // Sync promo code inputs
            const mobilePromoInput = document.getElementById('mobile-promo-code');
            const desktopPromoInput = document.getElementById('desktop-promo-code');
            
            mobilePromoInput.addEventListener('input', function() {
                desktopPromoInput.value = this.value;
            });
            
            desktopPromoInput.addEventListener('input', function() {
                mobilePromoInput.value = this.value;
            });
        });