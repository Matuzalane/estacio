<?php 
// Conexão com o banco de dados
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "amabgv";

$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica se houve erro na conexão
if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}
?>