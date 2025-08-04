// I had to make this since the AI sold. i suck at react why did u sell so hard 😭🙏
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CALLBACK_API_URL = 'https://auth.mardev.app/token';
const CLIENT_ID = 'mardev-app-client';
const REDIRECT_URI = 'https://mardev.app/auth/callback';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Checking...');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  // Cookie utilities
  const setCookie = (name: string, value: string, days = 30) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    const error_description = params.get('error_description');

    if (error) {
      console.error('OAuth error:', error, error_description);
      setMessage(`Authentication failed: ${error_description || error}`);
      setStatus('error');
      return;
    }

    if (!code) {
      setMessage('Missing code from provider.');
      setStatus('error');
      return;
    }

    async function exchangeCodeForToken() {
      try {
        setMessage('Processing authentication...');
        setStatus('loading');

        const res = await fetch(CALLBACK_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            code,
            redirect_uri: REDIRECT_URI
          })
        });

        if (!res.ok) throw new Error(`Failed to exchange token: ${res.status}`);
        const data = await res.json();

        if (!data.access_token) throw new Error('No access token returned.');

        setCookie('mardev_auth', data.access_token, 30);
        if (data.refresh_token) {
          setCookie('mardev_refresh', data.refresh_token, 90);
        }

        setMessage('Authentication successful!');
        setStatus('success');

        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch (err) {
        console.error(err);
        setMessage('Authentication failed: Unable to complete login');
        setStatus('error');
      }
    }

    exchangeCodeForToken();
  }, []);

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.text}>
        {status === 'loading' ? '⏳' : status === 'success' ? '✅' : '❌'} {message}
      </h2>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: '#111',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
  },
  text: {
    fontSize: '1.25rem',
    padding: '2rem',
    borderRadius: '12px',
    backgroundColor: '#222',
    boxShadow: '0 0 20px rgba(0,0,0,0.5)',
  },
};
