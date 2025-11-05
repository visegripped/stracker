# PHP Unit Tests

This directory contains unit tests for the stracker PHP codebase using PHPUnit.

## Setup

1. Install dependencies:
```bash
cd doc_root/includes
composer install
```

This will install PHPUnit and other dependencies.

## Running Tests

### Run all tests:
```bash
cd doc_root/includes
./vendor/bin/phpunit
```

Or use the Composer script:
```bash
cd doc_root/includes
composer test
```

### Run specific test suite:
```bash
./vendor/bin/phpunit tests/Unit
```

### Run specific test file:
```bash
./vendor/bin/phpunit tests/Unit/ValidationTest.php
```

### Run with coverage report:
```bash
./vendor/bin/phpunit --coverage-html coverage
```

Then open `coverage/index.html` in your browser.

## Test Structure

- `tests/Unit/` - Unit tests for individual functions and classes
- `tests/Integration/` - Integration tests for database and API interactions

## Writing New Tests

1. Create a test class that extends `PHPUnit\Framework\TestCase`
2. Name test methods with `test` prefix or use `@test` annotation
3. Use PHPUnit assertions like `assertTrue()`, `assertEquals()`, etc.

Example:
```php
<?php
use PHPUnit\Framework\TestCase;

class MyFunctionTest extends TestCase
{
    public function testMyFunctionReturnsExpectedValue(): void
    {
        $result = myFunction('input');
        $this->assertEquals('expected', $result);
    }
}
```

## Adding Tests to CI/CD

You can add the test command to your deployment scripts:
```bash
cd doc_root/includes && composer test
```

