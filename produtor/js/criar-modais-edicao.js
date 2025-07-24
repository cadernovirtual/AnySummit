/**
 * Verificação completa do problema dos modais de edição
 */

// Verificar se os modais realmente existem
console.log('=== VERIFICAÇÃO URGENTE DOS MODAIS ===');

// Buscar todos os elementos com ID
const todosIDs = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
console.log('Total de elementos com ID:', todosIDs.length);

// Filtrar apenas os que contêm "edit" e "Modal"
const modaisEdit = todosIDs.filter(id => id.toLowerCase().includes('edit') && id.toLowerCase().includes('modal'));
console.log('Modais com "edit" e "modal" no nome:', modaisEdit);

// Buscar especificamente
console.log('\nBusca específica:');
console.log('editLoteDataModal:', document.getElementById('editLoteDataModal'));
console.log('editLotePercentualModal:', document.getElementById('editLotePercentualModal'));

// Verificar se estão em algum iframe
const iframes = document.querySelectorAll('iframe');
console.log('\nNúmero de iframes:', iframes.length);

// Buscar no HTML como texto
const htmlCompleto = document.documentElement.innerHTML;
console.log('\nOs IDs existem no HTML?');
console.log('editLoteDataModal no HTML:', htmlCompleto.includes('editLoteDataModal'));
console.log('editLotePercentualModal no HTML:', htmlCompleto.includes('editLotePercentualModal'));

// Verificar se há algum script que remove os modais
const scripts = Array.from(document.querySelectorAll('script'));
console.log('\nNúmero de scripts na página:', scripts.length);

// Buscar por AJAX ou carregamento dinâmico
let temAjax = false;
scripts.forEach(script => {
    if (script.src) {
        if (script.src.includes('ajax') || script.src.includes('load')) {
            console.log('Script suspeito:', script.src);
            temAjax = true;
        }
    }
});

if (!temAjax) {
    console.log('Nenhum script de AJAX óbvio encontrado');
}

// SOLUÇÃO TEMPORÁRIA: Criar os modais se não existirem
if (!document.getElementById('editLoteDataModal')) {
    console.log('\n=== CRIANDO MODAL DE EDIÇÃO DE DATA ===');
    
    const modalHTML = `
    <div class="modal-overlay" id="editLoteDataModal">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Editar lote por data</div>
                <button class="modal-close" onclick="closeModal('editLoteDataModal')">&times;</button>
            </div>
            
            <input type="hidden" id="editLoteDataId">
            
            <div class="form-group">
                <label>Nome do lote <span class="required">*</span></label>
                <input type="text" id="editLoteDataNome" placeholder="Ex: Lote 1">
            </div>
            
            <div class="form-grid">
                <div class="form-group">
                    <label>Data/hora início <span class="required">*</span></label>
                    <input type="datetime-local" id="editLoteDataInicio">
                </div>
                <div class="form-group">
                    <label>Data/hora fim <span class="required">*</span></label>
                    <input type="datetime-local" id="editLoteDataFim">
                </div>
            </div>
            
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="editLoteDataDivulgar">
                    <span>Divulgar critério de encerramento</span>
                </label>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeModal('editLoteDataModal')">Cancelar</button>
                <button class="btn btn-primary" onclick="salvarLoteData()">Salvar alterações</button>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('Modal de edição de data criado!');
}

if (!document.getElementById('editLotePercentualModal')) {
    console.log('\n=== CRIANDO MODAL DE EDIÇÃO DE PERCENTUAL ===');
    
    const modalHTML = `
    <div class="modal-overlay" id="editLotePercentualModal">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title">Editar lote por percentual</div>
                <button class="modal-close" onclick="closeModal('editLotePercentualModal')">&times;</button>
            </div>
            
            <input type="hidden" id="editLotePercentualId">
            
            <div class="form-group">
                <label>Nome do lote <span class="required">*</span></label>
                <input type="text" id="editLotePercentualNome" placeholder="Ex: Lote 1">
            </div>
            
            <div class="form-group">
                <label>Percentual de vendas (%) <span class="required">*</span></label>
                <input type="number" id="editLotePercentualValor" min="1" max="100" placeholder="Ex: 30">
            </div>
            
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="editLotePercentualDivulgar">
                    <span>Divulgar critério de encerramento</span>
                </label>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeModal('editLotePercentualModal')">Cancelar</button>
                <button class="btn btn-primary" onclick="salvarLotePercentual()">Salvar alterações</button>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('Modal de edição de percentual criado!');
}

// Verificar novamente
setTimeout(() => {
    console.log('\n=== VERIFICAÇÃO APÓS CRIAÇÃO ===');
    console.log('editLoteDataModal existe agora?', !!document.getElementById('editLoteDataModal'));
    console.log('editLotePercentualModal existe agora?', !!document.getElementById('editLotePercentualModal'));
}, 100);