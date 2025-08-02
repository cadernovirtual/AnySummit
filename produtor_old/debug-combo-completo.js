// Debug completo para encontrar os combos
console.log('🔍 Iniciando debug completo de combos...');

// 1. Verificar todos os ticket-items
console.log('\n1️⃣ TODOS OS TICKET-ITEMS:');
const allTicketItems = document.querySelectorAll('.ticket-item');
console.log(`Total de ticket-items encontrados: ${allTicketItems.length}`);

allTicketItems.forEach((item, index) => {
    console.log(`\nItem ${index + 1}:`);
    console.log('- Classes:', item.className);
    console.log('- Dataset:', item.dataset);
    console.log('- ticketData:', item.ticketData);
    
    // Verificar badges
    const badges = item.querySelectorAll('.ticket-type-badge');
    badges.forEach(badge => {
        console.log('- Badge encontrado:', badge.className, '- Texto:', badge.textContent);
    });
    
    // Verificar se tem "COMBO" em algum lugar
    const temComboNoTexto = item.textContent.includes('COMBO');
    console.log('- Tem "COMBO" no texto?', temComboNoTexto);
    
    // Verificar estrutura interna
    const ticketName = item.querySelector('.ticket-name');
    if (ticketName) {
        console.log('- Nome do ticket:', ticketName.textContent);
    }
});

// 2. Buscar por diferentes seletores de combo
console.log('\n2️⃣ BUSCANDO COMBOS POR DIFERENTES SELETORES:');
const seletores = [
    '.ticket-type-badge.combo',
    '.ticket-type-badge:contains("COMBO")',
    '[class*="combo"]',
    '.ticket-item:has(.combo)',
    '.combo',
    '[data-type="combo"]'
];

seletores.forEach(seletor => {
    try {
        const elementos = document.querySelectorAll(seletor);
        console.log(`- Seletor "${seletor}": ${elementos.length} elementos`);
    } catch (e) {
        console.log(`- Seletor "${seletor}": erro (${e.message})`);
    }
});

// 3. Buscar por texto
console.log('\n3️⃣ BUSCANDO POR TEXTO "COMBO":');
const todosElementos = document.querySelectorAll('*');
let elementosComCombo = 0;
todosElementos.forEach(el => {
    if (el.textContent === 'COMBO' && el.children.length === 0) {
        elementosComCombo++;
        console.log('- Elemento com texto "COMBO":', el.tagName, el.className);
        console.log('  Parent:', el.parentElement.className);
    }
});
console.log(`Total de elementos com texto "COMBO": ${elementosComCombo}`);

// 4. Verificar estrutura do ticketsList
console.log('\n4️⃣ ESTRUTURA DO TICKETS LIST:');
const ticketsList = document.getElementById('ticketsList');
if (ticketsList) {
    console.log('- ticketsList encontrado');
    console.log('- Número de filhos:', ticketsList.children.length);
    console.log('- HTML:', ticketsList.innerHTML.substring(0, 500) + '...');
} else {
    console.log('- ticketsList NÃO encontrado!');
}

// 5. Verificar dados salvos
console.log('\n5️⃣ VERIFICANDO DADOS SALVOS:');
if (window.temporaryTickets) {
    console.log('- temporaryTickets:', window.temporaryTickets);
}
if (window.comboItems) {
    console.log('- comboItems:', window.comboItems);
}

// 6. Verificar cookies
console.log('\n6️⃣ VERIFICANDO COOKIES:');
const cookies = document.cookie.split(';');
cookies.forEach(cookie => {
    if (cookie.includes('ingresso') || cookie.includes('combo') || cookie.includes('ticket')) {
        console.log('- Cookie relevante:', cookie.substring(0, 100) + '...');
    }
});

console.log('\n✅ Debug completo finalizado!');