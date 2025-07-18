<?php
// Inclui o verificador de login
include("../check_login.php");
include("../conm/conn.php");
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Check-in - Anysummit</title>
    <link rel="stylesheet" type="text/css" href="/staff/css/css.css">
</head>
<body>
    <div class="container">
        <h1>Bem-vindo, <?php echo htmlspecialchars($staff_nome); ?>!</h1>
        <p>Staff ID: <?php echo $staff_id; ?></p>
        <p>Evento ID: <?php echo $evento_id; ?></p>
        <p>Email: <?php echo htmlspecialchars($staff_email); ?></p>
        
        <br><br>
        <a href="../logout.php" style="color: #FF6B6B; text-decoration: none; padding: 10px 20px; border: 1px solid #FF6B6B; border-radius: 5px;">
            Sair
        </a>
    </div>
</body>
</html>
