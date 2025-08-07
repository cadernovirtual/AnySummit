# PROMPT PARA RECONSTRUÇÃO - EDITAR-EVENTO.PHP WIZARD

## SITUAÇÃO CRÍTICA
O arquivo `editar-evento.php` estava FUNCIONAL com wizard completo e foi DESTRUÍDO. Como não há backup específico, precisa ser RECONSTRUÍDO baseado no `novoevento.php` existente, adaptando para modo EDIÇÃO.

## ESTRATÉGIA DE RECONSTRUÇÃO

### PASSO 1: USAR NOVOEVENTO.PHP COMO BASE
**Fonte:** `/produtor/novoevento.php` (arquivo funcional existente)
**Objetivo:** Copiar estrutura wizard completa e adaptar para edição

#### **O que copiar do novoevento.php:**
1. **HTML completo** - Toda estrutura wizard das 5 etapas
2. **CSS imports** - Links para global.css e criaevento.css  
3. **Formulários completos** - Todos campos, uploads, rich editor
4. **Preview card lateral** - Hero section e informações
5. **Progress bar** - Navegação entre etapas
6. **Loading overlay** - Sistema de spinner

### PASSO 2: ADAPTAÇÕES ESPECÍFICAS PARA EDIÇÃO

#### **PHP Header (início do arquivo):**
```php
<?php
// Correções identificadas que funcionam:
include("check_login.php");
include("conm/conn.php");

// Parâmetros URL - aceita ambos:
$evento_id = isset($_GET['id']) ? intval($_GET['id']) : (isset($_GET['evento_id']) ? intval($_GET['evento_id']) : 0);

// Autenticação:
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

if (!$evento_id || !$usuario_id) {
    header('Location: meuseventos.php');
    exit();
}

// Buscar dados do evento - USAR $con não $conn:
$stmt = $con->prepare("SELECT * FROM eventos WHERE id = ? AND usuario_id = ?");
$stmt->bind_param("ii", $evento_id, $usuario_id);
$stmt->execute();
$dados_evento = $stmt->get_result()->fetch_assoc();

if (!$dados_evento) {
    header('Location: meuseventos.php');
    exit();
}

// Buscar dados do usuário:
$stmt = $con->prepare("SELECT * FROM usuarios WHERE id = ?");
$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$usuario = $stmt->get_result()->fetch_assoc();

// Buscar categorias:
$result = $con->query("SELECT id, nome FROM categorias_eventos ORDER BY nome");
$categorias = $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
?>
```

#### **JavaScript Configuration:**
```javascript
// Dados para JavaScript (adaptar do novoevento.php):
window.sessionData = {
    usuarioId: <?php echo json_encode($usuario_id); ?>,
    usuarioNome: <?php echo json_encode($usuario['nome'] ?? ''); ?>,
    usuarioEmail: <?php echo json_encode($usuario['email'] ?? ''); ?>
};

window.dadosEvento = {
    id: <?php echo json_encode($evento_id); ?>,
    // ... outros dados do evento
};

// IMPORTANTE - Configurar modo edição:
window.isEditMode = true;
window.maxSteps = 5;
```

### PASSO 3: ELEMENTOS CRÍTICOS NECESSÁRIOS

#### **IDs obrigatórios que o JavaScript procura:**
```html
<!-- Etapa 1 -->
<input id="eventName" />
<div id="logoPreviewContainer"></div>
<div id="capaPreviewContainer"></div>
<div id="fundoPreviewMain"></div>
<input id="corFundo" />
<div id="colorPreview"></div>

<!-- Etapa 4 -->
<div id="locationTypeSwitch"></div>
<input id="venueName" />
<input id="eventLink" />

<!-- Preview -->
<div id="previewTitle"></div>
<div id="previewDescription"></div>
<div id="previewDate"></div>
<div id="previewLocation"></div>
<div id="heroBackground"></div>
<img id="heroLogo" />
<img id="heroCapa" />
```

### PASSO 4: JAVASCRIPT ATUAL MANTER
**Arquivo:** `/produtor/js/editar_evento.js` 
**Status:** Funcional com proteções anti-loop
**Ação:** NÃO MODIFICAR - está funcionando

### PASSO 5: ESTRUTURA PARA COPIAR DO NOVOEVENTO.PHP

#### **Seções principais:**
1. **Head completo** - CSS, meta tags, scripts
2. **Loading overlay** - HTML + CSS do spinner  
3. **Header/Menu** - Estrutura padrão
4. **Progress bar** - 5 etapas navegáveis
5. **Formulário wizard** - Todas as 5 etapas completas:
   - Informações + uploads + color picker
   - Data/hora + classificação
   - Rich text editor
   - Localização presencial/online
   - Produtor
6. **Preview card** - Hero section lateral
7. **Scripts** - Carregamento do editar_evento.js

### INSTRUÇÕES DE EXECUÇÃO

#### **1. Abrir novoevento.php:**
- Copiar TODA estrutura HTML do wizard
- Copiar CSS imports e estilos
- Copiar loading overlay
- Copiar preview card

#### **2. Adaptar cabeçalho PHP:**
- Usar includes corretos (check_login.php, conm/conn.php)
- Usar variável $con para banco
- Carregar dados do evento existente
- Configurar JavaScript para modo edição

#### **3. Modificar títulos/textos:**
- "Criar Evento" → "Editar Evento"
- "Salvar evento" → "Salvar alterações"
- Manter toda funcionalidade igual

#### **4. Testar:**
- URL: `/produtor/editar-evento.php?evento_id=56`
- Deve mostrar wizard completo
- JavaScript deve encontrar todos elementos
- Não deve ter loop infinito

## RESULTADO ESPERADO
Um arquivo `editar-evento.php` com:
- **1000+ linhas** - Interface wizard completa
- **5 etapas funcionais** - Igual novoevento.php
- **Modo edição** - Carrega e preenche dados existentes
- **JavaScript funcional** - Usa arquivo atual que está OK
- **Visual idêntico** - Ao novoevento.php mas para editar

## REFERÊNCIA VISUAL
Se não souber como algo deve ficar, **COPIE EXATAMENTE** do `novoevento.php` e apenas adapte os textos e carregamento de dados.

**OBJETIVO:** Recriar wizard completo funcional baseado no novoevento.php existente, adaptado para modo edição.