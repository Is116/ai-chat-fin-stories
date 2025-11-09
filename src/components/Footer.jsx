import React, { useState } from 'react';
import { BookOpen, Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <footer className="bg-black text-white border-t-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white text-black p-3 border-2 border-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black uppercase">Literary Chat</h2>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Chat with your favorite literary characters powered by AI. Experience timeless stories through conversations.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-black p-2 hover:bg-gray-200 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-black p-2 hover:bg-gray-200 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-black p-2 hover:bg-gray-200 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-black p-2 hover:bg-gray-200 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Characters Column */}
          <div>
            <h3 className="text-lg font-black uppercase mb-4 pb-2 border-b-2 border-white">
              Characters
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#sherlock" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Sherlock Holmes
                </a>
              </li>
              <li>
                <a href="#elizabeth" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Elizabeth Bennet
                </a>
              </li>
              <li>
                <a href="#holden" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Holden Caulfield
                </a>
              </li>
              <li>
                <a href="#hermione" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Hermione Granger
                </a>
              </li>
              <li>
                <a href="#all-characters" className="text-white hover:underline transition-colors font-bold">
                  View All →
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-lg font-black uppercase mb-4 pb-2 border-b-2 border-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors font-medium">
                  About Us
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors font-medium">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#faq" className="text-gray-300 hover:text-white transition-colors font-medium">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-lg font-black uppercase mb-4 pb-2 border-b-2 border-white">
              Newsletter
            </h3>
            <p className="text-gray-300 mb-4 text-sm">
              Stay updated with new characters and features!
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="w-full pl-11 pr-4 py-3 border-2 border-white text-black font-medium focus:outline-none focus:border-4"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-white text-black font-bold py-3 px-6 uppercase text-sm border-2 border-white hover:bg-gray-200 transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t-2 border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm font-medium">
              © 2025 Literary Chat. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Powered by{' '}
              <a 
                href="https://www.anthropic.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:underline font-bold"
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
