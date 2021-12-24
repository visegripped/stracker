<?php
function writeHistoryToDB($symbol, $history, $pdo) {
    if($symbol && $history) {
        $sql = "INSERT INTO $symbol (date, EOD, delta, deltaMA5, deltaMA10, deltaMA20, MA20, MA50, M1, M2, M3, P0, P1, P2) VALUES (:date, :eod, :delta, :deltaMA5, :deltaMA10, :deltaMA20, :MA20, :MA50, :M1, :M2, :M3, :P0, :P1, :P2)";
        foreach ($history as $row) {
            $stmt= $pdo->prepare($sql);
            try {
                $stmt->execute($row);
            } catch(PDOException $e) {
                if ($e->getCode() == 23000) {
                    // EOD already exists for date. expected as this script may be run twice between trading days.
                } else {
                    // not good.  need reporting around this at some point.
                    echo "something went wrong.  Error: $e";
                }
            }
        }
    }
}
?>