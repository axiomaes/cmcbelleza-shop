import Link from 'next/link';
import { getDictionary } from '@/lib/get-dictionary';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NotFound({ params }: Props) {
  const { locale } = await params;
  const activeLocale = locale || 'es';
  const dict = await getDictionary(activeLocale as any);
  const err = dict.errors;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-24 md:py-32 bg-surface">
      <div className="max-w-lg w-full text-center flex flex-col items-center backdrop-blur-sm bg-white/40 border border-outline-variant/20 rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden animate-fade-in">
        {/* Orbes decorativos sutiles */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 relative z-10">
          <span className="material-symbols-outlined text-5xl animate-pulse">spa</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-serif text-on-surface font-semibold tracking-tight mb-4 relative z-10">
          {err.not_found_title}
        </h1>
        
        <p className="text-dark-muted text-base md:text-lg leading-relaxed mb-8 max-w-sm relative z-10">
          {err.not_found_desc}
        </p>
        
        <Link
          href={`/${activeLocale}`}
          className="relative z-10 inline-flex items-center justify-center bg-primary text-white hover:bg-primary/90 px-8 py-4 rounded-full font-bold text-xs md:text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <span className="material-symbols-outlined mr-2 text-lg md:text-xl group-hover:-translate-x-1 transition-transform duration-300">arrow_back</span>
          {err.back_home}
        </Link>
      </div>
    </div>
  );
}
