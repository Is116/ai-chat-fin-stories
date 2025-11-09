import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, LogIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import CharacterCard from './CharacterCard';

const CharacterSelection = ({ characters, onSelectCharacter, user }) => {
  const [books, setBooks] = useState([]);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [isPausedBooks, setIsPausedBooks] = useState(false);
  const [isPausedCharacters, setIsPausedCharacters] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState('next');

  // Group characters by book
  useEffect(() => {
    const groupedBooks = {};
    
    characters.forEach(character => {
      const bookKey = character.book_title || 'Unknown Book';
      if (!groupedBooks[bookKey]) {
        groupedBooks[bookKey] = {
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
  }, [characters]);

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
    <div className="min-h-screen bg-white">
      {/* Login Prompt Banner */}
      {!user && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <LogIn className="w-6 h-6" />
                <p className="font-bold text-lg">
                  Sign in to start chatting with your favorite literary characters!
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="bg-black text-white font-bold py-3 px-6 uppercase text-sm border-2 border-black hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-white text-black font-bold py-3 px-6 uppercase text-sm border-2 border-black hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-4xl">
            <div className="inline-block bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wide">Powered by Claude AI</span>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight uppercase">
              Chat with YOUR<br />
              <span className="text-yellow-300">Favorite Characters</span>
            </h1>
            
            <p className="text-xl md:text-2xl font-medium mb-8 max-w-2xl leading-relaxed">
              Step into the world of classic literature. Engage in authentic conversations with iconic characters powered by advanced AI technology.
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm font-bold">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <BookOpen className="w-4 h-4" />
                <span>{books.length} Classic Books</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span>{characters.length} Literary Icons</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span>Real-time Responses</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span>Authentic Personalities</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span>Conversation History</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Books & Characters Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        
        {/* Section 1: Books Carousel */}
        <div className="mb-20">
          <div className="mb-12">
            <h2 className="text-5xl font-black uppercase mb-4">
              Explore <span className="text-blue-600">Classic Books</span>
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              Discover timeless literary masterpieces
            </p>
          </div>

          {books.length > 0 && (
            <div className="relative">
              {/* Carousel Container */}
              <div 
                className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
                onMouseEnter={() => setIsPausedBooks(true)}
                onMouseLeave={() => setIsPausedBooks(false)}
              >
                <div className="relative" style={{ minHeight: '400px' }}>
                  {/* Slide Animation Container */}
                  <div 
                    className="transition-transform duration-700 ease-in-out"
                    style={{
                      transform: `translateX(${slideDirection === 'next' && isTransitioning ? '-100%' : slideDirection === 'prev' && isTransitioning ? '100%' : '0'})`,
                      opacity: isTransitioning ? 0 : 1
                    }}
                  >
                    <div className="p-8 md:p-12">
                      <div className="flex flex-col md:flex-row gap-8 items-center">
                        {/* Book Cover */}
                        <div className="flex-shrink-0">
                          <img 
                            src={books[currentBookIndex].cover_image || '/book.svg'} 
                            alt={books[currentBookIndex].title}
                            className="w-64 h-80 object-contain border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-br from-blue-500 to-purple-600 p-8"
                          />
                        </div>

                        {/* Book Info */}
                        <div className="flex-1">
                          <div className="mb-6">
                            <h3 className="text-4xl font-black uppercase mb-3">
                              {books[currentBookIndex].title}
                            </h3>
                            <p className="text-2xl text-gray-600 font-bold mb-4">
                              by {books[currentBookIndex].author}
                            </p>
                            
                            <div className="flex flex-wrap gap-3 mb-6">
                              {books[currentBookIndex].genre && (
                                <span className="bg-purple-500 text-white px-4 py-2 text-sm font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                  {books[currentBookIndex].genre}
                                </span>
                              )}
                              {books[currentBookIndex].published_year && (
                                <span className="bg-green-500 text-white px-4 py-2 text-sm font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                  {books[currentBookIndex].published_year}
                                </span>
                              )}
                              <span className="bg-blue-500 text-white px-4 py-2 text-sm font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                {books[currentBookIndex].characters.length} Characters
                              </span>
                            </div>
                          </div>

                          {books[currentBookIndex].description && (
                            <p className="text-lg text-gray-700 leading-relaxed mb-6">
                              {books[currentBookIndex].description}
                            </p>
                          )}

                          {/* Book Navigation */}
                          <div className="flex items-center gap-4">
                            <button
                              onClick={prevBook}
                              className="bg-black text-white p-3 border-2 border-black hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </button>
                            <span className="font-bold text-lg">
                              {currentBookIndex + 1} / {books.length}
                            </span>
                            <button
                              onClick={nextBook}
                              className="bg-black text-white p-3 border-2 border-black hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carousel Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {books.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToBook(index)}
                    className={`w-3 h-3 border-2 border-black transition-colors ${
                      index === currentBookIndex ? 'bg-black' : 'bg-white'
                    }`}
                    aria-label={`Go to book ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Characters Carousel */}
        <div>
          <div className="mb-12">
            <h2 className="text-5xl font-black uppercase mb-4">
              Meet the <span className="text-purple-600">Characters</span>
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              Chat with legendary literary figures
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
                  className="flex-shrink-0 bg-black text-white p-4 border-2 border-black hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10"
                >
                  <ChevronLeft className="w-8 h-8" />
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
                  className="flex-shrink-0 bg-black text-white p-4 border-2 border-black hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>

              {/* Carousel Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {characters.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToCharacter(index)}
                    className={`w-2 h-2 border-2 border-black transition-colors ${
                      index === currentCharacterIndex ? 'bg-black' : 'bg-white'
                    }`}
                    aria-label={`Go to character ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-100 border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-black uppercase mb-3">How It Works</h3>
              <p className="text-gray-700 font-medium">
                Select a character, start chatting, and experience conversations that feel authentic to their personality and story.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase mb-3">Stay in Character</h3>
              <p className="text-gray-700 font-medium">
                Each character maintains their unique voice, mannerisms, and perspective throughout your conversation.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase mb-3">Endless Possibilities</h3>
              <p className="text-gray-700 font-medium">
                Ask questions, seek advice, or simply enjoy a unique dialogue with literature's most beloved figures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelection;
