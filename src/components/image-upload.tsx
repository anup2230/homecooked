"use client";

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type UploadFolder = 'dishes' | 'avatars';

interface ImageUploadProps {
  /** Current image URL (for showing existing image) */
  value?: string | null;
  /** Called with the new public URL after a successful upload */
  onUpload: (url: string) => void;
  /** Called when the image is removed */
  onRemove?: () => void;
  folder?: UploadFolder;
  /** Aspect ratio class, e.g. "aspect-square" or "aspect-video" */
  aspectRatio?: string;
  className?: string;
  disabled?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 5;

export function ImageUpload({
  value,
  onUpload,
  onRemove,
  folder = 'dishes',
  aspectRatio = 'aspect-square',
  className,
  disabled = false,
}: ImageUploadProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(value ?? null);

  const uploadFile = useCallback(
    async (file: File) => {
      // Client-side validation
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a JPEG, PNG, WebP, or GIF image.',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `Maximum size is ${MAX_SIZE_MB} MB.`,
          variant: 'destructive',
        });
        return;
      }

      // Show local preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setIsUploading(true);
      setProgress(10);

      try {
        // Step 1: Get presigned URL from our API
        const presignRes = await fetch('/api/upload/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mimeType: file.type, folder }),
        });

        if (!presignRes.ok) {
          throw new Error('Failed to get upload URL');
        }

        const { uploadUrl, publicUrl } = await presignRes.json();
        setProgress(30);

        // Step 2: Upload directly to R2/S3 using XHR (so we get progress events)
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 60) + 30; // 30–90%
              setProgress(pct);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => reject(new Error('Upload failed')));

          xhr.open('PUT', uploadUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
        });

        setProgress(100);

        // Step 3: Notify parent with the permanent public URL
        onUpload(publicUrl);
        toast({ title: 'Image uploaded ✓' });
      } catch (err: any) {
        console.error('[image upload]', err);
        setPreview(value ?? null); // Revert preview on error
        toast({
          title: 'Upload failed',
          description: err.message,
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
        setProgress(0);
        URL.revokeObjectURL(objectUrl);
      }
    },
    [folder, onUpload, toast, value]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset so same file can be selected again
    e.target.value = '';
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || isUploading) return;
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [disabled, isUploading, uploadFile]
  );

  const handleRemove = () => {
    setPreview(null);
    onRemove?.();
  };

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-lg border-2 border-dashed transition-colors',
          aspectRatio,
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          (disabled || isUploading) && 'pointer-events-none opacity-60'
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Upload preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            {/* Overlay on hover */}
            {!isUploading && (
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="h-8 w-8 text-white" />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground p-4">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <ImageIcon className="h-8 w-8" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium">
                {isDragging ? 'Drop to upload' : 'Click or drag image here'}
              </p>
              <p className="text-xs">JPEG, PNG, WebP up to {MAX_SIZE_MB}MB</p>
            </div>
          </div>
        )}

        {/* Upload progress bar */}
        {isUploading && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50">
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </div>

      {/* Remove button */}
      {preview && !isUploading && onRemove && (
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="absolute top-2 right-2 h-7 w-7 rounded-full"
          onClick={(e) => { e.stopPropagation(); handleRemove(); }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove image</span>
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
}
