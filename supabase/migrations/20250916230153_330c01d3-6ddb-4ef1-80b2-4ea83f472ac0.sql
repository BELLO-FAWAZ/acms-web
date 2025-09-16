-- Create polls table
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('yes-no', 'multiple-choice')),
  options JSONB NOT NULL DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll votes table
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  option_text TEXT NOT NULL,
  voter_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id),
  UNIQUE(poll_id, voter_ip)
);

-- Enable RLS
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Polls policies
CREATE POLICY "Anyone can view active polls" 
ON public.polls 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Anyone can create polls" 
ON public.polls 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage all polls" 
ON public.polls 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Poll votes policies  
CREATE POLICY "Anyone can vote on polls" 
ON public.poll_votes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own votes" 
ON public.poll_votes 
FOR SELECT 
USING (user_id = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all votes" 
ON public.poll_votes 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_polls_updated_at
BEFORE UPDATE ON public.polls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();