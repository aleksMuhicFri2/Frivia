--RLS
ALTER TABLE public.daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

-- daily_questions
CREATE POLICY "Allow read daily question"
ON public.daily_questions
AS PERMISSIVE
FOR SELECT
TO public
USING (true)
WITH CHECK (true);

-- attempts
CREATE POLICY "allow insert attempts"
ON public.attempts
AS PERMISSIVE
FOR INSERT
TO public
USING (true)
WITH CHECK (true);
