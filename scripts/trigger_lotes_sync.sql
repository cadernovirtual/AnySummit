-- Trigger para sincronização automática de datas entre lotes e ingressos
-- Execute este script SQL diretamente no MySQL

DELIMITER $$

-- Trigger que executa após UPDATE na tabela lotes
CREATE TRIGGER tr_lotes_sync_ingressos_dates
AFTER UPDATE ON lotes
FOR EACH ROW
BEGIN
    -- Só executa se o tipo for 'POR DATA' e se as datas de início ou fim foram alteradas
    IF NEW.tipo = 'POR DATA' AND (
        OLD.data_inicio != NEW.data_inicio OR 
        OLD.data_fim != NEW.data_fim
    ) THEN
        
        -- Atualiza as datas de todos os ingressos associados ao lote
        UPDATE ingressos 
        SET 
            inicio_venda = NEW.data_inicio,
            fim_venda = NEW.data_fim,
            atualizado_em = NOW()
        WHERE 
            lote_id = NEW.id;
            
        -- Log da ação (opcional - só se a tabela logs_atividade existir)
        -- INSERT INTO logs_atividade (
        --     tabela_afetada, 
        --     acao, 
        --     registro_id, 
        --     detalhes, 
        --     criado_em
        -- ) VALUES (
        --     'lotes_ingressos_sync',
        --     'UPDATE_DATAS_INGRESSOS', 
        --     NEW.id,
        --     CONCAT('Lote ID: ', NEW.id, ' - Sincronizadas datas de ', 
        --            (SELECT COUNT(*) FROM ingressos WHERE lote_id = NEW.id), 
        --            ' ingressos'),
        --     NOW()
        -- );
        
    END IF;
END$$

DELIMITER ;

-- Verificação da trigger criada
SHOW TRIGGERS WHERE `Table` = 'lotes';
