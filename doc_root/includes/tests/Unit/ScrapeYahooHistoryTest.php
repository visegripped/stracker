<?php

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../../stracker/scrapeYahooHistory.php';

class ScrapeYahooHistoryTest extends TestCase
{
    public function testParseHistoricalPriceStoreFromFixture(): void
    {
        $appMain = [
            'context' => [
                'dispatcher' => [
                    'stores' => [
                        'HistoricalPriceStore' => [
                            'prices' => [
                                [
                                    'date' => 1672756200,
                                    'close' => 74.03,
                                ],
                                [
                                    'date' => 1672842600,
                                    'type' => 'DIVIDEND',
                                    'amount' => 0.5,
                                ],
                                [
                                    'date' => 1672929000,
                                    'close' => ['raw' => 75.73],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $history = yahooParseHistoricalPriceStore($appMain);

        $this->assertCount(2, $history);
        $this->assertSame('2023-01-03', $history[0]['date']);
        $this->assertSame(74.03, $history[0]['eod']);
        $this->assertSame('2023-01-05', $history[1]['date']);
        $this->assertSame(75.73, $history[1]['eod']);
    }

    public function testParseChartApiResponseFromFixture(): void
    {
        $payload = [
            'chart' => [
                'result' => [
                    [
                        'timestamp' => [1672756200, 1672842600],
                        'indicators' => [
                            'quote' => [
                                ['close' => [74.03, null]],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $history = yahooParseChartApiResponse($payload);

        $this->assertCount(1, $history);
        $this->assertSame('2023-01-03', $history[0]['date']);
        $this->assertSame(74.03, $history[0]['eod']);
    }

    public function testExtractAppMainJsonFromInlineScript(): void
    {
        $html = <<<'HTML'
<html><body>
<script>root.App.main = {"context":{"dispatcher":{"stores":{"HistoricalPriceStore":{"prices":[{"date":1672756200,"close":80.1}]}}}}};
</script>
</body></html>
HTML;

        $appMain = yahooExtractAppMainJson($html);

        $this->assertIsArray($appMain);
        $history = yahooParseHistoricalPriceStore($appMain);
        $this->assertCount(1, $history);
        $this->assertSame(80.1, $history[0]['eod']);
    }

    public function testIsBlockedHistoryResponse(): void
    {
        $this->assertTrue(yahooIsBlockedHistoryResponse('<html>Content is currently unavailable</html>'));
        $this->assertTrue(yahooIsBlockedHistoryResponse('short'));
        $this->assertFalse(yahooIsBlockedHistoryResponse(str_repeat('x', 1001) . 'root.App.main'));
    }
}
