// Função temporária para substituir o ícone de lixeira
function patchTrashIcons() {
    // Substituir todos os botões de excluir que tenham emoji
    document.querySelectorAll('.btn-delete').forEach(button => {
        if (button.innerHTML.includes('🗑') || button.innerHTML.includes('ðŸ—'')) {
            button.innerHTML = getTrashIcon();
        }
    });
}

// Adicionar ao final de updateComboItemsList
const originalUpdateComboItemsList = updateComboItemsList;
updateComboItemsList = function() {
    originalUpdateComboItemsList();
    setTimeout(patchTrashIcons, 10);
}

// Adicionar ao final de addTicketToList
const originalAddTicketToList = addTicketToList;
addTicketToList = function(...args) {
    originalAddTicketToList(...args);
    setTimeout(patchTrashIcons, 10);
}