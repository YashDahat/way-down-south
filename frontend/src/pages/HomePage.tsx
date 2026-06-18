import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useMenu } from '@/hooks/useMenu'; // Assuming this path from feature instruction
import MenuItemCard from '@/components/MenuItemCard'; // Assuming this path from feature instruction

const HomePage: React.FC = () => {
  const { data: menuItems, isLoading } = useMenu({});

  const featuredMenuItems = menuItems?.slice(0, 4); // Get first 4 items for highlights

  return (
    <Layout>
      {/* Hero Section */}
      <section
        className="relative h-[600px] bg-cover bg-center flex items-center justify-center text-white"
        style={{ backgroundImage: "url('/images/hero-south-indian-food.jpg')" }} // Placeholder image path
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 text-center p-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Authentic Flavors of South India</h1>
          <p className="text-xl md:text-2xl mb-8">Experience tradition in every bite, delivered to your door.</p>
          <Link
            to="/order"
            className="bg-[#c0392b] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300"
          >
            Order Online Now
          </Link>
        </div>
      </section>

      {/* Menu Highlights Section */}
      <section className="py-16 bg-[#f8f8f8] text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-[#1c1c1e] mb-12">Our Signature Dishes</h2>
          {isLoading ? (
            <p className="text-lg text-gray-700">Loading menu highlights...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {featuredMenuItems?.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
              <Link
                to="/menu"
                className="inline-block border border-[#c0392b] text-[#c0392b] hover:bg-[#c0392b] hover:text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300"
              >
                View Full Menu
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Authenticity Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Image Column (Left on md and up) */}
            <div className="md:order-1">
              <img
                src="/images/restaurant-interior.jpg" // Placeholder image path
                alt="Restaurant Interior"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            {/* Text Column (Right on md and up) */}
            <div className="md:order-2 text-center md:text-left">
              <h2 className="text-4xl font-bold text-[#1c1c1e] mb-6">Straight from the Heart of the South</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                At Way Down South, we are passionate about bringing you the authentic, vibrant flavors of South India.
                Our chefs meticulously follow traditional recipes passed down through generations, using only the freshest,
                locally sourced ingredients to ensure every dish tells a story of heritage and taste. From the aromatic
                spices of Kerala to the rich curries of Tamil Nadu, embark on a culinary journey that celebrates the true
                essence of South Indian cuisine.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;