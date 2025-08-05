-- 1. ALTER TABLE para adicionar campos na tabela contratantes

-- Adicionar campo logomarca
ALTER TABLE contratantes ADD COLUMN logomarca VARCHAR(255) NULL AFTER nome_fantasia;

-- Adicionar campo usuario_id
ALTER TABLE contratantes ADD COLUMN usuario_id INT NULL AFTER logomarca;

-- Adicionar índice para usuario_id
ALTER TABLE contratantes ADD INDEX idx_usuario_id (usuario_id);

-- 2. ALTER TABLE para alterar o enum da tabela usuarios

-- Primeiro, verificar registros existentes com 'organizador'
SELECT id, nome, email, perfil FROM usuarios WHERE perfil = 'organizador';

-- Alterar registros 'organizador' para 'produtor'  
UPDATE usuarios SET perfil = 'produtor' WHERE perfil = 'organizador';

-- Alterar o enum para incluir os novos valores
ALTER TABLE usuarios MODIFY COLUMN perfil ENUM('produtor', 'admin', 'staff', 'patrocinador') NOT NULL DEFAULT 'produtor';

-- Verificar as alterações
SELECT id, nome, email, perfil FROM usuarios;
DESCRIBE contratantes;