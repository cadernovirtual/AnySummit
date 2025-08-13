addEventListener('DOMContentLoaded', function() {
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