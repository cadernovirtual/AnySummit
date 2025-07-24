-- EXECUTE ESTE SCRIPT NO MYSQL PARA FINALIZAR A IMPLEMENTAÇÃO DE LOTES

-- 1. Remover coluna percentual_aumento_valor (não será mais usada)
ALTER TABLE lotes DROP COLUMN percentual_aumento_valor;

-- 2. Verificar estrutura da tabela lotes
DESCRIBE lotes;

-- 3. Opcional: Finalizar constraints pendentes dos ingressos
-- ALTER TABLE ingressos MODIFY COLUMN lote_id INT NOT NULL;
-- ALTER TABLE ingressos ADD CONSTRAINT fk_ingressos_lote 
-- FOREIGN KEY (lote_id) REFERENCES lotes(id) ON DELETE RESTRICT;
-- CREATE INDEX idx_ingressos_lote_id ON ingressos(lote_id);

-- Script executado com sucesso!
SELECT 'Implementação de lotes finalizada!' as status;
