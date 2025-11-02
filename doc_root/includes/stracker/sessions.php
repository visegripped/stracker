<?php
// require_once '../../includes/vendor/autoload.php'; // enabling this causes 500s.

session_start();

// https://www.oauth.com/oauth2-servers/signing-in-with-google/verifying-the-user-info/
// https://oauth2.googleapis.com/tokeninfo?id_token=
// https://developers.google.com/identity/gsi/web/guides/verify-google-id-token#php

// function isValidGoogleToken($token) {
//   if (!$token) {
//     return false;
//   }

//   $CLIENT_ID = "451536185848-p0c132ugq4jr7r08k4m6odds43qk6ipj.apps.googleusercontent.com";
//   $client = new Google_Client(['client_id' => $CLIENT_ID]);  // Specify the CLIENT_ID of the app that accesses the backend

//   $payload = $client->verifyIdToken($token);
//   if ($payload) {
//     $userid = $payload['sub'];
//     return true;
//   }
//   return false;
// }

function isValidGoogleAccessToken($token) {
  if (!$token) {
    return false;
  }

  $url = "https://oauth2.googleapis.com/tokeninfo?access_token=" . urlencode($token);

  $context = stream_context_create([
    'http' => [
      'timeout' => 5,
      'ignore_errors' => true
    ]
  ]);
  
  $response = @file_get_contents($url, false, $context);
  
  if ($response === false) {
    return false;
  }
  
  $result = json_decode($response, true);

  if (json_last_error() !== JSON_ERROR_NONE) {
    return false;
  }

  if (isset($result['aud']) && $result['aud'] === "451536185848-p0c132ugq4jr7r08k4m6odds43qk6ipj.apps.googleusercontent.com") {
    return true;
  }
  return false;
}


function getUserEmailFromSession($token) {
  if(!$token) {
    return '';
  }
  $CLIENT_ID = "451536185848-p0c132ugq4jr7r08k4m6odds43qk6ipj.apps.googleusercontent.com";
  $client = new Google_Client(['client_id' => $CLIENT_ID]);  // Specify the CLIENT_ID of the app that accesses the backend
  $payload = $client->verifyIdToken($token);
  if ($payload) {
    $userid = $payload['sub'];
    return $userid;
  }
  return '';
}

function isValidSession($token) {
  if(isset($_SESSION['isValid']) && $_SESSION['isValid'] === true) {
    return true;
  }
  // Note: isValidGoogleToken is commented out above, so we use isValidGoogleAccessToken instead
  if($token && isValidGoogleAccessToken($token)) {
    $_SESSION['isValid'] = true;
    return true;
  }
  return false;
}

?>