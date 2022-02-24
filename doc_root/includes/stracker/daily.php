<?php
    include "getCsv.php";
    include "formatCsv.php";
    include "getDataFromHistory.php";
    include "writeHistoryToDB.php";
    include "mysql.php";
    include "trackNewSymbol.php";
    include "passwords.php";
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
    if($dateTime && strtotime($dateTime)) {
        $date = DateTime::createFromFormat('m/d/Y', explode(' ', $dateTime)[0]);
        $date = $date->format('Y-m-d');
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

function recordAlerts($date, $alerts, $pdo) {
    $alertsAsJson = json_encode($alerts);
    $query = "INSERT INTO _alertHistory (date, alerts) VALUES (?,?) on duplicate key update date=date, alerts=alerts";
    $pdo->prepare($query)->execute([$date, $alertsAsJson]);
}

function handleDailies($dailyEodPriceCsv) {
    $alerts = array();
    $errors = array();
    $trackedSymbolData = getCsv($dailyEodPriceCsv);
    $db = dbConnect();

    foreach($trackedSymbolData as $row) {
        $symbol = $row[0];
        $price = $row[1];
        $tradeDate = csvDateTimeToDate($row[2]);
        $companyName = $row[3];
        if(!is_numeric($price)) {
            array_push($errors, "Symbol $symbol had a non-numeric price: $price. TradeDate: $tradeDate and company name: $companyName.");
        } elseif(tableExists($symbol, $db)) {
            echo "Tracked symbol [$symbol] ended at $price traded on ".$tradeDate.".<br>";
            $recentHistory = getEodHistory($symbol, 75, $db);
            $lastDateFromHistory = end($recentHistory)['date'];

            // this condition could happen if the daily script was run twice on the same date.
            if($lastDateFromHistory == $tradeDate) {
                echo " -> tracked day is already in history [$lastDateFromHistory]. do not add.<br>";
            } else {
                array_push($recentHistory, array(
                    "date"=> $tradeDate,
                    "eod"=> $price
                ));
            }

            $history = getDataFromHistory($recentHistory);
            $mostRecentDayOfHistory = end($history);
            writeHistoryToDB($symbol, array($mostRecentDayOfHistory), $db);
            $alertState = signalAlignment($history);
            if($alertState) {
                $alerts[$symbol] = $alertState;
            }
        } elseif($symbol) {
            echo "$symbol is not presently tracked.  adding...";
            trackNewSymbol($symbol, $companyName, $db);
            echo " success!<br>";
        } else {
            echo "symbol was blank.<br>";
        }
        // die(); // here for testing only.
    }
    if(count($alerts)) {
        recordAlerts($tradeDate, $alerts, $db);
    }
    
    echo "<br><h3>Alerts:</h3><br>";
    print_r($alerts);
    
    if(count($errors)) {
        echo "<br><h3>Errors:</h3><br>";
        print_r($errors);
        $message = implode("\r", $errors);
        $message = wordwrap($message, 70, "\r\n");
        $headers = "From: stracker-errors@visegripped.com";
        mail($errorEmail, 'Stracker errors', $message, $headers);
    }
}

handleDailies($dailyEodPriceCsv);

 ?>
 