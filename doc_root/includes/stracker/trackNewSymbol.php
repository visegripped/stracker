<?php

function trackNewSymbol($symbol, $companyName, $pdo) {
    $query = "INSERT INTO symbols (symbol, name) VALUES (?,?)";
    $pdo->prepare($query)->execute([$symbol, $companyName]);
    createSymbolTable($symbol, $pdo);
    addHistoricalData($symbol, $pdo);
}

?>