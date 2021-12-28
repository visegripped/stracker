<?php

function getCsv($csv) {
    $row = 1;
    $dataArray = array();
    if($csv) {
        if (($handle = fopen($csv, "r")) !== FALSE) {
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                $num = count($data);
                $row++;
                array_push($dataArray, $data);
            }
            fclose($handle);
        }
    } else {
        echo "something went wrong attempting to fetch csv: ['$csv']";
    }

    return $dataArray;
}

?>