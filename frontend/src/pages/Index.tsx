import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Timer, Lightbulb, Play, BarChart3, Lock } from "lucide-react";
import { toast } from "sonner";
import { Rastvrstice } from "@/components/ui/rastvrstice";
import { supabase } from "@/supabaseClient";

type GameState =
  | "home"
  | "playing"
  | "playing-answered"
  | "correct"
  | "wrong"
  | "stats"
  | "gameover";

type DailyQuestion = {
  question_date: string;
  question_text: any;
  correct_answer: string;
  hints: string[];
};

type Distribution = {
  no_hints: number;
  one_hint: number;
  two_hints: number;
  three_hints: number;
  failed: number;
};

type GameResult = {
  your_score: number;
  your_rank: number;
  players: number;
  avg_score: number;
  distribution?: Distribution;
  top_5: { rank: number; score: number; highlight?: boolean }[];
};

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [gameState, setGameState] = useState<GameState>("home");
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [revealedHints, setRevealedHints] = useState<boolean[]>([false, false, false]);
  const [userAnswer, setUserAnswer] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAnswerFeedback, setShowAnswerFeedback] =
    useState<"correct" | "wrong" | null>(null);

  const [question, setQuestion] = useState<DailyQuestion | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [startTimeMs, setStartTimeMs] = useState<number | null>(null);
  const [submitLocked, setSubmitLocked] = useState(false);

  useEffect(() => {
    if (location.state?.autoStart) {
      startGame();
      window.history.replaceState({}, document.title);
    }
  }, []);

  useEffect(() => {
    if (gameState === "playing" && timeRemaining > 0 && !submitLocked) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, timeRemaining, showAnswerFeedback]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getQuestionText = (qt: any): string => {
    if (qt == null) return "";
    if (typeof qt === "string") return qt;
    if (typeof qt === "object") {
      if (typeof qt.text === "string") return qt.text;
      if (typeof qt.question === "string") return qt.question;
      return JSON.stringify(qt);
    }
    return String(qt);
  };

  const getHighlightRank = (isCorrect: boolean, hintsUsed: number | null): number => {
    if (!isCorrect) return 5;
    return Math.min((hintsUsed ?? 0) + 1, 4);
  };

  const buildTop5FromDistribution = (d: Distribution, highlightRank: number) => [
    { rank: 1, score: d.no_hints, highlight: highlightRank === 1 },
    { rank: 2, score: d.one_hint, highlight: highlightRank === 2 },
    { rank: 3, score: d.two_hints, highlight: highlightRank === 3 },
    { rank: 4, score: d.three_hints, highlight: highlightRank === 4 },
    { rank: 5, score: d.failed, highlight: highlightRank === 5 },
  ];

  const startGame = async () => {
    setIsTransitioning(true);

    const { data, error } = await supabase.rpc("get_daily_question");
    if (error || !data) {
      toast.error("Failed to load daily question");
      setIsTransitioning(false);
      return;
    }

    setQuestion(data);
    setResult(null);
    setSubmitLocked(false);
    setStartTimeMs(Date.now());

    setTimeout(() => {
      setGameState("playing");
      setTimeRemaining(60);
      setHintsRevealed(0);
      setRevealedHints([false, false, false]);
      setUserAnswer("");
      setShowAnswerFeedback(null);
      setIsTransitioning(false);
    }, 500);
  };

  const revealHint = (hintIndex: number) => {
    setRevealedHints((prev) => {
      if (prev[hintIndex]) return prev;
      if (hintIndex > 0 && !prev[hintIndex - 1]) {
        toast.error(`Najprej odkleni Hint ${hintIndex}!`);
        return prev;
      }
      const next = [...prev];
      next[hintIndex] = true;
      return next;
    });
    setHintsRevealed((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim() || !question || submitLocked) return;

    const isCorrect =
      userAnswer.trim().toLowerCase() ===
      question.correct_answer.trim().toLowerCase();

    if (!isCorrect) {
      setShowAnswerFeedback("wrong");
      setTimeout(() => {
        setUserAnswer("");
        setShowAnswerFeedback(null);
      }, 500);
      return;
    }

    setSubmitLocked(true);
    setGameState("playing-answered");
    setShowAnswerFeedback("correct");

    const timeMs = startTimeMs ? Date.now() - startTimeMs : 0;

    const { data, error } = await supabase.rpc("submit_attempt", {
      p_question_date: question.question_date,
      p_time_ms: timeMs,
      p_hints_used: hintsRevealed,
      p_is_correct: true,
    });

    const row = Array.isArray(data) ? data[0] : data;

    if (error || !row || !row.distribution) {
      toast.error("Failed to submit result");
      setSubmitLocked(false);
      return;
    }

    const highlightRank = getHighlightRank(true, hintsRevealed);

    setResult({
      ...row,
      top_5: buildTop5FromDistribution(row.distribution, highlightRank),
    });

    setTimeout(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setGameState("stats");
        setIsTransitioning(false);
      }, 500);
    }, 1000);
  };

  const handleTimeout = async () => {
    if (!question) return;

    setSubmitLocked(true);

    const { data } = await supabase.rpc("submit_attempt", {
      p_question_date: question.question_date,
      p_time_ms: 60000,
      p_hints_used: null,
      p_is_correct: false,
    });

    const row = Array.isArray(data) ? data[0] : data;

    if (row?.distribution) {
      setResult({
        ...row,
        top_5: buildTop5FromDistribution(row.distribution, 5),
      });
    }

    setGameState("gameover");
  };

  /* JSX BELOW IS UNCHANGED */


  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-6 sm:px-8 md:px-12 py-4 font-pixel text-center">
      {/* Fixed Title */}
      <h1 className="text-7xl sm:text-8xl md:text-[9rem] font-extrabold text-white mb-12 animate-pulse leading-none">
        <span className="text-primary text-glow-red">FRI</span>VIA
      </h1>

      {/* Content Area with Slide Animations */}
      <div className="w-full max-w-3xl mb-8">
        {/* Home Screen */}
        {gameState === "home" && (
          <div
            className={`text-center space-y-8 ${
              isTransitioning ? "slide-out-left" : "slide-in-right"
            }`}
          >
            <p className="text-2xl md:text-3xl font-medium text-white">
              Daily questions.
              <br />
              Limited hints.
              <br />
              Compete with others.
            </p>

            <div className="space-y-4 md:space-y-0 md:flex md:flex-row md:items-center md:justify-center md:gap-4">
              <Button
                onClick={startGame}
                size="lg"
                className="w-full max-w-xs h-16 text-xl glow-red hover:glow-red-strong transition-all"
              >
                <Play className="mr-2 h-6 w-6" />
                PLAY
              </Button>

              <Button
                onClick={() => navigate("/how-to-play")}
                variant="outline"
                size="lg"
                className="w-full max-w-xs h-16 text-xl border-white/100 hover:border-white"
              >
                How To Play
              </Button>
            </div>
          </div>
        )}

        {/* Playing Screen */}
        {gameState === "playing" && (
          <div
            className={`space-y-6 ${
              isTransitioning ? "slide-out-left" : "slide-in-right"
            }`}
          >
            {/* Question */}
            <div className="text-center text-lg font-semibold mb-8">
              {question ? getQuestionText(question.question_text) : "Loading..."}
            </div>

            {/* Answer Input with >> << decorations */}
            <div className="relative flex items-center justify-center gap-3">
              <span
                className={`text-2xl transition-all ${
                  showAnswerFeedback === "correct"
                    ? "text-success blink-green"
                    : showAnswerFeedback === "wrong"
                    ? "text-destructive vibrate-red"
                    : "text-muted-foreground"
                }`}
              >
                &gt;&gt;
              </span>
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Your answer..."
                className={`h-14 text-lg border-primary/50 focus:border-primary w-full max-w-xl text-center placeholder:text-sm ${
                  showAnswerFeedback === "wrong"
                    ? "text-destructive vibrate-red"
                    : ""
                }`}
                disabled={showAnswerFeedback !== null || !question}
              />
              <span
                className={`text-2xl transition-all ${
                  showAnswerFeedback === "correct"
                    ? "text-success blink-green"
                    : showAnswerFeedback === "wrong"
                    ? "text-destructive vibrate-red"
                    : "text-muted-foreground"
                }`}
              >
                &lt;&lt;
              </span>
            </div>

            {/* Timer Progress Bar */}
            <div className="w-full max-w-2xl mx-auto space-y-2 mt-8">
              <div className="text-center text-sm">{formatTime(timeRemaining)}</div>
              <div className="h-4 bg-background border-2 border-primary rounded-full overflow-hidden">
                <div
                  className="h-full bg-destructive transition-all duration-1000 ease-linear"
                  style={{
                    width: `${(timeRemaining / 60) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Hints */}
            <div className="space-y-3 mt-8 max-w-2xl mx-auto">
              {[0, 1, 2].map((idx) => {
                const isRevealed = revealedHints[idx];
                const isLocked = idx > 0 && !revealedHints[idx - 1];

                return (
                  <div key={idx} className="relative w-full h-14 overflow-hidden rounded-lg">
                    {/* Zaklenjen gumb */}
                    <div
                      className={`absolute inset-0 border-2 flex items-center px-4 transition-all duration-500 ease-in-out rounded-lg ${
                        isRevealed
                          ? "transform translate-x-full opacity-0"
                          : "transform translate-x-0 opacity-100"
                      } ${
                        isLocked
                          ? "bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed"
                          : "bg-white text-black border-black hover:border-primary cursor-pointer"
                      }`}
                      onClick={() => !isRevealed && !isLocked && revealHint(idx)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm">{`Reveal Hint ${idx + 1}`}</span>
                        <Lock className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Odklenjeno vsebina */}
                    <div
                      className={`absolute inset-0 border-2 flex items-center px-4 transition-all duration-500 ease-in-out rounded-lg ${
                        isRevealed
                          ? "transform translate-x-0 opacity-100"
                          : "transform -translate-x-full opacity-0"
                      } bg-black text-white border-white`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <p className="text-sm">
                          {question?.hints?.[idx] ?? ""}
                        </p>
                        <div className="w-5 h-5"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === "gameover" && (
          <div
            className={`space-y-6 ${
              isTransitioning ? "slide-out-left" : "slide-in-right"
            }`}
          >
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-2 text-destructive">
                TIME&apos;S UP!
              </h2>
              <p className="text-xl text-white mb-8">Better luck next time!</p>
            </div>

            <Card className="p-6 bg-card border-white/30">
              <div className="space-y-4">
                <div className="text-sm text-white mb-1">The correct answer was:</div>
                <div className="text-3xl font-normal text-primary">
                  {question?.correct_answer ?? ""}
                </div>
                <div className="text-center">
                  <div className="text-sm text-white mb-2">
                    Come back tomorrow for a new question!
                  </div>
                </div>
              </div>
            </Card>

            {/* Optional: show results only if we have them. Gameover happens on timeout -> no submit -> no result */}
            {result && (
              <Card className="p-2 bg-card border-primary/30">
                <div className="space-y-2">
                  <div className="text-mm font-bold text-destructive mb-3">
                    Today&apos;s results:
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center pb-4 border-b border-white">
                    <div>
                      <div className="text-sm text-white mb-1">Players</div>
                      <div className="text-xl font-normal text-white">
                        {result.players}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-white mb-1">Avg. Score</div>
                      <div className="text-xl font-normal text-white">
                        {result.avg_score}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-white mb-1">My Rank</div>
                      <div className="text-xl font-normal text-destructive">
                        {result.your_rank}.
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {result.top_5?.map((player) => (
                      <div key={player.rank} className="flex items-center gap-4 p-2 rounded">
                        <div className="w-8 text-center font-normal">{player.rank}</div>
                        <Rastvrstice score={player.score} highlight={player.highlight} />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            <Button
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setGameState("home");
                  setIsTransitioning(false);
                }, 500);
              }}
              variant="outline"
              size="lg"
              className="w-full max-w-xs h-16 text-xl border-2 border-white/100 hover:border-white"
            >
              Back to Home
            </Button>
          </div>
        )}

        {/* Stats Screen */}
        {gameState === "stats" && (
          <div
            className={`space-y-6 text-white ${
              isTransitioning ? "slide-out-left" : "slide-in-right"
            }`}
          >
            <div className="text-center">
              <h2 className="font-bold mb-2 text-xl text-red-700">
                Congratulations!
              </h2>
            </div>

            <Card className="pt-2 px-6 pb-6 bg-card border-primary/30">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center pb-4 mb-2 border-b border-white items-end -my-2">
                  <div>
                    <div className="text-sm text-white mb-1">Your time</div>
                    <div className="text-xl font-normal text-white">
                      {60 - timeRemaining}s
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-white mb-1">Your Score</div>
                    <div className="text-xl font-normal text-white">
                      {result?.your_score ?? "-"}
                    </div>
                  </div>
                </div>

                <div className="text-mm font-bold text-destructive mb-3">
                  Today&apos;s results:
                </div>
                <div className="grid grid-cols-3 gap-4 text-center pb-4 border-b border-white">
                  <div>
                    <div className="text-sm text-white mb-1">Players</div>
                    <div className="text-xl font-normal text-white">
                      {result?.players ?? "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-white mb-1">Avg. Score</div>
                    <div className="text-xl font-normal text-white">
                      {result?.avg_score ?? "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-white mb-1">My Rank</div>
                    <div className="text-xl font-normal text-destructive">
                      {result?.your_rank ?? "-"}.
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {(result?.top_5 ?? []).map((player) => (
                    <div key={player.rank} className="flex items-center gap-4 p-2 rounded">
                      <div className="w-8 text-center font-normal">{player.rank}</div>

                      <Rastvrstice score={player.score} highlight={player.highlight} />
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Button
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setGameState("home");
                  setIsTransitioning(false);
                }, 500);
              }}
              variant="outline"
              size="lg"
              className="w-full max-w-xs h-14 text-xl border-2 border-white hover:border-white"
            >
              Back to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
