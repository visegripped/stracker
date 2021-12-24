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
}

function csvDateTimeToDate($dateTime) {
    if($dateTime) {
        $date = explode(' ', $dateTime)[0];
        $date = str_replace('/', '-', $date);
        return $date;
    }
}

function getEodHistory($symbol, $maxRows = 50, $pdo) {
    $history = array();
    $query = "select date, EOD from $symbol ORDER by date DESC LIMIT $maxRows";
    $stmt = $pdo->query($query);
    while ($row = $stmt->fetch()) {
        $thisDate = array(
            "date" => $row['date'],
            "eod" => $row['EOD']
        );
        array_push($history, $thisDate);
    }
    return array_reverse($history); // fetches last X days, but need them in chronological order.
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
            $recentHistory = getEodHistory($symbol, 75, $db);
            $history = getDataFromHistory($recentHistory);
            $mostRecentDayOfHistory = end($history);
            writeHistoryToDB($symbol, array($mostRecentDayOfHistory), $db);
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