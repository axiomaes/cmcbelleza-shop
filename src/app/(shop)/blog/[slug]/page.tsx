import { fetchBlogPostBySlug } from '@/lib/woocommerce';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await fetchBlogPostBySlug(slug);
    return {
      title: `${post.title.rendered} | Blog CMC Belleza`,
      description: post.excerpt.rendered.replace(/<[^>]*>?/gm, '').substring(0, 160),
    };
  } catch {
    return {
      title: 'Post no encontrado | CMC Belleza',
    };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  
  try {
    const post = await fetchBlogPostBySlug(slug);
    const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const imageAlt = post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || post.title.rendered;

    return (
      <article className="bg-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back button */}
          <Link 
            href="/blog" 
            className="inline-flex items-center text-neutral-500 hover:text-brand-600 mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Volver al Blog
          </Link>

          {/* Header */}
          <header className="mb-10">
            <div className="text-sm text-brand-600 font-medium mb-4">
              {formatDate(post.date)}
            </div>
            <h1 
              className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight mb-6"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
          </header>

          {/* Featured Image */}
          {imageUrl && (
            <div className="relative h-[300px] md:h-[500px] rounded-3xl overflow-hidden mb-12 shadow-sm border border-neutral-100">
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-neutral prose-lg max-w-none prose-img:rounded-3xl prose-headings:text-neutral-900 prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />
        </div>
      </article>
    );
  } catch (error) {
    console.error('Error loading blog post:', error);
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">Post no encontrado</h1>
        <p className="text-neutral-600 mb-8">Lo sentimos, el artículo que buscas no existe o ha sido movido.</p>
        <Link 
          href="/blog" 
          className="bg-brand-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-700 transition-colors inline-block"
        >
          Ir al Blog
        </Link>
      </div>
    );
  }
}
