import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../Navbar';
import Footer from '../Footer';

const Contact = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Contact form submitted:', formData);
    setIsSubmitted(true);
    setIsSubmitting(false);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} onLogout={onLogout} />
      <main className="flex-1 bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              {t('contact.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl">
              {t('contact.subtitle')}
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Contact Info */}
              <div className="lg:col-span-1 space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6">
                    {t('contact.getInTouch')}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-8">
                    {t('contact.getInTouchText')}
                  </p>
                </div>

                {/* Contact Methods */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-6 bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all rounded-2xl">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2 text-gray-900">{t('contact.email')}</h3>
                      <a href="mailto:hello@literarychat.com" className="text-blue-600 hover:text-blue-700 transition-colors">
                        hello@literarychat.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all rounded-2xl">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2 text-gray-900">{t('contact.phone')}</h3>
                      <a href="tel:+358631234567" className="text-gray-600 hover:text-gray-900 transition-colors">
                        +358 6 312 3456
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-6 bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all rounded-2xl">
                    <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-3 rounded-xl flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2 text-gray-900">{t('contact.address')}</h3>
                      <p className="text-gray-600">
                        Kirjallisuuskatu 15<br />
                        65100 Vaasa<br />
                        Finland
                      </p>
                    </div>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="relative overflow-hidden p-8 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 animate-gradient text-white shadow-2xl rounded-2xl">
                  {/* Animated Background Blobs */}
                  <div className="absolute top-0 left-0 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                  <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                  <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white drop-shadow-lg">{t('contact.officeHours')}</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl shadow-xl">
                        <span className="text-white/90 drop-shadow">{t('contact.mondayFriday')}</span>
                        <span className="font-semibold text-white">9:00 - 17:00</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl shadow-xl">
                        <span className="text-white/90 drop-shadow">{t('contact.saturday')}</span>
                        <span className="font-semibold text-white">10:00 - 14:00</span>
                      </div>
                      <div className="flex justify-between p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl shadow-xl">
                        <span className="text-white/90 drop-shadow">{t('contact.sunday')}</span>
                        <span className="font-semibold text-white">{t('contact.closed')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white p-8 md:p-12 border border-gray-200 shadow-xl rounded-2xl">
                  <h2 className="text-3xl font-bold mb-8 text-gray-900">
                    {t('contact.sendMessage')}
                  </h2>

                  {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-full mb-6">
                        <CheckCircle className="w-16 h-16 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-gray-900">{t('contact.messageSent')}</h3>
                      <p className="text-gray-600 text-center">
                        {t('contact.thankYou')}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block font-semibold text-sm mb-2 text-gray-700">
                            {t('contact.yourName')} *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder={t('contact.namePlaceholder')}
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className="block font-semibold text-sm mb-2 text-gray-700">
                            {t('contact.yourEmail')} *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder={t('contact.emailPlaceholder')}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block font-semibold text-sm mb-2 text-gray-700">
                          {t('contact.subject')} *
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder={t('contact.subjectPlaceholder')}
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block font-semibold text-sm mb-2 text-gray-700">
                          {t('contact.message')} *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows="6"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                          placeholder={t('contact.messagePlaceholder')}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                            {t('contact.sending')}
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            {t('contact.sendButton')}
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Teaser */}
        <section className="relative overflow-hidden py-20 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 animate-gradient-pulse">
          {/* Animated Background Blobs */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white drop-shadow-lg">
              {t('contact.quickAnswers')}
            </h2>
            <p className="text-base text-white/90 mb-8 drop-shadow">
              {t('contact.faqText')}
            </p>
            <Link
              to="/faq"
              className="inline-block bg-white/20 backdrop-blur-md text-white font-semibold py-4 px-8 text-sm rounded-lg border border-white/30 hover:bg-white/30 transition-all shadow-xl hover:shadow-2xl"
            >
              {t('contact.visitFAQ')}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
