import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import clsx from 'clsx';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    clsx(
      'text-white hover:text-[#d4a843] transition-colors duration-200',
      isActive && 'text-[#d4a843] underline'
    );

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    clsx(
      'block px-4 py-2 text-white hover:bg-gray-700 w-full text-center',
      isActive && 'bg-gray-700 text-[#d4a843]'
    );

  return (
    <header className="bg-[#1c1c1e] py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Branding */}
        <Link to="/" className="text-[#d4a843] font-bold text-3xl tracking-wide">
          Way Down South
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 items-center">
          <NavLink to="/" className={navLinkClasses}>
            Home
          </NavLink>
          <NavLink to="/menu" className={navLinkClasses}>
            Menu
          </NavLink>
          <NavLink to="/reservations" className={navLinkClasses}>
            Reservations
          </NavLink>
        </nav>

        {/* Call to Action - Desktop */}
        <Link
          to="/order"
          className="hidden md:block bg-[#c0392b] text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors duration-200"
        >
          Order Now
        </Link>

        {/* Mobile Hamburger Icon */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#1c1c1e] flex flex-col items-center py-4 space-y-4 z-50">
          <NavLink to="/" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/menu" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>
            Menu
          </NavLink>
          <NavLink to="/reservations" className={mobileNavLinkClasses} onClick={() => setMobileMenuOpen(false)}>
            Reservations
          </NavLink>
          <Link
            to="/order"
            className="bg-[#c0392b] text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors duration-200 w-3/4 text-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            Order Now
          </Link>
        </div>
      )}
    </header>
  );
}