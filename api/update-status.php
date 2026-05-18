<?php
require_once '../config/db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Не авторизован']);
    exit;
}

$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

if (!$user || $user['role'] !== 'admin') {
    echo json_encode(['error' => 'Доступ запрещён']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$application_id = $data['application_id'] ?? '';
$new_status = $data['new_status'] ?? '';

$stmt = $pdo->prepare("UPDATE applications SET status = ? WHERE id = ?");
if ($stmt->execute([$new_status, $application_id])) {
    echo json_encode(['success' => true, 'message' => 'Статус изменён']);
} else {
    echo json_encode(['success' => false, 'error' => 'Ошибка']);
}
?>