import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const RedirectHandler = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Check if the code looks like a short code (6-8 alphanumeric characters)
        const shortCodePattern = /^[A-Za-z0-9]{6,8}$/;
        if (!shortCodePattern.test(code)) {
          // Not a valid short code format, redirect to home
          navigate('/');
          return;
        }

        // Use the API endpoint to get link details and increment click count
        const response = await fetch(`/api/links/${code}?redirect=true`);
        
        if (response.ok) {
          const linkData = await response.json();
          if (linkData.url) {
            // Redirect to the original URL
            window.location.href = linkData.url;
            return;
          }
        } else if (response.status === 404) {
          setError('Short link not found');
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        // If we get here, something went wrong
        setError('Unable to redirect');
        setTimeout(() => navigate('/'), 3000);
        
      } catch (error) {
        console.error('Error handling redirect:', error);
        setError('Error processing redirect');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    if (code) {
      handleRedirect();
    }
  }, [code, navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

export default RedirectHandler;