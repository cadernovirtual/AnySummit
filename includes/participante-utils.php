<?php
/**
 * Funções utilitárias para validação e gestão de CPF
 * Centraliza a lógica para evitar duplicação de código
 */

/**
 * Valida um CPF seguindo o algoritmo da Receita Federal
 * @param string $cpf CPF a ser validado (com ou sem formatação)
 * @return bool True se CPF válido, False caso contrário
 */
function validarCPF($cpf) {
    // Remove caracteres não numéricos
    $cpf = preg_replace('/[^0-9]/', '', $cpf);
    
    // Verifica se tem 11 dígitos
    if (strlen($cpf) !== 11) {
        return false;
    }
    
    // Verifica se todos os dígitos são iguais (CPF inválido)
    if (preg_match('/^(\d)\1{10}$/', $cpf)) {
        return false;
    }
    
    // Validação do primeiro dígito verificador
    $soma = 0;
    for ($i = 0; $i < 9; $i++) {
        $soma += intval($cpf[$i]) * (10 - $i);
    }
    $resto = $soma % 11;
    $digito1 = $resto < 2 ? 0 : 11 - $resto;
    
    if (intval($cpf[9]) !== $digito1) {
        return false;
    }
    
    // Validação do segundo dígito verificador
    $soma = 0;
    for ($i = 0; $i < 10; $i++) {
        $soma += intval($cpf[$i]) * (11 - $i);
    }
    $resto = $soma % 11;
    $digito2 = $resto < 2 ? 0 : 11 - $resto;
    
    return intval($cpf[10]) === $digito2;
}

/**
 * Limpa um CPF removendo caracteres não numéricos
 * @param string $cpf CPF a ser limpo
 * @return string CPF apenas com números
 */
function limparCPF($cpf) {
    return preg_replace('/[^0-9]/', '', $cpf);
}

/**
 * Formata um CPF com pontos e hífen
 * @param string $cpf CPF apenas com números
 * @return string CPF formatado (000.000.000-00)
 */
function formatarCPF($cpf) {
    $cpf = limparCPF($cpf);
    
    if (strlen($cpf) === 11) {
        return substr($cpf, 0, 3) . '.' . 
               substr($cpf, 3, 3) . '.' . 
               substr($cpf, 6, 3) . '-' . 
               substr($cpf, 9, 2);
    }
    
    return $cpf; // Retorna sem formatação se não tiver 11 dígitos
}

/**
 * Busca um participante no banco de dados, priorizando CPF sobre email
 * @param mysqli $con Conexão com banco de dados
 * @param string $cpf CPF do participante (opcional)
 * @param string $email Email do participante
 * @param int $eventoid ID do evento
 * @return array|null Dados do participante ou null se não encontrado
 */
function buscarParticipante($con, $cpf, $email, $eventoid) {
    $participante = null;
    
    // Limpar CPF para comparação
    $cpf_limpo = limparCPF($cpf);
    
    // PRIORIDADE 1: Buscar por CPF se fornecido e válido
    if (!empty($cpf_limpo) && strlen($cpf_limpo) >= 11) {
        $sql_cpf = "SELECT participanteid, Nome, email, CPF, celular, dados_adicionais 
                    FROM participantes 
                    WHERE REPLACE(REPLACE(REPLACE(COALESCE(CPF, ''), '.', ''), '-', ''), ' ', '') = ? 
                    AND eventoid = ? LIMIT 1";
        $stmt_cpf = $con->prepare($sql_cpf);
        if ($stmt_cpf) {
            $stmt_cpf->bind_param("si", $cpf_limpo, $eventoid);
            $stmt_cpf->execute();
            $result_cpf = $stmt_cpf->get_result();
            
            if ($result_cpf && $result_cpf->num_rows > 0) {
                $participante = $result_cpf->fetch_assoc();
                $participante['encontrado_por'] = 'CPF';
                
                // Log para auditoria
                error_log("Participante encontrado por CPF: ID = " . $participante['participanteid'] . " - Nome: " . $participante['Nome']);
                
                // Verificar se email é diferente
                if (strtolower($participante['email']) !== strtolower($email)) {
                    error_log("ATENÇÃO: CPF encontrado mas email diferente. DB: " . $participante['email'] . " vs Novo: $email");
                }
                
                return $participante;
            }
        }
    }
    
    // PRIORIDADE 2: Buscar por email se não encontrou por CPF
    if (!$participante && !empty($email)) {
        $sql_email = "SELECT participanteid, Nome, email, CPF, celular, dados_adicionais 
                      FROM participantes 
                      WHERE email = ? AND eventoid = ? LIMIT 1";
        $stmt_email = $con->prepare($sql_email);
        if ($stmt_email) {
            $stmt_email->bind_param("si", $email, $eventoid);
            $stmt_email->execute();
            $result_email = $stmt_email->get_result();
            
            if ($result_email && $result_email->num_rows > 0) {
                $participante = $result_email->fetch_assoc();
                $participante['encontrado_por'] = 'email';
                
                // Log para auditoria
                error_log("Participante encontrado por email: ID = " . $participante['participanteid'] . " - Nome: " . $participante['Nome']);
                
                // Verificar conflito de CPF
                if (!empty($cpf_limpo) && !empty($participante['CPF'])) {
                    $cpf_db_limpo = limparCPF($participante['CPF']);
                    if ($cpf_db_limpo !== $cpf_limpo) {
                        error_log("CONFLITO: Email encontrado mas CPF diferente. DB: $cpf_db_limpo vs Novo: $cpf_limpo");
                        throw new Exception("Conflito de dados: Este email já está associado a outro CPF no sistema.");
                    }
                }
                
                return $participante;
            }
        }
    }
    
    return null; // Não encontrado
}

/**
 * Cria ou atualiza um participante no banco de dados
 * @param mysqli $con Conexão com banco de dados
 * @param array $dados Dados do participante (nome, email, cpf, celular, etc.)
 * @param int $eventoid ID do evento
 * @return int ID do participante criado/atualizado
 */
function criarOuAtualizarParticipante($con, $dados, $eventoid) {
    $nome = trim($dados['nome'] ?? '');
    $email = trim($dados['email'] ?? '');
    $cpf = trim($dados['cpf'] ?? '');
    $celular = trim($dados['celular'] ?? '');
    $dados_adicionais = $dados['dados_adicionais'] ?? [];
    
    // Validar dados obrigatórios
    if (empty($nome) || empty($email)) {
        throw new Exception('Nome e email são obrigatórios');
    }
    
    // Validar CPF se fornecido
    if (!empty($cpf) && !validarCPF($cpf)) {
        throw new Exception('CPF inválido');
    }
    
    // Buscar participante existente
    $participante_existente = buscarParticipante($con, $cpf, $email, $eventoid);
    
    // Preparar JSON dos dados adicionais
    $dados_adicionais_json = !empty($dados_adicionais) ? json_encode($dados_adicionais, JSON_UNESCAPED_UNICODE) : null;
    
    if ($participante_existente) {
        // Atualizar participante existente
        $participanteid = $participante_existente['participanteid'];
        
        error_log("Atualizando participante existente: ID = $participanteid (encontrado por: " . $participante_existente['encontrado_por'] . ")");
        
        $sql_update = "UPDATE participantes SET Nome = ?, email = ?, celular = ?, CPF = ?, dados_adicionais = ? WHERE participanteid = ?";
        $stmt_update = $con->prepare($sql_update);
        if (!$stmt_update) {
            throw new Exception('Erro ao preparar atualização: ' . $con->error);
        }
        
        $stmt_update->bind_param("sssssi", $nome, $email, $celular, $cpf, $dados_adicionais_json, $participanteid);
        if (!$stmt_update->execute()) {
            throw new Exception('Erro ao atualizar participante: ' . $con->error);
        }
        
        error_log("Participante atualizado com sucesso: ID = $participanteid");
        return $participanteid;
        
    } else {
        // Criar novo participante
        error_log("Criando novo participante");
        
        $sql_insert = "INSERT INTO participantes (Nome, email, celular, CPF, eventoid, dados_adicionais) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt_insert = $con->prepare($sql_insert);
        if (!$stmt_insert) {
            throw new Exception('Erro ao preparar inserção: ' . $con->error);
        }
        
        $stmt_insert->bind_param("ssssis", $nome, $email, $celular, $cpf, $eventoid, $dados_adicionais_json);
        
        if ($stmt_insert->execute()) {
            $participanteid = $con->insert_id;
            error_log("Novo participante criado: ID = $participanteid");
            return $participanteid;
        } else {
            $error_msg = $con->error;
            error_log("Erro ao criar participante: $error_msg");
            
            // Verificar se é erro de duplicata e tentar buscar novamente
            if (strpos($error_msg, 'Duplicate') !== false || strpos($error_msg, 'duplicate') !== false) {
                $participante_recuperado = buscarParticipante($con, $cpf, $email, $eventoid);
                if ($participante_recuperado) {
                    error_log("Participante recuperado após erro de duplicata: ID = " . $participante_recuperado['participanteid']);
                    return $participante_recuperado['participanteid'];
                }
            }
            
            throw new Exception('Erro ao criar participante: ' . $error_msg);
        }
    }
}
?>