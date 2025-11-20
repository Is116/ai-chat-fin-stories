import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, LogIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CharacterCard from './CharacterCard';

const CharacterSelection = ({ characters, onSelectCharacter, user }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const bookFilter = searchParams.get('book');
  
  const [books, setBooks] = useState([]);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [isPausedBooks, setIsPausedBooks] = useState(false);
  const [isPausedCharacters, setIsPausedCharacters] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState('next');
  const [filteredCharacters, setFilteredCharacters] = useState([]);

  // Number of books to show at once
  const booksPerView = 3;

  // Filter characters by book if URL parameter is present
  useEffect(() => {
    if (bookFilter) {
      const filtered = characters.filter(char => String(char.book_id) === String(bookFilter));
      setFilteredCharacters(filtered);
    } else {
      setFilteredCharacters(characters);
    }
  }, [characters, bookFilter]);

  // Group characters by book
  useEffect(() => {
    const groupedBooks = {};
    
    filteredCharacters.forEach(character => {
      const bookKey = character.book_title || 'Unknown Book';
      if (!groupedBooks[bookKey]) {
        groupedBooks[bookKey] = {
          id: character.bookId, // Add book ID
          title: character.book_title,
          author: character.book_author,
          description: character.book_description,
          cover_image: character.book_cover_image,
          published_year: character.published_year,
          genre: character.genre,
          characters: []
        };
      }
      groupedBooks[bookKey].characters.push(character);
    });

    // Convert to array and sort by title
    const booksArray = Object.values(groupedBooks).sort((a, b) => 
      a.title.localeCompare(b.title)
    );
    
    setBooks(booksArray);
  }, [filteredCharacters]);

  // Get visible books for carousel
  const getVisibleBooks = () => {
    if (books.length === 0) return [];
    if (books.length <= booksPerView) return books;
    
    const visible = [];
    for (let i = 0; i < booksPerView; i++) {
      visible.push(books[(currentBookIndex + i) % books.length]);
    }
    return visible;
  };

  // Auto-slide books carousel
  useEffect(() => {
    if (books.length === 0 || isPausedBooks) return;
    
    const interval = setInterval(() => {
      setCurrentBookIndex((prev) => (prev + 1) % books.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [books.length, isPausedBooks]);

  // Auto-slide characters carousel
  useEffect(() => {
    if (characters.length === 0 || isPausedCharacters) return;
    
    const interval = setInterval(() => {
      setCurrentCharacterIndex((prev) => (prev + 1) % characters.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [characters.length, isPausedCharacters]);

  const nextBook = () => {
    if (isTransitioning) return;
    setSlideDirection('next');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentBookIndex((prev) => (prev + 1) % books.length);
      setIsTransitioning(false);
    }, 50);
    setIsPausedBooks(true);
    setTimeout(() => setIsPausedBooks(false), 10000);
  };

  const prevBook = () => {
    if (isTransitioning) return;
    setSlideDirection('prev');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentBookIndex((prev) => (prev - 1 + books.length) % books.length);
      setIsTransitioning(false);
    }, 50);
    setIsPausedBooks(true);
    setTimeout(() => setIsPausedBooks(false), 10000);
  };

  const nextCharacter = () => {
    if (isTransitioning) return;
    setSlideDirection('next');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentCharacterIndex((prev) => (prev + 1) % characters.length);
      setIsTransitioning(false);
    }, 50);
    setIsPausedCharacters(true);
    setTimeout(() => setIsPausedCharacters(false), 10000);
  };

  const prevCharacter = () => {
    if (isTransitioning) return;
    setSlideDirection('prev');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentCharacterIndex((prev) => (prev - 1 + characters.length) % characters.length);
      setIsTransitioning(false);
    }, 50);
    setIsPausedCharacters(true);
    setTimeout(() => setIsPausedCharacters(false), 10000);
  };

  const goToBook = (index) => {
    if (isTransitioning) return;
    setSlideDirection(index > currentBookIndex ? 'next' : 'prev');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentBookIndex(index);
      setIsTransitioning(false);
    }, 50);
    setIsPausedBooks(true);
    setTimeout(() => setIsPausedBooks(false), 10000);
  };

  const goToCharacter = (index) => {
    if (isTransitioning) return;
    setSlideDirection(index > currentCharacterIndex ? 'next' : 'prev');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentCharacterIndex(index);
      setIsTransitioning(false);
    }, 50);
    setIsPausedCharacters(true);
    setTimeout(() => setIsPausedCharacters(false), 10000);
  };

  const handleSelectCharacter = (character) => {
    if (!user) {
      // Show alert or redirect to login
      if (window.confirm('Please log in to start chatting with characters. Would you like to log in now?')) {
        window.location.href = '/login';
      }
      return;
    }
    onSelectCharacter(character);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Login Prompt Banner */}
      {!user && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 animate-gradient-fast border-b border-blue-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-white">
                <LogIn className="w-5 h-5" />
                <p className="font-medium text-base">
                  {t('hero.loginPrompt')}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="bg-white text-blue-600 font-semibold py-2.5 px-6 rounded-lg text-sm hover:bg-gray-50 transition-all shadow-md hover:shadow-lg"
                >
                  {t('auth.loginButton')}
                </Link>
                <Link
                  to="/signup"
                  className="bg-white/10 backdrop-blur-sm text-white font-semibold py-2.5 px-6 rounded-lg text-sm border border-white/30 hover:bg-white/20 transition-all"
                >
                  {t('auth.signupButton')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-gradient text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium tracking-wide">Powered by Claude AI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t('hero.title').split('\n')[0]}<br />
              <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                {t('hero.title').split('\n')[1] || 'Favorite Characters'}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl font-normal mb-8 max-w-2xl leading-relaxed text-white/90">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-wrap gap-3 text-sm font-medium">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <BookOpen className="w-4 h-4" />
                <span>{books.length} {books.length !== 1 ? t('hero.classicBooksPlural') : t('hero.classicBooks')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span>{filteredCharacters.length} {filteredCharacters.length !== 1 ? t('hero.literaryIconsPlural') : t('hero.literaryIcons')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span>{t('hero.realtimeResponses')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span>{t('hero.authenticPersonalities')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Books & Characters Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Book Filter Indicator */}
        {bookFilter && books.length > 0 && (
          <div className="mb-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-bold">
                    {t('character.filteredByBook')}
                  </h3>
                </div>
                <p className="text-base font-medium text-gray-700">
                  {t('character.showingCharactersFrom')} <span className="text-blue-600 notranslate" translate="no">{books[0]?.title}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredCharacters.length} {filteredCharacters.length !== 1 ? t('character.charactersAvailablePlural') : t('character.charactersAvailable')}
                </p>
              </div>
              <button
                onClick={() => setSearchParams({})}
                className="bg-gradient-to-r from-gray-900 to-gray-800 text-white font-medium py-2.5 px-6 rounded-lg text-sm hover:from-gray-800 hover:to-gray-700 transition-all shadow-md"
              >
                {t('books.clearFilter')}
              </button>
            </div>
          </div>
        )}
        
        {/* Section 1: Books Carousel */}
        <div className="mb-20">
          <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-3">
                {t('books.exploreClassicBooks').split(' ').slice(0, 1).join(' ')} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('books.exploreClassicBooks').split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className="text-lg text-gray-600 font-normal">
                {t('books.discoverTimeless')}
              </p>
            </div>
            {!bookFilter && books.length > booksPerView && (
              <div className="flex items-center gap-3">
                <button
                  onClick={prevBook}
                  className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 p-2.5 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm"
                  aria-label="Previous book"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-semibold text-base min-w-[70px] text-center text-gray-700">
                  {currentBookIndex + 1} / {books.length}
                </span>
                <button
                  onClick={nextBook}
                  className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 p-2.5 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm"
                  aria-label="Next book"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {books.length > 0 && (
            <div className="relative">
              {/* Books Grid Carousel */}
              <div 
                className="relative"
                onMouseEnter={() => setIsPausedBooks(true)}
                onMouseLeave={() => setIsPausedBooks(false)}
              >
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getVisibleBooks().map((book, idx) => (
                    <div 
                      key={`${book.title}-${idx}`}
                      className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all overflow-hidden group"
                    >
                      <div className="grid grid-rows-[300px_1fr]">
                        {/* Book Cover */}
                        <div className="relative bg-gray-100 overflow-hidden">
                          <img 
                            src={book.cover_image ? `http://localhost:3001${book.cover_image}` : '/book.svg'} 
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 notranslate"
                            onError={(e) => {
                              e.target.src = '/book.svg';
                            }}
                          />
                        </div>

                        {/* Book Info */}
                        <div className="p-6 space-y-4">
                          {/* Title & Author */}
                          <div>
                            <h3 className="text-xl font-bold mb-1 leading-tight text-gray-900 line-clamp-2 notranslate" translate="no">
                              {book.title}
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">
                              by <span className="notranslate" translate="no">{book.author}</span>
                            </p>
                          </div>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {book.genre && (
                              <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 text-xs font-semibold rounded-full shadow-sm">
                                {book.genre}
                              </span>
                            )}
                            {book.published_year && (
                              <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 text-xs font-semibold rounded-full shadow-sm">
                                {book.published_year}
                              </span>
                            )}
                          </div>

                          {/* Characters Count */}
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-700">
                              {book.characters.length} Character{book.characters.length !== 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* Description */}
                          {book.description && (
                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                              {book.description}
                            </p>
                          )}

                          {/* Action Button */}
                          <div className="pt-2">
                            <Link
                              to={`/book/${book.id}/characters`}
                              className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2.5 px-4 rounded-lg text-sm hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                            >
                              View Characters
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Indicators */}
              {books.length > booksPerView && (
                <div className="flex justify-center gap-2 mt-8">
                  {books.map((book, index) => (
                    <button
                      key={index}
                      onClick={() => goToBook(index)}
                      className={`transition-all rounded-full ${
                        index === currentBookIndex 
                          ? 'w-8 h-2 bg-gradient-to-r from-blue-600 to-purple-600' 
                          : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to ${book.title}`}
                      title={book.title}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Characters Carousel */}
        <div>
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-3">
              {t('character.meetTheCharacters').split(' ').slice(0, -1).join(' ')} <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{t('character.meetTheCharacters').split(' ').slice(-1)}</span>
            </h2>
            <p className="text-lg text-gray-600 font-normal">
              {t('character.chatWithLegendary')}
            </p>
          </div>

          {characters.length > 0 && (
            <div 
              className="relative overflow-hidden"
              onMouseEnter={() => setIsPausedCharacters(true)}
              onMouseLeave={() => setIsPausedCharacters(false)}
            >
              {/* Character Carousel */}
              <div className="flex items-center gap-4">
                {/* Previous Button */}
                <button
                  onClick={prevCharacter}
                  className="flex-shrink-0 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 p-3 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Character Cards - Show 3 at a time with smooth slide */}
                <div className="flex-1 overflow-hidden">
                  <div 
                    className="transition-all duration-700 ease-in-out"
                    style={{
                      transform: `translateX(${isTransitioning ? (slideDirection === 'next' ? '-10%' : '10%') : '0'})`,
                      opacity: isTransitioning ? 0.7 : 1
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[0, 1, 2].map((offset) => {
                        const index = (currentCharacterIndex + offset) % characters.length;
                        const character = characters[index];
                        return (
                          <div
                            key={character.id}
                            className="transition-transform duration-700 ease-in-out"
                          >
                            <CharacterCard
                              character={character}
                              onSelect={handleSelectCharacter}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Next Button */}
                <button
                  onClick={nextCharacter}
                  className="flex-shrink-0 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 p-3 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Carousel Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {characters.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToCharacter(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentCharacterIndex ? 'bg-gradient-to-r from-purple-600 to-pink-600 w-6' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to character ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-100 hover:shadow-xl transition-all">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('features.aiPowered.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.aiPowered.description')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100 hover:shadow-xl transition-all">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('features.richLibrary.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.richLibrary.description')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-red-50 p-8 rounded-2xl border border-pink-100 hover:shadow-xl transition-all">
              <div className="bg-gradient-to-r from-pink-600 to-red-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">{t('features.naturalDialogue.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.naturalDialogue.description')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 hover:shadow-xl transition-all">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">{t('features.privateSecure.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('features.privateSecure.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">{books.length}+</div>
              <div className="text-lg text-white/80">{t('stats.classicBooks')}</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">{filteredCharacters.length}+</div>
              <div className="text-lg text-white/80">{t('stats.literaryCharacters')}</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">∞</div>
              <div className="text-lg text-white/80">{t('stats.conversations')}</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-lg text-white/80">{t('stats.availability')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works - Detailed */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('howItWorks.title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl">
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">{t('howItWorks.step1.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('howItWorks.step1.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl">
                <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">{t('howItWorks.step2.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('howItWorks.step2.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-pink-100 to-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl">
                <span className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">{t('howItWorks.step3.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 animate-gradient-pulse py-20 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-6 text-center text-white relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg">
              {t('cta.title')}
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto drop-shadow">
              {t('cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-purple-600 font-bold py-4 px-10 rounded-xl text-lg hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-translate-y-1"
              >
                {t('cta.getStartedFree')}
              </Link>
              <Link
                to="/login"
                className="bg-white/20 backdrop-blur-md text-white font-bold py-4 px-10 rounded-xl text-lg border-2 border-white/50 hover:bg-white/30 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                {t('cta.signIn')}
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/80 drop-shadow">{t('cta.noCreditCard')}</p>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-3">{t('cta.authenticConversations')}</h3>
              <p className="text-gray-600 font-normal leading-relaxed">
                {t('cta.authenticConversationsText')}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">{t('cta.stayInCharacter')}</h3>
              <p className="text-gray-600 font-normal leading-relaxed">
                {t('cta.stayInCharacterText')}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3">{t('cta.endlessPossibilities')}</h3>
              <p className="text-gray-600 font-normal leading-relaxed">
                {t('cta.endlessPossibilitiesText')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelection;
