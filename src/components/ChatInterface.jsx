import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, ArrowLeft, Image as ImageIcon, X, Trash2, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Message from './Message';
import { sendMessageToCharacter } from '../utils/api';

const ChatInterface = ({ character, onBack, user }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load or create conversation on mount
  useEffect(() => {
    if (user && character) {
      loadOrCreateConversation();
      loadConversationHistory();
    } else {
      // Guest mode - just show greeting
      setMessages([{
        role: 'assistant',
        content: character.greeting || `Hello! I'm ${character.name} from "${character.book}" by ${character.author}. What would you like to discuss?`
      }]);
    }
  }, [character, user]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversationHistory = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:3001/api/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter conversations for this character
        const characterConvos = data.filter(c => c.character_id === character.id);
        setConversations(characterConvos);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const loadOrCreateConversation = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('userToken');
      
      // Check if there's an existing active conversation
      const response = await fetch('http://localhost:3001/api/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const allConversations = await response.json();
        // Find most recent conversation with this character
        const existingConvo = allConversations
          .filter(c => c.character_id === character.id)
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];

        if (existingConvo) {
          // Load existing conversation
          loadConversation(existingConvo.id);
        } else {
          // Create new conversation
          createNewConversation();
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      // Fallback to greeting
      setMessages([{
        role: 'assistant',
        content: character.greeting || `Hello! I'm ${character.name}.`
      }]);
    }
  };

  const createNewConversation = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:3001/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          characterId: character.id,
          title: `Chat with ${character.name}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConversationId(data.id);
        setMessages(data.messages || []);
        loadConversationHistory();
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const loadConversation = async (convoId) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:3001/api/conversations/${convoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversationId(data.id);
        setMessages(data.messages || []);
        setShowHistory(false);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const deleteConversation = async (convoId, e) => {
    e.stopPropagation();
    
    if (!window.confirm(t('chat.confirmDelete'))) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:3001/api/conversations/${convoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // If we deleted the current conversation, create a new one
        if (convoId === conversationId) {
          createNewConversation();
        }
        loadConversationHistory();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const saveMessage = async (role, content, image = null) => {
    if (!user || !conversationId) return;

    try {
      const token = localStorage.getItem('userToken');
      await fetch(`http://localhost:3001/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          role,
          content,
          image
        })
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if ((!inputMessage.trim() && !selectedImage) || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Create user message with optional image
    const newMessage = {
      role: 'user',
      content: userMessage || 'What do you think of this image?',
      ...(imagePreview && { image: imagePreview })
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setIsLoading(true);

    // Save user message to database
    if (user) {
      await saveMessage('user', newMessage.content, newMessage.image || null);
    }

    try {
      // Build conversation history for API
      const conversationHistory = [];
      
      for (const msg of newMessages) {
        if (msg.image) {
          // Extract base64 data from data URL
          const base64Data = msg.image.split(',')[1];
          const mimeType = msg.image.split(';')[0].split(':')[1];
          
          conversationHistory.push({
            role: msg.role,
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: base64Data
                }
              },
              ...(msg.content ? [{
                type: 'text',
                text: msg.content
              }] : [])
            ]
          });
        } else {
          conversationHistory.push({
            role: msg.role,
            content: msg.content
          });
        }
      }

      const assistantResponse = await sendMessageToCharacter(character, conversationHistory);
      const assistantMessage = { role: 'assistant', content: assistantResponse };
      setMessages([...newMessages, assistantMessage]);
      
      // Save assistant message to database
      if (user) {
        await saveMessage('assistant', assistantResponse);
      }
      
      // Clear image after sending
      removeImage();
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: "I apologize, but I seem to be having trouble speaking at the moment. Please try again."
      };
      setMessages([...newMessages, errorMessage]);
      
      // Save error message too
      if (user) {
        await saveMessage('assistant', errorMessage.content);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 border-b border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start mb-6">
            <button
              onClick={onBack}
              className="bg-white/10 backdrop-blur-sm text-white font-semibold py-2.5 px-4 text-sm flex items-center gap-2 hover:bg-white/20 transition-all rounded-lg border border-white/30"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('chat.allCharacters')}
            </button>
            
            {user && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="bg-white/10 backdrop-blur-sm text-white font-semibold py-2.5 px-4 text-sm flex items-center gap-2 hover:bg-white/20 transition-all rounded-lg border border-white/30"
                >
                  <History className="w-4 h-4" />
                  {t('chat.history')} ({conversations.length})
                </button>
                <button
                  onClick={createNewConversation}
                  className="bg-white text-blue-600 font-semibold py-2.5 px-4 text-sm hover:bg-gray-50 transition-all rounded-lg shadow-md"
                >
                  + {t('chat.newChat')}
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
              {character.image ? (
                <img 
                  src={character.image} 
                  alt={character.name}
                  className="w-full h-full object-cover notranslate"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span className={`text-5xl ${character.image ? 'hidden' : 'flex'}`}>{character.avatar}</span>
            </div>
            <div className="text-white flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 notranslate" translate="no">{character.name}</h1>
              <p className="text-lg font-semibold opacity-90 notranslate" translate="no">{character.book}</p>
              <p className="text-sm font-medium opacity-75">by <span className="notranslate" translate="no">{character.author}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Conversation History Sidebar */}
      {showHistory && user && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <h3 className="text-xl font-bold mb-4 text-gray-900">{t('chat.yourConversations')} <span className="notranslate" translate="no">{character.name}</span></h3>
            {conversations.length === 0 ? (
              <p className="text-gray-600 font-medium">{t('chat.noPreviousConversations')}</p>
            ) : (
              <div className="grid gap-3 max-h-64 overflow-y-auto">
                {conversations.map((convo) => (
                  <div
                    key={convo.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:border-blue-300 transition-all flex justify-between items-start shadow-sm hover:shadow-md ${
                      convo.id === conversationId ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                    }`}
                    onClick={() => loadConversation(convo.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{convo.title}</h4>
                        {convo.id === conversationId && (
                          <span className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-0.5 rounded-full font-semibold">{t('chat.current')}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">{convo.last_message}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500 font-medium">
                        <span>{convo.message_count} {t('chat.messages')}</span>
                        <span>{new Date(convo.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteConversation(convo.id, e)}
                      className="ml-4 p-2 hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-300 transition-colors"
                      title={t('chat.deleteConversation')}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {messages.map((message, index) => (
            <Message
              key={index}
              message={message}
              characterAvatar={character.avatar}
              characterColor={character.color}
              characterImage={character.image}
            />
          ))}
          
          {isLoading && (
            <div className="flex gap-4 mb-6">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl border border-gray-200 shadow-sm bg-gray-100 overflow-hidden">
                {character.image ? (
                  <img 
                    src={character.image} 
                    alt={character.name}
                    className="w-full h-full object-cover notranslate"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <span className={`text-2xl ${character.image ? 'hidden' : 'block'}`}>{character.avatar}</span>
              </div>
              <div className="p-5 rounded-2xl border border-gray-200 shadow-lg bg-white">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Section */}
      <div className="border-t border-gray-200 bg-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4 relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-xs max-h-40 object-contain rounded-lg border border-gray-200 shadow-md"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="flex gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white border border-gray-300 px-4 py-4 hover:bg-gray-50 transition-all rounded-lg shadow-sm hover:shadow-md"
              disabled={isLoading}
              title={t('chat.uploadImage')}
            >
              <ImageIcon className="w-5 h-5 text-gray-600" />
            </button>
            
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`${t('chat.messagePlaceholder')} ${character.name}...`}
              className="flex-1 border border-gray-300 px-6 py-4 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all rounded-lg shadow-sm"
              disabled={isLoading}
            />
            
            <button
              onClick={sendMessage}
              disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 font-semibold hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-3 rounded-lg shadow-lg hover:shadow-xl"
            >
              <Send className="w-5 h-5" />
              {t('chat.send')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
