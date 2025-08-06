import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2, Trash2, Settings as SettingsIcon, User, Mail, Save } from 'lucide-react';

interface UserData {
  name: string;
  username: string;
  marmailEmail: string;
}

export const Settings = () => {
  const { user, getUserDisplayName, refreshSession, refreshOnboardingStatus, isOfflineMode } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    name: '',
    username: '',
    marmailEmail: '',
  });
  const [originalData, setOriginalData] = useState<UserData>({
    name: '',
    username: '',
    marmailEmail: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameError, setUsernameError] = useState('');

  // Helper function to get cookie value
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
    return null;
  };

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Loading user data for settings...');
        
        // Check user-specific storage first
        const userPrefix = `user_${user.id}_`;
        let name = localStorage.getItem(`${userPrefix}mardev_user_name`) || getCookie(`${userPrefix}mardev_user_name`);
        let username = localStorage.getItem(`${userPrefix}mardev_username`) || getCookie(`${userPrefix}mardev_username`);
        let marmailEmail = localStorage.getItem(`${userPrefix}mardev_marmail`) || getCookie(`${userPrefix}mardev_marmail`);

        // Fallback to generic storage
        if (!name) name = localStorage.getItem('mardev_user_name') || getCookie('mardev_user_name');
        if (!username) username = localStorage.getItem('mardev_username') || getCookie('mardev_username');
        if (!marmailEmail) marmailEmail = localStorage.getItem('mardev_marmail') || getCookie('mardev_marmail');

        // Fallback to user metadata
        if (!name && user.user_metadata?.name) name = user.user_metadata.name;
        if (!username && user.user_metadata?.username) username = user.user_metadata.username;
        if (!marmailEmail && user.user_metadata?.marmail_email) marmailEmail = user.user_metadata.marmail_email;

        // Try to load from database if available
        if (!isOfflineMode) {
          try {
            const { data: onboardingData, error } = await supabase
              .from('user_onboarding')
              .select('name, username, marmail_email')
              .eq('user_id', user.id)
              .single();

            if (onboardingData && !error) {
              name = onboardingData.name || name;
              username = onboardingData.username || username;
              marmailEmail = onboardingData.marmail_email || marmailEmail;
            }
          } catch (dbError) {
            console.log('Could not load from database, using local data');
          }
        }

        const loadedData = {
          name: name || '',
          username: username || '',
          marmailEmail: marmailEmail || '',
        };

        setUserData(loadedData);
        setOriginalData(loadedData);
        
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user, isOfflineMode]);

  // Username validation function
  const validateUsername = (username: string): boolean => {
    if (username.length < 3 || username.length > 20) return false;
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) return false;
    if (username.startsWith('-') || username.startsWith('_') || 
        username.endsWith('-') || username.endsWith('_')) return false;
    if (username.includes('--') || username.includes('__') || 
        username.includes('-_') || username.includes('_-')) return false;
    if (/^\d+$/.test(username)) return false;
    const reserved = ['admin', 'root', 'api', 'www', 'mail', 'support', 'help', 'info', 'contact', 'about'];
    if (reserved.includes(username.toLowerCase())) return false;
    return true;
  };

  // MarMail validation function
  const validateMarMail = (marmail: string): boolean => {
    if (!marmail) return false;
    if (!marmail.endsWith('#mardev.app')) return false;
    const username = marmail.replace('#mardev.app', '');
    return validateUsername(username);
  };

  // Check username availability (debounced)
  useEffect(() => {
    if (!userData.username || userData.username === originalData.username || userData.username.length < 3) {
      setUsernameStatus('idle');
      setUsernameError('');
      return;
    }

    if (!validateUsername(userData.username)) {
      setUsernameStatus('idle');
      setUsernameError('Invalid username format');
      return;
    }

    if (isOfflineMode) {
      setUsernameStatus('available');
      setUsernameError('');
      return;
    }

    const checkUsername = async () => {
      setUsernameStatus('checking');
      setUsernameError('');

      try {
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('username')
          .eq('username', userData.username)
          .neq('user_id', user?.id)
          .maybeSingle();

        if (error) {
          setUsernameStatus('available');
          setUsernameError('');
          return;
        }

        if (data) {
          setUsernameStatus('taken');
          setUsernameError('This username is already taken');
        } else {
          setUsernameStatus('available');
          setUsernameError('');
        }
      } catch (error) {
        setUsernameStatus('available');
        setUsernameError('');
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [userData.username, originalData.username, isOfflineMode, user?.id]);

  const handleInputChange = (field: keyof UserData, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Auto-update MarMail when username changes
    if (field === 'username') {
      const cleanUsername = value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      const marmailEmail = cleanUsername ? `${cleanUsername}#mardev.app` : '';
      setUserData(prev => ({
        ...prev,
        marmailEmail,
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      // Validation
      if (!userData.name.trim() || userData.name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }

      if (!userData.username.trim() || !validateUsername(userData.username)) {
        throw new Error('Please enter a valid username');
      }

      if (!userData.marmailEmail.trim() || !validateMarMail(userData.marmailEmail)) {
        throw new Error('Please enter a valid MarMail address');
      }

      if (usernameStatus === 'taken') {
        throw new Error('Username is already taken');
      }

      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Saving user data...', userData);

      // Save to user-specific storage
      const userPrefix = `user_${user.id}_`;
      localStorage.setItem(`${userPrefix}mardev_user_name`, userData.name);
      localStorage.setItem(`${userPrefix}mardev_username`, userData.username);
      localStorage.setItem(`${userPrefix}mardev_marmail`, userData.marmailEmail);

      // Also save to generic storage for backwards compatibility
      localStorage.setItem('mardev_user_name', userData.name);
      localStorage.setItem('mardev_username', userData.username);
      localStorage.setItem('mardev_marmail', userData.marmailEmail);

      // Save to cookies
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      const expires = `expires=${expiryDate.toUTCString()}`;

      // User-specific cookies
      document.cookie = `${userPrefix}mardev_user_name=${encodeURIComponent(userData.name)}; ${expires}; path=/; SameSite=Strict`;
      document.cookie = `${userPrefix}mardev_username=${encodeURIComponent(userData.username)}; ${expires}; path=/; SameSite=Strict`;
      document.cookie = `${userPrefix}mardev_marmail=${encodeURIComponent(userData.marmailEmail)}; ${expires}; path=/; SameSite=Strict`;

      // Generic cookies
      document.cookie = `mardev_user_name=${encodeURIComponent(userData.name)}; ${expires}; path=/; SameSite=Strict`;
      document.cookie = `mardev_username=${encodeURIComponent(userData.username)}; ${expires}; path=/; SameSite=Strict`;
      document.cookie = `mardev_marmail=${encodeURIComponent(userData.marmailEmail)}; ${expires}; path=/; SameSite=Strict`;

      if (!isOfflineMode) {
        try {
          // Update user metadata
          await supabase.auth.updateUser({
            data: {
              name: userData.name,
              username: userData.username,
              marmail_email: userData.marmailEmail,
              display_name: userData.name,
              full_name: userData.name,
            }
          });

          // Update database record
          const { error: updateError } = await supabase
            .from('user_onboarding')
            .update({
              name: userData.name,
              username: userData.username,
              marmail_email: userData.marmailEmail,
            })
            .eq('user_id', user.id);

          if (updateError) {
            console.error('Database update error:', updateError);
            // Don't throw here, local save was successful
          }

          // Refresh session to update metadata
          await refreshSession();
          await refreshOnboardingStatus();
        } catch (dbError) {
          console.error('Database save failed:', dbError);
          // Don't throw here, local save was successful
        }
      }

      setOriginalData(userData);
      setMessage('Settings saved successfully!');
      
    } catch (error: any) {
      console.error('Save error:', error);
      setError(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError('');

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Deleting user account...');

      // Clear all local data
      const userPrefix = `user_${user.id}_`;
      
      // Remove user-specific data
      localStorage.removeItem(`${userPrefix}mardev_onboarding_complete`);
      localStorage.removeItem(`${userPrefix}mardev_user_name`);
      localStorage.removeItem(`${userPrefix}mardev_username`);
      localStorage.removeItem(`${userPrefix}mardev_marmail`);

      // Remove generic data
      localStorage.removeItem('mardev_onboarding_complete');
      localStorage.removeItem('mardev_user_name');
      localStorage.removeItem('mardev_username');
      localStorage.removeItem('mardev_marmail');

      // Clear cookies
      document.cookie = `${userPrefix}mardev_onboarding_complete=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${userPrefix}mardev_user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${userPrefix}mardev_username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${userPrefix}mardev_marmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      
      document.cookie = 'mardev_onboarding_complete=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'mardev_user_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'mardev_username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'mardev_marmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      if (!isOfflineMode) {
        try {
          // Delete from database
          await supabase
            .from('user_onboarding')
            .delete()
            .eq('user_id', user.id);

          // Clear user metadata
          await supabase.auth.updateUser({
            data: {
              name: null,
              username: null,
              marmail_email: null,
              display_name: null,
              full_name: null,
              onboarding_complete: null,
            }
          });
        } catch (dbError) {
          console.error('Database deletion failed:', dbError);
          // Continue with account deletion anyway
        }
      }

      // Sign out user
      window.location.href = '/';
      
    } catch (error: any) {
      console.error('Delete account error:', error);
      setError(error.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  const hasChanges = () => {
    return userData.name !== originalData.name ||
           userData.username !== originalData.username ||
           userData.marmailEmail !== originalData.marmailEmail;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-6 h-6 text-purple-500" />
            <CardTitle>Account Settings</CardTitle>
          </div>
          <CardDescription>
            Manage your profile information and account preferences.
            {isOfflineMode && (
              <span className="block text-yellow-500 mt-1 text-sm">
                Running in offline mode - changes will be saved locally
              </span>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4 text-purple-400" />
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={userData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`${
                userData.name && userData.name.trim().length < 2 ? 'border-red-500' : 
                userData.name && userData.name.trim().length >= 2 ? 'border-green-500' : ''
              }`}
            />
            {userData.name && userData.name.trim().length < 2 && (
              <p className="text-xs text-red-500">Name must be at least 2 characters long</p>
            )}
          </div>

          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <User className="w-4 h-4 text-purple-400" />
              Username
            </Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={userData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`pr-10 ${
                  usernameStatus === 'taken' ? 'border-red-500' : 
                  usernameStatus === 'available' ? 'border-green-500' : ''
                }`}
              />
              {usernameStatus !== 'idle' && userData.username !== originalData.username && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {usernameStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                  {usernameStatus === 'available' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {usernameStatus === 'taken' && <XCircle className="w-4 h-4 text-red-500" />}
                </div>
              )}
            </div>
            {usernameError && (
              <p className="text-xs text-red-500">{usernameError}</p>
            )}
            {usernameStatus === 'available' && userData.username !== originalData.username && (
              <p className="text-xs text-green-500">Username available</p>
            )}
          </div>

          {/* MarMail Email Field */}
          <div className="space-y-2">
            <Label htmlFor="marmailEmail" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              MarMail Address
            </Label>
            <div className="relative">
              <Input
                id="marmailEmail"
                type="text"
                placeholder="yourname"
                value={userData.marmailEmail.replace('#mardev.app', '')}
                onChange={(e) => handleInputChange('marmailEmail', e.target.value)}
                className={`pr-24 ${
                  userData.marmailEmail && !validateMarMail(userData.marmailEmail) ? 'border-red-500' : ''
                }`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-muted-foreground text-sm">#mardev.app</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your complete MarMail: <span className="text-purple-400 font-medium">{userData.marmailEmail || 'yourname#mardev.app'}</span>
            </p>
            {userData.marmailEmail && !validateMarMail(userData.marmailEmail) && (
              <p className="text-xs text-red-500">Please enter a valid MarMail address</p>
            )}
          </div>

          {/* Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={handleSave}
              disabled={
                isSaving || 
                !hasChanges() ||
                usernameStatus === 'taken' || 
                usernameStatus === 'checking' ||
                !userData.name.trim() ||
                userData.name.trim().length < 2 ||
                !userData.username.trim() ||
                !validateUsername(userData.username) ||
                !userData.marmailEmail.trim() ||
                !validateMarMail(userData.marmailEmail) ||
                !!usernameError
              }
              className="flex-1"
            >
              {isSaving ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </div>
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all associated data. 
                    This action cannot be undone. Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {isDeleting ? (
                      <div className="flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Deleting...
                      </div>
                    ) : (
                      'Delete Account'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
