<?php

use PHPUnit\Framework\TestCase;

// Mock alerts.php functions if they don't exist
if (!function_exists('alertsForDay')) {
    function alertsForDay($data) {
        // Return empty array for testing
        return [];
    }
}

require_once __DIR__ . '/../../stracker/getDataFromHistory.php';

class GetDataFromHistoryTest extends TestCase
{
    /**
     * Test calcMA function
     */
    public function testCalcMAWithValidData(): void
    {
        // Test with array of 5 values
        $data = [10.0, 20.0, 30.0, 40.0, 50.0];
        $result = calcMA($data, 5);
        $expected = round((10 + 20 + 30 + 40 + 50) / 5, 2);
        $this->assertEquals($expected, $result);
        
        // Test with array larger than n
        $data = [10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0];
        $result = calcMA($data, 5);
        $expected = round((30 + 40 + 50 + 60 + 70) / 5, 2); // Last 5 values
        $this->assertEquals($expected, $result);
    }

    public function testCalcMAWithSmallArray(): void
    {
        $data = [10.0, 20.0];
        $result = calcMA($data, 5);
        // Should calculate with available values (last 2)
        $expected = round((10 + 20) / 5, 2);
        $this->assertEquals($expected, $result);
    }

    /**
     * Test getDataFromHistory function
     */
    public function testGetDataFromHistoryWithEmptyArray(): void
    {
        $result = getDataFromHistory([]);
        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    public function testGetDataFromHistoryWithValidData(): void
    {
        // Create mock history data
        $history = [];
        for ($i = 0; $i < 60; $i++) {
            $history[] = [
                'date' => '202401' . str_pad($i + 1, 2, '0', STR_PAD_LEFT),
                'eod' => 100.0 + ($i * 0.5) // Incremental prices
            ];
        }

        $result = getDataFromHistory($history);
        
        $this->assertIsArray($result);
        $this->assertCount(60, $result);
        
        // Check structure of first item
        $firstItem = $result[0];
        $this->assertArrayHasKey('date', $firstItem);
        $this->assertArrayHasKey('eod', $firstItem);
        $this->assertArrayHasKey('delta', $firstItem);
        $this->assertArrayHasKey('MA20', $firstItem);
        $this->assertArrayHasKey('MA50', $firstItem);
    }

    public function testGetDataFromHistoryWithNonNumericEod(): void
    {
        $history = [
            ['date' => '20240101', 'eod' => 'invalid'],
            ['date' => '20240102', 'eod' => 100.0],
            ['date' => '20240103', 'eod' => null],
        ];

        $result = getDataFromHistory($history);
        
        // Should only include valid numeric EOD values
        $this->assertIsArray($result);
        $this->assertCount(1, $result); // Only one valid entry
        $this->assertEquals(100.0, $result[0]['eod']);
    }

    public function testGetDataFromHistoryCalculatesMA20After20Days(): void
    {
        $history = [];
        for ($i = 0; $i < 25; $i++) {
            $history[] = [
                'date' => '202401' . str_pad($i + 1, 2, '0', STR_PAD_LEFT),
                'eod' => 100.0 // Constant price
            ];
        }

        $result = getDataFromHistory($history);
        
        // First 20 items should have MA20 = 0
        $this->assertEquals(0, $result[0]['MA20']);
        $this->assertEquals(0, $result[20]['MA20']);
        
        // Item 21 (index 21) should have MA20 calculated
        $this->assertNotEquals(0, $result[21]['MA20']);
    }

    public function testGetDataFromHistoryCalculatesMA50After50Days(): void
    {
        $history = [];
        for ($i = 0; $i < 55; $i++) {
            $history[] = [
                'date' => '202401' . str_pad($i + 1, 2, '0', STR_PAD_LEFT),
                'eod' => 100.0 // Constant price
            ];
        }

        $result = getDataFromHistory($history);
        
        // First 50 items should have MA50 = 0
        $this->assertEquals(0, $result[0]['MA50']);
        $this->assertEquals(0, $result[50]['MA50']);
        
        // Item 51 (index 51) should have MA50 calculated
        $this->assertNotEquals(0, $result[51]['MA50']);
    }
}
