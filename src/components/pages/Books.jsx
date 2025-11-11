import React, { useState, useEffect } from 'react';
import { BookOpen, User, Download, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../Navbar';
import Footer from '../Footer';

const Books = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/books');
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Failed to load books. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar user={user} onLogout={onLogout} />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <img src="/book.svg" alt="Loading" className="w-24 h-24 mx-auto mb-4 animate-pulse" />
            <p className="text-xl font-semibold text-gray-700">{t('books.loadingBooks')}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar user={user} onLogout={onLogout} />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-xl font-semibold text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchBooks}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 text-sm rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              {t('books.tryAgain')}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} onLogout={onLogout} />
      <main className="flex-1 bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30">
                <BookOpen className="w-10 h-10 md:w-12 md:h-12" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                {t('books.booksLibrary')}
              </h1>
            </div>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl">
              {t('books.exploreCollection')}
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">{books.length}</div>
                <div className="text-sm font-semibold text-gray-600">{t('books.classicBooks')}</div>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {books.reduce((sum, book) => sum + (book.character_count || 0), 0)}
                </div>
                <div className="text-sm font-semibold text-gray-600">{t('books.charactersAvailable')}</div>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {new Set(books.map(book => book.author)).size}
                </div>
                <div className="text-sm font-semibold text-gray-600">{t('books.renownedAuthors')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Books Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {books.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-24 h-24 mx-auto mb-6 text-gray-400" />
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('books.noBooksAvailable')}</h2>
                <p className="text-gray-600">{t('books.checkBackSoon')}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl hover:border-blue-300 transition-all overflow-hidden group"
                  >
                    {/* Book Cover */}
                    <div className="relative h-80 bg-gray-100 overflow-hidden">
                      <img
                        src={book.cover_image ? `http://localhost:3001${book.cover_image}` : '/book.svg'}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 notranslate"
                        onError={(e) => {
                          e.target.src = '/book.svg';
                        }}
                      />
                      {book.pdf_file && (
                        <div className="absolute top-4 right-4">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-lg font-semibold text-xs shadow-lg backdrop-blur-sm">
                            {t('books.pdfAvailable')}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Book Details */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 notranslate" translate="no">
                        {book.title}
                      </h3>
                      <p className="text-sm font-semibold text-gray-500 mb-4">
                        {t('books.by')} <span className="notranslate" translate="no">{book.author}</span>
                      </p>

                      {book.published_year && (
                        <div className="flex items-center gap-2 mb-3 text-sm">
                          <span className="font-semibold text-gray-700">{t('books.published')}</span>
                          <span className="text-gray-600">{book.published_year}</span>
                        </div>
                      )}

                      {book.genre && (
                        <div className="mb-4">
                          <span className="inline-block bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 font-semibold text-xs">
                            {book.genre}
                          </span>
                        </div>
                      )}

                      {book.description && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                          {book.description}
                        </p>
                      )}

                      {/* Character Count */}
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                        <User className="w-5 h-5 text-gray-500" />
                        <span className="font-semibold text-sm text-gray-700">
                          {book.character_count || 0} {book.character_count !== 1 ? t('books.charactersCount') : t('character.charactersAvailable')}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        {book.character_count > 0 ? (
                          <Link
                            to={`/book/${book.id}/characters`}
                            className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center font-semibold py-3 px-4 rounded-lg text-sm hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                          >
                            <span className="flex items-center justify-center gap-2">
                              <User className="w-4 h-4" />
                              {t('books.viewCharacters')}
                            </span>
                          </Link>
                        ) : (
                          <div className="block w-full bg-gray-100 text-gray-500 text-center font-semibold py-3 px-4 rounded-lg text-sm cursor-not-allowed border border-gray-200">
                            <span className="flex items-center justify-center gap-2">
                              <User className="w-4 h-4" />
                              {t('books.noCharactersYet')}
                            </span>
                          </div>
                        )}

                        {book.pdf_file && (
                          <a
                            href={`http://localhost:3001${book.pdf_file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center font-semibold py-3 px-4 rounded-lg text-sm hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                          >
                            <span className="flex items-center justify-center gap-2">
                              <Download className="w-4 h-4" />
                              {t('books.downloadPDF')}
                            </span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden py-20 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 animate-gradient-pulse text-white">
          {/* Animated Background Blobs */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">
              {t('books.startLiteraryJourney')}
            </h2>
            <p className="text-lg text-white/90 mb-8 drop-shadow">
              {t('books.chooseBookAndChat')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link
                    to="/signup"
                    className="bg-white/20 backdrop-blur-md text-white font-semibold py-4 px-8 text-sm rounded-lg border border-white/30 hover:bg-white/30 transition-all shadow-xl hover:shadow-2xl"
                  >
                    {t('books.createFreeAccount')}
                  </Link>
                  <Link
                    to="/"
                    className="bg-white/10 backdrop-blur-sm text-white font-semibold py-4 px-8 text-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                  >
                    {t('books.browseCharacters')}
                  </Link>
                </>
              ) : (
                <Link
                  to="/"
                  className="bg-white/20 backdrop-blur-md text-white font-semibold py-4 px-8 text-sm rounded-lg border border-white/30 hover:bg-white/30 transition-all shadow-xl hover:shadow-2xl"
                >
                  {t('books.startChattingNow')}
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

export default Books;
