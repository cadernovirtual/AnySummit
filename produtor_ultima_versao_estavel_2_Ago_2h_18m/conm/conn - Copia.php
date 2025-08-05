<?php
if (defined('E_DEPRECATED')) {
    error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
}
else {
    error_reporting(E_ALL & ~E_NOTICE);
}

date_default_timezone_set('America/Sao_Paulo');


/*$host = "clubedamusicab.mysql.dbaas.com.br"; //Servidor do mysql
$user = "clubedamusicab"; //Usuario do banco de dados
$senha = "Swko15357523@#"; //senha do banco de dados
$db = "clubedamusicab"; //banco de dados*/


$host = "anysubd.mysql.dbaas.com.br"; //Servidor do mysql
$user = "anysubd"; //Usuario do banco de dados
$senha = "Swko15357523@#"; //senha do banco de dados
$db = "anysubd"; //banco de dados

 
/*mysql_connect($host, $user, $senha) ;
mysql_select_db($db) ; */
$con= mysqli_connect($host, $user, $senha, $db);
mysqli_set_charset($con, "utf8mb4");
   mysqli_query($con,"SET NAMES 'utf8mb4'");
    mysqli_query($con,'SET character_set_connection=utf8mb4');
    mysqli_query($con,'SET character_set_client=utf8mb4');
    mysqli_query($con,'SET character_set_results=utf8mb4');
	
	
	
function salvarLog($con, $acao, $contratanteid, $msgacao) {
   

    $sql = "INSERT INTO tb_logcli (acao, contratanteid, msgacao) 
            VALUES (?, ?, ?)";

    $stmt = mysqli_prepare($con, $sql);
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "sis", $acao, $contratanteid, $msgacao);
        $executou = mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        
        return $executou ? true : false;
    } else {
        return false;
    }
}
	
	

?>