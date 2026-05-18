<?php
$password = 'Admin123';

$hash = password_hash($password, PASSWORD_DEFAULT);

echo "Пароль: " . $password . "<br>";
echo "Хэш: " . $hash;
?>