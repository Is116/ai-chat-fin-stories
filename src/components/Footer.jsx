import React, { useState } from 'react';
import { BookOpen, Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const [email, setEmail] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-2.5 rounded-xl shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 notranslate" translate="no">Literary Chat</h2>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed text-sm">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-sky-50 text-sky-600 p-2 rounded-lg hover:bg-sky-100 transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-pink-50 text-pink-600 p-2 rounded-lg hover:bg-pink-100 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-50 text-blue-700 p-2 rounded-lg hover:bg-blue-100 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Explore Column */}
          <div>
            <h3 className="text-base font-bold mb-4 pb-2 border-b border-gray-200 text-gray-900">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/books" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  {t('footer.booksLibrary')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  {t('footer.howItWorks')}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium group">
                  {t('footer.faq')} <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-base font-bold mb-4 pb-2 border-b border-gray-200 text-gray-900">
              {t('footer.support')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  {t('footer.contactUs')}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  {t('footer.howItWorks')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-base font-bold mb-4 pb-2 border-b border-gray-200 text-gray-900">
              {t('footer.newsletter')}
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              {t('footer.newsletterStayUpdated')}
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.yourEmail')}
                  required
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2.5 px-6 text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              {t('footer.allRightsReserved')}
            </p>
            <p className="text-gray-600 text-sm">
              {t('footer.poweredBy')}{' '}
              <a 
                href="https://www.anthropic.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-900 hover:text-blue-600 transition-colors font-semibold notranslate"
                translate="no"
              >
                Claude AI
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
