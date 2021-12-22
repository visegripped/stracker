<?php
function writeHistoryToDB($symbol, $history, $pdo) {
    if($symbol && $history) {
        $sql = "INSERT INTO $symbol (date, EOD, delta, deltaMA5, deltaMA10, deltaMA20, MA20, MA50, M1, M2, M3, P0, P1, P2) VALUES (:date, :eod, :delta, :deltaMA5, :deltaMA10, :deltaMA20, :MA20, :MA50, :M1, :M2, :M3, :P0, :P1, :P2)";
        foreach ($history as $row) {
            $stmt= $pdo->prepare($sql);
            $stmt->execute($row);
        }
    }
}
?>