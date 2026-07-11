<?php

/**
 * Fetch historical EOD prices from Yahoo Finance when the CSV download endpoint is unavailable.
 * Tries the public history page (embedded root.App.main JSON), then the chart API.
 */

define('YAHOO_HISTORY_PERIOD1_DEFAULT', 1672574400); // Jan 1 2023

function yahooHistoryPageUrl($symbol, $period1, $period2) {
    $encoded = rawurlencode($symbol);
    return "https://finance.yahoo.com/quote/{$encoded}/history/?period1={$period1}&period2={$period2}&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true";
}

function yahooChartApiUrl($symbol, $period1, $period2, $host = 'query1') {
    $encoded = rawurlencode($symbol);
    $host = preg_replace('/[^a-z0-9]/i', '', $host);
    return "https://{$host}.finance.yahoo.com/v8/finance/chart/{$encoded}?period1={$period1}&period2={$period2}&interval=1d";
}

function yahooChartApiUrlByRange($symbol, $range = '5y', $host = 'query1') {
    $encoded = rawurlencode($symbol);
    $host = preg_replace('/[^a-z0-9]/i', '', $host);
    $range = preg_replace('/[^a-z0-9]/i', '', $range);

    return "https://{$host}.finance.yahoo.com/v8/finance/chart/{$encoded}?range={$range}&interval=1d";
}

function yahooHttpGet($url, $forHtmlPage = true, $maxRetries = 3) {
    $headers = $forHtmlPage
        ? [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language: en-US,en;q=0.9',
        ]
        : ['Accept: application/json'];

    $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

    if (function_exists('curl_init')) {
        for ($attempt = 0; $attempt < $maxRetries; $attempt++) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_TIMEOUT => 60,
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_USERAGENT => $userAgent,
            ]);
            $body = curl_exec($ch);
            $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($body !== false && $httpCode >= 200 && $httpCode < 300) {
                return $body;
            }

            if ($httpCode === 429 || $httpCode >= 500) {
                sleep(min(2 ** $attempt, 5));
                continue;
            }

            return false;
        }

        return false;
    }

    $accept = $forHtmlPage ? 'text/html' : 'application/json';
    $context = stream_context_create([
        'http' => [
            'timeout' => 60,
            'header' => "User-Agent: {$userAgent}\r\nAccept: {$accept}\r\n",
        ],
    ]);
    $body = @file_get_contents($url, false, $context);
    return $body !== false ? $body : false;
}

function yahooFilterHistoryByPeriod($history, $period1, $period2) {
    $startDate = gmdate('Y-m-d', $period1);
    $endDate = gmdate('Y-m-d', $period2);

    return array_values(array_filter($history, function ($row) use ($startDate, $endDate) {
        return $row['date'] >= $startDate && $row['date'] <= $endDate;
    }));
}

function yahooIsBlockedHistoryResponse($html) {
    if (!$html || strlen($html) < 1000) {
        return true;
    }
    return strpos($html, 'Content is currently unavailable') !== false
        || strpos($html, 'root.App.main') === false;
}

function yahooExtractJsonObject($text) {
    $len = strlen($text);
    $depth = 0;
    $inString = false;
    $escape = false;

    for ($i = 0; $i < $len; $i++) {
        $char = $text[$i];

        if ($inString) {
            if ($escape) {
                $escape = false;
                continue;
            }
            if ($char === '\\') {
                $escape = true;
                continue;
            }
            if ($char === '"') {
                $inString = false;
            }
            continue;
        }

        if ($char === '"') {
            $inString = true;
            continue;
        }

        if ($char === '{') {
            $depth++;
            continue;
        }

        if ($char === '}') {
            $depth--;
            if ($depth === 0) {
                return substr($text, 0, $i + 1);
            }
        }
    }

    return null;
}

function yahooExtractAppMainJson($html) {
    if (!preg_match('/root\.App\.main\s*=\s*/', $html, $match, PREG_OFFSET_CAPTURE)) {
        return null;
    }

    $jsonStart = $match[0][1] + strlen($match[0][0]);
    $jsonText = yahooExtractJsonObject(substr($html, $jsonStart));
    if (!$jsonText) {
        return null;
    }

    $decoded = json_decode($jsonText, true);
    return is_array($decoded) ? $decoded : null;
}

function yahooNumericField($value) {
    if (is_array($value)) {
        if (isset($value['raw']) && is_numeric($value['raw'])) {
            return (float) $value['raw'];
        }
        return null;
    }
    return is_numeric($value) ? (float) $value : null;
}

function yahooParseHistoricalPriceStore($appMain) {
    $prices = $appMain['context']['dispatcher']['stores']['HistoricalPriceStore']['prices'] ?? null;
    if (!is_array($prices)) {
        return [];
    }

    $history = [];
    foreach ($prices as $row) {
        if (!is_array($row) || !isset($row['date'])) {
            continue;
        }
        if (($row['type'] ?? '') === 'DIVIDEND') {
            continue;
        }

        $close = yahooNumericField($row['close'] ?? null);
        if ($close === null) {
            continue;
        }

        $history[] = [
            'date' => gmdate('Y-m-d', (int) $row['date']),
            'eod' => $close,
        ];
    }

    usort($history, function ($a, $b) {
        return strcmp($a['date'], $b['date']);
    });

    return $history;
}

function yahooParseChartApiResponse($payload) {
    $decoded = is_array($payload) ? $payload : json_decode($payload, true);
    if (!is_array($decoded)) {
        return [];
    }

    $result = $decoded['chart']['result'][0] ?? null;
    if (!is_array($result)) {
        return [];
    }

    $timestamps = $result['timestamp'] ?? [];
    $closes = $result['indicators']['quote'][0]['close'] ?? [];
    if (!is_array($timestamps) || !is_array($closes)) {
        return [];
    }

    $history = [];
    $count = min(count($timestamps), count($closes));
    for ($i = 0; $i < $count; $i++) {
        $close = $closes[$i];
        if ($close === null || !is_numeric($close)) {
            continue;
        }
        $history[] = [
            'date' => gmdate('Y-m-d', (int) $timestamps[$i]),
            'eod' => (float) $close,
        ];
    }

    return $history;
}

function scrapeYahooHistoryFromPage($symbol, $period1, $period2) {
    $url = yahooHistoryPageUrl($symbol, $period1, $period2);
    $html = yahooHttpGet($url);
    if ($html === false || yahooIsBlockedHistoryResponse($html)) {
        return [];
    }

    $appMain = yahooExtractAppMainJson($html);
    if (!$appMain) {
        return [];
    }

    return yahooParseHistoricalPriceStore($appMain);
}

function scrapeYahooHistoryFromChartApi($symbol, $period1, $period2) {
    $urls = [];
    foreach (['query1', 'query2'] as $host) {
        $urls[] = yahooChartApiUrl($symbol, $period1, $period2, $host);
    }
    foreach (['query1', 'query2'] as $host) {
        $urls[] = yahooChartApiUrlByRange($symbol, '5y', $host);
    }

    foreach ($urls as $url) {
        $payload = yahooHttpGet($url, false);
        if ($payload === false) {
            continue;
        }

        $history = yahooParseChartApiResponse($payload);
        if (count($history) > 0) {
            return yahooFilterHistoryByPeriod($history, $period1, $period2);
        }
    }

    return [];
}

/**
 * @return array<int, array{date: string, eod: float}>
 */
function scrapeYahooHistory($symbol, $period1 = null, $period2 = null) {
    if (!$symbol) {
        return [];
    }

    $period1 = $period1 ?? YAHOO_HISTORY_PERIOD1_DEFAULT;
    $period2 = $period2 ?? time();

    // Chart API first: reliable JSON and avoids an extra HTML request that often triggers 429s.
    $history = scrapeYahooHistoryFromChartApi($symbol, $period1, $period2);
    if (count($history) > 0) {
        return $history;
    }

    return scrapeYahooHistoryFromPage($symbol, $period1, $period2);
}

?>
