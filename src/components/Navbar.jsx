import React, { useState } from 'react';
import { Menu, X, BookOpen, Shield, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white border-b-4 border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-black text-white p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
              Literary Chat
            </h1>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="#characters" 
              className="font-bold uppercase text-sm hover:text-gray-600 transition-colors"
            >
              Characters
            </a>
            <a 
              href="#about" 
              className="font-bold uppercase text-sm hover:text-gray-600 transition-colors"
            >
              About
            </a>
            <a 
              href="#how-it-works" 
              className="font-bold uppercase text-sm hover:text-gray-600 transition-colors"
            >
              How it Works
            </a>
            <a 
              href="#contact" 
              className="font-bold uppercase text-sm hover:text-gray-600 transition-colors"
            >
              Contact
            </a>
            <Link
              to="/admin/login"
              className="flex items-center gap-2 font-bold uppercase text-sm text-gray-600 hover:text-black transition-colors"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-yellow-100">
                  <User className="w-4 h-4" />
                  <span className="font-bold text-sm">{user.username}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 bg-red-500 text-white font-bold py-3 px-6 uppercase text-sm border-2 border-black hover:bg-red-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-black text-white font-bold py-3 px-6 uppercase text-sm border-2 border-black hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden bg-black text-white p-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t-4 border-black bg-gray-50">
            <div className="flex flex-col gap-4">
              <a 
                href="#characters" 
                className="font-bold uppercase text-sm hover:bg-black hover:text-white transition-colors p-3 border-2 border-black"
                onClick={toggleMenu}
              >
                Characters
              </a>
              <a 
                href="#about" 
                className="font-bold uppercase text-sm hover:bg-black hover:text-white transition-colors p-3 border-2 border-black"
                onClick={toggleMenu}
              >
                About
              </a>
              <a 
                href="#how-it-works" 
                className="font-bold uppercase text-sm hover:bg-black hover:text-white transition-colors p-3 border-2 border-black"
                onClick={toggleMenu}
              >
                How it Works
              </a>
              <a 
                href="#contact" 
                className="font-bold uppercase text-sm hover:bg-black hover:text-white transition-colors p-3 border-2 border-black"
                onClick={toggleMenu}
              >
                Contact
              </a>
              <Link
                to="/admin/login"
                className="font-bold uppercase text-sm hover:bg-black hover:text-white transition-colors p-3 border-2 border-black flex items-center gap-2"
                onClick={toggleMenu}
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
              
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-3 border-2 border-black bg-yellow-100">
                    <User className="w-4 h-4" />
                    <span className="font-bold text-sm">{user.username}</span>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      toggleMenu();
                    }}
                    className="bg-red-500 text-white font-bold py-3 px-6 uppercase text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 justify-center"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-black text-white font-bold py-3 px-6 uppercase text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
