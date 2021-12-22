<?php
    include "includes/stracker/getCsv.php";
    include "includes/stracker/formatCsv.php";
    include "includes/stracker/getDataFromHistory.php";
    include "includes/stracker/writeHistoryToDB.php";
    include "includes/stracker/mysql.php";
    include "includes/stracker/trackNewSymbol.php";

// The contents of this file should get moved over to cron.php

function addHistoricalData($symbol, $db) {
    // period 1 is start data. period 2 is end date.
    // stock data comes back as follows:  data, open, high, low, close, adj close, volume
    $csvUri = "https://query1.finance.yahoo.com/v7/finance/download/$symbol?period1=1577889599&period2=".time()."&interval=1d&events=history&includeAdjustedClose=true";
    $stockData = getCsv($csvUri);
    $formattedStockData = formatHistoryCsv($stockData);
    $history = getDataFromHistory($formattedStockData);
    writeHistoryToDB($symbol, $history, $db);
    // print_r($history);
}

function csvDateTimeToDate($dateTime) {
    $myDateTime = DateTime::createFromFormat('m/d/Y h:i:s', $dateTime);
    return $myDateTime->format('Y-m-d');
}


function handleDailies() {
    include "includes/stracker/passwords.php";
    $priceList = getCsv($dailyEodPriceCsv);
    $db = dbConnect();
    foreach($priceList as $row) {
        $symbol = $row[0];
        $price = $row[1];
        $tradeTime = $row[2];
        $companyName = $row[3];
        if(tableExists($symbol, $db)) {
            echo "$symbol ended at $price traded on ".csvDateTimeToDate($tradeTime).".  Get this data in to DB.<br>";
            // TODO - need to get the last 50 rows of data and use that to generate the next row, then add it.
        } elseif($symbol) {
            echo "$symbol is not presently tracked.  adding...";
            trackNewSymbol($symbol, $companyName, $db);
            echo " success!<br>";
        } else {
            echo "symbol was blank.<br>";
        }
    }
}

handleDailies();

 ?>