<?php

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../../stracker/validation.php';

class ValidationTest extends TestCase
{
    /**
     * Test isValidSymbol function
     */
    public function testIsValidSymbolWithValidSymbol(): void
    {
        $this->assertTrue(isValidSymbol('AAPL'));
        $this->assertTrue(isValidSymbol('INTU'));
        $this->assertTrue(isValidSymbol('A'));
    }

    public function testIsValidSymbolWithInvalidInputs(): void
    {
        $this->assertFalse(isValidSymbol(''));
        $this->assertFalse(isValidSymbol(null));
        $this->assertFalse(isValidSymbol('AAPL123')); // Contains numbers
        $this->assertFalse(isValidSymbol('TOOLONGSYMBOL')); // Too long
        $this->assertFalse(isValidSymbol('AA-PL')); // Contains non-alpha
        $this->assertFalse(isValidSymbol('aapl')); // Lowercase (if you want only uppercase)
    }

    /**
     * Test isValidDate function
     */
    public function testIsValidDateWithValidDates(): void
    {
        $this->assertTrue(isValidDate('20240101'));
        $this->assertTrue(isValidDate('20231225'));
        $this->assertTrue(isValidDate('12345678')); // 8 digits
    }

    public function testIsValidDateWithInvalidInputs(): void
    {
        $this->assertFalse(isValidDate(''));
        $this->assertFalse(isValidDate(null));
        $this->assertFalse(isValidDate('2024-01-01')); // Contains dashes
        $this->assertFalse(isValidDate('202401012')); // Too long (9 digits)
        $this->assertFalse(isValidDate('2024010')); // Too short
        $this->assertFalse(isValidDate('2024ABCD')); // Contains letters
    }

    /**
     * Test areValidDates function
     */
    public function testAreValidDatesWithValidInputs(): void
    {
        $this->assertTrue(areValidDates('20240101', '20240131'));
        $this->assertTrue(areValidDates('20231201', '20231231'));
    }

    public function testAreValidDatesWithInvalidInputs(): void
    {
        $this->assertFalse(areValidDates('20240101', ''));
        $this->assertFalse(areValidDates('', '20240131'));
        $this->assertFalse(areValidDates('invalid', '20240131'));
        $this->assertFalse(areValidDates('20240101', 'invalid'));
    }

    /**
     * Test isValidEmail function
     */
    public function testIsValidEmailWithValidEmails(): void
    {
        $this->assertNotFalse(isValidEmail('user@example.com'));
        $this->assertNotFalse(isValidEmail('test.email+tag@domain.co.uk'));
        $this->assertNotFalse(isValidEmail('simple@example.com'));
    }

    public function testIsValidEmailWithInvalidInputs(): void
    {
        $this->assertFalse(isValidEmail(''));
        $this->assertFalse(isValidEmail('notanemail'));
        $this->assertFalse(isValidEmail('@example.com'));
        $this->assertFalse(isValidEmail('user@'));
        $this->assertFalse(isValidEmail('user@example'));
    }

    /**
     * Test isValidNumber function
     */
    public function testIsValidNumberWithValidNumbers(): void
    {
        $this->assertTrue(isValidNumber('123'));
        $this->assertTrue(isValidNumber('0'));
        $this->assertTrue(isValidNumber('999999'));
    }

    public function testIsValidNumberWithInvalidInputs(): void
    {
        $this->assertFalse(isValidNumber(''));
        $this->assertFalse(isValidNumber('123.45')); // Contains decimal point
        $this->assertFalse(isValidNumber('-123')); // Contains minus sign
        $this->assertFalse(isValidNumber('123abc')); // Contains letters
        $this->assertFalse(isValidNumber(' 123 ')); // Contains spaces
    }
}

