-- Criar tabela para salvar rascunhos de wizard
CREATE TABLE IF NOT EXISTS `eventos_rascunho` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `contratante_id` int(11) NOT NULL,
  `dados_wizard` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `step_atual` int(11) DEFAULT 1,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario_contratante` (`usuario_id`,`contratante_id`),
  KEY `idx_atualizado` (`atualizado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Limpar rascunhos antigos (mais de 7 dias)
DELETE FROM eventos_rascunho WHERE atualizado_em < DATE_SUB(NOW(), INTERVAL 7 DAY);
