<?php
$password = 'Admin123';

$hash = password_hash($password, PASSWORD_DEFAULT);

echo "Пароль: " . $password . "<br>";
echo "Хэш: " . $hash;
?>
/*<link rel="stylesheet" href="../assets/bootstrap/css/bootstrap.min.css">*/
//<script src="../assets/bootstrap/js/bootstrap.bundle.min.js"><script>//