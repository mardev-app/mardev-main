import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

export const SupabaseTest = () => {
  const [status, setStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [error, setError] = useState<string>('');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const testConnection = async () => {
    try {
      setStatus('testing');
      setError('');
      
      console.log('Testing Supabase connection...');
      
      // Test basic connection with better error handling
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('id')
        .limit(1);
      
      if (error) {
        // Only show as error for actual connection issues
        if (error.code === 'PGRST301' || error.code === 'PGRST302' || error.message?.includes('fetch')) {
          console.error('Supabase connection test failed:', error);
          setStatus('error');
          setError(error.message);
          return;
        }
        // For other errors (like table not found), consider it connected
        console.log('Supabase connected but table query failed:', error);
        setStatus('connected');
        setError('');
        return;
      }
      
      console.log('Supabase connection successful:', data);
      setStatus('connected');
      setError('');
    } catch (err: any) {
      console.error('Supabase connection error:', err);
      // Only show as error for network/connection issues
      if (err.message?.includes('fetch') || err.message?.includes('network') || err.message?.includes('connection')) {
        setStatus('error');
        setError(err.message || 'Connection failed');
      } else {
        setStatus('connected');
        setError('');
      }
    } finally {
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    testConnection();
    
    // Test connection every 60 seconds instead of 30
    const interval = setInterval(testConnection, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Wifi className="w-4 h-4 animate-pulse" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      default:
        return 'Testing...';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div 
        className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg cursor-pointer hover:bg-white/20 transition-colors`}
        onClick={testConnection}
        title={`Last checked: ${lastCheck.toLocaleTimeString()}. Click to test again.`}
      >
        <div className={`${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      {status === 'error' && (
        <div className="absolute bottom-full right-0 mb-2 bg-red-500/90 backdrop-blur-xl border border-red-400/30 rounded-lg px-3 py-2 text-xs text-red-100 max-w-xs">
          <div className="font-semibold mb-1">Connection Error:</div>
          <div className="text-red-200">{error}</div>
          <div className="text-red-300 mt-1">Click to retry</div>
        </div>
      )}
    </div>
  );
}; 