<?php
include "../../includes/stracker/mysql.php";

function getAlertsByDate($date, $pdo) {
  $stmt = $pdo->prepare("select * from _alerts where date = :date");
  $stmt->bindParam(':date', $endDate, PDO::PARAM_INT);
  $stmt->execute(array('date' => $date));
  $data = $stmt->fetchAll();
  $alerts = (object)[];
  foreach($data as $key) {
    $alerts->{$key['symbol']} = $key['type'];
  }
  return $alerts;
}

function getAllTrackedSymbols($pdo) {
  $stmt = $pdo->prepare("select * from _track");
  $stmt->execute();
  return $stmt->fetchAll();
}

function getTrackedAlertsByUser($pdo) {
  $trackedAlerts = (object)[];
  $trackedSymbols = getAllTrackedSymbols($pdo);
  foreach($trackedSymbols as $key) {
    if(!property_exists($trackedAlerts, $key['userId'])) {
      $trackedAlerts->{$key['userId']} = array();
    }
    array_push($trackedAlerts->{$key['userId']}, $key['symbol']);
  }
  return $trackedAlerts;
}

function getTriggeredAlertsFromList($watchList, $triggeredAlerts) {
  $matches = array();
  foreach($watchList as $symbol) {
    if(property_exists($triggeredAlerts, $symbol)) {
      array_push($matches, $symbol);
    }
  }
  return $matches;
}

function formatEmailBody($matchedAlerts, $todaysAlerts) {
  $content = "Matched alerts: \r\n";
  foreach($matchedAlerts as $key) {
    $content .= "$key \r\n";
  }
  $content .= "\r\n\r\nToday's alerts:\r\n";
  foreach($todaysAlerts as $symbol => $type) {
    $content .= $symbol." = ".$type." \r\n";
  }
  return $content;
}

function notifyUserForTriggeredAlerts($emailAddress, $matchedAlerts, $todaysAlerts) {
  $headers = "From: stracker@visegripped.com\r\n";
  $content = formatEmailBody($matchedAlerts, $todaysAlerts);
  print $content;
  mail($emailAddress,'Stracker - Tracked symbol(s) notification',$content,$headers);
}

function getTriggeredAlertsByUser($pdo) {
  $today = date("Y-m-d");
  print "<h1>Checking matched alerts on $today</h1>";
  $trackedAlerts = getTrackedAlertsByUser($pdo);
  $alerts = getAlertsByDate($today, $pdo);
  foreach($trackedAlerts as $userId => $data) {
    $matches = getTriggeredAlertsFromList($data, $alerts);
    print "<hr>".count($matches)." matches";
    if(!empty($matches)) {
      print " and an email was sent";
      notifyUserForTriggeredAlerts($userId, $matches, $alerts);
    }
  }
}

$pdo = dbConnect();
getTriggeredAlertsByUser($pdo);
?>