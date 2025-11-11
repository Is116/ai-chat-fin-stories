import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '../Navbar';
import Footer from '../Footer';
import CharacterCard from '../CharacterCard';

const BookCharacters = ({ user, onLogout, onSelectCharacter }) => {
  const { t } = useTranslation();
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookAndCharacters();
  }, [bookId]);

  const fetchBookAndCharacters = async () => {
    try {
      // Fetch all characters and filter by book
      const response = await fetch('http://localhost:3001/api/characters');
      const data = await response.json();
      
      // Filter characters for this book
      const bookCharacters = data.filter(char => String(char.book_id) === String(bookId));
      
      if (bookCharacters.length > 0) {
        // Extract book info from first character
        const firstChar = bookCharacters[0];
        setBook({
          id: bookId,
          title: firstChar.book_title,
          author: firstChar.book_author,
          description: firstChar.book_description,
          cover_image: firstChar.book_cover_image,
          published_year: firstChar.published_year,
          genre: firstChar.genre
        });
        setCharacters(bookCharacters);
      }
    } catch (error) {
      console.error('Error fetching book characters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCharacter = (character) => {
    if (!user) {
      if (window.confirm('Please log in to start chatting with characters. Would you like to log in now?')) {
        navigate('/login');
      }
      return;
    }
    onSelectCharacter(character);
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 animate-pulse text-blue-600" />
          <p className="text-xl font-semibold text-gray-700">{t('bookCharacters.loadingCharacters')}</p>
        </div>
      </div>
    );
  }

  if (!book || characters.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('bookCharacters.bookNotFound')}</h1>
            <p className="text-lg text-gray-600 mb-8">
              {t('bookCharacters.noCharactersFound')}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-lg text-sm hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('bookCharacters.backToHome')}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      
      <main className="flex-1">
        {/* Book Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-6 py-16">
            {/* Back Button */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-semibold py-2.5 px-5 rounded-lg text-sm border border-white/30 hover:bg-white/30 transition-all mb-8 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('bookCharacters.backToHome')}
            </Link>

            <div className="grid md:grid-cols-[300px_1fr] gap-8 items-start">
              {/* Book Cover */}
              <div className="flex justify-center md:justify-start">
                <img
                  src={book.cover_image ? `http://localhost:3001${book.cover_image}` : '/book.svg'}
                  alt={book.title}
                  className="w-full max-w-[280px] h-auto aspect-[2/3] object-cover border-2 border-white/30 shadow-2xl rounded-2xl bg-white backdrop-blur-sm notranslate"
                  translate="no"
                  onError={(e) => {
                    e.target.src = '/book.svg';
                  }}
                />
              </div>

              {/* Book Info */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight tracking-tight notranslate" translate="no">
                    {book.title}
                  </h1>
                  <p className="text-lg md:text-xl font-semibold text-white/90 mb-4">
                    {t('bookCharacters.by')} <span className="notranslate" translate="no">{book.author}</span>
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-3">
                  {book.genre && (
                    <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 text-sm font-semibold border border-white/30 rounded-full">
                      {book.genre}
                    </span>
                  )}
                  {book.published_year && (
                    <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 text-sm font-semibold border border-white/30 rounded-full">
                      {book.published_year}
                    </span>
                  )}
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-2 text-sm font-bold rounded-full shadow-lg">
                    {characters.length} {t('bookCharacters.characters', { count: characters.length })}
                  </span>
                </div>

                {/* Description */}
                {book.description && (
                  <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-lg">
                    <p className="text-base md:text-lg leading-relaxed text-white/95">
                      {book.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Characters Section */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {t('bookCharacters.meetCharacters')} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('bookCharacters.theCharacters')}</span>
            </h2>
            <p className="text-lg text-gray-600">
              {t('bookCharacters.chooseCharacter')}
            </p>
          </div>

          {/* Characters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onSelect={handleSelectCharacter}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookCharacters;
