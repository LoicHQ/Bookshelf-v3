/**
 * @agent tests
 * Tests unitaires pour le composant SessionProvider
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { SessionProvider } from '@/components/providers/SessionProvider';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}));

describe('SessionProvider', () => {
  it('should render children', () => {
    const { getByTestId, getByText } = render(
      <SessionProvider>
        <div>Test Content</div>
      </SessionProvider>
    );

    expect(getByTestId('session-provider')).toBeInTheDocument();
    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('should wrap children with NextAuth SessionProvider', () => {
    const { getByTestId } = render(
      <SessionProvider>
        <div>Content</div>
      </SessionProvider>
    );

    // Should render the mocked SessionProvider
    expect(getByTestId('session-provider')).toBeInTheDocument();
  });
});
