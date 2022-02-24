<?php

function trackNewSymbol($symbol, $companyName, $pdo) {
    $query = "INSERT INTO _symbols (symbol, name) VALUES (?,?) ON DUPLICATE KEY UPDATE symbol=symbol, name=name";
    $pdo->prepare($query)->execute([$symbol, $companyName]);
    createSymbolTable($symbol, $pdo);
    addHistoricalData($symbol, $pdo);
}

?>