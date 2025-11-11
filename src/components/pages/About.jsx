import React from 'react';
import { BookOpen, Users, MessageCircle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '../Navbar';
import Footer from '../Footer';

const About = ({ user, onLogout }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} onLogout={onLogout} />
      <main className="flex-1 bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              {t('about.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl">
              {t('about.subtitle')}
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  {t('about.mission')}
                </h2>
                <p className="text-base text-gray-700 mb-4 leading-relaxed">
                  {t('about.missionText1')}
                </p>
                <p className="text-base text-gray-700 mb-4 leading-relaxed">
                  {t('about.missionText2')}
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 border border-yellow-200 shadow-xl rounded-2xl">
                <BookOpen className="w-14 h-14 mb-4 text-orange-600" />
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  {t('about.interactiveTitle')}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t('about.interactiveText')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              {t('about.specialTitle')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all rounded-2xl">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  {t('about.authenticTitle')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('about.authenticText')}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all rounded-2xl">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  {t('about.aiTitle')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('about.aiText')}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all rounded-2xl">
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  {t('about.libraryTitle')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('about.libraryText')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
              {t('about.storyTitle')}
            </h2>
            <div className="max-w-3xl mx-auto">
              <div className="bg-white p-8 md:p-12 border border-gray-200 shadow-xl rounded-2xl">
                <p className="text-base text-gray-700 mb-6 leading-relaxed">
                  {t('about.storyText1')}
                </p>
                <p className="text-base text-gray-700 mb-6 leading-relaxed">
                  {t('about.storyText2')}
                </p>
                <p className="text-base text-gray-700 leading-relaxed">
                  {t('about.storyText3')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center drop-shadow-lg">
              {t('about.valuesTitle')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/20 backdrop-blur-md border border-white/30 p-8 rounded-2xl hover:bg-white/25 transition-all shadow-xl">
                <h3 className="text-2xl font-bold mb-4 drop-shadow">{t('about.authenticityTitle')}</h3>
                <p className="text-white/90 leading-relaxed">
                  {t('about.authenticityText')}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-md border border-white/30 p-8 rounded-2xl hover:bg-white/25 transition-all shadow-xl">
                <h3 className="text-2xl font-bold mb-4 drop-shadow">{t('about.innovationTitle')}</h3>
                <p className="text-white/90 leading-relaxed">
                  {t('about.innovationText')}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-md border border-white/30 p-8 rounded-2xl hover:bg-white/25 transition-all shadow-xl">
                <h3 className="text-2xl font-bold mb-4 drop-shadow">{t('about.accessibilityTitle')}</h3>
                <p className="text-white/90 leading-relaxed">
                  {t('about.accessibilityText')}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-md border border-white/30 p-8 rounded-2xl hover:bg-white/25 transition-all shadow-xl">
                <h3 className="text-2xl font-bold mb-4 drop-shadow">{t('about.educationTitle')}</h3>
                <p className="text-white/90 leading-relaxed">
                  {t('about.educationText')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
