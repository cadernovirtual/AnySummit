# PROMPT PARA IMPLEMENTAÇÃO DO SALVAMENTO DO WIZARD

## ESTRUTURA DO BANCO DE DADOS CONFIRMADA

### 1. Tabela `eventos` (principal)
- **PK**: `id` (auto_increment)
- Contém todos os dados do evento
- Campos importantes confirmados: nome, descricao, data_inicio, data_fim, tipo_local, rua (não 'endereco'), etc.

### 2. Tabela `lotes` 
- **PK**: `id` (auto_increment)
- **FK**: `evento_id` → eventos.id
- Campos: nome, tipo, data_inicio, data_fim, percentual_venda
- **FALTAM**: campos `quantidade` e `ordem` (precisam ser adicionados)

### 3. Tabela `ingressos`
- **PK**: `id` (auto_increment)
- **FK**: `evento_id` → eventos.id
- **FK**: `lote_id` → lotes.id
- **tipo**: enum('pago','gratuito','codigo','combo')
- **conteudo_combo**: JSON para combos

### 4. IMPORTANTE: Combos são registros na tabela `ingressos`
- tipo = 'combo'
- conteudo_combo = JSON com array de objetos: `[{"ingresso_id": 123, "quantidade": 2}]`

## FLUXO DE SALVAMENTO CORRETO

### 1. INSERIR EVENTO
```sql
INSERT INTO eventos (
    contratante_id, usuario_id, categoria_id, nome, descricao, 
    imagem_capa, classificacao, slug, data_inicio, data_fim, 
    evento_multiplos_dias, tipo_local, link_online, busca_endereco, 
    nome_local, cep, rua, numero, complemento, bairro, cidade, 
    estado, pais, latitude, longitude, produtor_selecionado, 
    nome_produtor, nome_exibicao_produtor, descricao_produtor, 
    visibilidade, termos_aceitos, status, publicado_em
) VALUES (...)
```
- Obter `evento_id` com `mysqli_insert_id()`

### 2. INSERIR LOTES
```sql
INSERT INTO lotes (
    evento_id, nome, tipo, data_inicio, data_fim, 
    percentual_venda, criado_em
) VALUES (...)
```
- Para cada lote, obter `lote_id` com `mysqli_insert_id()`
- Criar mapa: frontend_lote_id → banco_lote_id

### 3. INSERIR INGRESSOS (não combos)
```sql
INSERT INTO ingressos (
    evento_id, lote_id, tipo, titulo, descricao, quantidade_total, 
    preco, taxa_plataforma, valor_receber, inicio_venda, fim_venda, 
    limite_min, limite_max, ativo
) VALUES (...)
```
- tipo: 'pago' ou 'gratuito'
- Para cada ingresso, obter `ingresso_id` com `mysqli_insert_id()`
- Criar mapa: frontend_ingresso_id → banco_ingresso_id

### 4. INSERIR COMBOS (após ingressos)
```sql
INSERT INTO ingressos (
    evento_id, lote_id, tipo, titulo, descricao, quantidade_total, 
    preco, inicio_venda, fim_venda, conteudo_combo, ativo
) VALUES (...)
```
- tipo: 'combo'
- conteudo_combo: JSON com IDs reais dos ingressos do banco

## ESTRUTURA JSON DO conteudo_combo
```json
[
    {
        "ingresso_id": 123,  // ID real do banco (não o temporário do frontend)
        "quantidade": 2
    },
    {
        "ingresso_id": 124,
        "quantidade": 1
    }
]
```

## MAPEAMENTO DE CAMPOS IMPORTANTE

### Frontend → Backend
- `type: 'paid'` → `tipo: 'pago'`
- `type: 'free'` → `tipo: 'gratuito'`
- `address` → `rua`
- `saleStart` → `inicio_venda`
- `saleEnd` → `fim_venda`
- `minQuantity` → `limite_min`
- `maxQuantity` → `limite_max`
- `visibilidade: 'public'` → `visibilidade: 'publico'`
- `visibilidade: 'private'` → `visibilidade: 'privado'`
- `visibilidade: 'password'` → `visibilidade: 'privado'` + campo senha_acesso

## ALTERAÇÕES NECESSÁRIAS NO BANCO

### 1. Adicionar campos em lotes (se ainda não existirem):
```sql
ALTER TABLE lotes 
ADD COLUMN IF NOT EXISTS quantidade INT(11) NULL AFTER percentual_venda,
ADD COLUMN IF NOT EXISTS ordem INT(11) DEFAULT 0 AFTER quantidade;
```

### 2. Adicionar campo senha em eventos (se ainda não existir):
```sql
ALTER TABLE eventos
ADD COLUMN IF NOT EXISTS senha_acesso VARCHAR(255) NULL AFTER visibilidade;
```

## ORDEM CRÍTICA DE INSERÇÃO
1. **Evento** primeiro (pegar ID)
2. **Lotes** segundo (pegar IDs e mapear)
3. **Ingressos normais** terceiro (pegar IDs e mapear)
4. **Combos** por último (usar IDs mapeados no JSON)

## VALIDAÇÕES IMPORTANTES
- Verificar se lote_id existe antes de inserir ingresso
- Verificar se ingresso_id existe antes de adicionar ao combo
- Não criar tabelas extras (eventos_lotes, eventos_combos, etc.)
- Usar transação para garantir atomicidade