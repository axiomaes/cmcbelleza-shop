"use client";

import React, { useState, useMemo } from 'react';
import { Product, Category } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import { Settings2, Search, X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface TiendaClientProps {
  initialProducts: Product[];
  categories: Category[];
}

const TiendaClient = ({ initialProducts, categories }: TiendaClientProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const maxInitialPrice = useMemo(() => {
    return initialProducts.length > 0
      ? Math.ceil(Math.max(...initialProducts.map((p) => parseFloat(p.price || '0'))))
      : 1000;
  }, [initialProducts]);

  const [maxPrice, setMaxPrice] = useState(maxInitialPrice);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const productCategoryIds = product.categories?.map((c) => c.id.toString()) || [];
      const matchesCategory = selectedCategory === 'all' || productCategoryIds.includes(selectedCategory);
      const matchesPrice = parseFloat(product.price || '0') <= maxPrice;
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [initialProducts, searchTerm, selectedCategory, maxPrice]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setMaxPrice(maxInitialPrice);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* Sidebar de Filtros */}
      <aside className="w-full lg:w-1/4 shrink-0">
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-white/60 sticky top-28">
          <h2 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-primary" />
            Filtros
          </h2>

          <div className="mb-6">
            <label htmlFor="search" className="block text-sm font-semibold text-dark-muted mb-2 font-sans">
              Buscar producto
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ej. Serum facial..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white/50 text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-muted" />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-semibold text-dark-muted mb-2 font-sans">
              Categoría
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white/50 text-sm appearance-none"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-8">
            <label htmlFor="price" className="flex justify-between text-sm font-semibold text-dark-muted mb-3 font-sans">
              <span>Precio máximo</span>
              <span className="text-secondary font-bold font-mono">{maxPrice} €</span>
            </label>
            <input
              type="range"
              id="price"
              min="0"
              max={maxInitialPrice}
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-primary h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-2 text-[10px] text-dark-muted font-bold opacity-50">
              <span>0 €</span>
              <span>{maxInitialPrice} €</span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3 text-xs font-bold text-dark-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all flex items-center justify-center gap-2 border border-transparent hover:border-primary/10"
          >
            <X size={14} />
            Limpiar filtros
          </button>
        </div>
      </aside>

      {/* Grid de Productos */}
      <div className="w-full lg:w-3/4">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/40 backdrop-blur-sm rounded-[2.5rem] border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Search size={32} className="text-gray-300" />
            </div>
            <p className="text-2xl font-bold text-dark mb-2">Sin resultados</p>
            <p className="text-dark-muted max-w-xs mx-auto">
              No hemos encontrado productos que coincidan con tus filtros.
            </p>
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="mt-6"
            >
              Ver todo el catálogo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TiendaClient;
