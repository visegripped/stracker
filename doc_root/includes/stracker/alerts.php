<?php
include "secretSauce.php";

function alertsforDay($data) {
    return getAlertStatusForDay($data);
}

function signalAlignment($history) {
    return getSignalAlignmentForDay($history);
}

?>