-- Create table for storing chat history
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'model')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own chat history" 
ON chat_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages" 
ON chat_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all chat history" 
ON chat_history FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
