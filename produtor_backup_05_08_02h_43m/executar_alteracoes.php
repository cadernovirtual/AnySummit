<?php
// Script para executar as alterações no banco de dados
include("conm/conn.php");

echo "=== INICIANDO ALTERAÇÕES NO BANCO ===\n\n";

// 1. Verificar registros com perfil 'organizador'
echo "1. Verificando registros com perfil 'organizador':\n";
$sql = "SELECT id, nome, email, perfil FROM usuarios WHERE perfil = 'organizador'";
$result = mysqli_query($con, $sql);
if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        echo "   ID: {$row['id']}, Nome: {$row['nome']}, Email: {$row['email']}, Perfil: {$row['perfil']}\n";
    }
} else {
    echo "   Nenhum registro encontrado com perfil 'organizador'\n";
}
echo "\n";

// 2. Adicionar campo logomarca na tabela contratantes
echo "2. Adicionando campo 'logomarca' na tabela contratantes:\n";
$sql = "ALTER TABLE contratantes ADD COLUMN logomarca VARCHAR(255) NULL AFTER nome_fantasia";
if (mysqli_query($con, $sql)) {
    echo "   ✅ Campo 'logomarca' adicionado com sucesso\n";
} else {
    echo "   ❌ Erro ao adicionar campo 'logomarca': " . mysqli_error($con) . "\n";
}
echo "\n";

// 3. Adicionar campo usuario_id na tabela contratantes
echo "3. Adicionando campo 'usuario_id' na tabela contratantes:\n";
$sql = "ALTER TABLE contratantes ADD COLUMN usuario_id INT NULL AFTER logomarca";
if (mysqli_query($con, $sql)) {
    echo "   ✅ Campo 'usuario_id' adicionado com sucesso\n";
} else {
    echo "   ❌ Erro ao adicionar campo 'usuario_id': " . mysqli_error($con) . "\n";
}
echo "\n";

// 4. Adicionar índice para usuario_id
echo "4. Adicionando índice para 'usuario_id':\n";
$sql = "ALTER TABLE contratantes ADD INDEX idx_usuario_id (usuario_id)";
if (mysqli_query($con, $sql)) {
    echo "   ✅ Índice 'idx_usuario_id' adicionado com sucesso\n";
} else {
    echo "   ❌ Erro ao adicionar índice: " . mysqli_error($con) . "\n";
}
echo "\n";

// 5. Atualizar registros 'organizador' para 'produtor'
echo "5. Atualizando registros de 'organizador' para 'produtor':\n";
$sql = "UPDATE usuarios SET perfil = 'produtor' WHERE perfil = 'organizador'";
if (mysqli_query($con, $sql)) {
    $affected = mysqli_affected_rows($con);
    echo "   ✅ {$affected} registro(s) atualizado(s) de 'organizador' para 'produtor'\n";
} else {
    echo "   ❌ Erro ao atualizar registros: " . mysqli_error($con) . "\n";
}
echo "\n";

// 6. Alterar enum da tabela usuarios
echo "6. Alterando enum do campo 'perfil' na tabela usuarios:\n";
$sql = "ALTER TABLE usuarios MODIFY COLUMN perfil ENUM('produtor', 'admin', 'staff', 'patrocinador') NOT NULL DEFAULT 'produtor'";
if (mysqli_query($con, $sql)) {
    echo "   ✅ Enum do campo 'perfil' alterado com sucesso\n";
} else {
    echo "   ❌ Erro ao alterar enum: " . mysqli_error($con) . "\n";
}
echo "\n";

// 7. Verificar estrutura final da tabela contratantes
echo "7. Verificando estrutura final da tabela contratantes:\n";
$sql = "SHOW COLUMNS FROM contratantes";
$result = mysqli_query($con, $sql);
if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        echo "   {$row['Field']} - {$row['Type']} - {$row['Null']} - {$row['Key']}\n";
    }
}
echo "\n";

// 8. Verificar registros finais da tabela usuarios
echo "8. Verificando perfis na tabela usuarios após alterações:\n";
$sql = "SELECT perfil, COUNT(*) as total FROM usuarios GROUP BY perfil";
$result = mysqli_query($con, $sql);
if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        echo "   Perfil: {$row['perfil']} - Total: {$row['total']}\n";
    }
}

echo "\n=== ALTERAÇÕES CONCLUÍDAS ===\n";
mysqli_close($con);
?>