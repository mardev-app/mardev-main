GRANT SELECT, INSERT, UPDATE ON public.chat_rooms TO authenticated;
GRANT ALL ON public.chat_rooms TO service_role;
GRANT SELECT, INSERT, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
GRANT SELECT, INSERT, DELETE ON public.chat_room_members TO authenticated;
GRANT ALL ON public.chat_room_members TO service_role;

REVOKE ALL ON public.chat_rooms FROM anon;
REVOKE ALL ON public.chat_messages FROM anon;
REVOKE ALL ON public.chat_room_members FROM anon;

DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat messages are viewable by everyone" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat room members are viewable by everyone" ON public.chat_room_members;
DROP POLICY IF EXISTS "Users can join rooms" ON public.chat_room_members;
DROP POLICY IF EXISTS "Users can leave rooms they joined" ON public.chat_room_members;
DROP POLICY IF EXISTS "Authenticated users can create chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Chat rooms are viewable by everyone" ON public.chat_rooms;
DROP POLICY IF EXISTS "Room creators can update their rooms" ON public.chat_rooms;

CREATE POLICY "Signed in users can view available rooms"
ON public.chat_rooms FOR SELECT TO authenticated
USING (
  is_public = true
  OR created_by = auth.uid()::text
  OR EXISTS (
    SELECT 1 FROM public.chat_room_members members
    WHERE members.room_id = chat_rooms.id
      AND members.user_id = auth.uid()::text
  )
);

CREATE POLICY "Signed in users can create rooms"
ON public.chat_rooms FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid()::text);

CREATE POLICY "Room creators can edit rooms"
ON public.chat_rooms FOR UPDATE TO authenticated
USING (created_by = auth.uid()::text)
WITH CHECK (created_by = auth.uid()::text);

CREATE POLICY "Signed in users can view room memberships"
ON public.chat_room_members FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can join rooms as themselves"
ON public.chat_room_members FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM public.chat_rooms rooms
    WHERE rooms.id = chat_room_members.room_id
      AND (rooms.is_public = true OR rooms.created_by = auth.uid()::text)
  )
);

CREATE POLICY "Users can leave their memberships"
ON public.chat_room_members FOR DELETE TO authenticated
USING (user_id = auth.uid()::text);

CREATE POLICY "Room participants can view messages"
ON public.chat_messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms rooms
    WHERE rooms.id = chat_messages.room_id
      AND (
        rooms.is_public = true
        OR rooms.created_by = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM public.chat_room_members members
          WHERE members.room_id = rooms.id
            AND members.user_id = auth.uid()::text
        )
      )
  )
);

CREATE POLICY "Users can send messages as themselves"
ON public.chat_messages FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()::text
  AND length(btrim(message)) BETWEEN 1 AND 2000
  AND length(btrim(user_name)) BETWEEN 1 AND 80
  AND EXISTS (
    SELECT 1 FROM public.chat_rooms rooms
    WHERE rooms.id = chat_messages.room_id
      AND (
        rooms.is_public = true
        OR rooms.created_by = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM public.chat_room_members members
          WHERE members.room_id = rooms.id
            AND members.user_id = auth.uid()::text
        )
      )
  )
);

CREATE POLICY "Users can remove their messages"
ON public.chat_messages FOR DELETE TO authenticated
USING (user_id = auth.uid()::text);

CREATE UNIQUE INDEX IF NOT EXISTS chat_room_members_room_user_key
ON public.chat_room_members (room_id, user_id);
CREATE INDEX IF NOT EXISTS chat_messages_room_created_idx
ON public.chat_messages (room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS chat_room_members_user_idx
ON public.chat_room_members (user_id);

CREATE OR REPLACE FUNCTION public.set_chat_room_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_chat_room_updated_at ON public.chat_rooms;
CREATE TRIGGER set_chat_room_updated_at
BEFORE UPDATE ON public.chat_rooms
FOR EACH ROW EXECUTE FUNCTION public.set_chat_room_updated_at();

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;