// Correção simples para garantir visibilidade do ícone de lixeira em combos
(function() {
    console.log('🔧 Aplicando correção de visibilidade do ícone de lixeira...');
    
    // Adicionar CSS para garantir que o SVG seja visível
    const style = document.createElement('style');
    style.textContent = `
        /* Garantir que o ícone de lixeira seja visível */
        .combo-item .btn-icon.btn-delete svg {
            display: inline-block !important;
            width: 16px !important;
            height: 16px !important;
            vertical-align: middle !important;
        }
        
        /* Se o SVG não aparecer, usar emoji como fallback */
        .combo-item .btn-icon.btn-delete:empty::after {
            content: '🗑️';
        }
        
        /* Estilo do botão */
        .combo-item .btn-icon.btn-delete {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: #dc3545;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        
        .combo-item .btn-icon.btn-delete:hover {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ CSS para ícone de lixeira aplicado!');
})();
