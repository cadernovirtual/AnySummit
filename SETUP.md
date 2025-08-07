# AnySummit - Setup do Projeto

## Contexto do Sistema
AnySummit é uma plataforma de gestão de eventos em PHP/MySQL com módulos para Produtor, Participante, Evento, Staff e Patrocinador.

## Localização do Projeto
- **Pasta Principal**: `D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html`
- **Banco de Dados**: MySQL hospedado no AnySummit (anysummit.com.br)

## Estrutura de Pastas
```
public_html/
├── api/                    # APIs gerais
├── evento/                 # Módulo de eventos públicos
│   ├── api/               # APIs do módulo
│   ├── conm/              # Conexão BD
│   └── css/js/img/        # Assets
├── produtor/              # Painel do produtor
│   ├── ajax/              # Requisições AJAX
│   ├── conm/              # Conexão BD
│   
├── participante/          # Área do participante
├── patrocinador/          # Área do patrocinador
├── staff/                 # Área do staff
├── css/js/                # Assets globais
└── uploads/               # Uploads gerais
```

## Arquivos de Configuração
- **Conexão BD**: `/*/conm/conn.php` (em cada módulo)
- **Config Evento**: `/evento/config.php`
- **Documentação**: `SISTEMA_STATUS.md`, `BANCO_DADOS_ESTRUTURA.md`

### GIT
```
Token: [CONFIGURE SEU TOKEN AQUI]
User: cadernovirtual
Email: gustavo@cadernovirtual.com.br
Repo: https://github.com/cadernovirtual/AnySummit
```

## Padrões do Sistema
- **Charset**: UTF8MB4
- **Timezone**: America/Sao_Paulo
- **Prefixo tabelas especiais**: `tb_`
- **Sessões**: Via cookies e $_SESSION
- **Uploads de imagem**: pasta `/uploads/eventos/`

## Tecnologias
- Backend: PHP 7+ (sem frameworks)
- Frontend: HTML5, CSS3, JavaScript vanilla
- Banco: MySQL via mysqli
- Email: SMTP Locaweb (noreply@anysummit.com.br)
- QR Code: html5-qrcode library

## URLs Principais
- Login Produtor: `/produtor/`
- Login Participante: `/participante/`
- Criar Evento: `/produtor/novoevento.php`
- Checkout: `/evento/checkout.php?evento={slug}`
- Check-in: `/participante/checkin.php`

## Instruções para o Agente

### 1. Início de Cada Chat
Sempre ler primeiro:
1. Este arquivo `SETUP.md`
2. O arquivo `STATUS.md` (se existir)
3. Após ler o STATUS.md, apagá-lo imediatamente
4. Faça alterações diretamente em meu HD, mas pasta do projeto usando o mcp Desktop Commander
5. Se precisar consultar ou alterar tabelas no banco, use o mcp MySQL

### 2. Durante o Chat
- Manter foco na tarefa atual
- Usar os padrões estabelecidos do sistema
- Não refatorar código existente sem solicitação
- Sempre usar caminhos absolutos para arquivos

### 3. Gestão do STATUS.md
Criar/atualizar `STATUS.md` com:
```markdown
# Status da Sessão Atual

## Tarefa em Andamento
[Descrição breve da tarefa atual]

## Arquivos Modificados
- arquivo1.php (linha X-Y: descrição)
- arquivo2.js (novo arquivo: descrição)

## Próximos Passos
1. [Ação pendente 1]
2. [Ação pendente 2]

## Contexto Importante
[Apenas informações essenciais para continuar]
```

### 4. Ao Atingir Limite de Contexto
Antes do chat acabar:
1. Salvar trabalho em andamento
2. Atualizar STATUS.md com estado atual
3. Incluir comandos exatos para retomar
4. Manter STATUS.md < 50 linhas

### 5. Padrões de Código
- Usar mysqli (não PDO) para consistência
- Validar todas entradas de usuário
- Logs de erro em error_log()
- Comentários em português
- Indentação com 4 espaços

### 6. IMPORTANTE
- Sempre verificar se arquivo existe antes de modificar
- Fazer backup mental do código original
- Testar queries SQL antes de implementar
- Nunca expor dados sensíveis em logs

Este setup permite continuidade entre sessões. Sempre que iniciar novo chat, incluir SETUP.md e STATUS.md no contexto.

---

## INVESTIGAÇÃO ATUAL - Exclusão de Lotes

### Problema Identificado
- **Sistema:** Exclusão de lotes não funciona devido a múltiplos interceptadores de clique
- **Sintomas:** Botão chama "recarregar rascunho" em vez de excluir lote
- **Análise:** 128 funções relacionadas a lotes encontradas, múltiplos `addEventListener('click')` conflitantes

### Funções Principais Identificadas
- ✅ `excluirLoteDataInterface(loteId)` - Interface principal 
- ✅ `excluirLoteQuantidadeInterface(loteId)` - Interface quantidade
- ✅ `excluirLoteData(loteId)` - Função por data
- ✅ `excluirLotePercentual(loteId)` - Função por percentual

### Interceptadores Conflitantes
- `versao-final-completa-combos.js` - intercepta `[onclick*="Modal"]`
- `validacao-exclusao-ingressos.js` - intercepta botões de exclusão
- 50+ outros arquivos com `addEventListener('click')`

### Estratégia Atual
- Debug agressivo com prioridade máxima (capture phase)
- Prevenção de outros interceptadores (`stopImmediatePropagation`)
- Execução direta da função via `eval(onclick)`

### Backend Verificado
- ✅ Ação `excluir_lote` existe em `wizard_evento.php`
- ✅ Função `excluirLote($con, $usuario_id)` implementada
- ✅ Função `renomearLotesPorTipo()` corrigida (mysqli procedural)
- ✅ Logs detalhados para debug