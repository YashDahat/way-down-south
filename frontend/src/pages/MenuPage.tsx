import React, { useState, useEffect, useMemo } from 'react';
import { useMenu, useMenuCategories } from '../hooks/useMenu';
import Layout from '../components/Layout';
import MenuItemCard from '../components/MenuItemCard';

const MenuPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');

  const { data: categories, isLoading: categoriesLoading } = useMenuCategories();
  const { data: menuItems, isLoading: itemsLoading, error } = useMenu({
    category: selectedCategory === 'All' ? undefined : selectedCategory,
    search: debouncedSearchTerm,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const jsonLd = useMemo(() => {
    if (!menuItems) return null;

    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Menu",
      "name": "Way Down South Menu",
      "hasMenuItem": menuItems.map(item => ({
        "@type": "MenuItem",
        "name": item.name,
        "description": item.description,
        "image": item.imageUrl,
        "offers": {
          "@type": "Offer",
          "price": item.price.toString(),
          "priceCurrency": "INR"
        }
      }))
    });
  }, [menuItems]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 text-[#f5f0e8]">
        <h1 className="text-5xl font-extrabold text-[#d4a843] mb-4 text-center">Our Menu</h1>
        <p className="text-lg text-[#f5f0e8] mb-12 text-center max-w-2xl mx-auto">
          Explore the authentic flavors of South India, from our kitchen to your table.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-4 md:space-y-0">
          <input
            type="text"
            placeholder="Search menu items..."
            className="w-full md:w-1/3 p-3 rounded-lg bg-[#2a2a2c] text-[#f5f0e8] border border-[#3a3a3c] focus:outline-none focus:ring-2 focus:ring-[#d4a843]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-end">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                selectedCategory === 'All' ? 'bg-[#d4a843] text-[#1c1c1e]' : 'bg-[#2a2a2c] text-[#f5f0e8] hover:bg-[#3a3a3c]'
              }`}
            >
              All
            </button>
            {categoriesLoading ? (
              <div className="animate-pulse flex space-x-2">
                <div className="h-10 w-20 bg-[#2a2a2c] rounded-lg"></div>
                <div className="h-10 w-20 bg-[#2a2a2c] rounded-lg"></div>
                <div className="h-10 w-20 bg-[#2a2a2c] rounded-lg"></div>
              </div>
            ) : (
              categories?.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    selectedCategory === category ? 'bg-[#d4a843] text-[#1c1c1e]' : 'bg-[#2a2a2c] text-[#f5f0e8] hover:bg-[#3a3a3c]'
                  }`}
                >
                  {category}
                </button>
              ))
            )}
          </div>
        </div>

        {itemsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-[#1c1c1e] rounded-lg shadow-lg overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-[#2a2a2c]"></div>
                <div className="p-4">
                  <div className="h-6 bg-[#2a2a2c] rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-[#2a2a2c] rounded w-full mb-4"></div>
                  <div className="h-4 bg-[#2a2a2c] rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-xl">Error loading menu items: {error.message}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuItems?.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      )}
    </Layout>
  );
};

export default MenuPage;