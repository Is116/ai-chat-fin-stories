import { useState, useEffect } from 'react';
import { Book, Brain, Users, Sparkles, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

export default function AIBookProcessing({ user, onLogout }) {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [extractedCharacters, setExtractedCharacters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const response = await api.get('/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Failed to load books:', error);
    }
  };

  const loadProcessingStatus = async (bookId) => {
    try {
      const response = await api.get(`/ai-processing/status/${bookId}`);
      setProcessingStatus(response.data);
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  };

  const loadExtractedCharacters = async (bookId) => {
    try {
      const response = await api.get(`/ai-processing/extracted-characters/${bookId}`);
      setExtractedCharacters(response.data);
    } catch (error) {
      console.error('Failed to load extracted characters:', error);
    }
  };

  const handleProcessBook = async (bookId) => {
    setLoading(true);
    try {
      await api.post(`/ai-processing/process-book/${bookId}`);
      alert('Book processing started! This may take a few minutes.');
      
      // Poll for status updates
      const interval = setInterval(async () => {
        await loadProcessingStatus(bookId);
      }, 5000);

      setTimeout(() => clearInterval(interval), 60000); // Stop after 1 minute
    } catch (error) {
      alert('Failed to start processing: ' + error.message);
    }
    setLoading(false);
  };

  const handleExtractCharacters = async (bookId) => {
    setLoading(true);
    try {
      await api.post(`/ai-processing/extract-characters/${bookId}`);
      alert('Character extraction started! This may take a minute.');
      
      setTimeout(async () => {
        await loadExtractedCharacters(bookId);
        await loadProcessingStatus(bookId);
      }, 30000); // Check after 30 seconds
    } catch (error) {
      alert('Failed to extract characters: ' + error.message);
    }
    setLoading(false);
  };

  const handleApproveCharacter = async (extractedChar) => {
    try {
      await api.post(`/ai-processing/approve-character/${extractedChar.id}`, {
        name: extractedChar.name,
        description: extractedChar.brief_description,
      });
      alert(`${extractedChar.name} approved!`);
      await loadExtractedCharacters(selectedBook.id);
      await loadProcessingStatus(selectedBook.id);
    } catch (error) {
      alert('Failed to approve character: ' + error.message);
    }
  };

  const handleGeneratePersona = async (characterId) => {
    setLoading(true);
    try {
      await api.post(`/ai-processing/generate-persona/${characterId}`);
      alert('Persona generation started! Check back in a minute.');
    } catch (error) {
      alert('Failed to generate persona: ' + error.message);
    }
    setLoading(false);
  };

  const handleGenerateAllPersonas = async (bookId) => {
    setLoading(true);
    try {
      await api.post(`/ai-processing/generate-all-personas/${bookId}`);
      alert('Generating personas for all characters! This may take several minutes.');
    } catch (error) {
      alert('Failed to generate personas: ' + error.message);
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
      case 'processing':
      case 'extracting_characters':
        return <Brain className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'chunks_created':
      case 'characters_extracted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Pending',
      processing: 'Processing Book...',
      chunks_created: 'Ready for Character Extraction',
      extracting_characters: 'Extracting Characters...',
      characters_extracted: 'Characters Extracted',
      error: 'Error',
    };
    return statusMap[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600">
      {/* Header */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-white" />
              <h1 className="text-xl font-bold text-white">AI Book Processing</h1>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Books Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {books.map(book => (
            <div
              key={book.id}
              onClick={() => {
                setSelectedBook(book);
                loadProcessingStatus(book.id);
                loadExtractedCharacters(book.id);
              }}
              className={`bg-white/95 backdrop-blur-md rounded-xl p-6 cursor-pointer transition-all ${
                selectedBook?.id === book.id
                  ? 'ring-4 ring-purple-500 shadow-2xl'
                  : 'hover:shadow-xl hover:scale-105'
              }`}
            >
              <div className="flex items-start gap-4">
                <img
                  src={book.cover_image || '/book.svg'}
                  alt={book.title}
                  className="w-16 h-20 object-cover rounded shadow"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{book.title}</h3>
                  <p className="text-sm text-gray-600">{book.author}</p>
                  {book.processing_status && (
                    <div className="mt-2 flex items-center gap-2">
                      {getStatusIcon(book.processing_status)}
                      <span className="text-xs text-gray-500">
                        {getStatusText(book.processing_status)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Book Details */}
        {selectedBook && (
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {selectedBook.title}
            </h2>

            {/* Processing Status */}
            {processingStatus && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  {getStatusIcon(processingStatus.status)}
                  Status: {getStatusText(processingStatus.status)}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Text Chunks</p>
                    <p className="text-2xl font-bold text-purple-600">{processingStatus.totalChunks}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Extracted</p>
                    <p className="text-2xl font-bold text-blue-600">{processingStatus.charactersExtracted}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{processingStatus.charactersApproved}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">With Personas</p>
                    <p className="text-2xl font-bold text-fuchsia-600">{processingStatus.charactersWithPersona}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={() => handleProcessBook(selectedBook.id)}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                <Book className="w-5 h-5" />
                Process Book
              </button>
              <button
                onClick={() => handleExtractCharacters(selectedBook.id)}
                disabled={loading || !processingStatus?.totalChunks}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                <Users className="w-5 h-5" />
                Extract Characters
              </button>
              <button
                onClick={() => handleGenerateAllPersonas(selectedBook.id)}
                disabled={loading || !processingStatus?.charactersApproved}
                className="px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Generate All Personas
              </button>
            </div>

            {/* Extracted Characters */}
            {extractedCharacters.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Extracted Characters</h3>
                <div className="space-y-3">
                  {extractedCharacters.map(char => (
                    <div
                      key={char.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{char.name}</h4>
                        <p className="text-sm text-gray-600">{char.role}</p>
                        <p className="text-sm text-gray-500 mt-1">{char.brief_description}</p>
                        <p className="text-xs text-gray-400 mt-1">Mentions: {char.mention_count}</p>
                      </div>
                      {char.extraction_status === 'extracted' && (
                        <button
                          onClick={() => handleApproveCharacter(char)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          Approve
                        </button>
                      )}
                      {char.extraction_status === 'approved' && (
                        <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                          ✓ Approved
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
