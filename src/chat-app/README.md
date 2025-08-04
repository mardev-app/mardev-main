# MarDev Chat App

A real-time chat application built with React, TypeScript, and Supabase.

## Features

- Real-time messaging with Supabase Realtime
- Multiple chat rooms
- User authentication via MarDev auth system
- Responsive design
- Glass morphism UI
- Room creation and management

## Installation

1. Copy this entire `chat-app` folder to your project
2. Install dependencies (if not already installed):
   ```bash
   npm install @supabase/supabase-js @tanstack/react-query lucide-react
   ```

3. Make sure you have the following components in your project:
   - shadcn/ui components (Button, Input, ScrollArea, Dialog, etc.)
   - Tailwind CSS configured
   - Supabase client configured

## Usage

### Standalone Usage

```tsx
import ChatApp from './chat-app';

function App() {
  return <ChatApp />;
}
```

### Integration with Existing Router

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatApp from './chat-app';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/chat" element={<ChatApp />} />
        {/* Your other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

## Configuration

### Environment Variables

Make sure your Supabase configuration is set up in `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'your-supabase-url';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Database Setup

The chat app requires these database tables:

- `chat_rooms` - Chat room information
- `chat_messages` - Chat messages
- `chat_room_members` - Room membership tracking

These tables are created automatically when you run the provided migration.

## Authentication

The chat app integrates with the MarDev authentication system using cookies. It looks for these cookie names:

- `mardev_auth`
- `openauth.session`
- `session`
- `auth`
- `authorization`
- `token`

## File Structure

```
chat-app/
├── components/
│   ├── ChatApp.tsx       # Main chat application component
│   ├── ChatRoom.tsx      # Chat room view with messages
│   └── ChatSidebar.tsx   # Sidebar with room list
├── styles.css            # Chat-specific styles
├── index.tsx             # Main export
└── README.md             # This file
```

## Features in Detail

### Real-time Messaging
- Messages appear instantly using Supabase Realtime
- Automatic scrolling to latest messages
- Message timestamps and user avatars

### Room Management
- Create new chat rooms
- Browse available rooms
- Real-time room updates

### Responsive Design
- Mobile-friendly layout
- Collapsible sidebar on small screens
- Touch-friendly interface

## Customization

### Styling
- Modify `styles.css` for custom styles
- Uses Tailwind CSS classes throughout
- Glass morphism effects for modern UI

### Authentication
- Update the authentication logic in `ChatApp.tsx`
- Modify cookie names and user info extraction as needed

## Dependencies

Required dependencies:
- React 18+
- TypeScript
- @supabase/supabase-js
- @tanstack/react-query
- lucide-react
- Tailwind CSS
- shadcn/ui components

## Support

For issues or questions, please refer to the MarDev documentation or contact support.