-- Criar tabela parametros
CREATE TABLE IF NOT EXISTS parametros (
    id INT NOT NULL AUTO_INCREMENT,
    taxa_servico_padrao DECIMAL(5,2) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inserir valor padrão
INSERT INTO parametros (taxa_servico_padrao) VALUES (8.00);

-- Adicionar coluna cobrar_taxa_servico na tabela ingresso
ALTER TABLE ingresso 
ADD COLUMN cobrar_taxa_servico TINYINT(1) DEFAULT 1 
COMMENT '1 = cobra do cliente, 0 = produtor absorve';
