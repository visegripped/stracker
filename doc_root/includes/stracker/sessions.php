<?php
require_once 'vendor/autoload.php';

session_start();

function isValidGoogleToken($token) {
  if(!$token) {
    return false;
  }
  $CLIENT_ID = "451536185848-p0c132ugq4jr7r08k4m6odds43qk6ipj.apps.googleusercontent.com";
  $client = new Google_Client(['client_id' => $CLIENT_ID]);
  $payload = $client->verifyIdToken($token);
  if ($payload) {
    return true;
  }
  return false;
}

function isValidSession($token) {
  if(isset($_SESSION['isValid']) || isValidGoogleToken($token)) {
    $_SESSION['isValid'] = true;
    return true;
  }
  return false;
}

?>