<?php
include "mysql.php";

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
  $content = "<h3>Matched alerts:</h3>";
  foreach($matchedAlerts as $key) {
    $content .= "<a href='https://visegripped.com/#/symbol/$key'>$key</a><br />";
  }
  $content .= "<br /><h3>Today's alerts:</h3>";
  foreach($todaysAlerts as $symbol => $type) {
    $content .= "<a href='https://visegripped.com/#/symbol/".$key."'>".$symbol."</a> = ".$type."<br />";
  }
  return $content;
}

// https://phppot.com/php/php-send-html-email/
function notifyUserForTriggeredAlerts($emailAddress, $matchedAlerts, $todaysAlerts) {
  $headers = "From: stracker@visegripped.com\r\n";
  $headers .= "Reply-To: stracker@visegripped.com" . "\r\n";
  $headers .= "MIME-Version: 1.0" . "\r\n";
  $headers .= "Content-type: text/html; charset=UTF-8" . "\r\n";
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