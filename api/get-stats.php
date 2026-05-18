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

$stats = $pdo->query("
    SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Новая' THEN 1 ELSE 0 END) as new_count,
        SUM(CASE WHEN status = 'В работе' THEN 1 ELSE 0 END) as working_count,
        SUM(CASE WHEN status = 'Завершено' THEN 1 ELSE 0 END) as completed_count
    FROM applications
")->fetch(PDO::FETCH_ASSOC);

echo json_encode($stats);
?>