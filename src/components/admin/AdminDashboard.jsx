import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, LogOut, User as UserIcon, Users, BookOpen, Shield, MessageSquare, Library, ChevronDown, ChevronRight, Upload, X } from 'lucide-react';

const AdminDashboard = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState('books'); // 'books', 'characters', or 'users'
  const [books, setBooks] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [users, setUsers] = useState([]);
  const [expandedBooks, setExpandedBooks] = useState(new Set()); // Track which books are expanded
  const [isLoading, setIsLoading] = useState(true);
  const [showBookForm, setShowBookForm] = useState(false);
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null); // For viewing character details
  const navigate = useNavigate();

  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: '',
    description: '',
    cover_image: '',
    published_year: '',
    genre: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    book_id: '',
    personality: '',
    avatar: '',
    image: '',
    color: 'from-blue-500 to-blue-600',
    greeting: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [bookImageFile, setBookImageFile] = useState(null);
  const [bookImagePreview, setBookImagePreview] = useState(null);
  const [bookPdfFile, setBookPdfFile] = useState(null);
  const [bookPdfFileName, setBookPdfFileName] = useState(null);

  useEffect(() => {
    if (activeTab === 'books') {
      fetchBooks();
    } else if (activeTab === 'characters') {
      fetchCharacters();
      fetchBooks(); // Also fetch books for the dropdown
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      // Fetch books
      const booksResponse = await fetch('http://localhost:3001/api/books');
      const booksData = await booksResponse.json();
      
      // Fetch all characters to group by book
      const charactersResponse = await fetch('http://localhost:3001/api/characters');
      const charactersData = await charactersResponse.json();
      
      // Add characters array to each book
      const booksWithCharacters = booksData.map(book => ({
        ...book,
        characters: charactersData.filter(char => char.book_id === book.id)
      }));
      
      setBooks(booksWithCharacters);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookExpansion = (bookId) => {
    const newExpanded = new Set(expandedBooks);
    if (newExpanded.has(bookId)) {
      newExpanded.delete(bookId);
    } else {
      newExpanded.add(bookId);
    }
    setExpandedBooks(newExpanded);
  };

  const fetchCharacters = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/characters');
      const data = await response.json();
      setCharacters(data);
    } catch (error) {
      console.error('Error fetching characters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3001/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('Users data is not an array:', data);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      const url = editingBook
        ? `http://localhost:3001/api/books/${editingBook.id}`
        : 'http://localhost:3001/api/books';
      
      const method = editingBook ? 'PUT' : 'POST';

      let response;

      // Always use FormData if there's an image or PDF file
      if (bookImageFile || bookPdfFile) {
        const formData = new FormData();
        formData.append('title', bookFormData.title);
        formData.append('author', bookFormData.author);
        formData.append('description', bookFormData.description);
        formData.append('published_year', bookFormData.published_year);
        formData.append('genre', bookFormData.genre);
        
        if (bookImageFile) {
          formData.append('cover_image', bookImageFile);
        }
        
        if (bookPdfFile) {
          formData.append('pdf_file', bookPdfFile);
        }

        response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      } else {
        // No files, use JSON
        response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(bookFormData)
        });
      }

      if (!response.ok) throw new Error('Failed to save book');

      await fetchBooks();
      resetBookForm();
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Failed to save book');
    }
  };

  const handleDeleteBook = async (id) => {
    if (!confirm('Are you sure you want to delete this book? This will also delete all associated characters.')) return;

    const token = localStorage.getItem('adminToken');

    try {
      const response = await fetch(`http://localhost:3001/api/books/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete book');
      }

      await fetchBooks();
      alert('Book deleted successfully');
    } catch (error) {
      console.error('Delete book error:', error);
      alert(error.message);
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setBookFormData({
      title: book.title,
      author: book.author,
      description: book.description || '',
      cover_image: book.cover_image || '',
      pdf_file: book.pdf_file || '',
      published_year: book.published_year || '',
      genre: book.genre || ''
    });
    // Set image preview if book has a cover image
    if (book.cover_image) {
      setBookImagePreview(book.cover_image);
    }
    // Set PDF file name if book has a PDF
    if (book.pdf_file) {
      const fileName = book.pdf_file.split('/').pop();
      setBookPdfFileName(fileName);
    }
    setShowBookForm(true);
  };

  const resetBookForm = () => {
    setShowBookForm(false);
    setEditingBook(null);
    setBookImageFile(null);
    setBookImagePreview(null);
    setBookPdfFile(null);
    setBookPdfFileName(null);
    setBookFormData({
      title: '',
      author: '',
      description: '',
      cover_image: '',
      pdf_file: '',
      published_year: '',
      genre: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      const url = editingCharacter
        ? `http://localhost:3001/api/characters/${editingCharacter.id}`
        : 'http://localhost:3001/api/characters';
      
      const method = editingCharacter ? 'PUT' : 'POST';

      let body;
      let headers = {
        'Authorization': `Bearer ${token}`
      };

      // If there's an image file to upload, use FormData
      if (imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('book_id', formData.book_id);
        formDataToSend.append('personality', formData.personality);
        formDataToSend.append('avatar', formData.avatar);
        formDataToSend.append('color', formData.color);
        formDataToSend.append('greeting', formData.greeting);
        formDataToSend.append('image', imageFile);
        
        body = formDataToSend;
        // Don't set Content-Type for FormData - browser will set it with boundary
      } else {
        // Otherwise use JSON
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(formData);
      }

      const response = await fetch(url, {
        method,
        headers,
        body
      });

      if (!response.ok) throw new Error('Failed to save character');

      await fetchCharacters();
      await fetchBooks(); // Refresh books to update character counts
      resetForm();
    } catch (error) {
      console.error('Error saving character:', error);
      alert('Failed to save character');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this character?')) return;

    const token = localStorage.getItem('adminToken');

    try {
      const response = await fetch(`http://localhost:3001/api/characters/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete character');

      await fetchCharacters();
    } catch (error) {
      console.error('Error deleting character:', error);
      alert('Failed to delete character');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their conversations and messages.')) return;

    const token = localStorage.getItem('adminToken');

    try {
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete user');

      await fetchUsers();
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleEdit = (character) => {
    setEditingCharacter(character);
    setFormData({
      name: character.name,
      book_id: character.book_id,
      personality: character.personality,
      avatar: character.avatar || '',
      image: character.image || '',
      color: character.color,
      greeting: character.greeting
    });
    // Set image preview if character has an image
    if (character.image) {
      setImagePreview(character.image);
    }
    setShowCharacterForm(true);
    setSelectedCharacter(null); // Close detail view when editing
  };

  const handleViewCharacter = (character) => {
    setSelectedCharacter(character);
    setShowCharacterForm(false);
    setEditingCharacter(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, WebP, or SVG)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image: '' });
  };

  const handleBookImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, WebP, or SVG)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setBookImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setBookImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBookImage = () => {
    setBookImageFile(null);
    setBookImagePreview(null);
    setBookFormData({ ...bookFormData, cover_image: '' });
  };

  const handleBookPdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        alert('Please select a valid PDF file');
        return;
      }

      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert('PDF file size should be less than 100MB');
        return;
      }

      setBookPdfFile(file);
      setBookPdfFileName(file.name);
    }
  };

  const removeBookPdf = async () => {
    // If there's an existing PDF (already saved to database), delete it from the server
    if (bookFormData.pdf_file && !bookPdfFile && editingBook) {
      if (!confirm('Are you sure you want to permanently delete this PDF?')) return;

      const token = localStorage.getItem('adminToken');
      
      try {
        const response = await fetch(`http://localhost:3001/api/books/${editingBook.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...bookFormData,
            pdf_file: null // Set to null to delete the PDF
          })
        });

        if (!response.ok) throw new Error('Failed to delete PDF');

        // Update local state
        setBookFormData({ ...bookFormData, pdf_file: '' });
        setBookPdfFileName(null);
        
        // Refresh books list
        await fetchBooks();
        
        alert('PDF deleted successfully');
      } catch (error) {
        console.error('Error deleting PDF:', error);
        alert('Failed to delete PDF');
      }
    } else {
      // Just remove the newly uploaded file (not yet saved)
      setBookPdfFile(null);
      setBookPdfFileName(null);
      setBookFormData({ ...bookFormData, pdf_file: '' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      book_id: '',
      personality: '',
      avatar: '',
      image: '',
      color: 'from-blue-500 to-blue-600',
      greeting: ''
    });
    setEditingCharacter(null);
    setShowCharacterForm(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    onLogout();
    navigate('/admin/login');
  };

  const colorOptions = [
    'from-blue-500 to-blue-600',
    'from-pink-500 to-rose-600',
    'from-gray-600 to-gray-700',
    'from-amber-500 to-orange-600',
    'from-emerald-600 to-teal-600',
    'from-yellow-500 to-amber-600',
    'from-purple-600 to-indigo-600',
    'from-red-700 to-red-900'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-black uppercase">Admin Dashboard</h1>
              <p className="text-gray-300 font-medium mt-1">Manage Literary Chat Platform</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2">
                <Shield className="w-5 h-5" />
                <span className="font-bold">{admin?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white text-black font-bold py-2 px-4 uppercase text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors border-2 border-white"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('books')}
              className={`flex items-center gap-2 px-6 py-3 font-bold uppercase text-sm border-2 border-white transition-colors ${
                activeTab === 'books'
                  ? 'bg-white text-black'
                  : 'bg-transparent text-white hover:bg-white/10'
              }`}
            >
              <Library className="w-4 h-4" />
              Books
              <span className="bg-black text-white px-2 py-0.5 rounded text-xs">
                {books.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('characters')}
              className={`flex items-center gap-2 px-6 py-3 font-bold uppercase text-sm border-2 border-white transition-colors ${
                activeTab === 'characters'
                  ? 'bg-white text-black'
                  : 'bg-transparent text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Characters
              <span className="bg-black text-white px-2 py-0.5 rounded text-xs">
                {characters.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-3 font-bold uppercase text-sm border-2 border-white transition-colors ${
                activeTab === 'users'
                  ? 'bg-white text-black'
                  : 'bg-transparent text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4" />
              Users
              <span className="bg-black text-white px-2 py-0.5 rounded text-xs">
                {users.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Books Tab */}
        {activeTab === 'books' && (
          <>
            {/* Add Book Button */}
            <button
              onClick={() => setShowBookForm(true)}
              className="mb-8 bg-black text-white font-bold py-3 px-6 uppercase flex items-center gap-2 border-2 border-black hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus className="w-5 h-5" />
              Add New Book
            </button>

            {/* Book Form Modal */}
            {showBookForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b-4 border-black p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-black uppercase">
                      {editingBook ? 'Edit Book' : 'Add New Book'}
                    </h2>
                    <button
                      onClick={resetBookForm}
                      className="text-gray-500 hover:text-black transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                
                  <form onSubmit={handleBookSubmit} className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold uppercase mb-2">Book Title *</label>
                      <input
                        type="text"
                        value={bookFormData.title}
                        onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-black font-medium focus:outline-none focus:border-4"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold uppercase mb-2">Author *</label>
                      <input
                        type="text"
                        value={bookFormData.author}
                        onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-black font-medium focus:outline-none focus:border-4"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold uppercase mb-2">Genre</label>
                      <input
                        type="text"
                        value={bookFormData.genre}
                        onChange={(e) => setBookFormData({ ...bookFormData, genre: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-black font-medium focus:outline-none focus:border-4"
                        placeholder="e.g., Classic Literature, Mystery"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold uppercase mb-2">Published Year</label>
                      <input
                        type="number"
                        value={bookFormData.published_year}
                        onChange={(e) => setBookFormData({ ...bookFormData, published_year: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-black font-medium focus:outline-none focus:border-4"
                        placeholder="e.g., 1925"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Book Cover Image</label>
                    <div className="space-y-3">
                      {/* Image Preview */}
                      {bookImagePreview && (
                        <div className="relative inline-block">
                          <img 
                            src={bookImagePreview} 
                            alt="Cover Preview" 
                            className="w-48 h-64 object-cover border-2 border-black"
                          />
                          <button
                            type="button"
                            onClick={removeBookImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 border-2 border-black hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      {/* File Upload Input */}
                      <div className="relative">
                        <input
                          type="file"
                          id="book-image-upload"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                          onChange={handleBookImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="book-image-upload"
                          className="flex items-center gap-2 px-4 py-3 border-2 border-black font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <Upload className="w-5 h-5" />
                          <span>{bookImagePreview ? 'Change Cover Image' : 'Upload Cover Image'}</span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-600">
                        Supported formats: JPEG, PNG, GIF, WebP, SVG (Max 5MB)
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Book PDF File</label>
                    <div className="space-y-3">
                      {/* PDF File Name Display / Download Link */}
                      {(bookPdfFileName || bookFormData.pdf_file) && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-black">
                          <BookOpen className="w-6 h-6 text-red-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{bookPdfFileName || 'Current PDF'}</p>
                            {bookFormData.pdf_file && !bookPdfFile && (
                              <a 
                                href={`http://localhost:3001${bookFormData.pdf_file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                View PDF
                              </a>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={removeBookPdf}
                            className="bg-red-500 text-white rounded-full p-1 border-2 border-black hover:bg-red-600 flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      {/* PDF Upload Input */}
                      <div className="relative">
                        <input
                          type="file"
                          id="book-pdf-upload"
                          accept="application/pdf"
                          onChange={handleBookPdfChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="book-pdf-upload"
                          className="flex items-center gap-2 px-4 py-3 border-2 border-black font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <Upload className="w-5 h-5" />
                          <span>{bookPdfFileName ? 'Change PDF File' : 'Upload PDF File'}</span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-600">
                        Supported format: PDF (Max 100MB)
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Description</label>
                    <textarea
                      value={bookFormData.description}
                      onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-black font-medium focus:outline-none focus:border-4 h-24"
                      placeholder="Brief description of the book..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-black text-white font-bold py-3 px-8 uppercase border-2 border-black hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      {editingBook ? 'Update Book' : 'Create Book'}
                    </button>
                    <button
                      type="button"
                      onClick={resetBookForm}
                      className="bg-white text-black font-bold py-3 px-8 uppercase border-2 border-black hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
            )}

            {/* Books List */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="border-b-4 border-black p-6">
                <h2 className="text-2xl font-black uppercase">All Books ({books.length})</h2>
              </div>

              {isLoading ? (
                <div className="p-12 text-center">
                  <p className="text-xl font-bold">Loading books...</p>
                </div>
              ) : books.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-xl font-bold">No books found</p>
                </div>
              ) : (
                <div className="divide-y-4 divide-black">
                  {books.map((book) => {
                    const isExpanded = expandedBooks.has(book.id);
                    const hasCharacters = book.characters && book.characters.length > 0;
                    
                    return (
                      <div key={book.id} className="bg-white">
                        {/* Book Header - Clickable */}
                        <div 
                          className={`p-6 transition-colors ${hasCharacters ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                          onClick={() => hasCharacters && toggleBookExpansion(book.id)}
                        >
                          <div className="flex items-start justify-between gap-6">
                            {/* Book Cover Image */}
                            <div className="flex-shrink-0">
                              <img 
                                src={book.cover_image || '/book.svg'} 
                                alt={book.title}
                                className="w-24 h-32 object-cover border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                              />
                            </div>

                            {/* Book Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {hasCharacters && (
                                  <div className="flex-shrink-0">
                                    {isExpanded ? (
                                      <ChevronDown className="w-6 h-6 text-gray-600" />
                                    ) : (
                                      <ChevronRight className="w-6 h-6 text-gray-600" />
                                    )}
                                  </div>
                                )}
                                <h3 className="text-xl font-black uppercase">{book.title}</h3>
                              </div>
                              <p className="text-sm font-bold text-gray-600 mb-2">by {book.author}</p>
                              <div className="flex items-center gap-2 mb-2">
                                {book.genre && (
                                  <span className="inline-block bg-black text-white px-3 py-1 text-xs font-bold uppercase">
                                    {book.genre}
                                  </span>
                                )}
                                <span className="inline-block bg-blue-600 text-white px-3 py-1 text-xs font-bold uppercase">
                                  {book.characters?.length || 0} CHARACTER{(book.characters?.length || 0) !== 1 ? 'S' : ''}
                                </span>
                              </div>
                              {book.description && (
                                <p className="text-sm text-gray-700 mt-2">{book.description}</p>
                              )}
                              {book.published_year && (
                                <p className="text-xs text-gray-500 mt-2">Published: {book.published_year}</p>
                              )}
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditBook(book);
                                }}
                                className="bg-blue-500 text-white p-3 border-2 border-black hover:bg-blue-600 transition-colors"
                                title="Edit Book"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteBook(book.id);
                                }}
                                className="bg-red-500 text-white p-3 border-2 border-black hover:bg-red-600 transition-colors"
                                title="Delete Book"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Characters List - Expandable */}
                        {isExpanded && hasCharacters && (
                          <div className="border-t-4 border-black bg-gray-50">
                            <div className="p-6">
                              <h4 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Characters in this Book
                              </h4>
                              <div className="grid md:grid-cols-2 gap-4">
                                {book.characters.map((character) => (
                                  <div 
                                    key={character.id} 
                                    onClick={() => handleViewCharacter(character)}
                                    className="bg-white border-2 border-black p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow cursor-pointer"
                                  >
                                    <div className="flex gap-3">
                                      <div className={`w-12 h-12 bg-gradient-to-br ${character.color} border-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                                        <img 
                                          src={character.image || '/book.svg'} 
                                          alt={character.name}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-black uppercase text-sm mb-1 truncate">{character.name}</h5>
                                        <p className="text-xs text-gray-600 line-clamp-2">{character.personality}</p>
                                        <div className="flex gap-2 mt-2">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEdit(character);
                                            }}
                                            className="bg-blue-500 text-white px-2 py-1 text-xs font-bold uppercase border border-black hover:bg-blue-600"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDelete(character.id);
                                            }}
                                            className="bg-red-500 text-white px-2 py-1 text-xs font-bold uppercase border border-black hover:bg-red-600"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Character Detail View Modal */}
            {selectedCharacter && !showCharacterForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-2xl font-black uppercase">Character Details</h2>
                      <button
                        onClick={() => setSelectedCharacter(null)}
                        className="text-2xl font-bold hover:bg-gray-200 w-8 h-8 flex items-center justify-center border-2 border-black"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-20 h-20 bg-gradient-to-br ${selectedCharacter.color} border-2 border-black flex items-center justify-center overflow-hidden`}>
                          <img 
                            src={selectedCharacter.image || '/book.svg'} 
                            alt={selectedCharacter.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-black uppercase">{selectedCharacter.name}</h3>
                          <p className="text-gray-600">{selectedCharacter.book_title} by {selectedCharacter.book_author}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold uppercase mb-2">Personality</label>
                        <p className="text-gray-700 leading-relaxed">{selectedCharacter.personality}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold uppercase mb-2">Greeting</label>
                        <p className="text-gray-700 leading-relaxed italic">"{selectedCharacter.greeting}"</p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold uppercase mb-2">Description</label>
                        <p className="text-gray-700 leading-relaxed">{selectedCharacter.description}</p>
                      </div>

                      <div className="flex gap-4 pt-4 border-t-2 border-black">
                        <button
                          onClick={() => {
                            handleEdit(selectedCharacter);
                            setSelectedCharacter(null);
                          }}
                          className="flex-1 bg-blue-500 text-white font-bold py-3 px-6 uppercase border-2 border-black hover:bg-blue-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                          Edit Character
                        </button>
                        <button
                          onClick={() => setSelectedCharacter(null)}
                          className="flex-1 bg-gray-200 text-black font-bold py-3 px-6 uppercase border-2 border-black hover:bg-gray-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Characters Tab */}
        {activeTab === 'characters' && (
          <>
            {/* Add Character Button */}
            <button
              onClick={() => setShowCharacterForm(true)}
              className="mb-8 bg-black text-white font-bold py-3 px-6 uppercase flex items-center gap-2 border-2 border-black hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus className="w-5 h-5" />
              Add New Character
            </button>

        {/* Characters List */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-4 border-black p-6">
            <h2 className="text-2xl font-black uppercase">All Characters ({characters.length})</h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <p className="text-xl font-bold">Loading characters...</p>
            </div>
          ) : characters.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-xl font-bold">No characters found</p>
            </div>
          ) : (
            <div className="divide-y-2 divide-black">
              {characters.map((character) => (
                <div key={character.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex gap-4 flex-1">
                      <div className={`w-16 h-16 bg-gradient-to-br ${character.color} border-2 border-black flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                        <img 
                          src={character.image || '/book.svg'} 
                          alt={character.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black uppercase mb-1">{character.name}</h3>
                        <p className="text-sm font-bold text-gray-600 mb-1">{character.book_title}</p>
                        <p className="text-xs text-gray-500">by {character.book_author}</p>
                        <p className="mt-3 text-sm text-gray-700 line-clamp-2">{character.greeting}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(character)}
                        className="bg-blue-500 text-white p-3 border-2 border-black hover:bg-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(character.id)}
                        className="bg-red-500 text-white p-3 border-2 border-black hover:bg-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black uppercase mb-2">Registered Users</h2>
              <p className="text-gray-600 font-medium">Manage user accounts and view activity</p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⏳</div>
                <p className="text-xl font-black uppercase">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="bg-white border-4 border-black p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-2xl font-black uppercase mb-2">No Users Yet</h3>
                <p className="text-gray-600 font-medium">Users will appear here once they register</p>
              </div>
            ) : (
              <div className="bg-white border-4 border-black">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-black text-white">
                      <tr>
                        <th className="text-left p-4 font-black uppercase text-sm">ID</th>
                        <th className="text-left p-4 font-black uppercase text-sm">Username</th>
                        <th className="text-left p-4 font-black uppercase text-sm">Email</th>
                        <th className="text-left p-4 font-black uppercase text-sm">Full Name</th>
                        <th className="text-left p-4 font-black uppercase text-sm">Conversations</th>
                        <th className="text-left p-4 font-black uppercase text-sm">Joined</th>
                        <th className="text-left p-4 font-black uppercase text-sm">Last Login</th>
                        <th className="text-left p-4 font-black uppercase text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-bold">{user.id}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-gray-400" />
                              <span className="font-bold">{user.username}</span>
                            </div>
                          </td>
                          <td className="p-4 font-medium text-gray-600">{user.email}</td>
                          <td className="p-4 font-medium">{user.full_name || '-'}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                              <span className="font-bold">{user.conversation_count || 0}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-500 text-white p-2 border-2 border-black hover:bg-red-600 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Character Form Modal - Available from any tab */}
      {showCharacterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-black uppercase">
                  {editingCharacter ? 'Edit Character' : 'Add New Character'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-2xl font-bold hover:bg-gray-200 w-8 h-8 flex items-center justify-center border-2 border-black"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Character Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-black font-medium focus:outline-none focus:border-4"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Book *</label>
                    <select
                      value={formData.book_id}
                      onChange={(e) => setFormData({ ...formData, book_id: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-black font-medium focus:outline-none focus:border-4"
                      required
                    >
                      <option value="">Select a book...</option>
                      {books.map((book) => (
                        <option key={book.id} value={book.id}>
                          {book.title} - {book.author}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Color Theme *</label>
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-black font-medium focus:outline-none focus:border-4"
                      required
                    >
                      {colorOptions.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase mb-2">Character Image</label>
                    <div className="space-y-3">
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="relative inline-block">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-32 h-32 object-cover border-2 border-black"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 border-2 border-black hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      {/* File Upload Input */}
                      <div className="relative">
                        <input
                          type="file"
                          id="image-upload"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="image-upload"
                          className="flex items-center gap-2 px-4 py-3 border-2 border-black font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <Upload className="w-5 h-5" />
                          <span>{imagePreview ? 'Change Image' : 'Upload Image'}</span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-600">
                        Supported formats: JPEG, PNG, GIF, WebP, SVG (Max 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Personality/Instructions *</label>
                  <textarea
                    value={formData.personality}
                    onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black font-medium focus:outline-none focus:border-4 h-32"
                    required
                    placeholder="You are [Character Name]..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Greeting Message *</label>
                  <textarea
                    value={formData.greeting}
                    onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black font-medium focus:outline-none focus:border-4 h-24"
                    required
                    placeholder="Welcome message from the character..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white font-bold py-3 px-8 uppercase border-2 border-black hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {editingCharacter ? 'Update Character' : 'Create Character'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-white text-black font-bold py-3 px-8 uppercase border-2 border-black hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
