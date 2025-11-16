import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * OAuth Callback Handler Component
 * Handles the redirect from social login providers
 */
const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');
    const error = searchParams.get('error');

    if (error) {
      console.error('Social login error:', error);
      navigate('/login?error=' + error);
      return;
    }

    if (token) {
      // Store the token
      localStorage.setItem('token', token);
      
      // Show success message
      console.log(`✅ Logged in successfully with ${provider}`);
      
      // Redirect to home page
      navigate('/', { replace: true });
    } else {
      // No token, redirect to login
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
