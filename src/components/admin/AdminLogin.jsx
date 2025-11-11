import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));
      onLogin(data.admin);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center p-4 relative overflow-hidden" style={{ fontFamily: 'Roboto, sans-serif' }}>
      {/* Animated gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-pink-500/20 animate-pulse"></div>
      
      {/* Decorative circles */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-20 blur-3xl"></div>
      
      <div className="bg-white/95 backdrop-blur-xl border-2 border-white/50 shadow-2xl max-w-md w-full p-8 rounded-3xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white p-5 rounded-3xl mb-4 shadow-xl transform hover:scale-105 transition-transform">
            <Lock className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Admin Login</h1>
          <p className="text-gray-700 font-semibold">Literary Chat Admin Panel</p>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-400 text-red-700 p-4 mb-6 rounded-xl font-medium shadow-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Username or Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-purple-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-xl transition-all hover:border-purple-300"
                placeholder="Enter username or email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-purple-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-xl transition-all hover:border-purple-300"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-bold py-4 px-6 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl rounded-xl transform hover:scale-[1.02]"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-700">
          <p className="font-semibold">Default credentials:</p>
          <p className="font-mono bg-gradient-to-r from-purple-50 to-fuchsia-50 p-3 mt-2 border-2 border-purple-200 rounded-xl shadow-md">
            username: <strong className="text-purple-700">admin</strong> | password: <strong className="text-purple-700">admin123</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
