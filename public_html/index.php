<?php
include "getCsv.php";
include "getDataFromHistory.php";

// period 1 is start data. period 2 is end date.
// stock data comes back as follows:  data, open, high, low, close, adj close, volume
// $stockData = getCsv('https://query1.finance.yahoo.com/v7/finance/download/INTU?period1=1631318400&period2=1639180800&interval=1d&events=history&includeAdjustedClose=true');
$stockData = getCsv('sampleHistoricalData-INTU.csv');
getDataFromHistory($stockData);


 ?>