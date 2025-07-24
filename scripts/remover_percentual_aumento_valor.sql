-- Script para remover campo percentual_aumento_valor da tabela lotes
-- Execute este comando diretamente no MySQL

USE anysubd;

ALTER TABLE lotes DROP COLUMN percentual_aumento_valor;

-- Verificar estrutura após remoção
DESCRIBE lotes;
