<?php

// Yahoo csv contains a lot of data we don't need.  filter out everything but date and EOD.
function formatHistoryCsv($csv) {
    $csvCount = sizeOf($history);
    $theData = array();
    // skip the header row.
    for($i = 1; $i < $csvCount; $i++ ) {
        $row = $history[$i];
        $dateData = array(
            "date" => $row[0],
            "eod" => $row[4]
        )
        array_push($theData, $dateData);
    }
    return $theData;
}
?>