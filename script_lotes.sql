-- Criação da tabela lotes e configuração de chaves estrangeiras
-- Script para o AnySummit

-- 1. Criar tabela lotes
CREATE TABLE lotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_evento_id (evento_id),
    INDEX idx_datas (data_inicio, data_fim)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Adicionar FK da tabela lotes para eventos
ALTER TABLE lotes 
ADD CONSTRAINT fk_lotes_evento 
FOREIGN KEY (evento_id) REFERENCES eventos(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Adicionar coluna lote_id na tabela ingressos (sem FK ainda)
ALTER TABLE ingressos 
ADD COLUMN lote_id INT NULL AFTER evento_id,
ADD INDEX idx_lote_id (lote_id);

-- 4. Criar lotes únicos para eventos existentes
INSERT INTO lotes (evento_id, nome, data_inicio, data_fim)
SELECT 
    e.id as evento_id,
    'LOTE ÚNICO' as nome,
    COALESCE(MIN(i.inicio_venda), e.data_inicio) as data_inicio,
    COALESCE(MAX(i.fim_venda), e.data_fim) as data_fim
FROM eventos e
LEFT JOIN ingressos i ON e.id = i.evento_id AND i.ativo = 1
GROUP BY e.id, e.data_inicio, e.data_fim;

-- 5. Atualizar lote_id nos ingressos existentes
UPDATE ingressos i
INNER JOIN lotes l ON i.evento_id = l.evento_id AND l.nome = 'LOTE ÚNICO'
SET i.lote_id = l.id;

-- 6. Adicionar FK da tabela ingressos para lotes
ALTER TABLE ingressos 
ADD CONSTRAINT fk_ingressos_lote 
FOREIGN KEY (lote_id) REFERENCES lotes(id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. Verificar resultado
SELECT 
    e.nome as evento,
    l.nome as lote,
    l.data_inicio,
    l.data_fim,
    COUNT(i.id) as total_ingressos
FROM eventos e
LEFT JOIN lotes l ON e.id = l.evento_id
LEFT JOIN ingressos i ON l.id = i.lote_id
GROUP BY e.id, l.id
ORDER BY e.nome, l.nome;
