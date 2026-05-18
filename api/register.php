<?php
require_once '../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);

$login = trim($data['login'] ?? '');
$password = $data['password'] ?? '';
$full_name = trim($data['full_name'] ?? '');
$phone = trim($data['phone'] ?? '');
$email = trim($data['email'] ?? '');

$errors = [];

if (!preg_match('/^[a-zA-Z0-9]{6,}$/', $login)) {
    $errors[] = 'Логин должен содержать минимум 6 символов (латиница и цифры)';
}
if (strlen($password) < 8) {
    $errors[] = 'Пароль должен быть не менее 8 символов';
}
if (!preg_match('/^[а-яА-ЯёЁ\s]+$/u', $full_name)) {
    $errors[] = 'ФИО должно содержать только кириллицу и пробелы';
}
if (!preg_match('/^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/', $phone)) {
    $errors[] = 'Телефон должен быть в формате 8(XXX)XXX-XX-XX';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Некорректный email';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

$stmt = $pdo->prepare("SELECT id FROM users WHERE login = ?");
$stmt->execute([$login]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'errors' => ['Пользователь с таким логином уже существует']]);
    exit;
}

$hashed = password_hash($password, PASSWORD_DEFAULT);
$sql = "INSERT INTO users (login, password, full_name, phone, email, role) VALUES (?, ?, ?, ?, ?, 'user')";
$stmt = $pdo->prepare($sql);

if ($stmt->execute([$login, $hashed, $full_name, $phone, $email])) {
    echo json_encode(['success' => true, 'message' => 'Регистрация успешна']);
} else {
    echo json_encode(['success' => false, 'errors' => ['Ошибка при регистрации']]);
}
?>