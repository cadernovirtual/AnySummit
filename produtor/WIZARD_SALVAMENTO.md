# Sistema de Salvamento do Wizard de Eventos

## Visão Geral
O sistema agora salva automaticamente no banco de dados MySQL a cada etapa do wizard, eliminando a necessidade de persistência local (cookies/localStorage).

## Fluxo de Funcionamento

### 1. Criação de Novo Evento
- Ao acessar `/produtor/novoevento.php`
- Sistema cria automaticamente um evento com status='rascunho'
- Se já existe um rascunho, pergunta se deseja continuar editando

### 2. Salvamento Automático
- A cada mudança de etapa (nextStep), os dados são salvos no banco
- Não há mais dependência de cookies ou localStorage
- Dados são salvos diretamente nas tabelas: eventos, lotes, ingressos

### 3. Retomada de Edição
- Eventos em rascunho aparecem em "Meus Eventos" 
- Ao clicar, redireciona para: `novoevento.php?evento_id=X`
- Sistema carrega todos os dados e preenche o formulário

### 4. Status do Evento
- **rascunho**: Evento em criação (salvamento automático)
- **pausado**: Evento completo mas não publicado
- **publicado**: Evento publicado e visível
- **cancelado**: Evento cancelado
- **finalizado**: Evento já ocorreu

## Arquivos Principais

### Backend
- `ajax/wizard_evento.php` - API principal do sistema
  - iniciar_evento
  - retomar_evento
  - salvar_etapa (1-8)
  - publicar_evento
  - pausar_evento

### Frontend
- `js/wizard-database.js` - Integração com backend
- `js/wizard-restore-helpers.js` - Funções auxiliares de restauração

## Implementação por Etapa

### Etapa 1 - Informações Básicas
- nome
- categoria_id
- classificacao
- cor_fundo
- logo_evento, imagem_capa, imagem_fundo

### Etapa 2 - Data e Horário
- data_inicio
- data_fim
- evento_multiplos_dias (calculado)

### Etapa 3 - Descrição
- descricao (HTML do TinyMCE)

### Etapa 4 - Localização
- tipo_local (presencial/online)
- Se online: link_online
- Se presencial: nome_local, busca_endereco, CEP, rua, número, etc.

### Etapa 5 - Lotes
- Tabela: lotes
- Campos: nome, tipo, data_inicio, data_fim, percentual_venda

### Etapa 6 - Ingressos
- Tabela: ingressos
- Campos: tipo, titulo, preco, quantidade_total, lote_id, conteudo_combo

### Etapa 7 - Produtor
- produtor_selecionado
- nome_produtor
- nome_exibicao_produtor
- descricao_produtor

### Etapa 8 - Termos e Publicação
- visibilidade
- termos_aceitos
- dados_aceite (JSON com IP, user_agent, timestamp)

## Validações antes de Publicar
1. Nome do evento preenchido
2. Data de início definida
3. Local informado (online ou presencial)
4. Pelo menos 1 lote criado
5. Pelo menos 1 ingresso criado
6. Termos aceitos
