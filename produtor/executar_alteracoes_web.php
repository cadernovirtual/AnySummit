<!DOCTYPE html>
<html>
<head>
    <title>Executar Alterações no Banco</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #f5f5f5; }
        .result { background: white; padding: 20px; border-radius: 8px; margin: 10px 0; }
        .success { color: green; }
        .error { color: red; }
        .info { color: blue; }
    </style>
</head>
<body>
    <h1>Executar Alterações no Banco de Dados</h1>
    
    <div class="result">
        <?php
        // Script para executar as alterações no banco de dados
        include("conm/conn.php");

        echo "<div class='info'><strong>=== INICIANDO ALTERAÇÕES NO BANCO ===</strong></div><br>";

        // 1. Verificar registros com perfil 'organizador'
        echo "<div class='info'><strong>1. Verificando registros com perfil 'organizador':</strong></div>";
        $sql = "SELECT id, nome, email, perfil FROM usuarios WHERE perfil = 'organizador'";
        $result = mysqli_query($con, $sql);
        if ($result && mysqli_num_rows($result) > 0) {
            while ($row = mysqli_fetch_assoc($result)) {
                echo "<div>   ID: {$row['id']}, Nome: {$row['nome']}, Email: {$row['email']}, Perfil: {$row['perfil']}</div>";
            }
        } else {
            echo "<div>   Nenhum registro encontrado com perfil 'organizador'</div>";
        }
        echo "<br>";

        // 2. Adicionar campo logomarca na tabela contratantes
        echo "<div class='info'><strong>2. Adicionando campo 'logomarca' na tabela contratantes:</strong></div>";
        $sql = "ALTER TABLE contratantes ADD COLUMN logomarca VARCHAR(255) NULL AFTER nome_fantasia";
        if (mysqli_query($con, $sql)) {
            echo "<div class='success'>   ✅ Campo 'logomarca' adicionado com sucesso</div>";
        } else {
            echo "<div class='error'>   ❌ Erro ao adicionar campo 'logomarca': " . mysqli_error($con) . "</div>";
        }
        echo "<br>";

        // 3. Adicionar campo usuario_id na tabela contratantes
        echo "<div class='info'><strong>3. Adicionando campo 'usuario_id' na tabela contratantes:</strong></div>";
        $sql = "ALTER TABLE contratantes ADD COLUMN usuario_id INT NULL AFTER logomarca";
        if (mysqli_query($con, $sql)) {
            echo "<div class='success'>   ✅ Campo 'usuario_id' adicionado com sucesso</div>";
        } else {
            echo "<div class='error'>   ❌ Erro ao adicionar campo 'usuario_id': " . mysqli_error($con) . "</div>";
        }
        echo "<br>";

        // 4. Adicionar índice para usuario_id
        echo "<div class='info'><strong>4. Adicionando índice para 'usuario_id':</strong></div>";
        $sql = "ALTER TABLE contratantes ADD INDEX idx_usuario_id (usuario_id)";
        if (mysqli_query($con, $sql)) {
            echo "<div class='success'>   ✅ Índice 'idx_usuario_id' adicionado com sucesso</div>";
        } else {
            echo "<div class='error'>   ❌ Erro ao adicionar índice: " . mysqli_error($con) . "</div>";
        }
        echo "<br>";

        // 5. Atualizar registros 'organizador' para 'produtor'
        echo "<div class='info'><strong>5. Atualizando registros de 'organizador' para 'produtor':</strong></div>";
        $sql = "UPDATE usuarios SET perfil = 'produtor' WHERE perfil = 'organizador'";
        if (mysqli_query($con, $sql)) {
            $affected = mysqli_affected_rows($con);
            echo "<div class='success'>   ✅ {$affected} registro(s) atualizado(s) de 'organizador' para 'produtor'</div>";
        } else {
            echo "<div class='error'>   ❌ Erro ao atualizar registros: " . mysqli_error($con) . "</div>";
        }
        echo "<br>";

        // 6. Alterar enum da tabela usuarios
        echo "<div class='info'><strong>6. Alterando enum do campo 'perfil' na tabela usuarios:</strong></div>";
        $sql = "ALTER TABLE usuarios MODIFY COLUMN perfil ENUM('produtor', 'admin', 'staff', 'patrocinador') NOT NULL DEFAULT 'produtor'";
        if (mysqli_query($con, $sql)) {
            echo "<div class='success'>   ✅ Enum do campo 'perfil' alterado com sucesso</div>";
        } else {
            echo "<div class='error'>   ❌ Erro ao alterar enum: " . mysqli_error($con) . "</div>";
        }
        echo "<br>";

        // 7. Verificar estrutura final da tabela contratantes
        echo "<div class='info'><strong>7. Verificando estrutura final da tabela contratantes:</strong></div>";
        $sql = "SHOW COLUMNS FROM contratantes";
        $result = mysqli_query($con, $sql);
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                echo "<div>   {$row['Field']} - {$row['Type']} - {$row['Null']} - {$row['Key']}</div>";
            }
        }
        echo "<br>";

        // 8. Verificar registros finais da tabela usuarios
        echo "<div class='info'><strong>8. Verificando perfis na tabela usuarios após alterações:</strong></div>";
        $sql = "SELECT perfil, COUNT(*) as total FROM usuarios GROUP BY perfil";
        $result = mysqli_query($con, $sql);
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                echo "<div>   Perfil: {$row['perfil']} - Total: {$row['total']}</div>";
            }
        }

        echo "<br><div class='info'><strong>=== ALTERAÇÕES CONCLUÍDAS ===</strong></div>";
        mysqli_close($con);
        ?>
    </div>
    
    <div style="margin-top: 20px;">
        <strong>Comandos ALTER TABLE executados:</strong><br>
        <code>ALTER TABLE contratantes ADD COLUMN logomarca VARCHAR(255) NULL AFTER nome_fantasia;</code><br>
        <code>ALTER TABLE contratantes ADD COLUMN usuario_id INT NULL AFTER logomarca;</code><br>
        <code>ALTER TABLE contratantes ADD INDEX idx_usuario_id (usuario_id);</code><br>
        <code>UPDATE usuarios SET perfil = 'produtor' WHERE perfil = 'organizador';</code><br>
        <code>ALTER TABLE usuarios MODIFY COLUMN perfil ENUM('produtor', 'admin', 'staff', 'patrocinador') NOT NULL DEFAULT 'produtor';</code><br>
    </div>
</body>
</html>