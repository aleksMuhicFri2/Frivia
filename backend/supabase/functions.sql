-- get daily question
CREATE OR REPLACE FUNCTION public.get_daily_question()
RETURNS json
LANGUAGE sql
AS $function$
  SELECT json_build_object(
    'question_date', dq.question_date,
    'question_text', dq.question_text,
    'correct_answer', dq.correct_answer,
    'hints', ARRAY[dq.hint_1, dq.hint_2, dq.hint_3]
  )
  FROM daily_questions dq
  WHERE dq.question_date = current_date;
$function$;


-- submit attempt
CREATE OR REPLACE FUNCTION public.submit_attempt(
  p_question_date date,
  p_time_ms integer,
  p_hints_used integer,
  p_is_correct boolean
)
RETURNS TABLE (
  your_score integer,
  your_rank integer,
  players integer,
  avg_score numeric,
  distribution jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_score integer := 0;
BEGIN
  -- Score calculation
  IF p_is_correct THEN
    v_score := GREATEST(
      0,
      300
      - (p_time_ms / 1000)
      - COALESCE(p_hints_used, 0) * 20
    );
  ELSE
    v_score := 0;
  END IF;

  INSERT INTO attempts (
    question_date,
    is_correct,
    hints_used,
    time_ms,
    score
  )
  VALUES (
    p_question_date,
    p_is_correct,
    CASE WHEN p_is_correct THEN COALESCE(p_hints_used, 0) ELSE NULL END,
    p_time_ms,
    v_score
  );

  RETURN QUERY
  SELECT
    v_score,

    (
      SELECT COUNT(*)::int + 1
      FROM attempts
      WHERE question_date = p_question_date
        AND score > v_score
    ),

    (
      SELECT COUNT(*)::int
      FROM attempts
      WHERE question_date = p_question_date
    ),

    (
      SELECT AVG(score)::numeric(10,2)
      FROM attempts
      WHERE question_date = p_question_date
        AND is_correct = true
    ),

    jsonb_build_object(
      'no_hints',    COUNT(*) FILTER (WHERE is_correct AND hints_used = 0),
      'one_hint',    COUNT(*) FILTER (WHERE is_correct AND hints_used = 1),
      'two_hints',   COUNT(*) FILTER (WHERE is_correct AND hints_used = 2),
      'three_hints', COUNT(*) FILTER (WHERE is_correct AND hints_used = 3),
      'failed',      COUNT(*) FILTER (WHERE is_correct = false)
    )
  FROM attempts
  WHERE question_date = p_question_date;
END;
$function$;
