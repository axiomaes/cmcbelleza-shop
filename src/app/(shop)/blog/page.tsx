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
    <div className="bg-white py-12">
      <div className="container mx-auto px-4">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Blog CMC Belleza</h1>
          <p className="text-lg text-neutral-600">Consejos, noticias y más sobre belleza natural.</p>
        </header>

        {posts.length === 0 ? (
          <div className="bg-neutral-50 rounded-2xl p-12 text-center border border-dashed border-neutral-300">
            <h2 className="text-2xl font-semibold text-neutral-700">Próximamente contenido</h2>
            <p className="text-neutral-500 mt-2">Estamos preparando los mejores artículos para ti.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
              const imageAlt = post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || post.title.rendered;
              
              return (
                <article key={post.id} className="group flex flex-col bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <Link href={`/blog/${post.slug}`} className="relative h-64 overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={imageAlt}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                        <span className="text-neutral-400">Sin imagen</span>
                      </div>
                    )}
                  </Link>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="text-sm text-brand-600 font-medium mb-3">
                      {formatDate(post.date)}
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <h2 
                        className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-brand-600 transition-colors"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                      />
                    </Link>
                    <p className="text-neutral-600 line-clamp-3 mb-6 flex-grow">
                      {stripHtml(post.excerpt.rendered)}
                    </p>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-brand-600 font-semibold text-sm group-hover:translate-x-1 transition-transform"
                    >
                      Leer más
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 ml-1 stroke-current stroke-2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
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
