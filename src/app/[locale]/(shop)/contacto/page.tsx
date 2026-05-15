import React from 'react';
import type { Metadata } from 'next';
import { getDictionary } from '@/lib/get-dictionary';

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as any);
  
  return {
    title: dict.footer.contact, // Usamos Contact / Contacto del diccionario general
    description: dict.contact.hero_title,
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as any);
  
  const t = dict.contact;

  // Mapear slug localizado de política de privacidad
  const privacySlug = locale === 'en' ? 'privacy-policy' : 'politica-privacidad';

  // Dividir la cadena de consentimiento para renderizar el enlace HTML
  const consentParts = t.labels.consent.split('{privacy_policy}');

  return (
    <main className="relative min-h-screen bg-background pt-20 pb-section-gap font-sans">
      {/* Background Botanical Decorative Accents (abstract) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 right-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-[-10%] w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="mb-12 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="text-secondary font-bold text-xs uppercase tracking-[0.2em] mb-4 block">
            {t.hero_badge}
          </span>
          <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6 leading-tight">
            {t.hero_title}
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            {t.hero_desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-start">
          {/* Left Sidebar: Direct Contact Data */}
          <div className="md:col-span-5 space-y-8 animate-in fade-in duration-700 delay-200">
            <div className="bg-white p-8 rounded-2xl border border-outline-variant/20 shadow-sm flex items-start gap-5 group transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined text-[24px]">mail</span>
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-1">
                  {t.cards.support_badge}
                </h3>
                <p className="font-serif text-xl text-primary font-medium">
                  {t.cards.support_title}
                </p>
                <p className="text-sm text-on-surface-variant/70 mt-1">
                  {t.cards.support_desc}
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-outline-variant/20 shadow-sm flex items-start gap-5 group transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined text-[24px]">forum</span>
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-1">
                  {t.cards.community_badge}
                </h3>
                <p className="font-serif text-xl text-primary font-medium">
                  {t.cards.community_title}
                </p>
                <p className="text-sm text-on-surface-variant/70 mt-1">
                  {t.cards.community_desc}
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10 flex items-start gap-5">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-on-surface mb-1">
                  {t.form_title}
                </h3>
                <p className="text-sm text-on-surface-variant">
                  {t.form_subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Lead Form */}
          <div className="md:col-span-7 bg-white p-8 md:p-12 rounded-2xl shadow-lg shadow-primary/5 border border-outline-variant/20 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
                    {t.labels.name}
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                    placeholder={t.placeholders.name}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
                    {t.labels.email}
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                    placeholder={t.placeholders.email}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
                  {t.labels.subject}
                </label>
                <select
                  id="type"
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm text-on-surface"
                >
                  <option value="product">{t.options.product_advice}</option>
                  <option value="order">{t.options.order_query}</option>
                  <option value="routine">{t.options.style_recommendation}</option>
                  <option value="other">{t.options.other}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
                  {t.labels.message}
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm resize-none"
                  placeholder={t.placeholders.message}
                  required
                ></textarea>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input type="checkbox" id="terms" className="mt-1 border-outline-variant text-primary focus:ring-primary rounded" required />
                <label htmlFor="terms" className="text-xs text-on-surface-variant font-medium leading-relaxed">
                  {consentParts[0]}
                  <a href={`/${locale}/${privacySlug}`} className="text-primary underline font-bold">
                    {locale === 'en' ? 'privacy policy' : 'política de privacidad'}
                  </a>
                  {consentParts[1]}
                </label>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-primary text-white px-10 py-4 rounded-lg font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/10 hover:bg-primary-container hover:-translate-y-0.5 transition-all duration-300 mt-4"
              >
                {t.labels.submit}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
