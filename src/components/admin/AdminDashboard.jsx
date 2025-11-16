import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, LogOut, User as UserIcon, Users, BookOpen, Shield, MessageSquare, Library, ChevronDown, ChevronRight, Upload, X, Search, ChevronLeft, ChevronRight as ChevronRightIcon, Sparkles } from 'lucide-react';

const AdminDashboard = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState('books'); // 'books', 'characters', or 'users'
  const [books, setBooks] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [users, setUsers] = useState([]);
  const [expandedBooks, setExpandedBooks] = useState(new Set()); // Track which books are expanded
  const [isLoading, setIsLoading] = useState(true);
  const [generatingCharacters, setGeneratingCharacters] = useState(new Set()); // Track which books are generating characters
  const [showBookForm, setShowBookForm] = useState(false);
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null); // For viewing character details
  
  // Filtering and Pagination for Books
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(5);
  
  // Filtering and Pagination for Characters
  const [characterSearchQuery, setCharacterSearchQuery] = useState('');
  const [characterBookFilter, setCharacterBookFilter] = useState('all');
  const [characterCurrentPage, setCharacterCurrentPage] = useState(1);
  const [charactersPerPage] = useState(6);
  
  // Filtering and Pagination for Users
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  
  // Role editing
  const [editingUserRole, setEditingUserRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  
  // User editing
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: ''
  });
  
  // Add user
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserFormData, setNewUserFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'user'
  });
  
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
  const [analyzingPdf, setAnalyzingPdf] = useState(false);

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

    console.log('🔍 DEBUG - handleBookSubmit called');
    console.log('📝 bookFormData:', bookFormData);
    console.log('🖼️  bookImageFile:', bookImageFile);
    console.log('📄 bookPdfFile:', bookPdfFile);

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
        
        // Include AI-generated cover_image path if available (and no manual image uploaded)
        if (!bookImageFile && bookFormData.cover_image) {
          console.log('✅ Adding AI-generated cover_image to FormData:', bookFormData.cover_image);
          formData.append('cover_image', bookFormData.cover_image);
        }
        
        if (bookImageFile) {
          console.log('✅ Adding uploaded image file to FormData');
          formData.append('cover_image', bookImageFile);
        }
        
        if (bookPdfFile) {
          console.log('✅ Adding PDF file to FormData');
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
        console.log('📤 Sending book data as JSON:', bookFormData);
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

  const handleGenerateCharacters = async (bookId) => {
    if (!confirm('This will use AI to automatically extract characters from the book PDF and create them. This may take 1-2 minutes. Continue?')) return;

    const token = localStorage.getItem('adminToken');
    
    // Add book to generating set
    setGeneratingCharacters(prev => new Set([...prev, bookId]));

    try {
      console.log('🚀 Starting AI character generation...');

      // Call the simplified endpoint that does everything
      const response = await fetch(`http://localhost:3001/api/ai-processing/process-and-generate/${bookId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate characters');
      }

      const result = await response.json();
      
      console.log('✅ Characters generated:', result);

      // Refresh data
      await fetchBooks();
      await fetchCharacters();

      alert(`✅ Success! Generated ${result.characters.length} characters:\n${result.characters.map(c => `• ${c.name}`).join('\n')}\n\nYou can now chat with them!`);
    } catch (error) {
      console.error('❌ Error generating characters:', error);
      alert(`Failed to generate characters: ${error.message}`);
    } finally {
      // Remove book from generating set
      setGeneratingCharacters(prev => {
        const next = new Set(prev);
        next.delete(bookId);
        return next;
      });
    }
  };

  const handleDeleteAllCharacters = async (bookId, bookTitle) => {
    // Get characters count for this book
    const bookCharacters = characters.filter(c => c.book_id === bookId);
    
    if (bookCharacters.length === 0) {
      alert('No characters found for this book.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ALL ${bookCharacters.length} character(s) from "${bookTitle}"?\n\nThis will permanently delete:\n${bookCharacters.map(c => `• ${c.name}`).join('\n')}\n\nThis action cannot be undone!`)) return;

    const token = localStorage.getItem('adminToken');
    
    try {
      let deletedCount = 0;
      let failedCount = 0;

      // Delete each character
      for (const character of bookCharacters) {
        try {
          const response = await fetch(`http://localhost:3001/api/characters/${character.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            deletedCount++;
          } else {
            failedCount++;
            console.error(`Failed to delete character ${character.name}`);
          }
        } catch (error) {
          failedCount++;
          console.error(`Error deleting character ${character.name}:`, error);
        }
      }

      // Refresh data
      await fetchBooks();
      await fetchCharacters();

      if (failedCount === 0) {
        alert(`✅ Successfully deleted all ${deletedCount} character(s) from "${bookTitle}"`);
      } else {
        alert(`⚠️ Deleted ${deletedCount} character(s), but ${failedCount} failed. Check console for details.`);
      }
    } catch (error) {
      console.error('Error deleting characters:', error);
      alert(`Failed to delete characters: ${error.message}`);
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

  const handleUpdateRole = async () => {
    if (!editingUserRole || !selectedRole) return;

    const token = localStorage.getItem('adminToken');

    try {
      const response = await fetch(`http://localhost:3001/api/admin/users/${editingUserRole.id}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: selectedRole })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }

      await fetchUsers();
      setEditingUserRole(null);
      setSelectedRole('');
      alert('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert(error.message || 'Failed to update user role');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      email: user.email,
      full_name: user.full_name || ''
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const token = localStorage.getItem('adminToken');

    try {
      // Only include password in update if it's been filled in
      const updateData = { ...userFormData };
      if (!updateData.password || updateData.password.trim() === '') {
        delete updateData.password;
      }

      const response = await fetch(`http://localhost:3001/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      await fetchUsers();
      setEditingUser(null);
      setUserFormData({ username: '', email: '', full_name: '', password: '' });
      alert('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.message || 'Failed to update user');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('adminToken');

    try {
      const response = await fetch('http://localhost:3001/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUserFormData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      await fetchUsers();
      setShowAddUserForm(false);
      setNewUserFormData({
        username: '',
        email: '',
        password: '',
        full_name: '',
        role: 'user'
      });
      alert('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.message || 'Failed to create user');
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

  const handleBookPdfChange = async (e) => {
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

      // Automatically analyze PDF with AI
      if (confirm('Would you like AI to automatically extract book information from this PDF? This will analyze the PDF and fill in title, author, description, genre, and year.')) {
        await analyzePdfWithAI(file);
      }
    }
  };

  const analyzePdfWithAI = async (pdfFile) => {
    setAnalyzingPdf(true);
    
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);

      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3001/api/ai-processing/analyze-book-metadata', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze PDF');
      }

      const result = await response.json();
      
      console.log('📚 AI Analysis Result:', result);
      
      // Auto-fill the form with AI-extracted data INCLUDING cover image
      setBookFormData({
        title: result.title || '',
        author: result.author || '',
        description: result.description || '',
        genre: result.genre || '',
        published_year: result.published_year || '',
        cover_image: result.cover_image || bookFormData.cover_image // Use AI-generated cover if available
      });

      // If a cover image was generated, show it in the preview
      if (result.cover_image) {
        setBookImagePreview(`http://localhost:3001${result.cover_image}`);
        console.log('✅ Cover image set:', result.cover_image);
      }

      alert('✅ Book information extracted successfully!\n' + 
            (result.cover_image ? '📚 Cover image generated automatically!' : '') +
            '\n\nReview and edit if needed, then click Save.');
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      alert(`Failed to analyze PDF: ${error.message}\n\nPlease fill in the book details manually.`);
    } finally {
      setAnalyzingPdf(false);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50" style={{ fontFamily: 'Roboto, sans-serif' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white border-b border-purple-400/30 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold drop-shadow-lg">Admin Dashboard</h1>
              <p className="text-purple-100 font-medium mt-1">Manage Literary Chat Platform</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/40 shadow-lg">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">{admin?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white/20 backdrop-blur-sm text-white font-semibold py-2.5 px-4 text-sm flex items-center gap-2 hover:bg-white/30 transition-all rounded-xl border border-white/40 shadow-lg"
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
              className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all rounded-lg ${
                activeTab === 'books'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              <Library className="w-4 h-4" />
              Books
              <span className={`${activeTab === 'books' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-700'} text-white px-2 py-0.5 rounded-full text-xs font-semibold`}>
                {books.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('characters')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all rounded-lg ${
                activeTab === 'characters'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Characters
              <span className={`${activeTab === 'characters' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-700'} text-white px-2 py-0.5 rounded-full text-xs font-semibold`}>
                {characters.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all rounded-lg ${
                activeTab === 'users'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              <Users className="w-4 h-4" />
              Users
              <span className={`${activeTab === 'users' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-700'} text-white px-2 py-0.5 rounded-full text-xs font-semibold`}>
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
            {/* Filters and Search */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title or author..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  />
                </div>

                {/* Genre Filter */}
                <select
                  value={genreFilter}
                  onChange={(e) => {
                    setGenreFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow min-w-[200px]"
                >
                  <option value="all">All Genres</option>
                  {Array.from(new Set(books.filter(b => b.genre).map(b => b.genre))).sort().map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              {/* Add Book Button */}
              <button
                onClick={() => setShowBookForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 flex items-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl rounded-lg whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Add New Book
              </button>
            </div>

            {/* Filtering and Pagination Logic */}
            {(() => {
              // Filter books
              const filteredBooks = books.filter(book => {
                const matchesSearch = searchQuery === '' || 
                  book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  book.author.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesGenre = genreFilter === 'all' || book.genre === genreFilter;
                return matchesSearch && matchesGenre;
              });

              // Pagination
              const indexOfLastBook = currentPage * booksPerPage;
              const indexOfFirstBook = indexOfLastBook - booksPerPage;
              const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
              const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

              return (
                <>
                  {/* Books List */}
                  <div className="bg-white rounded-2xl border-2 border-purple-100 shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 text-white p-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold drop-shadow-md">All Books ({filteredBooks.length})</h2>
                        {searchQuery || genreFilter !== 'all' ? (
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setGenreFilter('all');
                              setCurrentPage(1);
                            }}
                            className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors shadow-lg"
                          >
                            Clear Filters
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                        <p className="text-xl font-semibold mt-4 text-gray-600">Loading books...</p>
                      </div>
                    ) : filteredBooks.length === 0 ? (
                      <div className="p-12 text-center">
                        <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-xl font-semibold text-gray-500">
                          {searchQuery || genreFilter !== 'all' ? 'No books match your filters' : 'No books found'}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          {searchQuery || genreFilter !== 'all' 
                            ? 'Try adjusting your search or filters' 
                            : 'Click "Add New Book" to get started'}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="divide-y divide-gray-200">
                          {currentBooks.map((book) => {
                            const isExpanded = expandedBooks.has(book.id);
                            const hasCharacters = book.characters && book.characters.length > 0;
                            
                            return (
                              <div key={book.id} className="bg-white hover:bg-gray-50 transition-colors">
                                {/* Book Header - Clickable */}
                                <div 
                                  className={`p-6 ${hasCharacters ? 'cursor-pointer' : ''}`}
                                  onClick={() => hasCharacters && toggleBookExpansion(book.id)}
                                >
                                  <div className="flex items-start justify-between gap-6">
                                    {/* Book Cover Image */}
                                    <div className="flex-shrink-0">
                                      <img 
                                        src={book.cover_image ? `http://localhost:3001${book.cover_image}` : '/book.svg'} 
                                        alt={book.title}
                                        className="w-28 h-40 object-cover rounded-lg shadow-lg border-2 border-gray-200"
                                      />
                                    </div>

                                    {/* Book Info */}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        {hasCharacters && (
                                          <div className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 transition-colors">
                                            {isExpanded ? (
                                              <ChevronDown className="w-5 h-5 text-blue-600" />
                                            ) : (
                                              <ChevronRight className="w-5 h-5 text-gray-400" />
                                            )}
                                          </div>
                                        )}
                                        <h3 className="text-xl font-bold text-gray-900">{book.title}</h3>
                                      </div>
                                      <p className="text-sm font-semibold text-gray-600 mb-3">by {book.author}</p>
                                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                                        {book.genre && (
                                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 text-xs font-semibold rounded-full shadow-sm">
                                            <Library className="w-3 h-3" />
                                            {book.genre}
                                          </span>
                                        )}
                                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 text-xs font-semibold rounded-full shadow-sm">
                                          <Users className="w-3 h-3" />
                                          {book.characters?.length || 0} CHARACTER{(book.characters?.length || 0) !== 1 ? 'S' : ''}
                                        </span>
                                        {book.published_year && (
                                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 text-xs font-semibold rounded-full shadow-sm">
                                            📅 {book.published_year}
                                          </span>
                                        )}
                                      </div>
                                      {book.description && (
                                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{book.description}</p>
                                      )}
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                      {book.pdf_file && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleGenerateCharacters(book.id);
                                          }}
                                          disabled={generatingCharacters.has(book.id)}
                                          className={`${
                                            generatingCharacters.has(book.id)
                                              ? 'bg-gray-400 cursor-not-allowed'
                                              : 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800'
                                          } text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2`}
                                          title="Generate Characters with AI"
                                        >
                                          <Sparkles className={`w-5 h-5 ${generatingCharacters.has(book.id) ? 'animate-spin' : ''}`} />
                                          <span className="text-sm font-semibold hidden sm:inline">
                                            {generatingCharacters.has(book.id) ? 'Generating...' : 'AI Generate'}
                                          </span>
                                        </button>
                                      )}
                                      {book.characters?.length > 0 && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteAllCharacters(book.id, book.title);
                                          }}
                                          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                          title="Delete All Characters"
                                        >
                                          <Trash2 className="w-5 h-5" />
                                          <span className="text-sm font-semibold hidden sm:inline">
                                            Delete All Characters
                                          </span>
                                        </button>
                                      )}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditBook(book);
                                        }}
                                        className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-lg hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all"
                                        title="Edit Book"
                                      >
                                        <Edit className="w-5 h-5" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteBook(book.id);
                                        }}
                                        className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 rounded-lg hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all"
                                        title="Delete Book"
                                      >
                                        <Trash2 className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Characters List - Expandable */}
                                {isExpanded && hasCharacters && (
                                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-t-2 border-blue-200">
                                    <div className="p-6">
                                      <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                                        <BookOpen className="w-5 h-5 text-blue-600" />
                                        Characters in this Book
                                      </h4>
                                      <div className="grid md:grid-cols-2 gap-4">
                                        {book.characters.map((character) => (
                                          <div 
                                            key={character.id} 
                                            onClick={() => handleViewCharacter(character)}
                                            className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group"
                                          >
                                            <div className="flex gap-3">
                                              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md border-2 border-gray-200 group-hover:border-blue-400 transition-all">
                                                <img 
                                                  src={character.image || '/book.svg'} 
                                                  alt={character.name}
                                                  className="w-full h-full object-cover"
                                                />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <h5 className="font-bold text-sm mb-1 truncate text-gray-900">{character.name}</h5>
                                                <p className="text-xs text-gray-600 line-clamp-2">{character.personality}</p>
                                                <div className="flex gap-2 mt-3">
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleEdit(character);
                                                    }}
                                                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-1.5 text-xs font-semibold rounded-lg hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all"
                                                  >
                                                    Edit
                                                  </button>
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleDelete(character.id);
                                                    }}
                                                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 text-xs font-semibold rounded-lg hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg transition-all"
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

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                Showing {indexOfFirstBook + 1} to {Math.min(indexOfLastBook, filteredBooks.length)} of {filteredBooks.length} books
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                  disabled={currentPage === 1}
                                  className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                                    currentPage === 1
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
                                  }`}
                                >
                                  <ChevronLeft className="w-5 h-5" />
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                  <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                      currentPage === page
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                ))}
                                
                                <button
                                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                  disabled={currentPage === totalPages}
                                  className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                                    currentPage === totalPages
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
                                  }`}
                                >
                                  <ChevronRightIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              );
            })()}

            {/* Book Form Modal */}
            {showBookForm && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">
                      {editingBook ? 'Edit Book' : 'Add New Book'}
                    </h2>
                    <button
                      onClick={resetBookForm}
                      className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                
                  <form onSubmit={handleBookSubmit} className="p-8 space-y-6 overflow-y-auto">
                    {!editingBook ? (
                      /* Add New Book - Simple PDF Upload */
                      <div className="space-y-6">
                        <div className="text-center py-6">
                          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full mb-4">
                            <Sparkles className="w-10 h-10 text-purple-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Book</h3>
                          <p className="text-gray-600">
                            Just upload a PDF and AI will automatically extract all book details!
                          </p>
                        </div>

                        {/* PDF Upload Section */}
                        <div className="space-y-4">
                          {/* PDF File Name Display */}
                          {bookPdfFileName && (
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
                              <BookOpen className="w-8 h-8 text-blue-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate text-gray-800">{bookPdfFileName}</p>
                                <p className="text-xs text-gray-600">Ready to upload</p>
                              </div>
                              <button
                                type="button"
                                onClick={removeBookPdf}
                                className="bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 flex-shrink-0 transition-colors"
                              >
                                <X className="w-5 h-5" />
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
                              disabled={analyzingPdf}
                              required
                            />
                            <label
                              htmlFor="book-pdf-upload"
                              className={`flex flex-col items-center justify-center gap-3 px-6 py-12 border-4 border-dashed rounded-2xl font-medium cursor-pointer transition-all ${
                                analyzingPdf 
                                  ? 'border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed' 
                                  : 'border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 hover:border-purple-500 hover:shadow-lg'
                              }`}
                            >
                              <Upload className="w-16 h-16 text-purple-600" />
                              <div className="text-center">
                                <span className="block text-lg font-bold text-gray-900">
                                  {bookPdfFileName ? 'Change PDF File' : 'Click to Upload PDF'}
                                </span>
                                <span className="block text-sm text-gray-600 mt-1">
                                  or drag and drop your book here
                                </span>
                              </div>
                            </label>
                          </div>
                          
                          {/* AI Analyzing Indicator */}
                          {analyzingPdf && (
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-6 flex items-center gap-4">
                              <Sparkles className="w-8 h-8 text-purple-600 animate-spin flex-shrink-0" />
                              <div>
                                <p className="text-base font-bold text-purple-900">AI is analyzing your PDF...</p>
                                <p className="text-sm text-purple-700 mt-1">Extracting title, author, description, genre, and year. Please wait.</p>
                              </div>
                            </div>
                          )}
                          
                          {/* AI Extracted Data Display */}
                          {bookFormData.title && !analyzingPdf && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 space-y-3">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <p className="text-base font-bold text-green-900">Book Information Extracted!</p>
                              </div>
                              <div className="space-y-2 text-sm">
                                <p><span className="font-semibold text-gray-700">Title:</span> <span className="text-gray-900">{bookFormData.title}</span></p>
                                <p><span className="font-semibold text-gray-700">Author:</span> <span className="text-gray-900">{bookFormData.author}</span></p>
                                {bookFormData.genre && <p><span className="font-semibold text-gray-700">Genre:</span> <span className="text-gray-900">{bookFormData.genre}</span></p>}
                                {bookFormData.published_year && <p><span className="font-semibold text-gray-700">Year:</span> <span className="text-gray-900">{bookFormData.published_year}</span></p>}
                                {bookFormData.description && <p><span className="font-semibold text-gray-700">Description:</span> <span className="text-gray-900">{bookFormData.description}</span></p>}
                              </div>
                            </div>
                          )}
                          
                          <p className="text-sm text-center text-gray-500">
                            📄 Supported format: PDF (Max 100MB) • 🤖 AI-powered extraction
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Edit Book - Show All Fields */
                      <>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Book Title *</label>
                            <input
                              type="text"
                              value={bookFormData.title}
                              onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                              required
                              placeholder="Enter book title"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Author *</label>
                            <input
                              type="text"
                              value={bookFormData.author}
                              onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                              required
                              placeholder="Enter author name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Genre</label>
                            <input
                              type="text"
                              value={bookFormData.genre}
                              onChange={(e) => setBookFormData({ ...bookFormData, genre: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                              placeholder="e.g., Classic Literature, Mystery"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Published Year</label>
                            <input
                              type="number"
                              value={bookFormData.published_year}
                              onChange={(e) => setBookFormData({ ...bookFormData, published_year: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                              placeholder="e.g., 1925"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
                          <textarea
                            value={bookFormData.description}
                            onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow h-32 resize-none"
                            placeholder="Brief description of the book..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Book Cover Image</label>
                          <div className="space-y-3">
                            {bookImagePreview && (
                              <div className="relative inline-block">
                                <img 
                                  src={bookImagePreview} 
                                  alt="Cover Preview" 
                                  className="w-48 h-64 object-cover border-2 border-gray-200 rounded-lg shadow-lg"
                                />
                                <button
                                  type="button"
                                  onClick={removeBookImage}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            
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
                                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg font-medium cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                              >
                                <Upload className="w-5 h-5 text-blue-600" />
                                <span className="text-gray-700">{bookImagePreview ? 'Change Cover Image' : 'Upload Cover Image'}</span>
                              </label>
                            </div>
                            <p className="text-xs text-gray-500">
                              Supported formats: JPEG, PNG, GIF, WebP, SVG (Max 5MB)
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Book PDF File</label>
                          <div className="space-y-3">
                            {(bookPdfFileName || bookFormData.pdf_file) && (
                              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
                                <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm truncate text-gray-800">{bookPdfFileName || 'Current PDF'}</p>
                                  {bookFormData.pdf_file && !bookPdfFile && (
                                    <a 
                                      href={`http://localhost:3001${bookFormData.pdf_file}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                                    >
                                      View PDF →
                                    </a>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={removeBookPdf}
                                  className="bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 flex-shrink-0 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            
                            <div className="relative">
                              <input
                                type="file"
                                id="book-pdf-upload-edit"
                                accept="application/pdf"
                                onChange={handleBookPdfChange}
                                className="hidden"
                              />
                              <label
                                htmlFor="book-pdf-upload-edit"
                                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg font-medium cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
                              >
                                <Upload className="w-5 h-5 text-purple-600" />
                                <span className="text-gray-700">{bookPdfFileName ? 'Change PDF File' : 'Upload PDF File'}</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={!bookPdfFile && !editingBook}
                        className={`flex-1 font-semibold py-4 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl ${
                          !bookPdfFile && !editingBook
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        }`}
                      >
                        {editingBook ? 'Update Book' : (analyzingPdf ? 'Analyzing...' : 'Create Book')}
                      </button>
                      <button
                        type="button"
                        onClick={resetBookForm}
                        className="flex-1 bg-white text-gray-700 font-semibold py-4 px-8 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Character Detail View Modal */}
            {selectedCharacter && !showCharacterForm && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Character Details</h2>
                    <button
                      onClick={() => setSelectedCharacter(null)}
                      className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-8 space-y-6 overflow-y-auto">
                    <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200">
                        <img 
                          src={selectedCharacter.image || '/book.svg'} 
                          alt={selectedCharacter.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{selectedCharacter.name}</h3>
                        <p className="text-gray-600 font-semibold mt-1">{selectedCharacter.book_title} by {selectedCharacter.book_author}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2 text-purple-600 uppercase tracking-wide">Personality</label>
                      <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">{selectedCharacter.personality}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2 text-purple-600 uppercase tracking-wide">Greeting</label>
                      <p className="text-gray-700 leading-relaxed italic bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-l-4 border-purple-500">"{selectedCharacter.greeting}"</p>
                    </div>

                    {selectedCharacter.description && (
                      <div>
                        <label className="block text-sm font-bold mb-2 text-purple-600 uppercase tracking-wide">Description</label>
                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">{selectedCharacter.description}</p>
                      </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          handleEdit(selectedCharacter);
                          setSelectedCharacter(null);
                        }}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
                      >
                        Edit Character
                      </button>
                      <button
                        onClick={() => setSelectedCharacter(null)}
                        className="flex-1 bg-white text-gray-700 font-semibold py-3 px-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 shadow-lg transition-colors"
                      >
                        Close
                      </button>
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
            {/* Filters and Search */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by character or book..."
                    value={characterSearchQuery}
                    onChange={(e) => {
                      setCharacterSearchQuery(e.target.value);
                      setCharacterCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                  />
                </div>

                {/* Book Filter */}
                <select
                  value={characterBookFilter}
                  onChange={(e) => {
                    setCharacterBookFilter(e.target.value);
                    setCharacterCurrentPage(1);
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow min-w-[200px]"
                >
                  <option value="all">All Books</option>
                  {books.map(book => (
                    <option key={book.id} value={book.id}>{book.title}</option>
                  ))}
                </select>
              </div>

              {/* Add Character Button */}
              <button
                onClick={() => setShowCharacterForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 flex items-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl rounded-lg whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Add New Character
              </button>
            </div>

            {/* Filtering and Pagination Logic */}
            {(() => {
              // Filter characters
              const filteredCharacters = characters.filter(character => {
                const matchesSearch = characterSearchQuery === '' || 
                  character.name.toLowerCase().includes(characterSearchQuery.toLowerCase()) ||
                  character.book_title.toLowerCase().includes(characterSearchQuery.toLowerCase());
                const matchesBook = characterBookFilter === 'all' || character.book_id === parseInt(characterBookFilter);
                return matchesSearch && matchesBook;
              });

              // Pagination
              const indexOfLastCharacter = characterCurrentPage * charactersPerPage;
              const indexOfFirstCharacter = indexOfLastCharacter - charactersPerPage;
              const currentCharacters = filteredCharacters.slice(indexOfFirstCharacter, indexOfLastCharacter);
              const totalPages = Math.ceil(filteredCharacters.length / charactersPerPage);

              return (
                <>
                  {/* Characters List */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">All Characters ({filteredCharacters.length})</h2>
                        {characterSearchQuery || characterBookFilter !== 'all' ? (
                          <button
                            onClick={() => {
                              setCharacterSearchQuery('');
                              setCharacterBookFilter('all');
                              setCharacterCurrentPage(1);
                            }}
                            className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Clear Filters
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
                        <p className="text-xl font-semibold mt-4 text-gray-600">Loading characters...</p>
                      </div>
                    ) : filteredCharacters.length === 0 ? (
                      <div className="p-12 text-center">
                        <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-xl font-semibold text-gray-500">
                          {characterSearchQuery || characterBookFilter !== 'all' ? 'No characters match your filters' : 'No characters found'}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          {characterSearchQuery || characterBookFilter !== 'all' 
                            ? 'Try adjusting your search or filters' 
                            : 'Click "Add New Character" to get started'}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid md:grid-cols-2 gap-4 p-6">
                          {currentCharacters.map((character) => (
                            <div key={character.id} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-xl hover:border-purple-300 transition-all">
                              <div className="flex items-start gap-4">
                                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md border-2 border-gray-200">
                                  <img 
                                    src={character.image || '/book.svg'} 
                                    alt={character.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-bold mb-1 text-gray-900">{character.name}</h3>
                                  <p className="text-sm font-semibold text-purple-600 mb-1">{character.book_title}</p>
                                  <p className="text-xs text-gray-500 mb-2">by {character.book_author}</p>
                                  <p className="text-sm text-gray-600 line-clamp-2 italic">"{character.greeting}"</p>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                                <button
                                  onClick={() => handleEdit(character)}
                                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4 inline mr-1" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(character.id)}
                                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4 inline mr-1" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                Showing {indexOfFirstCharacter + 1} to {Math.min(indexOfLastCharacter, filteredCharacters.length)} of {filteredCharacters.length} characters
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setCharacterCurrentPage(prev => Math.max(prev - 1, 1))}
                                  disabled={characterCurrentPage === 1}
                                  className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                                    characterCurrentPage === 1
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
                                  }`}
                                >
                                  <ChevronLeft className="w-5 h-5" />
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                  <button
                                    key={page}
                                    onClick={() => setCharacterCurrentPage(page)}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                      characterCurrentPage === page
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                ))}
                                
                                <button
                                  onClick={() => setCharacterCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                  disabled={characterCurrentPage === totalPages}
                                  className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                                    characterCurrentPage === totalPages
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
                                  }`}
                                >
                                  <ChevronRightIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Registered Users</h2>
              <p className="text-gray-600 font-medium">Manage user accounts and view activity</p>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={userSearchQuery}
                  onChange={(e) => {
                    setUserSearchQuery(e.target.value);
                    setUserCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Role Filter */}
              <div className="relative">
                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    setUserCurrentPage(1);
                  }}
                  className="w-full md:w-48 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all appearance-none bg-white font-medium cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="user">👤 User</option>
                  <option value="moderator">⚡ Moderator</option>
                  <option value="admin">🛡️ Admin</option>
                </select>
              </div>

              {/* Add User Button */}
              <button
                onClick={() => setShowAddUserForm(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-green-600 text-white font-bold rounded-lg hover:from-teal-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add User
              </button>

              {/* Clear Filters Button */}
              {(userSearchQuery || userRoleFilter !== 'all') && (
                <button
                  onClick={() => {
                    setUserSearchQuery('');
                    setUserRoleFilter('all');
                    setUserCurrentPage(1);
                  }}
                  className="px-4 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⏳</div>
                <p className="text-xl font-bold">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-2xl font-bold mb-2">No Users Yet</h3>
                <p className="text-gray-600 font-medium">Users will appear here once they register</p>
              </div>
            ) : (
              (() => {
                // Filter users based on search query and role
                const filteredUsers = users.filter(user => {
                  const matchesSearch = userSearchQuery === '' || 
                    user.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                    (user.full_name && user.full_name.toLowerCase().includes(userSearchQuery.toLowerCase()));
                  
                  const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
                  
                  return matchesSearch && matchesRole;
                });

                // Pagination logic
                const indexOfLastUser = userCurrentPage * usersPerPage;
                const indexOfFirstUser = indexOfLastUser - usersPerPage;
                const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
                const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

                return (
                  <>
                    {currentUsers.length === 0 ? (
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-2xl font-bold mb-2">No Users Found</h3>
                        <p className="text-gray-600 font-medium">Try adjusting your search criteria</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gradient-to-r from-teal-600 to-green-600 text-white">
                                <tr>
                                  <th className="text-left p-4 font-bold text-sm">ID</th>
                                  <th className="text-left p-4 font-bold text-sm">Username</th>
                                  <th className="text-left p-4 font-bold text-sm">Email</th>
                                  <th className="text-left p-4 font-bold text-sm">Full Name</th>
                                  <th className="text-left p-4 font-bold text-sm">Role</th>
                                  <th className="text-left p-4 font-bold text-sm">Conversations</th>
                                  <th className="text-left p-4 font-bold text-sm">Joined</th>
                                  <th className="text-left p-4 font-bold text-sm">Last Login</th>
                                  <th className="text-left p-4 font-bold text-sm">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {currentUsers.map((user) => (
                                  <tr key={user.id} className="hover:bg-teal-50 transition-colors">
                                    <td className="p-4 font-bold text-gray-700">{user.id}</td>
                                    <td className="p-4">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-600 to-green-600 flex items-center justify-center">
                                          <UserIcon className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="font-bold text-gray-800">{user.username}</span>
                                      </div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-600">{user.email}</td>
                                    <td className="p-4 font-medium text-gray-700">{user.full_name || '-'}</td>
                                    <td className="p-4">
                                      <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                          user.role === 'admin' 
                                            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                                            : user.role === 'moderator'
                                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                                            : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                        }`}>
                                          {user.role?.toUpperCase() || 'USER'}
                                        </span>
                                        <button
                                          onClick={() => {
                                            setEditingUserRole(user);
                                            setSelectedRole(user.role || 'user');
                                          }}
                                          className="text-teal-600 hover:text-teal-800 transition-colors"
                                          title="Edit Role"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-teal-600" />
                                        <span className="font-bold text-gray-800">{user.conversation_count || 0}</span>
                                      </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                      {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="p-4">
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => handleEditUser(user)}
                                          className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-2 rounded-lg hover:shadow-lg transition-all"
                                          title="Edit User"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteUser(user.id)}
                                          className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-lg hover:shadow-lg transition-all"
                                          title="Delete User"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-gray-600 font-medium">
                              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setUserCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={userCurrentPage === 1}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              
                              <div className="flex gap-2">
                                {[...Array(totalPages)].map((_, index) => (
                                  <button
                                    key={index + 1}
                                    onClick={() => setUserCurrentPage(index + 1)}
                                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                                      userCurrentPage === index + 1
                                        ? 'bg-gradient-to-r from-teal-600 to-green-600 text-white shadow-lg'
                                        : 'border-2 border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    {index + 1}
                                  </button>
                                ))}
                              </div>
                              
                              <button
                                onClick={() => setUserCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={userCurrentPage === totalPages}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                <ChevronRightIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                );
              })()
            )}
          </div>
        )}
      </div>

      {/* Character Form Modal - Available from any tab */}
      {showCharacterForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {editingCharacter ? 'Edit Character' : 'Add New Character'}
              </h2>
              <button
                onClick={resetForm}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Character Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                      required
                      placeholder="Enter character name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Book *</label>
                    <select
                      value={formData.book_id}
                      onChange={(e) => setFormData({ ...formData, book_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
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
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Color Theme *</label>
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                      required
                    >
                      {colorOptions.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Character Image</label>
                    <div className="space-y-3">
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="relative inline-block">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-32 h-32 object-cover border-2 border-gray-200 rounded-lg shadow-lg"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
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
                          className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg font-medium cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
                        >
                          <Upload className="w-5 h-5 text-purple-600" />
                          <span className="text-gray-700">{imagePreview ? 'Change Image' : 'Upload Image'}</span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        Supported formats: JPEG, PNG, GIF, WebP, SVG (Max 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Personality/Instructions *</label>
                  <textarea
                    value={formData.personality}
                    onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow h-32 resize-none"
                    required
                    placeholder="You are [Character Name]..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Greeting Message *</label>
                  <textarea
                    value={formData.greeting}
                    onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow h-24 resize-none"
                    required
                    placeholder="Welcome message from the character..."
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-8 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    {editingCharacter ? 'Update Character' : 'Create Character'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-white text-gray-700 font-semibold py-3 px-8 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}

      {/* Role Editing Modal */}
      {editingUserRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-green-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Edit User Role</h2>
              <button
                onClick={() => {
                  setEditingUserRole(null);
                  setSelectedRole('');
                }}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-teal-50 to-green-50 border-2 border-teal-200 p-4 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">User:</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-600 to-green-600 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{editingUserRole.username}</p>
                    <p className="text-sm text-gray-600">{editingUserRole.email}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
                  Select Role
                </label>
                <div className="space-y-3">
                  {['user', 'moderator', 'admin'].map((role) => (
                    <label
                      key={role}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedRole === role
                          ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-green-50 shadow-lg'
                          : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={selectedRole === role}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-5 h-5 text-teal-600 focus:ring-teal-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            role === 'admin' 
                              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                              : role === 'moderator'
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          }`}>
                            {role.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {role === 'admin' && 'Full administrative access to all features'}
                          {role === 'moderator' && 'Can moderate content and manage users'}
                          {role === 'user' && 'Regular user with standard permissions'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpdateRole}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-green-600 text-white font-bold py-3 px-8 rounded-xl hover:from-teal-700 hover:to-green-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
                >
                  Update Role
                </button>
                <button
                  onClick={() => {
                    setEditingUserRole(null);
                    setSelectedRole('');
                  }}
                  className="flex-1 bg-white text-gray-700 font-semibold py-3 px-8 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white p-6 flex justify-between items-center flex-shrink-0">
              <h2 className="text-2xl font-bold">Edit User Details</h2>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setUserFormData({ username: '', email: '', full_name: '', password: '' });
                }}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 p-4 rounded-xl mb-4">
                <p className="text-sm text-gray-600 mb-2">Editing user:</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">ID: {editingUser.id}</p>
                    <p className="text-sm text-gray-600">Current: {editingUser.username}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Username
                </label>
                <input
                  type="text"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Email
                </label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  placeholder="Enter email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userFormData.full_name}
                  onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  placeholder="Enter full name (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  New Password
                </label>
                <input
                  type="password"
                  value={userFormData.password || ''}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                  placeholder="Enter new password (leave blank to keep current)"
                  minLength="6"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password. Minimum 6 characters if changing.</p>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white font-bold py-3 px-8 rounded-xl hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
                >
                  Update User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setUserFormData({ username: '', email: '', full_name: '', password: '' });
                  }}
                  className="flex-1 bg-white text-gray-700 font-semibold py-3 px-8 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 via-green-600 to-emerald-600 text-white p-6 flex justify-between items-center flex-shrink-0">
              <h2 className="text-2xl font-bold">Add New User</h2>
              <button
                onClick={() => {
                  setShowAddUserForm(false);
                  setNewUserFormData({
                    username: '',
                    email: '',
                    password: '',
                    full_name: '',
                    role: 'user'
                  });
                }}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2 bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={newUserFormData.username}
                    onChange={(e) => setNewUserFormData({ ...newUserFormData, username: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium"
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUserFormData.email}
                    onChange={(e) => setNewUserFormData({ ...newUserFormData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium"
                    placeholder="Enter email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
                  Password *
                </label>
                <input
                  type="password"
                  value={newUserFormData.password}
                  onChange={(e) => setNewUserFormData({ ...newUserFormData, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium"
                  placeholder="Enter password (min 6 characters)"
                  minLength="6"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Minimum 6 characters required</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUserFormData.full_name}
                  onChange={(e) => setNewUserFormData({ ...newUserFormData, full_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium"
                  placeholder="Enter full name (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
                  Role *
                </label>
                <div className="space-y-3">
                  {['user', 'moderator', 'admin'].map((role) => (
                    <label
                      key={role}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        newUserFormData.role === role
                          ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-green-50 shadow-lg'
                          : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="newUserRole"
                        value={role}
                        checked={newUserFormData.role === role}
                        onChange={(e) => setNewUserFormData({ ...newUserFormData, role: e.target.value })}
                        className="w-5 h-5 text-teal-600 focus:ring-teal-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            role === 'admin' 
                              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                              : role === 'moderator'
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          }`}>
                            {role.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {role === 'admin' && 'Full administrative access to all features'}
                          {role === 'moderator' && 'Can moderate content and manage users'}
                          {role === 'user' && 'Regular user with standard permissions'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-teal-600 via-green-600 to-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:from-teal-700 hover:via-green-700 hover:to-emerald-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserForm(false);
                    setNewUserFormData({
                      username: '',
                      email: '',
                      password: '',
                      full_name: '',
                      role: 'user'
                    });
                  }}
                  className="flex-1 bg-white text-gray-700 font-semibold py-3 px-8 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
