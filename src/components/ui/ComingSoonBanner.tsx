'use client';
import { useState, useEffect } from 'react';

export default function ComingSoonBanner() {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const targetDate = new Date('2026-04-07T00:00:00');
    
    const initialDiff = targetDate.getTime() - new Date().getTime();
    if (initialDiff <= 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(interval);
        return;
      }
      
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    
    setTimeLeft({
      days: Math.floor(initialDiff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((initialDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((initialDiff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((initialDiff % (1000 * 60)) / 1000),
    });
    
    return () => clearInterval(interval);
  }, []);

  if (!isMounted || !timeLeft) return null;

  const Block = ({ value, label }: { value: number, label: string }) => (
    <div className="flex items-baseline">
      <span className="text-white font-bold text-sm leading-none">{value.toString().padStart(2, '0')}</span>
      <span className="text-primary/70 text-xs font-medium ml-[1px]">{label}</span>
    </div>
  );

  return (
    <div 
      className="w-full border-b border-primary/30 py-3 px-4"
      style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2410 50%, #1a1a1a 100%)' }}
    >
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
        
        <span className="text-white/70 text-xs font-semibold tracking-[0.2em] uppercase text-center">
          🌿 Próxima Apertura
        </span>

        {/* Separador desktop */}
        <span className="hidden md:block w-px h-4 bg-white/20"></span>

        <span className="text-primary font-extrabold text-sm tracking-wider uppercase border border-primary/40 rounded-full px-4 py-1 bg-primary/10 whitespace-nowrap">
          7 de Abril 2026
        </span>

        {/* Separador desktop */}
        <span className="hidden md:block w-px h-4 bg-white/20"></span>

        <div className="flex items-center gap-1 bg-white/5 rounded-full px-4 py-1 border border-white/10 mt-1 md:mt-0">
          <Block value={timeLeft.days} label="d" />
          <span className="text-white/30 mx-1">·</span>
          <Block value={timeLeft.hours} label="h" />
          <span className="text-white/30 mx-1">·</span>
          <Block value={timeLeft.minutes} label="m" />
          <span className="text-white/30 mx-1">·</span>
          <Block value={timeLeft.seconds} label="s" />
        </div>

      </div>
    </div>
  );
}
