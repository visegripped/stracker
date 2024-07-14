<?php
// echo readfile('http://localhost:5173'); 
// echo stream_get_contents(fopen('http://localhost:5173', "rb"));
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:5173');
$dataFromExternalServer = curl_exec($ch);
?>