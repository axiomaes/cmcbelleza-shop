'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function TextureSlider({ mainImage, textureImage }: { mainImage: string, textureImage: string }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    }
  }, [isDragging]);

  return (
    <div className="w-full flex flex-col gap-3 mt-10 mb-2">
      <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.2em] px-4">
        <span className={`transition-colors duration-300 ${sliderPosition > 50 ? 'text-primary' : 'text-dark-muted/50'}`}>Empaque</span>
        <span className={`transition-colors duration-300 ${sliderPosition < 50 ? 'text-primary' : 'text-dark-muted/50'}`}>Textura Interior</span>
      </div>
      
      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/3] bg-gray-50 rounded-[2rem] overflow-hidden cursor-ew-resize select-none border border-black/5 shadow-inner"
        onMouseDown={(e) => { setIsDragging(true); handleMove(e.clientX); }}
        onMouseMove={handleMouseMove}
        onTouchStart={(e) => { setIsDragging(true); handleMove(e.touches[0].clientX); }}
        onTouchMove={handleTouchMove}
      >
        {/* Underneath Image (Textura) */}
        <div className="absolute inset-0 w-full h-full">
          <Image src={textureImage} alt="Textura del producto" fill className="object-cover" />
        </div>

        {/* Top Image (Main Packaging) */}
        <div 
          className="absolute inset-0 w-full h-full border-r-2 border-primary"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <div className="relative w-full h-full bg-white">
            <Image src={mainImage} alt="Empaque original" fill className="object-contain p-8" />
          </div>
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
          style={{ left: `calc(${sliderPosition}% - 1px)` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border border-gray-100 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] ring-2 ring-primary/20">
            <div className="flex gap-[3px]">
              <span className="w-[2px] h-3 bg-primary rounded-full"></span>
              <span className="w-[2px] h-3 bg-primary rounded-full"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
