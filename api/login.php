<?php
require_once '../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);

$login = trim($data['login'] ?? '');
$password = $data['password'] ?? '';

$stmt = $pdo->prepare("SELECT * FROM users WHERE login = ?");
$stmt->execute([$login]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['login'] = $user['login'];
    $_SESSION['role'] = $user['role'];
    
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'login' => $user['login'],
            'role' => $user['role']
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'Неверный логин или пароль']);
}
?>