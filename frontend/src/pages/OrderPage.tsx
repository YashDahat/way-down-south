import React, { useContext } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { CartContext } from '../context/CartContext';
import CheckoutForm from '../components/CheckoutForm';

const OrderPage: React.FC = () => {
  const cartContext = useContext(CartContext);

  if (!cartContext) {
    // This case should ideally be prevented by ensuring CartProvider wraps the component tree
    console.error('CartContext is not available. Ensure OrderPage is rendered within CartProvider.');
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6 text-center text-[#333333]">Checkout</h1>
          <p className="text-center text-lg text-red-500">Error: Cart services are unavailable.</p>
        </div>
      </Layout>
    );
  }

  const { cartItems, getCartTotal } = cartContext;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#333333]">Checkout</h1>

        {cartItems.length === 0 ? (
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">Your cart is empty.</p>
            <Link href="/menu" className="mt-4 inline-block bg-[#d4a843] hover:bg-[#c0973b] text-white font-bold py-2 px-4 rounded">
              Go to menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Checkout Form */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-[#333333]">Customer Details</h2>
              <CheckoutForm />
            </div>

            {/* Right Column: Order Summary */}
            <div className="bg-[#f8f8f8] p-6 rounded-lg shadow-sm border border-gray-200 text-[#333333]">
              <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="text-lg">{item.name} x {item.quantity}</span>
                    <span className="text-lg">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center font-bold text-xl pt-4 mt-4 border-t border-gray-300">
                <span>Total:</span>
                <span>₹{getCartTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrderPage;