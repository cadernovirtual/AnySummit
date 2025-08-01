# PROMPT PARA REFATORAÇÃO DO SALVAMENTO DO WIZARD

## CONTEXTO
Estou trabalhando em um sistema de criação de eventos com wizard de 8 etapas. O salvamento dos dados está com problemas - muitos campos não estão sendo salvos corretamente e a estrutura do JSON final não está compatível com a API `criaeventoapi.php`.

## OBJETIVO
Refatorar completamente o sistema de salvamento de dados do wizard, garantindo que cada etapa salve corretamente seus dados e que o JSON final esteja no formato exato esperado pela API.

## ARQUIVOS IMPORTANTES
- **Arquivo atual**: `/produtor/novoevento.php` 
- **Arquivo de referência**: `/produtor_git/novoevento.php` (versão funcional anterior)
- **Script principal**: `/produtor/js/criaevento.js` (contém a estrutura correta)
- **API de destino**: `/produtor/criaeventoapi.php`
- **Caminho completo**: `D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\`

## ESTRUTURA DO WIZARD
1. **Etapa 1**: Informações básicas (nome, classificação, categoria, logo, capa, fundo)
2. **Etapa 2**: Data e local
3. **Etapa 3**: Descrição do evento
4. **Etapa 4**: Dados do produtor
5. **Etapa 5**: Configuração de lotes
6. **Etapa 6**: Configuração de ingressos
7. **Etapa 7**: Extras (estacionamento, acessibilidade, formas de pagamento)
8. **Etapa 8**: Termos e publicação

## ESTRUTURA CORRETA DOS DADOS (baseada em criaevento.js)

### Formato Final Esperado pela API:
```javascript
{
    evento: {
        // Step 1 - Informações Básicas
        nome: string,
        classificacao: string,
        categoria: string,
        
        // Step 2 - Data e Horário
        data_inicio: string (formato datetime-local),
        data_fim: string (formato datetime-local),
        evento_multiplos_dias: boolean,
        
        // Step 3 - Descrição
        descricao_completa: string (HTML completo),
        descricao_texto: string (texto puro),
        
        // Step 2/4 - Localização
        tipo_local: 'presencial' | 'online',
        // Para presencial:
        busca_endereco: string (endereço completo),
        nome_local: string,
        cep: string,
        rua: string,
        numero: string,
        complemento: string,
        bairro: string,
        cidade: string,
        estado: string,
        // Para online:
        link_online: string,
        
        // Step 4 - Produtor
        tipo_produtor: 'novo' | 'atual',
        nome_produtor: string (se novo),
        nome_exibicao: string (se novo),
        descricao_produtor: string (se novo),
        
        // Step 8 - Configurações Finais
        visibilidade: 'public' | 'private' | 'password',
        termos_aceitos: boolean
    },
    
    // Step 6 - Ingressos
    ingressos: [
        {
            tipo: 'pago' | 'gratuito' | 'combo' | 'codigo',
            titulo: string,
            descricao: string,
            quantidade_total: number,
            preco: number,
            valor_receber: number,
            taxa_plataforma: number,
            inicio_venda: string (datetime),
            fim_venda: string (datetime),
            limite_min: number,
            limite_max: number,
            ativo: boolean,
            posicao_ordem: number,
            conteudo_combo: object (apenas para combos)
        }
    ]
}
```

## PLANO DE AÇÃO DETALHADO

### FASE 1: ANÁLISE DA ESTRUTURA ATUAL
1. Verificar em `/produtor/js/criaevento.js`:
   - Função `coletarDadosFormulario()` (linha ~2220)
   - Função `enviarEventoParaAPI()` (linha ~2069)
   - Função `coletarDadosIngressos()` (linha ~2317)

2. Entender como os dados são estruturados:
   - O objeto principal tem duas propriedades: `evento` e `ingressos`
   - Todos os dados do evento ficam dentro de `evento`
   - Ingressos é um array separado

### FASE 2: CRIAR SISTEMA DE SALVAMENTO MODULAR
1. Criar arquivo `js/wizard-save-system-v2.js`:
```javascript
window.WizardSaveSystemV2 = {
    // Estrutura compatível com criaevento.js
    dadosEvento: {
        evento: {},
        ingressos: []
    },
    
    // Lotes salvos separadamente (não vão para API diretamente)
    lotes: {
        porData: [],
        porPercentual: []
    },
    
    // Métodos de salvamento por etapa
    salvarStep1: function() {
        this.dadosEvento.evento.nome = document.getElementById('eventName')?.value || '';
        this.dadosEvento.evento.classificacao = document.getElementById('classification')?.value || '';
        this.dadosEvento.evento.categoria = document.getElementById('category')?.value || '';
        // Salvar também refs das imagens
    },
    
    salvarStep2: function() {
        this.dadosEvento.evento.data_inicio = document.getElementById('startDateTime')?.value || '';
        this.dadosEvento.evento.data_fim = document.getElementById('endDateTime')?.value || '';
        
        const isPresencial = document.getElementById('locationTypeSwitch')?.classList.contains('active');
        this.dadosEvento.evento.tipo_local = isPresencial ? 'presencial' : 'online';
        
        if (isPresencial) {
            // Coletar todos os campos de endereço
            this.dadosEvento.evento.rua = document.getElementById('street')?.value || '';
            this.dadosEvento.evento.numero = document.getElementById('number')?.value || '';
            // etc...
        } else {
            this.dadosEvento.evento.link_online = document.getElementById('eventLink')?.value || '';
        }
    },
    
    // ... outros métodos
    
    salvarStep6: function() {
        // Usar a lógica de coletarDadosIngressos() do criaevento.js
        this.dadosEvento.ingressos = this.coletarIngressosAtualizados();
    },
    
    obterDadosCompletos: function() {
        return this.dadosEvento;
    }
};
```

### FASE 3: INTERCEPTAR BOTÕES SEM QUEBRAR O WIZARD
1. Criar `js/wizard-interceptor-v2.js`:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Encontrar todos os botões de navegação
    const botoesAvancar = document.querySelectorAll('[onclick*="nextStep"]');
    
    botoesAvancar.forEach(botao => {
        const onclickOriginal = botao.onclick;
        botao.onclick = function() {
            // Salvar dados da etapa atual
            const stepAtual = window.currentStep || 1;
            WizardSaveSystemV2[`salvarStep${stepAtual}`]();
            
            // Salvar em cookie
            salvarEmCookie();
            
            // Executar função original
            if (onclickOriginal) {
                return onclickOriginal.call(this);
            }
        };
    });
});
```

### FASE 4: MAPEAMENTO CORRETO DOS CAMPOS

#### IDs dos elementos no HTML atual vs estrutura esperada:

**Step 1:**
- `eventName` → `evento.nome`
- `classification` → `evento.classificacao` 
- `category` → `evento.categoria`

**Step 2:**
- `startDateTime` → `evento.data_inicio`
- `endDateTime` → `evento.data_fim`
- `locationTypeSwitch` → determina `evento.tipo_local`
- `venueName` → `evento.nome_local`
- `street` → `evento.rua`
- `number` → `evento.numero`
- `complement` → `evento.complemento`
- `neighborhood` → `evento.bairro`
- `city` → `evento.cidade`
- `state` → `evento.estado`
- `cep` → `evento.cep`
- `eventLink` → `evento.link_online`

**Step 3:**
- `eventDescription` (innerHTML) → `evento.descricao_completa`
- `eventDescription` (textContent) → `evento.descricao_texto`

**Step 4:**
- `producer` (radio) → `evento.tipo_produtor`
- `producerName` → `evento.nome_produtor`
- `displayName` → `evento.nome_exibicao`
- `producerDescription` → `evento.descricao_produtor`

**Step 8:**
- Radio buttons de visibilidade → `evento.visibilidade`
- `termsCheckbox` (div com classe checked) → `evento.termos_aceitos`

### FASE 5: TRATAMENTO ESPECIAL PARA LOTES E INGRESSOS

1. **Lotes** (Step 5):
   - Salvos em `window.lotesData`
   - Não vão diretamente para API
   - São usados como referência pelos ingressos

2. **Ingressos** (Step 6):
   - Devem seguir estrutura de `coletarDadosIngressos()`
   - Tipos: pago, gratuito, combo, codigo
   - Cada ingresso tem relação com lote através de índice

### FASE 6: SISTEMA DE RECUPERAÇÃO
1. Ao carregar, verificar cookie/localStorage
2. Recuperar estrutura completa
3. Preencher campos mantendo formato original
4. Recuperar lotes e ingressos temporários

## REQUISITOS CRÍTICOS

1. **ESTRUTURA EXATA**: O JSON final DEVE ter o formato:
   ```javascript
   {
       evento: { /* todos os dados do evento */ },
       ingressos: [ /* array de ingressos */ ]
   }
   ```

2. **NOMES DOS CAMPOS**: Usar EXATAMENTE os nomes esperados pela API:
   - `descricao_completa` (não `descricao`)
   - `tipo_local` (não `locationTypeSwitch`)
   - `busca_endereco` (endereço completo formatado)

3. **VALORES ESPECÍFICOS**:
   - `tipo_local`: deve ser 'presencial' ou 'online' (strings)
   - `visibilidade`: deve ser 'public', 'private' ou 'password'
   - Datas no formato datetime-local

4. **NÃO ALTERAR**:
   - Funcionamento visual do wizard
   - Navegação entre etapas
   - Validações existentes
   - IDs e classes dos elementos

## RESULTADO ESPERADO
Um sistema que:
- Salve usando a estrutura EXATA do criaevento.js
- Gere JSON no formato `{ evento: {...}, ingressos: [...] }`
- Funcione transparentemente com o wizard existente
- Permita recuperação completa ao recarregar
- Seja compatível com a função `enviarEventoParaAPI()` existente