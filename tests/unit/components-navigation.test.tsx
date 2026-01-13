import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TabBar } from '@/components/navigation/TabBar';
import { AppWrapper } from '@/components/navigation/AppWrapper';

// Mock next/navigation
const mockPathname = vi.fn(() => '/dashboard');
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('TabBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/dashboard');
  });

  it('should render all navigation tabs', () => {
    const { container } = render(<TabBar />);
    
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Bibliothèque')).toBeInTheDocument();
    // Scanner is an icon-only button, check by href
    expect(container.querySelector('a[href="/scanner"]')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();
  });

  it('should highlight active tab', () => {
    mockPathname.mockReturnValue('/dashboard');
    render(<TabBar />);
    
    const activeTab = screen.getByText('Accueil').closest('a');
    expect(activeTab).toHaveClass('active');
  });

  it('should not render on login page', () => {
    mockPathname.mockReturnValue('/login');
    const { container } = render(<TabBar />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should not render on register page', () => {
    mockPathname.mockReturnValue('/register');
    const { container } = render(<TabBar />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should render scanner button with special styling', () => {
    mockPathname.mockReturnValue('/scanner');
    const { container } = render(<TabBar />);
    
    const scannerLink = container.querySelector('a[href="/scanner"]');
    expect(scannerLink?.querySelector('.tab-item-scanner-button')).toBeInTheDocument();
  });

  it('should highlight library tab when on library page', () => {
    mockPathname.mockReturnValue('/library');
    render(<TabBar />);
    
    const activeTab = screen.getByText('Bibliothèque').closest('a');
    expect(activeTab).toHaveClass('active');
  });
});

describe('AppWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/dashboard');
  });

  it('should render children and TabBar on normal pages', () => {
    const { getByText } = render(
      <AppWrapper>
        <div>Test Content</div>
      </AppWrapper>
    );
    
    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('should not render TabBar on login page', () => {
    mockPathname.mockReturnValue('/login');
    
    const { getByText } = render(
      <AppWrapper>
        <div>Login Content</div>
      </AppWrapper>
    );
    
    expect(getByText('Login Content')).toBeInTheDocument();
  });

  it('should add padding bottom on pages with navigation', () => {
    mockPathname.mockReturnValue('/dashboard');
    
    const { container } = render(
      <AppWrapper>
        <div>Content</div>
      </AppWrapper>
    );
    
    const main = container.querySelector('main');
    expect(main).toHaveClass('pb-20');
  });

  it('should not add padding bottom on login page', () => {
    mockPathname.mockReturnValue('/login');
    
    const { container } = render(
      <AppWrapper>
        <div>Content</div>
      </AppWrapper>
    );
    
    const main = container.querySelector('main');
    expect(main).not.toHaveClass('pb-20');
  });
});
