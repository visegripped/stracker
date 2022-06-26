<?php
include "../../includes/stracker/mysql.php";
include "../../includes/stracker/apiHeaders.php";
include "../../includes/stracker/validation.php";
include "../../includes/stracker/sessions.php";
require_once '../../includes/vendor/autoload.php';

$task = $_POST['task'] ?? "";
$userId = $_POST['userId'] ?? "";
$symbol = $_POST['symbol'] ?? "";
$startDate = $_POST['startDate'] ?? "";
$endDate = $_POST['endDate'] ?? "";
$tokenId = $_POST['tokenId'] ?? "";

function getHistory($symbol, $startDate, $endDate, $pdo) {
    $history = array();
    $stmt = $pdo->prepare("select date, EOD, MA20, MA50, delta, deltaMA5, deltaMA10, deltaMA20, P0, P1, P2, M1, M2, M3 from $symbol where date between :startDate and :endDate order by date DESC"); // hard coded to apple for testing.
    $stmt->bindParam(':startDate', $startDate, PDO::PARAM_INT);
    $stmt->bindParam(':endDate', $endDate, PDO::PARAM_INT);
    $stmt->execute(array('startDate' => $startDate, 'endDate' => $endDate));
    return $stmt->fetchAll();
}

function getSymbols($pdo) {
    $query = "select symbol, name from _symbols ORDER by symbol ASC";
    $stmt = $pdo->query($query);
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
}

function getAlerts($symbol, $pdo) {
    $stmt = $pdo->prepare("select symbol, date, type, id from _alerts where symbol = :symbol order by date DESC");
    $stmt->bindParam(':symbol', $symbol, PDO::PARAM_STR);
    $stmt->execute(array('symbol' => $symbol));
    return $stmt->fetchAll();
}

function track($symbol, $userId, $pdo) {
    $query = "INSERT INTO _track (symbol, userid) VALUES (?,?) on duplicate key update symbol=symbol, userid=userid";
    return $pdo->prepare($query)->execute([$symbol, $userId]);
}

function untrack($symbol, $userId, $pdo) {
    $query = "INSERT INTO _track (symbol, userid) VALUES (?,?) on duplicate key update symbol=symbol, userid=userid";
    return $pdo->prepare($query)->execute([$symbol, $userId]);
}

$db = dbConnect();
// if(!$tokenId) {
//     $data = '{"err":"Token not specified on API request."}';
//     $data = json_decode($data);
// } else if(!isValidSession($tokenId)) {
//     $data = '{"err":"Invalid/expired token.  Please sign (or re-sign) in."}';
//     $data = json_decode($data);
// } else 

if($task == 'history' & areValidDates($startDate, $endDate) & isValidSymbol($symbol) ) {
    $data = getHistory($symbol, $startDate, $endDate, $db);
    $data = array_reverse($data);
} else if($task == 'alerts' & isValidSymbol($symbol)) {
    $data = getAlerts($symbol, $db);
} else if($task == 'track' & isValidSymbol($symbol) && isValidEmail($userId)) {
    $data = track($symbol, $userId, $db) ? '{"msg":"'.$symbol.' now being tracked"}' : '{"err":"Error attempting to track symbol ['.$symbol.']"}';
}  else if($task == 'untrack' & isValidSymbol($symbol) && isValidEmail($userId)) {
    $data = untrack($symbol, $userId, $db) ? '{"msg":"'.$symbol.' no longer being tracked"}' : '{"err":"Error attempting to un-track symbol ['.$symbol.']"}';
} else if($task == 'symbols' ) {
    $data = getSymbols($db);
} else {
    $data = '{"err":"No/Invalid task defined ['.$task.'] or required params are not present. (symbol = ['.$symbol.'] and '.(isValidSymbol($symbol) ? 'is valid' : 'is not valid').'). dates are valid: '.(areValidDates($startDate, $endDate) ? 'true' : 'false').'"}';
    $data = json_decode($data);
}

$data = json_encode($data);
header('Content-type: application/json');
print($data);
?>