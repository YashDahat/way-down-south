import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
// Assuming these exist from other features as per instruction
import { useMenu } from '../hooks/useMenu';
import MenuItemCard from '../components/MenuItemCard';

const HomePage = () => {
  // Use the useMenu hook from frontend/src/hooks/useMenu.ts
  const { data: menuItems, isLoading } = useMenu({});

  return (
    <Layout>
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center h-[600px] flex items-center justify-center text-white"
        style={{ backgroundImage: "url('/images/hero-south-indian-food.jpg')" }} // Placeholder for a high-quality background image
      >
        <div className="absolute inset-0 bg-black opacity-50"></div> {/* Semi-transparent dark background */}
        <div className="relative z-10 text-center p-4">
          <h1 className="text-5xl font-bold mb-4">Authentic Flavors of South India</h1>
          <p className="text-xl mb-8">Experience tradition in every bite, delivered to your door.</p>
          <Link
            to="/order"
            className="bg-[#c0392b] text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Order Online Now
          </Link>
        </div>
      </section>

      {/* Menu Highlights Section */}
      <section className="bg-[#f8f8f8] py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12 text-gray-800">Our Signature Dishes</h2>
          {isLoading ? (
            <p className="text-lg text-gray-600">Loading delicious menu items...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {menuItems?.slice(0, 3).map((item) => ( // Display the first 3 items
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
          <div className="mt-12">
            <Link
              to="/menu"
              className="border border-gray-400 text-gray-700 px-6 py-3 rounded-full text-lg hover:bg-gray-100 transition-colors"
            >
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Authenticity Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="md:order-1"> {/* Left column: Image */}
            <img
              src="/images/restaurant-interior.jpg" // Placeholder for an image of the restaurant's interior or chefs
              alt="Restaurant Interior"
              className="rounded-lg shadow-lg w-full h-auto object-cover"
            />
          </div>
          <div className="md:order-2 text-gray-800"> {/* Right column: Text */}
            <h2 className="text-4xl font-bold mb-6">Straight from the Heart of the South</h2>
            <p className="text-lg leading-relaxed">
              At Way Down South, we bring you the true essence of South Indian culinary traditions.
              Our chefs meticulously craft each dish using time-honored recipes passed down through generations,
              combined with the freshest, locally sourced ingredients. Experience the vibrant spices,
              aromatic flavors, and heartwarming hospitality that define our heritage.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;