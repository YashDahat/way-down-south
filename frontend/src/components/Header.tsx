import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import clsx from 'clsx';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinkClasses = (isActive: boolean) =>
    clsx(
      'text-white hover:text-[#d4a843] transition-colors duration-200',
      isActive && 'underline text-[#d4a43]'
    );

  return (
    <header className="bg-[#1c1c1e] py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Branding */}
        <Link to="/" className="text-[#d4a843] font-bold text-2xl" onClick={closeMobileMenu}>
          Way Down South
        </Link>

        {/* Desktop Navigation & CTA */}
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex space-x-6">
            <NavLink to="/" className={({ isActive }) => navLinkClasses(isActive)}>
              Home
            </NavLink>
            <NavLink to="/menu" className={({ isActive }) => navLinkClasses(isActive)}>
              Menu
            </NavLink>
            <NavLink to="/reservations" className={({ isActive }) => navLinkClasses(isActive)}>
              Reservations
            </NavLink>
          </nav>
          <Link
            to="/order"
            className="bg-[#c0392b] text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
          >
            Order Now
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white focus:outline-none" onClick={toggleMobileMenu}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isMobileMenuOpen ? (
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-[#1c1c1e] p-4 flex flex-col space-y-4 z-50">
          <NavLink
            to="/"
            className={({ isActive }) => clsx(navLinkClasses(isActive), 'block')}
            onClick={closeMobileMenu}
          >
            Home
          </NavLink>
          <NavLink
            to="/menu"
            className={({ isActive }) => clsx(navLinkClasses(isActive), 'block')}
            onClick={closeMobileMenu}
          >
            Menu
          </NavLink>
          <NavLink
            to="/reservations"
            className={({ isActive }) => clsx(navLinkClasses(isActive), 'block')}
            onClick={closeMobileMenu}
          >
            Reservations
          </NavLink>
          <Link
            to="/order"
            className="bg-[#c0392b] text-white px-4 py-2 rounded-md text-center hover:bg-red-700 transition-colors duration-200"
            onClick={closeMobileMenu}
          >
            Order Now
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;