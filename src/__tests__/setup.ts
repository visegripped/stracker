import '@testing-library/jest-dom';

// Suppress server-only import errors in test environment
vi.mock('server-only', () => ({}));
