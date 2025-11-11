import React, { useState } from 'react';
import { Menu, X, BookOpen, Shield, User, LogOut, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navbar = ({ user, onLogout, onGoHome }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'fi' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" onClick={onGoHome}>
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-2.5 rounded-xl shadow-md group-hover:shadow-lg transition-all">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent notranslate" translate="no">
              Literary Chat
            </h1>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/books" 
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              {t('nav.books')}
            </Link>
            <Link 
              to="/about" 
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              {t('nav.about')}
            </Link>
            <Link 
              to="/how-it-works" 
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              {t('nav.howItWorks')}
            </Link>
            <Link 
              to="/contact" 
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              {t('nav.contact')}
            </Link>
            <Link
              to="/admin/login"
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Shield className="w-4 h-4" />
              {t('nav.adminPanel')}
            </Link>
            
            {/* Language Switcher - Desktop */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all"
            >
              <Globe className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                {i18n.language === 'en' ? 'FI' : 'EN'}
              </span>
            </button>
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-sm text-gray-900">{user.username}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium py-2 px-5 rounded-lg text-sm hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                >
                  <LogOut className="w-4 h-4" />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-2 px-6 rounded-lg text-sm hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden bg-gray-100 text-gray-900 p-2 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <div className="flex flex-col gap-2">
              <Link 
                to="/books" 
                className="text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors p-3 rounded-lg"
                onClick={toggleMenu}
              >
                {t('nav.books')}
              </Link>
              <Link 
                to="/about" 
                className="text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors p-3 rounded-lg"
                onClick={toggleMenu}
              >
                {t('nav.about')}
              </Link>
              <Link 
                to="/how-it-works" 
                className="text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors p-3 rounded-lg"
                onClick={toggleMenu}
              >
                {t('nav.howItWorks')}
              </Link>
              <Link 
                to="/contact" 
                className="text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors p-3 rounded-lg"
                onClick={toggleMenu}
              >
                {t('nav.contact')}
              </Link>
              <Link
                to="/admin/login"
                className="text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors p-3 rounded-lg flex items-center gap-2"
                onClick={toggleMenu}
              >
                <Shield className="w-4 h-4" />
                {t('nav.adminPanel')}
              </Link>
              
              {/* Language Switcher - Mobile */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all mt-2"
              >
                <Globe className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  {i18n.language === 'en' ? t('nav.switchToFinnish') : t('nav.switchToEnglish')}
                </span>
              </button>
              
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 mt-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm text-gray-900">{user.username}</span>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      toggleMenu();
                    }}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white font-medium py-2.5 px-6 rounded-lg text-sm shadow-md flex items-center gap-2 justify-center mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-2.5 px-6 rounded-lg text-sm shadow-md text-center mt-2"
                  onClick={toggleMenu}
                >
                  {t('nav.login')}
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
