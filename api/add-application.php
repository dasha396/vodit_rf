<?php
require_once '../config/db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Не авторизован']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$user_id = $_SESSION['user_id'];
$service_id = $data['service_id'] ?? '';
$start_date = $data['start_date'] ?? '';
$payment_method = $data['payment_method'] ?? '';

if (empty($service_id) || empty($start_date) || empty($payment_method)) {
    echo json_encode(['success' => false, 'error' => 'Заполните все поля']);
    exit;
}

$sql = "INSERT INTO applications (user_id, service_id, start_date, payment_method, status) 
        VALUES (?, ?, ?, ?, 'Новая')";
$stmt = $pdo->prepare($sql);

if ($stmt->execute([$user_id, $service_id, $start_date, $payment_method])) {
    echo json_encode(['success' => true, 'message' => 'Заявка отправлена']);
} else {
    echo json_encode(['success' => false, 'error' => 'Ошибка при создании заявки']);
}
?>