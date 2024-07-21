<?php

function trackNewSymbol($symbol, $companyName, $pdo) {
    $query = "INSERT INTO _symbols (symbol, name) VALUES (?,?) ON DUPLICATE KEY UPDATE symbol=symbol, name=name";
    $pdo->prepare($query)->execute([$symbol, $companyName]);
    createSymbolTable($symbol, $pdo);
    $historyAdded = addHistoricalData($symbol, $pdo);
    if($historyAdded == false) {
        //drop the table or the script won't try to populate it again tomorrow.
        $dropQuery = "DROP TABLE '".$tableId."'";
        $pdo->prepare($dropQuery)->execute([$symbol]);
        return false;
    }
    return true;
}

?>