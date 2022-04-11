<?php
include "../../includes/stracker/mysql.php";
include "../../includes/stracker/apiHeaders.php";
include "../../includes/stracker/validation.php";
include "../../includes/stracker/sessions.php";
require_once '../../includes/vendor/autoload.php';

$task = $_GET['task'];
$symbol = $_GET['symbol'];
$startDate = $_GET['startDate'];
$endDate = $_GET['endDate'];
$token = $_COOKIE['token'];


function getHistory($symbol, $startDate, $endDate, $pdo) {
    $history = array();
    $query = "select date, EOD, MA20, MA50, delta, deltaMA5, deltaMA10, deltaMA20, P0, P1, P2, M1, M2, M3 from $pdo->quote($symbol) where date between $pdo->quote($startDate) and $pdo->quote($endDate) order by date DESC";
    $stmt = $pdo->query($query);
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
}


function getSymbols($pdo) {
    $query = "select symbol, name from _symbols ORDER by symbol ASC";
    $stmt = $pdo->query($query);
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
}

$db = dbConnect();
if(!$token) {
    $data = '{"err":"Token not specified on API request."}';
} else if(!isValidSession($token)) {
    $data = '{"err":"Invalid/expired token.  Please sign (or re-sign) in."}';
}else if($task == 'history' & areValidDates($startDate, $endDate) & isValidSymbol($symbol) ) {
    $data = getHistory($symbol, $startDate, $endDate, $db);
    $data = array_reverse($data);
} else if($task == 'symbols' ) {
    $data = getSymbols($db);
} else {
    $data = '{"err":"No/Invalid task defined or required params are not present. (symbol = ['.$symbol.'] and '.(isValidSymbol($symbol) ? 'is valid' : 'is not valid').'). dates are valid: '.(areValidDates($startDate, $endDate) ? 'true' : 'false').'"}';
}

$data = json_encode($data);
header('Content-type: application/json');


print($data);
?>