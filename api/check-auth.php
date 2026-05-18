<?php
require_once '../config/db.php';

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'login' => $_SESSION['login'],
            'role' => $_SESSION['role']
        ]
    ]);
} else {
    echo json_encode(['authenticated' => false]);
}
?>