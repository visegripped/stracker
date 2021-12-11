<?php
include "alerts.php";

function calcMA($data, $n) {
    return round(array_sum(array_slice($data, -$n, $n)) / $n, 2);
}

function getDataFromHistory($history) {
    $historyCount = sizeOf($history);
    $eodPrices = array();
    $deltas = array();
    $theData = array();
    // skip the header row.
    for($i = 1; $i < $historyCount; $i++ ) {
        $row = $history[$i];
        $date = $row[0];
        $eod = $row[4];
        array_push($eodPrices, $eod);

        if($i > 20) {
            $MA20 = calcMA($eodPrices, 20);
            $delta = $eod - $MA20;
            array_push($deltas, $delta);
        }
        if($i > 25) {
            $deltaMA5 = calcMA($deltas, 5); //D1
            $deltaMA10 = calcMA($deltas, 10); //D2
            $deltaMA20 = calcMA($deltas, 20); //D3
            $M1 = $MA20 + $deltaMA5; // MA20 + D1
            $M2 = $MA20 + $deltaMA10; // MA20 + D2
            $M3 = $MA20 + $deltaMA20; // MA20 + D3
        }
        if($i > 50) {
            $MA50 = calcMA($eodPrices, 50);
        }
        $todaysData = array(
            "date" => $date,
            "eod" => $eod,
            "delta" => $delta,
            "deltaMA5" => $deltaMA5,
            "deltaMA10" => $deltaMA10,
            "deltaMA20" => $deltaMA20,
            "MA20" => $MA20,
            "MA50" => $MA50,
            "M1" => $M1,
            "M2" => $M2,
            "M3" => $M3,
        );       
        $todaysData = array_merge($todaysData, alertsForDay($todaysData));
        array_push($theData, $todaysData);
    }
    return $theData;
}
?>