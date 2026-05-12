import React, { useState } from 'react';
import { cn } from '../lib/utils';

interface ProductImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  containerClassName?: string;
  imageClassName?: string;
  isZoomable?: boolean;
}

export function ProductImage({
  src,
  alt,
  containerClassName,
  imageClassName,
  isZoomable = false,
  ...props
}: ProductImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn("relative flex items-center justify-center bg-white overflow-hidden", containerClassName)}>
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-50 animate-pulse z-0" />
      )}
      
      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "object-contain w-full h-full transition-all duration-500 ease-out z-10",
          "mix-blend-multiply",
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95",
          imageClassName
        )}
        {...props}
      />
      
      {/* Overlay for inner zoom if requested (like Amazon) */}
      {isZoomable && isLoaded && (
        <div className="absolute inset-0 z-20 hover:bg-black/5 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </div>
  );
}
