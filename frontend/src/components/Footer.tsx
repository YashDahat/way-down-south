function Footer() {
  return (
    <footer className="bg-[#1c1c1e] text-gray-300 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-gray-700">
          {/* Column 1: Contact & Address */}
          <div>
            <h3 className="text-lg font-semibold text-[#d4a843] mb-4">Visit Us</h3>
            <p className="mb-2">123 Spice Route, Bangalore, KA 560001</p>
            <p>
              Phone: <a href="tel:+919876543210" className="hover:text-[#d4a843]">+91 98765 43210</a>
            </p>
          </div>

          {/* Column 2: Hours of Operation */}
          <div>
            <h3 className="text-lg font-semibold text-[#d4a843] mb-4">Hours</h3>
            <p className="mb-2">Mon - Fri: 11:00 AM - 10:00 PM</p>
            <p>Sat - Sun: 10:00 AM - 11:00 PM</p>
          </div>

          {/* Column 3: Location Map */}
          <div>
            <h3 className="text-lg font-semibold text-[#d4a843] mb-4">Location Map</h3>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0000000000005!2d77.594562!3d12.971599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b4474d%3A0x123456789abcdef!2sBangalore%2C%20Karnataka%2C%20India!5e0!3m2!1sen!2sus!4v1678901234567!5m2!1sen!2sus"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Restaurant Location"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Copyright Notice */}
        <div className="text-center mt-8 text-sm">
          © 2024 Way Down South. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;