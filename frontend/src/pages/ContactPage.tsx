import React from 'react';
import Layout from '@/components/Layout';

const ContactPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-center mb-10 text-[#1c1c1e]">Get In Touch</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column: Google Map */}
          <div className="md:col-span-1">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0000000000005!2d77.594562!3d12.971599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae167000000001%3A0x123456789abcdef0!2s123%20Spice%20Route%2C%20Bangalore%2C%20KA%20560001!5e0!3m2!1sen!2sin!4v1678901234567!5m2!1sen!2sin" // Placeholder URL for 123 Spice Route, Bangalore
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Restaurant Location: 123 Spice Route, Bangalore, KA 560001"
            ></iframe>
          </div>

          {/* Right Column: Contact Details */}
          <div className="md:col-span-1 text-[#1c1c1e]">
            <h3 className="text-2xl font-semibold mb-4 text-[#d4a843]">Our Location</h3>
            <p className="mb-6">123 Spice Route, Bangalore, KA 560001</p>

            <h3 className="text-2xl font-semibold mb-4 text-[#d4a843]">Contact Us</h3>
            <p className="mb-2">
              Phone: <a href="tel:+919876543210" className="text-[#c0392b] hover:underline">+91 98765 43210</a>
            </p>
            <p className="mb-6">
              Email: <a href="mailto:contact@waydownsouth.com" className="text-[#c0392b] hover:underline">contact@waydownsouth.com</a>
            </p>

            <h3 className="text-2xl font-semibold mb-4 text-[#d4a843]">Opening Hours</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Monday: 11:00 AM - 10:00 PM</li>
              <li>Tuesday: 11:00 AM - 10:00 PM</li>
              <li>Wednesday: 11:00 AM - 10:00 PM</li>
              <li>Thursday: 11:00 AM - 10:00 PM</li>
              <li>Friday: 11:00 AM - 11:00 PM</li>
              <li>Saturday: 10:00 AM - 11:00 PM</li>
              <li>Sunday: 10:00 AM - 10:00 PM</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;