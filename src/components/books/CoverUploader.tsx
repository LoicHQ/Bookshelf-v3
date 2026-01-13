/**
 * @agent frontend-ux-ui
 * Composant d'upload de couverture avec scan caméra et import fichier
 */
'use client';

import { useState, useRef } from 'react';
import { Upload, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface CoverUploaderProps {
  onUploadComplete: (url: string) => void;
  className?: string;
}

export function CoverUploader({ onUploadComplete, className }: CoverUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    setUploading(true);

    try {
      // Créer preview local
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Upload vers Cloudinary
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

      if (!cloudName || !uploadPreset) {
        console.warn('Cloudinary not configured, using local preview only');
        // Utiliser le preview local comme URL si Cloudinary n'est pas configuré
        onUploadComplete(URL.createObjectURL(file));
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        onUploadComplete(data.secure_url);
      } else {
        throw new Error('Upload failed: no secure_url returned');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        className="hidden"
      />

      {preview ? (
        <div className="relative mx-auto aspect-[2/3] w-full max-w-[200px]">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="border-border rounded-xl border-2 object-cover"
          />
        </div>
      ) : (
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading}
            className="h-24 flex-1 flex-col gap-2"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Camera className="h-6 w-6" />
                <span className="text-sm">Scanner</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-24 flex-1 flex-col gap-2"
          >
            <Upload className="h-6 w-6" />
            <span className="text-sm">Importer</span>
          </Button>
        </div>
      )}

      <p className="text-muted-foreground text-center text-xs">
        Scannez la couverture ou importez depuis vos fichiers
      </p>
    </div>
  );
}
