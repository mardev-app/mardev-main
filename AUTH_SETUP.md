# Authentication Setup Guide

This project uses Supabase Auth with OAuth providers for authentication. Here's how to set it up:

## Current Implementation

The authentication system includes:

1. **AuthContext** (`src/contexts/AuthContext.tsx`) - Manages authentication state
2. **AuthStatus Component** (`src/components/AuthStatus.tsx`) - Shows login/logout UI
3. **ProtectedRoute Component** (`src/components/ProtectedRoute.tsx`) - Protects routes requiring authentication
4. **LoginPage Component** (`src/components/LoginPage.tsx`) - Dedicated login page
5. **AuthCallback Page** (`src/pages/auth/callback.tsx`) - Handles OAuth redirects

## Supabase Configuration

### 1. Enable OAuth Providers

In your Supabase dashboard:

1. Go to **Authentication** > **Providers**
2. Enable the providers you want to use:
   - Google
   - GitHub
   - Discord

### 2. Configure OAuth Providers

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret to Supabase

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL to:
   - `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

#### Discord OAuth
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 settings
4. Add redirect URI:
   - `https://your-project.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret to Supabase

### 3. Update Environment Variables

Make sure your Supabase URL and anon key are correctly set in `src/integrations/supabase/client.ts`.

## Usage

### Basic Authentication

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  
  if (user) {
    return <div>Welcome, {user.email}!</div>;
  }
  
  return <button onClick={() => signIn('google')}>Sign in with Google</button>;
}
```

### Protected Routes

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

<Route path="/protected" element={
  <ProtectedRoute>
    <ProtectedComponent />
  </ProtectedRoute>
} />
```

### Authentication Status

The `AuthStatus` component automatically shows in the top-right corner of the app, providing:
- Login dropdown with OAuth options
- User email display when authenticated
- Logout button

## Features

- ✅ OAuth authentication with Google, GitHub, and Discord
- ✅ Automatic session management
- ✅ Protected routes
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive UI
- ✅ TypeScript support

## Troubleshooting

### Common Issues

1. **OAuth redirect errors**: Make sure redirect URIs are correctly configured in both Supabase and OAuth provider settings.

2. **CORS issues**: Ensure your domain is whitelisted in Supabase settings.

3. **Session not persisting**: Check that localStorage is enabled and not blocked by browser settings.

### Development

To test locally:
1. Run `npm run dev`
2. Visit `http://localhost:8080`
3. Click the login button in the top-right corner
4. Choose an OAuth provider to test

The authentication system is now fully functional and ready for production use! 