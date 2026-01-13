import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '@/components/library/SearchBar';
import { BookGrid } from '@/components/library/BookGrid';
import type { UserBook } from '@/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/library',
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

describe('SearchBar', () => {
  const mockOnChange = vi.fn();
  const mockOnFilterClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText(/rechercher/i);
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when typing', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText(/rechercher/i);
    fireEvent.change(input, { target: { value: 'test query' } });

    expect(mockOnChange).toHaveBeenCalledWith('test query');
  });

  it('should show clear button when value is not empty', () => {
    render(<SearchBar value="test" onChange={mockOnChange} />);

    const buttons = screen.getAllByRole('button');
    const clearButton = buttons.find((btn) => btn.querySelector('.lucide-x'));
    expect(clearButton).toBeInTheDocument();
  });

  it('should clear input when clear button is clicked', () => {
    render(<SearchBar value="test" onChange={mockOnChange} />);

    const buttons = screen.getAllByRole('button');
    const clearButton = buttons.find((btn) => btn.querySelector('.lucide-x'));
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(mockOnChange).toHaveBeenCalledWith('');
    }
  });

  it('should call onFilterClick when filter button is clicked', () => {
    render(<SearchBar value="" onChange={mockOnChange} onFilterClick={mockOnFilterClick} />);

    const buttons = screen.getAllByRole('button');
    const filterButton = buttons.find((btn) => btn.querySelector('.lucide-sliders-horizontal'));
    if (filterButton) {
      fireEvent.click(filterButton);
      expect(mockOnFilterClick).toHaveBeenCalled();
    }
  });

  it('should not show filter button when showFilter is false', () => {
    const { container } = render(<SearchBar value="" onChange={mockOnChange} showFilter={false} />);

    const filterButton = container.querySelector('.lucide-sliders-horizontal');
    expect(filterButton).not.toBeInTheDocument();
  });

  it('should apply custom placeholder', () => {
    render(<SearchBar value="" onChange={mockOnChange} placeholder="Custom placeholder" />);

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });
});

describe('BookGrid', () => {
  const mockBook: UserBook = {
    id: 'book-1',
    userId: 'user-1',
    bookId: 'book-id-1',
    status: 'TO_READ',
    favorite: false,
    isWishlist: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    book: {
      id: 'book-id-1',
      title: 'Test Book',
      authors: ['Test Author'],
      categories: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state when no books', () => {
    render(<BookGrid books={[]} viewMode="grid" />);

    expect(screen.getByText(/Aucun livre trouvé/i)).toBeInTheDocument();
  });

  it('should render books in grid mode', () => {
    render(<BookGrid books={[mockBook]} viewMode="grid" />);

    expect(screen.getByText('Test Book')).toBeInTheDocument();
  });

  it('should render books in list mode', () => {
    render(<BookGrid books={[mockBook]} viewMode="list" />);

    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('should show status badge in list mode', () => {
    const readingBook: UserBook = {
      ...mockBook,
      status: 'READING',
    };

    render(<BookGrid books={[readingBook]} viewMode="list" />);

    expect(screen.getByText(/En cours/i)).toBeInTheDocument();
  });

  it('should show favorite star when book is favorited', () => {
    const favoritedBook: UserBook = {
      ...mockBook,
      favorite: true,
    };

    const { container } = render(<BookGrid books={[favoritedBook]} viewMode="grid" />);

    const stars = container.querySelectorAll('.lucide-star');
    expect(stars.length).toBeGreaterThan(0);
  });

  it('should show rating in list mode', () => {
    const ratedBook: UserBook = {
      ...mockBook,
      rating: 4,
    };

    const { container } = render(<BookGrid books={[ratedBook]} viewMode="list" />);

    const stars = container.querySelectorAll('.lucide-star');
    expect(stars.length).toBeGreaterThan(0);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should link to book detail page', () => {
    render(<BookGrid books={[mockBook]} viewMode="grid" />);

    const link = screen.getByText('Test Book').closest('a');
    expect(link).toHaveAttribute('href', '/book/book-1');
  });

  it('should show placeholder when book has no cover', () => {
    const bookWithoutCover: UserBook = {
      ...mockBook,
      book: {
        ...mockBook.book!,
        coverImage: undefined,
        thumbnail: undefined,
      },
    };

    const { container } = render(<BookGrid books={[bookWithoutCover]} viewMode="grid" />);

    const placeholder = container.querySelector('.lucide-book-marked');
    expect(placeholder).toBeInTheDocument();
  });

  it('should show status indicator dot in grid mode', () => {
    const readingBook: UserBook = {
      ...mockBook,
      status: 'READING',
    };

    const { container } = render(<BookGrid books={[readingBook]} viewMode="grid" />);

    const statusDot = container.querySelector('.bg-warning');
    expect(statusDot).toBeInTheDocument();
  });

  it('should handle multiple books', () => {
    const books: UserBook[] = [
      mockBook,
      {
        ...mockBook,
        id: 'book-2',
        book: {
          ...mockBook.book!,
          title: 'Second Book',
        },
      },
    ];

    render(<BookGrid books={books} viewMode="grid" />);

    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('Second Book')).toBeInTheDocument();
  });
});
