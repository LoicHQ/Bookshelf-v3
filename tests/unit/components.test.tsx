import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { BottomNav } from '@/components/navigation/BottomNav';
import { BookCard } from '@/components/books/BookCard';
import type { BookSearchResult, UserBook } from '@/types';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signOut: vi.fn(),
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      refresh: mockRefresh,
      replace: vi.fn(),
      back: vi.fn(),
    }),
    usePathname: () => '/dashboard',
  };
});

describe('Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LogoutButton', () => {
    it('should render logout button with text', () => {
      render(<LogoutButton />);
      expect(screen.getByText('Se déconnecter')).toBeInTheDocument();
    });

    it('should call signOut and redirect on click', async () => {
      const { signOut } = await import('next-auth/react');
      vi.mocked(signOut).mockResolvedValue(undefined);
      render(<LogoutButton />);

      const button = screen.getByText('Se déconnecter');
      fireEvent.click(button);

      await waitFor(() => {
        expect(signOut).toHaveBeenCalledWith({ redirect: false });
        expect(mockPush).toHaveBeenCalledWith('/login');
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it('should render without icon when showIcon is false', () => {
      render(<LogoutButton showIcon={false} />);
      const button = screen.getByText('Se déconnecter');
      expect(button.querySelector('svg')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<LogoutButton className="custom-class" />);
      const button = screen.getByText('Se déconnecter');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('BottomNav', () => {
    it('should render navigation items', () => {
      render(<BottomNav />);
      expect(screen.getByText('Accueil')).toBeInTheDocument();
      expect(screen.getByText('Bibliothèque')).toBeInTheDocument();
      expect(screen.getByText('Ajouter')).toBeInTheDocument();
    });

    it('should highlight active route', () => {
      render(<BottomNav />);
      const activeLink = screen.getByText('Accueil').closest('a');
      expect(activeLink).toHaveClass('text-primary');
    });
  });

  describe('BookCard', () => {
    const mockBook: BookSearchResult = {
      id: 'test-id',
      title: 'Test Book',
      authors: ['Test Author'],
      description: 'Test description',
      isbn: '1234567890',
      isbn13: '9781234567890',
    };

    it('should render book information', () => {
      render(<BookCard book={mockBook} />);
      expect(screen.getByText('Test Book')).toBeInTheDocument();
      expect(screen.getByText('Test Author')).toBeInTheDocument();
    });

    it('should render user book with status', () => {
      const mockUserBook: UserBook = {
        id: 'user-book-id',
        userId: 'user-id',
        bookId: 'book-id',
        status: 'TO_READ',
        rating: 4,
        favorite: false,
        isWishlist: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        book: mockBook,
      };

      render(<BookCard book={mockUserBook} showStatus />);
      expect(screen.getByText('À lire')).toBeInTheDocument();
    });

    it('should not render status when showStatus is false', () => {
      const mockUserBook: UserBook = {
        id: 'user-book-id',
        userId: 'user-id',
        bookId: 'book-id',
        status: 'TO_READ',
        favorite: false,
        isWishlist: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        book: mockBook,
      };

      render(<BookCard book={mockUserBook} showStatus={false} />);
      expect(screen.queryByText('À lire')).not.toBeInTheDocument();
    });

    it('should render rating when provided', () => {
      const mockUserBook: UserBook = {
        id: 'user-book-id',
        userId: 'user-id',
        bookId: 'book-id',
        status: 'TO_READ',
        rating: 4,
        favorite: false,
        isWishlist: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        book: mockBook,
      };

      const { container } = render(<BookCard book={mockUserBook} showRating />);
      // Les étoiles devraient être présentes (svg avec class lucide-star)
      const stars = container.querySelectorAll('.lucide-star');
      expect(stars.length).toBe(5);
    });

    it('should handle click when onClick is provided', () => {
      const mockOnClick = vi.fn();
      const { container } = render(<BookCard book={mockBook} onClick={mockOnClick} />);
      
      const card = container.querySelector('[class*="cursor-pointer"]');
      expect(card).toBeTruthy();
      if (card) {
        fireEvent.click(card);
        expect(mockOnClick).toHaveBeenCalled();
      }
    });
  });
});
