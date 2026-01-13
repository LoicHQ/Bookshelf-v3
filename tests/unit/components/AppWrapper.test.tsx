/**
 * @agent tests
 * Tests unitaires pour le composant AppWrapper
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppWrapper } from '@/components/navigation/AppWrapper';

// Mock next/navigation
const mockPathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('AppWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children', () => {
    mockPathname.mockReturnValue('/dashboard');
    render(
      <AppWrapper>
        <div>Test Content</div>
      </AppWrapper>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should show bottom nav on non-login pages', () => {
    mockPathname.mockReturnValue('/dashboard');
    const { container } = render(
      <AppWrapper>
        <div>Content</div>
      </AppWrapper>
    );

    // Bottom nav should be rendered (check for padding-bottom class)
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('pb-24');
  });

  it('should hide bottom nav on login page', () => {
    mockPathname.mockReturnValue('/login');
    const { container } = render(
      <AppWrapper>
        <div>Content</div>
      </AppWrapper>
    );

    // Bottom nav should not be rendered (no padding-bottom)
    const wrapper = container.firstChild;
    expect(wrapper).not.toHaveClass('pb-24');
  });

  it('should show bottom nav on library page', () => {
    mockPathname.mockReturnValue('/library');
    const { container } = render(
      <AppWrapper>
        <div>Content</div>
      </AppWrapper>
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('pb-24');
  });
});
