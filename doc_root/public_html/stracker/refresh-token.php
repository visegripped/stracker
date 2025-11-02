<?php
// refresh_token.php

include "../../includes/stracker/passwords.php";
$client_id = $googleClientId;
$client_secret = $googleClientSecret;

header('Content-Type: application/json');

// Get the refresh token from the request (supports form-encoded or JSON bodies)
$refresh_token = $_POST['refresh_token'] ?? '';
if (!$refresh_token) {
    $raw = file_get_contents('php://input');
    if ($raw) {
        $json = json_decode($raw, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $refresh_token = $json['refresh_token'] ?? '';
        }
    }
}

if (!$refresh_token) {
    http_response_code(400);
    echo json_encode(['error' => 'No refresh token provided']);
    exit;
}

$token_url = 'https://oauth2.googleapis.com/token';

$requestData = [
    'client_id' => $client_id,
    'client_secret' => $client_secret,
    'refresh_token' => $refresh_token,
    'grant_type' => 'refresh_token',
];

// Initialize cURL
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $token_url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($requestData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

if ($http_code == 200) {
    $response_data = json_decode($response, true);
    echo json_encode($response_data);
} else {
    http_response_code($http_code);
    echo $response;
}
?>
