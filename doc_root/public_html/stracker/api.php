<?php
include "../../includes/stracker/mysql.php";
// header('Content-Type: application/json; charset=utf-8');


$task = $_GET['task'];
$symbol = $_GET['symbol'];

function getHistory($symbol, $maxRows = 50, $pdo) {
    $history = array();
    $query = "select date, EOD, MA20, MA50, delta, deltaMA5, deltaMA10, deltaMA20, P0, P1, P2, M1, M2, M3 from $symbol ORDER by date DESC LIMIT $maxRows";
    $stmt = $pdo->query($query);
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
}


function getSymbols($pdo) {
    $query = "select symbol, name from symbols ORDER by symbol ASC";
    $stmt = $pdo->query($query);
    return $stmt->fetchAll(\PDO::FETCH_ASSOC);
}


$db = dbConnect();
if($task == 'history') {
    $data = getHistory($symbol, 100, $db);
    $data = array_reverse($data);
} else if($task == 'symbols') {
    $data = getSymbols($db);
} else {
    $data = '{"err":"no/invalid task defined or required params are not present.  (symbol = ['.$symbol.'])"}';
}



$data = json_encode($data);
header('Content-type: application/json');
print($data);
?>