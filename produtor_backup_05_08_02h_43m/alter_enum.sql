-- Adicionar 'combo' ao enum do tipo de ingresso
ALTER TABLE ingressos MODIFY COLUMN tipo ENUM('pago','gratuito','codigo','combo') NOT NULL;

-- Verificar se a alteração foi aplicada
SHOW COLUMNS FROM ingressos LIKE 'tipo';
