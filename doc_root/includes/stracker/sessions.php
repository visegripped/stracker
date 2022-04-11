<?php

session_start();

// https://www.oauth.com/oauth2-servers/signing-in-with-google/verifying-the-user-info/
// https://oauth2.googleapis.com/tokeninfo?id_token=

function isValidGoogleToken($token) {
  if(!$token) {
    return false;
  }

  $CLIENT_ID = "451536185848-p0c132ugq4jr7r08k4m6odds43qk6ipj.apps.googleusercontent.com";
  $client = new Google_Client(['client_id' => $CLIENT_ID]);  // Specify the CLIENT_ID of the app that accesses the backend
  // $boom = explode('.', $token);
  $payload = $client->verifyIdToken($token);
  if ($payload) {
    $userid = $payload['sub'];
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