import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchCategories, fetchProducts } from '@/lib/woocommerce';
import { Product } from '@/types';
import ProductSlider from '@/components/ui/ProductSlider';
import Button from '@/components/ui/Button';
import ParallaxBackground from '@/components/ui/ParallaxBackground';
import { Sparkles, Leaf, Droplets, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

const CATEGORY_CONTENT: Record<string, { title: string, subtitle: string, desc: string, icon: React.ReactNode, image: string, tips: string[] }> = {
  'cuidado-facial': {
    title: 'Cuidado Facial',
    subtitle: 'Resplandece con la fuerza de la naturaleza',
    desc: 'Nuestra rutina facial está diseñada para nutrir, reparar y proteger tu piel respetando su equilibrio natural. Fórmulas limpias, sin tóxicos y altamente eficaces.',
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1600&q=80',
    tips: [
      'Doble limpieza: Usa un limpiador en aceite seguido de uno al agua cada noche.',
      'Aplica los productos sobre la piel ligeramente húmeda para mayor absorción.',
      'No olvides el cuello y el escote, son extensiones de tu rostro.',
      'El protector solar es el paso final indispensable todas las mañanas.'
    ]
  },
  'cuidado-corporal': {
    title: 'Cuidado Corporal',
    subtitle: 'Un ritual de bienestar integral',
    desc: 'Mima cada centímetro de tu piel con texturas untuosas y aromas envolventes. Hidratación profunda que perdura, restaurando la elasticidad y luminosidad.',
    icon: <Leaf className="w-8 h-8 text-primary" />,
    image: 'https://images.unsplash.com/photo-1615397323755-eeb522105193?w=1600&q=80',
    tips: [
      'Exfolia tu cuerpo 1-2 veces por semana para renovar las células.',
      'Aplica la loción corporal o aceite justo al salir de la ducha.',
      'Aprovecha el momento para darte un suave masaje que reactive la circulación.',
      'Las zonas más secas (codos, rodillas) agradecen un extra de mantecas ricas.'
    ]
  },
  'serums-aceites': {
    title: 'Sérums y Aceites',
    subtitle: 'Concentrados puros de vitalidad',
    desc: 'Activos botánicos en su máxima concentración. Gotas preciosas que penetran en las capas más profundas para transformar tu piel desde el interior.',
    icon: <Droplets className="w-8 h-8 text-primary" />,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1600&q=80',
    tips: [
      'Solo necesitas de 3 a 5 gotas para todo el rostro y cuello.',
      'Calienta el aceite friccionando ligeramente las palmas antes de aplicar.',
      'Presiona suavemente sobre la piel en lugar de frotar fuertemente.',
      'Puedes mezclar un par de gotas con tu crema para enriquecer su textura.'
    ]
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = CATEGORY_CONTENT[slug];
  
  if (!content) return { title: 'Categoría' };
  
  return {
    title: `${content.title} | CMC Belleza`,
    description: content.desc,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  
  const content = CATEGORY_CONTENT[slug];

  if (!content) {
    notFound();
  }

  // Find WooCommerce Category ID
  let products: Product[] = [];
  try {
    const categories = await fetchCategories();
    const wpCategory = categories.find(c => c.slug === slug);
    
    if (wpCategory) {
      products = await fetchProducts({ category: wpCategory.id.toString(), per_page: 8 });
    }
  } catch (err) {
    console.error(`Error fetching products for category: ${slug}`, err);
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50/30">
      
      {/* Immersive Hero Sector */}
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={content.image} 
            alt={content.title} 
            fill 
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-gray-50/30"></div>
        </div>
        
        <ParallaxBackground />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center animate-in slide-in-from-bottom-10 duration-1000">
          <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
            {content.icon} Edición Especial
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-xl tracking-tight leading-tight">
            {content.title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium max-w-2xl drop-shadow-md">
            {content.subtitle}
          </p>
        </div>
      </section>

      {/* Intro & Tips Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 -mt-20 relative z-20">
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-xl p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row gap-12 items-center">
          
          <div className="lg:w-1/2 flex flex-col gap-6">
            <h2 className="text-3xl font-bold text-dark mb-2">Filosofía de Cuidado</h2>
            <p className="text-lg text-dark-muted leading-relaxed">
              {content.desc}
            </p>
            <div className="mt-4 inline-flex">
              <Link href="/tienda">
                <Button variant="dark" className="rounded-full shadow-lg">Comprar Colección</Button>
              </Link>
            </div>
          </div>

          <div className="lg:w-1/2 bg-primary/5 rounded-[2rem] p-8 border border-primary/10 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors"></div>
            <h3 className="text-xl font-extrabold text-dark mb-6 flex items-center gap-2">
              <span className="text-2xl">💡</span> Tips de los Expertos
            </h3>
            <ul className="flex flex-col gap-4 relative z-10">
              {content.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-dark-muted font-medium leading-snug">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
          
        </div>
      </section>

      {/* Products Grid Slider */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto w-full px-4 md:px-8 pb-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-dark relative inline-block">
                Productos Estrella
                <span className="absolute -bottom-2 left-0 w-1/2 h-1.5 bg-primary rounded-full"></span>
              </h2>
              <p className="text-dark-muted mt-4">Los favoritos de nuestra comunidad para tu {content.title.toLowerCase()}.</p>
            </div>
            <Link href={`/tienda?category=${slug}`} className="text-primary font-bold hover:underline shrink-0 flex items-center gap-1">
              Ver todos los productos &rarr;
            </Link>
          </div>
          
          <div className="overflow-hidden p-4 -mx-4">
            <ProductSlider products={products} />
          </div>
        </section>
      )}

    </div>
  );
}
