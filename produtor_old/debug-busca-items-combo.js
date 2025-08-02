// Debug para encontrar onde estão os itens do combo
console.log('🔍 Iniciando busca pelos itens do combo...');

// 1. Verificar cookies
console.log('\n🍪 VERIFICANDO COOKIES:');
const cookies = document.cookie.split(';');
cookies.forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && (name.includes('ingresso') || name.includes('combo'))) {
        try {
            const parsed = JSON.parse(decodeURIComponent(value));
            console.log(`\n${name}:`, parsed);
            
            // Procurar por combos nos dados
            if (Array.isArray(parsed)) {
                parsed.forEach((item, i) => {
                    if (item.type === 'combo' || item.tipo === 'combo') {
                        console.log(`\n📦 COMBO ENCONTRADO no índice ${i}:`, item);
                        if (item.items) {
                            console.log('  ✅ Tem items:', item.items);
                        } else {
                            console.log('  ❌ NÃO tem items!');
                        }
                    }
                });
            }
        } catch (e) {
            console.log(`${name}: [não é JSON]`);
        }
    }
});

// 2. Verificar localStorage
console.log('\n💾 VERIFICANDO LOCALSTORAGE:');
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('ingresso') || key.includes('combo') || key.includes('ticket'))) {
        try {
            const value = localStorage.getItem(key);
            const parsed = JSON.parse(value);
            console.log(`\n${key}:`, parsed);
        } catch (e) {
            // Não é JSON
        }
    }
}

// 3. Verificar variáveis globais
console.log('\n🌐 VERIFICANDO VARIÁVEIS GLOBAIS:');
if (window.comboItems) {
    console.log('window.comboItems:', window.comboItems);
}
if (window.temporaryTickets) {
    console.log('window.temporaryTickets:', window.temporaryTickets);
    window.temporaryTickets.forEach((ticket, i) => {
        if (ticket.type === 'combo' || ticket.tipo === 'combo') {
            console.log(`\n📦 Combo em temporaryTickets[${i}]:`, ticket);
        }
    });
}

// 4. Verificar DOM
console.log('\n📄 VERIFICANDO DOM:');
const ticketItems = document.querySelectorAll('.ticket-item');
ticketItems.forEach((item, index) => {
    const isCombo = item.querySelector('.ticket-type-badge.combo') || 
                   item.textContent.includes('COMBO');
    
    if (isCombo) {
        console.log(`\n📦 Combo no DOM (item ${index}):`);
        console.log('- ticketData:', item.ticketData);
        console.log('- dataset:', item.dataset);
        
        // Procurar por estruturas de dados no elemento
        if (item.ticketData) {
            console.log('- ticketData.items:', item.ticketData.items);
            console.log('- ticketData.comboData:', item.ticketData.comboData);
            console.log('- ticketData.itens:', item.ticketData.itens);
        }
    }
});

// 5. Tentar recuperar dados do wizard
console.log('\n🧙 VERIFICANDO DADOS DO WIZARD:');
const wizardCookie = document.cookie.split(';').find(c => c.trim().startsWith('eventoWizard='));
if (wizardCookie) {
    try {
        const wizardData = JSON.parse(decodeURIComponent(wizardCookie.split('=')[1]));
        if (wizardData.ingressosSalvos) {
            console.log('Ingressos salvos no wizard:');
            wizardData.ingressosSalvos.forEach((ing, i) => {
                if (ing.type === 'combo' || ing.tipo === 'combo') {
                    console.log(`\n📦 Combo no wizardData.ingressosSalvos[${i}]:`, ing);
                }
            });
        }
    } catch (e) {
        console.error('Erro ao parsear wizard data:', e);
    }
}

console.log('\n✅ Busca concluída!');