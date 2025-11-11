import React from 'react';
import { UserPlus, MessageSquare, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../Navbar';
import Footer from '../Footer';

const HowItWorks = ({ user, onLogout }) => {
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
              {t('howItWorks.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl">
              {t('howItWorks.subtitle')}
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-16">
              {/* Step 1 */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 md:p-12 border border-blue-200 shadow-xl rounded-2xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white w-14 h-14 flex items-center justify-center text-2xl font-bold rounded-xl shadow-lg">
                        1
                      </div>
                      <UserPlus className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-gray-900">
                      {t('howItWorks.step1Title')}
                    </h2>
                    <p className="text-base text-gray-700 mb-6 leading-relaxed">
                      {t('howItWorks.step1Text')}
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 mt-1 flex-shrink-0 text-blue-600" />
                        <span>{t('howItWorks.step1Item1')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 mt-1 flex-shrink-0 text-blue-600" />
                        <span>{t('howItWorks.step1Item2')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 mt-1 flex-shrink-0 text-blue-600" />
                        <span>{t('howItWorks.step1Item3')}</span>
                      </li>
                    </ul>
                    {!user && (
                      <Link
                        to="/signup"
                        className="inline-block mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-8 text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                      >
                        {t('howItWorks.signUpNow')}
                      </Link>
                    )}
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="bg-white p-8 border border-gray-200 shadow-xl rounded-2xl h-64 flex items-center justify-center">
                    <UserPlus className="w-32 h-32 text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="bg-white p-8 border border-gray-200 shadow-xl rounded-2xl h-64 flex items-center justify-center">
                  <BookOpen className="w-32 h-32 text-green-500" />
                </div>
                <div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 md:p-12 border border-green-200 shadow-xl rounded-2xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white w-14 h-14 flex items-center justify-center text-2xl font-bold rounded-xl shadow-lg">
                        2
                      </div>
                      <BookOpen className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-gray-900">
                      {t('howItWorks.step2Title')}
                    </h2>
                    <p className="text-base text-gray-700 mb-6 leading-relaxed">
                      {t('howItWorks.step2Text')}
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 mt-1 flex-shrink-0 text-green-600" />
                        <span>{t('howItWorks.step2Item1')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 mt-1 flex-shrink-0 text-green-600" />
                        <span>{t('howItWorks.step2Item2')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 mt-1 flex-shrink-0 text-green-600" />
                        <span>{t('howItWorks.step2Item3')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-8 md:p-12 border border-yellow-200 shadow-xl rounded-2xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-gradient-to-br from-yellow-600 to-orange-600 text-white w-14 h-14 flex items-center justify-center text-2xl font-bold rounded-xl shadow-lg">
                        3
                      </div>
                      <MessageSquare className="w-10 h-10 text-orange-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-gray-900">
                      {t('howItWorks.step3Title')}
                    </h2>
                    <p className="text-base text-gray-700 mb-6 leading-relaxed">
                      {t('howItWorks.step3Text')}
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 mt-1 flex-shrink-0 text-orange-600" />
                        <span>{t('howItWorks.step3Item1')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 mt-1 flex-shrink-0 text-orange-600" />
                        <span>{t('howItWorks.step3Item2')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 mt-1 flex-shrink-0 text-orange-600" />
                        <span>{t('howItWorks.step3Item3')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="bg-white p-8 border border-gray-200 shadow-xl rounded-2xl h-64 flex items-center justify-center">
                    <MessageSquare className="w-32 h-32 text-yellow-500" />
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="bg-white p-8 border border-gray-200 shadow-xl rounded-2xl h-64 flex items-center justify-center">
                  <Sparkles className="w-32 h-32 text-pink-500" />
                </div>
                <div>
                  <div className="bg-gradient-to-br from-pink-50 to-purple-100 p-8 md:p-12 border border-pink-200 shadow-xl rounded-2xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-gradient-to-br from-pink-600 to-purple-600 text-white w-14 h-14 flex items-center justify-center text-2xl font-bold rounded-xl shadow-lg">
                        4
                      </div>
                      <Sparkles className="w-10 h-10 text-pink-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-gray-900">
                      {t('howItWorks.step4Title')}
                    </h2>
                    <p className="text-base text-gray-700 mb-6 leading-relaxed">
                      {t('howItWorks.step4Text')}
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 mt-1 flex-shrink-0 text-pink-600" />
                        <span>{t('howItWorks.step4Item1')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 mt-1 flex-shrink-0 text-pink-600" />
                        <span>{t('howItWorks.step4Item2')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 mt-1 flex-shrink-0 text-pink-600" />
                        <span>{t('howItWorks.step4Item3')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              {t('howItWorks.tipsTitle')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all rounded-2xl">
                <h3 className="text-xl font-bold mb-4 text-gray-900">{t('howItWorks.tip1Title')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('howItWorks.tip1Text')}
                </p>
              </div>
              <div className="bg-white border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all rounded-2xl">
                <h3 className="text-xl font-bold mb-4 text-gray-900">{t('howItWorks.tip2Title')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('howItWorks.tip2Text')}
                </p>
              </div>
              <div className="bg-white border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all rounded-2xl">
                <h3 className="text-xl font-bold mb-4 text-gray-900">{t('howItWorks.tip3Title')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('howItWorks.tip3Text')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 animate-gradient-pulse text-white relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">
              {t('howItWorks.readyTitle')}
            </h2>
            <p className="text-lg text-white/90 mb-8 drop-shadow">
              {t('howItWorks.readyText')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link
                    to="/signup"
                    className="bg-white/20 backdrop-blur-md text-white font-semibold py-4 px-8 text-sm rounded-lg border border-white/30 hover:bg-white/30 transition-all shadow-xl hover:shadow-2xl"
                  >
                    {t('howItWorks.createFreeAccount')}
                  </Link>
                  <Link
                    to="/"
                    className="bg-white/10 backdrop-blur-sm text-white font-semibold py-4 px-8 text-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                  >
                    {t('howItWorks.browseCharacters')}
                  </Link>
                </>
              ) : (
                <Link
                  to="/"
                  className="bg-white/20 backdrop-blur-md text-white font-semibold py-4 px-8 text-sm rounded-lg border border-white/30 hover:bg-white/30 transition-all shadow-xl hover:shadow-2xl"
                >
                  {t('howItWorks.startChattingNow')}
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
