import { useState, useEffect } from 'react';
import { ChatRoom } from './ChatRoom';
import { ChatSidebar } from './ChatSidebar';
import { AuthStatus } from '../../components/AuthStatus';
import { supabase } from '@/integrations/supabase/client';

interface Room {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const ChatApp = () => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Check authentication status
  const getCookie = (name: string): string | null => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === name) {
        return decodeURIComponent(value);
      }
    }
    return null;
  };

  const isAuthenticated = () => {
    const possibleCookieNames = [
      'openauth.session',
      'session',
      'auth',
      'authorization',
      'token',
      'mardev_auth'
    ];

    for (const name of possibleCookieNames) {
      const cookie = getCookie(name);
      if (cookie) {
        return true;
      }
    }
    return false;
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching rooms:', error);
        return;
      }

      setRooms(data || []);
      
      // Select the first room by default (General)
      if (data && data.length > 0 && !selectedRoom) {
        setSelectedRoom(data[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();

    // Subscribe to room changes
    const roomsSubscription = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms'
        },
        () => {
          fetchRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomsSubscription);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading MarDev Chat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex items-center justify-center relative">
        <AuthStatus />
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-4">
            MarDev Chat
          </h1>
          <p className="text-muted-foreground mb-6">
            Connect with the MarDev community. Please log in to start chatting.
          </p>
          <div className="bg-gradient-glass backdrop-blur-md border border-white/20 rounded-lg p-6">
            <p className="text-sm text-muted-foreground">
              Use the login button in the top-right corner to access the chat.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 relative">
      <AuthStatus />
      
      <div className="flex h-screen">
        <ChatSidebar 
          rooms={rooms}
          selectedRoom={selectedRoom}
          onRoomSelect={setSelectedRoom}
          onRefreshRooms={fetchRooms}
        />
        
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <ChatRoom room={selectedRoom} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
                  Welcome to MarDev Chat
                </h2>
                <p className="text-muted-foreground">
                  Select a room to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};