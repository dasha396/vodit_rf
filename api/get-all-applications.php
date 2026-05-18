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

$applications = $pdo->query("
    SELECT a.*, u.login, u.full_name, s.name as service_name 
    FROM applications a
    JOIN users u ON a.user_id = u.id
    JOIN services s ON a.service_id = s.id
    ORDER BY a.created_at DESC
")->fetchAll(PDO::FETCH_ASSOC);

$payment_labels = [
    'qr' => 'QR-код',
    'mir_card' => 'Карта МИР',
    'postpay' => 'Постоплата'
];

foreach ($applications as &$app) {
    $app['payment_label'] = $payment_labels[$app['payment_method']] ?? $app['payment_method'];
}

echo json_encode($applications);
?>