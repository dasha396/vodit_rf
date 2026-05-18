<?php
require_once '../config/db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Не авторизован']);
    exit;
}

$user_id = $_SESSION['user_id'];

$stmt = $pdo->prepare("
    SELECT a.*, s.name as service_name 
    FROM applications a
    JOIN services s ON a.service_id = s.id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
");
$stmt->execute([$user_id]);
$applications = $stmt->fetchAll(PDO::FETCH_ASSOC);

$payment_labels = [
    'qr' => 'Предоплата по QR-коду',
    'mir_card' => 'Оплата картой МИР',
    'postpay' => 'Постоплата в офисе'
];

foreach ($applications as &$app) {
    $app['payment_label'] = $payment_labels[$app['payment_method']] ?? $app['payment_method'];
}

echo json_encode($applications);
?>