import Layout from '../components/Layout';

const ContactPage = () => {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-5xl font-extrabold text-center mb-12 text-[#1c1c1e]">Get In Touch</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Left Column: Map */}
          <div>
            <h3 className="text-3xl font-bold mb-6 text-[#1c1c1e]">Find Us Here</h3>
            <div className="aspect-w-16 aspect-h-9 w-full h-96 bg-gray-200 rounded-lg overflow-hidden shadow-xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15551.91617267197!2d77.58064385!3d12.97159875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae167100000001%3A0x1000000000000001!2sBangalore%2C%20Karnataka%2C%20India!5e0!3m2!1sen!2sus!4v1678901234567!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Restaurant Location on Google Maps"
              ></iframe>
            </div>
          </div>

          {/* Right Column: Contact Details */}
          <div>
            <h3 className="text-3xl font-bold mb-6 text-[#1c1c1e]">Our Location</h3>
            <p className="text-lg text-gray-700 mb-8">
              123 Spice Route, <br />
              Bangalore, KA 560001
            </p>

            <h3 className="text-3xl font-bold mb-6 text-[#1c1c1e]">Contact Us</h3>
            <p className="text-lg text-gray-700 mb-4">
              Phone: <a href="tel:+919876543210" className="text-[#c0392b] hover:underline">+91 98765 43210</a>
            </p>
            <p className="text-lg text-gray-700 mb-8">
              Email: <a href="mailto:contact@waydownsouth.com" className="text-[#c0392b] hover:underline">contact@waydownsouth.com</a>
            </p>

            <h3 className="text-3xl font-bold mb-6 text-[#1c1c1e]">Opening Hours</h3>
            <ul className="text-lg text-gray-700 space-y-2">
              <li><span className="font-semibold">Monday:</span> 11:00 AM - 10:00 PM</li>
              <li><span className="font-semibold">Tuesday:</span> 11:00 AM - 10:00 PM</li>
              <li><span className="font-semibold">Wednesday:</span> 11:00 AM - 10:00 PM</li>
              <li><span className="font-semibold">Thursday:</span> 11:00 AM - 10:00 PM</li>
              <li><span className="font-semibold">Friday:</span> 11:00 AM - 11:00 PM</li>
              <li><span className="font-semibold">Saturday:</span> 10:00 AM - 11:00 PM</li>
              <li><span className="font-semibold">Sunday:</span> 10:00 AM - 10:00 PM</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;