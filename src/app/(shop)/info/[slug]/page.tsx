import { fetchPageBySlug } from '@/lib/woocommerce';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await fetchPageBySlug(slug);
    return {
      title: `${page.title.rendered} | CMC Belleza`,
    };
  } catch {
    return {
      title: 'Página Legal | CMC Belleza',
    };
  }
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  
  try {
    const page = await fetchPageBySlug(slug);

    return (
      <div className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <header className="mb-12 border-b border-neutral-100 pb-10">
            <h1 
              className="text-4xl font-bold text-neutral-900 leading-tight"
              dangerouslySetInnerHTML={{ __html: page.title.rendered }}
            />
          </header>

          <div 
            className="prose prose-neutral prose-lg max-w-none text-neutral-700 prose-headings:text-neutral-900"
            dangerouslySetInnerHTML={{ __html: page.content.rendered }}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading legal page:', error);
    return (
      <div className="bg-white py-24">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="bg-neutral-50 rounded-3xl p-12 border border-dashed border-neutral-300">
            <h1 className="text-3xl font-bold text-neutral-800 mb-4">Esta página está en construcción</h1>
            <p className="text-neutral-600 max-w-md mx-auto">
              Estamos trabajando para ofrecerte toda la información legal detallada lo antes posible.
            </p>
          </div>
        </div>
      </div>
    );
  }
}