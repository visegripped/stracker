<?php

function calcMA($data, $n) {
    return round(array_sum(array_slice($data, -$n, $n)) / $n, 2);
}

function getDataFromHistory($data) {
    $dataCount = sizeOf($data);
    $eodPrices = array();
    // skip the header row.
    for($i = 1; $i < $dataCount; $i++ ) {
        $row = $data[$i];
        $date = $row[0];
        $eod = round($row[4], 2);
        array_push($eodPrices, $eod);
        $MA5 = '';
        if($i > 20) {
            $MA20 = calcMA($eodPrices, 20);
        }
        if($i > 50) {
            $MA50 = calcMA($eodPrices, 50);
        }
        echo "date: $date and eod: $eod and MA20 = $MA20 and $MA50 = $MA50<br>";
    }
}

?>