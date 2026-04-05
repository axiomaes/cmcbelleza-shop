'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ComingSoonBanner() {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Aparecer tras 5 segundos
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    const targetDate = new Date('2026-04-13T00:00:00');
    const initialDiff = targetDate.getTime() - new Date().getTime();
    
    if (initialDiff <= 0) {
      clearTimeout(visibilityTimer);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(interval);
        setIsVisible(false);
        return;
      }
      
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    
    // Init state
    setTimeLeft({
      days: Math.floor(initialDiff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((initialDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((initialDiff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((initialDiff % (1000 * 60)) / 1000),
    });
    
    return () => {
      clearInterval(interval);
      clearTimeout(visibilityTimer);
    };
  }, []);

  if (!isMounted || !timeLeft || !isVisible || isClosed) return null;

  const Block = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center bg-white/10 rounded-lg py-2 min-w-[50px]">
      <span className="text-white font-extrabold text-xl leading-none">{value.toString().padStart(2, '0')}</span>
      <span className="text-primary/80 text-[10px] uppercase font-bold mt-1 tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] w-[calc(100%-2rem)] md:w-80 bg-gradient-to-br from-[#1a1a1a] to-[#2d2410] border border-primary/30 p-6 rounded-2xl shadow-2xl shadow-black/50 animate-in slide-in-from-bottom-10 fade-in duration-700">
      <button 
        onClick={() => setIsClosed(true)}
        className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors p-1"
        aria-label="Cerrar banner"
      >
        <X size={18} />
      </button>

      <div className="flex flex-col items-center text-center">
        <span className="text-white/60 text-xs font-bold tracking-[0.2em] mb-2 uppercase">
          🌿 CMC Belleza
        </span>
        <h3 className="text-2xl font-extrabold text-white mb-1">
          Próxima Apertura
        </h3>
        <p className="text-primary text-sm font-semibold tracking-wider mb-5">
          13 DE ABRIL 2026
        </p>

        <div className="flex items-center justify-between w-full px-2 gap-2">
          <Block value={timeLeft.days} label="Días" />
          <span className="text-white/30 font-bold mb-4">:</span>
          <Block value={timeLeft.hours} label="Hrs" />
          <span className="text-white/30 font-bold mb-4">:</span>
          <Block value={timeLeft.minutes} label="Min" />
          <span className="text-white/30 font-bold mb-4">:</span>
          <Block value={timeLeft.seconds} label="Seg" />
        </div>
      </div>
    </div>
  );
}
