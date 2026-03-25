'use client';
import { useState, useEffect } from 'react';

export default function ComingSoonBanner() {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);
  const [bouncing, setBouncing] = useState<Record<string, boolean>>({ days: false, hours: false, minutes: false, seconds: false });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const targetDate = new Date('2026-04-07T00:00:00');
    
    // Check initial diff
    const initialDiff = targetDate.getTime() - new Date().getTime();
    if (initialDiff <= 0) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(interval);
        return;
      }
      
      const newDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      const newHours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const newMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const newSeconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(prev => {
        if (!prev) return { days: newDays, hours: newHours, minutes: newMinutes, seconds: newSeconds };
        
        const changes = {
          days: prev.days !== newDays,
          hours: prev.hours !== newHours,
          minutes: prev.minutes !== newMinutes,
          seconds: prev.seconds !== newSeconds,
        };
        
        setBouncing(changes);
        
        setTimeout(() => {
          setBouncing({ days: false, hours: false, minutes: false, seconds: false });
        }, 150);
        
        return { days: newDays, hours: newHours, minutes: newMinutes, seconds: newSeconds };
      });
    }, 1000);
    
    // Init synchronously to avoid flicker 
    setTimeLeft({
      days: Math.floor(initialDiff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((initialDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((initialDiff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((initialDiff % (1000 * 60)) / 1000),
    });
    
    return () => clearInterval(interval);
  }, []);

  if (!isMounted || !timeLeft) return null;

  const Block = ({ value, label, isBouncing }: { value: number, label: string, isBouncing: boolean }) => (
    <div className="flex flex-col items-center">
      <div className={`bg-white/10 rounded-xl px-4 py-3 min-w-[70px] flex items-center justify-center transition-transform duration-150 ease-out ${isBouncing ? 'scale-110' : 'scale-100'}`}>
        <span className="text-4xl md:text-5xl font-extrabold text-white">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs text-white/70 uppercase tracking-wider mt-2">{label}</span>
    </div>
  );

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-sm py-6 px-4 md:px-8 overflow-hidden">
      <div className="relative max-w-7xl mx-auto flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <p className="text-sm text-white/80 font-medium mb-1 tracking-wide">🌿 CMC Belleza</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Próxima Apertura</h2>
          <p className="font-extrabold text-4xl md:text-5xl" style={{ color: 'var(--color-primary, #ce9e4b)' }}>
            7 de Abril 2026
          </p>
        </div>
        
        <div className="flex items-start justify-center gap-2 md:gap-4 mt-2">
          <Block value={timeLeft.days} label="Días" isBouncing={bouncing.days} />
          <span className="text-3xl font-bold mt-2" style={{ color: 'var(--color-primary, #ce9e4b)' }}>:</span>
          <Block value={timeLeft.hours} label="Horas" isBouncing={bouncing.hours} />
          <span className="text-3xl font-bold mt-2" style={{ color: 'var(--color-primary, #ce9e4b)' }}>:</span>
          <Block value={timeLeft.minutes} label="Min" isBouncing={bouncing.minutes} />
          <span className="text-3xl font-bold mt-2" style={{ color: 'var(--color-primary, #ce9e4b)' }}>:</span>
          <Block value={timeLeft.seconds} label="Seg" isBouncing={bouncing.seconds} />
        </div>
      </div>
    </div>
  );
}
