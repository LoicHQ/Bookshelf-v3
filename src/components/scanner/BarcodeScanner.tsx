'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, SwitchCamera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
  isActive: boolean;
}

export function BarcodeScanner({ onScan, onError, isActive }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const lastScannedRef = useRef<string>('');
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startScanner = useCallback(async () => {
    if (scannerRef.current || !isActive) return;

    try {
      const scanner = new Html5Qrcode('barcode-scanner');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode },
        {
          fps: 10,
          qrbox: { width: 280, height: 150 },
          aspectRatio: 1.777,
        },
        (decodedText) => {
          // Éviter les scans multiples du même code
          if (decodedText === lastScannedRef.current) return;

          lastScannedRef.current = decodedText;

          // Vibration feedback
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }

          onScan(decodedText);

          // Reset après 3 secondes
          if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
          }
          scanTimeoutRef.current = setTimeout(() => {
            lastScannedRef.current = '';
          }, 3000);
        },
        () => {
          // Ignore scan errors (frame without barcode)
        }
      );

      setIsScanning(true);
      setPermissionDenied(false);
    } catch (err) {
      console.error('Scanner error:', err);
      if (err instanceof Error && err.message.includes('Permission')) {
        setPermissionDenied(true);
      }
      onError?.('Impossible de démarrer la caméra');
    }
  }, [isActive, facingMode, onScan, onError]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Stop scanner error:', err);
      }
    }
  }, [isScanning]);

  const switchCamera = async () => {
    await stopScanner();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  useEffect(() => {
    if (isActive) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [isActive, startScanner, stopScanner]);

  // Restart scanner when facingMode changes
  useEffect(() => {
    if (isActive && !isScanning) {
      startScanner();
    }
  }, [facingMode, isActive, isScanning, startScanner]);

  if (permissionDenied) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="bg-destructive/10 mb-4 flex h-20 w-20 items-center justify-center rounded-full">
          <CameraOff className="text-destructive h-10 w-10" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Accès caméra refusé</h3>
        <p className="text-muted-foreground max-w-xs text-sm">
          Autorisez l&apos;accès à la caméra dans les paramètres de votre navigateur pour scanner
          des codes-barres.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Scanner Container */}
      <div id="barcode-scanner" className="h-full w-full" style={{ minHeight: '300px' }} />

      {/* Scanner Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0"
          >
            {/* Darkened corners */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Scan area cutout */}
            <div
              className="absolute top-1/2 left-1/2 h-36 w-72 -translate-x-1/2 -translate-y-1/2 bg-transparent"
              style={{
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Corner brackets */}
              <div className="border-primary absolute top-0 left-0 h-8 w-8 rounded-tl-lg border-t-4 border-l-4" />
              <div className="border-primary absolute top-0 right-0 h-8 w-8 rounded-tr-lg border-t-4 border-r-4" />
              <div className="border-primary absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-4 border-l-4" />
              <div className="border-primary absolute right-0 bottom-0 h-8 w-8 rounded-br-lg border-r-4 border-b-4" />

              {/* Scanning line animation */}
              <motion.div
                className="bg-primary absolute right-2 left-2 h-0.5 shadow-[0_0_8px_rgba(0,122,255,0.8)]"
                animate={{
                  top: ['10%', '90%', '10%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="pointer-events-auto absolute right-0 bottom-6 left-0 flex justify-center gap-4">
        <Button
          variant="secondary"
          size="icon"
          className="backdrop-blur-ios h-12 w-12 rounded-full"
          onClick={switchCamera}
        >
          <SwitchCamera className="h-5 w-5" />
        </Button>
      </div>

      {/* Loading indicator */}
      {!isScanning && isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center">
            <Camera className="mx-auto mb-3 h-12 w-12 animate-pulse text-white/50" />
            <p className="text-sm text-white/70">Démarrage de la caméra...</p>
          </div>
        </div>
      )}
    </div>
  );
}
