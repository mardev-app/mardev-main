-- Create chat rooms table
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Using text to store email from cookie auth
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat room members table
CREATE TABLE public.chat_room_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;

-- Create policies for chat rooms (public readable, authenticated users can create)
CREATE POLICY "Chat rooms are viewable by everyone" 
ON public.chat_rooms 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create chat rooms" 
ON public.chat_rooms 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Room creators can update their rooms" 
ON public.chat_rooms 
FOR UPDATE 
USING (true);

-- Create policies for chat messages
CREATE POLICY "Chat messages are viewable by everyone" 
ON public.chat_messages 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can send messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (true);

-- Create policies for chat room members
CREATE POLICY "Chat room members are viewable by everyone" 
ON public.chat_room_members 
FOR SELECT 
USING (true);

CREATE POLICY "Users can join rooms" 
ON public.chat_room_members 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can leave rooms they joined" 
ON public.chat_room_members 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on chat rooms
CREATE TRIGGER update_chat_rooms_updated_at
BEFORE UPDATE ON public.chat_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_room_members;

-- Set replica identity for realtime updates
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.chat_room_members REPLICA IDENTITY FULL;

-- Insert a default general chat room
INSERT INTO public.chat_rooms (name, description, created_by) 
VALUES ('General', 'Welcome to the MarDev community chat!', 'system');