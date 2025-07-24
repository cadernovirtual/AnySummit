# Estrutura do Banco de Dados - AnySummit

## Tabelas Existentes Relevantes

### 1. Tabela `eventos`
- **Campos principais**: id, nome, descricao, data_inicio, data_fim, tipo_local, status
- **Campos de localização**: busca_endereco, nome_local, rua (não 'endereco'), numero, complemento, bairro, cidade, estado, cep, pais, latitude, longitude
- **Campos de produtor**: produtor_selecionado, nome_produtor, nome_exibicao_produtor, descricao_produtor
- **Visibilidade**: campo 'visibilidade' (enum: 'publico', 'privado') - não tem opção 'password'

### 2. Tabela `lotes` (JÁ EXISTE!)
```sql
CREATE TABLE `lotes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `evento_id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `data_inicio` datetime NOT NULL,
  `data_fim` datetime NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `percentual_venda` int(11) DEFAULT NULL,
  `percentual_aumento_valor` int(11) DEFAULT NULL,
  `divulgar_criterio` tinyint(4) DEFAULT '0',
  `criado_em` datetime DEFAULT NULL,
  `atualizado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
);
```

**OBSERVAÇÕES**:
- Campo `tipo` já existe (usar 'data' ou 'percentual')
- Campo `percentual_venda` já existe para lotes por quantidade
- Falta adicionar campo `quantidade` para lotes por quantidade
- Falta adicionar campo `ordem` para ordenação

### 3. Tabela `ingressos`
```sql
-- Estrutura atual já tem:
- `tipo` enum('pago','gratuito','codigo','combo')
- `lote_id` int(11) - JÁ EXISTE!
- `conteudo_combo` json - JÁ EXISTE!
```

**OBSERVAÇÕES**:
- Campo `lote_id` JÁ EXISTE na tabela ingressos
- Campo `conteudo_combo` JÁ EXISTE e é JSON
- Tipo 'combo' JÁ EXISTE no enum

## Alterações Necessárias no Banco

### 1. Adicionar campos faltantes em `lotes`:
```sql
ALTER TABLE `lotes` 
ADD COLUMN `quantidade` INT(11) NULL AFTER `percentual_venda`,
ADD COLUMN `ordem` INT(11) DEFAULT 0 AFTER `quantidade`;
```

### 2. Adicionar chave estrangeira de lotes:
```sql
ALTER TABLE `lotes`
ADD CONSTRAINT `lotes_evento_fk` 
FOREIGN KEY (`evento_id`) REFERENCES `eventos`(`id`) ON DELETE CASCADE;
```

### 3. Adicionar chave estrangeira lote_id em ingressos:
```sql
ALTER TABLE `ingressos`
ADD CONSTRAINT `ingressos_lote_fk` 
FOREIGN KEY (`lote_id`) REFERENCES `lotes`(`id`) ON DELETE SET NULL;
```

### 4. Adicionar campos de taxa em ingressos (se não existirem):
```sql
ALTER TABLE `ingressos`
ADD COLUMN `cobra_taxa` TINYINT(1) DEFAULT 0 AFTER `valor_receber`,
ADD COLUMN `valor_taxa` DECIMAL(10,2) DEFAULT 0.00 AFTER `cobra_taxa`;
```

## Estrutura JSON para `conteudo_combo`
```json
[
  {
    "ticket_id": "123",
    "ticket_name": "Ingresso VIP",
    "quantidade": 2
  },
  {
    "ticket_id": "124", 
    "ticket_name": "Ingresso Pista",
    "quantidade": 1
  }
]
```

## Mapeamento Frontend -> Backend

### Campos do Evento:
- `eventName` -> `nome`
- `classification` -> `classificacao`
- `category` -> `categoria_id` (precisa buscar ID)
- `imagePreview` -> `imagem_capa` (salvar arquivo e guardar path)
- `startDateTime` -> `data_inicio`
- `endDateTime` -> `data_fim`
- `multiDaySwitch` -> `evento_multiplos_dias`
- `locationTypeSwitch` -> `tipo_local` ('presencial' ou 'online')
- `addressSearch` -> `busca_endereco`
- `venueName` -> `nome_local`
- `address` -> `rua` (NÃO 'endereco')
- `addressNumber` -> `numero`
- `addressComplement` -> `complemento`
- `neighborhood` -> `bairro`
- `city` -> `cidade`
- `state` -> `estado`
- `postalCode` -> `cep`
- `country` -> `pais`
- `streamingLink` -> `link_online`
- `accessInstructions` -> usar campo `descricao` ou criar novo campo
- `eventDescription` -> `descricao`
- `producer` -> `produtor_selecionado` ('atual' ou 'novo')
- `producerName` -> `nome_produtor`
- `displayName` -> `nome_exibicao_produtor`
- `producerDescription` -> `descricao_produtor`
- Visibilidade: converter 'public' -> 'publico', 'private' -> 'privado'
- `termsCheckbox` -> `termos_aceitos`

### Campos de Lotes:
- Frontend `tipo: 'data'` -> Backend `tipo: 'data'`
- Frontend `tipo: 'percentual'` -> Backend `tipo: 'percentual'`
- Frontend `percentual` -> Backend `percentual_venda`
- Frontend `quantidade` -> Backend `quantidade` (adicionar campo)
- Frontend `ordem` -> Backend `ordem` (adicionar campo)

### Campos de Ingressos:
- Frontend `type: 'paid'` -> Backend `tipo: 'pago'`
- Frontend `type: 'free'` -> Backend `tipo: 'gratuito'`
- Frontend `loteId` -> Backend `lote_id`
- Frontend `saleStart` -> Backend `inicio_venda`
- Frontend `saleEnd` -> Backend `fim_venda`
- Frontend `minQuantity` -> Backend `limite_min`
- Frontend `maxQuantity` -> Backend `limite_max`
- Frontend `serviceTax` -> Backend `cobra_taxa` (adicionar)
- Frontend `taxAmount` -> Backend `valor_taxa` (adicionar)

### Campos de Combos:
- Salvar como ingresso com `tipo: 'combo'`
- Frontend `items` -> Backend `conteudo_combo` (JSON)

## IMPORTANTE - Senha do Evento
O campo visibilidade no banco só aceita 'publico' ou 'privado'.
Se o frontend enviar 'password', precisamos:
1. Salvar como 'privado' no campo visibilidade
2. Criar novo campo na tabela eventos para armazenar a senha:
```sql
ALTER TABLE `eventos`
ADD COLUMN `senha_acesso` VARCHAR(255) NULL AFTER `visibilidade`;
```