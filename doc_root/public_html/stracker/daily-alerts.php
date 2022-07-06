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
    if(!property_exists($trackedAlerts, $key['userid'])) {
      $trackedAlerts->{$key['userid']} = array();
    }
    array_push($trackedAlerts->{$key['userid']}, $key['symbol']);
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

function notifyUserForTriggeredAlerts($emailAddress, $matchedAlerts) {
  $headers = "From: stracker@visegripped.com\r\n";
  mail($emailAddress,'Stracker - Tracked symbol(s) notification',serialize($matchedAlerts),$headers);
}

function getTriggeredAlertsByUser($pdo) {
  $today = date("Y-m-d");
  $trackedAlerts = getTrackedAlertsByUser($pdo);
  $alerts = getAlertsByDate($today, $pdo);
  foreach($trackedAlerts as $userid => $data) {
    $matches = getTriggeredAlertsFromList($data, $alerts);
    notifyUserForTriggeredAlerts($userid, $matches);
  }
}

$pdo = dbConnect();
getTriggeredAlertsByUser($pdo);
?>

