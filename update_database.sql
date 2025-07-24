-- Script de atualização do banco de dados AnySummit
-- Para suportar lotes e combos

-- 1. Adicionar campos faltantes na tabela lotes
ALTER TABLE `lotes` 
ADD COLUMN IF NOT EXISTS `quantidade` INT(11) NULL AFTER `percentual_venda`,
ADD COLUMN IF NOT EXISTS `ordem` INT(11) DEFAULT 0 AFTER `quantidade`;

-- 2. Adicionar chave estrangeira para lotes -> eventos
ALTER TABLE `lotes`
ADD CONSTRAINT `lotes_evento_fk` 
FOREIGN KEY IF NOT EXISTS (`evento_id`) REFERENCES `eventos`(`id`) ON DELETE CASCADE;

-- 3. Adicionar chave estrangeira para ingressos -> lotes
ALTER TABLE `ingressos`
ADD CONSTRAINT `ingressos_lote_fk` 
FOREIGN KEY IF NOT EXISTS (`lote_id`) REFERENCES `lotes`(`id`) ON DELETE SET NULL;

-- 4. Adicionar campos de taxa em ingressos (se não existirem)
ALTER TABLE `ingressos`
ADD COLUMN IF NOT EXISTS `cobra_taxa` TINYINT(1) DEFAULT 0 AFTER `valor_receber`,
ADD COLUMN IF NOT EXISTS `valor_taxa` DECIMAL(10,2) DEFAULT 0.00 AFTER `cobra_taxa`;

-- 5. Adicionar campo de senha em eventos (para visibilidade com senha)
ALTER TABLE `eventos`
ADD COLUMN IF NOT EXISTS `senha_acesso` VARCHAR(255) NULL AFTER `visibilidade`;

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS `idx_lotes_evento` ON `lotes` (`evento_id`);
CREATE INDEX IF NOT EXISTS `idx_lotes_tipo` ON `lotes` (`tipo`);
CREATE INDEX IF NOT EXISTS `idx_ingressos_lote` ON `ingressos` (`lote_id`);
CREATE INDEX IF NOT EXISTS `idx_ingressos_tipo` ON `ingressos` (`tipo`);

-- 7. Atualizar valores padrão
UPDATE `lotes` SET `criado_em` = NOW() WHERE `criado_em` IS NULL;
UPDATE `lotes` SET `atualizado_em` = NOW() WHERE `atualizado_em` IS NULL;

-- 8. Adicionar comentários nas tabelas
ALTER TABLE `lotes` COMMENT = 'Lotes de ingressos - por data ou quantidade/percentual';
ALTER TABLE `ingressos` MODIFY COLUMN `conteudo_combo` JSON COMMENT 'JSON com itens do combo: [{ticket_id, ticket_name, quantidade}]';

-- Verificar estrutura após alterações
SELECT 'Tabela lotes:' as Info;
DESCRIBE lotes;

SELECT 'Tabela ingressos - campos relevantes:' as Info;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'anysubd' 
AND TABLE_NAME = 'ingressos' 
AND COLUMN_NAME IN ('lote_id', 'conteudo_combo', 'tipo', 'cobra_taxa', 'valor_taxa');

SELECT 'Chaves estrangeiras:' as Info;
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'anysubd' 
    AND REFERENCED_TABLE_NAME IS NOT NULL
    AND TABLE_NAME IN ('lotes', 'ingressos')
ORDER BY TABLE_NAME;