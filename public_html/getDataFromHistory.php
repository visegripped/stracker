<?php

function calcMA($data, $n) {
    return round(array_sum(array_slice($data, -$n, $n)) / $n, 2);
}

function calcDelta($data, $n) {

}

function getDataFromHistory($data) {
    $dataCount = sizeOf($data);
    $eodPrices = array();
    $deltas = array();
    echo "<table><tr><th>Date</th><th>EOD</th><th>MA 20</th><th>MA 50</th><th>Delta</th><th>Delta MA 5</th><th>Delta MA 10</th><th>Delta MA 20</th></tr>";
    // skip the header row.
    for($i = 1; $i < $dataCount; $i++ ) {
        $row = $data[$i];
        $date = $row[0];
        $eod = round($row[4], 2);
        array_push($eodPrices, $eod);

        if($i > 20) {
            $MA20 = calcMA($eodPrices, 20);
            $delta = round($eod - $MA20, 2);
            array_push($deltas, $delta);
        }
        if($i > 25) {
            $deltaMA5 = calcMA($deltas, 5);
            $deltaMA10 = calcMA($deltas, 10);
            $deltaMA20 = calcMA($deltas, 20);
        }
        if($i > 50) {
            $MA50 = calcMA($eodPrices, 50);
        }
        
        echo "<tr><td>$date</td><td>$eod</td><td>$MA20</td><td>$MA50</td><td>$delta</td><td>$deltaMA5</td><td>$deltaMA10</td><td>$deltaMA20</td></tr>";
    }
    echo "</table>";
}

?>