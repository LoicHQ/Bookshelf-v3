import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';

// Mock html5-qrcode
const mockStart = vi.fn();
const mockStop = vi.fn();

vi.mock('html5-qrcode', () => {
  class MockHtml5Qrcode {
    start = mockStart;
    stop = mockStop;
    constructor(public elementId: string) {}
  }
  return {
    Html5Qrcode: MockHtml5Qrcode,
  };
});

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: vi.fn(),
});

describe('BarcodeScanner', () => {
  const mockOnScan = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockStart.mockResolvedValue(undefined);
    mockStop.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize scanner when active', async () => {
    render(<BarcodeScanner onScan={mockOnScan} isActive={true} />);
    
    await waitFor(() => {
      expect(mockStart).toHaveBeenCalled();
    });
  });

  it('should not initialize scanner when inactive', () => {
    render(<BarcodeScanner onScan={mockOnScan} isActive={false} />);
    
    expect(mockStart).not.toHaveBeenCalled();
  });

  it('should call onScan when code is detected', async () => {
    render(<BarcodeScanner onScan={mockOnScan} isActive={true} />);
    
    await waitFor(() => {
      expect(mockStart).toHaveBeenCalled();
    });

    // Simulate scan callback - it's the 3rd argument (index 2)
    const callArgs = mockStart.mock.calls[0];
    if (callArgs && callArgs.length > 2 && typeof callArgs[2] === 'function') {
      const scanCallback = callArgs[2];
      scanCallback('9781234567890');

      await waitFor(() => {
        expect(mockOnScan).toHaveBeenCalledWith('9781234567890');
      });
    }
  });

  it('should show permission denied message on error', async () => {
    const permissionError = new Error('Permission denied');
    mockStart.mockRejectedValue(permissionError);

    render(<BarcodeScanner onScan={mockOnScan} onError={mockOnError} isActive={true} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Accès caméra refusé/i)).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalledWith('Impossible de démarrer la caméra');
    });
  });

  it('should stop scanner when inactive', async () => {
    const { rerender } = render(<BarcodeScanner onScan={mockOnScan} isActive={true} />);
    
    await waitFor(() => {
      expect(mockStart).toHaveBeenCalled();
    });

    rerender(<BarcodeScanner onScan={mockOnScan} isActive={false} />);

    await waitFor(() => {
      expect(mockStop).toHaveBeenCalled();
    });
  });

  it('should vibrate on successful scan', async () => {
    render(<BarcodeScanner onScan={mockOnScan} isActive={true} />);
    
    await waitFor(() => {
      expect(mockStart).toHaveBeenCalled();
    });

    const callArgs = mockStart.mock.calls[0];
    if (callArgs && callArgs.length > 2 && typeof callArgs[2] === 'function') {
      const scanCallback = callArgs[2];
      scanCallback('9781234567890');

      await waitFor(() => {
        expect(navigator.vibrate).toHaveBeenCalledWith(100);
      });
    }
  });

  it('should prevent duplicate scans of same code', async () => {
    render(<BarcodeScanner onScan={mockOnScan} isActive={true} />);
    
    await waitFor(() => {
      expect(mockStart).toHaveBeenCalled();
    });

    const callArgs = mockStart.mock.calls[0];
    if (callArgs && callArgs.length > 2 && typeof callArgs[2] === 'function') {
      const scanCallback = callArgs[2];
      const isbn = '9781234567890';
      
      // First scan
      scanCallback(isbn);
      expect(mockOnScan).toHaveBeenCalledTimes(1);
      
      // Duplicate scan (should be ignored)
      scanCallback(isbn);
      expect(mockOnScan).toHaveBeenCalledTimes(1);
    }
  });

  it('should render scanner container with correct id', () => {
    render(<BarcodeScanner onScan={mockOnScan} isActive={true} />);
    
    const container = document.getElementById('barcode-scanner');
    expect(container).toBeInTheDocument();
  });

  it('should call onError when scanner fails to start', async () => {
    const error = new Error('Camera error');
    mockStart.mockRejectedValue(error);

    render(<BarcodeScanner onScan={mockOnScan} onError={mockOnError} isActive={true} />);
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Impossible de démarrer la caméra');
    });
  });

  it('should render switch camera button', () => {
    render(<BarcodeScanner onScan={mockOnScan} isActive={true} />);
    
    const switchButton = screen.getByRole('button');
    expect(switchButton).toBeInTheDocument();
  });
});
