# Authentication & Onboarding Flow

## Overview
The authentication system now includes a post-signup onboarding flow that collects additional user information before allowing access to the full application.

## Authentication Methods

### 1. Phone Authentication (Primary)
- **Sign up**: Users can create accounts using their phone number
- **Sign in**: Existing users can sign in with phone + password
- **SMS verification**: Phone numbers are verified via SMS

### 2. OAuth Providers (Secondary)
- **Google**: Sign in with Google account
- **GitHub**: Sign in with GitHub account  
- **Discord**: Sign in with Discord account

## Onboarding Flow

### Step 1: Authentication
1. User clicks "Login" button
2. Chooses authentication method (Phone or OAuth)
3. Completes authentication process
4. System redirects to onboarding form

### Step 2: Onboarding Form
The onboarding form collects:
- **Username**: Display name for the community (3-20 characters)
- **MarMail Email**: Community email address (@marmail.com)
- **Where did you hear about MarDev?**: Marketing attribution

### Step 3: Database Storage
- Onboarding data is saved to `user_onboarding` table
- User is marked as having completed onboarding
- User is redirected to main application

## User Experience

### New Users
1. Sign up with phone number or OAuth
2. Automatically redirected to onboarding
3. Complete onboarding form
4. Access full application

### Returning Users
1. Sign in with existing credentials
2. If onboarding complete → Access full application
3. If onboarding incomplete → Redirected to onboarding

### Onboarding Status
- **Complete**: User can access all features
- **Incomplete**: User sees "Complete Setup" button in top-right corner

## Database Schema

### user_onboarding Table
```sql
CREATE TABLE public.user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  marmail_email TEXT NOT NULL UNIQUE,
  heard_from TEXT NOT NULL,
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Security Features

### Row Level Security (RLS)
- Users can only access their own onboarding data
- Automatic user ID validation
- Secure data isolation

### Data Validation
- Username: 3-20 characters, unique
- MarMail email: Valid email format, unique
- Required fields validation

## Routes

### Authentication Routes
- `/phone-login` - Phone authentication page
- `/login` - OAuth authentication page
- `/auth/callback` - OAuth callback handler

### Onboarding Routes
- `/onboarding` - Onboarding form (protected)

### Protected Routes
- `/chat` - Requires authentication + completed onboarding

## Implementation Details

### Components
- `PhoneLogin` - Phone authentication form
- `OnboardingForm` - User onboarding form
- `AuthStatus` - Authentication status display
- `ProtectedRoute` - Route protection with onboarding check

### Context
- `AuthContext` - Manages authentication state and onboarding status
- Automatic onboarding status checking
- Session persistence

## Testing

### Phone Authentication
1. Visit `/phone-login`
2. Enter phone number and password
3. Check for SMS verification
4. Complete onboarding form

### OAuth Authentication
1. Click login → Choose OAuth provider
2. Complete OAuth flow
3. Redirected to onboarding
4. Complete onboarding form

### Onboarding Flow
1. Sign up/sign in
2. Automatically redirected to `/onboarding`
3. Fill out form and submit
4. Redirected to main application

## Error Handling

### Authentication Errors
- Invalid credentials
- OAuth provider not configured
- Network connectivity issues

### Onboarding Errors
- Duplicate username/email
- Database connection issues
- Validation errors

### User Feedback
- Loading states during authentication
- Error messages for failed operations
- Success confirmations

## Future Enhancements

### Potential Features
- Email verification for MarMail addresses
- Username availability checking
- Onboarding progress indicators
- Social profile completion
- Preference settings

### Integration Opportunities
- Email marketing lists
- Analytics tracking
- User segmentation
- Community features 