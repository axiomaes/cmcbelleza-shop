import { fetchBlogPosts } from '@/lib/woocommerce';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types';

export const dynamic = 'force-dynamic';

function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, '');
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  
  try {
    posts = await fetchBlogPosts();
  } catch (error) {
    console.error('Error loading blog posts:', error);
  }

  return (
    <div className="bg-background py-20 font-sans">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        
        <header className="mb-16 text-center md:text-left max-w-3xl">
          <span className="text-secondary font-bold text-xs uppercase tracking-[0.2em] mb-4 block">Rituales de Bienestar</span>
          <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6 leading-tight">Diario de Belleza</h1>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            Explora nuestros artículos sobre dermocosmética natural, sostenibilidad y el arte de cuidar de ti.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="bg-surface-container-low rounded-2xl p-16 text-center border border-outline-variant/20">
            <span className="material-symbols-outlined text-[48px] text-outline mb-4">auto_stories</span>
            <h2 className="font-serif text-2xl font-medium text-primary mb-2">Próximos Capítulos</h2>
            <p className="text-on-surface-variant max-w-sm mx-auto">Estamos redactando guías botánicas exclusivas para tu bienestar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {posts.map((post) => {
              const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
              const imageAlt = post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || post.title.rendered;
              
              return (
                <article key={post.id} className="group flex flex-col bg-white rounded-2xl border border-outline-variant/20 overflow-hidden hover:shadow-xl transition-all duration-500">
                  <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={imageAlt}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container-low flex items-center justify-center text-outline">
                        <span className="material-symbols-outlined text-[32px]">article</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all"></div>
                  </Link>
                  
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="text-xs text-secondary font-bold uppercase tracking-widest mb-3">
                      {formatDate(post.date)}
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <h2 
                        className="font-serif text-2xl text-on-surface mb-4 group-hover:text-primary transition-colors leading-tight"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                      />
                    </Link>
                    <p className="text-sm text-on-surface-variant/90 line-clamp-3 mb-6 flex-grow leading-relaxed">
                      {stripHtml(post.excerpt.rendered)}
                    </p>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary group-hover:text-secondary transition-colors"
                    >
                      Leer el Artículo
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
