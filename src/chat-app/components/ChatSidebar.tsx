import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Hash, Plus, MessageCircle, RefreshCw } from 'lucide-react';
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

interface ChatSidebarProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onRoomSelect: (room: Room) => void;
  onRefreshRooms: () => void;
}

export const ChatSidebar = ({ rooms, selectedRoom, onRoomSelect, onRefreshRooms }: ChatSidebarProps) => {
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const getCurrentUser = () => {
    return {
      id: 'user@mardev.app',
      name: 'MarDev User'
    };
  };

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRoomName.trim() || creating) return;

    setCreating(true);
    const user = getCurrentUser();

    try {
      const { error } = await supabase
        .from('chat_rooms')
        .insert({
          name: newRoomName.trim(),
          description: newRoomDescription.trim() || null,
          created_by: user.id,
          is_public: true
        });

      if (error) {
        console.error('Error creating room:', error);
        return;
      }

      setNewRoomName('');
      setNewRoomDescription('');
      setIsCreateRoomOpen(false);
      onRefreshRooms();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-80 bg-card/30 backdrop-blur-md border-r border-border flex flex-col">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            MarDev Chat
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefreshRooms}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        
        <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" className="w-full justify-start gap-2">
              <Plus className="w-4 h-4" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={createRoom} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Room Name</label>
                <Input
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter room name..."
                  required
                  maxLength={50}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                <Textarea
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  placeholder="What's this room about?"
                  rows={3}
                  maxLength={200}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateRoomOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!newRoomName.trim() || creating}
                  className="flex-1"
                >
                  {creating ? (
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    'Create'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rooms List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Rooms
            </div>
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onRoomSelect(room)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors hover:bg-accent/50 flex items-center gap-2 ${
                  selectedRoom?.id === room.id
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Hash className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{room.name}</div>
                  {room.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {room.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MessageCircle className="w-4 h-4" />
          <span>MarDev Community Chat</span>
        </div>
      </div>
    </div>
  );
};