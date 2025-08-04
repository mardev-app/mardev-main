# OAuth Provider Setup Guide

## Current Issue
You're seeing the error: `"Unsupported provider: provider is not enabled"` because OAuth providers are not configured in your Supabase project.

## Quick Fix: Use Email Authentication
For immediate testing, use the **"Continue with Email"** option in the login dropdown. This will work right away without any configuration.

## Setting Up OAuth Providers

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in and select your project: `lvpvlhywwjpxpvniagfo`

### Step 2: Enable OAuth Providers
1. In the left sidebar, click **Authentication**
2. Click **Providers**
3. Find the providers you want to enable:
   - **Google**
   - **GitHub** 
   - **Discord**
4. Toggle them **ON**

### Step 3: Configure Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Set Application Type to **Web application**
6. Add Authorized redirect URIs:
   ```
   https://lvpvlhywwjpxpvniagfo.supabase.co/auth/v1/callback
   ```
7. Copy the **Client ID** and **Client Secret**
8. Back in Supabase, paste them into the Google provider settings

### Step 4: Configure GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the details:
   - **Application name**: MarDev App
   - **Homepage URL**: `http://localhost:8080` (for development)
   - **Authorization callback URL**: `https://lvpvlhywwjpxpvniagfo.supabase.co/auth/v1/callback`
4. Click **Register application**
5. Copy the **Client ID** and **Client Secret**
6. Back in Supabase, paste them into the GitHub provider settings

### Step 5: Configure Discord OAuth
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Go to **OAuth2** in the left sidebar
4. Add redirect URI: `https://lvpvlhywwjpxpvniagfo.supabase.co/auth/v1/callback`
5. Copy the **Client ID** and **Client Secret**
6. Back in Supabase, paste them into the Discord provider settings

## Testing

### Email Authentication (Works Now)
1. Click the login button in the top-right corner
2. Select **"Continue with Email"**
3. Create an account or sign in
4. You'll receive a confirmation email (check spam folder)

### OAuth Authentication (After Setup)
1. Click the login button
2. Select your preferred OAuth provider
3. Complete the OAuth flow

## Troubleshooting

### Email Not Received
- Check spam/junk folder
- Verify email address is correct
- Wait a few minutes for delivery

### OAuth Still Not Working
- Double-check redirect URIs match exactly
- Ensure Client ID and Secret are copied correctly
- Verify the provider is toggled ON in Supabase

### Development vs Production
For production, update the redirect URIs to your actual domain:
```
https://yourdomain.com/auth/callback
```

## Current Status
✅ Email authentication is working  
⏳ OAuth providers need configuration  
✅ Authentication system is fully implemented  

You can now test the authentication system using email login while you configure OAuth providers! 