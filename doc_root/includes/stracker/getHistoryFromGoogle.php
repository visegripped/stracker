<?php
require 'vendor/autoload.php'; // Composer's autoload for Google API client

use Google\Client;
use Google\Service\Sheets;

// 1. Set up Google API Client
function getGoogleClient() {
    $client = new Client();
    $client->setApplicationName('Google Sheets Stock Data');
    $client->setScopes([Sheets::SPREADSHEETS, 'https://www.googleapis.com/auth/drive']);
    $client->setAuthConfig('path/to/your-service-account-key.json');
    $client->setAccessType('offline');
    return $client;
}

// 2. Update Stock Symbol in Google Sheet
function updateStockSymbol($spreadsheetId, $symbol, $range = 'A1') {
    $client = getGoogleClient();
    $service = new Sheets($client);

    // Prepare the update request
    $values = [[ $symbol ]]; // New stock symbol
    $body = new Google\Service\Sheets\ValueRange([
        'values' => $values
    ]);
    
    $params = ['valueInputOption' => 'RAW'];
    $service->spreadsheets_values->update($spreadsheetId, $range, $body, $params);
}

// 3. Fetch CSV Data
function fetchCsv($csvUrl) {
    $csvData = file_get_contents($csvUrl);
    if ($csvData !== false) {
        return $csvData;
    } else {
        throw new Exception('Error fetching the CSV data.');
    }
}

// Usage:
try {
    $spreadsheetId = 'your-google-sheet-id'; // Found in the sheet URL
    $csvUrl = 'your-published-csv-link'; // Published CSV link
    $stockSymbol = 'AAPL'; // Example: Replace dynamically

    // Update the stock symbol in the sheet
    updateStockSymbol($spreadsheetId, $stockSymbol);

    // Fetch the updated CSV data
    $csvData = fetchCsv($csvUrl);
    echo $csvData; // Or process the CSV data further
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
?>