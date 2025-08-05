import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2, ArrowLeft, Sparkles, User, Mail, MessageSquare } from 'lucide-react';

interface OnboardingData {
  username: string;
  marmailEmail: string;
  heardFrom: string;
}

export const OnboardingForm = () => {
  const { user, setOnboardingComplete, isOfflineMode } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<OnboardingData>({
    username: '',
    marmailEmail: '',
    heardFrom: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameError, setUsernameError] = useState('');
  const [tableExists, setTableExists] = useState(true);

  // Check if table exists on component mount
  useEffect(() => {
    if (isOfflineMode) {
      setTableExists(false);
      return;
    }

    const checkTableExists = async () => {
      try {
        const { error } = await supabase
          .from('user_onboarding')
          .select('id')
          .limit(1);
        
        if (error && error.code === '42P01') { // Table doesn't exist
          console.log('user_onboarding table does not exist yet');
          setTableExists(false);
        }
      } catch (error) {
        console.log('Error checking table existence:', error);
        setTableExists(false);
      }
    };

    checkTableExists();
  }, [isOfflineMode]);

  // Debounced username checking
  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.username || formData.username.length < 3) {
        setUsernameStatus('idle');
        setUsernameError('');
        return;
      }

      // If offline mode or table doesn't exist, skip checking
      if (isOfflineMode || !tableExists) {
        setUsernameStatus('available');
        setUsernameError('');
        return;
      }

      setUsernameStatus('checking');
      setUsernameError('');

      try {
        console.log('Checking username:', formData.username);
        
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('username')
          .eq('username', formData.username)
          .maybeSingle();

        console.log('Username check result:', { data, error });

        if (error) {
          console.error('Supabase error:', error);
          // If table doesn't exist or other error, assume available
          setUsernameStatus('available');
          setUsernameError('');
          return;
        }

        if (data) {
          // Username found - taken
          setUsernameStatus('taken');
          setUsernameError('This username is already taken');
        } else {
          // Username not found - available
          setUsernameStatus('available');
          setUsernameError('');
        }
      } catch (error) {
        console.error('Error checking username:', error);
        // On any error, assume available to not block the user
        setUsernameStatus('available');
        setUsernameError('');
      }
    };

    const timeoutId = setTimeout(checkUsername, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData.username, tableExists, isOfflineMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Final validation before submission
    if (usernameStatus === 'taken') {
      setError('Please choose a different username');
      setIsSubmitting(false);
      return;
    }

    if (!validateUsername(formData.username)) {
      setError('Please enter a valid username (3-20 characters, letters, numbers, hyphens, and underscores only)');
      setIsSubmitting(false);
      return;
    }

    try {
      if (!user && !isOfflineMode) {
        throw new Error('User not authenticated');
      }

      // If offline mode, just mark onboarding as complete
      if (isOfflineMode) {
        console.log('Offline mode: skipping database save');
        setIsCompleted(true);
        setOnboardingComplete(true);
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      // If table doesn't exist, just mark onboarding as complete
      if (!tableExists) {
        console.log('Table does not exist, skipping database save');
        setIsCompleted(true);
        setOnboardingComplete(true);
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      // Update user metadata in auth.users table for MarChat integration
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          username: formData.username,
          marmail_email: formData.marmailEmail,
          display_name: formData.username,
          full_name: formData.username,
          onboarding_complete: true
        }
      });

      if (updateError) {
        console.error('Error updating user metadata:', updateError);
        // Don't throw here, continue with onboarding table insert
      }

      // Save onboarding data to database
      const { error: insertError } = await supabase
        .from('user_onboarding')
        .insert({
          user_id: user!.id,
          username: formData.username,
          marmail_email: formData.marmailEmail,
          heard_from: formData.heardFrom,
          is_complete: true,
        });

      if (insertError) {
        console.error('Database error:', insertError);
        throw new Error(insertError.message);
      }

      // Mark as completed locally first
      setIsCompleted(true);
      
      // Mark onboarding as complete in context
      setOnboardingComplete(true);
      
      // Wait a moment to show the completion state, then redirect
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('Onboarding error:', error);
      setError(error.message || 'Failed to save onboarding data');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Username validation function
  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  };

  const handleUsernameChange = (username: string) => {
    // Validate username format
    if (username && !validateUsername(username)) {
      setUsernameError('Username must be 3-20 characters and contain only letters, numbers, hyphens, and underscores');
    } else {
      setUsernameError('');
    }

    // Update username
    setFormData(prev => ({
      ...prev,
      username,
    }));

    // Auto-generate MarMail email based on username
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    const marmailEmail = cleanUsername ? `${cleanUsername}#mardev.app` : '';
    
    setFormData(prev => ({
      ...prev,
      username,
      marmailEmail,
    }));
  };

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    if (field === 'username') {
      handleUsernameChange(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const getUsernameStatusIcon = () => {
    switch (usernameStatus) {
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'taken':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getUsernameStatusText = () => {
    if (isOfflineMode) {
      return 'Offline mode - validation disabled';
    }
    
    if (!tableExists) {
      return 'Username validation disabled';
    }
    
    switch (usernameStatus) {
      case 'checking':
        return 'Checking availability...';
      case 'available':
        return 'Username available';
      case 'taken':
        return 'Username taken';
      default:
        return '';
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="w-screen h-screen bg-gradient-background">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-400/30 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-blue-500/20 rounded-full blur-xl animate-ping"></div>
        <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-indigo-500/15 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="w-full h-full flex flex-col relative z-10">
        {/* Back Button */}
        <div className="p-6 animate-slideInFromTop">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Main Content - Full Screen */}
        <div className="flex-1 flex items-center justify-center px-6">
          <Card className="w-full max-w-lg bg-card/50 backdrop-blur-sm border-border/50 shadow-xl animate-slideInFromBottom hover:shadow-2xl transition-all duration-500">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-lg animate-bounce hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground mb-2 animate-fadeIn">
                Welcome to MarDev!
              </CardTitle>
              <CardDescription className="text-muted-foreground animate-fadeIn animation-delay-200">
                Let's get to know you better. This will only take a moment.
                {isOfflineMode && (
                  <span className="block text-yellow-500 mt-2 text-sm animate-pulse">
                    Running in offline mode - data will not be saved
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 animate-fadeIn animation-delay-300">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username Field */}
                <div className="space-y-2 transform transition-all duration-300 hover:scale-[1.02]">
                  <Label htmlFor="username" className="text-foreground font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-400" />
                    Choose Your Username
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      required
                      minLength={3}
                      maxLength={20}
                      disabled={isCompleted}
                      className={`pl-3 pr-10 py-3 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 focus:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${
                        usernameStatus === 'taken' ? 'border-red-500 animate-shake' : 
                        usernameStatus === 'available' ? 'border-green-500' : ''
                      }`}
                    />
                    {usernameStatus !== 'idle' && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 animate-fadeIn">
                        {getUsernameStatusIcon()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      This will be your display name in the community
                    </p>
                    {usernameStatus !== 'idle' && (
                      <p className={`text-xs font-medium transition-all duration-300 ${
                        usernameStatus === 'available' ? 'text-green-500 animate-pulse' :
                        usernameStatus === 'taken' ? 'text-red-500 animate-shake' :
                        'text-blue-500'
                      }`}>
                        {getUsernameStatusText()}
                      </p>
                    )}
                  </div>
                  {usernameError && (
                    <p className="text-xs text-red-500 font-medium animate-shake">{usernameError}</p>
                  )}
                </div>
                
                {/* MarMail Email Field */}
                <div className="space-y-2 transform transition-all duration-300 hover:scale-[1.02]">
                  <Label htmlFor="marmailEmail" className="text-foreground font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-400" />
                    Your MarMail Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="marmailEmail"
                      type="text"
                      placeholder="yourname"
                      value={formData.marmailEmail.replace('#mardev.app', '')}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      required
                      className="pl-3 pr-24 py-3 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 focus:scale-[1.02]"
                      disabled
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-muted-foreground text-sm font-medium">#mardev.app</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your complete MarMail address: <span className="text-purple-400 font-medium animate-pulse">{formData.marmailEmail || 'yourname#mardev.app'}</span>
                  </p>
                </div>

                {/* How did you hear about us */}
                <div className="space-y-2 transform transition-all duration-300 hover:scale-[1.02]">
                  <Label htmlFor="heardFrom" className="text-foreground font-medium flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    How did you hear about MarDev?
                  </Label>
                  <Select
                    value={formData.heardFrom}
                    onValueChange={(value) => handleInputChange('heardFrom', value)}
                    required
                    disabled={isCompleted}
                  >
                    <SelectTrigger className="py-3 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 focus:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border animate-slideInFromTop">
                      <SelectItem value="social-media">Social Media</SelectItem>
                      <SelectItem value="friend">Friend/Colleague</SelectItem>
                      <SelectItem value="search">Search Engine</SelectItem>
                      <SelectItem value="advertisement">Advertisement</SelectItem>
                      <SelectItem value="blog">Blog/Article</SelectItem>
                      <SelectItem value="podcast">Podcast</SelectItem>
                      <SelectItem value="conference">Conference/Event</SelectItem>
                      <SelectItem value="github">GitHub</SelectItem>
                      <SelectItem value="discord">Discord</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Error Message */}
                {error && (
                  <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 animate-shake">
                    <AlertDescription className="text-red-400 font-medium">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Success Message or Submit Button */}
                {isCompleted ? (
                  <div className="text-center py-4">
                    <div className="flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500 mr-2" />
                      <span className="text-xl font-semibold text-green-500">Setup Complete!</span>
                    </div>
                    <p className="text-muted-foreground mb-2">
                      Welcome to MarDev, {formData.username}!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your MarMail: <span className="text-purple-400 font-medium">{formData.marmailEmail}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Redirecting you to the main app...
                    </p>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] transform"
                    disabled={isSubmitting || usernameStatus === 'taken' || usernameStatus === 'checking'}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Setting up your account...
                      </div>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                        Complete Setup
                      </>
                    )}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 