# AnySummit - Estrutura do Banco de Dados

## Visão Geral
Este documento mapeia todas as tabelas identificadas no código e suas relações com as telas do sistema.

## Tabelas Principais

### 1. **eventos**
**Descrição**: Tabela principal de eventos
**Relacionamento com telas**: 
- `/produtor/novoevento.php` - Criação de eventos
- `/produtor/editar-evento.php` - Edição de eventos
- `/evento/index.php` - Visualização pública

**Campos**:
- `id` - ID único do evento
- `contratante_id` - FK para contratantes
- `usuario_id` - FK para usuarios
- `categoria_id` - FK para categorias
- `nome` - Nome do evento
- `descricao` - Descrição completa
- `imagem_capa` - URL da imagem
- `classificacao` - Classificação etária (livre, etc)
- `slug` - URL amigável
- `data_inicio` - Data/hora de início
- `data_fim` - Data/hora de término
- `evento_multiplos_dias` - Boolean
- `tipo_local` - presencial/online
- `busca_endereco` - Endereço de busca
- `nome_local` - Nome do local
- `cep` - CEP
- `rua` - Rua
- `numero` - Número
- `complemento` - Complemento
- `bairro` - Bairro
- `cidade` - Cidade
- `estado` - Estado
- `pais` - País (padrão: Brasil)
- `link_online` - Link para evento online
- `produtor_selecionado` - novo/atual
- `nome_produtor` - Nome do produtor
- `nome_exibicao_produtor` - Nome de exibição
- `descricao_produtor` - Descrição do produtor
- `visibilidade` - publico/privado
- `termos_aceitos` - Boolean
- `status` - Status do evento (publicado, etc)
- `criado_em` - Timestamp de criação

### 2. **ingressos**
**Descrição**: Tipos de ingressos disponíveis
**Relacionamento com telas**:
- `/produtor/novoevento.php` - Criação de ingressos (Step 5)
- `/evento/checkout.php` - Seleção de ingressos

**Campos**:
- `id` - ID único
- `evento_id` - FK para eventos
- `tipo` - Tipo do ingresso
- `titulo` - Título do ingresso
- `descricao` - Descrição
- `quantidade_total` - Quantidade disponível
- `quantidade_vendida` - Quantidade vendida
- `quantidade_reservada` - Quantidade reservada
- `preco` - Preço unitário
- `taxa_plataforma` - Taxa da plataforma
- `valor_receber` - Valor líquido
- `disponibilidade` - publico/privado
- `ativo` - Boolean
- `posicao_ordem` - Ordem de exibição
- `inicio_venda` - Data/hora início vendas
- `fim_venda` - Data/hora fim vendas
- `limite_min` - Mínimo por compra
- `limite_max` - Máximo por compra
- `criado_em` - Timestamp

### 3. **participantes**
**Descrição**: Dados dos participantes
**Relacionamento com telas**:
- `/participante/index.php` - Login
- `/participante/checkin.php` - Check-in
- `/evento/checkout.php` - Cadastro durante compra

**Campos**:
- `participanteid` - ID único
- `Nome` - Nome completo
- `email` - Email
- `celular` - Celular/WhatsApp
- `eventoid` - FK para evento
- `senha` - Senha (hash)

### 4. **compradores**
**Descrição**: Dados dos compradores (podem ser diferentes dos participantes)
**Relacionamento com telas**:
- `/evento/checkout.php` - Cadastro durante compra
- `/evento/criar-senha.php` - Criação de senha

**Campos**:
- `id` - ID único
- `nome` - Nome completo
- `email` - Email
- `celular` - Celular
- `cpf` - CPF (se pessoa física)
- `cnpj` - CNPJ (se pessoa jurídica)
- `tipo_documento` - CPF/CNPJ
- `cep` - CEP
- `endereco` - Endereço
- `numero` - Número
- `complemento` - Complemento
- `bairro` - Bairro
- `cidade` - Cidade
- `estado` - Estado
- `telefone` - Telefone adicional
- `senha` - Senha (hash)
- `senha_criada_em` - Data criação senha
- `ativo` - Boolean
- `criado_em` - Timestamp

### 5. **tb_pedidos**
**Descrição**: Pedidos realizados
**Relacionamento com telas**:
- `/evento/checkout.php` - Criação do pedido
- `/evento/pagamento-sucesso.php` - Confirmação

**Campos**:
- `id` - ID único
- `eventoid` - FK para eventos
- `participanteid` - FK para participantes
- `compradorid` - FK para compradores
- `valor_total` - Valor total do pedido
- `metodo_pagamento` - pix/cartao
- `parcelas` - Número de parcelas
- `comprador_nome` - Nome do comprador (snapshot)
- `comprador_documento` - CPF/CNPJ (snapshot)
- `comprador_tipo_documento` - Tipo documento
- `comprador_cep` - CEP (snapshot)
- `codigo_pedido` - Código único (PED_YYYYMMDD_XXXX)
- `status` - Status do pedido
- `criado_em` - Timestamp

### 6. **tb_itens_pedido**
**Descrição**: Itens de cada pedido
**Relacionamento com telas**:
- `/evento/api/processar-pedido.php` - Criação automática

**Campos**:
- `id` - ID único
- `pedidoid` - FK para tb_pedidos
- `eventoid` - FK para eventos
- `ingresso_id` - FK para ingressos
- `quantidade` - Quantidade comprada
- `preco_unitario` - Preço unitário
- `subtotal` - Subtotal do item

### 7. **tb_ingressos_individuais**
**Descrição**: Ingressos individuais gerados
**Relacionamento com telas**:
- `/evento/api/processar-pedido.php` - Geração automática
- `/participante/checkin.php` - Validação

**Campos**:
- `id` - ID único
- `pedidoid` - FK para tb_pedidos
- `eventoid` - FK para eventos
- `ingresso_id` - FK para ingressos
- `compradorid` - FK para compradores
- `codigo_ingresso` - Código único (8 caracteres)
- `titulo_ingresso` - Título (snapshot)
- `preco_unitario` - Preço (snapshot)
- `qr_code_data` - Dados JSON do QR Code
- `hash_validacao` - Hash SHA256 para validação
- `usado` - Boolean (já foi usado no check-in)
- `usado_em` - Timestamp do uso
- `criado_em` - Timestamp

### 8. **usuarios**
**Descrição**: Usuários do sistema (produtores)
**Relacionamento com telas**:
- `/produtor/index.php` - Login
- `/produtor/cadastro.php` - Cadastro

**Campos**:
- `id` - ID único
- `nome` - Nome completo
- `nome_exibicao` - Nome de exibição
- `email` - Email
- `senha` - Senha (hash)
- `ativo` - Boolean
- `criado_em` - Timestamp

### 9. **contratantes**
**Descrição**: Empresas/produtores contratantes
**Relacionamento com telas**:
- `/produtor/cadastro.php` - Cadastro

**Campos**:
- `id` - ID único
- `nome_fantasia` - Nome fantasia
- `razao_social` - Razão social
- `cnpj` - CNPJ
- `email` - Email
- `telefone` - Telefone
- `ativo` - Boolean
- `criado_em` - Timestamp

### 10. **categorias**
**Descrição**: Categorias de eventos
**Relacionamento com telas**:
- `/produtor/novoevento.php` - Seleção de categoria

**Campos**:
- `id` - ID único
- `nome` - Nome da categoria
- `slug` - Slug da categoria
- `ativo` - Boolean

### 11. **password_tokens**
**Descrição**: Tokens temporários para criação/reset de senha
**Relacionamento com telas**:
- `/evento/criar-senha.php` - Criação de senha

**Campos**:
- `id` - ID único
- `email` - Email do usuário
- `token` - Token único
- `expires_at` - Data de expiração
- `used` - Boolean (já foi usado)
- `created_at` - Timestamp

### 12. **tb_logcli**
**Descrição**: Log de ações dos clientes
**Relacionamento com telas**:
- Todas as telas que salvam dados

**Campos**:
- `id` - ID único
- `acao` - Ação realizada
- `contratanteid` - FK para contratantes
- `msgacao` - Mensagem da ação
- `criado_em` - Timestamp

## Relacionamentos Entre Tabelas

```
eventos
├── contratantes (N:1)
├── usuarios (N:1)
├── categorias (N:1)
├── ingressos (1:N)
└── tb_pedidos (1:N)

tb_pedidos
├── eventos (N:1)
├── participantes (N:1)
├── compradores (N:1)
├── tb_itens_pedido (1:N)
└── tb_ingressos_individuais (1:N)

ingressos
├── eventos (N:1)
├── tb_itens_pedido (1:N)
└── tb_ingressos_individuais (1:N)

compradores
├── tb_pedidos (1:N)
└── tb_ingressos_individuais (1:N)

participantes
└── tb_pedidos (1:N)
```

## Mapeamento Tela x Banco

### Tela de Criação de Evento (`/produtor/novoevento.php`)
- **Step 1 (Informações)**: `eventos.nome`, `eventos.categoria_id`, `eventos.classificacao`
- **Step 2 (Data e Hora)**: `eventos.data_inicio`, `eventos.data_fim`, `eventos.evento_multiplos_dias`
- **Step 3 (Descrição)**: `eventos.descricao`, `eventos.imagem_capa`
- **Step 4 (Localização)**: `eventos.tipo_local`, `eventos.nome_local`, `eventos.cep`, etc
- **Step 5 (Ingressos)**: Tabela `ingressos` completa
- **Step 6 (Produtor)**: `eventos.nome_produtor`, `eventos.descricao_produtor`
- **Step 7 (Publicar)**: `eventos.visibilidade`, `eventos.status`

### Tela de Checkout (`/evento/checkout.php`)
- **Seleção de Ingressos**: `ingressos.*`
- **Dados do Participante**: `participantes.*`
- **Dados do Comprador**: `compradores.*`
- **Criação do Pedido**: `tb_pedidos.*`, `tb_itens_pedido.*`, `tb_ingressos_individuais.*`

### Tela de Check-in (`/participante/checkin.php`)
- **Validação**: `tb_ingressos_individuais.codigo_ingresso`, `tb_ingressos_individuais.hash_validacao`
- **Registro de Uso**: `tb_ingressos_individuais.usado`, `tb_ingressos_individuais.usado_em`

## Observações Importantes

1. **Charset**: Todas as tabelas devem usar `utf8mb4` para suportar emojis e caracteres especiais
2. **Índices**: Criar índices em campos de busca frequente (email, codigo_ingresso, slug)
3. **Constraints**: Implementar FK constraints para garantir integridade
4. **Soft Delete**: Usar campo `ativo` ao invés de deletar registros
5. **Auditoria**: Usar `tb_logcli` para rastrear ações importantes